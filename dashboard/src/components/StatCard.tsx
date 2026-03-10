interface Props {
  label: string;
  value: string | number;
  sub?: string;
  trend?: 'up' | 'down' | 'neutral';
  icon?: React.ReactNode;
}

export default function StatCard({ label, value, sub, trend }: Props) {
  return (
    <div className="bg-[#09090b] border border-[#1a1a1f] rounded-xl p-5 hover:border-[#27272a] transition-colors">
      <p className="text-[11px] font-medium uppercase tracking-wider text-[#52525b] mb-1">{label}</p>
      <p className="text-[28px] font-semibold tracking-tight text-white leading-tight">{value}</p>
      {sub && (
        <div className="flex items-center gap-1.5 mt-1.5">
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
