import crypto from 'crypto';
import { getRedis, isRedisAvailable } from './redisClient';
import type { JsonRpcRequest, JsonRpcResponse } from './rpcProxy';

// Methods that should NEVER be cached (state-changing or ephemeral)
const NEVER_CACHE = new Set([
  'eth_sendRawTransaction', 'eth_sendTransaction',
  'eth_newFilter', 'eth_newBlockFilter', 'eth_newPendingTransactionFilter',
  'eth_getFilterChanges', 'eth_getFilterLogs', 'eth_uninstallFilter',
  'eth_subscribe', 'eth_unsubscribe',
  'eth_mining', 'eth_coinbase', 'eth_accounts',
  // Bitcoin write methods
  'sendrawtransaction', 'signrawtransactionwithkey',
]);

// Immutable methods — very long TTL
const IMMUTABLE: Record<string, number> = {
  eth_chainId: 86400,
  net_version: 86400,
  eth_protocolVersion: 86400,
};

// Short-lived methods — block-level freshness
const SHORT_LIVED: Record<string, number> = {
  eth_blockNumber: 3,
  eth_gasPrice: 10,
  eth_maxPriorityFeePerGas: 10,
  eth_feeHistory: 10,
  // Bitcoin
  getblockchaininfo: 5,
  getblockcount: 3,
  getnetworkinfo: 30,
  getconnectioncount: 30,
  getmempoolinfo: 5,
};

// Methods where the last param is a block tag
const BLOCK_TAG_METHODS = new Set([
  'eth_getBalance', 'eth_getCode', 'eth_call',
  'eth_getStorageAt', 'eth_getTransactionCount',
  'eth_estimateGas',
]);

function isSpecificBlockNumber(tag: unknown): boolean {
  if (typeof tag !== 'string') return false;
  if (['latest', 'pending', 'earliest', 'safe', 'finalized'].includes(tag)) return false;
  return tag.startsWith('0x');
}

function getTtl(method: string, params?: unknown[]): number | null {
  if (NEVER_CACHE.has(method)) return null;
  if (IMMUTABLE[method] !== undefined) return IMMUTABLE[method];
  if (SHORT_LIVED[method] !== undefined) return SHORT_LIVED[method];

  // Block-tag-aware methods
  if (BLOCK_TAG_METHODS.has(method) && params && params.length > 0) {
    const blockTag = params[params.length - 1];
    if (blockTag === 'pending') return null;
    if (isSpecificBlockNumber(blockTag)) return 3600;
    return 5; // "latest" and others
  }

  // Block by number/hash
  if (method === 'eth_getBlockByNumber' && params) {
    if (params[0] === 'pending') return null;
    if (isSpecificBlockNumber(params[0])) return 3600;
    return 5;
  }
  if (method === 'eth_getBlockByHash') return 3600;

  // Transaction lookups (immutable once confirmed)
  if (method === 'eth_getTransactionReceipt' || method === 'eth_getTransactionByHash') {
    return 3600; // only stored if result is non-null
  }

  // Bitcoin block by hash/height
  if (method === 'getblock' || method === 'getblockhash' || method === 'getblockheader') {
    return 3600;
  }
  if (method === 'getrawtransaction') return 3600;

  return null; // don't cache unknown methods
}

function buildKey(chainSlug: string, method: string, params?: unknown[]): string {
  const paramHash = params && params.length > 0
    ? crypto.createHash('sha256').update(JSON.stringify(params)).digest('hex').slice(0, 16)
    : 'np';
  return `cache:${chainSlug}:${method}:${paramHash}`;
}

// In-memory stats
let hits = 0;
let misses = 0;

export async function getCached(
  chainSlug: string,
  req: JsonRpcRequest
): Promise<JsonRpcResponse | null> {
  const ttl = getTtl(req.method, req.params);
  if (ttl === null) return null;

  const redis = getRedis();
  if (!redis || !isRedisAvailable()) return null;

  try {
    const cached = await redis.get(buildKey(chainSlug, req.method, req.params));
    if (!cached) return null;
    hits++;
    return { jsonrpc: '2.0', id: req.id, result: JSON.parse(cached) };
  } catch {
    return null;
  }
}

export async function setCached(
  chainSlug: string,
  req: JsonRpcRequest,
  response: JsonRpcResponse
): Promise<void> {
  if (response.error) return;
  if (response.result === null || response.result === undefined) return;

  const ttl = getTtl(req.method, req.params);
  if (ttl === null) return;

  const redis = getRedis();
  if (!redis || !isRedisAvailable()) return;

  try {
    await redis.setex(
      buildKey(chainSlug, req.method, req.params),
      ttl,
      JSON.stringify(response.result)
    );
  } catch {
    // silently ignore cache write failures
  }
}

export function recordMiss(): void { misses++; }

export function getCacheStats(): { hits: number; misses: number; hitRate: number } {
  const total = hits + misses;
  return {
    hits,
    misses,
    hitRate: total > 0 ? Math.round((hits / total) * 1000) / 10 : 0,
  };
}

export async function flushCache(chainSlug?: string): Promise<number> {
  const redis = getRedis();
  if (!redis || !isRedisAvailable()) return 0;

  const pattern = chainSlug ? `cache:${chainSlug}:*` : 'cache:*';
  let cursor = '0';
  let deleted = 0;
  do {
    const [nextCursor, keys] = await redis.scan(cursor, 'MATCH', pattern, 'COUNT', 100);
    cursor = nextCursor;
    if (keys.length > 0) {
      await redis.del(...keys);
      deleted += keys.length;
    }
  } while (cursor !== '0');

  // Reset stats on full flush
  if (!chainSlug) { hits = 0; misses = 0; }

  return deleted;
}
