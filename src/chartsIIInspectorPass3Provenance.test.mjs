import test from 'node:test';
import assert from 'node:assert/strict';
import { deriveChartsIIBoxPlot } from './chartsIIBoxPlotData.js';
import { deriveChartsIIDotPlot } from './chartsIIDotPlotData.js';
import { deriveChartsIISlope, chartsIISlopePeriods } from './chartsIISlopeData.js';
import { deriveChartsIITreemap } from './chartsIITreemapData.js';
import { buildSunburstChartData } from './analyticsDerivationHelpers.js';

const dates = (year,fields={})=>({ ...fields, temporalAssertions:[{
  role:'Date',start:{year,month:1,day:1},end:{year,month:1,day:1},
  sortBounds:{start:year*10000+101,end:year*10000+101},visualizationUsability:{timelinePositionable:true}
}] });

test('Box Plot preserves valid measurement rows for quartiles, not invalid or missing rows',()=>{
 const rows=[{n:1,id:'a'},{n:2,id:'b'},{n:3,id:'c'},{n:100,id:'outlier'},{n:'',id:'blank'},{n:'n/a',id:'invalid'}];
 const box=deriveChartsIIBoxPlot(rows,{mode:'columns',fields:['n']}).boxes[0];
 assert.equal(box.count,4);
 assert.deepEqual(box.contributingRows,rows.slice(0,4));
 assert.equal(box.outlierDetails[0].contributingRow,rows[3]);
 assert.equal(box.outlierDetails[0].value,100);
});
test('Box Plot column mode counts separate field observations independently',()=>{
 const rows=[{a:1,b:2},{a:'',b:3}];
 const boxes=deriveChartsIIBoxPlot(rows,{mode:'columns',fields:['a','b']}).boxes;
 assert.deepEqual(boxes.map(box=>box.contributingRows.length),[1,2]);
});
test('Dot Plot retains source rows behind numerical averages and count aggregates',()=>{
 const rows=[{category:'A',v:2},{category:'A',v:'missing'},{category:'A',v:6},{category:'B',v:10}];
 const numerical=deriveChartsIIDotPlot(rows,{categoryField:'category',measureField:'v',aggregation:'average'});
 const selected=numerical.points.find(p=>p.label==='A');
 assert.equal(selected.value,4);assert.deepEqual(selected.contributingRows,[rows[0],rows[2]]);
 const count=deriveChartsIIDotPlot(rows,{categoryField:'category',measureField:'recordCount'});
 assert.equal(count.points.find(p=>p.label==='A').value,3);
 assert.deepEqual(count.points.find(p=>p.label==='A').contributingRows,rows.slice(0,3));
});
test('Slope Chart retains each period separately and preserves absent endpoint as missing',()=>{
 const rows=[dates(1618,{category:'A',v:2}),dates(1618,{category:'B',v:3}),dates(1619,{category:'A',v:4}),dates(1619,{category:'A',v:'missing'})];
 const periods=chartsIISlopePeriods(rows,'year');
 const result=deriveChartsIISlope(rows,{categoryField:'category',measureField:'v',interval:'year',firstPeriod:periods[0].start,secondPeriod:periods[1].start});
 const a=result.series.find(s=>s.label==='A'),b=result.series.find(s=>s.label==='B');
 assert.deepEqual(a.contributingRowsBefore,[rows[0]]);assert.deepEqual(a.contributingRowsAfter,[rows[2]]);
 assert.equal(a.delta,2);assert.deepEqual(b.contributingRowsAfter,[]);assert.equal(b.delta,null);
});
test('Slope Chart column mode preserves record once per valid field per period',()=>{
 const rows=[dates(1618,{a:2,b:3}),dates(1619,{a:4,b:null})];
 const periods=chartsIISlopePeriods(rows,'year');
 const result=deriveChartsIISlope(rows,{mode:'columns',fields:['a','b'],interval:'year',firstPeriod:periods[0].start,secondPeriod:periods[1].start});
 assert.deepEqual(result.series.find(s=>s.label==='b').contributingRows,[rows[0]]);
});
test('Treemap preserves exact child and parent contributors, including consolidated Other',()=>{
 const rows=[{p:'A',c:'X'},{p:'A',c:'Y'},{p:'B',c:'Z'},{p:'C',c:'W'}];
 const chart=deriveChartsIITreemap(rows,{parentField:'p',childField:'c',maxGroups:1});
 const main=chart.parents.find(p=>p.label==='A');
 assert.deepEqual(main.contributingRows,rows.slice(0,2));
 const omittedParent=chart.parents.find(p=>p.other);
 assert.equal(omittedParent.value,2);assert.deepEqual(omittedParent.contributingRows,rows.slice(2));
 const childOther=main.children.find(c=>c.other);
 assert.equal(childOther.contributingRows.length,1);
});
test('Treemap numeric sums exclude invalid and negative contributions',()=>{
 const rows=[{p:'A',n:4},{p:'A',n:0},{p:'A',n:-4},{p:'B',n:2},{p:'B',n:'none'}];
 const result=deriveChartsIITreemap(rows,{parentField:'p',measureField:'n'});
 assert.deepEqual(result.parents.find(p=>p.label==='A').contributingRows,[rows[0]]);
 assert.deepEqual(result.parents.find(p=>p.label==='B').contributingRows,[rows[3]]);
});
test('Sunburst keeps exact nested contributors and omitted parent-child shares',()=>{
 const rows=[{sourcePerson:'A',targetPerson:'X'},{sourcePerson:'A',targetPerson:'Y'},
  {sourcePerson:'B',targetPerson:'Z'},{sourcePerson:'C',targetPerson:'W'}];
 const chart=buildSunburstChartData(rows,'sourcePerson','targetPerson',1,'recordCount');
 const main=chart.parents.find(p=>p.label==='A');
 assert.deepEqual(main.contributingRows,rows.slice(0,2));
 assert.equal(main.children.length,2);
 const childOther=main.children.find(c=>c.label!=='X' && c.label!=='Y');
 assert.equal(childOther?.contributingRows.length,1);
 const other=chart.parents.find(p=>p.label!=='A');
 assert.deepEqual(other.contributingRows,rows.slice(2));
 assert.deepEqual(other.children[0].contributingRows,rows.slice(2));
});
test('Sunburst numeric sums retain only eligible numeric observations',()=>{
 const rows=[{sourcePerson:'A',targetPerson:'X',v:3},{sourcePerson:'A',targetPerson:'X',v:''},{sourcePerson:'A',targetPerson:'X',v:5}];
 const chart=buildSunburstChartData(rows,'sourcePerson','targetPerson',10,'v');
 assert.equal(chart.total,8);assert.deepEqual(chart.parents[0].contributingRows,[rows[0],rows[2]]);
});
