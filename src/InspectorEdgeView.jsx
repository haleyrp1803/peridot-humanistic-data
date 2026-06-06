/*
 * Route / edge Inspector view.
 * 
 * This component renders evidence for directed routes or network edges, including linked records and route details.
 * 
 * Important relationships:
 * - Edge selections are built from graph/route data in `App.jsx` and `interactionHelpers.js`.
 * - Linked-record navigation should participate in shared Inspector history.
 * 
 * Maintenance cautions:
 * - Directed route semantics matter. Avoid collapsing source→target and target→source evidence unless a pass explicitly changes route direction behavior.
 */

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


function CompactRoutePrompt({ linkedLetterCount }) {
  return (
    <div className="rounded-2xl border border-[var(--section-border)] bg-[var(--section-bg)] p-4 text-sm text-[var(--text-main)] shadow-sm">
      <div className="font-semibold uppercase tracking-[0.14em] text-[var(--detail-label-text)]">
        At-a-glance route summary
      </div>
      <p className="mt-2 leading-relaxed text-[var(--text-muted)]">
        This compact Inspector shows the route direction, represented weight, and top-level evidence count. Expand the Inspector for linked-letter records and fuller route evidence.
      </p>
      <div className="mt-3 rounded-xl border border-[var(--section-border)]/70 bg-[var(--panel-card-bg)] px-3 py-2 text-xs">
        <div className="font-semibold text-[var(--text-strong)]">{linkedLetterCount || 0}</div>
        <div className="text-[var(--text-muted)]">linked letters</div>
      </div>
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
  onOpenLetterDetail,
  isCompact = false,
}) {
  const linkedLetterCount = (selectedProps.letterMetadata || []).length;

  if (isCompact) {
    return (
      <div className="space-y-4">
        <InspectorSummaryCardComponent>
          <DetailRow label="Route" value={`${selectedProps.sourceLabel} → ${selectedProps.targetLabel}`} />
          <DetailRow label="Weight" value={selectedProps.count} />
          <DetailRow label="Dates represented" value={(selectedProps.dates || []).join('; ')} />
          <DetailRow label="Linked letters" value={linkedLetterCount} />
        </InspectorSummaryCardComponent>

        <CompactRoutePrompt linkedLetterCount={linkedLetterCount} />

        <InspectorClearSelectionButtonComponent onClear={clearSelection} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <InspectorSummaryCardComponent>
        <DetailRow label="Route" value={`${selectedProps.sourceLabel} → ${selectedProps.targetLabel}`} />
        <DetailRow label="Weight" value={selectedProps.count} />
        <DetailRow label="Dates represented" value={(selectedProps.dates || []).join('; ')} />
        <DetailRow label="Senders" value={(selectedProps.sources || []).join('; ')} />
        <DetailRow label="Recipients" value={(selectedProps.targets || []).join('; ')} />
        <DetailRow label="Sample pairs" value={(selectedProps.samplePairs || []).join('; ')} />
        <DetailRow label="Linked letters" value={linkedLetterCount} />
      </InspectorSummaryCardComponent>

      <InspectorClearSelectionButtonComponent onClear={clearSelection} />

      <LinkedLettersPanelComponent
        linkedLettersToShow={linkedLettersToShow}
        selectedLetterMetadata={selectedLetterMetadata}
        showAllLinkedLetters={showAllLinkedLetters}
        setShowAllLinkedLetters={setShowAllLinkedLetters}
        isLetterSectionExpanded={isLetterSectionExpanded}
        toggleLetterSection={toggleLetterSection}
        onOpenLetterDetail={onOpenLetterDetail}
      />
    </div>
  );
}
