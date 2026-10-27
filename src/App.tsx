/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { LiveMarketScanner } from './components/LiveMarketScanner';
import { ModeAVideo } from './components/ModeAVideo';
import { ModeBChartReview } from './components/ModeBChartReview';
import { ModeCLog } from './components/ModeCLog';
import { RiskCalculator } from './components/RiskCalculator';
import { KnowledgeBase } from './components/KnowledgeBase';
import { AIChatTab } from './components/AIChatTab';
import { ChartReplayBacktester } from './components/ChartReplayBacktester';
import { INITIAL_LOGS } from './constants/model1Data';
import { TradeLogEntry } from './types';
import { useMarketConditions } from './hooks/useMarketConditions';
import {
  Radio,
  Video,
  BarChart2,
  BookOpen,
  Calculator,
  Sparkles,
  MessageSquare,
  ShieldAlert,
  BellRing,
  Scissors,
  X,
} from 'lucide-react';

type TabType = 'SCANNER' | 'REPLAY' | 'CHART' | 'VIDEO' | 'LOG' | 'CALC' | 'KNOWLEDGE' | 'CHAT';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('SCANNER');
  const {
    marketState,
    isRefreshing,
    autoRefresh,
    currentScenario,
    notificationsEnabled,
    notificationPermission,
    latestAlert,
    refreshNow,
    setAutoRefresh,
    setScenario,
    toggleNotifications,
    testNotification,
    dismissAlert,
  } = useMarketConditions({ intervalMs: 15000 });

  const [logs, setLogs] = useState<TradeLogEntry[]>(() => {
    const saved = localStorage.getItem('model1_trade_logs');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return INITIAL_LOGS;
      }
    }
    return INITIAL_LOGS;
  });

  const [prefilledLog, setPrefilledLog] = useState<Partial<TradeLogEntry> | null>(null);

  useEffect(() => {
    localStorage.setItem('model1_trade_logs', JSON.stringify(logs));
  }, [logs]);

  const handleAddLog = (entry: Omit<TradeLogEntry, 'id' | 'createdAt'>) => {
    const newEntry: TradeLogEntry = {
      ...entry,
      id: `log-${Date.now()}`,
      createdAt: Date.now(),
    };
    setLogs((prev) => [newEntry, ...prev]);
  };

  const handleDeleteLog = (id: string) => {
    setLogs((prev) => prev.filter((l) => l.id !== id));
  };

  const handleSendToLog = (prefillData: Partial<TradeLogEntry>) => {
    setPrefilledLog(prefillData);
    setActiveTab('LOG');
  };

  const handleSendToReview = (_scores: Record<string, any>, _side: 'BUY' | 'SELL') => {
    setActiveTab('CHART');
  };

  return (
    <div className="min-h-screen bg-[#090b10] text-slate-100 flex flex-col font-sans selection:bg-amber-500/30 selection:text-amber-200">
      {/* Live NY Clock & Session Header */}
      <Header />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Navigation Tabs Bar */}
        <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-slate-950/80 border border-slate-800/80 overflow-x-auto scrollbar-none shadow-lg">
          <button
            type="button"
            onClick={() => setActiveTab('SCANNER')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition shrink-0 ${
              activeTab === 'SCANNER'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
            }`}
          >
            <div className="relative">
              <Radio className="w-4 h-4" />
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            </div>
            <span>Live Scanner &amp; Bias</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('REPLAY')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition shrink-0 ${
              activeTab === 'REPLAY'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
            }`}
          >
            <Scissors className="w-4 h-4" />
            <span>Chart Replay (May–July)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('CHART')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition shrink-0 ${
              activeTab === 'CHART'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
            }`}
          >
            <BarChart2 className="w-4 h-4" />
            <span>Mode B: Shaxanka (11 Checklist)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('VIDEO')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition shrink-0 ${
              activeTab === 'VIDEO'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
            }`}
          >
            <Video className="w-4 h-4" />
            <span>Mode A: Muuqaal (Video)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('LOG')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition shrink-0 ${
              activeTab === 'LOG'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Mode C: Journal &amp; CSV ({logs.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('CALC')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition shrink-0 ${
              activeTab === 'CALC'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
            }`}
          >
            <Calculator className="w-4 h-4" />
            <span>Xisaabiyaha 1% &amp; Lots</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('KNOWLEDGE')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition shrink-0 ${
              activeTab === 'KNOWLEDGE'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Aqoonta &amp; UNKNOWNs</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('CHAT')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition shrink-0 ${
              activeTab === 'CHAT'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Kaaliyaha AI (Somali Chat)</span>
          </button>
        </div>

        {/* Global Alert Banner when user is in another tab (Mode A, Mode B, Log, etc.) */}
        {latestAlert && activeTab !== 'SCANNER' && (
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/20 via-slate-900 to-slate-950 border border-amber-500/40 text-amber-200 text-xs flex items-center justify-between gap-4 shadow-xl shadow-amber-500/10 backdrop-blur">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center shrink-0">
                <BellRing className="w-4 h-4 text-amber-400 animate-pulse" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <strong className="text-amber-300 font-bold">{latestAlert.title}</strong>
                  <span className="text-[10px] text-amber-400 font-mono">[{latestAlert.timestamp}]</span>
                </div>
                <p className="text-slate-300 text-[11px] truncate">{latestAlert.body}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setActiveTab('SCANNER')}
                className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition shadow-md shadow-amber-500/20"
              >
                Eeg Scanner-ka
              </button>
              <button
                type="button"
                onClick={dismissAlert}
                className="text-slate-400 hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-800 transition"
                title="Xir ogeysiiskan"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Tab Viewport */}
        <div>
          {activeTab === 'SCANNER' && (
            <LiveMarketScanner
              scannerState={marketState}
              loading={isRefreshing}
              autoSync={autoRefresh}
              activeScenario={currentScenario}
              notificationsEnabled={notificationsEnabled}
              notificationPermission={notificationPermission}
              latestAlert={latestAlert}
              onToggleAutoSync={() => setAutoRefresh((prev) => !prev)}
              onRefresh={refreshNow}
              onScenarioSwitch={setScenario}
              onToggleNotifications={toggleNotifications}
              onTestNotification={testNotification}
              onDismissAlert={dismissAlert}
              onSendToReview={handleSendToReview}
              onSendToLog={handleSendToLog}
            />
          )}
          {activeTab === 'REPLAY' && <ChartReplayBacktester onSendToLog={handleSendToLog} />}
          {activeTab === 'CHART' && <ModeBChartReview onSendToLog={handleSendToLog} />}
          {activeTab === 'VIDEO' && <ModeAVideo />}
          {activeTab === 'LOG' && (
            <ModeCLog
              logs={logs}
              onAddLog={handleAddLog}
              onDeleteLog={handleDeleteLog}
              prefill={prefilledLog}
              onClearPrefill={() => setPrefilledLog(null)}
            />
          )}
          {activeTab === 'CALC' && <RiskCalculator />}
          {activeTab === 'KNOWLEDGE' && <KnowledgeBase />}
          {activeTab === 'CHAT' && <AIChatTab />}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950/60 py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Model#1 Gold Study Agent • XAUUSD ICT Mentorship (TET Community 2026)</span>
          <span className="flex items-center gap-1.5 text-amber-500/80">
            <ShieldAlert className="w-3.5 h-3.5" />
            Qalab waxbarasho kaliya — Ma bixiyo talo maaliyadeed ama buy/sell signals.
          </span>
        </div>
      </footer>
    </div>
  );
}
