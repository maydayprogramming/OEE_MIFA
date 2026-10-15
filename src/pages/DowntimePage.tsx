import { AlertTriangle, CloudRain, Timer, Wrench } from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { Equipment, Filters, ShiftLog } from '../types';
import FilterBar from '../components/FilterBar';
import KpiCard from '../components/KpiCard';
import DowntimePareto from '../components/DowntimePareto';
import {
  byShift,
  byUnit,
  downtimeByKategori,
  rekapDowntime,
} from '../lib/transform';
import { WARNA_KATEGORI } from '../data/categories';
import { formatMenit, formatNumber, formatPercent } from '../lib/format';

interface Props {
  logs: ShiftLog[];
  units: Equipment[];
  unitMap: Map<string, Equipment>;
  filters: Filters;
  onFilters: (f: Filters) => void;
}

export default function DowntimePage({ logs, units, unitMap, filters, onFilters }: Props) {
  const pareto = downtimeByKategori(logs, true);
  const rekap = rekapDowntime(logs);
  const perShift = byShift(logs, unitMap);
  const perUnit = byUnit(logs, units, unitMap)
    .map((r) => ({ unit: r.unit.id, menit: r.metrics.dtUnplannedMenit }))
    .sort((a, b) => b.menit - a.menit)
    .slice(0, 8);

  const terparah = pareto[0];
  const totalDT = rekap.unplanned + rekap.planned;
  const pctUnplanned = totalDT > 0 ? rekap.unplanned / totalDT : 0;

  return (
    <div className="space-y-5">
      <FilterBar filters={filters} onChange={onFilters} units={units} />

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <KpiCard
          label="Total Downtime Tidak Terencana"
          value={formatMenit(rekap.unplanned)}
          sub={`${rekap.frekuensi} kejadian`}
          icon={AlertTriangle}
          tone="kritis"
        />
        <KpiCard
          label="Penyebab Terbesar"
          value={terparah ? terparah.kategori : '—'}
          sub={terparah ? formatMenit(terparah.menit) : 'Tidak ada data'}
          icon={Wrench}
          tone="sedang"
        />
        <KpiCard
          label="Proporsi Tidak Terencana"
          value={formatPercent(pctUnplanned)}
          sub={`Terencana ${formatMenit(rekap.planned)}`}
          icon={Timer}
          tone="biru"
        />
        <KpiCard
          label="Downtime Karena Cuaca"
          value={formatMenit(
            logs.reduce(
              (s, l) =>
                s +
                l.dtTidakTerencana
                  .filter((d) => d.kategori === 'Hujan / Petir')
                  .reduce((x, d) => x + d.menit, 0),
              0,
            ),
          )}
          sub="Hujan / petir"
          icon={CloudRain}
          tone="netral"
        />
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-700">
          Pareto Penyebab Downtime Tidak Terencana
        </h3>
        <p className="mt-0.5 text-xs text-slate-400">
          Garis kumulatif membantu menentukan sedikit penyebab yang menyumbang mayoritas
          kehilangan waktu (prinsip 80/20).
        </p>
        <div className="mt-2">
          <DowntimePareto data={pareto} tinggi="h-80" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-700">
            Downtime Tidak Terencana per Unit (Top 8)
          </h3>
          <div className="mt-3 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={perUnit} layout="vertical" margin={{ left: 10, right: 16 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis
                  type="number"
                  tickFormatter={(v: number) => formatNumber(v)}
                  tick={{ fontSize: 11, fill: '#64748b' }}
                />
                <YAxis
                  type="category"
                  dataKey="unit"
                  width={56}
                  tick={{ fontSize: 11, fill: '#64748b' }}
                />
                <Tooltip
                  formatter={(value) => formatMenit(Number(value))}
                  contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }}
                />
                <Bar dataKey="menit" name="Menit" barSize={18} radius={[0, 6, 6, 0]}>
                  {perUnit.map((d) => (
                    <Cell key={d.unit} fill="#f43f5e" />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-700">Downtime & OEE per Shift</h3>
          <div className="mt-3 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={perShift} margin={{ left: -12, right: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="shift" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis
                  yAxisId="menit"
                  tickFormatter={(v: number) => formatNumber(v)}
                  tick={{ fontSize: 11, fill: '#64748b' }}
                />
                <YAxis
                  yAxisId="pct"
                  orientation="right"
                  domain={[0, 1]}
                  tickFormatter={(v: number) => formatPercent(Number(v), 0)}
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                />
                <Tooltip
                  formatter={(value, name) =>
                    name === 'OEE'
                      ? formatPercent(Number(value))
                      : formatMenit(Number(value))
                  }
                  contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} iconType="circle" />
                <Bar
                  yAxisId="menit"
                  dataKey="downtimeMenit"
                  name="Downtime"
                  fill="#f43f5e"
                  barSize={34}
                  radius={[6, 6, 0, 0]}
                />
                <Bar
                  yAxisId="pct"
                  dataKey="oee"
                  name="OEE"
                  fill="#d97706"
                  barSize={34}
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-5 py-4">
          <h3 className="text-sm font-semibold text-slate-700">Detail Kategori Downtime</h3>
        </div>
        <div className="overflow-x-auto scroll-thin">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500">
                <th className="px-5 py-3 font-semibold">Kategori</th>
                <th className="px-5 py-3 text-right font-semibold">Durasi</th>
                <th className="px-5 py-3 text-right font-semibold">% dari Total</th>
                <th className="px-5 py-3 text-right font-semibold">Frekuensi</th>
                <th className="px-5 py-3 text-right font-semibold">Rata-rata / Kejadian</th>
              </tr>
            </thead>
            <tbody>
              {pareto.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-slate-400">
                    Tidak ada downtime tidak terencana pada periode ini.
                  </td>
                </tr>
              )}
              {pareto.map((d) => {
                const freq = rekap.freqMap.get(d.kategori) ?? 0;
                return (
                  <tr key={d.kategori} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="px-5 py-3">
                      <span className="flex items-center gap-2.5">
                        <span
                          className="h-2.5 w-2.5 rounded-full"
                          style={{ background: WARNA_KATEGORI[d.kategori] ?? '#64748b' }}
                        />
                        <span className="font-medium text-slate-800">{d.kategori}</span>
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right tabular-nums text-slate-700">
                      {formatMenit(d.menit)}
                    </td>
                    <td className="px-5 py-3 text-right tabular-nums text-slate-700">
                      {formatPercent(rekap.unplanned > 0 ? d.menit / rekap.unplanned : 0)}
                    </td>
                    <td className="px-5 py-3 text-right tabular-nums text-slate-700">
                      {freq}×
                    </td>
                    <td className="px-5 py-3 text-right tabular-nums text-slate-500">
                      {formatMenit(freq > 0 ? d.menit / freq : 0)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
