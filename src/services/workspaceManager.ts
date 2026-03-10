import crypto from 'crypto';
import { db } from '../db/client';

export interface Workspace {
  id: string;
  name: string;
  monthly_quota: number;
  active: number;
  created_at: string;
}

const stmts = {
  insert: db.prepare(
    'INSERT INTO workspaces (id, name, monthly_quota) VALUES (?, ?, ?)'
  ),
  getById: db.prepare('SELECT * FROM workspaces WHERE id = ?'),
  getAll: db.prepare('SELECT * FROM workspaces ORDER BY created_at DESC'),
  update: db.prepare('UPDATE workspaces SET name = ?, monthly_quota = ? WHERE id = ?'),
  deactivate: db.prepare('UPDATE workspaces SET active = 0 WHERE id = ?'),
  reactivate: db.prepare('UPDATE workspaces SET active = 1 WHERE id = ?'),
  deleteWorkspace: db.prepare('DELETE FROM workspaces WHERE id = ? AND active = 0'),
  getByApiKeyId: db.prepare(
    'SELECT w.* FROM workspaces w JOIN api_keys k ON k.workspace_id = w.id WHERE k.id = ?'
  ),
  monthlyUsage: db.prepare(`
    SELECT COUNT(*) as count FROM request_logs r
    JOIN api_keys k ON r.api_key_id = k.id
    WHERE k.workspace_id = ? AND r.created_at >= datetime('now', 'start of month')
  `),
  keyCount: db.prepare(
    'SELECT COUNT(*) as count FROM api_keys WHERE workspace_id = ? AND active = 1'
  ),
  getKeysByWorkspace: db.prepare(
    'SELECT * FROM api_keys WHERE workspace_id = ? ORDER BY created_at DESC'
  ),
};

export function createWorkspace(name: string, monthlyQuota = 100000): Workspace {
  const id = crypto.randomUUID();
  stmts.insert.run(id, name, monthlyQuota);
  return stmts.getById.get(id) as Workspace;
}

export function getWorkspaceById(id: string): Workspace | undefined {
  return stmts.getById.get(id) as Workspace | undefined;
}

export function getAllWorkspaces(): Workspace[] {
  return stmts.getAll.all() as Workspace[];
}

export function updateWorkspace(
  id: string,
  name: string,
  monthlyQuota: number
): Workspace | undefined {
  stmts.update.run(name, monthlyQuota, id);
  return stmts.getById.get(id) as Workspace | undefined;
}

export function deactivateWorkspace(id: string): boolean {
  return stmts.deactivate.run(id).changes > 0;
}

export function reactivateWorkspace(id: string): boolean {
  return stmts.reactivate.run(id).changes > 0;
}

const deleteKeysByWorkspace = db.prepare('DELETE FROM api_keys WHERE workspace_id = ? AND active = 0');
const deleteLogsByWorkspaceKeys = db.prepare(`
  DELETE FROM request_logs WHERE api_key_id IN (
    SELECT id FROM api_keys WHERE workspace_id = ?
  )
`);
const deleteAllKeysByWorkspace = db.prepare('DELETE FROM api_keys WHERE workspace_id = ?');

export function permanentlyDeleteWorkspace(id: string): boolean {
  const txn = db.transaction(() => {
    deleteLogsByWorkspaceKeys.run(id);
    deleteAllKeysByWorkspace.run(id);
    return stmts.deleteWorkspace.run(id);
  });
  const result = txn();
  return result.changes > 0;
}

export function getWorkspaceForKey(apiKeyId: string): Workspace | undefined {
  return stmts.getByApiKeyId.get(apiKeyId) as Workspace | undefined;
}

export function getWorkspaceMonthlyUsage(workspaceId: string): number {
  return (stmts.monthlyUsage.get(workspaceId) as { count: number }).count;
}

export function getWorkspaceKeyCount(workspaceId: string): number {
  return (stmts.keyCount.get(workspaceId) as { count: number }).count;
}

export function getKeysByWorkspace(workspaceId: string) {
  return stmts.getKeysByWorkspace.all(workspaceId);
}

// --- In-memory quota cache for performance ---
const quotaCache = new Map<string, { count: number; refreshedAt: number }>();
const CACHE_TTL_MS = 60_000;

export function incrementAndCheckQuota(
  workspaceId: string,
  quota: number
): { allowed: boolean; used: number; limit: number } {
  const now = Date.now();
  let entry = quotaCache.get(workspaceId);

  if (!entry || now - entry.refreshedAt > CACHE_TTL_MS) {
    const dbCount = getWorkspaceMonthlyUsage(workspaceId);
    entry = { count: dbCount, refreshedAt: now };
    quotaCache.set(workspaceId, entry);
  }

  entry.count++;
  const allowed = entry.count <= quota;
  return { allowed, used: entry.count, limit: quota };
}

// Cleanup stale entries every 60s
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of quotaCache) {
    if (now - entry.refreshedAt > CACHE_TTL_MS * 2) quotaCache.delete(key);
  }
}, 60_000);
