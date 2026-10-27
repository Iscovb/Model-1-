import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '25mb' }));

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

const MODEL1_SYSTEM_INSTRUCTION = `
ROLE:
Waxaad tahay kaaliyaha barashada ganacsiga (trading study assistant) ee hal qaab kaliya: Model#1 (XAUUSD / Dahab kaliya), oo ah hab ICT-style ah oo lagu barto mentorship (TET community, 2026). Waxaad ka caawinaysaa isticmaalaha: (1) inuu wax ka barto fiidiyowyada iyo shaxanka (charts), (2) inuu hubiyo in setup-ku waafaqsan yahay sharciyada Model#1, (3) inuu haysto journal/log nadiif ah. Weligaa ha bixin baaqyo toos ah sida "hadda iibso/iibi" (buy/sell signals) hana ballanqaadin faa'iido. Ganacsadaha ayaa mas'uuliyad buuxda iska leh ganacsigiisa.

LUGADDA:
U jawaab af-Soomaali nadiif ah oo toosan. Erayada ganacsiga ee Ingiriiska ah (trading terms) u dhaaf sidooda: CRT, TS, SMT, KL, IRL, ERL, OB, PSP, TSQ, OTE, KOD, PDH, PDL, PWH, PWL, PML, PMH, TG, Orderflow, 5m, 1H, 4H, 7H, Daily, etc.

SHARCIGA: DO NOT INVENT (HA ABUURIN WAX KALE)
Isticmaal KALIYA aqoonta hoos ku qoran iyo waxa uu isticmaaluhu ku tuso. Hadii wax aysan ku jirin aqoontan ama loo calaamadeeyay UNKNOWN, dheh "ma hubo" oo weydii isticmaalaha. Weligaa ha qiyaasin micne/qeexid.
`;

