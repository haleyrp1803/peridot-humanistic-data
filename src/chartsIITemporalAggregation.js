/*
 * Charts II precision-aware calendar interval aggregation.
 * Source authority: Peridot's canonical row temporal assertions. An interval
 * is eligible only if the source date range fits wholly within one bin.
 * The date parser never invents a day for a month- or year-only assertion.
 */
import { civilDay, civilFromDay } from './peridotChronologyWindow.js';
import { getRowTemporalSortBounds, getRowTemporalDateParts, getRowPrimaryTemporalAssertion } from './timelinePlaybackHelpers.js';
import { getAnalyticsFieldValue, parseAnalyticsNumber } from './analyticsDerivationHelpers.js';

export const CHARTS_II_TIME_INTERVALS = Object.freeze([
  { value: 'day', label: 'Exact date' },
  { value: 'week', label: 'Week' },
  { value: 'twoWeeks', label: '2 weeks' },
  { value: 'month', label: 'Month' },
  { value: 'quarter', label: '3 months' },
  { value: 'half', label: '6 months' },
  { value: 'year', label: 'Year' },
]);
const intervalKeys = new Set(CHARTS_II_TIME_INTERVALS.map(item => item.value));
const pad = number => String(number).padStart(2, '0');
const labelDay = ordinal => { const p = civilFromDay(ordinal); return `${p.year}-${pad(p.month)}-${pad(p.day)}`; };
const labelMonth = (year, month) => `${year}-${pad(month)}`;

// Monday-anchored calendar weeks, with a fixed fortnight anchor (1970-01-05).
// The same bin boundaries apply regardless of the dataset's first record.
const mondayAnchor = civilDay(1970, 1, 5);
export function chartsIICalendarBin(ordinal, interval) {
  const { year, month, day } = civilFromDay(ordinal);
  let start, end, label;
  if (interval === 'day') { start = ordinal; end = start + 1; label = labelDay(start); }
  else if (interval === 'week' || interval === 'twoWeeks') {
    const width = interval === 'week' ? 7 : 14;
    start = mondayAnchor + Math.floor((ordinal - mondayAnchor) / width) * width;
    end = start + width;
    label = `${labelDay(start)} – ${labelDay(end - 1)}`;
  } else if (interval === 'month' || interval === 'quarter' || interval === 'half') {
    const step = interval === 'month' ? 1 : interval === 'quarter' ? 3 : 6;
    const firstMonth = Math.floor((month - 1) / step) * step + 1;
    start = civilDay(year, firstMonth, 1);
    end = firstMonth + step > 12 ? civilDay(year + 1, 1, 1) : civilDay(year, firstMonth + step, 1);
    label = step === 1 ? labelMonth(year, firstMonth) : `${labelMonth(year, firstMonth)} – ${labelMonth(civilFromDay(end - 1).year, civilFromDay(end - 1).month)}`;
  } else if (interval === 'year') { start = civilDay(year, 1, 1); end = civilDay(year + 1, 1, 1); label = String(year); }
  else throw new Error(`Unsupported time interval: ${interval}`);
  return { label, start, end };
}

function keyToOrdinal(sortKey) {
  if (!Number.isFinite(sortKey)) return null;
  const key = Math.abs(Math.trunc(sortKey));
  const year = Math.floor(key / 10000);
  const month = Math.floor(key % 10000 / 100);
  const day = key % 100;
  if (year < 1 || month < 1 || month > 12 || day < 1 || day > 31) return null;
  const ordinal = civilDay(year, month, day);
  const actual = civilFromDay(ordinal);
  return actual.year === year && actual.month === month && actual.day === day ? ordinal : null;
}
function temporalSourceRange(row) {
  // Use the primary canonical assertion's complete bounds, not the date
  // projected for navigation. A range, circa date, or open interval must not
  // be silently collapsed to a fictitious precise instant.
  const parts = getRowTemporalDateParts(row);
  if (!parts) return null;
  const assertion = getRowPrimaryTemporalAssertion(row);
  // Approximate, circa and open-ended assertions do not identify a guaranteed
  // calendar interval; do not pretend their navigation anchor is an observation.
  if (assertion?.qualifier === 'circa' || assertion?.start?.approximation === 'circa'
      || assertion?.end?.approximation === 'circa' || assertion?.boundedness === 'openStart'
      || assertion?.boundedness === 'openEnd' || assertion?.boundedness === 'ongoing') return { unresolved: true };
  const bounds = getRowTemporalSortBounds(row);
  const start = keyToOrdinal(bounds.start);
  const last = keyToOrdinal(bounds.end);
  if (start === null || last === null || last < start) return { unresolved: true };
  return { start, end: last + 1, precision: parts.precision };
}

