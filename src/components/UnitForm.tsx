import { useState } from 'react';
import { X } from 'lucide-react';
import type { Equipment, EquipmentType } from '../types';

interface Props {
  initial?: Equipment;
  onSave: (unit: Equipment) => void;
  onClose: () => void;
}

const TIPE_LIST: EquipmentType[] = [
  'Hauling Truck',
  'Excavator',
  'Dozer',
  'Wheel Loader',
  'Crusher',
  'Drill Rig',
];

const inputCls =
  'w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition-colors focus:border-amber-400 focus:ring-2 focus:ring-amber-100';

const labelCls = 'text-xs font-medium text-slate-500';

export default function UnitForm({ initial, onSave, onClose }: Props) {
  const [id, setId] = useState(initial?.id ?? '');
  const [nama, setNama] = useState(initial?.nama ?? '');
  const [tipe, setTipe] = useState<EquipmentType>(initial?.tipe ?? 'Hauling Truck');
  const [targetRate, setTargetRate] = useState(initial?.targetRate ?? 500);
  const [kapasitas, setKapasitas] = useState(initial?.kapasitas ?? 0);
  const [aktif, setAktif] = useState(initial?.aktif ?? true);
  const [error, setError] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!id.trim()) return setError('Kode unit wajib diisi (mis. DT-07).');
    if (!nama.trim()) return setError('Nama unit wajib diisi.');
    if (targetRate <= 0) return setError('Target rate harus lebih dari 0 ton/jam.');
    onSave({
      id: id.trim().toUpperCase(),
      nama: nama.trim(),
      tipe,
      targetRate,
      kapasitas,
      aktif,
    });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
      onClick={onClose}
    >
      <form
        className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        onSubmit={handleSubmit}
      >
        <div className="mb-5 flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              {initial ? 'Edit Unit' : 'Tambah Unit'}
            </h2>
            <p className="mt-0.5 text-sm text-slate-500">
              Master data alat berat & target produksinya.
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

        <div className="grid grid-cols-2 gap-4">
          <label className="flex flex-col gap-1">
            <span className={labelCls}>Kode Unit</span>
            <input
              type="text"
              className={inputCls}
              value={id}
              placeholder="DT-07"
              disabled={Boolean(initial)}
              onChange={(e) => setId(e.target.value)}
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className={labelCls}>Tipe Alat</span>
            <select
              className={inputCls}
              value={tipe}
              onChange={(e) => setTipe(e.target.value as EquipmentType)}
            >
              {TIPE_LIST.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </label>
          <label className="col-span-2 flex flex-col gap-1">
            <span className={labelCls}>Nama / Model</span>
            <input
              type="text"
              className={inputCls}
              value={nama}
              placeholder="Dump Truck CAT 777E"
              onChange={(e) => setNama(e.target.value)}
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className={labelCls}>Target Rate (ton/jam)</span>
            <input
              type="number"
              min={1}
              className={inputCls}
              value={targetRate}
              onChange={(e) => setTargetRate(Math.max(Number(e.target.value) || 0, 0))}
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className={labelCls}>Kapasitas (ton)</span>
            <input
              type="number"
              min={0}
              className={inputCls}
              value={kapasitas}
              onChange={(e) => setKapasitas(Math.max(Number(e.target.value) || 0, 0))}
            />
          </label>
          <label className="col-span-2 flex items-center gap-2">
            <input
              type="checkbox"
              checked={aktif}
              onChange={(e) => setAktif(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-amber-500 focus:ring-amber-400"
            />
            <span className="text-sm text-slate-700">Unit aktif beroperasi</span>
          </label>
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
            {initial ? 'Simpan Perubahan' : 'Tambah Unit'}
          </button>
        </div>
      </form>
    </div>
  );
}
