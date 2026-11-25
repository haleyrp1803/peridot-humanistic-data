import test from 'node:test';
import assert from 'node:assert/strict';
import { filterPeridotChartContributions as filter, nextPeridotChartContributionLimit as next, INITIAL_CHART_CONTRIBUTIONS } from './peridotChartContributionList.js';
const records = Array.from({ length: 1471 }, (_, index) => ({ id: `R-${index + 1}` }));
const label = row => row.id;
test('all contributions remain reachable in finite increments', () => {
  let visible = INITIAL_CHART_CONTRIBUTIONS;
  while (visible < records.length) visible = next(visible, records.length);
  assert.equal(visible, 1471);
  assert.equal(next(visible, records.length), 1471);
});
test('ID search spans all contributions, not only first 25 or 100', () => {
  assert.deepEqual(filter(records, 'R-1471', label), [{ id: 'R-1471' }]);
  assert.deepEqual(filter(records, 'r-10', label).map(row => row.id).slice(0, 3), ['R-10', 'R-100', 'R-101']);
});
test('search handles empty and unmatched values', () => {
  assert.equal(filter(records, '  ', label).length, records.length);
  assert.equal(filter(records, 'not-found', label).length, 0);
});
