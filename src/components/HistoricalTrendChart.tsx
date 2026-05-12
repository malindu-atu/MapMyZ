import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { useHistoricalData } from '../hooks/useZScore';
import { formatScore } from '../utils/colorLogic';

interface HistoricalTrendChartProps {
  course: string;
  district: string;
  userScore: number;
}

const CustomTooltip = ({ active, payload, label }: {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}) => {
  if (!active || !payload?.length) return null;
  const val = payload[0].value;
  return (
    <div
      className="px-3 py-2 rounded-lg text-xs font-mono"
      style={{
        background: 'rgba(10,15,30,0.95)',
        border: '1px solid rgba(0,245,255,0.3)',
        boxShadow: '0 0 12px rgba(0,245,255,0.2)',
      }}
    >
      <div className="text-slate-400">{label}</div>
      <div style={{ color: '#00f5ff' }}>Cutoff: {formatScore(val)}</div>
    </div>
  );
};

export default function HistoricalTrendChart({
  course,
  district,
  userScore,
}: HistoricalTrendChartProps) {
  const historicalData = useHistoricalData(course, district);

  const chartData = historicalData.map(d => ({
    year: d.year.toString(),
    cutoff: d.nqc ? null : d.cutoff,
    nqc: d.nqc,
  }));

  const hasAnyData = chartData.some(d => d.cutoff !== null);

  if (!hasAnyData) {
    return (
      <div className="flex items-center justify-center h-24 text-xs text-amber-500/70 font-mono">
        NQC — No Qualified Candidates across all years
      </div>
    );
  }

  const minY = Math.min(...chartData.filter(d => d.cutoff !== null).map(d => d.cutoff as number)) - 0.05;
  const maxY = Math.max(...chartData.filter(d => d.cutoff !== null).map(d => d.cutoff as number)) + 0.05;

  return (
    <div>
      <div className="text-xs text-slate-500 uppercase tracking-wider mb-2">
        Cutoff Trend (2019–2023)
      </div>
      <ResponsiveContainer width="100%" height={120}>
        <LineChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
          <CartesianGrid stroke="rgba(0,245,255,0.05)" strokeDasharray="3 3" />
          <XAxis
            dataKey="year"
            tick={{ fill: '#475569', fontSize: 10, fontFamily: 'JetBrains Mono' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            domain={[minY, maxY]}
            tick={{ fill: '#475569', fontSize: 9, fontFamily: 'JetBrains Mono' }}
            axisLine={false}
            tickLine={false}
            tickFormatter={v => v.toFixed(2)}
          />
          <Tooltip content={<CustomTooltip />} />

          {/* User score reference line */}
          <ReferenceLine
            y={userScore}
            stroke="rgba(0,245,255,0.4)"
            strokeDasharray="4 3"
            label={{
              value: 'You',
              fill: '#00f5ff',
              fontSize: 9,
              fontFamily: 'JetBrains Mono',
              position: 'right',
            }}
          />

          <Line
            type="monotone"
            dataKey="cutoff"
            stroke="#00f5ff"
            strokeWidth={2}
            dot={{
              fill: '#020617',
              stroke: '#00f5ff',
              strokeWidth: 2,
              r: 3,
            }}
            activeDot={{
              fill: '#00f5ff',
              stroke: '#ffffff',
              strokeWidth: 1.5,
              r: 5,
            }}
            connectNulls={false}
            animationDuration={600}
            animationEasing="ease-out"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
