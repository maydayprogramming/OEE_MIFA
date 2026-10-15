import { useMemo, useState } from 'react';
import { Download, Plus, Search } from 'lucide-react';
import type { Equipment, Filters, ShiftLog } from '../types';
import FilterBar from '../components/FilterBar';
import LogForm from '../components/LogForm';
import LogTable from '../components/LogTable';
import { logMetrics, metricsOfLogs } from '../lib/transform';
import { formatNumber, formatPercent } from '../lib/format';

interface Props {
  logs: ShiftLog[];
  units: Equipment[];
  unitMap: Map<string, Equipment>;
  filters: Filters;
  onFilters: (f: Filters) => void;
  onSave: (log: ShiftLog) => void;
  onDelete: (id: string) => void;
}

function exportCsv(logs: ShiftLog[]) {
  const header = [
    'Tanggal',
    'Shift',
    'Unit',
    'Operator',
    'Waktu Rencana (mnt)',
    'Downtime Terencana (mnt)',
    'Downtime Tidak Terencana (mnt)',
    'Produksi Aktual (ton)',
    'Reject (ton)',
  ];
  const rows = logs.map((l) => [
    l.tanggal,
    l.shift,
    l.unitId,
    l.operator,
    l.plannedMinutes,
    l.dtTerencana.reduce((s, i) => s + i.menit, 0),
    l.dtTidakTerencana.reduce((s, i) => s + i.menit, 0),
    l.tonaseAktual,
    l.tonaseReject,
  ]);
  const csv = [header, ...rows]
    .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(','))
    .join('\n');
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `log-shift-oee-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function LogPage({
  logs,
  units,
  unitMap,
  filters,
  onFilters,
  onSave,
  onDelete,
}: Props) {
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<ShiftLog | undefined>(undefined);
  const [cari, setCari] = useState('');

  const terfilter = useMemo(() => {
    const q = cari.trim().toLowerCase();
    if (!q) return logs;
    return logs.filter(
      (l) =>
        l.operator.toLowerCase().includes(q) ||
        l.unitId.toLowerCase().includes(q) ||
        (unitMap.get(l.unitId)?.nama.toLowerCase().includes(q) ?? false),
    );
  }, [logs, cari, unitMap]);

  const rekap = metricsOfLogs(terfilter, unitMap);

  return (
    <div className="space-y-5">
      <FilterBar filters={filters} onChange={onFilters} units={units} />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm">
            <Search size={15} className="text-slate-400" />
            <input
              type="text"
              value={cari}
              onChange={(e) => setCari(e.target.value)}
              placeholder="Cari operator / unit..."
              className="w-48 bg-transparent text-sm outline-none placeholder:text-slate-400"
            />
          </div>
          <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm shadow-sm">
            <span className="text-slate-500">
              <b className="text-slate-800">{terfilter.length}</b> log
            </span>
            <span className="h-4 w-px bg-slate-200" />
            <span className="text-slate-500">
              Produksi <b className="text-slate-800">{formatNumber(rekap.tonaseAktual)}</b> ton
            </span>
            <span className="h-4 w-px bg-slate-200" />
            <span className="text-slate-500">
              OEE <b className="text-amber-600">{formatPercent(rekap.oee)}</b>
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => exportCsv(terfilter)}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 shadow-sm hover:bg-slate-50"
          >
            <Download size={16} /> Export CSV
          </button>
          <button
            type="button"
            onClick={() => {
              setEditing(undefined);
              setFormOpen(true);
            }}
            className="flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-amber-600"
          >
            <Plus size={16} strokeWidth={2.5} /> Tambah Log Shift
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <LogTable
          logs={terfilter}
          unitMap={unitMap}
          metricsOf={(log) => logMetrics(log, unitMap)}
          onEdit={(log) => {
            setEditing(log);
            setFormOpen(true);
          }}
          onDelete={onDelete}
        />
      </div>

      {formOpen && (
        <LogForm
          units={units.filter((u) => u.aktif)}
          initial={editing}
          onSave={(log) => {
            onSave(log);
            setFormOpen(false);
          }}
          onClose={() => setFormOpen(false)}
        />
      )}
    </div>
  );
}
