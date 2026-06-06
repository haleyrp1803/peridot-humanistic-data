import React, { useEffect, useMemo, useRef, useState } from 'react';

import { AnalyticsPanelContent } from './AnalyticsPanel.jsx';
import { VisualizationTimelineScrubber } from './timelinePlaybackComponents.jsx';
import { ANALYTICS_CHART_DEFINITIONS } from './analyticsConfig.js';

const VISUALIZATION_TOOLS = Object.freeze({
  POINT_MAP: 'point-map',
  ROUTE_MAP: 'route-map',
  ENTITY_NETWORK: 'entity-network',
  FORCE_NETWORK: 'force-network',
  CHART_WORKSPACE: 'chart-workspace',
  CAPABILITY_SUMMARY: 'capability-summary',
});

function chartToolKey(chartType) {
  return `chart:${chartType}`;
}

function chartTypeFromToolKey(toolKey) {
  return String(toolKey || '').startsWith('chart:') ? String(toolKey).slice(6) : null;
}

function numberLabel(value) {
  return Number.isFinite(value) ? String(value) : '0';
}

function CompatibilityStatusPill({ available, light = false }) {
  return (
    <span
      className={[
        'shrink-0 rounded-full border px-2 py-1 text-[10px] font-bold uppercase tracking-[0.16em]',
        light
          ? available
            ? 'border-[#5f7f4f] bg-[#dfe9c8] text-[#173120]'
            : 'border-[#9b6f2f] bg-[#f0d9a8] text-[#4c3216]'
          : available
            ? 'border-[#dfe9c8]/80 bg-[#dfe9c8]/30 text-[#fff8e8]'
            : 'border-[#e7c27d] bg-[#b58b42]/35 text-[#fff2cf]',
      ].join(' ')}
    >
      {available ? 'Available' : 'Not available'}
    </span>
  );
}

