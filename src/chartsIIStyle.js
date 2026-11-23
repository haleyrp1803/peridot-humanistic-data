/* Charts II B4.7: visual-only, chart-specific style settings. All defaults match
 * the pre-B4.7 renderers; keep these values out of derivation dependencies. */
export const CHART_STYLE_CONTROLS = Object.freeze({
  line: ['lineWidth','pointSize','showMarkers'],
  multiLine: ['lineWidth','pointSize','showMarkers'],
  area: ['fillOpacity','lineWidth'],
  stackedArea: ['fillOpacity','lineWidth'],
  bar: ['cornerRadius','markOpacity'],
  groupedBar: ['cornerRadius','markOpacity'],
  stackedBar: ['markOpacity'],
  histogram: ['cornerRadius','markOpacity'],
  scatter: ['pointScale','markOpacity','outlineWidth'],
  dot: ['pointSize','outlineWidth'],
  slope: ['lineWidth','pointSize'],
  box: ['boxWidth','pointSize'],
  heatmap: ['cellGap','markOpacity'],
  treemap: ['tileGap','outlineWidth'],
  sunburst: ['outlineWidth','markOpacity'],
  pie: ['outlineWidth','markOpacity'],
});
export const CHART_STYLE_FIELDS = Object.freeze({
  lineWidth:{label:'Line / boundary thickness',type:'range',min:0.25,max:6,step:0.05,default:3,unit:'px'},
  pointSize:{label:'Marker size',type:'range',min:2,max:10,step:0.5,default:5,unit:'px'},
  showMarkers:{label:'Show point markers',type:'checkbox',default:true},
  fillOpacity:{label:'Fill opacity',type:'range',min:0.15,max:1,step:0.05,default:0.75,unit:''},
  markOpacity:{label:'Mark opacity',type:'range',min:0.2,max:1,step:0.05,default:0.9,unit:''},
  cornerRadius:{label:'Bar corner rounding',type:'range',min:0,max:12,step:1,default:8,unit:'px'},
  pointScale:{label:'Point / bubble size',type:'range',min:0.5,max:2,step:0.1,default:1,unit:'×'},
  outlineWidth:{label:'Outline thickness',type:'range',min:0,max:4,step:0.1,default:1,unit:'px'},
  boxWidth:{label:'Box width',type:'range',min:0.5,max:1.5,step:0.1,default:1,unit:'×'},
  cellGap:{label:'Cell spacing',type:'range',min:0,max:8,step:1,default:2,unit:'px'},
  tileGap:{label:'Tile spacing',type:'range',min:0,max:8,step:0.5,default:2,unit:'px'},
});
const FAMILY_DEFAULTS = Object.freeze({
  line:{lineWidth:4,pointSize:5}, multiLine:{lineWidth:3,pointSize:4},
  area:{lineWidth:2.4,fillOpacity:0.35}, stackedArea:{lineWidth:0.8,fillOpacity:0.75},
  slope:{lineWidth:2.2,pointSize:5}, dot:{pointSize:6.2,outlineWidth:1.1},
  box:{pointSize:3.5}, scatter:{markOpacity:0.55},
  groupedBar:{cornerRadius:3,markOpacity:1}, stackedBar:{markOpacity:1},
  heatmap:{markOpacity:1}, pie:{markOpacity:1}, sunburst:{markOpacity:1},
  treemap:{outlineWidth:2},
});
export function chartStyleDefault(chartType,key) {
  return FAMILY_DEFAULTS[chartType]?.[key] ?? CHART_STYLE_FIELDS[key]?.default;
}
export function chartStyleOptions(chartType) { return CHART_STYLE_CONTROLS[chartType] || []; }
export function chartStyleValue(style, key, fallback) {
  const spec = CHART_STYLE_FIELDS[key];
  if (!spec) return fallback;
  const input = style?.[key];
  if (spec.type === 'checkbox') return typeof input === 'boolean' ? input : fallback;
  const n=Number(input);
  return input != null && Number.isFinite(n) ? Math.min(spec.max,Math.max(spec.min,n)) : fallback;
}
export function updateChartStyle(current, key, value, chartType) {
  const spec=CHART_STYLE_FIELDS[key];
  if(!spec) return {...current};
  const next={...current};
  const v=spec.type==='checkbox'?Boolean(value):chartStyleValue({[key]:value},key,spec.default);
  if(v===chartStyleDefault(chartType,key)) delete next[key]; else next[key]=v;
  return next;
}
