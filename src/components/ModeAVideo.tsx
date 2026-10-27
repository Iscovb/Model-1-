import React, { useState } from 'react';
import { Video, FileText, Play, Copy, Check, Sparkles, AlertTriangle, BookOpen, RefreshCw } from 'lucide-react';

interface Props {
  onUnknownDiscovered?: (item: string, details: string) => void;
}

const SAMPLE_TRANSCRIPT = `[00:00:15] Mentor: In today's session on XAUUSD Model#1, remember our daily bias must align Daily down to 7H and 1H. Direction is always IRL to ERL for buys.
[00:02:40] Rule: Your KL on 4H or 1H has to be an Order Block (OB), FVG or IFVG. We wait for a liquidity sweep.
[00:05:10] Look at this purge at 8:00 AM New York time. The candle sweeps the previous session low and closes back inside the range—that's our Turtle Soup (TS).
[00:07:30] At the exact same hour, compare gold with XAUEUR. Gold took the low, but XAUEUR refused to take the low—clear 2SSMT coming from IRL! Also notice the PSP: gold closed as a green candle while XAUEUR closed red.
[00:10:15] Never use XAUCHF or AUD for SMT on gold, those are completely invalid. Only XAUEUR, XAUGBP or Silver are valid.
[00:13:00] Drop to the 5m. We see a bullish 5m OB form. Our Entry #1 is the line at the end of the OB. We set a limit order right at that line. If price leaves without touching Entry #1, we do NOT chase it—it's a missed trade.
[00:16:20] Stop loss is set just beyond the TS sweep low. Here the SL was $9.50. Risk 1% of the account. Target is standard 3R reaching for the PDH liquidity target.
[00:18:45] Let's review an example trade: On March 12, 2026, Buy setup on XAUUSD at 08:15 NY. Checklist visible: IRL to ERL, 1H OB KL, 8am NY purge, TS sweep, XAUEUR SMT, PSP confirmed, limit order hit at line #1. Result: full 3R TP hit at PDH.
[00:21:00] Note on KOD: someone asked in Discord about KOD in the TSQ sequence. KOD stands for "Key Order Delivery"—it is when price reaches the institutional delivery zone before target TG.`;

const OCT_RECAP_TRANSCRIPT = `[00:00:10] Ustaad Saami: Asalaamu Calaykum dhamaantiin, ku soo dhowaada Trade Recap-ka 14 ilaa 16 October 2026 ee Model#1 Dahabka (XAUUSD).
[00:01:30] Ka dib hoos u dhacii weynaa ee Oct 14 markii dahabku gaaray $4,073, dad badan waxay noqdeen kuwa baqaya oo u haysta in suuqu sii dhacayo. Laakiin sharcigeena Model#1: suuqu wuxuu dhammeystiray Internal Range Liquidity (IRL discount sweep). Draw on Liquidity (DOL) wuxuu u wareegay ERL xagga sare.
[00:03:45] Oct 15 Subaxii NY Session: 8:00 AM Purge candle ayaa bilaabmay. Key Level-keenu wuxuu ahaa 4H Bullish FVG iyo Discount PDL oo ku yaal agagaarka $4,100.
[00:05:20] Eega Turtle Soup (TS) sweep-ka: Dahabku wuxuu hoos u xaaqay Asian Low ilaa $4,099.50, isla markiiba wuxuu dib ugu xirmay range-ka gudihiisa (failed breakdown).
[00:07:15] Waqtigaas saxda ah, eega SMT Divergence: Dahabku wuxuu dhigay Lower Low ($4,099.50), laakiin Silver (XAGUSD) wuxuu diiday inuu hoos u jabo wuxuuna sameeyay Higher Low. Tani waa 2SSMT oo aad u nadiif ah. PSP-na waa xaqiijiyay isla 1H.
[00:09:40] Markii aan u degnay 5m chart: Waxaan aragnay Market Structure Shift iyo Bullish Order Block. Sharciga Model#1: Meesha gelitaanku waa xariiqda ku taal DHAMAADKA 5m OB (Entry #1 Line). Limit order ayaa la dhigay $4,109.00.
[00:11:50] Stop Loss (SL): Waxaa la dhigay $4,100.00 (hoos uga dhacsan sweep wick-ka). SL distance waa $9.00. Ha dhigin SL weyn oo $12 ka badan.
[00:13:30] Target: 3R default target ($4,136.00). Dahabku wuxuu gaaray high dhan $4,177.59, 3R oo dhameystiranna si xarrago leh ayaa loo qaatay.
[00:15:20] Casharka ugu weyn ee recap-kan: Ganacsatada badankoodu waxay ka cabsadeen inay iibsadaan sababtoo ah shalay ayuu suuqu aad u daatay. Laakiin markaad haysato Model#1, ha eegin cabsi ama dareen — raac Key Level, Purge hour (8-10am NY), SMT confirmation, iyo Entry #1 Limit Order!`;

