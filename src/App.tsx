import { useEffect, useMemo, useState } from 'react';
import Sidebar, { type Page } from './components/Sidebar';
import DashboardPage from './pages/DashboardPage';
import LogPage from './pages/LogPage';
import DowntimePage from './pages/DowntimePage';
import UnitsPage from './pages/UnitsPage';
import type { Equipment, Filters, ShiftLog } from './types';
import { loadLogs, loadUnits, resetDemoData, saveLogs, saveUnits } from './lib/storage';
import { addHari, formatTanggal, isoDate } from './lib/format';

const JUDUL: Record<Page, { judul: string; sub: string }> = {
  dashboard: {
    judul: 'Dashboard OEE',
    sub: 'Ringkasan efektivitas alat berat — Availability × Performance × Quality',
  },
  log: {
    judul: 'Log Shift Produksi',
    sub: 'Input & kelola data operasional harian per unit dan shift',
  },
  downtime: {
    judul: 'Analisis Downtime',
    sub: 'Identifikasi penyebab utama kehilangan waktu operasi',
  },
  units: {
    judul: 'Master Unit',
    sub: 'Data alat berat, target rate, dan status operasional',
  },
};

function defaultFilters(): Filters {
  return {
    dari: addHari(isoDate(new Date()), -13),
    sampai: isoDate(new Date()),
    unitId: 'semua',
    shift: 0,
  };
}

function applyFilters(logs: ShiftLog[], f: Filters): ShiftLog[] {
  return logs.filter(
    (l) =>
      (!f.dari || l.tanggal >= f.dari) &&
      (!f.sampai || l.tanggal <= f.sampai) &&
      (f.unitId === 'semua' || l.unitId === f.unitId) &&
      (f.shift === 0 || l.shift === f.shift),
  );
}

export default function App() {
  const [units, setUnits] = useState<Equipment[]>(() => loadUnits());
  const [logs, setLogs] = useState<ShiftLog[]>(() => loadLogs());
  const [page, setPage] = useState<Page>('dashboard');
  const [filters, setFilters] = useState<Filters>(defaultFilters);

  useEffect(() => {
    saveUnits(units);
  }, [units]);
  useEffect(() => {
    saveLogs(logs);
  }, [logs]);

  const unitMap = useMemo(() => new Map(units.map((u) => [u.id, u])), [units]);
  const filteredLogs = useMemo(() => applyFilters(logs, filters), [logs, filters]);

  function upsertLog(log: ShiftLog) {
    setLogs((prev) => {
      const ada = prev.some((l) => l.id === log.id);
      return ada ? prev.map((l) => (l.id === log.id ? log : l)) : [log, ...prev];
    });
  }

  function deleteLog(id: string) {
    if (!window.confirm('Hapus log shift ini? Tindakan tidak dapat dibatalkan.')) return;
    setLogs((prev) => prev.filter((l) => l.id !== id));
  }

  function upsertUnit(unit: Equipment) {
    setUnits((prev) => {
      const ada = prev.some((u) => u.id === unit.id);
      return ada ? prev.map((u) => (u.id === unit.id ? unit : u)) : [...prev, unit];
    });
  }

  function deleteUnit(id: string) {
    const dipakai = logs.some((l) => l.unitId === id);
    if (dipakai) {
      window.alert(
        `Unit ${id} masih memiliki log shift terkait. Hapus lognya terlebih dahulu.`,
      );
      return;
    }
    if (!window.confirm(`Hapus unit ${id} dari master data?`)) return;
    setUnits((prev) => prev.filter((u) => u.id !== id));
  }

  function handleResetDemo() {
    if (
      !window.confirm(
        'Reset seluruh data ke data demo awal? Perubahan yang Anda buat akan hilang.',
      )
    )
      return;
    const { units: u, logs: l } = resetDemoData();
    setUnits(u);
    setLogs(l);
    setFilters(defaultFilters());
    setPage('dashboard');
  }

  return (
    <div className="flex h-full">
      <Sidebar
        page={page}
        onNavigate={setPage}
        onResetDemo={handleResetDemo}
        jumlahLog={logs.length}
        jumlahUnit={units.filter((u) => u.aktif).length}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4 lg:px-8">
          <div>
            <h1 className="text-xl font-bold text-slate-900">{JUDUL[page].judul}</h1>
            <p className="text-sm text-slate-500">{JUDUL[page].sub}</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-semibold text-slate-700">
              {formatTanggal(isoDate(new Date()))}
            </p>
            <p className="text-xs text-slate-400">Operasi Tambang Batu Bara</p>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-slate-100 scroll-thin">
          <div className="mx-auto max-w-[1440px] p-6 lg:p-8">
            {page === 'dashboard' && (
              <DashboardPage
                logs={filteredLogs}
                units={units}
                unitMap={unitMap}
                filters={filters}
                onFilters={setFilters}
              />
            )}
            {page === 'log' && (
              <LogPage
                logs={filteredLogs}
                units={units}
                unitMap={unitMap}
                filters={filters}
                onFilters={setFilters}
                onSave={upsertLog}
                onDelete={deleteLog}
              />
            )}
            {page === 'downtime' && (
              <DowntimePage
                logs={filteredLogs}
                units={units}
                unitMap={unitMap}
                filters={filters}
                onFilters={setFilters}
              />
            )}
            {page === 'units' && (
              <UnitsPage
                units={units}
                logs={filteredLogs}
                filters={filters}
                onFilters={setFilters}
                onSave={upsertUnit}
                onDelete={deleteUnit}
              />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
