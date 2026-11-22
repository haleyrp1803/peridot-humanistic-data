/*
 * Charts II B4.0 — source-level regression contract.
 * Run from the repository root:
 *   node --experimental-default-type=module src/chartsIIRegression.test.mjs
 *
 * This suite uses deliberately small, synthetic canonical source assertions.
 * It does not modify records, require a browser, or substitute for interactive
 * chronology-pointer and React persistence acceptance testing.
 */
import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  createChartsIIBuilderConfiguration,
  deriveChartsIIBuilderData,
  getChartsIIBuilderFieldInventory,
  updateChartsIIBuilderConfiguration,
  validateChartsIIBuilderConfiguration,
  stackChartsIIAreaSeries,
} from './chartsIIBuilderContract.js';
import { chartsIIEligibleBin, deriveChartsIITemporalSeries } from './chartsIITemporalAggregation.js';
import { chartsIISlopePeriods, deriveChartsIISlope } from './chartsIISlopeData.js';
import { deriveChartsIIWideTemporalSeries } from './chartsIIWideTemporalSeries.js';
import { deriveChartsIIScatter } from './chartsIIScatterData.js';
import { deriveChartsIIBoxPlot } from './chartsIIBoxPlotData.js';
import { deriveChartsIIDotPlot } from './chartsIIDotPlotData.js';
import { deriveChartsIITreemap } from './chartsIITreemapData.js';

function canonicalRow(year, day, fields = {}, precision = 'day') {
  const startKey = year * 10000 + 100 + (precision === 'day' ? day : 1);
  const endKey = year * 10000 + 100 + (precision === 'day' ? day : 31);
  return {
    ...fields,
    temporalAssertions: [{
      role: 'Date',
      start: { year, month: 1, ...(precision === 'day' ? { day } : {}) },
      end: { year, month: 1, ...(precision === 'day' ? { day } : {}) },
      sortBounds: { start: startKey, end: endKey },
      visualizationUsability: { timelinePositionable: true },
    }],
  };
}
const fixture = Array.from({length: 20}, (_, index) => {
  const year = index < 10 ? 1711 : 1712;
  return canonicalRow(year, index % 10 + 1, {
    sourcePerson: index % 2 ? 'Ada' : 'Beatrice',
    targetPerson: index % 3 ? 'Cleo' : 'Dora',
    sourceLoc: index % 2 ? 'Florence' : 'Siena',
    targetLoc: index % 3 ? 'Pisa' : 'Napoli',
    PriceA: index === 3 ? '' : index + 1,
    PriceB: index === 5 ? '' : (index + 1) * 2,
    year,
  });
});
const periods = chartsIISlopePeriods(fixture, 'year');
const settings = {
  profileRows: fixture, topN: 10, interval: 'year', aggregation: 'count',
  boxMode: 'columns', boxFields: ['PriceA','PriceB'],
  dotMode: 'columns', dotFields: ['PriceA','PriceB'],
  slopeMode: 'columns', slopeFields: ['PriceA','PriceB'], slopeInterval: 'year',
  slopeFirstPeriod: String(periods[0].start), slopeSecondPeriod: String(periods[1].start),
  treemapHierarchy: true, treemapParentField: 'sourcePerson',
  treemapChildField: 'targetPerson', treemapMeasureField: 'recordCount',
  scatterMode: 'scatter', wideSeriesFields: ['PriceA','PriceB'],
};

test('all 15 catalogue families produce a live derivation with mapped synthetic data', () => {
  const expected = {
    line: 'line', area: 'area', 'stacked-area': 'stackedArea', bar: 'bar',
    'grouped-bar': 'groupedBar', 'stacked-bar': 'stackedBar', pie: 'pie',
    sunburst: 'sunburst', histogram: 'histogram', box: 'box', scatter: 'scatter',
    heatmap: 'heatmap', dot: 'dot', slope: 'slope', treemap: 'treemap',
  };
  for (const [key, chartType] of Object.entries(expected)) {
    const contract = createChartsIIBuilderConfiguration(key, fixture);
    assert.equal(contract.ready, true, `${key} must accept its initial fields`);
    const derived = deriveChartsIIBuilderData(contract, fixture, settings);
    assert.equal(derived.status, 'ready', `${key}: ${JSON.stringify(derived.problems)}`);
    assert.equal(derived.chart?.chartType, chartType, `${key} chart type`);
  }
});

test('line variants and canonical-date Scatter share the same Builder contract', () => {
  for (const [key, expected] of [['line-multi','multiLine'],['line-wide','multiLine'],['scatter-date','scatter']]) {
    const result = deriveChartsIIBuilderData(createChartsIIBuilderConfiguration(key, fixture), fixture, settings);
    assert.equal(result.status, 'ready', key);
    assert.equal(result.chart.chartType, expected, key);
  }
});

test('calendar assignments preserve the source assertion precision', () => {
  const exact = canonicalRow(1711, 5);
  const month = canonicalRow(1711, 5, {}, 'month');
  assert.equal(chartsIIEligibleBin(exact, 'day').bin.label, '1711-01-05');
  assert.equal(chartsIIEligibleBin(month, 'day').excluded, 'insufficientPrecision');
  assert.equal(chartsIIEligibleBin(month, 'month').bin.label, '1711-01');
  assert.equal(chartsIIEligibleBin({}, 'year').excluded, 'missingDate');
});

test('narrowing chronology by supplying fewer rows never changes source records', () => {
  const before = JSON.stringify(fixture);
  const full = deriveChartsIITemporalSeries({rows: fixture, interval: 'year', measure: 'recordCount'});
  const narrowed = deriveChartsIITemporalSeries({rows: fixture.slice(0, 10), interval: 'year', measure: 'recordCount'});
  assert.equal(full.reporting.included, 20);
  assert.equal(narrowed.reporting.included, 10);
  assert.equal(narrowed.periods.length, 1);
  assert.equal(JSON.stringify(fixture), before);
});

