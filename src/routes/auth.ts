import { FastifyInstance } from 'fastify';
import { config } from '../config';
import {
  createApiKey,
  getAllApiKeys,
  deactivateApiKey,
  updateApiKey,
  permanentlyDeleteKey,
} from '../services/keyManager';
import { getKeyUsage } from '../services/analyticsService';
import {
  createWorkspace,
  getAllWorkspaces,
  getWorkspaceById,
  updateWorkspace,
  deactivateWorkspace,
  reactivateWorkspace,
  permanentlyDeleteWorkspace,
  getWorkspaceMonthlyUsage,
  getWorkspaceKeyCount,
  getKeysByWorkspace,
} from '../services/workspaceManager';

function requireAdmin(secret: string | undefined): boolean {
  return secret === config.adminSecret;
}

export async function authRoutes(app: FastifyInstance): Promise<void> {
  // All admin routes require the admin secret
  app.addHook('preHandler', async (request, reply) => {
    const secret = request.headers['x-admin-secret'] as string | undefined;
    if (!requireAdmin(secret)) {
      reply.status(401).send({
        error: 'Unauthorized',
        message: 'Invalid or missing X-Admin-Secret header',
      });
    }
  });

  // Create a new API key
  app.post<{
    Body: { name: string; rate_limit?: number; networks?: string; workspace_id?: string };
  }>('/api/keys', async (request, reply) => {
    const { name, rate_limit = 100, networks = '*', workspace_id = 'ws_default' } = request.body || {};
    if (!name || !name.trim()) {
      return reply.status(400).send({ error: 'name is required' });
    }
    if (typeof rate_limit !== 'number' || rate_limit < 1 || rate_limit > 10000) {
      return reply.status(400).send({
        error: 'rate_limit must be a number between 1 and 10000',
      });
    }
    if (typeof networks !== 'string' || networks.length > 500) {
      return reply.status(400).send({ error: 'networks must be a string (max 500 chars)' });
    }
    // Validate workspace exists
    if (workspace_id !== 'ws_default') {
      const ws = getWorkspaceById(workspace_id);
      if (!ws) {
        return reply.status(400).send({ error: 'Workspace not found' });
      }
    }
    const key = createApiKey(name.trim(), rate_limit, networks, workspace_id);
    return { key };
  });

  // List all API keys
  app.get('/api/keys', async () => {
    const keys = getAllApiKeys();
    // Mask the actual key in list responses
    return {
      keys: keys.map((k) => ({
        ...k,
        key: k.key.slice(0, 7) + '...' + k.key.slice(-4),
      })),
    };
  });

  // Update an API key
  app.put<{
    Params: { id: string };
    Body: { name: string; rate_limit: number; networks: string };
  }>('/api/keys/:id', async (request, reply) => {
    const { id } = request.params;
    const { name, rate_limit, networks } = request.body || {};
    if (!name || !name.trim()) {
      return reply.status(400).send({ error: 'name is required' });
    }
    if (typeof rate_limit !== 'number' || rate_limit < 1 || rate_limit > 10000) {
      return reply.status(400).send({
        error: 'rate_limit must be a number between 1 and 10000',
      });
    }
    if (typeof networks !== 'string' || networks.length > 500) {
      return reply.status(400).send({ error: 'networks must be a string (max 500 chars)' });
    }
    const updated = updateApiKey(id, name.trim(), rate_limit, networks);
    if (!updated) {
      return reply.status(404).send({ error: 'Key not found' });
    }
    return { key: updated };
  });

  // Deactivate an API key
  app.delete<{ Params: { id: string } }>(
    '/api/keys/:id',
    async (request, reply) => {
      const { id } = request.params;
      const ok = deactivateApiKey(id);
      if (!ok) {
        return reply.status(404).send({ error: 'Key not found' });
      }
      return { ok: true };
    }
  );

  // Permanently delete an inactive key
  app.delete<{ Params: { id: string } }>(
    '/api/keys/:id/permanent',
    async (request, reply) => {
      const { id } = request.params;
      const ok = permanentlyDeleteKey(id);
      if (!ok) {
        return reply.status(400).send({
          error: 'Cannot delete',
          message: 'Key not found or still active. Revoke it first.',
        });
      }
      return { ok: true, message: 'Key permanently deleted' };
    }
  );

  // Get usage stats for a specific key
  app.get<{ Params: { id: string }; Querystring: { period?: string } }>(
    '/api/keys/:id/usage',
    async (request) => {
      const { id } = request.params;
      const period = (request.query.period || '24h') as
        | '1h'
        | '24h'
        | '7d'
        | '30d';
      const usage = getKeyUsage(id, period);
      return { usage };
    }
  );

  // ── Workspace routes ──────────────────────────────────────────────

  // Create workspace
  app.post<{
    Body: { name: string; monthly_quota?: number };
  }>('/api/workspaces', async (request, reply) => {
    const { name, monthly_quota = 100000 } = request.body || {};
    if (!name || !name.trim()) {
      return reply.status(400).send({ error: 'name is required' });
    }
    if (typeof monthly_quota !== 'number' || monthly_quota < 1 || monthly_quota > 100000000) {
      return reply.status(400).send({
        error: 'monthly_quota must be between 1 and 100,000,000',
      });
    }
    const workspace = createWorkspace(name.trim(), monthly_quota);
    return { workspace };
  });

  // List all workspaces (with usage stats)
  app.get('/api/workspaces', async () => {
    const workspaces = getAllWorkspaces();
    return {
      workspaces: workspaces.map((ws) => ({
        ...ws,
        usage: getWorkspaceMonthlyUsage(ws.id),
        key_count: getWorkspaceKeyCount(ws.id),
      })),
    };
  });

  // Get single workspace
  app.get<{ Params: { id: string } }>(
    '/api/workspaces/:id',
    async (request, reply) => {
      const ws = getWorkspaceById(request.params.id);
      if (!ws) return reply.status(404).send({ error: 'Workspace not found' });
      return {
        workspace: {
          ...ws,
          usage: getWorkspaceMonthlyUsage(ws.id),
          key_count: getWorkspaceKeyCount(ws.id),
        },
      };
    }
  );

  // Update workspace
  app.put<{
    Params: { id: string };
    Body: { name: string; monthly_quota: number };
  }>('/api/workspaces/:id', async (request, reply) => {
    const { name, monthly_quota } = request.body || {};
    if (!name || !name.trim()) {
      return reply.status(400).send({ error: 'name is required' });
    }
    if (typeof monthly_quota !== 'number' || monthly_quota < 1 || monthly_quota > 100000000) {
      return reply.status(400).send({
        error: 'monthly_quota must be between 1 and 100,000,000',
      });
    }
    const updated = updateWorkspace(request.params.id, name.trim(), monthly_quota);
    if (!updated) return reply.status(404).send({ error: 'Workspace not found' });
    return { workspace: updated };
  });

  // Deactivate workspace
  app.delete<{ Params: { id: string } }>(
    '/api/workspaces/:id',
    async (request, reply) => {
      if (request.params.id === 'ws_default') {
        return reply.status(400).send({ error: 'Cannot deactivate the default workspace' });
      }
      const ok = deactivateWorkspace(request.params.id);
      if (!ok) return reply.status(404).send({ error: 'Workspace not found' });
      return { ok: true };
    }
  );

  // Reactivate workspace
  app.post<{ Params: { id: string } }>(
    '/api/workspaces/:id/reactivate',
    async (request, reply) => {
      const ok = reactivateWorkspace(request.params.id);
      if (!ok) return reply.status(404).send({ error: 'Workspace not found' });
      return { ok: true };
    }
  );

  // Permanently delete workspace (must be inactive first)
  app.delete<{ Params: { id: string } }>(
    '/api/workspaces/:id/permanent',
    async (request, reply) => {
      if (request.params.id === 'ws_default') {
        return reply.status(400).send({ error: 'Cannot delete the default workspace' });
      }
      const ok = permanentlyDeleteWorkspace(request.params.id);
      if (!ok) {
        return reply.status(400).send({
          error: 'Cannot delete',
          message: 'Workspace not found or still active. Deactivate it first.',
        });
      }
      return { ok: true, message: 'Workspace permanently deleted' };
    }
  );

  // List keys in workspace
  app.get<{ Params: { id: string } }>(
    '/api/workspaces/:id/keys',
    async (request, reply) => {
      const ws = getWorkspaceById(request.params.id);
      if (!ws) return reply.status(404).send({ error: 'Workspace not found' });
      const keys = getKeysByWorkspace(request.params.id);
      return { keys };
    }
  );
}
