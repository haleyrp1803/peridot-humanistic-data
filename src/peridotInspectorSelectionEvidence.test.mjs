import assert from 'node:assert/strict';
import test from 'node:test';
import { buildPeridotInspectorSelectionEvidence as interpret } from './peridotInspectorSelectionEvidence.js';

const selection = (kind, props, viewMode = 'geographic', relatedRows = []) => interpret({ selectedKind: kind, selectedProps: props, viewMode, relatedRows });

test('geographic mark separates supporting rows from broader entity rows', () => {
  const atSusa = { id: 'r1', date: '1629/05/05' };
  const other = { id: 'r2', date: '1629/06/01' };
  const result = selection('node', {
    label: 'Guiscardi, Traiano', anchorLabel: 'Susa', anchorReasons: [{ type: 'place-role', role: 'Letter sent from' }],
    anchorSourceRowsForMark: [atSusa],
  }, 'geographic', [atSusa, other]);
  assert.equal(result.representation.markType, 'geographic-entity-anchor');
  assert.equal(result.support.scope, 'selected-mark');
  assert.deepEqual(result.support.records, [atSusa]);
  assert.equal(result.context.recordCount, 2);
  assert.equal(result.support.assertions[0].label, 'Letter sent from');
});

test('most frequent place is explicitly a derived rule', () => {
  const result = selection('node', { anchorLabel: 'Susa', anchorReasons: [{ type: 'most-frequent-place', tied: true }], anchorSourceRowsForMark: [{ id: 'r1' }] });
  assert.equal(result.support.assertions[0].origin, 'peridot-calculation');
  assert.equal(result.support.assertions[0].tied, true);
});

test('network entity cannot promote broad entity records into mark evidence', () => {
  const result = selection('node', { label: 'Maria Magdalena' }, 'person', [{ id: 'r1' }]);
  assert.equal(result.support.status, 'not-provided');
  assert.equal(result.support.recordCount, null);
  assert.equal(result.context.recordCount, 1);
});

test('cluster counts visual nodes, never distinct source rows', () => {
  const result = selection('cluster', { memberCount: 3, memberDetails: [{ label: 'X' }, { label: 'Y' }, { label: 'Z' }] });
  assert.equal(result.representation.details[0].unit, 'visual nodes');
  assert.equal(result.support.status, 'members-only');
  assert.equal(result.support.recordCount, null);
});

test('edge provenance is mark scoped but distinct from relationship occurrence weight', () => {
  const result = selection('edge', { sourceLabel: 'A', targetLabel: 'B', count: 5, letterMetadata: [{ id: 'r1' }] });
  assert.equal(result.representation.details.find((entry) => entry.kind === 'weight').value, 5);
  assert.equal(result.support.recordCount, 1);
});

test('timeline event retains mapped role, original date and subject', () => {
  const result = selection('timeline-event', { event: { temporalKind: 'interval', temporalRole: 'Lifespan', sourceText: '1572–1613', subject: { label: 'Sigismund Báthory' }, row: { id: 'r1' } } });
  assert.equal(result.representation.markType, 'temporal-period');
  assert.equal(result.representation.details.find((entry) => entry.kind === 'subject').value, 'Sigismund Báthory');
  assert.equal(result.support.recordCount, 1);
});

test('chart marks remain unverified without an explicit contribution contract', () => {
  const result = selection('chart-mark', { label: 'Category', value: 42 }, '', [{ id: 'r1' }]);
  assert.equal(result.support.status, 'not-provided');
  assert.equal(result.context.recordCount, 1);
});

test('chart aggregate retains mark-level source rows and does not confuse value with record count', () => {
  const source = [{ id: 'r1', measure: 12 }, { id: 'r2', measure: 3 }];
  const result = selection('chart-mark', {
    label: 'Group A', value: 15, chartType: 'pie',
    contributingRows: source,
    calculation: { measureField: 'measure', aggregation: 'sum', groupField: 'category' },
  }, '', [{ id: 'unrelated' }]);
  assert.equal(result.representation.markType, 'analytical-chart-mark');
  assert.equal(result.support.status, 'verified');
  assert.equal(result.support.recordCount, 2);
  assert.deepEqual(result.support.records, source);
  assert.equal(result.representation.details.find(entry => entry.kind === 'aggregate-value').value, 15);
  assert.equal(result.context.recordCount, 1);
});

