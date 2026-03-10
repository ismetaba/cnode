import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getHealth, getRole, logout } from '../lib/api';

const allNavSections = [
  {
    label: 'Main',
    roles: ['consumer', 'operator'],
    items: [
      {
        to: '/',
        label: 'Dashboard',
        roles: ['consumer', 'operator'],
        icon: (
          <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25a2.25 2.25 0 0 1-2.25-2.25v-2.25Z" />
          </svg>
        ),
      },
      {
        to: '/workspaces',
        label: 'Workspaces',
        roles: ['consumer', 'operator'],
        icon: (
          <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-8.69-6.44-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 0-2.25-2.25h-5.379a1.5 1.5 0 0 1-1.06-.44Z" />
          </svg>
        ),
      },
      {
        to: '/keys',
        label: 'API Keys',
        roles: ['consumer', 'operator'],
        icon: (
          <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 0 1 3 3m3 0a6 6 0 0 1-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1 1 21.75 8.25Z" />
          </svg>
        ),
      },
    ],
  },
  {
    label: 'Infrastructure',
    roles: ['consumer', 'operator'],
    items: [
      {
        to: '/chains',
        label: 'Endpoints',
        roles: ['consumer', 'operator'],
        icon: (
          <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 14.25h13.5m-13.5 0a3 3 0 0 1-3-3m3 3a3 3 0 1 0 0 6h13.5a3 3 0 1 0 0-6m-16.5-3a3 3 0 0 1 3-3h13.5a3 3 0 0 1 3 3m-19.5 0a4.5 4.5 0 0 1 .9-2.7L5.737 5.1a3.375 3.375 0 0 1 2.7-1.35h7.126c1.062 0 2.062.5 2.7 1.35l2.587 3.45a4.5 4.5 0 0 1 .9 2.7m0 0a3 3 0 0 1-3 3m0 3h.008v.008h-.008v-.008Zm0-6h.008v.008h-.008v-.008Zm-3 6h.008v.008h-.008v-.008Zm0-6h.008v.008h-.008v-.008Z" />
          </svg>
        ),
      },
    ],
  },
  {
    label: 'Operations',
    roles: ['operator'],
    items: [
      {
        to: '/node-health',
        label: 'Node Health',
        roles: ['operator'],
        icon: (
          <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
          </svg>
        ),
      },
      {
        to: '/chain-management',
        label: 'Chain Mgmt',
        roles: ['operator'],
        icon: (
          <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
          </svg>
        ),
      },
      {
        to: '/logs',
        label: 'Logs',
        roles: ['operator'],
        icon: (
          <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
          </svg>
        ),
      },
      {
        to: '/system',
        label: 'System',
        roles: ['operator'],
        icon: (
          <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 3v1.5M4.5 8.25H3m18 0h-1.5M4.5 12H3m18 0h-1.5m-15 3.75H3m18 0h-1.5M8.25 19.5V21M12 3v1.5m0 15V21m3.75-18v1.5m0 15V21m-9-1.5h10.5a2.25 2.25 0 0 0 2.25-2.25V6.75a2.25 2.25 0 0 0-2.25-2.25H6.75A2.25 2.25 0 0 0 4.5 6.75v10.5a2.25 2.25 0 0 0 2.25 2.25Z" />
          </svg>
        ),
      },
    ],
  },
];

const pageTitles: Record<string, string> = {
  '/': 'Dashboard',
  '/workspaces': 'Workspaces',
  '/keys': 'API Keys',
  '/chains': 'Endpoints',
  '/node-health': 'Node Health',
  '/chain-management': 'Chain Management',
  '/logs': 'Logs',
  '/system': 'System',
};

const pageDescriptions: Record<string, string> = {
  '/': 'Gateway performance overview',
  '/workspaces': 'Organize API keys and manage monthly quotas',
  '/keys': 'Manage authentication keys for your applications',
  '/chains': 'Blockchain endpoints available on your gateway',
  '/node-health': 'Real-time health monitoring for enabled chains',
  '/chain-management': 'Manage blockchain endpoints and custom chains',
  '/logs': 'Request logs and activity monitoring',
  '/system': 'Server and process metrics',
};

