import { Pencil, Trash2 } from 'lucide-react';
import type { Equipment, ShiftLog } from '../types';
import type { OeeMetrics } from '../types';
import { cx, formatMenit, formatNumber, formatPercent, formatTanggal } from '../lib/format';
import { oeeBand } from '../lib/oee';

interface Props {
  logs: ShiftLog[];
  unitMap: Map<string, Equipment>;
  metricsOf: (log: ShiftLog) => OeeMetrics;
  onEdit: (log: ShiftLog) => void;
  onDelete: (id: string) => void;
}

const BAND_BADGE: Record<string, string> = {
  baik: 'bg-emerald-100 text-emerald-700',
  sedang: 'bg-amber-100 text-amber-700',
  kritis: 'bg-rose-100 text-rose-700',
};

export default function LogTable({ logs, unitMap, metricsOf, onEdit, onDelete }: Props) {
  return (
    <div className="overflow-x-auto scroll-thin">
      <table className="w-full min-w-[980px] text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500">
            <th className="px-4 py-3 font-semibold">Tanggal</th>
            <th className="px-4 py-3 font-semibold">Shift</th>
            <th className="px-4 py-3 font-semibold">Unit</th>
            <th className="px-4 py-3 font-semibold">Operator</th>
            <th className="px-4 py-3 text-right font-semibold">Run Time</th>
            <th className="px-4 py-3 text-right font-semibold">Downtime*</th>
            <th className="px-4 py-3 text-right font-semibold">Produksi</th>
            <th className="px-4 py-3 text-right font-semibold">A</th>
            <th className="px-4 py-3 text-right font-semibold">P</th>
            <th className="px-4 py-3 text-right font-semibold">Q</th>
            <th className="px-4 py-3 font-semibold">OEE</th>
            <th className="px-4 py-3 text-right font-semibold">Aksi</th>
          </tr>
        </thead>
        <tbody>
          {logs.length === 0 && (
            <tr>
              <td colSpan={12} className="px-4 py-10 text-center text-slate-400">
                Tidak ada log pada periode/filter ini. Tambahkan log shift baru.
              </td>
            </tr>
          )}
          {logs.map((log) => {
            const m = metricsOf(log);
            const unit = unitMap.get(log.unitId);
            const band = oeeBand(m.oee);
            return (
              <tr
                key={log.id}
                className="border-b border-slate-100 transition-colors hover:bg-slate-50"
              >
                <td className="whitespace-nowrap px-4 py-3 text-slate-700">
                  {formatTanggal(log.tanggal)}
                </td>
                <td className="px-4 py-3">
                  <span className="rounded-lg bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600">
                    Shift {log.shift}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <p className="font-semibold text-slate-800">{log.unitId}</p>
                  <p className="text-xs text-slate-500">{unit?.nama ?? '—'}</p>
                </td>
                <td className="px-4 py-3 text-slate-700">{log.operator}</td>
                <td className="px-4 py-3 text-right tabular-nums text-slate-700">
                  {formatMenit(m.runMenit)}
                </td>
                <td className="px-4 py-3 text-right tabular-nums text-slate-500">
                  {formatMenit(m.dtUnplannedMenit)}
                </td>
                <td className="px-4 py-3 text-right tabular-nums text-slate-700">
                  {formatNumber(m.tonaseAktual)} ton
                  {m.tonaseReject > 0 && (
                    <span className="block text-xs text-rose-500">
                      reject {formatNumber(m.tonaseReject)}
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-right tabular-nums text-slate-700">
                  {formatPercent(m.availability)}
                </td>
                <td className="px-4 py-3 text-right tabular-nums text-slate-700">
                  {formatPercent(m.performanceRaw)}
                </td>
                <td className="px-4 py-3 text-right tabular-nums text-slate-700">
                  {formatPercent(m.quality)}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={cx(
                      'rounded-lg px-2.5 py-1 text-xs font-bold tabular-nums',
                      BAND_BADGE[band],
                    )}
                  >
                    {formatPercent(m.oee)}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-1">
                    <button
                      type="button"
                      onClick={() => onEdit(log)}
                      className="rounded-lg p-1.5 text-slate-400 hover:bg-sky-50 hover:text-sky-600"
                      aria-label="Edit log"
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(log.id)}
                      className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                      aria-label="Hapus log"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <p className="px-4 py-2 text-xs text-slate-400">* Downtime tidak terencana</p>
    </div>
  );
}
