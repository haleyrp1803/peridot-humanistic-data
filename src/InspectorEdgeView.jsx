/*
 * Route / edge Inspector view.
 *
 * This component renders evidence for directed routes or network edges,
 * including related records and route details.
 *
 * Important relationships:
 * - Edge selections are built from graph/route data in `App.jsx` and `interactionHelpers.js`.
 * - Related-record navigation should participate in shared Inspector history.
 *
 * Maintenance cautions:
 * - Directed route semantics matter. Avoid collapsing source→target and target→source evidence unless a pass explicitly changes route direction behavior.
 */

import React from 'react';
import { CompactEvidenceReveal, CompactFactGrid, CompactRecordPreview, CompactRecordMore } from './InspectorCompactEvidence.jsx';

function detailLabelClassName() {
  return '[font-family:Georgia,"Palatino_Linotype","Book_Antiqua",Palatino,serif] text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--detail-label-text)]';
}

function DetailRow({ label, value }) {
  return (
    <div className="border-b border-[var(--section-border)]/80 py-1.5 last:border-b-0">
      <div className={detailLabelClassName()}>{label}</div>
      <div className="mt-0.5 break-words text-sm text-[var(--text-main)]">{value || '—'}</div>
    </div>
  );
}

function RouteLead({ selectedProps, linkedRecordCount }) {
  const directionGlyph = selectedProps.direction === 'directed' ? '→' : '—';
  const routeLabel = `${selectedProps.sourceLabel} ${directionGlyph} ${selectedProps.targetLabel}`;
  const dateSpan = (selectedProps.dates || []).length
    ? `${selectedProps.dates[0]}${selectedProps.dates.length > 1 ? `–${selectedProps.dates[selectedProps.dates.length - 1]}` : ''}`
    : '';

  return (
    <section className="rounded-2xl border border-[var(--section-border)] bg-[var(--section-bg)] p-3">
      <div className={detailLabelClassName()}>Connection</div>
      <h2 className="mt-1 break-words [font-family:Georgia,'Palatino_Linotype','Book_Antiqua',Palatino,serif] text-2xl font-semibold tracking-[-0.025em] text-[var(--heading-text)]">
        {routeLabel}
      </h2>
      <p className="mt-3 max-w-3xl text-sm leading-relaxed text-[var(--text-main)]">
        This connection has a represented weight of{' '}
        <span className="font-semibold text-[var(--text-strong)]">{selectedProps.count || 0}</span> and is associated
        with <span className="font-semibold text-[var(--text-strong)]">{linkedRecordCount || 0}</span> related
        record{linkedRecordCount === 1 ? '' : 's'}
        {dateSpan ? <> from <span className="font-semibold text-[var(--text-strong)]">{dateSpan}</span></> : null}.
      </p>
    </section>
  );
}

