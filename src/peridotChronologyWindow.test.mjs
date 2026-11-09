import assert from 'node:assert/strict';
import {civilDay,civilFromDay,createChronologyDomain,clampChronologyWindow,chronologyDayAtPosition,chronologyPosition} from './peridotChronologyWindow.js';
for (const year of [-400,-1,0,1,400,1582,1600,1700,1900,2000,2024]) {
  for (const month of [1,2,3,6,12]) {
    for (const day of [1,15,28]) {
      const d=civilDay(year,month,day);
      assert.deepEqual(civilFromDay(d),{year,month,day});
    }
  }
}
assert.equal(civilDay(2000,3,1)-civilDay(2000,2,28),2);
assert.equal(civilDay(1900,3,1)-civilDay(1900,2,28),1);
assert.equal(civilDay(2001,1,1)-civilDay(2000,12,31),1);
const min=civilDay(1900),max=civilDay(2000);
const domain=createChronologyDomain(min,max);
assert.ok(Math.abs((min-domain.min)/(max-min)-0.1)<1e-10);
assert.ok(Math.abs((domain.max-max)/(max-min)-0.1)<1e-10);
assert.equal(clampChronologyWindow(domain.min,domain.max,domain).span,domain.span);
const narrowed=clampChronologyWindow(civilDay(1942),civilDay(1950),domain);
assert.equal(narrowed.start,civilDay(1942));
assert.equal(narrowed.end,civilDay(1950));
const at=chronologyPosition(civilDay(1942),domain.min,domain.max,76,1200);
assert.ok(Math.abs(chronologyDayAtPosition(at,domain.min,domain.max,76,1200)-civilDay(1942))<1e-8);
assert.equal(clampChronologyWindow(domain.min-100,domain.min+100,domain).start,domain.min);
const single=createChronologyDomain(civilDay(1623),civilDay(1623));
assert.equal(single.span,7);
assert.equal(clampChronologyWindow(single.min-10,single.max+10,single).span,7);
console.log('Calendar-core checks passed');
