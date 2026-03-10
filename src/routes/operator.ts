import { FastifyInstance } from 'fastify';
import os from 'os';
import { requireRole } from '../middleware/roleAuth';
import {
  getAllChains,
  getChainBySlug,
  toggleChainEnabled,
  upsertChain,
  deleteCustomChain,
} from '../services/chainManager';
import {
  getLatestHealth,
  getChainHealth,
  getChainHealthHistory,
  runHealthChecks,
} from '../services/healthChecker';
import { db } from '../db/client';

export async function operatorRoutes(app: FastifyInstance): Promise<void> {
  app.addHook('preHandler', requireRole('operator'));

  // ── Chain Management ──────────────────────────────────

  // List ALL chains (catalog + custom, enabled + disabled) with health
  app.get('/api/operator/chains', async () => {
    const chains = getAllChains();
    const health = getLatestHealth();
    const healthMap = new Map(health.map((h) => [h.chain_slug, h]));

    return {
      chains: chains.map((c) => ({
        ...c,
        health: healthMap.get(c.slug) || null,
      })),
    };
  });

  // Enable/disable a chain
  app.patch<{ Params: { slug: string }; Body: { enabled: boolean } }>(
    '/api/operator/chains/:slug/toggle',
    async (request, reply) => {
      const { slug } = request.params;
      const { enabled } = request.body || {};
      if (typeof enabled !== 'boolean') {
        return reply.status(400).send({ error: 'enabled must be a boolean' });
      }
      const ok = toggleChainEnabled(slug, enabled);
      if (!ok) return reply.status(404).send({ error: 'Chain not found' });
      return { ok: true, slug, enabled };
    }
  );

  // Update chain configuration
  app.put<{
    Params: { slug: string };
    Body: {
      name?: string;
      rpcUrl?: string;
      rpcAuth?: string;
      wsUrl?: string;
      explorerUrl?: string;
      enabled?: boolean;
    };
  }>('/api/operator/chains/:slug', async (request, reply) => {
    const { slug } = request.params;
    const existing = getChainBySlug(slug);
    if (!existing) {
      return reply.status(404).send({ error: 'Chain not found' });
    }
    const updated = { ...existing, ...request.body, slug };
    upsertChain(updated);
    return { chain: getChainBySlug(slug) };
  });

  // Add a custom chain
  app.post<{
    Body: {
      slug: string;
      name: string;
      chainId: number;
      type: 'evm' | 'bitcoin' | 'solana' | 'cosmos';
      rpcUrl: string;
      rpcAuth?: string;
      wsUrl?: string;
      explorerUrl?: string;
      nativeCurrency: { name: string; symbol: string; decimals: number };
      testnet: boolean;
      enabled: boolean;
    };
  }>('/api/operator/chains', async (request, reply) => {
    const body = request.body;
    if (!body?.slug || !body?.name || !body?.rpcUrl) {
      return reply.status(400).send({ error: 'slug, name, and rpcUrl are required' });
    }
    if (!body.nativeCurrency) {
      return reply.status(400).send({ error: 'nativeCurrency is required' });
    }
    const existing = getChainBySlug(body.slug);
    if (existing) {
      return reply.status(409).send({ error: 'Chain with this slug already exists' });
    }
    upsertChain({ ...body, isCustom: true });
    return { ok: true, chain: getChainBySlug(body.slug) };
  });

  // Delete a custom chain
  app.delete<{ Params: { slug: string } }>(
    '/api/operator/chains/:slug',
    async (request, reply) => {
      const ok = deleteCustomChain(request.params.slug);
      if (!ok) {
        return reply.status(400).send({
          error: 'Cannot delete. Chain is either a catalog chain or does not exist.',
        });
      }
      return { ok: true };
    }
  );

  // ── Health ────────────────────────────────────────────

  app.get('/api/operator/health', async () => {
    return { checks: getLatestHealth() };
  });

  app.get<{ Params: { slug: string }; Querystring: { limit?: string } }>(
    '/api/operator/health/:slug',
    async (request) => {
      const limit = parseInt(request.query.limit || '50');
      return {
        latest: getChainHealth(request.params.slug),
        history: getChainHealthHistory(request.params.slug, limit),
      };
    }
  );

  app.post('/api/operator/health/check', async () => {
    await runHealthChecks();
    return { ok: true, checks: getLatestHealth() };
  });

  // ── System Info ───────────────────────────────────────

  app.get('/api/operator/system', async () => {
    const uptime = process.uptime();
    const mem = process.memoryUsage();

    let dbSizeBytes = 0;
    try {
      const row = db.prepare(
        "SELECT page_count * page_size as size FROM pragma_page_count(), pragma_page_size()"
      ).get() as { size: number } | undefined;
      dbSizeBytes = row?.size || 0;
    } catch { /* ignore */ }

    return {
      uptime,
      nodeVersion: process.version,
      platform: os.platform(),
      arch: os.arch(),
      cpus: os.cpus().length,
      totalMemory: os.totalmem(),
      freeMemory: os.freemem(),
      processMemory: {
        rss: mem.rss,
        heapUsed: mem.heapUsed,
        heapTotal: mem.heapTotal,
        external: mem.external,
      },
      dbSizeBytes,
    };
  });

  // ── Request Logs ──────────────────────────────────────

  app.get<{
    Querystring: { limit?: string; offset?: string; network?: string; method?: string };
  }>('/api/operator/logs', async (request) => {
    const limit = Math.min(parseInt(request.query.limit || '100'), 500);
    const offset = parseInt(request.query.offset || '0');
    const { network, method } = request.query;

    let query = 'SELECT * FROM request_logs WHERE 1=1';
    const params: unknown[] = [];

    if (network) {
      query += ' AND network = ?';
      params.push(network);
    }
    if (method) {
      query += ' AND method = ?';
      params.push(method);
    }

    const countQuery = query.replace('SELECT *', 'SELECT COUNT(*) as total');
    const total = (db.prepare(countQuery).get(...params) as { total: number }).total;

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const logs = db.prepare(query).all(...params);

    return { logs, total, limit, offset };
  });
}
