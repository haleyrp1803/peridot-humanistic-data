import React, { useMemo } from 'react';

function asArray(value) {
  return Array.isArray(value) ? value : [];
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

function buildTimelineGeometry(events) {
  const positioned = asArray(events)
    .map((event) => {
      const start = scalarFromSortKey(event?.windowStart ?? event?.playbackSortKey);
      const end = scalarFromSortKey(event?.windowEnd ?? event?.windowStart ?? event?.playbackSortKey);
      if (!Number.isFinite(start) || !Number.isFinite(end)) return null;
      return { event, start: Math.min(start, end), end: Math.max(start, end) };
    })
    .filter(Boolean)
    .sort((a, b) => a.start - b.start || a.end - b.end || String(a.event.id).localeCompare(String(b.event.id)));

  if (!positioned.length) {
    return { items: [], minYear: null, maxYear: null, width: 0, ticks: [] };
  }

  const minYear = Math.floor(Math.min(...positioned.map((item) => item.start)));
  const maxYear = Math.ceil(Math.max(...positioned.map((item) => item.end)));
  const span = Math.max(1, maxYear - minYear);
  const pixelsPerYear = span <= 10 ? 150 : span <= 30 ? 96 : span <= 100 ? 58 : 30;
  const leftPadding = 110;
  const rightPadding = 160;
  const width = Math.max(1200, leftPadding + span * pixelsPerYear + rightPadding);
  const laneCount = Math.min(8, Math.max(3, Math.ceil(Math.sqrt(positioned.length))));
  const laneHeight = 108;
  const axisY = 66;

  const xFor = (scalar) => leftPadding + (scalar - minYear) * pixelsPerYear;
  const items = positioned.map((item, index) => ({
    ...item,
    x: xFor(item.start),
    endX: xFor(item.end),
    lane: index % laneCount,
    top: axisY + 42 + (index % laneCount) * laneHeight,
  }));

  const targetTickCount = Math.max(4, Math.min(14, Math.floor(width / 150)));
  const roughStep = Math.max(1, Math.ceil(span / targetTickCount));
  const candidates = [1, 2, 5, 10, 20, 25, 50, 100, 200, 500];
  const tickStep = candidates.find((candidate) => candidate >= roughStep) || roughStep;
  const firstTick = Math.ceil(minYear / tickStep) * tickStep;
  const ticks = [];
  for (let year = firstTick; year <= maxYear; year += tickStep) {
    ticks.push({ year, x: xFor(year) });
  }

  return {
    items,
    minYear,
    maxYear,
    width,
    height: axisY + 80 + laneCount * laneHeight,
    axisY,
    ticks,
  };
}

export function PeridotTimelineWorkspace({ events = [], onEventClick }) {
  const geometry = useMemo(() => buildTimelineGeometry(events), [events]);

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
    <div className="peridot-map-plate relative flex min-h-0 flex-1 overflow-hidden rounded-[28px] border border-[var(--peridot-color-hex-c4e0ef-a50)] bg-[var(--map-water)] shadow-[0_20px_54px_var(--peridot-color-rgba-rgba-0-0-0-0-34)]" data-peridot-tutorial-anchor="visualization-stage">
      <div className="min-h-0 flex-1 overflow-x-auto overflow-y-auto">
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
                <button
                  type="button"
                  onClick={() => onEventClick?.(event)}
                  className="group relative z-10 w-[210px] -translate-x-3 rounded-xl border border-[var(--peridot-color-hex-dfe9c8-a35)] bg-[color-mix(in_srgb,var(--peridot-role-interface-panel-background-strong)_90%,transparent)] px-3 py-2 text-left text-[var(--peridot-color-hex-f5ecd2)] shadow-[0_8px_20px_var(--peridot-color-rgba-rgba-0-0-0-0-28)] backdrop-blur-[1px] transition hover:-translate-y-0.5 hover:border-[var(--peridot-role-ornament-line)] focus:outline-none focus:ring-2 focus:ring-[var(--peridot-role-interface-focus-ring)]"
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
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
