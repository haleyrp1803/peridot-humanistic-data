import React from 'react';
import {normalizeChartsIIPresentation,chartsIIPresentationCapabilities} from './chartsIIPresentation.js';
const base='w-full rounded border border-[#d5be98] bg-[#fffdf7] px-2 py-1.5 text-[12px] text-[#24382d]';
const options={
 angle:[['default','Chart default'],['0','Horizontal'],['45','45°'],['90','Vertical']],
 proportional:[['none','No labels'],['name','Category name'],['value','Absolute value'],['percent','Percentage'],['name-percent','Name and percentage']],
 tile:[['name','Category names'],['name-value','Names and values'],['name-percent','Names and percentages']],
 segment:[['none','No segment labels'],['value','Absolute value'],['percent','Percentage']],
};
export function PeridotChartsIIPresentation({presentation={},onChange,chartType,pointLabelOptions=[],orientation}) {
 const state=normalizeChartsIIPresentation(presentation);
 const c=chartsIIPresentationCapabilities(chartType);
 const set=(key,value)=>onChange({...presentation,[key]:value});
 const toggle=(key,label)=><label className="flex items-center gap-2"><input type="checkbox" checked={state[key]} onChange={e=>set(key,e.target.checked)}/>{label}</label>;
 const dropdown=(key,label,values)=><label className="block space-y-1"><span className="font-semibold">{label}</span><select aria-label={label} className={base} value={state[key]} onChange={e=>set(key,e.target.value)}>{values.map(([value,text])=><option key={value} value={value}>{text}</option>)}</select></label>;
 const section=(title,contents)=><div className="space-y-2 border-t border-[#e0d4bd] pt-3"><h5 className="font-semibold text-[#294637]">{title}</h5>{contents}</div>;
 return <section className="mt-4 space-y-3 border-t border-[#d5c7a8] pt-3 text-[12px] text-[#344b39]" aria-label="Chart labels and typography">
  <div className="flex items-center justify-between gap-2"><h4 className="font-semibold">Labels &amp; typography</h4><button type="button" className="rounded border border-[#b4a087] px-2 py-1 text-[11px]" disabled={!Object.keys(presentation).length} onClick={()=>onChange({})}>Reset labels</button></div>
  <p className="text-[11px] text-[#52675a]">Only controls relevant to this chart are shown. These settings affect presentation and PNG export, not the data.</p>
  {toggle('showTitle','Show chart title')}
  {state.showTitle&&<label className="block space-y-1"><span className="font-semibold">Chart title</span><input aria-label="Chart display title" className={base} value={state.title} placeholder="Use generated title" onChange={e=>set('title',e.target.value)}/></label>}
  {toggle('showSubtitle','Show chart subtitle')}
  {toggle('showSummary',c.radial||c.sunburst||c.treemap?'Show category summary':'Show summary / legend panel')}
  {c.axes&&section('Axes',<>
    {toggle('showXAxisLabel','Add horizontal-axis label')}
    {state.showXAxisLabel&&<input aria-label="Chart horizontal-axis label" className={base} value={state.xAxisLabel} placeholder="Horizontal axis" onChange={e=>set('xAxisLabel',e.target.value)}/>}
    {toggle('showYAxisLabel','Add vertical-axis label')}
    {state.showYAxisLabel&&<input aria-label="Chart vertical-axis label" className={base} value={state.yAxisLabel} placeholder="Vertical axis" onChange={e=>set('yAxisLabel',e.target.value)}/>}
    {c.density&&dropdown('labelDensity','Axis-label density',[['compact','Fewer labels'],['standard','Standard'],['detailed','More labels']])}
    {c.categoricalAngle && !(chartType==='bar' && orientation==='horizontal') && dropdown('categoryAngle','Category label angle',options.angle)}
  </>)}
  {c.categoricalNames&&section('Category labels',<>{toggle('showCategoryNames','Show category names')}</>)}
  {(c.valueLabels||c.endpointValues||c.directSeries||c.stackedTotals)&&section('Values and series',<>{c.valueLabels&&toggle('showValueLabels',chartType==='histogram'?'Show frequency values':chartType==='stackedBar'?'Show total values':'Show value labels')}{c.endpointValues&&toggle('showEndpointValues','Show last / endpoint values')}{c.directSeries&&toggle('showDirectSeriesLabels','Label series at endpoints (when space permits)')}{c.stackedTotals&&toggle('showStackedTotals','Show totals above stacked areas')}</>)}
  {c.grouped&&section('Grouped values',<>{toggle('showGroupedValues','Show values above grouped bars (when space permits)')}</>)}
  {c.dot&&section('Dot values',<>{toggle('showDotValues','Show values beside dots (when space permits)')}</>)}
  {c.periodLabels&&section('Time labels',<>{toggle('showPeriodLabels',chartType==='slope'?'Show comparison-period labels':'Show date / period labels')}</>)}
  {c.stackedSegmentLabels&&section('Stacked segments',<>{dropdown('stackedSegmentLabels','Segment labels',options.segment)}<p className="text-[11px] text-[#52675a]">Labels appear only when segments have enough space. Absolute values remain available on hover.</p></>)}
  {c.box&&section('Box plot statistics',<>{toggle('showMedianLabels','Show median values')}{toggle('showQuartileLabels','Show Q1 and Q3 values')}{toggle('showOutlierCounts','Show off-scale outlier counts')}</>)}
  {c.scatter&&section('Observation labels',<>{toggle('showPointLabels','Label individual points')}{state.showPointLabels&&<label className="block space-y-1"><span className="font-semibold">Point label field</span><select className={base} value={state.pointLabelField} onChange={e=>set('pointLabelField',e.target.value)}><option value="">Record number</option>{pointLabelOptions.map(item=><option key={item.key} value={item.key}>{item.label}</option>)}</select></label>}<p className="text-[11px] text-[#52675a]">Point labels appear only when 35 or fewer records are visible, to avoid overcrowding. Full values remain on hover.</p></>)}
  {c.heatmap&&section('Matrix labels',<>{toggle('showRowLabels','Show row labels')}{toggle('showColumnLabels','Show column labels')}{toggle('showCellValues','Show cell values when they fit')}</>)}
  {c.radial&&section('Slice labels',<>{dropdown('proportionalLabel','Slice label content',options.proportional)}{dropdown('sliceLabelPosition','Label position', [['inside','Inside slices'],['outside','Outside slices']])}<label className="block space-y-1"><span className="font-semibold">Minimum slice share for labels</span><select className={base} value={state.minLabelShare} onChange={e=>set('minLabelShare',Number(e.target.value))}>{[3,5,8,12,18].map(n=><option key={n} value={n}>{n}%</option>)}</select></label>{toggle('showCenterTotal','Show center total (Donut only)')}</>)}
  {c.sunburst&&section('Hierarchy labels',<>{toggle('showRadialParentLabels','Label parent ring (where space permits)')}{toggle('showRadialChildLabels','Label child ring (where space permits)')}{toggle('showCenterTotal','Show center total')}{dropdown('proportionalLabel','Label content',options.proportional)}</>)}
  {c.treemap&&section('Hierarchy labels',<>{toggle('showParentLabels','Show parent names')}{toggle('showChildLabels','Show child names')}{dropdown('tileLabelMode','Tile label content',options.tile)}<label className="block space-y-1"><span className="font-semibold">Minimum tile width for labels</span><select className={base} value={state.tileMinWidth} onChange={e=>set('tileMinWidth',Number(e.target.value))}>{[45,65,90,120].map(x=><option key={x} value={x}>{x} px</option>)}</select></label></>)}
  {section('Typography',<label className="block space-y-1"><span className="font-semibold">Chart text size</span><select aria-label="Chart text size" className={base} value={state.textScale} onChange={e=>set('textScale',Number(e.target.value))}><option value={0.9}>Compact (90%)</option><option value={1}>Default (100%)</option><option value={1.1}>Large (110%)</option><option value={1.2}>Extra large (120%)</option></select></label>)}
  <p className="text-[11px] text-[#52675a]">For publication-only captions, footnotes, and provenance, use Export PNG. The underlying measurements remain unchanged.</p>
 </section>;
}
