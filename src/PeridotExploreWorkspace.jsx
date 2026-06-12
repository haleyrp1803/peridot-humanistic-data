/*
 * Explore Your Data workspace.
 * 
 * This workspace collects data-exploration affordances that are not themselves map/network/chart rendering. It surfaces capability information and provides entry points into Search and Inspector-oriented evidence review.
 * 
 * Important relationships:
 * - Capability labels summarize readiness calculated elsewhere from the active dataset.
 * - Inspector content is reused here so evidence review can live alongside dataset exploration rather than being isolated as a menu item.
 * 
 * Maintenance cautions:
 * - Keep this workspace exploratory rather than making it the global filter owner. Search remains the owner of active-dataset filtering.
 */

import React from 'react';
import { InspectorContent } from './InspectorPanel.jsx';

function numberLabel(value) {
  return Number.isFinite(value) ? String(value) : '0';
}

function CapabilityPill({ ready }) {
  return (
    <span
      className={[
        'rounded-full border px-2 py-1 text-[10px] font-bold uppercase tracking-[0.16em]',
        ready
          ? 'border-[var(--peridot-role-inspector-section-border)] bg-[var(--peridot-role-inspector-section-bg)] text-[var(--peridot-role-inspector-card-text)]'
          : 'border-[var(--peridot-role-status-warning-border)] bg-[var(--peridot-role-status-warning-bg)] text-[var(--peridot-role-status-warning-text)]',
      ].join(' ')}
    >
      {ready ? 'Available' : 'Not available'}
    </span>
  );
}

