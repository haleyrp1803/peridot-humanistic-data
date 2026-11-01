import './styles/workspaces/timeline-contrast.css';
import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import {
  buildPeridotTimelineCategoryFields,
  buildPeridotTimelineConnections,
  filterPeridotTimelineEventsByCategories,
} from './peridotTimelineWorkspaceModel.js';

// The scrolling stage and its fixed chronological ruler share these dimensions.
// Always constrain BOTH ends of the absolutely positioned scroller: leaving
// bottom undefined caused the v6 Vertical viewport to grow to content height.
const TIMELINE_STAGE_LAYOUT = Object.freeze({
  horizontal: Object.freeze({ scrollerTop: 57, scrollerBottom: 53, rulerBottom: 0, rulerHeight: 53 }),
  vertical: Object.freeze({ scrollerTop: 110, scrollerBottom: 0, rulerTop: 110, rulerBottom: 12, rulerWidth: 107 }),
});

function timelineStageLayout(orientation) {
  return TIMELINE_STAGE_LAYOUT[orientation === 'vertical' ? 'vertical' : 'horizontal'];
}

// Project calendar coordinates into the non-scrolling ruler from the same
// scroll position used to window its ticks; do not modify source dates.
function projectRulerTick(tick, renderWindow, orientation) {
  return orientation === 'vertical'
    ? { top: tick.y - renderWindow.scrollTop }
    : { left: tick.x - renderWindow.scrollLeft };
}

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

// One civil-calendar coordinate shared by events and axis ticks. Unlike the
// former (month-1)/12 + (day-1)/366 approximation, this respects month length
// and leap years, including historical/BCE years represented numerically.
function daysInYear(year) {
  return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0) ? 366 : 365;
}

function calendarFraction(year, month, day) {
  let dayIndex = 0;
  for (let m = 1; m < month; m += 1) dayIndex += daysInMonth(year, m);
  return (dayIndex + day - 1) / daysInYear(year);
}

