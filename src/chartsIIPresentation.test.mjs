import test from 'node:test';
import assert from 'node:assert/strict';
import {CHARTS_II_PRESENTATION_DEFAULTS,normalizeChartsIIPresentation,chartsIIPresentationTickCount,chartsIIPresentationTitle,chartsIIPresentationFontCSS} from './chartsIIPresentation.js';

test('default chart presentation preserves the accepted on-screen rendering',()=>{
 const options=normalizeChartsIIPresentation();
 assert.deepEqual(options,CHARTS_II_PRESENTATION_DEFAULTS);
 assert.equal(chartsIIPresentationTitle(options,'Record count by person'),'Record count by person');
 assert.equal(chartsIIPresentationFontCSS(options.textScale),'');
});
test('title omission and custom title do not modify derived chart values',()=>{
 assert.equal(chartsIIPresentationTitle({title:'A Historical Comparison'},'Original'),'A Historical Comparison');
 assert.equal(chartsIIPresentationTitle({showTitle:false,title:'Retained custom label'},'Original'),'');
});
test('label density affects tick budget, never observations',()=>{
 assert.equal(chartsIIPresentationTickCount({},7),7);
 assert.equal(chartsIIPresentationTickCount({labelDensity:'compact'},7),4);
 assert.equal(chartsIIPresentationTickCount({labelDensity:'detailed'},7),11);
});
test('invalid and excessive presentation settings are sanitized',()=>{
 const options=normalizeChartsIIPresentation({showTitle:'false',textScale:500,labelDensity:'everything',title:'T'.repeat(300)});
 assert.equal(options.showTitle,true);
 assert.equal(options.textScale,1);
 assert.equal(options.labelDensity,'standard');
 assert.equal(options.title.length,160);
});
test('font scaling preserves the typographic hierarchy',()=>{
 const css=chartsIIPresentationFontCSS(1.2);
 assert.match(css,/text\[font-size="20.5"\]\{font-size:24.60px/);
 assert.match(css,/text\[font-size="10"\]\{font-size:12.00px/);
});
