import { useEffect, useState } from 'react';
import { getRequestLogs } from '../lib/api';
import type { RequestLog } from '../lib/api';

export default function Logs() {
  const [logs, setLogs] = useState<RequestLog[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [network, setNetwork] = useState('');
  const [method, setMethod] = useState('');
  const limit = 50;

  const load = () => {
    getRequestLogs({
      limit,
      offset: page * limit,
      network: network || undefined,
      method: method || undefined,
    }).then((r) => {
      setLogs(r.logs);
      setTotal(r.total);
    }).catch(() => {});
  };

  useEffect(() => { load(); }, [page, network, method]);

  const totalPages = Math.ceil(total / limit);

  function formatTime(iso: string) {
    try {
      const d = new Date(iso);
      return d.toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' });
    } catch { return iso; }
  }

  const inputClass = "px-3 py-2 bg-[#09090b] border border-[#1f1f23] rounded-lg text-[13px] text-white placeholder-[#3f3f46] focus:outline-none focus:border-violet-500/40 focus:ring-1 focus:ring-violet-500/20 transition-all";

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <p className="text-[13px] text-[#71717a] tabular-nums">
          {total.toLocaleString()} total request logs
        </p>
        <div className="flex items-center gap-3">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#3f3f46]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
            </svg>
            <input
              value={network}
              onChange={(e) => { setNetwork(e.target.value); setPage(0); }}
              placeholder="Filter network..."
              className={`${inputClass} w-44 pl-8`}
            />
          </div>
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#3f3f46]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
            </svg>
            <input
              value={method}
              onChange={(e) => { setMethod(e.target.value); setPage(0); }}
              placeholder="Filter method..."
              className={`${inputClass} w-44 pl-8`}
            />
          </div>
        </div>
      </div>

      <div className="border border-[#1a1a1f] rounded-xl overflow-hidden bg-[#0c0c0f]">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#1a1a1f] bg-[#0a0a0d]">
              <th className="px-5 py-3.5 text-left text-[11px] font-semibold text-[#52525b] uppercase tracking-wider">Time</th>
              <th className="px-5 py-3.5 text-left text-[11px] font-semibold text-[#52525b] uppercase tracking-wider">Network</th>
              <th className="px-5 py-3.5 text-left text-[11px] font-semibold text-[#52525b] uppercase tracking-wider">Method</th>
              <th className="px-5 py-3.5 text-left text-[11px] font-semibold text-[#52525b] uppercase tracking-wider">Status</th>
              <th className="px-5 py-3.5 text-right text-[11px] font-semibold text-[#52525b] uppercase tracking-wider">Latency</th>
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-5 py-16 text-center">
                  <svg className="w-12 h-12 text-[#27272a] mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={0.75}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                  </svg>
                  <p className="text-[13px] text-[#52525b]">No logs found</p>
                  <p className="text-[11px] text-[#3f3f46] mt-1">Request logs will appear here as API calls are made</p>
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id} className="border-b border-[#1a1a1f] last:border-0 table-row-hover">
                  <td className="px-5 py-3 text-[12px] text-[#71717a] tabular-nums">{formatTime(log.created_at)}</td>
                  <td className="px-5 py-3">
                    <span className="text-[11px] font-semibold text-white bg-[#111114] px-2.5 py-1 rounded-md border border-[#1a1a1f]">
                      {log.network}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-[12px] font-mono text-[#a1a1aa]">{log.method}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-1.5">
                      <div className={`w-1.5 h-1.5 rounded-full ${log.status_code === 200 ? 'bg-emerald-400' : 'bg-red-400'}`} />
                      <span className={`text-[12px] font-semibold ${log.status_code === 200 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {log.status_code}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-right text-[12px] text-[#71717a] tabular-nums font-mono">{log.latency_ms}ms</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-[11px] text-[#3f3f46] tabular-nums">
            Page {page + 1} of {totalPages}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(Math.max(0, page - 1))}
              disabled={page === 0}
              className="px-3 py-1.5 text-[12px] text-[#71717a] bg-[#111114] border border-[#1f1f23] rounded-lg hover:text-white hover:border-[#27272a] disabled:opacity-30 transition-all"
            >
              Previous
            </button>
            <button
              onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
              disabled={page >= totalPages - 1}
              className="px-3 py-1.5 text-[12px] text-[#71717a] bg-[#111114] border border-[#1f1f23] rounded-lg hover:text-white hover:border-[#27272a] disabled:opacity-30 transition-all"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
