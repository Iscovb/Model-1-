import { TradeLogEntry } from '../types';

export function formatTradeToCsvRow(entry: TradeLogEntry): string {
  // date, time NY, side, #1 price, SL, TP, R, result, confidence, items passed, notes
  const escapedNotes = `"${entry.notes.replace(/"/g, '""')}"`;
  const escapedItems = `"${entry.itemsPassed.join('; ')}"`;
  const conf = entry.confidenceScore ?? 5;
  return `${entry.date}, ${entry.timeNY}, ${entry.side}, ${entry.entryPrice.toFixed(2)}, ${entry.slPrice.toFixed(2)}, ${entry.tpPrice.toFixed(2)}, ${entry.rMultiple}R, ${entry.result}, ${conf}/5, ${escapedItems}, ${escapedNotes}`;
}

export function formatAllTradesToCsv(entries: TradeLogEntry[]): string {
  const header = 'date, time NY, side, #1 price, SL, TP, R, result, confidence, items passed, notes';
  const rows = entries.map(formatTradeToCsvRow);
  return [header, ...rows].join('\n');
}

export function downloadCsvFile(content: string, filename = 'model1_xauusd_log.csv'): void {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
