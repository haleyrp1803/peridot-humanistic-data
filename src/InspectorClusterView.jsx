/*
 * Cluster Inspector view.
 *
 * This component renders evidence for a map/network cluster, including grouped
 * member lists and navigation into individual member details.
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

function ClusterLead({ selectedProps, members, representedLabel }) {
  const label = selectedProps?.label || 'Current cluster';
  const memberCount = selectedProps?.memberCount || selectedProps?.clusterSize || members.length;

  return (
    <section className="rounded-2xl border border-[var(--section-border)] bg-[var(--section-bg)] p-3">
      <div className="grid gap-4 md:grid-cols-[12rem_minmax(0,1fr)]">
        <div className="flex h-36 items-center justify-center rounded-xl border border-[var(--section-border)]/80 bg-[var(--panel-bg)]/65 text-center">
          <div>
            <div className="text-3xl font-semibold text-[var(--detail-label-text)]">{memberCount}</div>
            <div className="mt-1 px-3 text-xs uppercase tracking-[0.16em] text-[var(--text-muted)]">
              grouped items
            </div>
          </div>
        </div>
        <div>
          <div className={detailLabelClassName()}>Cluster</div>
          <h2 className="mt-1 [font-family:Georgia,'Palatino_Linotype','Book_Antiqua',Palatino,serif] text-2xl font-semibold tracking-[-0.025em] text-[var(--heading-text)]">
            {label}
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-[var(--text-main)]">
            This cluster groups <span className="font-semibold text-[var(--text-strong)]">{memberCount}</span>{' '}
            {representedLabel.toLowerCase()} in the current visualization scope. Select a row below to open that entity
            in the Inspector.
          </p>
        </div>
      </div>
    </section>
  );
}

function ClusterMemberGroups({ members, viewMode, onOpenPersonDetail, onOpenPlaceDetail, isCompact = false }) {
  const isGeographic = viewMode === 'geographic';
  const memberKindLabel = isGeographic ? 'places' : 'people';
  const memberKindSingular = isGeographic ? 'place' : 'person';
  const actionLabel = isGeographic ? 'Open place' : 'Open person';
  const openDetail = isGeographic ? onOpenPlaceDetail : onOpenPersonDetail;
  const groups = buildMemberGroups(members, isGeographic);
  const visibleGroups = isCompact ? groups.slice(0, 4) : groups;

  if (!members.length) {
    return (
      <div className="rounded-2xl border border-[var(--section-border)] bg-[var(--section-bg)] p-3 text-sm text-[var(--text-muted)]">
        No contained {memberKindLabel} were found for this cluster.
      </div>
    );
  }

  return (
    <section className="rounded-2xl border border-[var(--section-border)] bg-[var(--section-bg)] p-3">
      <div className={detailLabelClassName()}>{isGeographic ? 'Places in this cluster' : 'People in this cluster'}</div>
      <div className="mt-2 divide-y divide-[var(--section-border)]/70 overflow-hidden rounded-xl border border-[var(--section-border)]/75 bg-[var(--panel-bg)]/55">
        {visibleGroups.map((group) => (
          <div key={group.label} className="px-3 py-2">
            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold text-[var(--text-strong)]">{group.label}</div>
                <div className="mt-0.5 text-xs text-[var(--text-muted)]">
                  {group.members.length} {group.members.length === 1 ? memberKindSingular : memberKindLabel} · {formatVolume(group.totalDegree)}
                </div>
              </div>
              {isGeographic ? (
                <button
                  type="button"
                  onClick={() => openDetail?.(group.label)}
                  className="rounded-full border border-[var(--inspector-clickable-border)] bg-[var(--inspector-clickable-bg)] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--inspector-clickable-text)] transition hover:border-[var(--inspector-clickable-hover-border)] hover:bg-[var(--inspector-clickable-hover-bg)] hover:text-[var(--inspector-clickable-hover-text)]"
                  title={`${actionLabel}: ${group.label}`}
                >
                  Open
                </button>
              ) : null}
            </div>

            {!isGeographic ? (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {(isCompact ? group.members.slice(0, 5) : group.members).map((member) => (
                  <button
                    key={member.id || `${group.label}:${member.label}`}
                    type="button"
                    onClick={() => openDetail?.(member.label)}
                    className="rounded-full border border-[var(--inspector-clickable-border)] bg-[var(--inspector-clickable-bg)] px-2.5 py-1 text-xs text-[var(--inspector-clickable-text)] transition hover:border-[var(--inspector-clickable-hover-border)] hover:bg-[var(--inspector-clickable-hover-bg)] hover:text-[var(--inspector-clickable-hover-text)]"
                    title={`${actionLabel}: ${member.label}`}
                  >
                    {member.label}
                  </button>
                ))}
              </div>
            ) : (
              <div className="mt-1 text-xs text-[var(--text-muted)]">
                {group.members.slice(0, 4).map((member) => member.label).join('; ')}
                {group.members.length > 4 ? `; + ${group.members.length - 4} more` : ''}
              </div>
            )}
          </div>
        ))}
      </div>
      {isCompact && groups.length > visibleGroups.length ? (
        <div className="mt-2 rounded-xl border border-[var(--section-border)]/70 bg-[var(--panel-card-bg)] px-3 py-2 text-xs text-[var(--text-muted)]">
          Expand the Inspector to view all cluster groups and members.
        </div>
      ) : null}
    </section>
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

  if (isCompact) {
    return (
      <div className="space-y-3">
        <InspectorSummaryCardComponent>
          <DetailRow label="Cluster" value={selectedProps.label} />
          <DetailRow label={representedLabel} value={selectedProps.memberCount || selectedProps.clusterSize || members.length} />
          <DetailRow label="Preview" value={memberLabels.slice(0, 8).join('; ')} />
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

  return (
    <article className="space-y-3">
      <ClusterLead selectedProps={selectedProps} members={members} representedLabel={representedLabel} />

      <div className="peridot-ornament-divider py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--detail-label-text)]">
        Cluster members
      </div>

      <ClusterMemberGroups
        members={members}
        viewMode={viewMode}
        onOpenPersonDetail={onOpenPersonDetail}
        onOpenPlaceDetail={onOpenPlaceDetail}
        isCompact={isCompact}
      />

      <div className="flex justify-end">
        <InspectorClearSelectionButtonComponent onClear={clearSelection} />
      </div>
    </article>
  );
}
