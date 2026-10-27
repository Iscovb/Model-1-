import React, { useState, useEffect, useRef } from 'react';
import { BACKTEST_TRADES_MAY_JULY, BacktestTrade, ReplayCandle } from '../constants/backtestData';
import { TradeLogEntry } from '../types';
import {
  Scissors,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  RotateCcw,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  BookmarkPlus,
  Clock,
  Target,
  Shield,
  Layers,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Sparkles,
  Zap,
  Info,
} from 'lucide-react';

interface Props {
  onSendToLog: (entry: Partial<TradeLogEntry>) => void;
}

export const ChartReplayBacktester: React.FC<Props> = ({ onSendToLog }) => {
  const [selectedMonth, setSelectedMonth] = useState<'ALL' | 'MAY' | 'JUNE' | 'JULY'>('ALL');
  const [selectedTradeId, setSelectedTradeId] = useState<string>('bt-may-06');
  const [currentBarIndex, setCurrentBarIndex] = useState<number>(2); // Start at purge/cut bar
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeedMs, setPlaybackSpeedMs] = useState<number>(1200);
  const [showSmtChart, setShowSmtChart] = useState<boolean>(true);

  const activeTrade =
    BACKTEST_TRADES_MAY_JULY.find((t) => t.id === selectedTradeId) || BACKTEST_TRADES_MAY_JULY[0];

  const totalCandles = activeTrade.candles.length;

  // Filtered trades by month
  const filteredTrades =
    selectedMonth === 'ALL'
      ? BACKTEST_TRADES_MAY_JULY
      : BACKTEST_TRADES_MAY_JULY.filter((t) => t.month === selectedMonth);

  // Auto-replay timer
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentBarIndex((prev) => {
          if (prev >= totalCandles - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, playbackSpeedMs);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, totalCandles, playbackSpeedMs]);

  // When switching trade, reset to sweep bar
  const handleSelectTrade = (trade: BacktestTrade) => {
    setSelectedTradeId(trade.id);
    setIsPlaying(false);
    // Find sweep bar index or default to 2
    const sweepIdx = trade.candles.findIndex((c) => c.isSweepBar);
    setCurrentBarIndex(sweepIdx >= 0 ? sweepIdx : 2);
  };

  const handleCutToSweep = () => {
    setIsPlaying(false);
    const sweepIdx = activeTrade.candles.findIndex((c) => c.isSweepBar);
    setCurrentBarIndex(sweepIdx >= 0 ? sweepIdx : 2);
  };

  const handleStepNext = () => {
    setIsPlaying(false);
    setCurrentBarIndex((prev) => Math.min(prev + 1, totalCandles - 1));
  };

  const handleStepPrev = () => {
    setIsPlaying(false);
    setCurrentBarIndex((prev) => Math.max(prev - 1, 0));
  };

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentBarIndex(0);
  };

  const handleShowAllBars = () => {
    setIsPlaying(false);
    setCurrentBarIndex(totalCandles - 1);
  };

  const handleExportToJournal = () => {
    onSendToLog({
      date: activeTrade.date,
      timeNY: activeTrade.timeNY,
      side: activeTrade.side,
      entryPrice: activeTrade.entryPrice,
      slPrice: activeTrade.slPrice,
      tpPrice: activeTrade.tpPrice,
      rMultiple: activeTrade.rMultiple,
      result: activeTrade.result,
      itemsPassed: activeTrade.rulesPassed,
      notes: `[May-July Backtest Replay] ${activeTrade.title}. ${activeTrade.executionSummarySomali} | Xeerka la bartay: ${activeTrade.lessonSomali}`,
    });
  };

  // Performance metrics across all 9 trades
  const totalTradesCount = BACKTEST_TRADES_MAY_JULY.length;
  const winCount = BACKTEST_TRADES_MAY_JULY.filter((t) => t.result === 'WIN').length;
  const lossCount = BACKTEST_TRADES_MAY_JULY.filter((t) => t.result === 'LOSS').length;
  const missedCount = BACKTEST_TRADES_MAY_JULY.filter((t) => t.result === 'MISSED').length;
  const netR = BACKTEST_TRADES_MAY_JULY.reduce((acc, t) => acc + t.rMultiple, 0);
  const totalPips = BACKTEST_TRADES_MAY_JULY.reduce((acc, t) => acc + t.pips, 0);
  const [zoomMode, setZoomMode] = useState<'fit' | 'normal' | 'wide'>('normal');
  const winRate = Math.round((winCount / (winCount + lossCount)) * 100);

  // SVG Chart Dimensions & Math
  const visibleCandles = activeTrade.candles.slice(0, currentBarIndex + 1);
  const allCandles = activeTrade.candles;

  // Price boundaries (computed across all candles to keep scale steady during replay)
  const allPrices = [
    ...allCandles.flatMap((c) => [c.high, c.low]),
    activeTrade.entryPrice,
    activeTrade.slPrice,
    activeTrade.tpPrice,
    activeTrade.tsSweepPrice,
  ];
  const rawMin = Math.min(...allPrices);
  const rawMax = Math.max(...allPrices);
  const priceMargin = Math.max(3.0, (rawMax - rawMin) * 0.12);
  const minPrice = rawMin - priceMargin;
  const maxPrice = rawMax + priceMargin;
  const priceRange = maxPrice - minPrice || 1;

  // Calculate dynamic width based on zoomMode and candle count
  const baseWidth = zoomMode === 'wide' ? Math.max(980, totalCandles * 64) : zoomMode === 'fit' ? 820 : 890;
  const svgWidth = baseWidth;
  const svgHeight = 390;
  const chartPadding = { top: 32, right: 88, bottom: 40, left: 24 };
  const plotWidth = svgWidth - chartPadding.left - chartPadding.right;
  const plotHeight = svgHeight - chartPadding.top - chartPadding.bottom;

  const priceToY = (price: number) => {
    return chartPadding.top + plotHeight - ((price - minPrice) / priceRange) * plotHeight;
  };

  const candleSpacing = plotWidth / (totalCandles + 0.5);
  // Elegant candle width: never stretch to huge chunky blocks! Max 18px, min 8px.
  const candleWidth = Math.min(18, Math.max(8, candleSpacing * 0.55));

  const currentCandle = activeTrade.candles[currentBarIndex] || activeTrade.candles[0];
  const isCandleBullish = currentCandle.close >= currentCandle.open;
  const candlePriceChange = currentCandle.close - currentCandle.open;

  // Collision offset calculation for SL and Entry badges if too close
  const ySL = priceToY(activeTrade.slPrice);
  const yEntry = priceToY(activeTrade.entryPrice);
  const yTP = priceToY(activeTrade.tpPrice);

  let slBadgeY = ySL;
  let entryBadgeY = yEntry;
  if (Math.abs(ySL - yEntry) < 18) {
    if (ySL < yEntry) {
      slBadgeY = ySL - 6;
      entryBadgeY = yEntry + 6;
    } else {
      slBadgeY = ySL + 6;
      entryBadgeY = yEntry - 6;
    }
  }

  // Identify index of Purge Window candles (e.g. 08:00 - 10:00 NY or 02:00 - 03:00 NY)
  const isLondonTrade = activeTrade.session.includes('London');
  const purgeIndices = activeTrade.candles
    .map((c, i) => {
      const h = parseInt(c.time.split(':')[0], 10);
      const isPurge = isLondonTrade ? h === 2 : (h === 8 || h === 9);
      return isPurge ? i : -1;
    })
    .filter((i) => i >= 0);

  const purgeStartX = purgeIndices.length > 0 ? chartPadding.left + purgeIndices[0] * candleSpacing : null;
  const purgeEndX =
    purgeIndices.length > 0
      ? chartPadding.left + (purgeIndices[purgeIndices.length - 1] + 1) * candleSpacing
      : null;

  return (
    <div className="space-y-6">
      {/* Top Header & Strategy Metrics Card */}
      <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
                <Scissors className="w-5 h-5" />
              </span>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-lg font-bold text-slate-100">
                    Model#1 Gold Backtesting &amp; Chart Replay (May – July)
                  </h2>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase font-mono bg-amber-500/20 text-amber-300 border border-amber-500/40">
                    REAL-TIME REPLAY
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Shaxanka la jaray (Bar Replay) oo muujinaya Asian context, Purge hour manipulation, TS Sweep, SMT &amp; 3R delivery.
                </p>
              </div>
            </div>
          </div>

          {/* Month Selector Buttons */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-950 border border-slate-800 text-xs">
            {(['ALL', 'MAY', 'JUNE', 'JULY'] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setSelectedMonth(m)}
                className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                  selectedMonth === m
                    ? 'bg-amber-500 text-slate-950 shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {m === 'ALL' ? 'May – July (9)' : `${m}`}
              </button>
            ))}
          </div>
        </div>

        {/* 4 Performance Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-sans">
              Wadarta Setups-ka
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-xl font-bold text-slate-100">{totalTradesCount}</span>
              <span className="text-xs text-slate-500 font-sans">trades (3 bilood)</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800">
            <span className="text-[10px] text-emerald-400 uppercase tracking-wider block font-sans">
              Guulaha (Win Rate)
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-xl font-bold text-emerald-400">{winRate}%</span>
              <span className="text-xs text-slate-400 font-sans">
                ({winCount} Wins / {lossCount} Losses)
              </span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800">
            <span className="text-[10px] text-amber-400 uppercase tracking-wider block font-sans">
              Net Profit R-Multiple
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-xl font-bold text-amber-400">+{netR.toFixed(1)}R</span>
              <span className="text-xs text-slate-400 font-sans">(1% halis ah)</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800">
            <span className="text-[10px] text-sky-400 uppercase tracking-wider block font-sans">
              Wadarta Pips-ka
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-xl font-bold text-sky-400">+{totalPips}</span>
              <span className="text-xs text-slate-400 font-sans">pips Dahab ah</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Backtesting & Replay Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Trade Selector List (4 cols) */}
        <div className="lg:col-span-4 space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">
              Dooro Trade-ka Replay-ka ({filteredTrades.length})
            </span>
            <span className="text-[10px] text-slate-500 font-mono">XAUUSD</span>
          </div>

          <div className="space-y-2 max-h-[640px] overflow-y-auto pr-1 scrollbar-thin">
            {filteredTrades.map((trade) => {
              const isSelected = trade.id === activeTrade.id;
              return (
                <button
                  key={trade.id}
                  type="button"
                  onClick={() => handleSelectTrade(trade)}
                  className={`w-full text-left p-3.5 rounded-xl border transition-all ${
                    isSelected
                      ? 'bg-amber-500/15 border-amber-500/60 shadow-md shadow-amber-500/10 ring-1 ring-amber-500/30'
                      : 'bg-slate-900/70 border-slate-800/80 hover:bg-slate-800/60 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono uppercase ${
                          trade.side === 'BUY'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        }`}
                      >
                        {trade.side}
                      </span>
                      <span className="text-xs font-bold text-slate-200">{trade.date}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold font-mono ${
                          trade.result === 'WIN'
                            ? 'bg-emerald-500 text-slate-950'
                            : trade.result === 'LOSS'
                            ? 'bg-rose-500 text-white'
                            : 'bg-slate-700 text-slate-300'
                        }`}
                      >
                        {trade.result === 'WIN'
                          ? `+${trade.rMultiple}R`
                          : trade.result === 'LOSS'
                          ? `${trade.rMultiple}R`
                          : 'MISSED'}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs font-medium text-slate-300 mt-2 line-clamp-1">
                    {trade.title}
                  </p>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2 pt-2 border-t border-slate-800/60 font-mono">
                    <span className="flex items-center gap-1 text-amber-400/90">
                      <Clock className="w-3 h-3" />
                      {trade.timeNY} NY
                    </span>
                    <span>SL: ${trade.slDistance.toFixed(2)}</span>
                    <span className="text-slate-300">
                      {trade.pips > 0 ? `+${trade.pips} pips` : `${trade.pips} pips`}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Chart Replay Canvas, Visual Timeline & Analysis (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          {/* Active Trade Bar Overview */}
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-bold text-slate-100">{activeTrade.title}</span>
                <span
                  className={`px-2 py-0.5 rounded text-[11px] font-bold font-mono ${
                    activeTrade.result === 'WIN'
                      ? 'bg-emerald-500 text-slate-950'
                      : activeTrade.result === 'LOSS'
                      ? 'bg-rose-500 text-white'
                      : 'bg-amber-500 text-slate-950'
                  }`}
                >
                  {activeTrade.result === 'WIN'
                    ? `WIN (+${activeTrade.rMultiple}R / +${activeTrade.pips} pips)`
                    : activeTrade.result === 'LOSS'
                    ? `LOSS (${activeTrade.rMultiple}R / ${activeTrade.pips} pips)`
                    : 'MISSED ENTRY LINE (0R)'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 flex items-center gap-2 flex-wrap">
                <span>Taariikhda: <strong>{activeTrade.date}</strong></span>
                <span>•</span>
                <span>Waqtiga NY: <strong>{activeTrade.timeNY} NY</strong></span>
                <span>•</span>
                <span className="text-amber-400 font-mono">{activeTrade.timeEAT}</span>
              </p>
            </div>

            <button
              type="button"
              onClick={handleExportToJournal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition shadow-md shadow-amber-500/10 shrink-0"
              title="Trade-kan u wareeji Journal-ka Mode C si aad u xafidato"
            >
              <BookmarkPlus className="w-3.5 h-3.5" />
              <span>U dir Mode C Journal</span>
            </button>
          </div>

          {/* Interactive Candlestick Chart with Cut Bar Replay */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 shadow-2xl relative overflow-hidden space-y-3">
            {/* TradingView OHLC Status Bar */}
            <div className="flex flex-wrap items-center justify-between gap-2 px-1 py-1 text-xs font-mono border-b border-slate-800/60 pb-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-amber-400">XAUUSD</span>
                <span className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] text-slate-300 font-semibold">5M</span>
                <span className="text-slate-500">•</span>
                <span className="text-slate-400 text-[11px]">{activeTrade.date}</span>
                <span className="text-slate-500">•</span>
                <span className="text-slate-400">O: <strong className="text-slate-200">${currentCandle.open.toFixed(2)}</strong></span>
                <span className="text-slate-400">H: <strong className="text-slate-200">${currentCandle.high.toFixed(2)}</strong></span>
                <span className="text-slate-400">L: <strong className="text-slate-200">${currentCandle.low.toFixed(2)}</strong></span>
                <span className="text-slate-400">C: <strong className={isCandleBullish ? 'text-emerald-400' : 'text-rose-400'}>${currentCandle.close.toFixed(2)}</strong></span>
                <span className={`text-[11px] font-bold ${isCandleBullish ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {candlePriceChange >= 0 ? `+${candlePriceChange.toFixed(2)}` : candlePriceChange.toFixed(2)}
                </span>
              </div>

              {/* Zoom Controls */}
              <div className="flex items-center gap-1 bg-slate-900 p-0.5 rounded-lg border border-slate-800 text-[11px]">
                <span className="text-slate-500 px-1.5 text-[10px]">Muuqaalka:</span>
                {(['fit', 'normal', 'wide'] as const).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setZoomMode(mode)}
                    className={`px-2 py-0.5 rounded capitalize ${
                      zoomMode === mode
                        ? 'bg-amber-500 text-slate-950 font-bold'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {mode === 'fit' ? 'Dhan' : mode === 'normal' ? 'Caadi' : 'Balliaran'}
                  </button>
                ))}
              </div>
            </div>

            {/* Replay Controls Toolbar (Mobile & Desktop Friendly) */}
            <div className="space-y-2 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/80">
              {/* Row 1: Playback Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <button
                    type="button"
                    onClick={handleReset}
                    className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition"
                    title="Dib u celi (Bilowga 1-aad)"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={handleStepPrev}
                    disabled={currentBarIndex === 0}
                    className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 text-xs transition"
                    title="1 Candle dib ugu noqo"
                  >
                    <SkipBack className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsPlaying(!isPlaying)}
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition shadow ${
                      isPlaying
                        ? 'bg-rose-500 hover:bg-rose-400 text-white shadow-rose-500/20'
                        : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/20'
                    }`}
                    title={isPlaying ? 'Hakad (Pause)' : 'Daar Replay (Auto-play)'}
                  >
                    {isPlaying ? (
                      <>
                        <Pause className="w-3.5 h-3.5" />
                        <span>Jooji</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Shid Replay</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleStepNext}
                    disabled={currentBarIndex >= totalCandles - 1}
                    className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 text-xs transition"
                    title="1 Candle horay u soco (Step Forward)"
                  >
                    <SkipForward className="w-4 h-4" />
                  </button>

                  {/* Cut Tool Button */}
                  <button
                    type="button"
                    onClick={handleCutToSweep}
                    className="flex items-center gap-1 px-3 py-2 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-semibold transition"
                    title="Jar shaxanka oo dib ugu noqo xilligii Purge Sweep-ka"
                  >
                    <Scissors className="w-3.5 h-3.5 text-amber-400" />
                    <span>Jar (Sweep)</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleShowAllBars}
                    className="px-2.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono transition"
                    title="Muuji dhammaan shaxanka buuxa"
                  >
                    Full
                  </button>
                </div>

                {/* Speed & Bar Counter */}
                <div className="flex items-center gap-2 text-xs font-mono ml-auto">
                  <div className="flex items-center gap-1 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800 text-slate-300">
                    <span className="text-slate-500 text-[11px]">Candle:</span>
                    <span className="font-bold text-amber-400">
                      {currentBarIndex + 1}
                    </span>
                    <span className="text-slate-500">/</span>
                    <span className="text-slate-400">{totalCandles}</span>
                  </div>

                  <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-[11px]">
                    {[
                      { label: '1x', ms: 1400 },
                      { label: '2x', ms: 700 },
                      { label: '4x', ms: 350 },
                    ].map((s) => (
                      <button
                        key={s.label}
                        type="button"
                        onClick={() => setPlaybackSpeedMs(s.ms)}
                        className={`px-1.5 py-0.5 rounded ${
                          playbackSpeedMs === s.ms
                            ? 'bg-amber-500 text-slate-950 font-bold'
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Row 2: Interactive Timeline Scrubber Slider */}
              <div className="pt-1">
                <input
                  type="range"
                  min={0}
                  max={totalCandles - 1}
                  value={currentBarIndex}
                  onChange={(e) => {
                    setIsPlaying(false);
                    setCurrentBarIndex(Number(e.target.value));
                  }}
                  className="w-full accent-amber-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
                />
                <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono mt-1 px-1">
                  <span>Bilow (Asia/Pre-NY)</span>
                  <span className="text-amber-400/90 flex items-center gap-1">
                    <Zap className="w-2.5 h-2.5" /> Sweep &amp; Entry
                  </span>
                  <span>Dhamaad (Outcome)</span>
                </div>
              </div>
            </div>

            {/* SVG Candlestick Viewport */}
            <div className="relative w-full overflow-x-auto rounded-xl border border-slate-900 bg-slate-950 scrollbar-thin">
              <svg
                viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                className="w-full h-auto select-none font-mono text-[11px] block min-w-[650px]"
              >
                {/* Background Grid Lines */}
                {[0.15, 0.35, 0.55, 0.75, 0.95].map((ratio, i) => {
                  const y = chartPadding.top + plotHeight * ratio;
                  const price = maxPrice - ratio * priceRange;
                  return (
                    <g key={i}>
                      <line
                        x1={chartPadding.left}
                        y1={y}
                        x2={svgWidth - chartPadding.right}
                        y2={y}
                        stroke="#1e293b"
                        strokeDasharray="4 4"
                      />
                      <text
                        x={svgWidth - chartPadding.right + 6}
                        y={y + 3.5}
                        fill="#64748b"
                        fontSize="9.5"
                      >
                        ${price.toFixed(1)}
                      </text>
                    </g>
                  );
                })}

                {/* Shaded Purge Window Zone (e.g. 08:00 - 10:00 NY or 02:00 - 03:00 NY) */}
                {purgeStartX !== null && purgeEndX !== null && (
                  <g>
                    <rect
                      x={purgeStartX}
                      y={chartPadding.top}
                      width={Math.max(40, purgeEndX - purgeStartX)}
                      height={plotHeight}
                      fill="rgba(245, 158, 11, 0.035)"
                      stroke="rgba(245, 158, 11, 0.15)"
                      strokeDasharray="3 3"
                    />
                    <text
                      x={purgeStartX + 6}
                      y={chartPadding.top + 14}
                      fill="#f59e0b"
                      fontSize="8.5"
                      fontWeight="bold"
                      opacity="0.8"
                    >
                      ⚡ PURGE HOUR ({isLondonTrade ? '02:00-03:00 NY' : '08:00-10:00 NY'})
                    </text>
                  </g>
                )}

                {/* Shaded Risk/Reward Projection Zones */}
                {visibleCandles.some((c) => c.isEntryBar || currentBarIndex >= 5) && (
                  <>
                    {/* TP Zone (Green) */}
                    <rect
                      x={chartPadding.left}
                      y={Math.min(priceToY(activeTrade.entryPrice), priceToY(activeTrade.tpPrice))}
                      width={plotWidth}
                      height={Math.abs(priceToY(activeTrade.tpPrice) - priceToY(activeTrade.entryPrice))}
                      fill="rgba(16, 185, 129, 0.06)"
                    />
                    {/* SL Zone (Red) */}
                    <rect
                      x={chartPadding.left}
                      y={Math.min(priceToY(activeTrade.entryPrice), priceToY(activeTrade.slPrice))}
                      width={plotWidth}
                      height={Math.abs(priceToY(activeTrade.slPrice) - priceToY(activeTrade.entryPrice))}
                      fill="rgba(244, 63, 94, 0.06)"
                    />
                  </>
                )}

                {/* Stop Loss Line */}
                <g>
                  <line
                    x1={chartPadding.left}
                    y1={ySL}
                    x2={svgWidth - chartPadding.right}
                    y2={ySL}
                    stroke="#f43f5e"
                    strokeWidth="1.2"
                    strokeDasharray="4 3"
                  />
                  <rect
                    x={svgWidth - chartPadding.right + 4}
                    y={slBadgeY - 8}
                    width={76}
                    height={16}
                    rx="3"
                    fill="#f43f5e"
                  />
                  <text
                    x={svgWidth - chartPadding.right + 8}
                    y={slBadgeY + 3.5}
                    fill="#ffffff"
                    fontWeight="bold"
                    fontSize="8.5"
                  >
                    SL ${activeTrade.slPrice.toFixed(1)}
                  </text>
                </g>

                {/* Entry #1 Line (5m OB limit) */}
                <g>
                  <line
                    x1={chartPadding.left}
                    y1={yEntry}
                    x2={svgWidth - chartPadding.right}
                    y2={yEntry}
                    stroke="#f59e0b"
                    strokeWidth="1.4"
                    strokeDasharray="4 2"
                  />
                  <rect
                    x={svgWidth - chartPadding.right + 4}
                    y={entryBadgeY - 8}
                    width={76}
                    height={16}
                    rx="3"
                    fill="#f59e0b"
                  />
                  <text
                    x={svgWidth - chartPadding.right + 8}
                    y={entryBadgeY + 3.5}
                    fill="#0f172a"
                    fontWeight="bold"
                    fontSize="8.5"
                  >
                    ENTRY ${activeTrade.entryPrice.toFixed(1)}
                  </text>
                </g>

                {/* Take Profit (TP) Line */}
                <g>
                  <line
                    x1={chartPadding.left}
                    y1={yTP}
                    x2={svgWidth - chartPadding.right}
                    y2={yTP}
                    stroke="#10b981"
                    strokeWidth="1.4"
                    strokeDasharray="4 3"
                  />
                  <rect
                    x={svgWidth - chartPadding.right + 4}
                    y={yTP - 8}
                    width={76}
                    height={16}
                    rx="3"
                    fill="#10b981"
                  />
                  <text
                    x={svgWidth - chartPadding.right + 8}
                    y={yTP + 3.5}
                    fill="#0f172a"
                    fontWeight="bold"
                    fontSize="8.5"
                  >
                    TP ${activeTrade.tpPrice.toFixed(1)}
                  </text>
                </g>

                {/* Key Level Line (Label placed safely on the LEFT side to avoid collision) */}
                <g>
                  <line
                    x1={chartPadding.left}
                    y1={priceToY(activeTrade.tsSweepPrice)}
                    x2={svgWidth - chartPadding.right}
                    y2={priceToY(activeTrade.tsSweepPrice)}
                    stroke="#818cf8"
                    strokeWidth="1"
                    strokeDasharray="3 3"
                  />
                  <rect
                    x={chartPadding.left + 6}
                    y={priceToY(activeTrade.tsSweepPrice) - 17}
                    width={Math.min(220, activeTrade.keyLevel.length * 6.5 + 40)}
                    height={15}
                    rx="3"
                    fill="#1e1b4b"
                    stroke="#6366f1"
                    strokeWidth="0.8"
                  />
                  <text
                    x={chartPadding.left + 10}
                    y={priceToY(activeTrade.tsSweepPrice) - 6}
                    fill="#c7d2fe"
                    fontSize="8.5"
                    fontWeight="bold"
                  >
                    KL / Sweep: ${activeTrade.tsSweepPrice.toFixed(2)}
                  </text>
                </g>

                {/* Candlesticks: ONLY RENDER UP TO currentBarIndex */}
                {visibleCandles.map((candle, idx) => {
                  const cx = chartPadding.left + (idx + 0.5) * candleSpacing;
                  const isBullish = candle.close >= candle.open;
                  const candleColor = isBullish ? '#10b981' : '#f43f5e';
                  const topBodyPrice = Math.max(candle.open, candle.close);
                  const bottomBodyPrice = Math.min(candle.open, candle.close);
                  const yTop = priceToY(topBodyPrice);
                  const yBottom = priceToY(bottomBodyPrice);
                  const bodyHeight = Math.max(2.5, yBottom - yTop);
                  const isSelected = idx === currentBarIndex;

                  return (
                    <g
                      key={idx}
                      className="cursor-pointer group"
                      onClick={() => {
                        setIsPlaying(false);
                        setCurrentBarIndex(idx);
                      }}
                    >
                      {/* Interactive Hover Hit Area */}
                      <rect
                        x={cx - candleSpacing / 2}
                        y={chartPadding.top}
                        width={candleSpacing}
                        height={plotHeight}
                        fill="transparent"
                      />

                      {/* Selected Candle Vertical Highlight */}
                      {isSelected && (
                        <rect
                          x={cx - candleSpacing / 2}
                          y={chartPadding.top}
                          width={candleSpacing}
                          height={plotHeight}
                          fill="rgba(245, 158, 11, 0.08)"
                        />
                      )}

                      {/* Upper & Lower Wick */}
                      <line
                        x1={cx}
                        y1={priceToY(candle.high)}
                        x2={cx}
                        y2={priceToY(candle.low)}
                        stroke={candleColor}
                        strokeWidth="1.2"
                      />

                      {/* Candle Body */}
                      <rect
                        x={cx - candleWidth / 2}
                        y={yTop}
                        width={candleWidth}
                        height={bodyHeight}
                        fill={candleColor}
                        stroke={candleColor}
                        strokeWidth="0.5"
                        rx="1"
                      />

                      {/* Event Markers (Sweep, Entry, Target) */}
                      {candle.isSweepBar && (
                        <g>
                          <circle
                            cx={cx}
                            cy={activeTrade.side === 'SELL' ? priceToY(candle.high) - 8 : priceToY(candle.low) + 8}
                            r="3.5"
                            fill="#f59e0b"
                          />
                          <text
                            x={cx}
                            y={activeTrade.side === 'SELL' ? priceToY(candle.high) - 13 : priceToY(candle.low) + 18}
                            textAnchor="middle"
                            fill="#f59e0b"
                            fontWeight="bold"
                            fontSize="8"
                          >
                            SWEEP
                          </text>
                        </g>
                      )}

                      {candle.isEntryBar && (
                        <g>
                          <rect
                            x={cx - 22}
                            y={priceToY(activeTrade.entryPrice) - (activeTrade.side === 'SELL' ? 16 : -5)}
                            width={44}
                            height={13}
                            rx="2"
                            fill="#f59e0b"
                          />
                          <text
                            x={cx}
                            y={priceToY(activeTrade.entryPrice) - (activeTrade.side === 'SELL' ? 7 : -14)}
                            textAnchor="middle"
                            fill="#0f172a"
                            fontWeight="bold"
                            fontSize="7.5"
                          >
                            ENTRY #1
                          </text>
                        </g>
                      )}

                      {candle.isExitBar && (
                        <g>
                          <rect
                            x={cx - 24}
                            y={activeTrade.result === 'WIN' ? priceToY(activeTrade.tpPrice) - 15 : priceToY(activeTrade.slPrice) - 15}
                            width={48}
                            height={13}
                            rx="2"
                            fill={activeTrade.result === 'WIN' ? '#10b981' : '#f43f5e'}
                          />
                          <text
                            x={cx}
                            y={activeTrade.result === 'WIN' ? priceToY(activeTrade.tpPrice) - 6 : priceToY(activeTrade.slPrice) - 6}
                            textAnchor="middle"
                            fill={activeTrade.result === 'WIN' ? '#0f172a' : '#ffffff'}
                            fontWeight="bold"
                            fontSize="7.5"
                          >
                            {activeTrade.result === 'WIN' ? '3R TP' : 'SL HIT'}
                          </text>
                        </g>
                      )}

                      {/* Time Label on X-axis */}
                      <text
                        x={cx}
                        y={svgHeight - 12}
                        textAnchor="middle"
                        fill={isSelected ? '#f59e0b' : '#64748b'}
                        fontWeight={isSelected ? 'bold' : 'normal'}
                        fontSize="8.5"
                      >
                        {candle.time}
                      </text>
                    </g>
                  );
                })}

                {/* Vertical Cut / Replay Line at currentBarIndex */}
                {currentBarIndex < totalCandles - 1 && (
                  <g>
                    <line
                      x1={chartPadding.left + (currentBarIndex + 0.5) * candleSpacing + candleWidth / 2 + 4}
                      y1={chartPadding.top}
                      x2={chartPadding.left + (currentBarIndex + 0.5) * candleSpacing + candleWidth / 2 + 4}
                      y2={svgHeight - chartPadding.bottom}
                      stroke="#f59e0b"
                      strokeWidth="1.2"
                      strokeDasharray="4 3"
                    />
                    <rect
                      x={chartPadding.left + (currentBarIndex + 0.5) * candleSpacing + candleWidth / 2 - 24}
                      y={chartPadding.top - 16}
                      width={56}
                      height={14}
                      rx="2.5"
                      fill="#f59e0b"
                    />
                    <text
                      x={chartPadding.left + (currentBarIndex + 0.5) * candleSpacing + candleWidth / 2 + 4}
                      y={chartPadding.top - 6}
                      textAnchor="middle"
                      fill="#0f172a"
                      fontWeight="bold"
                      fontSize="8"
                    >
                      ✂️ REPLAY
                    </text>
                  </g>
                )}
              </svg>
            </div>

            {/* Current Candle Stage Callout */}
            <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[11px] shrink-0">
                  Bar #{currentBarIndex + 1} ({currentCandle.time} NY):
                </span>
                <span className="font-bold text-slate-100">{currentCandle.stageLabel}</span>
              </div>
              <p className="text-slate-300 text-xs font-sans sm:text-right">
                {currentCandle.commentarySomali}
              </p>
            </div>
          </div>

          {/* SMT Divergence Sub-Chart (Side-by-side or below) */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-400 animate-pulse" />
                <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">
                  SMT Divergence Hubinta: {activeTrade.smtPair} vs XAUUSD
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setShowSmtChart(!showSmtChart)}
                className="text-xs text-slate-400 hover:text-slate-200 font-mono"
              >
                {showSmtChart ? 'Qari SMT' : 'Muuji SMT'}
              </button>
            </div>

            {showSmtChart && (
              <div className="space-y-2">
                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-xs space-y-1.5 font-sans">
                  <div className="flex items-center gap-2 text-sky-300 font-semibold">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Side-by-side Divergence:</span>
                  </div>
                  <p className="text-slate-300">{activeTrade.smtDescription}</p>
                  <p className="text-slate-400 text-[11px]">PSP: {activeTrade.pspDescription}</p>
                </div>

                {/* Mini SMT Candles Timeline at same bar index */}
                <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 pt-1 font-mono text-[10px]">
                  {activeTrade.smtCandles.slice(0, currentBarIndex + 1).map((c, i) => (
                    <div
                      key={i}
                      className={`p-2 rounded-lg border text-center transition ${
                        i === currentBarIndex
                          ? 'bg-sky-500/20 border-sky-500/50 text-sky-200'
                          : 'bg-slate-950/50 border-slate-800 text-slate-400'
                      }`}
                      title={c.note}
                    >
                      <span className="block font-bold text-slate-300">{c.time}</span>
                      <span
                        className={`block font-semibold ${
                          c.close >= c.open ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {c.close.toFixed(activeTrade.smtPair === 'Silver' ? 2 : 4)}
                      </span>
                      <span className="text-[9px] text-slate-500 block truncate mt-0.5">
                        {c.note.split(':')[0]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Trade Execution Review & Lesson Learned */}
          <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono flex items-center gap-2">
              <Info className="w-4 h-4 text-amber-400" />
              <span>Warbixinta Trade-kan &amp; Casharka Laga Bartay (TET Mentorship)</span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans">
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                <span className="text-amber-400 font-bold block">Fulinta &amp; Dhaqdhaqaaqa:</span>
                <p className="text-slate-300 leading-relaxed">
                  {activeTrade.executionSummarySomali}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/60 border border-amber-500/20 space-y-2">
                <span className="text-amber-300 font-bold block">Casharka Muhiimka ah:</span>
                <p className="text-slate-300 leading-relaxed">
                  {activeTrade.lessonSomali}
                </p>
              </div>
            </div>

            {/* Checklist items passed for this trade */}
            <div className="pt-2 border-t border-slate-800">
              <span className="text-[11px] font-mono text-slate-400 block mb-2">
                Shuruucda Model#1 ee Trade-kan:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {activeTrade.rulesPassed.map((rule, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-[11px]"
                  >
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    <span>{rule}</span>
                  </span>
                ))}
                {activeTrade.rulesFailedOrMissed?.map((rule, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-950/40 border border-rose-500/30 text-rose-300 text-[11px]"
                  >
                    <XCircle className="w-3 h-3 text-rose-400" />
                    <span>{rule}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
