import test from 'node:test';
import assert from 'node:assert/strict';
import { buildPeridotTimelineCategorySourceInventory as inventory } from './peridotTimelineCategorySourceInventory.js';

const observation = (changes = {}) => ({
  recordId: 'r1', rowIndex: 0, originalUploadedRow: { Sender: 'Maria', Place: 'Florence', Unmapped: 'notes' },
  evidenceFields: [{ sourceColumn: 'Language', label: 'Language', value: 'Latin', subjectParticipantIndex: null }],
  participants: [{ sourceColumn: 'Sender', role: 'sender', value: 'Maria', index: 0 }],
  places: [{ sourceColumn: 'Place', role: 'origin', label: 'Florence', subjectParticipantIndex: 0 }],
  relationship: { type: 'letter', sourceColumns: { type: 'Kind' } },
  temporal: { assertions: [{ fieldKey: 'date-1', role: 'Date', sourceText: '1613' }] },
  ...changes,
});
const event = (id, obs) => ({ id, recordId: obs.recordId, row: { generalizedObservation: obs } });
const by = (list, domain, column) => list.find((s) => s.domain === domain && s.sourceColumn === column);

test('empty and incompatible event sets return no categories', () => {
  assert.deepEqual(inventory(), []);
  assert.deepEqual(inventory([{ id: 'missing' }]), []);
});
test('discovers mapped Evidence, participant, place, relationship and temporal sources', () => {
  const found = inventory([event('e1', observation())]);
  for (const [domain,column] of [['evidence','Language'],['participant','Sender'],['place','Place'],['relationship','Kind'],['temporal','date-1']]) {
    assert.ok(by(found,domain,column), `${domain}: ${column}`);
  }
  assert.equal(by(found,'place','Place').role,'origin');
  assert.equal(by(found,'place','Place').subject,'participant:0');
});
test('raw source fields are candidates, not auto-assigned category memberships', () => {
  const found = inventory([event('e1',observation())]);
  assert.equal(by(found,'raw','Unmapped').availability, 'raw-needs-mapping-and-event-association');
  assert.equal(by(found,'evidence','Language').association, 'unresolved');
});
test('multiple timeline events from one source record do not inflate distinct record counts', () => {
  const obs = observation();
  const found = inventory([event('birth',obs),event('death',obs)]);
  assert.equal(by(found,'evidence','Language').observedRecordCount,1);
  assert.equal(by(found,'evidence','Language').observedOriginEventCount,1);
});
test('participant role and subject disambiguate identical columns', () => {
  const obs = observation({ participants: [
    { sourceColumn:'Person', role:'sender',value:'X',index:0 },
    { sourceColumn:'Person', role:'recipient',value:'Y',index:1 },
  ] });
  const candidates = inventory([event('e',obs)]).filter(s=>s.domain==='participant' && s.sourceColumn==='Person');
  assert.equal(candidates.length,2);
  assert.notEqual(candidates[0].id,candidates[1].id);
});
test('sheet-qualified identities remain separate when trustworthy sheet metadata exists', () => {
  const a = observation({recordId:'r1',sourceSheet:'Cardinals',evidenceFields:[{sourceColumn:'Status',value:'Yes'}]});
  const b = observation({recordId:'r2',sourceSheet:'Conclave',evidenceFields:[{sourceColumn:'Status',value:'Yes'}]});
  const fields = inventory([event('e1',a),event('e2',b)]).filter(s=>s.domain==='evidence');
  assert.equal(fields.length,2);
  assert.ok(fields.every(s=>s.sheetIdentityKnown));
});
test('missing sheet identity is disclosed rather than invented', () => {
  const field=by(inventory([event('e',observation())]),'evidence','Language');
  assert.equal(field.sheetIdentityKnown,false);
  assert.equal(field.sourceSheet,'');
});
test('multi-valued mapped fields retain distinct values without parsing arbitrary raw strings', () => {
  const obs=observation({evidenceFields:[
    {sourceColumn:'Language',value:'Italian',occurrenceIndex:0},
    {sourceColumn:'Language',value:'Latin',occurrenceIndex:1},
  ],originalUploadedRow:{Language:'Italian; Latin'}});
  const found=inventory([event('e',obs)]);
  assert.deepEqual(by(found,'evidence','Language').values.map(v=>v.value),['Italian','Latin']);
  assert.deepEqual(by(found,'raw','Language').values.map(v=>v.value),['Italian; Latin']);
});
test('boolean mapped raw columns, numbers and missing values retain type and blank policy', () => {
  const obs=observation({originalUploadedRow:{Attended:true,Age:38,Unknown:null,Absent:false}});
  const found=inventory([event('e',obs)]);
  assert.deepEqual(by(found,'raw','Attended').valueTypes,['boolean']);
  assert.deepEqual(by(found,'raw','Age').valueTypes,['number']);
  assert.equal(by(found,'raw','Unknown'),undefined);
  assert.equal(by(found,'raw','Absent').values[0].value,'false');
});
test('deterministic output and no mutation of observation', () => {
  const obs=observation();const before=JSON.stringify(obs);
  const once=inventory([event('e',obs)]), twice=inventory([event('e',obs)]);
  assert.deepEqual(once,twice);
  assert.equal(JSON.stringify(obs),before);
  assert.ok(Object.isFrozen(once[0]));
});
