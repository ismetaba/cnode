import { useEffect, useState } from 'react';
import { getOperatorChains, toggleChain, updateChainConfig, addCustomChain, deleteChain } from '../lib/api';
import type { ChainWithHealth } from '../lib/api';

export default function ChainManagement() {
  const [chains, setChains] = useState<ChainWithHealth[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [editSlug, setEditSlug] = useState<string | null>(null);
  const [form, setForm] = useState({
    slug: '', name: '', chainId: 0, type: 'evm' as string,
    rpcUrl: '', rpcAuth: '', wsUrl: '', explorerUrl: '',
    currencyName: 'Ether', currencySymbol: 'ETH', currencyDecimals: 18,
    testnet: false, enabled: false, cacheEnabled: true,
  });

  const load = () => getOperatorChains().then((r) => setChains(r.chains)).catch(() => {});
  useEffect(() => { load(); }, []);

  const handleToggle = async (slug: string, enabled: boolean) => {
    await toggleChain(slug, enabled);
    load();
  };

  const resetForm = () => {
    setForm({
      slug: '', name: '', chainId: 0, type: 'evm',
      rpcUrl: '', rpcAuth: '', wsUrl: '', explorerUrl: '',
      currencyName: 'Ether', currencySymbol: 'ETH', currencyDecimals: 18,
      testnet: false, enabled: false, cacheEnabled: true,
    });
    setShowAdd(false);
    setEditSlug(null);
  };

  const startEdit = (c: ChainWithHealth) => {
    setEditSlug(c.slug);
    setShowAdd(false);
    setForm({
      slug: c.slug, name: c.name, chainId: c.chainId, type: c.type,
      rpcUrl: c.rpcUrl, rpcAuth: c.rpcAuth || '', wsUrl: c.wsUrl || '',
      explorerUrl: c.explorerUrl || '',
      currencyName: c.nativeCurrency.name, currencySymbol: c.nativeCurrency.symbol,
      currencyDecimals: c.nativeCurrency.decimals,
      testnet: c.testnet, enabled: c.enabled,
      cacheEnabled: (c as any).cacheEnabled !== false,
    });
  };

  const handleAdd = async () => {
    if (!form.slug || !form.name || !form.rpcUrl) return;
    await addCustomChain({
      slug: form.slug, name: form.name, chainId: form.chainId,
      type: form.type, rpcUrl: form.rpcUrl, rpcAuth: form.rpcAuth || undefined,
      wsUrl: form.wsUrl || undefined, explorerUrl: form.explorerUrl || undefined,
      nativeCurrency: { name: form.currencyName, symbol: form.currencySymbol, decimals: form.currencyDecimals },
      testnet: form.testnet, enabled: form.enabled,
    });
    resetForm();
    load();
  };

  const handleUpdate = async () => {
    if (!editSlug) return;
    await updateChainConfig(editSlug, {
      name: form.name, rpcUrl: form.rpcUrl,
      rpcAuth: form.rpcAuth || undefined,
      wsUrl: form.wsUrl || undefined,
      explorerUrl: form.explorerUrl || undefined,
      enabled: form.enabled,
      cacheEnabled: form.cacheEnabled,
    });
    resetForm();
    load();
  };

  const handleDelete = async (slug: string) => {
    await deleteChain(slug);
    load();
  };

  const inputClass = "w-full px-3 py-2.5 bg-[#09090b] border border-[#27272a] rounded-lg text-[13px] text-white placeholder-[#3f3f46] focus:outline-none focus:border-violet-500/40 focus:ring-1 focus:ring-violet-500/20 transition-all";

  const enabledCount = chains.filter(c => c.enabled).length;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3 text-[12px]">
          <span className="text-[#71717a]">{chains.length} chains</span>
          <span className="text-[#27272a]">/</span>
          <span className="text-emerald-400">{enabledCount} enabled</span>
        </div>
        <button
          onClick={() => { setShowAdd(!showAdd); setEditSlug(null); resetForm(); setShowAdd(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-white text-black text-[13px] font-medium rounded-lg hover:bg-[#e4e4e7] transition-all duration-200 shadow-sm"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Add Chain
        </button>
      </div>

      {/* Add / Edit form */}
      {(showAdd || editSlug) && (
        <div className="mb-6 border border-[#1a1a1f] rounded-xl overflow-hidden bg-[#0c0c0f] animate-fade-in">
          <div className="px-5 h-12 flex items-center border-b border-[#1a1a1f]">
            <h3 className="text-[12px] font-semibold text-[#a1a1aa]">
              {editSlug ? `Edit: ${editSlug}` : 'Add Custom Chain'}
            </h3>
          </div>
          <div className="p-5">
            <div className="grid grid-cols-2 gap-4">
              {!editSlug && (
                <div>
                  <label className="block text-[11px] font-medium text-[#71717a] mb-1">Slug</label>
                  <input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="e.g. polygon" className={inputClass} />
                </div>
              )}
              <div>
                <label className="block text-[11px] font-medium text-[#71717a] mb-1">Name</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Polygon" className={inputClass} />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-[#71717a] mb-1">RPC URL</label>
                <input value={form.rpcUrl} onChange={(e) => setForm({ ...form, rpcUrl: e.target.value })} placeholder="http://127.0.0.1:8545" className={inputClass} />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-[#71717a] mb-1">RPC Auth (optional)</label>
                <input value={form.rpcAuth} onChange={(e) => setForm({ ...form, rpcAuth: e.target.value })} placeholder="user:password" className={inputClass} />
              </div>
              {!editSlug && (
                <>
                  <div>
                    <label className="block text-[11px] font-medium text-[#71717a] mb-1">Type</label>
                    <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className={inputClass}>
                      <option value="evm">EVM</option>
                      <option value="bitcoin">Bitcoin</option>
                      <option value="solana">Solana</option>
                      <option value="cosmos">Cosmos</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-[#71717a] mb-1">Chain ID</label>
                    <input type="number" value={form.chainId} onChange={(e) => setForm({ ...form, chainId: parseInt(e.target.value) || 0 })} className={inputClass} />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-[#71717a] mb-1">Currency Symbol</label>
                    <input value={form.currencySymbol} onChange={(e) => setForm({ ...form, currencySymbol: e.target.value })} className={inputClass} />
                  </div>
                </>
              )}
              <div className="flex items-end gap-4">
                <label className="flex items-center gap-2 text-[12px] text-[#a1a1aa] cursor-pointer">
                  <input type="checkbox" checked={form.enabled} onChange={(e) => setForm({ ...form, enabled: e.target.checked })}
                    className="w-4 h-4 rounded border-[#27272a] bg-[#09090b] accent-violet-500" />
                  Enabled
                </label>
                <label className="flex items-center gap-2 text-[12px] text-[#a1a1aa] cursor-pointer">
                  <input type="checkbox" checked={form.cacheEnabled} onChange={(e) => setForm({ ...form, cacheEnabled: e.target.checked })}
                    className="w-4 h-4 rounded border-[#27272a] bg-[#09090b] accent-violet-500" />
                  Cache
                </label>
                {!editSlug && (
                  <label className="flex items-center gap-2 text-[12px] text-[#a1a1aa] cursor-pointer">
                    <input type="checkbox" checked={form.testnet} onChange={(e) => setForm({ ...form, testnet: e.target.checked })}
                      className="w-4 h-4 rounded border-[#27272a] bg-[#09090b] accent-violet-500" />
                    Testnet
                  </label>
                )}
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <button
                onClick={editSlug ? handleUpdate : handleAdd}
                disabled={editSlug ? false : !form.slug || !form.name || !form.rpcUrl}
                className="px-5 py-2 bg-white hover:bg-[#e4e4e7] disabled:opacity-30 text-black text-[13px] font-medium rounded-lg transition-colors"
              >
                {editSlug ? 'Save Changes' : 'Add Chain'}
              </button>
              <button onClick={resetForm} className="px-5 py-2 bg-[#18181b] hover:bg-[#27272a] text-[#a1a1aa] text-[13px] font-medium rounded-lg border border-[#27272a] transition-colors">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Chains table */}
      <div className="border border-[#1a1a1f] rounded-xl overflow-hidden bg-[#0c0c0f]">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#1a1a1f] bg-[#0a0a0d]">
              <th className="px-5 py-3.5 text-left text-[11px] font-semibold text-[#52525b] uppercase tracking-wider">Chain</th>
              <th className="px-5 py-3.5 text-left text-[11px] font-semibold text-[#52525b] uppercase tracking-wider">Type</th>
              <th className="px-5 py-3.5 text-left text-[11px] font-semibold text-[#52525b] uppercase tracking-wider">Status</th>
              <th className="px-5 py-3.5 text-left text-[11px] font-semibold text-[#52525b] uppercase tracking-wider">Health</th>
              <th className="px-5 py-3.5 text-right text-[11px] font-semibold text-[#52525b] uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody>
            {chains.map((c) => {
              const healthColor = !c.health ? 'text-[#3f3f46]' :
                c.health.status === 'healthy' ? 'text-emerald-400' :
                c.health.status === 'degraded' ? 'text-amber-400' : 'text-red-400';

              return (
                <tr key={c.slug} className="border-b border-[#1a1a1f] last:border-0 table-row-hover">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <span className="text-[13px] font-semibold text-white">{c.name}</span>
                      <span className="text-[10px] text-[#3f3f46] font-mono">{c.slug}</span>
                      {c.isCustom && (
                        <span className="text-[9px] font-bold text-violet-400 bg-violet-500/10 ring-1 ring-violet-500/20 px-1.5 py-0.5 rounded">CUSTOM</span>
                      )}
                      {c.testnet && (
                        <span className="text-[9px] font-bold text-amber-400 bg-amber-500/10 ring-1 ring-amber-500/20 px-1.5 py-0.5 rounded">TESTNET</span>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="text-[11px] font-medium text-[#71717a] bg-[#111114] px-2 py-1 rounded border border-[#1a1a1f] uppercase">{c.type}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <button
                      onClick={() => handleToggle(c.slug, !c.enabled)}
                      className={`text-[11px] font-semibold px-3 py-1 rounded-full transition-all duration-200 ${
                        c.enabled
                          ? 'bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20 hover:bg-emerald-500/20'
                          : 'bg-[#18181b] text-[#52525b] ring-1 ring-[#27272a] hover:text-[#a1a1aa]'
                      }`}
                    >
                      {c.enabled ? 'Enabled' : 'Disabled'}
                    </button>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-1.5">
                      {c.health && (
                        <div className={`w-1.5 h-1.5 rounded-full ${c.health.status === 'healthy' ? 'bg-emerald-400' : c.health.status === 'degraded' ? 'bg-amber-400' : 'bg-red-400'}`} />
                      )}
                      <span className={`text-[11px] font-medium ${healthColor}`}>
                        {c.health ? `${c.health.status} (${c.health.latency_ms}ms)` : '--'}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => startEdit(c)} className="text-[11px] text-[#52525b] hover:text-white px-2 py-1 rounded hover:bg-white/[0.05] transition-all">
                        Edit
                      </button>
                      {c.isCustom && (
                        <button onClick={() => handleDelete(c.slug)} className="text-[11px] text-[#52525b] hover:text-red-400 px-2 py-1 rounded hover:bg-red-500/[0.05] transition-all">
                          Delete
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
