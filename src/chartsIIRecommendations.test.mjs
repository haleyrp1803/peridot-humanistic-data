/* B4.3 — Catalogue suitability evidence tests. */
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { buildChartsIIDataProfile, assessChartsIISuitability, isChartsIIGeographicCoordinateField } from './chartsIIDataProfile.js';

const charts = ['scatter','slope','heatmap','bar','histogram','box'].map(key => ({ key, name: key }));
const status = (rows,key) => assessChartsIISuitability(buildChartsIIDataProfile(rows),charts).find(c=>c.key===key);
const dated = (year, day, fields={}) => ({...fields,temporalAssertions:[{
  role:'Date',start:{year,month:1,day},end:{year,month:1,day},
  sortBounds:{start:year*10000+100+day,end:year*10000+100+day},
  visualizationUsability:{timelinePositionable:true},
}]});

test('unpaired numerical columns are not promoted to Likely fit Scatter',()=>{
  const rows=[...Array.from({length:10},(_,i)=>({PriceA:i+1,PriceB:''})),
    ...Array.from({length:10},(_,i)=>({PriceA:'',PriceB:i+1}))];
  const p=buildChartsIIDataProfile(rows);
  assert.equal(p.pairedNumericalRecords,0);
  assert.equal(status(rows,'scatter').suitability,'neutral');
});

test('paired numerical fields support Scatter recommendation',()=>{
  const rows=Array.from({length:12},(_,i)=>({PriceA:i+1,PriceB:i*2+3}));
  assert.equal(status(rows,'scatter').suitability,'likely');
});

test('date-versus-numeric Scatter requires same-record exact-day measurements',()=>{
  const noOverlap=[...Array.from({length:7},(_,i)=>dated(1711,i+1,{PriceA:''})),
    ...Array.from({length:7},(_,i)=>({PriceA:i+1}))];
  assert.equal(status(noOverlap,'scatter').suitability,'neutral');
  const overlap=Array.from({length:7},(_,i)=>dated(1711,i+1,{PriceA:i+1}));
  assert.equal(status(overlap,'scatter').suitability,'likely');
});

test('Slope requires two actual canonical periods, not merely a date-like field',()=>{
  const one=Array.from({length:10},(_,i)=>dated(1711,i+1,{sourcePerson:'A',PriceA:i+1}));
  assert.notEqual(status(one,'slope').suitability,'likely');
  const two=[...one,...Array.from({length:10},(_,i)=>dated(1712,i+1,{sourcePerson:'A',PriceA:i+1}))];
  assert.equal(status(two,'slope').suitability,'likely');
});

test('numeric zero values count as valid numerical measurements',()=>{
  const rows=Array.from({length:12},()=>({PriceA:0,PriceB:0}));
  const profile=buildChartsIIDataProfile(rows);
  assert.equal(profile.numericObservations,12);
  assert.equal(profile.pairedNumericalRecords,12);
});

test('catalogue remains fully selectable and empty data gets no badges',()=>{
  const outcomes=assessChartsIISuitability(buildChartsIIDataProfile([]),charts);
  assert.equal(outcomes.length,charts.length);
  assert.ok(outcomes.every(c=>c.suitability==='neutral'));
});


test('mapped latitude/longitude pairs never promote numerical chart recommendations',()=>{
  const rows=Array.from({length:20},(_,i)=>dated(1610,i+1,{
    sourcePerson:i%2?'A':'B',targetPerson:'C',sourceLoc:'Siena',targetLoc:'Florence',
    pointLat:43+i/100,pointLon:11+i/100,sourceLon:11+i/100,targetLon:12+i/100,
  }));
  const p=buildChartsIIDataProfile(rows);
  assert.equal(p.pairedNumericalRecords,0);
  assert.equal(p.numericObservations,0);
  assert.equal(p.usefulNumerics,0);
  assert.equal(p.exactDateNumericRecords,0);
  assert.equal(status(rows,'scatter').suitability,'poor');
  assert.notEqual(status(rows,'histogram').suitability,'likely');
  assert.notEqual(status(rows,'box').suitability,'likely');
  assert.equal(status(rows,'bar').suitability,'likely');
  assert.ok(p.numericFields.some(f=>f.key==='pointLat'));
  assert.ok(p.numericFields.some(f=>f.key==='pointLon'));
  assert.ok(!p.labels.numeric.some(n=>/lat|lon/i.test(n)));
});

test('coordinate fields remain selectable but cannot form a recommended numeric pair with a genuine measure',()=>{
  const rows=Array.from({length:12},(_,i)=>({Price:i+1,pointLat:43+i/100,pointLon:11+i/100}));
  const p=buildChartsIIDataProfile(rows);
  assert.equal(p.usefulNumerics,1);
  assert.equal(p.pairedNumericalRecords,0);
  assert.equal(status(rows,'scatter').suitability,'neutral');
  assert.ok(p.numericFields.some(f=>f.key==='pointLon'));
  assert.equal(status(rows,'histogram').suitability,'likely');
});

test('genuine paired numerical measurements still recommend Scatter even alongside coordinates',()=>{
  const rows=Array.from({length:12},(_,i)=>({PriceA:i+1,PriceB:2*i+1,pointLat:43+i/100,pointLon:11+i/100}));
  const p=buildChartsIIDataProfile(rows);
  assert.equal(p.usefulNumerics,2);
  assert.equal(p.pairedNumericalRecords,12);
  assert.equal(status(rows,'scatter').suitability,'likely');
});

test('coordinate detection recognizes mapped aliases without suppressing ordinary numeric fields',()=>{
  for (const key of ['pointLat','pointLon','sourceLat','sourceLon','targetLat','targetLon','Point Latitude','Target_Inferred_Longitude','Latitude','Long']) {
    assert.ok(isChartsIIGeographicCoordinateField({key}),key);
  }
  for (const key of ['Population','Price','PlatitudeScore','LatitudeAdjustedPrice','Length','LoanValue']) {
    assert.ok(!isChartsIIGeographicCoordinateField({key}),key);
  }
});
