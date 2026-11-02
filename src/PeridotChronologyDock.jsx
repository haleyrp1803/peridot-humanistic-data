/* Extracted verbatim from approved Timeline II v33.
 * Chronology UI only: data state, event playback and pointer handlers stay with
 * the owner. This is the first, deliberately behavior-preserving extraction. */
import React from 'react';

export function ChronologyRuler(ui) {
  const {
    horizontal, verticalControlHeight, axisStart, length, min, max, lower, upper,
    visibleDays, overviewSpan, overviewLeft, overviewRight, overviewWidth,
    overviewTicks, playbackStarted, playbackDate, playbackPosition,
    playing, playbackSpeed, setPlaybackSpeed, playbackMode, setPlaybackMode,
    playbackHelpOpen, setPlaybackHelpOpen, rulerPointerDown, rulerPointerMove,
    rulerPointerEnd, clampWindow, stepPlayback, togglePlayback, resetPlayback,
    verticalControlsRef, rulerStart, rulerEnd, windowDate,
    CHRONOLOGY_RULER_HEIGHT, CHRONOLOGY_RULER_WIDTH,
    TRACK_GUTTER, VERTICAL_CONTROL_MIN_HEIGHT, MIN_DAYS,
  } = ui;
  return <>
      {/* Two synchronized scales: a full-domain navigator with editable clamps,
          and detailed visible-window calendar labels outside the navigator. */}
      <div
        role="group" aria-label="Timeline chronology navigator: drag selection to pan, drag either end to zoom, click track to jump"
        onPointerDown={rulerPointerDown}
        onPointerMove={rulerPointerMove}
        onPointerUp={rulerPointerEnd}
        onPointerCancel={rulerPointerEnd}
        className="absolute z-[20] touch-none select-none overflow-hidden border-[#b4a087] bg-[#fbf7ed]/95 text-[#554538] shadow-[0_-2px_9px_#654c301b]"
        style={horizontal
          ? {left:0,right:0,bottom:0,height:CHRONOLOGY_RULER_HEIGHT,borderTopWidth:1}
          : {left:0,top:0,bottom:0,width:CHRONOLOGY_RULER_WIDTH,borderRightWidth:1}}
      >
        <div className="pointer-events-none absolute text-[10px] font-bold text-[#7C211E]" style={horizontal?{left:12,top:5}:{left:8,top:10}}>CHRONOLOGY</div>
        <div className="pointer-events-none absolute text-[10px] text-[#695e50]" style={horizontal?{right:12,top:5}:{left:7,bottom:8,maxWidth:78}}>Drag window · ends zoom</div>
        <div data-scrub-part="track" className="absolute rounded-lg border border-[#b5a083] bg-[#e8dcc6] cursor-crosshair" style={horizontal
          ? {left:TRACK_GUTTER,top:25,width:length,height:29}
          : {top:axisStart,left:130,height:length,width:35}} />
        {overviewTicks.map((tick,index)=>{
          const px=axisStart + (tick.day-min)/overviewSpan*length;
          return <div key={`overview-${index}`} className="pointer-events-none absolute text-[12px] font-semibold text-[#574538]" style={horizontal?{left:px,top:55}:{top:px,left:114}}>
            <span className="absolute" style={horizontal?{height:tick.major?13:8,borderLeft:'1px solid #957857'}:{width:tick.major?13:8,borderTop:'1px solid #957857'}} />
            {tick.label?<span className="absolute whitespace-nowrap" style={horizontal?{top:14,left:0,transform:'translateX(-50%)'}:{right:20,top:-9}}>{tick.label}</span>:null}
          </div>;
        })}
        <div data-scrub-part="body" className="absolute rounded-md border-2 border-[#2F6F73] bg-[#2F6F73]/20 cursor-grab active:cursor-grabbing" style={horizontal
          ? {left:overviewLeft,top:23,width:Math.max(2,overviewWidth),height:33}
          : {top:overviewLeft,left:128,height:Math.max(2,overviewWidth),width:39}} />
        {playbackStarted && (
          <div data-scrub-part="playhead" className="absolute z-[9] cursor-pointer" aria-label="Drag playback date" style={horizontal
            ? {left:playbackPosition-7,top:15,height:51,width:14,borderLeft:'2px solid #7C211E',borderLeftWidth:2,transform:'translateX(6px)'}
            : {top:playbackPosition-7,left:126,width:43,height:14,borderTop:'2px solid #7C211E',transform:'translateY(6px)'}}>
            <span className="pointer-events-none absolute rounded-full bg-[#7C211E]" style={horizontal
              ? {left:-5,top:-5,width:10,height:10}
              : {left:-5,top:-5,width:10,height:10}} />
          </div>
        )}
        {['start','end'].map(side=>{
          const at=side==='start'?overviewLeft:overviewRight;
          return <div key={side} data-scrub-part={side} role="slider" tabIndex={0}
            aria-label={`${side==='start'?'Beginning':'End'} of visible chronology; drag to change zoom`}
            aria-valuemin={Math.round(min)} aria-valuemax={Math.round(max)}
            aria-valuenow={Math.round(side==='start'?lower:upper)}
            aria-valuetext={windowDate(side==='start'?lower:upper,visibleDays)}
            onKeyDown={event=>{
              if(!['ArrowLeft','ArrowUp','ArrowRight','ArrowDown'].includes(event.key))return;
              event.preventDefault(); event.stopPropagation();
              const amount=(event.key==='ArrowLeft'||event.key==='ArrowUp'?-1:1)*visibleDays*0.08;
              if(side==='start')clampWindow(Math.max(min,Math.min(upper-MIN_DAYS,lower+amount)),upper);
              else clampWindow(lower,Math.min(max,Math.max(lower+MIN_DAYS,upper+amount)));
            }}
            className="absolute z-10 rounded border-2 border-[#245A5E] bg-[#2F6F73] outline-none focus-visible:ring-2 focus-visible:ring-[#7C211E]"
            style={horizontal
              ? {left:at-5,top:19,width:10,height:41,cursor:'ew-resize'}
              : {top:at-5,left:124,height:10,width:47,cursor:'ns-resize'}} />;
        })}
        {!horizontal && <div ref={verticalControlsRef} className="absolute bottom-0 left-0 z-[22] w-[94px] border-r border-t border-[#b4a087] bg-[#fbf7ed] px-1 py-1 text-xs" style={{minHeight:VERTICAL_CONTROL_MIN_HEIGHT}} onPointerDown={event=>event.stopPropagation()} onPointerMove={event=>event.stopPropagation()}>
          <div className="mb-1 truncate text-center text-[10px] font-semibold text-[#7C211E]">{playbackStarted ? windowDate(playbackDate,visibleDays) : 'Playback ready'}</div>
          <div className="mb-1 flex items-center justify-center gap-0.5">
            <button type="button" onClick={()=>stepPlayback(-1)} aria-label="Step backward" className="rounded-full border border-[#c9b89d] px-1 py-0.5 text-[9px]">◀|</button>
            <button type="button" onClick={togglePlayback} className="rounded-full bg-[#253C32] px-1 py-0.5 text-[9px] font-semibold text-white">{playing?'Ⅱ Pause':'▶ Play'}</button>
            <button type="button" onClick={()=>stepPlayback(1)} aria-label="Step forward" className="rounded-full border border-[#c9b89d] px-1 py-0.5 text-[9px]">|▶</button>
          </div>
          <div className="mb-1 flex flex-col gap-0.5">
            <label htmlFor="timeline-ii-vertical-speed" className="text-[9px] font-semibold">Speed</label>
            <select id="timeline-ii-vertical-speed" value={playbackSpeed} onChange={event=>setPlaybackSpeed(Number(event.target.value))} className="w-full min-w-0 rounded-md border border-[#c9b89d] bg-[#faf5eb] px-1 py-0.5 text-[10px]">
              <option value={0.5}>0.5×</option><option value={1}>1×</option><option value={2}>2×</option><option value={4}>4×</option>
            </select>
          </div>
          <div className="mb-1 flex flex-col gap-0.5">
            <label htmlFor="timeline-ii-vertical-mode" className="text-[9px] font-semibold leading-tight">Playback type</label>
            <select id="timeline-ii-vertical-mode" value={playbackMode} onChange={event=>setPlaybackMode(event.target.value)} className="w-full min-w-0 rounded-md border border-[#c9b89d] bg-[#faf5eb] px-1 py-0.5 text-[10px]">
              <option value="cumulative">Cumulative</option><option value="current">Concurrent</option>
            </select>
            <button type="button" aria-label="Explain playback types" aria-expanded={playbackHelpOpen} onMouseEnter={()=>setPlaybackHelpOpen(true)} onMouseLeave={()=>setPlaybackHelpOpen(false)} onFocus={()=>setPlaybackHelpOpen(true)} onBlur={()=>setPlaybackHelpOpen(false)} onClick={()=>setPlaybackHelpOpen(v=>!v)} className="shrink-0 cursor-help rounded-full border border-[#b4a087] bg-[#f5e9d5] px-1 text-[10px] font-bold text-[#7C211E] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#7C211E]">i</button>
          </div>
          <button type="button" onClick={resetPlayback} aria-label="Reset playback" className="w-full rounded-full border border-[#c9b89d] py-0.5 text-[11px]">↺ Reset</button>
        </div>}
      </div>
  </>;
}