const RECAP_A_TRANSCRIPT = `[00:00:15] Mentor: Kani waa Trade Recap ku saabsan shaxanka Dahabka XAUUSD Model#1. Waxa ugu muhiimsan ee aan maanta baraneyno waa sida loo noqdo "Chart Friendly"—ha isku dhex qasin 10 shay oo shaxanka ku yaal, ku eeg shaxanka si deggan oo fudud.
[00:02:10] Eeg meesha trade-ka laga qaato: Waxaan kaliya eegnaa 1H ama 4H Key Level (FVG ama OB). Ha gelin trade meel bannaan oo uusan jirin Key Level cad.
[00:04:30] Marka uu suuqu soo galo Key Level-ka, sug Turtle Soup (TS) sweep. Waa inuu qaataa liquidity (Asia High ama PDL) kadibna dib ugu xirmaa range-ka gudihiisa (rejection wick).
[00:07:00] SMT Divergence waa khasab: Haddii dahabku sweep gareeyo laakiin Silver ama XAUEUR uu diido inuu sweep gareeyo, taasi waa confirmation-ka rasmiga ah ee hay'adaha maaliyadda.
[00:09:45] Entry-ga saxda ah: U deg 5m timeframe. Ha gelin market order! Sug 5m displacement iyo Order Block. Limit Order ku dhig xariiqda ku taal DHAMAADKA 5m OB (Entry #1 Line).
[00:12:15] Stop Loss (SL): Dhig wax yar ka shisheeya wick-ka sweep-ka ($8-$10 buffer dahabka). Target waa 3R fixed target oo ku wajahan ERL / PDH.`;

const RECAP_B_TRANSCRIPT = `[00:00:10] Mentor: Ku soo dhowaada Trade Recap-ka labaad ee Model#1. Maanta waxaan baranaynaa sida loo fahmo qulqulka liquidity-ga (IRL to ERL) iyo sababta ay tahay inaad u noqoto chart friendly.
[00:02:40] Purge Timing: 8:00 AM ilaa 10:00 AM NY Session waa waqtiga uu suuqu bixiyo setups-ka ugu tayada sarreeya Dahabka. Ha ganacsan suuqa oo fadhiya inta u dhaxeysa sessions-ka.
[00:05:15] Xagee laga qaataa trade-ka? Marka qiimuhu ka soo noqdo discount (IRL), wuxuu u socdaa ERL (Previous Day High ama Old Highs). Ha isku qasin timeframes badan.
[00:07:50] Markii 5m Order Block uu sameysmo, qiimuhu wuxuu dib ugu soo noqdaa Entry #1 Line. Haddii uu Limit-kaaga taaban waayo oo uu ka tago, ha eryan! Taasi waa qaanuun adag oo Model#1 ah.
[00:11:00] Khatarta: 1% oo kaliya. SL $9.50. Target 3R. Anshaxu waa waxa kaa dhigaya ganacsade guuleysta.`;

