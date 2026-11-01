/* Timeline II — bounded, single-axis temporal field.
 * A point is a selectable event node; an interval is a selectable duration band.
 * Labels never determine temporal coordinates. This experimental view reads but
 * never modifies canonical Evidence, event identities, or mapped categories.
 * All input dates are positioned on Peridot's proleptic Gregorian calendar.
 */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {packTimelineIIMarks, TIMELINE_II_LANE_COUNT} from './peridotTimelineIIPacking.js';

const PALETTE = ['#A63D2B','#7C211E','#B85C38','#C49A3A','#7A7A32','#2F4A3E','#6B7F6B','#2F6F73','#5F7C8B','#4B5E8C','#6E4A7F','#9A4E68'];
const GLYPHS = ['■','▲','◆','★','+','×','⬡','✿','⌃','⌄','▮','▬'];
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const MIN_DAYS = 7;
const MAX_DAYS = 365.2425 * 250;
const TRACK_GUTTER = 76;
// II-1: 50% larger than the v16 marks (31px nodes and 23px bands).
// Secondary-axis lanes are bounded by the visible viewport, never by event count.
const NODE_DIAMETER = 46.5;
const BAND_THICKNESS = 34.5;
const LANE_COUNT = TIMELINE_II_LANE_COUNT; // Shared with pure Packing A module.
const MARK_PADDING = 9;

// Integer Gregorian day ordinal, including years preceding 1970. Date is never
// converted with the host's local timezone or interpreted as Julian.
function civilDay(year, month = 1, day = 1) {
  const y = year - (month <= 2 ? 1 : 0), era = Math.floor(y / 400), yoe = y - era * 400;
  const mp = month + (month > 2 ? -3 : 9);
  return era * 146097 + yoe * 365 + Math.floor(yoe / 4) - Math.floor(yoe / 100) + Math.floor((153 * mp + 2) / 5) + day - 1;
}
function fallbackParts(value) {
  const match = String(value ?? '').match(/^(-?\d{1,6})[-/](\d\d)[-/](\d\d)/);
  if (!match) return null;
  const year = Number(match[1]), month = Number(match[2]), day = Number(match[3]);
  return {year, month: month >= 1 && month <= 12 ? month : null, day: day >= 1 && day <= 31 ? day : null};
}
function getEndpoint(event, side) {
  const ep = event.temporalPresentationContract?.[side] || event.assertion?.[side];
  if (ep && Number.isInteger(ep.year)) return ep;
  return fallbackParts(side === 'start' ? (event.windowStart ?? event.playbackSortKey) : event.windowEnd);
}
function ordinal(ep) { return ep && Number.isInteger(ep.year) ? civilDay(ep.year, ep.month || 1, ep.day || 1) : null; }
function dateLabel(ep) {
  if (!ep || !Number.isInteger(ep.year)) return 'Date unspecified';
  if (!ep.month) return String(ep.year);
  if (!ep.day) return `${MONTHS[ep.month - 1]} ${ep.year}`;
  return `${ep.day} ${MONTHS[ep.month - 1]} ${ep.year}`;
}
function eventRows(events) {
  return (Array.isArray(events) ? events : []).map(event => {
    const start = getEndpoint(event, 'start'), end = getEndpoint(event, 'end');
    const a = ordinal(start) ?? ordinal(end);
    if (!Number.isFinite(a)) return null;
    const b = ordinal(end) ?? a;
    const period = event.temporalPresentationContract?.kind === 'period' || ['interval','openInterval'].includes(event.temporalKind);
    const member = event.categoryMemberships?.[0];
    const category = member ? `${member.fieldKey}:${member.value}` : 'Uncategorized';
    const row = event.row || {};
    const title = String(event.subject?.label || row.title || row.Title || row.name || row.Name || event.temporalRole || 'Untitled event');
    const uncertain = !start?.month || !start?.day || /circa|approximate|partial|uncertain/i.test(`${event.temporalShape} ${event.qualifier}`);
    const contract = event.temporalPresentationContract;
    return {event,start,end,day: Math.min(a,b),endDay:period ? Math.max(a,b) : a,period,category,title,uncertain,
      openStart: Boolean(contract?.openStart), openEnd: Boolean(contract?.openEnd)};
  }).filter(Boolean).sort((a,b) => a.day - b.day || String(a.event.id).localeCompare(String(b.event.id)));
}
function calendarTicks(lower, upper, pixels) {
  const yearWidth = pixels * 365.2425 / (upper - lower);
  const step = yearWidth > 155 ? 1 : yearWidth > 76 ? 2 : yearWidth > 32 ? 5 : yearWidth > 14 ? 10 : yearWidth > 5 ? 25 : 50;
  const ticks = [];
  // Use the civil algorithm's exact position, not an approximate year-to-pixel mapping.
  const roughYear = Math.floor(lower / 365.2425);
  for (let year = Math.floor((roughYear - 5) / step) * step; year * 365.2425 < upper + 3650; year += step) {
    const day = civilDay(year);
    if (day >= lower && day <= upper) ticks.push({day,label:String(year),major:true});
    if (ticks.length > 100) break;
  }
  // Month/day ticks when a visible calendar window is short enough.
  const duration = upper - lower;
  if (duration <= 420) {
    const approxYear = Math.floor(lower / 365.2425);
    for (let year = approxYear - 3; year <= approxYear + 6; year++) {
      for (let month = 1; month <= 12; month++) {
        const day = civilDay(year, month);
        if (day > lower && day < upper) ticks.push({day,label:`${MONTHS[month-1]} ${year}`,major:month===1});
      }
    }
  }
  if (duration <= 35) {
    const stepDay = duration <= 12 ? 1 : 7;
    for (let day = Math.ceil(lower / stepDay) * stepDay; day < upper; day += stepDay) {
      ticks.push({day,label:'',major:false});
    }
  }
  return ticks.sort((a,b)=>a.day-b.day);
}

