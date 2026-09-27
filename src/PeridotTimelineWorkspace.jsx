import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function sortKeyParts(value) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return null;
  const sign = numeric < 0 ? -1 : 1;
  const absolute = Math.abs(Math.trunc(numeric));
  const year = Math.trunc(absolute / 10000) * sign;
  const month = Math.trunc((absolute % 10000) / 100);
  const day = absolute % 100;
  return { year, month, day };
}

function scalarFromSortKey(value) {
  const parts = sortKeyParts(value);
  if (!parts) return null;
  const month = parts.month >= 1 && parts.month <= 12 ? parts.month : 1;
  const day = parts.day >= 1 && parts.day <= 31 ? parts.day : 1;
  return parts.year + (month - 1) / 12 + (day - 1) / 366;
}

function eventTitle(event) {
  const subjectLabel = String(event?.subject?.label || '').trim();
  if (subjectLabel && subjectLabel !== 'Record') return subjectLabel;
  const participants = asArray(event?.row?.generalizedObservation?.participants)
    .map((participant) => String(participant?.value || participant?.label || '').trim())
    .filter(Boolean);
  if (participants.length) return participants.slice(0, 2).join(' ↔ ');
  return String(event?.recordId || event?.rowId || 'Timeline event');
}

function positionedTimelineEvents(events) {
  return asArray(events)
    .map((event) => {
      const start = scalarFromSortKey(event?.windowStart ?? event?.playbackSortKey);
      const end = scalarFromSortKey(event?.windowEnd ?? event?.windowStart ?? event?.playbackSortKey);
      if (!Number.isFinite(start) || !Number.isFinite(end)) return null;
      return { event, start: Math.min(start, end), end: Math.max(start, end) };
    })
    .filter(Boolean)
    .sort((a, b) => a.start - b.start || a.end - b.end || String(a.event.id).localeCompare(String(b.event.id)));
}

function tickYears(minYear, maxYear, extentPixels) {
  const span = Math.max(1, maxYear - minYear);
  const targetTickCount = Math.max(4, Math.min(14, Math.floor(extentPixels / 150)));
  const roughStep = Math.max(1, Math.ceil(span / targetTickCount));
  const candidates = [1, 2, 5, 10, 20, 25, 50, 100, 200, 500];
  const tickStep = candidates.find((candidate) => candidate >= roughStep) || roughStep;
  const firstTick = Math.ceil(minYear / tickStep) * tickStep;
  const years = [];
  for (let year = firstTick; year <= maxYear; year += tickStep) years.push(year);
  return years;
}

function buildHorizontalGeometry(positioned, viewportWidth = 0) {
  if (!positioned.length) {
    return { items: [], minYear: null, maxYear: null, width: 0, height: 0, ticks: [] };
  }

  const minYear = Math.floor(Math.min(...positioned.map((item) => item.start)));
  const maxYear = Math.ceil(Math.max(...positioned.map((item) => item.end)));
  const span = Math.max(1, maxYear - minYear);
  const pixelsPerYear = span <= 10 ? 150 : span <= 30 ? 96 : span <= 100 ? 58 : 30;
  const leadingPadding = 110;
  // Keep enough chronological-end space that the latest event can be scrolled
  // to the near edge of the viewport with no later material beside it.
  const trailingPadding = Math.max(160, Math.max(0, viewportWidth) - 96);
  const temporalExtent = span * pixelsPerYear;
  const width = Math.max(1200, leadingPadding + temporalExtent + trailingPadding);
  const laneCount = Math.min(8, Math.max(3, Math.ceil(Math.sqrt(positioned.length))));
  const laneHeight = 108;
  const axisY = 66;

  const xFor = (scalar) => leadingPadding + (scalar - minYear) * pixelsPerYear;
  const items = positioned.map((item, index) => ({
    ...item,
    x: xFor(item.start),
    endX: xFor(item.end),
    lane: index % laneCount,
    top: axisY + 42 + (index % laneCount) * laneHeight,
  }));

  const ticks = tickYears(minYear, maxYear, width).map((year) => ({ year, x: xFor(year) }));

  return {
    items,
    minYear,
    maxYear,
    width,
    height: axisY + 80 + laneCount * laneHeight,
    axisY,
    ticks,
    leadingPadding,
    trailingPadding,
    temporalExtent,
  };
}

