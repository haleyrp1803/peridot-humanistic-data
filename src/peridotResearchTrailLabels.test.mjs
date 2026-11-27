import test from 'node:test';
import assert from 'node:assert/strict';
import { getPeridotResearchTrailLabel as label } from './peridotResearchTrailLabels.mjs';
test('person and place use names, not identifiers', () => {
  assert.equal(label({kind:'person-detail', name:'Guiscardi, Traiano', entityId:'peridot-entity:people:100'}), 'Person: Guiscardi, Traiano');
  assert.equal(label({kind:'place-detail',label:'Susa'}), 'Place: Susa');
});
test('node prefers mapped identity and geographic anchor', () => {
  assert.equal(label({kind:'node',id:'geo-anchor:peridot-entity:001',label:'Guiscardi, Traiano',anchorLabel:'Susa'}), 'Guiscardi, Traiano · Susa');
  assert.equal(label({kind:'node',id:'geo-anchor:peridot-entity:001'}),'Map/Network node');
});
test('cluster and connection labels do not expose IDs', () => {
  assert.equal(label({kind:'cluster',id:'cluster-geo-anchor:111',memberCount:5}),'Cluster: 5 items');
  assert.equal(label({kind:'edge',id:'edge:333', sourceLabel:'A',targetLabel:'B',direction:'undirected'}),'Connection: A — B');
});
test('record detail is human-readable', () => {
  assert.equal(label({kind:'letter-detail',id:'letter-detail:peridot_record_182:0',label:'peridot_record_182'}),'Record 182');
});
test('missing values remain neutral and do not expose synthetic keys', () => {
  assert.equal(label({kind:'person-detail', name:'',id:'peridot-entity:people:0'}),'Person: Selected person');
  assert.equal(label(null),'Selection');
});
