import { useEffect, useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  getOverview,
  getTopMethods,
  getTimeseries,
  getNetworkBreakdown,
  getHealth,
} from '../lib/api';
import type { Overview } from '../lib/api';
import StatCard from '../components/StatCard';

const COLORS = ['#8b5cf6', '#3b82f6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];
type Period = '1h' | '24h' | '7d' | '30d';

const customTooltip = {
  backgroundColor: '#18181b',
  border: '1px solid #27272a',
  borderRadius: '8px',
  padding: '8px 12px',
  boxShadow: '0 4px 24px rgba(0,0,0,0.5)',
};

export default function OverviewPage() {
  const [period, setPeriod] = useState<Period>('24h');
  const [overview, setOverview] = useState<Overview | null>(null);
  const [methods, setMethods] = useState<Array<{ method: string; count: number }>>([]);
  const [series, setSeries] = useState<Array<{ bucket: string; count: number; avg_latency: number }>>([]);
  const [networks, setNetworks] = useState<Array<{ network: string; count: number }>>([]);
  const [health, setHealth] = useState<{ uptime: number; enabledChains: number; totalChains: number } | null>(null);
  const [activeTab, setActiveTab] = useState<'requests' | 'latency'>('requests');

  useEffect(() => { getHealth().then(setHealth).catch(() => {}); }, []);

  useEffect(() => {
    Promise.all([
      getOverview(period),
      getTopMethods(period),
      getTimeseries(period),
      getNetworkBreakdown(period),
    ]).then(([o, m, s, n]) => {
      setOverview(o);
      setMethods(m.methods);
      setSeries(s.series);
      setNetworks(n.networks);
    }).catch(() => {});
  }, [period]);

  const formatUptime = (s: number) => {
    const d = Math.floor(s / 86400);
    const h = Math.floor((s % 86400) / 3600);
    const m = Math.floor((s % 3600) / 60);
    if (d > 0) return `${d}d ${h}h`;
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  };

  return (
    <div>
      {/* Period selector */}
      <div className="flex items-center justify-end mb-6">
        <div className="flex bg-[#111114] border border-[#1f1f23] rounded-lg p-0.5">
          {(['1h', '24h', '7d', '30d'] as Period[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3.5 py-1.5 text-[12px] font-medium rounded-md transition-all duration-200 ${
                period === p
                  ? 'bg-white text-black shadow-sm'
                  : 'text-[#71717a] hover:text-[#a1a1aa]'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-4 gap-4 mb-6 stagger-children">
        <StatCard
          label="Total Requests"
          value={overview?.total_requests?.toLocaleString() ?? '0'}
          sub={`in the last ${period}`}
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
            </svg>
          }
        />
        <StatCard
          label="Avg Response Time"
          value={overview?.avg_latency_ms != null ? `${overview.avg_latency_ms}ms` : '—'}
          sub="p50 latency"
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
          }
        />
        <StatCard
          label="Success Rate"
          value={overview?.success_rate != null ? `${overview.success_rate}%` : '—'}
          sub={overview?.success_count != null ? `${overview.success_count} successful` : undefined}
          trend={overview?.success_rate != null && overview.success_rate >= 99 ? 'up' : undefined}
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
          }
        />
        <StatCard
          label="Uptime"
          value={health ? formatUptime(health.uptime) : '—'}
          sub={health ? `${health.enabledChains} of ${health.totalChains} endpoints` : undefined}
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18 9 11.25l4.306 4.306a11.95 11.95 0 0 1 5.814-5.518l2.74-1.22m0 0-5.94-2.281m5.94 2.28-2.28 5.941" />
            </svg>
          }
        />
      </div>

      {/* Main chart */}
      <div className="border border-[#1a1a1f] rounded-xl mb-6 overflow-hidden bg-[#0c0c0f]">
        {/* Chart header with tabs */}
        <div className="flex items-center justify-between px-5 h-12 border-b border-[#1a1a1f]">
          <div className="flex gap-0">
            {[
              { key: 'requests' as const, label: 'Requests' },
              { key: 'latency' as const, label: 'Response Time' },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 h-12 text-[12px] font-medium border-b-2 transition-all duration-200 -mb-px ${
                  activeTab === tab.key
                    ? 'border-violet-400 text-white'
                    : 'border-transparent text-[#52525b] hover:text-[#a1a1aa]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <span className="text-[11px] text-[#3f3f46]">Over time</span>
        </div>

        {/* Chart body */}
        <div className="p-5">
          {series.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[260px] text-[#3f3f46]">
              <svg className="w-12 h-12 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={0.75}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
              </svg>
              <p className="text-[13px]">No data yet</p>
              <p className="text-[11px] text-[#27272a] mt-1">Make API calls to see metrics here</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={series}>
                <defs>
                  <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={activeTab === 'requests' ? '#8b5cf6' : '#3b82f6'} stopOpacity={0.15} />
                    <stop offset="100%" stopColor={activeTab === 'requests' ? '#8b5cf6' : '#3b82f6'} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="bucket" tick={{ fontSize: 10, fill: '#3f3f46' }} axisLine={{ stroke: '#1a1a1f' }} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#3f3f46' }} axisLine={false} tickLine={false} unit={activeTab === 'latency' ? 'ms' : ''} />
                <Tooltip contentStyle={customTooltip} labelStyle={{ color: '#71717a', fontSize: 11 }} itemStyle={{ fontSize: 12 }} />
                <Area
                  type="monotone"
                  dataKey={activeTab === 'requests' ? 'count' : 'avg_latency'}
                  stroke={activeTab === 'requests' ? '#8b5cf6' : '#3b82f6'}
                  strokeWidth={1.5}
                  fill="url(#grad)"
                  dot={false}
                  activeDot={{ r: 3, strokeWidth: 0, fill: activeTab === 'requests' ? '#8b5cf6' : '#3b82f6' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Bottom panels */}
      <div className="grid grid-cols-5 gap-4">
        {/* Method Calls — 3 cols */}
        <div className="col-span-3 border border-[#1a1a1f] rounded-xl overflow-hidden bg-[#0c0c0f]">
          <div className="px-5 h-12 flex items-center border-b border-[#1a1a1f]">
            <h3 className="text-[12px] font-semibold text-[#a1a1aa]">Method Calls</h3>
            <span className="ml-auto text-[11px] text-[#3f3f46]">Breakdown</span>
          </div>
          <div className="p-5">
            {methods.length === 0 ? (
              <p className="text-[12px] text-[#3f3f46] text-center py-8">No method data yet</p>
            ) : (
              <div className="space-y-4">
                {methods.slice(0, 6).map((m) => {
                  const max = methods[0]?.count || 1;
                  const pct = (m.count / max) * 100;
                  return (
                    <div key={m.method}>
                      <div className="flex items-center justify-between mb-1.5">
                        <code className="text-[12px] text-[#e4e4e7] font-mono">{m.method}</code>
                        <div className="flex items-center gap-3">
                          <span className="text-[12px] text-[#52525b] tabular-nums">{m.count.toLocaleString()} calls</span>
                        </div>
                      </div>
                      <div className="h-1.5 bg-[#1a1a1f] rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 transition-all duration-700"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Network breakdown — 2 cols */}
        <div className="col-span-2 border border-[#1a1a1f] rounded-xl overflow-hidden bg-[#0c0c0f]">
          <div className="px-5 h-12 flex items-center border-b border-[#1a1a1f]">
            <h3 className="text-[12px] font-semibold text-[#a1a1aa]">By Network</h3>
          </div>
          <div className="p-5">
            {networks.length === 0 ? (
              <p className="text-[12px] text-[#3f3f46] text-center py-8">No network data yet</p>
            ) : (
              <div className="flex flex-col items-center">
                <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Pie
                      data={networks}
                      dataKey="count"
                      nameKey="network"
                      cx="50%"
                      cy="50%"
                      outerRadius={70}
                      innerRadius={45}
                      strokeWidth={0}
                    >
                      {networks.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={customTooltip} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="w-full space-y-2 mt-2">
                  {networks.map((n, i) => {
                    const total = networks.reduce((a, b) => a + b.count, 0);
                    const pct = total > 0 ? ((n.count / total) * 100).toFixed(0) : '0';
                    return (
                      <div key={n.network} className="flex items-center gap-2.5 text-[12px]">
                        <div className="w-2 h-2 rounded-sm flex-shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                        <span className="text-[#a1a1aa] flex-1 truncate">{n.network}</span>
                        <span className="text-[#52525b] tabular-nums">{pct}%</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
