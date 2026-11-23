import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {chartsIIPresentationCapabilities as caps,normalizeChartsIIPresentation as norm,chartsIISegmentLabel} from './chartsIIPresentation.js';
const code=readFileSync(new URL('./analyticsChartComponents.jsx',import.meta.url),'utf8');
test('all sixteen renderer types receive an explicit chart-aware control contract',()=>{
 for(const type of ['line','multiLine','area','stackedArea','bar','groupedBar','stackedBar','pie','treemap','sunburst','histogram','box','scatter','heatmap','dot','slope']) assert.equal(typeof caps(type).axes,'boolean',type);
});
test('axes are omitted for radial and hierarchical non-axis plots',()=>{
 for(const type of ['pie','sunburst','treemap']) assert.equal(caps(type).axes,false);
 for(const type of ['bar','scatter','box','heatmap']) assert.equal(caps(type).axes,true);
});
test('only meaningful families show dedicated controls',()=>{
 assert.equal(caps('box').box,true);assert.equal(caps('sunburst').sunburst,true);assert.equal(caps('heatmap').heatmap,true);
 assert.equal(caps('line').heatmap,false);assert.equal(caps('stackedBar').stackedSegmentLabels,true);
 assert.equal(caps('multiLine').directSeries,true);assert.equal(caps('scatter').scatter,true);
});
test('default presentation retains existing established labels',()=>{
 const cfg=norm({});assert.equal(cfg.showValueLabels,true);assert.equal(cfg.showCenterTotal,true);
 assert.equal(cfg.showParentLabels,true);assert.equal(cfg.showChildLabels,true);
 assert.equal(cfg.showDotValues,false);assert.equal(cfg.showGroupedValues,false);assert.equal(cfg.showCellValues,false);
 assert.equal(cfg.showRadialParentLabels,false);assert.equal(cfg.showRadialChildLabels,false);
 assert.equal(cfg.proportionalLabel,'none');assert.equal(cfg.stackedSegmentLabels,'none');
});
test('invalid option values fall back predictably',()=>{
 const cfg=norm({sliceLabelPosition:'lost',minLabelShare:-8,categoryAngle:'91',tileMinWidth:0,showCellValues:1});
 assert.equal(cfg.sliceLabelPosition,'inside');assert.equal(cfg.minLabelShare,8);assert.equal(cfg.categoryAngle,'default');assert.equal(cfg.tileMinWidth,65);assert.equal(cfg.showCellValues,false);
});
test('percent labels and absolute labels are presentation-only',()=>{
 assert.equal(chartsIISegmentLabel('percent',5,33.333),'33.3%');
 assert.equal(chartsIISegmentLabel('value',50,33.33),'50');
 assert.equal(chartsIISegmentLabel('none',50,33.33),'');
});
test('renderer toggles do not alter derivation or absence semantics',()=>{
 assert.match(code,/presentation\.showCellValues/);
 assert.match(code,/presentation\.showMedianLabels/);
 assert.match(code,/presentation\.showEndpointValues/);
 assert.match(code,/presentation\.showRadialParentLabels/);
 assert.match(code,/presentation\.showParentLabels/);
 assert.match(code,/presentation\.stackedSegmentLabels/);
 assert.match(code,/presentation\.showDotValues/);
});