function buildVerticalGeometry(positioned, viewportHeight = 0) {
  if (!positioned.length) {
    return { items: [], minYear: null, maxYear: null, width: 0, height: 0, ticks: [] };
  }

  const minYear = Math.floor(Math.min(...positioned.map((item) => item.start)));
  const maxYear = Math.ceil(Math.max(...positioned.map((item) => item.end)));
  const span = Math.max(1, maxYear - minYear);
  const pixelsPerYear = span <= 10 ? 130 : span <= 30 ? 86 : span <= 100 ? 52 : 28;
  // In vertical mode chronology ends at the top. Reserve roughly one visible
  // viewport above the latest event so it can be brought into an isolated
  // end position, mirroring horizontal end-of-timeline scrolling.
  const leadingPadding = Math.max(110, Math.max(0, viewportHeight) - 112);
  const trailingPadding = 150;
  const temporalExtent = span * pixelsPerYear;
  const height = Math.max(1000, leadingPadding + temporalExtent + trailingPadding);
  const laneCount = Math.min(6, Math.max(3, Math.ceil(Math.sqrt(positioned.length))));
  const laneWidth = 230;
  const axisX = 92;
  const width = Math.max(1200, axisX + 92 + laneCount * laneWidth + 90);

  // Vertical chronology runs latest at the top and earliest at the bottom.
  const yFor = (scalar) => leadingPadding + (maxYear - scalar) * pixelsPerYear;
  const items = positioned.map((item, index) => ({
    ...item,
    y: yFor(item.start),
    endY: yFor(item.end),
    lane: index % laneCount,
    left: axisX + 72 + (index % laneCount) * laneWidth,
  }));

  const ticks = tickYears(minYear, maxYear, height).map((year) => ({ year, y: yFor(year) }));

  return {
    items,
    minYear,
    maxYear,
    width,
    height,
    axisX,
    ticks,
    leadingPadding,
    trailingPadding,
    temporalExtent,
  };
}

function chronologyFractionForViewport(scroller, orientation, geometry) {
  if (!scroller || !geometry?.temporalExtent) return 0;

  if (orientation === 'vertical') {
    const centerY = scroller.scrollTop + scroller.clientHeight / 2;
    const positionFromLatest = (centerY - geometry.leadingPadding) / geometry.temporalExtent;
    return clamp(1 - positionFromLatest, 0, 1);
  }

  const centerX = scroller.scrollLeft + scroller.clientWidth / 2;
  return clamp((centerX - geometry.leadingPadding) / geometry.temporalExtent, 0, 1);
}

function restoreChronologyFraction(scroller, orientation, geometry, fraction) {
  if (!scroller || !geometry?.temporalExtent) return;
  const chronologicalFraction = clamp(Number(fraction) || 0, 0, 1);

  if (orientation === 'vertical') {
    const centerY = geometry.leadingPadding + (1 - chronologicalFraction) * geometry.temporalExtent;
    scroller.scrollTop = Math.max(0, centerY - scroller.clientHeight / 2);
    return;
  }

  const centerX = geometry.leadingPadding + chronologicalFraction * geometry.temporalExtent;
  scroller.scrollLeft = Math.max(0, centerX - scroller.clientWidth / 2);
}

