import { useEffect, useState } from 'react';
import { getHealthOverview, triggerHealthCheck } from '../lib/api';
import type { HealthResult } from '../lib/api';

export default function NodeHealth() {
  const [checks, setChecks] = useState<HealthResult[]>([]);
  const [checking, setChecking] = useState(false);

  const load = () => getHealthOverview().then((r) => setChecks(r.checks)).catch(() => {});

  useEffect(() => {
    load();
    const id = setInterval(load, 30000);
    return () => clearInterval(id);
  }, []);

  const handleCheck = async () => {
    setChecking(true);
    try {
      const r = await triggerHealthCheck();
      setChecks(r.checks);
    } catch {}
    setChecking(false);
  };

  function statusConfig(s: string) {
    if (s === 'healthy') return { dot: 'bg-emerald-400 shadow-sm shadow-emerald-400/50', text: 'text-emerald-400', bg: 'bg-emerald-500/10 ring-1 ring-emerald-500/20', label: 'HEALTHY', bar: 'bg-emerald-500', border: 'border-emerald-500/20' };
    if (s === 'degraded') return { dot: 'bg-amber-400 shadow-sm shadow-amber-400/50', text: 'text-amber-400', bg: 'bg-amber-500/10 ring-1 ring-amber-500/20', label: 'DEGRADED', bar: 'bg-amber-500', border: 'border-amber-500/20' };
    return { dot: 'bg-red-400 shadow-sm shadow-red-400/50', text: 'text-red-400', bg: 'bg-red-500/10 ring-1 ring-red-500/20', label: 'DOWN', bar: 'bg-red-500', border: 'border-red-500/20' };
  }

  function formatTime(iso: string) {
    try { return new Date(iso).toLocaleTimeString(); } catch { return iso; }
  }

  const healthyCount = checks.filter(c => c.status === 'healthy').length;
  const downCount = checks.filter(c => c.status === 'down').length;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          {checks.length > 0 && (
            <div className="flex items-center gap-3 text-[12px]">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                {healthyCount} healthy
              </span>
              {downCount > 0 && (
                <span className="flex items-center gap-1.5 text-red-400">
                  <span className="w-2 h-2 rounded-full bg-red-400" />
                  {downCount} down
                </span>
              )}
            </div>
          )}
        </div>
        <button
          onClick={handleCheck}
          disabled={checking}
          className="flex items-center gap-2 px-4 py-2 bg-white text-black text-[13px] font-medium rounded-lg hover:bg-[#e4e4e7] disabled:opacity-50 transition-all duration-200 shadow-sm"
        >
          <svg className={`w-4 h-4 ${checking ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182" />
          </svg>
          {checking ? 'Checking...' : 'Check Now'}
        </button>
      </div>

      {checks.length === 0 ? (
        <div className="border border-[#1a1a1f] rounded-xl px-5 py-16 text-center bg-[#0c0c0f]">
          <svg className="w-12 h-12 text-[#27272a] mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={0.75}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
          </svg>
          <p className="text-[13px] text-[#52525b]">No health data yet</p>
          <p className="text-[11px] text-[#3f3f46] mt-1">Health checks run every 60 seconds</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 stagger-children">
          {checks.map((c) => {
            const cfg = statusConfig(c.status);
            return (
              <div key={c.chain_slug} className={`border rounded-xl overflow-hidden transition-all duration-200 hover:shadow-lg hover:shadow-black/20 bg-[#0c0c0f] ${cfg.border}`}>
                <div className={`h-0.5 ${cfg.bar}`} />

                <div className="px-5 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-2.5 h-2.5 rounded-full ${cfg.dot}`} />
                    <h3 className="text-[14px] font-semibold text-white">{c.chain_slug}</h3>
                  </div>
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-md ${cfg.text} ${cfg.bg}`}>
                    {cfg.label}
                  </span>
                </div>

                <div className="px-5 pb-5">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-[#111114] rounded-lg px-3.5 py-2.5 border border-[#1a1a1f]">
                      <p className="text-[10px] text-[#52525b] font-medium mb-0.5">Latency</p>
                      <p className="text-[16px] font-bold text-white tabular-nums">{c.latency_ms}ms</p>
                    </div>
                    <div className="bg-[#111114] rounded-lg px-3.5 py-2.5 border border-[#1a1a1f]">
                      <p className="text-[10px] text-[#52525b] font-medium mb-0.5">Block Height</p>
                      <p className="text-[16px] font-bold text-white tabular-nums">
                        {c.block_height !== null ? c.block_height.toLocaleString() : '--'}
                      </p>
                    </div>
                    <div className="bg-[#111114] rounded-lg px-3.5 py-2.5 border border-[#1a1a1f]">
                      <p className="text-[10px] text-[#52525b] font-medium mb-0.5">Peers</p>
                      <p className="text-[16px] font-bold text-white tabular-nums">
                        {c.peer_count !== null ? c.peer_count : '--'}
                      </p>
                    </div>
                    <div className="bg-[#111114] rounded-lg px-3.5 py-2.5 border border-[#1a1a1f]">
                      <p className="text-[10px] text-[#52525b] font-medium mb-0.5">Last Check</p>
                      <p className="text-[13px] font-semibold text-white tabular-nums">{formatTime(c.checked_at)}</p>
                    </div>
                  </div>
                  {c.error_message && (
                    <div className="mt-3 px-3.5 py-2.5 bg-red-500/[0.07] rounded-lg border border-red-500/10">
                      <p className="text-[11px] text-red-400 break-all leading-relaxed">{c.error_message}</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
