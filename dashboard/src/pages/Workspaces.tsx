import { useEffect, useState } from 'react';
import { getWorkspaces, createWorkspace, updateWorkspace, deleteWorkspace, reactivateWorkspace, permanentlyDeleteWorkspace } from '../lib/api';
import type { Workspace } from '../lib/api';

export default function WorkspacesPage() {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [quota, setQuota] = useState(100000);

  const load = () => getWorkspaces().then((r) => setWorkspaces(r.workspaces)).catch(() => {});
  useEffect(() => { load(); }, []);

  const handleCreate = async () => {
    if (!name.trim()) return;
    await createWorkspace(name.trim(), quota);
    setName('');
    setQuota(100000);
    setShowCreate(false);
    load();
  };

  const handleUpdate = async () => {
    if (!editId || !name.trim()) return;
    await updateWorkspace(editId, name.trim(), quota);
    setEditId(null);
    setName('');
    setQuota(100000);
    load();
  };

  const handleDeactivate = async (id: string) => {
    await deleteWorkspace(id);
    load();
  };

  const handleReactivate = async (id: string) => {
    await reactivateWorkspace(id);
    load();
  };

  const handlePermanentDelete = async (id: string) => {
    await permanentlyDeleteWorkspace(id);
    load();
  };

  const startEdit = (ws: Workspace) => {
    setEditId(ws.id);
    setName(ws.name);
    setQuota(ws.monthly_quota);
    setShowCreate(false);
  };

  const cancelForm = () => {
    setShowCreate(false);
    setEditId(null);
    setName('');
    setQuota(100000);
  };

  const inputClass = "w-full px-4 py-2.5 bg-[#09090b] border border-[#1f1f23] rounded-lg text-[13px] text-white placeholder-[#3f3f46] focus:outline-none focus:border-violet-500/40 focus:ring-1 focus:ring-violet-500/20 transition-all";

  function quotaColor(used: number, limit: number) {
    const pct = (used / limit) * 100;
    if (pct >= 90) return { bar: 'bg-red-500', text: 'text-red-400', bg: 'bg-red-500/10' };
    if (pct >= 75) return { bar: 'bg-amber-500', text: 'text-amber-400', bg: 'bg-amber-500/10' };
    return { bar: 'bg-violet-500', text: 'text-violet-400', bg: 'bg-violet-500/10' };
  }

  function formatNumber(n: number) {
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
    if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
    return n.toString();
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <p className="text-[13px] text-[#71717a]">{workspaces.length} workspace{workspaces.length !== 1 ? 's' : ''}</p>
        <button
          onClick={() => { setShowCreate(!showCreate); setEditId(null); setName(''); setQuota(100000); }}
          className="flex items-center gap-2 px-4 py-2 bg-white text-black text-[13px] font-medium rounded-lg hover:bg-[#e4e4e7] transition-all duration-200 shadow-sm"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          New Workspace
        </button>
      </div>

      {/* Create / Edit form */}
      {(showCreate || editId) && (
        <div className="mb-6 border border-[#1a1a1f] rounded-xl overflow-hidden bg-[#0c0c0f] animate-fade-in">
          <div className="px-5 h-12 flex items-center border-b border-[#1a1a1f]">
            <h3 className="text-[12px] font-semibold text-[#a1a1aa]">
              {editId ? 'Edit Workspace' : 'New Workspace'}
            </h3>
          </div>
          <div className="p-5">
            <div className="space-y-4">
              <div>
                <label className="block text-[11px] font-medium text-[#71717a] mb-1.5">Workspace Name</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Production, Staging"
                  className={inputClass}
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-[#71717a] mb-1.5">Monthly Quota (requests)</label>
                <input
                  type="number"
                  value={quota}
                  onChange={(e) => setQuota(parseInt(e.target.value) || 100000)}
                  className={inputClass}
                />
                <p className="mt-1 text-[10px] text-[#3f3f46]">
                  All API keys in this workspace share this monthly request limit
                </p>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={editId ? handleUpdate : handleCreate}
                  disabled={!name.trim()}
                  className="px-5 py-2 bg-white hover:bg-[#e4e4e7] disabled:opacity-30 disabled:cursor-not-allowed text-black text-[13px] font-medium rounded-lg transition-colors"
                >
                  {editId ? 'Save Changes' : 'Create Workspace'}
                </button>
                <button
                  onClick={cancelForm}
                  className="px-5 py-2 bg-[#18181b] hover:bg-[#27272a] text-[#a1a1aa] text-[13px] font-medium rounded-lg transition-colors border border-[#27272a]"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Workspace cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 stagger-children">
        {workspaces.length === 0 ? (
          <div className="col-span-full border border-[#1a1a1f] rounded-xl px-5 py-16 text-center">
            <div className="flex flex-col items-center">
              <svg className="w-12 h-12 text-[#27272a] mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={0.75}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-8.69-6.44-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 0-2.25-2.25h-5.379a1.5 1.5 0 0 1-1.06-.44Z" />
              </svg>
              <p className="text-[13px] text-[#52525b]">No workspaces yet</p>
              <p className="text-[11px] text-[#3f3f46] mt-1">Create a workspace to organize your API keys</p>
            </div>
          </div>
        ) : (
          workspaces.map((ws) => {
            const used = ws.usage || 0;
            const limit = ws.monthly_quota;
            const pct = Math.min(100, (used / limit) * 100);
            const colors = quotaColor(used, limit);

            return (
              <div key={ws.id} className="bg-[#0c0c0f] border border-[#1a1a1f] rounded-xl overflow-hidden hover:border-[#27272a] transition-all duration-200 hover:shadow-lg hover:shadow-black/20">
                {/* Card header */}
                <div className="px-5 h-12 flex items-center justify-between border-b border-[#1a1a1f]">
                  <div className="flex items-center gap-2">
                    <div className={`w-1.5 h-1.5 rounded-full ${ws.active ? 'bg-emerald-400' : 'bg-red-400'}`} />
                    <h3 className="text-[13px] font-medium text-white truncate">{ws.name}</h3>
                  </div>
                  {ws.id === 'ws_default' && (
                    <span className="text-[10px] font-medium text-[#52525b] bg-[#18181b] px-2 py-0.5 rounded border border-[#27272a]">
                      DEFAULT
                    </span>
                  )}
                </div>

                {/* Card body */}
                <div className="p-5 space-y-4">
                  {/* Quota progress */}
                  <div>
                    <div className="flex items-baseline justify-between mb-2">
                      <span className="text-[11px] font-medium text-[#71717a]">Monthly Usage</span>
                      <span className={`text-[12px] font-mono font-medium ${colors.text}`}>
                        {formatNumber(used)} / {formatNumber(limit)}
                      </span>
                    </div>
                    <div className="h-2 bg-[#18181b] rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${colors.bar}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <div className="mt-1 text-right">
                      <span className="text-[10px] text-[#3f3f46]">{pct.toFixed(1)}%</span>
                    </div>
                  </div>

                  {/* Stats row */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-[#111114] rounded-lg px-3.5 py-2.5 border border-[#1a1a1f]">
                      <p className="text-[10px] text-[#52525b]">API Keys</p>
                      <p className="text-[15px] font-semibold text-white tabular-nums">{ws.key_count || 0}</p>
                    </div>
                    <div className="bg-[#111114] rounded-lg px-3.5 py-2.5 border border-[#1a1a1f]">
                      <p className="text-[10px] text-[#52525b]">Quota Left</p>
                      <p className="text-[15px] font-semibold text-white tabular-nums">{formatNumber(Math.max(0, limit - used))}</p>
                    </div>
                  </div>
                </div>

                {/* Card footer */}
                <div className="px-5 h-10 flex items-center justify-between border-t border-[#1a1a1f] bg-[#0a0a0d]">
                  <span className="text-[10px] text-[#3f3f46]">{ws.created_at}</span>
                  <div className="flex items-center gap-3">
                    {ws.active ? (
                      <>
                        <button
                          onClick={() => startEdit(ws)}
                          className="text-[11px] text-[#52525b] hover:text-[#a1a1aa] transition-colors"
                        >
                          Edit
                        </button>
                        {ws.id !== 'ws_default' && (
                          <button
                            onClick={() => handleDeactivate(ws.id)}
                            className="text-[11px] text-[#52525b] hover:text-red-400 transition-colors"
                          >
                            Deactivate
                          </button>
                        )}
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => handleReactivate(ws.id)}
                          className="text-[11px] text-emerald-500/60 hover:text-emerald-400 transition-colors"
                        >
                          Reactivate
                        </button>
                        <button
                          onClick={() => handlePermanentDelete(ws.id)}
                          className="text-[11px] text-red-500/60 hover:text-red-400 transition-colors"
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
