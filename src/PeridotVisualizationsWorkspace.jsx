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
    {
      key: 'place-map',
      label: 'Place Map',
      active: viewMode === 'geographic',
      action: onSelectPlaceMap,
    },
    {
      key: 'people-network',
      label: 'People Network',
      active: viewMode === 'person' && personLayoutMode === 'geographic',
      action: onSelectPeopleNetwork,
    },
    {
      key: 'force-directed',
      label: 'Force-Directed',
      active: viewMode === 'person' && personLayoutMode === 'force',
      action: onSelectForceDirected,
    },
  ];

  return (
    <section className="flex h-full min-h-0 flex-col bg-[var(--title-bar-bg)] text-[var(--text-main)]">
      <div className="flex min-h-0 flex-1 flex-col gap-3 px-4 py-4">
        <div className="shrink-0 rounded-[18px] border border-[var(--title-input-border)]/70 bg-[var(--title-input-bg)] px-4 py-3 pl-[76px] shadow-[0_10px_24px_rgba(0,0,0,0.14)] backdrop-blur-sm sm:pl-[80px]">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--title-display-text)]/75">
                Visualization workspace
              </p>
              <h1 className="mt-0.5 truncate [font-family:Georgia,'Palatino_Linotype','Book_Antiqua',Palatino,serif] text-xl font-bold text-[var(--title-display-text)] md:text-2xl">
                {activeVisualizationLabel}
              </h1>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {viewOptions.map((option) => (
                <button
                  key={option.key}
                  type="button"
                  onClick={option.action}
                  className={[
                    'rounded-full border px-4 py-2 text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/45',
                    option.active
                      ? 'border-[var(--button-primary-active-border)] bg-[var(--button-primary-active-bg)] text-[var(--button-primary-text)] shadow-[0_8px_16px_rgba(0,0,0,0.16)]'
                      : 'border-[var(--button-secondary-border)] bg-[var(--button-secondary-bg)] text-[var(--button-secondary-text)] hover:bg-[var(--button-secondary-hover)]',
                  ].join(' ')}
                  aria-pressed={option.active}
                >
                  {option.label}
                </button>
              ))}

              <button
                type="button"
                onClick={onOpenAnalytics}
                className={[
                  'rounded-full border px-4 py-2 text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/45',
                  showingAnalytics
                    ? 'border-[var(--button-primary-active-border)] bg-[var(--button-primary-active-bg)] text-[var(--button-primary-text)] shadow-[0_8px_16px_rgba(0,0,0,0.16)]'
                    : 'border-[var(--button-secondary-border)] bg-[var(--button-secondary-bg)] text-[var(--button-secondary-text)] hover:bg-[var(--button-secondary-hover)]',
                ].join(' ')}
                aria-pressed={showingAnalytics}
              >
                Analytics
              </button>
            </div>
          </div>
        </div>

        {showingAnalytics ? (
          <div className="peridot-analytics-workspace min-h-0 flex-1 overflow-auto rounded-2xl border border-[var(--panel-border)] bg-[var(--sidebar-bg)] p-3 shadow-[0_18px_50px_rgba(0,0,0,0.22)] md:p-4">
            <AnalyticsPanelContent analyticsState={analyticsWorkspaceProps.analyticsState} />
          </div>
        ) : (
          <div className="flex min-h-0 flex-1 overflow-hidden rounded-2xl border border-[var(--panel-border)] bg-[var(--map-water)] shadow-[0_18px_50px_rgba(0,0,0,0.22)]">
            <MapStageComponent {...mapStageProps} />
          </div>
        )}
      </div>
    </section>
  );
}
