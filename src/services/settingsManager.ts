import { db } from '../db/client';

const stmts = {
  get: db.prepare('SELECT value FROM settings WHERE key = ?'),
  set: db.prepare(`
    INSERT INTO settings (key, value, updated_at)
    VALUES (?, ?, datetime('now'))
    ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = datetime('now')
  `),
  getAll: db.prepare('SELECT key, value FROM settings'),
};

// Preseed defaults
const defaults: Record<string, string> = {
  default_rate_limit: '100',
};

for (const [key, value] of Object.entries(defaults)) {
  const existing = stmts.get.get(key) as { value: string } | undefined;
  if (!existing) {
    stmts.set.run(key, value);
  }
}

export function getSetting(key: string): string | undefined {
  const row = stmts.get.get(key) as { value: string } | undefined;
  return row?.value;
}

export function setSetting(key: string, value: string): void {
  stmts.set.run(key, value);
}

export function getAllSettings(): Record<string, string> {
  const rows = stmts.getAll.all() as Array<{ key: string; value: string }>;
  const result: Record<string, string> = {};
  for (const row of rows) result[row.key] = row.value;
  return result;
}
