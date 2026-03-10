export type Role = 'consumer' | 'operator';

function getAdminSecret(): string {
  return localStorage.getItem('adminSecret') || '';
}

export function getRole(): Role | null {
  return localStorage.getItem('role') as Role | null;
}

export function isLoggedIn(): boolean {
  return !!localStorage.getItem('adminSecret');
}

export function login(secret: string, role: Role): void {
  localStorage.setItem('adminSecret', secret);
  localStorage.setItem('role', role);
}

export function logout(): void {
  localStorage.removeItem('adminSecret');
  localStorage.removeItem('role');
  window.location.reload();
}

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const headers: Record<string, string> = {
    'X-Admin-Secret': getAdminSecret(),
    ...options?.headers as Record<string, string>,
  };
  if (options?.body) {
    headers['Content-Type'] = 'application/json';
  }
  const res = await fetch(path, { ...options, headers });
  if (!res.ok) throw new Error(`API error ${res.status}`);
  return res.json();
}

// ── Auth ──────────────────────────────────────────────

export function checkRole(secret: string) {
  return fetch('/api/auth/role', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ secret }),
  });
}

// ── Health ─────────────────────────────────────────────

export function getHealth() {
  return apiFetch<{
    status: string;
    uptime: number;
    enabledChains: number;
    totalChains: number;
  }>('/health');
}

// ── Chains ─────────────────────────────────────────────

export function getChains() {
  return apiFetch<{
    chains: Array<{
      slug: string;
      name: string;
      chainId: number;
      type: string;
      testnet: boolean;
      nativeCurrency: { name: string; symbol: string; decimals: number };
      explorerUrl: string;
    }>;
  }>('/v1/chains');
}

// ── API Keys ───────────────────────────────────────────

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

export function getApiKeys() {
  return apiFetch<{ keys: ApiKey[] }>('/api/keys');
}

export function createApiKey(name: string, rateLimit: number, networks: string, workspaceId = 'ws_default') {
  return apiFetch<{ key: ApiKey }>('/api/keys', {
    method: 'POST',
    body: JSON.stringify({ name, rate_limit: rateLimit, networks, workspace_id: workspaceId }),
  });
}

export function updateApiKey(id: string, name: string, rateLimit: number, networks: string) {
  return apiFetch<{ key: ApiKey }>(`/api/keys/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ name, rate_limit: rateLimit, networks }),
  });
}

export function deleteApiKey(id: string) {
  return apiFetch<{ ok: boolean }>(`/api/keys/${id}`, { method: 'DELETE' });
}

export function permanentlyDeleteApiKey(id: string) {
  return apiFetch<{ ok: boolean }>(`/api/keys/${id}/permanent`, { method: 'DELETE' });
}

export function getKeyUsage(id: string, period = '24h') {
  return apiFetch<{
    usage: {
      total_requests: number;
      avg_latency_ms: number;
      success_count: number;
    };
  }>(`/api/keys/${id}/usage?period=${period}`);
}

// ── Analytics ──────────────────────────────────────────

export interface Overview {
  total_requests: number;
  avg_latency_ms: number;
  success_count: number;
  success_rate: number;
}

export function getOverview(period = '24h', workspaceId?: string) {
  const qs = new URLSearchParams({ period });
  if (workspaceId) qs.set('workspace_id', workspaceId);
  return apiFetch<Overview>(`/api/analytics/overview?${qs}`);
}

export function getTopMethods(period = '24h', workspaceId?: string) {
  const qs = new URLSearchParams({ period });
  if (workspaceId) qs.set('workspace_id', workspaceId);
  return apiFetch<{ methods: Array<{ method: string; count: number }> }>(
    `/api/analytics/methods?${qs}`
  );
}

export function getTimeseries(period = '24h', workspaceId?: string) {
  const qs = new URLSearchParams({ period });
  if (workspaceId) qs.set('workspace_id', workspaceId);
  return apiFetch<{
    series: Array<{ bucket: string; count: number; avg_latency: number }>;
  }>(`/api/analytics/timeseries?${qs}`);
}

export function getNetworkBreakdown(period = '24h', workspaceId?: string) {
  const qs = new URLSearchParams({ period });
  if (workspaceId) qs.set('workspace_id', workspaceId);
  return apiFetch<{ networks: Array<{ network: string; count: number }> }>(
    `/api/analytics/networks?${qs}`
  );
}

// ── Workspaces ─────────────────────────────────────────

export interface Workspace {
  id: string;
  name: string;
  monthly_quota: number;
  active: number;
  created_at: string;
  usage?: number;
  key_count?: number;
}

export function getWorkspaces() {
  return apiFetch<{ workspaces: Workspace[] }>('/api/workspaces');
}

export function getWorkspace(id: string) {
  return apiFetch<{ workspace: Workspace }>(`/api/workspaces/${id}`);
}

export function createWorkspace(name: string, monthlyQuota: number) {
  return apiFetch<{ workspace: Workspace }>('/api/workspaces', {
    method: 'POST',
    body: JSON.stringify({ name, monthly_quota: monthlyQuota }),
  });
}

export function updateWorkspace(id: string, name: string, monthlyQuota: number) {
  return apiFetch<{ workspace: Workspace }>(`/api/workspaces/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ name, monthly_quota: monthlyQuota }),
  });
}

