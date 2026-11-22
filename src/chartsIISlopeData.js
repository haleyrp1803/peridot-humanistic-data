/* Charts II B3.10 — two independently selected, canonical calendar periods.
 * All source assertions must fit wholly inside one calendar bin; no partial
 * dates are promoted to fabricated exact dates. Missing comparisons are null,
 * never zero. The caller supplies the shared chronology-filtered record scope.
 */
import { chartsIIEligibleBin } from './chartsIITemporalAggregation.js';
import { getAnalyticsFieldValue, parseAnalyticsNumber } from './analyticsDerivationHelpers.js';

const empty = value => value === null || value === undefined || String(value).trim() === '';
const unique = values => [...new Set((Array.isArray(values) ? values : []).filter(value => typeof value === 'string' && value))];

export function chartsIISlopePeriods(rows = [], interval = 'year') {
  const bins = new Map();
  for (const row of rows) {
    const result = chartsIIEligibleBin(row, interval);
    if (result.bin) bins.set(result.bin.start, result.bin);
  }
  return [...bins.values()].sort((a,b) => a.start - b.start);
}

function summarize(values, aggregation) {
  if (!values.length) return null;
  if (aggregation === 'count') return values.length;
  if (aggregation === 'sum') return values.reduce((sum, value) => sum + value, 0);
  if (aggregation === 'min') return Math.min(...values);
  if (aggregation === 'max') return Math.max(...values);
  if (aggregation === 'median') {
    const sorted = [...values].sort((a,b) => a-b);
    const middle = (sorted.length - 1)/2;
    return (sorted[Math.floor(middle)] + sorted[Math.ceil(middle)]) / 2;
  }
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

export function deriveChartsIISlope(rows = [], {
  mode = 'category', fields = [], categoryField = '', measureField = 'recordCount',
  aggregation = 'average', interval = 'year', firstPeriod = null, secondPeriod = null,
  maxGroups = 10,
} = {}) {
  const records = Array.isArray(rows) ? rows : [];
  const columnMode = mode === 'columns';
  const measureIsCount = !columnMode && measureField === 'recordCount';
  const operation = measureIsCount ? 'count' : ['average','median','sum','min','max'].includes(aggregation) ? aggregation : 'average';
  const selectedFields = unique(fields);
  const first = Number(firstPeriod), second = Number(secondPeriod);
  const groups = new Map();
  if (columnMode) selectedFields.forEach(name => groups.set(name, [[],[]]));
  const excluded = { missingDate:0, invalidDate:0, insufficientPrecision:0, otherPeriods:0, missingCategory:0, missingMeasure:0, invalidMeasure:0 };
  const includedRecords = [0,0];
  let firstLabel = '', secondLabel = '';
  for (const row of records) {
    const eligible = chartsIIEligibleBin(row, interval);
    if (eligible.excluded) { excluded[eligible.excluded]++; continue; }
    const index = eligible.bin.start === first ? 0 : eligible.bin.start === second ? 1 : -1;
    if (index < 0) { excluded.otherPeriods++; continue; }
    if (index === 0) firstLabel = eligible.bin.label;
    else secondLabel = eligible.bin.label;
    includedRecords[index]++;
    if (columnMode) {
      for (const name of selectedFields) {
        const raw = getAnalyticsFieldValue(row, name);
        if (empty(raw)) { excluded.missingMeasure++; continue; }
        const value = parseAnalyticsNumber(raw);
        if (value === null || !Number.isFinite(value)) { excluded.invalidMeasure++; continue; }
        groups.get(name)[index].push(value);
      }
    } else {
      const rawCategory = getAnalyticsFieldValue(row, categoryField);
      if (empty(rawCategory)) { excluded.missingCategory++; continue; }
      const name = String(rawCategory).trim();
      if (!groups.has(name)) groups.set(name, [[],[]]);
      if (measureIsCount) { groups.get(name)[index].push(1); continue; }
      const rawValue = getAnalyticsFieldValue(row, measureField);
      if (empty(rawValue)) { excluded.missingMeasure++; continue; }
      const value = parseAnalyticsNumber(rawValue);
      if (value === null || !Number.isFinite(value)) { excluded.invalidMeasure++; continue; }
      groups.get(name)[index].push(value);
    }
  }
  let entries = [...groups.entries()].filter(([, values]) => values[0].length || values[1].length);
  // Top N uses total contributing observations, not the resulting numerical
  // magnitude (which may be negative, fractional, or in different units).
  if (!columnMode) entries.sort((a,b) => b[1][0].length+b[1][1].length-a[1][0].length-a[1][1].length || a[0].localeCompare(b[0]));
  const max = Math.max(1, Number(maxGroups) || 10);
  const omitted = columnMode ? 0 : Math.max(0, entries.length - max);
  if (!columnMode) entries = entries.slice(0,max);
  const series = entries.map(([label, values]) => {
    const before = summarize(values[0], operation);
    const after = summarize(values[1], operation);
    return { label, before, after, nBefore:values[0].length, nAfter:values[1].length,
      delta: before === null || after === null ? null : after - before };
  });
  const paired = series.filter(s => s.delta !== null).length;
  return { series, reporting: {
    scope: records.length, mode:columnMode?'columns':'category', interval, aggregation:operation,
    firstPeriod:first, secondPeriod:second, firstLabel, secondLabel, includedRecords,
    plottedGroups: series.length, pairedGroups:paired,
    missingFirst: series.filter(s => s.before === null).length,
    missingSecond: series.filter(s => s.after === null).length,
    groupsOmitted:omitted, excluded,
    note:'Missing period/category observations remain missing. Zero is plotted only when observations establish zero; no artificial endpoints or slope are created.',
  } };
}
