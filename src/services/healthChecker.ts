import { db } from '../db/client';
import { request } from 'undici';
import { getEnabledChains } from './chainManager';
import { ChainConfig } from '../chains';

export interface HealthResult {
  chain_slug: string;
  status: 'healthy' | 'degraded' | 'down';
  latency_ms: number;
  block_height: number | null;
  peer_count: number | null;
  error_message: string | null;
  checked_at: string;
}

const insertCheck = db.prepare(`
  INSERT INTO health_checks (chain_slug, status, latency_ms, block_height, peer_count, error_message)
  VALUES (?, ?, ?, ?, ?, ?)
`);

const getLatestAll = db.prepare(`
  SELECT h.* FROM health_checks h
  INNER JOIN (
    SELECT chain_slug, MAX(checked_at) as max_checked
    FROM health_checks GROUP BY chain_slug
  ) latest ON h.chain_slug = latest.chain_slug AND h.checked_at = latest.max_checked
`);

const getLatestBySlug = db.prepare(
  'SELECT * FROM health_checks WHERE chain_slug = ? ORDER BY checked_at DESC LIMIT 1'
);

const getHistory = db.prepare(
  'SELECT * FROM health_checks WHERE chain_slug = ? ORDER BY checked_at DESC LIMIT ?'
);

const cleanOld = db.prepare(
  "DELETE FROM health_checks WHERE checked_at < datetime('now', '-7 days')"
);

async function checkEvmChain(chain: ChainConfig): Promise<HealthResult> {
  const start = performance.now();
  try {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };

    const { body } = await request(chain.rpcUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify({ jsonrpc: '2.0', method: 'eth_blockNumber', params: [], id: 1 }),
      signal: AbortSignal.timeout(10000),
    });
    const result = JSON.parse(await body.text());
    const latencyMs = Math.round(performance.now() - start);
    const blockHeight = result.result ? parseInt(result.result, 16) : null;

    let peerCount: number | null = null;
    try {
      const { body: peerBody } = await request(chain.rpcUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify({ jsonrpc: '2.0', method: 'net_peerCount', params: [], id: 2 }),
        signal: AbortSignal.timeout(5000),
      });
      const peerResult = JSON.parse(await peerBody.text());
      peerCount = peerResult.result ? parseInt(peerResult.result, 16) : null;
    } catch { /* net_peerCount may not be available */ }

    const status = blockHeight !== null ? (latencyMs > 5000 ? 'degraded' : 'healthy') : 'degraded';

    return {
      chain_slug: chain.slug,
      status,
      latency_ms: latencyMs,
      block_height: blockHeight,
      peer_count: peerCount,
      error_message: null,
      checked_at: new Date().toISOString(),
    };
  } catch (err) {
    return {
      chain_slug: chain.slug,
      status: 'down',
      latency_ms: Math.round(performance.now() - start),
      block_height: null,
      peer_count: null,
      error_message: err instanceof Error ? err.message : 'Unknown error',
      checked_at: new Date().toISOString(),
    };
  }
}

async function checkBitcoinChain(chain: ChainConfig): Promise<HealthResult> {
  const start = performance.now();
  try {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (chain.rpcAuth) {
      headers['Authorization'] = 'Basic ' + Buffer.from(chain.rpcAuth).toString('base64');
    }

    const { body } = await request(chain.rpcUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify({ jsonrpc: '1.0', method: 'getblockchaininfo', params: [], id: 1 }),
      signal: AbortSignal.timeout(10000),
    });
    const result = JSON.parse(await body.text());
    const latencyMs = Math.round(performance.now() - start);
    const blockHeight = result.result?.blocks ?? null;

    let peerCount: number | null = null;
    try {
      const { body: peerBody } = await request(chain.rpcUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify({ jsonrpc: '1.0', method: 'getconnectioncount', params: [], id: 2 }),
        signal: AbortSignal.timeout(5000),
      });
      const peerResult = JSON.parse(await peerBody.text());
      peerCount = peerResult.result ?? null;
    } catch { /* optional */ }

    return {
      chain_slug: chain.slug,
      status: blockHeight !== null ? (latencyMs > 5000 ? 'degraded' : 'healthy') : 'degraded',
      latency_ms: latencyMs,
      block_height: blockHeight,
      peer_count: peerCount,
      error_message: null,
      checked_at: new Date().toISOString(),
    };
  } catch (err) {
    return {
      chain_slug: chain.slug,
      status: 'down',
      latency_ms: Math.round(performance.now() - start),
      block_height: null,
      peer_count: null,
      error_message: err instanceof Error ? err.message : 'Unknown error',
      checked_at: new Date().toISOString(),
    };
  }
}

async function checkChain(chain: ChainConfig): Promise<HealthResult> {
  if (chain.type === 'bitcoin') return checkBitcoinChain(chain);
  return checkEvmChain(chain);
}

function saveResult(r: HealthResult): void {
  insertCheck.run(r.chain_slug, r.status, r.latency_ms, r.block_height, r.peer_count, r.error_message);
}

// In-memory latest results
let latestResults = new Map<string, HealthResult>();

export function getLatestHealth(): HealthResult[] {
  if (latestResults.size > 0) return Array.from(latestResults.values());
  return getLatestAll.all() as HealthResult[];
}

export function getChainHealth(slug: string): HealthResult | undefined {
  return latestResults.get(slug) || (getLatestBySlug.get(slug) as HealthResult | undefined);
}

export function getChainHealthHistory(slug: string, limit = 50): HealthResult[] {
  return getHistory.all(slug, limit) as HealthResult[];
}

export async function runHealthChecks(): Promise<void> {
  const chains = getEnabledChains();
  const results = await Promise.allSettled(chains.map((c) => checkChain(c)));

  for (const result of results) {
    if (result.status === 'fulfilled') {
      saveResult(result.value);
      latestResults.set(result.value.chain_slug, result.value);
    }
  }

  cleanOld.run();
}

let intervalId: ReturnType<typeof setInterval> | null = null;

export function startHealthChecker(): void {
  runHealthChecks().catch(console.error);
  intervalId = setInterval(() => {
    runHealthChecks().catch(console.error);
  }, 60_000);
}

export function stopHealthChecker(): void {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
}