test('wide temporal lines retain missing observations instead of assigning zero', () => {
  const derived = deriveChartsIIWideTemporalSeries({rows: fixture, interval:'year', fields:['PriceA','PriceB'],aggregation:'average'});
  assert.equal(derived.series.length, 2);
  assert.equal(derived.reporting.fields.PriceA.missingOrInvalid, 1);
  assert.equal(derived.reporting.fields.PriceB.missingOrInvalid, 1);
  assert.equal(derived.series[0].points[0].count, 51 / 9);
});

test('numerical and date-based Scatter retain record-level scope and precision', () => {
  const numeric = deriveChartsIIScatter(fixture, {xField:'PriceA',yField:'PriceB'});
  assert.equal(numeric.points.length, 18);
  assert.equal(numeric.reporting.excluded.missingX, 1);
  assert.equal(numeric.reporting.excluded.missingY, 1);
  const date = deriveChartsIIScatter([canonicalRow(1711,5,{PriceA:2}),canonicalRow(1711,5,{PriceA:3},'month')],
    {xField:'__canonicalDate__',yField:'PriceA'});
  assert.equal(date.points.length, 1);
  assert.equal(date.reporting.excluded.insufficientDatePrecision, 1);
});

test('Box Plot uses valid measurements, including genuine zero and negatives', () => {
  const derived = deriveChartsIIBoxPlot([{PriceA:-2},{PriceA:0},{PriceA:2},{PriceA:''}],
    {mode:'columns',fields:['PriceA']});
  assert.equal(derived.boxes[0].median, 0);
  assert.equal(derived.boxes[0].count, 3);
  assert.equal(derived.reporting.excluded.missingMeasure, 1);
});

test('Dot Plot keeps the highest aggregated category under a display limit', () => {
  const rows = [...Array.from({length:10},()=>({sourcePerson:'Frequent',PriceA:1})),
    {sourcePerson:'Rare',PriceA:100}];
  const result = deriveChartsIIDotPlot(rows,{mode:'category',measureField:'PriceA',categoryField:'sourcePerson',aggregation:'average',maxGroups:1,order:'value'});
  assert.deepEqual(result.points.map(point => point.label), ['Rare']);
  assert.equal(result.reporting.groupsOmitted, 1);
});

test('Dot Plot record count retains top frequency and a zero-based count', () => {
  const rows = [{sourcePerson:'A'},{sourcePerson:'A'},{sourcePerson:'B'}];
  const result = deriveChartsIIDotPlot(rows,{mode:'category',measureField:'recordCount',categoryField:'sourcePerson',maxGroups:1});
  assert.deepEqual(result.points.map(point=>[point.label,point.value]),[['A',2]]);
});

test('Slope Chart marks absent endpoints missing, never zero', () => {
  const rows = [canonicalRow(1711,1,{sourcePerson:'Ada'}),canonicalRow(1712,1,{sourcePerson:'Beatrice'})];
  const years = chartsIISlopePeriods(rows,'year');
  const slope = deriveChartsIISlope(rows,{categoryField:'sourcePerson',measureField:'recordCount',interval:'year',firstPeriod:years[0].start,secondPeriod:years[1].start});
  assert.equal(slope.series.length,2);
  assert.deepEqual(slope.series.find(s=>s.label==='Ada')?.after,null);
  assert.deepEqual(slope.series.find(s=>s.label==='Beatrice')?.before,null);
  assert.equal(slope.reporting.pairedGroups,0);
});

test('Treemap retains totals and omitted members of Other without inventing values', () => {
  const rows=[{sourcePerson:'A',targetPerson:'X'},{sourcePerson:'A',targetPerson:'X'},
    {sourcePerson:'B',targetPerson:'Y'},{sourcePerson:'C',targetPerson:'Z'}];
  const result=deriveChartsIITreemap(rows,{parentField:'sourcePerson',childField:'targetPerson',maxGroups:1});
  assert.equal(result.total,4);
  const other=result.parents.find(p=>p.other);
  assert.equal(other.value,2);
  assert.equal(other.members.length,2);
  assert.equal(result.reporting.includedRecords,4);
});

test('Stacked Area rejects negative layers and preserves aligned nonnegative totals', () => {
  const valid=stackChartsIIAreaSeries({periods:['A'],series:[{label:'first',points:[{label:'A',count:2}]},{label:'second',points:[{label:'A',count:3}]}]});
  assert.equal(valid.ready,true);
  assert.deepEqual(valid.totals,[5]);
  assert.equal(stackChartsIIAreaSeries({periods:['A'],series:[{points:[{label:'A',count:-1}]}]}).ready,false);
});

test('Builder validation preserves researcher selections when inventory refreshes', () => {
  const original=createChartsIIBuilderConfiguration('bar',fixture);
  const chosen=updateChartsIIBuilderConfiguration(original,'barGroupBy','targetPerson',fixture);
  const validated=validateChartsIIBuilderConfiguration('bar',chosen.values,getChartsIIBuilderFieldInventory(fixture.slice(0,8)));
  assert.equal(validated.values.barGroupBy,'targetPerson');
  assert.equal(validated.ready,true);
});

test('field inventory cache is shared by array identity without changing record content', () => {
  const first=getChartsIIBuilderFieldInventory(fixture);
  assert.strictEqual(first,getChartsIIBuilderFieldInventory(fixture));
  assert.notStrictEqual(first,getChartsIIBuilderFieldInventory([...fixture]));
});
