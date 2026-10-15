import { cx, formatPercent } from '../lib/format';
import { oeeBand, OEE_TARGET } from '../lib/oee';

interface Props {
  value: number; // 0..1
  size?: number;
  caption?: string;
}

const WARNA: Record<string, string> = {
  baik: '#059669',
  sedang: '#d97706',
  kritis: '#e11d48',
};

const LABEL_BAND: Record<string, string> = {
  baik: 'Sangat Baik (≥ 85%)',
  sedang: 'Perlu Perbaikan (70–85%)',
  kritis: 'Kritis (< 70%)',
};

export default function OeeGauge({ value, size = 220, caption }: Props) {
  const clamped = Math.min(Math.max(value, 0), 1);
  const band = oeeBand(clamped);
  const warna = WARNA[band];

  const r = 78;
  const stroke = 22;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - clamped);

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox="0 0 200 200" className="-rotate-90">
          <circle
            cx="100"
            cy="100"
            r={r}
            fill="none"
            stroke="#e2e8f0"
            strokeWidth={stroke}
          />
          <circle
            cx="100"
            cy="100"
            r={r}
            fill="none"
            stroke={warna}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={c}
            strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 0.6s ease' }}
          />
          {/* penanda target 85% */}
          <circle
            cx="100"
            cy="100"
            r={r}
            fill="none"
            stroke="#0f172a"
            strokeWidth={stroke + 6}
            strokeDasharray={`2 ${c}`}
            strokeDashoffset={c * (1 - OEE_TARGET)}
            strokeLinecap="butt"
            opacity="0.85"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            OEE
          </span>
          <span
            className="text-4xl font-extrabold tabular-nums"
            style={{ color: warna }}
          >
            {formatPercent(clamped, 1)}
          </span>
          {caption && (
            <span className="mt-1 text-xs text-slate-500">{caption}</span>
          )}
        </div>
      </div>
      <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
        <span
          className={cx(
            'rounded-full px-3 py-1 text-xs font-semibold',
            band === 'baik' && 'bg-emerald-100 text-emerald-700',
            band === 'sedang' && 'bg-amber-100 text-amber-700',
            band === 'kritis' && 'bg-rose-100 text-rose-700',
          )}
        >
          {LABEL_BAND[band]}
        </span>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
          Target {formatPercent(OEE_TARGET, 0)}
        </span>
      </div>
    </div>
  );
}
