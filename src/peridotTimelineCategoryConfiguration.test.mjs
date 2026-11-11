import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createTimelineCategoryConfiguration,
  timelineCategoryIdentity,
  configureTimelineCategoryField,
  removeTimelineCategoryField,
  configureTimelineCategoryAppearance,
  configureTimelineCategoryPriority,
  configureTimelinePrimaryField, configureTimelineEventPrimary, configureTimelineStarredCategories,
  reconcileTimelineCategoryConfiguration,
  resolveTimelineCategories,
  TIMELINE_UNCATEGORIZED_COLOR,
  TIMELINE_CATEGORY_COLORS,
} from './peridotTimelineCategoryConfiguration.js';

const fields = [
  { key:'Language', label:'Language', values:[{value:'Latin'},{value:'Italian'},{value:'French'}]},
  { key:'Topic', label:'Topic', values:[{value:'Diplomacy'},{value:'Religion'}]},
];
const events = [
  {id:'letter-1', categoryMemberships:[{fieldKey:'Language',value:'Latin'},{fieldKey:'Topic',value:'Diplomacy'}]},
  {id:'letter-2', categoryMemberships:[{fieldKey:'Language',value:'Italian'}]},
  {id:'letter-3', categoryMemberships:[{fieldKey:'Language',value:'Latin'},{fieldKey:'Language',value:'Latin'}]},
  {id:'letter-4', categoryMemberships:[]},
];

test('default is uncategorized; selection never filters out events', () => {
  const resolved = resolveTimelineCategories(events, fields, createTimelineCategoryConfiguration());
  assert.equal(resolved.categories.length, 0);
  assert.equal(resolved.eventCategories.length, 4);
  assert.ok(resolved.eventCategories.every((entry) => entry.uncategorized));
  assert.equal(TIMELINE_UNCATEGORIZED_COLOR, '#3B3B3B');
  assert.ok(!TIMELINE_CATEGORY_COLORS.includes(TIMELINE_UNCATEGORIZED_COLOR));
});

test('all distinct values or selected subset from an exact field', () => {
  const all = configureTimelineCategoryField(null, fields, 'Language');
  assert.equal(resolveTimelineCategories(events,fields,all).categories.length, 3);
  const latin = configureTimelineCategoryField(all, fields, 'Language', 'selected', ['Latin']);
  const resolved = resolveTimelineCategories(events, fields, latin);
  assert.equal(resolved.categories.length, 1);
  assert.deepEqual(resolved.eventCategories.map((e) => e.uncategorized), [false,true,false,true]);
  assert.deepEqual(resolved.eventCategories[2].categoryIds, [timelineCategoryIdentity('Language','Latin')]);
  const empty = configureTimelineCategoryField(latin, fields, 'Language', 'selected', []);
  assert.equal(resolveTimelineCategories(events,fields,empty).categories.length, 0);
});

test('multiple fields and values allow multiple memberships without duplicates', () => {
  let config = configureTimelineCategoryField(null, fields, 'Language', 'selected', ['Latin']);
  config = configureTimelineCategoryField(config, fields, 'Topic', 'selected', ['Diplomacy']);
  const resolved = resolveTimelineCategories(events, fields, config);
  assert.equal(resolved.eventCategories[0].categoryIds.length, 2);
  assert.equal(resolved.eventCategories[2].categoryIds.length, 1);
  assert.equal(resolved.eventCategories[3].uncategorized, true);
});

test('display label, color and symbol are independent of exact source identity', () => {
  const id=timelineCategoryIdentity('Language','Latin');
  let config=configureTimelineCategoryField(null,fields,'Language','selected',['Latin']);
  const defaultResolved=resolveTimelineCategories(events,fields,config);
  assert.equal(defaultResolved.categories[0].symbol,'none');
  config=configureTimelineCategoryAppearance(config,fields,id,{label:'Latin correspondence',color:'#123ABC',symbol:'star'});
  const resolved=resolveTimelineCategories(events,fields,config);
  assert.equal(resolved.categories[0].label,'Latin correspondence');
  assert.equal(resolved.categories[0].sourceValue,'Latin');
  assert.equal(resolved.categories[0].color,'#123ABC');
  assert.equal(resolved.categories[0].symbol,'star');
  assert.equal(resolved.eventCategories[0].categoryIds[0],id);
  const reset=configureTimelineCategoryAppearance(config,fields,id,{label:'',color:'',symbol:'none'});
  assert.equal(resolveTimelineCategories(events,fields,reset).categories[0].label,'Latin');
});

test('default palette assignment stays stable when unrelated values are added', () => {
  const original=configureTimelineCategoryField(null,fields,'Language','all');
  const before=resolveTimelineCategories(events,fields,original).categories.find(c=>c.sourceValue==='Latin').color;
  const expanded=[{...fields[0],values:[...fields[0].values,{value:'Arabic'}]},fields[1]];
  const after=resolveTimelineCategories(events,expanded,original).categories.find(c=>c.sourceValue==='Latin').color;
  assert.equal(before,after);
});

test('category priority assigns one primary category without removing other memberships', () => {
  let config=configureTimelineCategoryField(null,fields,'Language','selected',['Latin']);
  config=configureTimelineCategoryField(config,fields,'Topic','selected',['Diplomacy']);
  const diplomacy=timelineCategoryIdentity('Topic','Diplomacy');
  config=configureTimelineCategoryPriority(config,fields,[diplomacy]);
  const resolved=resolveTimelineCategories(events,fields,config);
  assert.equal(resolved.eventCategories[0].primaryCategoryId,diplomacy);
  assert.equal(resolved.eventCategories[0].categoryIds.length,2);
});