export function PeridotExploreWorkspace({
  visualizationAvailability,
  workspaceInspectorPanelProps,
  inspectorShellComponents,
  inspectorViewComponents,
  onOpenSearch,
  onOpenVisualizations,
}) {
  const availability = {
    rowCount: 0,
    pointCount: 0,
    routeCount: 0,
    networkNodeCount: 0,
    networkEdgeCount: 0,
    chartFieldCount: 0,
    hasPointMap: false,
    hasRouteMap: false,
    hasNetwork: false,
    hasCharts: false,
    hasExploreData: false,
    ...(visualizationAvailability || {}),
  };

  const capabilityRows = [
    {
      label: 'Point map',
      value: availability.hasPointMap ? `${numberLabel(availability.pointCount)} mapped places` : 'Not available',
      ready: availability.hasPointMap,
      note: availability.hasPointMap
        ? 'One-location records can be explored through the map.'
        : 'No point-place or point-coordinate records are available.',
    },
    {
      label: 'Route map',
      value: availability.hasRouteMap ? `${numberLabel(availability.routeCount)} routes` : 'Not available',
      ready: availability.hasRouteMap,
      note: availability.hasRouteMap
        ? 'Source-target place records can be explored as routes.'
        : 'No mapped source-target place routes are available.',
    },
    {
      label: 'Network views',
      value: availability.hasNetwork ? `${numberLabel(availability.networkEdgeCount)} relationships` : 'Not available',
      ready: availability.hasNetwork,
      note: availability.hasNetwork
        ? 'Source-target entity records can be explored as networks.'
        : 'No mapped source-target entity relationships are available.',
    },
    {
      label: 'Charts',
      value: availability.hasCharts ? `${numberLabel(availability.rowCount)} records` : 'Not available',
      ready: availability.hasCharts,
      note: availability.hasCharts
        ? 'The active dataset can be charted with flexible variables, grouping, series, and aggregation controls.'
        : 'No active records are available for charting.',
    },
  ];

  return (
    <section className="flex h-full min-h-0 flex-col overflow-hidden bg-[var(--peridot-role-interface-app-background)] text-[var(--peridot-role-interface-text-on-dark)]">
      <div className="peridot-workspace-field flex min-h-0 flex-1 flex-col overflow-hidden">
        <div className="relative flex min-h-0 flex-1 flex-col gap-4 px-4 py-4">
          <div className="shrink-0 rounded-[28px] border border-[var(--peridot-role-workspace-chrome-header-border)] bg-[linear-gradient(135deg,var(--peridot-role-workspace-chrome-header-bg),var(--peridot-role-interface-panel-background))] pb-4 pl-[76px] pr-4 pt-3 shadow-[0_18px_46px_var(--peridot-role-card-shadow)] backdrop-blur-sm sm:pl-[80px]">
            <div className="flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
              <div className="min-w-0">
                <p className="peridot-kicker !mb-0 text-[10px]">Explore your data</p>
                <h1 className="mt-1 [font-family:Georgia,'Palatino_Linotype','Book_Antiqua',Palatino,serif] text-2xl font-bold tracking-[-0.035em] text-[var(--peridot-role-workspace-chrome-header-text)] md:text-3xl">
                  Capabilities and evidence
                </h1>
                <p className="mt-2 max-w-3xl text-sm leading-relaxed text-[var(--peridot-role-workspace-chrome-header-muted-text)]">
                  Review what the current dataset can support, then inspect selected people, places, routes, clusters, and linked records from the same workspace.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {onOpenSearch ? (
                  <button type="button" onClick={onOpenSearch} className="peridot-button-secondary">
                    Open Search & Filter
                  </button>
                ) : null}
                {onOpenVisualizations ? (
                  <button type="button" onClick={onOpenVisualizations} className="peridot-button-primary">
                    Return to visualizations
                  </button>
                ) : null}
              </div>
            </div>
          </div>

          <div className="grid min-h-0 flex-1 gap-4 xl:grid-cols-[minmax(360px,0.95fr)_minmax(520px,1.25fr)]">
            <section className="min-h-0 overflow-auto rounded-[28px] border border-[var(--peridot-role-interface-border-subtle)] bg-[var(--peridot-role-interface-card-background)] p-5 text-[var(--peridot-role-interface-text-on-light)] shadow-[0_20px_54px_var(--peridot-role-card-shadow)]">
              <p className="peridot-kicker text-[11px] text-[var(--peridot-role-interface-text-muted-on-light)]">Capability summary</p>
              <h2 className="[font-family:Georgia,'Palatino_Linotype','Book_Antiqua',Palatino,serif] text-2xl font-bold tracking-[-0.035em] text-[var(--peridot-role-interface-text-on-light)]">
                What this dataset can do
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-[var(--peridot-role-interface-text-muted-on-light)]">
                Peridot treats uploaded rows as records with mapped roles. A dataset can be valid even when it supports only some visualization and evidence tools.
              </p>

              <div className="mt-5 grid gap-3">
                {capabilityRows.map((row) => (
                  <div
                    key={row.label}
                    className={[
                      'rounded-2xl border p-4',
                      row.ready
                        ? 'border-[var(--peridot-role-inspector-section-border)] bg-[var(--peridot-role-inspector-section-bg)]'
                        : 'border-[var(--peridot-role-status-warning-border)] bg-[var(--peridot-role-interface-card-background-warm)]',
                    ].join(' ')}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="font-bold text-[var(--peridot-role-interface-text-on-light)]">{row.label}</h3>
                      <CapabilityPill ready={row.ready} />
                    </div>
                    <div className="mt-2 text-lg font-bold text-[var(--peridot-role-interface-text-on-light)]">{row.value}</div>
                    <p className="mt-1 text-sm leading-relaxed text-[var(--peridot-role-interface-text-muted-on-light)]">{row.note}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="flex min-h-0 flex-col overflow-hidden rounded-[28px] border border-[var(--peridot-role-inspector-chrome-border)] bg-[linear-gradient(145deg,var(--peridot-role-inspector-chrome-bg-strong),var(--peridot-role-inspector-chrome-bg)_44%,var(--peridot-role-interface-panel-background))] p-3 text-[var(--peridot-role-inspector-chrome-text)] shadow-[0_20px_54px_var(--peridot-role-card-shadow)] ring-1 ring-[var(--peridot-role-interface-focus-ring)] sm:p-4">
              {workspaceInspectorPanelProps ? (
                <InspectorContent
                  {...workspaceInspectorPanelProps}
                  shellComponents={inspectorShellComponents}
                  viewComponents={inspectorViewComponents}
                  showExpandButton={false}
                  showInlineCloseButton={false}
                  presentation="workspace"
                />
              ) : null}
            </section>
          </div>
        </div>
      </div>
    </section>
  );
}