export default function Layout() {
  const location = useLocation();
  const [health, setHealth] = useState<{ enabledChains: number; totalChains: number } | null>(null);
  const role = getRole();

  useEffect(() => {
    getHealth().then(setHealth).catch(() => {});
  }, []);

  const currentTitle = pageTitles[location.pathname] || 'Dashboard';
  const currentDesc = pageDescriptions[location.pathname] || '';

  const navSections = allNavSections
    .filter((s) => s.roles.includes(role || ''))
    .map((s) => ({
      ...s,
      items: s.items.filter((item) => item.roles.includes(role || '')),
    }))
    .filter((s) => s.items.length > 0);

  return (
    <div className="min-h-screen bg-[#09090b] text-gray-100 antialiased">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-[260px] bg-[#0c0c0f] border-r border-[#1a1a1f] flex flex-col z-20">
        {/* Logo */}
        <div className="h-16 px-6 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center shadow-lg shadow-violet-500/20 ring-1 ring-white/10">
            <svg className="w-4.5 h-4.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="m3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z" />
            </svg>
          </div>
          <div>
            <span className="text-[15px] font-bold text-white tracking-tight">CNode</span>
            <span className="text-[15px] font-light text-[#52525b] tracking-tight ml-1">Gateway</span>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-5 px-3 overflow-y-auto">
          {navSections.map((section, si) => (
            <div key={section.label} className={si > 0 ? 'mt-6' : ''}>
              <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-[0.15em] text-[#3f3f46]">
                {section.label}
              </p>
              <div className="space-y-0.5">
                {section.items.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.to === '/'}
                    className={({ isActive }) =>
                      `group relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all duration-200 ${
                        isActive
                          ? 'bg-white/[0.07] text-white shadow-sm'
                          : 'text-[#71717a] hover:text-[#a1a1aa] hover:bg-white/[0.03]'
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        {isActive && (
                          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-4 rounded-r-full bg-gradient-to-b from-violet-400 to-fuchsia-400" />
                        )}
                        <span className={isActive ? 'text-violet-400' : 'text-[#52525b] group-hover:text-[#71717a]'}>
                          {item.icon}
                        </span>
                        {item.label}
                      </>
                    )}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* Bottom */}
        <div className="px-4 py-4 border-t border-[#1a1a1f]">
          <div className="flex items-center gap-3 px-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600/80 to-fuchsia-500/80 flex items-center justify-center text-[11px] font-bold text-white ring-1 ring-white/10">
              CN
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-semibold text-[#e4e4e7] truncate">CNode Gateway</p>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/50" />
                <p className="text-[10px] text-[#52525b]">
                  {health ? `${health.enabledChains} endpoints active` : 'Connecting...'}
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between mt-3 px-2">
            <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-md ${
              role === 'operator'
                ? 'text-violet-300 bg-violet-500/10 ring-1 ring-violet-500/20'
                : 'text-emerald-300 bg-emerald-500/10 ring-1 ring-emerald-500/20'
            }`}>
              {role === 'operator' ? 'Operator' : 'Consumer'}
            </span>
            <button
              onClick={logout}
              className="text-[11px] text-[#52525b] hover:text-[#a1a1aa] transition-colors flex items-center gap-1.5"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
              </svg>
              Sign out
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="ml-[260px]">
        {/* Top bar */}
        <header className="h-16 border-b border-[#1a1a1f] flex items-center justify-between px-8 sticky top-0 bg-[#09090b]/80 backdrop-blur-xl z-10">
          <div>
            <h1 className="text-[16px] font-semibold text-white">{currentTitle}</h1>
            {currentDesc && (
              <p className="text-[11px] text-[#52525b] -mt-0.5">{currentDesc}</p>
            )}
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#111114] border border-[#1f1f23] text-[11px] text-[#71717a]">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/50 animate-pulse" />
              All systems operational
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="p-8 animate-fade-in">
          <div className="max-w-[1200px]">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