function scalarFromSortKey(value) {
  const parts = sortKeyParts(value);
  if (!parts) return null;
  const month = parts.month >= 1 && parts.month <= 12 ? parts.month : 1;
  const day = parts.day >= 1 && parts.day <= daysInMonth(parts.year, month) ? parts.day : 1;
  return scalarFromCalendarDate(parts.year, month, day);
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

// Phase 1B: precision is derived from the canonical assertion contract, never
// from the fallback day/month used to calculate a chronological coordinate.
// This classifies point events only. Period extents remain a separate concern.
function pointDatePrecision(event) {
  if (event?.temporalKind === 'interval' || event?.temporalKind === 'openInterval') return null;
  const contract = event?.temporalPresentationContract;
  if (!contract || contract.kind !== 'point') return null;
  const endpoint = contract.start || contract.end;
  const known = endpoint?.knownComponents;
  if (!known?.year) return { label: 'Partial date', tone: 'partial', detail: 'Incomplete source date; anchor is a positioning convention' };
  if (known.month && known.day) return { label: 'Exact day', tone: 'day', detail: 'Source specifies a calendar day' };
  if (known.month && !known.day) return { label: 'Month only', tone: 'month', detail: 'Source specifies a month, not a particular day' };
  if (!known.month && !known.day) return { label: 'Year only', tone: 'year', detail: 'Source specifies a year, not a particular month or day' };
  return { label: 'Partial date', tone: 'partial', detail: 'Incomplete source date; anchor is a positioning convention' };
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

// Approved manuscript-inspired category slots. The associated white symbols
// are always displayed with the colors; slot names are not data semantics.
const CATEGORY_SLOTS = [
  ['#A63D2B', 'square'], ['#7C211E', 'triangle'],
  ['#B85C38', 'diamond'], ['#C49A3A', 'star'],
  ['#7A7A32', 'plus'], ['#2F4A3E', 'cross'],
  ['#6B7F6B', 'hexagon'], ['#2F6F73', 'flower'],
  ['#5F7C8B', 'chevron-up'], ['#4B5E8C', 'chevron-down'],
  ['#6E4A7F', 'vertical-bar'], ['#9A4E68', 'horizontal-bar'],
];

// Module memory deliberately survives switching workspaces, but never writes
// browser storage. Assign slots by shuffled 1–12 cycles; do not re-roll upon
// React rendering, filtering, or reopening the Timeline within this session.
const sessionCategorySlots = new Map();
const sessionCategoryOverrides = new Map();
let pendingCategorySlots = [];
function nextShuffledSlot() {
  if (!pendingCategorySlots.length) {
    pendingCategorySlots = CATEGORY_SLOTS.map((_, index) => index);
    for (let i = pendingCategorySlots.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [pendingCategorySlots[i], pendingCategorySlots[j]] = [pendingCategorySlots[j], pendingCategorySlots[i]];
    }
  }
  return pendingCategorySlots.pop();
}
function slotForCategory(identity) {
  if (!sessionCategorySlots.has(identity)) sessionCategorySlots.set(identity, nextShuffledSlot());
  return sessionCategorySlots.get(identity);
}
function CategorySymbol({ shape }) {
  const common = { fill: 'white', stroke: 'white', strokeWidth: 1.5, strokeLinejoin: 'round' };
  const points = (n, rotation = -Math.PI / 2, radius = 7) => Array.from({ length: n }, (_, i) => {
    const angle = rotation + i * Math.PI * 2 / n;
    return `${12 + radius * Math.cos(angle)},${12 + radius * Math.sin(angle)}`;
  }).join(' ');
  if (shape === 'square') return <rect x="6.5" y="6.5" width="11" height="11" {...common} />;
  if (shape === 'triangle') return <polygon points={points(3)} {...common} />;
  if (shape === 'diamond') return <polygon points={points(4, 0)} {...common} />;
  if (shape === 'star') return <polygon points={Array.from({ length: 10 }, (_, i) => { const angle = -Math.PI / 2 + i * Math.PI / 5; const r = i % 2 ? 3.2 : 8; return `${12 + r * Math.cos(angle)},${12 + r * Math.sin(angle)}`; }).join(' ')} {...common} />;
  if (shape === 'plus') return <path d="M12 5 V19 M5 12 H19" fill="none" stroke="white" strokeWidth="4" />;
  if (shape === 'cross') return <path d="M6.5 6.5 L17.5 17.5 M17.5 6.5 L6.5 17.5" fill="none" stroke="white" strokeWidth="4" />;
  if (shape === 'hexagon') return <polygon points={points(6)} {...common} />;
  if (shape === 'flower') return <><g fill="white">{Array.from({ length: 5 }, (_, i) => { const a = -Math.PI / 2 + i * Math.PI * 2 / 5; return <circle key={i} cx={12 + 5 * Math.cos(a)} cy={12 + 5 * Math.sin(a)} r="3.8" />; })}</g><circle cx="12" cy="12" r="2.2" fill="#2F6F73" /></>;
  if (shape === 'chevron-up') return <path d="M5 15 L12 8 L19 15" fill="none" stroke="white" strokeWidth="4" strokeLinejoin="round" />;
  if (shape === 'chevron-down') return <path d="M5 9 L12 16 L19 9" fill="none" stroke="white" strokeWidth="4" strokeLinejoin="round" />;
  if (shape === 'vertical-bar') return <rect x="10" y="5" width="4" height="14" fill="white" />;
  return <rect x="5" y="10" width="14" height="4" fill="white" />;
}

function CategoryMarker({ membership, assignments }) {
  const identity = categoryIdentity(membership.fieldKey, membership.value);
  const [color, shape] = CATEGORY_SLOTS[assignments[identity] ?? slotForCategory(identity)];
  const label = `${membership.fieldLabel || membership.fieldKey}: ${membership.value}; ${shape}`;
  return (
    <svg aria-label={label} role="img" title={label} viewBox="0 0 24 24" className="inline-block h-5 w-5 shrink-0" style={{ overflow: 'visible' }}>
      <title>{label}</title>
      <circle cx="12" cy="12" r="11" fill={color} stroke="rgba(255,255,255,.95)" strokeWidth="1.2" />
      <CategorySymbol shape={shape} />
    </svg>
  );
}


function primaryVisibleMembership(event, activeCategoryFields, hiddenCategoryKeys) {
  const memberships = visibleCategoryMemberships(event, activeCategoryFields, hiddenCategoryKeys);
  return memberships[0] || null;
}

function categoryStyleForMembership(membership, assignments) {
  if (!membership) return { color: '#253C32', shape: 'circle', identity: '' };
  const identity = categoryIdentity(membership.fieldKey, membership.value);
  const [color, shape] = CATEGORY_SLOTS[assignments[identity] ?? slotForCategory(identity)];
  return { color, shape, identity };
}

function hexToRgba(hex, alpha = 1) {
  const normalized = String(hex || '').trim().replace('#', '');
  const expanded = normalized.length === 3
    ? normalized.split('').map((char) => char + char).join('')
    : normalized;
  if (!/^[0-9a-fA-F]{6}$/.test(expanded)) return `rgba(37,60,50,${alpha})`;
  const red = parseInt(expanded.slice(0, 2), 16);
  const green = parseInt(expanded.slice(2, 4), 16);
  const blue = parseInt(expanded.slice(4, 6), 16);
  return `rgba(${red},${green},${blue},${alpha})`;
}

function formatEndpointLabel(endpoint) {
  if (!endpoint) return '';
  const year = Number.isInteger(endpoint.year) ? endpoint.year : null;
  const month = Number.isInteger(endpoint.month) ? endpoint.month : null;
  const day = Number.isInteger(endpoint.day) ? endpoint.day : null;
  if (year === null && month === null && day === null) return '';
  if (year !== null && month !== null && day !== null) return `${day} ${MONTH_LABELS[month - 1]} ${year}`;
  if (year !== null && month !== null) return `${MONTH_LABELS[month - 1]} ${year}`;
  if (year !== null) return `${year}`;
  if (month !== null && day !== null) return `${day} ${MONTH_LABELS[month - 1]}`;
  if (month !== null) return MONTH_LABELS[month - 1];
  return String(day ?? '');
}

function presentationalDateLabel(event) {
  const contract = event?.temporalPresentationContract;
  if (!contract) return event?.displayLabel || event?.sourceText || 'Date available';
  if (contract.kind === 'period') {
    const start = formatEndpointLabel(contract.start);
    const end = formatEndpointLabel(contract.end);
    if (contract.openStart && end) return `Before ${end}`;
    if (contract.openEnd && start) return `${start} onward`;
    if (start && end) return `${start} — ${end}`;
    return contract.display || contract.sourceText || event?.displayLabel || 'Period available';
  }
  const point = contract.start || contract.end;
  const formatted = formatEndpointLabel(point);
  return formatted || contract.display || contract.sourceText || event?.displayLabel || 'Date available';
}

function PointEventCard({ event, onEventClick, className = '', style, activeCategoryFields = [], hiddenCategoryKeys = [], categoryAssignments = {} }) {
  const temporal = temporalPresentation(event);
  const pointPrecision = pointDatePrecision(event);
  const memberships = visibleCategoryMemberships(event, activeCategoryFields, hiddenCategoryKeys);
  const primaryMembership = memberships[0] || null;
  const hiddenMembershipCount = Math.max(0, memberships.length - 3);
  const displayedMemberships = memberships.slice(0, 3);
  const dateLabel = presentationalDateLabel(event);
  const title = eventTitle(event);
  const primaryStyle = categoryStyleForMembership(primaryMembership, categoryAssignments);

  return (
    <button
      type="button"
      onClick={() => onEventClick?.(event)}
      aria-label={`${event.temporalRole || 'Time'}: ${title}, ${dateLabel}${temporal.label ? `, ${temporal.label}` : ''}${pointPrecision ? `, ${pointPrecision.label}; ${pointPrecision.detail}` : ''}`}
      className={`peridot-timeline-event-card group relative z-10 w-[182px] rounded-xl border bg-[color-mix(in_srgb,var(--peridot-role-interface-panel-background-strong)_91%,transparent)] px-2.5 py-2 text-left text-[var(--peridot-color-hex-f5ecd2)] shadow-[0_8px_20px_var(--peridot-color-rgba-rgba-0-0-0-0-24)] backdrop-blur-[1px] transition hover:-translate-y-0.5 hover:border-[var(--peridot-role-ornament-line)] focus:outline-none focus:ring-2 focus:ring-[var(--peridot-role-interface-focus-ring)] ${temporal.tone === 'approximate' || temporal.tone === 'partial' ? 'border-dashed border-[var(--peridot-color-hex-dfe9c8-a55)]' : 'border-[var(--peridot-color-hex-dfe9c8-a35)]'} ${className}`}
      style={style}
    >
      <span className="flex min-w-0 items-start gap-2">
        {primaryMembership ? (
          <span className="mt-0.5 shrink-0 rounded-full p-[1px]" style={{ boxShadow: `0 0 0 1px ${hexToRgba(primaryStyle.color, 0.6)}` }}>
            <CategoryMarker membership={primaryMembership} assignments={categoryAssignments} />
          </span>
        ) : null}
        <span className="min-w-0 flex-1">
          <span className="flex min-w-0 items-center gap-1.5">
            <span className="peridot-timeline-event-role min-w-0 flex-1 truncate text-[10px] font-extrabold uppercase tracking-[0.13em] text-[var(--peridot-color-hex-dfe9c8)]">
              {event.temporalRole || 'Time'}
            </span>
            {pointPrecision && pointPrecision.tone !== 'day' ? (
              <span
                className="shrink-0 rounded-full border border-[var(--peridot-role-ornament-line)] border-dashed px-1.5 py-0.5 text-[8px] font-extrabold uppercase tracking-[0.04em] text-[var(--peridot-color-hex-f5ecd2)]"
                title={pointPrecision.detail}
              >
                {pointPrecision.label}
              </span>
            ) : null}
            {temporal.label ? (
              <span className="shrink-0 rounded-full border border-[var(--peridot-color-hex-dfe9c8-a30)] bg-[var(--peridot-color-hex-dfe9c8-a08)] px-1.5 py-0.5 text-[8px] font-extrabold uppercase tracking-[0.09em] text-[var(--peridot-color-hex-dfe9c8)]">
                {temporal.label}
              </span>
            ) : null}
          </span>
          <span className="mt-0.5 block truncate text-[13px] font-bold" title={title}>{title}</span>
          <span className="peridot-timeline-event-date mt-1 block truncate text-[11px] text-[var(--peridot-color-hex-dfe9c8)]" title={dateLabel}>
            {dateLabel}
          </span>
        </span>
      </span>
      {activeCategoryFields.length && memberships.length > 1 ? (
        <span className="mt-2 flex min-h-[14px] flex-wrap items-center gap-1" aria-label="Timeline categories">
          {displayedMemberships.slice(1).map((membership) => (
            <CategoryMarker
              key={`${membership.fieldKey}::${membership.value}::${membership.id}`}
              membership={membership}
              assignments={categoryAssignments}
            />
          ))}
          {hiddenMembershipCount ? (
            <span className="peridot-timeline-event-overflow ml-0.5 text-[9px] font-bold text-[var(--peridot-color-hex-dfe9c8)]" title={`${hiddenMembershipCount} additional visible categories`}>
              +{hiddenMembershipCount}
            </span>
          ) : null}
        </span>
      ) : null}
    </button>
  );
}

function PeriodEventCard({ event, onEventClick, className = '', style, activeCategoryFields = [], hiddenCategoryKeys = [], categoryAssignments = {} }) {
  const temporal = temporalPresentation(event);
  const memberships = visibleCategoryMemberships(event, activeCategoryFields, hiddenCategoryKeys);
  const primaryMembership = memberships[0] || null;
  const primaryStyle = categoryStyleForMembership(primaryMembership, categoryAssignments);
  const dateLabel = presentationalDateLabel(event);
  const title = eventTitle(event);
  return (
    <button
      type="button"
      onClick={() => onEventClick?.(event)}
      aria-label={`${event.temporalRole || 'Period'}: ${title}, ${dateLabel}${temporal.label ? `, ${temporal.label}` : ''}`}
      className={`peridot-timeline-period-card group relative z-10 w-[194px] rounded-xl border bg-[color-mix(in_srgb,var(--peridot-role-interface-panel-background-strong)_90%,transparent)] px-3 py-2 text-left text-[var(--peridot-color-hex-f5ecd2)] shadow-[0_8px_20px_var(--peridot-color-rgba-rgba-0-0-0-0-18)] backdrop-blur-[1px] transition hover:-translate-y-0.5 hover:border-[var(--peridot-role-ornament-line)] focus:outline-none focus:ring-2 focus:ring-[var(--peridot-role-interface-focus-ring)] ${temporal.tone === 'approximate' || temporal.tone === 'partial' ? 'border-dashed border-[var(--peridot-color-hex-dfe9c8-a55)]' : 'border-[var(--peridot-color-hex-dfe9c8-a35)]'} ${className}`}
      style={style}
    >
      <span className="pointer-events-none absolute inset-x-3 top-0 h-[3px] rounded-b-full" style={{ background: hexToRgba(primaryStyle.color, 0.9) }} />
      <span className="flex items-start gap-2">
        {primaryMembership ? <CategoryMarker membership={primaryMembership} assignments={categoryAssignments} /> : null}
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-1.5">
            <span className="truncate text-[10px] font-extrabold uppercase tracking-[0.13em] text-[var(--peridot-color-hex-dfe9c8)]">
              {event.temporalRole || 'Period'}
            </span>
            {temporal.label ? (
              <span className="shrink-0 rounded-full border border-[var(--peridot-color-hex-dfe9c8-a30)] bg-[var(--peridot-color-hex-dfe9c8-a08)] px-1.5 py-0.5 text-[8px] font-extrabold uppercase tracking-[0.09em] text-[var(--peridot-color-hex-dfe9c8)]">
                {temporal.label}
              </span>
            ) : null}
          </span>
          <span className="mt-0.5 block truncate text-[13px] font-bold" title={title}>{title}</span>
          <span className="mt-1 block truncate text-[11px] text-[var(--peridot-color-hex-dfe9c8)]" title={dateLabel}>{dateLabel}</span>
        </span>
      </span>
    </button>
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
  return year + calendarFraction(year, month, day);
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

function buildConnectionLayoutHints(positioned, connections = []) {
  const byId = new Map(positioned.map((item) => [item.event.id, item]));
  const adjacency = new Map();

  const addNeighbor = (from, to) => {
    if (!byId.has(from) || !byId.has(to) || from === to) return;
    if (!adjacency.has(from)) adjacency.set(from, new Set());
    adjacency.get(from).add(to);
  };

  asArray(connections).forEach((connection) => {
    addNeighbor(connection?.sourceEventId, connection?.targetEventId);
    addNeighbor(connection?.targetEventId, connection?.sourceEventId);
  });

  const hints = new Map();
  const visited = new Set();
  let componentIndex = 0;

  positioned.forEach((item) => {
    const rootId = item.event.id;
    if (visited.has(rootId) || !adjacency.has(rootId)) return;

    const componentIds = [];
    const stack = [rootId];
    visited.add(rootId);
    while (stack.length) {
      const current = stack.pop();
      componentIds.push(current);
      Array.from(adjacency.get(current) || [])
        .sort((a, b) => String(a).localeCompare(String(b)))
        .forEach((neighbor) => {
          if (visited.has(neighbor)) return;
          visited.add(neighbor);
          stack.push(neighbor);
        });
    }

    componentIds.sort((a, b) => (
      (byId.get(a)?.start ?? 0) - (byId.get(b)?.start ?? 0)
      || String(a).localeCompare(String(b))
    ));

    componentIds.forEach((eventId, order) => {
      hints.set(eventId, {
        connected: true,
        componentIndex,
        componentSize: componentIds.length,
        componentOrder: order,
        degree: adjacency.get(eventId)?.size || 0,
      });
    });
    componentIndex += 1;
  });

  return { hints, adjacency };
}

// Deterministic FNV-style hash used solely for Timeline layout stability.
// The category palette uses separately assigned visual slots.
function hashText(value) {
  const text = String(value ?? '');
  let hash = 2166136261;
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function deterministicUnit(eventId = '') {
  return (hashText(eventId) % 10000) / 9999;
}

function assignContinuousSecondaryPositions(items, connections, {
  orientation,
  secondaryStart,
  secondaryEnd,
  cardSecondarySize,
  cardTemporalSize,
}) {
  if (!items.length) return [];
  const { hints, adjacency } = buildConnectionLayoutHints(items, connections);
  const range = Math.max(1, secondaryEnd - secondaryStart - cardSecondarySize);
  const byId = new Map(items.map((item) => [item.event.id, item]));
  const secondary = new Map();
  const velocity = new Map();
  const anchors = new Map();

  const temporalCenter = (item) => orientation === 'horizontal' ? item.x : item.y;
  const temporalOverlap = (a, b) => Math.abs(temporalCenter(a) - temporalCenter(b)) < cardTemporalSize + 28;

  items.forEach((item) => {
    const hint = hints.get(item.event.id);
    let unit = deterministicUnit(item.event.id);
    if (hint) {
      // Spread connected components through the full secondary dimension, then
      // give members of a component their own deterministic neighborhood.
      const componentBand = ((hint.componentIndex * 0.61803398875) % 1);
      const memberOffset = hint.componentSize > 1
        ? (hint.componentOrder / Math.max(1, hint.componentSize - 1) - 0.5) * 0.34
        : 0;
      unit = (componentBand + memberOffset + 1) % 1;
    }
    const initial = secondaryStart + unit * range;
    secondary.set(item.event.id, initial);
    anchors.set(item.event.id, initial);
    velocity.set(item.event.id, 0);
  });

  const iterations = 72;
  for (let iteration = 0; iteration < iterations; iteration += 1) {
    const forces = new Map(items.map((item) => [item.event.id, 0]));

    // Relationship attraction acts only on the free/secondary dimension. The
    // chronological coordinate remains immutable.
    asArray(connections).forEach((connection) => {
      const source = byId.get(connection?.sourceEventId);
      const target = byId.get(connection?.targetEventId);
      if (!source || !target || source.event.id === target.event.id) return;
      const sourcePos = secondary.get(source.event.id);
      const targetPos = secondary.get(target.event.id);
      const delta = targetPos - sourcePos;
      const pull = delta * 0.018;
      forces.set(source.event.id, forces.get(source.event.id) + pull);
      forces.set(target.event.id, forces.get(target.event.id) - pull);
    });

    // Only events that can visually collide in chronological space repel one
    // another. This lets sparse dates use the same x/y region while forcing
    // crowded dates apart across the available viewport dimension.
    for (let i = 0; i < items.length; i += 1) {
      const a = items[i];
      for (let j = i + 1; j < items.length; j += 1) {
        const b = items[j];
        if (!temporalOverlap(a, b)) continue;
        const aPos = secondary.get(a.event.id);
        const bPos = secondary.get(b.event.id);
        const delta = bPos - aPos;
        const minimumGap = cardSecondarySize + 22;
        if (Math.abs(delta) >= minimumGap) continue;
        const direction = delta === 0
          ? (hashText(a.event.id) < hashText(b.event.id) ? 1 : -1)
          : Math.sign(delta);
        const push = (minimumGap - Math.abs(delta)) * 0.17;
        forces.set(a.event.id, forces.get(a.event.id) - direction * push);
        forces.set(b.event.id, forces.get(b.event.id) + direction * push);
      }
    }

    items.forEach((item) => {
      const id = item.event.id;
      const current = secondary.get(id);
      const anchor = anchors.get(id);
      const anchorPull = (anchor - current) * 0.012;
      const nextVelocity = (velocity.get(id) * 0.72) + forces.get(id) + anchorPull;
      velocity.set(id, nextVelocity);
      secondary.set(id, clamp(current + nextVelocity, secondaryStart, secondaryEnd - cardSecondarySize));
    });
  }

  // Deterministic final collision cleanup. This is intentionally stronger than
  // the force pass so cards never remain stacked merely because chronology is
  // dense at a particular date.
  for (let pass = 0; pass < 12; pass += 1) {
    let moved = false;
    for (let i = 0; i < items.length; i += 1) {
      const a = items[i];
      for (let j = i + 1; j < items.length; j += 1) {
        const b = items[j];
        if (!temporalOverlap(a, b)) continue;
        let aPos = secondary.get(a.event.id);
        let bPos = secondary.get(b.event.id);
        const minimumGap = cardSecondarySize + 18;
        const delta = bPos - aPos;
        if (Math.abs(delta) >= minimumGap) continue;
        const direction = delta === 0
          ? (hashText(a.event.id) < hashText(b.event.id) ? 1 : -1)
          : Math.sign(delta);
        const shift = (minimumGap - Math.abs(delta)) / 2 + 1;
        aPos = clamp(aPos - direction * shift, secondaryStart, secondaryEnd - cardSecondarySize);
        bPos = clamp(bPos + direction * shift, secondaryStart, secondaryEnd - cardSecondarySize);
        secondary.set(a.event.id, aPos);
        secondary.set(b.event.id, bPos);
        moved = true;
      }
    }
    if (!moved) break;
  }

  return items.map((item) => {
    const position = secondary.get(item.event.id);
    return orientation === 'horizontal'
      ? { ...item, top: position, connectionLayout: hints.get(item.event.id) || null }
      : { ...item, left: position, connectionLayout: hints.get(item.event.id) || null };
  });
}

// Event-card packing is a presentation-only projection. Calendar coordinates are
// never altered: simultaneous events share an x/y position and occupy separate
// orthogonal lanes. Unlike force relaxation, this final pass does not leave
// cards colliding when a dense time cluster exceeds the viewport height.
function packTimelineCardLanes(items, orientation, {
  secondaryStart,
  temporalSize,
  secondarySize,
  gap = 14,
}) {
  const horizontal = orientation === 'horizontal';
  const temporalKey = horizontal ? 'x' : 'y';
  const ordered = [...items].sort((a, b) =>
    a[temporalKey] - b[temporalKey] || String(a.event.id).localeCompare(String(b.event.id))
  );
  const laneEnds = [];
  const positions = new Map();
  ordered.forEach((item) => {
    const start = item[temporalKey];
    let lane = laneEnds.findIndex((end) => end + gap <= start);
    if (lane < 0) lane = laneEnds.length;
    laneEnds[lane] = start + temporalSize;
    positions.set(item.event.id, secondaryStart + lane * (secondarySize + gap));
  });
  return {
    items: items.map((item) => ({ ...item, [horizontal ? 'top' : 'left']: positions.get(item.event.id) })),
    requiredSecondaryEnd: secondaryStart + laneEnds.length * (secondarySize + gap) + 96,
    laneCount: laneEnds.length,
  };
}

function buildHorizontalGeometry(positioned, viewportSize = { width: 0, height: 0 }, zoom = 1, connections = []) {
  if (!positioned.length) {
    return { items: [], minYear: null, maxYear: null, width: 0, height: 0, ticks: [] };
  }

  const viewportWidth = Math.max(0, Number(viewportSize?.width) || 0);
  const viewportHeight = Math.max(0, Number(viewportSize?.height) || 0);
  const minYear = Math.floor(Math.min(...positioned.map((item) => item.start)));
  const maxYear = Math.ceil(Math.max(...positioned.map((item) => item.end)));
  const span = Math.max(1, maxYear - minYear);
  const basePixelsPerYear = span <= 10 ? 150 : span <= 30 ? 96 : span <= 100 ? 58 : 30;
  const pixelsPerYear = basePixelsPerYear * zoom;
  const leadingPadding = 110;
  const trailingPadding = Math.max(160, viewportWidth - 96);
  const temporalExtent = span * pixelsPerYear;
  const width = Math.max(1200, leadingPadding + temporalExtent + trailingPadding);
  const axisY = 66;
  const cardHeight = 68;
  const secondaryStart = axisY + 72;
  const desiredSecondaryExtent = Math.min(2200, 520 + Math.sqrt(positioned.length) * 92);
  const height = Math.max(viewportHeight || 0, 760, desiredSecondaryExtent);
  const secondaryEnd = height - 76;

  const xFor = (scalar) => leadingPadding + (scalar - minYear) * pixelsPerYear;
  const baseItems = positioned.map((item) => ({
    ...item,
    x: xFor(item.start),
    endX: xFor(item.end),
  }));
  // Exact calendar x coordinates remain fixed. Pack close dates into distinct
  // vertical lanes, growing the scrollable stage rather than overlapping cards.
  const packing = packTimelineCardLanes(baseItems, 'horizontal', {
    secondaryStart,
    temporalSize: 210,
    secondarySize: 110,
  });
  const items = packing.items;
  const packedHeight = Math.max(height, packing.requiredSecondaryEnd);

  const ticks = buildTemporalTicks(minYear, maxYear, pixelsPerYear).map((tick) => ({ ...tick, x: xFor(tick.scalar) }));

  return {
    items,
    minYear,
    maxYear,
    width,
    height: packedHeight,
    axisY,
    ticks,
    leadingPadding,
    trailingPadding,
    temporalExtent,
  };
}

function buildVerticalGeometry(positioned, viewportSize = { width: 0, height: 0 }, zoom = 1, connections = []) {
  if (!positioned.length) {
    return { items: [], minYear: null, maxYear: null, width: 0, height: 0, ticks: [] };
  }

  const viewportWidth = Math.max(0, Number(viewportSize?.width) || 0);
  const viewportHeight = Math.max(0, Number(viewportSize?.height) || 0);
  const minYear = Math.floor(Math.min(...positioned.map((item) => item.start)));
  const maxYear = Math.ceil(Math.max(...positioned.map((item) => item.end)));
  const span = Math.max(1, maxYear - minYear);
  const basePixelsPerYear = span <= 10 ? 130 : span <= 30 ? 86 : span <= 100 ? 52 : 28;
  const pixelsPerYear = basePixelsPerYear * zoom;
  const leadingPadding = Math.max(110, viewportHeight - 112);
  const trailingPadding = 150;
  const temporalExtent = span * pixelsPerYear;
  const height = Math.max(1000, leadingPadding + temporalExtent + trailingPadding);
  const axisX = 92;
  const cardWidth = 210;
  const secondaryStart = axisX + 88;
  const desiredSecondaryExtent = Math.min(2800, 760 + Math.sqrt(positioned.length) * 118);
  const width = Math.max(viewportWidth || 0, 1200, desiredSecondaryExtent);
  const secondaryEnd = width - 90;

  const yFor = (scalar) => leadingPadding + (maxYear - scalar) * pixelsPerYear;
  const baseItems = positioned.map((item) => ({
    ...item,
    y: yFor(item.start),
    endY: yFor(item.end),
  }));
  const packing = packTimelineCardLanes(baseItems, 'vertical', {
    secondaryStart,
    temporalSize: 110,
    secondarySize: cardWidth,
  });
  const items = packing.items;
  const packedWidth = Math.max(width, packing.requiredSecondaryEnd);

  const ticks = buildTemporalTicks(minYear, maxYear, pixelsPerYear).map((tick) => ({ ...tick, y: yFor(tick.scalar) }));

  return {
    items,
    minYear,
    maxYear,
    width: packedWidth,
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
    <div className="peridot-timeline-orientation flex rounded-full border border-[var(--peridot-color-hex-dfe9c8-a35)] bg-[color-mix(in_srgb,var(--peridot-role-interface-panel-background-strong)_94%,transparent)] p-1 shadow-[0_8px_20px_var(--peridot-color-rgba-rgba-0-0-0-0-28)]" aria-label="Timeline orientation">
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
    <div className="peridot-timeline-zoom flex items-center rounded-full border border-[var(--peridot-color-hex-dfe9c8-a35)] bg-[color-mix(in_srgb,var(--peridot-role-interface-panel-background-strong)_94%,transparent)] p-1 shadow-[0_8px_20px_var(--peridot-color-rgba-rgba-0-0-0-0-28)]" aria-label="Timeline zoom">
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

function connectionLabel(connection) {
  const relationship = String(connection?.relationshipLabel || connection?.relationshipType || 'Mapped relationship').trim();
  const connector = connection?.direction === 'directed' ? '→' : '—';
  return `${connection?.source || 'Source'} ${connector} ${connection?.target || 'Target'} · ${relationship}`;
}

function TimelineConnectionLayer({ geometry, connections = [], orientation, selectedEventId = '', renderWindow }) {
  if (!connections.length || !geometry?.items?.length) return null;
  const itemById = new Map(geometry.items.map((item) => [item.event.id, item]));
  const renderedItemIds = new Set(
    (orientation === 'vertical'
      ? visibleVerticalItems(geometry.items, renderWindow, 680)
      : visibleHorizontalItems(geometry.items, renderWindow, 680))
      .map((item) => item.event.id),
  );
  const visibleConnections = connections.filter((connection) => (
    itemById.has(connection.sourceEventId)
    && itemById.has(connection.targetEventId)
    && (renderedItemIds.has(connection.sourceEventId) || renderedItemIds.has(connection.targetEventId))
  ));
  if (!visibleConnections.length) return null;

  const arrowId = orientation === 'vertical' ? 'peridot-timeline-arrow-v' : 'peridot-timeline-arrow-h';

  return (
    <svg
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-[4] overflow-visible"
      width={geometry.width}
      height={geometry.height}
      viewBox={`0 0 ${geometry.width} ${geometry.height}`}
    >
      <defs>
        <marker id={arrowId} markerWidth="8" markerHeight="8" refX="6.5" refY="4" orient="auto" markerUnits="strokeWidth">
          <path d="M 0 0 L 8 4 L 0 8 z" fill="var(--map-edge)" />
        </marker>
      </defs>
      {visibleConnections.map((connection) => {
        const sourceItem = itemById.get(connection.sourceEventId);
        const targetItem = itemById.get(connection.targetEventId);
        if (!sourceItem || !targetItem) return null;

        let path = '';
        let sourceAnchorX = 0;
        let sourceAnchorY = 0;
        let targetAnchorX = 0;
        let targetAnchorY = 0;
        if (orientation === 'vertical') {
          const cardWidth = 210;
          const cardHeight = 68;
          const sourceTop = sourceItem.y - 16;
          const targetTop = targetItem.y - 16;
          const sourceCenterX = sourceItem.left + cardWidth / 2;
          const targetCenterX = targetItem.left + cardWidth / 2;
          const targetBelowSource = targetItem.y >= sourceItem.y;
          const y1 = targetBelowSource ? sourceTop + cardHeight : sourceTop;
          const y2 = targetBelowSource ? targetTop : targetTop + cardHeight;
          const direction = targetBelowSource ? 1 : -1;
          const separation = Math.abs(y2 - y1);
          const bend = Math.max(48, Math.min(180, separation * 0.34));
          sourceAnchorX = sourceCenterX;
          sourceAnchorY = y1;
          targetAnchorX = targetCenterX;
          targetAnchorY = y2;
          path = `M ${sourceCenterX} ${y1} C ${sourceCenterX} ${y1 + direction * bend}, ${targetCenterX} ${y2 - direction * bend}, ${targetCenterX} ${y2}`;
        } else {
          const cardWidth = 210;
          const cardLeftOffset = -12; // EventCard uses -translate-x-3.
          const sourceLeft = sourceItem.x + cardLeftOffset;
          const targetLeft = targetItem.x + cardLeftOffset;
          const sourceCenterY = sourceItem.top + 34;
          const targetCenterY = targetItem.top + 34;
          const targetRightOfSource = targetItem.x >= sourceItem.x;
          const x1 = targetRightOfSource ? sourceLeft + cardWidth : sourceLeft;
          const x2 = targetRightOfSource ? targetLeft : targetLeft + cardWidth;
          const direction = targetRightOfSource ? 1 : -1;
          const separation = Math.abs(x2 - x1);
          const bend = Math.max(54, Math.min(190, separation * 0.36));
          sourceAnchorX = x1;
          sourceAnchorY = sourceCenterY;
          targetAnchorX = x2;
          targetAnchorY = targetCenterY;
          path = `M ${x1} ${sourceCenterY} C ${x1 + direction * bend} ${sourceCenterY}, ${x2 - direction * bend} ${targetCenterY}, ${x2} ${targetCenterY}`;
        }

        const selected = selectedEventId
          && (connection.sourceEventId === selectedEventId || connection.targetEventId === selectedEventId);
        const unrelatedWhileSelected = selectedEventId && !selected;
        const structural = connection.temporalGrounding === 'structural';
        const opacity = selected ? 0.96 : unrelatedWhileSelected ? 0.16 : 0.7;
        const width = selected ? 3.2 : 2.15;
        const stroke = selected ? 'var(--map-edge-selected)' : 'var(--map-edge)';

        return (
          <g key={connection.id} opacity={opacity}>
            <path
              d={path}
              fill="none"
              stroke={stroke}
              strokeWidth={width}
              strokeDasharray={structural ? '7 6' : undefined}
              strokeLinecap="round"
              markerEnd={connection.direction === 'directed' ? `url(#${arrowId})` : undefined}
            >
              <title>{connectionLabel(connection)}</title>
            </path>
            <circle cx={sourceAnchorX} cy={sourceAnchorY} r={selected ? 4.5 : 3.5} fill={stroke} stroke="var(--peridot-color-hex-f5ecd2)" strokeWidth="1.5" />
            <circle cx={targetAnchorX} cy={targetAnchorY} r={selected ? 4.5 : 3.5} fill={stroke} stroke="var(--peridot-color-hex-f5ecd2)" strokeWidth="1.5" />
          </g>
        );
      })}
    </svg>
  );
}

function EventCard({ event, onEventClick, className = '', style, activeCategoryFields = [], hiddenCategoryKeys = [], categoryAssignments = {} }) {
  const isInterval = event?.temporalKind === 'interval' || event?.temporalKind === 'openInterval';
  if (isInterval) {
    return <PeriodEventCard event={event} onEventClick={onEventClick} className={className} style={style} activeCategoryFields={activeCategoryFields} hiddenCategoryKeys={hiddenCategoryKeys} categoryAssignments={categoryAssignments} />;
  }
  return <PointEventCard event={event} onEventClick={onEventClick} className={className} style={style} activeCategoryFields={activeCategoryFields} hiddenCategoryKeys={hiddenCategoryKeys} categoryAssignments={categoryAssignments} />;
}

function IntervalSpanHorizontal({ event, width, color = '#6B7F6B' }) {
  const temporal = temporalPresentation(event);
  const dashed = temporal.tone === 'approximate' || temporal.tone === 'partial';
  const openStart = event?.boundedness === 'openStart';
  const openEnd = event?.boundedness === 'openEnd' || event?.boundedness === 'ongoing';
  return (
    <div aria-hidden="true" className="absolute left-0 top-[36px] z-0" style={{ width }}>
      <div
        className={`relative h-[12px] rounded-full border ${dashed ? 'border-dashed' : ''}`}
        style={{
          borderColor: hexToRgba(color, dashed ? 0.7 : 0.55),
          background: `linear-gradient(90deg, ${hexToRgba(color, 0.14)}, ${hexToRgba(color, 0.28)}, ${hexToRgba(color, 0.14)})`,
          boxShadow: `inset 0 0 0 1px ${hexToRgba('#ffffff', 0.35)}`,
        }}
      >
        <span className="absolute -left-[3px] top-1/2 h-3 w-3 -translate-y-1/2 rounded-full border border-white" style={{ background: hexToRgba(color, 0.95) }} />
        <span className="absolute -right-[3px] top-1/2 h-3 w-3 -translate-y-1/2 rounded-full border border-white" style={{ background: openEnd ? '#F5ECD2' : hexToRgba(color, 0.95), borderStyle: openEnd ? 'dashed' : 'solid', borderColor: openEnd ? color : '#fff' }} />
      </div>
      {openStart ? <span className="absolute -left-3 -top-[8px] text-lg font-bold" style={{ color }}>‹</span> : null}
      {openEnd ? <span className="absolute -right-3 -top-[8px] text-lg font-bold" style={{ color }}>›</span> : null}
    </div>
  );
}

function IntervalSpanVertical({ event, top, height, color = '#6B7F6B' }) {
  const temporal = temporalPresentation(event);
  const dashed = temporal.tone === 'approximate' || temporal.tone === 'partial';
  const openStart = event?.boundedness === 'openStart';
  const openEnd = event?.boundedness === 'openEnd' || event?.boundedness === 'ongoing';
  return (
    <div aria-hidden="true" className="absolute left-[96px] z-0" style={{ top, height }}>
      <div
        className={`relative h-full w-[12px] rounded-full border ${dashed ? 'border-dashed' : ''}`}
        style={{
          borderColor: hexToRgba(color, dashed ? 0.7 : 0.55),
          background: `linear-gradient(180deg, ${hexToRgba(color, 0.14)}, ${hexToRgba(color, 0.28)}, ${hexToRgba(color, 0.14)})`,
          boxShadow: `inset 0 0 0 1px ${hexToRgba('#ffffff', 0.35)}`,
        }}
      >
        <span className="absolute -left-[1px] -top-[3px] h-3 w-3 rounded-full border border-white" style={{ background: openEnd ? '#F5ECD2' : hexToRgba(color, 0.95), borderStyle: openEnd ? 'dashed' : 'solid', borderColor: openEnd ? color : '#fff' }} />
        <span className="absolute -left-[1px] -bottom-[3px] h-3 w-3 rounded-full border border-white" style={{ background: hexToRgba(color, 0.95) }} />
      </div>
      {openEnd ? <span className="absolute -left-[4px] -top-3 text-lg font-bold" style={{ color }}>⌃</span> : null}
      {openStart ? <span className="absolute -bottom-3 -left-[4px] text-lg font-bold" style={{ color }}>⌄</span> : null}
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

function HorizontalTimeline({ geometry, onEventClick, activeCategoryFields, hiddenCategoryKeys, categoryAssignments, renderWindow, connections = [], selectedEventId = '' }) {
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

      {connections.length ? (
        <TimelineConnectionLayer geometry={geometry} connections={connections} orientation="horizontal" selectedEventId={selectedEventId} renderWindow={renderWindow} />
      ) : null}

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
        const pointPrecision = pointDatePrecision(event);
        const primaryMembership = primaryVisibleMembership(event, activeCategoryFields, hiddenCategoryKeys);
        const primaryStyle = categoryStyleForMembership(primaryMembership, categoryAssignments);
        return (
          <div key={event.id} className="absolute" style={{ left: x, top }}>
            {/* The chronology guide is at x, never at a collision-offset card position. */}
            <div aria-hidden="true" className="pointer-events-none absolute z-[2] w-px" style={{ left: 0, top: geometry.axisY - top, height: Math.max(0, top - geometry.axisY + 14), background: event.id === selectedEventId ? '#7C211E' : 'rgba(61,49,42,.33)' }} />
            <div aria-hidden="true" className="pointer-events-none absolute z-[5] h-3 w-3 -translate-x-1/2 rounded-full border border-white" style={{ left: 0, top: geometry.axisY - top - 6, background: pointPrecision?.tone === 'day' || !pointPrecision ? (event.id === selectedEventId ? '#7C211E' : primaryStyle.color) : '#F5ECD2', borderStyle: pointPrecision && pointPrecision.tone !== 'day' ? 'dashed' : 'solid', borderColor: pointPrecision && pointPrecision.tone !== 'day' ? primaryStyle.color : '#fff', boxShadow: `0 0 0 2px ${hexToRgba('#253C32', 0.08)}` }} />
            {isInterval ? (
              <IntervalSpanHorizontal event={event} width={intervalWidth} color={primaryStyle.color} />
            ) : null}
            <EventCard event={event} onEventClick={onEventClick} className={isInterval ? 'translate-x-2' : '-translate-x-2'} activeCategoryFields={activeCategoryFields} hiddenCategoryKeys={hiddenCategoryKeys} categoryAssignments={categoryAssignments} />
          </div>
        );
      })}
    </div>
  );
}

function VerticalTimeline({ geometry, onEventClick, activeCategoryFields, hiddenCategoryKeys, categoryAssignments, renderWindow, connections = [], selectedEventId = '' }) {
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

      {connections.length ? (
        <TimelineConnectionLayer geometry={geometry} connections={connections} orientation="vertical" selectedEventId={selectedEventId} renderWindow={renderWindow} />
      ) : null}

      {renderedTicks.map((tick) => (
        <div key={tick.key} className="absolute left-0" style={{ top: tick.y }}>
          <div
            className={`absolute left-[68px] h-px bg-[color-mix(in_srgb,var(--peridot-role-interface-panel-background-strong)_18%,transparent)] ${tick.major ? '' : 'opacity-45'}`}
            style={{ width: Math.max(0, geometry.width - 96) }}
          />
          <div className={`absolute left-[80px] -top-3 w-6 border-l border-[var(--peridot-role-ornament-line)] ${tick.major ? 'h-6' : 'h-4 opacity-75'}`} />
          {/* The fixed vertical ruler owns date labels; this layer retains only
              calendar gridlines in the scrolling research canvas. */}
        </div>
      ))}

      {renderedItems.map(({ event, y, endY, left }) => {
        const isInterval = event.temporalKind === 'interval' || event.temporalKind === 'openInterval';
        const intervalTop = Math.min(y, endY);
        const intervalHeight = Math.max(18, Math.abs(y - endY));
        const pointPrecision = pointDatePrecision(event);
        const primaryMembership = primaryVisibleMembership(event, activeCategoryFields, hiddenCategoryKeys);
        const primaryStyle = categoryStyleForMembership(primaryMembership, categoryAssignments);
        return (
          <div key={event.id} className="absolute" style={{ left, top: y - 16 }}>
            {/* In vertical mode, y remains the exact chronology coordinate. */}
            <div aria-hidden="true" className="pointer-events-none absolute z-[2] h-px" style={{ top: 16, left: geometry.axisX - left, width: Math.max(0, left - geometry.axisX), background: event.id === selectedEventId ? '#7C211E' : 'rgba(61,49,42,.33)' }} />
            <div aria-hidden="true" className="pointer-events-none absolute z-[5] h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white" style={{ top: 16, left: geometry.axisX - left, background: pointPrecision?.tone === 'day' || !pointPrecision ? (event.id === selectedEventId ? '#7C211E' : primaryStyle.color) : '#F5ECD2', borderStyle: pointPrecision && pointPrecision.tone !== 'day' ? 'dashed' : 'solid', borderColor: pointPrecision && pointPrecision.tone !== 'day' ? primaryStyle.color : '#fff', boxShadow: `0 0 0 2px ${hexToRgba('#253C32', 0.08)}` }} />
            {isInterval ? (
              <IntervalSpanVertical event={event} top={intervalTop - y + 16} height={intervalHeight} color={primaryStyle.color} />
            ) : null}
            <EventCard event={event} onEventClick={onEventClick} activeCategoryFields={activeCategoryFields} hiddenCategoryKeys={hiddenCategoryKeys} categoryAssignments={categoryAssignments} className={isInterval ? 'translate-x-2' : ''} />
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
  categoryAssignments,
  onCategorySlotChange,
  onToggleField,
  onToggleValue,
  onToggleUncategorized,
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
        className="peridot-timeline-categories-trigger rounded-full border border-[var(--peridot-color-hex-dfe9c8-a35)] bg-[color-mix(in_srgb,var(--peridot-role-interface-panel-background-strong)_94%,transparent)] px-4 py-2 text-[10px] font-extrabold uppercase tracking-[0.13em] text-[var(--peridot-color-hex-f5ecd2)] shadow-[0_8px_20px_var(--peridot-color-rgba-rgba-0-0-0-0-28)] backdrop-blur-sm transition hover:border-[var(--peridot-role-ornament-line)] focus:outline-none focus:ring-2 focus:ring-[var(--peridot-role-interface-focus-ring)]"
      >
        Categories{activeCount ? ` · ${activeCount}` : ''}
      </button>

      {open ? (
        <div className="peridot-timeline-categories-popover absolute right-0 top-[calc(100%+8px)] flex h-[600px] w-[340px] max-h-[calc(100vh-180px)] max-w-[calc(100vw-48px)] flex-col overflow-hidden rounded-2xl border border-[var(--peridot-color-hex-dfe9c8-a35)] bg-[color-mix(in_srgb,var(--peridot-role-interface-panel-background-strong)_97%,transparent)] text-[var(--peridot-color-hex-f5ecd2)] shadow-[0_18px_42px_var(--peridot-color-rgba-rgba-0-0-0-0-36)] backdrop-blur-md">
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
                            <CategoryMarker membership={{ fieldKey: field.key, fieldLabel: field.label, value: value.value }} assignments={categoryAssignments} />
                            <select
                              aria-label={`Color and symbol for ${value.value}`}
                              title="Choose a color and paired symbol (session only)"
                              value={categoryAssignments[identity] ?? slotForCategory(identity)}
                              onChange={(event) => onCategorySlotChange(identity, Number(event.target.value))}
                              className="max-w-[60px] rounded border border-current bg-transparent px-1 py-0.5 text-[10px]"
                            >
                              {CATEGORY_SLOTS.map(([color, shape], index) => <option key={index} value={index} style={{ color: '#222', background: '#fff' }}>{index + 1} · {shape}</option>)}
                            </select>
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

          <div className="border-t border-[var(--peridot-color-hex-dfe9c8-a18)] px-4 py-2 text-[11px] text-[var(--peridot-color-hex-dfe9c8)]">
            Colors and shapes are always paired. The first 12 categories receive unique shuffled slots; additional categories reuse slots. Changes last for this browser session only.
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function PeridotTimelineWorkspace({ events = [], relationshipRows = [], selectedEventId = '', onEventClick }) {
  const [orientation, setOrientation] = useState('horizontal');
  const [zoom, setZoom] = useState(DEFAULT_TIMELINE_ZOOM);
  const [viewportSize, setViewportSize] = useState({ width: 0, height: 0 });
  const [renderWindow, setRenderWindow] = useState({ scrollLeft: 0, scrollTop: 0, width: 0, height: 0 });
  const [activeCategoryFields, setActiveCategoryFields] = useState([]);
  const [hiddenCategoryKeys, setHiddenCategoryKeys] = useState([]);
  const [showUncategorized, setShowUncategorized] = useState(true);
  const [categoryAssignments, setCategoryAssignments] = useState(() => Object.fromEntries(sessionCategoryOverrides));
  const [isPanning, setIsPanning] = useState(false);
  const scrollerRef = useRef(null);
  const pendingChronologyFractionRef = useRef(null);
  const pendingZoomAnchorRef = useRef(null);
  const scrollFrameRef = useRef(null);
  const wheelFrameRef = useRef(null);
  const pendingWheelDeltaRef = useRef(0);
  const panStateRef = useRef(null);
  const categoryFields = useMemo(() => buildPeridotTimelineCategoryFields(events), [events]);
  // Allocate new Evidence values only once for the session; manual overrides
  // remain presentation preferences and never modify mapped categories.
  const allocatedCategoryAssignments = useMemo(() => {
    const current = {};
    categoryFields.forEach((field) => field.values.forEach((value) => {
      const identity = categoryIdentity(field.key, value.value);
      current[identity] = categoryAssignments[identity] ?? slotForCategory(identity);
    }));
    return current;
  }, [categoryFields, categoryAssignments]);
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
  const timelineConnections = useMemo(
    () => buildPeridotTimelineConnections(filteredEvents, relationshipRows),
    [filteredEvents, relationshipRows],
  );
  const positioned = useMemo(() => positionedTimelineEvents(filteredEvents), [filteredEvents]);
  const horizontalGeometry = useMemo(
    () => buildHorizontalGeometry(positioned, viewportSize, zoom, timelineConnections),
    [positioned, viewportSize.width, viewportSize.height, zoom, timelineConnections],
  );
  const verticalGeometry = useMemo(
    () => buildVerticalGeometry(positioned, viewportSize, zoom, timelineConnections),
    [positioned, viewportSize.width, viewportSize.height, zoom, timelineConnections],
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
      <div className="flex min-h-0 flex-1 items-center justify-center p-8 text-center">
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
      className="peridot-map-plate relative flex min-h-0 min-w-0 w-full max-w-full flex-1 overflow-hidden rounded-xl border border-[var(--peridot-color-hex-c4e0ef-a35)] bg-[var(--map-water)]"
      data-peridot-tutorial-anchor="visualization-stage"
    >
      <div
        ref={scrollerRef}
        onPointerDown={handlePanPointerDown}
        onPointerMove={handlePanPointerMove}
        onPointerUp={endPan}
        onPointerCancel={endPan}
        onLostPointerCapture={endPan}
        style={{ top: timelineStageLayout(orientation).scrollerTop, bottom: timelineStageLayout(orientation).scrollerBottom }}
        className={`absolute inset-x-0 min-h-0 min-w-0 overflow-auto bg-[color-mix(in_srgb,var(--peridot-color-hex-dfe9c8)_76%,var(--peridot-color-hex-f5ecd2))] ${isPanning ? 'cursor-grabbing select-none' : 'cursor-grab'}`}
      >
        {!geometry.items.length ? (
          <div className="flex h-full w-full items-center justify-center p-8 text-center">
            <div className="max-w-lg rounded-2xl border border-[var(--peridot-color-hex-dfe9c8-a25)] bg-[color-mix(in_srgb,var(--peridot-role-interface-panel-background-strong)_92%,transparent)] px-6 py-5 text-[var(--peridot-color-hex-f5ecd2)] shadow-[0_12px_30px_var(--peridot-color-rgba-rgba-0-0-0-0-28)]">
              <h2 className="[font-family:Georgia,'Palatino_Linotype','Book_Antiqua',Palatino,serif] text-xl font-bold">No events match the visible categories</h2>
              <p className="mt-2 text-sm leading-relaxed text-[var(--peridot-color-hex-dfe9c8)]">Turn one or more category values back on, or reset Timeline categories.</p>
            </div>
          </div>
        ) : orientation === 'vertical' ? (
          <VerticalTimeline geometry={verticalGeometry} onEventClick={onEventClick} activeCategoryFields={activeCategoryFields} hiddenCategoryKeys={hiddenCategoryKeys} categoryAssignments={allocatedCategoryAssignments} renderWindow={renderWindow} connections={timelineConnections} selectedEventId={selectedEventId} />
        ) : (
          <HorizontalTimeline geometry={horizontalGeometry} onEventClick={onEventClick} activeCategoryFields={activeCategoryFields} hiddenCategoryKeys={hiddenCategoryKeys} categoryAssignments={allocatedCategoryAssignments} renderWindow={renderWindow} connections={timelineConnections} selectedEventId={selectedEventId} />
        )}
      </div>

      {/* Fixed calendar rulers live outside the scrolling canvas. Their tick
          coordinates follow scroll offsets, but event cards cannot pass over
          the ruler. The source temporal coordinates remain unchanged. */}
      {geometry.ticks?.length && (orientation === 'horizontal' ? renderWindow.width : renderWindow.height) ? (
        orientation === 'horizontal' ? (
          <div aria-label="Visible chronological ruler" style={{ bottom: timelineStageLayout(orientation).rulerBottom, height: timelineStageLayout(orientation).rulerHeight }} className="pointer-events-none absolute left-0 right-3 z-[22] overflow-hidden border-t border-[#A68E6B] bg-[#F3E8D5] shadow-sm">
            <div className="absolute inset-x-0 top-[14px] h-px bg-[#897356]" />
            {resolveHorizontalTickLabelCollisions(visibleHorizontalTicks(geometry.ticks, renderWindow, 0)).map((tick) => (
              <div key={tick.key} className="absolute top-0 whitespace-nowrap" style={projectRulerTick(tick, renderWindow, orientation)}>
                <span className="absolute top-[20px] -translate-x-1/2 text-[11px] font-bold text-[#362B26]">{tick.label}</span>
                <span className="absolute top-[3px] h-[11px] w-px bg-[#745E45]" />
              </div>
            ))}
          </div>
        ) : (
          <div aria-label="Visible vertical chronological ruler" style={{ top: timelineStageLayout(orientation).rulerTop, bottom: timelineStageLayout(orientation).rulerBottom, width: timelineStageLayout(orientation).rulerWidth }} className="pointer-events-none absolute left-0 z-[22] overflow-hidden border-r border-[#A68E6B] bg-[#F3E8D5] shadow-sm">
            <div className="absolute top-0 bottom-0 right-[11px] w-px bg-[#897356]" />
            {resolveVerticalTickLabelCollisions(visibleVerticalTicks(geometry.ticks, renderWindow, 0)).map((tick) => (
              <div key={tick.key} className="absolute left-0" style={projectRulerTick(tick, renderWindow, orientation)}>
                <span className="absolute left-2 -translate-y-1/2 whitespace-nowrap text-[11px] font-bold text-[#362B26]">{tick.label}</span>
                <span className="absolute right-[5px] top-0 h-px w-4 bg-[#745E45]" />
              </div>
            ))}
          </div>
        )
      ) : null}

      <div className="pointer-events-none absolute left-3 top-2 z-30 flex flex-row flex-wrap items-start gap-2">
        <div className="peridot-timeline-toolbar-group pointer-events-auto flex items-center gap-3 rounded-full border border-[var(--peridot-color-hex-dfe9c8-a25)] bg-[color-mix(in_srgb,var(--peridot-role-interface-panel-background-strong)_92%,transparent)] px-3 py-1.5 backdrop-blur-sm">
          <div className="shrink-0 text-[10px] font-extrabold uppercase tracking-[0.13em] text-[var(--peridot-color-hex-dfe9c8)]">
            Timeline view
          </div>
          <OrientationControl orientation={orientation} onChange={handleOrientationChange} />
        </div>

        <div className="peridot-timeline-toolbar-group pointer-events-auto flex items-center gap-3 rounded-full border border-[var(--peridot-color-hex-dfe9c8-a25)] bg-[color-mix(in_srgb,var(--peridot-role-interface-panel-background-strong)_92%,transparent)] px-3 py-1.5 backdrop-blur-sm">
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
            categoryAssignments={allocatedCategoryAssignments}
            onToggleField={handleToggleCategoryField}
            onToggleValue={handleToggleCategoryValue}
            onToggleUncategorized={() => setShowUncategorized((value) => !value)}
            onCategorySlotChange={(identity, slot) => { sessionCategoryOverrides.set(identity, slot); setCategoryAssignments((previous) => ({ ...previous, [identity]: slot })); }}
            onReset={handleResetCategories}
          />
        </div>
      </div>
    </div>
  );
}
