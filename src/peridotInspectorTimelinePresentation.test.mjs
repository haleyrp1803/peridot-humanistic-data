import assert from 'node:assert/strict';
import test from 'node:test';
import { describePeridotTimelineMark as describe } from './peridotInspectorTimelinePresentation.js';
import { buildPeridotInspectorSelectionEvidence as contract } from './peridotInspectorSelectionEvidence.js';

test('partial point is not presented as a duration and preserves source wording', () => {
  const event = { temporalKind:'point', temporalRole:'Letter date', displayLabel:'1623/08/00', sourceText:'August 1623', precision:'month', row:{id:'r1'}, temporalPresentationContract: { kind:'point', shape:'partialPoint', precision:'month', possibleWindow:{start:16230801,end:16230831,semantic:'possible-occurrence-window'} } };
  const value=describe(event);
  assert.equal(value.markKind,'point');
  assert.equal(value.status,'Partial date');
  assert.match(value.explanation,/not an asserted duration/);
  assert.deepEqual(value.detailFields.find(item=>item.label==='Original source date')?.value,'August 1623');
  const result=contract({selectedKind:'timeline-event',selectedProps:{event}});
  assert.equal(result.representation.markType,'temporal-point');
  assert.equal(result.support.recordCount,1);
});

test('lifespan is a mapped period with its own subject and record, not all associated records',()=>{
  const event={ temporalKind:'interval',temporalRole:'Lifespan',displayLabel:'1572/03/20 – 1613/03/27',subject:{label:'Sigismund Báthory'},row:{id:'family-1'}, categoryMemberships:[{fieldLabel:'Profession',value:'Ruler'}],temporalPresentationContract:{kind:'period',shape:'interval',precision:'day',boundedness:'closed'}};
  const value=describe(event);
  assert.equal(value.markKind,'period');
  assert.equal(value.subjectLabel,'Sigismund Báthory');
  assert.equal(value.categories.length,1);
  const result=contract({selectedKind:'timeline-event',selectedProps:{event},relatedRows:[event.row,{id:'unrelated'}]});
  assert.equal(result.support.recordCount,1);
  assert.equal(result.context.recordCount,2);
  assert.equal(result.support.assertions.length,2);
});

test('open period does not imply closed duration',()=>{
  const value=describe({temporalKind:'openInterval',temporalRole:'Service',temporalPresentationContract:{kind:'period',openEnd:true,boundedness:'ongoing',shape:'openInterval'}});
  assert.equal(value.markKind,'period');
  assert.equal(value.isOpen,true);
  assert.equal(value.status,'Ongoing');
  assert.match(value.explanation,/open period/);
});

test('no verified source row stays unverified rather than borrowing context',()=>{
  const result=contract({selectedKind:'timeline-event',selectedProps:{event:{temporalRole:'Creation date',displayLabel:'1620/01/01'}},relatedRows:[{id:'other'}]});
  assert.equal(result.support.status,'not-provided');
  assert.equal(result.context.recordCount,1);
});
