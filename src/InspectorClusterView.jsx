/*
 * Cluster Inspector view.
 * 
 * This component renders evidence for a map/network cluster, including grouped member lists and navigation into individual member details.
 * 
 * Important relationships:
 * - Cluster selection payloads come from `interactionHelpers.js` and map-layout clustering logic.
 * - Member clicks route back through the shared Inspector navigation managed by `App.jsx`.
 * 
 * Maintenance cautions:
 * - Preserve grouping by place and Back behavior when editing cluster navigation.
 */

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

function formatVolume(value) {
  const safeValue = Number(value) || 0;
  return `${safeValue} visible connection${safeValue === 1 ? '' : 's'}`;
}

function getMemberPlaceLabel(member, isGeographic) {
  if (isGeographic) {
    return member?.anchorLabel || member?.placeLabel || member?.locationLabel || member?.label || 'Unspecified place';
  }

  return member?.anchorLabel || member?.placeLabel || member?.locationLabel || 'Unspecified place';
}

function buildMemberGroups(members, isGeographic) {
  const groupsByPlace = new Map();

  members.forEach((member) => {
    const placeLabel = getMemberPlaceLabel(member, isGeographic);
    const existing = groupsByPlace.get(placeLabel) || {
      label: placeLabel,
      totalDegree: 0,
      members: [],
    };

    existing.totalDegree += Number(member.degree) || 0;
    existing.members.push(member);
    groupsByPlace.set(placeLabel, existing);
  });

  return Array.from(groupsByPlace.values())
    .map((group) => ({
      ...group,
      members: group.members.slice().sort((a, b) => {
        const degreeDelta = (Number(b.degree) || 0) - (Number(a.degree) || 0);
        if (degreeDelta) return degreeDelta;
        return a.label.localeCompare(b.label);
      }),
    }))
    .sort((a, b) => {
      const degreeDelta = (Number(b.totalDegree) || 0) - (Number(a.totalDegree) || 0);
      if (degreeDelta) return degreeDelta;
      return a.label.localeCompare(b.label);
    });
}

function ClusterMemberGroups({ members, viewMode, onOpenPersonDetail, onOpenPlaceDetail, isCompact = false }) {
  const isGeographic = viewMode === 'geographic';
  const memberKindLabel = isGeographic ? 'places' : 'people';
  const memberKindSingular = isGeographic ? 'place' : 'person';
  const actionLabel = isGeographic ? 'Open place detail' : 'Open person detail';
  const openDetail = isGeographic ? onOpenPlaceDetail : onOpenPersonDetail;
  const groups = buildMemberGroups(members, isGeographic);
  const visibleGroups = isCompact ? groups.slice(0, 2) : groups;

  if (!members.length) {
    return (
      <div className="rounded-2xl border border-[var(--section-border)] bg-[var(--section-bg)] p-4 text-sm text-[var(--text-muted)]">
        No contained {memberKindLabel} were found for this cluster.
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-[var(--section-border)] bg-[var(--section-bg)] p-4">
      <div className={detailLabelClassName()}>Contained {memberKindLabel} by place</div>
      <div className="mt-3 space-y-4">
        {visibleGroups.map((group) => (
          <section key={group.label} className="rounded-xl border border-[var(--section-border)]/85 bg-[var(--panel-bg)]/65 p-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-sm font-semibold text-[var(--text-strong)]">{group.label}</div>
                <div className="mt-1 text-xs text-[var(--text-muted)]">
                  {group.members.length} {group.members.length === 1 ? memberKindSingular : memberKindLabel} · {formatVolume(group.totalDegree)}
                </div>
              </div>
            </div>

            <div className="mt-3 space-y-2">
              {(isCompact ? group.members.slice(0, 3) : group.members).map((member) => (
                <button
                  key={member.id || `${group.label}:${member.label}`}
                  type="button"
                  onClick={() => openDetail?.(member.label)}
                  className="w-full rounded-xl border border-[var(--inspector-clickable-border)] bg-[var(--inspector-clickable-bg)] px-3 py-2 text-left text-sm text-[var(--inspector-clickable-text)] transition-colors hover:border-[var(--inspector-clickable-hover-border)] hover:bg-[var(--inspector-clickable-hover-bg)] hover:text-[var(--inspector-clickable-hover-text)]"
                  title={`${actionLabel}: ${member.label}`}
                >
                  <span className="block font-medium">{member.label}</span>
                  <span className="mt-1 block text-xs text-[var(--inspector-clickable-muted-text)]">
                    {formatVolume(member.degree)} · {actionLabel}
                  </span>
                </button>
              ))}
            </div>
          </section>
        ))}
        {isCompact && groups.length > visibleGroups.length ? (
          <div className="rounded-xl border border-[var(--section-border)]/70 bg-[var(--panel-card-bg)] px-3 py-2 text-xs text-[var(--text-muted)]">
            Expand the Inspector to view all cluster groups and members.
          </div>
        ) : null}
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
  isCompact = false,
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
        anchorLabel: '',
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

      <ClusterMemberGroups
        members={members}
        viewMode={viewMode}
        onOpenPersonDetail={onOpenPersonDetail}
        onOpenPlaceDetail={onOpenPlaceDetail}
        isCompact={isCompact}
      />

      <InspectorClearSelectionButtonComponent onClear={clearSelection} />
    </div>
  );
}
