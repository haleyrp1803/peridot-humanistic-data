/* Charts II B4.3 — advisory catalogue evidence from stable Explore-scope records.
 * The Catalogue must not mistake field existence for usable values or imply
 * a correlation, hierarchy, or historically meaningful interpretation.
 * Its findings are advisory only: every chart remains selectable.
 */
import { getChartsIIFieldInventory } from './chartsIIFieldInventory.js';
import { getAnalyticsFieldValue, parseAnalyticsNumber } from './analyticsDerivationHelpers.js';
import { getRowTemporalDateParts } from './timelinePlaybackHelpers.js';

const names = items => (Array.isArray(items) ? items : []).map(item => item.label || item.key);
const present = value => value !== null && value !== undefined && String(value).trim() !== '';

// Geographic coordinates are technical location attributes, not a reason to
// recommend numerical charts. Keep them in the discovered field inventory so
// researchers may still select them deliberately in the Builder.
// Token boundaries avoid confusing legitimate fields such as 'population' or
// 'latitudeAdjustedPrice' with coordinate columns by substring alone.
export function isChartsIIGeographicCoordinateField(field) {
  const key = String(field?.key ?? '');
  const label = String(field?.label ?? '');
  const tokenize = value => value
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/([A-Z])([A-Z][a-z])/g, '$1 $2')
    .replace(/[_\-./()]+/g, ' ')
    .toLowerCase();
  const coordinates = new Set(['lat', 'latitude', 'lon', 'long', 'lng', 'longitude']);
  const qualifiers = new Set([
    'point', 'source', 'target', 'from', 'to', 'recipient', 'sender',
    'origin', 'destination', 'inferred', 'assigned', 'decimal', 'degrees',
    'degree', 'gps', 'geo', 'geographic', 'of',
  ]);
  return [key, label].some(value => {
    const tokens = tokenize(value).trim().split(/\s+/).filter(Boolean);
    return tokens.some(token => coordinates.has(token))
      && tokens.every(token => coordinates.has(token) || qualifiers.has(token));
  });
}

