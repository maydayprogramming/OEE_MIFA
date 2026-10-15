import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { TrendPoint } from '../lib/transform';
import { formatPercent, formatTanggal, formatTanggalPendek } from '../lib/format';
import { OEE_TARGET } from '../lib/oee';

interface Props {
  data: TrendPoint[];
}

export default function TrendChart({ data }: Props) {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 12, left: -12, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis
            dataKey="tanggal"
            tickFormatter={formatTanggalPendek}
            tick={{ fontSize: 11, fill: '#64748b' }}
            tickLine={false}
            axisLine={{ stroke: '#cbd5e1' }}
          />
          <YAxis
            domain={[0, 1]}
            ticks={[0, 0.25, 0.5, 0.75, 1]}
            tickFormatter={(v: number) => formatPercent(v, 0)}
            tick={{ fontSize: 11, fill: '#64748b' }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            formatter={(value, name) => [
              formatPercent(Number(value)),
              String(name),
            ]}
            labelFormatter={(label) => formatTanggal(String(label))}
            contentStyle={{
              borderRadius: 12,
              border: '1px solid #e2e8f0',
              fontSize: 12,
              boxShadow: '0 4px 12px rgba(15,23,42,0.08)',
            }}
          />
          <Legend wrapperStyle={{ fontSize: 12 }} iconType="circle" />
          <ReferenceLine
            y={OEE_TARGET}
            stroke="#059669"
            strokeDasharray="6 4"
            label={{
              value: `Target ${formatPercent(OEE_TARGET, 0)}`,
              position: 'insideTopRight',
              fontSize: 11,
              fill: '#059669',
            }}
          />
          <Line
            type="monotone"
            dataKey="oee"
            name="OEE"
            stroke="#d97706"
            strokeWidth={2.5}
            dot={{ r: 2.5 }}
            activeDot={{ r: 5 }}
          />
          <Line
            type="monotone"
            dataKey="availability"
            name="Availability"
            stroke="#0284c7"
            strokeWidth={1.8}
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="performance"
            name="Performance"
            stroke="#7c3aed"
            strokeWidth={1.8}
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="quality"
            name="Quality"
            stroke="#059669"
            strokeWidth={1.8}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
      {data.length === 0 && (
        <p className="text-center text-sm text-slate-400">Tidak ada data pada periode ini</p>
      )}
    </div>
  );
}
