import React, { useState } from 'react';
import { Calculator, ShieldAlert, AlertTriangle, ArrowUpRight, CheckCircle2 } from 'lucide-react';

export const RiskCalculator: React.FC = () => {
  const [accountBalance, setAccountBalance] = useState<string>('10000');
  const [riskPercent, setRiskPercent] = useState<string>('1.0');
  const [side, setSide] = useState<'BUY' | 'SELL'>('BUY');
  const [entryPrice, setEntryPrice] = useState<string>('2150.00');
  const [slPrice, setSlPrice] = useState<string>('2140.50');
  const [spreadSlippageBuffer, setSpreadSlippageBuffer] = useState<string>('0.40');

  const balance = parseFloat(accountBalance) || 0;
  const riskPct = parseFloat(riskPercent) || 0;
  const entry = parseFloat(entryPrice) || 0;
  const sl = parseFloat(slPrice) || 0;
  const buffer = parseFloat(spreadSlippageBuffer) || 0;

  // Calculations
  const dollarRisk = (balance * riskPct) / 100;
  const rawSlDistance = Math.abs(entry - sl);
  const totalSlDistanceWithBuffer = rawSlDistance + buffer;

  // Gold 1 standard lot = 100 troy ounces.
  // $1 move in gold on 1 standard lot = $100.
  // Lot size = dollarRisk / (SL_distance * 100)
  const lotSize =
    totalSlDistanceWithBuffer > 0
      ? (dollarRisk / (totalSlDistanceWithBuffer * 100)).toFixed(2)
      : '0.00';

  // 3R & 2R targets
  const tp3RPrice =
    side === 'BUY'
      ? entry + totalSlDistanceWithBuffer * 3
      : entry - totalSlDistanceWithBuffer * 3;

  const tp2RPrice =
    side === 'BUY'
      ? entry + totalSlDistanceWithBuffer * 2
      : entry - totalSlDistanceWithBuffer * 2;

  const profit3R = dollarRisk * 3;
  const profit2R = dollarRisk * 2;

  const isSlTooBig = rawSlDistance > 12;
  const isTypicalSl = rawSlDistance >= 8 && rawSlDistance <= 11;
  const isSlOrientationInvalid =
    entry > 0 && sl > 0 && (side === 'SELL' ? sl <= entry : sl >= entry);

  const handleSideChange = (newSide: 'BUY' | 'SELL') => {
    setSide(newSide);
    if (entry > 0) {
      const dist = Math.abs(entry - sl) || 9.5;
      if (newSide === 'SELL' && sl <= entry) {
        setSlPrice((entry + dist).toFixed(2));
      } else if (newSide === 'BUY' && sl >= entry) {
        setSlPrice((entry - dist).toFixed(2));
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Introduction Card */}
      <div className="bg-slate-900/80 rounded-2xl p-6 border border-slate-800 shadow-xl">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-100">
              Xisaabiyaha Khatarta &amp; Cabbirka Lot-ka (Model#1 Gold Calculator)
            </h2>
            <p className="text-xs text-slate-400">
              Sharciga Model#1: Khatarta waa 1% kaliya trade kasta. SL caadiga ah waa ~$9-$10 dahabka. Haddii SL uu aad u weyn yahay, ka bood!
            </p>
          </div>
        </div>

        {/* Inputs */}
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Lacagta Koontada ($)
            </label>
            <input
              type="number"
              value={accountBalance}
              onChange={(e) => setAccountBalance(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs font-mono focus:border-amber-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Risk % (Model#1 = 1%)
            </label>
            <input
              type="number"
              step="0.1"
              value={riskPercent}
              onChange={(e) => setRiskPercent(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs font-mono focus:border-amber-500 focus:outline-none"
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
              Entry #1 Price ($)
            </label>
            <input
              type="number"
              step="0.01"
              value={entryPrice}
              onChange={(e) => setEntryPrice(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs font-mono focus:border-amber-500 focus:outline-none"
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
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Spread &amp; Buffer ($)
            </label>
            <input
              type="number"
              step="0.05"
              value={spreadSlippageBuffer}
              onChange={(e) => setSpreadSlippageBuffer(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs font-mono focus:border-amber-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Orientation Error Warning */}
        {isSlOrientationInvalid && (
          <div className="mt-4 p-3.5 rounded-xl bg-rose-950/70 border border-rose-500/60 text-xs text-rose-200 flex items-start gap-2.5 shadow-lg">
            <AlertTriangle className="w-5 h-5 shrink-0 text-rose-400 mt-0.5" />
            <div>
              <strong className="block font-bold text-rose-100 text-sm">
                Khalad Meelaynta SL (SL Orientation Error):
              </strong>
              <span className="mt-1 block">
                {side === 'SELL'
                  ? `Markaad SELL qaadato, Stop Loss-ku (SL: $${sl.toFixed(2)}) waa inuu had iyo jeer ka SARREEYAA Entry-ga ($${entry.toFixed(2)}) kana shisheeyaa Sweep High-ka (tusaale ~$${(entry + (rawSlDistance || 9.5)).toFixed(2)})! Weligaa SL ha dhigin meel ka hooseysa Entry-ga markaad Sell tahay.`
                  : `Markaad BUY qaadato, Stop Loss-ku (SL: $${sl.toFixed(2)}) waa inuu had iyo jeer ka HOOSEEYAA Entry-ga ($${entry.toFixed(2)}) kana shisheeyaa Sweep Low-ga (tusaale ~$${(entry - (rawSlDistance || 9.5)).toFixed(2)})!`}
              </span>
            </div>
          </div>
        )}

        {/* SL Status Badge */}
        {!isSlOrientationInvalid && (
          <div className="mt-4 flex items-center gap-2">
            {isSlTooBig ? (
              <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/40 text-xs text-rose-300 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>
                  <strong>Digniin:</strong> Cabbirka SL waa ${rawSlDistance.toFixed(2)} oo ka weyn xadka caadiga ah (~$9-$10). Sharciga Model#1: Ka bood haddii SL uu aad u weyn yahay!
                </span>
              </div>
            ) : isTypicalSl ? (
              <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-xs text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>
                  Cabbirka SL (${rawSlDistance.toFixed(2)}) wuxuu ku jiraa xadka caadiga ah ee Dahabka (~$9-$10).
                </span>
              </div>
            ) : (
              <div className="text-xs text-slate-400 font-mono">
                SL Fogaantiisu: ${rawSlDistance.toFixed(2)} | Waxaa lagu daray buffer: ${totalSlDistanceWithBuffer.toFixed(2)}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Calculated Results Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Dollar Risk */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
          <span className="text-[11px] font-mono text-slate-400 block uppercase">
            Khatarta Lacageed (1% Risk)
          </span>
          <div className="text-2xl font-bold font-mono text-amber-400">
            ${dollarRisk.toFixed(2)}
          </div>
          <p className="text-[11px] text-slate-500">
            Lacagta aad diyaar u tahay inaad lumiso haddii SL ku dhaco.
          </p>
        </div>

        {/* Position Lot Size */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-amber-500/30 shadow-lg shadow-amber-500/5 space-y-1">
          <span className="text-[11px] font-mono text-amber-400 block uppercase">
            Cabbirka Lot-ka (Gold Lot Size)
          </span>
          <div className="text-2xl font-bold font-mono text-slate-100">
            {lotSize} <span className="text-sm font-normal text-slate-400">Lots</span>
          </div>
          <p className="text-[11px] text-slate-400">
            1 Lot = 100 oz Dahab ah (standard broker contract).
          </p>
        </div>

        {/* 3R Default Target */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-emerald-500/30 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono text-emerald-400 uppercase">
              3R Target (Default)
            </span>
            <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-300 font-mono">
              +${profit3R.toFixed(2)}
            </span>
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-400">
            ${tp3RPrice.toFixed(2)}
          </div>
          <p className="text-[11px] text-slate-400">
            Bartilmaameedka caadiga ah ee Model#1.
          </p>
        </div>

        {/* 2R Target */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-sky-500/30 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono text-sky-400 uppercase">
              2R Target (Dhow ERL)
            </span>
            <span className="px-1.5 py-0.5 rounded text-[10px] bg-sky-500/20 text-sky-300 font-mono">
              +${profit2R.toFixed(2)}
            </span>
          </div>
          <div className="text-2xl font-bold font-mono text-sky-400">
            ${tp2RPrice.toFixed(2)}
          </div>
          <p className="text-[11px] text-slate-400">
            La isticmaalo marka ERL ay dhowdahay ama SL uu xoogaa weyn yahay.
          </p>
        </div>
      </div>

      {/* Safety Notice Card */}
      <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 text-xs text-slate-400 space-y-2">
        <div className="flex items-center gap-2 text-amber-400 font-semibold">
          <ShieldAlert className="w-4 h-4 shrink-0" />
          Xusuusinta Badbaadada Ganacsiga Dahabka (XAUUSD):
        </div>
        <p>
          Dahabku wuxuu leeyahay dhaqdhaqaaq degdeg ah iyo spread ballaaran xilliyada wararka ama furitaanka suuqa. Xisaabi spread iyo slippage ($0.30 - $0.50). Weligaa ha galin wax ka badan 1% koontadaada hal trade. Tusaalooyinkii hore ma aha dammaanad mustaqbal.
        </p>
      </div>
    </div>
  );
};
