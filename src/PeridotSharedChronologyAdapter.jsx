/* Adapter from existing shared Visualize playback state to the exact approved
 * ChronologyRuler and ChronologyTransport extracted from Timeline II (v35).
 * No replacement markup for the controls is defined here.
 */
import React, {useEffect, useLayoutEffect, useMemo, useRef, useState} from 'react';
import {ChronologyRuler, ChronologyTransport} from './PeridotChronologyDock.jsx';

const TRACK_GUTTER = 76;
const CHRONOLOGY_RULER_HEIGHT = 92;
const CHRONOLOGY_RULER_WIDTH = 186;
const VERTICAL_CONTROL_MIN_HEIGHT = 218;
const MIN_DAYS = 1; // Shared timeline uses canonical playback buckets, not days.
const clamp = (v,a,b) => Math.max(a,Math.min(b,v));
const yearNumber = value => {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
};
function entryDateLabel(value) {
  return value === undefined || value === null ? 'Date unavailable' : String(value);
}
export function PeridotSharedChronologyAdapter({
  timelineMonths=[],rangeStart=0,setRangeStart,rangeEnd=0,setRangeEnd,
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
  const min=0,max=Math.max(1,last);
  const lower=clamp(Math.min(rangeStart,rangeEnd),0,last);
  const upper=clamp(Math.max(rangeStart,rangeEnd),lower,last);
  const visibleDays=Math.max(1,upper-lower);
  const axisStart=TRACK_GUTTER;
  const length=Math.max(160,width-TRACK_GUTTER-18);
  const overviewSpan=Math.max(1,max-min);
  const overviewLeft=axisStart+lower/overviewSpan*length;
  const overviewRight=axisStart+upper/overviewSpan*length;
  const overviewWidth=Math.max(0,overviewRight-overviewLeft);
  const valueLabel=i=>entryDateLabel(timelineMonths[clamp(Math.round(i),0,last)]);
  const rulerStart=valueLabel(lower),rulerEnd=valueLabel(upper);
  const numericYears=timelineMonths.map(yearNumber);
  const overviewTicks=useMemo(()=>{
    if(!count)return [];
    const maxLabels=Math.max(2,Math.floor(length/65));
    const minorStep=Math.max(1,Math.ceil(last/Math.max(2,length/25)));
    const labelStep=Math.max(minorStep,Math.ceil(last/maxLabels/minorStep)*minorStep);
    const ticks=[];
    for(let i=0;i<=last;i+=minorStep)ticks.push({day:i,label:i%labelStep===0?valueLabel(i):'',major:i%labelStep===0});
    if(last>0 && ticks.at(-1)?.day!==last)ticks.push({day:last,label:'',major:false});
    return ticks;
  },[timelineMonths,last,length,count]);
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
  const playbackKey=playheadEntry?.playbackSortKey;
  let approximatePlaybackBucket=lower;
  if(active){
    const year=Math.trunc(Number(playbackKey)/10000);
    if(Number.isFinite(year)){
      const candidates=numericYears.map((y,i)=>({i,d:y===null?Infinity:Math.abs(y-year)}));
      candidates.sort((a,b)=>a.d-b.d);
      if(Number.isFinite(candidates[0]?.d))approximatePlaybackBucket=candidates[0].i;
    }
  }
  const playbackPosition=axisStart+approximatePlaybackBucket/overviewSpan*length;
  const stop=()=>setIsPlaying?.(false);
  const commit=(a,b)=>{
    const start=clamp(Math.round(a),0,last);
    const end=clamp(Math.round(b),start,last);
    setTimelineMode?.('range');setRangeStart?.(start);setRangeEnd?.(end);
    stop();setPlaybackIndex?.(-1);
  };
  const clampWindow=(a,b)=>commit(a,b);
  const coordinate=e=>e.clientX;
  const getBucket=e=>{
    const rect=e.currentTarget.getBoundingClientRect();
    return clamp((e.clientX-rect.left-axisStart)/Math.max(1,length)*overviewSpan,0,last);
  };
  const rulerPointerDown=e=>{
    if(e.button!==0||!e.isPrimary)return;
    e.stopPropagation();e.preventDefault();
    dragRef.current={id:e.pointerId,x:coordinate(e),role:e.target.closest('[data-scrub-part]')?.dataset.scrubPart||'track',start:lower,end:upper,moved:false};
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const rulerPointerMove=e=>{
    const d=dragRef.current;
    if(!d||d.id!==e.pointerId)return;
    e.stopPropagation();e.preventDefault();
    const dx=coordinate(e)-d.x;
    if(!d.moved&&Math.abs(dx)<5)return;
    d.moved=true;
    const delta=Math.round(dx/Math.max(1,length)*overviewSpan);
    if(d.role==='start')commit(clamp(d.start+delta,0,d.end),d.end);
    else if(d.role==='end')commit(d.start,clamp(d.end+delta,d.start,last));
    else if(d.role==='body'){
      const span=d.end-d.start;
      const n=clamp(d.start+delta,0,last-span);
      commit(n,n+span);
    }else if(d.role==='playhead'){
      stop();
      const index=clamp(Math.round((getBucket(e)-lower)/Math.max(1,upper-lower)*(entries.length-1)),0,Math.max(0,entries.length-1));
      setPlaybackIndex?.(index);
    }
  };
  const rulerPointerEnd=e=>{
    const d=dragRef.current;if(!d||d.id!==e.pointerId)return;
    e.stopPropagation();
    if(e.type==='pointerup'&&d.role==='track'&&!d.moved){
      const span=d.end-d.start;
      const start=clamp(Math.round(getBucket(e)-span/2),0,last-span);
      commit(start,start+span);
    }
    dragRef.current=null;
    if(e.currentTarget.hasPointerCapture(e.pointerId))e.currentTarget.releasePointerCapture(e.pointerId);
  };
  const playbackDate=approximatePlaybackBucket;
  const stepPlayback=sign=>{stop();setPlaybackIndex?.(i=>clamp(i+sign,0,Math.max(0,entries.length-1)));};
  const togglePlayback=()=>{
    if(isPlaying){stop();return;}
    if(!entries.length)return;
    setPlaybackIndex?.(i=>i<0||i>=entries.length-1?0:i);
    setIsPlaying?.(true);
  };
  const resetPlayback=()=>{stop();setPlaybackIndex?.(-1);};
  // The shared App controller uses millisecond delays, unlike Timeline II's
  // speed multipliers. Preserve the authoritative values and labels.
  const speedOptions=playbackSpeedOptions.length?playbackSpeedOptions:[{label:'Slow',value:700}];
  const speedValues=[0.5,1,2,4];
  const speedIndex=Math.max(0,speedOptions.findIndex(x=>Number(x.value)===Number(playbackSpeed)));
  const speedMultiplier=speedValues[Math.min(speedValues.length-1,Math.round(speedIndex/(Math.max(1,speedOptions.length-1))*3))];
  const setSpeedMultiplier=n=>{
    const index=clamp(Math.round((speedValues.indexOf(n)/3)*(speedOptions.length-1)),0,speedOptions.length-1);
    setPlaybackSpeed?.(speedOptions[index].value);
  };
  const ui={horizontal:true,verticalControlHeight:0,axisStart,length,min,max,lower,upper,
    visibleDays,overviewSpan,overviewLeft,overviewRight,overviewWidth,overviewTicks,
    playbackStarted:active,playbackDate,playbackPosition,
    playing:isPlaying,playbackSpeed:speedMultiplier,setPlaybackSpeed:setSpeedMultiplier,
    playbackMode:timelinePlaybackMode==='co-current'?'current':'cumulative',
    setPlaybackMode:value=>setTimelinePlaybackMode?.(value==='current'?'co-current':'cumulative'),
    playbackHelpOpen:help,setPlaybackHelpOpen:setHelp,rulerPointerDown,rulerPointerMove,
    rulerPointerEnd,clampWindow,stepPlayback,togglePlayback,resetPlayback,
    verticalControlsRef:null,rulerStart,rulerEnd,windowDate:valueLabel,
    CHRONOLOGY_RULER_HEIGHT,CHRONOLOGY_RULER_WIDTH,TRACK_GUTTER,VERTICAL_CONTROL_MIN_HEIGHT,MIN_DAYS,
  };
  if(count===0)return null;
  return <div className="relative w-full overflow-visible rounded-xl border border-[#b4a087] bg-[#eee0c7] text-[#302b24]" aria-label="Shared chronology dock">
    <div ref={rulerRef} className="relative w-full" style={{height:CHRONOLOGY_RULER_HEIGHT}}>
      <ChronologyRuler {...ui}/>
    </div>
    <ChronologyTransport {...ui}/>
  </div>;
}
