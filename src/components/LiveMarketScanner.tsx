import React, { useState, useEffect } from 'react';
import { LiveScannerState, TradeLogEntry } from '../types';
import { evaluateMarketState } from '../services/marketScanner';
import { ScannerAlertItem } from '../hooks/useMarketConditions';
import {
  Radio,
  RefreshCw,
  TrendingDown,
  TrendingUp,
  Clock,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ArrowRight,
  ShieldAlert,
  Zap,
  Target,
  BookmarkPlus,
  Compass,
  Bell,
  BellRing,
  BellOff,
  Volume2,
  X,
  BarChart2,
} from 'lucide-react';
import { TradingViewMobileChart } from './TradingViewMobileChart';

interface Props {
  scannerState: LiveScannerState;
  loading: boolean;
  autoSync: boolean;
  activeScenario: 'CURRENT_DEVELOPING' | 'MORNING_SELL_COMPLETED';
  notificationsEnabled?: boolean;
  notificationPermission?: NotificationPermission | 'unsupported';
  latestAlert?: ScannerAlertItem | null;
  onToggleAutoSync: () => void;
  onRefresh: () => void;
  onScenarioSwitch: (scenario: 'CURRENT_DEVELOPING' | 'MORNING_SELL_COMPLETED') => void;
  onToggleNotifications?: () => void;
  onTestNotification?: () => void;
  onDismissAlert?: () => void;
  onSendToReview: (scores: Record<string, any>, side: 'BUY' | 'SELL') => void;
  onSendToLog: (entry: Partial<TradeLogEntry>) => void;
  onNavigateToRecap?: () => void;
}

