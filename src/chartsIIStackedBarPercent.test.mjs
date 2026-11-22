import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeChartsIIStackedBars } from './chartsIIStackedBarPercent.js';

test('normalizes each category independently and preserves underlying values', () => {
  const input = [{label:'A', total: 10, segments:[{label:'x',count:2},{label:'y',count:8}]},
    {label:'B', total:100, segments:[{label:'x',count:50},{label:'y',count:50}]}];
  const original = structuredClone(input);
  const result=normalizeChartsIIStackedBars(input);
  assert.equal(result.invalid,false);
  assert.deepEqual(result.rows.map(row=>row.segments.map(s=>s.percent)), [[20,80],[50,50]]);
  assert.deepEqual(input,original);
});
test('zero-total group remains empty, not fabricated', () => {
 const result=normalizeChartsIIStackedBars([{label:'empty',total:0,segments:[{label:'x',count:0},{label:'y',count:0}]}]);
 assert.equal(result.invalid,false);
 assert.equal(result.rows[0].total,0);
 assert.deepEqual(result.rows[0].segments.map(s=>s.percent),[0,0]);
});
test('rejects signed or invalid segment magnitudes for 100% presentation',()=>{
 assert.equal(normalizeChartsIIStackedBars([{label:'negative',segments:[{label:'x',count:-3}]}]).invalid,true);
 assert.equal(normalizeChartsIIStackedBars([{label:'invalid',segments:[{label:'x',count:'not-a-number'}]}]).invalid,true);
});
test('fractional values and Other segments remain included in normalization',()=>{
 const result=normalizeChartsIIStackedBars([{label:'A',segments:[{label:'x',count:0.25},{label:'Other',count:0.75}]}]);
 assert.deepEqual(result.rows[0].segments.map(s=>s.percent),[25,75]);
});