export function InspectorEdgeView({
  InspectorSummaryCardComponent,
  LinkedLettersPanelComponent,
  InspectorClearSelectionButtonComponent,

  selectedProps,
  clearSelection,
  linkedLettersToShow,
  selectedLetterMetadata,
  showAllLinkedLetters,
  setShowAllLinkedLetters,
  isLetterSectionExpanded,
  toggleLetterSection,
  onOpenLetterDetail,
  isCompact = false,
  selectionEvidence = null,
  viewMode = 'geographic',
}) {
  const linkedRecordCount = (selectedProps.letterMetadata || []).length;

  if (isCompact && viewMode === 'person') {
    const contributing = selectionEvidence?.support?.status === 'verified'
      ? selectionEvidence.support.records : (selectedProps.letterMetadata || []);
    const relationshipLabel = selectedProps.relationshipLabel || selectedProps.relationshipType;
    const hasMarkProvenance = selectionEvidence?.support?.status === 'verified';
    return (
      <div className="peridot-inspector-compact-data-flow">
        <div className="peridot-inspector-evidence-tier peridot-inspector-evidence-tier--support">
          <div className="peridot-inspector-compact-subheading">Evidence supporting this connection</div>
          <p className="peridot-inspector-compact-muted">The displayed edge represents mapped relationship occurrences between its endpoints. A represented weight is not necessarily a count of distinct source records.</p>
          <CompactFactGrid entries={[
            { label: 'Source endpoint', value: selectedProps.sourceLabel },
            { label: 'Target endpoint', value: selectedProps.targetLabel },
            { label: 'Mapped relationship', value: relationshipLabel || (selectedProps.direction === 'directed' ? 'Directed relationship' : 'Relationship') },
            { label: 'Direction', value: selectedProps.direction || 'Not specified' },
            ...(selectedProps.count != null ? [{ label: 'Represented relationship occurrences', value: String(selectedProps.count) }] : []),
            ...(hasMarkProvenance ? [{ label: 'Contributing row entries on this edge', value: String(contributing.length) }] : []),
          ]}/>
          {hasMarkProvenance ? <CompactRecordPreview rows={contributing} maxRecords={1}/> : <p className="peridot-inspector-compact-muted">This edge has not supplied verified contributing-row provenance.</p>}
          {contributing.length > 1 ? <CompactRecordMore rows={contributing} maxRecords={2}/> : null}
        </div>
        <div className="peridot-inspector-evidence-tier peridot-inspector-evidence-tier--context">
          <div className="peridot-inspector-compact-subheading">Broader evidence about the participants</div>
          <p className="peridot-inspector-compact-muted">The endpoints may have other relationships and mapped assertions beyond this selected edge. Inspect either participant for its wider evidence profile.</p>
        </div>
        <CompactEvidenceReveal title="Explore additional connection details">
          <CompactFactGrid entries={[
            { label: 'Endpoint roles', value: [selectedProps.sourceRole, selectedProps.targetRole].filter(Boolean).join(' · ') },
            { label: 'Dates represented', value: (selectedProps.dates || []).join('; ') },
            { label: 'Source-supported pairs', value: (selectedProps.samplePairs || []).join('; ') },
          ]}/>
        </CompactEvidenceReveal>
      </div>
    );
  }

  if (isCompact) {
    const contributing = selectedProps.letterMetadata || [];
    const relationshipLabel = selectedProps.relationshipLabel || selectedProps.relationshipType;
    return (
      <div className="peridot-inspector-compact-data-flow">
        <CompactFactGrid entries={[
          { label: 'Mapped relationship', value: relationshipLabel || (selectedProps.direction === 'directed' ? 'Directed relationship' : 'Relationship') },
          { label: 'Represented weight', value: String(selectedProps.count ?? 0) },
          { label: 'Related records', value: String(contributing.length) },
        ]}/>
        <CompactRecordPreview rows={contributing} maxRecords={1}/>
        <CompactEvidenceReveal title="Show additional connection evidence">
          <CompactFactGrid entries={[
            { label: 'Endpoint roles', value: [selectedProps.sourceRole, selectedProps.targetRole].filter(Boolean).join(' · ') },
            { label: 'Dates represented', value: (selectedProps.dates || []).join('; ') },
            { label: 'Source-supported pairs', value: (selectedProps.samplePairs || []).join('; ') },
          ]}/>
          <CompactRecordMore rows={contributing} maxRecords={2}/>
        </CompactEvidenceReveal>
      </div>
    );
  }

  return (
    <article className="space-y-3">
      <RouteLead selectedProps={selectedProps} linkedRecordCount={linkedRecordCount} />

      <div className="grid gap-3 md:grid-cols-2">
        <InspectorSummaryCardComponent>
          <DetailRow
            label={selectedProps.direction === 'directed' ? 'Source endpoint' : (selectedProps.sourceRole || 'Endpoint A')}
            value={selectedProps.sourceLabel}
          />
          <DetailRow
            label={selectedProps.direction === 'directed' ? 'Target endpoint' : (selectedProps.targetRole || 'Endpoint B')}
            value={selectedProps.targetLabel}
          />
          <DetailRow label="Sample pairs" value={(selectedProps.samplePairs || []).join('; ')} />
        </InspectorSummaryCardComponent>

        <InspectorSummaryCardComponent>
          <DetailRow label="Relationship" value={selectedProps.relationshipType || selectedProps.relationshipLabel} />
          <DetailRow label="Direction" value={selectedProps.direction || 'undirected'} />
          <DetailRow label="Related records" value={String(linkedRecordCount)} />
        </InspectorSummaryCardComponent>
      </div>

      <LinkedLettersPanelComponent
        linkedLettersToShow={linkedLettersToShow}
        selectedLetterMetadata={selectedLetterMetadata}
        showAllLinkedLetters={showAllLinkedLetters}
        setShowAllLinkedLetters={setShowAllLinkedLetters}
        isLetterSectionExpanded={isLetterSectionExpanded}
        toggleLetterSection={toggleLetterSection}
        onOpenLetterDetail={onOpenLetterDetail}
      />

      <div className="flex justify-end">
        <InspectorClearSelectionButtonComponent onClear={clearSelection} />
      </div>
    </article>
  );
}
