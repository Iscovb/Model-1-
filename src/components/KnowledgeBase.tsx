import React, { useState } from 'react';
import { INITIAL_UNKNOWNS } from '../constants/model1Data';
import { UnknownItem } from '../types';
import { BookOpen, HelpCircle, CheckCircle, Save, ShieldAlert, Sparkles, Clock, Layers, Target, AlertCircle, Eye, Crosshair, Check } from 'lucide-react';

export const KnowledgeBase: React.FC = () => {
  const [unknowns, setUnknowns] = useState<UnknownItem[]>(INITIAL_UNKNOWNS);
  const [activeTab, setActiveTab] = useState<'RULES' | 'UNKNOWNS' | 'CHART_FRIENDLY'>('CHART_FRIENDLY');
  const [savedSuccessId, setSavedSuccessId] = useState<string | null>(null);

  const handleUpdateNotes = (id: string, notes: string) => {
    setUnknowns((prev) =>
      prev.map((item) => (item.id === id ? { ...item, userNotes: notes } : item))
    );
  };

  const handleToggleStatus = (id: string) => {
    setUnknowns((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              status: item.status === 'UNKNOWN' ? 'USER_CONFIRMED' : 'UNKNOWN',
            }
          : item
      )
    );
  };

  const handleSaveItem = (id: string) => {
    setSavedSuccessId(id);
    setTimeout(() => setSavedSuccessId(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Selector Banner */}
      <div className="bg-slate-900/80 rounded-2xl p-6 border border-slate-800 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100">
                Aqoonta Model#1 &amp; Dabagalka UNKNOWNs
              </h2>
              <p className="text-xs text-slate-400">
                Shuruucda rasmiga ah ee Model#1 ICT TET mentorship (2026), sida chart-friendly loo noqdo, iyo meelaha trades-ka laga qaato.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center bg-slate-950 p-1.5 rounded-xl border border-slate-800 shrink-0 gap-1">
            <button
              type="button"
              onClick={() => setActiveTab('CHART_FRIENDLY')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition ${
                activeTab === 'CHART_FRIENDLY'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Eye className="w-4 h-4" />
              Chart Friendly &amp; Entry Zones
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('RULES')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition ${
                activeTab === 'RULES'
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              Shuruucda Rasmiga ah
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('UNKNOWNS')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition ${
                activeTab === 'UNKNOWNS'
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <HelpCircle className="w-4 h-4" />
              UNKNOWN Tracker ({unknowns.filter((u) => u.status === 'UNKNOWN').length})
            </button>
          </div>
        </div>

        {/* Strict Rule Notice */}
        <div className="mt-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 shrink-0 text-amber-400" />
          <span>
            <strong>Sharciga Adag: DO NOT INVENT.</strong> Kaaliyaha waxba ma abuuri karo. Haddii wax aan la hubin la weydiiyo, wuxuu ku jawaabayaa &quot;ma hubo&quot; wuuna ku weydiinayaa.
          </span>
        </div>
      </div>

      {/* Chart Friendly & Entry Zones Tab */}
      {activeTab === 'CHART_FRIENDLY' && (
        <div className="space-y-6">
          {/* Header Banner */}
          <div className="p-6 rounded-2xl bg-gradient-to-r from-amber-500/10 via-slate-900 to-slate-900 border border-amber-500/30 space-y-2">
            <div className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-amber-400" />
              <h3 className="text-base font-bold text-slate-100">
                Sida &quot;Chart Friendly&quot; Loo Noqdo &amp; Meelaha Saxda ah ee Trades-ka Laga Qaato
              </h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed max-w-4xl">
              Casharada Ustaad Saami iyo mentor-yada TET Community waxay ku saleysan yihiin degganaansho, shaxanka oo nadiif ah (zero clutter), iyo sugidda meelaha saxda ah ee hay&apos;adaha suuqu (institutions) ka galaan halkii la eryan lahaa candle kasta.
            </p>
          </div>

          {/* Section 1: 4 Tiir ee Sida Chart Friendly Loo Noqdo */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              4-ta Tiir ee Sida Chart Friendly Loo Noqdo (Mindset &amp; Clean Reading)
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
                <span className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 font-mono font-bold text-xs flex items-center justify-center">
                  1
                </span>
                <h5 className="text-sm font-bold text-slate-100">
                  Nadiifinta Shaxanka (Zero Clutter — Ha ku Qasin Shaxanka)
                </h5>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Mentor-yada shaxankoodu waa mid aad u nadiif ah. Ma isticmaalaan 10 indicators, moving averages badan, ama 50 xariiqood. Waxa shaxanka ku yaal waa <strong>Key Level-ka maanta (1H/4H)</strong>, <strong>Session Range-ka (Asia/London High/Low)</strong>, iyo <strong>5m Entry OB</strong> oo kaliya. Markasta oo shaxankaagu nadiif yahay, maskaxdaadu way degganaanaysaa.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
                <span className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 font-mono font-bold text-xs flex items-center justify-center">
                  2
                </span>
                <h5 className="text-sm font-bold text-slate-100">
                  Akhriska Qisada Candle-ka (Candlestick Storytelling)
                </h5>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Ha qiyaasin waxa dhacaya. Candle kasta su&apos;aalahan weydii:
                  <br />• <em>&quot;Xaggee buu ka yimid?&quot;</em> (IRL discount sweep mise ERL premium sweep?)
                  <br />• <em>&quot;Xaggee buu u socdaa (Draw on Liquidity / DOL)?&quot;</em>
                  <br />• <em>&quot;Waqtigu ma yahay Purge Hour (8-10am NY ama 2-3am NY)?&quot;</em>
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
                <span className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 font-mono font-bold text-xs flex items-center justify-center">
                  3
                </span>
                <h5 className="text-sm font-bold text-slate-100">
                  Isku Eegidda Labada Shaxan (Dual-Chart SMT Harmony)
                </h5>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Ganacsade chart-friendly ahi Dahabka gooni uma eego. Wuxuu dhinac dhigaa <strong>Silver (XAGUSD)</strong> ama <strong>XAUEUR</strong>. Marka Dahabku sameeyo sweep (New Low ama New High), wuxuu eegaa in Silver-ku diiday inuu la jabo. Divergence-kaasi waa heshiiska rasmiga ah ee smart money.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
                <span className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 font-mono font-bold text-xs flex items-center justify-center">
                  4
                </span>
                <h5 className="text-sm font-bold text-slate-100">
                  Degganaanshaha &amp; Aqbalidda Missed Trades (No FOMO)
                </h5>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Haddii qiimuhu uusan dib ugu soo noqon xariiqda <strong>Entry #1 Line</strong> (xitaa haddii ay ka baaqato 20 ama 30 cents), mentor-yadu si deggan ayay u daayaan (Missed Trade). Weligood kuma boodaan market order sababtoo ah waxay og yihiin in fursado kale iman doonaan.
                </p>
              </div>
            </div>
          </div>

          {/* Section 2: Meelaha Saxda ah ee Trades-ka Laga Qaato */}
          <div className="space-y-3 pt-2">
            <h4 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <Crosshair className="w-4 h-4 text-amber-400" />
              Meelaha Saxda ah ee Trades-ka Laga Qaato (The 5-Step Execution Sequence)
            </h4>

            <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 text-xs">
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                  <span className="text-[10px] text-amber-400 font-mono font-bold uppercase block">
                    Heerka 1: Key Level
                  </span>
                  <strong className="text-slate-100 block">1H / 4H HTF Pool</strong>
                  <p className="text-slate-400 text-[11px]">
                    4H/1H FVG, Order Block, ama PDH/PDL. Halkaan ayuu setup-ku ka bilaabmaa.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                  <span className="text-[10px] text-amber-400 font-mono font-bold uppercase block">
                    Heerka 2: TS Sweep
                  </span>
                  <strong className="text-slate-100 block">Turtle Soup Wick</strong>
                  <p className="text-slate-400 text-[11px]">
                    Suuqa oo sweep ku sameeya swing high/low kadibna ku xirma range-ka gudihiisa.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                  <span className="text-[10px] text-amber-400 font-mono font-bold uppercase block">
                    Heerka 3: SMT &amp; Timing
                  </span>
                  <strong className="text-slate-100 block">Purge Hour Confirmation</strong>
                  <p className="text-slate-400 text-[11px]">
                    8-10am NY ama 2-3am NY. Silver/XAUEUR oo sameeya Higher Low (Buys) ama Lower High (Sells).
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                  <span className="text-[10px] text-amber-400 font-mono font-bold uppercase block">
                    Heerka 4: 5m Shift
                  </span>
                  <strong className="text-slate-100 block">5m Order Block Form</strong>
                  <p className="text-slate-400 text-[11px]">
                    Displacement degdeg ah oo 5m ah oo ka tagaya OB nadiif ah oo aan weli la buuxin.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/40 space-y-1.5 shadow-sm">
                  <span className="text-[10px] text-amber-300 font-mono font-bold uppercase block">
                    Heerka 5: Entry #1
                  </span>
                  <strong className="text-amber-200 block">Limit Order at OB End</strong>
                  <p className="text-amber-300/90 text-[11px]">
                    Xariiqda saxda ah ee ku taal DHAMAADKA 5m OB. Halkaan ayaa Limit Order-ka la dhigaa!
                  </p>
                </div>
              </div>

              {/* SL and TP Golden Box */}
              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="space-y-1">
                  <span className="font-mono text-slate-400 uppercase text-[10px] block">
                    Stop Loss (SL) Meelayntiisa:
                  </span>
                  <p className="text-slate-200">
                    Waxaa la dhigaa wax yar ka dambeeya <strong>Sweep Wick-ka ($1.00 – $1.50 buffer)</strong>. Fogaanta SL caadi ahaan waa <strong>~$8.00 ilaa $11.00</strong> Dahabka. Haddii SL uu ka bato $12, ka bood!
                  </p>
                </div>
                <div className="space-y-1">
                  <span className="font-mono text-slate-400 uppercase text-[10px] block">
                    Take Profit (TP) Meelayntiisa:
                  </span>
                  <p className="text-slate-200">
                    Default target waa <strong>Fixed 3R</strong> oo ku wajahan liquidity-ga kasoo horjeeda (ERL ama IRL, sida PDH/PDL, PWH/PWL, ama 1H OB). 2R ayaa la qaataa haddii target-ku dhow yahay.
                  </p>
                </div>
              </div>

              {/* The 10% Edge Framework Card */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-500/10 via-slate-900/90 to-slate-950 border border-amber-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    The 10% Edge | TET MODEL (Maxaa Kala Saara 10%-ka Guuleysta &amp; 90%-ka Khasaara?)
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    TET COMMUNITY
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Casharka <strong>&quot;The 10% Edge&quot;</strong> wuxuu xoogga saarayaa in ganacsatada 90% ay khasaaraan sababtoo ah waxay ku mashquulsan yihiin raadinta shumacyo gaagaaban iyo indicators, halka 10%-ka guuleysta ay ku shaqeeyaan kaliya 5 qodob oo adag:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                    <span className="text-[11px] font-bold text-amber-400">1. HTF DOL ka hor wax kasta:</span>
                    <p className="text-[11px] text-slate-400">Ha taaban 5m chart adigoon Daily/7H/1H ku ogaan in qiimuhu u socdo IRL (FVG/OB) mise ERL (Old Highs/Lows). Haddii aadan aqoon halka uu liquidity-gu yaal, adigaa liquidity ah!</p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                    <span className="text-[11px] font-bold text-amber-400">2. Purge Timing oo Adag:</span>
                    <p className="text-[11px] text-slate-400">Trade ma jiro saacado random ah. Kaliya <strong>08:00–10:00 AM NY</strong> (Morning Prime), <strong>02:00–03:00 AM NY</strong> (London), ama <strong>08:00–10:00 PM NY</strong> (Asia).</p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                    <span className="text-[11px] font-bold text-amber-400">3. 2SSMT Dual Asset Confirmation:</span>
                    <p className="text-[11px] text-slate-400">Weligaa keligaa ha aaminin Dahabka. Waa in Silver (XAGUSD) ama XAUEUR uu muujiyaa SMT Divergence (mid jabo halka midka kale diido inuu jabo).</p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                    <span className="text-[11px] font-bold text-amber-400">4. Mechanical Entry #1 Line (No FOMO):</span>
                    <p className="text-[11px] text-slate-400">Ha eryan suuqa! Dhig Limit Order xariiqda dhamaadka 5m OB. Haddii uu ka tago adigoon la qaadan, aqbal missed trade oo sug setup xiga.</p>
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-300">
                  <strong>5. Xisaabta Asymmetric 3R Math:</strong> Khatar 1% kaliya, SL $8–$11, TP fixed 3R. Xitaa haddii aad guuleysato 42% kaliya, waxaad tahay mid si joogto ah u faa&apos;iida.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Rules Content */}
      {activeTab === 'RULES' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Card 1: Instrument & Risk */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
              <Target className="w-4 h-4" />
              Qalabka &amp; Maareynta Khatarta (Risk &amp; Instrument)
            </div>
            <ul className="text-xs text-slate-300 space-y-2 list-disc list-inside leading-relaxed">
              <li><strong>Qalabka:</strong> XAUUSD (Gold) KALIYA. Lama adeegsado lacagaha kale ee forex-ka.</li>
              <li><strong>Entry Timeframe:</strong> 5m (shan daqiiqo).</li>
              <li><strong>Risk:</strong> 1% per trade. Weligaa ha dhaafin 1%.</li>
              <li><strong>Target (TP):</strong> Caadi ahaan <strong>3R</strong>; mararka qaarna <strong>2R</strong> (haddii ERL ay dhowdahay ama SL uu weyn yahay).</li>
              <li><strong>SL Cabbirkiisa:</strong> Qiyaastii $9 - $10 dahabka. Haddii SL uu aad u weyn yahay, <em>ka bood trade-ka!</em></li>
              <li><strong>Waqtiyada:</strong> Dhammaan saacadaha waxaa lagu xisaabiyaa <strong>New York Time</strong>.</li>
            </ul>
          </div>

          {/* Card 2: HTF Bias & 7H Sessions */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
            <div className="flex items-center gap-2 text-sky-400 font-bold text-sm">
              <Clock className="w-4 h-4" />
              Daily Bias (Ustaad Zaki Habiib) &amp; 7H Sessions
            </div>
            <ul className="text-xs text-slate-300 space-y-2 list-disc list-inside leading-relaxed">
              <li><strong>Sharciga Zaki Habiib:</strong> Ha eegin 5m adigoon ogaan jihada maanta ee Daily Candle-ka (Daily Bias). Haddii kale wax kasta oo 5m ku aragto waa dabin (trap).</li>
              <li><strong>Draw on Liquidity (DOL):</strong> Haddii shalay suuqu taabtay discount IRL (FVG/OB), maanta bias waa <em>BULLISH</em> oo u socda PDH/ERL. Haddii uu sweep gareeyay PDH, bias waa <em>BEARISH</em> oo u socda discount IRL.</li>
              <li><strong>Iswaafajinta Bias:</strong> Daily &rarr; 7H &rarr; 1H waa inay isku jiho yihiin. 5m waxaad ka qaadan kartaa KALIYA setups-ka raacaya Daily Bias.</li>
              <li><strong>Power of 3 (AMD):</strong> Bullish Day wuxuu sameeyaa hoos-u-dhac (Judas Swing / Manipulation) inta lagu jiro London (02:00–03:00 AM NY), kadibna NY Purge (08:00–10:00 AM NY) wuxuu ku ballaartaa kor.</li>
              <li><strong>&quot;No Bias = No Trade&quot;:</strong> Haddii suuqu dhex fadhiyo oo uusan jirin Key Level cad, suuqa lama taabto!</li>
            </ul>
          </div>

          {/* Card 3: CRT & Turtle Soup (TS) */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
              <Layers className="w-4 h-4" />
              CRT, TS &amp; TSQ Sequence
            </div>
            <ul className="text-xs text-slate-300 space-y-2 list-disc list-inside leading-relaxed">
              <li><strong>CRT (Candle Range Theory):</strong> Candle 1 range dhigaa, Candle 2 hal dhinac sweep gareeyaa, Candle 3 dhinaca kale aadaa. Noocyada: 2-candle, 3-candle, inside bar, Type 6, Daily.</li>
              <li><strong>TS (Turtle Soup):</strong> Sweep lagu sameeyo swing high/low, kadibna qiimuhu dib ugu xirmo range-ka gudihiisa (failed breakout).</li>
              <li><strong>TSQ Sequence:</strong> KL &rarr; TS &rarr; S1 &rarr; entry #1 &rarr; (OTE &rarr; KOD) &rarr; TG.</li>
            </ul>
          </div>

          {/* Card 4: SMT, PSP & Invalidation */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
            <div className="flex items-center gap-2 text-purple-400 font-bold text-sm">
              <Sparkles className="w-4 h-4" />
              SMT Divergence, PSP &amp; Invalidation
            </div>
            <ul className="text-xs text-slate-300 space-y-2 list-disc list-inside leading-relaxed">
              <li><strong>SMT Pairs Saxda ah:</strong> XAUEUR, XAUGBP, ama Silver kaliya.</li>
              <li><strong>SMT Pairs QALADKA ah:</strong> XAUCHF, XAUNZD, AUD, JPY, ama single-stage SMT (sax ma aha).</li>
              <li><strong>PSP (Positive/Sync Polarization):</strong> Candles-ka Dahabka iyo SMT pair-ka waxay ku xirmaan midabbo iska soo horjeeda isla 1H saacaddaas.</li>
              <li><strong>Entry #1:</strong> Xariiqda ku taal DHAMAADKA 5m OB. Limit order. Haddii aan dib loogu noqon = missed trade.</li>
              <li><strong>Invalidation:</strong> Candle ayaa ku XIRMA (close) ka shisheeya 0.5 EQ ee HTF candle (wick yar waa la ogolyahay, close lama ogola).</li>
            </ul>
          </div>

          {/* Card 5: Isku Xirka Timeframeka (Ustaad Abdigurey) */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
            <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm">
              <Layers className="w-4 h-4" />
              Isku Xirka Timeframe-ka (Ustaad Abdigurey)
            </div>
            <ul className="text-xs text-slate-300 space-y-2 list-disc list-inside leading-relaxed">
              <li><strong>Fractal Chain of Command:</strong> Suuqu waa isku xiran yahay. Kuwa sare ayaa xukuma kuwa hoose: Daily &rarr; 1H &rarr; 5m.</li>
              <li><strong>1H vs 5m Xiriirkooda:</strong> 1H shumac kasta wuxuu ka kooban yahay <strong>12 shumac oo 5m ah</strong>. 15-ka daqiiqo ee hore (8:00–8:15 NY) waa Turtle Soup sweep/manipulation. 8:15–8:45 NY wuxuu bixiyaa 5m Entry #1 Line.</li>
              <li><strong>Qaanuunka Adag:</strong> Weligaa ha ka hor imaan HTF Bias. Haddii Daily/1H uu Bearish yahay, dhammaan 5m buy signals waa dabin!</li>
              <li><strong>Ka hortagga Jahwareerka:</strong> Ha eegin 10 timeframe. Ku xaddid falanqeyntaada Daily (Jihada &amp; DOL), 1H (Key Level &amp; Sweep), iyo 5m (Entry #1 Line).</li>
            </ul>
          </div>

          {/* Card 6: The 10% Edge vs 90% Traps (Cazaamm & TET) */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
              <Crosshair className="w-4 h-4" />
              The 10% Edge &amp; Anshaxa Xisaabta (TET Model)
            </div>
            <ul className="text-xs text-slate-300 space-y-2 list-disc list-inside leading-relaxed">
              <li><strong>Faraqa 90% vs 10%:</strong> 90% waxay eryadaan suuqa (Market Orders &amp; FOMO). 10%-ku waxay dejiyaan Limit Order xariiqda Entry #1 Line.</li>
              <li><strong>Missed Trade Aqbalid:</strong> Haddii Limit order-kaaga la gaari waayo 10 cents, ha eryan! Ka tagista trade-ku waa astaan guul.</li>
              <li><strong>Asymmetric 3R:</strong> 1% Risk, $8–$11 SL buffer oo ka dambeeya sweep wick, iyo fixed 3R Target. 45% win rate ayaa si degdeg ah xisaabtaada u korinaya.</li>
              <li><strong>Key Purge Windows:</strong> Kaliya ganacso 08:00–10:00 AM NY, 02:00–03:00 AM NY, ama 08:00–10:00 PM NY. Saacadaha kale edge-ku waa 0%.</li>
            </ul>
          </div>
        </div>
      )}

      {/* UNKNOWNs Tracker Content */}
      {activeTab === 'UNKNOWNS' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 text-xs text-slate-300 leading-relaxed">
            Qodobadaan 6-da ah lama xaqiijin ama mentor-ku ma bixin qeexid rasmi ah oo la xaqiijiyay. Kaaliyaha wuxuu ku jawaabayaa <strong>&quot;ma hubo&quot;</strong> mar kasta oo la weydiiyo. Markii aad cashar ka hesho sharaxaadda saxda ah, halkan ku qor xusuusintaada.
          </div>

          <div className="space-y-3">
            {unknowns.map((item) => (
              <div
                key={item.id}
                className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                        item.status === 'UNKNOWN'
                          ? 'bg-amber-950 text-amber-300 border border-amber-500/40'
                          : 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                      }`}
                    >
                      {item.status}
                    </span>
                    <h3 className="text-sm font-bold text-slate-100">{item.topic}</h3>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleToggleStatus(item.id)}
                    className="text-xs text-slate-400 hover:text-amber-300 underline font-medium self-start sm:self-auto"
                  >
                    U bedel {item.status === 'UNKNOWN' ? 'Confirmed' : 'Unknown'}
                  </button>
                </div>

                <p className="text-xs text-slate-400 bg-slate-950/40 p-3 rounded-lg border border-slate-800/60">
                  <strong className="text-slate-300">Aqoonta hadda jirta:</strong> {item.currentKnowledge}
                </p>

                <div>
                  <label className="block text-[11px] font-medium text-slate-300 mb-1">
                    Xusuusintaada ama Sharaxaadda Mentor-ka (User Notes / Mentor Quote):
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={item.userNotes || ''}
                      onChange={(e) => handleUpdateNotes(item.id, e.target.value)}
                      placeholder="Halkan ku qor haddii mentor-ku uu fasiray..."
                      className="flex-1 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:border-amber-500 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => handleSaveItem(item.id)}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1 transition"
                    >
                      {savedSuccessId === item.id ? (
                        <>
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                          <span>La keydiyay</span>
                        </>
                      ) : (
                        <>
                          <Save className="w-3.5 h-3.5 text-slate-400" />
                          <span>Keydi</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
