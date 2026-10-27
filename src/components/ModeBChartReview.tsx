import React, { useState } from 'react';
import { CHECKLIST_ITEMS } from '../constants/model1Data';
import { ChecklistStatus, TradeLogEntry } from '../types';
import {
  CheckCircle2,
  XCircle,
  EyeOff,
  Upload,
  Image as ImageIcon,
  Send,
  Sparkles,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  BookmarkPlus,
  Star,
} from 'lucide-react';

interface Props {
  onSendToLog: (entry: Partial<TradeLogEntry>) => void;
}

export const ModeBChartReview: React.FC<Props> = ({ onSendToLog }) => {
  const [side, setSide] = useState<'BUY' | 'SELL'>('BUY');
  const [confidenceScore, setConfidenceScore] = useState<number>(5);
  const [scores, setScores] = useState<Record<string, ChecklistStatus>>(() => {
    const initial: Record<string, ChecklistStatus> = {};
    CHECKLIST_ITEMS.forEach((item) => {
      initial[item.id] = 'CANT_SEE';
    });
    return initial;
  });

  const [notes, setNotes] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [imageMime, setImageMime] = useState<string>('image/jpeg');
  const [loading, setLoading] = useState(false);
  const [aiReview, setAiReview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleScoreChange = (id: string, status: ChecklistStatus) => {
    setScores((prev) => ({ ...prev, [id]: status }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageMime(file.type || 'image/jpeg');
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setImagePreview(result);
      const base64Data = result.split(',')[1];
      setImageBase64(base64Data);
    };
    reader.readAsDataURL(file);
  };

  const handleSetAll = (status: ChecklistStatus) => {
    const updated: Record<string, ChecklistStatus> = {};
    CHECKLIST_ITEMS.forEach((item) => {
      updated[item.id] = status;
    });
    setScores(updated);
  };

  // Calculations
  const passCount = Object.values(scores).filter((s) => s === 'PASS').length;
  const failCount = Object.values(scores).filter((s) => s === 'FAIL').length;
  const cantSeeCount = Object.values(scores).filter((s) => s === 'CANT_SEE').length;
  const visibleCount = passCount + failCount; // items evaluated

  const missingItems = CHECKLIST_ITEMS.filter((item) => scores[item.id] === 'CANT_SEE');

  const looksLikeModel1 = passCount >= 9 && failCount === 0;

  const handleRunAiReview = async () => {
    setLoading(true);
    setError(null);
    setAiReview(null);

    try {
      const res = await fetch('/api/review-chart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          notes: `Side: ${side}\nConfidence Score: ${confidenceScore}/5\n${notes}`,
          checklistScores: scores,
          confidenceScore,
          imageBase64: imageBase64 || undefined,
          mimeType: imageMime,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Khalad ayaa dhacay intii lagu jiray baaritaanka.');
      }

      setAiReview(data.review);
    } catch (err: any) {
      setError(err.message || 'Khalad ayaa dhacay.');
    } finally {
      setLoading(false);
    }
  };

  const handleExportToLog = () => {
    const passedNames = CHECKLIST_ITEMS.filter((i) => scores[i.id] === 'PASS').map((i) => i.name);
    onSendToLog({
      side,
      itemsPassed: passedNames,
      confidenceScore,
      notes: `Baaritaanka Chart-ka (Confidence Score: ${confidenceScore}/5): ${visibleCount}/11 muuqday (${passCount} PASS, ${failCount} FAIL). ${notes}`,
      result: 'OPEN',
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Direction Switcher */}
      <div className="bg-slate-900/80 rounded-2xl p-6 border border-slate-800 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-500/15 text-amber-300 border border-amber-500/30">
                Mode B
              </span>
              <h2 className="text-lg font-bold text-slate-100">
                Baaritaanka Shaxanka (11-Item Chart Review)
              </h2>
            </div>
            <p className="text-xs text-slate-400">
              Qiimee setup-kaaga adoo isticmaalaya 11-ka qodob ee lagama maarmaanka u ah Model#1. Ha galin trade ilaa aad xaqiijiso!
            </p>
          </div>

          {/* Direction toggle */}
          <div className="flex items-center bg-slate-950 p-1.5 rounded-xl border border-slate-800 shrink-0">
            <button
              type="button"
              onClick={() => setSide('BUY')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition ${
                side === 'BUY'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ArrowUpRight className="w-4 h-4 text-emerald-400" />
              BUY (IRL &rarr; ERL)
            </button>
            <button
              type="button"
              onClick={() => setSide('SELL')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition ${
                side === 'SELL'
                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ArrowDownRight className="w-4 h-4 text-rose-400" />
              SELL (ERL &rarr; IRL)
            </button>
          </div>
        </div>

        {/* Score KPI Bar */}
        <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800">
            <span className="text-[11px] text-slate-400 block font-mono">Tirada Muuqata</span>
            <div className="text-xl font-bold font-mono text-amber-400">
              {visibleCount} <span className="text-xs font-normal text-slate-500">/ 11 visible</span>
            </div>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-emerald-500/20">
            <span className="text-[11px] text-emerald-400/80 block font-mono">PASS (Sax ah)</span>
            <div className="text-xl font-bold font-mono text-emerald-400">{passCount}</div>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-rose-500/20">
            <span className="text-[11px] text-rose-400/80 block font-mono">FAIL (Qalad ah)</span>
            <div className="text-xl font-bold font-mono text-rose-400">{failCount}</div>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800">
            <span className="text-[11px] text-slate-400 block font-mono">CAN&apos;T SEE (Ma muuqato)</span>
            <div className="text-xl font-bold font-mono text-slate-400">{cantSeeCount}</div>
          </div>
        </div>

        {/* Quick Batch Actions */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-800/60">
          <div className="text-xs text-slate-400">
            Xaaladda Guud:{' '}
            <span
              className={`font-semibold px-2 py-0.5 rounded text-xs ${
                looksLikeModel1
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
              }`}
            >
              {looksLikeModel1 ? 'Waxay u egtahay Model#1' : 'Uma eka Model#1 (ama qodobo baa maqan)'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-500">Degdeg:</span>
            <button
              type="button"
              onClick={() => handleSetAll('PASS')}
              className="text-[11px] px-2 py-1 rounded bg-emerald-950/40 hover:bg-emerald-900/50 text-emerald-300 border border-emerald-500/30 transition"
            >
              Dhammaan PASS
            </button>
            <button
              type="button"
              onClick={() => handleSetAll('CANT_SEE')}
              className="text-[11px] px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
            >
              Dib u celi (Reset)
            </button>
          </div>
        </div>
      </div>

      {/* 11 Items Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {CHECKLIST_ITEMS.map((item, idx) => {
          const currentStatus = scores[item.id];
          const reqText = side === 'BUY' ? item.buyRequirement : item.sellRequirement;

          return (
            <div
              key={item.id}
              className={`p-4 rounded-xl border transition-all ${
                currentStatus === 'PASS'
                  ? 'bg-slate-900/90 border-emerald-500/40 shadow-sm shadow-emerald-500/5'
                  : currentStatus === 'FAIL'
                  ? 'bg-slate-900/90 border-rose-500/40 shadow-sm shadow-rose-500/5'
                  : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center text-[10px] font-mono font-bold">
                      {idx + 1}
                    </span>
                    <h4 className="text-sm font-bold text-slate-100">{item.name}</h4>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                      {item.category}
                    </span>
                  </div>
                  <p className="text-xs text-amber-300/90 font-medium">
                    {item.somaliName}
                  </p>
                  <p className="text-xs text-slate-400">
                    {item.description}
                  </p>
                  <div className="mt-2 text-[11px] p-2 rounded-lg bg-slate-950/60 border border-slate-800/80 text-slate-300">
                    <span className="text-amber-400 font-semibold">{side} shuruud: </span>
                    {reqText}
                  </div>
                </div>

                {/* Status Toggle Buttons */}
                <div className="flex flex-col gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleScoreChange(item.id, 'PASS')}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                      currentStatus === 'PASS'
                        ? 'bg-emerald-500 text-slate-950 shadow-md'
                        : 'bg-slate-800 text-slate-400 hover:text-emerald-400 hover:bg-slate-700'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    PASS
                  </button>
                  <button
                    type="button"
                    onClick={() => handleScoreChange(item.id, 'FAIL')}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                      currentStatus === 'FAIL'
                        ? 'bg-rose-500 text-white shadow-md'
                        : 'bg-slate-800 text-slate-400 hover:text-rose-400 hover:bg-slate-700'
                    }`}
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    FAIL
                  </button>
                  <button
                    type="button"
                    onClick={() => handleScoreChange(item.id, 'CANT_SEE')}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                      currentStatus === 'CANT_SEE'
                        ? 'bg-slate-600 text-slate-100'
                        : 'bg-slate-800/60 text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    <EyeOff className="w-3.5 h-3.5" />
                    MA MUUQDO
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Chart Image & Notes Section */}
      <div className="bg-slate-900/80 rounded-2xl p-6 border border-slate-800 space-y-4">
        <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
          <ImageIcon className="w-4 h-4 text-amber-400" />
          Sawirka Shaxanka (Chart Screenshot) &amp; Qoraalka Ganacsadaha
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Image Uploader */}
          <div className="space-y-3">
            <label className="block text-xs font-medium text-slate-300">
              Soo geli Sawirka Chart-ka (XAUUSD ama SMT pair-ka)
            </label>
            <div className="border-2 border-dashed border-slate-800 hover:border-amber-500/50 rounded-xl p-4 text-center cursor-pointer bg-slate-950/40 transition relative">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
              {imagePreview ? (
                <div className="space-y-2">
                  <img
                    src={imagePreview}
                    alt="Chart preview"
                    className="max-h-48 mx-auto rounded-lg object-contain border border-slate-800"
                  />
                  <span className="text-[11px] text-amber-400 block">
                    Sawirka waa la diyaariyay. Guji si aad u bedesho.
                  </span>
                </div>
              ) : (
                <div className="py-6">
                  <Upload className="w-8 h-8 mx-auto text-slate-500 mb-2" />
                  <p className="text-xs text-slate-300 font-medium">
                    Guji si aad sawirka usoo geliso ama halkan ku soo tuur
                  </p>
                  <p className="text-[10px] text-slate-500 mt-1">
                    PNG, JPG, ama WebP (U muuji XAUUSD 5m, 1H/4H, iyo SMT)
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Notes Input */}
          <div className="space-y-3">
            <label className="block text-xs font-medium text-slate-300">
              Faahfaahinta Setup-kaaga (Notes)
            </label>
            <textarea
              rows={6}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Sharax: Saacadda NY, heerka KL (FVG/OB), sweep-ka TS, labada asset ee SMT (tusaale XAUEUR), iyo cabbirka SL..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/70 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/60 placeholder-slate-600"
            />
          </div>
        </div>

        {missingItems.length > 0 && (
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs space-y-1.5">
            <span className="font-semibold text-slate-300 block">
              Qodobbada weli aan muuqan ({missingItems.length} qodob):
            </span>
            <div className="flex flex-wrap gap-1.5">
              {missingItems.map((m) => (
                <span
                  key={m.id}
                  className="px-2 py-0.5 rounded-md bg-slate-800/80 text-slate-400 text-[11px]"
                >
                  {m.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Confidence Score Selector (1-5) */}
        <div className="p-4 rounded-xl bg-slate-950/70 border border-amber-500/20 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                <h4 className="text-xs font-bold text-slate-200">
                  Heerka Kalsoonida Setup-ka (Confidence Score: 1 - 5)
                </h4>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {confidenceScore} / 5
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Qiimee sida trade-kan u waafaqsan yahay Model#1 ka hor inta aanad diiwaangelin (1 = Daciif, 5 = A+ Textbook).
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
                        : 'text-slate-600 hover:text-slate-400'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Quick ranking buttons with labels */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1 text-[11px]">
            {[
              { val: 1, label: '1 • Daciif', desc: 'Sharciyo badan ka dhiman' },
              { val: 2, label: '2 • Hoose', desc: 'Timing/SMT shaki leh' },
              { val: 3, label: '3 • Dhexdhexaad', desc: 'Core rules buuxsamay' },
              { val: 4, label: '4 • Xooggan', desc: '9-10 qodob waafaqsan' },
              { val: 5, label: '5 • A+ Textbook', desc: '11/11 qodob sax ah' },
            ].map((item) => (
              <button
                key={item.val}
                type="button"
                onClick={() => setConfidenceScore(item.val)}
                className={`p-2 rounded-lg text-left transition border ${
                  confidenceScore === item.val
                    ? 'bg-amber-500/20 border-amber-500 text-amber-200 shadow-sm shadow-amber-500/10'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-300 hover:bg-slate-900'
                }`}
              >
                <span className="font-bold block text-xs">{item.label}</span>
                <span className="text-[10px] text-slate-400 block truncate">{item.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800">
          <button
            type="button"
            onClick={handleExportToLog}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition"
          >
            <BookmarkPlus className="w-4 h-4 text-amber-400" />
            U wareeji Journal-ka (Pre-fill Mode C)
          </button>

          <button
            type="button"
            onClick={handleRunAiReview}
            disabled={loading}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs tracking-wide shadow-lg shadow-amber-500/20 disabled:opacity-50 transition"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                Baarayaa Setup-ka...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 fill-slate-950" />
                Xaqiiji Shaxanka (AI Coach Review)
              </>
            )}
          </button>
        </div>
      </div>

      {/* AI Review Result */}
      {aiReview && (
        <div className="bg-slate-900/90 rounded-2xl p-6 border border-amber-500/30 shadow-2xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <div className="p-1 rounded bg-amber-500/10 text-amber-400">
                <Sparkles className="w-4 h-4" />
              </div>
              <h4 className="text-sm font-bold text-slate-100">
                Natiijada Baaritaanka Shaxanka (Model#1 Scorecard)
              </h4>
            </div>
            <div className="text-xs font-mono font-bold text-amber-400">
              {visibleCount} of 11 visible
            </div>
          </div>

          <div className="prose prose-invert max-w-none text-slate-200 text-sm leading-relaxed whitespace-pre-wrap font-sans bg-slate-950/60 p-5 rounded-xl border border-slate-800/80">
            {aiReview}
          </div>

          <div className="p-3 rounded-xl bg-rose-950/30 border border-rose-500/30 text-[11px] text-rose-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>
              <strong>Digniin:</strong> Kaaliyuhu weligii ma dhihi doono &quot;gal trade-ka&quot;. Adigaa go&apos;aanka iska leh.
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
