import crypto from 'crypto';
import { db } from '../db/client';

export interface ApiKey {
  id: string;
  key: string;
  name: string;
  rate_limit: number;
  networks: string;
  workspace_id: string;
  active: number;
  created_at: string;
}

function generateKey(): string {
  return 'cn_' + crypto.randomBytes(24).toString('hex');
}

const stmts = {
  insert: db.prepare(
    'INSERT INTO api_keys (id, key, name, rate_limit, networks, workspace_id) VALUES (?, ?, ?, ?, ?, ?)'
  ),
  getByKey: db.prepare('SELECT * FROM api_keys WHERE key = ? AND active = 1'),
  getById: db.prepare('SELECT * FROM api_keys WHERE id = ?'),
  getAll: db.prepare('SELECT * FROM api_keys ORDER BY created_at DESC'),
  deactivate: db.prepare('UPDATE api_keys SET active = 0 WHERE id = ?'),
  deleteKey: db.prepare('DELETE FROM api_keys WHERE id = ? AND active = 0'),
  update: db.prepare(
    'UPDATE api_keys SET name = ?, rate_limit = ?, networks = ? WHERE id = ?'
  ),
};

export function createApiKey(
  name: string,
  rateLimit = 100,
  networks = '*',
  workspaceId = 'ws_default'
): ApiKey {
  const id = crypto.randomUUID();
  const key = generateKey();
  stmts.insert.run(id, key, name, rateLimit, networks, workspaceId);
  return stmts.getById.get(id) as ApiKey;
}

export function getApiKeyByKey(key: string): ApiKey | undefined {
  return stmts.getByKey.get(key) as ApiKey | undefined;
}

export function getAllApiKeys(): ApiKey[] {
  return stmts.getAll.all() as ApiKey[];
}

export function deactivateApiKey(id: string): boolean {
  const result = stmts.deactivate.run(id);
  return result.changes > 0;
}

export function updateApiKey(
  id: string,
  name: string,
  rateLimit: number,
  networks: string
): ApiKey | undefined {
  stmts.update.run(name, rateLimit, networks, id);
  return stmts.getById.get(id) as ApiKey | undefined;
}

const deleteLogsByKey = db.prepare('DELETE FROM request_logs WHERE api_key_id = ?');

export function permanentlyDeleteKey(id: string): boolean {
  const txn = db.transaction(() => {
    deleteLogsByKey.run(id);
    return stmts.deleteKey.run(id);
  });
  const result = txn();
  return result.changes > 0;
}

export function canAccessNetwork(apiKey: ApiKey, network: string): boolean {
  if (apiKey.networks === '*') return true;
  const allowed = apiKey.networks.split(',').map((n) => n.trim());
  return allowed.includes(network);
}
