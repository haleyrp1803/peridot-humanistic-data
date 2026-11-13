/*
 * Charts II — read-only dataset profile and advisory suitability rules.
 *
 * Input is the existing analytics availability scope: applied Explore-filtered
 * records, BEFORE timeline/playback narrowing, plus non-positionable records.
 * This deliberately does not alter canonical mapping or chart computations.
 *
 * Field discovery reuses Charts I's existing generalized field inventory as an
 * adapter, not its chart builder state or SVG renderer. Some researcher fields
 * may be omitted by that inventory's conservative heuristics. No negative
 * recommendation is a prohibition: all chart families remain selectable.
 */
import { getAvailableAnalyticsFields } from './analyticsDerivationHelpers.js';
import { getRowTemporalDateParts } from './timelinePlaybackHelpers.js';

const nonempty = (value) => value !== null && value !== undefined && String(value).trim() !== '';
const names = (items) => (Array.isArray(items) ? items : []).map((item) => item.label || item.key);

export function buildChartsIIDataProfile(rows = []) {
  const records = Array.isArray(rows) ? rows : [];
  const fields = getAvailableAnalyticsFields(records);
  const categorical = fields.barGroupOptions || [];
  const numeric = fields.numericMeasureOptions || [];
  const temporal = fields.dateFieldOptions || [];
  // A parsed canonical date provides stronger evidence than a date-like name.
  // The existing chronology parser is authoritative for mapped time assertions.
  let positionedRecords = 0;
  for (const record of records) {
    if (getRowTemporalDateParts(record)) positionedRecords += 1;
  }

  const observations = numeric.map((field) => {
    let populated = 0;
    for (const record of records) {
      if (nonempty(record?.[field.key])) populated += 1;
    }
    return { key: field.key, label: field.label || field.key, populated };
  });
  const numericObservations = Math.max(0, ...observations.map((item) => item.populated));
  const dateFields = temporal.filter((field) => !['year', 'fullDate'].includes(field.key));
  const hasTime = positionedRecords > 0 || dateFields.length > 0;
  const hasMultipleSeries = numeric.length > 1 || categorical.length > 0;

  return {
    rowCount: records.length,
    positionedRecords,
    hasTime,
    hasMultipleSeries,
    numericObservations,
    categoricalFields: categorical,
    numericFields: numeric,
    temporalFields: temporal,
    labels: {
      time: positionedRecords > 0 ? 'mapped temporal assertions' : dateFields.length ? names(dateFields).slice(0, 2).join(', ') : '',
      categorical: names(categorical).slice(0, 3),
      numeric: names(numeric).slice(0, 3),
    },
  };
}

