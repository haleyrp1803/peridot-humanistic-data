/*
 * Charts II Builder B1 — chart-specific field and derivation contract.
 *
 * Owns NO Charts I UI state and changes NO existing derivation semantics.
 * Field discovery uses the current analytics inventory. Chart-family keys are
 * deliberately translated explicitly; unsupported types never fall back to bar.
 * The supplied rows must be the desired chart scope. In B1 the Builder uses
 * stable availability rows for choices ONLY; B2 will wire playback-visible rows
 * before rendering. Do not present B1-derived results as a live chart.
 */
import { getAvailableAnalyticsFields, buildAnalyticsChartData } from './analyticsDerivationHelpers.js';
import { deriveChartsIITemporalSeries, CHARTS_II_TIME_INTERVALS } from './chartsIITemporalAggregation.js';
const CHARTS_II_TIME_INTERVAL_LABELS = Object.fromEntries(CHARTS_II_TIME_INTERVALS.map(({value,label}) => [value,label]));

const family = (engineType, slots, options = {}) => Object.freeze({ engineType, slots, ...options });
export const CHARTS_II_BUILDER_FAMILIES = Object.freeze({
  bar: family('bar', [{ key: 'barGroupBy', label: 'Category', pool: 'barGroupOptions' }, { key: 'yField', label: 'Measure', pool: 'yMetricOptions' }]),
  'grouped-bar': family('groupedBar', [{ key: 'xField', label: 'Category / x-axis', pool: 'xAxisOptions' }, { key: 'groupedBarGroupBy', label: 'Compare by', pool: 'segmentGroupOptions', distinctFrom: 'xField' }, { key: 'yField', label: 'Measure', pool: 'yMetricOptions' }]),
  'stacked-bar': family('stackedBar', [{ key: 'xField', label: 'Category / x-axis', pool: 'xAxisOptions' }, { key: 'stackSegmentBy', label: 'Segments', pool: 'segmentGroupOptions', distinctFrom: 'xField' }, { key: 'yField', label: 'Measure', pool: 'yMetricOptions' }]),
  pie: family('pie', [{ key: 'pieGroupBy', label: 'Slices', pool: 'pieGroupOptions' }, { key: 'yField', label: 'Measure', pool: 'yMetricOptions' }], { additive: true }),
  histogram: family('histogram', [{ key: 'histogramValueField', label: 'Numeric values', pool: 'histogramMeasureOptions' }, { key: 'histogramGroupBy', label: 'Group counts by', pool: 'barGroupOptions', optionalWhen: 'histogramValueField', optionalUnlessValue: 'recordCount' }]),
  heatmap: family('heatmap', [{ key: 'heatmapRowBy', label: 'Rows', pool: 'heatmapRowOptions' }, { key: 'heatmapColumnBy', label: 'Columns', pool: 'heatmapColumnOptions', distinctFrom: 'heatmapRowBy' }, { key: 'yField', label: 'Measure', pool: 'yMetricOptions' }]),
  sunburst: family('sunburst', [{ key: 'sunburstParentBy', label: 'Parent categories', pool: 'barGroupOptions' }, { key: 'sunburstChildBy', label: 'Child categories', pool: 'segmentGroupOptions', distinctFrom: 'sunburstParentBy' }, { key: 'yField', label: 'Measure', pool: 'yMetricOptions' }], { additive: true }),
  area: family('line', [{ key: 'xField', label: 'Ordered x-axis', pool: 'temporalXAxisOptions' }, { key: 'yField', label: 'Measure', pool: 'yMetricOptions' }]),
  'stacked-area': family('multiLine', [{ key: 'xField', label: 'Ordered x-axis', pool: 'temporalXAxisOptions' }, { key: 'multiLineGroupBy', label: 'Stack by', pool: 'segmentGroupOptions', distinctFrom: 'xField' }, { key: 'yField', label: 'Measure', pool: 'yMetricOptions' }], { additive: true }),
  line: family('line', [{ key: 'xField', label: 'Ordered x-axis', pool: 'temporalXAxisOptions' }, { key: 'yField', label: 'Measure', pool: 'yMetricOptions' }], { variant: 'single-line' }),
  'line-multi': family('multiLine', [{ key: 'xField', label: 'Ordered x-axis', pool: 'temporalXAxisOptions' }, { key: 'multiLineGroupBy', label: 'Separate lines by', pool: 'segmentGroupOptions', distinctFrom: 'xField' }, { key: 'yField', label: 'Measure', pool: 'yMetricOptions' }], { variant: 'grouped-series' }),
});