const TSQ_TIMING_TRANSCRIPT = `[00:00:15] Mentor: In this lesson from TET Community, we master the "1H TSQ & Key Timing" for XAUUSD Model#1.
[00:02:30] What is 1H TSQ? TSQ stands for "The Sequence" or "Turtle Soup Sequence". It is the chronological institutional process that the 1H candle must follow to produce an A+ setup.
[00:05:00] Stage 1 of TSQ: Identify HTF Draw on Liquidity (DOL) — is price moving IRL to ERL (Buys) or ERL to IRL (Sells)?
[00:07:45] Stage 2 of TSQ: The 1H Key Level (KL) Tap. Price must enter an unmitigated 1H/4H Fair Value Gap (FVG), Inversion FVG, or Order Block.
[00:10:15] Stage 3 of TSQ: The 1H Turtle Soup (TS) Sweep. During the first 15 to 30 minutes of the 1H candle, price sweeps beyond liquidity (Asian High/Low, PDH/PDL), but fails to close beyond it—leaving a rejection wick.
[00:13:00] Stage 4 of TSQ: 2SSMT Confirmation. Silver (XAGUSD) or XAUEUR must show clear divergence (refusing to make the new extreme).
[00:15:30] Stage 5 of TSQ: 1H PSP. Candles close in opposing colors on 1H.
[00:17:45] Key Timing: A setup is NOTHING without time! The institutional algorithms run strictly during:
- New York Morning Purge: 08:00 AM – 10:00 AM NY Time (Peak window: 08:00 - 08:45 AM).
- London Open Purge: 02:00 AM – 03:00 AM NY Time.
- Asia Session Purge: 08:00 PM – 10:00 PM NY Time.
Outside these hours, do NOT trade!
[00:20:10] Execution on 5m: Wait for displacement and valid 5m OB. Place LIMIT ORDER right at the end of the 5m OB (Entry #1 Line). SL beyond sweep wick ($8-$11). Target fixed 3R.`;

const THE_EDGE_TRANSCRIPT = `[00:00:15] Mentor: Welcome to Class 09: "THE EDGE | 2026 Mentorship" by TET Community (Triple Edge Traders).
[00:02:10] Why are we called "Triple Edge Traders"? What is "The Edge" that separates our community from 95% of losing retail traders?
[00:04:30] EDGE #1: The HTF Narrative & Draw on Liquidity (DOL). Most traders enter based on candle patterns. Our first edge is knowing whether price is traveling IRL to ERL (Buys) or ERL to IRL (Sells) before touching lower timeframes.
[00:07:00] EDGE #2: The Purge Window & Key Timing. An edge only exists in specific hourly institutional windows: 08:00–10:00 AM NY (Prime Morning Purge), 02:00–03:00 AM NY (London), and 08:00–10:00 PM NY (Asia). Outside these hours, edge drops to 0%.
[00:10:15] EDGE #3: 2SSMT + The Mechanical Entry #1 Line. We don't guess if a sweep is real; Silver (XAGUSD) or XAUEUR must confirm divergence. And our entry is never emotional market execution—it is a Limit Order placed at the END of the 5m OB (Entry #1 Line).
[00:13:40] Risk Asymmetry & Probability: You do not need to win 90% of trades. With a fixed 3R target and a disciplined 1% risk per trade, a 45% win rate makes you consistently profitable.
[00:16:30] The Psychology of The Edge: You lose your edge the moment you violate rules: entering without a Key Level, chasing missed trades when Entry #1 isn't touched, or moving your Stop Loss. Stick to the 3 edges!`;

