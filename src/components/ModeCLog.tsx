import React, { useState, useEffect } from 'react';
import { TradeLogEntry } from '../types';
import { formatTradeToCsvRow, formatAllTradesToCsv, downloadCsvFile } from '../utils/csvHelper';
import { BookOpen, Download, Copy, Check, Plus, Trash2, Filter, TrendingUp, AlertTriangle, CheckCircle, Tag, Star } from 'lucide-react';
import { CumulativeRChart } from './CumulativeRChart';

interface Props {
  logs: TradeLogEntry[];
  onAddLog: (entry: Omit<TradeLogEntry, 'id' | 'createdAt'>) => void;
  onDeleteLog: (id: string) => void;
  prefill?: Partial<TradeLogEntry> | null;
  onClearPrefill?: () => void;
}

const COMMON_TAGS = [
  'Orderflow',
  'IRL to ERL',
  'ERL to IRL',
  'KL',
  'CRT',
  'purge',
  'PSP',
  'TS',
  'M#1',
  'SMT',
  '5 min',
  'Major LQ',
];

export const ModeCLog: React.FC<Props> = ({ logs, onAddLog, onDeleteLog, prefill, onClearPrefill }) => {
  const [showAddForm, setShowAddForm] = useState(!!prefill);
  const [filterResult, setFilterResult] = useState<string>('ALL');
  const [filterSide, setFilterSide] = useState<string>('ALL');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);

  // Form State
  const [date, setDate] = useState(prefill?.date || new Date().toISOString().split('T')[0]);
  const [timeNY, setTimeNY] = useState(prefill?.timeNY || '08:15');
  const [side, setSide] = useState<'BUY' | 'SELL'>(prefill?.side || 'BUY');
  const [entryPrice, setEntryPrice] = useState<string>(prefill?.entryPrice ? prefill.entryPrice.toString() : '2150.00');
  const [slPrice, setSlPrice] = useState<string>(prefill?.slPrice ? prefill.slPrice.toString() : '2140.50');
  const [tpPrice, setTpPrice] = useState<string>(prefill?.tpPrice ? prefill.tpPrice.toString() : '2178.50');
  const [result, setResult] = useState<'WIN' | 'LOSS' | 'MISSED' | 'INVALIDATION' | 'OPEN'>(prefill?.result || 'WIN');
  const [confidenceScore, setConfidenceScore] = useState<number>(prefill?.confidenceScore ?? 5);
  const [selectedTags, setSelectedTags] = useState<string[]>(prefill?.itemsPassed || ['IRL to ERL', 'KL', 'CRT', 'purge', 'TS', 'SMT', '5 min']);
  const [notes, setNotes] = useState(prefill?.notes || '');

  // Synchronize prefill whenever it changes
  useEffect(() => {
    if (prefill) {
      setShowAddForm(true);
      if (prefill.date) setDate(prefill.date);
      if (prefill.timeNY) setTimeNY(prefill.timeNY);
      if (prefill.side) setSide(prefill.side);
      if (prefill.entryPrice !== undefined) setEntryPrice(prefill.entryPrice.toString());
      if (prefill.slPrice !== undefined) setSlPrice(prefill.slPrice.toString());
      if (prefill.tpPrice !== undefined) setTpPrice(prefill.tpPrice.toString());
      if (prefill.result) setResult(prefill.result);
      if (prefill.itemsPassed) setSelectedTags(prefill.itemsPassed);
      if (prefill.notes) setNotes(prefill.notes);
      if (prefill.confidenceScore !== undefined) setConfidenceScore(prefill.confidenceScore);
    }
  }, [prefill]);

  // Calculate R
  const numEntry = parseFloat(entryPrice) || 0;
  const numSl = parseFloat(slPrice) || 0;
  const numTp = parseFloat(tpPrice) || 0;

  const isSlOrientationInvalid =
    numEntry > 0 && numSl > 0 && (side === 'SELL' ? numSl <= numEntry : numSl >= numEntry);
  const isTpOrientationInvalid =
    numEntry > 0 && numTp > 0 && (side === 'SELL' ? numTp >= numEntry : numTp <= numEntry);

  const slDistance = Math.abs(numEntry - numSl);
  const tpDistance = Math.abs(numTp - numEntry);
  const calculatedR = slDistance > 0 ? parseFloat((tpDistance / slDistance).toFixed(1)) : 3.0;

  const handleSideChange = (newSide: 'BUY' | 'SELL') => {
    setSide(newSide);
    if (numEntry > 0) {
      const dist = Math.abs(numEntry - numSl) || 9.5;
      if (newSide === 'SELL' && numSl <= numEntry) {
        setSlPrice((numEntry + dist).toFixed(2));
        setTpPrice((numEntry - dist * 3).toFixed(2));
      } else if (newSide === 'BUY' && numSl >= numEntry) {
        setSlPrice((numEntry - dist).toFixed(2));
        setTpPrice((numEntry + dist * 3).toFixed(2));
      }
    }
  };

  const handleToggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!numEntry || !numSl || !numTp) return;
    if (isSlOrientationInvalid || isTpOrientationInvalid) return;

    onAddLog({
      date,
      timeNY,
      side,
      entryPrice: numEntry,
      slPrice: numSl,
      tpPrice: numTp,
      rMultiple: calculatedR,
      result,
      confidenceScore,
      itemsPassed: selectedTags,
      notes: notes || 'Model#1 XAUUSD setup log.',
    });

    if (onClearPrefill) onClearPrefill();
    setShowAddForm(false);
  };

  const handleCopySingle = (entry: TradeLogEntry) => {
    const csvRow = formatTradeToCsvRow(entry);
    navigator.clipboard.writeText(csvRow);
    setCopiedId(entry.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCopyAll = () => {
    const allCsv = formatAllTradesToCsv(logs);
    navigator.clipboard.writeText(allCsv);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  const handleDownload = () => {
    const allCsv = formatAllTradesToCsv(logs);
    downloadCsvFile(allCsv);
  };

  // Filter logs
  const filteredLogs = logs.filter((l) => {
    if (filterResult !== 'ALL' && l.result !== filterResult) return false;
    if (filterSide !== 'ALL' && l.side !== filterSide) return false;
    return true;
  });

  // KPIs
  const totalTrades = logs.length;
  const wins = logs.filter((l) => l.result === 'WIN').length;
  const losses = logs.filter((l) => l.result === 'LOSS').length;
  const missed = logs.filter((l) => l.result === 'MISSED').length;
  const decided = wins + losses;
  const winRate = decided > 0 ? Math.round((wins / decided) * 100) : 0;
  const avgR = logs.length > 0 ? (logs.reduce((acc, l) => acc + l.rMultiple, 0) / logs.length).toFixed(1) : '3.0';

  return (
    <div className="space-y-6">
      {/* Top Banner & KPIs */}
      <div className="bg-slate-900/80 rounded-2xl p-6 border border-slate-800 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-500/15 text-amber-300 border border-amber-500/30">
                Mode C
              </span>
              <h2 className="text-lg font-bold text-slate-100">
                Diiwaanka Ganacsiga (Trading Log &amp; CSV Journal)
              </h2>
            </div>
            <p className="text-xs text-slate-400">
              U keydi setup kasta oo Model#1 ah qaabka saxda ah ee mentor-ka ee CSV row.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyAll}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition"
            >
              {copiedAll ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
              Nuqul ka qaad Dhammaan CSV
            </button>
            <button
              type="button"
              onClick={handleDownload}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 text-xs font-semibold transition"
            >
              <Download className="w-3.5 h-3.5" />
              Soo deji CSV (.csv)
            </button>
            <button
              type="button"
              onClick={() => setShowAddForm(!showAddForm)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition shadow-lg shadow-amber-500/20"
            >
              <Plus className="w-4 h-4" />
              {showAddForm ? 'Xir Form-ka' : 'Ku dar Trade'}
            </button>
          </div>
        </div>

        {/* KPIs Grid */}
        <div className="mt-5 grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-mono block">Wadarta Logs</span>
            <span className="text-xl font-bold font-mono text-slate-100">{totalTrades}</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-950/70 border border-emerald-500/20">
            <span className="text-[10px] text-emerald-400 uppercase font-mono block">Win Rate</span>
            <span className="text-xl font-bold font-mono text-emerald-400">{winRate}%</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-mono block">Wins / Losses</span>
            <span className="text-xl font-bold font-mono text-slate-100">
              <span className="text-emerald-400">{wins}W</span> - <span className="text-rose-400">{losses}L</span>
            </span>
          </div>
          <div className="p-3 rounded-xl bg-slate-950/70 border border-amber-500/20">
            <span className="text-[10px] text-amber-400 uppercase font-mono block">Missed Trades</span>
            <span className="text-xl font-bold font-mono text-amber-300">{missed}</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-mono block">Celcelis R</span>
            <span className="text-xl font-bold font-mono text-sky-400">{avgR}R</span>
          </div>
        </div>
      </div>

      {/* Cumulative R-Value Chart (Recharts) */}
      <CumulativeRChart logs={logs} />

      {/* Add Trade Form Modal / Collapsible */}
      {showAddForm && (
        <form onSubmit={handleSave} className="bg-slate-900/90 rounded-2xl p-6 border border-amber-500/30 shadow-2xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Plus className="w-4 h-4 text-amber-400" />
              Geli Faahfaahinta Trade-ka Cusub (Model#1 Setup)
            </h3>
            <span className="text-xs text-amber-400 font-mono">
              XAUUSD Kaliya
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Taariikhda (Date)
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs font-mono focus:border-amber-500 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Waqtiga NY (Time NY)
              </label>
              <input
                type="text"
                value={timeNY}
                onChange={(e) => setTimeNY(e.target.value)}
                placeholder="e.g. 08:15 ama 02:30"
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs font-mono focus:border-amber-500 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Dhinaca (Side)
              </label>
              <select
                value={side}
                onChange={(e) => handleSideChange(e.target.value as 'BUY' | 'SELL')}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs font-semibold focus:border-amber-500 focus:outline-none"
              >
                <option value="BUY">BUY (IRL &rarr; ERL)</option>
                <option value="SELL">SELL (ERL &rarr; IRL)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Natiijada (Result)
              </label>
              <select
                value={result}
                onChange={(e) => setResult(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs font-semibold focus:border-amber-500 focus:outline-none"
              >
                <option value="WIN">WIN (Faa&apos;iido)</option>
                <option value="LOSS">LOSS (Qasaaro)</option>
                <option value="MISSED">MISSED (Lama gaarin #1)</option>
                <option value="INVALIDATION">INVALIDATION (0.5 EQ jaban)</option>
                <option value="OPEN">OPEN (Weli furan)</option>
              </select>
            </div>
          </div>

          {/* Pricing & R Multiple */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-2">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Entry #1 Price ($)
              </label>
              <input
                type="number"
                step="0.01"
                value={entryPrice}
                onChange={(e) => setEntryPrice(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs font-mono focus:border-amber-500 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Stop Loss (SL $)
              </label>
              <input
                type="number"
                step="0.01"
                value={slPrice}
                onChange={(e) => setSlPrice(e.target.value)}
                className={`w-full px-3 py-2 rounded-xl bg-slate-950 border text-slate-200 text-xs font-mono focus:outline-none ${
                  isSlOrientationInvalid
                    ? 'border-rose-500 ring-1 ring-rose-500'
                    : 'border-slate-800 focus:border-amber-500'
                }`}
                required
              />
              <span className="text-[10px] text-slate-500 mt-1 block">
                SL Distance: ${slDistance.toFixed(2)} (Caadi ahaan ~$9-10)
              </span>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Take Profit (TP $)
              </label>
              <input
                type="number"
                step="0.01"
                value={tpPrice}
                onChange={(e) => setTpPrice(e.target.value)}
                className={`w-full px-3 py-2 rounded-xl bg-slate-950 border text-slate-200 text-xs font-mono focus:outline-none ${
                  isTpOrientationInvalid
                    ? 'border-rose-500 ring-1 ring-rose-500'
                    : 'border-slate-800 focus:border-amber-500'
                }`}
                required
              />
              <span className="text-[10px] text-slate-500 mt-1 block">
                TP Distance: ${tpDistance.toFixed(2)}
              </span>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                R Multiple (Auto)
              </label>
              <div className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-amber-400 font-mono font-bold text-xs flex items-center justify-between">
                <span>{calculatedR}R</span>
                <span className="text-[10px] text-slate-500">
                  {calculatedR >= 3 ? 'Default 3R' : calculatedR >= 2 ? 'Close ERL 2R' : '< 2R (Ka bood!)'}
                </span>
              </div>
            </div>
          </div>

          {/* Orientation Error Alert */}
          {(isSlOrientationInvalid || isTpOrientationInvalid) && (
            <div className="p-3 rounded-xl bg-rose-950/70 border border-rose-500/60 text-xs text-rose-200 flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
              <div>
                <strong className="block font-bold text-rose-100">
                  Khalad Meelaynta SL ama TP ({side} Trade):
                </strong>
                <span>
                  {side === 'SELL'
                    ? `Markaad qaadaneyso SELL trade, Stop Loss-ku (SL) waa inuu ka SARREEYAA Entry-ga ($${numEntry.toFixed(2)}) kana shisheeyaa Sweep High-ka, Take Profit-kuna (TP) waa inuu ka HOOSEEYAA Entry-ga!`
                    : `Markaad qaadaneyso BUY trade, Stop Loss-ku (SL) waa inuu ka HOOSEEYAA Entry-ga ($${numEntry.toFixed(2)}) kana shisheeyaa Sweep Low-ga, Take Profit-kuna (TP) waa inuu ka SARREEYAA Entry-ga!`}
                </span>
              </div>
            </div>
          )}

          {/* Confidence Score Selector (1-5) */}
          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-amber-500/20 space-y-2.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                  <label className="text-xs font-bold text-slate-200">
                    Kalsoonida Setup-ka (Confidence Score: 1 - 5)
                  </label>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    {confidenceScore} / 5
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Qiimee heerka waafaqsanaanta Model#1 ka hor inta aanad diiwaangelin (1 = Daciif, 5 = A+ Textbook).
                </p>
              </div>

              {/* Stars display */}
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setConfidenceScore(star)}
                    className="p-1 hover:scale-110 transition"
                    title={`Darajada ${star}`}
                  >
                    <Star
                      className={`w-5 h-5 transition ${
                        star <= confidenceScore
                          ? 'text-amber-400 fill-amber-400'
                          : 'text-slate-700 hover:text-slate-500'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Quick score buttons with Somali descriptions */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 pt-1">
              {[
                { score: 1, label: '1 • Daciif' },
                { score: 2, label: '2 • Celcelis' },
                { score: 3, label: '3 • Wanaagsan' },
                { score: 4, label: '4 • Aad u Fiican' },
                { score: 5, label: '5 • A+ Textbook' },
              ].map((tier) => (
                <button
                  key={tier.score}
                  type="button"
                  onClick={() => setConfidenceScore(tier.score)}
                  className={`px-2 py-1.5 rounded-lg text-[11px] font-medium transition text-center ${
                    confidenceScore === tier.score
                      ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                      : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  {tier.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-2">
              Checklist Tags Passed (Waxa ku guuleystay setup-ka)
            </label>
            <div className="flex flex-wrap gap-1.5">
              {COMMON_TAGS.map((tag) => {
                const active = selectedTags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => handleToggleTag(tag)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                      active
                        ? 'bg-amber-500 text-slate-950 shadow-sm'
                        : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    #{tag}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Faahfaahin / Xusuusin (Notes)
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Qor sababta gelitaanka, SMT pair-ka loo adeegsaday (XAUEUR/Silver), dareenka suuqa..."
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:border-amber-500 focus:outline-none"
            />
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition"
            >
              Ka noqo (Cancel)
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition shadow-lg shadow-amber-500/20"
            >
              Keydi Trade Log
            </button>
          </div>
        </form>
      )}

      {/* Filters Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/60 p-3.5 rounded-xl border border-slate-800">
        <div className="flex items-center gap-2 text-xs">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-400">Shaandhee (Filter):</span>
          
          <select
            value={filterResult}
            onChange={(e) => setFilterResult(e.target.value)}
            className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none"
          >
            <option value="ALL">Dhammaan Natiijooyinka</option>
            <option value="WIN">WIN</option>
            <option value="LOSS">LOSS</option>
            <option value="MISSED">MISSED</option>
            <option value="INVALIDATION">INVALIDATION</option>
          </select>

          <select
            value={filterSide}
            onChange={(e) => setFilterSide(e.target.value)}
            className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none"
          >
            <option value="ALL">Buys &amp; Sells</option>
            <option value="BUY">BUY Only</option>
            <option value="SELL">SELL Only</option>
          </select>
        </div>

        <div className="text-xs text-slate-500 font-mono">
          Muujinaya {filteredLogs.length} ee {logs.length} entries
        </div>
      </div>

      {/* Trade Log Cards / Rows */}
      <div className="space-y-3">
        {filteredLogs.map((entry) => {
          const csvRow = formatTradeToCsvRow(entry);
          return (
            <div
              key={entry.id}
              className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span
                    className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                      entry.side === 'BUY'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                    }`}
                  >
                    {entry.side}
                  </span>
                  <span className="font-mono text-xs font-semibold text-slate-200">
                    {entry.date} @ {entry.timeNY} NY
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase font-mono ${
                      entry.result === 'WIN'
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                        : entry.result === 'LOSS'
                        ? 'bg-rose-950 text-rose-300 border border-rose-500/40'
                        : entry.result === 'MISSED'
                        ? 'bg-amber-950 text-amber-300 border border-amber-500/40'
                        : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {entry.result}
                  </span>
                  <span className="text-xs font-mono font-bold text-amber-400">
                    {entry.rMultiple}R
                  </span>
                  {entry.confidenceScore !== undefined && (
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                        entry.confidenceScore >= 4
                          ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                          : entry.confidenceScore === 3
                          ? 'bg-slate-800 text-slate-300 border border-slate-700'
                          : 'bg-rose-950/40 text-rose-300 border border-rose-500/30'
                      }`}
                      title={`Kalsoonida Setup-ka: ${entry.confidenceScore}/5`}
                    >
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      {entry.confidenceScore}/5
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleCopySingle(entry)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition"
                    title="Nuqul ka qaad CSV row"
                  >
                    {copiedId === entry.id ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span className="text-[11px] text-emerald-400">La qaatay!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3 text-slate-400" />
                        <span className="text-[11px]">CSV Row</span>
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => onDeleteLog(entry.id)}
                    className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-rose-950/30 transition"
                    title="Tirtir log-gan"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Price Details */}
              <div className="grid grid-cols-3 gap-2 py-2 px-3 rounded-lg bg-slate-950/60 font-mono text-xs">
                <div>
                  <span className="text-[10px] text-slate-500 block">#1 Price</span>
                  <span className="text-slate-200 font-semibold">${entry.entryPrice.toFixed(2)}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">Stop Loss (SL)</span>
                  <span className="text-rose-400 font-semibold">${entry.slPrice.toFixed(2)}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">Take Profit (TP)</span>
                  <span className="text-emerald-400 font-semibold">${entry.tpPrice.toFixed(2)}</span>
                </div>
              </div>

              {/* Tags & Notes */}
              <div className="flex flex-wrap items-center gap-1.5">
                {entry.itemsPassed.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 rounded text-[10px] bg-slate-800/80 text-amber-300/90 font-mono"
                  >
                    #{tag}
                  </span>
                ))}
              </div>

              {entry.notes && (
                <p className="text-xs text-slate-400 bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/50">
                  {entry.notes}
                </p>
              )}

              {/* Mentor CSV Format display */}
              <div className="text-[11px] font-mono text-slate-500 bg-slate-950/80 p-2 rounded border border-slate-800/60 overflow-x-auto whitespace-nowrap">
                <span className="text-amber-500/70 select-none">CSV Row: </span>
                <span className="text-slate-300">{csvRow}</span>
              </div>
            </div>
          );
        })}

        {filteredLogs.length === 0 && (
          <div className="p-8 text-center bg-slate-900/40 rounded-xl border border-slate-800 text-slate-500 text-xs">
            Wax entries ah lagama helin shuruudahan. Guji &quot;Ku dar Trade&quot; si aad u bilowdo diiwaankaaga.
          </div>
        )}
      </div>
    </div>
  );
};
