import assert from 'node:assert/strict';
import {civilDay,createChronologyDomain,chronologyOverviewTicks,chronologyPosition,chronologySourceBoundsFromEvents} from './peridotChronologyWindow.js';

const events=[
  {temporalPresentationContract:{kind:'date',start:{year:1609,month:6,day:22}}},
  {temporalPresentationContract:{kind:'period',start:{year:1613,month:1,day:2},end:{year:1631,month:8,day:31}}},
  {temporalPresentationContract:{kind:'date',start:{year:1623,month:4,day:6}}},
];
const bounds=chronologySourceBoundsFromEvents(events);
assert.equal(bounds.min,civilDay(1609,6,22));
assert.equal(bounds.max,civilDay(1631,8,31));
const domain=createChronologyDomain(bounds.min,bounds.max);
assert.ok(domain.min<bounds.min&&domain.max>bounds.max);
const mapTicks=chronologyOverviewTicks(domain.min,domain.max,1490,{horizontal:true});
const timelineTicks=chronologyOverviewTicks(domain.min,domain.max,1490,{horizontal:true});
assert.deepEqual(mapTicks,timelineTicks);
assert.ok(mapTicks.some(t=>t.label==='1610'));
assert.equal(chronologyPosition(civilDay(1620),domain.min,domain.max,76,1490),chronologyPosition(civilDay(1620),domain.min,domain.max,76,1490));
console.log('Shared chronology ruler parity checks passed');
