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
          ? 'border-[#5f7f4f] bg-[#dfe9c8] text-[#173120]'
          : 'border-[#9b6f2f] bg-[#f0d9a8] text-[#4c3216]',
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
    <section className="flex h-full min-h-0 flex-col overflow-hidden bg-[#04160f] text-[#fbf7ea]">
      <div className="peridot-workspace-field flex min-h-0 flex-1 flex-col overflow-hidden">
        <div className="relative flex min-h-0 flex-1 flex-col gap-4 px-4 py-4">
          <div className="shrink-0 rounded-[28px] border border-[#c4e0ef]/70 bg-[linear-gradient(135deg,rgba(8,39,25,0.95),rgba(5,29,19,0.96))] pb-4 pl-[76px] pr-4 pt-3 shadow-[0_18px_46px_rgba(0,0,0,0.34)] backdrop-blur-sm sm:pl-[80px]">
            <div className="flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
              <div className="min-w-0">
                <p className="peridot-kicker !mb-0 text-[10px]">Explore your data</p>
                <h1 className="mt-1 [font-family:Georgia,'Palatino_Linotype','Book_Antiqua',Palatino,serif] text-2xl font-bold tracking-[-0.035em] text-[#f5ecd2] md:text-3xl">
                  Capabilities and evidence
                </h1>
                <p className="mt-2 max-w-3xl text-sm leading-relaxed text-[#dfe9c8]">
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
            <section className="min-h-0 overflow-auto rounded-[28px] border border-[#dfe9c8]/40 bg-[#f8f4e6] p-5 text-[#24382d] shadow-[0_20px_54px_rgba(0,0,0,0.28)]">
              <p className="peridot-kicker text-[11px] text-[#66815b]">Capability summary</p>
              <h2 className="[font-family:Georgia,'Palatino_Linotype','Book_Antiqua',Palatino,serif] text-2xl font-bold tracking-[-0.035em] text-[#132a20]">
                What this dataset can do
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-[#52675a]">
                Peridot treats uploaded rows as records with mapped roles. A dataset can be valid even when it supports only some visualization and evidence tools.
              </p>

              <div className="mt-5 grid gap-3">
                {capabilityRows.map((row) => (
                  <div
                    key={row.label}
                    className={[
                      'rounded-2xl border p-4',
                      row.ready
                        ? 'border-[#8aa36d]/60 bg-[#dfe9c8]'
                        : 'border-[#d5c7a8] bg-[#f3ecd9]',
                    ].join(' ')}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="font-bold text-[#172b20]">{row.label}</h3>
                      <CapabilityPill ready={row.ready} />
                    </div>
                    <div className="mt-2 text-lg font-bold text-[#172b20]">{row.value}</div>
                    <p className="mt-1 text-sm leading-relaxed text-[#4e6255]">{row.note}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="flex min-h-0 flex-col overflow-hidden rounded-[28px] border border-[#b9d37d]/38 bg-[linear-gradient(145deg,rgba(2,14,9,0.98),rgba(8,31,22,0.96)_44%,rgba(25,55,43,0.92))] p-3 text-[#f7fbe9] shadow-[0_20px_54px_rgba(0,0,0,0.36)] ring-1 ring-[#d7e77f]/14 sm:p-4">
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
