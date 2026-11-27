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
import { PeridotContributingRecordsLedger } from './PeridotContributingRecordsLedger.jsx';
import { PeridotInvestigateFurther } from './PeridotInvestigateFurther.jsx';

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
  onOpenLetterDetail,
  dossierSheet = 'overview',
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

  // The selected event retains its own source row. Do not use all records
  // associated with an entity as evidence for this particular Timeline mark.
  const summary = describePeridotTimelineMark(event);
  const mapped = buildPeridotRecordStructure(row);
  const subjects = new Map();
  const addSubject = (kind, entry) => {
    const name = asText(entry?.value);
    if (!name || /^(unknown|not specified)$/i.test(name)) return;
    const entityId = kind === 'person' ? asText(entry.entityId) : '';
    const key = `${kind}:${entityId || name.toLocaleLowerCase()}`;
    const prior = subjects.get(key);
    if (prior) { if (!prior.roles.includes(asText(entry.label))) prior.roles.push(asText(entry.label)); return; }
    subjects.set(key, { kind, name, entityId, roles: [asText(entry.label)].filter(Boolean) });
  };
  (mapped.participants || []).forEach(entry => addSubject('person', entry));
  (mapped.places || []).forEach(entry => addSubject('place', entry));
  const subjectMatches = [...subjects.values()].sort((a, b) => a.name.localeCompare(b.name));
  const roleSpecificSubject = eventSubjectLabel(event);
  const subjectId = asText(event?.subject?.entityId || event?.subject?.canonicalEntityId);
  const categoryEntries = categoryGroups(event);
  const visualLegend = timelineVisualCategoryLegend(event);
  const details = [
    ...summary.details,
    ...summary.detailFields,
    ...(asText(event.consistency) ? [{label:'Consistency',value:asText(event.consistency)}] : []),
    ...(Number.isFinite(sourceRow) ? [{label:'Source row',value:String(sourceRow)}] : []),
    ...(recordLabel ? [{label:'Record identifier',value:recordLabel}] : []),
  ];
  const distinctDetails = details.filter((entry, index) => entry.value !== null && entry.value !== undefined && asText(entry.value) &&
    details.findIndex(candidate => candidate.label === entry.label && candidate.value === entry.value) === index);
  const recordRows = [row];
  return (
    <article className="peridot-timeline-dossier">
      <header className="peridot-evidence-subject-heading"><h2>{summary.role}: {summary.display}</h2></header>
      {dossierSheet === 'overview' ? <div className="peridot-timeline-dossier-overview">
        <p className="peridot-timeline-dossier-intro">{summary.explanation} Other mapped assertions in the source record are available below, but do not necessarily determine this mark's position.</p>
        <section className="peridot-timeline-dossier-panel" aria-label="Temporal information">
          <h3>Temporal information</h3>
          <div className="peridot-timeline-dossier-facts">
            {distinctDetails.map((entry, index) => <div key={`${entry.label}:${index}`} className="peridot-timeline-dossier-fact">
              <small>{entry.label}</small><strong>{String(entry.value)}</strong>
            </div>)}
          </div>
        </section>
        {(visualLegend.available || categoryEntries.length > 0) && <section className="peridot-timeline-dossier-panel" aria-label="Event categories">
          <h3>Categories</h3>
          {visualLegend.available ? <>
            <p>Active Timeline category encoding for this selected mark.</p>
            {visualLegend.categories.length ? <div className="peridot-timeline-dossier-visual-categories">{visualLegend.categories.map(category =>
              <div key={category.id} className="peridot-timeline-dossier-category">
                <span className="peridot-timeline-dossier-color" style={{backgroundColor:category.color}} aria-hidden="true"/>
                <span><strong>{category.label}</strong><small>{category.sourceLabel}: {category.sourceValue}</small></span>
              </div>)}</div> : <p>Uncategorized in the current Timeline category configuration.</p>}
            {visualLegend.hiddenCount ? <p>{visualLegend.hiddenCount} additional active categories are represented by the mark's indicator.</p> : null}
          </> : <p>The active Timeline category configuration is unavailable; the record values below do not establish a visual encoding.</p>}
          {categoryEntries.length ? <div className="peridot-timeline-dossier-category-source">{categoryEntries.map(group => <div key={group.label}>
            <small>{group.label}</small><strong>{group.values.join(', ')}</strong>
          </div>)}</div> : null}
        </section>}
        <section className="peridot-timeline-dossier-panel" aria-label="People and places in the source record">
          <h3>Mapped people and places in the contributing record</h3>
          <p>These subjects appear in this event's source record. Their presence does not establish that they are the event's temporal subject or that every association is directed.</p>
          {subjectMatches.length ? <div className="peridot-chart-dossier-subject-grid">
            {subjectMatches.map(subject => {
              const isEventSubject = subject.kind === 'person' && (subjectId && subject.entityId === subjectId || roleSpecificSubject && subject.name === roleSpecificSubject);
              const canOpen = subject.kind === 'person' ? typeof onOpenPersonDetail === 'function' : typeof onOpenPlaceDetail === 'function';
              return <button type="button" key={`${subject.kind}:${subject.entityId || subject.name}`}
                className="peridot-chart-dossier-subject-row" disabled={!canOpen}
                onClick={() => subject.kind === 'person' ? onOpenPersonDetail(subject.name,subject.entityId) : onOpenPlaceDetail(subject.name)}>
                <span className="peridot-chart-dossier-subject-body">
                  <small>{subject.kind === 'person' ? 'Person / entity' : 'Place'}{subject.roles.length ? ` · ${subject.roles.join(', ')}` : ''}</small>
                  <strong>{subject.name}</strong>
                  {isEventSubject && <em className="peridot-chart-dossier-category-note">Mapped temporal subject</em>}
                </span><span className="peridot-chart-dossier-subject-count" aria-hidden="true">›</span>
              </button>;
            })}
          </div> : <p>No mapped person or place is available in this event's retained source row.</p>}
        </section>
      </div> : dossierSheet === 'records' ? <section className="peridot-timeline-dossier-records">
        <h3>Contributing records</h3>
        <p>The source record retained for this selected Timeline event or period. Other records associated with its people or places are not included automatically.</p>
        <PeridotContributingRecordsLedger rows={recordRows} subjectLabel={`${summary.role}: ${summary.display}`} entityType="timeline-event" onOpenRecord={onOpenLetterDetail}/>
      </section> : <section className="peridot-timeline-dossier-investigate">
        <h3>Investigate further</h3>
        <PeridotInvestigateFurther />
      </section>}
    </article>
  );
}