export function ChronologyTransport(ui) {
  const {
    horizontal, verticalControlHeight, axisStart, length, min, max, lower, upper,
    visibleDays, overviewSpan, overviewLeft, overviewRight, overviewWidth,
    overviewTicks, playbackStarted, playbackDate, playbackPosition,
    playing, playbackSpeed, setPlaybackSpeed, playbackMode, setPlaybackMode,
    playbackHelpOpen, setPlaybackHelpOpen, rulerPointerDown, rulerPointerMove,
    rulerPointerEnd, clampWindow, stepPlayback, togglePlayback, resetPlayback,
    verticalControlsRef, rulerStart, rulerEnd, windowDate,
    CHRONOLOGY_RULER_HEIGHT, CHRONOLOGY_RULER_WIDTH,
    TRACK_GUTTER, VERTICAL_CONTROL_MIN_HEIGHT, MIN_DAYS,
  } = ui;
  return <>
    {horizontal && <div className="flex shrink-0 items-center justify-between gap-3 border-t border-[#b4a087] bg-[#fbf7ed] px-3 py-2 text-xs">
      <div className="flex min-w-0 items-center gap-2">
        <label className="sr-only" htmlFor="timeline-ii-speed">Playback speed</label>
        <select id="timeline-ii-speed" value={playbackSpeed} onChange={event=>setPlaybackSpeed(Number(event.target.value))} className="rounded-full border border-[#c9b89d] bg-[#faf5eb] px-3 py-1.5">
          <option value={0.5}>0.5×</option><option value={1}>1×</option><option value={2}>2×</option><option value={4}>4×</option>
        </select>
        <label className="sr-only" htmlFor="timeline-ii-mode">Playback type</label>
        <select id="timeline-ii-mode" value={playbackMode} onChange={event=>setPlaybackMode(event.target.value)} className="rounded-full border border-[#c9b89d] bg-[#faf5eb] px-3 py-1.5">
          <option value="cumulative">Cumulative</option><option value="current">Concurrent</option>
        </select>
        <button type="button" aria-label="Explain playback types" aria-expanded={playbackHelpOpen} onMouseEnter={()=>setPlaybackHelpOpen(true)} onMouseLeave={()=>setPlaybackHelpOpen(false)} onFocus={()=>setPlaybackHelpOpen(true)} onBlur={()=>setPlaybackHelpOpen(false)} onClick={()=>setPlaybackHelpOpen(v=>!v)} className="cursor-help rounded-full border border-[#b4a087] bg-[#f5e9d5] px-1.5 text-[#7C211E] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#7C211E]">i</button>
        <span className="hidden text-[#7C211E] sm:inline" aria-live="off">{playbackStarted ? windowDate(playbackDate,visibleDays) : 'Ready'}</span>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <button type="button" onClick={resetPlayback} aria-label="Reset playback" className="rounded-full border border-[#c9b89d] px-3 py-1.5">↺ Reset</button>
        <button type="button" onClick={()=>stepPlayback(-1)} aria-label="Step backward" className="rounded-full border border-[#c9b89d] px-3 py-1.5">◀|</button>
        <button type="button" onClick={()=>stepPlayback(1)} aria-label="Step forward" className="rounded-full border border-[#c9b89d] px-3 py-1.5">|▶</button>
        <button type="button" onClick={togglePlayback} className="rounded-full bg-[#253C32] px-4 py-1.5 font-semibold text-white">{playing?'Ⅱ Pause':'▶ Play'}</button>
      </div>
    </div>}
    {playbackHelpOpen && <div role="tooltip" className="pointer-events-none absolute z-[90] w-[275px] rounded-lg border border-[#a88b6b] bg-[#fbf7ed] p-3 text-xs leading-relaxed text-[#3e342a] shadow-[0_5px_18px_#392b1e35]" style={horizontal?{left:130,bottom:53}:{left:CHRONOLOGY_RULER_WIDTH+8,bottom:65}}>
      <div className="mb-2 font-serif text-sm font-bold text-[#7C211E]">Playback types</div>
      <div><strong>Cumulative</strong> — Adds records over time as playback advances.</div>
      <div className="mt-2"><strong>Concurrent</strong> — Shows only records whose dates or spans include the selected playback date.</div>
    </div>}
  </>;
}
