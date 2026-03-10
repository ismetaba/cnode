import { db } from '../db/client';
import { catalogChains, ChainConfig } from '../chains';

interface ChainRow {
  slug: string;
  name: string;
  chain_id: number;
  type: string;
  rpc_url: string;
  rpc_auth: string | null;
  ws_url: string | null;
  explorer_url: string | null;
  currency_name: string;
  currency_symbol: string;
  currency_decimals: number;
  testnet: number;
  enabled: number;
  is_custom: number;
  cache_enabled: number;
}

const stmts = {
  getAll: db.prepare('SELECT * FROM chains'),
  getBySlug: db.prepare('SELECT * FROM chains WHERE slug = ?'),
  upsert: db.prepare(`
    INSERT INTO chains (slug, name, chain_id, type, rpc_url, rpc_auth, ws_url,
      explorer_url, currency_name, currency_symbol, currency_decimals,
      testnet, enabled, is_custom, cache_enabled, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    ON CONFLICT(slug) DO UPDATE SET
      name=excluded.name, chain_id=excluded.chain_id, type=excluded.type,
      rpc_url=excluded.rpc_url, rpc_auth=excluded.rpc_auth, ws_url=excluded.ws_url,
      explorer_url=excluded.explorer_url,
      currency_name=excluded.currency_name, currency_symbol=excluded.currency_symbol,
      currency_decimals=excluded.currency_decimals,
      testnet=excluded.testnet, enabled=excluded.enabled,
      is_custom=excluded.is_custom, cache_enabled=excluded.cache_enabled,
      updated_at=datetime('now')
  `),
  setEnabled: db.prepare(
    "UPDATE chains SET enabled = ?, updated_at = datetime('now') WHERE slug = ?"
  ),
  deleteChain: db.prepare('DELETE FROM chains WHERE slug = ? AND is_custom = 1'),
};

// In-memory cache
let mergedChains: ChainConfig[] = [];
let slugMap = new Map<string, ChainConfig>();

function rowToConfig(row: ChainRow): ChainConfig {
  return {
    slug: row.slug,
    name: row.name,
    chainId: row.chain_id,
    type: row.type as ChainConfig['type'],
    rpcUrl: row.rpc_url,
    rpcAuth: row.rpc_auth || undefined,
    wsUrl: row.ws_url || undefined,
    explorerUrl: row.explorer_url || undefined,
    nativeCurrency: {
      name: row.currency_name,
      symbol: row.currency_symbol,
      decimals: row.currency_decimals,
    },
    testnet: row.testnet === 1,
    enabled: row.enabled === 1,
    isCustom: row.is_custom === 1,
    cacheEnabled: row.cache_enabled === 1,
  };
}

export function rebuildChainCache(): void {
  const dbRows = stmts.getAll.all() as ChainRow[];
  const dbMap = new Map(dbRows.map((r) => [r.slug, r]));

  const result: ChainConfig[] = [];

  // Catalog chains — apply DB overrides if present
  for (const catalog of catalogChains) {
    const override = dbMap.get(catalog.slug);
    if (override) {
      result.push(rowToConfig(override));
      dbMap.delete(catalog.slug);
    } else {
      result.push({ ...catalog, isCustom: false });
    }
  }

  // Custom chains (DB only)
  for (const row of dbMap.values()) {
    result.push(rowToConfig(row));
  }

  mergedChains = result;
  slugMap = new Map(result.map((c) => [c.slug, c]));
}

// Initialize on import
rebuildChainCache();

export function getAllChains(): ChainConfig[] {
  return mergedChains;
}

export function getEnabledChains(): ChainConfig[] {
  return mergedChains.filter((c) => c.enabled);
}

export function getChainBySlug(slug: string): ChainConfig | undefined {
  return slugMap.get(slug);
}

export function toggleChainEnabled(slug: string, enabled: boolean): boolean {
  const existing = stmts.getBySlug.get(slug) as ChainRow | undefined;
  if (!existing) {
    // If it's a catalog chain not yet in DB, insert it
    const catalog = catalogChains.find((c) => c.slug === slug);
    if (!catalog) return false;
    stmts.upsert.run(
      catalog.slug, catalog.name, catalog.chainId, catalog.type,
      catalog.rpcUrl, catalog.rpcAuth || null, catalog.wsUrl || null,
      catalog.explorerUrl || null, catalog.nativeCurrency.name,
      catalog.nativeCurrency.symbol, catalog.nativeCurrency.decimals,
      catalog.testnet ? 1 : 0, enabled ? 1 : 0, 0, 1
    );
  } else {
    stmts.setEnabled.run(enabled ? 1 : 0, slug);
  }
  rebuildChainCache();
  return true;
}

export function upsertChain(chain: ChainConfig): void {
  stmts.upsert.run(
    chain.slug, chain.name, chain.chainId, chain.type,
    chain.rpcUrl, chain.rpcAuth || null, chain.wsUrl || null,
    chain.explorerUrl || null, chain.nativeCurrency.name,
    chain.nativeCurrency.symbol, chain.nativeCurrency.decimals,
    chain.testnet ? 1 : 0, chain.enabled ? 1 : 0,
    chain.isCustom ? 1 : 0, chain.cacheEnabled !== false ? 1 : 0
  );
  rebuildChainCache();
}

export function deleteCustomChain(slug: string): boolean {
  const result = stmts.deleteChain.run(slug);
  if (result.changes > 0) {
    rebuildChainCache();
    return true;
  }
  return false;
}