function spanCaption(days) {
  if (days <= 7.01) return '1 week';
  if (days < 365) return `${Math.round(days)} days`;
  if (days < 730) return '1 year';
  return `${Math.round(days/365.2425)} years`;
}

export function PeridotTimelineII({events = [],selectedEventId = '',onEventClick}) {
  const [direction,setDirection] = useState('horizontal');
  const [visibleDays,setVisibleDays] = useState(365.2425 * 75);
  const [center,setCenter] = useState(null);
  const [showPoints,setShowPoints] = useState(true);
  const [showPeriods,setShowPeriods] = useState(true);
  const [localSelected,setLocalSelected] = useState('');
  const [hoveredId,setHoveredId] = useState('');
  const [hoverPosition,setHoverPosition] = useState(null);
  const [size,setSize] = useState({width:1200,height:500});
  const viewportRef = useRef(null);
  // The lane map is local to this Timeline II instance. It never modifies data.
  // Pan preserves assignments; changes in scale, orientation, dataset, or
  // cross-axis geometry start a new layout context.
  const packingHistoryRef = useRef({context:null,lanes:new Map()});
  const all = useMemo(()=>eventRows(events),[events]);
  const categoryKeys = useMemo(()=>[...new Set(all.map(item=>item.category))].sort(),[all]);
  const colors = useMemo(()=>new Map(categoryKeys.map((key,i)=>[key,{color:PALETTE[i % PALETTE.length],symbol:GLYPHS[i % GLYPHS.length]}])),[categoryKeys]);
  const filtered = useMemo(()=>all.filter(item=>item.period?showPeriods:showPoints),[all,showPoints,showPeriods]);
  const min = all.length ? all[0].day : 0;
  const max = all.length ? Math.max(...all.map(item=>item.endDay)) : 365;
  const domainCenter = (min + max) / 2;
  const actualCenter = center === null ? (min + Math.min(MAX_DAYS,max-min)/2) : center;
  const half = visibleDays / 2;
  const safeCenter = Math.min(max + half, Math.max(min - half, actualCenter));
  const lower = safeCenter-half, upper = safeCenter+half;
  const horizontal = direction === 'horizontal';
  const length = Math.max(120,horizontal?size.width:size.height) - TRACK_GUTTER - 18;
  // Lanes fill the full *perpendicular* plotting dimension. The only navigation
  // dimension remains chronological; no secondary-axis overflow is created.
  const secondary = Math.max(90,horizontal?size.height:size.width);
  const crossStart = horizontal ? 91 : 102;
  const crossEnd = secondary - (horizontal ? 78 : 54);
  const crossSpan = Math.max(0, crossEnd - crossStart);
  const laneCount = LANE_COUNT;
  const lanePosition = lane => laneCount === 1
    ? crossStart + crossSpan / 2
    : crossStart + lane * crossSpan / (laneCount - 1);
  const pos = day => TRACK_GUTTER + (day - lower) / visibleDays * length;
  // Select only events whose actual times intersect the visible chronology.
  const inWindow = filtered.filter(item => item.endDay >= lower && item.day <= upper);
  // Packing A: globally aware temporal-neighborhood placement followed by
  // bounded deterministic improvement. The chronological coordinate is fixed.
  const footprintItems = inWindow.map(item => {
    const start = pos(item.day), finish = pos(item.endDay);
    return {id:item.event.id,start,finish,period:item.period};
  });
  const lanePositions = Array.from({length:laneCount},(_,lane)=>lanePosition(lane));
  const packingContext = {
    events, direction, visibleDays,
    crossStart, crossSpan, showPoints, showPeriods,
  };
  const history = packingHistoryRef.current;
  const sameContext = history.context
    && history.context.events === packingContext.events
    && history.context.direction === packingContext.direction
    && history.context.visibleDays === packingContext.visibleDays
    && history.context.crossStart === packingContext.crossStart
    && Math.abs(history.context.crossSpan - packingContext.crossSpan) < 1
    && history.context.showPoints === packingContext.showPoints
    && history.context.showPeriods === packingContext.showPeriods;
  if (!sameContext) {
    history.context = packingContext;
    history.lanes = new Map();
  }
  const lanes = packTimelineIIMarks(footprintItems,lanePositions,{
    nodeDiameter:NODE_DIAMETER,bandThickness:BAND_THICKNESS,padding:MARK_PADDING,sweeps:2,
    lockedLanes:history.lanes,
  });
  inWindow.forEach((item,index)=>history.lanes.set(String(item.event.id),lanes[index]));
  const packed = inWindow.map((item,index)=>({
    ...item,lane:lanes[index],start:footprintItems[index].start,finish:footprintItems[index].finish,
  }));
  const selected = all.find(item=>item.event.id === (selectedEventId || localSelected));
  const hovered = all.find(item=>item.event.id === hoveredId);
  const ticks = calendarTicks(lower,upper,length);
  useEffect(()=>{
    const el=viewportRef.current;
    if(!el)return undefined;
    const update=()=>setSize({width:el.clientWidth,height:el.clientHeight});
    update();
    const observer = typeof ResizeObserver!=='undefined' ? new ResizeObserver(update) : null;
    observer?.observe(el);
    return ()=>observer?.disconnect();
  },[]);
  const zoomBy = factor => setVisibleDays(days=>Math.max(MIN_DAYS,Math.min(MAX_DAYS,days*factor)));
  const panBy = delta => setCenter(current=>{
    const old=current===null?actualCenter:current;
    return Math.max(min-visibleDays/2,Math.min(max+visibleDays/2,old+delta));
  });
  const wheel = event=>{
    // One chronological navigation axis regardless of input device direction.
    // Shift and trackpad horizontal scroll work in horizontal mode too.
    if(event.ctrlKey||event.metaKey) return;
    const delta = Math.abs(event.deltaY)>=Math.abs(event.deltaX)?event.deltaY:event.deltaX;
    if(!delta)return;
    event.preventDefault();
    const windowLength=Math.max(1,horizontal?size.width:size.height);
    panBy(delta / windowLength * visibleDays * 0.8);
  };
  useEffect(()=>{
    const element=viewportRef.current;
    if(!element)return undefined;
    const handler=e=>wheelRef.current(e);
    element.addEventListener('wheel',handler,{passive:false});
    return ()=>element.removeEventListener('wheel',handler);
  },[]);
  const wheelRef=useRef(null);
  wheelRef.current=wheel;
  const select=item=>{setLocalSelected(item.event.id);onEventClick?.(item.event);};
  const placeHover = event => {
    const element = viewportRef.current;
    if (!element) return;
    const rect = element.getBoundingClientRect();
    // Keep the 260px hover dossier inside the plotting viewport.
    setHoverPosition({
      x: Math.max(8,Math.min(rect.width - 272,event.clientX - rect.left + 18)),
      y: Math.max(8,Math.min(rect.height - 110,event.clientY - rect.top + 18)),
    });
  };
  const focusHover = event => {
    const rect=event.currentTarget.getBoundingClientRect();
    placeHover({clientX:rect.left+rect.width/2,clientY:rect.top+rect.height/2});
  };
  if(!all.length)return <div className="flex min-h-0 flex-1 items-center justify-center rounded-xl bg-[#eee0c7] text-[#4b4236]">No positionable events available to Timeline II.</div>;
  return <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-[#b4a087] bg-[#eee0c7] text-[#302b24]">
    <div className="z-10 flex shrink-0 flex-wrap items-center gap-3 border-b border-[#b4a087] bg-[#fbf7ed] px-4 py-2 text-xs">
      <strong className="mr-2 font-serif text-lg text-[#7C211E]">Timeline II</strong>
      <div className="flex overflow-hidden rounded-full border border-[#b4a087]">{['horizontal','vertical'].map(mode=><button key={mode} type="button" onClick={()=>setDirection(mode)} className={`px-3 py-1.5 font-semibold capitalize ${direction===mode?'bg-[#253C32] text-white':'bg-[#fbf7ed]'}`}>{mode}</button>)}</div>
      <div className="flex items-center gap-2"><button type="button" aria-label="Zoom out" disabled={visibleDays >= MAX_DAYS} onClick={()=>zoomBy(2)} className="rounded border border-[#b4a087] px-2 py-1 disabled:opacity-40">−</button><span className="min-w-[72px] text-center">{spanCaption(visibleDays)}</span><button type="button" aria-label="Zoom in" disabled={visibleDays <= MIN_DAYS} onClick={()=>zoomBy(0.5)} className="rounded border border-[#b4a087] px-2 py-1 disabled:opacity-40">+</button></div>
      <label className="flex items-center gap-1"><input type="checkbox" checked={showPoints} onChange={e=>setShowPoints(e.target.checked)}/>Dates</label>
      <label className="flex items-center gap-1"><input type="checkbox" checked={showPeriods} onChange={e=>setShowPeriods(e.target.checked)}/>Periods</label>
      <span className="ml-auto text-[#6b5d4c]">{inWindow.length} in view · {all.length} total</span>
    </div>
    <div ref={viewportRef} role="region" aria-label={`Timeline II ${direction} chronological field; scroll through time`} tabIndex={0} onKeyDown={e=>{
      if(['ArrowLeft','ArrowUp','ArrowRight','ArrowDown'].includes(e.key)){e.preventDefault();panBy((e.key==='ArrowLeft'||e.key==='ArrowUp'?-1:1)*visibleDays*0.12);}
      if(e.key==='Home'){e.preventDefault();setCenter(min+visibleDays/2);}
      if(e.key==='End'){e.preventDefault();setCenter(max-visibleDays/2);}
    }} className="relative min-h-0 flex-1 overflow-hidden outline-none focus-visible:ring-2 focus-visible:ring-[#7C211E]">
      <div className="absolute inset-0 pointer-events-none" style={{background:'#eee0c7'}}/>
      <div className="pointer-events-none absolute" style={horizontal?{top:44,left:TRACK_GUTTER,right:18,borderTop:'1px solid #a99373'}:{left:TRACK_GUTTER,top:18,bottom:18,borderLeft:'1px solid #a99373'}} />
      {ticks.map((tick,index)=>{
        const p=pos(tick.day);
        return <div key={`${tick.day}-${index}`} className="pointer-events-none absolute" style={horizontal?{left:p,top:44,bottom:0,borderLeft:`1px solid ${tick.major?'#bbaa90':'#d2c2a8'}`}:{top:p,left:TRACK_GUTTER,right:0,borderTop:`1px solid ${tick.major?'#bbaa90':'#d2c2a8'}`}}>
          {tick.label?<span className="absolute whitespace-nowrap text-[10px] font-semibold text-[#655646]" style={horizontal?{top:-19,left:3}:{left:-TRACK_GUTTER+5,top:-8}}>{tick.label}</span>:null}
        </div>;
      })}
      {packed.map(item=>{
        const categoryStyle=colors.get(item.category)||{color:'#253C32',symbol:'●'};
        const active=item.event.id === (selectedEventId || localSelected);
        const hoveredMark=item.event.id === hoveredId;
        const secondaryPos=lanePosition(item.lane);
        const bandStart=Math.max(TRACK_GUTTER,item.start);
        const bandEnd=Math.min(TRACK_GUTTER+length,item.finish);
        const bandLength=Math.max(BAND_THICKNESS,bandEnd-bandStart);
        const fullLabel=item.period
          ? `${item.title} · ${item.event.temporalRole||'Period'} · ${dateLabel(item.start)} – ${dateLabel(item.end)}`
          : `${item.title} · ${item.event.temporalRole||'Event'} · ${dateLabel(item.start)}`;
        const interactiveProps={
          onMouseEnter:event=>{setHoveredId(item.event.id);placeHover(event);},
          onMouseMove:placeHover,
          onMouseLeave:()=>{setHoveredId(current=>current===item.event.id?'':current);setHoverPosition(null);},
          onFocus:event=>{setHoveredId(item.event.id);focusHover(event);},
          onBlur:()=>{setHoveredId(current=>current===item.event.id?'':current);setHoverPosition(null);},
          onClick:()=>select(item),
        };
        if(item.period) return (
          <button key={item.event.id} type="button" {...interactiveProps}
            aria-label={`Period: ${fullLabel}`}
            className="group absolute z-[2] rounded-full border-0 text-left shadow-sm transition hover:brightness-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#7C211E]"
            style={horizontal
              ? {left:bandStart,top:secondaryPos-BAND_THICKNESS/2,width:bandLength,height:BAND_THICKNESS}
              : {top:bandStart,left:secondaryPos-BAND_THICKNESS/2,height:bandLength,width:BAND_THICKNESS}
            }
          >
            <span className="pointer-events-none absolute inset-0 rounded-full" style={{background:`color-mix(in srgb, ${categoryStyle.color} 58%, #eee0c7)`,border:`2px ${item.uncertain?'dashed':'solid'} ${categoryStyle.color}`,borderRadius:999,boxShadow:(active||hoveredMark)?`0 0 0 3px ${categoryStyle.color}`:undefined}} />
            <span className="pointer-events-none absolute rounded-full border-2" style={horizontal
              ? {left:2,top:4,width:BAND_THICKNESS-12,height:BAND_THICKNESS-12,background:item.openStart?'#eee0c7':categoryStyle.color,borderColor:categoryStyle.color}
              : {left:4,top:2,width:BAND_THICKNESS-12,height:BAND_THICKNESS-12,background:item.openEnd?'#eee0c7':categoryStyle.color,borderColor:categoryStyle.color}
            } />
            <span className="pointer-events-none absolute rounded-full border-2" style={horizontal
              ? {right:2,top:4,width:BAND_THICKNESS-12,height:BAND_THICKNESS-12,background:item.openEnd?'#eee0c7':categoryStyle.color,borderColor:categoryStyle.color}
              : {left:4,bottom:2,width:BAND_THICKNESS-12,height:BAND_THICKNESS-12,background:item.openStart?'#eee0c7':categoryStyle.color,borderColor:categoryStyle.color}
            } />
          </button>
        );
        return (
          <button key={item.event.id} type="button" {...interactiveProps}
            aria-label={`Event: ${fullLabel}`}
            className="absolute z-[3] flex items-center justify-center rounded-full border-[3px] font-bold shadow-md transition hover:scale-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#7C211E]"
            style={{
              ...(horizontal
                ? {left:item.start-NODE_DIAMETER/2,top:secondaryPos-NODE_DIAMETER/2}
                : {top:item.start-NODE_DIAMETER/2,left:secondaryPos-NODE_DIAMETER/2}),
              width:NODE_DIAMETER,height:NODE_DIAMETER,
              background:item.uncertain?'#eee0c7':categoryStyle.color,
              color:item.uncertain?categoryStyle.color:'white',
              borderColor:categoryStyle.color,
              fontSize:22,
              outline:(active||hoveredMark)?'3px solid #7C211E':undefined,
            }}
          >{categoryStyle.symbol}</button>
        );
      })}
      {hovered && hoverPosition ? (
        <div role="status" aria-live="polite" className="pointer-events-none absolute z-[15] w-[260px] rounded-lg border border-[#b4a087] bg-[#fbf7ed]/95 px-3 py-2 text-[#302b24] shadow-md"
          style={{left:hoverPosition.x,top:hoverPosition.y}}>
          <div className="text-[10px] font-extrabold uppercase tracking-wider text-[#7C211E]">{hovered.event.temporalRole|| (hovered.period?'Period':'Event')}{hovered.uncertain?' · date precision qualified':''}</div>
          <div className="text-sm font-bold">{hovered.title}</div>
          <div className="text-xs">{dateLabel(hovered.start)}{hovered.period?` – ${dateLabel(hovered.end)}`:''}</div>
          <div className="text-[10px] text-[#695e50]">Select a mark to open its Inspector record</div>
        </div>
      ) : null}
      <div className="pointer-events-none absolute bottom-2 right-3 rounded bg-[#faf5eb]/90 px-2 py-1 text-[10px] text-[#695e50]">Scroll or use arrow keys to move through time</div>
    </div>
    {selected?<div className="shrink-0 border-t border-[#b4a087] bg-[#fbf7ed] px-4 py-2 text-xs"><strong>{selected.title}</strong> · {selected.event.temporalRole||'Event'} · {dateLabel(selected.start)}{selected.period?` – ${dateLabel(selected.end)}`:''}</div>:null}
  </div>;
}
