import test from 'node:test';
import assert from 'node:assert/strict';
import {CHART_STYLE_CONTROLS,CHART_STYLE_FIELDS,chartStyleDefault,chartStyleOptions,chartStyleValue,updateChartStyle} from './chartsIIStyle.js';

test('every chart family has only declared visual controls',()=>{
  assert.equal(Object.keys(CHART_STYLE_CONTROLS).length,16);
  for(const [family,keys] of Object.entries(CHART_STYLE_CONTROLS)){
    assert.ok(keys.length,`${family} offers presentation controls`);
    assert.deepEqual(chartStyleOptions(family),keys);
    for(const key of keys) assert.ok(CHART_STYLE_FIELDS[key],`${family} ${key}`);
  }
  assert.deepEqual(chartStyleOptions('unknown'),[]);
});
test('unchanged appearance uses original chart-specific visual defaults',()=>{
  assert.equal(chartStyleDefault('line','lineWidth'),4);
  assert.equal(chartStyleDefault('multiLine','lineWidth'),3);
  assert.equal(chartStyleDefault('groupedBar','cornerRadius'),3);
  assert.equal(chartStyleDefault('stackedBar','markOpacity'),1);
  assert.equal(chartStyleDefault('treemap','tileGap'),2);
});
test('changing styling is non-mutating and resets on chart-specific default',()=>{
  const input=Object.freeze({lineWidth:5});
  const changed=updateChartStyle(input,'pointSize',9,'line');
  assert.deepEqual(input,{lineWidth:5});
  assert.deepEqual(changed,{lineWidth:5,pointSize:9});
  const reset=updateChartStyle(changed,'lineWidth',4,'line');
  assert.deepEqual(reset,{pointSize:9});
});
test('numeric controls are constrained and invalid values cannot change style',()=>{
  assert.equal(chartStyleValue({lineWidth:100},'lineWidth',3),6);
  assert.equal(chartStyleValue({pointScale:-2},'pointScale',1),0.5);
  assert.equal(chartStyleValue({lineWidth:'nonsense'},'lineWidth',3),3);
  assert.equal(chartStyleValue({showMarkers:false},'showMarkers',true),false);
  assert.equal(updateChartStyle({},'madeUp',5).madeUp,undefined);
});
test('presentation control contract does not expose analytical dimensions or filters',()=>{
  const controls=Object.values(CHART_STYLE_CONTROLS).flat();
  for(const name of ['aggregation','categoryField','measureField','dateInterval','filters','records']) {
    assert.equal(controls.includes(name),false);
  }
});
