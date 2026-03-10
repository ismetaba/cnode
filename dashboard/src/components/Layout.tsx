import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getHealth } from '../lib/api';

const navSections = [
  {
    label: 'Main',
    items: [
      {
        to: '/',
        label: 'Dashboard',
        icon: (
          <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25a2.25 2.25 0 0 1-2.25-2.25v-2.25Z" />
          </svg>
        ),
      },
      {
        to: '/workspaces',
        label: 'Workspaces',
        icon: (
          <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-8.69-6.44-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 0-2.25-2.25h-5.379a1.5 1.5 0 0 1-1.06-.44Z" />
          </svg>
        ),
      },
      {
        to: '/keys',
        label: 'API Keys',
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
    items: [
      {
        to: '/chains',
        label: 'Endpoints',
        icon: (
          <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 14.25h13.5m-13.5 0a3 3 0 0 1-3-3m3 3a3 3 0 1 0 0 6h13.5a3 3 0 1 0 0-6m-16.5-3a3 3 0 0 1 3-3h13.5a3 3 0 0 1 3 3m-19.5 0a4.5 4.5 0 0 1 .9-2.7L5.737 5.1a3.375 3.375 0 0 1 2.7-1.35h7.126c1.062 0 2.062.5 2.7 1.35l2.587 3.45a4.5 4.5 0 0 1 .9 2.7m0 0a3 3 0 0 1-3 3m0 3h.008v.008h-.008v-.008Zm0-6h.008v.008h-.008v-.008Zm-3 6h.008v.008h-.008v-.008Zm0-6h.008v.008h-.008v-.008Z" />
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
};

export default function Layout() {
  const location = useLocation();
  const [health, setHealth] = useState<{ enabledChains: number; totalChains: number } | null>(null);

  useEffect(() => {
    getHealth().then(setHealth).catch(() => {});
  }, []);

  const currentTitle = pageTitles[location.pathname] || 'Dashboard';

  return (
    <div className="min-h-screen bg-[#09090b] text-gray-100 antialiased">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-[240px] bg-[#09090b] border-r border-[#1a1a1f] flex flex-col z-20">
        {/* Logo */}
        <div className="h-16 px-6 flex items-center border-b border-[#1a1a1f]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center shadow-lg shadow-violet-500/25">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z" />
              </svg>
            </div>
            <span className="text-[15px] font-semibold text-white tracking-tight">CNode</span>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 px-3 overflow-y-auto">
          {navSections.map((section) => (
            <div key={section.label} className="mb-6">
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
                      `group flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium transition-all duration-150 ${
                        isActive
                          ? 'bg-white/[0.06] text-white'
                          : 'text-[#71717a] hover:text-[#a1a1aa] hover:bg-white/[0.03]'
                      }`
                    }
                  >
                    {item.icon}
                    {item.label}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* Bottom */}
        <div className="px-4 py-4 border-t border-[#1a1a1f]">
          <div className="flex items-center gap-3 px-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-600 to-fuchsia-500 flex items-center justify-center text-[11px] font-bold text-white">
              CN
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-medium text-[#e4e4e7] truncate">CNode Gateway</p>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <p className="text-[10px] text-[#52525b]">
                  {health ? `${health.enabledChains} endpoints active` : 'Connecting...'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="ml-[240px]">
        {/* Top bar */}
        <header className="h-16 border-b border-[#1a1a1f] flex items-center justify-between px-8 sticky top-0 bg-[#09090b]/80 backdrop-blur-xl z-10">
          <div className="flex items-center gap-3">
            <h1 className="text-[15px] font-semibold text-white">{currentTitle}</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#18181b] border border-[#27272a] text-[11px] text-[#71717a]">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              All systems operational
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="p-8">
          <div className="max-w-[1200px]">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
