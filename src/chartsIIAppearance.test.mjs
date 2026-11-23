import test from 'node:test';
import assert from 'node:assert/strict';
import {getChartsIIAppearanceLabels,chartsIIStableColor} from './chartsIIAppearance.js';
import {RAINBOW_CATEGORY_COLORS} from './peridotSharedCategoryColors.js';

test('shared Timeline color inventory is complete and unique',()=>{
 assert.equal(RAINBOW_CATEGORY_COLORS.length,42);
 assert.equal(new Set(RAINBOW_CATEGORY_COLORS).size,RAINBOW_CATEGORY_COLORS.length);
});
test('series identities remain distinct when result order changes',()=>{
 const palette=['#111111','#222222','#333333'];
 const defaults={'Siena':'#111111','Florence':'#222222'};
 const overrides={'Siena':'#d47c40'};
 assert.equal(chartsIIStableColor('Siena',1,defaults,overrides,palette),'#d47c40');
 assert.equal(chartsIIStableColor('Florence',0,defaults,overrides,palette),'#222222');
 assert.equal(chartsIIStableColor('Siena',0,defaults,{},palette),'#111111');
});
test('selectable labels are based on individual chart series and values',()=>{
 assert.deepEqual(getChartsIIAppearanceLabels({chartType:'bar',data:[{label:'Siena'},{label:'Florence'},{label:'Siena'}]}),['Siena','Florence']);
 assert.deepEqual(getChartsIIAppearanceLabels({chartType:'multiLine',series:[{label:'Bank of England'},{label:'East India Company'}]}),['Bank of England','East India Company']);
 assert.deepEqual(getChartsIIAppearanceLabels({chartType:'treemap',parents:[{label:'Cosimo',children:[{label:'Siena'}]},{label:'Orso',children:[{label:'Florence'}]}]}),['Cosimo','Siena','Orso','Florence']);
});
test('missing and invalid overrides cannot change chart colors',()=>{
 assert.equal(chartsIIStableColor('A',0,{}, {'A':'red'}, ['#123456']),'#123456');
 assert.equal(chartsIIStableColor('A',0,{}, {'A':'#A63D2B'}, ['#123456']),'#A63D2B');
});
