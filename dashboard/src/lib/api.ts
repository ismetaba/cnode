const ADMIN_SECRET = localStorage.getItem('adminSecret') || 'change-me-in-production';

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const headers: Record<string, string> = {
    'X-Admin-Secret': ADMIN_SECRET,
    ...options?.headers as Record<string, string>,
  };
  if (options?.body) {
    headers['Content-Type'] = 'application/json';
  }
  const res = await fetch(path, { ...options, headers });
  if (!res.ok) throw new Error(`API error ${res.status}`);
  return res.json();
}

// Health
export function getHealth() {
  return apiFetch<{
    status: string;
    uptime: number;
    enabledChains: number;
    totalChains: number;
  }>('/health');
}

// Chains
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

// API Keys
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

// Analytics
export interface Overview {
  total_requests: number;
  avg_latency_ms: number;
  success_count: number;
  success_rate: number;
}

export function getOverview(period = '24h') {
  return apiFetch<Overview>(`/api/analytics/overview?period=${period}`);
}

export function getTopMethods(period = '24h') {
  return apiFetch<{ methods: Array<{ method: string; count: number }> }>(
    `/api/analytics/methods?period=${period}`
  );
}

export function getTimeseries(period = '24h') {
  return apiFetch<{
    series: Array<{ bucket: string; count: number; avg_latency: number }>;
  }>(`/api/analytics/timeseries?period=${period}`);
}

export function getNetworkBreakdown(period = '24h') {
  return apiFetch<{ networks: Array<{ network: string; count: number }> }>(
    `/api/analytics/networks?period=${period}`
  );
}

export function setAdminSecret(secret: string) {
  localStorage.setItem('adminSecret', secret);
  window.location.reload();
}

// Workspaces
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
