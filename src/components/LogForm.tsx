import { useState } from 'react';
import { Plus, Trash2, X } from 'lucide-react';
import type { DowntimeItem, Equipment, ShiftLog } from '../types';
import { DT_TERENCANA, DT_TIDAK_TERENCANA } from '../data/categories';
import { computeLogMetrics } from '../lib/oee';
import { cx, formatMenit, formatPercent, isoDate } from '../lib/format';

interface Props {
  units: Equipment[];
  initial?: ShiftLog;
  onSave: (log: ShiftLog) => void;
  onClose: () => void;
}

const inputCls =
  'w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition-colors focus:border-amber-400 focus:ring-2 focus:ring-amber-100';

const labelCls = 'text-xs font-medium text-slate-500';

function DowntimeEditor({
  judul,
  items,
  kategoriList,
  onChange,
}: {
  judul: string;
  items: DowntimeItem[];
  kategoriList: readonly string[];
  onChange: (items: DowntimeItem[]) => void;
}) {
  return (
    <div className="rounded-xl border border-slate-200 p-3">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-sm font-semibold text-slate-700">{judul}</p>
        <button
          type="button"
          className="flex items-center gap-1 rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-200"
          onClick={() =>
            onChange([...items, { kategori: kategoriList[0], menit: 0 }])
          }
        >
          <Plus size={12} strokeWidth={2.5} /> Tambah
        </button>
      </div>
      <div className="space-y-2">
        {items.length === 0 && (
          <p className="text-xs text-slate-400">Belum ada downtime.</p>
        )}
        {items.map((item, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <select
              className={inputCls}
              value={item.kategori}
              onChange={(e) => {
                const next = [...items];
                next[idx] = { ...item, kategori: e.target.value };
                onChange(next);
              }}
            >
              {kategoriList.map((k) => (
                <option key={k} value={k}>
                  {k}
                </option>
              ))}
            </select>
            <input
              type="number"
              min={0}
              className={cx(inputCls, 'w-24 text-right')}
              value={item.menit}
              onChange={(e) => {
                const next = [...items];
                next[idx] = { ...item, menit: Math.max(Number(e.target.value) || 0, 0) };
                onChange(next);
              }}
            />
            <span className="w-8 text-xs text-slate-400">mnt</span>
            <button
              type="button"
              className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
              onClick={() => onChange(items.filter((_, i) => i !== idx))}
              aria-label="Hapus downtime"
            >
              <Trash2 size={15} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function LogForm({ units, initial, onSave, onClose }: Props) {
  const [tanggal, setTanggal] = useState(initial?.tanggal ?? isoDate(new Date()));
  const [shift, setShift] = useState<1 | 2 | 3>(initial?.shift ?? 1);
  const [unitId, setUnitId] = useState(initial?.unitId ?? units[0]?.id ?? '');
  const [operator, setOperator] = useState(initial?.operator ?? '');
  const [plannedMinutes, setPlannedMinutes] = useState(initial?.plannedMinutes ?? 450);
  const [dtTerencana, setDtTerencana] = useState<DowntimeItem[]>(
    initial?.dtTerencana ?? [
      { kategori: 'Istirahat & Sholat', menit: 30 },
      { kategori: 'Briefing / Safety Talk', menit: 15 },
    ],
  );
  const [dtTidakTerencana, setDtTidakTerencana] = useState<DowntimeItem[]>(
    initial?.dtTidakTerencana ?? [],
  );
  const [tonaseAktual, setTonaseAktual] = useState(initial?.tonaseAktual ?? 0);
  const [tonaseReject, setTonaseReject] = useState(initial?.tonaseReject ?? 0);
  const [error, setError] = useState('');

  const unit = units.find((u) => u.id === unitId);
  const draft: ShiftLog = {
    id: initial?.id ?? '',
    tanggal,
    shift,
    unitId,
    operator: operator.trim(),
    plannedMinutes,
    dtTerencana,
    dtTidakTerencana,
    tonaseAktual,
    tonaseReject,
  };
  const preview = computeLogMetrics(draft, unit?.targetRate ?? 0);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!unitId) return setError('Unit wajib dipilih.');
    if (!operator.trim()) return setError('Nama operator wajib diisi.');
    if (plannedMinutes <= 0) return setError('Waktu rencana harus lebih dari 0 menit.');
    if (preview.loadingMenit <= 0)
      return setError('Downtime terencana melebihi waktu rencana produksi.');
    onSave({
      ...draft,
      id: initial?.id ?? crypto.randomUUID(),
    });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
      onClick={onClose}
    >
      <form
        className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl scroll-thin"
        onClick={(e) => e.stopPropagation()}
        onSubmit={handleSubmit}
      >
        <div className="mb-5 flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              {initial ? 'Edit Log Shift' : 'Tambah Log Shift'}
            </h2>
            <p className="mt-0.5 text-sm text-slate-500">
              Catat waktu kerja, downtime, dan produksi unit per shift.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            aria-label="Tutup"
          >
            <X size={20} />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <label className="flex flex-col gap-1">
            <span className={labelCls}>Tanggal</span>
            <input
              type="date"
              className={inputCls}
              value={tanggal}
              onChange={(e) => setTanggal(e.target.value)}
              required
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className={labelCls}>Shift</span>
            <select
              className={inputCls}
              value={shift}
              onChange={(e) => setShift(Number(e.target.value) as 1 | 2 | 3)}
            >
              <option value={1}>Shift 1 (06:00–14:00)</option>
              <option value={2}>Shift 2 (14:00–22:00)</option>
              <option value={3}>Shift 3 (22:00–06:00)</option>
            </select>
          </label>
          <label className="flex flex-col gap-1">
            <span className={labelCls}>Unit</span>
            <select
              className={inputCls}
              value={unitId}
              onChange={(e) => setUnitId(e.target.value)}
            >
              {units.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.id} — {u.nama}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1">
            <span className={labelCls}>Operator</span>
            <input
              type="text"
              className={inputCls}
              value={operator}
              placeholder="Nama operator"
              onChange={(e) => setOperator(e.target.value)}
            />
          </label>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
          <label className="flex flex-col gap-1">
            <span className={labelCls}>Waktu Rencana Produksi (menit)</span>
            <input
              type="number"
              min={1}
              className={inputCls}
              value={plannedMinutes}
              onChange={(e) => setPlannedMinutes(Math.max(Number(e.target.value) || 0, 0))}
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className={labelCls}>Produksi Aktual (ton)</span>
            <input
              type="number"
              min={0}
              className={inputCls}
              value={tonaseAktual}
              onChange={(e) => setTonaseAktual(Math.max(Number(e.target.value) || 0, 0))}
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className={labelCls}>Material Reject (ton)</span>
            <input
              type="number"
              min={0}
              className={inputCls}
              value={tonaseReject}
              onChange={(e) => setTonaseReject(Math.max(Number(e.target.value) || 0, 0))}
            />
          </label>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          <DowntimeEditor
            judul="Downtime Terencana"
            items={dtTerencana}
            kategoriList={DT_TERENCANA}
            onChange={setDtTerencana}
          />
          <DowntimeEditor
            judul="Downtime Tidak Terencana"
            items={dtTidakTerencana}
            kategoriList={DT_TIDAK_TERENCANA}
            onChange={setDtTidakTerencana}
          />
        </div>

        {/* Preview perhitungan live */}
        <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">
            Pratinjau Perhitungan OEE
          </p>
          <div className="mt-3 grid grid-cols-3 gap-3 md:grid-cols-6">
            {[
              ['Loading', formatMenit(preview.loadingMenit)],
              ['Run Time', formatMenit(preview.runMenit)],
              ['Availability', formatPercent(preview.availability)],
              ['Performance', formatPercent(preview.performanceRaw)],
              ['Quality', formatPercent(preview.quality)],
              ['OEE', formatPercent(preview.oee)],
            ].map(([label, value], i) => (
              <div key={label} className="rounded-xl bg-white/80 px-3 py-2 text-center">
                <p className="text-[10px] font-medium uppercase text-slate-500">{label}</p>
                <p
                  className={cx(
                    'mt-0.5 text-sm font-bold tabular-nums',
                    i === 5 ? 'text-amber-700' : 'text-slate-800',
                  )}
                >
                  {value}
                </p>
              </div>
            ))}
          </div>
          {unit && (
            <p className="mt-2 text-xs text-amber-700">
              Target rate {unit.id}: {unit.targetRate.toLocaleString('id-ID')} ton/jam —
              ekspektasi {Math.round(preview.expectedTon).toLocaleString('id-ID')} ton pada run
              time.
            </p>
          )}
        </div>

        {error && (
          <p className="mt-3 rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-600">{error}</p>
        )}

        <div className="mt-5 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
          >
            Batal
          </button>
          <button
            type="submit"
            className="rounded-xl bg-amber-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-amber-600"
          >
            {initial ? 'Simpan Perubahan' : 'Simpan Log'}
          </button>
        </div>
      </form>
    </div>
  );
}
