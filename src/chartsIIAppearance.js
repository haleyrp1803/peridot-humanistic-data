/* Charts II Appearance: presentation-only series identity. Never mutates data. */
export function getChartsIIAppearanceLabels(chart) {
  if (!chart) return [];
  const type=chart.chartType;
  const items = type==='box'?chart.boxes : type==='dot'?chart.points : type==='slope'?chart.series
    : type==='scatter'?[{label:'All points'}] : type==='heatmap'?[{label:'Heatmap intensity'}]
    : type==='treemap'? (chart.parents || []).flatMap(p=>[p,...(p.children || [])])
    : type==='sunburst'? (chart.parents || []).flatMap(p=>[p,...(p.children || [])])
    : ['stackedArea','multiLine','groupedBar','stackedBar'].includes(type)? chart.series
    : ['area','line'].includes(type)?[{label:'Series'}]
    : chart.data || [];
  const seen=new Set();
  return (Array.isArray(items)?items:[]).map(item=>typeof item==='string'?item:item?.label).filter(label=>{
    const key=String(label||'').trim(); if(!key || seen.has(key)) return false;
    seen.add(key);return true;
  }).map(String);
}
export function chartsIIStableColor(label, fallbackIndex, defaults, overrides, palette) {
  const key=String(label||'');
  const chosen=overrides?.[key];
  if (typeof chosen==='string' && /^#[0-9a-f]{6}$/i.test(chosen)) return chosen;
  if (typeof defaults?.[key]==='string') return defaults[key];
  return palette[Math.abs(fallbackIndex||0)%palette.length];
}
