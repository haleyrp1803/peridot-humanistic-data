import assert from 'node:assert/strict';
import test from 'node:test';
import { timelineCompactRecordGroups, timelineVisualCategoryLegend } from './peridotInspectorTimelineCompact.js';

test('only configured visual categories appear in legend, not raw source memberships', () => {
 const result=timelineVisualCategoryLegend({categoryMemberships:[{fieldLabel:'Topic',value:'Politics'}],inspectorVisualCategories:[{id:'a',label:'Selected category',color:'#223344',sourceLabel:'Archive',sourceValue:'ASF'}],inspectorCategoryDisplayMode:'colors'});
 assert.equal(result.categories.length,1);
 assert.equal(result.categories[0].label,'Selected category');
 assert.equal(result.displayMode,'colors');
});
test('an uncategorized configured mark is distinct from a selection without category metadata',()=>{
 assert.equal(timelineVisualCategoryLegend({inspectorVisualCategories:[]}).available,true);
 assert.equal(timelineVisualCategoryLegend({categoryMemberships:[{value:'ASF'}]}).available,false);
});
test('an encoded source field has one home, while other metadata remain visible',()=>{
 const mapped={evidence:[{label:'Archival Collection',value:'ASF'},{label:'PDF Page',value:'326'},{label:'Topic',value:'Officiali'}]};
 const grouped=timelineCompactRecordGroups(mapped,[{fieldKey:'archive',sourceLabel:'Archival Collection',sourceValue:'ASF'}],{peridotCanonicalEvidenceFields:[{key:'archive',label:'Archival Collection',value:'ASF'},{key:'pdf',label:'PDF Page',value:'326'},{key:'topic',label:'Topic',value:'Officiali'}]});
 assert.deepEqual(grouped.provenance.map(x=>x.label),['PDF Page']);
 assert.deepEqual(grouped.otherEvidence.map(x=>x.label),['Topic']);
});
test('distinct field identity and subject attribution are not merged',()=>{
 const mapped={evidence:[{label:'Archival Collection',value:'ASF'},{label:'PDF Page',value:'ASF'}],places:[{label:'Place of birth',value:'Oradea',subject:'Individual'},{label:'Place of childbirth',value:'Oradea',subject:'Mother'}]};
 const grouped=timelineCompactRecordGroups(mapped,[{fieldKey:'archive',sourceLabel:'Archival Collection',sourceValue:'ASF'}],{peridotCanonicalEvidenceFields:[{key:'archive',label:'Archival Collection',value:'ASF'},{key:'pdf',label:'PDF Page',value:'326'},{key:'topic',label:'Topic',value:'Officiali'}]});
 assert.equal(grouped.provenance.length,1);
 assert.equal(grouped.provenance[0].label,'PDF Page');
 assert.equal(grouped.places.length,2);
});
test('source and target remain explicit; redundant relationship sentence is omitted',()=>{
 const mapped={participants:[{label:'Source',value:'A'},{label:'Target',value:'B'}],relationships:[{label:'Unknown',value:'A → B',source:'A',target:'B'}]};
 const grouped=timelineCompactRecordGroups(mapped,[]);
 assert.equal(grouped.relationships.length,0);
 assert.deepEqual(grouped.participants.map(x=>x.label),['Source','Target']);
});
test('more than four categories retains all memberships and reports hidden count',()=>{
 const cats=Array.from({length:6},(_,i)=>({id:String(i),color:'#123456',label:'C'+i}));
 const result=timelineVisualCategoryLegend({inspectorVisualCategories:cats});
 assert.equal(result.visible.length,4);
 assert.equal(result.hiddenCount,2);
 assert.equal(result.categories.length,6);
});

test('identical display text with ambiguous canonical field keys is not silently removed',()=>{
 const mapped={evidence:[{label:'Collection',value:'ASF'}]};
 const row={peridotCanonicalEvidenceFields:[{key:'first',label:'Collection',value:'ASF'},{key:'second',label:'Collection',value:'ASF'}]};
 const result=timelineCompactRecordGroups(mapped,[{fieldKey:'first',sourceLabel:'Collection',sourceValue:'ASF'}],row);
 assert.equal(result.provenance.length,1);
});
