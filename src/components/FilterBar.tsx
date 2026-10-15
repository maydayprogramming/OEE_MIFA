import type { Equipment, Filters } from '../types';
import { isoDate, addHari, cx } from '../lib/format';

interface Props {
  filters: Filters;
  onChange: (f: Filters) => void;
  units: Equipment[];
  className?: string;
}

const inputCls =
  'rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition-colors focus:border-amber-400 focus:ring-2 focus:ring-amber-100';

export default function FilterBar({ filters, onChange, units, className }: Props) {
  return (
    <div
      className={cx(
        'flex flex-wrap items-end gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm',
        className,
      )}
    >
      <label className="flex flex-col gap-1">
        <span className="text-xs font-medium text-slate-500">Dari tanggal</span>
        <input
          type="date"
          className={inputCls}
          value={filters.dari}
          onChange={(e) => onChange({ ...filters, dari: e.target.value })}
        />
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-xs font-medium text-slate-500">Sampai tanggal</span>
        <input
          type="date"
          className={inputCls}
          value={filters.sampai}
          onChange={(e) => onChange({ ...filters, sampai: e.target.value })}
        />
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-xs font-medium text-slate-500">Unit</span>
        <select
          className={cx(inputCls, 'min-w-44')}
          value={filters.unitId}
          onChange={(e) => onChange({ ...filters, unitId: e.target.value })}
        >
          <option value="semua">Semua Unit</option>
          {units.map((u) => (
            <option key={u.id} value={u.id}>
              {u.id} — {u.nama}
            </option>
          ))}
        </select>
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-xs font-medium text-slate-500">Shift</span>
        <select
          className={inputCls}
          value={filters.shift}
          onChange={(e) =>
            onChange({ ...filters, shift: Number(e.target.value) as Filters['shift'] })
          }
        >
          <option value={0}>Semua Shift</option>
          <option value={1}>Shift 1</option>
          <option value={2}>Shift 2</option>
          <option value={3}>Shift 3</option>
        </select>
      </label>
      <div className="flex gap-2">
        <button
          type="button"
          className={cx(inputCls, 'font-medium text-slate-600 hover:bg-slate-50')}
          onClick={() =>
            onChange({
              ...filters,
              dari: addHari(isoDate(new Date()), -6),
              sampai: isoDate(new Date()),
            })
          }
        >
          7 Hari
        </button>
        <button
          type="button"
          className={cx(inputCls, 'font-medium text-slate-600 hover:bg-slate-50')}
          onClick={() =>
            onChange({
              ...filters,
              dari: addHari(isoDate(new Date()), -13),
              sampai: isoDate(new Date()),
            })
          }
        >
          14 Hari
        </button>
        <button
          type="button"
          className={cx(inputCls, 'font-medium text-slate-600 hover:bg-slate-50')}
          onClick={() =>
            onChange({
              ...filters,
              dari: addHari(isoDate(new Date()), -29),
              sampai: isoDate(new Date()),
              unitId: 'semua',
              shift: 0,
            })
          }
        >
          Reset
        </button>
      </div>
    </div>
  );
}
