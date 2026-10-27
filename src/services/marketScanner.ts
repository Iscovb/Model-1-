import { LiveScannerState } from '../types';

export function calculateLiveNYHourMinute(): {
  nyHours: number;
  nyMinutes: number;
  nyDayOfWeek: number;
  timeStr: string;
  dateStr: string;
  isWeekendMarketClosed: boolean;
} {
  const now = new Date();
  const nyString = now.toLocaleString('en-US', { timeZone: 'America/New_York' });
  const nyDate = new Date(nyString);

  const hours = nyDate.getHours();
  const minutes = nyDate.getMinutes();
  const dayOfWeek = nyDate.getDay(); // 0 = Sunday, 1 = Monday, ... 5 = Friday, 6 = Saturday

  // Sharciga: Laga bilaabo 16:00 Jimcada ilaa 17:00 Axada New York time suuqu waa xiran yahay
  const isWeekendMarketClosed =
    (dayOfWeek === 5 && hours >= 16) || // Friday >= 16:00 NY
    dayOfWeek === 6 ||                 // Saturday all day
    (dayOfWeek === 0 && hours < 17);    // Sunday < 17:00 NY

  const nyTimeStr = nyDate.toLocaleTimeString('en-US', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
  });
  const nyDateStr = nyDate.toLocaleDateString('en-CA', {
    timeZone: 'America/New_York',
  });

  return {
    nyHours: hours,
    nyMinutes: minutes,
    nyDayOfWeek: dayOfWeek,
    timeStr: nyTimeStr,
    dateStr: nyDateStr,
    isWeekendMarketClosed,
  };
}

