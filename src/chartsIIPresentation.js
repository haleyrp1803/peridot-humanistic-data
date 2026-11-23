/* Chart-local presentational preferences. Never pass these into data derivation. */
export const CHARTS_II_PRESENTATION_DEFAULTS = Object.freeze({
  showTitle:true, title:'', showSubtitle:true, showSummary:true,
  showValueLabels:true, labelDensity:'standard', textScale:1,
  showXAxisLabel:false, xAxisLabel:'', showYAxisLabel:false, yAxisLabel:'',
  categoryAngle:'default', showRowLabels:true, showColumnLabels:true,
  showCellValues:false, showDotValues:false, showGroupedValues:false, showMedianLabels:false, showQuartileLabels:false,
  showOutlierCounts:true, showEndpointValues:false, showDirectSeriesLabels:false,
  showPointLabels:false, pointLabelMode:'record', pointLabelField:'',
  showParentLabels:true, showChildLabels:true, showRadialParentLabels:false, showRadialChildLabels:false, showCenterTotal:true,
  proportionalLabel:'none', sliceLabelPosition:'inside', minLabelShare:8,
  tileLabelMode:'name-value', tileMinWidth:65,
  showStackedTotals:false, stackedSegmentLabels:'none',
  showCategoryNames:true, showPeriodLabels:true,
});
export const CHARTS_II_DENSITIES=Object.freeze(['compact','standard','detailed']);
export const CHARTS_II_TEXT_SCALES=Object.freeze([0.9,1,1.1,1.2]);
const BOOL_FIELDS=['showTitle','showSubtitle','showSummary','showValueLabels','showXAxisLabel','showYAxisLabel','showRowLabels','showColumnLabels','showCellValues','showDotValues','showGroupedValues','showMedianLabels','showQuartileLabels','showOutlierCounts','showEndpointValues','showDirectSeriesLabels','showPointLabels','showParentLabels','showChildLabels','showRadialParentLabels','showRadialChildLabels','showCenterTotal','showStackedTotals','showCategoryNames','showPeriodLabels'];
export function normalizeChartsIIPresentation(input={}) {
 const out={...CHARTS_II_PRESENTATION_DEFAULTS};
 if(!input||typeof input!=='object') return out;
 for(const key of BOOL_FIELDS) if(typeof input[key]==='boolean')out[key]=input[key];
 for(const key of ['title','xAxisLabel','yAxisLabel','pointLabelField']) if(typeof input[key]==='string')out[key]=input[key].slice(0,160);
 if(CHARTS_II_DENSITIES.includes(input.labelDensity))out.labelDensity=input.labelDensity;
 if(CHARTS_II_TEXT_SCALES.includes(input.textScale))out.textScale=input.textScale;
 const enums={categoryAngle:['default','0','45','90'],pointLabelMode:['record'],sliceLabelPosition:['inside','outside'],proportionalLabel:['none','name','value','percent','name-percent'],tileLabelMode:['name','name-value','name-percent'],stackedSegmentLabels:['none','value','percent']};
 for(const [key,choices] of Object.entries(enums))if(choices.includes(input[key]))out[key]=input[key];
 if([3,5,8,12,18].includes(input.minLabelShare))out.minLabelShare=input.minLabelShare;
 if([45,65,90,120].includes(input.tileMinWidth))out.tileMinWidth=input.tileMinWidth;
 return out;
}
export function chartsIIPresentationCapabilities(chartType='') {
 const type=String(chartType);
 const radial=['pie','sunburst','treemap'].includes(type);
 const axes=!radial;
 return {
  axes, categoricalAngle:['bar','groupedBar','stackedBar','histogram','box'].includes(type),
  density:axes, periodLabels:['line','multiLine','area','stackedArea','slope'].includes(type),
  valueLabels:['bar','histogram','stackedBar'].includes(type),
  stackedSegmentLabels:type==='stackedBar', stackedTotals:type==='stackedArea',
  directSeries:['multiLine','slope'].includes(type), endpointValues:['line','multiLine','slope','area'].includes(type),
  box:type==='box', scatter:type==='scatter', heatmap:type==='heatmap',
  radial:type==='pie', sunburst:type==='sunburst', treemap:type==='treemap',
  categoricalNames:['bar','groupedBar','stackedBar','dot','box'].includes(type), grouped:type==='groupedBar', dot:type==='dot',
 };
}
export function chartsIIPresentationTickCount(presentation,standard=7){
 const density=normalizeChartsIIPresentation(presentation).labelDensity;
 return density==='compact'?Math.max(2,Math.round(standard*0.6)):density==='detailed'?Math.round(standard*1.5):standard;
}
export function chartsIIPresentationTitle(presentation,originalTitle){
 const state=normalizeChartsIIPresentation(presentation);
 return state.showTitle?(state.title.trim()||String(originalTitle||'')):'';
}
export function chartsIIPresentationFontCSS(scale=1){
 if(scale===1)return '';
 const values=[8.6,8.8,9,9.25,9.8,10,10.5,11,11.2,11.5,12,12.5,14,18,20.5];
 return values.map(n=>`text[font-size="${n}"]{font-size:${(n*scale).toFixed(2)}px}`).join('\n');
}
export function chartsIISegmentLabel(format, value, percent) {
 if(format==='value')return Number(value).toLocaleString(undefined,{maximumFractionDigits:2});
 if(format==='percent')return `${Number(percent).toLocaleString(undefined,{maximumFractionDigits:1})}%`;
 return '';
}
