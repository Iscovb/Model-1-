import React, { useEffect, useState } from 'react';
import { getNYTimeStatus, NYTimeStatus } from '../utils/nyTime';
import { Clock, ShieldAlert, Sparkles, TrendingUp, Zap } from 'lucide-react';

export const Header: React.FC = () => {
  const [nyStatus, setNyStatus] = useState<NYTimeStatus>(getNYTimeStatus());

  useEffect(() => {
    const timer = setInterval(() => {
      setNyStatus(getNYTimeStatus());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="border-b border-amber-500/20 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          
          {/* Logo & Model Branding */}
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-700 flex items-center justify-center shadow-lg shadow-amber-500/20 border border-amber-300/40">
              <span className="font-bold text-slate-950 text-xl tracking-tight font-mono">M#1</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-slate-100 tracking-tight flex items-center gap-1.5">
                  Model#1 Gold Study Agent
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">
                    XAUUSD Kaliya
                  </span>
                </h1>
              </div>
              <p className="text-xs text-slate-400">
                ICT Mentorship (TET Community 2026) • Af-Soomaali • Kaaliye Barasho Nadiif ah
              </p>
            </div>
          </div>

          {/* Live Market Clocks & Purge Tracker */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs">
            {/* Live NY Time & Somalia / EAT Time */}
            <div className="flex items-center gap-3 px-3 py-1.5 rounded-lg bg-slate-900/90 border border-slate-800 text-slate-200">
              <Clock className="w-3.5 h-3.5 text-amber-400 animate-pulse shrink-0" />
              <div className="flex items-center gap-3 divide-x divide-slate-800">
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-amber-400/90 block font-mono font-semibold">
                    NY Time (Model#1)
                  </span>
                  <span className="font-mono font-bold text-amber-400 text-sm">
                    {nyStatus.formattedTime}
                  </span>
                </div>
                <div className="pl-3">
                  <span className="text-[10px] uppercase tracking-wider text-slate-400 block font-mono">
                    Soomaaliya (EAT)
                  </span>
                  <span className="font-mono font-bold text-slate-300 text-sm">
                    {nyStatus.eatFormattedTime}
                  </span>
                </div>
              </div>
            </div>

            {/* 7H Session Indicator */}
            <div
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border ${
                nyStatus.isWeekendMarketClosed
                  ? 'bg-rose-950/40 border-rose-500/40 text-rose-300'
                  : 'bg-slate-900/90 border-slate-800 text-slate-300'
              }`}
            >
              <TrendingUp
                className={`w-3.5 h-3.5 ${
                  nyStatus.isWeekendMarketClosed ? 'text-rose-400' : 'text-sky-400'
                }`}
              />
              <div>
                <span className="text-[10px] uppercase tracking-wider text-slate-400 block font-mono">
                  {nyStatus.isWeekendMarketClosed ? 'Suuqa Xaaladdiisa' : '7H Session'}
                </span>
                <span
                  className={`font-semibold ${
                    nyStatus.isWeekendMarketClosed ? 'text-rose-300' : 'text-sky-300'
                  }`}
                >
                  {nyStatus.activeSession.name}
                </span>
              </div>
            </div>

            {/* Purge Hour Badge */}
            <div
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all ${
                nyStatus.isWeekendMarketClosed
                  ? 'bg-rose-950/20 border-rose-500/30 text-rose-300/90'
                  : nyStatus.isPurgeWindow
                  ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300 shadow-md shadow-emerald-500/10'
                  : 'bg-slate-900/90 border-slate-800 text-slate-400'
              }`}
            >
              <Zap
                className={`w-3.5 h-3.5 ${
                  nyStatus.isWeekendMarketClosed
                    ? 'text-rose-400'
                    : nyStatus.isPurgeWindow
                    ? 'text-emerald-400 fill-emerald-400'
                    : 'text-slate-500'
                }`}
              />
              <div>
                <span className="text-[10px] uppercase tracking-wider block font-mono">
                  {nyStatus.isWeekendMarketClosed
                    ? 'MARKET STATUS'
                    : nyStatus.isPurgeWindow
                    ? '🔥 PURGE HOOR ACTIVE'
                    : 'PURGE STATUS'}
                </span>
                <span className="font-medium text-xs">
                  {nyStatus.isPurgeWindow
                    ? nyStatus.activePurgeName
                    : nyStatus.nextPurgeDescription}
                </span>
              </div>
            </div>

            {/* Strict Rules Pill */}
            <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[11px] font-medium">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
              <span>Risk 1% • 3R Target • No Signals</span>
            </div>
          </div>

        </div>
      </div>
    </header>
  );
};
