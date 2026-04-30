import React from 'react';

function detailLabelClassName() {
  return '[font-family:Georgia,"Palatino_Linotype","Book_Antiqua",Palatino,serif] text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--detail-label-text)]';
}

function serifHeadingClassName() {
  return '[font-family:Georgia,"Palatino_Linotype","Book_Antiqua",Palatino,serif] tracking-[-0.02em] text-[var(--heading-text)]';
}

function DetailRow({ label, value }) {
  return (
    <div className="border-b border-[var(--section-border)]/80 py-2 last:border-b-0">
      <div className={detailLabelClassName()}>{label}</div>
      <div className="mt-1 break-words text-sm text-[var(--text-main)]">{value || '—'}</div>
    </div>
  );
}

export function InspectorNodeView({
  InspectorSummaryCardComponent,
  PersonMetadataCardComponent,
  MissingPersonMetadataCardComponent,
  InspectorConnectedCorrespondentsComponent,
  InspectorPersonPlacesComponent,
  LinkedLettersPanelComponent,
  InspectorClearSelectionButtonComponent,

  selectedProps,
  clearSelection,
  viewMode,
  linkedLettersToShow,
  selectedLetterMetadata,
  showAllLinkedLetters,
  setShowAllLinkedLetters,
  isLetterSectionExpanded,
  toggleLetterSection,
  onOpenPersonDetail,
  onOpenPlaceDetail,
}) {
  return (
    <div className="space-y-4">
      <InspectorSummaryCardComponent>
        <DetailRow label={viewMode === 'geographic' ? 'Place' : 'Person'} value={selectedProps.label} />
        <DetailRow label="Latitude" value={selectedProps.lat} />
        <DetailRow label="Longitude" value={selectedProps.lon} />
        <DetailRow label="Weighted degree" value={selectedProps.degree} />
        <DetailRow label="Incident edges" value={selectedProps.incidentEdgeCount} />
        <DetailRow label="Linked letters" value={selectedProps.linkedLetterCount} />
        <DetailRow label="Correspondents" value={(selectedProps.counterpartLabels || []).join('; ')} />
        <DetailRow label="Date span" value={[selectedProps.earliestDate, selectedProps.latestDate].filter(Boolean).join(' → ')} />
        {selectedProps.anchorLabel ? <DetailRow label="Anchor location" value={selectedProps.anchorLabel} /> : null}
        {viewMode === 'person' && selectedProps.personMetadata ? (
          <PersonMetadataCardComponent selectedProps={selectedProps} />
        ) : viewMode === 'person' ? (
          <MissingPersonMetadataCardComponent />
        ) : null}
      </InspectorSummaryCardComponent>

      {viewMode === 'person' ? (
        <InspectorConnectedCorrespondentsComponent
          names={selectedProps.counterpartLabels || []}
          onOpenPerson={onOpenPersonDetail}
        />
      ) : null}

      {viewMode === 'person' && (selectedProps.__kind === 'person-detail' || selectedProps.__kind === 'node') ? (
        <InspectorPersonPlacesComponent
          sentPlaces={selectedProps.sentPlaceLabels || []}
          receivedPlaces={selectedProps.receivedPlaceLabels || []}
          onOpenPlace={onOpenPlaceDetail}
        />
      ) : null}

      <InspectorClearSelectionButtonComponent onClear={clearSelection} />

      <LinkedLettersPanelComponent
        linkedLettersToShow={linkedLettersToShow}
        selectedLetterMetadata={selectedLetterMetadata}
        showAllLinkedLetters={showAllLinkedLetters}
        setShowAllLinkedLetters={setShowAllLinkedLetters}
        isLetterSectionExpanded={isLetterSectionExpanded}
        toggleLetterSection={toggleLetterSection}
      />
    </div>
  );
}
