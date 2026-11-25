import test from 'node:test';
import assert from 'node:assert/strict';
import { groupCompactMappedEntries, omitRedundantCompactRelationshipEntries } from './peridotInspectorCompactGrouping.js';

test('repeated geographic role becomes one heading with distinct values in stable order', () => {
  const result = groupCompactMappedEntries([
    { label: 'Letter sent from', value: 'Siena' },
    { label: 'Letter sent from', value: 'Cortona' },
    { label: 'Letter sent from', value: 'Siena' },
    { label: 'Letter sent to', value: 'Florence' },
  ]);
  assert.equal(result.length, 2);
  assert.deepEqual(result[0].values.map(({ value }) => value), ['Siena','Cortona']);
  assert.equal(result[1].label, 'Letter sent to');
});

test('same label on different subjects is not merged', () => {
  const result = groupCompactMappedEntries([
    { label: 'Place of birth', value: 'Oradea', subject: 'Child', subjectId: 'child-1' },
    { label: 'Place of birth', value: 'Oradea', subject: 'Mother', subjectId: 'mother-1' },
  ]);
  assert.equal(result.length, 2);
});

test('network counterpart labels group by actual relationship type', () => {
  const result = groupCompactMappedEntries([
    { label: 'Bureaucratic', value: "d'Elci, Orso · 102 occurrences" },
    { label: 'Close Family', value: "de' Medici, Claudia · 1 occurrence" },
    { label: 'Bureaucratic', value: 'della Rena, Horatzio · 2 occurrences' },
  ]);
  assert.deepEqual(result.map(({label})=>label), ['Bureaucratic','Close Family']);
  assert.equal(result[0].values.length,2);
});

test('omit only legacy technical relationship-with phrasing, retain meaningful roles', () => {
  const entries = [
    {label:'Source relationship with',value:'Cristina'},
    {label:'target relationship with',value:'Guiscardi'},
    {label:'Mother of',value:'Child'},
    {label:'Letter sent from',value:'Siena'},
  ];
  assert.deepEqual(omitRedundantCompactRelationshipEntries(entries).map((entry)=>entry.label), ['Mother of','Letter sent from']);
  assert.equal(entries.length,4);
});
