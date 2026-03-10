interface Props {
  label: string;
  value: string | number;
  sub?: string;
  trend?: 'up' | 'down' | 'neutral';
  icon?: React.ReactNode;
  accent?: string;
}

export default function StatCard({ label, value, sub, trend, icon, accent }: Props) {
  return (
    <div className="group relative bg-[#0c0c0f] border border-[#1a1a1f] rounded-xl p-5 hover:border-[#27272a] transition-all duration-200">
      {/* Subtle top accent line */}
      {accent && (
        <div className={`absolute top-0 left-4 right-4 h-px ${accent}`} />
      )}
      <div className="flex items-start justify-between mb-3">
        <p className="text-[11px] font-medium uppercase tracking-wider text-[#52525b]">{label}</p>
        {icon && (
          <div className="text-[#27272a] group-hover:text-[#3f3f46] transition-colors">
            {icon}
          </div>
        )}
      </div>
      <p className="text-[28px] font-bold tracking-tight text-white leading-none tabular-nums">{value}</p>
      {sub && (
        <div className="flex items-center gap-1.5 mt-2">
          {trend === 'up' && (
            <svg className="w-3.5 h-3.5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18 9 11.25l4.306 4.306a11.95 11.95 0 0 1 5.814-5.518l2.74-1.22m0 0-5.94-2.281m5.94 2.28-2.28 5.941" />
            </svg>
          )}
          {trend === 'down' && (
            <svg className="w-3.5 h-3.5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6 9 12.75l4.286-4.286a11.948 11.948 0 0 1 4.306 6.43l.776 2.898m0 0 3.182-5.511m-3.182 5.51-5.511-3.181" />
            </svg>
          )}
          <p className={`text-[12px] ${trend === 'up' ? 'text-emerald-500' : trend === 'down' ? 'text-red-500' : 'text-[#52525b]'}`}>
            {sub}
          </p>
        </div>
      )}
    </div>
  );
}
