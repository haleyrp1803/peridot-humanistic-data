/*
 * Timeline-event Inspector view.
 *
 * Timeline selections use the same compact/full Inspector shell as the map and
 * network workspaces. This view keeps the event semantically distinct while
 * surfacing the temporal assertion, its source text, uncertainty, categories,
 * subject, and source-record context.
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

function asArray(value) {
  return Array.isArray(value) ? value : [];
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

function uncertaintyLabel(event) {
  const shape = asText(event?.temporalShape);
  const qualifier = asText(event?.qualifier);
  const precision = asText(event?.precision);
  const boundedness = asText(event?.boundedness);

  if (shape === 'openInterval' || event?.temporalKind === 'openInterval') {
    if (boundedness === 'openStart') return 'Open start';
    if (boundedness === 'ongoing') return 'Ongoing';
    if (boundedness === 'openEnd') return 'Open end';
    return 'Open interval';
  }
  if (shape === 'approximatePoint' || shape === 'approximateInterval' || qualifier === 'circa') return 'Approximate';
  if (shape === 'partialPoint' || shape === 'partialInterval' || precision === 'partial') return 'Partial date';
  if (qualifier === 'uncertain') return 'Uncertain';
  if (shape === 'inconsistent' || event?.consistency === 'backwards') return 'Inconsistent range';
  return 'Exact / bounded';
}

function categoryGroups(event) {
  const groups = new Map();
  asArray(event?.categoryMemberships).forEach((membership) => {
    const fieldLabel = asText(membership?.fieldLabel || membership?.fieldKey) || 'Evidence';
    const value = asText(membership?.value);
    if (!value) return;
    if (!groups.has(fieldLabel)) groups.set(fieldLabel, []);
    if (!groups.get(fieldLabel).includes(value)) groups.get(fieldLabel).push(value);
  });
  return Array.from(groups.entries()).map(([label, values]) => ({ label, values }));
}

function EvidenceCategorySummary({ event }) {
  const groups = categoryGroups(event);
  if (!groups.length) return null;
  return (
    <section className="rounded-2xl border border-[var(--section-border)] bg-[var(--section-bg)] p-3 shadow-[0_8px_24px_var(--peridot-color-rgba-rgba-87-58-46-0-06)]">
      <div className="font-semibold uppercase tracking-[0.16em] text-[var(--panel-card-muted-text)]">Evidence categories</div>
      <div className="mt-2 space-y-2">
        {groups.map((group) => (
          <div key={group.label}>
            <div className={detailLabelClassName()}>{group.label}</div>
            <div className="mt-1 flex flex-wrap gap-1.5">
              {group.values.map((value) => (
                <span
                  key={`${group.label}::${value}`}
                  className="rounded-full border border-[var(--section-border)] bg-[var(--stat-card-bg)] px-2 py-1 text-[11px] text-[var(--text-main)]"
                >
                  {value}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
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
  const sourceText = asText(event?.sourceText);
  const displayText = eventDateLabel(event);
  const sourceDiffers = sourceText && sourceText !== displayText;
  const categoryCount = asArray(event?.categoryMemberships).length;
  const sourceRowValue = event?.sourceRowNumber;
  const sourceRow = sourceRowValue === null || sourceRowValue === undefined || sourceRowValue === ''
    ? null
    : Number(sourceRowValue);

  if (isCompact) {
    return (
      <div className="space-y-3">
        <InspectorSummaryCardComponent>
          <DetailRow label="Timeline event" value={event.temporalRole || 'Time'} />
          <DetailRow label="Date or period" value={displayText} />
          {sourceDiffers ? <DetailRow label="Source date text" value={sourceText} /> : null}
          <DetailRow label="Subject" value={subjectLabel} />
          <DetailRow label="Record" value={recordLabel} />
        </InspectorSummaryCardComponent>

        <section className="rounded-2xl border border-[var(--section-border)] bg-[var(--section-bg)] p-3 shadow-[0_8px_24px_var(--peridot-color-rgba-rgba-87-58-46-0-06)]">
          <div className="font-semibold uppercase tracking-[0.16em] text-[var(--panel-card-muted-text)]">At a glance</div>
          <p className="mt-2 text-sm leading-relaxed text-[var(--text-main)]">
            This event is one mapped temporal assertion from the current visualization scope. Expand the Inspector to examine its temporal metadata and complete source record.
          </p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <div className="rounded-xl border border-[var(--section-border)]/80 bg-[var(--stat-card-bg)] px-3 py-2">
              <div className="text-sm font-semibold text-[var(--text-strong)]">{eventKindLabel(event)}</div>
              <div className="mt-0.5 text-[11px] text-[var(--text-muted)]">temporal form</div>
            </div>
            <div className="rounded-xl border border-[var(--section-border)]/80 bg-[var(--stat-card-bg)] px-3 py-2">
              <div className="text-sm font-semibold text-[var(--text-strong)]">{uncertaintyLabel(event)}</div>
              <div className="mt-0.5 text-[11px] text-[var(--text-muted)]">date status</div>
            </div>
            {categoryCount ? (
              <div className="rounded-xl border border-[var(--section-border)]/80 bg-[var(--stat-card-bg)] px-3 py-2">
                <div className="text-sm font-semibold text-[var(--text-strong)]">{categoryCount}</div>
                <div className="mt-0.5 text-[11px] text-[var(--text-muted)]">evidence categories</div>
              </div>
            ) : null}
            {Number.isFinite(sourceRow) ? (
              <div className="rounded-xl border border-[var(--section-border)]/80 bg-[var(--stat-card-bg)] px-3 py-2">
                <div className="text-sm font-semibold text-[var(--text-strong)]">{sourceRow}</div>
                <div className="mt-0.5 text-[11px] text-[var(--text-muted)]">source row</div>
              </div>
            ) : null}
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
        <DetailRow label="Date or period" value={displayText} />
        {sourceDiffers ? <DetailRow label="Source date text" value={sourceText} /> : null}
        <DetailRow label="Subject" value={subjectLabel} />
        <DetailRow label="Temporal form" value={eventKindLabel(event)} />
        <DetailRow label="Date status" value={uncertaintyLabel(event)} />
        <DetailRow label="Precision" value={precision} />
        <DetailRow label="Qualifier" value={qualifier} />
        <DetailRow label="Boundedness" value={asText(event?.boundedness)} />
        <DetailRow label="Consistency" value={asText(event?.consistency)} />
        <DetailRow label="Source row" value={Number.isFinite(sourceRow) ? String(sourceRow) : ''} />
        <DetailRow label="Record" value={recordLabel} />
      </InspectorSummaryCardComponent>

      <EvidenceCategorySummary event={event} />

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