const TEN_PERCENT_EDGE_TRANSCRIPT = `[00:00:15] Cazaamm / TET Community: Welcome to "The 10% Edge | TET MODEL". In this class, we break down what separates the top 10% of consistently profitable traders from the 90% of retail traders who continually blow accounts.
[00:02:30] The 90% Mentality: Retail traders hunt for setups all day, clutter their charts with indicators, and enter aggressively at market price with high emotion. They treat every green or red candle as an opportunity.
[00:05:00] The 10% Edge - Pillar 1: HTF DOL (Draw on Liquidity). Before looking at lower timeframes, you must know the narrative. Price moves strictly between Internal Range Liquidity (IRL: FVG/OB) and External Range Liquidity (ERL: Old Highs/Lows, PDH/PDL). If you don't know the DOL, you are the liquidity!
[00:07:45] The 10% Edge - Pillar 2: Algorithmic Purge Timing. Setups only exist in institutional delivery windows. Outside these windows, our edge is 0%.
- NY Morning Purge: 08:00 AM – 10:00 AM NY (Prime setup delivery).
- London Purge: 02:00 AM – 03:00 AM NY.
- Asia Purge: 08:00 PM – 10:00 PM NY.
If the 1H Turtle Soup sweep does not occur during these hours, we do NOT touch the chart.
[00:11:00] The 10% Edge - Pillar 3: 2SSMT Inter-market Divergence. We never take a solo XAUUSD sweep at face value. Silver (XAGUSD) or XAUEUR must confirm the divergence (one sweeps the level while the other refuses). This filters out fake institutional sweeps.
[00:13:40] The 10% Edge - Pillar 4: Mechanical Entry #1 Line (No Chasing). Drop to the 5m. After displacement and 5m Order Block creation, we place a LIMIT ORDER at the end of the 5m OB (Entry #1 Line). If price takes off without mitigating our limit, we let it go peacefully. Chasing a missed trade destroys your edge.
[00:16:50] The 10% Edge - Pillar 5: Probability & Asymmetrical 3R. Risk strictly 1% of equity per trade. Stop Loss is set $8.00–$11.00 behind the sweep wick (if SL > $12.00, abort). Target is fixed 3R. With 3R targets, even a 40%-45% win rate compounds your account dramatically.
[00:19:30] Summary: The 10% Edge is doing LESS, but doing it with absolute chart-friendly clarity, mechanical precision, and zero emotional interference.`;

const DAILY_BIAS_ZAKI_TRANSCRIPT = `[00:00:15] Ustaad Zaki Habiib / Coach Abdiaziz: Asalaamu Calaykum dhamaantiin. Casharkan maanta oo taariikhdu tahay 20 Aug 2026, waxaan si qoto-dheer u guda-galeynaa "Daily Bias" — sidee loo gartaa jihada maanta ee dahabka (XAUUSD)?
[00:02:45] Khaladka ugu weyn: Dad badan ayaa subaxdii chart-ka furta, kadibna toos u gala 5m ama 15m iyagoo doonaya inay galaan trade. Taasi waa sababta account-yada loo qarxiyo. Haddii aadan aqoon jihada maanta ee Daily Candle-ka (Daily Bias), wax kasta oo 5m ku aragto waa dabin (trap).
[00:06:10] Sharciga 1-aad: Draw on Liquidity (DOL) & IRL to ERL.
- Su'aasha ugu horreysa: "Halkeey shalay shumacii Daily ku xirmay?"
- Ma wuxuu ka soo noqday discount Key Level (Daily/4H FVG ama OB)? Haddii uu discount taabtay, DOL wuxuu u socdaa ERL (Previous Day High - PDH ama Old Highs). Maanta bias-keenu waa BULLISH!
- Haddii uu shalay sweep gareeyay Previous Day High (ERL) oo uu ku xirmi waayay, DOL wuxuu u socdaa IRL (discount imbalance). Maanta bias-keenu waa BEARISH!
[00:10:20] Sharciga 2-aad: Iswaafajinta Timeframes-ka (Daily -> 7H -> 1H).
- Weligaa ha ku ganacsan shaxan khilaafsan Daily Bias.
- Haddii Daily Bias uu yahay Bullish, 7H candle-ka iyo 1H waa inay raacaan jihadaas. 5m chart-ka waxaad kaliya ka raadineysaa BUY setups. Dhammaan sell signals waa inaad iska indho-tirtaa!
[00:14:35] Sharciga 3-aad: Shaxanka Power of 3 (AMD: Accumulation, Manipulation, Distribution).
- Bullish Day: Suuqu wuxuu furaa 00:00 NY, wuxuu hoos u dhacaa (Judas Swing / Manipulation) inta lagu jiro London (02:00-03:00 AM NY) ama Asia si uu u taabto discount level. Kadib NY Purge (08:00-10:00 AM NY) wuxuu u qulqulaa xagga sare isagoo xaaqaya PDH.
- Bearish Day: Wuxuu kor u boodaa Open-ka ka dib (manipulation), kadibna NY Session wuxuu hoos ugu daataa xagga PDL.
[00:18:15] Sharciga 4-aad: "No Bias = No Trade".
- Haddii suuqu ku jiro bartamaha range-ka (midpoint) oo uusan jirin Key Level cad ama DOL cad, ha ku qasbin trade! Ilaalinta raasumaalkaaga (capital preservation) ayaa ka mudan trade aan hubaal ahayn.
[00:21:40] Gunaanad: Daily Bias maaha male-awaal ama indicator; waa fahanka qulqulka liquidity-ga ee hay'adaha maaliyadda. Markaad fahamto Daily Bias, Model#1 wuxuu kuu noqonayaa hub awood badan.`;

