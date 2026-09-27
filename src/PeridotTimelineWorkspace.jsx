import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import {
  buildPeridotTimelineCategoryFields,
  filterPeridotTimelineEventsByCategories,
} from './peridotTimelineWorkspaceModel.js';

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

function temporalPresentation(event) {
  const shape = String(event?.temporalShape || '').trim();
  const qualifier = String(event?.qualifier || '').trim();
  const precision = String(event?.precision || '').trim();
  const boundedness = String(event?.boundedness || '').trim();

  if (shape === 'openInterval' || event?.temporalKind === 'openInterval') {
    if (boundedness === 'openStart') return { tone: 'open', label: 'Open start' };
    if (boundedness === 'ongoing') return { tone: 'open', label: 'Ongoing' };
    if (boundedness === 'openEnd') return { tone: 'open', label: 'Open end' };
    return { tone: 'open', label: 'Open interval' };
  }
  if (shape === 'approximatePoint' || shape === 'approximateInterval' || qualifier === 'circa') {
    return { tone: 'approximate', label: 'Approximate' };
  }
  if (shape === 'partialPoint' || shape === 'partialInterval' || precision === 'partial') {
    return { tone: 'partial', label: 'Partial date' };
  }
  if (qualifier === 'uncertain') {
    return { tone: 'approximate', label: 'Uncertain' };
  }
  if (shape === 'inconsistent' || event?.consistency === 'backwards') {
    return { tone: 'inconsistent', label: 'Inconsistent range' };
  }
  return { tone: 'exact', label: '' };
}

function visibleCategoryMemberships(event, activeCategoryFields, hiddenCategoryKeys) {
  return asArray(event?.categoryMemberships).filter((membership) => (
    activeCategoryFields.includes(membership.fieldKey)
    && !hiddenCategoryKeys.includes(categoryIdentity(membership.fieldKey, membership.value))
  ));
}

function anchorMarkerClassName(event) {
  const tone = temporalPresentation(event).tone;
  if (tone === 'approximate') {
    return 'border-[var(--peridot-color-hex-f5ecd2)] bg-transparent shadow-[0_0_0_3px_var(--peridot-role-ornament-line),0_0_0_6px_var(--peridot-color-rgba-rgba-8-39-25-0-85)]';
  }
  if (tone === 'partial') {
    return 'rounded-[3px] border-[var(--peridot-color-hex-f5ecd2)] bg-[var(--peridot-color-hex-b58b42)] shadow-[0_0_0_3px_var(--peridot-color-rgba-rgba-8-39-25-0-85)]';
  }
  if (tone === 'open') {
    return 'border-[var(--peridot-color-hex-f5ecd2)] bg-[var(--peridot-role-interface-panel-background-strong)] shadow-[inset_0_0_0_2px_var(--peridot-color-hex-b58b42),0_0_0_3px_var(--peridot-color-rgba-rgba-8-39-25-0-85)]';
  }
  return 'border-[var(--peridot-color-hex-f5ecd2)] bg-[var(--peridot-color-hex-b58b42)] shadow-[0_0_0_3px_var(--peridot-color-rgba-rgba-8-39-25-0-85)]';
}

function categoryIdentity(fieldKey, value) {
  return `${String(fieldKey ?? '').trim()}\u0000${String(value ?? '').trim()}`;
}

