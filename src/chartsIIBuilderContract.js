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
import { buildAnalyticsChartData } from './analyticsDerivationHelpers.js';
import { getChartsIIFieldInventory } from './chartsIIFieldInventory.js';
import { deriveChartsIIWideTemporalSeries } from './chartsIIWideTemporalSeries.js';
import { deriveChartsIIScatter } from './chartsIIScatterData.js';
import { deriveChartsIIBoxPlot } from './chartsIIBoxPlotData.js';
import { deriveChartsIIDotPlot } from './chartsIIDotPlotData.js';
import { deriveChartsIITemporalSeries, CHARTS_II_TIME_INTERVALS } from './chartsIITemporalAggregation.js';
const CHARTS_II_TIME_INTERVAL_LABELS = Object.fromEntries(CHARTS_II_TIME_INTERVALS.map(({value,label}) => [value,label]));

const family = (engineType, slots, options = {}) => Object.freeze({ engineType, slots, ...options });
export const CHARTS_II_BUILDER_FAMILIES = Object.freeze({
  'scatter-date': family('scatter', [{ key: 'scatterYField', label: 'Y-axis (numeric)', pool: 'numericMeasureOptions' }]),
  scatter: family('scatter', [{ key: 'scatterXField', label: 'X-axis (numeric)', pool: 'numericMeasureOptions' }, { key: 'scatterYField', label: 'Y-axis (numeric)', pool: 'numericMeasureOptions', distinctFrom: 'scatterXField' }]),
  box: family('box', []),
  dot: family('dot', []),
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
  'line-wide': family('wideLine', [{ key: 'xField', label: 'Ordered x-axis', pool: 'temporalXAxisOptions' }]),
  'line-multi': family('multiLine', [{ key: 'xField', label: 'Ordered x-axis', pool: 'temporalXAxisOptions' }, { key: 'multiLineGroupBy', label: 'Separate lines by', pool: 'segmentGroupOptions', distinctFrom: 'xField' }, { key: 'yField', label: 'Measure', pool: 'yMetricOptions' }], { variant: 'grouped-series' }),
});

const optionList = (items) => Array.isArray(items) ? items : [];
const has = (options, key) => options.some((item) => item.key === key);
const first = (options, excluded = '') => options.find((item) => item.key !== excluded)?.key || '';

