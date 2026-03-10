import { db } from '../db/client';

const stmts = {
  logRequest: db.prepare(
    'INSERT INTO request_logs (api_key_id, network, method, status_code, latency_ms) VALUES (?, ?, ?, ?, ?)'
  ),

  upsertUsage: db.prepare(`
    INSERT INTO workspace_usage (workspace_id, network, month, request_count)
    VALUES (?, ?, strftime('%Y-%m', 'now'), 1)
    ON CONFLICT(workspace_id, network, month)
    DO UPDATE SET request_count = request_count + 1
  `),

  // Global queries
  overview: db.prepare(`
    SELECT
      COUNT(*) as total_requests,
      ROUND(AVG(latency_ms), 1) as avg_latency_ms,
      SUM(CASE WHEN status_code = 200 THEN 1 ELSE 0 END) as success_count,
      ROUND(100.0 * SUM(CASE WHEN status_code = 200 THEN 1 ELSE 0 END) / MAX(COUNT(*), 1), 1) as success_rate
    FROM request_logs
    WHERE created_at >= datetime('now', ?)
  `),

  topMethods: db.prepare(`
    SELECT method, COUNT(*) as count
    FROM request_logs
    WHERE created_at >= datetime('now', ?)
    GROUP BY method
    ORDER BY count DESC
    LIMIT 20
  `),

  timeseries: db.prepare(`
    SELECT
      strftime(?, created_at) as bucket,
      COUNT(*) as count,
      ROUND(AVG(latency_ms), 1) as avg_latency
    FROM request_logs
    WHERE created_at >= datetime('now', ?)
    GROUP BY bucket
    ORDER BY bucket
  `),

  networkBreakdown: db.prepare(`
    SELECT network, COUNT(*) as count
    FROM request_logs
    WHERE created_at >= datetime('now', ?)
    GROUP BY network
    ORDER BY count DESC
  `),

  keyUsage: db.prepare(`
    SELECT
      COUNT(*) as total_requests,
      ROUND(AVG(latency_ms), 1) as avg_latency_ms,
      SUM(CASE WHEN status_code = 200 THEN 1 ELSE 0 END) as success_count
    FROM request_logs
    WHERE api_key_id = ? AND created_at >= datetime('now', ?)
  `),

  keyNetworkBreakdown: db.prepare(`
    SELECT network, COUNT(*) as count
    FROM request_logs
    WHERE api_key_id = ? AND created_at >= datetime('now', ?)
    GROUP BY network ORDER BY count DESC
  `),

  // Workspace-filtered queries
  wsOverview: db.prepare(`
    SELECT
      COUNT(*) as total_requests,
      ROUND(AVG(r.latency_ms), 1) as avg_latency_ms,
      SUM(CASE WHEN r.status_code = 200 THEN 1 ELSE 0 END) as success_count,
      ROUND(100.0 * SUM(CASE WHEN r.status_code = 200 THEN 1 ELSE 0 END) / MAX(COUNT(*), 1), 1) as success_rate
    FROM request_logs r
    JOIN api_keys k ON r.api_key_id = k.id
    WHERE k.workspace_id = ? AND r.created_at >= datetime('now', ?)
  `),

  wsTopMethods: db.prepare(`
    SELECT r.method, COUNT(*) as count
    FROM request_logs r
    JOIN api_keys k ON r.api_key_id = k.id
    WHERE k.workspace_id = ? AND r.created_at >= datetime('now', ?)
    GROUP BY r.method ORDER BY count DESC LIMIT 20
  `),

  wsTimeseries: db.prepare(`
    SELECT
      strftime(?, r.created_at) as bucket,
      COUNT(*) as count,
      ROUND(AVG(r.latency_ms), 1) as avg_latency
    FROM request_logs r
    JOIN api_keys k ON r.api_key_id = k.id
    WHERE k.workspace_id = ? AND r.created_at >= datetime('now', ?)
    GROUP BY bucket ORDER BY bucket
  `),

  wsNetworkBreakdown: db.prepare(`
    SELECT r.network, COUNT(*) as count
    FROM request_logs r
    JOIN api_keys k ON r.api_key_id = k.id
    WHERE k.workspace_id = ? AND r.created_at >= datetime('now', ?)
    GROUP BY r.network ORDER BY count DESC
  `),

  workspaceUsageByMonth: db.prepare(`
    SELECT network, request_count
    FROM workspace_usage
    WHERE workspace_id = ? AND month = ?
    ORDER BY request_count DESC
  `),
};

export function logRequest(
  apiKeyId: string,
  workspaceId: string,
  network: string,
  method: string,
  statusCode: number,
  latencyMs: number
): void {
  setImmediate(() => {
    try {
      stmts.logRequest.run(apiKeyId, network, method, statusCode, latencyMs);
      stmts.upsertUsage.run(workspaceId, network);
    } catch {
      // Silently drop log failures — don't affect request path
    }
  });
}

type Period = '1h' | '24h' | '7d' | '30d';
const periodToSql: Record<Period, string> = {
  '1h': '-1 hour',
  '24h': '-1 day',
  '7d': '-7 days',
  '30d': '-30 days',
};
const periodToFormat: Record<Period, string> = {
  '1h': '%Y-%m-%d %H:%M',
  '24h': '%Y-%m-%d %H:00',
  '7d': '%Y-%m-%d',
  '30d': '%Y-%m-%d',
};

// Global analytics
export function getOverview(period: Period = '24h') {
  return stmts.overview.get(periodToSql[period]);
}

export function getTopMethods(period: Period = '24h') {
  return stmts.topMethods.all(periodToSql[period]);
}

export function getTimeseries(period: Period = '24h') {
  return stmts.timeseries.all(periodToFormat[period], periodToSql[period]);
}

export function getNetworkBreakdown(period: Period = '24h') {
  return stmts.networkBreakdown.all(periodToSql[period]);
}

export function getKeyUsage(apiKeyId: string, period: Period = '24h') {
  return stmts.keyUsage.get(apiKeyId, periodToSql[period]);
}

export function getKeyNetworkBreakdown(apiKeyId: string, period: Period = '24h') {
  return stmts.keyNetworkBreakdown.all(apiKeyId, periodToSql[period]);
}

// Workspace-scoped analytics
export function getWorkspaceOverview(workspaceId: string, period: Period = '24h') {
  return stmts.wsOverview.get(workspaceId, periodToSql[period]);
}

export function getWorkspaceTopMethods(workspaceId: string, period: Period = '24h') {
  return stmts.wsTopMethods.all(workspaceId, periodToSql[period]);
}

export function getWorkspaceTimeseries(workspaceId: string, period: Period = '24h') {
  return stmts.wsTimeseries.all(periodToFormat[period], workspaceId, periodToSql[period]);
}

export function getWorkspaceNetworkBreakdown(workspaceId: string, period: Period = '24h') {
  return stmts.wsNetworkBreakdown.all(workspaceId, periodToSql[period]);
}

export function getWorkspaceUsageByMonth(workspaceId: string, month: string) {
  return stmts.workspaceUsageByMonth.all(workspaceId, month);
}
