import React, { useState } from 'react';
import { DailyRecapData } from '../types';
import { DAILY_RECAPS_DATA } from '../constants/dailyRecapData';
import {
  Calendar,
  Clock,
  Compass,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Sparkles,
  Volume2,
  VolumeX,
  Copy,
  Check,
  TrendingDown,
  TrendingUp,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  Zap,
  Info,
  Maximize2,
  Eye,
  X,
  Image as ImageIcon,
} from 'lucide-react';

interface Props {
  onNavigateToForward?: (tradeId?: string) => void;
  onNavigateToScanner?: () => void;
}

export const DailyMarketRecap: React.FC<Props> = ({ onNavigateToForward, onNavigateToScanner }) => {
  const [selectedRecapId, setSelectedRecapId] = useState<string>(DAILY_RECAPS_DATA[0].id);
  const [copied, setCopied] = useState<boolean>(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [aiGenerating, setAiGenerating] = useState<boolean>(false);
  const [dynamicAiSummary, setDynamicAiSummary] = useState<Record<string, string>>({});
  const [modalImage, setModalImage] = useState<string | null>(null);

  const currentRecap = DAILY_RECAPS_DATA.find((r) => r.id === selectedRecapId) || DAILY_RECAPS_DATA[0];

  const handleCopySummary = () => {
    const textToCopy = dynamicAiSummary[currentRecap.id] || currentRecap.aiGeneratedSummary;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleToggleAudio = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      alert('Browser-kaagu ma taageero codka (SpeechSynthesis).');
      return;
    }

    if (isPlayingAudio) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
      return;
    }

    const textToSpeak = `${currentRecap.dayOfWeek}, ${currentRecap.date}. Daily Market Recap Dahabka XAUUSD Model#1. ${currentRecap.ictOpportunity.summarySomali}. Qodobka ugu weyn: ${currentRecap.keyLessonSomali}`;
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.rate = 0.95;
    utterance.pitch = 1.0;
    utterance.onend = () => setIsPlayingAudio(false);
    utterance.onerror = () => setIsPlayingAudio(false);

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
    setIsPlayingAudio(true);
  };

  const handleGenerateFreshAiSummary = async () => {
    setAiGenerating(true);
    try {
      const res = await fetch('/api/daily-recap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recapData: currentRecap,
        }),
      });

      const data = await res.json();
      if (data && data.summary) {
        setDynamicAiSummary((prev) => ({
          ...prev,
          [currentRecap.id]: data.summary,
        }));
      }
    } catch (e) {
      console.warn('Could not generate dynamic summary, keeping default:', e);
    } finally {
      setAiGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-slate-900/90 rounded-2xl p-6 border border-slate-800 shadow-xl backdrop-blur relative overflow-hidden">
        <div className="absolute -top-16 -right-16 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-800/80">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold mb-2">
              <Calendar className="w-3.5 h-3.5" />
              <span>Daily Market Recap (XAUUSD ICT Model#1)</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-100 flex items-center gap-2.5">
              <span>Soo Koobidda Suuqa Maalinlaha ah</span>
              <span className="text-xs px-2.5 py-0.5 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-semibold">
                Asian Session ilaa NY Session
              </span>
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
              Falanqeyn toos ah oo ku bilaabata <strong className="text-slate-200">Asian Session</strong> (halka uu range-ku ka bilaabmo), kana gudubta <strong className="text-slate-200">London Open</strong>, ilaa daaqadda dahabiga ah ee <strong className="text-amber-400">NY Prime Purge (08:00 - 10:00 AM NY)</strong> si loo xaqiijiyo haddii ay dhacday fursad Model#1 ah ama haddii suuqu fadhiyay.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleGenerateFreshAiSummary}
              disabled={aiGenerating}
              type="button"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition shadow-md shadow-amber-500/20 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${aiGenerating ? 'animate-spin' : ''}`} />
              <span>{aiGenerating ? 'La Falanqeynayaa...' : 'Soo Saari Summary AI ah'}</span>
            </button>
            <button
              onClick={handleToggleAudio}
              type="button"
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-semibold transition ${
                isPlayingAudio
                  ? 'bg-rose-500/20 border-rose-500 text-rose-300'
                  : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300'
              }`}
              title="Dhageyso Cod ahaan"
            >
              {isPlayingAudio ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-amber-400" />}
              <span>{isPlayingAudio ? 'Jooji Codka' : 'Dhageyso'}</span>
            </button>
          </div>
        </div>

        {/* Date Selector Row */}
        <div className="pt-4 flex items-center gap-2 overflow-x-auto scrollbar-none pb-1">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1">Dooro Maalinta:</span>
          {DAILY_RECAPS_DATA.map((recap) => {
            const isSelected = recap.id === currentRecap.id;
            const isWin = recap.ictOpportunity.status === 'WIN';
            const isNoTrade = recap.ictOpportunity.status === 'NO_SETUP';

            return (
              <button
                key={recap.id}
                onClick={() => setSelectedRecapId(recap.id)}
                type="button"
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition shrink-0 border ${
                  isSelected
                    ? 'bg-slate-800 text-amber-400 border-amber-500/50 shadow-md shadow-amber-500/10'
                    : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <span>{recap.date === '2026-10-30' ? '★ MAANTA (30 Oct)' : recap.date === '2026-10-29' ? 'Shalay (29 Oct)' : recap.date}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded font-black ${
                    isWin
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : isNoTrade
                      ? 'bg-slate-800 text-slate-400 border border-slate-700'
                      : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                  }`}
                >
                  {isWin ? `+${recap.ictOpportunity.rMultiple || 3.0}R WIN` : isNoTrade ? 'NO TRADE' : 'LOSS'}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Day Verdict & Highlight Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Setup Verdict */}
        <div className={`p-4 rounded-2xl border shadow-lg ${
          currentRecap.ictOpportunity.status === 'WIN'
            ? 'bg-emerald-950/30 border-emerald-500/30'
            : currentRecap.ictOpportunity.status === 'NO_SETUP'
            ? 'bg-amber-950/20 border-amber-500/30'
            : 'bg-rose-950/20 border-rose-500/30'
        }`}>
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Go'aanka NY Session</div>
          <div className="mt-2 flex items-center gap-2">
            {currentRecap.ictOpportunity.status === 'WIN' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            ) : currentRecap.ictOpportunity.status === 'NO_SETUP' ? (
              <ShieldCheck className="w-5 h-5 text-amber-400 shrink-0" />
            ) : (
              <XCircle className="w-5 h-5 text-rose-400 shrink-0" />
            )}
            <div className="text-base font-black text-slate-100">
              {currentRecap.ictOpportunity.status === 'WIN'
                ? `FURSAD GUULEYSATAY (+${currentRecap.ictOpportunity.rMultiple}R)`
                : currentRecap.ictOpportunity.status === 'NO_SETUP'
                ? 'MA JIRIN TRADE (SUUQ FADHIYA)'
                : 'LOSS (-1.0R)'}
            </div>
          </div>
          <div className="text-xs text-slate-400 mt-1">
            {currentRecap.ictOpportunity.status === 'WIN'
              ? `${currentRecap.ictOpportunity.direction} setup saacadda ${currentRecap.ictOpportunity.triggerTimeNY}`
              : 'Ilaalinta raasumaalka (Capital Preservation)'}
          </div>
        </div>

        {/* Card 2: Asian Session Range (Candle 1 CRT) */}
        <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 shadow-lg">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
            <span>Asian Dealing Range</span>
            <span className="text-indigo-400 font-mono">Candle 1</span>
          </div>
          <div className="mt-2 text-base font-black text-slate-100 font-mono">
            ${currentRecap.asianRange.low.toFixed(2)} — ${currentRecap.asianRange.high.toFixed(2)}
          </div>
          <div className="text-xs text-slate-400 mt-1 flex items-center justify-between">
            <span>Baaxadda: <strong className="text-slate-200">{currentRecap.asianRange.pipsWidth} pips</strong></span>
            <span>EQ: <strong className="text-amber-400 font-mono">${currentRecap.asianRange.midpoint.toFixed(2)}</strong></span>
          </div>
        </div>

        {/* Card 3: Daily High / Low & Bias */}
        <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 shadow-lg">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
            <span>Daily Bias &amp; High/Low</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded font-black ${
              currentRecap.dailyBias === 'BEARISH'
                ? 'bg-rose-500/20 text-rose-400'
                : currentRecap.dailyBias === 'BULLISH'
                ? 'bg-emerald-500/20 text-emerald-400'
                : 'bg-slate-800 text-slate-400'
            }`}>
              {currentRecap.dailyBias}
            </span>
          </div>
          <div className="mt-2 text-sm font-bold text-slate-200 font-mono flex items-center justify-between">
            <span className="text-emerald-400">High: ${currentRecap.dayHigh.toFixed(2)}</span>
            <span className="text-rose-400">Low: ${currentRecap.dayLow.toFixed(2)}</span>
          </div>
          <div className="text-xs text-slate-400 mt-1 truncate" title={currentRecap.dolNarrative}>
            DOL: {currentRecap.dolNarrative}
          </div>
        </div>

        {/* Card 4: Model#1 Checklist Score */}
        <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 shadow-lg">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
            <span>Model#1 Checklist</span>
            <span className="text-amber-400 font-bold">{currentRecap.ictOpportunity.checklistPassedCount} / 11 Sax</span>
          </div>
          <div className="mt-2 flex items-center gap-2">
            <div className="flex-1 bg-slate-800 rounded-full h-2 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  currentRecap.ictOpportunity.checklistPassedCount >= 8
                    ? 'bg-emerald-500'
                    : currentRecap.ictOpportunity.checklistPassedCount >= 5
                    ? 'bg-amber-500'
                    : 'bg-rose-500'
                }`}
                style={{ width: `${(currentRecap.ictOpportunity.checklistPassedCount / 11) * 100}%` }}
              />
            </div>
            <span className="text-xs font-mono font-bold text-slate-300">
              {Math.round((currentRecap.ictOpportunity.checklistPassedCount / 11) * 100)}%
            </span>
          </div>
          <div className="text-xs text-slate-400 mt-1.5 flex items-center justify-between">
            <span>{currentRecap.ictOpportunity.checklistPassedCount >= 8 ? 'A+ High Confidence' : 'Kuma Filna Setup'}</span>
            {currentRecap.snapshotUrl && (
              <button
                type="button"
                onClick={() => setModalImage(currentRecap.snapshotUrl!)}
                className="inline-flex items-center gap-1 text-sky-400 hover:text-sky-300 font-bold"
              >
                <span>Snapshot</span>
                <Eye className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Visual Chart Snapshot & Proof Banner */}
      {currentRecap.snapshotUrl && (
        <div className="bg-gradient-to-r from-slate-900 via-slate-900/95 to-amber-950/20 rounded-2xl p-5 border border-amber-500/30 shadow-xl flex flex-col md:flex-row items-center gap-5">
          <div
            onClick={() => setModalImage(currentRecap.snapshotUrl!)}
            className="relative group cursor-pointer w-full md:w-80 h-48 rounded-xl overflow-hidden border border-slate-700 bg-slate-950 shrink-0 shadow-lg hover:border-amber-400 transition"
          >
            <img
              src={currentRecap.snapshotUrl}
              alt="Trade Snapshot"
              className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
            />
            <div className="absolute inset-0 bg-slate-950/40 group-hover:bg-slate-950/10 transition flex items-center justify-center">
              <span className="px-3 py-1.5 rounded-lg bg-slate-900/90 text-amber-400 text-xs font-bold flex items-center gap-1.5 border border-amber-500/30 shadow-lg group-hover:scale-110 transition">
                <Maximize2 className="w-3.5 h-3.5" />
                <span>Guji si aad u weyneyso</span>
              </span>
            </div>
          </div>

          <div className="flex-1 space-y-2.5 text-left w-full">
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Caddaynta Bulshada (#charters-best-trades)
              </span>
              <span className="text-xs text-slate-400">AIDARUS FX &amp; Abdul FX</span>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-slate-100">
              1h Sequence &amp; 10PM Asia Purge Setup ($4,015.60 &rarr; $3,992.05)
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              &ldquo;Markastood 1h sequance ga socda raacdo guulaystuhu waa adi 🦁 Happy friday sxbyal ❤️ KOD 🔍&rdquo; — <strong>AIDARUS FX</strong> (FP#1).
              Abdul FX ayaa xaqiijiyay 1:3 RR guul ah ("1:3rr 🤝") markii qiimuhu gaaray DCRL ($3,992.05).
            </p>
            <div className="flex flex-wrap gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => setModalImage(currentRecap.snapshotUrl!)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-semibold transition"
              >
                <Eye className="w-3.5 h-3.5 text-amber-400" />
                <span>Eeg Chart-ka 1h (OANDA $3,992.05)</span>
              </button>
              <button
                type="button"
                onClick={() => setModalImage('/assets/aistudio/Screenshot_20261030_143404_Discord_e47d271a.jpg')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-950/60 hover:bg-indigo-900/60 border border-indigo-500/30 text-indigo-300 text-xs font-semibold transition"
              >
                <ImageIcon className="w-3.5 h-3.5 text-indigo-400" />
                <span>Eeg Discord Post-ka (#charters-best-trades)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Breakdown: Session-by-Session Timeline */}
      <div className="bg-slate-900/80 rounded-2xl p-6 border border-slate-800 shadow-xl space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-100 flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-400" />
              <span>Qulqulka Maalinta: Asian Session ilaa New York Close</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Sida uu qiimaha Dahabku u dhaqmay session kasta iyo natiijada ka dhalatay.
            </p>
          </div>
          <div className="hidden sm:block text-xs font-mono text-slate-500">
            XAUUSD • ICT Model#1 Sequence
          </div>
        </div>

        <div className="space-y-4">
          {currentRecap.sessions.map((session, index) => {
            const isPrimeNy = session.sessionName.includes('New York Prime');
            const isAsian = session.sessionName.includes('Asian');

            return (
              <div
                key={index}
                className={`p-5 rounded-2xl border transition-all ${
                  isPrimeNy
                    ? 'bg-gradient-to-r from-amber-500/10 via-slate-900 to-slate-900/90 border-amber-500/40 shadow-lg shadow-amber-500/5 ring-1 ring-amber-500/20'
                    : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800/60">
                  <div className="flex items-center gap-2.5">
                    <span className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-black ${
                      isPrimeNy
                        ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/30'
                        : isAsian
                        ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                        : 'bg-slate-800 text-slate-300'
                    }`}>
                      {index + 1}
                    </span>
                    <div>
                      <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                        <span>{session.sessionName}</span>
                        {isPrimeNy && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold uppercase tracking-wider animate-pulse">
                            Daaqadda Fursadda
                          </span>
                        )}
                      </h3>
                      <div className="text-[11px] font-mono text-slate-400">
                        {session.timeWindowNY}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-xs font-mono">
                    <div className="text-slate-400">
                      High: <strong className="text-emerald-400">${session.high.toFixed(2)}</strong>
                    </div>
                    <div className="text-slate-400">
                      Low: <strong className="text-rose-400">${session.low.toFixed(2)}</strong>
                    </div>
                    <div className="text-slate-400">
                      Range: <strong className="text-slate-200">{session.pipsRange} pips</strong>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 text-xs">
                  <div>
                    <div className="text-slate-400 font-semibold mb-1 flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-amber-400" />
                      <span>Dhacdadii Purge-ka &amp; Liquidity:</span>
                    </div>
                    <p className="text-slate-300 leading-relaxed bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/60">
                      {session.purgeEvent}
                    </p>
                  </div>

                  <div>
                    <div className="text-slate-400 font-semibold mb-1 flex items-center gap-1.5">
                      <Compass className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Xaaladda SMT &amp; Lammaanaha (Silver/XAUEUR):</span>
                    </div>
                    <p className="text-slate-300 leading-relaxed bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/60">
                      {session.smtStatus}
                    </p>
                  </div>
                </div>

                {session.setupSummary && (
                  <div className="mt-3 p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs flex items-center justify-between gap-2">
                    <div className="text-slate-200 font-semibold flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>{session.setupSummary}</span>
                    </div>
                    {session.setupDetected && onNavigateToForward && (
                      <button
                        onClick={() => onNavigateToForward(currentRecap.ictOpportunity.tradeId)}
                        type="button"
                        className="px-2.5 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-[11px] transition shrink-0"
                      >
                        Eeg Forward Test-ka
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ICT Checklist Detail & Reasoning */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Checklist Details */}
        <div className="bg-slate-900/80 rounded-2xl p-6 border border-slate-800 shadow-xl space-y-4">
          <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Qiimeynta 11-ka Qodob ee Model#1</span>
          </h3>

          <div className="space-y-2">
            <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
              Qodobbada Saxda Noqday ({currentRecap.ictOpportunity.checklistPassedList.length}):
            </div>
            {currentRecap.ictOpportunity.checklistPassedList.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2 text-xs text-slate-300 bg-emerald-950/20 border border-emerald-500/20 px-3 py-1.5 rounded-lg">
                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>{item}</span>
              </div>
            ))}

            {currentRecap.ictOpportunity.checklistFailedList.length > 0 && (
              <>
                <div className="text-xs font-bold text-rose-400 uppercase tracking-wider pt-2">
                  Qodobbada Maqnaa / Fashilmay ({currentRecap.ictOpportunity.checklistFailedList.length}):
                </div>
                {currentRecap.ictOpportunity.checklistFailedList.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs text-slate-400 bg-rose-950/20 border border-rose-500/20 px-3 py-1.5 rounded-lg">
                    <XCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </>
            )}
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1">
            <div className="text-slate-400 font-bold">Sababta Go'aanka:</div>
            <div className="text-slate-300 leading-relaxed">
              {currentRecap.ictOpportunity.reasoningWhyNoSetupOrWin}
            </div>
          </div>
        </div>

        {/* Right: Automated AI Summary Card */}
        <div className="bg-slate-900/80 rounded-2xl p-6 border border-slate-800 shadow-xl flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <h3 className="text-base font-bold text-slate-100">
                  Qoraalka Falanqaynta ee AI-ga (Daily Summary)
                </h3>
              </div>
              <button
                onClick={handleCopySummary}
                type="button"
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
                title="Koobi garee qoraalka"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Waa la koobiyey' : 'Koobi'}</span>
              </button>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/90 border border-slate-800 text-xs font-mono text-slate-300 whitespace-pre-line leading-relaxed max-h-72 overflow-y-auto">
              {dynamicAiSummary[currentRecap.id] || currentRecap.aiGeneratedSummary}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs space-y-1">
            <div className="text-amber-400 font-bold flex items-center gap-1.5">
              <Info className="w-4 h-4" />
              <span>Casharka Maalinta (Trading Discipline &amp; Psychology):</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              {currentRecap.keyLessonSomali}
            </p>
          </div>
        </div>
      </div>

      {/* Lightbox Modal */}
      {modalImage && (
        <div
          onClick={() => setModalImage(null)}
          className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-4xl w-full max-h-[92vh] bg-slate-900 border border-slate-700 rounded-2xl overflow-hidden shadow-2xl flex flex-col"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-950">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-bold text-amber-400">
                  Chart Proof • AIDARUS FX &amp; Abdul FX (1h Sequence / 10PM Purge)
                </span>
              </div>
              <button
                type="button"
                onClick={() => setModalImage(null)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-3 overflow-auto max-h-[82vh] flex items-center justify-center bg-black/70">
              <img
                src={modalImage}
                alt="Enlarged Trade Chart"
                className="max-w-full max-h-[78vh] object-contain rounded-lg shadow-xl"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
