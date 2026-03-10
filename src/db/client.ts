import Database, { Database as DatabaseType } from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { config } from '../config';

const dbDir = path.dirname(config.dbPath);
if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });

export const db: DatabaseType = new Database(config.dbPath);

// WAL mode for better concurrent read performance
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Schema init
db.exec(`
  CREATE TABLE IF NOT EXISTS api_keys (
    id TEXT PRIMARY KEY,
    key TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL DEFAULT 'default',
    rate_limit INTEGER NOT NULL DEFAULT 100,
    networks TEXT NOT NULL DEFAULT '*',
    active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS request_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    api_key_id TEXT NOT NULL REFERENCES api_keys(id),
    network TEXT NOT NULL,
    method TEXT NOT NULL,
    status_code INTEGER NOT NULL,
    latency_ms INTEGER NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE INDEX IF NOT EXISTS idx_request_logs_api_key ON request_logs(api_key_id);
  CREATE INDEX IF NOT EXISTS idx_request_logs_created ON request_logs(created_at);
  CREATE INDEX IF NOT EXISTS idx_request_logs_network ON request_logs(network);
`);

// === Migration: Add workspaces support ===
const hasWorkspaceCol = (
  db
    .prepare("SELECT COUNT(*) as cnt FROM pragma_table_info('api_keys') WHERE name = 'workspace_id'")
    .get() as { cnt: number }
).cnt;

if (hasWorkspaceCol === 0) {
  db.transaction(() => {
    db.exec(`
      CREATE TABLE IF NOT EXISTS workspaces (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        monthly_quota INTEGER NOT NULL DEFAULT 100000,
        active INTEGER NOT NULL DEFAULT 1,
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      );
    `);

    db.prepare(
      "INSERT OR IGNORE INTO workspaces (id, name, monthly_quota) VALUES (?, ?, ?)"
    ).run('ws_default', 'Default Workspace', 1000000);

    db.exec("ALTER TABLE api_keys ADD COLUMN workspace_id TEXT NOT NULL DEFAULT 'ws_default' REFERENCES workspaces(id)");
    db.exec("CREATE INDEX IF NOT EXISTS idx_api_keys_workspace ON api_keys(workspace_id)");
  })();
} else {
  // Ensure workspaces table exists on subsequent runs
  db.exec(`
    CREATE TABLE IF NOT EXISTS workspaces (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      monthly_quota INTEGER NOT NULL DEFAULT 100000,
      active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);
}
