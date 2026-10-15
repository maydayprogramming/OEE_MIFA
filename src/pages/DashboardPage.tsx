import {
  Activity,
  Clock,
  CloudRain,
  Gauge,
  Percent,
  Target,
  TrendingUp,
  Truck,
} from 'lucide-react';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import type { Equipment, Filters, ShiftLog } from '../types';
import FilterBar from '../components/FilterBar';
import KpiCard from '../components/KpiCard';
import OeeGauge from '../components/OeeGauge';
import TrendChart from '../components/TrendChart';
import DowntimePareto from '../components/DowntimePareto';
import UnitRanking from '../components/UnitRanking';
import {
  byUnit,
  downtimeByKategori,
  metricsOfLogs,
  rekapDowntime,
  trendByTanggal,
} from '../lib/transform';
import { formatMenit, formatNumber, formatPercent } from '../lib/format';
import { OEE_TARGET } from '../lib/oee';

interface Props {
  logs: ShiftLog[];
  units: Equipment[];
  unitMap: Map<string, Equipment>;
  filters: Filters;
  onFilters: (f: Filters) => void;
}

export default function DashboardPage({ logs, units, unitMap, filters, onFilters }: Props) {
  const metrics = metricsOfLogs(logs, unitMap);
  const trend = trendByTanggal(logs, unitMap);
  const pareto = downtimeByKategori(logs, true);
  const ranking = byUnit(logs, units, unitMap);
  const rekap = rekapDowntime(logs);

  const pieData = [
    { name: 'Downtime Terencana', value: rekap.planned, color: '#10b981' },
    { name: 'Downtime Tidak Terencana', value: rekap.unplanned, color: '#f43f5e' },
  ];

  return (
    <div className="space-y-5">
      <FilterBar filters={filters} onChange={onFilters} units={units} />

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
        <KpiCard
          label="OEE Rata-rata"
          value={formatPercent(metrics.oee)}
          sub={`Target ${formatPercent(OEE_TARGET, 0)}`}
          icon={Gauge}
          tone={metrics.oee >= OEE_TARGET ? 'baik' : metrics.oee >= 0.7 ? 'sedang' : 'kritis'}
        />
        <KpiCard
          label="Availability"
          value={formatPercent(metrics.availability)}
          sub={`Run time ${formatMenit(metrics.runMenit)}`}
          icon={Clock}
          tone="biru"
        />
        <KpiCard
          label="Performance"
          value={formatPercent(metrics.performanceRaw)}
          sub={`Ekspektasi ${formatNumber(metrics.expectedTon)} ton`}
          icon={TrendingUp}
          tone="sedang"
        />
        <KpiCard
          label="Quality"
          value={formatPercent(metrics.quality)}
          sub={`Reject ${formatNumber(metrics.tonaseReject)} ton`}
          icon={Percent}
          tone="baik"
        />
        <KpiCard
          label="Total Produksi"
          value={`${formatNumber(metrics.tonaseAktual)} ton`}
          sub={`${logs.length} log shift`}
          icon={Target}
          tone="netral"
        />
        <KpiCard
          label="Downtime Tidak Terencana"
          value={formatMenit(metrics.dtUnplannedMenit)}
          sub={`${rekap.frekuensi} kejadian`}
          icon={CloudRain}
          tone="kritis"
        />
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-700">Nilai OEE Periode Ini</h3>
          <div className="mt-4">
            <OeeGauge value={metrics.oee} caption={`${logs.length} log shift terhitung`} />
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-700">
              Tren OEE Harian (A × P × Q)
            </h3>
            <span className="flex items-center gap-1.5 text-xs text-slate-400">
              <Activity size={13} /> {trend.length} hari
            </span>
          </div>
          <div className="mt-2">
            <TrendChart data={trend} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2">
          <h3 className="text-sm font-semibold text-slate-700">
            Pareto Downtime Tidak Terencana (Pareto Analysis)
          </h3>
          <p className="mt-0.5 text-xs text-slate-400">
            Urutan penyebab downtime terbesar — fokus perbaikan pada batang di kiri.
          </p>
          <div className="mt-2">
            <DowntimePareto data={pareto} />
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-700">Komposisi Downtime</h3>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={3}
                >
                  {pieData.map((d) => (
                    <Cell key={d.name} fill={d.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => formatMenit(Number(value))}
                  contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 space-y-2">
            {pieData.map((d) => (
              <div key={d.name} className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-slate-600">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: d.color }} />
                  {d.name}
                </span>
                <span className="font-semibold tabular-nums text-slate-800">
                  {formatMenit(d.value)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <h3 className="text-sm font-semibold text-slate-700">Peringkat OEE per Unit</h3>
          <span className="flex items-center gap-1.5 text-xs text-slate-400">
            <Truck size={13} /> {ranking.length} unit
          </span>
        </div>
        <UnitRanking rows={ranking} />
      </div>
    </div>
  );
}
