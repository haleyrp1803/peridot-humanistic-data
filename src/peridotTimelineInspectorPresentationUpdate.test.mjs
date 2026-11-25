import test from 'node:test';
import assert from 'node:assert/strict';
import { refreshSelectedTimelinePresentation } from './peridotTimelineInspectorPresentationUpdate.js';

const current = {
  kind: 'timeline-event', id: 'timeline-event:e1',
  event: { id: 'e1', row: { id: 1 }, inspectorVisualCategories: [] },
  row: { id: 1 },
};
test('category edits update only a currently selected matching Timeline mark', () => {
  const event = { id: 'e1', row: { id: 1 }, inspectorVisualCategories: [{ id: 'a', label: 'Test' }] };
  const result = refreshSelectedTimelinePresentation(current, event);
  assert.equal(result.kind, 'timeline-event');
  assert.equal(result.id, current.id);
  assert.deepEqual(result.event.inspectorVisualCategories, event.inspectorVisualCategories);
});
test('category edits cannot create a selection when Inspector has none', () => {
  assert.equal(refreshSelectedTimelinePresentation(null, { id: 'e1', row: {} }), null);
});
test('category edits never replace a different mark or non-Timeline selection', () => {
  const event = { id: 'e2', row: {} };
  assert.strictEqual(refreshSelectedTimelinePresentation(current, event), current);
  const network = { kind: 'node', id: 'n1' };
  assert.strictEqual(refreshSelectedTimelinePresentation(network, event), network);
});
test('category edits without source-row provenance leave selection untouched', () => {
  assert.strictEqual(refreshSelectedTimelinePresentation(current, { id: 'e1' }), current);
});
