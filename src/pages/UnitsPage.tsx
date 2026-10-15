import { useState } from 'react';
import { Plus, Truck } from 'lucide-react';
import type { Equipment, Filters, ShiftLog } from '../types';
import UnitForm from '../components/UnitForm';
import UnitTable from '../components/UnitTable';
import FilterBar from '../components/FilterBar';
import { byUnit } from '../lib/transform';
import { formatNumber } from '../lib/format';

interface Props {
  units: Equipment[];
  logs: ShiftLog[];
  filters: Filters;
  onFilters: (f: Filters) => void;
  onSave: (unit: Equipment) => void;
  onDelete: (id: string) => void;
}

export default function UnitsPage({
  units,
  logs,
  filters,
  onFilters,
  onSave,
  onDelete,
}: Props) {
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Equipment | undefined>(undefined);

  const unitMap = new Map(units.map((u) => [u.id, u]));
  const rows = byUnit(logs, units, unitMap);
  const oeePerUnit = new Map(rows.map((r) => [r.unit.id, r.metrics]));

  return (
    <div className="space-y-5">
      <FilterBar filters={filters} onChange={onFilters} units={units} />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm shadow-sm">
          <Truck size={16} className="text-slate-400" />
          <span className="text-slate-500">
            <b className="text-slate-800">{units.length}</b> unit terdaftar —{' '}
            <b className="text-emerald-600">{units.filter((u) => u.aktif).length}</b> aktif
          </span>
          <span className="h-4 w-px bg-slate-200" />
          <span className="text-slate-500">
            Total target rate{' '}
            <b className="text-slate-800">
              {formatNumber(units.reduce((s, u) => s + u.targetRate, 0))}
            </b>{' '}
            ton/jam
          </span>
        </div>
        <button
          type="button"
          onClick={() => {
            setEditing(undefined);
            setFormOpen(true);
          }}
          className="flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-amber-600"
        >
          <Plus size={16} strokeWidth={2.5} /> Tambah Unit
        </button>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <UnitTable
          units={units}
          oeePerUnit={oeePerUnit}
          onEdit={(u) => {
            setEditing(u);
            setFormOpen(true);
          }}
          onDelete={onDelete}
        />
      </div>

      {formOpen && (
        <UnitForm
          initial={editing}
          onSave={(u) => {
            onSave(u);
            setFormOpen(false);
          }}
          onClose={() => setFormOpen(false)}
        />
      )}
    </div>
  );
}
