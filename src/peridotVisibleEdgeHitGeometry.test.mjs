import test from 'node:test';
import assert from 'node:assert/strict';
import { projectVisibleEdgeHitCandidates } from './peridotVisibleEdgeHitGeometry.mjs';

const edge = { id: 'route-A', screenWidth: 2, sourceLabel: 'A', targetLabel: 'B', letterMetadata: [{ id: 'source-row' }], curve: { ax: 10, ay: 20, cx: 20, cy: 40, bx: 30, by: 20 } };

test('projects the visible source curve into pointer/screen coordinates', () => {
  const [hit] = projectVisibleEdgeHitCandidates([{ edge, copy: 0, path: 'M...' }], { scale: 2, tx: 30, ty: -10 }, 360);
  assert.deepEqual(hit.curve, { ax: 50, ay: 30, cx: 70, cy: 70, bx: 90, by: 30 });
  assert.equal(hit.id, edge.id);
  assert.deepEqual(hit.letterMetadata, edge.letterMetadata);
  assert.deepEqual(edge.curve, { ax: 10, ay: 20, cx: 20, cy: 40, bx: 30, by: 20 });
});

test('includes each rendered world copy at its own screen position', () => {
  const items = projectVisibleEdgeHitCandidates([{ edge, copy: -1 }, { edge, copy: 0 }, { edge, copy: 1 }], { scale: 2, tx: 0, ty: 0 }, 360);
  assert.deepEqual(items.map(x => x.curve.ax), [-700, 20, 740]);
  assert.deepEqual(items.map(x => x.id), ['route-A', 'route-A', 'route-A']);
});

test('excludes invisible, malformed or non-finite geometry', () => {
  assert.equal(projectVisibleEdgeHitCandidates([], { scale: 1, tx: 0, ty: 0 }, 360).length, 0);
  assert.equal(projectVisibleEdgeHitCandidates([{ edge: { id: 'bad' }, copy: 0 }], { scale: 1, tx: 0, ty: 0 }, 360).length, 0);
  assert.equal(projectVisibleEdgeHitCandidates([{ edge, copy: 0 }], { scale: 0, tx: 0, ty: 0 }, 360).length, 0);
  assert.equal(projectVisibleEdgeHitCandidates([{ edge, copy: 0 }], { scale: 1, tx: NaN, ty: 0 }, 360).length, 0);
});
