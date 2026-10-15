import { Pencil, Trash2 } from 'lucide-react';
import type { Equipment, OeeMetrics } from '../types';
import { cx, formatNumber, formatPercent } from '../lib/format';
import { oeeBand } from '../lib/oee';

interface Props {
  units: Equipment[];
  oeePerUnit: Map<string, OeeMetrics>;
  onEdit: (unit: Equipment) => void;
  onDelete: (id: string) => void;
}

const BAND_TEXT: Record<string, string> = {
  baik: 'text-emerald-600',
  sedang: 'text-amber-600',
  kritis: 'text-rose-600',
};

export default function UnitTable({ units, oeePerUnit, onEdit, onDelete }: Props) {
  return (
    <div className="overflow-x-auto scroll-thin">
      <table className="w-full min-w-[860px] text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500">
            <th className="px-4 py-3 font-semibold">Kode</th>
            <th className="px-4 py-3 font-semibold">Nama / Model</th>
            <th className="px-4 py-3 font-semibold">Tipe</th>
            <th className="px-4 py-3 text-right font-semibold">Target Rate</th>
            <th className="px-4 py-3 text-right font-semibold">Kapasitas</th>
            <th className="px-4 py-3 font-semibold">Status</th>
            <th className="px-4 py-3 text-right font-semibold">OEE Periode</th>
            <th className="px-4 py-3 text-right font-semibold">Aksi</th>
          </tr>
        </thead>
        <tbody>
          {units.map((u) => {
            const m = oeePerUnit.get(u.id);
            const band = m ? oeeBand(m.oee) : null;
            return (
              <tr
                key={u.id}
                className="border-b border-slate-100 transition-colors hover:bg-slate-50"
              >
                <td className="px-4 py-3">
                  <span className="rounded-lg bg-slate-800 px-2.5 py-1 text-xs font-bold text-white">
                    {u.id}
                  </span>
                </td>
                <td className="px-4 py-3 font-medium text-slate-800">{u.nama}</td>
                <td className="px-4 py-3 text-slate-600">{u.tipe}</td>
                <td className="px-4 py-3 text-right tabular-nums text-slate-700">
                  {formatNumber(u.targetRate)} ton/jam
                </td>
                <td className="px-4 py-3 text-right tabular-nums text-slate-700">
                  {u.kapasitas > 0 ? `${formatNumber(u.kapasitas)} ton` : '—'}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={cx(
                      'rounded-full px-2.5 py-1 text-xs font-semibold',
                      u.aktif ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500',
                    )}
                  >
                    {u.aktif ? 'Aktif' : 'Nonaktif'}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  {m && band ? (
                    <span className={cx('font-bold tabular-nums', BAND_TEXT[band])}>
                      {formatPercent(m.oee)}
                    </span>
                  ) : (
                    <span className="text-slate-400">—</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-1">
                    <button
                      type="button"
                      onClick={() => onEdit(u)}
                      className="rounded-lg p-1.5 text-slate-400 hover:bg-sky-50 hover:text-sky-600"
                      aria-label="Edit unit"
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(u.id)}
                      className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                      aria-label="Hapus unit"
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
    </div>
  );
}
