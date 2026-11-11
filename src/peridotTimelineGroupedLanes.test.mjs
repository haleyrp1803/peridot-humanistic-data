import test from 'node:test';
import assert from 'node:assert/strict';
import {groupedLaneInventory,groupedLaneDemand,groupedLaneGeometry,groupedLaneMutedColor} from './peridotTimelineGroupedLanes.js';
const inventory=groupedLaneInventory([{id:'a',label:'A',color:'#A63D2B'},{id:'b',label:'B',color:'#2F6F73'}]);
const event = (id,day,endDay=day,period=false)=>({event:{id},day,endDay,period});
const membership=new Map([['1',{primaryCategoryId:'a'}],['2',{primaryCategoryId:'a'}],['3',{primaryCategoryId:'b'}]]);
test('all selected lanes and separate Uncategorized remain present even when empty',()=>{
 const demand=groupedLaneDemand(inventory,[event('1',10)],membership,x=>x,0,300);
 const geometry=groupedLaneGeometry(inventory,demand,0,300);
 assert.deepEqual(geometry.map(x=>x.label),['A','B','Uncategorized']);
 assert.ok(geometry[1].width>0 && geometry[1].width<geometry[0].width);
 assert.ok(geometry[2].width>0);
 assert.ok(Math.abs(geometry.at(-1).end-300)<1e-8);
});
test('coincident events increase category demand and each event counts once',()=>{
 const one=groupedLaneDemand(inventory,[event('1',10),event('3',30)],membership,x=>x,0,300);
 const two=groupedLaneDemand(inventory,[event('1',10),event('2',10),event('3',30),event('other',32)],membership,x=>x,0,300);
 assert.ok(two[0].weight>one[0].weight);
 assert.equal(two[0].count,2);
 assert.equal(two[2].count,1);
});
test('lane backgrounds use translucent category colors',()=>{
 assert.equal(groupedLaneMutedColor('#A63D2B'),'rgba(166,61,43,0.23)');
});

test('all-empty categories stay narrow without expanding to fill the viewport',()=>{
 const demand=groupedLaneDemand(inventory,[],membership,x=>x,0,300);
 const geometry=groupedLaneGeometry(inventory,demand,0,300);
 assert.ok(geometry.every(lane=>lane.width===5));
 assert.equal(geometry.at(-1).end,15);
});