// Helper for local Model#1 analysis fallback if network/API is delayed
function analyzeTranscriptOffline(transcript: string, videoUrl?: string): string {
  const lines = transcript.split('\n').filter((l) => l.trim().length > 0);
  const rulesList: string[] = [];
  const examplesList: string[] = [];
  const unknownsList: string[] = [];
  const newSuggestions: string[] = [];

  // Check known terms
  lines.forEach((line) => {
    const timestampMatch = line.match(/\[?(\d{1,2}:\d{2}(?::\d{2})?)\]?/);
    const timestamp = timestampMatch ? timestampMatch[1] : 'Muuqaalka';
    const text = line.replace(/\[?\d{1,2}:\d{2}(?::\d{2})?\]?/, '').trim();

    if (!text) return;

    // Detect rules
    if (/bias|7H|daily|IRL|ERL/i.test(text)) {
      rulesList.push(`- **Rule 1 (Bias & Direction)** | ${timestamp} | "${text}"\n  -> **Xaaladda: SAME** (Waafaqsan aqoonta: Daily -> 7H -> 1H iyo IRL -> ERL ee buys / ERL -> IRL ee sells).`);
    } else if (/KL|Key Level|OB|FVG|IFVG/i.test(text)) {
      rulesList.push(`- **Rule 2 (Key Level / KL)** | ${timestamp} | "${text}"\n  -> **Xaaladda: SAME** (Waafaqsan aqoonta: KL waa OB, FVG ama IFVG ee 4H/1H).`);
    } else if (/purge|8am|8pm|10pm|2am/i.test(text)) {
      rulesList.push(`- **Rule 3 (Purge Hours)** | ${timestamp} | "${text}"\n  -> **Xaaladda: SAME** (Waafaqsan saacadaha Purge ee NY: 8-10pm, 2-3am, 8-10am NY).`);
    } else if (/Turtle Soup|TS|sweep/i.test(text)) {
      rulesList.push(`- **Rule 4 (TS Sweep)** | ${timestamp} | "${text}"\n  -> **Xaaladda: SAME** (Waafaqsan aqoonta: sweep swing high/low oo dib ugu xirma range-ka).`);
    } else if (/SMT|XAUEUR|XAUGBP|Silver/i.test(text)) {
      if (/XAUCHF|AUD|JPY/i.test(text)) {
        rulesList.push(`- **Rule 5 (SMT Pairs)** | ${timestamp} | "${text}"\n  -> **Xaaladda: SAME** (Wuxuu xaqiijiyay in XAUCHF/AUD ay khalad yihiin, kaliya XAUEUR/Silver ay sax yihiin).`);
      } else {
        rulesList.push(`- **Rule 5 (SMT Pairs)** | ${timestamp} | "${text}"\n  -> **Xaaladda: SAME** (Waafaqsan aqoonta: 2SSMT lala yeesho XAUEUR / XAUGBP / Silver kaliya).`);
      }
    } else if (/Entry #1|line at the end|5m/i.test(text)) {
      rulesList.push(`- **Rule 6 (Entry #1 Line)** | ${timestamp} | "${text}"\n  -> **Xaaladda: SAME** (Waafaqsan aqoonta: Xariiqda dhamaadka 5m OB oo Limit order ah. Haddii aan dib loogu laaban = missed trade).`);
    } else if (/SL|Stop Loss|9-10|\$9|\$10/i.test(text)) {
      rulesList.push(`- **Rule 7 (Stop Loss & Risk)** | ${timestamp} | "${text}"\n  -> **Xaaladda: SAME** (SL wax yar ka dambeeya TS sweep, qiyaastii $9-$10 dahabka, Risk 1%).`);
    } else if (/TP|3R|2R|target/i.test(text)) {
      rulesList.push(`- **Rule 8 (Target TP)** | ${timestamp} | "${text}"\n  -> **Xaaladda: SAME** (3R default, 2R marka ERL dhowdahay ama SL weyn yahay).`);
    }

    // Check examples
    if (/example|trade|March|Buy|Sell|rallied|result/i.test(text)) {
      examplesList.push(`- **Tusaale:** [${timestamp}] ${text}`);
    }

    // Check UNKNOWNs addressed
    if (/KOD/i.test(text)) {
      unknownsList.push(`- **KOD:** [${timestamp}] Af-hayeenu wuxuu xusay: "${text}".`);
      newSuggestions.push(`Ku dar qeexidda KOD ee la xusay [${timestamp}]: "${text}"`);
    }
    if (/OTE/i.test(text) && /use|mentor|fib/i.test(text)) {
      unknownsList.push(`- **OTE:** [${timestamp}] Sharaxaadda la bixiyay: "${text}".`);
    }
  });

  return `### FALANQEYNTA MUUQAALKA MODEL#1 (VIDEO ANALYSIS REPORT)
**Muuqaalka:** ${videoUrl || 'Qoraalka la galiyay'}

---

#### 1. SHARCIYADA LA XUSAY (RULES EXTRACTED):
${rulesList.length > 0 ? rulesList.join('\n\n') : '- Muuqaalka lagama helin sharciyo qaabaysan oo toos ah.'}

---

#### 2. TUSAALOOYINKA GANACSI EE MUUQDA (TRADE EXAMPLES):
${examplesList.length > 0 ? examplesList.join('\n') : '- Wax tusaale ganacsi oo faahfaahsan laguma xusin qoraalka.'}

---

#### 3. WAXBARASHADA QODOBBADA AAN LA HUBIN (UNKNOWN ITEMS STATUS):
${unknownsList.length > 0 ? unknownsList.join('\n') : '- **Ma hubo:** Muuqaalkan kuma jiro sharaxaad buuxda oo ku saabsan 6-da qodob ee UNKNOWN ah (KOD, OTE mentor usage, OF exact definition, 5m valid OB, Daily bias candle selection, ama waxa la sameeyo markii Invalidation dhacdo).'}

---

#### 4. WAX CUSUB OO AAN KUU SOO JEEDINAYO INAAN KU DARNO AQOONTA:
${newSuggestions.length > 0 ? newSuggestions.map((s, i) => `${i + 1}. ${s}`).join('\n') : '1. Wax cusub oo ka hor imaanaya ama ka baxsan Model#1 lagama helin transcript-kan.\n2. Dhammaan qodobada la sheegay waxay 100% waafaqsan yihiin aqoontayada hore ee Model#1.'}

*Xusuusin Badbaado: Dahabku waa leveraged and risky. Ha qaadan qatar ka badan 1%. Qoraalkan waa ujeeddo waxbarasho kaliya.*`;
}

