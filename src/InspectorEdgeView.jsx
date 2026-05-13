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

function formatRouteMember(member, index) {
  if (!member) return `Route ${index + 1}`;

  if (typeof member === 'string') return member;

  const source =
    member.sourceLabel ||
    member.sourceName ||
    member.source ||
    member.fromLabel ||
    member.from ||
    member.sourceId ||
    'Source';

  const target =
    member.targetLabel ||
    member.targetName ||
    member.target ||
    member.toLabel ||
    member.to ||
    member.targetId ||
    'Target';

  const weight = member.count || member.weight || member.totalWeight || member.letterCount || null;
  const suffix = weight ? ` — ${weight} ${Number(weight) === 1 ? 'letter' : 'letters'}` : '';

  return `${source} → ${target}${suffix}`;
}

function getAggregatedRouteMembers(selectedProps) {
  const candidates = [
    selectedProps?.routeMembers,
    selectedProps?.memberRoutes,
    selectedProps?.members,
    selectedProps?.memberLabels,
  ];

  const firstArray = candidates.find((candidate) => Array.isArray(candidate) && candidate.length > 0);
  return firstArray || [];
}

function AggregatedRouteDetails({ selectedProps }) {
  const members = getAggregatedRouteMembers(selectedProps);
  const visibleMembers = members.slice(0, 30);
  const hiddenMemberCount = Math.max(0, members.length - visibleMembers.length);

  const sourceLabel = selectedProps.aggregateSourceLabel || selectedProps.sourceLabel || selectedProps.sourceId;
  const targetLabel = selectedProps.aggregateTargetLabel || selectedProps.targetLabel || selectedProps.targetId;
  const totalWeight = selectedProps.aggregateWeight || selectedProps.totalWeight || selectedProps.count || selectedProps.weight;
  const memberRouteCount = selectedProps.memberRouteCount || selectedProps.linkedRouteIds?.length || members.length;

  return (
    <InspectorSummaryCardComponentFallback>
      <div className="space-y-3">
        <div>
          <div className={detailLabelClassName()}>Aggregated route</div>
          <h3 className={`${serifHeadingClassName()} mt-1 text-lg font-semibold`}>
            {sourceLabel || 'Visible source'} → {targetLabel || 'Visible target'}
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-[var(--text-muted)]">
            This edge combines underlying directed routes whose endpoints are currently represented by the visible MapLibre nodes and clusters.
          </p>
        </div>

        <div className="rounded-xl border border-[var(--section-border)]/80 bg-[var(--panel-muted)]/40 p-3">
          <DetailRow label="Visible source" value={sourceLabel} />
          <DetailRow label="Visible target" value={targetLabel} />
          <DetailRow label="Total represented letters" value={totalWeight} />
          <DetailRow label="Underlying directed routes" value={memberRouteCount} />
          <DetailRow label="Source endpoint type" value={selectedProps.sourceIsCluster ? 'Cluster' : 'Node'} />
          <DetailRow label="Target endpoint type" value={selectedProps.targetIsCluster ? 'Cluster' : 'Node'} />
        </div>

        {selectedProps.aggregateSummary ? (
          <div className="rounded-xl border border-[var(--section-border)]/80 bg-[var(--panel-muted)]/30 p-3">
            <div className={detailLabelClassName()}>Summary</div>
            <div className="mt-2 text-sm leading-relaxed text-[var(--text-main)]">{selectedProps.aggregateSummary}</div>
          </div>
        ) : null}

        <div className="rounded-xl border border-[var(--section-border)]/80 bg-[var(--panel-muted)]/30 p-3">
          <div className={detailLabelClassName()}>Underlying routes</div>
          {visibleMembers.length > 0 ? (
            <div className="mt-2 max-h-72 space-y-2 overflow-auto pr-1">
              {visibleMembers.map((member, index) => (
                <div
                  key={`${formatRouteMember(member, index)}-${index}`}
                  className="rounded-lg border border-[var(--section-border)]/70 bg-[var(--panel-bg)]/70 px-3 py-2 text-sm text-[var(--text-main)]"
                >
                  {formatRouteMember(member, index)}
                </div>
              ))}
              {hiddenMemberCount > 0 ? (
                <div className="text-xs italic text-[var(--text-muted)]">
                  {hiddenMemberCount} additional underlying routes not shown in this preview list.
                </div>
              ) : null}
            </div>
          ) : (
            <div className="mt-2 text-sm text-[var(--text-muted)]">
              No underlying route list was provided with this aggregate edge payload.
            </div>
          )}
        </div>
      </div>
    </InspectorSummaryCardComponentFallback>
  );
}

