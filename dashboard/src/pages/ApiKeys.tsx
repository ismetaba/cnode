import { useEffect, useState } from 'react';
import { getApiKeys, createApiKey, updateApiKey, deleteApiKey, permanentlyDeleteApiKey, getWorkspaces, getChains } from '../lib/api';
import type { ApiKey, Workspace } from '../lib/api';

export default function ApiKeysPage() {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [availableChains, setAvailableChains] = useState<string[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [rateLimit, setRateLimit] = useState(100);
  const [networks, setNetworks] = useState('*');
  const [selectedNetworks, setSelectedNetworks] = useState<Set<string>>(new Set());
  const [allNetworks, setAllNetworks] = useState(true);
  const [workspaceId, setWorkspaceId] = useState('ws_default');
  const [newKey, setNewKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const load = () => {
    getApiKeys().then((r) => setKeys(r.keys)).catch(() => {});
    getWorkspaces().then((r) => setWorkspaces(r.workspaces)).catch(() => {});
    getChains().then((r) => setAvailableChains(r.chains.map((c) => c.slug))).catch(() => {});
  };
  useEffect(() => { load(); }, []);

  const getNetworksValue = () => allNetworks ? '*' : Array.from(selectedNetworks).join(',');

  const handleCreate = async () => {
    if (!name.trim()) return;
    const nets = getNetworksValue();
    const res = await createApiKey(name.trim(), rateLimit, nets, workspaceId);
    setNewKey(res.key.key);
    resetForm();
    load();
  };

  const startEdit = (k: ApiKey) => {
    setEditId(k.id);
    setShowCreate(false);
    setName(k.name);
    setRateLimit(k.rate_limit);
    if (k.networks === '*') {
      setAllNetworks(true);
      setSelectedNetworks(new Set());
    } else {
      setAllNetworks(false);
      setSelectedNetworks(new Set(k.networks.split(',').filter(Boolean)));
    }
    setNetworks(k.networks);
  };

  const handleUpdate = async () => {
    if (!editId || !name.trim()) return;
    const nets = getNetworksValue();
    await updateApiKey(editId, name.trim(), rateLimit, nets);
    resetForm();
    load();
  };

  const resetForm = () => {
    setShowCreate(false);
    setEditId(null);
    setName('');
    setRateLimit(100);
    setNetworks('*');
    setAllNetworks(true);
    setSelectedNetworks(new Set());
    setWorkspaceId('ws_default');
  };

  const toggleNetwork = (slug: string) => {
    setSelectedNetworks((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });
  };

  const handleRevoke = async (id: string) => {
    await deleteApiKey(id);
    load();
  };

  const handlePermanentDelete = async (id: string) => {
    await permanentlyDeleteApiKey(id);
    load();
  };

  const handleCopy = () => {
    if (newKey) {
      navigator.clipboard.writeText(newKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const wsName = (wsId: string) => {
    const ws = workspaces.find((w) => w.id === wsId);
    return ws ? ws.name : wsId;
  };

  const inputClass = "w-full px-4 py-2.5 bg-[#09090b] border border-[#1f1f23] rounded-lg text-[13px] text-white placeholder-[#3f3f46] focus:outline-none focus:border-violet-500/40 focus:ring-1 focus:ring-violet-500/20 transition-all";
  const selectClass = "w-full px-4 py-2.5 bg-[#09090b] border border-[#1f1f23] rounded-lg text-[13px] text-white focus:outline-none focus:border-violet-500/40 focus:ring-1 focus:ring-violet-500/20 transition-all appearance-none";

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <p className="text-[13px] text-[#71717a]">{keys.length} API key{keys.length !== 1 ? 's' : ''}</p>
        <button
          onClick={() => { setShowCreate(!showCreate); setEditId(null); setNewKey(null); setAllNetworks(true); setSelectedNetworks(new Set()); }}
          className="flex items-center gap-2 px-4 py-2 bg-white text-black text-[13px] font-medium rounded-lg hover:bg-[#e4e4e7] transition-all duration-200 shadow-sm"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Create Key
        </button>
      </div>

      {/* New key banner */}
      {newKey && (
        <div className="mb-6 border border-emerald-500/20 rounded-xl overflow-hidden">
          <div className="px-5 h-12 flex items-center border-b border-emerald-500/20 bg-emerald-500/[0.04]">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
              </svg>
              <span className="text-[12px] font-medium text-emerald-400">Key created — copy it now, it won't be shown again</span>
            </div>
          </div>
          <div className="p-5 bg-[#09090b]">
            <div className="flex items-center gap-2">
              <code className="flex-1 text-[13px] text-emerald-300 bg-emerald-500/[0.06] px-4 py-2.5 rounded-lg font-mono select-all border border-emerald-500/10">
                {newKey}
              </code>
              <button
                onClick={handleCopy}
                className="px-4 py-2.5 bg-[#18181b] hover:bg-[#27272a] text-[#a1a1aa] text-[12px] font-medium rounded-lg transition-colors border border-[#27272a]"
              >
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create / Edit form */}
      {(showCreate || editId) && (
        <div className="mb-6 border border-[#1a1a1f] rounded-xl overflow-hidden bg-[#0c0c0f] animate-fade-in">
          <div className="px-5 h-12 flex items-center border-b border-[#1a1a1f]">
            <h3 className="text-[12px] font-semibold text-[#a1a1aa]">
              {editId ? 'Edit API Key' : 'New API Key'}
            </h3>
          </div>
          <div className="p-5">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-medium text-[#71717a] mb-1.5">Key Name</label>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. production-backend"
                    className={inputClass}
                    autoFocus
                  />
                </div>
                {!editId && (
                  <div>
                    <label className="block text-[11px] font-medium text-[#71717a] mb-1.5">Workspace</label>
                    <select
                      value={workspaceId}
                      onChange={(e) => setWorkspaceId(e.target.value)}
                      className={selectClass}
                    >
                      {workspaces.filter((w) => w.active).map((ws) => (
                        <option key={ws.id} value={ws.id}>{ws.name}</option>
                      ))}
                    </select>
                  </div>
                )}
                <div>
                  <label className="block text-[11px] font-medium text-[#71717a] mb-1.5">Rate Limit (req/s)</label>
                  <input
                    type="number"
                    value={rateLimit}
                    onChange={(e) => setRateLimit(parseInt(e.target.value) || 100)}
                    className={inputClass}
                  />
                </div>
              </div>
              {/* Network multi-select */}
              <div>
                <label className="block text-[11px] font-medium text-[#71717a] mb-1.5">Allowed Networks</label>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => { setAllNetworks(true); setSelectedNetworks(new Set()); }}
                    className={`px-3 py-1.5 text-[11px] font-medium rounded-lg border transition-all ${
                      allNetworks
                        ? 'bg-violet-500/10 text-violet-400 border-violet-500/30'
                        : 'bg-[#111114] text-[#52525b] border-[#1f1f23] hover:text-[#a1a1aa]'
                    }`}
                  >
                    All Networks
                  </button>
                  {availableChains.map((slug) => (
                    <button
                      key={slug}
                      onClick={() => {
                        setAllNetworks(false);
                        toggleNetwork(slug);
                      }}
                      className={`px-3 py-1.5 text-[11px] font-medium rounded-lg border transition-all ${
                        !allNetworks && selectedNetworks.has(slug)
                          ? 'bg-violet-500/10 text-violet-400 border-violet-500/30'
                          : 'bg-[#111114] text-[#52525b] border-[#1f1f23] hover:text-[#a1a1aa]'
                      }`}
                    >
                      {slug}
                    </button>
                  ))}
                </div>
                {!allNetworks && selectedNetworks.size === 0 && (
                  <p className="text-[10px] text-amber-400 mt-1">Select at least one network</p>
                )}
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={editId ? handleUpdate : handleCreate}
                  disabled={!name.trim() || (!allNetworks && selectedNetworks.size === 0)}
                  className="px-5 py-2 bg-white hover:bg-[#e4e4e7] disabled:opacity-30 disabled:cursor-not-allowed text-black text-[13px] font-medium rounded-lg transition-colors"
                >
                  {editId ? 'Save Changes' : 'Generate Key'}
                </button>
                <button
                  onClick={resetForm}
                  className="px-5 py-2 bg-[#18181b] hover:bg-[#27272a] text-[#a1a1aa] text-[13px] font-medium rounded-lg transition-colors border border-[#27272a]"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Keys table */}
      <div className="border border-[#1a1a1f] rounded-xl overflow-hidden bg-[#0c0c0f]">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#1a1a1f] bg-[#0a0a0d]">
              <th className="text-left px-5 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-[#52525b]">Name</th>
              <th className="text-left px-5 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-[#52525b]">Key</th>
              <th className="text-left px-5 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-[#52525b]">Workspace</th>
              <th className="text-left px-5 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-[#52525b]">Rate Limit</th>
              <th className="text-left px-5 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-[#52525b]">Networks</th>
              <th className="text-left px-5 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-[#52525b]">Status</th>
              <th className="text-right px-5 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-[#52525b]"></th>
            </tr>
          </thead>
          <tbody>
            {keys.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-5 py-16 text-center">
                  <div className="flex flex-col items-center">
                    <svg className="w-12 h-12 text-[#27272a] mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={0.75}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 0 1 3 3m3 0a6 6 0 0 1-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1 1 21.75 8.25Z" />
                    </svg>
                    <p className="text-[13px] text-[#52525b]">No API keys yet</p>
                    <p className="text-[11px] text-[#3f3f46] mt-1">Create your first key to start making requests</p>
                  </div>
                </td>
              </tr>
            ) : (
              keys.map((k) => (
                <tr key={k.id} className="border-b border-[#1a1a1f] table-row-hover">
                  <td className="px-5 py-4">
                    <span className="text-[13px] font-medium text-white">{k.name}</span>
                  </td>
                  <td className="px-5 py-4">
                    <code className="text-[12px] font-mono text-[#71717a] bg-[#18181b] px-2.5 py-1 rounded-md border border-[#27272a]">
                      {k.key}
                    </code>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-[12px] text-[#a1a1aa] bg-[#18181b] px-2 py-0.5 rounded border border-[#27272a]">
                      {wsName(k.workspace_id)}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-[13px] text-[#a1a1aa] tabular-nums">{k.rate_limit}/s</span>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-[12px] text-[#52525b] font-mono">{k.networks}</span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1.5">
                      <div className={`w-1.5 h-1.5 rounded-full ${k.active ? 'bg-emerald-400' : 'bg-red-400'}`} />
                      <span className={`text-[12px] ${k.active ? 'text-emerald-400' : 'text-red-400'}`}>
                        {k.active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-3">
                      {k.active && (
                        <button
                          onClick={() => startEdit(k)}
                          className="text-[12px] text-[#52525b] hover:text-[#a1a1aa] transition-colors"
                        >
                          Edit
                        </button>
                      )}
                      {k.active ? (
                        <button
                          onClick={() => handleRevoke(k.id)}
                          className="text-[12px] text-[#52525b] hover:text-red-400 transition-colors"
                        >
                          Revoke
                        </button>
                      ) : (
                        <button
                          onClick={() => handlePermanentDelete(k.id)}
                          className="text-[12px] text-red-500/60 hover:text-red-400 transition-colors"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