export function deleteWorkspace(id: string) {
  return apiFetch<{ ok: boolean }>(`/api/workspaces/${id}`, { method: 'DELETE' });
}

export function reactivateWorkspace(id: string) {
  return apiFetch<{ ok: boolean }>(`/api/workspaces/${id}/reactivate`, { method: 'POST' });
}

export function permanentlyDeleteWorkspace(id: string) {
  return apiFetch<{ ok: boolean }>(`/api/workspaces/${id}/permanent`, { method: 'DELETE' });
}

// ── Operator APIs ──────────────────────────────────────

export interface HealthResult {
  chain_slug: string;
  status: 'healthy' | 'degraded' | 'down';
  latency_ms: number;
  block_height: number | null;
  peer_count: number | null;
  error_message: string | null;
  checked_at: string;
}

export interface ChainWithHealth {
  slug: string;
  name: string;
  chainId: number;
  type: string;
  rpcUrl: string;
  rpcAuth?: string;
  wsUrl?: string;
  explorerUrl?: string;
  nativeCurrency: { name: string; symbol: string; decimals: number };
  testnet: boolean;
  enabled: boolean;
  isCustom: boolean;
  health: HealthResult | null;
}

export interface SystemInfo {
  uptime: number;
  nodeVersion: string;
  platform: string;
  arch: string;
  cpus: number;
  totalMemory: number;
  freeMemory: number;
  processMemory: {
    rss: number;
    heapUsed: number;
    heapTotal: number;
    external: number;
  };
  dbSizeBytes: number;
  redisStatus: 'connected' | 'disconnected';
  rateLimitMode: 'redis' | 'in-memory';
  cache: { hits: number; misses: number; hitRate: number };
}

export interface RequestLog {
  id: number;
  api_key_id: string;
  network: string;
  method: string;
  status_code: number;
  latency_ms: number;
  created_at: string;
}

export function getOperatorChains() {
  return apiFetch<{ chains: ChainWithHealth[] }>('/api/operator/chains');
}

export function toggleChain(slug: string, enabled: boolean) {
  return apiFetch<{ ok: boolean }>(`/api/operator/chains/${slug}/toggle`, {
    method: 'PATCH',
    body: JSON.stringify({ enabled }),
  });
}

export function updateChainConfig(slug: string, data: Record<string, unknown>) {
  return apiFetch(`/api/operator/chains/${slug}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export function addCustomChain(chain: Record<string, unknown>) {
  return apiFetch('/api/operator/chains', {
    method: 'POST',
    body: JSON.stringify(chain),
  });
}

export function deleteChain(slug: string) {
  return apiFetch(`/api/operator/chains/${slug}`, { method: 'DELETE' });
}

export function getHealthOverview() {
  return apiFetch<{ checks: HealthResult[] }>('/api/operator/health');
}

export function getChainHealthDetail(slug: string, limit = 50) {
  return apiFetch<{ latest: HealthResult; history: HealthResult[] }>(
    `/api/operator/health/${slug}?limit=${limit}`
  );
}

export function triggerHealthCheck() {
  return apiFetch<{ ok: boolean; checks: HealthResult[] }>(
    '/api/operator/health/check', { method: 'POST' }
  );
}

export function getSystemInfo() {
  return apiFetch<SystemInfo>('/api/operator/system');
}

export function getRequestLogs(params: { limit?: number; offset?: number; network?: string; method?: string } = {}) {
  const qs = new URLSearchParams();
  if (params.limit) qs.set('limit', String(params.limit));
  if (params.offset) qs.set('offset', String(params.offset));
  if (params.network) qs.set('network', params.network);
  if (params.method) qs.set('method', params.method);
  return apiFetch<{ logs: RequestLog[]; total: number; limit: number; offset: number }>(
    `/api/operator/logs?${qs.toString()}`
  );
}

// ── Cache ─────────────────────────────────────────────

export function getCacheStats() {
  return apiFetch<{ hits: number; misses: number; hitRate: number }>('/api/operator/cache/stats');
}

export function flushCache(chainSlug?: string) {
  return apiFetch<{ ok: boolean; deleted: number }>('/api/operator/cache/flush', {
    method: 'POST',
    body: JSON.stringify({ chain_slug: chainSlug }),
  });
}

// ── Settings ──────────────────────────────────────────

export function getSettings() {
  return apiFetch<{ settings: Record<string, string> }>('/api/operator/settings');
}

export function updateSetting(key: string, value: string) {
  return apiFetch<{ ok: boolean }>(`/api/operator/settings/${key}`, {
    method: 'PUT',
    body: JSON.stringify({ value }),
  });
}

// ── Workspace Usage ───────────────────────────────────

export function getWorkspaceUsage(id: string, month?: string) {
  const qs = month ? `?month=${month}` : '';
  return apiFetch<{
    usage: Array<{ network: string; request_count: number }>;
    workspace: Workspace;
    month: string;
  }>(`/api/workspaces/${id}/usage${qs}`);
}
