import test from 'node:test';
import assert from 'node:assert/strict';
import { applyChartsIILocalFilters, getChartsIICategoryFilterOptions, countChartsIIActiveFilters, restrictChartsIILocalFiltersToSingleCategory } from './chartsIILocalFilters.js';

const records = Object.freeze([
  Object.freeze({ sourcePerson: 'A', Bank: 1, date: '1700-01-01' }),
  Object.freeze({ sourcePerson: 'B', Bank: 7, date: '1700-01-02' }),
  Object.freeze({ sourcePerson: 'A', Bank: 10, date: '1700-01-03' }),
  Object.freeze({ sourcePerson: 'C', Bank: '', date: '1700-01-04' }),
  Object.freeze({ sourcePerson: 'B', Bank: -2, date: '1700-01-05' }),
]);

test('No active rules preserve exact input array identity', () => {
  assert.equal(applyChartsIILocalFilters(records, []), records);
  assert.equal(applyChartsIILocalFilters(records, [{ type: 'number', field: 'Bank', min: '', max: '' }]), records);
  assert.equal(applyChartsIILocalFilters(records, [{ type: 'category', field: 'sourcePerson', values: [] }]), records);
});
test('Selected categorical values combine by OR', () => {
  const filtered = applyChartsIILocalFilters(records, [{ type: 'category', field: 'sourcePerson', values: ['A', 'C'] }]);
  assert.deepEqual(filtered.map(row => row.sourcePerson), ['A', 'A', 'C']);
});
test('Multiple rules combine by AND with inclusive numeric range', () => {
  const filtered = applyChartsIILocalFilters(records, [
    { type: 'category', field: 'sourcePerson', values: ['A', 'B'] },
    { type: 'number', field: 'Bank', min: '1', max: '7' },
  ]);
  assert.deepEqual(filtered.map(row => row.Bank), [1, 7]);
});
test('One-sided bounds retain zero and negative valid measurements', () => {
  assert.deepEqual(applyChartsIILocalFilters(records, [{ type: 'number', field: 'Bank', max: '0' }]).map(row => row.Bank), [-2]);
});
test('Missing and invalid numerical measurements are not treated as zero', () => {
  const filtered = applyChartsIILocalFilters(records, [{ type: 'number', field: 'Bank', min: '0' }]);
  assert.deepEqual(filtered.map(row => row.Bank), [1,7,10]);
});
test('Rule filtering preserves original rows and original Explore array', () => {
  const subset = applyChartsIILocalFilters(records, [{ type: 'category', field: 'sourcePerson', values: ['B'] }]);
  assert.equal(records.length, 5);
  assert.equal(subset[0], records[1]);
  assert.equal(Object.isFrozen(records[1]), true);
});
test('Category options count values without changing source order', () => {
  assert.deepEqual(getChartsIICategoryFilterOptions(records, 'sourcePerson'), [
    { value: 'A', count: 2 }, { value: 'B', count: 2 }, { value: 'C', count: 1 },
  ]);
});
test('Only active rules count toward applied filter count', () => {
  assert.equal(countChartsIIActiveFilters([
    {type:'category',field:'sourcePerson',values:[]},
    {type:'number',field:'Bank',min:'2',max:''},
    {type:'category',field:'sourcePerson',values:['A']},
  ]), 2);
});

test('Filtering precedes chart derivation and does not change the stable field inventory', async () => {
  const { createChartsIIBuilderConfiguration, deriveChartsIIBuilderData, getChartsIIBuilderFieldInventory } = await import('./chartsIIBuilderContract.js');
  const source = [
    { sourcePerson: 'A', targetPerson: 'X', Bank: 4 },
    { sourcePerson: 'A', targetPerson: 'Y', Bank: 8 },
    { sourcePerson: 'B', targetPerson: 'X', Bank: 12 },
  ];
  const inventory = getChartsIIBuilderFieldInventory(source);
  const contract = createChartsIIBuilderConfiguration('bar', source);
  const subset = applyChartsIILocalFilters(source, [{ type: 'category', field: 'sourcePerson', values: ['A'] }]);
  const result = deriveChartsIIBuilderData(contract, subset, { profileRows: subset, topN: 10 });
  assert.equal(result.status, 'ready');
  assert.equal(inventory.barGroupOptions.some(field => field.key === 'sourcePerson'), true);
  assert.equal(source.length, 3);
  assert.equal(subset.length, 2);
});

test('A real measured zero and categorical zero remain filterable, not missing', () => {
  const zeroRows = [{ Group: '0', Price: 0 }, { Group: 'A', Price: 10 }];
  assert.deepEqual(applyChartsIILocalFilters(zeroRows, [{type:'number',field:'Price',min:'0',max:'0'}]), [zeroRows[0]]);
  assert.deepEqual(applyChartsIILocalFilters(zeroRows, [{type:'category',field:'Group',values:['0']}]), [zeroRows[0]]);
});

test('Single-series categorical selection restricts each category rule but preserves numerical and other rules', () => {
  const rules = [
    { id: 'a', type: 'category', field: 'sourcePerson', values: ['A', 'B'] },
    { id: 'b', type: 'number', field: 'Bank', min: '1', max: '7' },
  ];
  const adjusted = restrictChartsIILocalFiltersToSingleCategory(rules);
  assert.deepEqual(adjusted[0].values, ['A']);
  assert.equal(adjusted[1], rules[1]);
  assert.deepEqual(rules[0].values, ['A', 'B']);
  assert.deepEqual(applyChartsIILocalFilters(records, adjusted).map(row => row.Bank), [1]);
  assert.deepEqual(applyChartsIILocalFilters(records, rules).map(row => row.Bank), [1,7]);
});
