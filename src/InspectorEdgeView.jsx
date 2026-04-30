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
