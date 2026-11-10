import test from 'node:test';
import assert from 'node:assert/strict';
import {buildPeridotGeneralizedCategoryFields as fields,projectPeridotGeneralizedCategoryEvents as project} from './peridotTimelineGeneralizedCategories.js';
import {createTimelineCategoryConfiguration,configureTimelineCategoryField,configureTimelineCategoryFieldScope,configureTimelineCategoryAppearance,resolveTimelineCategories} from './peridotTimelineCategoryConfiguration.js';

const obs=(recordId,from,place,profession)=>({recordId,rowIndex:Number(recordId.slice(1)),
 originalUploadedRow:{Profession:profession, Memo:'text'},
 participants:[{index:0,sourceColumn:'Sender',value:from,role:'source'},{index:1,sourceColumn:'Recipient',value:'Other',role:'target'}],
 places:[{sourceColumn:'City',label:place,role:'origin',subjectParticipantIndex:0}],
 evidenceFields:[{sourceColumn:'Language',value:'Latin'}],
 temporal:{assertions:[{fieldKey:'Date',role:'sent',sourceText:'1600',subjectParticipantIndex:0}]},
 relationship:{type:'letter',sourceColumns:{type:'Kind'}}});
const event=(id,o,subject=0,role='sent')=>({id,recordId:o.recordId,row:{generalizedObservation:o},subject:{participantIndex:subject},assertion:{fieldKey:'Date',role,subjectParticipantIndex:subject},categoryMemberships:[]});
const a=obs('r1','Maria','Florence','Duchess');
const b=obs('r2','Marco','Rome','Merchant');
const domain=[event('a1',a,0),event('a2',a,1),event('b1',b,0)];
const inventory=fields(domain);
const source=(domain,column,role)=>inventory.find(f=>f.domain===domain&&f.sourceColumn===column&&(!role||f.source.role===role));

test('maps real observation columns across independent domains without changing canonical input',()=>{
 assert.ok(source('raw','Profession'));
 assert.ok(source('participant','Sender'));
 assert.ok(source('place','City','origin'));
 assert.ok(source('relationship','Kind'));
 assert.ok(source('temporal','Date'));
 assert.equal(inventory.filter(f=>f.domain==='evidence').length,0);
});
test('no selection means no extra memberships',()=>{
 const output=project(domain,inventory,createTimelineCategoryConfiguration());
 assert.equal(output[0],domain[0]);assert.equal(output[1],domain[1]);
});
test('mapped place record scope colors associated events by default',()=>{
 const place=source('place','City');
 const config=configureTimelineCategoryField(createTimelineCategoryConfiguration(),inventory,place.key);
 const out=project(domain,inventory,config);
 assert.deepEqual(out.map(e=>e.categoryMemberships.map(m=>m.value)),[['Florence'],['Florence'],['Rome']]);
 assert.equal(domain[0].categoryMemberships.length,0);
});
test('researcher can choose subject-only association explicitly',()=>{
 const place=source('place','City');
 let config=configureTimelineCategoryField(createTimelineCategoryConfiguration(),inventory,place.key);
 config=configureTimelineCategoryFieldScope(config,inventory,place.key,'subject');
 const out=project(domain,inventory,config);
 assert.deepEqual(out.map(e=>e.categoryMemberships.map(m=>m.value)),[['Florence'],[],['Rome']]);
});
test('original columns can be explicitly categorized without joins',()=>{
 const profession=source('raw','Profession');
 const config=configureTimelineCategoryField(createTimelineCategoryConfiguration(),inventory,profession.key,'selected',['Duchess']);
 const out=project(domain,inventory,config);
 assert.deepEqual(out.map(e=>e.categoryMemberships.map(m=>m.value)),[['Duchess'],['Duchess'],[]]);
 const resolved=resolveTimelineCategories(out,inventory,config);
 assert.equal(resolved.categories.length,1);
 assert.equal(resolved.eventCategories[2].uncategorized,true);
});
test('selected category field retains source provenance in identity',()=>{
 const first=source('raw','Profession'); const second=source('participant','Sender');
 assert.notEqual(first.key,second.key);assert.notEqual(first.key,'Profession');
});

test('sheet-qualified mapping column displays original header and retains identity',()=>{
 const o={...a,sourceSheet:'Raw Data', places:[{sourceColumn:'Raw Data::Source Location',label:'Florence',role:'Letter sent from',subjectParticipantIndex:0}]};
 const list=fields([event('letter',o,null)]);
 const field=list.find(f=>f.domain==='place');
 assert.equal(field.label,'Source Location');
 assert.equal(field.sourceColumn,'Raw Data::Source Location');
 assert.equal(field.sourceSheet,'Raw Data');
 assert.equal(field.sourceRole,'Letter sent from');
 assert.match(field.key,/Raw Data::Source Location/);
});

test('record-level correspondence dates display selected sending location by default',()=>{
 const letter=event('letter',a,null);
 const place=fields([letter]).find(f=>f.domain==='place'&&f.sourceColumn==='City');
 assert.equal(place.defaultAssociationScope,'record');
 const config=configureTimelineCategoryField(createTimelineCategoryConfiguration(),[place],place.key);
 const result=project([letter],[place],config);
 assert.deepEqual(result[0].categoryMemberships.map(m=>m.value),['Florence']);
 const categories=resolveTimelineCategories(result,[place],config);
 assert.equal(categories.eventCategories[0].uncategorized,false);
});


test('explicit category color and symbol remain applied to record-level events',()=>{
 const letter=event('letter',a,null);
 const f=fields([letter]).find(f=>f.domain==='place');
 let config=configureTimelineCategoryField(createTimelineCategoryConfiguration(),[f],f.key,'selected',['Florence']);
 const id=JSON.stringify([f.key,'Florence']);
 config=configureTimelineCategoryAppearance(config,[f],id,{color:'#123456',symbol:'star'});
 const projected=project([letter],[f],config);
 const resolved=resolveTimelineCategories(projected,[f],config);
 assert.equal(resolved.categories[0].color,'#123456');
 assert.equal(resolved.categories[0].symbol,'star');
 assert.deepEqual(resolved.eventCategories[0].categoryIds,[id]);
});
