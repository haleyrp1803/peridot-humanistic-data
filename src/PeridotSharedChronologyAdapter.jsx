/*
 * Shared Visualize chronology: one Gregorian navigation surface, with
 * per-visualization persistent calendar windows owned by App.jsx.
 * The old indexed filtering boundary is bridged (not reinterpreted) until
 * the subsequent canonical-temporal compatibility pass. This module does
 * not contain a second chronology dock: the shared dock owns all markup.
 */
import React, {useLayoutEffect,useMemo,useRef,useState} from 'react';
import {ChronologyRuler,ChronologyTransport} from './PeridotChronologyDock.jsx';
import {civilDay,civilFromDay,createChronologyDomain,chronologyOverviewTicks,clampChronologyWindow,clampChronologyValue,chronologyDayAtPosition,chronologyPosition} from './peridotChronologyWindow.js';
import {indexedCalendarDomain,projectCalendarWindowToIndexedYears} from './peridotChronologyNavigationBridge.js';

const TRACK_GUTTER=76;
const CHRONOLOGY_RULER_HEIGHT=92;
const CHRONOLOGY_RULER_WIDTH=186;
const VERTICAL_CONTROL_MIN_HEIGHT=218;
const MIN_DAYS=7;
const clamp=clampChronologyValue;
const yearLabel=day=>{
  const {year}=civilFromDay(day);
  // Avoid displaying 1889/2009 when a 10% day-based buffer lands just
  // before the clean year boundary 1890/2010 (fractional-day rounding).
  return String(civilDay(year+1)-day<=2?year+1:year);
};
function sortKeyDay(sortKey) {
  if(!Number.isFinite(Number(sortKey)))return null;
  const n=Math.trunc(Number(sortKey));
  const year=Math.trunc(n/10000);
  const month=Math.trunc(Math.abs(n)%10000/100);
  const day=Math.abs(n)%100;
  if(month<1||month>12||day<1||day>31)return civilDay(year);
  return civilDay(year,month,day);
}
export function PeridotSharedChronologyAdapter({
  timelineMonths=[],rangeStart=0,setRangeStart,rangeEnd=0,setRangeEnd,
  chronologySourceBounds=null,
  calendarWindowStart=null,calendarWindowEnd=null,setCalendarWindow,
  currentPlaybackLabel='',playbackSpeedOptions=[],playbackSpeed,setPlaybackSpeed,
  isPlaying=false,setIsPlaying,playbackIndex=-1,setPlaybackIndex,
  selectedRowsForPlayback=[],setTimelineMode,
  timelinePlaybackMode='cumulative',setTimelinePlaybackMode,
}) {
  const rulerRef=useRef(null);
  const dragRef=useRef(null);
  const [width,setWidth]=useState(1200);
  const [help,setHelp]=useState(false);
  const count=timelineMonths.length;
  const last=Math.max(0,count-1);
  // Use the very same unfiltered mapped-event endpoints as Timeline II.
  // Indexed year boundaries are a fallback only for datasets with no
  // positionable Timeline event assertions.
  const domain=useMemo(()=>(
    chronologySourceBounds && Number.isFinite(chronologySourceBounds.min)
      && Number.isFinite(chronologySourceBounds.max)
      && chronologySourceBounds.max>=chronologySourceBounds.min
      ? createChronologyDomain(chronologySourceBounds.min,chronologySourceBounds.max)
      : indexedCalendarDomain(timelineMonths)
  ),[chronologySourceBounds,timelineMonths]);
  // Empty window values indicate a new/Reset session, never a source date.
  const min=domain?.min??0, max=domain?.max??7;
  const fullWindow=calendarWindowStart===null||calendarWindowEnd===null;
  const currentWindow=(fullWindow||!domain)?{start:min,end:max,span:max-min}:
    clampChronologyWindow(calendarWindowStart,calendarWindowEnd,domain,{minimumSpanDays:MIN_DAYS});
  const lower=currentWindow.start,upper=currentWindow.end;
  const visibleDays=currentWindow.span;
  const overviewSpan=Math.max(1,max-min);
  const axisStart=TRACK_GUTTER;
  const length=Math.max(160,width-TRACK_GUTTER-18);
  const overviewLeft=chronologyPosition(lower,min,max,axisStart,length);
  const overviewRight=chronologyPosition(upper,min,max,axisStart,length);
  const overviewWidth=Math.max(0,overviewRight-overviewLeft);
  const rulerStart=yearLabel(lower),rulerEnd=yearLabel(upper);
  const windowDate=day=>yearLabel(day);
  const overviewTicks=useMemo(()=>(
    count&&domain?chronologyOverviewTicks(min,max,length,{horizontal:true}):[]
  ),[count,domain,min,max,length]);
  // Measure the actual visible dock, not the width of an intermediate
  // workspace during dataset loading. The chronology can mount before its
  // parent finishes sizing; switching to Timeline II/remounting must not be
  // required to make the ruler occupy the full available width.
  useLayoutEffect(()=>{
    const element=rulerRef.current;
    if(!element)return undefined;
    let firstFrame=null;
    let secondFrame=null;
    const update=()=>{
      const measured=element.getBoundingClientRect().width;
      if(Number.isFinite(measured)&&measured>0){
        setWidth(previous=>Math.abs(previous-measured)>0.5?measured:previous);
      }
    };
    update();
    // Include two layout frames for transitions from Data to Visualize and
    // asynchronous panel measurements. ResizeObserver handles later changes.
    firstFrame=requestAnimationFrame(()=>{
      update();
      secondFrame=requestAnimationFrame(update);
    });
    const observer=typeof ResizeObserver==='undefined'?null:new ResizeObserver(update);
    if(observer){
      observer.observe(element);
      if(element.parentElement)observer.observe(element.parentElement);
    }
    window.addEventListener('resize',update);
    return ()=>{
      if(firstFrame!==null)cancelAnimationFrame(firstFrame);
      if(secondFrame!==null)cancelAnimationFrame(secondFrame);
      observer?.disconnect();
      window.removeEventListener('resize',update);
    };
  },[count > 0]);

  const entries=selectedRowsForPlayback||[];
  const active=playbackIndex>=0&&playbackIndex<entries.length;
  const playheadEntry=active?entries[playbackIndex]:null;
  const playbackDate=sortKeyDay(playheadEntry?.playbackSortKey)??lower;
  const playbackPosition=chronologyPosition(playbackDate,min,max,axisStart,length);
  const stop=()=>setIsPlaying?.(false);
  const commit=(a,b)=>{
    if(!domain)return;
    const bounded=clampChronologyWindow(a,b,domain,{minimumSpanDays:MIN_DAYS});
    const projected=projectCalendarWindowToIndexedYears(timelineMonths,bounded.start,bounded.end);
    if(setCalendarWindow)setCalendarWindow(bounded.start,bounded.end,projected.rangeStart,projected.rangeEnd);
    else {
      // Compatibility for a caller not yet supplying the App window setter.
      setTimelineMode?.('range');setRangeStart?.(projected.rangeStart);setRangeEnd?.(projected.rangeEnd);
      stop();setPlaybackIndex?.(-1);
    }
  };
  const clampWindow=(a,b)=>commit(a,b);
  const getDayAt=e=>{
    const rect=e.currentTarget.getBoundingClientRect();
    return clamp(chronologyDayAtPosition(e.clientX-rect.left,min,max,axisStart,length),min,max);
  };
  const rulerPointerDown=e=>{
    if(e.button!==0||!e.isPrimary)return;
    e.stopPropagation();e.preventDefault();
    dragRef.current={id:e.pointerId,x:e.clientX,role:e.target.closest('[data-scrub-part]')?.dataset.scrubPart||'track',start:lower,end:upper,moved:false};
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const rulerPointerMove=e=>{
    const d=dragRef.current;
    if(!d||d.id!==e.pointerId)return;
    e.stopPropagation();e.preventDefault();
    const dx=e.clientX-d.x;
    if(!d.moved&&Math.abs(dx)<5)return;
    d.moved=true;
    const delta=dx/Math.max(1,length)*overviewSpan;
    if(d.role==='start')commit(clamp(d.start+delta,min,d.end-MIN_DAYS),d.end);
    else if(d.role==='end')commit(d.start,clamp(d.end+delta,d.start+MIN_DAYS,max));
    else if(d.role==='body'){
      const span=d.end-d.start;
      const nextStart=clamp(d.start+delta,min,max-span);
      commit(nextStart,nextStart+span);
    } else if(d.role==='playhead'){
      stop();
      const currentDay=getDayAt(e);
      const nearest=entries.reduce((best,entry,index)=>{
        const date=sortKeyDay(entry?.playbackSortKey);
        return date!==null&&Math.abs(date-currentDay)<best.distance?{index,distance:Math.abs(date-currentDay)}:best;
      },{index:0,distance:Infinity});
      setPlaybackIndex?.(nearest.index);
    }
  };
  const rulerPointerEnd=e=>{
    const d=dragRef.current;if(!d||d.id!==e.pointerId)return;
    e.stopPropagation();
    if(e.type==='pointerup'&&d.role==='track'&&!d.moved){
      const day=getDayAt(e);
      const span=d.end-d.start;
      const nextStart=clamp(day-span/2,min,max-span);
      commit(nextStart,nextStart+span);
    }
    dragRef.current=null;
    if(e.currentTarget.hasPointerCapture(e.pointerId))e.currentTarget.releasePointerCapture(e.pointerId);
  };
  const stepPlayback=sign=>{stop();setPlaybackIndex?.(i=>clamp(i+sign,0,Math.max(0,entries.length-1)));};
  const togglePlayback=()=>{
    if(isPlaying){stop();return;}
    if(!entries.length)return;
    setPlaybackIndex?.(i=>i<0||i>=entries.length-1?0:i);
    setIsPlaying?.(true);
  };
  const resetPlayback=()=>{
    if(setCalendarWindow)setCalendarWindow(null,null,0,last);
    else commit(min,max);
  };
  // The indexed playback engine uses millisecond delays, unlike Timeline II's
  // speed multipliers. These selectors retain the accepted user-visible map.
  const speedOptions=playbackSpeedOptions.length?playbackSpeedOptions:[{label:'Slow',value:700}];
  const speedValues=[0.5,1,2,4];
  const speedIndex=Math.max(0,speedOptions.findIndex(x=>Number(x.value)===Number(playbackSpeed)));
  const speedMultiplier=speedValues[Math.min(speedValues.length-1,Math.round(speedIndex/Math.max(1,speedOptions.length-1)*3))];
  const setSpeedMultiplier=n=>{
    const index=clamp(Math.round(speedValues.indexOf(n)/3*(speedOptions.length-1)),0,speedOptions.length-1);
    setPlaybackSpeed?.(speedOptions[index].value);
  };
  const ui={horizontal:true,verticalControlHeight:0,axisStart,length,min,max,
    sourceMin:domain?.sourceMin,sourceMax:domain?.sourceMax,
    lower,upper,
    visibleDays,overviewSpan,overviewLeft,overviewRight,overviewWidth,overviewTicks,
    playbackStarted:active,playbackDate,playbackPosition,
    playing:isPlaying,playbackSpeed:speedMultiplier,setPlaybackSpeed:setSpeedMultiplier,
    playbackMode:timelinePlaybackMode==='co-current'?'current':'cumulative',
    setPlaybackMode:value=>setTimelinePlaybackMode?.(value==='current'?'co-current':'cumulative'),
    playbackHelpOpen:help,setPlaybackHelpOpen:setHelp,rulerPointerDown,rulerPointerMove,
    rulerPointerEnd,clampWindow,stepPlayback,togglePlayback,resetPlayback,
    verticalControlsRef:null,rulerStart,rulerEnd,windowDate,
    CHRONOLOGY_RULER_HEIGHT,CHRONOLOGY_RULER_WIDTH,TRACK_GUTTER,VERTICAL_CONTROL_MIN_HEIGHT,MIN_DAYS,
  };
  if(!count)return null;
  return <div className="relative w-full overflow-visible rounded-xl border border-[#b4a087] bg-[#eee0c7] text-[#302b24]" aria-label="Shared chronology dock">
    <div ref={rulerRef} className="relative w-full" style={{height:CHRONOLOGY_RULER_HEIGHT}}><ChronologyRuler {...ui}/></div>
    <ChronologyTransport {...ui}/>
  </div>;
}
