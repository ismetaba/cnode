import { db } from '../db/client';

const stmts = {
  logRequest: db.prepare(
    'INSERT INTO request_logs (api_key_id, network, method, status_code, latency_ms) VALUES (?, ?, ?, ?, ?)'
  ),

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
};

export function logRequest(
  apiKeyId: string,
  network: string,
  method: string,
  statusCode: number,
  latencyMs: number
): void {
  // Fire-and-forget, non-blocking via setImmediate
  setImmediate(() => {
    try {
      stmts.logRequest.run(apiKeyId, network, method, statusCode, latencyMs);
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
