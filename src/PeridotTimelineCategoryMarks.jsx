/* Timeline II presentation helpers — no canonical Evidence or data mutations.
 * Category colors and names are resolved exclusively by the Pass 1 configuration
 * model; only the compact mark design (including overflow count) lives here.
 */
import React from 'react';
import { TIMELINE_UNCATEGORIZED_COLOR } from './peridotTimelineCategoryConfiguration.js';
import { PeridotCategorySymbolShape } from './PeridotTimelineCategorySymbols.jsx';

export function timelineMarkCategories(eventId, categoriesById, eventCategoriesById) {
  const membership = eventCategoriesById.get(eventId);
  return (membership?.categoryIds || []).map(id => categoriesById.get(id)).filter(Boolean);
}

export function timelineMarkColors(categories) {
  return categories.length ? categories.slice(0,4).map(category => category.color) : [TIMELINE_UNCATEGORIZED_COLOR];
}

export function timelinePeriodFill(categories) {
  const colors=timelineMarkColors(categories);
  if(colors.length===1) return `color-mix(in srgb, ${colors[0]} 72%, #eee0c7)`;
  // Repeating stripes carry memberships, not temporal phases. Rotating the
  // stripe orientation is a presentation-only matter for vertical timelines.
  const segment=12;
  return `repeating-linear-gradient(135deg, ${colors.map((color,i)=>`${color} ${i*segment}px ${(i+1)*segment}px`).join(', ')})`;
}

export function timelineCategoryDescription(categories) {
  return categories.length ? `Categories: ${categories.map(c=>`${c.label} (${c.sourceLabel}: ${c.sourceValue})`).join('; ')}` : 'Uncategorized';
}

function wedgePath(index,n) {
  const a=-Math.PI/2+index*2*Math.PI/n;
  const b=-Math.PI/2+(index+1)*2*Math.PI/n;
  const x1=24+23*Math.cos(a),y1=24+23*Math.sin(a);
  const x2=24+23*Math.cos(b),y2=24+23*Math.sin(b);
  return `M24 24L${x1} ${y1}A23 23 0 ${n===2?0:0} 1 ${x2} ${y2}Z`;
}

/** Points preserve a single logical mark even with 5+ memberships. */
export function TimelineCategoryPoint({categories,uncertain=false,displayMode='colors'}) {
  const visible=categories.slice(0,4);
  const colors=timelineMarkColors(categories);
  const n=colors.length;
  return <>
    <svg aria-hidden="true" focusable="false" viewBox="0 0 48 48" width="100%" height="100%" className="pointer-events-none absolute inset-0 overflow-visible rounded-full">
      {n===1 ? <circle cx="24" cy="24" r="23" fill={colors[0]}/> : colors.map((c,i)=><path key={i} d={wedgePath(i,n)} fill={c} stroke="#f8f2e8" strokeWidth=".8"/>)}
      {displayMode!=='colors' && visible.map((cat,i)=>{
        if(!cat?.symbol||cat.symbol==='none')return null;
        const angle=-Math.PI/2+(i+.5)*Math.PI*2/n;
        const x=n===1?24:24+12*Math.cos(angle), y=n===1?24:24+12*Math.sin(angle);
        const scale=n===1?1.25:n===2?.72:.51;
        return <g key={cat.id} transform={`translate(${x} ${y}) scale(${scale})`}><g transform="translate(-12 -12)"><PeridotCategorySymbolShape name={cat.symbol} color="white"/></g></g>;
      })}
      {uncertain?<circle cx="24" cy="24" r="20" fill="none" stroke="#fbf7ed" strokeWidth="1.4" strokeDasharray="3 3"/>:null}
    </svg>
    {categories.length>4?<span aria-hidden="true" className="pointer-events-none absolute -right-3 -top-2 rounded-full border border-[#755f48] bg-[#fbf7ed] px-1 text-[10px] font-black leading-4 text-[#302b24] shadow-sm">+{categories.length-4}</span>:null}
  </>;
}

/** The start badge is deliberately not a second selectable event. */
export function TimelinePeriodSymbolBadge({categories,horizontal=true,displayMode='colors'}) {
  if (displayMode==='colors') return null;
  const symbols=categories.slice(0,4).filter(c=>c.symbol&&c.symbol!=='none');
  if(!symbols.length)return null;
  const shown=symbols.length;
  return <span aria-hidden="true" className="pointer-events-none absolute z-[2] flex items-center justify-center rounded-full border-2 border-[#fbf7ed] bg-[#f5eddd] shadow-sm"
    style={horizontal?{left:0,top:'50%',transform:'translate(-15%, -50%)',width:28,height:28}:{top:0,left:'50%',transform:'translate(-50%, -15%)',width:28,height:28}}>
    <svg viewBox="0 0 28 28" width="23" height="23">
      {symbols.map((category,i)=>{
        const a=-Math.PI/2+(i+.5)*Math.PI*2/shown;
        const x=shown===1?14:14+6*Math.cos(a),y=shown===1?14:14+6*Math.sin(a);
        return <g key={category.id} transform={`translate(${x} ${y}) scale(${shown===1?.82:.48})`}><g transform="translate(-12 -12)"><PeridotCategorySymbolShape name={category.symbol} color={category.color}/></g></g>;
      })}
    </svg>
  </span>;
}
