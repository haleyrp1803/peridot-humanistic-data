import React from 'react';
import {CHART_STYLE_FIELDS,chartStyleOptions,chartStyleDefault,chartStyleValue,updateChartStyle} from './chartsIIStyle.js';

export function PeridotChartsIIStyle({chartType,style={},onChange}) {
  const keys=chartStyleOptions(chartType);
  if(!keys.length) return null;
  return <section className="mt-4 space-y-3 border-t border-[#d5c7a8] pt-3 text-[12px] text-[#344b39]" aria-label="Chart-specific visual style">
    <div className="flex items-center justify-between gap-2">
      <h4 className="font-semibold">Marks &amp; layout</h4>
      <button type="button" className="rounded border border-[#b4a087] bg-[#fbf7ed] px-2 py-1 text-[11px] disabled:opacity-50" onClick={()=>onChange({})} disabled={!Object.keys(style).length}>Reset styles</button>
    </div>
    <p className="text-[11px] text-[#52675a]">These settings change how marks look, not the data, calculations, or observations included.</p>
    {keys.map(key=>{
      const spec=CHART_STYLE_FIELDS[key];
      const value=chartStyleValue(style,key,chartStyleDefault(chartType,key));
      return spec.type==='checkbox'
        ? <label key={key} className="flex items-center gap-2"><input type="checkbox" checked={value} onChange={event=>onChange(updateChartStyle(style,key,event.target.checked,chartType))}/>{spec.label}</label>
        : <label key={key} className="block space-y-1">
            <span className="flex items-center justify-between gap-2"><span className="font-semibold">{spec.label}</span><output className="tabular-nums">{value}{spec.unit}</output></span>
            <input className="w-full accent-[#7C211E]" type="range" min={spec.min} max={spec.max} step={spec.step} value={value} onChange={event=>onChange(updateChartStyle(style,key,Number(event.target.value),chartType))}/>
          </label>;
    })}
  </section>;
}
