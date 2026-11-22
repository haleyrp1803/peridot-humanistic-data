/*
 * Charts II temporal bin geometry (Area and Stacked Area).
 * Labels originate in canonical Peridot temporal assertions via the existing
 * analytics date-field derivations. Raw uploaded date columns are NOT accepted.
 * A year/month/day label represents its calendar-sized counting interval,
 * not an exact event date when the original precision was coarse.
 */
import { civilDay, civilFromDay } from './peridotChronologyWindow.js';

export function chartsIITemporalBin(label, fieldKey) {
  if (fieldKey !== 'year' && fieldKey !== 'fullDate') return null;
  const match = String(label ?? '').match(/^(\d{3,4})(?:-(\d{2})(?:-(\d{2}))?)?$/);
  if (!match) return null;
  const year = Number(match[1]);
  const month = match[2] ? Number(match[2]) : 1;
  const day = match[3] ? Number(match[3]) : 1;
  if (year < 1 || month < 1 || month > 12 || day < 1 || day > 31) return null;
  if (fieldKey === 'year' && (match[2] || match[3])) return null;
  const start = civilDay(year, month, day);
  const actual = civilFromDay(start);
  if (actual.year !== year || actual.month !== month || actual.day !== day) return null;
  const end = match[3] ? start + 1 : match[2] ? (month === 12 ? civilDay(year + 1, 1, 1) : civilDay(year, month + 1, 1)) : civilDay(year + 1, 1, 1);
  return { label: String(label), start, end, precision: match[3] ? 'day' : match[2] ? 'month' : 'year' };
}

export function chartsIITemporalBins(labels, fieldKey) {
  if (fieldKey !== 'year' && fieldKey !== 'fullDate') return { ready: false, problem: 'Select Year or Full date for a proportional chronological axis.' };
  const bins = labels.map(label => chartsIITemporalBin(label, fieldKey));
  if (bins.some(bin => !bin)) return { ready: false, problem: 'The selected periods include invalid or noncanonical dates.' };
  bins.sort((a,b) => a.start - b.start || a.end - b.end);
  for (let i = 1; i < bins.length; i++) {
    if (bins[i].start < bins[i-1].end) return { ready: false, problem: 'Some dates overlap because they have different precision. Use Year to combine them into nonoverlapping annual intervals.' };
  }
  return { ready: true, bins, min: bins[0]?.start ?? null, max: bins[bins.length-1]?.end ?? null };
}

export function chartsIITemporalPositions(axis, plotLeft, plotWidth) {
  if (!axis?.ready || !axis.bins.length) return [];
  const span = Math.max(1, axis.max - axis.min);
  return axis.bins.map(bin => ({ ...bin, x0: plotLeft + (bin.start - axis.min) / span * plotWidth, x1: plotLeft + (bin.end - axis.min) / span * plotWidth }));
}