const optionList = (items) => Array.isArray(items) ? items : [];
const has = (options, key) => options.some((item) => item.key === key);
const first = (options, excluded = '') => options.find((item) => item.key !== excluded)?.key || '';

export function getChartsIIBuilderFieldInventory(rows = []) {
  const discovered = getAvailableAnalyticsFields(Array.isArray(rows) ? rows : []);
  return {
    ...discovered,
    histogramMeasureOptions: discovered.yMetricOptions,
    // Raw uploaded date columns may include unknown-date sentinels. The
    // chronological Area axis exclusively uses canonical date projections.
    temporalXAxisOptions: discovered.dateFieldOptions.filter(field => field.key === 'year' || field.key === 'fullDate'),
  };
}

export function createChartsIIBuilderConfiguration(chartKey, rows = []) {
  const definition = CHARTS_II_BUILDER_FAMILIES[chartKey];
  if (!definition) return { chartKey, supported: false, values: {}, slots: [], ready: false, problems: ['This chart family does not yet have a Charts II derivation adapter.'] };
  const fields = getChartsIIBuilderFieldInventory(rows);
  const values = {};
  for (const slot of definition.slots) {
    const options = optionList(fields[slot.pool]);
    values[slot.key] = slot.key === 'yField' && has(options, 'recordCount') ? 'recordCount'
      : slot.key === 'xField' && has(options, 'year') ? 'year'
      : first(options, slot.distinctFrom ? values[slot.distinctFrom] : '');
  }
  return validateChartsIIBuilderConfiguration(chartKey, values, fields);
}

export function validateChartsIIBuilderConfiguration(chartKey, selections = {}, inventory = {}) {
  const definition = CHARTS_II_BUILDER_FAMILIES[chartKey];
  if (!definition) return { chartKey, supported: false, values: {}, slots: [], ready: false, problems: ['Renderer/derivation adapter pending for this chart family.'] };
  const values = { ...selections };
  const problems = [];
  const slots = definition.slots.map((slot) => {
    const options = optionList(inventory[slot.pool]);
    const optional = slot.optionalWhen && values[slot.optionalWhen] !== slot.optionalUnlessValue;
    const selected = values[slot.key];
    if (!optional && !has(options, selected)) problems.push(`Choose a usable field for ${slot.label}.`);
    if (!optional && slot.distinctFrom && selected && selected === values[slot.distinctFrom]) problems.push(`${slot.label} must differ from the first category.`);
    return { ...slot, options, optional: Boolean(optional) };
  });
  return { chartKey, supported: true, engineType: definition.engineType, values, slots, ready: problems.length === 0, problems, additive: Boolean(definition.additive) };
}

export function updateChartsIIBuilderConfiguration(contract, fieldKey, value, rows = []) {
  const fields = getChartsIIBuilderFieldInventory(rows);
  return validateChartsIIBuilderConfiguration(contract.chartKey, { ...contract.values, [fieldKey]: value }, fields);
}

