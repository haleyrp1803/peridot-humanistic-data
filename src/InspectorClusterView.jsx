import React from 'react';

function detailLabelClassName() {
  return '[font-family:Georgia,"Palatino_Linotype","Book_Antiqua",Palatino,serif] text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--detail-label-text)]';
}

function DetailRow({ label, value }) {
  return (
    <div className="border-b border-[var(--section-border)]/80 py-2 last:border-b-0">
      <div className={detailLabelClassName()}>{label}</div>
      <div className="mt-1 break-words text-sm text-[var(--text-main)]">{value || '—'}</div>
    </div>
  );
}

function ClusterMemberList({ members, viewMode, onOpenPersonDetail, onOpenPlaceDetail }) {
  const isGeographic = viewMode === 'geographic';
  const memberKindLabel = isGeographic ? 'places' : 'people';
  const actionLabel = isGeographic ? 'Open place detail' : 'Open person detail';
  const openDetail = isGeographic ? onOpenPlaceDetail : onOpenPersonDetail;

  if (!members.length) {
    return (
      <div className="rounded-2xl border border-[var(--section-border)] bg-[var(--card-bg)] p-4 text-sm text-[var(--text-muted)]">
        No contained {memberKindLabel} were found for this cluster.
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-[var(--section-border)] bg-[var(--card-bg)] p-4">
      <div className={detailLabelClassName()}>Contained {memberKindLabel}</div>
      <div className="mt-3 space-y-2">
        {members.map((member) => (
          <button
            key={member.id || member.label}
            type="button"
            onClick={() => openDetail?.(member.label)}
            className="w-full rounded-xl border border-[var(--button-border)] bg-[var(--button-bg)] px-3 py-2 text-left text-sm text-[var(--button-text)] transition-colors hover:bg-[var(--button-hover-bg)] hover:text-[var(--button-hover-text)]"
            title={`${actionLabel}: ${member.label}`}
          >
            <span className="block font-medium">{member.label}</span>
            <span className="mt-1 block text-xs text-[var(--text-muted)]">
              {member.degree ? `${member.degree} visible connection${member.degree === 1 ? '' : 's'} · ` : ''}
              {actionLabel}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

export function InspectorClusterView({
  InspectorSummaryCardComponent,
  InspectorClearSelectionButtonComponent,
  selectedProps,
  clearSelection,
  viewMode,
  onOpenPersonDetail,
  onOpenPlaceDetail,
}) {
  const memberDetails = (selectedProps?.memberDetails || [])
    .filter((member) => member?.label)
    .slice()
    .sort((a, b) => {
      if ((b.degree || 0) !== (a.degree || 0)) return (b.degree || 0) - (a.degree || 0);
      return a.label.localeCompare(b.label);
    });

  const fallbackLabels = (selectedProps?.memberLabels || selectedProps?.memberLabelPreview || [])
    .filter(Boolean)
    .slice()
    .sort((a, b) => a.localeCompare(b));

  const members = memberDetails.length
    ? memberDetails
    : fallbackLabels.map((label, index) => ({
        id: `cluster-member:${label}:${index}`,
        label,
        degree: 0,
      }));

  const representedLabel = viewMode === 'geographic' ? 'Places represented' : 'People represented';
  const memberLabels = members.map((member) => member.label);

  return (
    <div className="space-y-4">
      <InspectorSummaryCardComponent>
        <DetailRow label="Cluster" value={selectedProps.label} />
        <DetailRow label={representedLabel} value={selectedProps.memberCount || selectedProps.clusterSize || members.length} />
        <DetailRow label="Members" value={memberLabels.join('; ')} />
      </InspectorSummaryCardComponent>

      <ClusterMemberList
        members={members}
        viewMode={viewMode}
        onOpenPersonDetail={onOpenPersonDetail}
        onOpenPlaceDetail={onOpenPlaceDetail}
      />

      <InspectorClearSelectionButtonComponent onClear={clearSelection} />
    </div>
  );
}