function OrientationControl({ orientation, onChange }) {
  return (
    <div className="flex rounded-full border border-[var(--peridot-color-hex-dfe9c8-a35)] bg-[color-mix(in_srgb,var(--peridot-role-interface-panel-background-strong)_94%,transparent)] p-1 shadow-[0_8px_20px_var(--peridot-color-rgba-rgba-0-0-0-0-28)]" aria-label="Timeline orientation">
      {['horizontal', 'vertical'].map((value) => {
        const active = orientation === value;
        return (
          <button
            key={value}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(value)}
            className={`rounded-full px-4 py-2 text-[10px] font-extrabold uppercase tracking-[0.13em] transition focus:outline-none focus:ring-2 focus:ring-[var(--peridot-role-interface-focus-ring)] ${active
              ? 'bg-[var(--peridot-role-ornament-line)] text-[var(--peridot-role-interface-panel-background-strong)] shadow-[0_3px_10px_var(--peridot-color-rgba-rgba-0-0-0-0-22)]'
              : 'text-[var(--peridot-color-hex-f5ecd2)] hover:bg-[var(--peridot-color-hex-dfe9c8-a10)]'
            }`}
          >
            {value}
          </button>
        );
      })}
    </div>
  );
}

function EventCard({ event, onEventClick, className = '', style }) {
  return (
    <button
      type="button"
      onClick={() => onEventClick?.(event)}
      className={`group relative z-10 w-[210px] rounded-xl border border-[var(--peridot-color-hex-dfe9c8-a35)] bg-[color-mix(in_srgb,var(--peridot-role-interface-panel-background-strong)_90%,transparent)] px-3 py-2 text-left text-[var(--peridot-color-hex-f5ecd2)] shadow-[0_8px_20px_var(--peridot-color-rgba-rgba-0-0-0-0-28)] backdrop-blur-[1px] transition hover:-translate-y-0.5 hover:border-[var(--peridot-role-ornament-line)] focus:outline-none focus:ring-2 focus:ring-[var(--peridot-role-interface-focus-ring)] ${className}`}
      style={style}
    >
      <span aria-hidden="true" className="absolute -left-[7px] top-[13px] h-3 w-3 rounded-full border-2 border-[var(--peridot-color-hex-f5ecd2)] bg-[var(--peridot-color-hex-b58b42)] shadow-[0_0_0_3px_var(--peridot-color-rgba-rgba-8-39-25-0-85)]" />
      <span className="block truncate text-[10px] font-extrabold uppercase tracking-[0.13em] text-[var(--peridot-color-hex-dfe9c8)]">
        {event.temporalRole || 'Time'}
      </span>
      <span className="mt-0.5 block truncate text-sm font-bold">{eventTitle(event)}</span>
      <span className="mt-1 block truncate text-[11px] text-[var(--peridot-color-hex-dfe9c8)]">
        {event.displayLabel || event.sourceText || 'Date available'}
      </span>
    </button>
  );
}

function HorizontalTimeline({ geometry, onEventClick }) {
  return (
    <div
      className="relative min-h-full bg-[radial-gradient(circle_at_50%_0%,var(--peridot-color-hex-dfe9c8-a10),transparent_42%),linear-gradient(180deg,var(--peridot-color-rgba-rgba-8-39-25-0-18),transparent_38%)]"
      style={{ width: geometry.width, minHeight: geometry.height }}
    >
      <div
        className="absolute h-px bg-[var(--peridot-role-ornament-line)] shadow-[0_0_10px_var(--peridot-color-hex-d6a36a-a35)]"
        style={{ left: 68, right: 68, top: geometry.axisY }}
      />

      {geometry.ticks.map((tick) => (
        <div key={tick.year} className="absolute top-0" style={{ left: tick.x }}>
          <div className="absolute top-[54px] h-6 w-px bg-[var(--peridot-role-ornament-line)]" />
          <div className="absolute top-[25px] -translate-x-1/2 whitespace-nowrap text-[11px] font-bold tracking-[0.08em] text-[var(--peridot-color-hex-f5ecd2)]">
            {tick.year}
          </div>
          <div
            className="absolute top-[78px] w-px bg-[var(--peridot-color-hex-dfe9c8-a12)]"
            style={{ height: Math.max(0, geometry.height - 102) }}
          />
        </div>
      ))}

      {geometry.items.map(({ event, x, endX, top }) => {
        const isInterval = event.temporalKind === 'interval' || event.temporalKind === 'openInterval';
        const intervalWidth = Math.max(18, endX - x);
        return (
          <div key={event.id} className="absolute" style={{ left: x, top }}>
            {isInterval ? (
              <div
                aria-hidden="true"
                className="absolute left-0 top-[18px] h-[3px] rounded-full bg-[var(--peridot-role-ornament-line)] opacity-80"
                style={{ width: intervalWidth }}
              />
            ) : null}
            <EventCard event={event} onEventClick={onEventClick} className="-translate-x-3" />
          </div>
        );
      })}
    </div>
  );
}

