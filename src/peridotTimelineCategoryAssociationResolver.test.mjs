import test from 'node:test';
import assert from 'node:assert/strict';
import {resolvePeridotTimelineCategoryAssociation as resolve, evaluatePeridotTimelineCategoryAssociations as evaluate} from './peridotTimelineCategoryAssociationResolver.js';
import {buildPeridotTimelineCategorySourceInventory as inventory} from './peridotTimelineCategorySourceInventory.js';
const observation = {
 recordId:'R1',rowIndex:0,sourceSheet:'People',sourceWorkbook:'Book',
 originalUploadedRow:{Profession:'Scholar', Secret:'x'},
 participants:[{index:0,value:'A',role:'Sender',sourceColumn:'From'},{index:1,value:'B',role:'Recipient',sourceColumn:'To'}],
 places:[{label:'Florence',role:'Origin',sourceColumn:'City',subjectParticipantIndex:0},{label:'Rome',role:'Destination',sourceColumn:'City',subjectParticipantIndex:1}],
 evidenceFields:[{sourceColumn:'Language',value:'Latin'}],
 relationship:{type:'Letter',sourceColumns:{type:'Relation'}},
 temporal:{assertions:[{fieldKey:'birth-date',role:'Birth',sourceText:'1600',subjectParticipantIndex:0,occurrenceIndex:0},{fieldKey:'death-date',role:'Death',sourceText:'1660',subjectParticipantIndex:0,occurrenceIndex:0}]}
};
const makeEvent=(id,subjectIndex,fieldKey='birth-date',role='Birth',o=observation)=>({id,recordId:o.recordId,row:{generalizedObservation:o},subject:{participantIndex:subjectIndex},assertion:{fieldKey,role,subjectParticipantIndex:subjectIndex,occurrenceIndex:0}});
const a=makeEvent('birth',0), b=makeEvent('death',0,'death-date','Death'), c=makeEvent('other',1);
const all=inventory([a,b,c]);
const get=(domain,column,role='',subject='record')=>{const v=all.find(v=>v.domain===domain&&v.sourceColumn===column&&v.role===role&&v.subject===subject);assert.ok(v,`${domain}/${column}/${role}/${subject}`);return v;};
test('inventory source IDs are the only identifiers accepted',()=>{const s=get('evidence','Language');assert.equal(resolve(a,s,'Latin',{scope:'record'}).status,'matched');assert.equal(resolve(a,{...s,id:'invented'},'Latin',{scope:'record'}).status,'not-matched');});
test('no implicit association policy',()=>assert.equal(resolve(a,get('evidence','Language'),'Latin').reason,'association-policy-required'));
test('explicit record scope propagates record attribute to multiple temporal events',()=>{const s=get('evidence','Language');assert.equal(resolve(a,s,'Latin',{scope:'record'}).status,'matched');assert.equal(resolve(b,s,'Latin',{scope:'record'}).status,'matched');});
test('subject scope respects participant identity and role',()=>{const s=get('place','City','Origin','participant:0');assert.equal(resolve(a,s,'Florence',{scope:'subject'}).status,'matched');assert.equal(resolve(c,s,'Florence',{scope:'subject'}).status,'not-matched');});
test('distinct place roles are not conflated',()=>{const s=get('place','City','Destination','participant:1');assert.equal(resolve(c,s,'Rome',{scope:'subject'}).status,'matched');assert.equal(resolve(a,s,'Rome',{scope:'subject'}).status,'not-matched');});
test('assertion scope matches only its specific mapped temporal assertion',()=>{const s=get('temporal','birth-date','Birth','participant:0');assert.equal(resolve(a,s,'1600',{scope:'assertion'}).status,'matched');assert.equal(resolve(b,s,'1600',{scope:'assertion'}).status,'not-matched');});
test('unmapped raw fields are rejected unless deliberately authorized',()=>{const s=get('raw','Profession');assert.equal(resolve(a,s,'Scholar',{scope:'record'}).status,'unresolved');assert.equal(resolve(a,s,'Scholar',{scope:'record',allowUnmapped:true}).status,'matched');});
test('missing record identity is unresolved',()=>{const s=get('evidence','Language');assert.equal(resolve({...a,recordId:''},s,'Latin',{scope:'record'}).status,'unresolved');});
test('sheet and workbook identity are enforced',()=>{const s=get('evidence','Language');const changed={...observation,sourceSheet:'Different'};assert.equal(resolve(makeEvent('z',0,'birth-date','Birth',changed),s,'Latin',{scope:'record'}).reason,'sheet-mismatch');});
test('different source values do not produce memberships',()=>{const s=get('evidence','Language');assert.equal(resolve(a,s,'Greek',{scope:'record'}).status,'not-matched');});
test('no inferred cross-sheet joining',()=>{const s=get('evidence','Language');const other={...observation,recordId:'R2',sourceSheet:'Other'};assert.notEqual(resolve(makeEvent('z',0,'birth-date','Birth',other),s,'Latin',{scope:'record'}).status,'matched');});
test('batch result is immutable and never mutates source events',()=>{const s=get('evidence','Language');const before=JSON.stringify([a,b]);const out=evaluate([a,b],s,'Latin',{scope:'record'});assert.equal(out.length,2);assert.ok(Object.isFrozen(out));assert.equal(JSON.stringify([a,b]),before);});
