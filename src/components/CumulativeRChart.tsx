import React, { useMemo, useState } from 'react';
import { TradeLogEntry } from '../types';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
} from 'recharts';
import { TrendingUp, ShieldAlert, Award, Activity, BarChart2 } from 'lucide-react';

interface Props {
  logs: TradeLogEntry[];
}

interface ChartPoint {
  index: number;
  id: string;
  label: string;
  fullDate: string;
  timeNY: string;
  side: string;
  result: string;
  tradeR: number;
  cumulativeR: number;
  peakR: number;
  drawdownR: number;
  notes: string;
}

export const CumulativeRChart: React.FC<Props> = ({ logs }) => {
  const [chartType, setChartType] = useState<'area' | 'line'>('area');

  const { chartData, metrics } = useMemo(() => {
    if (!logs || logs.length === 0) {
      return {
        chartData: [],
        metrics: {
          currentR: 0,
          peakR: 0,
          maxDrawdown: 0,
          profitFactor: '0.0',
          winRate: 0,
          winCount: 0,
          lossCount: 0,
          missedCount: 0,
          totalResolved: 0,
        },
      };
    }

    // Sort chronologically (oldest first)
    const sorted = [...logs].sort((a, b) => {
      const dateA = new Date(`${a.date}T${a.timeNY || '00:00'}`).getTime();
      const dateB = new Date(`${b.date}T${b.timeNY || '00:00'}`).getTime();
      return dateA - dateB;
    });

    let runningR = 0;
    let peak = 0;
    let maxDd = 0;
    let grossWinsR = 0;
    let grossLossesR = 0;
    let winCount = 0;
    let lossCount = 0;
    let missedCount = 0;

    // Baseline point
    const points: ChartPoint[] = [
      {
        index: 0,
        id: 'start',
        label: 'Start',
        fullDate: sorted[0]?.date || 'Biloow',
        timeNY: '',
        side: '-',
        result: 'BASE',
        tradeR: 0,
        cumulativeR: 0,
        peakR: 0,
        drawdownR: 0,
        notes: 'Barta bilowga akoonka (Baseline: 0.0R)',
      },
    ];

    sorted.forEach((trade, idx) => {
      let deltaR = 0;
      if (trade.result === 'WIN') {
        deltaR = trade.rMultiple || 3.0;
        grossWinsR += deltaR;
        winCount++;
      } else if (trade.result === 'LOSS') {
        deltaR = -1.0; // Strictly 1R risk
        grossLossesR += 1.0;
        lossCount++;
      } else if (trade.result === 'INVALIDATION') {
        deltaR = -1.0;
        grossLossesR += 1.0;
        lossCount++;
      } else if (trade.result === 'MISSED') {
        deltaR = 0.0;
        missedCount++;
      }

      runningR = parseFloat((runningR + deltaR).toFixed(2));
      if (runningR > peak) {
        peak = runningR;
      }
      const currentDd = peak - runningR;
      if (currentDd > maxDd) {
        maxDd = currentDd;
      }

      points.push({
        index: idx + 1,
        id: trade.id,
        label: `${trade.date.slice(5)}`,
        fullDate: trade.date,
        timeNY: trade.timeNY,
        side: trade.side,
        result: trade.result,
        tradeR: deltaR,
        cumulativeR: runningR,
        peakR: peak,
        drawdownR: parseFloat(currentDd.toFixed(2)),
        notes: trade.notes,
      });
    });

    const totalResolved = winCount + lossCount;
    const winRate = totalResolved > 0 ? Math.round((winCount / totalResolved) * 100) : 0;
    const profitFactor =
      grossLossesR > 0
        ? (grossWinsR / grossLossesR).toFixed(2)
        : grossWinsR > 0
        ? '∞'
        : '0.0';

    return {
      chartData: points,
      metrics: {
        currentR: runningR,
        peakR: peak,
        maxDrawdown: parseFloat(maxDd.toFixed(2)),
        profitFactor,
        winRate,
        winCount,
        lossCount,
        missedCount,
        totalResolved,
      },
    };
  }, [logs]);

  const isNetPositive = metrics.currentR >= 0;

  return (
    <div className="p-5 rounded-2xl bg-slate-900/90 border border-amber-500/30 shadow-xl space-y-4">
      {/* Header and Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded bg-amber-500/10 text-amber-400">
              <TrendingUp className="w-4 h-4" />
            </span>
            <h3 className="text-sm font-bold text-slate-100">
              Kobac Guud ee R-Multiple Waqtiga (Cumulative R-Curve)
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Muuqaal toos ah oo muujinaya joogteynta ganacsiga (Trading Consistency) iyo koboca R-Multiple ee Model#1.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
            <button
              type="button"
              onClick={() => setChartType('area')}
              className={`px-2.5 py-1 rounded font-medium transition ${
                chartType === 'area'
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Area
            </button>
            <button
              type="button"
              onClick={() => setChartType('line')}
              className={`px-2.5 py-1 rounded font-medium transition ${
                chartType === 'line'
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Line
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
        <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
          <span className="text-[10px] uppercase font-mono text-slate-400 block">
            Net Cumulative R
          </span>
          <div
            className={`text-xl font-bold font-mono ${
              isNetPositive ? 'text-amber-400' : 'text-rose-400'
            }`}
          >
            {isNetPositive ? `+${metrics.currentR.toFixed(1)}R` : `${metrics.currentR.toFixed(1)}R`}
          </div>
        </div>

        <div className="p-3 rounded-xl bg-slate-950/70 border border-emerald-500/20">
          <span className="text-[10px] uppercase font-mono text-emerald-400 block">
            Peak Equity (All-Time High)
          </span>
          <div className="text-xl font-bold font-mono text-emerald-400">
            +{metrics.peakR.toFixed(1)}R
          </div>
        </div>

        <div className="p-3 rounded-xl bg-slate-950/70 border border-rose-500/20">
          <span className="text-[10px] uppercase font-mono text-rose-400 block">
            Max Drawdown
          </span>
          <div className="text-xl font-bold font-mono text-rose-400">
            -{metrics.maxDrawdown.toFixed(1)}R
          </div>
        </div>

        <div className="p-3 rounded-xl bg-slate-950/70 border border-sky-500/20">
          <span className="text-[10px] uppercase font-mono text-sky-400 block">
            Profit Factor (R Gain/Loss)
          </span>
          <div className="text-xl font-bold font-mono text-sky-300">
            {metrics.profitFactor}
          </div>
        </div>
      </div>

      {/* Recharts Chart Viewport */}
      <div className="h-64 sm:h-72 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'area' ? (
            <AreaChart data={chartData} margin={{ top: 10, right: 15, left: -15, bottom: 0 }}>
              <defs>
                <linearGradient id="colorCumulativeR" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis
                dataKey="label"
                stroke="#64748b"
                tick={{ fill: '#94a3b8', fontSize: 11, fontFamily: 'monospace' }}
              />
              <YAxis
                stroke="#64748b"
                tick={{ fill: '#94a3b8', fontSize: 11, fontFamily: 'monospace' }}
                tickFormatter={(val) => `${val}R`}
              />
              <ReferenceLine y={0} stroke="#475569" strokeDasharray="4 4" />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="cumulativeR"
                stroke="#f59e0b"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#colorCumulativeR)"
                activeDot={{ r: 6, fill: '#fbbf24', stroke: '#78350f', strokeWidth: 2 }}
              />
            </AreaChart>
          ) : (
            <LineChart data={chartData} margin={{ top: 10, right: 15, left: -15, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis
                dataKey="label"
                stroke="#64748b"
                tick={{ fill: '#94a3b8', fontSize: 11, fontFamily: 'monospace' }}
              />
              <YAxis
                stroke="#64748b"
                tick={{ fill: '#94a3b8', fontSize: 11, fontFamily: 'monospace' }}
                tickFormatter={(val) => `${val}R`}
              />
              <ReferenceLine y={0} stroke="#475569" strokeDasharray="4 4" />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="cumulativeR"
                stroke="#f59e0b"
                strokeWidth={2.5}
                dot={{ r: 4, fill: '#f59e0b', strokeWidth: 1 }}
                activeDot={{ r: 6, fill: '#fbbf24', stroke: '#78350f', strokeWidth: 2 }}
              />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Chart Footer Tip */}
      <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-800/60 font-mono">
        <span className="flex items-center gap-1.5 text-amber-400/90">
          <Award className="w-3.5 h-3.5" />
          Model#1 Formula: Win = +3R (ama +2R), Loss = -1R (1% risk), Missed = 0R
        </span>
        <span>Dhammaan trades-ka waxaa lagu xisaabay waqtiga New York</span>
      </div>
    </div>
  );
};

// Custom interactive tooltip
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data: ChartPoint = payload[0].payload;
    if (data.result === 'BASE') {
      return (
        <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs shadow-xl space-y-1">
          <span className="font-bold text-slate-300">Barta Bilowga (Baseline)</span>
          <div className="text-amber-400 font-mono font-bold">0.0R</div>
        </div>
      );
    }

    return (
      <div className="p-3.5 rounded-xl bg-slate-950/95 border border-amber-500/30 text-xs shadow-2xl space-y-2 min-w-[210px] backdrop-blur-md">
        <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
          <span className="font-mono font-semibold text-slate-300">
            {data.fullDate} {data.timeNY ? `@ ${data.timeNY} NY` : ''}
          </span>
          <span
            className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase font-mono ${
              data.result === 'WIN'
                ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                : data.result === 'LOSS'
                ? 'bg-rose-950 text-rose-300 border border-rose-500/40'
                : 'bg-amber-950 text-amber-300 border border-amber-500/40'
            }`}
          >
            {data.result}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
          <div>
            <span className="text-slate-500 block">Dhinaca</span>
            <span className="font-semibold text-slate-200">{data.side}</span>
          </div>
          <div>
            <span className="text-slate-500 block">Trade R</span>
            <span
              className={`font-semibold ${
                data.tradeR > 0
                  ? 'text-emerald-400'
                  : data.tradeR < 0
                  ? 'text-rose-400'
                  : 'text-slate-400'
              }`}
            >
              {data.tradeR > 0 ? `+${data.tradeR}R` : `${data.tradeR}R`}
            </span>
          </div>
        </div>

        <div className="pt-1.5 border-t border-slate-800 flex items-center justify-between font-mono">
          <span className="text-slate-400 text-[11px]">Cumulative R:</span>
          <span className="text-sm font-bold text-amber-400">
            {data.cumulativeR >= 0 ? `+${data.cumulativeR}R` : `${data.cumulativeR}R`}
          </span>
        </div>

        {data.notes && (
          <p className="text-[10px] text-slate-400 line-clamp-2 italic pt-1 border-t border-slate-800/60">
            &quot;{data.notes}&quot;
          </p>
        )}
      </div>
    );
  }
  return null;
};