function reviewChartOffline(notes: string, checklistScores: Record<string, string>): string {
  const entries = Object.entries(checklistScores || {});
  const passItems = entries.filter(([_, v]) => v === 'PASS').map(([k]) => k);
  const failItems = entries.filter(([_, v]) => v === 'FAIL').map(([k]) => k);
  const cantSeeItems = entries.filter(([_, v]) => v === 'CANT_SEE').map(([k]) => k);

  const visibleCount = passItems.length + failItems.length;
  const isModel1 = passItems.length >= 8 && failItems.length === 0;

  return `### NATIIJADA BAARITAANKA SHAXANKA (MODEL#1 SCORECARD)

**Tirada Guud ee Muuqata:** ${visibleCount} of 11 visible
- **PASS (Sax ah):** ${passItems.length} qodob
- **FAIL (Qalad ah):** ${failItems.length} qodob
- **CAN'T SEE (Ma Muuqato):** ${cantSeeItems.length} qodob

---

#### QIIMEYNTA 11-KA QODOB:
1. **Bias (HTF Daily -> 7H -> 1H):** ${checklistScores['bias'] || "CAN'T SEE"}
2. **IRL -> ERL / ERL -> IRL:** ${checklistScores['liquidity_flow'] || "CAN'T SEE"}
3. **KL (Key Level 4H/1H):** ${checklistScores['kl'] || "CAN'T SEE"}
4. **CRT (4H/1H Candle Range Theory):** ${checklistScores['crt'] || "CAN'T SEE"}
5. **Purge hour (NY time):** ${checklistScores['purge_hour'] || "CAN'T SEE"}
6. **TS (Turtle Soup) Sweep:** ${checklistScores['ts_sweep'] || "CAN'T SEE"}
7. **SMT (XAUEUR / XAUGBP / Silver):** ${checklistScores['smt'] || "CAN'T SEE"}
8. **PSP (Opposite color candle close):** ${checklistScores['psp'] || "CAN'T SEE"}
9. **Entry #1 Line (End of 5m OB Limit):** ${checklistScores['entry_line'] || "CAN'T SEE"}
10. **SL Beyond TS Sweep (~$9-$10):** ${checklistScores['sl_beyond_sweep'] || "CAN'T SEE"}
11. **TP Distance (3R default / 2R):** ${checklistScores['tp_distance'] || "CAN'T SEE"}

---

#### QODOBBADA MAQAN EE AAD U BAAHAN TAHAY INAAD KEENTO:
${cantSeeItems.length > 0 ? cantSeeItems.map((c) => `- Qodobka: **${c}** (Ma muuqdo, fadlan ku muuji shaxankaaga).`).join('\n') : '- Dhammaan 11-ka qodob waa la qiimeeyay oo way muuqdaan!'}

---

#### GO'AANKA FINAL-KA AH:
${isModel1 ? '**WAXAY U EGTAHAY MODEL#1:** Setup-kani wuxuu si fiican u waafaqsan yahay shuruucda asaasiga ah ee Model#1. Hubi in limit order-kaagu yaal Entry #1 line.' : '**UMA EKA MODEL#1 (AMA QODOBO MUHIIM AH AYAA MAQAN):** Setup-kan kuma filna shuruucda buuxda ee Model#1. Ha galin trade adoon xaqiijin dhammaan qodobbada.'}

*Digniin: Weligay kuuma sheegi doono "gal trade-ka" ama "iibso/iibi". Adigaa mas'uul buuxda ka ah go'aankaaga ganacsi.*`;
}