const ISKU_XIRKA_TIMEFRAME_TRANSCRIPT = `[00:00:15] Ustaad Abdigurey / TET Community: Asalaamu Calaykum dhamaantiin. Casharkan qiimaha badan waxaan kaga hadlaynaa "Sirta Suuqa Forex: Isku Xirka Timeframe-ka" (Multi-Timeframe Synchronization).
[00:02:40] Sababta jahwareerka: Ganacsatada badankoodu waxay furaan 15m oo u sheegaya Buy, 1H oo u sheegaya Sell, iyo 4H oo jiho kale u socda. Markaas ayay is-weydiiyaan: "Kumaan rumeystaa?"
[00:05:30] Xeerka 1-aad: Suuqu waa Fractal (Chain of Command).
Timeframe kasta wuxuu leeyahay shaqo gaar ah, laakiin kuwa sare ayaa xukuma kuwa hoose:
1. Daily & 7H (The Macro Engine / Direction): Waxay go'aamiyaan Draw on Liquidity (DOL) — IRL to ERL. Kani waa jihada weyn ee tareenka.
2. 4H & 1H (The Setup & Key Level Frame): Halkan ayay ku yaallaan Fair Value Gaps (FVG), Order Blocks (OB), iyo heerarka Turtle Soup (TS) sweep-ku ka dhaco.
3. 5m (The Execution Frame): Waa halka laga qaato Entry #1 Line (dhamaadka 5m OB).
[00:09:50] Xeerka 2-aad: Weligaa ha ka hor imaan Timeframe-ka Sare.
Haddii 1H ama Daily ay ku jiraan Bearish trend oo u socdaan discount liquidity, xitaa haddii aad 5m ku aragto Double Bottom ama Buy pattern qurux badan, HA GELIN! Waa dabin lacagtaada lagu xaaqayo. 5m waxaad ka qaadaneysaa KALIYA trades-ka la socda jihada 1H iyo Daily.
[00:13:45] Xeerka 3-aad: Sida 1H iyo 5m Isugu Xirmaan Waqtiga Purge-ka (8:00 AM NY).
Shumac kasta oo 1H ah wuxuu ka kooban yahay laba-iyo-toban (12) shumac oo 5m ah.
- Marka 1H candle uu furmo 8:00 AM NY, 15-ka daqiiqo ee ugu horreysa (sadexda shumac ee ugu horreeya 5m) waxay badanaa sameeyaan Turtle Soup manipulation (Judas Swing) oo ay ku xaaqaan liquidity-ga.
- Marka 1H uu diido inuu jabka sii wado oo uu reebto wick (rejection), 5m ayaa bixiya Market Structure Shift iyo Order Block. Halkan ayaad Limit Order ku dhigeysaa Entry #1 Line inta u dhaxaysa 8:15 ilaa 8:45 AM NY!
[00:17:30] Xeerka 4-aad: Xaddid Timeframes-kaaga (Analysis Paralysis).
Ha eegin 8 ama 10 timeframe! Nidaamkeena TET Model#1 wuxuu ku dhisan yahay: Daily -> 1H -> 5m.
Haddii labada sare (Daily iyo 1H) aysan is waafaqsanayn, ma jiro wax trade ah oo la galayo. Fadhiiso oo xakamee nafsaddaada!
[00:20:50] Gunaanad: Isku xirka timeframes-ku waa furaha runta ah ee kaa dhigaya ganacsade yaqaana meesha uu suuqu ka yimid, halka uu joogo, iyo meesha uu u socdo.`;