test('field removal and dataset changes remove unsupported category selections and overrides', () => {
  const id=timelineCategoryIdentity('Language','Latin');
  let config=configureTimelineCategoryField(null,fields,'Language','selected',['Latin','French']);
  config=configureTimelineCategoryAppearance(config,fields,id,{label:'Latin letters'});
  const pruned=reconcileTimelineCategoryConfiguration(config,[{key:'Language',label:'Language',values:[{value:'Italian'}]}]);
  assert.deepEqual(pruned.fields[0].values,[]);
  assert.deepEqual(pruned.overrides,{});
  assert.deepEqual(pruned.priority,[]);
  assert.equal(removeTimelineCategoryField(config,fields,'Language').fields.length,0);
});

test('field identities cannot collide via delimiter-like source values', () => {
  assert.notEqual(timelineCategoryIdentity('a:b','c'),timelineCategoryIdentity('a','b:c'));
  assert.notEqual(timelineCategoryIdentity('a\u0000b','c'),timelineCategoryIdentity('a','b\u0000c'));
});

test('primary field governs swimlane identity without erasing secondary memberships', () => {
  let config=configureTimelineCategoryField(null,fields,'Language','all');
  config=configureTimelineCategoryField(config,fields,'Topic','all');
  config=configureTimelinePrimaryField(config,fields,'Topic');
  const rows=resolveTimelineCategories(events,fields,config).eventCategories;
  assert.equal(rows[0].primaryCategoryId,timelineCategoryIdentity('Topic','Diplomacy'));
  assert.deepEqual(rows[0].categoryIds.length,2);
  assert.equal(rows[1].primaryCategoryId,null);
  assert.equal(rows[1].uncategorized,false);
});

test('one explicit event primary override is allowed only among existing memberships', () => {
  let config=configureTimelineCategoryField(null,fields,'Language','all');
  config=configureTimelineCategoryField(config,fields,'Topic','all');
  config=configureTimelinePrimaryField(config,fields,'Topic');
  const latin=timelineCategoryIdentity('Language','Latin');
  config=configureTimelineStarredCategories(config,fields,[latin,timelineCategoryIdentity('Topic','Diplomacy')]);
  config=configureTimelineCategoryPriority(config,fields,[timelineCategoryIdentity('Topic','Diplomacy'),latin]);
  const french=timelineCategoryIdentity('Language','French');
  const invalid=configureTimelineEventPrimary(config,fields,events,'letter-1',french);
  assert.deepEqual(invalid.eventPrimaryOverrides,{});
  config=configureTimelineEventPrimary(config,fields,events,'letter-1',latin);
  assert.equal(resolveTimelineCategories(events,fields,config).eventCategories[0].primaryCategoryId,latin);
  config=configureTimelineEventPrimary(config,fields,events,'letter-1','');
  assert.equal(resolveTimelineCategories(events,fields,config).eventCategories[0].primaryCategoryId,timelineCategoryIdentity('Topic','Diplomacy'));
});


test('starred categories alone define eligible primary lanes while all mark categories remain', () => {
  let config=configureTimelineCategoryField(null,fields,'Language','all');
  config=configureTimelineCategoryField(config,fields,'Topic','all');
  const diplomacy=timelineCategoryIdentity('Topic','Diplomacy');
  const latin=timelineCategoryIdentity('Language','Latin');
  const initial=resolveTimelineCategories(events,fields,config);
  assert.equal(initial.starredCategoryIds.length,5); // legacy defaults remain intact
  config=configureTimelineStarredCategories(config,fields,[diplomacy]);
  const chosen=resolveTimelineCategories(events,fields,config);
  assert.deepEqual(chosen.starredCategoryIds,[diplomacy]);
  assert.equal(chosen.eventCategories[0].primaryCategoryId,diplomacy);
  assert.equal(chosen.eventCategories[1].primaryCategoryId,null);
  assert.equal(chosen.eventCategories[1].uncategorized,false);
  assert.deepEqual([...chosen.eventCategories[0].categoryIds].sort(),[latin,diplomacy].sort());
  assert.deepEqual(configureTimelineStarredCategories(config,fields,[]).starredCategoryIds,[]);
});

test('unstarred event primary overrides do not create lanes or memberships', () => {
  let config=configureTimelineCategoryField(null,fields,'Language','all');
  config=configureTimelineCategoryField(config,fields,'Topic','all');
  const latin=timelineCategoryIdentity('Language','Latin');
  const diplomacy=timelineCategoryIdentity('Topic','Diplomacy');
  config=configureTimelineStarredCategories(config,fields,[latin,diplomacy]);
  config=configureTimelineEventPrimary(config,fields,events,'letter-1',latin);
  config=configureTimelineStarredCategories(config,fields,[diplomacy]);
  assert.equal(resolveTimelineCategories(events,fields,config).eventCategories[0].primaryCategoryId,diplomacy);
  assert.equal(configureTimelineEventPrimary(config,fields,events,'letter-1',latin).eventPrimaryOverrides['letter-1'],latin); // dormant previous override is retained, not newly assigned
  config=configureTimelineStarredCategories(config,fields,[]);
  assert.equal(resolveTimelineCategories(events,fields,config).eventCategories[0].primaryCategoryId,null);
});