export const LiveMarketScanner: React.FC<Props> = ({
  scannerState,
  loading,
  autoSync,
  activeScenario,
  notificationsEnabled = false,
  notificationPermission = 'default',
  latestAlert = null,
  onToggleAutoSync,
  onRefresh,
  onScenarioSwitch,
  onToggleNotifications,
  onTestNotification,
  onDismissAlert,
  onSendToReview,
  onSendToLog,
  onNavigateToRecap,
}) => {
  const [showTvModal, setShowTvModal] = useState<boolean>(false);
  const setup = scannerState.activeSetup;
  const isHighConfidence = setup.confidenceScore >= 9;
  const isDeveloping = setup.confidenceScore < 9;

  const handleExportToReview = () => {
    const scores: Record<string, string> = {};
    if (setup.direction === 'SELL') {
      scores['bias'] = 'PASS';
      scores['liquidity_flow'] = 'PASS';
      scores['kl'] = 'PASS';
      scores['crt'] = 'PASS';
      scores['purge_hour'] = 'PASS';
      scores['ts_sweep'] = 'PASS';
      scores['smt'] = 'PASS';
      scores['psp'] = 'PASS';
      scores['entry_line'] = 'PASS';
      scores['sl_beyond_sweep'] = 'PASS';
      scores['tp_distance'] = 'PASS';
    } else {
      scores['bias'] = 'FAIL';
      scores['liquidity_flow'] = 'PASS';
      scores['kl'] = 'PASS';
      scores['crt'] = 'CANT_SEE';
      scores['purge_hour'] = 'FAIL';
      scores['ts_sweep'] = 'CANT_SEE';
      scores['smt'] = 'CANT_SEE';
      scores['psp'] = 'CANT_SEE';
      scores['entry_line'] = 'CANT_SEE';
      scores['sl_beyond_sweep'] = 'CANT_SEE';
      scores['tp_distance'] = 'CANT_SEE';
    }
    onSendToReview(scores, setup.direction === 'NO_SETUP' ? 'BUY' : setup.direction);
  };

  const handleExportToLog = () => {
    onSendToLog({
      date: new Date().toISOString().split('T')[0],
      timeNY: '08:20',
      side: setup.direction === 'NO_SETUP' ? 'BUY' : setup.direction,
      entryPrice: setup.entryPrice,
      slPrice: setup.slPrice,
      tpPrice: setup.tpPrice,
      rMultiple: setup.rMultiple,
      result: isHighConfidence ? 'WIN' : 'OPEN',
      itemsPassed: setup.passedItems,
      notes: `${setup.summarySomali} (Entry: 08:20 AM NY, 3R TP Hit: 09:40 AM NY)`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Scanner Banner */}
      <div className="bg-slate-900/80 rounded-2xl p-6 border border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Radio className="w-5 h-5 animate-pulse" />
              </div>
              <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-500 border-2 border-slate-900 animate-ping" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-100">
                  Model#1 Live Market Scanner &amp; Bias Update
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  REAL-TIME
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Baaris toos ah oo ku socota XAUUSD (Dahab): Hubinta bias-ka, saacadaha purge-ka, iyo 11-ka qodob ee Model#1.
              </p>
            </div>
          </div>

          {/* Action buttons & Auto-sync */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Browser Notifications Toggle */}
            {onToggleNotifications && (
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={onToggleNotifications}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
                    notificationsEnabled
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm shadow-amber-500/10'
                      : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
                  }`}
                  title={
                    notificationsEnabled
                      ? 'Ogeysiisyada browser-ka waa shidan yihiin (Guji si aad u damiso)'
                      : 'Daar ogeysiisyada browser-ka marka suuqu isbeddelo ama bias cusub soo baxo'
                  }
                >
                  {notificationsEnabled ? (
                    <BellRing className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                  ) : (
                    <BellOff className="w-3.5 h-3.5" />
                  )}
                  <span>Alerts: {notificationsEnabled ? 'ON' : 'OFF'}</span>
                </button>

                {notificationsEnabled && onTestNotification && (
                  <button
                    type="button"
                    onClick={onTestNotification}
                    title="Tijaabi codka iyo ogeysiiska browser-ka (Test notification)"
                    className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-amber-400 border border-slate-700 text-xs transition"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            )}

            <button
              type="button"
              onClick={onToggleAutoSync}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
                autoSync
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  autoSync ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'
                }`}
              />
              Auto-Sync: {autoSync ? 'ON (15s)' : 'OFF'}
            </button>

            <button
              type="button"
              onClick={onRefresh}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition shadow-md shadow-amber-500/20"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              Scan Hadda
            </button>
          </div>
        </div>

        {/* Permission Denied Warning Notice if user blocked notifications */}
        {notificationPermission === 'denied' && (
          <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>
                <strong>Ogeysiisyada Browser-ka waa la xannibay (Blocked):</strong> Fadlan guji calaamadda Settings/Qufulka ee Browser-kaaga si aad u ogolaato notifications.
              </span>
            </div>
          </div>
        )}

        {/* Active Alert Banner when market state/bias changes */}
        {latestAlert && (
          <div className="p-3.5 rounded-xl bg-gradient-to-r from-amber-500/20 via-amber-500/10 to-slate-950 border border-amber-500/40 text-amber-200 text-xs flex items-center justify-between gap-3 shadow-lg shadow-amber-500/5">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center shrink-0">
                <BellRing className="w-4 h-4 text-amber-400 animate-bounce" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-amber-300">{latestAlert.title}</span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-amber-500/20 text-amber-400 border border-amber-500/30">
                    {latestAlert.timestamp}
                  </span>
                </div>
                <p className="text-slate-300 text-[11px] mt-0.5 truncate">{latestAlert.body}</p>
              </div>
            </div>
            {onDismissAlert && (
              <button
                type="button"
                onClick={onDismissAlert}
                className="text-slate-400 hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-800/80 transition shrink-0"
                title="Xir ogeysiiskan"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        )}

        {/* Scenario Toggle */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs pt-1">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 text-[11px] font-mono">Dooro Xaaladda:</span>
            <button
              type="button"
              onClick={() => onScenarioSwitch('CURRENT_DEVELOPING')}
              className={`px-3 py-1 rounded-lg font-semibold transition ${
                activeScenario === 'CURRENT_DEVELOPING'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              1. Xaaladda Hadda (Low Swept at $3,975)
            </button>
            <button
              type="button"
              onClick={() => onScenarioSwitch('MORNING_SELL_COMPLETED')}
              className={`px-3 py-1 rounded-lg font-semibold transition ${
                activeScenario === 'MORNING_SELL_COMPLETED'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              2. Trade-kii Saaka (Entry 08:20 AM NY → 3R Hit 09:40 AM NY)
            </button>
          </div>

          <div className="text-[11px] text-slate-500 font-mono">
            Cusbooneysiintii ugu dambeysay: {scannerState.lastUpdated}
          </div>
        </div>
      </div>

      {/* Daily Market Recap Quick Access Banner */}
      {onNavigateToRecap && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-950/40 via-slate-900 to-amber-950/30 border border-indigo-500/30 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Daily Market Recap (XAUUSD)</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">Asian → London → NY</span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Maanta: Suuqu wuxuu ahaa Chop/Fadhi (No Trade). Falanqeynta Asian Session ilaa NY Session iyo sababaha.
              </p>
            </div>
          </div>
          <button
            onClick={onNavigateToRecap}
            type="button"
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition shadow-md shadow-amber-500/20 shrink-0"
          >
            <span>Fur Daily Recap</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Real-time Bias & Liquidity Engine */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Daily Bias Card */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400 uppercase">Daily HTF Bias</span>
            <span
              className={`px-2 py-0.5 rounded text-[11px] font-bold font-mono ${
                scannerState.dailyBias === 'BEARISH'
                  ? 'bg-rose-950 text-rose-300 border border-rose-500/40'
                  : scannerState.dailyBias === 'BULLISH'
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                  : 'bg-slate-800 text-slate-300'
              }`}
            >
              {scannerState.dailyBias}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <TrendingDown className="w-5 h-5 text-rose-400" />
            <span className="text-sm font-bold text-slate-100">
              Socodka: ERL Delivery (Sellside)
            </span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Orderflow-ga Daily-gu waa Bearish. Qiimuhu wuxuu jabiyay PDL wuxuuna taabtay $3,975.65.
          </p>
        </div>

        {/* 7H Session Card */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400 uppercase">7H Session Candle</span>
            <Clock className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-sm font-bold text-slate-100">
            {scannerState.sevenHourSession}
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Model#1 wuxuu u baahan yahay in Daily, 7H, iyo 1H ay is waafaqaan ka hor inta aan trade la raadin.
          </p>
        </div>

        {/* Purge Window Card */}
        <div
          className={`p-5 rounded-2xl border space-y-2 ${
            scannerState.purgeStatus === 'ACTIVE_PURGE'
              ? 'bg-emerald-950/30 border-emerald-500/40'
              : 'bg-slate-900/80 border-slate-800'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase text-slate-400">Purge Status</span>
            <Zap
              className={`w-4 h-4 ${
                scannerState.purgeStatus === 'ACTIVE_PURGE'
                  ? 'text-emerald-400 animate-pulse'
                  : 'text-amber-400'
              }`}
            />
          </div>
          <div
            className={`text-sm font-bold ${
              scannerState.purgeStatus === 'ACTIVE_PURGE'
                ? 'text-emerald-400'
                : 'text-amber-400'
            }`}
          >
            {scannerState.purgeStatus === 'ACTIVE_PURGE'
              ? 'PURGE WINDOW FURAN'
              : 'SUGITAANKA PURGE-KA XIGA'}
          </div>
          <p className="text-[11px] text-slate-300">
            {scannerState.purgeDetails}
          </p>
        </div>
      </div>

      {/* Gold Price & Key Levels Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
        <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
          <span className="text-[10px] text-slate-400 font-mono block">XAUUSD Hadda</span>
          <span className="text-base font-bold font-mono text-amber-400">
            ${scannerState.currentPrice.toFixed(2)}
          </span>
        </div>
        <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
          <span className="text-[10px] text-slate-400 font-mono block">Day High (High of Day)</span>
          <span className="text-base font-bold font-mono text-slate-200">
            ${scannerState.dayHigh.toFixed(2)}
          </span>
        </div>
        <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
          <span className="text-[10px] text-slate-400 font-mono block">Day Low (Low of Day)</span>
          <span className="text-base font-bold font-mono text-rose-400">
            ${scannerState.dayLow.toFixed(2)}
          </span>
        </div>
        <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
          <span className="text-[10px] text-slate-400 font-mono block">PDL (Previous Day Low)</span>
          <span className="text-base font-bold font-mono text-slate-300">
            ${scannerState.pdl.toFixed(2)}
          </span>
        </div>
        <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
          <span className="text-[10px] text-slate-400 font-mono block">PDH (Previous Day High)</span>
          <span className="text-base font-bold font-mono text-slate-300">
            ${scannerState.pdh.toFixed(2)}
          </span>
        </div>
        <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
          <span className="text-[10px] text-slate-400 font-mono block">Target ERL</span>
          <span className="text-base font-bold font-mono text-emerald-400">
            ${scannerState.pwl.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Main Trade Detection & Rules Verification Box */}
      <div className="bg-slate-900/90 rounded-2xl p-6 border border-amber-500/40 shadow-2xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div
              className={`p-2 rounded-xl ${
                isHighConfidence
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                  : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
              }`}
            >
              <Target className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-mono">GO&apos;AANKA SCANNER-KA:</span>
                <span
                  className={`px-2.5 py-0.5 rounded text-xs font-bold font-mono ${
                    isHighConfidence
                      ? 'bg-emerald-500 text-slate-950'
                      : 'bg-amber-500 text-slate-950'
                  }`}
                >
                  {isHighConfidence
                    ? 'TRADE RASMI AH WAA DIFAACAN YAHAY (10/11 RULES MET)'
                    : 'TRADE BUUXA MA JIRO — SHARCIYO AYAA DHIMAN'}
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-100 mt-1">
                {setup.direction === 'SELL' ? 'SELL SETUP (ERL -> IRL)' : 'BUY SETUP REVERSAL (IRL -> ERL)'}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="text-right font-mono">
              <span className="text-[11px] text-slate-400 block">Checklist Buuxsamay</span>
              <span className="text-lg font-bold text-amber-400">
                {setup.confidenceScore} <span className="text-xs text-slate-500">/ 11</span>
              </span>
            </div>
          </div>
        </div>

        {/* Progress Bar of Rules */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-slate-300">Heerka Buuxsanaanta Shuruucda:</span>
            <span className="font-bold text-amber-400">
              {Math.round((setup.confidenceScore / 11) * 100)}%
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden border border-slate-800">
            <div
              className={`h-full transition-all duration-500 ${
                isHighConfidence ? 'bg-emerald-500' : 'bg-amber-500'
              }`}
              style={{ width: `${(setup.confidenceScore / 11) * 100}%` }}
            />
          </div>
        </div>

        {/* Summary Somali */}
        <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 text-xs text-slate-200 leading-relaxed font-sans">
          <strong className="text-amber-400 block mb-1">Warbixinta Tooska ah (Live Report):</strong>
          {setup.summarySomali}
        </div>

        {/* Two-Column Grid: Rules Passed vs Rules Missing */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Passed Rules */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-emerald-500/20 space-y-2">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
              <CheckCircle2 className="w-4 h-4" />
              Sharciyada Buuxsamay ({setup.passedItems.length} qodob):
            </div>
            <ul className="text-xs space-y-1.5 text-slate-300">
              {setup.passedItems.map((item, idx) => (
                <li key={idx} className="flex items-start gap-1.5">
                  <span className="text-emerald-400 font-bold shrink-0">&bull;</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Missing Rules */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-rose-500/20 space-y-2">
            <div className="flex items-center gap-2 text-rose-400 font-bold text-xs">
              <XCircle className="w-4 h-4" />
              Sharciyada Ka Dhiman / Weli la sugayo ({setup.missingItems.length} qodob):
            </div>
            <ul className="text-xs space-y-1.5 text-slate-300">
              {setup.missingItems.map((item, idx) => (
                <li key={idx} className="flex items-start gap-1.5">
                  <span className="text-rose-400 font-bold shrink-0">&times;</span>
                  <span className="text-rose-200/90">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Pricing Parameters (Entry, SL, TP) */}
        <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
          <div>
            <span className="text-[10px] text-slate-500 block">Entry #1 Price</span>
            <span className="text-slate-100 font-bold">${setup.entryPrice.toFixed(2)}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 block">Stop Loss (SL)</span>
            <span className="text-rose-400 font-bold">${setup.slPrice.toFixed(2)}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 block">Target (TP)</span>
            <span className="text-emerald-400 font-bold">${setup.tpPrice.toFixed(2)}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 block">R Multiple / SL Distance</span>
            <span className="text-amber-400 font-bold">
              {setup.rMultiple}R (${setup.slDistance.toFixed(2)})
            </span>
          </div>
        </div>

        {/* Warnings */}
        <div className="space-y-1.5">
          {setup.warnings.map((w, idx) => (
            <div
              key={idx}
              className="p-3 rounded-xl bg-rose-950/30 border border-rose-500/30 text-xs text-rose-300 flex items-center gap-2"
            >
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{w}</span>
            </div>
          ))}
        </div>

        {/* Action Buttons to bridge into other modes */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800">
          <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
            <Compass className="w-4 h-4 text-amber-400" />
            Waxaad xogtan si toos ah ugu wareejin kartaa Baaritaanka Shaxanka ama Diiwaanka CSV.
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => setShowTvModal(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/40 text-xs font-bold transition shadow-sm"
              title="Fur shaxanka tooska ah ee TradingView mobile-ka"
            >
              <BarChart2 className="w-3.5 h-3.5 text-sky-400" />
              <span>📱 TradingView Chart (Sawirka Shaxanka)</span>
            </button>
            <button
              type="button"
              onClick={handleExportToReview}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition"
            >
              <span>U wareeji Mode B (Checklist)</span>
              <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
            </button>
            <button
              type="button"
              onClick={handleExportToLog}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition shadow-md shadow-amber-500/20"
            >
              <BookmarkPlus className="w-3.5 h-3.5" />
              <span>U keydi Journal Mode C</span>
            </button>
          </div>
        </div>
      </div>

      {/* TradingView Mobile Chart Modal */}
      {showTvModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
          <div className="relative w-full max-w-md my-auto">
            <TradingViewMobileChart
              initialTradeId="bt-oct-28"
              onClose={() => setShowTvModal(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};
