import type { Role } from '../lib/api';

interface Props {
  onLogin: (secret: string, role: Role) => void;
}

export default function Login({ onLogin }: Props) {
  const handleSelect = (role: Role) => {
    const secret = role === 'operator' ? 'operator-secret' : 'change-me-in-production';
    onLogin(secret, role);
  };

  return (
    <div className="min-h-screen bg-[#09090b] flex items-center justify-center relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 dot-pattern opacity-50" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-violet-500/[0.04] rounded-full blur-[120px]" />
      <div className="absolute top-1/4 right-1/4 w-[300px] h-[300px] bg-fuchsia-500/[0.03] rounded-full blur-[100px]" />

      <div className="w-full max-w-lg px-4 relative z-10">
        {/* Logo */}
        <div className="flex flex-col items-center mb-12 animate-fade-in">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center shadow-2xl shadow-violet-500/20 mb-5 ring-1 ring-white/10">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="m3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">CNode Gateway</h1>
          <p className="text-sm text-[#71717a] mt-2">Select your role to continue</p>
        </div>

        {/* Role cards */}
        <div className="grid grid-cols-2 gap-5 animate-fade-in-up">
          <button
            onClick={() => handleSelect('consumer')}
            className="group relative rounded-2xl p-6 text-left transition-all duration-300 border border-[#1f1f23] hover:border-emerald-500/30 bg-[#111114] hover:bg-[#111114] hover:shadow-xl hover:shadow-emerald-500/[0.05] hover:-translate-y-0.5"
          >
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-emerald-500/[0.05] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-5 group-hover:bg-emerald-500/15 transition-colors">
                <svg className="w-5.5 h-5.5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 0 1 3 3m3 0a6 6 0 0 1-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1 1 21.75 8.25Z" />
                </svg>
              </div>
              <h3 className="text-[15px] font-semibold text-white mb-1.5">Consumer</h3>
              <p className="text-[12px] text-[#52525b] leading-relaxed group-hover:text-[#71717a] transition-colors">
                API keys, workspaces, quotas & usage analytics
              </p>
            </div>
          </button>

          <button
            onClick={() => handleSelect('operator')}
            className="group relative rounded-2xl p-6 text-left transition-all duration-300 border border-[#1f1f23] hover:border-violet-500/30 bg-[#111114] hover:bg-[#111114] hover:shadow-xl hover:shadow-violet-500/[0.05] hover:-translate-y-0.5"
          >
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-violet-500/[0.05] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative">
              <div className="w-12 h-12 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mb-5 group-hover:bg-violet-500/15 transition-colors">
                <svg className="w-5.5 h-5.5 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                </svg>
              </div>
              <h3 className="text-[15px] font-semibold text-white mb-1.5">Operator</h3>
              <p className="text-[12px] text-[#52525b] leading-relaxed group-hover:text-[#71717a] transition-colors">
                Node health, chain management, logs & system
              </p>
            </div>
          </button>
        </div>

        {/* Footer */}
        <p className="text-center text-[11px] text-[#27272a] mt-10 animate-fade-in">
          Blockchain RPC Gateway
        </p>
      </div>
    </div>
  );
}