function UnavailableVisualizationState({
  title,
  why,
  availableInstead = [],
  counts = [],
}) {
  return (
    <div className="flex min-h-0 flex-1 items-center justify-center overflow-auto rounded-[28px] border border-[#c4e0ef]/50 bg-[#071f16] p-5 shadow-[0_20px_54px_rgba(0,0,0,0.34)]">
      <div className="w-full max-w-4xl rounded-[28px] border border-[#dfe9c8]/50 bg-[#f8f4e6] p-6 text-[#24382d] shadow-[0_18px_46px_rgba(0,0,0,0.22)]">
        <p className="peridot-kicker text-[11px] text-[#66815b]">Visualization compatibility</p>
        <h2 className="[font-family:Georgia,'Palatino_Linotype','Book_Antiqua',Palatino,serif] text-3xl font-bold tracking-[-0.035em] text-[#132a20]">
          {title}
        </h2>
        <div className="mt-4 rounded-2xl border border-[#d5c7a8] bg-[#f3ecd9] p-4">
          <h3 className="text-sm font-bold text-[#25382d]">Why</h3>
          <p className="mt-2 text-sm leading-relaxed text-[#4b5c50]">{why}</p>
        </div>
        {availableInstead.length ? (
          <div className="mt-4 rounded-2xl border border-[#cbdab2] bg-[#edf4df] p-4">
            <h3 className="text-sm font-bold text-[#25382d]">Available instead</h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {availableInstead.map((item) => (
                <span key={item} className="rounded-full border border-[#8aa36d]/50 bg-[#dfe9c8] px-3 py-1 text-sm font-semibold text-[#26382b]">
                  {item}
                </span>
              ))}
            </div>
          </div>
        ) : null}
        {counts.length ? (
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {counts.map((item) => (
              <div key={item.label} className="rounded-2xl border border-[#d5c7a8] bg-[#fffdf6] p-3">
                <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#6a7b65]">{item.label}</div>
                <div className="mt-1 text-xl font-bold text-[#172b20]">{item.value}</div>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}

function CapabilitySummaryWorkspace({ availability, onOpenSearch }) {
  const rows = [
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
        ? 'The active dataset can be sent to Chart Visualizations, where chart types expose x-axis, y-axis, grouping, series, and aggregation controls.'
        : 'No active records are available for charting.',
    },
  ];

  return (
    <div className="min-h-0 flex-1 overflow-auto rounded-[28px] border border-[#c4e0ef]/50 bg-[#071f16] p-4 shadow-[0_20px_54px_rgba(0,0,0,0.34)]">
      <div className="rounded-[28px] border border-[#dfe9c8]/50 bg-[#f8f4e6] p-5 text-[#24382d]">
        <p className="peridot-kicker text-[11px] text-[#66815b]">Explore your data</p>
        <h2 className="[font-family:Georgia,'Palatino_Linotype','Book_Antiqua',Palatino,serif] text-3xl font-bold tracking-[-0.035em] text-[#132a20]">
          Dataset capability summary
        </h2>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-[#52675a]">
          Peridot now treats datasets as records with mapped roles. Some datasets support maps, some support networks, some support charts, and some are best explored as evidence records.
        </p>
        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {rows.map((row) => (
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
                <CompatibilityStatusPill available={row.ready} />
              </div>
              <div className="mt-3 text-xl font-bold text-[#172b20]">{row.value}</div>
              <p className="mt-2 text-sm leading-relaxed text-[#4e6255]">{row.note}</p>
            </div>
          ))}
        </div>
        {onOpenSearch ? (
          <button
            type="button"
            onClick={onOpenSearch}
            className="mt-5 rounded-full border border-[#8aa36d]/60 bg-[#edf4df] px-4 py-2 text-sm font-bold text-[#203429] transition hover:border-[#f5ecd2]/90 hover:bg-[#b58b42] hover:text-[#fff8e8] focus:outline-none focus:ring-2 focus:ring-[#d6a36a]/60"
          >
            Open Search & Filter
          </button>
        ) : null}
      </div>
    </div>
  );
}

export function PeridotVisualizationsWorkspace({
  pageTitle,
  setPageTitle,
  mapStageProps,
  MapStageComponent,
  viewMode,
  personLayoutMode,
  visualizationsWorkspacePanel,
  analyticsWorkspaceProps,
  visualizationAvailability,
  onSelectPlaceMap,
  onSelectPeopleNetwork,
  onSelectForceDirected,
  onOpenAnalytics,
  onOpenChartVisualization,
  onOpenSearch,
  timelineControlsProps,
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

  const initialTool = visualizationsWorkspacePanel === 'analytics'
    ? VISUALIZATION_TOOLS.CHART_WORKSPACE
    : viewMode === 'geographic'
      ? availability.hasRouteMap
        ? VISUALIZATION_TOOLS.ROUTE_MAP
        : VISUALIZATION_TOOLS.POINT_MAP
      : personLayoutMode === 'force'
        ? VISUALIZATION_TOOLS.FORCE_NETWORK
        : VISUALIZATION_TOOLS.ENTITY_NETWORK;

  const [selectedTool, setSelectedTool] = useState(initialTool);
  const [openMenuCategory, setOpenMenuCategory] = useState(null);
  const [isHeaderExpanded, setIsHeaderExpanded] = useState(true);
  const [isTimelineExpanded, setIsTimelineExpanded] = useState(true);
  const menuCloseTimerRef = useRef(null);

  useEffect(() => {
    if (visualizationsWorkspacePanel === 'analytics') {
      setSelectedTool(VISUALIZATION_TOOLS.CHART_WORKSPACE);
    }
  }, [visualizationsWorkspacePanel]);

  useEffect(() => () => {
    if (menuCloseTimerRef.current) {
      window.clearTimeout(menuCloseTimerRef.current);
    }
  }, []);

  const cancelMenuClose = () => {
    if (menuCloseTimerRef.current) {
      window.clearTimeout(menuCloseTimerRef.current);
      menuCloseTimerRef.current = null;
    }
  };

  const openMenu = (categoryLabel) => {
    cancelMenuClose();
    setOpenMenuCategory(categoryLabel);
  };

  const closeMenu = () => {
    cancelMenuClose();
    setOpenMenuCategory(null);
  };

  const scheduleMenuClose = () => {
    cancelMenuClose();
    menuCloseTimerRef.current = window.setTimeout(() => {
      setOpenMenuCategory(null);
      menuCloseTimerRef.current = null;
    }, 260);
  };

  const toolDefinitions = useMemo(() => ({
    [VISUALIZATION_TOOLS.POINT_MAP]: {
      label: 'Point Map',
      category: 'Mapping Visualizations',
      available: availability.hasPointMap,
      action: onSelectPlaceMap,
      unavailableTitle: 'Point Map is not available for this dataset.',
      why: 'This dataset does not contain mapped point-place or point-coordinate roles.',
      availableInstead: [
        availability.hasRouteMap ? 'Route Map' : null,
        availability.hasCharts ? 'Chart Visualizations' : null,
        availability.hasExploreData ? 'Explore Your Data' : null,
      ].filter(Boolean),
    },
    [VISUALIZATION_TOOLS.ROUTE_MAP]: {
      label: 'Route Map',
      category: 'Mapping Visualizations',
      available: availability.hasRouteMap,
      action: onSelectPlaceMap,
      unavailableTitle: 'Route Map is not available for this dataset.',
      why: 'This dataset does not contain mapped source and target place roles or source-target coordinate pairs.',
      availableInstead: [
        availability.hasPointMap ? 'Point Map' : null,
        availability.hasCharts ? 'Chart Visualizations' : null,
        availability.hasExploreData ? 'Explore Your Data' : null,
      ].filter(Boolean),
    },
    [VISUALIZATION_TOOLS.ENTITY_NETWORK]: {
      label: 'Entity / People Network',
      category: 'Network Visualizations',
      available: availability.hasNetwork,
      action: onSelectPeopleNetwork,
      unavailableTitle: 'Network visualizations are not available for this dataset.',
      why: 'This dataset does not contain mapped source-target entity relationship fields. That is expected for point/site, catalogue, and time-series datasets.',
      availableInstead: [
        availability.hasPointMap ? 'Point Map' : null,
        availability.hasRouteMap ? 'Route Map' : null,
        availability.hasCharts ? 'Chart Visualizations' : null,
        availability.hasExploreData ? 'Explore Your Data' : null,
      ].filter(Boolean),
    },
    [VISUALIZATION_TOOLS.FORCE_NETWORK]: {
      label: 'Force-Directed Network',
      category: 'Network Visualizations',
      available: availability.hasNetwork,
      action: onSelectForceDirected,
      unavailableTitle: 'Force-Directed Network is not available for this dataset.',
      why: 'Force-directed layouts require mapped source-target entity relationships. This dataset can still be valid even when it does not contain network data.',
      availableInstead: [
        availability.hasPointMap ? 'Point Map' : null,
        availability.hasRouteMap ? 'Route Map' : null,
        availability.hasCharts ? 'Chart Visualizations' : null,
        availability.hasExploreData ? 'Explore Your Data' : null,
      ].filter(Boolean),
    },
    [VISUALIZATION_TOOLS.CHART_WORKSPACE]: {
      label: 'Chart Visualizations',
      category: 'Chart Visualizations',
      available: availability.hasCharts,
      action: onOpenAnalytics,
      unavailableTitle: 'Chart Visualizations are not available for this dataset.',
      why: 'No active records or chartable fields are available for charting.',
      availableInstead: [
        availability.hasPointMap ? 'Point Map' : null,
        availability.hasRouteMap ? 'Route Map' : null,
        availability.hasNetwork ? 'Network Visualizations' : null,
        availability.hasExploreData ? 'Explore Your Data' : null,
      ].filter(Boolean),
    },
    [VISUALIZATION_TOOLS.CAPABILITY_SUMMARY]: {
      label: 'Capability Summary',
      category: 'Explore Your Data',
      available: true,
      action: null,
      unavailableTitle: '',
      why: '',
      availableInstead: [],
    },
  }), [availability.hasCharts, availability.hasExploreData, availability.hasNetwork, availability.hasPointMap, availability.hasRouteMap, onOpenAnalytics, onOpenChartVisualization, onSelectForceDirected, onSelectPeopleNetwork, onSelectPlaceMap]);

  const selectedDefinition = toolDefinitions[selectedTool] || toolDefinitions[VISUALIZATION_TOOLS.CAPABILITY_SUMMARY];
  const activeVisualizationLabel = selectedDefinition.label;

  const categories = [
    {
      label: 'Mapping Visualizations',
      description: 'Point and route maps',
      tools: [VISUALIZATION_TOOLS.POINT_MAP, VISUALIZATION_TOOLS.ROUTE_MAP],
    },
    {
      label: 'Network Visualizations',
      description: 'Entity relationship views',
      tools: [VISUALIZATION_TOOLS.ENTITY_NETWORK, VISUALIZATION_TOOLS.FORCE_NETWORK],
    },
    {
      label: 'Chart Visualizations',
      description: 'Choose a chart type',
      tools: [VISUALIZATION_TOOLS.CHART_WORKSPACE],
    },
    {
      label: 'Explore Your Data',
      description: 'Capability and search tools',
      tools: [VISUALIZATION_TOOLS.CAPABILITY_SUMMARY],
    },
  ];

  const selectTool = (toolKey) => {
    const tool = toolDefinitions[toolKey];
    setSelectedTool(toolKey);
    closeMenu();
    if (tool?.available && typeof tool.action === 'function') {
      tool.action();
    }
  };

  const categoryClass = (active) => [
    'relative rounded-2xl border text-[#fbf7ea] transition focus-within:ring-2 focus-within:ring-[#d6a36a]/60',
    active
      ? 'border-[#f5ecd2]/90 bg-[#b58b42]/75 shadow-[0_12px_28px_rgba(0,0,0,0.26)]'
      : 'border-[#dfe9c8]/40 bg-[#dfe9c8]/10 hover:border-[#f5ecd2]/80 hover:bg-[#b58b42]/70',
  ].join(' ');
  const menuItemClass = (active, available) => [
    'flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2 text-left text-sm transition focus:outline-none focus:ring-2 focus:ring-[#d6a36a]/60',
    active
      ? 'bg-[#b58b42] font-bold text-[#fff8e8] shadow-inner'
      : available
        ? 'text-[#1d3326] hover:bg-[#dfe9c8]'
        : 'text-[#4f4330] hover:bg-[#f3e4bf]',
  ].join(' ');

  const counts = [
    { label: 'Point places', value: numberLabel(availability.pointCount) },
    { label: 'Routes', value: numberLabel(availability.routeCount) },
    { label: 'Network edges', value: numberLabel(availability.networkEdgeCount) },
    { label: 'Rows', value: numberLabel(availability.rowCount) },
  ];

  const renderWorkspaceBody = () => {
    if (selectedTool === VISUALIZATION_TOOLS.CAPABILITY_SUMMARY) {
      return <CapabilitySummaryWorkspace availability={availability} onOpenSearch={onOpenSearch} />;
    }

    if (!selectedDefinition.available) {
      return (
        <UnavailableVisualizationState
          title={selectedDefinition.unavailableTitle}
          why={selectedDefinition.why}
          availableInstead={selectedDefinition.availableInstead}
          counts={counts}
        />
      );
    }

    if (selectedTool === VISUALIZATION_TOOLS.CHART_WORKSPACE || chartTypeFromToolKey(selectedTool)) {
      return (
        <div className="peridot-analytics-workspace min-h-0 flex-1 overflow-hidden rounded-[28px] border border-[#c4e0ef]/50 bg-[rgba(8,39,25,0.9)] p-2 shadow-[0_20px_54px_rgba(0,0,0,0.34)] backdrop-blur-sm md:p-3">
          <AnalyticsPanelContent analyticsState={analyticsWorkspaceProps.analyticsState} />
        </div>
      );
    }

    return (
      <div className="flex min-h-0 flex-1 overflow-hidden rounded-[28px] border border-[#c4e0ef]/50 bg-[var(--map-water)] shadow-[0_20px_54px_rgba(0,0,0,0.34)]">
        <MapStageComponent {...mapStageProps} />
      </div>
    );
  };

  return (
    <section className="flex h-full min-h-0 flex-col overflow-hidden bg-[#04160f] text-[#fbf7ea]">
      <div className="peridot-workspace-field flex min-h-0 flex-1 flex-col overflow-hidden">
        <div className="relative z-0 flex min-h-0 flex-1 flex-col gap-3 px-4 py-4">
          <div
            className={[
              'relative z-50 shrink-0 rounded-[28px] border border-[#c4e0ef]/70 bg-[linear-gradient(135deg,rgba(8,39,25,0.95),rgba(5,29,19,0.96))] pl-[76px] shadow-[0_18px_46px_rgba(0,0,0,0.34)] backdrop-blur-sm sm:pl-[80px]',
              isHeaderExpanded ? 'px-4 pb-4 pt-3' : 'px-4 py-2',
            ].join(' ')}
          >
            {isHeaderExpanded ? (
              <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                <div className="min-w-0">
                  <p className="peridot-kicker !mb-0 text-[10px]">Visualization workspace</p>
                  <h1 className="mt-1 truncate [font-family:Georgia,'Palatino_Linotype','Book_Antiqua',Palatino,serif] text-2xl font-bold tracking-[-0.035em] text-[#f5ecd2] md:text-3xl">
                    {activeVisualizationLabel}
                  </h1>
                </div>

                <div className="relative z-[70] grid gap-2 sm:grid-cols-2 xl:min-w-[660px] xl:grid-cols-4">
                  {categories.map((category) => {
                    const isOpen = openMenuCategory === category.label;
                    return (
                      <div
                        key={category.label}
                        className={categoryClass(isOpen)}
                        onMouseEnter={() => openMenu(category.label)}
                        onMouseLeave={scheduleMenuClose}
                        onFocus={() => openMenu(category.label)}
                      >
                        <button
                          type="button"
                          className="w-full px-3 py-2 text-left focus:outline-none"
                          onClick={() => (isOpen ? closeMenu() : openMenu(category.label))}
                          aria-expanded={isOpen}
                        >
                          <span className="block text-sm font-bold">{category.label}</span>
                          <span className="mt-1 block text-[11px] leading-snug text-[#dfe9c8]">{category.description}</span>
                        </button>
                        {isOpen ? (
                          <>
                            <div
                              aria-hidden="true"
                              className="absolute left-0 right-0 top-full z-[95] h-4"
                              onMouseEnter={() => openMenu(category.label)}
                            />
                            <div
                              className="absolute right-0 top-[calc(100%+10px)] z-[100] min-w-[280px] rounded-2xl border border-[#bfa46d] bg-[#fffaf0] p-2 text-[#203429] shadow-[0_18px_38px_rgba(0,0,0,0.36)]"
                              onMouseEnter={() => openMenu(category.label)}
                              onMouseLeave={scheduleMenuClose}
                              onFocus={() => openMenu(category.label)}
                            >
                              {category.tools.map((toolKey) => {
                                const tool = toolDefinitions[toolKey];
                                return (
                                  <button
                                    key={toolKey}
                                    type="button"
                                    onClick={() => selectTool(toolKey)}
                                    className={menuItemClass(selectedTool === toolKey, tool.available)}
                                  >
                                    <span className="pr-2 leading-snug">{tool.label}</span>
                                    <CompatibilityStatusPill available={tool.available} light />
                                  </button>
                                );
                              })}
                            </div>
                          </>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="flex h-8 items-center justify-between gap-3">
                <div className="min-w-0">
                  <span className="peridot-kicker !mb-0 mr-3 inline text-[9px] text-[#dfe9c8]">Visualization workspace</span>
                  <span className="truncate text-sm font-bold text-[#f5ecd2]">{activeVisualizationLabel}</span>
                </div>
                <span className="rounded-full border border-[#dfe9c8]/35 bg-[#dfe9c8]/10 px-3 py-1 text-[11px] font-semibold text-[#dfe9c8]">
                  Navigation minimized
                </span>
              </div>
            )}

            <button
              type="button"
              onClick={() => setIsHeaderExpanded((value) => !value)}
              className="absolute bottom-0 left-1/2 z-[120] flex h-8 w-14 -translate-x-1/2 translate-y-1/2 items-center justify-center rounded-full border border-[#dfe9c8]/70 bg-[#f5ecd2] text-lg font-bold leading-none text-[#173120] shadow-[0_8px_20px_rgba(0,0,0,0.28)] transition hover:bg-[#d6a36a] focus:outline-none focus:ring-2 focus:ring-[#d6a36a]/70"
              aria-label={isHeaderExpanded ? 'Collapse visualization header' : 'Expand visualization header'}
              title={isHeaderExpanded ? 'Collapse visualization header' : 'Expand visualization header'}
            >
              {isHeaderExpanded ? '⌃' : '⌄'}
            </button>
          </div>

          <div className="relative z-0 flex min-h-0 flex-1 flex-col gap-3" onMouseEnter={scheduleMenuClose}>
            <div className="min-h-0 flex flex-1">
              {renderWorkspaceBody()}
            </div>
            {timelineControlsProps ? (
              <div className="relative shrink-0 pt-2">
                <button
                  type="button"
                  onClick={() => setIsTimelineExpanded((value) => !value)}
                  className="absolute left-1/2 top-2 z-30 flex h-8 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-[#dfe9c8]/70 bg-[#f5ecd2] text-lg font-bold leading-none text-[#173120] shadow-[0_8px_20px_rgba(0,0,0,0.28)] transition hover:bg-[#d6a36a] focus:outline-none focus:ring-2 focus:ring-[#d6a36a]/70"
                  aria-label={isTimelineExpanded ? 'Collapse timeline' : 'Expand timeline'}
                  title={isTimelineExpanded ? 'Collapse timeline' : 'Expand timeline'}
                >
                  {isTimelineExpanded ? '⌄' : '⌃'}
                </button>
                {isTimelineExpanded ? (
                  <VisualizationTimelineScrubber {...timelineControlsProps} />
                ) : (
                  <div className="flex h-10 items-center justify-between rounded-[24px] border border-[#c4e0ef]/50 bg-[linear-gradient(135deg,rgba(8,39,25,0.96),rgba(5,29,19,0.98))] px-5 text-[#fbf7ea] shadow-[0_12px_32px_rgba(0,0,0,0.26)]">
                    <span className="peridot-kicker !mb-0 text-[10px] text-[#dfe9c8]">Timeline</span>
                    <span className="text-sm font-semibold text-[#f5ecd2]">{timelineControlsProps.currentRangeLabel}</span>
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
