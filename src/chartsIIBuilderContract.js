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

const family = (engineType, slots, options = {}) => Object.freeze({ engineType, slots, ...options });
export const CHARTS_II_BUILDER_FAMILIES = Object.freeze({
  bar: family('bar', [{ key: 'barGroupBy', label: 'Category', pool: 'barGroupOptions' }, { key: 'yField', label: 'Measure', pool: 'yMetricOptions' }]),
  'grouped-bar': family('groupedBar', [{ key: 'xField', label: 'Category / x-axis', pool: 'xAxisOptions' }, { key: 'groupedBarGroupBy', label: 'Compare by', pool: 'segmentGroupOptions', distinctFrom: 'xField' }, { key: 'yField', label: 'Measure', pool: 'yMetricOptions' }]),
  'stacked-bar': family('stackedBar', [{ key: 'xField', label: 'Category / x-axis', pool: 'xAxisOptions' }, { key: 'stackSegmentBy', label: 'Segments', pool: 'segmentGroupOptions', distinctFrom: 'xField' }, { key: 'yField', label: 'Measure', pool: 'yMetricOptions' }]),
  pie: family('pie', [{ key: 'pieGroupBy', label: 'Slices', pool: 'pieGroupOptions' }, { key: 'yField', label: 'Measure', pool: 'yMetricOptions' }], { additive: true }),
  histogram: family('histogram', [{ key: 'histogramValueField', label: 'Numeric values', pool: 'histogramMeasureOptions' }, { key: 'histogramGroupBy', label: 'Group counts by', pool: 'barGroupOptions', optionalWhen: 'histogramValueField', optionalUnlessValue: 'recordCount' }]),
  heatmap: family('heatmap', [{ key: 'heatmapRowBy', label: 'Rows', pool: 'heatmapRowOptions' }, { key: 'heatmapColumnBy', label: 'Columns', pool: 'heatmapColumnOptions', distinctFrom: 'heatmapRowBy' }, { key: 'yField', label: 'Measure', pool: 'yMetricOptions' }]),
  sunburst: family('sunburst', [{ key: 'sunburstParentBy', label: 'Parent categories', pool: 'barGroupOptions' }, { key: 'sunburstChildBy', label: 'Child categories', pool: 'segmentGroupOptions', distinctFrom: 'sunburstParentBy' }, { key: 'yField', label: 'Measure', pool: 'yMetricOptions' }], { additive: true }),
  line: family('line', [{ key: 'xField', label: 'Ordered x-axis', pool: 'orderedXAxisOptions' }, { key: 'yField', label: 'Measure', pool: 'yMetricOptions' }], { variant: 'single-line' }),
  'line-multi': family('multiLine', [{ key: 'xField', label: 'Ordered x-axis', pool: 'orderedXAxisOptions' }, { key: 'multiLineGroupBy', label: 'Separate lines by', pool: 'segmentGroupOptions', distinctFrom: 'xField' }, { key: 'yField', label: 'Measure', pool: 'yMetricOptions' }], { variant: 'grouped-series' }),
});

const optionList = (items) => Array.isArray(items) ? items : [];
const has = (options, key) => options.some((item) => item.key === key);
const first = (options, excluded = '') => options.find((item) => item.key !== excluded)?.key || '';

export function getChartsIIBuilderFieldInventory(rows = []) {
  const discovered = getAvailableAnalyticsFields(Array.isArray(rows) ? rows : []);
  return {
    ...discovered,
    histogramMeasureOptions: discovered.yMetricOptions,
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

export function deriveChartsIIBuilderData(contract, rows = [], settings = {}) {
  if (!contract?.supported || !contract.ready) return { status: 'unavailable', problems: contract?.problems || ['Choose a supported chart and valid fields.'], chart: null };
  // Explicitly whitelist allowed engine arguments rather than leaking UI state.
  const args = { rows: Array.isArray(rows) ? rows : [], chartType: contract.engineType, ...(contract.chartKey === 'line-multi' ? { multiLineMode: 'long' } : {}), ...contract.values,
    topN: Number.isInteger(settings.topN) && settings.topN >= 1 ? settings.topN : 10,
    aggregation: ['count', 'sum', 'average', 'min', 'max'].includes(settings.aggregation) ? settings.aggregation : 'count',
  };
  const chart = buildAnalyticsChartData(args);
  return { status: 'ready', chart, recordsInScope: args.rows.length };
}
