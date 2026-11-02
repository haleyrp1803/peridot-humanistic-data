/* Timeline II — bounded, single-axis temporal field.
 * A point is a selectable event node; an interval is a selectable duration band.
 * Labels never determine temporal coordinates. This experimental view reads but
 * never modifies canonical Evidence, event identities, or mapped categories.
 * All input dates are positioned on Peridot's proleptic Gregorian calendar.
 */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {packTimelineIIMarks, TIMELINE_II_LANE_COUNT} from './peridotTimelineIIPacking.js';
import {ChronologyRuler, ChronologyTransport} from './PeridotChronologyDock.jsx';

const PALETTE = ['#A63D2B','#7C211E','#B85C38','#C49A3A','#7A7A32','#2F4A3E','#6B7F6B','#2F6F73','#5F7C8B','#4B5E8C','#6E4A7F','#9A4E68'];
const GLYPHS = ['■','▲','◆','★','+','×','⬡','✿','⌃','⌄','▮','▬'];
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const MIN_DAYS = 7;
const MAX_DAYS = 365.2425 * 250;
const TRACK_GUTTER = 76;
const CHRONOLOGY_RULER_HEIGHT = 92;
const CHRONOLOGY_RULER_WIDTH = 186;
const VERTICAL_CONTROL_MIN_HEIGHT = 218;
const VERTICAL_RULER_FOOTER = 30;
const VERTICAL_AXIS_START = 58;
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


