import {
  Bar,
  CartesianGrid,
  Cell,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { WARNA_KATEGORI } from '../data/categories';
import { formatMenit, formatNumber, formatPercent } from '../lib/format';

interface Props {
  data: Array<{ kategori: string; menit: number }>;
  tinggi?: string;
}

export default function DowntimePareto({ data, tinggi = 'h-72' }: Props) {
  const total = data.reduce((s, d) => s + d.menit, 0);
  let kumulatif = 0;
  const chartData = data.map((d) => {
    kumulatif += d.menit;
    return {
      ...d,
      kumulatif: total > 0 ? (kumulatif / total) * 100 : 0,
    };
  });

  return (
    <div className={tinggi + ' w-full'}>
      {chartData.length === 0 ? (
        <p className="pt-16 text-center text-sm text-slate-400">
          Tidak ada downtime pada periode ini
        </p>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 8, right: 8, left: -8, bottom: 40 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis
              dataKey="kategori"
              angle={-35}
              textAnchor="end"
              interval={0}
              tick={{ fontSize: 10, fill: '#64748b' }}
              tickLine={false}
              axisLine={{ stroke: '#cbd5e1' }}
              height={60}
            />
            <YAxis
              yAxisId="menit"
              tickFormatter={(v: number) => formatNumber(v)}
              tick={{ fontSize: 11, fill: '#64748b' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              yAxisId="pct"
              orientation="right"
              domain={[0, 100]}
              tickFormatter={(v: number) => `${v}%`}
              tick={{ fontSize: 11, fill: '#94a3b8' }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              formatter={(value, name) =>
                name === 'Kumulatif'
                  ? formatPercent(Number(value) / 100)
                  : formatMenit(Number(value))
              }
              contentStyle={{
                borderRadius: 12,
                border: '1px solid #e2e8f0',
                fontSize: 12,
              }}
            />
            <Bar yAxisId="menit" dataKey="menit" name="Durasi" barSize={38} radius={[6, 6, 0, 0]}>
              {chartData.map((d) => (
                <Cell key={d.kategori} fill={WARNA_KATEGORI[d.kategori] ?? '#64748b'} />
              ))}
            </Bar>
            <Line
              yAxisId="pct"
              type="monotone"
              dataKey="kumulatif"
              name="Kumulatif"
              stroke="#0f172a"
              strokeWidth={2}
              dot={{ r: 2.5, fill: '#0f172a' }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
