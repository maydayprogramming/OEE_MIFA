import {
  BarChart3,
  ClipboardList,
  Gauge,
  Pickaxe,
  RefreshCcw,
  Truck,
} from 'lucide-react';
import { cx } from '../lib/format';

export type Page = 'dashboard' | 'log' | 'downtime' | 'units';

const MENU: Array<{ id: Page; label: string; icon: typeof Gauge }> = [
  { id: 'dashboard', label: 'Dashboard', icon: Gauge },
  { id: 'log', label: 'Log Shift', icon: ClipboardList },
  { id: 'downtime', label: 'Analisis Downtime', icon: BarChart3 },
  { id: 'units', label: 'Master Unit', icon: Truck },
];

interface Props {
  page: Page;
  onNavigate: (p: Page) => void;
  onResetDemo: () => void;
  jumlahLog: number;
  jumlahUnit: number;
}

export default function Sidebar({
  page,
  onNavigate,
  onResetDemo,
  jumlahLog,
  jumlahUnit,
}: Props) {
  return (
    <aside className="flex w-64 shrink-0 flex-col bg-slate-900 text-slate-200">
      <div className="flex items-center gap-3 border-b border-slate-800 px-5 py-5">
        <span className="rounded-xl bg-amber-500/15 p-2.5 text-amber-400">
          <Pickaxe size={24} strokeWidth={2.2} />
        </span>
        <div>
          <p className="text-lg font-bold leading-tight text-white">OEE MIFA</p>
          <p className="text-[11px] leading-tight text-slate-400">
            Monitoring Efektivitas Alat
          </p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {MENU.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => onNavigate(id)}
            className={cx(
              'flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors',
              page === id
                ? 'bg-amber-500 text-slate-900 shadow-sm'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white',
            )}
          >
            <Icon size={18} strokeWidth={2.2} />
            {label}
          </button>
        ))}
      </nav>

      <div className="space-y-2 border-t border-slate-800 px-5 py-4">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>Unit aktif</span>
          <span className="font-semibold text-slate-200">{jumlahUnit} unit</span>
        </div>
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>Total log shift</span>
          <span className="font-semibold text-slate-200">{jumlahLog} entri</span>
        </div>
        <button
          type="button"
          onClick={onResetDemo}
          className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-700 px-3 py-2 text-xs font-medium text-slate-300 transition-colors hover:bg-slate-800 hover:text-white"
        >
          <RefreshCcw size={13} strokeWidth={2.2} />
          Reset Data Demo
        </button>
      </div>
    </aside>
  );
}