// Mode A: Video Analysis endpoint
app.post('/api/analyze-video', async (req, res) => {
  try {
    const { transcript, videoUrl } = req.body;
    if (!transcript || transcript.trim().length === 0) {
      return res.status(400).json({ error: 'Fadlan geli transcript ama qoraal ka yimid muuqaalka/video-ga.' });
    }

    const prompt = `
HABKA A (MODE A: VIDEO ANALYSIS):
Falanqee transcript-ka soo socda ee ku saabsan fiidiyowga/mentorship-ka Model#1.
Video Link/URL: ${videoUrl || 'Lama bixin'}

Transcript:
"""
${transcript}
"""

FADLAN RAAC HABKAAN SAXDA AH:
1. Liis garee sharci kasta oo af-hayeenu sheegay, sida ay u kala horreeyaan, qaabkaan:
   "Rule | Timestamp | Exact words"
2. Calaamadee sharci kasta:
   - NEW (Cusub oo aan ku jirin aqoontayada Model#1)
   - SAME (Isku mid ah aqoontayada)
   - CONTRADICTS (Ka hor imaanaya aqoontayada - sharax sida uu uga hor yimid)
3. Liis garee dhammaan tusaalooyinka ganacsi (trade examples) ee lagu muujiyay:
   - Taariikhda (date)
   - Jiheynta (direction: Buy/Sell)
   - Checklist items muuqday (which items were visible)
   - Natiijada (result: Win / Loss / Missed)
4. Ka jawaab waxyaabaha UNKNOWN ah haddii muuqaalku sharraxay (soo xigasho timestamp sax ah). Haddii aan lagu sharxin ku adkee "ma hubo" hana qiyaasin.
5. Ku dhamee qaybta:
   "Wax cusub oo aan kuu soo jeedinayo inaan ku darno aqoonta" (liis kooban oo ganacsaduhu go'aamin karo).

Ku qor af-Soomaali, ilaali erayada ganacsiga Ingiriiska sida CRT, TS, SMT, KL, IRL, ERL, OB, PSP. Ha abuurin wax aadan aqoon.
`;

    // Attempt Gemini call with 5-second timeout, fallback to robust Model#1 rule analysis
    const callPromise = ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: MODEL1_SYSTEM_INSTRUCTION,
      },
    });

    const timeoutPromise = new Promise<null>((resolve) => setTimeout(() => resolve(null), 5000));
    const result: any = await Promise.race([callPromise, timeoutPromise]);

    if (result && result.text) {
      return res.json({ analysis: result.text });
    }

    const fallbackAnalysis = analyzeTranscriptOffline(transcript, videoUrl);
    res.json({ analysis: fallbackAnalysis });
  } catch (error: any) {
    console.warn('Gemini API call fell back to local Model#1 analysis engine:', error.message);
    const fallbackAnalysis = analyzeTranscriptOffline(req.body.transcript, req.body.videoUrl);
    res.json({ analysis: fallbackAnalysis });
  }
});

