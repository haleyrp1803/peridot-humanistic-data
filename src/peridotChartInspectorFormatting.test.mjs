import test from 'node:test';
import assert from 'node:assert/strict';
import { formatPeridotChartInspectorNumber as number, formatPeridotChartInspectorValue as value } from './peridotChartInspectorFormatting.js';

test('missing results are never rendered as numeric zero',()=>{
  for (const missing of [null, undefined, '', '  ']) assert.equal(number(missing),'Not observed');
  assert.equal(value(null,'records'),'Not observed');
});
test('actual zero is preserved, even when a period comparison has no difference',()=>{
  assert.equal(number(0),'0');
  assert.equal(value(0,'records'),'0 records');
});
test('record count singular and plural agree with the computed value',()=>{
  assert.equal(value(1,'records'),'1 record');
  assert.equal(value(2,'records'),'2 records');
  assert.equal(value(1471,'records'),'1,471 records');
});
test('numerical and textual statistics retain existing display semantics',()=>{
  assert.equal(number(1234.5),'1,234.5');
  assert.equal(number('not available'),'not available');
  assert.equal(value(3,'(period value)'),'3 (period value)');
});