// Invert the proleptic-Gregorian ordinal without relying on JavaScript Date.
function civilFromDay(ordinalDay) {
  let year = Math.floor(ordinalDay / 365.2425);
  while (civilDay(year + 1) <= ordinalDay) year++;
  while (civilDay(year) > ordinalDay) year--;
  let month = 1;
  while (month < 12 && civilDay(year, month + 1) <= ordinalDay) month++;
  return {year, month, day: Math.floor(ordinalDay - civilDay(year,month)) + 1};
}
function windowDate(day, span) {
  const date = civilFromDay(Math.floor(day));
  return span > 365 * 8 ? String(date.year)
    : span > 45 ? `${MONTHS[date.month - 1]} ${date.year}`
    : `${date.day} ${MONTHS[date.month - 1]} ${date.year}`;
}
// Ruler labels describe the same actual calendar positions as plotted marks.
function rulerTicks(lower,upper,pixels) {
  const span = upper - lower;
  const start = civilFromDay(Math.floor(lower));
  const end = civilFromDay(Math.ceil(upper));
  const out = [];
  if (span <= 35) {
    for (let day = Math.ceil(lower); day <= upper; day++) {
      const date = civilFromDay(day);
      out.push({day,label:span <= 12 || date.day === 1 || (date.day % 7 === 0) ? String(date.day) : '',major:date.day === 1});
    }
  } else if (span <= 365.2425 * 2) {
    let year=start.year, month=start.month;
    while (year < end.year + 1 && out.length < 36) {
      const day=civilDay(year,month);
      if (day >= lower && day <= upper) out.push({day,label:span <= 390 ? MONTHS[month-1] : `${MONTHS[month-1]} ${year}`,major:month===1});
      month++;if(month>12){month=1;year++;}
    }
  } else {
    const yearPixels=pixels * 365.2425 / span;
    const step=yearPixels >= 100 ? 1 : yearPixels >= 50 ? 2 : yearPixels >= 23 ? 5 : yearPixels >= 12 ? 10 : yearPixels >= 5 ? 25 : 50;
    const first=Math.ceil(start.year / step) * step;
    for(let year=first; year <= end.year && out.length < 80;year+=step){
      const day=civilDay(year);
      if(day>=lower && day<=upper)out.push({day,label:String(year),major:true});
    }
  }
  // On narrow viewports suppress text that would collide, but retain tick strokes.
  const minSpacing = span <= 35 ? 20 : span <= 365.2425 * 2 ? 42 : 33;
  let lastLabel=-Infinity;
  return out.map(tick=>{
    const pixel=(tick.day-lower)/span*pixels;
    const label=tick.label && pixel-lastLabel >= minSpacing ? tick.label : '';
    if(label)lastLabel=pixel;
    return {...tick,label};
  });
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
  const [verticalControlHeight,setVerticalControlHeight] = useState(VERTICAL_CONTROL_MIN_HEIGHT);
  // Timeline II-only playback. This does not modify the shared Visualize scrubber.
  const [playhead,setPlayhead] = useState(null);
  const [playing,setPlaying] = useState(false);
  const [playbackSpeed,setPlaybackSpeed] = useState(1);
  const [playbackMode,setPlaybackMode] = useState('cumulative');
  const [playbackStarted,setPlaybackStarted] = useState(false);
  const [playbackHelpOpen,setPlaybackHelpOpen] = useState(false);
  const animationRef = useRef({last:null});
  const viewportRef = useRef(null);
  const verticalControlsRef = useRef(null);
  const rulerDragRef = useRef(null);
  // Dragging is strictly chronological. Do not start panning until the pointer
  // moves far enough to distinguish a drag from selecting a Timeline mark.
  const dragRef = useRef(null);
  const suppressSelectionClickRef = useRef(false);
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
  const axisStart = horizontal ? TRACK_GUTTER : VERTICAL_AXIS_START;
  const length = Math.max(120,(horizontal?size.width:size.height) - axisStart - (horizontal ? 18 : verticalControlHeight + VERTICAL_RULER_FOOTER));
  // Lanes fill the full *perpendicular* plotting dimension. The only navigation
  // dimension remains chronological; no secondary-axis overflow is created.
  const secondary = Math.max(90,horizontal?size.height:size.width);
  const crossStart = horizontal ? NODE_DIAMETER / 2 + 32 : CHRONOLOGY_RULER_WIDTH + NODE_DIAMETER / 2 + 12;
  const crossEnd = secondary - (horizontal ? CHRONOLOGY_RULER_HEIGHT + NODE_DIAMETER / 2 + 12 : NODE_DIAMETER / 2 + 26);
  const crossSpan = Math.max(0, crossEnd - crossStart);
  const laneCount = LANE_COUNT;
  const lanePosition = lane => laneCount === 1
    ? crossStart + crossSpan / 2
    : crossStart + lane * crossSpan / (laneCount - 1);
  const pos = day => axisStart + (day - lower) / visibleDays * length;
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
  const ticks = rulerTicks(lower,upper,length);
  const rulerStart = windowDate(lower,visibleDays);
  const rulerEnd = windowDate(upper,visibleDays);
  const playbackDate = Math.max(lower,Math.min(upper,playhead ?? lower));
  const playbackPosition = axisStart + (playbackDate - min) / Math.max(1,max-min) * length;
  const playbackItems = playbackStarted
    ? packed.filter(item=>playbackMode==='cumulative'
      ? item.day <= playbackDate
      : item.day <= playbackDate && item.endDay >= playbackDate)
    : packed;
  // Overview positions always use the full dataset domain; detailed ticks
  // continue to use the current visible chronology.
  const overviewSpan = Math.max(1, max - min);
  const overviewStart = Math.max(min, Math.min(max, lower));
  const overviewEnd = Math.max(min, Math.min(max, upper));
  const overviewLeft = axisStart + (overviewStart - min) / overviewSpan * length;
  const overviewRight = axisStart + (overviewEnd - min) / overviewSpan * length;
  const overviewWidth = Math.max(0, overviewRight - overviewLeft);
  // Overview ticks use full-domain positions. Minor strokes may be closer
  // together, but labels are measured and suppressed independently.
  const overviewTicks = useMemo(() => {
    const domain = Math.max(1, max - min);
    const targetPixels = 23;
    const rawStep = domain / Math.max(1, length / targetPixels);
    const steps = [1,2,5,10,20,50,100,200,500,1000,2000,5000,10000,20000,50000];
    const step = steps.find(value => value * 365.2425 >= rawStep) || 50000;
    const beginYear = civilFromDay(Math.floor(min)).year;
    const endYear = civilFromDay(Math.ceil(max)).year;
    const firstYear = Math.ceil(beginYear / step) * step;
    const marks = [];
    let lastLabelEnd = -Infinity;
    for (let year = firstYear; year <= endYear && marks.length < 240; year += step) {
      const day = civilDay(year);
      if (day < min || day > max) continue;
      const px = (day - min) / domain * length;
      const label = String(year);
      const estimatedLabelWidth = label.length * 7 + 14;
      // Vertical labels need line-height clearance, horizontal labels need width.
      const gap = horizontal ? estimatedLabelWidth : 24;
      const showLabel = px - gap / 2 >= lastLabelEnd + 9 && px + gap / 2 <= length;
      if (showLabel) lastLabelEnd = px + gap / 2;
      marks.push({day, label:showLabel ? label : '', major:showLabel});
    }
    return marks;
  }, [min, max, length, horizontal]);
  const axisCoord = event => horizontal ? event.clientX : event.clientY;
  const overviewDayAt = event => {
    const rect = event.currentTarget.getBoundingClientRect();
    const px = (horizontal ? event.clientX - rect.left : event.clientY - rect.top) - axisStart;
    return min + Math.max(0, Math.min(1, px / Math.max(1, length))) * overviewSpan;
  };
  const clampWindow = (start, end) => {
    const domain = Math.max(0, max - min);
    const available = Math.min(MAX_DAYS, Math.max(MIN_DAYS, domain));
    const span = Math.max(MIN_DAYS, Math.min(available, end - start));
    const left = domain >= span
      ? Math.max(min, Math.min(max - span, start))
      : (min + max - span) / 2;
    setVisibleDays(span);
    setCenter(left + span / 2);
  };
  useEffect(()=>{
    const el=viewportRef.current;
    if(!el)return undefined;
    const update=()=>setSize({width:el.clientWidth,height:el.clientHeight});
    update();
    const observer = typeof ResizeObserver!=='undefined' ? new ResizeObserver(update) : null;
    observer?.observe(el);
    return ()=>observer?.disconnect();
  },[]);
  // Measure the control stack at its natural height. Fixed pixels clipped Reset
  // on laptop viewports; ruler length follows the actual controls instead.
  useEffect(()=>{
    if (horizontal) return undefined;
    const panel=verticalControlsRef.current;
    if (!panel) return undefined;
    const measure=()=>setVerticalControlHeight(Math.max(VERTICAL_CONTROL_MIN_HEIGHT,Math.ceil(panel.getBoundingClientRect().height)));
    measure();
    const observer=typeof ResizeObserver!=='undefined' ? new ResizeObserver(measure) : null;
    observer?.observe(panel);
    return ()=>observer?.disconnect();
  },[horizontal]);
  useEffect(()=>{
    if (!playing) {animationRef.current.last=null;return undefined;}
    let frame;
    const advance=timestamp=>{
      const last=animationRef.current.last;
      animationRef.current.last=timestamp;
      if(last!==null){
        const elapsed=Math.min(100,timestamp-last)/1000;
        const step=elapsed * visibleDays / 30 * playbackSpeed;
        setPlayhead(current=>{
          const next=Math.min(upper,(current??lower)+step);
          if(next>=upper)setPlaying(false);
          return next;
        });
      }
      frame=requestAnimationFrame(advance);
    };
    frame=requestAnimationFrame(advance);
    return ()=>{cancelAnimationFrame(frame);animationRef.current.last=null;};
  },[playing,visibleDays,playbackSpeed,lower,upper]);
  useEffect(()=>{
    if(playhead!==null && (playhead<lower || playhead>upper)){
      setPlayhead(Math.max(lower,Math.min(upper,playhead)));
      setPlaying(false);
    }
  },[lower,upper,playhead]);
  const pausePlayback=()=>setPlaying(false);
  const togglePlayback=()=>{
    if(playing){setPlaying(false);return;}
    setPlaybackStarted(true);
    setPlayhead(current=>current===null || current>=upper ? lower : Math.max(lower,current));
    setPlaying(true);
  };
  const stepPlayback=direction=>{
    pausePlayback();setPlaybackStarted(true);
    setPlayhead(current=>Math.max(lower,Math.min(upper,(current??lower)+direction*Math.max(1,visibleDays/24))));
  };
  const resetPlayback=()=>{pausePlayback();setPlayhead(null);setPlaybackStarted(false);};
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
  const startDrag = event => {
    pausePlayback();
    if (event.button !== 0 || !event.isPrimary) return;
    suppressSelectionClickRef.current = false;
    dragRef.current = {pointerId:event.pointerId,coordinate:horizontal?event.clientX:event.clientY,dragging:false};
  };
  const moveDrag = event => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    const coordinate = horizontal ? event.clientX : event.clientY;
    const delta = coordinate - drag.coordinate;
    if (!drag.dragging && Math.abs(delta) < 6) return;
    if (!drag.dragging) {
      drag.dragging = true;
      suppressSelectionClickRef.current = true;
      setHoveredId('');
      setHoverPosition(null);
      viewportRef.current?.setPointerCapture(event.pointerId);
    }
    drag.coordinate = coordinate;
    // A displacement along the chronological screen axis pans in the opposite
    // temporal direction. The existing panBy clamps the allowed domain.
    if (delta) panBy(-delta / Math.max(1,length) * visibleDays);
    event.preventDefault();
  };
  const finishDrag = event => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    dragRef.current = null;
    if (viewportRef.current?.hasPointerCapture(event.pointerId)) {
      viewportRef.current.releasePointerCapture(event.pointerId);
    }
  };
  // Range selector: body pans; either clamp adjusts one boundary and zoom.
  // Clicking the remaining track centers the visible range at that date.
  const rulerPointerDown = event => {
    if (event.button !== 0 || !event.isPrimary) return;
    event.stopPropagation(); event.preventDefault();
    const role = event.target.closest('[data-scrub-part]')?.dataset.scrubPart || 'track';
    // Do not alter the time window on pointer-down. In particular, an initial
    // 75-year view may be wider than the dataset; touching its thumb must not
    // silently zoom it to the dataset's shorter domain.
    rulerDragRef.current = {
      pointerId:event.pointerId, coordinate:axisCoord(event), role,
      start:lower, end:upper, moved:false,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  };
  const rulerPointerMove = event => {
    const drag = rulerDragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    event.stopPropagation(); event.preventDefault();
    const pixelDelta = axisCoord(event) - drag.coordinate;
    if (!drag.moved && Math.abs(pixelDelta) < 5) return;
    drag.moved = true;
    pausePlayback();
    const delta = pixelDelta / Math.max(1,length) * Math.max(1,max-min);
    if (drag.role === 'playhead') {
      setPlaybackStarted(true);
      setPlayhead(Math.max(lower,Math.min(upper,overviewDayAt(event))));
    } else if (drag.role === 'start') {
      clampWindow(Math.max(min,Math.min(drag.end-MIN_DAYS,drag.start+delta)),drag.end);
    } else if (drag.role === 'end') {
      clampWindow(drag.start,Math.min(max,Math.max(drag.start+MIN_DAYS,drag.end+delta)));
    } else if (drag.role === 'body') {
      const span=drag.end-drag.start;
      if (span >= max-min) {
        // Full-domain (or wider) views have no meaningful overview travel.
        // Keep zoom and center unchanged until the user explicitly adjusts a clamp.
        return;
      }
      const left=Math.max(min,Math.min(max-span,drag.start+delta));
      setCenter(left+span/2);
    } else {
      // A drag beginning on empty track is not an implicit zoom operation.
      // Only a completed click on empty track performs a jump.
    }
  };
  const rulerPointerEnd = event => {
    const drag=rulerDragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    event.stopPropagation();
    if (event.type === 'pointerup' && drag.role === 'track' && !drag.moved) {
      pausePlayback();
      const date=overviewDayAt(event);
      const span=drag.end-drag.start;
      if (span < max-min) clampWindow(date-span/2,date+span/2);
    }
    rulerDragRef.current=null;
    if(event.currentTarget.hasPointerCapture(event.pointerId))event.currentTarget.releasePointerCapture(event.pointerId);
  };
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
  const chronologyDockProps = {
    horizontal, verticalControlHeight, axisStart, length,
    min, max, lower, upper, visibleDays, overviewSpan,
    overviewLeft, overviewRight, overviewWidth, overviewTicks,
    playbackStarted, playbackDate, playbackPosition,
    playing, playbackSpeed, setPlaybackSpeed,
    playbackMode, setPlaybackMode, playbackHelpOpen, setPlaybackHelpOpen,
    rulerPointerDown, rulerPointerMove, rulerPointerEnd,
    windowDate, CHRONOLOGY_RULER_HEIGHT, CHRONOLOGY_RULER_WIDTH,
    TRACK_GUTTER, VERTICAL_CONTROL_MIN_HEIGHT, MIN_DAYS,
    clampWindow, stepPlayback, togglePlayback, resetPlayback,
    verticalControlsRef, rulerStart, rulerEnd,
  };
  if(!all.length)return <div className="flex min-h-0 flex-1 items-center justify-center rounded-xl bg-[#eee0c7] text-[#4b4236]">No positionable events available to Timeline II.</div>;
  return <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-[#b4a087] bg-[#eee0c7] text-[#302b24]">
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
    }}
      onPointerDown={startDrag}
      onPointerMove={moveDrag}
      onPointerUp={finishDrag}
      onPointerCancel={finishDrag}
      onClickCapture={event=>{
        if (suppressSelectionClickRef.current) {
          event.preventDefault();
          event.stopPropagation();
          suppressSelectionClickRef.current = false;
        }
      }}
      className="relative min-h-0 flex-1 cursor-grab touch-none select-none overflow-hidden outline-none active:cursor-grabbing focus-visible:ring-2 focus-visible:ring-[#7C211E]">
      <div className="absolute inset-0 pointer-events-none" style={{background:'#eee0c7'}}/>

      {playbackItems.map(item=>{
        const categoryStyle=colors.get(item.category)||{color:'#253C32',symbol:'●'};
        const active=item.event.id === (selectedEventId || localSelected);
        const hoveredMark=item.event.id === hoveredId;
        const secondaryPos=lanePosition(item.lane);
        const bandStart=Math.max(axisStart,item.start);
        const bandEnd=Math.min(axisStart+length,item.finish);
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
      <ChronologyRuler {...chronologyDockProps} />
      <div className="pointer-events-none absolute z-[21] rounded bg-[#faf5eb]/95 px-2 py-1 text-[11px] font-semibold text-[#7C211E]" style={horizontal?{bottom:95,left:10}:{left:CHRONOLOGY_RULER_WIDTH+8,top:7}}>
        {rulerStart} — {rulerEnd}
      </div>
    </div>
    <ChronologyTransport {...chronologyDockProps} />
    {selected?<div className="shrink-0 border-t border-[#b4a087] bg-[#fbf7ed] px-4 py-2 text-xs"><strong>{selected.title}</strong> · {selected.event.temporalRole||'Event'} · {dateLabel(selected.start)}{selected.period?` – ${dateLabel(selected.end)}`:''}</div>:null}
  </div>;
}
