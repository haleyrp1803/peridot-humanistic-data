import React, {useState} from 'react';
import {RAINBOW_CATEGORY_COLORS} from './peridotSharedCategoryColors.js';
import {chartsIIStableColor} from './chartsIIAppearance.js';
import {PERIDOT_CHART_SERIES_COLORS} from './peridotTheme.js';

export function PeridotChartsIIAppearance({labels=[],defaults={},overrides={},onChange}) {
  const [selected,setSelected]=useState('');
  const active=labels.includes(selected)?selected:labels[0];
  const selectColor=color=>{if(!active)return;onChange({...overrides,[active]:color});};
  return <section className="mt-3 space-y-3 text-[12px] text-[#344b39]" aria-label="Chart series color appearance">
    <p className="text-[11px] text-[#52675a]">Colors come from Timeline II’s shared selection. Select a series, then choose its color. Changes only affect this chart and its PNG export.</p>
    <div className="space-y-1"><label htmlFor="chartsii-color-series" className="font-semibold">Series or category</label>
      <select id="chartsii-color-series" className="w-full rounded border border-[#cdb48b] bg-[#fffdf7] p-2" value={active||''} onChange={e=>setSelected(e.target.value)} disabled={!labels.length}>
        {!labels.length && <option value="">No chartable series</option>}
        {labels.map(label=><option key={label} value={label}>{label}</option>)}
      </select>
    </div>
    {active && <div className="flex items-center gap-2 text-[11px]">
      <span className="h-5 w-5 shrink-0 rounded border border-[#b3a182]" style={{background:chartsIIStableColor(active,labels.indexOf(active),defaults,overrides,PERIDOT_CHART_SERIES_COLORS)}} />
      <span className="min-w-0 truncate" title={active}>{active}</span>
      {overrides[active] && <span className="ml-auto shrink-0 font-semibold">Custom</span>}
    </div>}
    <fieldset disabled={!active}><legend className="mb-2 font-semibold">Timeline color library</legend>
      <div className="grid grid-cols-8 gap-1.5" aria-label="Timeline category color grid">
        {RAINBOW_CATEGORY_COLORS.map(color=><button key={color} type="button" title={color} aria-label={`Assign ${color} to ${active}`} aria-pressed={Boolean(active && overrides[active]?.toLowerCase()===color.toLowerCase())} onClick={()=>selectColor(color)}
          className={`aspect-square min-w-0 rounded border-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#7C211E] ${overrides[active]?.toLowerCase()===color.toLowerCase()?'border-[#302b24] ring-2 ring-[#b17b2c]':'border-[#fffdf8]'}`} style={{background:color}}>
          {overrides[active]?.toLowerCase()===color.toLowerCase() && <span className="font-bold text-white [text-shadow:0_1px_2px_#000]">✓</span>}
        </button>)}
      </div>
    </fieldset>
    <div className="flex flex-wrap items-center justify-between gap-2">
      <button type="button" className="rounded border border-[#b4a087] bg-[#fbf7ed] px-2 py-1 font-semibold disabled:opacity-50" disabled={!active || !overrides[active]} onClick={()=>{const next={...overrides};delete next[active];onChange(next);}}>Reset selected</button>
      <button type="button" className="rounded border border-[#b4a087] bg-[#fbf7ed] px-2 py-1 font-semibold disabled:opacity-50" disabled={!Object.keys(overrides).length} onClick={()=>onChange({})}>Reset chart colors</button>
    </div>
  </section>;
}