export function evaluateMarketState(
  scenario: 'CURRENT_DEVELOPING' | 'MORNING_SELL_COMPLETED' = 'CURRENT_DEVELOPING'
): LiveScannerState {
  const { nyHours, timeStr, dateStr, isWeekendMarketClosed } = calculateLiveNYHourMinute();

  let sevenHourSession = 'New York Session (07:00 NY)';
  if (isWeekendMarketClosed) {
    sevenHourSession = 'Suuqu Waa Xiran Yahay (Weekend)';
  } else if (nyHours >= 17 || nyHours < 0) {
    sevenHourSession = 'Asia Session (17:00 NY)';
  } else if (nyHours >= 0 && nyHours < 7) {
    sevenHourSession = 'London Session (00:00 NY)';
  }

  let purgeStatus: 'ACTIVE_PURGE' | 'WAITING_NEXT_PURGE' = 'WAITING_NEXT_PURGE';
  let purgeDetails = '';

  if (scenario === 'MORNING_SELL_COMPLETED') {
    purgeStatus = 'ACTIVE_PURGE';
    purgeDetails = 'NY Prime Purge Window (08:00 AM - 10:00 AM NY) — Setup-kii Saaka!';
  } else if (isWeekendMarketClosed) {
    purgeStatus = 'WAITING_NEXT_PURGE';
    purgeDetails =
      'SUUQU WAA XIRAN YAHAY (Weekend): Jimco 16:00 NY ilaa Axad 17:00 NY. Furitaanka xiga: Axadda 17:00 NY (Asia Open).';
  } else {
    // Current situation (afternoon/waiting)
    purgeStatus = 'WAITING_NEXT_PURGE';
    purgeDetails =
      'Purge-ka xiga: Asia/Night Purge (08:00 PM NY) ama London Purge (02:00 AM NY). Waqtigan lama joogo Purge!';
  }

  const currentPrice = 3996.01;
  const dayHigh = 4034.09;
  const dayLow = 3975.65;
  const pdl = 4015.0;
  const pdh = 4120.5;
  const pwh = 4235.0;
  const pwl = 3950.0;

  const dailyBias: 'BEARISH' | 'BULLISH' | 'NEUTRAL' = 'BEARISH';

  let activeSetup: LiveScannerState['activeSetup'];

  if (scenario === 'MORNING_SELL_COMPLETED') {
    activeSetup = {
      direction: 'SELL',
      confidenceScore: 10,
      totalChecklist: 11,
      passedItems: [
        'HTF Bias Alignment (Daily Bearish)',
        'ERL to IRL Liquidity Flow',
        'Key Level (4H/1H Major LQ 4034)',
        'CRT (Asia/London high sweep)',
        'Purge Hour (8:00 - 10:00 AM NY)',
        'TS (Turtle Soup) Sweep (4034.09)',
        'SMT Divergence (Silver failed higher high)',
        'PSP Confirmed (opposite color closes)',
        '5m Entry #1 Line (4027.80 limit hit)',
        'SL Beyond Sweep (4035.50 - $7.70 distance)',
      ],
      missingItems: [
        'Waxba kama dhiman — Setup-ku wuxuu si buuxda u qaatay 3R Take Profit ($4,004.70)!',
      ],
      currentStage: 'TARGET_HIT',
      entryPrice: 4027.8,
      slPrice: 4035.5,
      tpPrice: 4004.7,
      slDistance: 7.7,
      rMultiple: 3.0,
      summarySomali:
        'Trade-kii SELL ee saaka wuxuu si buuxda u buuxiyay 10 ka mid ah 11-ka qodob ee Model#1. Waxaa la qaatay 3R buuxda ($4,004.70).',
      warnings: ['Trade-kan waa la dhammaystiray (Completed). Ha eryan qiimaha hadda!'],
    };
  } else if (isWeekendMarketClosed) {
    // Sharciga: Suuqu waa xiran yahay Jimcaha 16:00 NY ilaa Axadda 17:00 NY
    activeSetup = {
      direction: 'NO_SETUP',
      confidenceScore: 0,
      totalChecklist: 11,
      passedItems: [],
      missingItems: [
        'SUUQU WAA XIRAN YAHAY (Weekend Close: Jimco 16:00 NY ilaa Axad 17:00 NY)',
        'Ma jiro wax trade ah oo socon kara inta suuqu xiran yahay',
        'Sug furitaanka fadhiga Asia ee Axadda 17:00 NY',
        'Spreads iyo liquidity ma jiraan xilliga weekend-ka',
      ],
      currentStage: 'MARKET_CLOSED_WEEKEND',
      entryPrice: 0,
      slPrice: 0,
      tpPrice: 0,
      slDistance: 0,
      rMultiple: 0,
      summarySomali:
        'SUUQU WAA XIRAN YAHAY (WEEKEND). Laga bilaabo 16:00 maalinta Jimcada ilaa 17:00 Axada New York time suuqu waa xiran yahay. Ma jiro trade jiri kara ama rules la fulin karo inta suuqu xiran yahay. Isticmaal waqtigan barashada recaps-ka iyo shaxannadii hore ilaa Axadda 17:00 NY!',
      warnings: [
        'Sharciga Suuqa: Jimco 16:00 NY ilaa Axad 17:00 NY suuqu gabi ahaanba waa xiran yahay.',
        'Digniin: Weligaa ha galin orders xilliga weekend-ka sababtoo ah spreads-ka ayaa balaaran suuqana ganacsi kama socdo.',
      ],
    };
  } else {
    // Current developing at Lows during normal market hours
    activeSetup = {
      direction: 'BUY',
      confidenceScore: 3,
      totalChecklist: 11,
      passedItems: [
        'ERL / PDL Liquidity Swept ($3,975.65)',
        'Key Level Reached (Daily PDL & 4H support zone)',
        'Wick Rejection at Low of Day',
      ],
      missingItems: [
        'Purge Hour MA DHACIN: Waqtigu kuma jiro purge window (sug 8pm Asia ama 2am London NY)',
        'SMT Divergence MA JIRTO: Weli lama xaqiijin 2SSMT ka timid IRL oo leh XAUEUR ama Silver',
        'PSP MA JIRTO: Candles labada asset isma diidin oo midabbo iska soo horjeeda kuma xirmin',
        '5m Entry #1 Line MA JIRTO: Bullish 5m OB weli ma samaysmin',
        'Limit Order Execution MA JIRTO: Qiimuhu ma taaban xariiqda dhamaadka OB',
        'HTF Trend Alignment MA JIRTO: Daily bias weli waa Bearish (Counter-trend buy)',
        'SL Cabbirkiisa MA CADDA: Weli ma cadda in SL uu ka yar yahay $10',
        'CRT Range Sweep MA DHAMMAAN: 1H candle weli ma xirmin',
      ],
      currentStage: 'WAITING_FOR_CONFIRMATIONS',
      entryPrice: 3982.0,
      slPrice: 3973.5,
      tpPrice: 4007.5,
      slDistance: 8.5,
      rMultiple: 3.0,
      summarySomali:
        'TRADE BUUXA MA JIRO (NO VALID TRADE). Inkasta oo PDL la jabiyay ($3,975.65), 8 SHARCI OO LAGAMA MAARMAAN AH AYAA KA DHIMAN: Purge hour, SMT, PSP, iyo 5m Entry #1 OB. Sharciga dahabiga ah ee Model#1: HA GELIN TRADE ilaa dhammaan shuruucdu ay buuxsanto!',
      warnings: [
        'Digniin Adag: Ha gelin trade adoon haysan SMT sax ah (Silver ama XAUEUR kaliya).',
        'Digniin: Weligaa ha galin trade waqti ka baxsan saacadaha Purge-ka (8-10am, 2-3am, 8-10pm NY).',
        'Xusuusin: Kaaliyuhu weligii kuuma sheegi doono "hadda iibso/iibi". Go\'aanka adigaa iska leh.',
      ],
    };
  }

  return {
    currentPrice,
    dayHigh,
    dayLow,
    pdl,
    pdh,
    pwh,
    pwl,
    dailyBias,
    sevenHourSession,
    purgeStatus,
    purgeDetails,
    lastUpdated: `${dateStr} @ ${timeStr} NY`,
    activeSetup,
    biasUpdateSummary: isWeekendMarketClosed
      ? 'SUUQU WAA XIRAN YAHAY (Weekend: Jimco 16:00 NY ilaa Axad 17:00 NY). Furitaanka: Axad 17:00 NY.'
      : `Daily Bias: ${dailyBias} (ERL swept at $3,975.65). 7H Session: ${sevenHourSession}. Purge: ${
          purgeStatus === 'ACTIVE_PURGE' ? 'FURAN' : 'XIRAN'
        }.`,
  };
}