function VerticalTimeline({ geometry, onEventClick }) {
  return (
    <div
      className="relative min-h-full bg-[radial-gradient(circle_at_50%_0%,var(--peridot-color-hex-dfe9c8-a10),transparent_42%),linear-gradient(180deg,var(--peridot-color-rgba-rgba-8-39-25-0-18),transparent_38%)]"
      style={{ width: geometry.width, minHeight: geometry.height }}
    >
      <div
        className="absolute w-px bg-[var(--peridot-role-ornament-line)] shadow-[0_0_10px_var(--peridot-color-hex-d6a36a-a35)]"
        style={{ left: geometry.axisX, top: 68, bottom: 68 }}
      />

      {geometry.ticks.map((tick) => (
        <div key={tick.year} className="absolute left-0" style={{ top: tick.y }}>
          <div
            className="absolute left-[68px] h-px bg-[var(--peridot-color-hex-dfe9c8-a12)]"
            style={{ width: Math.max(0, geometry.width - 96) }}
          />
          <div className="absolute left-[80px] -top-3 h-6 w-6 border-l border-[var(--peridot-role-ornament-line)]" />
          <div className="absolute left-[22px] -top-2 whitespace-nowrap text-[11px] font-bold tracking-[0.08em] text-[var(--peridot-color-hex-f5ecd2)]">
            {tick.year}
          </div>
        </div>
      ))}

      {geometry.items.map(({ event, y, endY, left }) => {
        const isInterval = event.temporalKind === 'interval' || event.temporalKind === 'openInterval';
        const intervalTop = Math.min(y, endY);
        const intervalHeight = Math.max(18, Math.abs(y - endY));
        return (
          <div key={event.id} className="absolute" style={{ left, top: y - 16 }}>
            {isInterval ? (
              <div
                aria-hidden="true"
                className="absolute left-0 w-[3px] rounded-full bg-[var(--peridot-role-ornament-line)] opacity-80"
                style={{ top: intervalTop - y + 16, height: intervalHeight }}
              />
            ) : null}
            <EventCard event={event} onEventClick={onEventClick} />
          </div>
        );
      })}

      <div className="absolute left-[20px] top-[72px] text-[10px] font-extrabold uppercase tracking-[0.13em] text-[var(--peridot-color-hex-dfe9c8)]">
        Latest
      </div>
      <div className="absolute bottom-[72px] left-[20px] text-[10px] font-extrabold uppercase tracking-[0.13em] text-[var(--peridot-color-hex-dfe9c8)]">
        Earliest
      </div>
    </div>
  );
}

