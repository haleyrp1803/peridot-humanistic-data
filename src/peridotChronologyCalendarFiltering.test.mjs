import assert from 'node:assert/strict';
import {civilDay, createChronologyDomain, chronologyWindowSortBounds,
  chronologySourceBoundsFromEntries} from './peridotChronologyWindow.js';
import {filterRowsByTimelineCalendarWindow,buildPlaybackRows,
  PERIDOT_TIMELINE_PLAYBACK_MODES} from './timelinePlaybackHelpers.js';

const assertion=(start,end,role='Date')=>({role,visualizationUsability:{timelinePositionable:true},
  sortBounds:{start,end}});
const rows=[
  {id:'early',temporalAssertions:[assertion(19000101,19000101)]},
  {id:'period',temporalAssertions:[assertion(19100101,19201231,'Period')]},
  {id:'year',temporalAssertions:[assertion(19500101,19501231)]},
  {id:'late',temporalAssertions:[assertion(20000101,20000101)]},
  {id:'undated',temporalAssertions:[]},
];
const entries=rows.flatMap(row=>row.temporalAssertions.map(a=>({windowStart:a.sortBounds.start,windowEnd:a.sortBounds.end})));
const source=chronologySourceBoundsFromEntries(entries);
assert.equal(source.min,civilDay(1900,1,1));
assert.equal(source.max,civilDay(2000,1,1));
const domain=createChronologyDomain(source.min,source.max);
assert.ok(Math.abs((source.min-domain.min)/domain.sourceSpan-0.1)<1e-10);
assert.ok(Math.abs((domain.max-source.max)/domain.sourceSpan-0.1)<1e-10);
const filter=(a,b)=>filterRowsByTimelineCalendarWindow(rows,'range',civilDay(...a),civilDay(...b),{}).map(r=>r.id);
assert.deepEqual(filter([1930,1,1],[1940,12,31]),[]);
assert.deepEqual(filter([1915,1,1],[1916,1,1]),['period']);
assert.deepEqual(filter([1950,6,1],[1950,7,1]),['year']);
assert.deepEqual(filter([1999,1,1],[2001,1,1]),['late']);
assert.deepEqual(filter([1900,1,1],[2000,1,1]),['early','period','year','late']);
assert.deepEqual(filterRowsByTimelineCalendarWindow(rows,'all',0,0),rows);
assert.deepEqual(filterRowsByTimelineCalendarWindow(rows,'range',civilDay(1910,1,1)+0.2,civilDay(1910,1,1)+0.8),[]);
const b=chronologyWindowSortBounds(civilDay(1915,3,1),civilDay(1915,3,31));
assert.deepEqual(b,{start:19150301,end:19150331});
const playback=buildPlaybackRows([rows[1]],{windowStart:b.start,windowEnd:b.end,playbackMode:PERIDOT_TIMELINE_PLAYBACK_MODES.CO_CURRENT});
assert.ok(playback.some(e=>e.playbackSortKey===19150301));
console.log('Canonical calendar filtering and 10% source-extent tests passed');
