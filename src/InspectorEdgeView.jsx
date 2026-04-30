import React from 'react';

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
}) {
  return (
    <div className="space-y-4">
      <InspectorSummaryCardComponent>
        <DetailRow label="Route" value={`${selectedProps.sourceLabel} → ${selectedProps.targetLabel}`} />
        <DetailRow label="Weight" value={selectedProps.count} />
        <DetailRow label="Dates represented" value={(selectedProps.dates || []).join('; ')} />
        <DetailRow label="Senders" value={(selectedProps.sources || []).join('; ')} />
        <DetailRow label="Recipients" value={(selectedProps.targets || []).join('; ')} />
        <DetailRow label="Sample pairs" value={(selectedProps.samplePairs || []).join('; ')} />
        <DetailRow label="Linked letters" value={(selectedProps.letterMetadata || []).length} />
      </InspectorSummaryCardComponent>

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