function InspectorSummaryCardComponentFallback({ children }) {
  return <div>{children}</div>;
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
  const isAggregatedRoute = Boolean(selectedProps?.isAggregatedRoute);

  return (
    <div className="space-y-4">
      <InspectorSummaryCardComponent>
        {isAggregatedRoute ? (
          <div className="space-y-3">
            <div>
              <div className={detailLabelClassName()}>Aggregated route</div>
              <h3 className={`${serifHeadingClassName()} mt-1 text-lg font-semibold`}>
                {(selectedProps.aggregateSourceLabel || selectedProps.sourceLabel || selectedProps.sourceId || 'Visible source')}
                {' → '}
                {(selectedProps.aggregateTargetLabel || selectedProps.targetLabel || selectedProps.targetId || 'Visible target')}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--text-muted)]">
                This edge combines underlying directed routes whose endpoints are currently represented by visible MapLibre nodes and clusters.
              </p>
            </div>

            <div className="rounded-xl border border-[var(--section-border)]/80 bg-[var(--panel-muted)]/40 p-3">
              <DetailRow label="Visible source" value={selectedProps.aggregateSourceLabel || selectedProps.sourceLabel || selectedProps.sourceId} />
              <DetailRow label="Visible target" value={selectedProps.aggregateTargetLabel || selectedProps.targetLabel || selectedProps.targetId} />
              <DetailRow label="Total represented letters" value={selectedProps.aggregateWeight || selectedProps.totalWeight || selectedProps.count || selectedProps.weight} />
              <DetailRow label="Underlying directed routes" value={selectedProps.memberRouteCount || selectedProps.linkedRouteIds?.length || getAggregatedRouteMembers(selectedProps).length} />
              <DetailRow label="Source endpoint type" value={selectedProps.sourceIsCluster ? 'Cluster' : 'Node'} />
              <DetailRow label="Target endpoint type" value={selectedProps.targetIsCluster ? 'Cluster' : 'Node'} />
            </div>

            {selectedProps.aggregateSummary ? (
              <div className="rounded-xl border border-[var(--section-border)]/80 bg-[var(--panel-muted)]/30 p-3">
                <div className={detailLabelClassName()}>Summary</div>
                <div className="mt-2 text-sm leading-relaxed text-[var(--text-main)]">{selectedProps.aggregateSummary}</div>
              </div>
            ) : null}

            <div className="rounded-xl border border-[var(--section-border)]/80 bg-[var(--panel-muted)]/30 p-3">
              <div className={detailLabelClassName()}>Underlying routes</div>
              {getAggregatedRouteMembers(selectedProps).length > 0 ? (
                <div className="mt-2 max-h-72 space-y-2 overflow-auto pr-1">
                  {getAggregatedRouteMembers(selectedProps).slice(0, 30).map((member, index) => (
                    <div
                      key={`${formatRouteMember(member, index)}-${index}`}
                      className="rounded-lg border border-[var(--section-border)]/70 bg-[var(--panel-bg)]/70 px-3 py-2 text-sm text-[var(--text-main)]"
                    >
                      {formatRouteMember(member, index)}
                    </div>
                  ))}
                  {getAggregatedRouteMembers(selectedProps).length > 30 ? (
                    <div className="text-xs italic text-[var(--text-muted)]">
                      {getAggregatedRouteMembers(selectedProps).length - 30} additional underlying routes not shown in this preview list.
                    </div>
                  ) : null}
                </div>
              ) : (
                <div className="mt-2 text-sm text-[var(--text-muted)]">
                  No underlying route list was provided with this aggregate edge payload.
                </div>
              )}
            </div>
          </div>
        ) : (
          <>
            <DetailRow label="Route" value={`${selectedProps.sourceLabel} → ${selectedProps.targetLabel}`} />
            <DetailRow label="Weight" value={selectedProps.count} />
            <DetailRow label="Dates represented" value={(selectedProps.dates || []).join('; ')} />
            <DetailRow label="Senders" value={(selectedProps.sources || []).join('; ')} />
            <DetailRow label="Recipients" value={(selectedProps.targets || []).join('; ')} />
            <DetailRow label="Sample pairs" value={(selectedProps.samplePairs || []).join('; ')} />
            <DetailRow label="Linked letters" value={(selectedProps.letterMetadata || []).length} />
          </>
        )}
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
