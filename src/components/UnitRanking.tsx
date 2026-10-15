import type { UnitRow } from '../lib/transform';
import { cx, formatPercent, formatNumber } from '../lib/format';
import { oeeBand } from '../lib/oee';

interface Props {
  rows: UnitRow[];
}

const BAR: Record<string, string> = {
  baik: 'bg-emerald-500',
  sedang: 'bg-amber-500',
  kritis: 'bg-rose-500',
};

const TEKS: Record<string, string> = {
  baik: 'text-emerald-600',
  sedang: 'text-amber-600',
  kritis: 'text-rose-600',
};

export default function UnitRanking({ rows }: Props) {
  return (
    <div className="overflow-x-auto scroll-thin">
      <table className="w-full min-w-[720px] text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500">
            <th className="px-4 py-3 font-semibold">#</th>
            <th className="px-4 py-3 font-semibold">Unit</th>
            <th className="px-4 py-3 font-semibold">OEE</th>
            <th className="px-4 py-3 font-semibold">Availability</th>
            <th className="px-4 py-3 font-semibold">Performance</th>
            <th className="px-4 py-3 font-semibold">Quality</th>
            <th className="px-4 py-3 text-right font-semibold">Produksi</th>
            <th className="px-4 py-3 text-right font-semibold">Downtime</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 && (
            <tr>
              <td colSpan={8} className="px-4 py-10 text-center text-slate-400">
                Tidak ada data unit pada periode ini
              </td>
            </tr>
          )}
          {rows.map((row, i) => {
            const band = oeeBand(row.metrics.oee);
            return (
              <tr
                key={row.unit.id}
                className="border-b border-slate-100 transition-colors hover:bg-slate-50"
              >
                <td className="px-4 py-3 text-slate-400">{i + 1}</td>
                <td className="px-4 py-3">
                  <p className="font-semibold text-slate-800">{row.unit.id}</p>
                  <p className="text-xs text-slate-500">{row.unit.nama}</p>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-28 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className={cx('h-full rounded-full', BAR[band])}
                        style={{ width: `${Math.min(row.metrics.oee * 100, 100)}%` }}
                      />
                    </div>
                    <span className={cx('font-semibold tabular-nums', TEKS[band])}>
                      {formatPercent(row.metrics.oee)}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 tabular-nums text-slate-700">
                  {formatPercent(row.metrics.availability)}
                </td>
                <td className="px-4 py-3 tabular-nums text-slate-700">
                  {formatPercent(row.metrics.performanceRaw)}
                </td>
                <td className="px-4 py-3 tabular-nums text-slate-700">
                  {formatPercent(row.metrics.quality)}
                </td>
                <td className="px-4 py-3 text-right tabular-nums text-slate-700">
                  {formatNumber(row.metrics.tonaseAktual)} ton
                </td>
                <td className="px-4 py-3 text-right tabular-nums text-slate-500">
                  {formatNumber(Math.round(row.metrics.dtUnplannedMenit))} mnt
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