// Chart families share Peridot canonical field inventory, but chronological
// families use their own precision-aware calendar aggregation contract.
// Stacked Area requires aligned, nonnegative, additive layers.
export function stackChartsIIAreaSeries(chart) {
  const periods = Array.isArray(chart?.periods) ? chart.periods : [];
  const inputSeries = Array.isArray(chart?.series) ? chart.series : [];
  const layers = inputSeries.map(series => ({ label: series.label, points: [] }));
  const totals = periods.map(() => 0);
  for (let index = 0; index < periods.length; index += 1) {
    for (let layerIndex = 0; layerIndex < inputSeries.length; layerIndex += 1) {
      const point = inputSeries[layerIndex]?.points?.[index];
      if (point && point.label !== periods[index]) {
        return { ready: false, problem: 'Series periods are not aligned.' };
      }
      const raw = point?.count;
      const numeric = raw === null || raw === undefined ? 0 : Number(raw);
      if (!Number.isFinite(numeric) || numeric < 0) {
        return { ready: false, problem: 'Stacked Area requires nonnegative, finite additive values.' };
      }
      const bottom = totals[index];
      const top = bottom + numeric;
      layers[layerIndex].points.push({ label: periods[index], count: numeric, bottom, top, unit: point?.unit || 'records' });
      totals[index] = top;
    }
  }
  return { ready: true, periods, series: layers, totals, maxTotal: Math.max(0, ...totals) };
}

export function deriveChartsIIBuilderData(contract, rows = [], settings = {}) {
  if (!contract?.supported || !contract.ready) return { status: 'unavailable', problems: contract?.problems || ['Choose a supported chart and valid fields.'], chart: null };
  // Explicitly whitelist allowed engine arguments rather than leaking UI state.
  const args = { rows: Array.isArray(rows) ? rows : [], chartType: contract.engineType, ...(['line-multi', 'stacked-area'].includes(contract.chartKey) ? { multiLineMode: 'long' } : {}), ...contract.values,
    topN: Number.isInteger(settings.topN) && settings.topN >= 1 ? settings.topN : 10,
    aggregation: ['count', 'sum', 'average', 'min', 'max'].includes(settings.aggregation) ? settings.aggregation : 'count',
  };
  // Keep chart-specific aggregation semantics explicit. Numeric stacked areas
  // require Sum, while record counts use Count. The shared analytics helper
  // applies the same additive rule used by Stacked Bar.
  if (contract.chartKey === 'stacked-area') {
    args.aggregation = args.yField === 'recordCount' ? 'count' : 'sum';
  }
  // Charts II's chronological families share the same precision-aware calendar bins.
  // Other chart families retain their existing accepted Charts I derivations.
  if (['line', 'line-multi', 'area', 'stacked-area'].includes(contract.chartKey)) {
    const interval = settings.interval || 'year';
    const grouped = contract.chartKey === 'line-multi' || contract.chartKey === 'stacked-area';
    const additive = contract.chartKey === 'stacked-area';
    const aggregate = args.yField === 'recordCount' ? 'count' : additive ? 'sum' : args.aggregation === 'count' ? 'sum' : args.aggregation;
    const derived = deriveChartsIITemporalSeries({ rows: args.rows, interval, measure: args.yField,
      aggregation: aggregate, groupBy: grouped ? args.multiLineGroupBy : '', topN: args.topN });
    const name = grouped ? 'Trends' : args.yField === 'recordCount' ? 'Record count' : args.yField;
    const base = { title: `${name} by ${CHARTS_II_TIME_INTERVAL_LABELS[interval] || interval}`,
      subtitle: `${aggregate} by ${CHARTS_II_TIME_INTERVAL_LABELS[interval] || interval}; source dates must fit wholly within an interval.`,
      temporalAxis: derived.temporalAxis, reporting: derived.reporting };
    if (contract.chartKey === 'stacked-area') {
      const stacked = stackChartsIIAreaSeries({ periods: derived.periods, series: derived.series });
      if (!stacked.ready) return { status: 'unavailable', problems: [stacked.problem], chart: null, reporting: derived.reporting };
      return { status: 'ready', chart: { ...base, ...stacked, chartType: 'stackedArea' }, reporting: derived.reporting };
    }
    if (contract.chartKey === 'line-multi') return { status: 'ready', chart: { ...base, chartType: 'multiLine', periods: derived.periods, series: derived.series }, reporting: derived.reporting };
    return { status: 'ready', chart: { ...base, chartType: contract.chartKey === 'area' ? 'area' : 'line', data: derived.data }, reporting: derived.reporting };
  }
  const chart = buildAnalyticsChartData(args);
  return { status: 'ready', chart, recordsInScope: args.rows.length };
}