// Backward-compatible Builder entry point; the cached result is shared with
// the Catalogue's suitability profile for this exact Explore-scope array.
export function getChartsIIBuilderFieldInventory(rows = []) {
  return getChartsIIFieldInventory(rows);
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
  if (contract.chartKey === 'dot') {
    const mode = settings.dotMode === 'columns' ? 'columns' : 'category';
    const inventory = getChartsIIBuilderFieldInventory(settings.profileRows || args.rows);
    const numeric = new Set((inventory.numericMeasureOptions || []).map(option => option.key));
    const measures = new Set((inventory.yMetricOptions || []).map(option => option.key));
    const categories = new Set((inventory.barGroupOptions || []).map(option => option.key));
    const fields = [...new Set((settings.dotFields || []).filter(field => numeric.has(field)))];
    if (mode === 'columns' && !fields.length) return { status: 'unavailable', chart: null, problems: ['Select at least one numerical column.'] };
    if (mode === 'category' && (!measures.has(settings.dotMeasureField) || !categories.has(settings.dotGroupField)))
      return { status: 'unavailable', chart: null, problems: ['Choose a measure and a categorical grouping field.'] };
    const aggregation = mode === 'category' && settings.dotMeasureField === 'recordCount' ? 'count'
      : ['sum','average','median','min','max'].includes(settings.dotAggregation) ? settings.dotAggregation : 'average';
    const derived = deriveChartsIIDotPlot(args.rows, { mode, fields, measureField: settings.dotMeasureField,
      categoryField: settings.dotGroupField, aggregation, maxGroups: args.topN, order: settings.dotOrder });
    return { status: 'ready', chart: { chartType: 'dot', title: 'Dot Plot',
      subtitle: mode === 'columns' ? `${aggregation} of observed values for each numerical column.` :
        `${aggregation} of ${settings.dotMeasureField} by ${settings.dotGroupField}.`,
      points: derived.points, valueLabel: mode === 'category' && settings.dotMeasureField === 'recordCount'
        ? 'Records' : mode === 'columns' ? 'Aggregated value' : settings.dotMeasureField || 'Value' }, reporting: derived.reporting };
  }
  if (contract.chartKey === 'box') {
    const mode = settings.boxMode === 'category' ? 'category' : 'columns';
    const inventory = getChartsIIBuilderFieldInventory(settings.profileRows || args.rows);
    const validFields = new Set((inventory.numericMeasureOptions || []).map(option => option.key));
    const selected = [...new Set((settings.boxFields || []).filter(field => validFields.has(field)))];
    if (mode === 'columns' && !selected.length) return { status: 'unavailable', chart: null, problems: ['Select at least one numerical column.'] };
    if (mode === 'category' && (!validFields.has(settings.boxMeasureField) || !(inventory.barGroupOptions || []).some(option => option.key === settings.boxGroupField))) return { status: 'unavailable', chart: null, problems: ['Choose a numeric measure and a categorical grouping field.'] };
    const derived = deriveChartsIIBoxPlot(args.rows, {
      mode, fields: selected, measureField: settings.boxMeasureField,
      groupField: settings.boxGroupField, maxGroups: args.topN,
    });
    return { status: 'ready', chart: { chartType: 'box', title: 'Box Plot',
      subtitle: mode === 'columns' ? 'Distributions of selected numerical columns.' : `${settings.boxMeasureField} by ${settings.boxGroupField}.`,
      boxes: derived.boxes }, reporting: derived.reporting };
  }
  if (contract.chartKey === 'scatter' || contract.chartKey === 'scatter-date') {
    const sizeField = settings.scatterMode === 'bubble' ? settings.bubbleSizeField || '' : '';
    if (settings.scatterMode === 'bubble' && !sizeField) return { status: 'unavailable', problems: ['Select a numerical Bubble size field.'], chart: null };
    const xField = contract.chartKey === 'scatter-date' ? '__canonicalDate__' : contract.values.scatterXField;
    const derived = deriveChartsIIScatter(args.rows, { xField, yField: contract.values.scatterYField, sizeField });
    return { status: 'ready', chart: { chartType: 'scatter', title: settings.scatterMode === 'bubble' ? 'Bubble' : 'Scatter',
      subtitle: `${contract.values.scatterYField} against ${xField === '__canonicalDate__' ? 'canonical date' : xField}${sizeField ? `; size: ${sizeField}` : ''}. Each point represents one eligible record.`,
      xLabel: xField === '__canonicalDate__' ? 'Date' : xField, xAxisDate: xField === '__canonicalDate__', yLabel: contract.values.scatterYField, sizeLabel: sizeField, points: derived.points },
      reporting: derived.reporting };
  }
  if (contract.chartKey === 'line-wide') {
    const fields = (settings.wideSeriesFields || []).filter(field =>
      (getChartsIIBuilderFieldInventory(settings.profileRows || args.rows).numericMeasureOptions || []).some(option => option.key === field));
    if (!fields.length) return { status: 'unavailable', chart: null, problems: ['Select one or more numerical columns to plot.'] };
    const interval = settings.interval || 'year';
    const aggregate = ['average','min','max','sum'].includes(settings.aggregation) ? settings.aggregation : 'average';
    const derived = deriveChartsIIWideTemporalSeries({ rows: args.rows, interval, fields, aggregation: aggregate });
    return { status: 'ready', chart: { chartType: 'multiLine', title: `Numerical measures by ${CHARTS_II_TIME_INTERVAL_LABELS[interval] || interval}`,
      subtitle: `${aggregate} of observed values by calendar interval; missing prices remain missing.`,
      periods: derived.periods, series: derived.series, temporalAxis: derived.temporalAxis }, reporting: derived.reporting };
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