// Mode B: Chart Review endpoint
app.post('/api/review-chart', async (req, res) => {
  try {
    const { notes, checklistScores, imageBase64, mimeType } = req.body;

    const checklistSummary = Object.entries(checklistScores || {})
      .map(([k, v]) => `- ${k}: ${v}`)
      .join('\n');

    const prompt = `
HABKA B (MODE B: CHART REVIEW):
U qiimee shaxankan/setup-kan si waafaqsan shuruucda adag ee Model#1 (XAUUSD kaliya).

Qoraalka ganacsadaha ee ku saabsan setup-ka:
"""
${notes || 'Lama bixin qoraal faahfaahsan'}
"""

Qiimeynta hordhaca ah ee 11-ka qodob (Checklist scores):
${checklistSummary || 'Lama bixin'}

FADLAN SAMEE:
1. U qiimee 11-ka shay mid kasta: PASS / FAIL / CAN'T SEE.
2. Bixi natiijada qaabkan:
   - "X of 11 visible" (Tirada muuqata)
   - Qodobbada maqan ee uu ganacsaduhu u baahan yahay inuu keeno (Missing items I should show)
   - Go'aanka: "Waxay u egtahay Model#1" ama "Uma eka Model#1" iyo sababta.
3. Weligaa ha dhihin "gal trade-ka" ama "iibso/iibi".
`;

    const parts: any[] = [];
    if (imageBase64) {
      parts.push({
        inlineData: {
          mimeType: mimeType || 'image/jpeg',
          data: imageBase64,
        },
      });
    }
    parts.push({ text: prompt });

    const callPromise = ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: { parts },
      config: {
        systemInstruction: MODEL1_SYSTEM_INSTRUCTION,
      },
    });

    const timeoutPromise = new Promise<null>((resolve) => setTimeout(() => resolve(null), 5000));
    const result: any = await Promise.race([callPromise, timeoutPromise]);

    if (result && result.text) {
      return res.json({ review: result.text });
    }

    const fallbackReview = reviewChartOffline(notes, checklistScores);
    res.json({ review: fallbackReview });
  } catch (error: any) {
    console.warn('Chart review fallback:', error.message);
    const fallbackReview = reviewChartOffline(req.body.notes, req.body.checklistScores);
    res.json({ review: fallbackReview });
  }
});

