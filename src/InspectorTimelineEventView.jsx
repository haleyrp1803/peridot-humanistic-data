/*
 * Timeline-event Inspector view.
 *
 * Timeline selections use the same compact/full Inspector shell as the map and
 * network workspaces. This view keeps the first Timeline implementation
 * visually consistent without forcing a temporal event into person, place,
 * relationship, or linked-record semantics that do not actually apply.
 */

import React from 'react';
import { PeridotRecordStructure } from './PeridotRecordStructure.jsx';

function detailLabelClassName() {
  return '[font-family:Georgia,"Palatino_Linotype","Book_Antiqua",Palatino,serif] text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--detail-label-text)]';
}

function DetailRow({ label, value }) {
  if (!value) return null;
  return (
    <div className="border-b border-[var(--section-border)]/80 py-1.5 last:border-b-0">
      <div className={detailLabelClassName()}>{label}</div>
      <div className="mt-0.5 break-words text-sm text-[var(--text-main)]">{value}</div>
    </div>
  );
}

function asText(value) {
  return String(value ?? '').trim();
}

function eventSubjectLabel(event) {
  const label = asText(event?.subject?.label);
  return label && label !== 'Record' ? label : '';
}

function eventDateLabel(event) {
  return asText(event?.displayLabel || event?.sourceText) || 'Mapped temporal assertion';
}

function eventKindLabel(event) {
  if (event?.temporalKind === 'interval') return 'Interval';
  if (event?.temporalKind === 'openInterval') return 'Open interval';
  return 'Point event';
}

export function InspectorTimelineEventView({
  selectedProps,
  clearSelection,
  onExpandInspector,
  onOpenPersonDetail,
  onOpenPlaceDetail,
  InspectorSummaryCardComponent,
  InspectorClearSelectionButtonComponent,
  isCompact = false,
}) {
  const event = selectedProps?.event || null;
  const row = selectedProps?.row || event?.row || null;
  if (!event || !row) return null;

  const subjectLabel = eventSubjectLabel(event);
  const recordLabel = asText(event?.recordId || event?.rowId);
  const qualifier = asText(event?.qualifier);
  const precision = asText(event?.precision);

  if (isCompact) {
    return (
      <div className="space-y-3">
        <InspectorSummaryCardComponent>
          <DetailRow label="Timeline event" value={event.temporalRole || 'Time'} />
          <DetailRow label="Date or period" value={eventDateLabel(event)} />
          <DetailRow label="Subject" value={subjectLabel} />
          <DetailRow label="Record" value={recordLabel} />
        </InspectorSummaryCardComponent>

        <section className="rounded-2xl border border-[var(--section-border)] bg-[var(--section-bg)] p-3 shadow-[0_8px_24px_var(--peridot-color-rgba-rgba-87-58-46-0-06)]">
          <div className="font-semibold uppercase tracking-[0.16em] text-[var(--panel-card-muted-text)]">At a glance</div>
          <p className="mt-2 text-sm leading-relaxed text-[var(--text-main)]">
            This event is one mapped temporal assertion from the current visualization scope. Expand the Inspector to examine the complete source record.
          </p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <div className="rounded-xl border border-[var(--section-border)]/80 bg-[var(--stat-card-bg)] px-3 py-2">
              <div className="text-sm font-semibold text-[var(--text-strong)]">{eventKindLabel(event)}</div>
              <div className="mt-0.5 text-[11px] text-[var(--text-muted)]">temporal form</div>
            </div>
            <div className="rounded-xl border border-[var(--section-border)]/80 bg-[var(--stat-card-bg)] px-3 py-2">
              <div className="text-sm font-semibold text-[var(--text-strong)]">{precision || qualifier || 'Mapped'}</div>
              <div className="mt-0.5 text-[11px] text-[var(--text-muted)]">date detail</div>
            </div>
          </div>
          {typeof onExpandInspector === 'function' ? (
            <button
              type="button"
              onClick={onExpandInspector}
              className="mt-3 w-full rounded-full border border-[var(--button-border)] bg-[var(--button-bg)] px-3.5 py-2 text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--button-text)] shadow-sm transition hover:border-[var(--button-hover-border)] hover:bg-[var(--button-hover-bg)] hover:text-[var(--button-hover-text)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/45"
            >
              Open full dossier
            </button>
          ) : null}
        </section>

        <InspectorClearSelectionButtonComponent onClear={clearSelection} />
      </div>
    );
  }

  return (
    <article className="space-y-3">
      <InspectorSummaryCardComponent>
        <DetailRow label="Timeline event" value={event.temporalRole || 'Time'} />
        <DetailRow label="Date or period" value={eventDateLabel(event)} />
        <DetailRow label="Subject" value={subjectLabel} />
        <DetailRow label="Temporal form" value={eventKindLabel(event)} />
        <DetailRow label="Precision" value={precision} />
        <DetailRow label="Qualifier" value={qualifier} />
        <DetailRow label="Record" value={recordLabel} />
      </InspectorSummaryCardComponent>

      <div className="peridot-ornament-divider py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--detail-label-text)]">
        Source record
      </div>

      <PeridotRecordStructure
        row={row}
        onOpenPersonDetail={onOpenPersonDetail}
        onOpenPlaceDetail={onOpenPlaceDetail}
      />

      <div className="flex justify-end">
        <InspectorClearSelectionButtonComponent onClear={clearSelection} />
      </div>
    </article>
  );
}
