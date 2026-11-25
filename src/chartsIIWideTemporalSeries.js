/* B3.6: multiple numerical columns as independent time series.
 * This is deliberately separate from categorical (long-format) series.
 * Records are eligible only under the existing canonical precision contract.
 * A missing value is never a zero. Averages/minima/maxima are per column,
 * per calendar bin, using observed values only.
 */
import { chartsIIEligibleBin } from './chartsIITemporalAggregation.js';
import { parseAnalyticsNumber } from './analyticsDerivationHelpers.js';

export function deriveChartsIIWideTemporalSeries({ rows = [], interval = 'year', fields = [], aggregation = 'average' } = {}) {
  const names = [...new Set(fields.filter(field => typeof field === 'string' && field.trim()))];
  const bins = new Map();
  const excluded = { missingDate: 0, invalidDate: 0, insufficientPrecision: 0 };
  const measured = Object.fromEntries(names.map(name => [name, { included: 0, missingOrInvalid: 0 }]));
  let eligibleRecords = 0;
  const reducer = values => {
    if (!values.length) return null;
    if (aggregation === 'min') return Math.min(...values);
    if (aggregation === 'max') return Math.max(...values);
    const sum = values.reduce((acc, value) => acc + value, 0);
    return aggregation === 'sum' ? sum : sum / values.length;
  };
  for (const row of rows) {
    const match = chartsIIEligibleBin(row, interval);
    if (match.excluded) { excluded[match.excluded]++; continue; }
    eligibleRecords++;
    const bin = match.bin;
    if (!bins.has(bin.start)) bins.set(bin.start, { ...bin, fields: new Map(), fieldRows: new Map() });
    const bucket = bins.get(bin.start);
    for (const name of names) {
      const value = parseAnalyticsNumber(row?.[name]);
      if (value === null || !Number.isFinite(value)) { measured[name].missingOrInvalid++; continue; }
      if (!bucket.fields.has(name)) { bucket.fields.set(name, []); bucket.fieldRows.set(name, []); }
      bucket.fields.get(name).push(value);
      bucket.fieldRows.get(name).push(row);
      measured[name].included++;
    }
  }
  const sorted = [...bins.values()].filter(bin => names.some(name => (bin.fields.get(name) || []).length)).sort((a,b) => a.start - b.start);
  const periods = sorted.map(bin => bin.label);
  const series = names.map(name => ({ label: name, points: sorted.map(bin => ({ label: bin.label, count: reducer(bin.fields.get(name) || []), unit: 'value', contributingRows: bin.fieldRows.get(name) || [] })) }));
  return {
    periods, series,
    temporalAxis: { ready: true, bins: sorted.map(({ label,start,end }) => ({ label,start,end })), min: sorted[0]?.start ?? null, max: sorted[sorted.length-1]?.end ?? null },
    reporting: { scope: rows.length, eligibleRecords, interval, aggregation, excluded, fields: measured, selectedFields: names, assignedPeriods: periods.length },
  };
}
