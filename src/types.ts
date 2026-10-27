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