function hasTemporalEvidence(row) {
  return (Array.isArray(row?.temporalAssertions) && row.temporalAssertions.length > 0)
    || ['Date','date','displayDate','dateStart','dateEnd','dateDisplay','dateLabel','year'].some(key => String(row?.[key] ?? '').trim());
}

function eligibleBin(row, interval) {
  const range = temporalSourceRange(row);
  if (!range) return { excluded: hasTemporalEvidence(row) ? 'invalidDate' : 'missingDate' };
  if (range.unresolved) return { excluded: 'insufficientPrecision' };
  const first = chartsIICalendarBin(range.start, interval);
  const last = chartsIICalendarBin(range.end - 1, interval);
  if (first.start !== last.start || first.end !== last.end) return { excluded: 'insufficientPrecision' };
  return { bin: first };
}

const exclusionKeys = ['missingDate', 'invalidDate', 'insufficientPrecision', 'missingMeasure', 'missingGrouping'];
const emptyExclusions = () => Object.fromEntries(exclusionKeys.map(key => [key, 0]));
export function deriveChartsIITemporalSeries({ rows = [], interval = 'year', measure = 'recordCount', aggregation = 'count', groupBy = '', topN = 10 } = {}) {
  if (!intervalKeys.has(interval)) throw new Error(`Unsupported interval: ${interval}`);
  const isCount = measure === 'recordCount';
  const excluded = emptyExclusions();
  const grouped = new Map();
  let included = 0;
  for (const row of rows) {
    const eligibility = eligibleBin(row, interval);
    if (eligibility.excluded) { excluded[eligibility.excluded]++; continue; }
    const value = isCount ? 1 : parseAnalyticsNumber(row?.[measure]);
    if (value === null || !Number.isFinite(value)) { excluded.missingMeasure++; continue; }
    const group = groupBy ? String(getAnalyticsFieldValue(row, groupBy) ?? '').trim() : '';
    if (groupBy && !group) { excluded.missingGrouping++; continue; }
    const { bin } = eligibility;
    if (!grouped.has(bin.start)) grouped.set(bin.start, { ...bin, values: [], groups: new Map() });
    const bucket = grouped.get(bin.start);
    bucket.values.push(value);
    if (groupBy) {
      if (!bucket.groups.has(group)) bucket.groups.set(group, []);
      bucket.groups.get(group).push(value);
    }
    included++;
  }
  const bins = [...grouped.values()].sort((a,b) => a.start - b.start);
  const totals = new Map();
  if (groupBy) bins.forEach(bin => bin.groups.forEach((values, label) => totals.set(label, (totals.get(label) || 0) + (isCount ? values.length : values.reduce((sum,v) => sum+v, 0)))));
  const selected = [...totals].sort((a,b) => b[1]-a[1] || a[0].localeCompare(b[0])).slice(0,topN).map(([label]) => label);
  const others = [...totals.keys()].filter(label => !selected.includes(label));
  const labels = others.length ? [...selected, 'Other'] : selected;
  const aggregate = values => {
    if (!values.length) return null;
    if (isCount || aggregation === 'count') return values.length;
    const sum = values.reduce((acc,v) => acc+v,0);
    if (aggregation === 'average') return sum/values.length;
    if (aggregation === 'min') return Math.min(...values);
    if (aggregation === 'max') return Math.max(...values);
    return sum;
  };
  const periods = bins.map(bin => bin.label);
  const axis = { ready: true, bins: bins.map(({label,start,end}) => ({label,start,end})), min: bins[0]?.start ?? null, max: bins[bins.length-1]?.end ?? null };
  const series = labels.map(label => ({ label, points: bins.map(bin => {
    const values = label === 'Other' ? others.flatMap(name => bin.groups.get(name) || []) : bin.groups.get(label) || [];
    return { label: bin.label, count: values.length ? aggregate(values) : null, unit: isCount ? 'records' : 'value' };
  }) }));
  const data = bins.map(bin => ({ label: bin.label, count: aggregate(bin.values), unit: isCount ? 'records' : 'value' }));
  return { data, periods, series, temporalAxis: axis, reporting: {
    scope: rows.length, included, excluded, interval, measure, aggregation: isCount ? 'count' : aggregation,
    groupedBy: groupBy || null, assignedPeriods: bins.length,
  } };
}
