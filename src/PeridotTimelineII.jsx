/* Timeline II — bounded, single-axis temporal field.
 * A point is a selectable event node; an interval is a selectable duration band.
 * Labels never determine temporal coordinates. This experimental view reads but
 * never modifies canonical Evidence, event identities, or mapped categories.
 * All input dates are positioned on Peridot's proleptic Gregorian calendar.
 */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {packTimelineIIMarks, TIMELINE_II_LANE_COUNT} from './peridotTimelineIIPacking.js';
import {ChronologyRuler, ChronologyTransport} from './PeridotChronologyDock.jsx';
import { buildPeridotTimelineConnections, buildPeridotTimelineCategoryFields } from './peridotTimelineWorkspaceModel.js';
import { PeridotTimelineCategoryEditor } from './PeridotTimelineCategoryEditor.jsx';
import { createTimelineCategoryConfiguration, reconcileTimelineCategoryConfiguration, resolveTimelineCategories, TIMELINE_UNCATEGORIZED_COLOR } from './peridotTimelineCategoryConfiguration.js';
import { TimelineCategoryPoint, TimelinePeriodSymbolBadge, timelineMarkCategories, timelineMarkColors, timelinePeriodFill, timelineCategoryDescription } from './PeridotTimelineCategoryMarks.jsx';
import {civilDay, civilFromDay, createChronologyDomain, clampChronologyWindow, chronologyPosition, chronologyDayAtPosition, chronologyOverviewTicks} from './peridotChronologyWindow.js';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const MIN_DAYS = 7;
const TRACK_GUTTER = 76;
const CHRONOLOGY_RULER_HEIGHT = 92;
const CHRONOLOGY_RULER_WIDTH = 186;
const VERTICAL_CONTROL_MIN_HEIGHT = 154;
const VERTICAL_RULER_FOOTER = 16;
const VERTICAL_AXIS_START = 58;
// II-1: 50% larger than the v16 marks (31px nodes and 23px bands).
// Secondary-axis lanes are bounded by the visible viewport, never by event count.
// Reduced by approximately 18% after the category legibility review.
// Pass this same diameter into packing; do not shrink marks only with CSS.
const NODE_DIAMETER = 38;
const BAND_THICKNESS = 34.5;
const LANE_COUNT = TIMELINE_II_LANE_COUNT; // Shared with pure Packing A module.
const MARK_PADDING = 9;
// Darker, hue-matched outlines preserve boundaries when marks overlap.
// Multicolor pies receive a neutral dark outline (no category is privileged).
function categoryNodeOutline(color, isMulti) {
  if (isMulti) return '#3B352E';
  const hex = /^#([0-9a-f]{6})$/i.exec(color || '');
  if (!hex) return '#272421';
  return `#${[0,2,4].map(i=>Math.round(parseInt(hex[1].slice(i,i+2),16)*0.63).toString(16).padStart(2,'0')).join('')}`;
}
// P2C presentation-only entrance: 18 deterministic temporal-independent waves.
// All marks retain their plotted coordinates and remain individually rendered.
const TIMELINE_II_REVEAL_WAVES = 18;
const TIMELINE_II_REVEAL_STEP_MS = 48;
const TIMELINE_II_REVEAL_DURATION_MS = 410;
const TIMELINE_II_REVEAL_TOTAL_MS = (TIMELINE_II_REVEAL_WAVES - 1) * TIMELINE_II_REVEAL_STEP_MS + TIMELINE_II_REVEAL_DURATION_MS + 100;
function timelineIIRevealWave(value) {
  let hash = 2166136261;
  const id = String(value ?? '');
  for (let i = 0; i < id.length; i++) {
    hash ^= id.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0) % TIMELINE_II_REVEAL_WAVES;
}