export function buildChartsIIDataProfile(rows = []) {
  const records = Array.isArray(rows) ? rows : [];
  const fields = getChartsIIFieldInventory(records);
  const categorical = fields.barGroupOptions || [];
  const numeric = fields.numericMeasureOptions || [];
  const recommendationNumerics = numeric.filter(field => !isChartsIIGeographicCoordinateField(field));
  const temporal = fields.dateFieldOptions || [];

  // Bounded candidate inventories avoid a quadratic pass over very wide
  // spreadsheets. Exceeding the cap is a reason for uncertainty, not a
  // negative suitability judgement.
  const checkedNumbers = recommendationNumerics.slice(0, 12);
  const checkedCategories = categorical.slice(0, 8);
  const numericCounts = new Array(checkedNumbers.length).fill(0);
  const categoryCounts = new Array(checkedCategories.length).fill(0);
  const yearCounts = new Map();
  const monthCounts = new Map();
  const numericPairCounts = new Map();
  const categoryPairCounts = new Map();
  let positionedRecords = 0;
  let exactDateRecords = 0;
  let exactDateNumericRecords = 0;

  for (const record of records) {
    const date = getRowTemporalDateParts(record);
    if (date) {
      positionedRecords++;
      if (date.precision === 'day') exactDateRecords++;
      yearCounts.set(date.year, (yearCounts.get(date.year) || 0) + 1);
      const month = `${date.year}-${String(date.month).padStart(2, '0')}`;
      if (date.precision === 'month' || date.precision === 'day') {
        monthCounts.set(month, (monthCounts.get(month) || 0) + 1);
      }
    }
    const validNumericIndices = [];
    for (let i = 0; i < checkedNumbers.length; i++) {
      const key = checkedNumbers[i].key;
      const raw = Object.prototype.hasOwnProperty.call(record || {}, key) && present(record[key])
        ? record[key] : getAnalyticsFieldValue(record, key);
      if (!present(raw) || parseAnalyticsNumber(raw) === null) continue;
      numericCounts[i]++;
      validNumericIndices.push(i);
    }
    if (date?.precision === 'day' && validNumericIndices.length) exactDateNumericRecords++;
    for (let a = 0; a < validNumericIndices.length; a++) {
      for (let b = a + 1; b < validNumericIndices.length; b++) {
        const key = `${validNumericIndices[a]}:${validNumericIndices[b]}`;
        numericPairCounts.set(key, (numericPairCounts.get(key) || 0) + 1);
      }
    }
    const validCategoryIndices = [];
    for (let i = 0; i < checkedCategories.length; i++) {
      if (!present(getAnalyticsFieldValue(record, checkedCategories[i].key))) continue;
      categoryCounts[i]++;
      validCategoryIndices.push(i);
    }
    for (let a = 0; a < validCategoryIndices.length; a++) {
      for (let b = a + 1; b < validCategoryIndices.length; b++) {
        const key = `${validCategoryIndices[a]}:${validCategoryIndices[b]}`;
        categoryPairCounts.set(key, (categoryPairCounts.get(key) || 0) + 1);
      }
    }
  }

  const max = values => Math.max(0, ...values);
  const maxMap = counts => max([...counts.values()]);
  const usefulCategories = categoryCounts.filter(count => count > 0).length;
  const usefulNumerics = numericCounts.filter(count => count > 0).length;
  const usableYearPeriods = [...yearCounts.values()].filter(count => count > 0).length;
  const usableMonthPeriods = [...monthCounts.values()].filter(count => count > 0).length;
  const observations = checkedNumbers.map((field, index) => ({
    key: field.key, label: field.label || field.key, populated: numericCounts[index],
  }));
  return {
    rowCount: records.length,
    positionedRecords,
    exactDateRecords,
    exactDateNumericRecords,
    usableYearPeriods,
    usableMonthPeriods,
    pairedNumericalRecords: maxMap(numericPairCounts),
    pairedCategoryRecords: maxMap(categoryPairCounts),
    numericObservations: max(numericCounts),
    usefulNumerics,
    usefulCategories,
    uninspectedNumerics: Math.max(0, recommendationNumerics.length - checkedNumbers.length),
    uninspectedCategories: Math.max(0, categorical.length - checkedCategories.length),
    hasTime: positionedRecords > 0,
    hasMultipleSeries: usefulNumerics > 1 || usefulCategories > 0,
    categoricalFields: categorical,
    numericFields: numeric,
    temporalFields: temporal,
    observations,
    labels: {
      time: positionedRecords > 0 ? 'mapped temporal assertions' : '',
      categorical: names(categorical).slice(0, 3),
      numeric: names(recommendationNumerics).slice(0, 3),
    },
  };
}

