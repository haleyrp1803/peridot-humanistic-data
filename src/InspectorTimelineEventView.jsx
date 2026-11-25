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
import { CompactFactGrid, CompactEvidenceReveal } from './InspectorCompactEvidence.jsx';
import { TimelineCategoryPoint } from './PeridotTimelineCategoryMarks.jsx';
import { PeridotCategorySymbolIcon } from './PeridotTimelineCategorySymbols.jsx';
import { timelineCompactRecordGroups, timelineVisualCategoryLegend } from './peridotInspectorTimelineCompact.js';
import { buildPeridotRecordStructure } from './peridotRecordStructure.js';
import { describePeridotTimelineMark } from './peridotInspectorTimelinePresentation.js';

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

function TimelineVisualCategoryLegend({ event }) {
  const legend = timelineVisualCategoryLegend(event);
  return <section className="peridot-inspector-timeline-categories" aria-label="How this event is categorized">
    <div className="peridot-inspector-compact-subheading">How this {['interval','openInterval'].includes(event.temporalKind) ? 'period' : 'event'} is categorized</div>
    {!legend.available ? <p className="peridot-inspector-compact-muted">The active Timeline category configuration is not available for this selection. The source record's category values are not evidence of an active visual encoding.</p>
      : !legend.categories.length ? <p className="peridot-inspector-compact-muted">Uncategorized in the current Timeline category configuration. The mark uses the default charcoal appearance.</p>
      : <>
        <div className="peridot-inspector-timeline-legend-layout">
          <div className="peridot-inspector-timeline-legend-mark" aria-hidden="true">
            <TimelineCategoryPoint categories={legend.categories} displayMode={legend.displayMode}/>
          </div>
          <div className="peridot-inspector-timeline-legend-items">
            {legend.categories.map(category => <div key={category.id} className="peridot-inspector-timeline-legend-item">
              <span className="peridot-inspector-timeline-legend-swatch" style={{backgroundColor:category.color}} aria-hidden="true"/>
              {legend.displayMode !== 'colors' && category.symbol && category.symbol !== 'none' ? <PeridotCategorySymbolIcon name={category.symbol} color={category.color} size={17}/> : null}
              <div className="peridot-inspector-timeline-legend-entry">
                <strong>{category.label}</strong>
                <span>{category.sourceLabel}: {category.sourceValue}</span>
              </div>
            </div>)}
          </div>
        </div>
        {legend.hiddenCount ? <p className="peridot-inspector-compact-muted">The mark displays the first four category colors; {legend.hiddenCount} additional active {legend.hiddenCount === 1 ? 'category is' : 'categories are'} listed above and indicated by the mark's +{legend.hiddenCount} indicator.</p> : null}
        <p className="peridot-inspector-compact-muted">These categories explain the mark's current visual encoding. The researcher defines their source values, labels and colors.</p>
      </>}
  </section>;
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
  selectionEvidence = null,
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
    const summary = describePeridotTimelineMark(event);
    const mapped = buildPeridotRecordStructure(row);
    const legend = timelineVisualCategoryLegend(event);
    const grouped = timelineCompactRecordGroups(mapped, legend.categories, row);
    // The date and role already appear in Overview. In Data, explain their
    // interpretation rather than reprinting the same value and heading.
    const temporalFacts = summary.details.filter(entry => ![
      'Mapped temporal role', 'Date represented', 'Asserted period', 'Temporal form',
    ].includes(entry.label));
    const otherTemporal = mapped.temporal.filter(entry => !(
      asText(entry.label) === summary.role && asText(entry.value) === summary.display
      && (!entry.subject || asText(entry.subject) === summary.subjectLabel)
    ));
    const hasBroaderEvidence = grouped.participants.length || grouped.relationships.length
      || grouped.places.length || otherTemporal.length || grouped.otherEvidence.length;
    return (
      <div className="peridot-inspector-compact-data-flow">
        <div className="peridot-inspector-mark-support">
          <div className="peridot-inspector-compact-subheading">Evidence supporting this {summary.markKind === 'period' ? 'period' : 'event'}</div>
          <p className="peridot-inspector-compact-muted">The mapped temporal assertion determines this mark's position. Its uncertainty and precision are preserved from the source.</p>
          <CompactFactGrid entries={[...temporalFacts, ...summary.detailFields]}/>
          <div className="peridot-inspector-compact-subheading">Source record and provenance</div>
          <CompactFactGrid entries={[
            ...(recordLabel ? [{ label: 'Record', value: recordLabel }] : []),
            ...(Number.isFinite(sourceRow) ? [{ label: 'Source row', value: String(sourceRow) }] : []),
            ...grouped.provenance,
          ]}/>
          {selectionEvidence?.support?.status !== 'verified' ? <p className="peridot-inspector-compact-muted">A verified contributing source record is unavailable.</p> : null}
          <TimelineVisualCategoryLegend event={event}/>
        </div>
        {hasBroaderEvidence ? <div className="peridot-inspector-mark-context">
          <div className="peridot-inspector-compact-subheading">Other mapped information in this record</div>
          <p className="peridot-inspector-compact-muted">Other assertions belong to the contributing record but do not necessarily determine the selected Timeline mark.</p>
          <CompactEvidenceReveal title="Explore other mapped record information">
            {grouped.participants.length ? <>
              <div className="peridot-inspector-compact-subheading">Participants</div>
              <CompactFactGrid entries={grouped.participants}/>
            </> : null}
            {grouped.relationships.length ? <>
              <div className="peridot-inspector-compact-subheading">Relationships</div>
              <CompactFactGrid entries={grouped.relationships}/>
            </> : null}
            {grouped.places.length ? <>
              <div className="peridot-inspector-compact-subheading">Mapped places</div>
              <CompactFactGrid entries={grouped.places}/>
            </> : null}
            {otherTemporal.length ? <>
              <div className="peridot-inspector-compact-subheading">Other temporal assertions</div>
              <CompactFactGrid entries={otherTemporal}/>
            </> : null}
            {grouped.otherEvidence.length ? <>
              <div className="peridot-inspector-compact-subheading">Other Evidence</div>
              <CompactFactGrid entries={grouped.otherEvidence}/>
            </> : null}
          </CompactEvidenceReveal>
        </div> : null}
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
