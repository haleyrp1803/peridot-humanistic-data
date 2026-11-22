/* Charts II B3.8 — Record-preserving distribution statistics.
 * Quartiles use linear interpolation (R type 7); Tukey fences are 1.5 x IQR.
 * Outliers remain included in statistics and are returned individually for display.
 * No dates are inferred, missing numerical measurements are never zero.
 */
import { parseAnalyticsNumber, getAnalyticsFieldValue } from './analyticsDerivationHelpers.js';

const missing = value => value === null || value === undefined || String(value).trim() === '';

export function chartsIIBoxQuantile(sorted, probability) {
  if (!sorted.length) return null;
  if (sorted.length === 1) return sorted[0];
  const position = (sorted.length - 1) * probability;
  const lower = Math.floor(position), upper = Math.ceil(position);
  return sorted[lower] + (sorted[upper] - sorted[lower]) * (position - lower);
}

export function chartsIIBoxStatistics(values = []) {
  const sorted = values.filter(Number.isFinite).slice().sort((a, b) => a - b);
  if (!sorted.length) return null;
  const q1 = chartsIIBoxQuantile(sorted, .25);
  const median = chartsIIBoxQuantile(sorted, .5);
  const q3 = chartsIIBoxQuantile(sorted, .75);
  const iqr = q3 - q1;
  const lowerFence = q1 - 1.5 * iqr, upperFence = q3 + 1.5 * iqr;
  const inliers = sorted.filter(value => value >= lowerFence && value <= upperFence);
  const outliers = sorted.filter(value => value < lowerFence || value > upperFence);
  return { count: sorted.length, min: sorted[0], max: sorted[sorted.length - 1], q1, median, q3, iqr,
    lowerWhisker: inliers[0], upperWhisker: inliers[inliers.length - 1], outliers,
    lowerFence, upperFence };
}

export function deriveChartsIIBoxPlot(rows = [], { mode = 'columns', fields = [], measureField = '', groupField = '', maxGroups = 12 } = {}) {
  const records = Array.isArray(rows) ? rows : [];
  const groups = new Map();
  const reporting = { scope: records.length, mode, includedMeasurements: 0,
    excluded: { missingMeasure: 0, invalidMeasure: 0, missingCategory: 0 },
    groupsOmitted: 0, selectedFields: [], plottedGroups: 0, outliers: 0,
    note: 'Measurements remain unchanged; outliers are displayed and included in quartile calculations.' };
  if (mode === 'columns') {
    const names = [...new Set(fields.filter(value => typeof value === 'string' && value.length))];
    reporting.selectedFields = names;
    for (const name of names) groups.set(name, []);
    for (const [recordIndex, row] of records.entries()) {
      for (const name of names) {
        const raw = row?.[name];
        if (missing(raw)) { reporting.excluded.missingMeasure++; continue; }
        const value = parseAnalyticsNumber(raw);
        if (value === null || !Number.isFinite(value)) { reporting.excluded.invalidMeasure++; continue; }
        groups.get(name).push({ value, recordIndex: recordIndex + 1, date: typeof row?.Date === 'string' || typeof row?.Date === 'number' ? String(row.Date) : null });
        reporting.includedMeasurements++;
      }
    }
  } else {
    reporting.selectedFields = [measureField];
    for (const [recordIndex, row] of records.entries()) {
      const rawCategory = getAnalyticsFieldValue(row, groupField);
      if (missing(rawCategory)) { reporting.excluded.missingCategory++; continue; }
      const category = String(rawCategory).trim();
      const raw = row?.[measureField];
      if (missing(raw)) { reporting.excluded.missingMeasure++; continue; }
      const value = parseAnalyticsNumber(raw);
      if (value === null || !Number.isFinite(value)) { reporting.excluded.invalidMeasure++; continue; }
      if (!groups.has(category)) groups.set(category, []);
      groups.get(category).push({ value, recordIndex: recordIndex + 1, date: typeof row?.Date === 'string' || typeof row?.Date === 'number' ? String(row.Date) : null });
      reporting.includedMeasurements++;
    }
  }
  // For category mode, avoid hiding categories silently: display a bounded list
  // selected by observation count and disclose the omitted groups.
  const entries = [...groups.entries()].filter(([, values]) => values.length);
  if (mode === 'category') entries.sort((a, b) => b[1].length - a[1].length || a[0].localeCompare(b[0]));
  const shown = mode === 'category' ? entries.slice(0, maxGroups) : entries;
  reporting.groupsOmitted = entries.length - shown.length;
  const boxes = shown.map(([label, observations]) => {
    const stats = chartsIIBoxStatistics(observations.map(observation => observation.value));
    return { label, ...stats, outlierDetails: observations
      .filter(observation => observation.value < stats.lowerFence || observation.value > stats.upperFence)
      .sort((a, b) => a.value - b.value || a.recordIndex - b.recordIndex) };
  });
  reporting.plottedGroups = boxes.length;
  reporting.outliers = boxes.reduce((total, box) => total + box.outliers.length, 0);
  return { boxes, reporting };
}
