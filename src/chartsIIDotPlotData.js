/* Charts II B3.9 — category/column comparisons on a shared numerical axis.
 * One dot represents a summary value, never an individual record. Missing and
 * invalid numeric observations are reported and never coerced to zero.
 * Data is derived only from the caller-supplied chronology/playback scope.
 */
import { parseAnalyticsNumber, getAnalyticsFieldValue } from './analyticsDerivationHelpers.js';

const missing = value => value === null || value === undefined || String(value).trim() === '';
const unique = values => [...new Set((Array.isArray(values) ? values : []).filter(value => typeof value === 'string' && value.length))];

function aggregate(values, operation) {
  if (!values.length) return null;
  if (operation === 'sum') return values.reduce((sum, value) => sum + value, 0);
  if (operation === 'min') return Math.min(...values);
  if (operation === 'max') return Math.max(...values);
  if (operation === 'median') {
    const sorted = [...values].sort((a, b) => a - b);
    const index = (sorted.length - 1) / 2;
    const floor = Math.floor(index), ceil = Math.ceil(index);
    return (sorted[floor] + sorted[ceil]) / 2;
  }
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

export function deriveChartsIIDotPlot(rows = [], { mode = 'category', fields = [], measureField = '', categoryField = '', aggregation = 'average', maxGroups = 10, order = 'value' } = {}) {
  const records = Array.isArray(rows) ? rows : [];
  const byGroup = new Map();
  const columnMode = mode === 'columns';
  const selectedFields = columnMode ? unique(fields) : [measureField];
  const actualAggregate = !columnMode && measureField === 'recordCount' ? 'count' : ['sum','average','median','min','max'].includes(aggregation) ? aggregation : 'average';
  const reporting = { mode: columnMode ? 'columns' : 'category', scope: records.length,
    aggregation: actualAggregate, selectedFields, categoryField: columnMode ? '' : categoryField,
    includedMeasurements: 0, excluded: { missingMeasure: 0, invalidMeasure: 0, missingCategory: 0 },
    groupsOmitted: 0, plottedGroups: 0, note: 'One dot is one aggregated category or numerical column. No missing observation is assigned zero.' };
  if (columnMode) {
    for (const field of selectedFields) byGroup.set(field, { values: [], records: 0 });
    for (const row of records) for (const field of selectedFields) {
      const raw = row?.[field];
      if (missing(raw)) { reporting.excluded.missingMeasure++; continue; }
      const numeric = parseAnalyticsNumber(raw);
      if (numeric === null || !Number.isFinite(numeric)) { reporting.excluded.invalidMeasure++; continue; }
      byGroup.get(field).values.push(numeric);
      byGroup.get(field).records++;
      reporting.includedMeasurements++;
    }
  } else {
    for (const row of records) {
      const categoryRaw = getAnalyticsFieldValue(row, categoryField);
      if (missing(categoryRaw)) { reporting.excluded.missingCategory++; continue; }
      const category = String(categoryRaw).trim();
      if (!byGroup.has(category)) byGroup.set(category, { values: [], records: 0 });
      const group = byGroup.get(category);
      if (actualAggregate === 'count') { group.records++; reporting.includedMeasurements++; continue; }
      const raw = getAnalyticsFieldValue(row, measureField);
      if (missing(raw)) { reporting.excluded.missingMeasure++; continue; }
      const numeric = parseAnalyticsNumber(raw);
      if (numeric === null || !Number.isFinite(numeric)) { reporting.excluded.invalidMeasure++; continue; }
      group.values.push(numeric);
      group.records++;
      reporting.includedMeasurements++;
    }
  }
  // Aggregate before applying the category limit. Otherwise a rare group
  // with the largest average or sum can disappear because another group has
  // more observations, even when the researcher selects "Highest value first".
  // For record counts, value and observation frequency are identical.
  let points = [...byGroup.entries()].filter(([, info]) => info.records).map(([label, info]) => ({
    label,
    value: actualAggregate === 'count' ? info.records : aggregate(info.values, actualAggregate),
    n: info.records,
  }));
  points.sort((a,b) => b.value - a.value || a.label.localeCompare(b.label));
  const limit = Number.isFinite(Number(maxGroups)) && Number(maxGroups) > 0 ? Math.floor(Number(maxGroups)) : 10;
  if (!columnMode) {
    reporting.groupsOmitted = Math.max(0, points.length - limit);
    points = points.slice(0, limit);
  }
  // Alphabetical order changes presentation, not which largest values qualify
  // for a category-limited chart.
  if (order === 'label') points.sort((a,b) => a.label.localeCompare(b.label));
  reporting.plottedGroups = points.length;
  return { points, reporting };
}
