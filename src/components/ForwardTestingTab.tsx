import React, { useState, useEffect } from 'react';
import { ForwardTestTrade, LiveScannerState, TradeLogEntry } from '../types';
import { INITIAL_FORWARD_TESTS } from '../constants/forwardTestData';
import { TradingViewMobileChart } from './TradingViewMobileChart';
import {
  Camera,
  Play,
  CheckCircle2,
  XCircle,
  Clock,
  Target,
  Shield,
  Zap,
  TrendingUp,
  TrendingDown,
  Eye,
  BookmarkPlus,
  RefreshCw,
  Plus,
  Download,
  Trash2,
  Sparkles,
  BarChart2,
  AlertCircle,
  HelpCircle,
  Award,
  DollarSign,
  Activity,
  Percent,
  Briefcase,
  ShieldCheck,
  Scale,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';

interface Props {
  liveMarketState?: LiveScannerState;
  onSendToJournal?: (entry: Partial<TradeLogEntry>) => void;
}

export const ForwardTestingTab: React.FC<Props> = ({
  liveMarketState,
  onSendToJournal,
}) => {
  const getTvTradeId = (fwdId: string): string => {
    if (fwdId === 'fwd-20261029-1') return 'bt-oct-29';
    if (fwdId === 'fwd-20261028-1') return 'bt-oct-28';
    if (fwdId === 'fwd-20261028-2') return 'bt-oct-28-london';
    if (fwdId === 'fwd-20261021-1') return 'bt-oct-21';
    if (fwdId === 'fwd-20261015-1') return 'bt-oct-15';
    if (fwdId === 'fwd-20261009-1') return 'bt-oct-09';
    return 'bt-oct-29';
  };

  const [forwardTrades, setForwardTrades] = useState<ForwardTestTrade[]>(() => {
    const saved = localStorage.getItem('model1_forward_tests_v5');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return INITIAL_FORWARD_TESTS;
      }
    }
    return INITIAL_FORWARD_TESTS;
  });

  const [autoCaptureEnabled, setAutoCaptureEnabled] = useState<boolean>(() => {
    return localStorage.getItem('model1_fwd_auto_capture') !== 'false';
  });

  const [activeTabFilter, setActiveTabFilter] = useState<'ALL' | 'OPEN' | 'WIN' | 'LOSS'>('ALL');
  const [selectedTradeForModal, setSelectedTradeForModal] = useState<ForwardTestTrade | null>(null);
  const [showTvChartModal, setShowTvChartModal] = useState<boolean>(false);
  const [activeTvTradeId, setActiveTvTradeId] = useState<string>('bt-oct-29');

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('model1_forward_tests_v5', JSON.stringify(forwardTrades));
  }, [forwardTrades]);

  useEffect(() => {
    localStorage.setItem('model1_fwd_auto_capture', String(autoCaptureEnabled));
  }, [autoCaptureEnabled]);

  // Performance calculations
  const totalTrades = forwardTrades.length;
  const openTrades = forwardTrades.filter((t) => t.status === 'OPEN');
  const closedTrades = forwardTrades.filter((t) => t.status === 'WIN' || t.status === 'LOSS');
  const winTrades = forwardTrades.filter((t) => t.status === 'WIN');
  const lossTrades = forwardTrades.filter((t) => t.status === 'LOSS');

  const winRate =
    closedTrades.length > 0 ? Math.round((winTrades.length / closedTrades.length) * 100) : 0;
  const netR = forwardTrades.reduce((acc, t) => acc + (t.status === 'OPEN' ? 0 : t.rMultiple), 0);
  const totalPips = forwardTrades.reduce((acc, t) => acc + (t.status === 'OPEN' ? 0 : t.pips), 0);

  // Account Capital state for 1% Risk Rule Engine
  const [accountSize, setAccountSize] = useState<number>(() => {
    const saved = localStorage.getItem('model1_agent_summary_account_size');
    return saved ? parseFloat(saved) : 10000;
  });

  useEffect(() => {
    localStorage.setItem('model1_agent_summary_account_size', String(accountSize));
  }, [accountSize]);

  // 1% Risk Rule Calculations
  const riskPerTradeDollars = accountSize * 0.01;
  const winDollarPerTrade = riskPerTradeDollars * 3; // Fixed 3R Target (+3%)
  const lossDollarPerTrade = riskPerTradeDollars * 1; // Fixed 1R Stop Loss (-1%)
  const cumulativeProfitDollars =
    winTrades.length * winDollarPerTrade - lossTrades.length * lossDollarPerTrade;
  const cumulativeGainPct = netR * 1.0; // 1R = 1%
  const currentAccountBalance = accountSize + cumulativeProfitDollars;
  const lossRate =
    closedTrades.length > 0 ? Math.round((lossTrades.length / closedTrades.length) * 100) : 0;
  const profitFactor =
    lossTrades.length > 0
      ? ((winTrades.length * 3) / (lossTrades.length * 1)).toFixed(2)
      : (winTrades.length * 3).toFixed(2);
  const avgRPerTrade = closedTrades.length > 0 ? netR / closedTrades.length : 0;

  // Filtered list
  const filteredTrades = forwardTrades.filter((t) => {
    if (activeTabFilter === 'ALL') return true;
    return t.status === activeTabFilter;
  });

  // Action: Manually capture current live scanner setup as forward test
  const handleCaptureCurrentLiveSetup = () => {
    if (!liveMarketState) return;
    const setup = liveMarketState.activeSetup;
    const now = new Date();
    const nyTimeStr = now.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'America/New_York',
    });
    const dateStr = now.toLocaleDateString('en-CA', {
      timeZone: 'America/New_York',
    });

    const isSell = setup.direction === 'SELL';
    const newTrade: ForwardTestTrade = {
      id: `fwd-${Date.now()}`,
      title: `${liveMarketState.sevenHourSession.split(' ')[0]} ${setup.direction} Forward Test`,
      date: dateStr,
      session: liveMarketState.sevenHourSession,
      entryTimeNY: `${nyTimeStr} NY`,
      side: setup.direction === 'NO_SETUP' ? 'BUY' : setup.direction,
      entryPrice: setup.entryPrice || liveMarketState.currentPrice,
      slPrice: setup.slPrice || (isSell ? liveMarketState.currentPrice + 8 : liveMarketState.currentPrice - 8),
      tpPrice: setup.tpPrice || (isSell ? liveMarketState.currentPrice - 24 : liveMarketState.currentPrice + 24),
      slDistance: setup.slDistance || 8.0,
      rMultiple: 3.0,
      status: 'OPEN',
      pips: 0,
      confidenceScore: setup.confidenceScore || 9,
      passedRules: setup.passedItems.length > 0 ? setup.passedItems : ['Model#1 Entry Captured at Limit Line'],
      smtPair: 'Silver',
      keyLevel: `High: $${liveMarketState.dayHigh.toFixed(1)} / Low: $${liveMarketState.dayLow.toFixed(1)}`,
      tsSweepPrice: isSell ? liveMarketState.dayHigh : liveMarketState.dayLow,
      entrySnapshotUrl: '/assets/trade_screenshots/tradingview_trade_maanta.png',
      notes: `Toos loo qabtay xilligii entry-ga ($${(setup.entryPrice || liveMarketState.currentPrice).toFixed(2)}). Waxaa la sugayaa TP ($${(setup.tpPrice || 4004.7).toFixed(2)}) ama SL ($${(setup.slPrice || 4035.5).toFixed(2)}).`,
      accountRiskPct: 1.0,
      createdAt: Date.now(),
    };

    setForwardTrades((prev) => [newTrade, ...prev]);
  };

  // Action: Resolve trade to Take Profit (+3R WIN)
  const handleResolveTradeWin = (id: string) => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'America/New_York',
    });

    setForwardTrades((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;
        const pipsWon = Math.round(Math.abs(t.tpPrice - t.entryPrice) * 10);
        return {
          ...t,
          status: 'WIN',
          exitTimeNY: `${timeStr} NY`,
          pips: pipsWon,
          notes: `${t.notes} -> NATIIJADII: 3R Take Profit si buuxda ayaa loo gaaray (+${t.rMultiple}R / +${pipsWon} pips).`,
          updatedAt: Date.now(),
        };
      })
    );
  };

  // Action: Resolve trade to Stop Loss (-1R LOSS)
  const handleResolveTradeLoss = (id: string) => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'America/New_York',
    });

    setForwardTrades((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;
        const pipsLost = -Math.round(Math.abs(t.slPrice - t.entryPrice) * 10);
        return {
          ...t,
          status: 'LOSS',
          rMultiple: -1.0,
          exitTimeNY: `${timeStr} NY`,
          pips: pipsLost,
          notes: `${t.notes} -> NATIIJADII: Stop Loss ayaa ku dhacay (-1.0R / ${pipsLost} pips). Halista waxaa lagu koobay 1%.`,
          updatedAt: Date.now(),
        };
      })
    );
  };

  // Delete trade
  const handleDeleteTrade = (id: string) => {
    setForwardTrades((prev) => prev.filter((t) => t.id !== id));
  };

  // Send to Mode C Journal
  const handleExportToJournal = (trade: ForwardTestTrade) => {
    if (!onSendToJournal) return;
    onSendToJournal({
      date: trade.date,
      timeNY: trade.entryTimeNY.replace(' NY', ''),
      side: trade.side,
      entryPrice: trade.entryPrice,
      slPrice: trade.slPrice,
      tpPrice: trade.tpPrice,
      rMultiple: trade.rMultiple,
      result: trade.status === 'WIN' ? 'WIN' : trade.status === 'LOSS' ? 'LOSS' : 'OPEN',
      itemsPassed: trade.passedRules,
      notes: `[Forward Testing] ${trade.title}. ${trade.notes}`,
    });
  };

  // Download Forward Testing CSV
  const handleDownloadCsv = () => {
    const headers = [
      'ID',
      'Date',
      'Session',
      'Entry Time (NY)',
      'Exit Time (NY)',
      'Side',
      'Entry Price',
      'Stop Loss',
      'Take Profit',
      'R-Multiple',
      'Status',
      'Pips',
      'Checklist Score',
      'Notes',
    ];

    const rows = forwardTrades.map((t) => [
      t.id,
      t.date,
      `"${t.session}"`,
      t.entryTimeNY,
      t.exitTimeNY || 'OPEN',
      t.side,
      t.entryPrice.toFixed(2),
      t.slPrice.toFixed(2),
      t.tpPrice.toFixed(2),
      t.rMultiple,
      t.status,
      t.pips,
      `${t.confidenceScore}/11`,
      `"${t.notes.replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `model1_forward_testing_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* 1. Forward Testing Header Banner */}
      <div className="bg-slate-900/90 rounded-2xl p-6 border border-slate-800 shadow-xl space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-amber-500/20 to-sky-500/20 border border-amber-500/30 text-amber-400">
              <Camera className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg font-bold text-slate-100">
                  Model#1 Live Forward Testing &amp; Snapshot Tracker
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase font-mono bg-sky-500/20 text-sky-300 border border-sky-500/40">
                  FORWARD TESTING
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Qabashada screenshot-ka tooska ah markuu qiimuhu gaaro Entry #1 line, sugitaanka TP/SL, iyo xisaabinta Win Rate-ka rasmiga ah.
              </p>
            </div>
          </div>

          {/* Action buttons & Auto-capture toggle */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => setAutoCaptureEnabled((prev) => !prev)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
                autoCaptureEnabled
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-sm'
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}
              title="Toos u qabo screenshot & paper trade markuu setup buuxo gaaro Entry line"
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  autoCaptureEnabled ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'
                }`}
              />
              <span>Auto-Capture at Entry: {autoCaptureEnabled ? 'ON' : 'OFF'}</span>
            </button>

            <button
              type="button"
              onClick={handleCaptureCurrentLiveSetup}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition shadow-md shadow-amber-500/20"
              title="Qabo setup-ka hadda suuqa ka jira oo u kaydi sidii trade furan"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Qabo Setup Hadda (Entry Snapshot)</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadCsv}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition border border-slate-700"
              title="Dhoofi Forward Testing CSV"
            >
              <Download className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* 2. AGENT SUMMARY SECTION (1% RISK RULE) */}
        <div className="pt-4 border-t border-slate-800/80 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/40 flex items-center justify-center text-amber-400">
                <Briefcase className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
                    <span>Agent Summary</span>
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                    Live Model#1 Tracker
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Agent Active
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Xogta tooska ah ee live agent-ka, guulaha/khasaaraha, iyo faa'iidada is-biirsatay ee ku salaysan xeerka 1% halis ah.
                </p>
              </div>
            </div>

            {/* Account Capital Selector for 1% Risk Calculations */}
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-950 border border-slate-800 text-xs self-start sm:self-auto">
              <span className="text-[10px] text-slate-400 font-sans px-1.5 flex items-center gap-1">
                <DollarSign className="w-3 h-3 text-amber-400" />
                <span>Account:</span>
              </span>
              {[10000, 25000, 50000, 100000].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setAccountSize(amt)}
                  className={`px-2.5 py-1 rounded-lg font-mono text-[10px] font-semibold transition cursor-pointer ${
                    accountSize === amt
                      ? 'bg-amber-500 text-slate-950 font-bold shadow'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  ${amt >= 1000 ? `${amt / 1000}k` : amt}
                </button>
              ))}
            </div>
          </div>

          {/* 4 Agent Summary Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 font-mono">
            {/* Card 1: Live Agent Trade Count */}
            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-sky-400" />
                  Agent Trade Count
                </span>
                <span className="px-1.5 py-0.2 rounded bg-sky-500/10 text-sky-300 border border-sky-500/20 text-[9px] font-mono">
                  Live
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-extrabold text-slate-100">{totalTrades}</span>
                <span className="text-xs text-slate-500 font-sans">trades la fuliyay</span>
              </div>
              <div className="flex items-center justify-between pt-1 text-[11px] border-t border-slate-800/80">
                <span className="text-slate-400 font-sans">Xiran: <strong className="text-slate-200 font-mono">{closedTrades.length}</strong></span>
                <span className="text-amber-400 font-sans">Furan: <strong className="font-mono">{openTrades.length}</strong></span>
              </div>
            </div>

            {/* Card 2: Total Wins & Losses */}
            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 font-mono flex items-center gap-1.5">
                  <Scale className="w-3.5 h-3.5 text-emerald-400" />
                  Wins / Losses
                </span>
                <span className="px-1.5 py-0.2 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                  {winRate}% WR
                </span>
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-extrabold text-emerald-400">{winTrades.length}</span>
                <span className="text-xs text-emerald-400/80 font-sans font-semibold">Wins</span>
                <span className="text-slate-600 mx-1">/</span>
                <span className="text-xl font-bold text-rose-400">{lossTrades.length}</span>
                <span className="text-xs text-rose-400/80 font-sans font-semibold">Losses</span>
              </div>
              {/* Progress bar */}
              <div className="pt-1 space-y-0.5">
                <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden flex">
                  <div
                    className="h-full bg-emerald-500 transition-all duration-500"
                    style={{ width: `${closedTrades.length > 0 ? (winTrades.length / closedTrades.length) * 100 : 0}%` }}
                  />
                  <div
                    className="h-full bg-rose-500 transition-all duration-500"
                    style={{ width: `${closedTrades.length > 0 ? (lossTrades.length / closedTrades.length) * 100 : 0}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[9px] text-slate-500">
                  <span className="text-emerald-400 font-mono">{winTrades.length} guul</span>
                  <span className="text-rose-400 font-mono">{lossTrades.length} khasaare</span>
                </div>
              </div>
            </div>

            {/* Card 3: Cumulative Profit / Loss (1% Risk Rule) */}
            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-emerald-500/40 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300 font-mono flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                  Cumulative PnL (1% Risk)
                </span>
                <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[9px] font-bold">
                  {cumulativeGainPct >= 0 ? '+' : ''}{cumulativeGainPct.toFixed(1)}%
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className={`text-2xl font-extrabold ${cumulativeProfitDollars >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {cumulativeProfitDollars >= 0 ? '+' : ''}${cumulativeProfitDollars.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                <span className="text-xs font-bold text-amber-400">
                  (+{netR.toFixed(1)}R)
                </span>
              </div>
              <div className="flex items-center justify-between pt-1 text-[11px] border-t border-slate-800/80">
                <span className="text-slate-400 font-sans">Balance:</span>
                <span className="text-sky-300 font-bold font-mono">
                  ${currentAccountBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            {/* Card 4: Expectancy & Metrics */}
            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 font-mono flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-amber-400" />
                  Expectancy &amp; Pips
                </span>
                <span className="px-1.5 py-0.2 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30 text-[9px] font-bold">
                  PF: {profitFactor}x
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-extrabold text-sky-400">+{totalPips}</span>
                <span className="text-xs text-slate-400 font-sans">pips dahab ah</span>
              </div>
              <div className="flex items-center justify-between pt-1 text-[11px] border-t border-slate-800/80">
                <span className="text-slate-400 font-sans">Avg Return:</span>
                <span className="text-emerald-400 font-bold font-mono">+{avgRPerTrade.toFixed(2)}R/trade</span>
              </div>
            </div>
          </div>

          {/* 1% Risk Rule Engine Policy Strip */}
          <div className="p-3 rounded-xl bg-slate-950/90 border border-slate-800/90 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
            <div className="flex items-center gap-2 text-slate-300">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                <strong>Sharciga 1% Halista ah:</strong> Trade kasta waxaa lagu xisaabiyaa <strong>${riskPerTradeDollars.toFixed(0)} (1.00%)</strong>. Guul kasta (Fixed 3R) waxay dhalisaa <strong>+${winDollarPerTrade.toFixed(0)} (+3.00%)</strong>, khasaare kastana waa <strong>-${lossDollarPerTrade.toFixed(0)} (-1.00%)</strong>.
              </span>
            </div>
            <div className="flex items-center gap-1.5 shrink-0 font-mono text-[10px]">
              <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                Win: +3R (+$300)
              </span>
              <span className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-300 border border-rose-500/30">
                Loss: -1R (-$100)
              </span>
              <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30">
                Fixed 1:3 RR
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Open / Active Forward Test Alert Banner (If Any Trade Is Furan) */}
      {openTrades.length > 0 && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/20 via-slate-900 to-slate-950 border border-amber-500/50 shadow-xl space-y-3">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2.5">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500" />
              </span>
              <div>
                <h4 className="text-xs font-bold text-amber-300">
                  {openTrades.length} Trade ayaa hadda FURAN (Live Forward Testing):
                </h4>
                <p className="text-[11px] text-slate-400">
                  Waxaa la sugayaa suuqu inuu gaaro Take Profit (+3R) ama Stop Loss (-1R).
                </p>
              </div>
            </div>

            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
              SUGIT NATIIJADA
            </span>
          </div>

          {/* Quick resolve buttons for open trades */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
            {openTrades.map((trade) => (
              <div
                key={trade.id}
                className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                        trade.side === 'BUY'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : 'bg-rose-500/20 text-rose-400'
                      }`}
                    >
                      {trade.side}
                    </span>
                    <strong className="text-slate-100">{trade.title}</strong>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">{trade.entryTimeNY}</span>
                </div>

                <div className="grid grid-cols-3 gap-2 font-mono text-[11px]">
                  <div>
                    <span className="text-[10px] text-slate-500 block">Entry</span>
                    <span className="text-slate-200 font-bold">${trade.entryPrice.toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Stop Loss</span>
                    <span className="text-rose-400 font-bold">${trade.slPrice.toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Take Profit</span>
                    <span className="text-emerald-400 font-bold">${trade.tpPrice.toFixed(2)}</span>
                  </div>
                </div>

                {/* Outcome resolution buttons */}
                <div className="flex items-center gap-2 pt-1 border-t border-slate-800/60">
                  <span className="text-[10px] text-slate-400">Natiijada:</span>
                  <button
                    type="button"
                    onClick={() => handleResolveTradeWin(trade.id)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-[10px] transition"
                  >
                    <Target className="w-3 h-3" />
                    <span>TP Hit (+3R)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleResolveTradeLoss(trade.id)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 font-bold text-[10px] transition"
                  >
                    <Shield className="w-3 h-3" />
                    <span>SL Hit (-1R)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTvTradeId('bt-oct-28');
                      setShowTvChartModal(true);
                    }}
                    className="ml-auto inline-flex items-center gap-1 text-[10px] text-sky-400 hover:text-sky-300"
                  >
                    <Eye className="w-3 h-3" />
                    <span>Arag Chart</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. Filter Tabs Bar */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-950 border border-slate-800 text-xs">
          {[
            { id: 'ALL', label: `Dhammaan (${forwardTrades.length})` },
            { id: 'OPEN', label: `Furan (${openTrades.length})` },
            { id: 'WIN', label: `Guuleystay (${winTrades.length})` },
            { id: 'LOSS', label: `Khasaare (${lossTrades.length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTabFilter(tab.id as any)}
              className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                activeTabFilter === tab.id
                  ? 'bg-amber-500 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <span className="text-xs text-slate-500 font-mono">
          Win Rate: <strong className="text-emerald-400">{winRate}%</strong> (TET Model#1 XAUUSD)
        </span>
      </div>

      {/* 4. Forward Testing Trades Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTrades.map((trade) => {
          const isWin = trade.status === 'WIN';
          const isLoss = trade.status === 'LOSS';
          const isOpen = trade.status === 'OPEN';

          return (
            <div
              key={trade.id}
              className={`rounded-2xl border transition-all flex flex-col justify-between overflow-hidden ${
                isOpen
                  ? 'bg-amber-500/10 border-amber-500/50 shadow-lg shadow-amber-500/5'
                  : isWin
                  ? 'bg-slate-900/80 border-slate-800 hover:border-emerald-500/40'
                  : 'bg-slate-900/80 border-slate-800 hover:border-rose-500/40'
              }`}
            >
              <div className="p-4 space-y-3">
                {/* Header: Date, Session, Status Badge */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
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
                    <span className="text-[10px] text-slate-400 font-mono block mt-1">
                      {trade.entryTimeNY} {trade.exitTimeNY ? `→ ${trade.exitTimeNY}` : '• FURAN'}
                    </span>
                  </div>

                  <span
                    className={`px-2.5 py-0.5 rounded text-[11px] font-bold font-mono uppercase ${
                      isWin
                        ? 'bg-emerald-500 text-slate-950'
                        : isLoss
                        ? 'bg-rose-500 text-white'
                        : 'bg-amber-500 text-slate-950 animate-pulse'
                    }`}
                  >
                    {isWin
                      ? `+${trade.rMultiple}R`
                      : isLoss
                      ? `${trade.rMultiple}R`
                      : 'FURAN (OPEN)'}
                  </span>
                </div>

                {/* Title */}
                <h4 className="text-xs font-bold text-slate-100 line-clamp-1">{trade.title}</h4>

                {/* Real TradingView Snapshot Thumbnail Card for this specific trade */}
                {trade.entrySnapshotUrl && (
                  <div
                    onClick={() => {
                      setActiveTvTradeId(getTvTradeId(trade.id));
                      setShowTvChartModal(true);
                    }}
                    className="relative rounded-xl overflow-hidden border border-[#2a2e39] bg-[#131722] cursor-pointer group hover:border-amber-500/70 transition shadow-md select-none"
                    title="Guji si aad u furto shaxanka buuxa ee TradingView"
                  >
                    <img
                      src={trade.entrySnapshotUrl}
                      alt={trade.title}
                      className="w-full h-48 object-cover object-top opacity-90 group-hover:opacity-100 transition group-hover:scale-105 duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-transparent to-transparent flex items-end p-2.5 justify-between">
                      <span className="px-2 py-0.5 rounded bg-black/75 backdrop-blur text-[10px] font-mono text-amber-300 border border-amber-500/30 flex items-center gap-1">
                        <Camera className="w-3 h-3" />
                        <span>TradingView • {trade.date}</span>
                      </span>
                      <span className="px-2 py-0.5 rounded bg-black/75 text-[10px] font-sans text-slate-200 group-hover:text-amber-400 transition">
                        Guji si aad u weyneyso ↗
                      </span>
                    </div>
                  </div>
                )}

                {/* Trade Metrics: Entry, SL, TP */}
                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 grid grid-cols-3 gap-2 font-mono text-[11px]">
                  <div>
                    <span className="text-[10px] text-slate-500 block">Entry #1</span>
                    <span className="text-slate-200 font-bold">${trade.entryPrice.toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Stop Loss</span>
                    <span className="text-rose-400 font-bold">${trade.slPrice.toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Target TP</span>
                    <span className="text-emerald-400 font-bold">${trade.tpPrice.toFixed(2)}</span>
                  </div>
                </div>

                {/* Passed Rules Checklist Chips */}
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-500 font-mono block">
                    Shuruucda Buuxsantay ({trade.confidenceScore}/11):
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {trade.passedRules.slice(0, 3).map((r, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded text-[9.5px] bg-slate-950 border border-slate-800 text-slate-300 flex items-center gap-1 truncate max-w-full"
                      >
                        <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400 shrink-0" />
                        <span className="truncate">{r}</span>
                      </span>
                    ))}
                    {trade.passedRules.length > 3 && (
                      <span className="px-1.5 py-0.5 rounded text-[9.5px] bg-slate-800 text-slate-400">
                        +{trade.passedRules.length - 3} kale
                      </span>
                    )}
                  </div>
                </div>

                {/* Notes */}
                <p className="text-[11px] text-slate-400 line-clamp-2 italic leading-relaxed">
                  &ldquo;{trade.notes}&rdquo;
                </p>
              </div>

              {/* Card Footer: Action Buttons */}
              <div className="p-3 bg-slate-950/60 border-t border-slate-800/80 flex items-center justify-between gap-2 text-xs">
                {isOpen ? (
                  <div className="flex items-center gap-1.5 w-full justify-between">
                    <span className="text-[11px] text-amber-400 font-mono">Sugitaanka:</span>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleResolveTradeWin(trade.id)}
                        className="px-2.5 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-[10px] transition"
                      >
                        TP Hit (+3R)
                      </button>
                      <button
                        type="button"
                        onClick={() => handleResolveTradeLoss(trade.id)}
                        className="px-2.5 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 font-bold text-[10px] transition"
                      >
                        SL Hit (-1R)
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => handleExportToJournal(trade)}
                      className="inline-flex items-center gap-1 text-[11px] text-amber-400 hover:text-amber-300 font-semibold"
                    >
                      <BookmarkPlus className="w-3.5 h-3.5" />
                      <span>U dir Journal</span>
                    </button>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-500 font-mono">
                        {trade.pips > 0 ? `+${trade.pips} pips` : `${trade.pips} pips`}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleDeleteTrade(trade.id)}
                        className="text-slate-500 hover:text-rose-400 p-1 rounded hover:bg-slate-800 transition"
                        title="Tirtir forward test-kan"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* 5. TradingView Full Chart Modal */}
      {showTvChartModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
          <div className="relative w-full max-w-md my-auto">
            <TradingViewMobileChart
              initialTradeId={activeTvTradeId}
              onClose={() => setShowTvChartModal(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};