export function PeridotTimelineWorkspace({ events = [], onEventClick }) {
  const [orientation, setOrientation] = useState('horizontal');
  const [viewportSize, setViewportSize] = useState({ width: 0, height: 0 });
  const scrollerRef = useRef(null);
  const pendingChronologyFractionRef = useRef(null);
  const positioned = useMemo(() => positionedTimelineEvents(events), [events]);
  const horizontalGeometry = useMemo(
    () => buildHorizontalGeometry(positioned, viewportSize.width),
    [positioned, viewportSize.width],
  );
  const verticalGeometry = useMemo(
    () => buildVerticalGeometry(positioned, viewportSize.height),
    [positioned, viewportSize.height],
  );
  const geometry = orientation === 'vertical' ? verticalGeometry : horizontalGeometry;

  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return undefined;

    const measure = () => {
      const next = { width: scroller.clientWidth, height: scroller.clientHeight };
      setViewportSize((current) => (
        current.width === next.width && current.height === next.height ? current : next
      ));
    };

    measure();
    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', measure);
      return () => window.removeEventListener('resize', measure);
    }

    const observer = new ResizeObserver(measure);
    observer.observe(scroller);
    return () => observer.disconnect();
  }, []);

  const handleOrientationChange = (nextOrientation) => {
    if (nextOrientation === orientation) return;
    pendingChronologyFractionRef.current = chronologyFractionForViewport(
      scrollerRef.current,
      orientation,
      geometry,
    );
    setOrientation(nextOrientation);
  };

  useLayoutEffect(() => {
    if (pendingChronologyFractionRef.current === null) return;
    restoreChronologyFraction(
      scrollerRef.current,
      orientation,
      geometry,
      pendingChronologyFractionRef.current,
    );
    pendingChronologyFractionRef.current = null;
  }, [orientation, geometry]);

  if (!geometry.items.length) {
    return (
      <div className="peridot-illuminated-panel flex min-h-0 flex-1 items-center justify-center rounded-[28px] border border-[var(--peridot-color-hex-c4e0ef-a50)] bg-[var(--peridot-color-rgba-rgba-8-39-25-0-9)] p-8 text-center shadow-[0_20px_54px_var(--peridot-color-rgba-rgba-0-0-0-0-34)] backdrop-blur-sm">
        <div className="max-w-xl rounded-2xl border border-[var(--peridot-color-hex-dfe9c8-a25)] bg-[var(--peridot-color-hex-dfe9c8-a08)] px-6 py-5">
          <h2 className="[font-family:Georgia,'Palatino_Linotype','Book_Antiqua',Palatino,serif] text-2xl font-bold text-[var(--peridot-color-hex-f5ecd2)]">No timeline events in the current scope</h2>
          <p className="mt-2 text-sm leading-relaxed text-[var(--peridot-color-hex-dfe9c8)]">
            Timeline displays mapped temporal assertions that survive the current Search and Timeline scope.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="peridot-map-plate relative flex min-h-0 min-w-0 w-full max-w-full flex-1 overflow-hidden rounded-[28px] border border-[var(--peridot-color-hex-c4e0ef-a50)] bg-[var(--map-water)] shadow-[0_20px_54px_var(--peridot-color-rgba-rgba-0-0-0-0-34)]"
      data-peridot-tutorial-anchor="visualization-stage"
    >
      <div
        ref={scrollerRef}
        className="absolute inset-0 min-h-0 min-w-0 overflow-auto"
      >
        {orientation === 'vertical' ? (
          <VerticalTimeline geometry={verticalGeometry} onEventClick={onEventClick} />
        ) : (
          <HorizontalTimeline geometry={horizontalGeometry} onEventClick={onEventClick} />
        )}
      </div>

      <div className="pointer-events-none absolute left-3 top-3 z-20 flex items-center gap-3">
        <div className="pointer-events-auto flex items-center gap-3 rounded-full border border-[var(--peridot-color-hex-dfe9c8-a25)] bg-[color-mix(in_srgb,var(--peridot-role-interface-panel-background-strong)_92%,transparent)] px-3 py-1.5 shadow-[0_8px_20px_var(--peridot-color-rgba-rgba-0-0-0-0-24)] backdrop-blur-sm">
          <div className="shrink-0 text-[10px] font-extrabold uppercase tracking-[0.13em] text-[var(--peridot-color-hex-dfe9c8)]">
            Timeline view
          </div>
          <OrientationControl orientation={orientation} onChange={handleOrientationChange} />
        </div>
      </div>
    </div>
  );
}
