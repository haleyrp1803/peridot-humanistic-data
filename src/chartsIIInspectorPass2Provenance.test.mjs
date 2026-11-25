import test from 'node:test';
import assert from 'node:assert/strict';
import { deriveChartsIITemporalSeries } from './chartsIITemporalAggregation.js';
import { deriveChartsIIWideTemporalSeries } from './chartsIIWideTemporalSeries.js';
import { deriveChartsIIScatter } from './chartsIIScatterData.js';
import { buildHeatmapChartData, buildHistogramChartData } from './analyticsDerivationHelpers.js';
import { stackChartsIIAreaSeries } from './chartsIIBuilderContract.js';

const dateRow = (year, day, fields={}) => ({
  ...fields, temporalAssertions: [{ role:'Date', start:{year,month:1,day}, end:{year,month:1,day},
    sortBounds: {start: year*10000+100+day, end: year*10000+100+day}, visualizationUsability:{timelinePositionable:true} }]
});
const a=dateRow(1711,3,{id:'a',kind:'X',Value:10,PriceA:2,PriceB:8});
const b=dateRow(1711,4,{id:'b',kind:'X',Value:20,PriceA:null,PriceB:10});
const c=dateRow(1712,5,{id:'c',kind:'Y',Value:'not a number',PriceA:4,PriceB:12});
const fixtures=[a,b,c];

test('temporal count retains exact source rows in each calendar bin',()=>{
 const result=deriveChartsIITemporalSeries({rows:fixtures,interval:'year',measure:'recordCount'});
 assert.deepEqual(result.data.map(p=>p.count),[2,1]);
 assert.deepEqual(result.data.map(p=>p.contributingRows),[[a,b],[c]]);
});
test('temporal numeric average excludes invalid observations and retains valid row identity',()=>{
 const result=deriveChartsIITemporalSeries({rows:fixtures,interval:'year',measure:'Value',aggregation:'average'});
 assert.equal(result.data[0].count,15);
 assert.deepEqual(result.data[0].contributingRows,[a,b]);
 assert.equal(result.data.length,1); // invalid-only calendar bin has no valid numeric observation
});
test('grouped temporal Other rows remain scoped to actual omitted series and calendar bin',()=>{
 const result=deriveChartsIITemporalSeries({rows:fixtures,interval:'year',measure:'recordCount',groupBy:'kind',topN:1});
 const other=result.series.find(s=>s.label==='Other');
 assert.deepEqual(other.points.map(p=>p.contributingRows),[[],[c]]);
 assert.deepEqual(other.points.map(p=>p.count),[null,1]);
});
test('wide numerical series preserve per-column missingness and source records',()=>{
 const result=deriveChartsIIWideTemporalSeries({rows:fixtures,interval:'year',fields:['PriceA','PriceB'],aggregation:'average'});
 const first=result.series.find(s=>s.label==='PriceA').points[0];
 assert.equal(first.count,2);
 assert.deepEqual(first.contributingRows,[a]);
 assert.deepEqual(result.series.find(s=>s.label==='PriceB').points[0].contributingRows,[a,b]);
});
test('stacked area carries each contributing subset into its layer without recalc',()=>{
 const derived=deriveChartsIITemporalSeries({rows:fixtures,interval:'year',measure:'recordCount',groupBy:'kind'});
 const stacked=stackChartsIIAreaSeries({periods:derived.periods,series:derived.series});
 assert.equal(stacked.ready,true);
 assert.deepEqual(stacked.series.find(s=>s.label==='X').points[0].contributingRows,[a,b]);
});
test('scatter/bubble selected point refers to original record and measurements',()=>{
 const derived=deriveChartsIIScatter(fixtures,{xField:'PriceA',yField:'PriceB',sizeField:'Value'});
 assert.equal(derived.points.length,1);
 assert.deepEqual(derived.points[0].contributingRows,[a]);
 assert.equal(derived.points[0].x,2);
 assert.equal(derived.points[0].y,8);
});
test('heatmap cell retains source rows for one mapped row-column pair',()=>{
 const rows=[{id:'1',kind:'X',dest:'Y'},{id:'2',kind:'X',dest:'Y'},{id:'3',kind:'X',dest:'Z'}];
 const result=buildHeatmapChartData(rows,'kind','dest',10,'recordCount');
 const selected=result.cells.find(c=>c.rowLabel==='X' && c.columnLabel==='Y');
 assert.equal(selected.count,2);
 assert.deepEqual(selected.contributingRows,rows.slice(0,2));
});
test('numeric histogram retains only records whose numerical values fall in each bin',()=>{
 const rows=[{value:1},{value:2},{value:3},{value:'missing'},{value:4}];
 const data=buildHistogramChartData(rows,'value');
 assert.equal(data.reduce((sum,bin)=>sum+bin.count,0),4);
 assert.equal(data.reduce((sum,bin)=>sum+bin.contributingRows.length,0),4);
 assert.equal(data.reduce((sum,bin)=>sum+bin.observationCount,0),4);
});
test('count histogram bins source categories, not one observation per source record',()=>{
 const rows=[{sourcePerson:'X'},{sourcePerson:'X'},{sourcePerson:'Y'}];
 const data=buildHistogramChartData(rows,'recordCount','sourcePerson');
 assert.equal(data.reduce((sum,bin)=>sum+bin.count,0),2); // 2 categories, not 3 records
 assert.equal(data.reduce((sum,bin)=>sum+bin.contributingRows.length,0),3);
 assert.equal(data.reduce((sum,bin)=>sum+bin.contributingCategoryLabels.length,0),2);
});
