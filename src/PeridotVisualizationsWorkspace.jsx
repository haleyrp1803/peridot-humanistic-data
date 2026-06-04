import React from 'react';

import { AnalyticsPanelContent } from './AnalyticsPanel.jsx';

export function PeridotVisualizationsWorkspace({
  pageTitle,
  setPageTitle,
  mapStageProps,
  MapStageComponent,
  viewMode,
  personLayoutMode,
  visualizationsWorkspacePanel,
  analyticsWorkspaceProps,
  onSelectPlaceMap,
  onSelectPeopleNetwork,
  onSelectForceDirected,
  onOpenAnalytics,
}) {
  const showingAnalytics = visualizationsWorkspacePanel === 'analytics';
  const activeVisualizationLabel = showingAnalytics
    ? 'Analytics'
    : viewMode === 'geographic'
      ? 'Place Map'
      : personLayoutMode === 'force'
        ? 'Force-Directed'
        : 'People Network';

  const viewOptions = [
    { key: 'place-map', label: 'Place Map', active: viewMode === 'geographic', action: onSelectPlaceMap },
    { key: 'people-network', label: 'People Network', active: viewMode === 'person' && personLayoutMode === 'geographic', action: onSelectPeopleNetwork },
    { key: 'force-directed', label: 'Force-Directed', active: viewMode === 'person' && personLayoutMode === 'force', action: onSelectForceDirected },
  ];

  const optionClass = (active) => [
    'rounded-full border px-4 py-2 text-sm font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-[#dfe9c8]/45',
    active
      ? 'border-[#f5ecd2]/70 bg-[#6d8b53] text-[#fbf7ea] shadow-[0_8px_18px_rgba(0,0,0,0.24)]'
      : 'border-[#dfe9c8]/40 bg-[#dfe9c8]/10 text-[#fbf7ea] hover:bg-[#dfe9c8]/18',
  ].join(' ');

  return (
    <section className="flex h-full min-h-0 flex-col overflow-hidden bg-[#04160f] text-[#fbf7ea]">
      <div className="peridot-workspace-field flex min-h-0 flex-1 flex-col overflow-hidden">
        <div className="relative z-[1] flex min-h-0 flex-1 flex-col gap-3 px-4 py-4">
          <div className="shrink-0 rounded-[28px] border border-[#c4e0ef]/70 bg-[linear-gradient(135deg,rgba(8,39,25,0.95),rgba(5,29,19,0.96))] px-4 py-3 pl-[76px] shadow-[0_18px_46px_rgba(0,0,0,0.34)] backdrop-blur-sm sm:pl-[80px]">
            <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
              <div className="min-w-0">
                <p className="peridot-kicker !mb-0 text-[11px]">Visualization workspace</p>
                <h1 className="mt-1 truncate [font-family:Georgia,'Palatino_Linotype','Book_Antiqua',Palatino,serif] text-2xl font-bold tracking-[-0.035em] text-[#f5ecd2] md:text-3xl">
                  {activeVisualizationLabel}
                </h1>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {viewOptions.map((option) => (
                  <button key={option.key} type="button" onClick={option.action} className={optionClass(option.active)} aria-pressed={option.active}>
                    {option.label}
                  </button>
                ))}
                <button type="button" onClick={onOpenAnalytics} className={optionClass(showingAnalytics)} aria-pressed={showingAnalytics}>
                  Analytics
                </button>
              </div>
            </div>
          </div>

          {showingAnalytics ? (
            <div className="peridot-analytics-workspace min-h-0 flex-1 overflow-auto rounded-[28px] border border-[#c4e0ef]/50 bg-[rgba(8,39,25,0.9)] p-3 shadow-[0_20px_54px_rgba(0,0,0,0.34)] backdrop-blur-sm md:p-4">
              <AnalyticsPanelContent analyticsState={analyticsWorkspaceProps.analyticsState} />
            </div>
          ) : (
            <div className="flex min-h-0 flex-1 overflow-hidden rounded-[28px] border border-[#c4e0ef]/50 bg-[var(--map-water)] shadow-[0_20px_54px_rgba(0,0,0,0.34)]">
              <MapStageComponent {...mapStageProps} />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