// Each rule is deliberately short and inspectable. A category may exist yet
// be inappropriate in a particular research context; recommend suitability,
// never semantic validity. Scores order cards but are not shown as percentages.
const RULES = Object.freeze({
  line: (p) => ({ score: (p.hasTime ? 58 : 0) + (p.hasMultipleSeries ? 24 : 0) + (p.numericFields.length ? 12 : 0), need: 'a usable time axis and one or more measures or groups', reason: 'Time values and multiple comparison series appear available.' }),
  area: (p) => ({ score: (p.hasTime ? 65 : 0) + (p.numericFields.length ? 20 : 5), need: 'a usable ordered time axis', reason: 'Time values appear available for showing changes in magnitude.' }),
  'stacked-area': (p) => ({ score: (p.hasTime ? 49 : 0) + (p.hasMultipleSeries ? 30 : 0) + (p.categoricalFields.length ? 7 : 0), need: 'time and multiple groupable series', reason: 'Time and multiple series appear available for a stacked view.' }),
  bar: (p) => ({ score: p.categoricalFields.length ? 88 : 0, need: 'a usable category field', reason: 'Mapped categories can be compared by record count or a measure.' }),
  'grouped-bar': (p) => ({ score: p.categoricalFields.length >= 2 ? 87 : p.categoricalFields.length === 1 ? 37 : 0, need: 'two groupable fields', reason: 'Multiple categorical dimensions appear available.' }),
  dot: (p) => ({ score: p.categoricalFields.length ? 75 : 0, need: 'a categorical field and a comparable value', reason: 'Mapped categories appear available for a compact comparison.' }),
  slope: (p) => ({ score: (p.hasTime ? 45 : 0) + (p.hasMultipleSeries ? 25 : 0), need: 'two ordered comparison points and one or more series', reason: 'An ordered dimension and comparison series may be available.' }),
  'stacked-bar': (p) => ({ score: p.categoricalFields.length >= 2 ? 85 : p.categoricalFields.length === 1 ? 32 : 0, need: 'two groupable dimensions', reason: 'Categories can be subdivided into additive contributions.' }),
  pie: (p) => ({ score: p.categoricalFields.length ? 75 : 0, need: 'a category field and meaningful nonnegative totals', reason: 'Mapped categories can be counted as shares of a whole.' }),
  treemap: (p) => ({ score: p.categoricalFields.length ? 73 : 0, need: 'categorical groups and nonnegative totals', reason: 'Category counts may support proportional rectangles.' }),
  sunburst: (p) => ({ score: p.categoricalFields.length >= 2 ? 83 : p.categoricalFields.length === 1 ? 30 : 0, need: 'at least two grouping levels', reason: 'Multiple categorical fields may support a hierarchy; their meaning requires review.' }),
  histogram: (p) => ({ score: p.numericFields.length && p.numericObservations >= 5 ? 86 : p.numericFields.length ? 55 : 12, need: 'a numerical variable with multiple observations', reason: 'Numerical measurements appear available for a distribution.' }),
  box: (p) => ({ score: p.numericFields.length && p.numericObservations >= 10 ? 83 : p.numericFields.length ? 48 : 0, need: 'a numerical variable with enough observations', reason: 'Numerical observations appear available for quartiles and outliers.' }),
  scatter: (p) => ({ score: p.numericFields.length >= 2 ? 94 : p.numericFields.length === 1 ? 25 : 0, need: 'two numerical variables', reason: 'Multiple numerical measures appear available for a two-axis comparison.' }),
  heatmap: (p) => ({ score: p.categoricalFields.length >= 2 ? 89 : p.categoricalFields.length === 1 ? 32 : 0, need: 'two categorical dimensions', reason: 'Two categorical dimensions appear available for a matrix.' }),
});

export function assessChartsIISuitability(profile, chartFamilies) {
  const p = profile;
  return chartFamilies.map((chart) => {
    const rule = RULES[chart.key];
    const result = rule ? rule(p) : { score: 0, need: 'field assignments', reason: 'No criteria are defined yet.' };
    // Avoid treating an empty scoped dataset as evidence of true incompatibility.
    const state = !p.rowCount ? 'neutral' : result.score >= 72 ? 'likely' : result.score <= 25 ? 'poor' : 'neutral';
    const evidence = [
      p.labels.time && `Time: ${p.labels.time}`,
      p.labels.numeric.length && `Numerical: ${p.labels.numeric.join(', ')}`,
      p.labels.categorical.length && `Categories: ${p.labels.categorical.join(', ')}`,
    ].filter(Boolean).join(' · ');
    const explanation = !p.rowCount
      ? 'The current Explore scope contains no records to assess. You may still choose this chart.'
      : state === 'poor'
        ? `Peridot could not identify ${result.need} in the current mapping. You can still choose this chart and assign fields yourself.`
        : state === 'likely'
          ? `${result.reason} This is a suggestion based on detected fields, not a guarantee of an appropriate chart.`
          : `Peridot has partial evidence for this chart, but the fit is uncertain. It usually needs ${result.need}.`;
    return { ...chart, score: result.score, suitability: state, explanation, evidence };
  });
}
