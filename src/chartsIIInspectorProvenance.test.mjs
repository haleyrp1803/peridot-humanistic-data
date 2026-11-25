import test from 'node:test';
import assert from 'node:assert/strict';
import { buildBarChartData, buildPartToWholeChartData, buildGroupedBarChartData, buildStackedBarChartData, buildAnalyticsChartData } from './analyticsDerivationHelpers.js';

const rows = [
  { category:'A', segment:'X', measure:10 },
  { category:'A', segment:'Y', measure:5 },
  { category:'B', segment:'X', measure:2 },
  { category:'B', segment:'Y', measure:'invalid' },
  { category:'C', segment:'Y', measure:7 },
  { category:'', segment:'X', measure:9 },
];
const by = (result, label) => result.find(item=>item.label===label);

test('bar count retains the exact rows used for each group, without changing values',()=>{
  const result=buildBarChartData(rows,'category',10,'recordCount','count');
  assert.equal(by(result,'A').count,2);
  assert.deepEqual(by(result,'A').contributingRows,[rows[0],rows[1]]);
  assert.equal(by(result,'B').count,2);
});
test('numeric bar averages retain only numeric observations, not excluded invalid values',()=>{
  const result=buildBarChartData(rows,'category',10,'measure','average');
  assert.equal(by(result,'B').count,2);
  assert.deepEqual(by(result,'B').contributingRows,[rows[2]]);
});
test('bar Other and Dataset total retain the source groups represented by the calculation',()=>{
  const result=buildBarChartData(rows,'category',1,'recordCount','count');
  const other=result.find(item=>item.label==='Other');
  assert.equal(other.count,3);
  assert.deepEqual(other.contributingRows,[rows[2],rows[3],rows[4]]);
});
test('pie retains additive measurements and excludes invalid numeric values',()=>{
  const result=buildPartToWholeChartData(rows,'category',10,'measure');
  assert.equal(by(result,'A').count,15);
  assert.deepEqual(by(result,'B').contributingRows,[rows[2]]);
});
test('grouped bars retain per-cell record identity independently of reported totals',()=>{
  const result=buildGroupedBarChartData(rows,'category','segment',10,'recordCount','count');
  const group=result.data.find(row=>row.label==='A').groups.find(group=>group.label==='X');
  assert.equal(group.count,1);
  assert.deepEqual(group.contributingRows,[rows[0]]);
});
test('stacked segments retain source rows contributing to each segment',()=>{
  const result=buildStackedBarChartData(rows,'category','segment',10,'measure','sum');
  const segment=result.data.find(row=>row.label==='B').segments.find(item=>item.label==='Y');
  assert.equal(segment.count,0);
  assert.deepEqual(segment.contributingRows,[]);
});
test('original analytics chart results still expose the expected numerical values',()=>{
  const chart=buildAnalyticsChartData({ rows,chartType:'pie',pieGroupBy:'category',yField:'measure',topN:10 });
  assert.equal(by(chart.data,'A').count,15);
  assert.equal(by(chart.data,'C').count,7);
});