// Conservative recommendations: only clear evidence receives a badge.
// Scores rank cards, but scores are not probabilities or chart-quality ratings.
// A missing field is weaker evidence than the presence of unusable values;
// inconclusive cases remain neutral rather than implying impossibility.
const RULES = Object.freeze({
  line: p => ({ score: p.positionedRecords >= 2 ? 83 : 18, need:'mapped dates on contributing records', reason:'Mapped dates support an ordered time axis.' }),
  area: p => ({ score: p.positionedRecords >= 2 ? 82 : 18, need:'mapped dates and a nonnegative or count measure', reason:'Mapped dates support a time-based magnitude view.' }),
  'stacked-area': p => ({ score: p.positionedRecords >= 2 && p.usefulCategories >= 1 ? 76 : 42, need:'mapped dates and a groupable series', reason:'A temporal axis and categorical grouping appear usable; check that the measure is additive and nonnegative.' }),
  bar: p => ({ score: p.usefulCategories ? 88 : 12, need:'a populated categorical field', reason:'Populated categories can be counted or compared using a measure.' }),
  'grouped-bar': p => ({ score: p.pairedCategoryRecords >= 2 ? 85 : 36, need:'two categorical fields populated on the same records', reason:'Two grouping dimensions overlap on multiple observations.' }),
  dot: p => ({ score: p.usefulCategories ? 80 : p.usefulNumerics >= 2 ? 78 : 42, need:'populated categories or numerical columns', reason:'Category groups or numerical columns can be summarized on a common scale.' }),
  slope: p => ({ score: p.usableYearPeriods >= 2 || p.usableMonthPeriods >= 2 ? 77 : 36, need:'at least two populated canonical comparison periods', reason:'More than one mapped comparison period is available; check that selected series have observations in both periods.' }),
  'stacked-bar': p => ({ score: p.pairedCategoryRecords >= 2 ? 83 : 36, need:'two overlapping categorical dimensions and additive totals', reason:'Categories can be subdivided into observed groups; confirm nonnegative additive measures.' }),
  pie: p => ({ score: p.usefulCategories ? 76 : 16, need:'populated categories and nonnegative additive values', reason:'Observed categories can be counted as shares of a whole.' }),
  treemap: p => ({ score: p.usefulCategories ? 76 : 16, need:'populated categories and nonnegative additive values', reason:'Observed categories can be represented as proportional areas.' }),
  sunburst: p => ({ score: p.pairedCategoryRecords >= 2 ? 80 : 36, need:'two populated, meaningfully related grouping levels', reason:'Two categorical fields overlap; verify that their grouping represents a meaningful hierarchy.' }),
  histogram: p => ({ score: p.numericObservations >= 5 ? 85 : p.usefulNumerics ? 49 : 13, need:'at least five valid observations in a numerical field', reason:'A numerical field contains enough values for an initial distribution.' }),
  box: p => ({ score: p.numericObservations >= 10 ? 83 : p.usefulNumerics ? 46 : 13, need:'enough valid numerical observations for quartiles', reason:'A numerical field contains observations for quartile summaries.' }),
  scatter: p => ({ score: p.pairedNumericalRecords >= 5 ? 91 : p.exactDateNumericRecords >= 5 ? 77 : !p.usefulNumerics && !p.exactDateNumericRecords ? 16 : 47, need:'paired numerical observations or precise dates with a numerical measure', reason: p.pairedNumericalRecords >= 5 ? 'Two numerical fields overlap in at least five records.' : 'Exact-day dates may support a date-versus-measure scatter chart; verify that the same records have measurements.' }),
  heatmap: p => ({ score: p.pairedCategoryRecords >= 2 ? 86 : 36, need:'two categorical fields populated together', reason:'Overlapping categories can form a matrix of observations.' }),
});

export function assessChartsIISuitability(profile, chartFamilies) {
  const p = profile;
  return chartFamilies.map(chart => {
    const rule = RULES[chart.key];
    const result = rule ? rule(p) : { score:0, need:'fields', reason:'No suitability rule is available.' };
    const uncertainty = (p.uninspectedNumerics || 0) > 0 || (p.uninspectedCategories || 0) > 0;
    const state = !p.rowCount ? 'neutral' : result.score >= 72 ? 'likely' : result.score <= 25 && !uncertainty ? 'poor' : 'neutral';
    const evidence = [
      p.labels.time && `Time: ${p.labels.time} (${p.positionedRecords} records)`,
      p.labels.numeric.length && `Numerical: ${p.labels.numeric.join(', ')}`,
      p.labels.categorical.length && `Categories: ${p.labels.categorical.join(', ')}`,
    ].filter(Boolean).join(' · ');
    const explanation = !p.rowCount
      ? 'The current Explore scope contains no records to assess. You may still choose this chart.'
      : state === 'poor'
        ? `Peridot could not identify ${result.need} in the current Explore scope. You can still choose this chart and assign fields yourself.`
        : state === 'likely'
          ? `${result.reason} This is a suggestion based on usable observations, not a guarantee of an appropriate chart.`
          : `Peridot has incomplete evidence for this chart. It generally needs ${result.need}; the researcher determines whether the comparison is meaningful.`;
    return { ...chart, score:result.score, suitability:state, explanation, evidence };
  });
}
