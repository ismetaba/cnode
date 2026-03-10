import { useEffect, useState } from 'react';
import { getSystemInfo } from '../lib/api';
import type { SystemInfo as SystemInfoType } from '../lib/api';

export default function SystemInfo() {
  const [info, setInfo] = useState<SystemInfoType | null>(null);

  const load = () => getSystemInfo().then(setInfo).catch(() => {});

  useEffect(() => {
    load();
    const id = setInterval(load, 30000);
    return () => clearInterval(id);
  }, []);

  function formatBytes(bytes: number) {
    if (bytes >= 1e9) return (bytes / 1e9).toFixed(1) + ' GB';
    if (bytes >= 1e6) return (bytes / 1e6).toFixed(1) + ' MB';
    if (bytes >= 1e3) return (bytes / 1e3).toFixed(1) + ' KB';
    return bytes + ' B';
  }

  function formatUptime(seconds: number) {
    const d = Math.floor(seconds / 86400);
    const h = Math.floor((seconds % 86400) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const parts = [];
    if (d > 0) parts.push(`${d}d`);
    if (h > 0) parts.push(`${h}h`);
    parts.push(`${m}m`);
    return parts.join(' ');
  }

  if (!info) {
    return (
      <div className="border border-[#1a1a1f] rounded-xl px-5 py-16 text-center bg-[#0c0c0f]">
        <div className="w-6 h-6 border-2 border-[#27272a] border-t-violet-400 rounded-full animate-spin mx-auto mb-3" />
        <p className="text-[13px] text-[#52525b]">Loading system info...</p>
      </div>
    );
  }

  const heapPct = (info.processMemory.heapUsed / info.processMemory.heapTotal) * 100;
  const memPct = ((info.totalMemory - info.freeMemory) / info.totalMemory) * 100;

  const statCards = [
    {
      label: 'Uptime',
      value: formatUptime(info.uptime),
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
        </svg>
      ),
      color: 'text-violet-400',
    },
    {
      label: 'Node.js',
      value: info.nodeVersion,
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75 22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3-4.5 16.5" />
        </svg>
      ),
      color: 'text-emerald-400',
    },
    {
      label: 'Platform',
      value: `${info.platform}/${info.arch}`,
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 3v1.5M4.5 8.25H3m18 0h-1.5M4.5 12H3m18 0h-1.5m-15 3.75H3m18 0h-1.5M8.25 19.5V21M12 3v1.5m0 15V21m3.75-18v1.5m0 15V21m-9-1.5h10.5a2.25 2.25 0 0 0 2.25-2.25V6.75a2.25 2.25 0 0 0-2.25-2.25H6.75A2.25 2.25 0 0 0 4.5 6.75v10.5a2.25 2.25 0 0 0 2.25 2.25Z" />
        </svg>
      ),
      color: 'text-blue-400',
    },
    {
      label: 'Database',
      value: formatBytes(info.dbSizeBytes),
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" />
        </svg>
      ),
      color: 'text-amber-400',
    },
  ];

  function barColor(pct: number) {
    if (pct > 90) return 'bg-red-500';
    if (pct > 75) return 'bg-amber-500';
    return 'bg-gradient-to-r from-violet-500 to-fuchsia-500';
  }

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 stagger-children">
        {statCards.map((card) => (
          <div key={card.label} className="bg-[#0c0c0f] border border-[#1a1a1f] rounded-xl p-5 hover:border-[#27272a] transition-all duration-200">
            <div className="flex items-start justify-between mb-3">
              <p className="text-[10px] font-semibold text-[#52525b] uppercase tracking-wider">{card.label}</p>
              <span className={`${card.color} opacity-40`}>{card.icon}</span>
            </div>
            <p className="text-[24px] font-bold text-white tabular-nums tracking-tight">{card.value}</p>
          </div>
        ))}
      </div>

      {/* Memory usage */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-[#0c0c0f] border border-[#1a1a1f] rounded-xl p-5 hover:border-[#27272a] transition-all duration-200">
          <h3 className="text-[12px] font-semibold text-[#a1a1aa] mb-4">Process Memory (Heap)</h3>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-[11px] text-[#71717a]">Heap Used</span>
                <span className="text-[11px] font-mono font-semibold text-white">{formatBytes(info.processMemory.heapUsed)} / {formatBytes(info.processMemory.heapTotal)}</span>
              </div>
              <div className="h-2.5 bg-[#18181b] rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${barColor(heapPct)}`}
                  style={{ width: `${heapPct}%` }}
                />
              </div>
              <p className="text-[10px] text-[#3f3f46] mt-1 text-right tabular-nums">{heapPct.toFixed(1)}%</p>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="bg-[#111114] rounded-lg px-3.5 py-2.5 border border-[#1a1a1f]">
                <p className="text-[10px] text-[#52525b] font-medium mb-0.5">RSS</p>
                <p className="text-[15px] font-bold text-white tabular-nums">{formatBytes(info.processMemory.rss)}</p>
              </div>
              <div className="bg-[#111114] rounded-lg px-3.5 py-2.5 border border-[#1a1a1f]">
                <p className="text-[10px] text-[#52525b] font-medium mb-0.5">External</p>
                <p className="text-[15px] font-bold text-white tabular-nums">{formatBytes(info.processMemory.external)}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-[#0c0c0f] border border-[#1a1a1f] rounded-xl p-5 hover:border-[#27272a] transition-all duration-200">
          <h3 className="text-[12px] font-semibold text-[#a1a1aa] mb-4">System Memory</h3>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-[11px] text-[#71717a]">Used</span>
                <span className="text-[11px] font-mono font-semibold text-white">{formatBytes(info.totalMemory - info.freeMemory)} / {formatBytes(info.totalMemory)}</span>
              </div>
              <div className="h-2.5 bg-[#18181b] rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${barColor(memPct)}`}
                  style={{ width: `${memPct}%` }}
                />
              </div>
              <p className="text-[10px] text-[#3f3f46] mt-1 text-right tabular-nums">{memPct.toFixed(1)}%</p>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="bg-[#111114] rounded-lg px-3.5 py-2.5 border border-[#1a1a1f]">
                <p className="text-[10px] text-[#52525b] font-medium mb-0.5">CPUs</p>
                <p className="text-[15px] font-bold text-white tabular-nums">{info.cpus}</p>
              </div>
              <div className="bg-[#111114] rounded-lg px-3.5 py-2.5 border border-[#1a1a1f]">
                <p className="text-[10px] text-[#52525b] font-medium mb-0.5">Free Memory</p>
                <p className="text-[15px] font-bold text-white tabular-nums">{formatBytes(info.freeMemory)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
