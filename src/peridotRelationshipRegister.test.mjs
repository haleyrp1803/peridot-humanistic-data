import test from 'node:test';
import assert from 'node:assert/strict';
import { buildPeridotRelationshipRegister } from './peridotRelationshipRegister.mjs';
const reader = (row) => row.structure;
const A = { id:'a', structure:{ relationships:[{source:'Alice',target:'Bob',sourceId:'1',targetId:'2',sourceRole:'Sender',targetRole:'Recipient',relationshipLabel:'Correspondence',direction:'directed'}],places:[] }};
const B = { id:'b', structure:{ relationships:[{source:'Alice',target:'Bob',sourceId:'1',targetId:'2',sourceRole:'Sender',targetRole:'Recipient',relationshipLabel:'Correspondence',direction:'directed'}],places:[] }};
test('groups explicit assertions, preserves direction and separates occurrences from supporting records', () => {
 const result=buildPeridotRelationshipRegister([A,B],{entityType:'person',entityLabel:'Alice',entityId:'1'},reader);
 assert.equal(result.entities.length,1); assert.equal(result.entities[0].occurrences,2); assert.equal(result.entities[0].records.length,2);
 assert.equal(result.entities[0].sourceRole,'Sender'); assert.equal(result.entities[0].direction,'directed');
});
test('same record can represent multiple occurrences without doubling record count', () => {
 const row={id:'dup',structure:{relationships:[A.structure.relationships[0],A.structure.relationships[0]],places:[]}};
 const result=buildPeridotRelationshipRegister([row],{entityType:'person',entityLabel:'Alice',entityId:'1'},reader);
 assert.equal(result.entities[0].occurrences,2); assert.equal(result.entities[0].records.length,1);
});
test('canonical entity IDs prevent mixing equal display labels', () => {
 const result=buildPeridotRelationshipRegister([A],{entityType:'person',entityLabel:'Alice',entityId:'other'},reader);
 assert.equal(result.entities.length,0);
});
test('does not invent relationships from mere co-occurrence', () => {
 const result=buildPeridotRelationshipRegister([{structure:{relationships:[],places:[]}}],{entityType:'person',entityLabel:'Alice'},reader);
 assert.deepEqual(result.entities,[]);
});
test('preserves explicit geographic direction and supporting rows', () => {
 const row={structure:{relationships:[],places:[{label:'Letter sent from',value:'Siena',subject:'Alice',subjectId:'1'},{label:'Letter sent to',value:'Florence',subject:'Bob',subjectId:'2'}]}};
 const result=buildPeridotRelationshipRegister([row],{entityType:'person',entityLabel:'Alice',entityId:'1'},reader);
 assert.equal(result.places.length,1); assert.equal(result.places[0].source,'Siena'); assert.equal(result.places[0].target,'Florence');
 assert.equal(result.places[0].records.length,1);
});
test('a place dossier only lists geographic pairs involving that place', () => {
 const row={structure:{relationships:[],places:[{label:'Source place',value:'Siena'},{label:'Target place',value:'Florence'}]}};
 assert.equal(buildPeridotRelationshipRegister([row],{entityType:'place',entityLabel:'Milan'},reader).places.length,0);
 assert.equal(buildPeridotRelationshipRegister([row],{entityType:'place',entityLabel:'Florence'},reader).places.length,1);
});
