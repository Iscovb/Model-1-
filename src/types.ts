export type ChecklistStatus = 'PASS' | 'FAIL' | 'CANT_SEE';

export interface ChecklistItemDef {
  id: string;
  name: string;
  somaliName: string;
  category: 'HTF' | 'TIMING' | 'LIQUIDITY' | 'ENTRY';
  description: string;
  tooltip: string;
  buyRequirement: string;
  sellRequirement: string;
}

export interface TradeLogEntry {
  id: string;
  date: string;
  timeNY: string;
  side: 'BUY' | 'SELL';
  entryPrice: number;
  slPrice: number;
  tpPrice: number;
  rMultiple: number;
  result: 'WIN' | 'LOSS' | 'MISSED' | 'INVALIDATION' | 'OPEN';
  itemsPassed: string[];
  notes: string;
  confidenceScore?: number; // 1-5 ranking of Model#1 setup alignment
  createdAt: number;
}

export interface ForwardTestTrade {
  id: string;
  title: string;
  date: string;
  session: string;
  entryTimeNY: string;
  exitTimeNY?: string;
  side: 'BUY' | 'SELL';
  entryPrice: number;
  slPrice: number;
  tpPrice: number;
  slDistance: number;
  rMultiple: number;
  status: 'OPEN' | 'WIN' | 'LOSS' | 'MISSED';
  pips: number;
  confidenceScore: number;
  passedRules: string[];
  smtPair: 'Silver' | 'XAUEUR' | 'XAUGBP';
  keyLevel: string;
  tsSweepPrice: number;
  entrySnapshotUrl?: string;
  exitSnapshotUrl?: string;
  notes: string;
  accountRiskPct: number;
  createdAt: number;
  updatedAt?: number;
}

export interface UnknownItem {
  id: string;
  topic: string;
  status: 'UNKNOWN' | 'USER_CONFIRMED';
  currentKnowledge: string;
  userNotes?: string;
  mentorQuote?: string;
}

export interface VideoAnalysisResult {
  rules: Array<{
    rule: string;
    timestamp: string;
    exactWords: string;
    status: 'NEW' | 'SAME' | 'CONTRADICTS';
    explanation?: string;
  }>;
  examples: Array<{
    date: string;
    direction: 'BUY' | 'SELL';
    itemsVisible: string[];
    result: string;
  }>;
  unknownsAddressed: Array<{
    item: string;
    explanation: string;
    timestamp: string;
  }>;
  suggestions: string[];
  rawText?: string;
}

export interface LiveScannerState {
  currentPrice: number;
  dayHigh: number;
  dayLow: number;
  pdl: number;
  pdh: number;
  pwh: number;
  pwl: number;
  dailyBias: 'BEARISH' | 'BULLISH' | 'NEUTRAL';
  sevenHourSession: string;
  purgeStatus: 'ACTIVE_PURGE' | 'WAITING_NEXT_PURGE';
  purgeDetails: string;
  lastUpdated: string;
  activeSetup: {
    direction: 'SELL' | 'BUY' | 'NO_SETUP';
    confidenceScore: number;
    totalChecklist: number;
    passedItems: string[];
    missingItems: string[];
    currentStage: string;
    entryPrice: number;
    slPrice: number;
    tpPrice: number;
    slDistance: number;
    rMultiple: number;
    summarySomali: string;
    warnings: string[];
  };
  biasUpdateSummary: string;
}

export interface SessionBreakdown {
  sessionName: string;
  timeWindowNY: string;
  high: number;
  low: number;
  openPrice: number;
  closePrice: number;
  pipsRange: number;
  purgeEvent: string;
  liquidityAction: string;
  smtStatus: string;
  setupDetected: boolean;
  setupSummary?: string;
}

export interface DailyRecapData {
  id: string;
  date: string;
  dayOfWeek: string;
  dailyBias: 'BEARISH' | 'BULLISH' | 'NEUTRAL';
  dolNarrative: string;
  dayOpen: number;
  dayHigh: number;
  dayLow: number;
  currentOrClosePrice: number;
  pdl: number;
  pdh: number;
  asianRange: {
    high: number;
    low: number;
    midpoint: number;
    pipsWidth: number;
  };
  sessions: SessionBreakdown[];
  ictOpportunity: {
    found: boolean;
    tradeId?: string;
    direction: 'BUY' | 'SELL' | 'NO_TRADE';
    confidenceScore: number;
    primePurgeHour: string;
    triggerTimeNY?: string;
    entryLine?: number;
    stopLoss?: number;
    targetTp?: number;
    rMultiple?: number;
    status: 'WIN' | 'LOSS' | 'NO_SETUP' | 'MISSED';
    summarySomali: string;
    checklistPassedCount: number;
    checklistPassedList: string[];
    checklistFailedList: string[];
    reasoningWhyNoSetupOrWin: string;
  };
  aiGeneratedSummary: string;
  keyLessonSomali: string;
  snapshotUrl?: string;
}
