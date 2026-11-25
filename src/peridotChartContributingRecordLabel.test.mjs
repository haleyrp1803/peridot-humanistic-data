import test from 'node:test';
import assert from 'node:assert/strict';
import { getPeridotChartContributingRecordLabel as label } from './peridotChartContributingRecordLabel.js';

test('mapped field identity is preferred over generated Peridot ID', () => {
  assert.equal(label({ recordId: 'peridot-record:field:L-42', recordIdentity: { complete: true, strategy: 'field', components: [{ sourceColumn: 'Letter ID', value: 'L-42' }] } }), 'L-42');
});
test('composite identity retains all mapped components', () => {
  assert.equal(label({ recordId: 'peridot-record:composite:A+B', recordIdentity: { complete: true, strategy: 'composite', components: [{ value: 'A' }, { value: 'B' }] } }), 'A · B');
});
test('row strategy falls back to Peridot-generated record ID', () => {
  assert.equal(label({ recordId: 'peridot-record:row:17', recordIdentity: { complete: true, strategy: 'row', components: [] }, originalUploadedRow: { ID: 'NotMapped' } }), 'peridot-record:row:17');
});
test('incomplete configured identity retains stable Peridot unresolved ID', () => {
  assert.equal(label({ recordId: 'peridot-record:unresolved:11', recordIdentity: { complete: false, strategy: 'field', components: [{ value: '' }] } }), 'peridot-record:unresolved:11');
});

test('mapped unique ID encoded in generalized record ID is displayed', () => {
  assert.equal(label({ recordId: 'peridot-record:field:L-42' }), 'L-42');
  assert.equal(label({ recordId: 'peridot-record:composite:Archive+Letter%20%232' }), 'Archive · Letter #2');
});

test('generalized identity is preferred over compatibility-generated record ID', () => {
  assert.equal(label({ recordId: 'peridot_record_382', id: 'peridot_geo_382', generalizedObservation: {
    recordId: 'peridot-record:field:Archive-L-42', recordIdentity: { strategy: 'field', complete: true, components: [{ sourceColumn: 'Unique ID', value: 'Archive-L-42' }] }
  } }), 'Archive-L-42');
});
test('composite generalized identity survives compatibility normalization', () => {
  assert.equal(label({ recordId: 'peridot_record_9', generalizedObservation: {
    recordIdentity: { strategy: 'composite', complete: true, components: [{ value: 'A' }, { value: '42' }] }
  } }), 'A · 42');
});
test('unmapped generalized identity preserves compatibility fallback without guessing raw ID', () => {
  assert.equal(label({ recordId: 'peridot_record_9', generalizedObservation: {
    recordIdentity: { strategy: 'row', complete: true, components: [] }, originalUploadedRow: { 'Unique ID': 'Raw-09' }
  } }), 'peridot_record_9');
});

test('mapped identity survives the actual legacy geographic normalization boundary', async () => {
  const { normalizePeridotTemplateRowForGeography } = await import('./peridotCsvNormalizer.js');
  const row = normalizePeridotTemplateRowForGeography({
    Source_Name: 'A', Target_Name: 'B',
    generalizedObservation: {
      recordId: 'peridot-record:field:USER-007',
      recordIdentity: { strategy: 'field', complete: true, components: [{ sourceColumn: 'Unique ID', value: 'USER-007' }] },
    },
  }, 6);
  assert.equal(row.recordId, 'peridot_record_7');
  assert.equal(label(row), 'USER-007');
});