function hashText(value) {
  const text = String(value ?? '');
  let hash = 2166136261;
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function categoryColor(fieldKey, value) {
  const hue = hashText(categoryIdentity(fieldKey, value)) % 360;
  return `hsl(${hue} 62% 62%)`;
}

function categoryShape(fieldKey, value) {
  const shapes = ['circle', 'square', 'diamond', 'triangle'];
  return shapes[hashText(categoryIdentity(fieldKey, value)) % shapes.length];
}

function CategoryMarker({ membership, mode }) {
  const color = categoryColor(membership.fieldKey, membership.value);
  const shape = categoryShape(membership.fieldKey, membership.value);
  const label = `${membership.fieldLabel || membership.fieldKey}: ${membership.value}`;
  const commonStyle = mode === 'color'
    ? { backgroundColor: color, borderColor: 'rgba(245,236,210,0.88)' }
    : { backgroundColor: 'var(--peridot-color-hex-f5ecd2)', borderColor: 'var(--peridot-role-interface-panel-background-strong)' };

  let shapeStyle = {};
  if (mode === 'shape') {
    if (shape === 'square') shapeStyle = { borderRadius: '2px' };
    if (shape === 'diamond') shapeStyle = { borderRadius: '2px', transform: 'rotate(45deg)' };
    if (shape === 'triangle') {
      shapeStyle = {
        width: 0,
        height: 0,
        borderLeft: '5px solid transparent',
        borderRight: '5px solid transparent',
        borderBottom: '9px solid var(--peridot-color-hex-f5ecd2)',
        backgroundColor: 'transparent',
        borderTop: 0,
      };
    }
  }

  return (
    <span
      aria-label={label}
      title={label}
      className="inline-block h-2.5 w-2.5 shrink-0 rounded-full border"
      style={{ ...commonStyle, ...shapeStyle }}
    />
  );
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

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function daysInMonth(year, month) {
  if (month === 2) {
    const leap = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
    return leap ? 29 : 28;
  }
  return [4, 6, 9, 11].includes(month) ? 30 : 31;
}

function scalarFromCalendarDate(year, month = 1, day = 1) {
  return year + (month - 1) / 12 + (day - 1) / 366;
}

function buildTemporalTicks(minYear, maxYear, pixelsPerYear) {
  const ticks = [];
  const pxPerMonth = pixelsPerYear / 12;
  const pxPerDay = pixelsPerYear / 366;
  const targetSpacing = 92;

  // At very close scales, label exact calendar days. The day step remains
  // adaptive so labels stay readable rather than turning into a wall of text.
  if (pxPerDay * 15 >= targetSpacing) {
    const dayCandidates = [1, 2, 5, 7, 10, 15];
    const dayStep = dayCandidates.find((candidate) => candidate * pxPerDay >= targetSpacing) || 15;
    for (let year = minYear; year <= maxYear; year += 1) {
      for (let month = 1; month <= 12; month += 1) {
        const monthDays = daysInMonth(year, month);
        for (let day = 1; day <= monthDays; day += dayStep) {
          const scalar = scalarFromCalendarDate(year, month, day);
          if (scalar < minYear || scalar > maxYear) continue;
          ticks.push({
            key: `day:${year}:${month}:${day}`,
            scalar,
            label: `${day} ${MONTH_LABELS[month - 1]} ${year}`,
            granularity: 'day',
            major: day === 1,
          });
        }
      }
    }
    return ticks;
  }

  // Once there is enough room to distinguish months, show month/year labels.
  if (pxPerMonth * 6 >= targetSpacing) {
    const monthCandidates = [1, 2, 3, 6];
    const monthStep = monthCandidates.find((candidate) => candidate * pxPerMonth >= targetSpacing) || 6;
    for (let year = minYear; year <= maxYear; year += 1) {
      for (let month = 1; month <= 12; month += monthStep) {
        const scalar = scalarFromCalendarDate(year, month, 1);
        if (scalar < minYear || scalar > maxYear) continue;
        ticks.push({
          key: `month:${year}:${month}`,
          scalar,
          label: `${MONTH_LABELS[month - 1]} ${year}`,
          granularity: 'month',
          major: month === 1,
        });
      }
    }
    return ticks;
  }

  // Broad views stay year-based, choosing a readable interval from the actual
  // number of pixels available per year rather than from an arbitrary zoom id.
  const yearCandidates = [1, 2, 5, 10, 20, 25, 50, 100, 200, 500];
  const roughYearStep = Math.max(1, Math.ceil(targetSpacing / Math.max(1, pixelsPerYear)));
  const yearStep = yearCandidates.find((candidate) => candidate >= roughYearStep) || roughYearStep;
  const firstYear = Math.ceil(minYear / yearStep) * yearStep;
  for (let year = firstYear; year <= maxYear; year += yearStep) {
    ticks.push({
      key: `year:${year}`,
      scalar: year,
      label: String(year),
      granularity: 'year',
      major: true,
    });
  }
  return ticks;
}

function buildHorizontalGeometry(positioned, viewportWidth = 0, zoom = 1) {
  if (!positioned.length) {
    return { items: [], minYear: null, maxYear: null, width: 0, height: 0, ticks: [] };
  }

  const minYear = Math.floor(Math.min(...positioned.map((item) => item.start)));
  const maxYear = Math.ceil(Math.max(...positioned.map((item) => item.end)));
  const span = Math.max(1, maxYear - minYear);
  const basePixelsPerYear = span <= 10 ? 150 : span <= 30 ? 96 : span <= 100 ? 58 : 30;
  const pixelsPerYear = basePixelsPerYear * zoom;
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

  const ticks = buildTemporalTicks(minYear, maxYear, pixelsPerYear).map((tick) => ({ ...tick, x: xFor(tick.scalar) }));

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

function buildVerticalGeometry(positioned, viewportHeight = 0, zoom = 1) {
  if (!positioned.length) {
    return { items: [], minYear: null, maxYear: null, width: 0, height: 0, ticks: [] };
  }

  const minYear = Math.floor(Math.min(...positioned.map((item) => item.start)));
  const maxYear = Math.ceil(Math.max(...positioned.map((item) => item.end)));
  const span = Math.max(1, maxYear - minYear);
  const basePixelsPerYear = span <= 10 ? 130 : span <= 30 ? 86 : span <= 100 ? 52 : 28;
  const pixelsPerYear = basePixelsPerYear * zoom;
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

  const ticks = buildTemporalTicks(minYear, maxYear, pixelsPerYear).map((tick) => ({ ...tick, y: yFor(tick.scalar) }));

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

const DEFAULT_TIMELINE_ZOOM = 3;
const MIN_TIMELINE_ZOOM = 0.25;
const MAX_TIMELINE_ZOOM = 24;

function ZoomControl({ zoom, onChange }) {
  const relativeZoom = zoom / DEFAULT_TIMELINE_ZOOM;
  const atDefault = Math.abs(relativeZoom - 1) < 0.015;
  const levelLabel = atDefault ? 'Default' : `${relativeZoom.toFixed(relativeZoom < 1 ? 2 : 1)}×`;

  return (
    <div className="flex items-center rounded-full border border-[var(--peridot-color-hex-dfe9c8-a35)] bg-[color-mix(in_srgb,var(--peridot-role-interface-panel-background-strong)_94%,transparent)] p-1 shadow-[0_8px_20px_var(--peridot-color-rgba-rgba-0-0-0-0-28)]" aria-label="Timeline zoom">
      <button
        type="button"
        aria-label="Zoom timeline out"
        onClick={() => onChange(zoom / 1.2)}
        className="flex h-8 w-8 items-center justify-center rounded-full text-base font-extrabold text-[var(--peridot-color-hex-f5ecd2)] transition hover:bg-[var(--peridot-color-hex-dfe9c8-a10)]"
      >
        −
      </button>
      <button
        type="button"
        aria-label={`Reset timeline zoom to default; current scale ${levelLabel}`}
        title="Reset zoom to default"
        onClick={() => onChange(DEFAULT_TIMELINE_ZOOM)}
        className="min-w-[62px] rounded-full px-2 py-1.5 text-[9px] font-extrabold tabular-nums tracking-[0.08em] text-[var(--peridot-color-hex-dfe9c8)] transition hover:bg-[var(--peridot-color-hex-dfe9c8-a10)]"
      >
        {levelLabel}
      </button>
      <button
        type="button"
        aria-label="Zoom timeline in"
        onClick={() => onChange(zoom * 1.2)}
        className="flex h-8 w-8 items-center justify-center rounded-full text-base font-extrabold text-[var(--peridot-color-hex-f5ecd2)] transition hover:bg-[var(--peridot-color-hex-dfe9c8-a10)]"
      >
        +
      </button>
    </div>
  );
}

function EventCard({ event, onEventClick, className = '', style, activeCategoryFields = [], hiddenCategoryKeys = [], markerMode = 'color' }) {
  const temporal = temporalPresentation(event);
  const memberships = visibleCategoryMemberships(event, activeCategoryFields, hiddenCategoryKeys);
  const displayedMemberships = memberships.slice(0, 6);
  const hiddenMembershipCount = Math.max(0, memberships.length - displayedMemberships.length);
  const dateLabel = event.displayLabel || event.sourceText || 'Date available';
  const title = eventTitle(event);

  return (
    <button
      type="button"
      onClick={() => onEventClick?.(event)}
      aria-label={`${event.temporalRole || 'Time'}: ${title}, ${dateLabel}${temporal.label ? `, ${temporal.label}` : ''}`}
      className={`group relative z-10 w-[210px] rounded-xl border bg-[color-mix(in_srgb,var(--peridot-role-interface-panel-background-strong)_90%,transparent)] px-3 py-2 text-left text-[var(--peridot-color-hex-f5ecd2)] shadow-[0_8px_20px_var(--peridot-color-rgba-rgba-0-0-0-0-28)] backdrop-blur-[1px] transition hover:-translate-y-0.5 hover:border-[var(--peridot-role-ornament-line)] focus:outline-none focus:ring-2 focus:ring-[var(--peridot-role-interface-focus-ring)] ${temporal.tone === 'approximate' || temporal.tone === 'partial' ? 'border-dashed border-[var(--peridot-color-hex-dfe9c8-a55)]' : 'border-[var(--peridot-color-hex-dfe9c8-a35)]'} ${className}`}
      style={style}
    >
      <span aria-hidden="true" className={`absolute -left-[7px] top-[13px] h-3 w-3 rounded-full border-2 ${anchorMarkerClassName(event)}`} />
      <span className="flex min-w-0 items-center gap-2">
        <span className="min-w-0 flex-1 truncate text-[10px] font-extrabold uppercase tracking-[0.13em] text-[var(--peridot-color-hex-dfe9c8)]">
          {event.temporalRole || 'Time'}
        </span>
        {temporal.label ? (
          <span className="shrink-0 rounded-full border border-[var(--peridot-color-hex-dfe9c8-a30)] bg-[var(--peridot-color-hex-dfe9c8-a08)] px-1.5 py-0.5 text-[8px] font-extrabold uppercase tracking-[0.09em] text-[var(--peridot-color-hex-dfe9c8)]">
            {temporal.label}
          </span>
        ) : null}
      </span>
      <span className="mt-0.5 block truncate text-sm font-bold" title={title}>{title}</span>
      <span className="mt-1 block truncate text-[11px] text-[var(--peridot-color-hex-dfe9c8)]" title={dateLabel}>
        {dateLabel}
      </span>
      {activeCategoryFields.length && memberships.length ? (
        <span className="mt-2 flex min-h-[14px] flex-wrap items-center gap-1" aria-label="Timeline categories">
          {displayedMemberships.map((membership) => (
            <CategoryMarker
              key={`${membership.fieldKey}::${membership.value}::${membership.id}`}
              membership={membership}
              mode={markerMode}
            />
          ))}
          {hiddenMembershipCount ? (
            <span className="ml-0.5 text-[9px] font-bold text-[var(--peridot-color-hex-dfe9c8)]" title={`${hiddenMembershipCount} additional visible categories`}>
              +{hiddenMembershipCount}
            </span>
          ) : null}
        </span>
      ) : null}
    </button>
  );
}

function IntervalSpanHorizontal({ event, width }) {
  const temporal = temporalPresentation(event);
  const dashed = temporal.tone === 'approximate' || temporal.tone === 'partial';
  const openStart = event?.boundedness === 'openStart';
  const openEnd = event?.boundedness === 'openEnd' || event?.boundedness === 'ongoing';
  return (
    <div aria-hidden="true" className="absolute left-0 top-[18px]" style={{ width }}>
      <div
        className={`h-[3px] opacity-85 ${dashed ? 'border-t-2 border-dashed border-[var(--peridot-role-ornament-line)]' : 'rounded-full bg-[var(--peridot-role-ornament-line)]'}`}
      />
      {openStart ? <span className="absolute -left-2 -top-[8px] text-lg font-bold text-[var(--peridot-role-ornament-line)]">‹</span> : null}
      {openEnd ? <span className="absolute -right-2 -top-[8px] text-lg font-bold text-[var(--peridot-role-ornament-line)]">›</span> : null}
    </div>
  );
}

function IntervalSpanVertical({ event, top, height }) {
  const temporal = temporalPresentation(event);
  const dashed = temporal.tone === 'approximate' || temporal.tone === 'partial';
  const openStart = event?.boundedness === 'openStart';
  const openEnd = event?.boundedness === 'openEnd' || event?.boundedness === 'ongoing';
  return (
    <div aria-hidden="true" className="absolute left-0" style={{ top, height }}>
      <div
        className={`h-full w-[3px] opacity-85 ${dashed ? 'border-l-2 border-dashed border-[var(--peridot-role-ornament-line)]' : 'rounded-full bg-[var(--peridot-role-ornament-line)]'}`}
      />
      {openEnd ? <span className="absolute -left-[5px] -top-3 text-lg font-bold text-[var(--peridot-role-ornament-line)]">⌃</span> : null}
      {openStart ? <span className="absolute -bottom-3 -left-[5px] text-lg font-bold text-[var(--peridot-role-ornament-line)]">⌄</span> : null}
    </div>
  );
}

function visibleHorizontalItems(items, renderWindow, overscan = 520) {
  if (!renderWindow?.width) return items;
  const left = renderWindow.scrollLeft - overscan;
  const right = renderWindow.scrollLeft + renderWindow.width + overscan;
  return items.filter((item) => {
    const start = Math.min(item.x, item.endX ?? item.x);
    const end = Math.max(item.x + 210, item.endX ?? item.x);
    return end >= left && start <= right;
  });
}

function visibleVerticalItems(items, renderWindow, overscan = 520) {
  if (!renderWindow?.height) return items;
  const top = renderWindow.scrollTop - overscan;
  const bottom = renderWindow.scrollTop + renderWindow.height + overscan;
  return items.filter((item) => {
    const start = Math.min(item.y - 16, item.endY ?? item.y);
    const end = Math.max(item.y + 92, item.endY ?? item.y);
    return end >= top && start <= bottom;
  });
}

function visibleHorizontalTicks(ticks, renderWindow, overscan = 220) {
  if (!renderWindow?.width) return ticks;
  const left = renderWindow.scrollLeft - overscan;
  const right = renderWindow.scrollLeft + renderWindow.width + overscan;
  return ticks.filter((tick) => tick.x >= left && tick.x <= right);
}

function visibleVerticalTicks(ticks, renderWindow, overscan = 220) {
  if (!renderWindow?.height) return ticks;
  const top = renderWindow.scrollTop - overscan;
  const bottom = renderWindow.scrollTop + renderWindow.height + overscan;
  return ticks.filter((tick) => tick.y >= top && tick.y <= bottom);
}

function estimatedHorizontalTickWidth(tick) {
  const label = String(tick?.label || '');
  const characterWidth = tick?.granularity === 'year' ? 7.2 : 6.2;
  return Math.max(30, label.length * characterWidth + 14);
}

function resolveHorizontalTickLabelCollisions(ticks = []) {
  const sorted = [...ticks].sort((a, b) => a.x - b.x);
  const kept = [];

  sorted.forEach((tick) => {
    const candidate = { ...tick, estimatedLabelWidth: estimatedHorizontalTickWidth(tick) };
    const previous = kept[kept.length - 1];
    if (!previous) {
      kept.push(candidate);
      return;
    }

    const requiredGap = (previous.estimatedLabelWidth + candidate.estimatedLabelWidth) / 2 + 10;
    if (candidate.x - previous.x >= requiredGap) {
      kept.push(candidate);
      return;
    }

    // Prefer major temporal boundaries when two labels cannot coexist. This
    // removes cases such as "31 Aug" immediately beside "1 Sep" without
    // discarding the stronger month/year boundary.
    if (candidate.major && !previous.major) {
      kept[kept.length - 1] = candidate;
    }
  });

  return kept;
}

function resolveVerticalTickLabelCollisions(ticks = []) {
  const sorted = [...ticks].sort((a, b) => a.y - b.y);
  const kept = [];
  const minimumGap = 24;

  sorted.forEach((tick) => {
    const previous = kept[kept.length - 1];
    if (!previous || tick.y - previous.y >= minimumGap) {
      kept.push(tick);
      return;
    }

    if (tick.major && !previous.major) {
      kept[kept.length - 1] = tick;
    }
  });

  return kept;
}

function HorizontalTimeline({ geometry, onEventClick, activeCategoryFields, hiddenCategoryKeys, markerMode, renderWindow }) {
  const renderedItems = visibleHorizontalItems(geometry.items, renderWindow);
  const renderedTicks = resolveHorizontalTickLabelCollisions(visibleHorizontalTicks(geometry.ticks, renderWindow));
  return (
    <div
      className="relative min-h-full bg-[linear-gradient(180deg,color-mix(in_srgb,var(--peridot-color-hex-dfe9c8)_78%,var(--peridot-color-hex-f5ecd2)),color-mix(in_srgb,var(--peridot-color-hex-f5ecd2)_70%,var(--peridot-color-hex-dfe9c8)))]"
      style={{ width: geometry.width, minHeight: geometry.height }}
    >
      <div
        className="absolute h-px bg-[var(--peridot-role-ornament-line)] shadow-[0_0_10px_var(--peridot-color-hex-d6a36a-a35)]"
        style={{ left: 68, right: 68, top: geometry.axisY }}
      />

      {renderedTicks.map((tick) => (
        <div key={tick.key} className="absolute top-0" style={{ left: tick.x }}>
          <div className={`absolute top-[54px] w-px bg-[var(--peridot-role-ornament-line)] ${tick.major ? 'h-6' : 'h-4 opacity-75'}`} />
          <div className={`absolute -translate-x-1/2 whitespace-nowrap font-bold text-[var(--peridot-role-interface-panel-background-strong)] ${tick.granularity === 'year' ? 'top-[25px] text-[11px] tracking-[0.08em]' : 'top-[27px] text-[10px] tracking-[0.04em]'}`}>
            {tick.label}
          </div>
          <div
            className={`absolute top-[78px] w-px bg-[color-mix(in_srgb,var(--peridot-role-interface-panel-background-strong)_18%,transparent)] ${tick.major ? '' : 'opacity-45'}`}
            style={{ height: Math.max(0, geometry.height - 102) }}
          />
        </div>
      ))}

      {renderedItems.map(({ event, x, endX, top }) => {
        const isInterval = event.temporalKind === 'interval' || event.temporalKind === 'openInterval';
        const intervalWidth = Math.max(18, endX - x);
        return (
          <div key={event.id} className="absolute" style={{ left: x, top }}>
            {isInterval ? (
              <IntervalSpanHorizontal event={event} width={intervalWidth} />
            ) : null}
            <EventCard event={event} onEventClick={onEventClick} className="-translate-x-3" activeCategoryFields={activeCategoryFields} hiddenCategoryKeys={hiddenCategoryKeys} markerMode={markerMode} />
          </div>
        );
      })}
    </div>
  );
}

function VerticalTimeline({ geometry, onEventClick, activeCategoryFields, hiddenCategoryKeys, markerMode, renderWindow }) {
  const renderedItems = visibleVerticalItems(geometry.items, renderWindow);
  const renderedTicks = resolveVerticalTickLabelCollisions(visibleVerticalTicks(geometry.ticks, renderWindow));
  return (
    <div
      className="relative min-h-full bg-[linear-gradient(180deg,color-mix(in_srgb,var(--peridot-color-hex-dfe9c8)_78%,var(--peridot-color-hex-f5ecd2)),color-mix(in_srgb,var(--peridot-color-hex-f5ecd2)_70%,var(--peridot-color-hex-dfe9c8)))]"
      style={{ width: geometry.width, minHeight: geometry.height }}
    >
      <div
        className="absolute w-px bg-[var(--peridot-role-ornament-line)] shadow-[0_0_10px_var(--peridot-color-hex-d6a36a-a35)]"
        style={{ left: geometry.axisX, top: 68, bottom: 68 }}
      />

      {renderedTicks.map((tick) => (
        <div key={tick.key} className="absolute left-0" style={{ top: tick.y }}>
          <div
            className={`absolute left-[68px] h-px bg-[color-mix(in_srgb,var(--peridot-role-interface-panel-background-strong)_18%,transparent)] ${tick.major ? '' : 'opacity-45'}`}
            style={{ width: Math.max(0, geometry.width - 96) }}
          />
          <div className={`absolute left-[80px] -top-3 w-6 border-l border-[var(--peridot-role-ornament-line)] ${tick.major ? 'h-6' : 'h-4 opacity-75'}`} />
          <div className={`absolute left-[22px] whitespace-nowrap font-bold text-[var(--peridot-role-interface-panel-background-strong)] ${tick.granularity === 'year' ? '-top-2 text-[11px] tracking-[0.08em]' : '-top-2 text-[10px] tracking-[0.03em]'}`}>
            {tick.label}
          </div>
        </div>
      ))}

      {renderedItems.map(({ event, y, endY, left }) => {
        const isInterval = event.temporalKind === 'interval' || event.temporalKind === 'openInterval';
        const intervalTop = Math.min(y, endY);
        const intervalHeight = Math.max(18, Math.abs(y - endY));
        return (
          <div key={event.id} className="absolute" style={{ left, top: y - 16 }}>
            {isInterval ? (
              <IntervalSpanVertical event={event} top={intervalTop - y + 16} height={intervalHeight} />
            ) : null}
            <EventCard event={event} onEventClick={onEventClick} activeCategoryFields={activeCategoryFields} hiddenCategoryKeys={hiddenCategoryKeys} markerMode={markerMode} />
          </div>
        );
      })}

      <div className="absolute left-[20px] top-[72px] text-[10px] font-extrabold uppercase tracking-[0.13em] text-[var(--peridot-role-interface-panel-background-strong)]">
        Latest
      </div>
      <div className="absolute bottom-[72px] left-[20px] text-[10px] font-extrabold uppercase tracking-[0.13em] text-[var(--peridot-role-interface-panel-background-strong)]">
        Earliest
      </div>
    </div>
  );
}

function CategoryControls({
  fields,
  activeFieldKeys,
  hiddenCategoryKeys,
  showUncategorized,
  uncategorizedCount,
  markerMode,
  onToggleField,
  onToggleValue,
  onToggleUncategorized,
  onMarkerModeChange,
  onReset,
}) {
  const [open, setOpen] = useState(false);
  const controlRef = useRef(null);
  const activeCount = activeFieldKeys.length;

  useEffect(() => {
    if (!open) return undefined;

    const handlePointerDown = (event) => {
      if (controlRef.current?.contains(event.target)) return;
      setOpen(false);
    };

    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, [open]);

  return (
    <div ref={controlRef} className="pointer-events-auto relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        className="rounded-full border border-[var(--peridot-color-hex-dfe9c8-a35)] bg-[color-mix(in_srgb,var(--peridot-role-interface-panel-background-strong)_94%,transparent)] px-4 py-2 text-[10px] font-extrabold uppercase tracking-[0.13em] text-[var(--peridot-color-hex-f5ecd2)] shadow-[0_8px_20px_var(--peridot-color-rgba-rgba-0-0-0-0-28)] backdrop-blur-sm transition hover:border-[var(--peridot-role-ornament-line)] focus:outline-none focus:ring-2 focus:ring-[var(--peridot-role-interface-focus-ring)]"
      >
        Categories{activeCount ? ` · ${activeCount}` : ''}
      </button>

      {open ? (
        <div className="absolute right-0 top-[calc(100%+8px)] flex h-[600px] w-[340px] max-h-[calc(100vh-180px)] max-w-[calc(100vw-48px)] flex-col overflow-hidden rounded-2xl border border-[var(--peridot-color-hex-dfe9c8-a35)] bg-[color-mix(in_srgb,var(--peridot-role-interface-panel-background-strong)_97%,transparent)] text-[var(--peridot-color-hex-f5ecd2)] shadow-[0_18px_42px_var(--peridot-color-rgba-rgba-0-0-0-0-36)] backdrop-blur-md">
          <div className="border-b border-[var(--peridot-color-hex-dfe9c8-a18)] px-4 py-3">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-[var(--peridot-color-hex-dfe9c8)]">Categorize timeline events by</div>
                <p className="mt-1 text-xs leading-relaxed text-[var(--peridot-color-hex-dfe9c8)]">Choose mapped Evidence fields, then toggle their values on or off.</p>
              </div>
              {activeCount ? (
                <button type="button" onClick={onReset} className="shrink-0 text-[10px] font-bold uppercase tracking-[0.1em] text-[var(--peridot-role-ornament-line)] hover:underline">Reset</button>
              ) : null}
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3">
            {!fields.length ? (
              <p className="text-sm text-[var(--peridot-color-hex-dfe9c8)]">No mapped Evidence fields are available in the current visualization scope.</p>
            ) : fields.map((field) => {
              const active = activeFieldKeys.includes(field.key);
              return (
                <div key={field.id} className="border-b border-[var(--peridot-color-hex-dfe9c8-a14)] py-3 last:border-b-0">
                  <label className="flex cursor-pointer items-start gap-3">
                    <input
                      type="checkbox"
                      checked={active}
                      onChange={() => onToggleField(field)}
                      className="mt-0.5 h-4 w-4 accent-[var(--peridot-role-ornament-line)]"
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-bold">{field.label}</span>
                      <span className="mt-0.5 block text-[11px] text-[var(--peridot-color-hex-dfe9c8)]">{field.eventCount} events · {field.values.length} values</span>
                    </span>
                  </label>

                  {active ? (
                    <div className="ml-7 mt-2 space-y-1.5">
                      {field.values.map((value) => {
                        const identity = categoryIdentity(field.key, value.value);
                        const visible = !hiddenCategoryKeys.includes(identity);
                        return (
                          <label key={identity} className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1 hover:bg-[var(--peridot-color-hex-dfe9c8-a08)]">
                            <input
                              type="checkbox"
                              checked={visible}
                              onChange={() => onToggleValue(field.key, value.value)}
                              className="h-3.5 w-3.5 accent-[var(--peridot-role-ornament-line)]"
                            />
                            <CategoryMarker membership={{ fieldKey: field.key, fieldLabel: field.label, value: value.value }} mode={markerMode} />
                            <span className="min-w-0 flex-1 truncate text-xs">{value.value}</span>
                            <span className="text-[10px] tabular-nums text-[var(--peridot-color-hex-dfe9c8)]">{value.eventCount}</span>
                          </label>
                        );
                      })}
                    </div>
                  ) : null}
                </div>
              );
            })}

            {activeCount ? (
              <label className="mt-3 flex cursor-pointer items-center gap-2 rounded-xl border border-[var(--peridot-color-hex-dfe9c8-a18)] bg-[var(--peridot-color-hex-dfe9c8-a06)] px-3 py-2">
                <input
                  type="checkbox"
                  checked={showUncategorized}
                  onChange={onToggleUncategorized}
                  className="h-3.5 w-3.5 accent-[var(--peridot-role-ornament-line)]"
                />
                <span className="min-w-0 flex-1 text-xs font-semibold">Uncategorized events</span>
                <span className="text-[10px] tabular-nums text-[var(--peridot-color-hex-dfe9c8)]">{uncategorizedCount}</span>
              </label>
            ) : null}
          </div>

          {activeCount ? (
            <div className="flex items-center justify-between gap-3 border-t border-[var(--peridot-color-hex-dfe9c8-a18)] px-4 py-3">
              <span className="text-[10px] font-extrabold uppercase tracking-[0.13em] text-[var(--peridot-color-hex-dfe9c8)]">Markers</span>
              <div className="flex rounded-full border border-[var(--peridot-color-hex-dfe9c8-a25)] p-1">
                {['color', 'shape'].map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    aria-pressed={markerMode === mode}
                    onClick={() => onMarkerModeChange(mode)}
                    className={`rounded-full px-3 py-1.5 text-[9px] font-extrabold uppercase tracking-[0.12em] ${markerMode === mode
                      ? 'bg-[var(--peridot-role-ornament-line)] text-[var(--peridot-role-interface-panel-background-strong)]'
                      : 'text-[var(--peridot-color-hex-f5ecd2)] hover:bg-[var(--peridot-color-hex-dfe9c8-a08)]'
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

export function PeridotTimelineWorkspace({ events = [], onEventClick }) {
  const [orientation, setOrientation] = useState('horizontal');
  const [zoom, setZoom] = useState(DEFAULT_TIMELINE_ZOOM);
  const [viewportSize, setViewportSize] = useState({ width: 0, height: 0 });
  const [renderWindow, setRenderWindow] = useState({ scrollLeft: 0, scrollTop: 0, width: 0, height: 0 });
  const [activeCategoryFields, setActiveCategoryFields] = useState([]);
  const [hiddenCategoryKeys, setHiddenCategoryKeys] = useState([]);
  const [showUncategorized, setShowUncategorized] = useState(true);
  const [markerMode, setMarkerMode] = useState('color');
  const [isPanning, setIsPanning] = useState(false);
  const scrollerRef = useRef(null);
  const pendingChronologyFractionRef = useRef(null);
  const pendingZoomAnchorRef = useRef(null);
  const scrollFrameRef = useRef(null);
  const wheelFrameRef = useRef(null);
  const pendingWheelDeltaRef = useRef(0);
  const panStateRef = useRef(null);
  const categoryFields = useMemo(() => buildPeridotTimelineCategoryFields(events), [events]);
  const activeCategoryFieldSet = useMemo(() => new Set(activeCategoryFields), [activeCategoryFields]);
  const visibleCategories = useMemo(() => categoryFields
    .filter((field) => activeCategoryFieldSet.has(field.key))
    .flatMap((field) => field.values
      .map((value) => ({
        identity: categoryIdentity(field.key, value.value),
        fieldKey: field.key,
        value: value.value,
      }))
      .filter((category) => !hiddenCategoryKeys.includes(category.identity))
      .map(({ fieldKey, value }) => ({ fieldKey, value }))), [categoryFields, activeCategoryFieldSet, hiddenCategoryKeys]);
  const uncategorizedEventIds = useMemo(() => new Set(asArray(events)
    .filter((event) => !asArray(event?.categoryMemberships)
      .some((membership) => activeCategoryFieldSet.has(membership.fieldKey)))
    .map((event) => event.id)), [events, activeCategoryFieldSet]);
  const filteredEvents = useMemo(() => {
    if (!activeCategoryFields.length) return events;
    const categorizedMatches = visibleCategories.length
      ? filterPeridotTimelineEventsByCategories(events, visibleCategories)
      : [];
    if (!showUncategorized) return categorizedMatches;
    const matchesById = new Map(categorizedMatches.map((event) => [event.id, event]));
    asArray(events).forEach((event) => {
      if (uncategorizedEventIds.has(event.id)) matchesById.set(event.id, event);
    });
    return Array.from(matchesById.values());
  }, [events, activeCategoryFields.length, visibleCategories, showUncategorized, uncategorizedEventIds]);
  const positioned = useMemo(() => positionedTimelineEvents(filteredEvents), [filteredEvents]);
  const horizontalGeometry = useMemo(
    () => buildHorizontalGeometry(positioned, viewportSize.width, zoom),
    [positioned, viewportSize.width, zoom],
  );
  const verticalGeometry = useMemo(
    () => buildVerticalGeometry(positioned, viewportSize.height, zoom),
    [positioned, viewportSize.height, zoom],
  );
  const geometry = orientation === 'vertical' ? verticalGeometry : horizontalGeometry;

  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return undefined;

    const captureViewport = () => {
      const nextSize = { width: scroller.clientWidth, height: scroller.clientHeight };
      setViewportSize((current) => (
        current.width === nextSize.width && current.height === nextSize.height ? current : nextSize
      ));
      setRenderWindow((current) => {
        const next = {
          scrollLeft: scroller.scrollLeft,
          scrollTop: scroller.scrollTop,
          width: scroller.clientWidth,
          height: scroller.clientHeight,
        };
        return current.scrollLeft === next.scrollLeft
          && current.scrollTop === next.scrollTop
          && current.width === next.width
          && current.height === next.height
          ? current
          : next;
      });
    };

    const scheduleCapture = () => {
      if (scrollFrameRef.current !== null) return;
      scrollFrameRef.current = window.requestAnimationFrame(() => {
        scrollFrameRef.current = null;
        captureViewport();
      });
    };

    captureViewport();
    scroller.addEventListener('scroll', scheduleCapture, { passive: true });

    let observer = null;
    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', scheduleCapture);
    } else {
      observer = new ResizeObserver(scheduleCapture);
      observer.observe(scroller);
    }

    return () => {
      scroller.removeEventListener('scroll', scheduleCapture);
      window.removeEventListener('resize', scheduleCapture);
      observer?.disconnect();
      if (scrollFrameRef.current !== null) {
        window.cancelAnimationFrame(scrollFrameRef.current);
        scrollFrameRef.current = null;
      }
    };
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

  const handleZoomChange = (nextZoom) => {
    const normalizedZoom = clamp(Number(nextZoom) || DEFAULT_TIMELINE_ZOOM, MIN_TIMELINE_ZOOM, MAX_TIMELINE_ZOOM);
    if (Math.abs(normalizedZoom - zoom) < 0.0001) return;
    pendingChronologyFractionRef.current = chronologyFractionForViewport(
      scrollerRef.current,
      orientation,
      geometry,
    );
    setZoom(normalizedZoom);
  };

  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return undefined;

    const handleWheel = (event) => {
      if (!geometry?.temporalExtent) return;
      event.preventDefault();

      const rect = scroller.getBoundingClientRect();
      const viewportOffset = orientation === 'vertical'
        ? clamp(event.clientY - rect.top, 0, scroller.clientHeight)
        : clamp(event.clientX - rect.left, 0, scroller.clientWidth);
      const contentPosition = orientation === 'vertical'
        ? scroller.scrollTop + viewportOffset
        : scroller.scrollLeft + viewportOffset;
      const chronologicalFraction = orientation === 'vertical'
        ? clamp(1 - ((contentPosition - geometry.leadingPadding) / geometry.temporalExtent), 0, 1)
        : clamp((contentPosition - geometry.leadingPadding) / geometry.temporalExtent, 0, 1);

      pendingZoomAnchorRef.current = { chronologicalFraction, viewportOffset };
      const delta = Number.isFinite(event.deltaY) && event.deltaY !== 0 ? event.deltaY : event.deltaX;
      pendingWheelDeltaRef.current += delta;

      if (wheelFrameRef.current === null) {
        wheelFrameRef.current = window.requestAnimationFrame(() => {
          wheelFrameRef.current = null;
          const accumulatedDelta = pendingWheelDeltaRef.current;
          pendingWheelDeltaRef.current = 0;
          const zoomFactor = clamp(Math.exp(-accumulatedDelta * 0.0018), 0.74, 1.35);
          setZoom((current) => clamp(current * zoomFactor, MIN_TIMELINE_ZOOM, MAX_TIMELINE_ZOOM));
        });
      }
    };

    scroller.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      scroller.removeEventListener('wheel', handleWheel);
      if (wheelFrameRef.current !== null) {
        window.cancelAnimationFrame(wheelFrameRef.current);
        wheelFrameRef.current = null;
      }
      pendingWheelDeltaRef.current = 0;
    };
  }, [orientation, geometry]);


  const handlePanPointerDown = (event) => {
    const scroller = scrollerRef.current;
    if (!scroller || event.button !== 0 || event.pointerType === 'touch') return;

    const interactiveTarget = event.target?.closest?.('button, input, select, textarea, a, [role="button"], [data-timeline-no-pan]');
    if (interactiveTarget) return;

    const rect = scroller.getBoundingClientRect();
    const localX = event.clientX - rect.left;
    const localY = event.clientY - rect.top;
    const verticalScrollbarWidth = Math.max(0, scroller.offsetWidth - scroller.clientWidth);
    const horizontalScrollbarHeight = Math.max(0, scroller.offsetHeight - scroller.clientHeight);
    if (verticalScrollbarWidth && localX >= scroller.clientWidth) return;
    if (horizontalScrollbarHeight && localY >= scroller.clientHeight) return;

    panStateRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      startScrollLeft: scroller.scrollLeft,
      startScrollTop: scroller.scrollTop,
    };
    scroller.setPointerCapture?.(event.pointerId);
    setIsPanning(true);
    event.preventDefault();
  };

  const handlePanPointerMove = (event) => {
    const scroller = scrollerRef.current;
    const panState = panStateRef.current;
    if (!scroller || !panState || panState.pointerId !== event.pointerId) return;

    scroller.scrollLeft = panState.startScrollLeft - (event.clientX - panState.startX);
    scroller.scrollTop = panState.startScrollTop - (event.clientY - panState.startY);
    event.preventDefault();
  };

  const endPan = (event) => {
    const scroller = scrollerRef.current;
    const panState = panStateRef.current;
    if (!panState || (event?.pointerId != null && panState.pointerId !== event.pointerId)) return;

    if (scroller && event?.pointerId != null && scroller.hasPointerCapture?.(event.pointerId)) {
      scroller.releasePointerCapture(event.pointerId);
    }
    panStateRef.current = null;
    setIsPanning(false);
  };

  useLayoutEffect(() => {
    const scroller = scrollerRef.current;
    const zoomAnchor = pendingZoomAnchorRef.current;
    if (zoomAnchor && scroller && geometry?.temporalExtent) {
      if (orientation === 'vertical') {
        const contentY = geometry.leadingPadding + (1 - zoomAnchor.chronologicalFraction) * geometry.temporalExtent;
        scroller.scrollTop = Math.max(0, contentY - zoomAnchor.viewportOffset);
      } else {
        const contentX = geometry.leadingPadding + zoomAnchor.chronologicalFraction * geometry.temporalExtent;
        scroller.scrollLeft = Math.max(0, contentX - zoomAnchor.viewportOffset);
      }
      pendingZoomAnchorRef.current = null;
      pendingChronologyFractionRef.current = null;
      return;
    }

    if (pendingChronologyFractionRef.current === null) return;
    restoreChronologyFraction(
      scroller,
      orientation,
      geometry,
      pendingChronologyFractionRef.current,
    );
    pendingChronologyFractionRef.current = null;
  }, [orientation, geometry]);

  useEffect(() => {
    const availableFieldKeys = new Set(categoryFields.map((field) => field.key));
    setActiveCategoryFields((current) => current.filter((key) => availableFieldKeys.has(key)));
    const availableCategoryKeys = new Set(categoryFields.flatMap((field) => (
      field.values.map((value) => categoryIdentity(field.key, value.value))
    )));
    setHiddenCategoryKeys((current) => current.filter((key) => availableCategoryKeys.has(key)));
  }, [categoryFields]);

  const handleToggleCategoryField = (field) => {
    const active = activeCategoryFields.includes(field.key);
    if (active) {
      setActiveCategoryFields((current) => current.filter((key) => key !== field.key));
      setHiddenCategoryKeys((current) => current.filter((identity) => !identity.startsWith(`${field.key}\u0000`)));
      return;
    }

    setActiveCategoryFields((current) => [...current, field.key]);
  };

  const handleToggleCategoryValue = (fieldKey, value) => {
    const identity = categoryIdentity(fieldKey, value);
    setHiddenCategoryKeys((current) => (
      current.includes(identity)
        ? current.filter((key) => key !== identity)
        : [...current, identity]
    ));
  };

  const handleResetCategories = () => {
    setActiveCategoryFields([]);
    setHiddenCategoryKeys([]);
    setShowUncategorized(true);
  };

  if (!events.length) {
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
        onPointerDown={handlePanPointerDown}
        onPointerMove={handlePanPointerMove}
        onPointerUp={endPan}
        onPointerCancel={endPan}
        onLostPointerCapture={endPan}
        className={`absolute inset-0 min-h-0 min-w-0 overflow-auto bg-[color-mix(in_srgb,var(--peridot-color-hex-dfe9c8)_76%,var(--peridot-color-hex-f5ecd2))] ${isPanning ? 'cursor-grabbing select-none' : 'cursor-grab'}`}
      >
        {!geometry.items.length ? (
          <div className="flex h-full w-full items-center justify-center p-8 text-center">
            <div className="max-w-lg rounded-2xl border border-[var(--peridot-color-hex-dfe9c8-a25)] bg-[color-mix(in_srgb,var(--peridot-role-interface-panel-background-strong)_92%,transparent)] px-6 py-5 text-[var(--peridot-color-hex-f5ecd2)] shadow-[0_12px_30px_var(--peridot-color-rgba-rgba-0-0-0-0-28)]">
              <h2 className="[font-family:Georgia,'Palatino_Linotype','Book_Antiqua',Palatino,serif] text-xl font-bold">No events match the visible categories</h2>
              <p className="mt-2 text-sm leading-relaxed text-[var(--peridot-color-hex-dfe9c8)]">Turn one or more category values back on, or reset Timeline categories.</p>
            </div>
          </div>
        ) : orientation === 'vertical' ? (
          <VerticalTimeline geometry={verticalGeometry} onEventClick={onEventClick} activeCategoryFields={activeCategoryFields} hiddenCategoryKeys={hiddenCategoryKeys} markerMode={markerMode} renderWindow={renderWindow} />
        ) : (
          <HorizontalTimeline geometry={horizontalGeometry} onEventClick={onEventClick} activeCategoryFields={activeCategoryFields} hiddenCategoryKeys={hiddenCategoryKeys} markerMode={markerMode} renderWindow={renderWindow} />
        )}
      </div>

      <div className="pointer-events-none absolute left-3 top-3 z-30 flex flex-col items-start gap-2">
        <div className="pointer-events-auto flex items-center gap-3 rounded-full border border-[var(--peridot-color-hex-dfe9c8-a25)] bg-[color-mix(in_srgb,var(--peridot-role-interface-panel-background-strong)_92%,transparent)] px-3 py-1.5 shadow-[0_8px_20px_var(--peridot-color-rgba-rgba-0-0-0-0-24)] backdrop-blur-sm">
          <div className="shrink-0 text-[10px] font-extrabold uppercase tracking-[0.13em] text-[var(--peridot-color-hex-dfe9c8)]">
            Timeline view
          </div>
          <OrientationControl orientation={orientation} onChange={handleOrientationChange} />
        </div>

        <div className="pointer-events-auto flex items-center gap-3 rounded-full border border-[var(--peridot-color-hex-dfe9c8-a25)] bg-[color-mix(in_srgb,var(--peridot-role-interface-panel-background-strong)_92%,transparent)] px-3 py-1.5 shadow-[0_8px_20px_var(--peridot-color-rgba-rgba-0-0-0-0-24)] backdrop-blur-sm">
          <div className="shrink-0 text-[10px] font-extrabold uppercase tracking-[0.13em] text-[var(--peridot-color-hex-dfe9c8)]">
            Zoom
          </div>
          <ZoomControl zoom={zoom} onChange={handleZoomChange} />
          <CategoryControls
            fields={categoryFields}
            activeFieldKeys={activeCategoryFields}
            hiddenCategoryKeys={hiddenCategoryKeys}
            showUncategorized={showUncategorized}
            uncategorizedCount={uncategorizedEventIds.size}
            markerMode={markerMode}
            onToggleField={handleToggleCategoryField}
            onToggleValue={handleToggleCategoryValue}
            onToggleUncategorized={() => setShowUncategorized((value) => !value)}
            onMarkerModeChange={setMarkerMode}
            onReset={handleResetCategories}
          />
        </div>
      </div>
    </div>
  );
}