export const ModeAVideo: React.FC<Props> = () => {
  const [videoUrl, setVideoUrl] = useState('');
  const [transcript, setTranscript] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleLoadSample = () => {
    setVideoUrl('https://youtube.com/watch?v=example-tet-model1-gold');
    setTranscript(SAMPLE_TRANSCRIPT);
  };

  const handleLoadIskuXirkaTimeframe = () => {
    setVideoUrl('https://youtu.be/MMkuGU0wB8U');
    setTranscript(ISKU_XIRKA_TIMEFRAME_TRANSCRIPT);
  };

  const handleLoadDailyBiasZaki = () => {
    setVideoUrl('https://youtu.be/Ld9PKnEf1Zk');
    setTranscript(DAILY_BIAS_ZAKI_TRANSCRIPT);
  };

  const handleLoadTenPercentEdge = () => {
    setVideoUrl('https://youtu.be/-r7KdbCKDds');
    setTranscript(TEN_PERCENT_EDGE_TRANSCRIPT);
  };

  const handleLoadTheEdge = () => {
    setVideoUrl('https://youtu.be/BY5tdw6Gnjc');
    setTranscript(THE_EDGE_TRANSCRIPT);
  };

  const handleLoadTsqLesson = () => {
    setVideoUrl('https://youtu.be/Y7fOO97hbns');
    setTranscript(TSQ_TIMING_TRANSCRIPT);
  };

  const handleLoadOctRecap = () => {
    setVideoUrl('https://youtu.be/X1eI4yT-m4A');
    setTranscript(OCT_RECAP_TRANSCRIPT);
  };

  const handleLoadRecapA = () => {
    setVideoUrl('https://youtu.be/aIxfA-izono');
    setTranscript(RECAP_A_TRANSCRIPT);
  };

  const handleLoadRecapB = () => {
    setVideoUrl('https://youtu.be/M_s41oD-a08');
    setTranscript(RECAP_B_TRANSCRIPT);
  };

  const handleAnalyze = async () => {
    if (!transcript.trim()) {
      setError('Fadlan geli qoraalka (transcript) ama qoraal ka yimid muuqaalka.');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch('/api/analyze-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript, videoUrl }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Khalad ayaa dhacay intii lagu jiray falanqeynta.');
      }

      setResult(data.analysis);
    } catch (err: any) {
      setError(err.message || 'Khalad ayaa dhacay.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!result) return;
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Introduction Card */}
      <div className="bg-slate-900/80 rounded-2xl p-6 border border-slate-800 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Video className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100">
                Mode A: Falanqeynta Muuqaalka (Video Analysis)
              </h2>
              <p className="text-xs text-slate-400">
                Geli link-ga ama transcript-ka casharka TET mentorship si sharciyada loo saaro, loo calaamadeeyo (NEW/SAME/CONTRADICTS), loona xaqiijiyo UNKNOWN items.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={handleLoadIskuXirkaTimeframe}
              type="button"
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-500 hover:bg-indigo-400 text-white text-xs font-bold transition shadow-md shadow-indigo-500/20"
              title="Soo geli Casharka: Sirta Suuqa Forex | Isku Xirka Timeframeka | Ustaad Abdigurey | TET community"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              Isku Xirka Timeframe (Abdigurey)
            </button>
            <button
              onClick={handleLoadDailyBiasZaki}
              type="button"
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition shadow-md shadow-emerald-500/20"
              title="Soo geli Casharka: Daily Bias | Ustaad Zaki Habiib | 20 Aug 2026 (Coach Abdiaziz)"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              Daily Bias (Zaki)
            </button>
            <button
              onClick={handleLoadTenPercentEdge}
              type="button"
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition shadow-md shadow-amber-500/20"
              title="Soo geli Casharka: The 10% Edge | TET MODEL (TET Community)"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              The 10% Edge
            </button>
            <button
              onClick={handleLoadTheEdge}
              type="button"
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition"
              title="Soo geli Casharka: 09 THE EDGE | 2026 MENTORSHIP (TET Community)"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              09 THE EDGE
            </button>
            <button
              onClick={handleLoadTsqLesson}
              type="button"
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition"
              title="Soo geli Casharka: Mastering the 1H TSQ & Key Timing (TET Community)"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              1H TSQ &amp; Key Timing
            </button>
            <button
              onClick={handleLoadRecapA}
              type="button"
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition"
              title="Soo geli: Recap 1 (Chart Friendly & Entry Zones)"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              Recap 1
            </button>
            <button
              onClick={handleLoadRecapB}
              type="button"
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition"
              title="Soo geli: Recap 2 (IRL to ERL)"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              Recap 2
            </button>
            <button
              onClick={handleLoadOctRecap}
              type="button"
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition"
              title="Soo geli Trade Recap-kii 14-16 October 2026"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              Recap 14–16 Oct
            </button>
            <button
              onClick={handleLoadSample}
              type="button"
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 border border-slate-800 text-xs transition"
            >
              <Sparkles className="w-3 h-3 text-amber-400" />
              Tusaale Guud
            </button>
          </div>
        </div>

        {/* Input Form */}
        <div className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Link-ga Muuqaalka / Video URL (Ikhtiyaari)
            </label>
            <input
              type="text"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="e.g. https://youtube.com/watch?v=... ama TET Mentorship Class #4"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/70 border border-slate-800 text-slate-200 text-sm focus:outline-none focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/60 placeholder-slate-600"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-medium text-slate-300">
                Qoraalka Muuqaalka (Video Transcript ama Notes leh Timestamps) <span className="text-amber-400">*</span>
              </label>
              <span className="text-[11px] text-slate-500">
                {transcript.length} xaraf
              </span>
            </div>
            <textarea
              rows={8}
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              placeholder="Halkan ku dheji transcript-ka muuqaalka, timestamps-ka, ama hadalada macallinka..."
              className="w-full px-3.5 py-3 rounded-xl bg-slate-950/70 border border-slate-800 text-slate-200 text-sm font-mono focus:outline-none focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/60 placeholder-slate-600 leading-relaxed"
            />
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex items-center justify-between pt-2">
            <div className="text-[11px] text-slate-400 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-ping"></span>
              Sharciga: Ha abuurin wax aan ku jirin aqoonta (DO NOT INVENT). Haddii wax la waayo: "ma hubo".
            </div>
            <button
              onClick={handleAnalyze}
              disabled={loading || !transcript.trim()}
              type="button"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs tracking-wide shadow-lg shadow-amber-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                  Falanqeynayaa Model#1...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-slate-950" />
                  Bilaab Falanqeynta Muuqaalka
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Structured Output Section */}
      {result && (
        <div className="bg-slate-900/90 rounded-2xl p-6 border border-amber-500/30 shadow-2xl space-y-4">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                <Check className="w-4 h-4" />
              </div>
              <h3 className="text-base font-bold text-slate-100">
                Natiijada Falanqeynta Muuqaalka (Model#1 Report)
              </h3>
            </div>
            <button
              onClick={handleCopy}
              type="button"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  Nuqul baa la qaatay!
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-400" />
                  Nuqul ka qaad Qoraalka
                </>
              )}
            </button>
          </div>

          {/* Render markdown result nicely */}
          <div className="prose prose-invert max-w-none text-slate-200 text-sm leading-relaxed whitespace-pre-wrap font-sans bg-slate-950/60 p-5 rounded-xl border border-slate-800/80">
            {result}
          </div>

          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200/90 flex items-start gap-2.5">
            <BookOpen className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
            <div>
              <span className="font-semibold block text-amber-300">Talada Ganacsadaha:</span>
              Haddii muuqaalku ka jawaabay qodob ka mid ah UNKNOWNs (sida micnaha KOD ama OTE), waxaad u wareejin kartaa tab-ka <strong>"Aqoonta & UNKNOWNs"</strong> si aad u xaqiijiso.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