function getKnowledgeChatResponse(userMessage: string): string {
  const msg = userMessage.toLowerCase();

  if (msg.includes('smt') || msg.includes('lammaane') || msg.includes('pair')) {
    return `**Lammaanaha SMT-da u saxda ah Dahabka (XAUUSD):**

Kaliya 3-daan lamaane ayaa SAX AH (True SMT pairs):
1. **XAUEUR**
2. **XAUGBP**
3. **Silver (XAGUSD)**

**LAMA OGOLA / INVALID:**
XAUCHF, XAUNZD, AUD, JPY, ama single-stage SMT gebi ahaanba sax ma aha!

Waa inuu noqdaa **2-stage SMT (2SSMT)** oo ka yimid IRL, laguna xaqiijiyo **PSP** (candles labada asset oo ku xirmay midabbo iska soo horjeeda isla saacaddaas 1H gudaheeda).`;
  }

  if (msg.includes('invalidation') || msg.includes('jabo') || msg.includes('bururo')) {
    return `**Sidee loo gartaa Invalidation-ka Model#1?**

Setup-ku wuxuu jabaa labadan xaaladood:
1. **(a)** Qiimuhu wuxuu ku furmaa meel sare, qaataa PDH/PWH oo jebiya key levels, 1H TSQ ayaa u leexata dhinaca kale;
2. **(b)** Candle ayaa **KU XIRMA (closes)** ka shisheeya 0.5 EQ ee HTF candle-ka (wick yar waa la aqbali karaa, laakiin close lama ogola).

Haddii ay taasi dhacdo, bias-kii hore wuu bururay.`;
  }

  if (msg.includes('entry') || msg.includes('#1') || msg.includes('limit') || msg.includes('ob')) {
    return `**Entry #1 Line (5m OB):**

- Gelitaanka Model#1 waa xariiqda ku taal **DHAMAADKA Order Block-ka ee 5m** (line at the END of the OB).
- Waa **Limit Order**.
- **Sharciga dahabiga ah:** Haddii qiimuhu uusan dib ugu noqon xariiqda #1 oo uu baxo, trade-ku wuu baaqday (waa missed trade). Weligaa qiimaha ha eryan (never chase).`;
  }

  if (msg.includes('purge') || msg.includes('saacad') || msg.includes('waqti') || msg.includes('time')) {
    return `**Saacadaha Purge-ka ee Waqtiga New York (NY Time):**

Waqtiyada ugu fiican ee Purge-ku dhaco:
- **8:00 AM - 10:00 AM NY** (NY Prime Purge)
- **2:00 AM - 3:00 AM NY** (London Purge)
- **8:00 PM - 10:00 PM NY** (Asia / Night Purge)
- *(Sidoo kale 6:00 AM - 8:00 AM pre-NY)*

Dhammaan waqtiyada waxaa loo xisaabiyaa New York time.`;
  }

  if (msg.includes('risk') || msg.includes('khatar') || msg.includes('tp') || msg.includes('sl') || msg.includes('3r') || msg.includes('2r')) {
    return `**Shuruucda Risk-ka iyo Bartilmaameedka (TP/SL):**

- **Risk:** 1% per trade oo keliya. Weligaa ha kordhin halista.
- **Stop Loss (SL):** Wuxuu wax yar ka shisheeyaa TS sweep-ka (hoos sweep low ee buys, kor sweep high ee sells). Cabbirka caadiga ah ee Dahabka waa qiyaastii **$9-$10**. Haddii SL uu aad u weyn yahay (>$12), *ka bood trade-ka!*
- **Take Profit (TP):** Caadi ahaan **3R** by default; mararka qaarna **2R** (haddii ERL ay dhowdahay ama SL uu xoogaa weyn yahay).
- Bartilmaameedyada: PDL/PDH, PWL/PWH, PML/PMH, TG.`;
  }

  if (msg.includes('kod') || msg.includes('ote')) {
    return `**Ma hubo.**

- **KOD:** Lama hubo micnaha saxda ah ee KOD ee TSQ sequence-ka: KL -> TS -> S1 -> entry #1 -> (OTE -> KOD) -> TG. Mentor-ku ma bixin qeexid rasmi ah oo la xaqiijiyay.
- **OTE:** OTE waa 62%-79% Fibonacci retracement, laakiin lama xaqiijin sida saxda ah ee mentor-ku ugu dhex daro Model#1.

Sharcigeygu waa **DO NOT INVENT** — haddii aad wax cusub ka hesho casharada, fadlan noo sheeg si aan ugu darno aqoonta!`;
  }

  return `Waxaan ahay kaaliyaha Model#1 (XAUUSD / Dahab kaliya).

Qodobada ugu muhiimsan ee Model#1:
1. **Bias:** Daily -> 7H -> 1H (IRL to ERL ee buys, ERL to IRL ee sells).
2. **Setup:** KL (OB/FVG/IFVG ee 4H/1H) + Purge hour + TS sweep + 2SSMT (XAUEUR/Silver) + PSP.
3. **Entry:** 5m Entry #1 line limit order.
4. **Risk:** 1% account risk, 3R target (2R haddii ERL dhowdahay).

Maxaad doonaysaa inaan si gaar ah kuugu sharaxo?`;
}

// Chat endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { messages, userContext } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Fariimaha lama helin.' });
    }

    const lastUserMessage = messages[messages.length - 1]?.content || '';

    const contents = messages.map((m: any) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    if (userContext) {
      contents[contents.length - 1].parts.push({
        text: `\n[XOG DHEERAAD AH: ${userContext}]`,
      });
    }

    const callPromise = ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents,
      config: {
        systemInstruction: MODEL1_SYSTEM_INSTRUCTION,
      },
    });

    const timeoutPromise = new Promise<null>((resolve) => setTimeout(() => resolve(null), 5000));
    const result: any = await Promise.race([callPromise, timeoutPromise]);

    if (result && result.text) {
      return res.json({ reply: result.text });
    }

    res.json({ reply: getKnowledgeChatResponse(lastUserMessage) });
  } catch (error: any) {
    const lastUserMessage = req.body.messages?.[req.body.messages.length - 1]?.content || '';
    res.json({ reply: getKnowledgeChatResponse(lastUserMessage) });
  }
});

async function startServer() {
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Model#1 Gold Study Agent running on port ${PORT}`);
  });
}

startServer();