// P1 diagnostics only. Passive measurements; no console spam and no production
// instrumentation. Run window.peridotTimelineIIPerf.report() in DevTools.
const TIMELINE_II_PROFILE_ENABLED = import.meta.env.DEV;
const timelineIIPerf = {
  samples: [],
  record(stage, duration, details = {}) {
    if (!TIMELINE_II_PROFILE_ENABLED) return;
    this.samples.push({stage, ms:duration, ...details});
    if (this.samples.length > 2000) this.samples.splice(0, this.samples.length - 2000);
  },
  report() {
    const grouped = new Map();
    for (const sample of this.samples) {
      if (!grouped.has(sample.stage)) grouped.set(sample.stage, []);
      grouped.get(sample.stage).push(sample.ms);
    }
    const rows = [...grouped].map(([stage, durations]) => {
      const sorted = [...durations].sort((a,b) => a-b);
      return {stage, calls:sorted.length, totalMs:Number(sorted.reduce((a,b)=>a+b,0).toFixed(1)),
        avgMs:Number((sorted.reduce((a,b)=>a+b,0)/sorted.length).toFixed(2)),
        p95Ms:Number(sorted[Math.min(sorted.length-1,Math.ceil(sorted.length*0.95)-1)].toFixed(2)),
        maxMs:Number(sorted[sorted.length-1].toFixed(2))};
    });
    console.table(rows);
    console.log('Recent Timeline II samples (up to 25):', this.samples.slice(-25));
    return rows;
  },
  clear() {this.samples.length = 0; console.info('Timeline II performance samples cleared');},
};
if (TIMELINE_II_PROFILE_ENABLED && typeof window !== 'undefined') {
  window.peridotTimelineIIPerf = timelineIIPerf;
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
// Playback has a different semantic obligation from plotting: a year/month-only
// point can occur anywhere in its source-supported calendar window. Prefer the
// canonical endpoint's conservative possible bounds, not its January/first-day
// drawing anchor. No historical-calendar conversion or inferred exact day occurs.
function possibleOrdinal(ep, side) {
  const value = ep?.possibleBounds?.[side] ?? ep?.sortBounds?.[side];
  if (Number.isInteger(value)) {
    const year = Math.trunc(value / 10000);
    const month = Math.trunc(Math.abs(value) % 10000 / 100);
    const day = Math.abs(value) % 100;
    if (month >= 1 && month <= 12 && day >= 1 && day <= 31) return civilDay(year, month, day);
  }
  if (!ep || !Number.isInteger(ep.year)) return null;
  if (side === 'start') return civilDay(ep.year, ep.month || 1, ep.day || 1);
  if (!ep.month) return civilDay(ep.year + 1) - 1;
  if (!ep.day) return (ep.month === 12 ? civilDay(ep.year + 1) : civilDay(ep.year, ep.month + 1)) - 1;
  return civilDay(ep.year, ep.month, ep.day);
}
function dateLabel(ep) {
  if (!ep || !Number.isInteger(ep.year)) return 'Date unspecified';
  if (!ep.month) return String(ep.year);
  if (!ep.day) return `${MONTHS[ep.month - 1]} ${ep.year}`;
  return `${ep.day} ${MONTHS[ep.month - 1]} ${ep.year}`;
}

function clamp(value, minimum, maximum) {
  return Math.min(maximum, Math.max(minimum, value));
}
function connectionLabel(connection) {
  const relationship = String(connection?.relationshipLabel || connection?.relationshipType || 'Mapped relationship').trim();
  const connector = connection?.direction === 'directed' ? '→' : '—';
  return `${connection?.source || 'Source'} ${connector} ${connection?.target || 'Target'} · ${relationship}`;
}
function eventTemporalCenter(item) {
  return item?.period ? (item.plotStart + item.plotFinish) / 2 : item?.plotStart;
}
function relationshipAnchor(item, counterpart, horizontal, lanePosition) {
  if (!item) return { x: 0, y: 0 };
  const cross = lanePosition(item.lane);
  let temporal = eventTemporalCenter(item);
  if (item.period) {
    const midpoint = eventTemporalCenter(item);
    const otherTemporal = eventTemporalCenter(counterpart);
    const extent = Math.max(1, item.plotFinish - item.plotStart);
    if (Number.isFinite(otherTemporal)) {
      if (otherTemporal > midpoint + extent * 0.06) temporal = item.plotFinish;
      else if (otherTemporal < midpoint - extent * 0.06) temporal = item.plotStart;
      else temporal = midpoint;
    }
  }
  return horizontal ? { x: temporal, y: cross } : { x: cross, y: temporal };
}
function TimelineIIRelationshipLayer({
  items = [],
  connections = [],
  horizontal = true,
  activeEventId = '',
  size = { width: 0, height: 0 },
  lanePosition,
}) {
  if (!connections.length || !items.length || typeof lanePosition !== 'function') return null;
  const itemById = new Map(items.map((item) => [item.event.id, item]));
  const visibleConnections = connections.filter((connection) => (
    itemById.has(connection?.sourceEventId)
    && itemById.has(connection?.targetEventId)
    && connection.sourceEventId !== connection.targetEventId
  ));
  if (!visibleConnections.length) return null;

  const orderedConnections = [...visibleConnections]
    .map((connection) => {
      const sourceItem = itemById.get(connection.sourceEventId);
      const targetItem = itemById.get(connection.targetEventId);
      return {
        connection,
        sourceItem,
        targetItem,
        span: Math.abs((eventTemporalCenter(targetItem) ?? 0) - (eventTemporalCenter(sourceItem) ?? 0)),
      };
    })
    .filter(({ sourceItem, targetItem }) => sourceItem && targetItem)
    .sort((a, b) => (
      a.span - b.span
      || (a.sourceItem.day - b.sourceItem.day)
      || String(a.connection.id).localeCompare(String(b.connection.id))
    ));

  const arrowId = `peridot-timelineii-relationship-arrow-${horizontal ? 'h' : 'v'}`;
  const activeArrowId = `peridot-timelineii-relationship-arrow-active-${horizontal ? 'h' : 'v'}`;

  const segments = orderedConnections.map(({ connection, sourceItem, targetItem }, index) => {
    const source = relationshipAnchor(sourceItem, targetItem, horizontal, lanePosition);
    const target = relationshipAnchor(targetItem, sourceItem, horizontal, lanePosition);
    const separation = horizontal ? Math.abs(target.x - source.x) : Math.abs(target.y - source.y);
    const tier = index % 6;
    let path = '';
    if (horizontal) {
      const ceiling = Math.max(18, Math.min(source.y, target.y) - 26);
      const lift = clamp(38 + separation * 0.16 + tier * 10, 28, Math.max(34, ceiling));
      const controlY = clamp(Math.min(source.y, target.y) - lift, 16, Math.max(16, Math.min(size.height - CHRONOLOGY_RULER_HEIGHT - 18, Math.min(source.y, target.y) - 14)));
      path = `M ${source.x} ${source.y} C ${source.x} ${controlY}, ${target.x} ${controlY}, ${target.x} ${target.y}`;
    } else {
      const roomRight = Math.max(24, size.width - Math.max(source.x, target.x) - 24);
      const push = clamp(40 + separation * 0.14 + tier * 12, 28, roomRight);
      const controlX = clamp(Math.max(source.x, target.x) + push, Math.max(source.x, target.x) + 18, size.width - 18);
      path = `M ${source.x} ${source.y} C ${controlX} ${source.y}, ${controlX} ${target.y}, ${target.x} ${target.y}`;
    }
    const focused = activeEventId && (connection.sourceEventId === activeEventId || connection.targetEventId === activeEventId);
    const unrelatedWhileFocused = activeEventId && !focused;
    const structural = connection.temporalGrounding === 'structural';
    return {
      id: connection.id,
      connection,
      path,
      focused,
      unrelatedWhileFocused,
      structural,
      span: separation,
    };
  }).sort((a, b) => Number(a.focused) - Number(b.focused) || a.span - b.span || String(a.id).localeCompare(String(b.id)));

  return (
    <svg
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-[2] overflow-hidden"
      width={size.width}
      height={size.height}
      viewBox={`0 0 ${size.width} ${size.height}`}
    >
      <defs>
        <marker id={arrowId} markerWidth="8" markerHeight="8" refX="6.5" refY="4" orient="auto" markerUnits="strokeWidth">
          <path d="M 0 0 L 8 4 L 0 8 z" fill="#705b43" />
        </marker>
        <marker id={activeArrowId} markerWidth="9" markerHeight="9" refX="7.2" refY="4.5" orient="auto" markerUnits="strokeWidth">
          <path d="M 0 0 L 9 4.5 L 0 9 z" fill="#7C211E" />
        </marker>
      </defs>
      {segments.map(({ id, connection, path, focused, unrelatedWhileFocused, structural }) => {
        const stroke = focused ? '#7C211E' : structural ? 'rgba(37, 60, 50, 0.34)' : 'rgba(112, 91, 67, 0.44)';
        const opacity = focused ? 0.98 : unrelatedWhileFocused ? 0.12 : structural ? 0.5 : 0.64;
        const width = focused ? 2.7 : structural ? 1.6 : 1.85;
        return (
          <path
            key={id}
            d={path}
            fill="none"
            stroke={stroke}
            strokeWidth={width}
            strokeOpacity={opacity}
            strokeLinecap="round"
            strokeDasharray={structural ? '6 6' : undefined}
            markerEnd={connection.direction === 'directed' ? `url(#${focused ? activeArrowId : arrowId})` : undefined}
          >
            <title>{connectionLabel(connection)}</title>
          </path>
        );
      })}
    </svg>
  );
}
function eventRows(events) {
  return (Array.isArray(events) ? events : []).map(event => {
    const start = getEndpoint(event, 'start'), end = getEndpoint(event, 'end');
    const a = ordinal(start) ?? ordinal(end);
    if (!Number.isFinite(a)) return null;
    const b = ordinal(end) ?? a;
    const period = event.temporalPresentationContract?.kind === 'period' || ['interval','openInterval'].includes(event.temporalKind);
    const row = event.row || {};
    const title = String(event.subject?.label || row.title || row.Title || row.name || row.Name || event.temporalRole || 'Untitled event');
    const uncertain = !start?.month || !start?.day || /circa|approximate|partial|uncertain/i.test(`${event.temporalShape} ${event.qualifier}`);
    const contract = event.temporalPresentationContract;
    // Use possible occurrence bounds for playback only. Keep the existing
    // date-to-pixel positions unchanged for this narrowly scoped behavior pass.
    const playbackStart = possibleOrdinal(start, 'start') ?? possibleOrdinal(end, 'start') ?? Math.min(a,b);
    const playbackEnd = period
      ? possibleOrdinal(end, 'end') ?? possibleOrdinal(start, 'end') ?? Math.max(a,b)
      : possibleOrdinal(start, 'end') ?? possibleOrdinal(end, 'end') ?? a;
    return {event,start,end,day: Math.min(a,b),endDay:period ? Math.max(a,b) : a,
      playbackStart: Math.min(playbackStart, playbackEnd),
      playbackEnd: Math.max(playbackStart, playbackEnd),
      period,title,uncertain,
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


function windowDate(day, span) {
  const date = civilFromDay(Math.floor(day));
  return span > 365 * 8 ? String(date.year)
    : span > 45 ? `${MONTHS[date.month - 1]} ${date.year}`
    : `${date.day} ${MONTHS[date.month - 1]} ${date.year}`;
}
// Ruler labels describe the same actual calendar positions as plotted marks.
// Detailed field only: these ticks share the exact Gregorian day coordinates
// used by event marks. The full-domain ChronologyDock overview is independent.
// Tick frequency is determined by available pixels, while label collision
// avoidance is a separate concern: unlabeled lines remain useful guides.
function rulerTicks(lower, upper, pixels, vertical = false) {
  const span = Math.max(1, upper - lower);
  const pxPerDay = pixels / span;
  const pxPerYear = pxPerDay * 365.2425;
  const start = civilFromDay(Math.floor(lower));
  const end = civilFromDay(Math.ceil(upper));
  const ticks = new Map();
  const add = (day, label, level) => {
    if (day < lower || day > upper) return;
    const key = Math.round(day);
    const previous = ticks.get(key);
    // Keep the most significant calendar boundary when year/month/day coincide.
    if (!previous || level > previous.level) ticks.set(key, {day:key,label,level});
  };

  // Decade/year resolution for long windows. At a multi-decade zoom, draw
  // annual guides whenever they are at least ~7px apart; labels remain sparse.
  const yearStep = pxPerYear >= 7 ? 1 : pxPerYear >= 3.5 ? 2
    : pxPerYear >= 1.4 ? 5 : pxPerYear >= 0.7 ? 10
    : pxPerYear >= 0.28 ? 25 : 50;
  const firstYear = Math.ceil(start.year / yearStep) * yearStep;
  for (let year = firstYear; year <= end.year && ticks.size < 600; year += yearStep) {
    const level = year % (yearStep * 5) === 0 ? 3 : 2;
    add(civilDay(year), String(year), level);
  }

  // Use real calendar boundaries, never fractional 30-day or 365-day steps.
  // Month lines appear when sufficiently spaced, including in multi-year views.
  if (pxPerDay * 28 >= 7) {
    let year = start.year, month = start.month;
    let guard = 0;
    while ((year < end.year || (year === end.year && month <= end.month)) && guard++ < 650) {
      const day = civilDay(year, month);
      if (month === 1) add(day, String(year), 3);
      else add(day, `${MONTHS[month - 1]} ${year}`, 2);
      month += 1;
      if (month > 12) { month = 1; year += 1; }
    }
  }

  // In closer views weekly guides give a bridge between months and days.
  // Anchoring to civil-day integers guarantees that guides don't drift.
  if (pxPerDay * 7 >= 7 && span <= 500) {
    for (let day = Math.ceil(lower / 7) * 7, count = 0;
      day <= upper && count++ < 600; day += 7) {
      const date = civilFromDay(day);
      add(day, `${date.day} ${MONTHS[date.month - 1]}`, 1);
    }
  }

  // At close zoom draw EVERY calendar day if at least 7px apart. Day labels
  // are emitted only when there is enough room, by collision suppression.
  if (pxPerDay >= 7 && span <= 240) {
    for (let day = Math.ceil(lower), count = 0;
      day <= upper && count++ < 300; day++) {
      const date = civilFromDay(day);
      add(day, `${date.day} ${MONTHS[date.month - 1]}`, 0);
    }
  }

  const sorted = [...ticks.values()].sort((a,b) => a.day - b.day);
  // Reserve label room for the strongest boundaries first (year, then month,
  // then week/day). Otherwise an arbitrary daily label can hide January 1.
  const occupied = [];
  const labels = new Set();
  const candidates = [...sorted].sort((a,b) => b.level-a.level || a.day-b.day);
  for (const tick of candidates) {
    const coordinate = (tick.day - lower) * pxPerDay;
    const width = tick.label.length === 4 && /^-?\d{4}$/.test(tick.label)
      ? 32 : Math.max(35, tick.label.length * 6 + 8);
    const halfWidth = (vertical ? 17 : Math.max(38, width + 8)) / 2;
    if (occupied.some(box => coordinate-halfWidth < box.end+5 && coordinate+halfWidth > box.start-5)) continue;
    occupied.push({start:coordinate-halfWidth,end:coordinate+halfWidth});
    labels.add(tick.day);
  }
  return sorted.map(tick => ({...tick,label:labels.has(tick.day)?tick.label:'',major:tick.level>=2}));
}

function spanCaption(days) {
  if (days <= 7.01) return '1 week';
  if (days < 365) return `${Math.round(days)} days`;
  if (days < 730) return '1 year';
  return `${Math.round(days/365.2425)} years`;
}

export function PeridotTimelineII({
  events = [], domainEvents = [], chronologySourceBounds = null,
  relationshipRows = [], selectedEventId = '', onEventClick,
  initialChronologySession = null, onChronologySessionChange,
  datasetSessionKey = 0, isChronologyActive = true,
}) {
  const renderStartedAt = TIMELINE_II_PROFILE_ENABLED ? performance.now() : 0;
  // Restored values are source-independent calendar-day coordinates, not
  // indices into Map/Network's chronology. Null still means initial full fit.
  // Preserve orientation and marker visibility alongside the chronology session.
  const [direction,setDirection] = useState(() => initialChronologySession?.direction ?? 'horizontal');
  const [requestedVisibleDays,setVisibleDays] = useState(() => initialChronologySession?.requestedVisibleDays ?? null);
  const [center,setCenter] = useState(() => initialChronologySession?.center ?? null);
  const [showPoints,setShowPoints] = useState(() => initialChronologySession?.showPoints ?? true);
  const [showPeriods,setShowPeriods] = useState(() => initialChronologySession?.showPeriods ?? true);
  const [showRelationships,setShowRelationships] = useState(() => initialChronologySession?.showRelationships ?? true);
  // Category choices are researcher-selected presentation, not Evidence edits.
  // The dataset-keyed parent session saves them across public page navigation.
  const [categoryConfiguration,setCategoryConfiguration] = useState(() => initialChronologySession?.categoryConfiguration ?? createTimelineCategoryConfiguration());
  // Local stage navigation only; configuration stays in the same dataset session.
  // Never unmount the Timeline viewport: its ResizeObserver, packing cache and
  // continuous chronology interactions are owned by this component.
  const [categoryEditorOpen,setCategoryEditorOpen] = useState(false);
  const [localSelected,setLocalSelected] = useState('');
  const [hoveredId,setHoveredId] = useState('');
  const [hoverPosition,setHoverPosition] = useState(null);
  const [size,setSize] = useState({width:1200,height:500});
  const [verticalControlHeight,setVerticalControlHeight] = useState(VERTICAL_CONTROL_MIN_HEIGHT);
  // Timeline II-only playback. This does not modify the shared Visualize scrubber.
  const [playhead,setPlayhead] = useState(() => initialChronologySession?.playhead ?? null);
  // Returning to Timeline is always paused, even if it was playing on exit.
  const [playing,setPlaying] = useState(false);
  const [playbackSpeed,setPlaybackSpeed] = useState(() => initialChronologySession?.playbackSpeed ?? 1);
  const [playbackMode,setPlaybackMode] = useState(() => initialChronologySession?.playbackMode ?? 'cumulative');
  const [playbackStarted,setPlaybackStarted] = useState(() => initialChronologySession?.playbackStarted ?? false);
  const [playbackHelpOpen,setPlaybackHelpOpen] = useState(false);
  // Visualize may stay mounted while another public page is open. Never let
  // Timeline II's animation advance invisibly beneath that page.
  useEffect(() => {
    if (!isChronologyActive) setPlaying(false);
  }, [isChronologyActive]);
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
  // Capture only first-view identities; any navigation ends the entrance
  // so off-screen marks entering later never receive a new raindrop animation.
  const revealInitialIdsRef = useRef(null);
  // The dispersed entrance happens only on a new dataset's first Timeline
  // opening, not when restoring an already visited visualization.
  const [revealPhase,setRevealPhase] = useState(() => initialChronologySession ? 'complete' : 'before');
  // Session snapshots use a ref and a passive effect. This avoids sending
  // playback-frame React updates through App's large graph/Map data pipeline.
  const sessionChangeRef = useRef(onChronologySessionChange);
  sessionChangeRef.current = onChronologySessionChange;
  // Bind the writer to the dataset on which this component was first mounted.
  const mountedDatasetRevisionRef = useRef(datasetSessionKey);
  const savedSessionRef = useRef(null);
  savedSessionRef.current = {
    direction, requestedVisibleDays, center, showPoints, showPeriods,
    showRelationships, categoryConfiguration, playhead, playbackSpeed, playbackMode, playbackStarted,
  };
  useEffect(() => {
    sessionChangeRef.current?.(savedSessionRef.current, mountedDatasetRevisionRef.current);
  }, [direction, requestedVisibleDays, center, showPoints, showPeriods,
      showRelationships, categoryConfiguration, playhead, playbackSpeed, playbackMode, playbackStarted]);
  // Also flush the last committed state when the visualization unmounts.
  useEffect(() => () => sessionChangeRef.current?.(savedSessionRef.current, mountedDatasetRevisionRef.current), []);
  const stopEntranceOnNavigation = () => setRevealPhase(current => current === 'complete' ? current : 'complete');

  const all = useMemo(()=>{
    const t0 = TIMELINE_II_PROFILE_ENABLED ? performance.now() : 0;
    const result = eventRows(events);
    timelineIIPerf.record('event normalization', performance.now()-t0, {inputEvents:events.length,positionable:result.length});
    return result;
  },[events]);
  // The domain is built from every mapped temporal assertion, not the
  // Search-filtered event list. Filters alter marks and relationships, never
  // the horizontal/vertical chronology boundaries or a saved viewport.
  const domainAll = useMemo(() => eventRows(domainEvents), [domainEvents]);
  // Use the complete dataset inventory: Search narrowing never drops a field
  // or a category choice from the editor. No category choice filters events.
  const categoryFields = useMemo(() => buildPeridotTimelineCategoryFields(domainEvents), [domainEvents]);
  const activeCategoryConfiguration = useMemo(
    () => reconcileTimelineCategoryConfiguration(categoryConfiguration, categoryFields),
    [categoryConfiguration, categoryFields]);
  // Pass 3: project selected, exact Evidence identities onto displayed events.
  // Search, playback, packing and dataset bounds remain independently owned;
  // category selection changes visual encoding only and never hides a mark.
  const resolvedCategories = useMemo(() => resolveTimelineCategories(events,categoryFields,activeCategoryConfiguration),
    [events,categoryFields,activeCategoryConfiguration]);
  const categoriesById = useMemo(()=>new Map(resolvedCategories.categories.map(category=>[category.id,category])),[resolvedCategories]);
  const eventCategoriesById = useMemo(()=>new Map(resolvedCategories.eventCategories.map(entry=>[entry.eventId,entry])),[resolvedCategories]);
  const filtered = useMemo(()=>all.filter(item=>item.period?showPeriods:showPoints),[all,showPoints,showPeriods]);
  const timelineConnections = useMemo(() => {
    const t0 = TIMELINE_II_PROFILE_ENABLED ? performance.now() : 0;
    const result = buildPeridotTimelineConnections(events, relationshipRows);
    timelineIIPerf.record('relationship derivation', performance.now()-t0, {events:events.length,relationshipRows:relationshipRows.length,links:result.length});
    return result;
  }, [events, relationshipRows]);
  // Use precisely the same canonical assertion endpoint domain as the shared
  // adapter. The eventRows fallback remains for standalone fixture consumers.
  const min = Number.isFinite(chronologySourceBounds?.min)
    ? chronologySourceBounds.min : (domainAll.length ? domainAll[0].day : 0);
  const max = Number.isFinite(chronologySourceBounds?.max)
    ? chronologySourceBounds.max : (domainAll.length ? Math.max(...domainAll.map(item=>item.endDay)) : 365);
  // The shared calendar engine owns the padded domain; source-supported
  // Timeline event endpoints continue to determine its unfiltered input.
  const chronologyDomain = createChronologyDomain(min, max, {minimumSpanDays:MIN_DAYS});
  const domainCenter = chronologyDomain.center;
  const openingDays = chronologyDomain.span;
  // Maximum zoom-out equals the 10%-padded opening domain.
  const maximumVisibleDays = openingDays;
  const visibleDays = requestedVisibleDays ?? openingDays;
  const actualCenter = center === null ? domainCenter : center;
  const half = visibleDays / 2;
  const paddedMin = chronologyDomain.min;
  const paddedMax = chronologyDomain.max;
  const safeCenter = Math.min(paddedMax - half, Math.max(paddedMin + half, actualCenter));
  const lower = safeCenter-half, upper = safeCenter+half;
  const horizontal = direction === 'horizontal';
  const axisStart = horizontal ? TRACK_GUTTER : VERTICAL_AXIS_START;
  const length = Math.max(120,(horizontal?size.width:size.height) - axisStart - (horizontal ? 18 : 20));
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
  const pos = day => chronologyPosition(day, lower, upper, axisStart, length);
  // Select only events whose actual times intersect the visible chronology.
  const inWindow = filtered.filter(item => item.endDay >= lower && item.day <= upper);
  // Packing A: globally aware temporal-neighborhood placement followed by
  // bounded deterministic improvement. The chronological coordinate is fixed.
  const footprintItems = inWindow.map(item => {
    const start = pos(item.day), finish = pos(item.endDay);
    return {id:item.event.id,start,finish,period:item.period};
  });
  const lanePositions = Array.from({length:laneCount},(_,lane)=>lanePosition(lane));
  // P2B: lane identity is stable across time-scale changes and panning.
  // Repack only when the dataset or perpendicular geometry fundamentally changes.
  // Individual newly visible events get an inexpensive deterministic lane assignment.
  const packingContext = {events, direction, crossStart, crossSpan};
  const history = packingHistoryRef.current;
  const sameContext = history.context
    && history.context.events === packingContext.events
    && history.context.direction === packingContext.direction
    && history.context.crossStart === packingContext.crossStart
    && Math.abs(history.context.crossSpan - packingContext.crossSpan) < 1;
  if (!sameContext) {
    history.context = packingContext;
    history.lanes = new Map();
    history.cachedPacking = null;
  }
  const previousPacking = history.cachedPacking;
  const sameFootprints = Boolean(previousPacking)
    && previousPacking.lower === lower
    && previousPacking.length === length
    && previousPacking.items.length === footprintItems.length
    && footprintItems.every((item,index) => {
      const prior = previousPacking.items[index];
      return item.id === prior.id && item.start === prior.start
        && item.finish === prior.finish && item.period === prior.period;
    });
  let lanes;
  if (sameFootprints) {
    lanes = previousPacking.lanes;
    timelineIIPerf.record('lane packing cache hit',0,{visibleEvents:inWindow.length,orientation:direction,zoomDays:visibleDays});
  } else if (history.lanes.size) {
    // The chronologic projection changes at every zoom step, but this does not
    // require moving known marks to different secondary-axis lanes.
    // New arrivals are assigned a stable, deterministic lane. Never mutate
    // existing assignments merely because a viewport boundary moved.
    lanes = footprintItems.map(item => {
      const id = String(item.id);
      let lane = history.lanes.get(id);
      if (!Number.isInteger(lane) || lane < 0 || lane >= laneCount) {
        let hash = 2166136261;
        for (let i=0;i<id.length;i++) {
          hash ^= id.charCodeAt(i);
          hash = Math.imul(hash,16777619);
        }
        lane = (hash >>> 0) % laneCount;
        history.lanes.set(id,lane);
      }
      return lane;
    });
    timelineIIPerf.record('lane packing stable reuse',0,{visibleEvents:inWindow.length,orientation:direction,zoomDays:visibleDays});
  } else {
    const packingStartedAt = TIMELINE_II_PROFILE_ENABLED ? performance.now() : 0;
    lanes = packTimelineIIMarks(footprintItems,lanePositions,{
      nodeDiameter:NODE_DIAMETER,bandThickness:BAND_THICKNESS,padding:MARK_PADDING,sweeps:2,
      lockedLanes:history.lanes,
    });
    timelineIIPerf.record('lane packing',performance.now()-packingStartedAt,{visibleEvents:inWindow.length,lanes:laneCount,orientation:direction,zoomDays:visibleDays});
    inWindow.forEach((item,index) => history.lanes.set(String(item.event.id),lanes[index]));
  }
  history.cachedPacking = {lower,length,items:footprintItems,lanes};
  const packed = inWindow.map((item,index)=>({
    ...item,lane:lanes[index],plotStart:footprintItems[index].start,plotFinish:footprintItems[index].finish,
  }));
  const selected = all.find(item=>item.event.id === (selectedEventId || localSelected));
  const hovered = all.find(item=>item.event.id === hoveredId);
  // One temporary reading aid at a time. A hover/focus takes precedence over
  // selection, and playback-hidden events must not leave phantom guide lines.
  const guideItem = packed.find(item => item.event.id === (hoveredId || (selectedEventId || localSelected)));
  const ticksStartedAt = TIMELINE_II_PROFILE_ENABLED ? performance.now() : 0;
  const ticks = rulerTicks(lower,upper,length,!horizontal);
  timelineIIPerf.record('detailed grid', performance.now()-ticksStartedAt, {tickCount:ticks.length,zoomDays:visibleDays});
  const rulerStart = windowDate(lower,visibleDays);
  const rulerEnd = windowDate(upper,visibleDays);
  const playbackDate = Math.max(lower,Math.min(upper,playhead ?? lower));
  // The playhead uses the same padded calendar axis as the navigator.
  const playbackPosition = axisStart + (playbackDate - paddedMin) / Math.max(1,paddedMax-paddedMin) * length;
  const playbackItems = playbackStarted
    ? packed.filter(item=>playbackMode==='cumulative'
      ? item.playbackStart <= playbackDate
      : item.playbackStart <= playbackDate && item.playbackEnd >= playbackDate)
    : packed;
  if (revealInitialIdsRef.current === null && all.length) {
    revealInitialIdsRef.current = new Set(playbackItems.map(item => String(item.event.id)));
  }

  const activeConnectionEventId = hoveredId || (selectedEventId || localSelected);
  // Overview positions always use the full dataset domain; detailed ticks
  // continue to use the current visible chronology.
  const overviewSpan = Math.max(1, paddedMax - paddedMin);
  const overviewStart = Math.max(paddedMin, Math.min(paddedMax, lower));
  const overviewEnd = Math.max(paddedMin, Math.min(paddedMax, upper));
  const overviewLeft = axisStart + (overviewStart - paddedMin) / overviewSpan * length;
  const overviewRight = axisStart + (overviewEnd - paddedMin) / overviewSpan * length;
  const overviewWidth = Math.max(0, overviewRight - overviewLeft);
  // Overview ticks use full-domain positions. Minor strokes may be closer
  // together, but labels are measured and suppressed independently.
  // Match the exact labels/positions used by Map, Network and Charts.
  const overviewTicks = useMemo(() => chronologyOverviewTicks(
    paddedMin, paddedMax, length, {horizontal}
  ), [paddedMin, paddedMax, length, horizontal]);
  const axisCoord = event => horizontal ? event.clientX : event.clientY;
  const overviewDayAt = event => {
    const rect = event.currentTarget.getBoundingClientRect();
    const px = (horizontal ? event.clientX - rect.left : event.clientY - rect.top) - axisStart;
    return chronologyDayAtPosition(Math.max(0, Math.min(length, px)), paddedMin, paddedMax, 0, length);
  };
  const clampWindow = (start, end) => {
    stopEntranceOnNavigation();
    const window = clampChronologyWindow(start, end, chronologyDomain, {minimumSpanDays:MIN_DAYS});
    setVisibleDays(window.span);
    setCenter(window.center);
  };
  useEffect(() => {
    if (revealPhase !== 'before' || !revealInitialIdsRef.current?.size) return undefined;
    // The scene and its geometry have committed before the reveal starts.
    // Timers control just two React state changes, not individual marks.
    let frame1 = 0;
    let frame2 = 0;
    let finished = 0;
    frame1 = requestAnimationFrame(() => {
      frame2 = requestAnimationFrame(() => {
        setRevealPhase('revealing');
        finished = window.setTimeout(() => setRevealPhase('complete'), TIMELINE_II_REVEAL_TOTAL_MS);
      });
    });
    return () => {
      cancelAnimationFrame(frame1);
      cancelAnimationFrame(frame2);
      window.clearTimeout(finished);
    };
  }, [revealPhase, all.length]);
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
    stopEntranceOnNavigation();
    if(playing){setPlaying(false);return;}
    setPlaybackStarted(true);
    setPlayhead(current=>current===null || current>=upper ? lower : Math.max(lower,current));
    setPlaying(true);
  };
  const stepPlayback=direction=>{
    stopEntranceOnNavigation();
    pausePlayback();setPlaybackStarted(true);
    setPlayhead(current=>Math.max(lower,Math.min(upper,(current??lower)+direction*Math.max(1,visibleDays/24))));
  };
  // Reset both the chronology viewport and playback to this dataset's
  // complete 10%-padded opening domain. This is local to Timeline II.
  const resetPlayback=()=>{
    pausePlayback();setPlayhead(null);setPlaybackStarted(false);
    setVisibleDays(null);setCenter(null);
  };
  const zoomBy = factor => {
    stopEntranceOnNavigation();
    setVisibleDays(days=>Math.max(MIN_DAYS,Math.min(maximumVisibleDays,(days ?? visibleDays)*factor)));
  };
  const panBy = delta => {
    stopEntranceOnNavigation();
    setCenter(current=>{
    const old=current===null?actualCenter:current;
    return Math.max(paddedMin+visibleDays/2,Math.min(paddedMax-visibleDays/2,old+delta));
    });
  };
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
    stopEntranceOnNavigation();
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
    stopEntranceOnNavigation();
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
    const delta = pixelDelta / Math.max(1,length) * overviewSpan;
    if (drag.role === 'playhead') {
      stopEntranceOnNavigation();
      setPlaybackStarted(true);
      setPlayhead(Math.max(lower,Math.min(upper,overviewDayAt(event))));
    } else if (drag.role === 'start') {
      clampWindow(Math.max(paddedMin,Math.min(drag.end-MIN_DAYS,drag.start+delta)),drag.end);
    } else if (drag.role === 'end') {
      clampWindow(drag.start,Math.min(paddedMax,Math.max(drag.start+MIN_DAYS,drag.end+delta)));
    } else if (drag.role === 'body') {
      const span=drag.end-drag.start;
      if (span >= overviewSpan - 0.0001) {
        // Full-domain (or wider) views have no meaningful overview travel.
        // Keep zoom and center unchanged until the user explicitly adjusts a clamp.
        return;
      }
      const left=Math.max(paddedMin,Math.min(paddedMax-span,drag.start+delta));
      stopEntranceOnNavigation();
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
      if (span < overviewSpan) clampWindow(date-span/2,date+span/2);
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
    min:paddedMin, max:paddedMax,
    sourceMin:min, sourceMax:max,
    lower, upper, visibleDays, overviewSpan,
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
  timelineIIPerf.record('render calculations (pre-JSX)', performance.now()-renderStartedAt, {totalEvents:all.length,visibleEvents:inWindow.length,playbackVisible:playbackItems.length,links:timelineConnections.length,orientation:direction,zoomDays:visibleDays});
  if(!domainAll.length)return <div className="flex min-h-0 flex-1 items-center justify-center rounded-xl bg-[#eee0c7] text-[#4b4236]">No positionable events available to Timeline II.</div>;
  return <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-[#b4a087] bg-[#eee0c7] text-[#302b24]">
    {/* Timeline-owned subnavigation mirrors the Charts II two-tab pattern.
        The shared Visualize workspace is deliberately untouched while its
        parallel Charts II branch contains uncommitted source changes. */}
    <nav className="z-20 flex h-12 shrink-0 items-center justify-center gap-1 border-b border-[#d5c1a5] bg-[#fbf7ed]" aria-label="Timeline workspace">
      <button type="button" aria-current={!categoryEditorOpen?'page':undefined} onClick={()=>setCategoryEditorOpen(false)} className={`rounded-md border px-4 py-1.5 text-xs font-bold uppercase tracking-wide focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#7C211E] ${!categoryEditorOpen?'border-[#b4a087] bg-[#e7d7b9] text-[#253C32]':'border-transparent text-[#302b24] hover:bg-[#eee0c7]'}`}>Timeline</button>
      <button type="button" aria-current={categoryEditorOpen?'page':undefined} onClick={()=>{setPlaying(false);setCategoryEditorOpen(true);}} className={`rounded-md border px-4 py-1.5 text-xs font-bold uppercase tracking-wide focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#7C211E] ${categoryEditorOpen?'border-[#b4a087] bg-[#e7d7b9] text-[#253C32]':'border-transparent text-[#302b24] hover:bg-[#eee0c7]'}`}>Categories</button>
    </nav>
    {/* Keep the plotted stage mounted and measured even while its separate
        editor occupies the full workspace. This preserves exact zoom/window
        and avoids re-running the entrance animation when returning. */}
    <div aria-hidden={categoryEditorOpen} className={`flex min-h-0 flex-1 flex-col ${categoryEditorOpen?'invisible pointer-events-none absolute inset-x-0 bottom-0 top-12':''}`}>
    <style>{`@keyframes peridot-timelineii-raindrop { from { opacity: 0; transform: scale(0.88); } to { opacity: 1; transform: scale(1); } }
      @media (prefers-reduced-motion: reduce) { .peridot-timelineii-reveal { animation: none !important; opacity: 1 !important; transform: none !important; } }`}</style>
    <div className="z-10 flex shrink-0 flex-wrap items-center gap-3 border-b border-[#b4a087] bg-[#fbf7ed] px-4 py-2 text-xs">
      <strong className="mr-2 font-serif text-lg text-[#7C211E]">Timeline II</strong>
      <div className="flex overflow-hidden rounded-full border border-[#b4a087]">{['horizontal','vertical'].map(mode=><button key={mode} type="button" onClick={()=>{stopEntranceOnNavigation();setDirection(mode);}} className={`px-3 py-1.5 font-semibold capitalize ${direction===mode?'bg-[#253C32] text-white':'bg-[#fbf7ed]'}`}>{mode}</button>)}</div>
      <div className="flex items-center gap-2"><button type="button" aria-label="Zoom out" disabled={visibleDays >= maximumVisibleDays} onClick={()=>zoomBy(2)} className="rounded border border-[#b4a087] px-2 py-1 disabled:opacity-40">−</button><span className="min-w-[72px] text-center">{spanCaption(visibleDays)}</span><button type="button" aria-label="Zoom in" disabled={visibleDays <= MIN_DAYS} onClick={()=>zoomBy(0.5)} className="rounded border border-[#b4a087] px-2 py-1 disabled:opacity-40">+</button></div>
      <label className="flex items-center gap-1"><input type="checkbox" checked={showPoints} onChange={e=>{stopEntranceOnNavigation();setShowPoints(e.target.checked);}}/>Dates</label>
      <label className="flex items-center gap-1"><input type="checkbox" checked={showPeriods} onChange={e=>{stopEntranceOnNavigation();setShowPeriods(e.target.checked);}}/>Periods</label>
      {timelineConnections.length ? <label className="flex items-center gap-1"><input type="checkbox" checked={showRelationships} onChange={e=>{stopEntranceOnNavigation();setShowRelationships(e.target.checked);}}/>Relationships</label> : null}
      {/* Display preference changes visual annotations only. Category membership,
          Search scope, event positions and chronology remain unchanged. */}
      <label className="ml-auto flex items-center gap-2 whitespace-nowrap" htmlFor="peridot-timeline-category-display">
        <span className="font-semibold">Category display</span>
        <select id="peridot-timeline-category-display" aria-label="Category display mode"
          value={activeCategoryConfiguration.displayMode}
          onChange={event=>setCategoryConfiguration(current=>({...current,displayMode:event.target.value}))}
          className="max-w-[175px] rounded border border-[#b4a087] bg-[#fbf7ed] px-2 py-1 text-xs text-[#302b24] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#7C211E]">
          <option value="colors">Colors only</option>
          <option value="colors-and-symbols">Colors and symbols</option>
          <option value="expanded">Expanded labels</option>
        </select>
      </label>
      <span className="text-[#6b5d4c]">{inWindow.length} in view · {all.length} total</span>
    </div>
    <div ref={viewportRef} role="region" aria-label={`Timeline II ${direction} chronological field; scroll through time`} tabIndex={0} onKeyDown={e=>{
      if(['ArrowLeft','ArrowUp','ArrowRight','ArrowDown'].includes(e.key)){e.preventDefault();panBy((e.key==='ArrowLeft'||e.key==='ArrowUp'?-1:1)*visibleDays*0.12);}
      if(e.key==='Home'){e.preventDefault();stopEntranceOnNavigation();setCenter(min+visibleDays/2);}
      if(e.key==='End'){e.preventDefault();stopEntranceOnNavigation();setCenter(max-visibleDays/2);}
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
      {/* Chronological reading guides share the exact calendar ticks and
          date-to-pixel mapping of the approved ruler. They are deliberately
          presentation-only: never intercept pointer navigation or mark selection.
          Keep them underneath duration bands, event nodes, and future links. */}
      <div className="pointer-events-none absolute inset-0 z-[1] overflow-hidden" aria-hidden="true">
        {ticks.map(tick => {
          const coordinate = pos(tick.day);
          const guideStyle = tick.level >= 3
            ? '1px solid rgba(112, 91, 67, 0.36)'
            : tick.level === 2
              ? '1px solid rgba(112, 91, 67, 0.25)'
              : '1px solid rgba(112, 91, 67, 0.12)';
          return <React.Fragment key={`chronology-guide-${tick.day}`}>
            <div className="absolute pointer-events-none"
              style={horizontal
                ? {left:coordinate,top:0,bottom:CHRONOLOGY_RULER_HEIGHT,borderLeft:guideStyle}
                : {top:coordinate,left:CHRONOLOGY_RULER_WIDTH,right:0,borderTop:guideStyle}
              }
            />
            {/* The dock below/alongside is a full-domain navigator, not an
                axis for the zoomed event field. These local labels are. */}
            {tick.label ? <div className="absolute whitespace-nowrap rounded-sm bg-[#eee0c7]/90 px-1 text-[10px] font-medium text-[#725b43]"
              style={horizontal
                ? {left:coordinate+3,bottom:CHRONOLOGY_RULER_HEIGHT+2}
                : {left:CHRONOLOGY_RULER_WIDTH+4,top:coordinate+2}}
            >{tick.label}</div> : null}
          </React.Fragment>;
        })}
      </div>
      {showRelationships && timelineConnections.length ? <TimelineIIRelationshipLayer
        items={playbackItems}
        connections={timelineConnections}
        horizontal={horizontal}
        activeEventId={activeConnectionEventId}
        size={size}
        lanePosition={lanePosition}
      /> : null}
      {/* An individual mark's date projection is separate from the subdued
          background grid and is based on the same pos() as the mark itself.
          The date badge uses source precision, not the plotting anchor's day. */}
      {guideItem && (!playbackStarted || (playbackMode === 'cumulative'
        ? guideItem.playbackStart <= playbackDate
        : guideItem.playbackStart <= playbackDate && guideItem.playbackEnd >= playbackDate)) ? (
        <div className="pointer-events-none absolute inset-0 z-[4] overflow-hidden" aria-hidden="true">
          {[
            {day:guideItem.day,label:dateLabel(guideItem.period ? guideItem.start : (guideItem.start ?? guideItem.end)),end:false},
            ...(guideItem.period && guideItem.endDay !== guideItem.day
              ? [{day:guideItem.endDay,label:dateLabel(guideItem.end),end:true}] : []),
          ].filter(guide => pos(guide.day) >= axisStart && pos(guide.day) <= axisStart + length).map(guide => {
            const coordinate=pos(guide.day);
            const guideBorder=guide.end ? '1px dashed rgba(124,33,30,0.7)' : '1px solid rgba(124,33,30,0.85)';
            return <React.Fragment key={`event-date-guide-${guide.end?'end':'start'}`}>
              <div className="absolute" style={horizontal
                ? {left:coordinate,top:0,bottom:CHRONOLOGY_RULER_HEIGHT,borderLeft:guideBorder}
                : {top:coordinate,left:CHRONOLOGY_RULER_WIDTH,right:0,borderTop:guideBorder}} />
              <div className="absolute max-w-[145px] whitespace-nowrap rounded border border-[#a67a62] bg-[#fbf7ed] px-1.5 py-0.5 text-[11px] font-semibold text-[#7C211E] shadow-sm"
                style={horizontal
                  ? {left:Math.max(4,Math.min(size.width-150,coordinate+6)),bottom:CHRONOLOGY_RULER_HEIGHT+5}
                  : {left:CHRONOLOGY_RULER_WIDTH+8,top:Math.max(30,Math.min(size.height-26,coordinate+5))}}>
                {guide.label}
              </div>
            </React.Fragment>;
          })}
        </div>
      ) : null}

      {playbackItems.map(item=>{
        const markCategories=timelineMarkCategories(item.event.id,categoriesById,eventCategoriesById);
        const markColors=timelineMarkColors(markCategories);
        const primaryColor=markColors[0] || TIMELINE_UNCATEGORIZED_COLOR;
        const categoryDetails=timelineCategoryDescription(markCategories);
        const entranceEligible = revealPhase !== 'complete' && revealInitialIdsRef.current?.has(String(item.event.id));
        const revealStyle = entranceEligible
          ? revealPhase === 'before'
            ? {opacity:0}
            : {animation:`peridot-timelineii-raindrop ${TIMELINE_II_REVEAL_DURATION_MS}ms cubic-bezier(0.22, 0.68, 0.2, 1) both`,animationDelay:`${timelineIIRevealWave(item.event.id) * TIMELINE_II_REVEAL_STEP_MS}ms`}
          : {};

        const active=item.event.id === (selectedEventId || localSelected);
        const hoveredMark=item.event.id === hoveredId;
        const secondaryPos=lanePosition(item.lane);
        const bandStart=Math.max(axisStart,item.plotStart);
        const bandEnd=Math.min(axisStart+length,item.plotFinish);
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
          <button key={`${direction}:${item.event.id}`} type="button" {...interactiveProps}
            aria-label={`Period: ${fullLabel}. ${categoryDetails}`}
            className={`group absolute z-[2] rounded-full border-0 text-left shadow-sm hover:brightness-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#7C211E] ${entranceEligible ? 'peridot-timelineii-reveal' : ''}`}
            style={horizontal
              ? {left:bandStart,top:secondaryPos-BAND_THICKNESS/2,width:bandLength,height:BAND_THICKNESS,transition:"top 360ms ease-in-out, transform 150ms ease",...revealStyle}
              : {top:bandStart,left:secondaryPos-BAND_THICKNESS/2,height:bandLength,width:BAND_THICKNESS,transition:"left 360ms ease-in-out, transform 150ms ease",...revealStyle}
            }
          >
            <span className="pointer-events-none absolute inset-0 rounded-full" style={{background:timelinePeriodFill(markCategories),border:`2px ${item.uncertain?'dashed':'solid'} ${primaryColor}`,borderRadius:999,boxShadow:(active||hoveredMark)?`0 0 0 3px ${primaryColor}`:undefined}} />
            <span className="pointer-events-none absolute rounded-full border-2" style={horizontal
              ? {left:2,top:4,width:BAND_THICKNESS-12,height:BAND_THICKNESS-12,background:item.openStart?'#eee0c7':primaryColor,borderColor:primaryColor}
              : {left:4,top:2,width:BAND_THICKNESS-12,height:BAND_THICKNESS-12,background:item.openEnd?'#eee0c7':primaryColor,borderColor:primaryColor}
            } />
            <span className="pointer-events-none absolute rounded-full border-2" style={horizontal
              ? {right:2,top:4,width:BAND_THICKNESS-12,height:BAND_THICKNESS-12,background:item.openEnd?'#eee0c7':primaryColor,borderColor:primaryColor}
              : {left:4,bottom:2,width:BAND_THICKNESS-12,height:BAND_THICKNESS-12,background:item.openStart?'#eee0c7':primaryColor,borderColor:primaryColor}
            } />
            <TimelinePeriodSymbolBadge categories={markCategories} horizontal={horizontal} displayMode={activeCategoryConfiguration.displayMode}/>
            {activeCategoryConfiguration.displayMode==='expanded' && markCategories.length ? <span aria-hidden="true"
              className="pointer-events-none absolute z-[5] max-w-[180px] truncate rounded border border-[#b4a087] bg-[#fbf7ed]/95 px-1.5 py-0.5 text-[11px] font-semibold text-[#302b24] shadow-sm"
              style={horizontal?{left:0,bottom:BAND_THICKNESS+5}:{left:BAND_THICKNESS+5,top:0}}>
              {markCategories.slice(0,2).map(category=>category.label).join(' · ')}{markCategories.length>2?` +${markCategories.length-2}`:''}
            </span>:null}
            {markCategories.length>4?<span aria-hidden="true" className="pointer-events-none absolute z-[3] rounded border border-[#b4a087] bg-[#fbf7ed] px-1 text-[10px] font-bold text-[#302b24]" style={horizontal?{right:3,top:-18}:{left:BAND_THICKNESS+3,top:3}}>+{markCategories.length-4}</span>:null}
          </button>
        );
        return (
          <button key={`${direction}:${item.event.id}`} type="button" {...interactiveProps}
            aria-label={`Event: ${fullLabel}. ${categoryDetails}`}
            className={`absolute z-[3] flex items-center justify-center rounded-full border-2 font-bold shadow-sm hover:scale-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#7C211E] ${entranceEligible ? 'peridot-timelineii-reveal' : ''}`}
            style={{
              ...(horizontal
                ? {left:item.plotStart-NODE_DIAMETER/2,top:secondaryPos-NODE_DIAMETER/2}
                : {top:item.plotStart-NODE_DIAMETER/2,left:secondaryPos-NODE_DIAMETER/2}),
              width:NODE_DIAMETER,height:NODE_DIAMETER,
              transition:horizontal?"top 360ms ease-in-out, transform 150ms ease":"left 360ms ease-in-out, transform 150ms ease",
              background:primaryColor,
              color:'white',
              borderColor:categoryNodeOutline(primaryColor, markCategories.length>1),
              fontSize:19,
              ...revealStyle,
              outline:(active||hoveredMark)?'3px solid #7C211E':undefined,
            }}
          ><TimelineCategoryPoint categories={markCategories} uncertain={item.uncertain} displayMode={activeCategoryConfiguration.displayMode}/>
            {activeCategoryConfiguration.displayMode==='expanded' && markCategories.length ? <span aria-hidden="true"
              className="pointer-events-none absolute z-[5] max-w-[175px] truncate rounded border border-[#b4a087] bg-[#fbf7ed]/95 px-1.5 py-0.5 text-[11px] font-semibold text-[#302b24] shadow-sm"
              style={horizontal?{left:NODE_DIAMETER+4,top:'50%',transform:'translateY(-50%)'}:{left:'50%',top:NODE_DIAMETER+4,transform:'translateX(-50%)'}}>
              {markCategories.slice(0,2).map(category=>category.label).join(' · ')}{markCategories.length>2?` +${markCategories.length-2}`:''}
            </span>:null}</button>
        );
      })}
      {hovered && hoverPosition ? (
        <div role="status" aria-live="polite" className="pointer-events-none absolute z-[15] w-[260px] rounded-lg border border-[#b4a087] bg-[#fbf7ed]/95 px-3 py-2 text-[#302b24] shadow-md"
          style={{left:hoverPosition.x,top:hoverPosition.y}}>
          <div className="text-[10px] font-extrabold uppercase tracking-wider text-[#7C211E]">{hovered.event.temporalRole|| (hovered.period?'Period':'Event')}{hovered.uncertain?' · date precision qualified':''}</div>
          <div className="text-sm font-bold">{hovered.title}</div>
          <div className="text-xs">{dateLabel(hovered.start)}{hovered.period?` – ${dateLabel(hovered.end)}`:''}</div>
          <div className="mt-1 text-[10px] text-[#695e50]">{timelineCategoryDescription(timelineMarkCategories(hovered.event.id,categoriesById,eventCategoriesById))}</div>
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
    </div>
    {categoryEditorOpen ? <PeridotTimelineCategoryEditor
      availableFields={categoryFields}
      events={domainEvents}
      configuration={activeCategoryConfiguration}
      onChange={setCategoryConfiguration}
    /> : null}
  </div>;
}