test('chart aggregate cannot become verified merely by carrying a list without its calculation', () => {
  const result = selection('chart-mark', { label:'A', value:42, contributingRows: [{ id:'r1' }] });
  assert.equal(result.support.status, 'not-provided');
});

test('empty geographic mark still has verified zero supporting rows rather than borrowing related rows', () => {
  const result = selection('node', { anchorLabel: 'Oradea', anchorSourceRowsForMark: [], anchorReasons: [] }, 'geographic', [{ id: 'r1' }]);
  assert.equal(result.support.status, 'verified');
  assert.equal(result.support.recordCount, 0);
});

test('network node uses only displayed incident edges and deduplicates supporting records', async () => {
  const { collectPeridotNetworkNodeMarkEvidence } = await import('./peridotInspectorSelectionEvidence.js');
  const shared = { id: 'r1' };
  const other = { id: 'r2' };
  const unrelated = { id: 'r3' };
  const graph = {
    nodes: [{ id: 'A' }, { id: 'B' }, { id: 'C' }],
    edges: [
      { id: 'e1', sourceNodeId: 'A', targetNodeId: 'B', count: 3, letterMetadata: [shared, other], sourceLabel: 'A', targetLabel: 'B' },
      { id: 'e2', sourceNodeId: 'B', targetNodeId: 'A', count: 1, rows: [shared], sourceLabel: 'B', targetLabel: 'A' },
      { id: 'e3', sourceNodeId: 'B', targetNodeId: 'C', count: 9, rows: [unrelated], sourceLabel: 'B', targetLabel: 'C' },
    ],
  };
  const provenance = collectPeridotNetworkNodeMarkEvidence(graph, 'A');
  assert.equal(provenance.edgeCount, 2);
  assert.equal(provenance.representedWeight, 4);
  assert.deepEqual(provenance.records, [shared, other]);
  assert.equal(provenance.complete, true);
  const contract = selection('node', { label: 'A', networkMarkEvidence: provenance }, 'person', [shared, other, unrelated]);
  assert.equal(contract.representation.markType, 'network-entity-node');
  assert.equal(contract.support.recordCount, 2);
  assert.equal(contract.context.recordCount, 3);
  assert.equal(contract.support.assertions.length, 2);
});

test('network node never infers incident edge membership from a matching name alone', async () => {
  const { collectPeridotNetworkNodeMarkEvidence } = await import('./peridotInspectorSelectionEvidence.js');
  const evidence = collectPeridotNetworkNodeMarkEvidence({
    nodes: [{ id: 'A', label: 'Duplicated' }, { id: 'B', label: 'Duplicated' }],
    edges: [{ sourceNodeId: 'B', targetNodeId: 'B', sourceLabel: 'Duplicated', targetLabel: 'Duplicated', count: 2, rows: [{ id: 'r2' }] }],
  }, 'A');
  assert.equal(evidence.edgeCount, 0);
  assert.deepEqual(evidence.records, []);
});

test('partial network edge provenance cannot claim complete supporting record count', async () => {
  const { collectPeridotNetworkNodeMarkEvidence } = await import('./peridotInspectorSelectionEvidence.js');
  const evidence = collectPeridotNetworkNodeMarkEvidence({
    nodes: [{ id: 'A' }],
    edges: [{ sourceNodeId: 'A', targetNodeId: 'B', count: 2 }],
  }, 'A');
  assert.equal(evidence.complete, false);
  const contract = selection('node', { label: 'A', networkMarkEvidence: evidence }, 'person');
  assert.equal(contract.support.status, 'partial');
  assert.equal(contract.support.recordCount, null);
});

test('edge with positive weight but empty row list does not claim verified zero records', () => {
  const contract = selection('edge', { sourceLabel: 'A', targetLabel: 'B', count: 4, letterMetadata: [] }, 'person');
  assert.equal(contract.support.status, 'not-provided');
  assert.equal(contract.support.recordCount, null);
});
