import type { LucideIcon } from 'lucide-react';
import { cx } from '../lib/format';

type Tone = 'netral' | 'baik' | 'sedang' | 'kritis' | 'biru';

const TONE_ICON: Record<Tone, string> = {
  netral: 'bg-slate-100 text-slate-600',
  baik: 'bg-emerald-100 text-emerald-600',
  sedang: 'bg-amber-100 text-amber-600',
  kritis: 'bg-rose-100 text-rose-600',
  biru: 'bg-sky-100 text-sky-600',
};

interface Props {
  label: string;
  value: string;
  sub?: string;
  icon: LucideIcon;
  tone?: Tone;
}

export default function KpiCard({ label, value, sub, icon: Icon, tone = 'netral' }: Props) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
          <p className="mt-1.5 text-2xl font-bold tabular-nums text-slate-900">{value}</p>
          {sub && <p className="mt-1 text-xs text-slate-500">{sub}</p>}
        </div>
        <span className={cx('rounded-xl p-2.5', TONE_ICON[tone])}>
          <Icon size={20} strokeWidth={2} />
        </span>
      </div>
    </div>
  );
}
