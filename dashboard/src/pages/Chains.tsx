import { useEffect, useState } from 'react';
import { getChains } from '../lib/api';

interface Chain {
  slug: string;
  name: string;
  chainId: number;
  type: string;
  testnet: boolean;
  nativeCurrency: { name: string; symbol: string; decimals: number };
  explorerUrl: string;
}

export default function ChainsPage() {
  const [chains, setChains] = useState<Chain[]>([]);
  const [filter, setFilter] = useState<'all' | 'mainnet' | 'testnet'>('all');

  useEffect(() => {
    getChains().then((r) => setChains(r.chains)).catch(() => {});
  }, []);

  const filtered = chains.filter((c) => {
    if (filter === 'mainnet') return !c.testnet;
    if (filter === 'testnet') return c.testnet;
    return true;
  });

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <p className="text-[13px] text-[#71717a]">
          {chains.length} chain{chains.length !== 1 ? 's' : ''} enabled across your gateway
        </p>
        <div className="flex bg-[#111114] border border-[#1f1f23] rounded-lg p-0.5">
          {(['all', 'mainnet', 'testnet'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3.5 py-1.5 text-[12px] font-medium capitalize rounded-md transition-all duration-200 ${
                filter === f
                  ? 'bg-white text-black shadow-sm'
                  : 'text-[#71717a] hover:text-[#a1a1aa]'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Chain grid */}
      <div className="grid grid-cols-3 gap-4 stagger-children">
        {filtered.map((c) => (
          <div
            key={c.slug}
            className="bg-[#0c0c0f] border border-[#1a1a1f] rounded-xl overflow-hidden hover:border-[#27272a] transition-all duration-200 hover:shadow-lg hover:shadow-black/20"
          >
            {/* Card header */}
            <div className="px-5 h-14 flex items-center gap-3 border-b border-[#1a1a1f]">
              <div className="w-8 h-8 rounded-lg bg-[#18181b] border border-[#27272a] flex items-center justify-center">
                <span className="text-[12px] font-bold text-[#a1a1aa]">{c.nativeCurrency.symbol.charAt(0)}</span>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-[13px] font-medium text-white truncate">{c.name}</h3>
                <p className="text-[10px] text-[#3f3f46] font-mono uppercase">{c.type}</p>
              </div>
              <span
                className={`text-[10px] font-medium px-2 py-0.5 rounded ${
                  c.testnet
                    ? 'bg-amber-500/[0.08] text-amber-400'
                    : 'bg-emerald-500/[0.08] text-emerald-400'
                }`}
              >
                {c.testnet ? 'Testnet' : 'Mainnet'}
              </span>
            </div>

            {/* Card body */}
            <div className="p-5 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-[11px] text-[#52525b]">Chain ID</span>
                <span className="text-[12px] text-[#a1a1aa] font-mono tabular-nums">{c.chainId}</span>
              </div>
              <div className="h-px bg-[#1a1a1f]" />
              <div className="flex justify-between items-center">
                <span className="text-[11px] text-[#52525b]">Currency</span>
                <span className="text-[12px] text-[#a1a1aa] font-medium">{c.nativeCurrency.symbol}</span>
              </div>
              <div className="h-px bg-[#1a1a1f]" />
              <div className="flex justify-between items-center">
                <span className="text-[11px] text-[#52525b]">Endpoint</span>
                <code className="text-[11px] text-[#71717a] font-mono bg-[#18181b] px-2 py-0.5 rounded border border-[#27272a]">/v1/{c.slug}</code>
              </div>
            </div>

            {/* Card footer */}
            {c.explorerUrl && (
              <div className="px-5 h-10 flex items-center border-t border-[#1a1a1f]">
                <a
                  href={c.explorerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-[11px] text-[#52525b] hover:text-[#a1a1aa] transition-colors"
                >
                  <span>Explorer</span>
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                  </svg>
                </a>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
