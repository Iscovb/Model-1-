import React, { useState } from 'react';
import { BACKTEST_TRADES_MAY_JULY, BacktestTrade } from '../constants/backtestData';
import {
  TrendingDown,
  TrendingUp,
  X,
  Maximize2,
  Minimize2,
  Camera,
  Share2,
  Sliders,
  Type,
  Grid,
  PenTool,
  Move,
  Search,
  BookOpen,
  Compass,
  Users,
  Menu as MenuIcon,
  BarChart2,
  ChevronDown,
  RotateCcw,
} from 'lucide-react';

interface Props {
  initialTradeId?: string;
  onClose?: () => void;
  isStandalone?: boolean;
}

export const TradingViewMobileChart: React.FC<Props> = ({
  initialTradeId = 'bt-oct-28',
  onClose,
  isStandalone = false,
}) => {
  const [selectedTradeId, setSelectedTradeId] = useState<string>(initialTradeId);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [activeBottomTab, setActiveBottomTab] = useState<'Watchlist' | 'Chart' | 'Explore' | 'Community' | 'Menu'>('Chart');

  const trade: BacktestTrade =
    BACKTEST_TRADES_MAY_JULY.find((t) => t.id === selectedTradeId) || BACKTEST_TRADES_MAY_JULY[0];

  const candles = trade.candles;
  const isSell = trade.side === 'SELL';

  // Math for SVG price plotting
  const allPrices = [
    ...candles.flatMap((c) => [c.high, c.low]),
    trade.entryPrice,
    trade.slPrice,
    trade.tpPrice,
    trade.tsSweepPrice,
  ];

  const rawMin = Math.min(...allPrices);
  const rawMax = Math.max(...allPrices);
  const margin = (rawMax - rawMin) * 0.14 || 2.5;
  const minPrice = rawMin - margin;
  const maxPrice = rawMax + margin;
  const priceRange = maxPrice - minPrice || 1;

  // Mobile viewport dimensions
  const svgWidth = 412;
  const svgHeight = 620;
  const padding = { top: 38, right: 62, bottom: 42, left: 14 };
  const plotWidth = svgWidth - padding.left - padding.right;
  const plotHeight = svgHeight - padding.top - padding.bottom;

  const priceToY = (price: number) => {
    return padding.top + plotHeight - ((price - minPrice) / priceRange) * plotHeight;
  };

  const candleSpacing = plotWidth / (candles.length + 0.6);
  const candleWidth = Math.min(10, Math.max(5, candleSpacing * 0.58));

  // Position tool boundaries
  const sweepBarIdx = Math.max(0, candles.findIndex((c) => c.isSweepBar));
  const entryBarIdx = Math.max(sweepBarIdx, candles.findIndex((c) => c.isEntryBar));
  const exitBarIdx = Math.max(entryBarIdx + 1, candles.findIndex((c) => c.isExitBar));

  const posStartX = padding.left + (entryBarIdx + 0.5) * candleSpacing;
  const posEndX = Math.min(svgWidth - padding.right - 4, padding.left + (exitBarIdx + 1.2) * candleSpacing);
  const posWidth = Math.max(60, posEndX - posStartX);

  const yEntry = priceToY(trade.entryPrice);
  const ySL = priceToY(trade.slPrice);
  const yTP = priceToY(trade.tpPrice);

  // Price grid ticks (TradingView right axis)
  const tickCount = 8;
  const priceStep = priceRange / tickCount;
  const ticks = Array.from({ length: tickCount + 1 }, (_, i) => maxPrice - i * priceStep);

  return (
    <div
      className={`bg-[#131722] text-[#d1d4dc] font-sans select-none flex flex-col ${
        isFullscreen
          ? 'fixed inset-0 z-50 overflow-hidden'
          : 'relative rounded-2xl border border-[#2a2e39] overflow-hidden shadow-2xl max-w-md mx-auto w-full'
      }`}
      style={{ height: isFullscreen ? '100vh' : '820px' }}
    >
      {/* 1. TradingView Top Header Bar */}
      <div className="bg-[#1e222d] border-b border-[#2a2e39] px-3 py-2 flex items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-6 h-6 rounded-full bg-[#f59e0b] text-[#131722] font-black text-xs flex items-center justify-center shrink-0 shadow">
            M#1
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-bold text-xs text-white tracking-wide">XAUUSD</span>
              <span className="px-1 py-0.2 rounded bg-[#2a2e39] text-[9.5px] font-mono font-semibold text-[#787b86]">
                5m
              </span>
              <span className="text-[10px] text-[#787b86] truncate">Dahab • Model#1</span>
            </div>
            <div className="flex items-center gap-2 text-[11px] font-mono leading-tight">
              <span className="font-bold text-white">${candles[candles.length - 1]?.close.toFixed(2)}</span>
              <span className={isSell ? 'text-[#089981]' : 'text-[#f23645]'}>
                {isSell ? `+${trade.rMultiple}R` : `${trade.rMultiple}R`} ({trade.pips > 0 ? `+${trade.pips}p` : `${trade.pips}p`})
              </span>
            </div>
          </div>
        </div>

        {/* Trade Switcher Dropdown & Controls */}
        <div className="flex items-center gap-1.5 shrink-0">
          <select
            value={selectedTradeId}
            onChange={(e) => setSelectedTradeId(e.target.value)}
            className="bg-[#2a2e39] text-white text-[11px] font-medium py-1 px-2 rounded border border-[#363a45] focus:outline-none cursor-pointer max-w-[130px] truncate"
          >
            {BACKTEST_TRADES_MAY_JULY.map((t) => (
              <option key={t.id} value={t.id}>
                {t.date} ({t.side} {t.rMultiple > 0 ? `+${t.rMultiple}R` : `${t.rMultiple}R`})
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1 rounded text-[#787b86] hover:text-white hover:bg-[#2a2e39] transition"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded text-[#787b86] hover:text-white hover:bg-[#2a2e39] transition"
              title="Close"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* 2. Secondary Indicator Bar */}
      <div className="bg-[#181b24] border-b border-[#242832] px-3 py-1 flex items-center justify-between text-[10px] text-[#787b86] font-mono shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-[#f59e0b] font-bold">ICT TET MENTORSHIP</span>
          <span>•</span>
          <span className="text-[#818cf8] font-bold">2SSMT ({trade.smtPair})</span>
          <span>•</span>
          <span className="text-[#089981] font-bold">PSP Confirmed</span>
        </div>
        <div className="text-white font-semibold">
          {trade.date} ({trade.timeNY} NY)
        </div>
      </div>

      {/* 3. Main Chart Canvas Viewport */}
      <div className="relative flex-1 bg-[#131722] overflow-hidden">
        {/* Floating TradingView Right Toolbar (Tools Palette from the user's screenshot!) */}
        <div className="absolute right-2 top-8 z-20 flex flex-col items-center gap-1.5 p-1 rounded-xl bg-[#1e222d]/90 border border-[#2a2e39]/80 shadow-2xl backdrop-blur-sm pointer-events-none sm:pointer-events-auto">
          <div className="w-5 h-5 flex items-center justify-center text-[#787b86] hover:text-white cursor-pointer">
            <Move className="w-3.5 h-3.5" />
          </div>
          <div className="w-5 h-5 flex items-center justify-center text-[#787b86] hover:text-white cursor-pointer">
            <PenTool className="w-3.5 h-3.5" />
          </div>
          <div className="w-5 h-5 flex items-center justify-center text-[#787b86] hover:text-white cursor-pointer">
            <Type className="w-3.5 h-3.5" />
          </div>
          <div className="w-5 h-5 flex items-center justify-center text-[#787b86] hover:text-white cursor-pointer">
            <Grid className="w-3.5 h-3.5" />
          </div>
          <div className="w-5 h-5 flex items-center justify-center text-[#089981] font-bold text-[9px] bg-[#089981]/20 rounded border border-[#089981]/40">
            {isSell ? 'S' : 'L'}
          </div>
          <div className="w-5 h-5 flex items-center justify-center text-[#787b86] hover:text-white cursor-pointer">
            <Sliders className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* SVG Candlestick & Position Box Engine */}
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-full block font-mono select-none"
        >
          {/* Subtle Grid Lines */}
          {ticks.map((p, i) => {
            const y = priceToY(p);
            return (
              <g key={i}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={svgWidth - padding.right}
                  y2={y}
                  stroke="#1e222d"
                  strokeWidth="0.8"
                  strokeDasharray="2 2"
                />
                <text
                  x={svgWidth - padding.right + 4}
                  y={y + 3}
                  fill="#787b86"
                  fontSize="8.5"
                  textAnchor="start"
                >
                  {p.toFixed(1)}
                </text>
              </g>
            );
          })}

          {/* Purge Window Highlighting (08:00 - 10:00 NY) */}
          <g>
            <rect
              x={padding.left + (sweepBarIdx - 0.2) * candleSpacing}
              y={padding.top}
              width={candleSpacing * 6.5}
              height={plotHeight}
              fill="rgba(245, 158, 11, 0.04)"
              stroke="rgba(245, 158, 11, 0.2)"
              strokeDasharray="3 3"
              strokeWidth="0.8"
            />
            <text
              x={padding.left + (sweepBarIdx - 0.2) * candleSpacing + 4}
              y={padding.top + 11}
              fill="#f59e0b"
              fontSize="7.5"
              fontWeight="bold"
              opacity="0.85"
            >
              PURGE HOUR (08:00-10:00 NY)
            </text>
          </g>

          {/* Key Level / Sweep Horizontal Line */}
          <g>
            <line
              x1={padding.left}
              y1={priceToY(trade.tsSweepPrice)}
              x2={svgWidth - padding.right}
              y2={priceToY(trade.tsSweepPrice)}
              stroke="#818cf8"
              strokeWidth="1"
              strokeDasharray="3 2"
            />
            <rect
              x={padding.left + 4}
              y={priceToY(trade.tsSweepPrice) - 13}
              width={145}
              height={12}
              rx="2"
              fill="#1e1b4b"
              stroke="#6366f1"
              strokeWidth="0.7"
            />
            <text
              x={padding.left + 8}
              y={priceToY(trade.tsSweepPrice) - 4}
              fill="#c7d2fe"
              fontSize="7.5"
              fontWeight="bold"
            >
              TS SWEEP: ${trade.tsSweepPrice.toFixed(2)}
            </text>
          </g>

          {/* ============================================================== */}
          {/* TRADINGVIEW SHORT / LONG POSITION TOOL (THE ICONIC OVERLAY BOX) */}
          {/* ============================================================== */}
          <g>
            {isSell ? (
              // SHORT POSITION: Risk Box (Red/Gray on Top), Target Box (Teal/Green on Bottom)
              <>
                {/* 1. Stop Loss Area (Top Box) */}
                <rect
                  x={posStartX}
                  y={ySL}
                  width={posWidth}
                  height={Math.max(4, yEntry - ySL)}
                  fill="rgba(242, 54, 69, 0.28)"
                  stroke="#f23645"
                  strokeWidth="0.9"
                />

                {/* 2. Take Profit Area (Bottom Box) */}
                <rect
                  x={posStartX}
                  y={yEntry}
                  width={posWidth}
                  height={Math.max(4, yTP - yEntry)}
                  fill="rgba(8, 153, 129, 0.32)"
                  stroke="#089981"
                  strokeWidth="0.9"
                />

                {/* Dotted Trajectory Line from Entry to Target */}
                <line
                  x1={posStartX}
                  y1={yEntry}
                  x2={posStartX + posWidth * 0.85}
                  y2={yTP}
                  stroke="rgba(8, 153, 129, 0.7)"
                  strokeWidth="1.2"
                  strokeDasharray="3 3"
                />

                {/* Position Stats Pill in Center of Profit Box */}
                <g>
                  <rect
                    x={posStartX + 8}
                    y={yEntry + (yTP - yEntry) * 0.35 - 9}
                    width={92}
                    height={28}
                    rx="3"
                    fill="#131722"
                    stroke="#089981"
                    strokeWidth="0.8"
                  />
                  <text
                    x={posStartX + 12}
                    y={yEntry + (yTP - yEntry) * 0.35 + 2}
                    fill="#089981"
                    fontSize="7.8"
                    fontWeight="bold"
                  >
                    Target: ${Math.abs(trade.entryPrice - trade.tpPrice).toFixed(1)} (+{trade.rMultiple}R)
                  </text>
                  <text
                    x={posStartX + 12}
                    y={yEntry + (yTP - yEntry) * 0.35 + 13}
                    fill="#787b86"
                    fontSize="7"
                  >
                    Risk/Reward: {trade.rMultiple.toFixed(2)}
                  </text>
                </g>
              </>
            ) : (
              // LONG POSITION: Target Box (Teal/Green on Top), Risk Box (Red/Gray on Bottom)
              <>
                {/* 1. Take Profit Area (Top Box) */}
                <rect
                  x={posStartX}
                  y={yTP}
                  width={posWidth}
                  height={Math.max(4, yEntry - yTP)}
                  fill="rgba(8, 153, 129, 0.32)"
                  stroke="#089981"
                  strokeWidth="0.9"
                />

                {/* 2. Stop Loss Area (Bottom Box) */}
                <rect
                  x={posStartX}
                  y={yEntry}
                  width={posWidth}
                  height={Math.max(4, ySL - yEntry)}
                  fill="rgba(242, 54, 69, 0.28)"
                  stroke="#f23645"
                  strokeWidth="0.9"
                />

                {/* Dotted Trajectory Line */}
                <line
                  x1={posStartX}
                  y1={yEntry}
                  x2={posStartX + posWidth * 0.85}
                  y2={yTP}
                  stroke="rgba(8, 153, 129, 0.7)"
                  strokeWidth="1.2"
                  strokeDasharray="3 3"
                />

                {/* Position Stats Pill in Center of Profit Box */}
                <g>
                  <rect
                    x={posStartX + 8}
                    y={yTP + (yEntry - yTP) * 0.4 - 9}
                    width={92}
                    height={28}
                    rx="3"
                    fill="#131722"
                    stroke="#089981"
                    strokeWidth="0.8"
                  />
                  <text
                    x={posStartX + 12}
                    y={yTP + (yEntry - yTP) * 0.4 + 2}
                    fill="#089981"
                    fontSize="7.8"
                    fontWeight="bold"
                  >
                    Target: ${Math.abs(trade.tpPrice - trade.entryPrice).toFixed(1)} (+{trade.rMultiple}R)
                  </text>
                  <text
                    x={posStartX + 12}
                    y={yTP + (yEntry - yTP) * 0.4 + 13}
                    fill="#787b86"
                    fontSize="7"
                  >
                    Risk/Reward: {trade.rMultiple.toFixed(2)}
                  </text>
                </g>
              </>
            )}

            {/* Entry Line (Thick Gray/Yellow Line) */}
            <line
              x1={posStartX}
              y1={yEntry}
              x2={svgWidth - padding.right}
              y2={yEntry}
              stroke="#d1d4dc"
              strokeWidth="1.2"
              strokeDasharray="4 2"
            />

            {/* Stop Loss Line */}
            <line
              x1={posStartX}
              y1={ySL}
              x2={svgWidth - padding.right}
              y2={ySL}
              stroke="#f23645"
              strokeWidth="1.2"
              strokeDasharray="4 2"
            />

            {/* Take Profit Line */}
            <line
              x1={posStartX}
              y1={yTP}
              x2={svgWidth - padding.right}
              y2={yTP}
              stroke="#089981"
              strokeWidth="1.2"
              strokeDasharray="4 2"
            />
          </g>

          {/* ============================================================== */}
          {/* CANDLESTICKS (AUTHENTIC TRADINGVIEW BODY & WICKS) */}
          {/* ============================================================== */}
          {candles.map((c, i) => {
            const cx = padding.left + (i + 0.5) * candleSpacing;
            const isBull = c.close >= c.open;
            const candleColor = isBull ? '#089981' : '#f23645';
            const topBody = Math.max(c.open, c.close);
            const botBody = Math.min(c.open, c.close);
            const yTop = priceToY(topBody);
            const yBot = priceToY(botBody);
            const bodyH = Math.max(2, yBot - yTop);

            return (
              <g key={i}>
                {/* Wicks */}
                <line
                  x1={cx}
                  y1={priceToY(c.high)}
                  x2={cx}
                  y2={priceToY(c.low)}
                  stroke={candleColor}
                  strokeWidth="1.1"
                />
                {/* Body */}
                <rect
                  x={cx - candleWidth / 2}
                  y={yTop}
                  width={candleWidth}
                  height={bodyH}
                  fill={candleColor}
                  stroke={candleColor}
                  strokeWidth="0.5"
                />

                {/* Sweep Marker */}
                {c.isSweepBar && (
                  <circle
                    cx={cx}
                    cy={isSell ? priceToY(c.high) - 5 : priceToY(c.low) + 5}
                    r="2.5"
                    fill="#f59e0b"
                  />
                )}

                {/* Time Tick along the bottom */}
                {i % 2 === 0 && (
                  <text
                    x={cx}
                    y={svgHeight - padding.bottom + 14}
                    fill="#787b86"
                    fontSize="7.5"
                    textAnchor="middle"
                  >
                    {c.time}
                  </text>
                )}
              </g>
            );
          })}

          {/* ============================================================== */}
          {/* RIGHT PRICE SCALE COLORED BADGES (EXACT TRADINGVIEW STYLE) */}
          {/* ============================================================== */}
          {/* 1. Stop Loss Badge (Red) */}
          <g>
            <rect
              x={svgWidth - padding.right + 2}
              y={ySL - 7}
              width={56}
              height={14}
              rx="2"
              fill="#f23645"
            />
            <text
              x={svgWidth - padding.right + 5}
              y={ySL + 3}
              fill="#ffffff"
              fontSize="8"
              fontWeight="bold"
            >
              {trade.slPrice.toFixed(2)}
            </text>
          </g>

          {/* 2. Entry Price Badge (Dark Gray / Blue) */}
          <g>
            <rect
              x={svgWidth - padding.right + 2}
              y={yEntry - 7}
              width={56}
              height={14}
              rx="2"
              fill="#2a2e39"
              stroke="#787b86"
              strokeWidth="0.5"
            />
            <text
              x={svgWidth - padding.right + 5}
              y={yEntry + 3}
              fill="#d1d4dc"
              fontSize="8"
              fontWeight="bold"
            >
              {trade.entryPrice.toFixed(2)}
            </text>
          </g>

          {/* 3. Take Profit Badge (Teal / Green) */}
          <g>
            <rect
              x={svgWidth - padding.right + 2}
              y={yTP - 7}
              width={56}
              height={14}
              rx="2"
              fill="#089981"
            />
            <text
              x={svgWidth - padding.right + 5}
              y={yTP + 3}
              fill="#ffffff"
              fontSize="8"
              fontWeight="bold"
            >
              {trade.tpPrice.toFixed(2)}
            </text>
          </g>

          {/* 4. TS Sweep Price Badge (Purple) */}
          <g>
            <rect
              x={svgWidth - padding.right + 2}
              y={priceToY(trade.tsSweepPrice) - 6}
              width={56}
              height={12}
              rx="2"
              fill="#4338ca"
            />
            <text
              x={svgWidth - padding.right + 5}
              y={priceToY(trade.tsSweepPrice) + 2.5}
              fill="#ffffff"
              fontSize="7.5"
              fontWeight="bold"
            >
              {trade.tsSweepPrice.toFixed(2)}
            </text>
          </g>

          {/* TradingView Bottom-Left Watermark */}
          <text
            x={padding.left + 2}
            y={svgHeight - padding.bottom - 6}
            fill="#2a2e39"
            fontSize="18"
            fontWeight="900"
            letterSpacing="1"
          >
            TET M#1
          </text>
        </svg>

        {/* Floating Bottom Left TV Logo Button */}
        <div className="absolute left-3 bottom-2 z-10 flex items-center gap-1.5 bg-[#1e222d]/80 px-2 py-0.5 rounded border border-[#2a2e39] text-[10px] text-[#787b86]">
          <span className="font-black text-white">TV</span>
          <span>•</span>
          <span className="text-[#089981] font-bold">XAUUSD +3R</span>
        </div>
      </div>

      {/* 4. Trade Execution Note & Somali ICT Checklist Bar */}
      <div className="bg-[#181b24] border-t border-[#2a2e39] px-3 py-2 text-xs space-y-1 shrink-0">
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-[#f59e0b] font-bold font-mono">
            {trade.title}
          </span>
          <span className="px-2 py-0.5 rounded bg-[#089981]/20 text-[#089981] font-bold font-mono">
            WIN (+{trade.rMultiple}R)
          </span>
        </div>
        <p className="text-[11px] text-[#9ca3af] leading-tight line-clamp-2">
          {trade.executionSummarySomali}
        </p>
      </div>

      {/* 5. TradingView Mobile Bottom Navigation (Matching the user's screenshot!) */}
      <div className="bg-[#131722] border-t border-[#2a2e39] py-1.5 px-3 flex items-center justify-around text-[#787b86] shrink-0">
        <button
          type="button"
          onClick={() => setActiveBottomTab('Watchlist')}
          className={`flex flex-col items-center gap-0.5 text-[9.5px] transition ${
            activeBottomTab === 'Watchlist' ? 'text-[#089981] font-bold' : 'hover:text-white'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Watchlist</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveBottomTab('Chart')}
          className={`flex flex-col items-center gap-0.5 text-[9.5px] transition ${
            activeBottomTab === 'Chart' ? 'text-[#089981] font-bold' : 'hover:text-white'
          }`}
        >
          <BarChart2 className="w-4 h-4 text-[#089981]" />
          <span>Chart</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveBottomTab('Explore')}
          className={`flex flex-col items-center gap-0.5 text-[9.5px] transition ${
            activeBottomTab === 'Explore' ? 'text-[#089981] font-bold' : 'hover:text-white'
          }`}
        >
          <Compass className="w-4 h-4" />
          <span>Explore</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveBottomTab('Community')}
          className={`flex flex-col items-center gap-0.5 text-[9.5px] transition ${
            activeBottomTab === 'Community' ? 'text-[#089981] font-bold' : 'hover:text-white'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Community</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveBottomTab('Menu')}
          className={`flex flex-col items-center gap-0.5 text-[9.5px] transition ${
            activeBottomTab === 'Menu' ? 'text-[#089981] font-bold' : 'hover:text-white'
          }`}
        >
          <MenuIcon className="w-4 h-4" />
          <span>Menu</span>
        </button>
      </div>
    </div>
  );
};
