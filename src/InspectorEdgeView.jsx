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
import { PeridotContributingRecordsLedger } from './PeridotContributingRecordsLedger.jsx';
import { PeridotInvestigateFurther } from './PeridotInvestigateFurther.jsx';
import { buildPeridotInspectorSelectionEvidence } from './peridotInspectorSelectionEvidence.js';
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
  dossierSheet = 'overview',
  onOpenPersonDetail,
  onOpenPlaceDetail,
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
    // Do not substitute participant-related records for mark-level source rows.
    // The selection contract verifies edge contributions separately from the
    // connection's represented weight, which can count repeated occurrences.
    const hasMarkProvenance = selectionEvidence?.support?.status === 'verified';
    const contributing = hasMarkProvenance ? selectionEvidence.support.records : [];
    const relationshipLabel = selectedProps.relationshipLabel || selectedProps.relationshipType;
    return (
      <div className="peridot-inspector-compact-data-flow">
        <div className="peridot-inspector-evidence-tier peridot-inspector-evidence-tier--support">
          <div className="peridot-inspector-compact-subheading">Evidence supporting this connection</div>
          <p className="peridot-inspector-compact-muted">The Map route represents displayed, mapped relationship occurrences between these endpoints. Its weight need not equal the number of distinct source records.</p>
          <CompactFactGrid entries={[
            { label: 'Source endpoint', value: selectedProps.sourceLabel },
            { label: 'Target endpoint', value: selectedProps.targetLabel },
            { label: 'Mapped relationship', value: relationshipLabel || (selectedProps.direction === 'directed' ? 'Directed relationship' : 'Relationship') },
            { label: 'Direction', value: selectedProps.direction || 'Not specified' },
            ...(selectedProps.count != null ? [{ label: 'Represented relationship occurrences', value: String(selectedProps.count) }] : []),
            ...(hasMarkProvenance ? [{ label: 'Contributing row entries on this edge', value: String(contributing.length) }] : []),
          ]}/>
          {hasMarkProvenance
            ? <CompactRecordPreview rows={contributing} maxRecords={1}/>
            : <p className="peridot-inspector-compact-muted">Verified contributing-row provenance is not available for this edge.</p>}
          {hasMarkProvenance && contributing.length > 1 ? <CompactRecordMore rows={contributing} maxRecords={2}/> : null}
        </div>
        <div className="peridot-inspector-evidence-tier peridot-inspector-evidence-tier--context">
          <div className="peridot-inspector-compact-subheading">Broader evidence about the endpoints</div>
          <p className="peridot-inspector-compact-muted">The source and target may have other mapped places, relationships and records beyond this selected route. Inspect an endpoint for its wider evidence.</p>
        </div>
        <CompactEvidenceReveal title="Explore additional route details">
          <CompactFactGrid entries={[
            { label: 'Endpoint roles', value: [selectedProps.sourceRole, selectedProps.targetRole].filter(Boolean).join(' · ') },
            { label: 'Dates represented', value: (selectedProps.dates || []).join('; ') },
            { label: 'Source-supported pairs', value: (selectedProps.samplePairs || []).join('; ') },
          ]}/>
        </CompactEvidenceReveal>
      </div>
    );
  }

  // A selected edge is a visualization mark. The selection-evidence contract,
  // rather than all records about either endpoint, defines its record provenance.
  const evidence = buildPeridotInspectorSelectionEvidence({ selectedKind: 'edge', selectedProps, viewMode });
  const isVerified = evidence.support.status === 'verified';
  const supportingRows = isVerified ? evidence.support.records : [];
  const relationship = selectedProps.relationshipLabel || selectedProps.relationshipType || '';
  const isDirected = selectedProps.direction === 'directed';
  const pairSeparator = isDirected ? ' → ' : ' — ';
  const subject = [selectedProps.sourceLabel, selectedProps.targetLabel].filter(Boolean).join(pairSeparator) || 'Selected connection';
  const isNetwork = viewMode === 'person';
  // The geographic Map can display *people* at geographic anchors. The map
  // view mode is not an endpoint type. Registered geographic origin/destination
  // pairs, conversely, really do have place endpoints.
  const endpointType = selectedProps.endpointType === 'place' ? 'place' : 'person';
  const openEndpoint = endpointType === 'place' ? onOpenPlaceDetail : onOpenPersonDetail;
  const pairCriterion = [selectedProps.sourceLabel, selectedProps.targetLabel].filter(Boolean).join(pairSeparator);
  const leafHeading = <header className="peridot-evidence-subject-heading"><h2>{subject}</h2></header>;

  if (dossierSheet === 'investigate') return <article className="peridot-evidence-leaf-page">
    {leafHeading}
    <PeridotInvestigateFurther subjectLabel={subject} subjectType="connection"
      seedField={endpointType === 'person' ? 'routePeople' : 'routePlace'} seedValue={pairCriterion}/>
  </article>;

  if (dossierSheet === 'records') return <article className="peridot-evidence-leaf-page">
    {leafHeading}
    <h3 className="peridot-connection-sheet-heading">Contributing records</h3>
    <p className="peridot-connection-sheet-intro">Source records retained for this selected visual connection, not all records associated with either endpoint.</p>
    {isVerified ? <PeridotContributingRecordsLedger rows={supportingRows} subjectLabel={subject}
      onOpenRecord={onOpenLetterDetail}/> :
      <p className="peridot-record-dossier-note">Verified contributing-record provenance is not available for this selected connection. Its represented weight must not be treated as a count of source records.</p>}
  </article>;

  return <article className="peridot-evidence-overview-sheet peridot-connection-dossier">
    <header className="peridot-evidence-subject-heading"><h2>{subject}</h2></header>
    <p className="peridot-connection-sheet-intro">{selectedProps.kind === 'registered-connection'
      ? (endpointType === 'place' ? 'This pair represents an explicit mapped geographic origin–destination assertion in the selected records.' : 'This pair represents explicit mapped participant relationship assertions in the selected records.')
      : isNetwork
        ? 'This line represents a mapped Network connection between the endpoints shown below.'
        : 'This line represents a mapped relationship connection as displayed under the current Map settings.'}
      {' '}Endpoint positions do not, by themselves, establish historical direction.</p>
    <div className="peridot-connection-metrics" aria-label="Connection counts">
      <div><span>Represented relationship occurrences</span><strong>{selectedProps.count != null ? selectedProps.count : 'Not available'}</strong></div>
      <div><span>Contributing source rows</span><strong>{isVerified ? supportingRows.length : 'Not verified'}</strong></div>
    </div>
    <section className="peridot-connection-ledger">
      <h3>Endpoints</h3>
      <p className="peridot-connection-section-note">{isDirected
        ? 'The mapped connection distinguishes its source and target endpoints.'
        : 'The source and target fields identify stored endpoint positions; this connection is not mapped as directed.'}</p>
      <div className="peridot-connection-endpoint-grid">
        {[
          ['Source endpoint', selectedProps.sourceLabel, selectedProps.sourceRole],
          ['Target endpoint', selectedProps.targetLabel, selectedProps.targetRole],
        ].map(([label, value, role], index) => <div key={index} className="peridot-connection-endpoint">
          <span className="peridot-connection-field-label">{isDirected ? label : `Endpoint ${index ? 'B' : 'A'} · ${label.toLowerCase()}`}</span>
          {typeof openEndpoint === 'function' && value ? <button type="button" className="peridot-connection-endpoint-link" onClick={() => openEndpoint(value, index ? (selectedProps.targetEntityId || '') : (selectedProps.sourceEntityId || ''))}>
            <span>{value}</span><span aria-hidden="true">›</span>
          </button> : <strong>{value || 'Not supplied'}</strong>}
          {role ? <small>Mapped role: {role}</small> : null}
        </div>)}
      </div>
    </section>
    <section className="peridot-connection-ledger">
      <h3>Mapped relationship</h3>
      <dl className="peridot-connection-facts">
        <div><dt>Relationship type</dt><dd>{relationship || 'Not specified in this selection'}</dd></div>
        <div><dt>Direction</dt><dd>{selectedProps.direction || 'Not specified'}</dd></div>
        {(selectedProps.dates || []).length ? <div><dt>Dates represented</dt><dd>{selectedProps.dates.join('; ')}</dd></div> : null}
      </dl>
    </section>
    <p className="peridot-connection-provenance-note">Represented occurrences count mapped connections aggregated into this mark. Retained source-row entries are a separate quantity and need not equal that weight. Open Contributing records to inspect their evidence.</p>
  </article>;
}
