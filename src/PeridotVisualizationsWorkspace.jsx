/*
 * Explore-direct routing pass.
 *
 * Main visualization workspace.
 * 
 * This component coordinates the visualization header, visualization-category menus, map/network/chart stage, capability-unavailable states, header Export menu, collapsible header, and bottom Timeline scrubber.
 * 
 * Important relationships:
 * - `App.jsx` owns the current data, selected visualization, map stage, export handlers, and timeline state passed here.
 * - `AnalyticsPanel.jsx` owns chart controls/rendering but registers chart export with the shared header export menu.
 * - `timelinePlaybackComponents.jsx` renders the bottom scrubber used here.
 * 
 * Maintenance cautions:
 * - This is now a key workspace-coordination file. Keep behavior changes narrow and test maps, networks, charts, timeline, and export after edits.
 * - Header Export should be the single export surface for visualization contexts.
 *
 * Scope contract:
 * - This component does not derive the visible dataset. It receives already-
 *   scoped graph/map/chart props from `App.jsx`.
 * - The bottom timeline scrubber changes global App state; those changes flow
 *   back through graph derivation before this workspace renders the next view.
 * - Header Export should export the same scoped visualization state that is
 *   currently rendered. Do not point export actions at raw uploaded rows unless
 *   adding a separate, explicitly labeled full-dataset export.
 * - Chart export is registered by `AnalyticsPanel.jsx`; map/network export is
 *   passed from App. The header menu switches between those contexts.
 */

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

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

/*
 * Chart menu bridge
 * -----------------
 * Visualizations exposes each Analytics chart as a top-header menu item, while
 * `AnalyticsPanel.jsx` owns the actual chart controls and render stage. The
 * `chart:<type>` tool key keeps the workspace menu decoupled from Analytics
 * internals but still lets a selected menu item open the correct chart type.
 */
function chartToolKey(chartType) {
  return `chart:${chartType}`;
}

function chartTypeFromToolKey(toolKey) {
  return String(toolKey || '').startsWith('chart:') ? String(toolKey).slice(6) : null;
}

function numberLabel(value) {
  return Number.isFinite(value) ? String(value) : '0';
}




function FloatingOrnamentArrowToggle({
  anchorRef,
  placement = 'bottom',
  expanded,
  onClick,
  expandedLabel,
  collapsedLabel,
  expandedArrow,
  collapsedArrow,
}) {
  const [anchorRect, setAnchorRect] = useState(null);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    let frameId = null;
    const updateRect = () => {
      if (frameId) window.cancelAnimationFrame(frameId);
      frameId = window.requestAnimationFrame(() => {
        const node = anchorRef?.current;
        setAnchorRect(node ? node.getBoundingClientRect() : null);
      });
    };

    updateRect();
    window.addEventListener('resize', updateRect);
    window.addEventListener('scroll', updateRect, true);
    return () => {
      if (frameId) window.cancelAnimationFrame(frameId);
      window.removeEventListener('resize', updateRect);
      window.removeEventListener('scroll', updateRect, true);
    };
  }, [anchorRef, expanded]);

  if (typeof document === 'undefined' || !anchorRect) return null;

  const top = placement === 'top' ? anchorRect.top : anchorRect.bottom;
  const left = anchorRect.left + anchorRect.width / 2;
  const label = expanded ? expandedLabel : collapsedLabel;
  const displayLabel = label
    .replace('visualization header', 'header')
    .replace('Visualization header', 'Header');

  return createPortal(
    <button
      type="button"
      onClick={onClick}
      className="pointer-events-auto fixed z-[25] flex h-7 min-w-[8.5rem] -translate-x-1/2 -translate-y-1/2 items-center justify-center gap-2 rounded-full border border-[var(--peridot-role-ornament-line-muted)] bg-[color-mix(in_srgb,var(--peridot-role-interface-panel-background-strong)_78%,transparent)] px-3 text-[var(--peridot-role-interface-text-on-dark)] shadow-[0_7px_16px_rgba(0,0,0,0.28)] backdrop-blur-[1px] transition duration-150 hover:scale-[1.02] hover:border-[var(--peridot-role-ornament-line)] hover:bg-[color-mix(in_srgb,var(--peridot-role-interface-panel-background-strong)_88%,transparent)] hover:text-[var(--peridot-role-ornament-sparkle)] focus:outline-none focus:ring-2 focus:ring-[var(--peridot-role-interface-text-on-dark)]"
      style={{ left, top }}
      aria-label={label}
    >
      <span aria-hidden="true" className="h-px w-5 bg-gradient-to-r from-transparent to-[var(--peridot-role-ornament-line)] opacity-80" />
      <span className="text-[10px] font-extrabold uppercase tracking-[0.18em]">
        {displayLabel}
      </span>
      <span aria-hidden="true" className="h-px w-5 bg-gradient-to-l from-transparent to-[var(--peridot-role-ornament-line)] opacity-80" />
    </button>,
    document.body
  );
}

function FloatingVisualizationMenu({
  anchorRect,
  isOpen,
  children,
  width = 300,
  onMouseEnter,
  onMouseLeave,
  onFocus,
}) {
  if (!isOpen || typeof document === 'undefined' || !anchorRect) return null;

  const margin = 12;
  const top = Math.max(margin, anchorRect.bottom + 10);
  const left = Math.max(
    margin,
    Math.min(window.innerWidth - width - margin, anchorRect.right - width)
  );
  const bridgeLeft = Math.max(margin, anchorRect.left);
  const bridgeWidth = Math.max(32, Math.min(anchorRect.width, window.innerWidth - bridgeLeft - margin));

  return createPortal(
    <>
      <div
        aria-hidden="true"
        className="fixed z-[9998]"
        style={{
          left: bridgeLeft,
          top: anchorRect.bottom,
          width: bridgeWidth,
          height: 14,
        }}
        onMouseEnter={onMouseEnter}
      />
      <div
        className="fixed z-[9999] rounded-2xl border border-[var(--peridot-color-hex-bfa46d)] bg-[var(--peridot-color-hex-fffaf0)] p-2 text-[var(--peridot-color-hex-203429)] shadow-[0_18px_38px_var(--peridot-color-rgba-rgba-0-0-0-0-36)]"
        style={{ left, top, width }}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        onFocus={onFocus}
      >
        {children}
      </div>
    </>,
    document.body
  );
}

function CompatibilityStatusPill({ available, light = false }) {
  return (
    <span
      className={[
        'shrink-0 rounded-full border px-2 py-1 text-[10px] font-bold uppercase tracking-[0.16em]',
        light
          ? available
            ? 'border-[var(--peridot-color-hex-5f7f4f)] bg-[var(--peridot-color-hex-dfe9c8)] text-[var(--peridot-color-hex-173120)]'
            : 'border-[var(--peridot-color-hex-9b6f2f)] bg-[var(--peridot-color-hex-f0d9a8)] text-[var(--peridot-color-hex-4c3216)]'
          : available
            ? 'border-[var(--peridot-color-hex-dfe9c8-a80)] bg-[var(--peridot-color-hex-dfe9c8-a30)] text-[var(--peridot-color-hex-fff8e8)]'
            : 'border-[var(--peridot-color-hex-e7c27d)] bg-[var(--peridot-color-hex-b58b42-a35)] text-[var(--peridot-color-hex-fff2cf)]',
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
    <div className="flex min-h-0 flex-1 items-center justify-center overflow-auto rounded-[28px] border border-[var(--peridot-color-hex-c4e0ef-a50)] bg-[var(--peridot-color-hex-071f16)] p-5 shadow-[0_20px_54px_var(--peridot-color-rgba-rgba-0-0-0-0-34)]">
      <div className="w-full max-w-4xl rounded-[28px] border border-[var(--peridot-color-hex-dfe9c8-a50)] bg-[var(--peridot-color-hex-f8f4e6)] p-6 text-[var(--peridot-color-hex-24382d)] shadow-[0_18px_46px_var(--peridot-color-rgba-rgba-0-0-0-0-22)]">
        <p className="peridot-kicker text-[11px] text-[var(--peridot-color-hex-66815b)]">Visualization compatibility</p>
        <h2 className="[font-family:Georgia,'Palatino_Linotype','Book_Antiqua',Palatino,serif] text-3xl font-bold tracking-[-0.035em] text-[var(--peridot-color-hex-132a20)]">
          {title}
        </h2>
        <div className="mt-4 rounded-2xl border border-[var(--peridot-color-hex-d5c7a8)] bg-[var(--peridot-color-hex-f3ecd9)] p-4">
          <h3 className="text-sm font-bold text-[var(--peridot-color-hex-25382d)]">Why</h3>
          <p className="mt-2 text-sm leading-relaxed text-[var(--peridot-color-hex-4b5c50)]">{why}</p>
        </div>
        {availableInstead.length ? (
          <div className="mt-4 rounded-2xl border border-[var(--peridot-color-hex-cbdab2)] bg-[var(--peridot-color-hex-edf4df)] p-4">
            <h3 className="text-sm font-bold text-[var(--peridot-color-hex-25382d)]">Available instead</h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {availableInstead.map((item) => (
                <span key={item} className="rounded-full border border-[var(--peridot-color-hex-8aa36d-a50)] bg-[var(--peridot-color-hex-dfe9c8)] px-3 py-1 text-sm font-semibold text-[var(--peridot-color-hex-26382b)]">
                  {item}
                </span>
              ))}
            </div>
          </div>
        ) : null}
        {counts.length ? (
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {counts.map((item) => (
              <div key={item.label} className="rounded-2xl border border-[var(--peridot-color-hex-d5c7a8)] bg-[var(--peridot-color-hex-fffdf6)] p-3">
                <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--peridot-color-hex-6a7b65)]">{item.label}</div>
                <div className="mt-1 text-xl font-bold text-[var(--peridot-color-hex-172b20)]">{item.value}</div>
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
    <div className="min-h-0 flex-1 overflow-auto rounded-[28px] border border-[var(--peridot-color-hex-c4e0ef-a50)] bg-[var(--peridot-color-hex-071f16)] p-4 shadow-[0_20px_54px_var(--peridot-color-rgba-rgba-0-0-0-0-34)]">
      <div className="rounded-[28px] border border-[var(--peridot-color-hex-dfe9c8-a50)] bg-[var(--peridot-color-hex-f8f4e6)] p-5 text-[var(--peridot-color-hex-24382d)]">
        <p className="peridot-kicker text-[11px] text-[var(--peridot-color-hex-66815b)]">Explore your data</p>
        <h2 className="[font-family:Georgia,'Palatino_Linotype','Book_Antiqua',Palatino,serif] text-3xl font-bold tracking-[-0.035em] text-[var(--peridot-color-hex-132a20)]">
          Dataset capability summary
        </h2>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-[var(--peridot-color-hex-52675a)]">
          Peridot now treats datasets as records with mapped roles. Some datasets support maps, some support networks, some support charts, and some are best explored as evidence records.
        </p>
        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {rows.map((row) => (
            <div
              key={row.label}
              className={[
                'rounded-2xl border p-4',
                row.ready
                  ? 'border-[var(--peridot-color-hex-8aa36d-a60)] bg-[var(--peridot-color-hex-dfe9c8)]'
                  : 'border-[var(--peridot-color-hex-d5c7a8)] bg-[var(--peridot-color-hex-f3ecd9)]',
              ].join(' ')}
            >
              <div className="flex items-start justify-between gap-3">
                <h3 className="font-bold text-[var(--peridot-color-hex-172b20)]">{row.label}</h3>
                <CompatibilityStatusPill available={row.ready} />
              </div>
              <div className="mt-3 text-xl font-bold text-[var(--peridot-color-hex-172b20)]">{row.value}</div>
              <p className="mt-2 text-sm leading-relaxed text-[var(--peridot-color-hex-4e6255)]">{row.note}</p>
            </div>
          ))}
        </div>
        {onOpenSearch ? (
          <button
            type="button"
            onClick={onOpenSearch}
            className="mt-5 rounded-full border border-[var(--peridot-color-hex-8aa36d-a60)] bg-[var(--peridot-color-hex-edf4df)] px-4 py-2 text-sm font-bold text-[var(--peridot-color-hex-203429)] transition hover:border-[var(--peridot-color-hex-f5ecd2-a90)] hover:bg-[var(--peridot-color-hex-b58b42)] hover:text-[var(--peridot-color-hex-fff8e8)] focus:outline-none focus:ring-2 focus:ring-[var(--peridot-color-hex-d6a36a-a60)]"
          >
            Open Search & Filter
          </button>
        ) : null}
      </div>
    </div>
  );
}

function VisualizationExportMenu({ exportControls, activeVisualizationLabel, compact = false }) {
  const [isOpen, setIsOpen] = useState(false);
  const [menuAnchorRect, setMenuAnchorRect] = useState(null);
  const menuAnchorRef = useRef(null);
  const closeTimerRef = useRef(null);

  useEffect(() => () => {
    if (closeTimerRef.current) {
      window.clearTimeout(closeTimerRef.current);
    }
  }, []);

  if (!exportControls) return null;

  const {
    exportStatus,
    handleExportSvg,
    handleExportPng,
    handleExportNodesCsv,
    handleExportEdgesCsv,
    handleExportChartPng,
    graph,
    chartRowCount,
  } = exportControls;

  const nodeCount = Number.isFinite(graph?.nodes?.length) ? graph.nodes.length : 0;
  const edgeCount = Number.isFinite(graph?.edges?.length) ? graph.edges.length : 0;
  const chartCount = Number.isFinite(chartRowCount) ? chartRowCount : null;
  const canExportSvg = typeof handleExportSvg === 'function';
  const canExportPng = typeof handleExportPng === 'function';
  const canExportNodes = typeof handleExportNodesCsv === 'function' && nodeCount > 0;
  const canExportEdges = typeof handleExportEdgesCsv === 'function' && edgeCount > 0;
  const canExportChartPng = typeof handleExportChartPng === 'function';
  const isChartExportMenu = canExportChartPng && !canExportSvg && !canExportPng && !handleExportNodesCsv && !handleExportEdgesCsv;

  const clearCloseTimer = () => {
    if (closeTimerRef.current) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  };

  const openMenu = () => {
    clearCloseTimer();
    if (menuAnchorRef.current) {
      setMenuAnchorRect(menuAnchorRef.current.getBoundingClientRect());
    }
    setIsOpen(true);
  };

  const closeMenu = () => {
    clearCloseTimer();
    setIsOpen(false);
    setMenuAnchorRect(null);
  };

  const scheduleClose = () => {
    clearCloseTimer();
    closeTimerRef.current = window.setTimeout(() => {
      setIsOpen(false);
      closeTimerRef.current = null;
    }, 260);
  };

  const buttonClass = compact
    ? [
      'rounded-full border px-3 py-1 text-[11px] font-bold transition focus:outline-none focus:ring-2 focus:ring-[var(--peridot-color-hex-d6a36a-a60)]',
      isOpen
        ? 'border-[var(--peridot-color-hex-f5ecd2-a90)] bg-[var(--peridot-color-hex-b58b42)] text-[var(--peridot-color-hex-fff8e8)]'
        : 'border-[var(--peridot-color-hex-dfe9c8-a45)] bg-[var(--peridot-color-hex-dfe9c8-a10)] text-[var(--peridot-color-hex-f5ecd2)] hover:border-[var(--peridot-color-hex-f5ecd2-a90)] hover:bg-[var(--peridot-color-hex-b58b42)]',
    ].join(' ')
    : [
      'w-full rounded-2xl border px-3 py-2 text-left text-[var(--peridot-color-hex-fbf7ea)] transition focus:outline-none focus:ring-2 focus:ring-[var(--peridot-color-hex-d6a36a-a60)]',
      isOpen
        ? 'border-[var(--peridot-color-hex-f5ecd2-a90)] bg-[var(--peridot-color-hex-b58b42-a75)] shadow-[0_12px_28px_var(--peridot-color-rgba-rgba-0-0-0-0-26)]'
        : 'border-[var(--peridot-color-hex-dfe9c8-a40)] bg-[var(--peridot-color-hex-dfe9c8-a10)] hover:border-[var(--peridot-color-hex-f5ecd2-a80)] hover:bg-[var(--peridot-color-hex-b58b42-a70)]',
    ].join(' ');

  const actionButtonClass = (enabled = true) => [
    'flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2 text-left text-sm transition focus:outline-none focus:ring-2 focus:ring-[var(--peridot-color-hex-d6a36a-a60)]',
    enabled
      ? 'text-[var(--peridot-color-hex-1d3326)] hover:bg-[var(--peridot-color-hex-dfe9c8)]'
      : 'cursor-not-allowed text-[var(--peridot-color-hex-6f6554)] hover:bg-[var(--peridot-color-hex-f3e4bf)]',
  ].join(' ');

  const runAction = (handler) => {
    closeMenu();
    if (typeof handler === 'function') {
      handler();
    }
  };

  return (
    <div
      ref={menuAnchorRef}
      className={compact ? 'relative z-[950]' : 'relative z-[900] min-w-[160px]'}
      onMouseEnter={openMenu}
      onMouseLeave={scheduleClose}
      onFocus={openMenu}
    >
      <button
        type="button"
        onClick={() => (isOpen ? closeMenu() : openMenu())}
        className={buttonClass}
        aria-expanded={isOpen}
        aria-label={`Export ${activeVisualizationLabel}`}
        title={`Export ${activeVisualizationLabel}`}
      >
        {compact ? (
          'Export'
        ) : (
          <>
            <span className="block text-sm font-bold">Export</span>
            <span className="mt-1 block text-[11px] leading-snug text-[var(--peridot-color-hex-dfe9c8)]">
              {isChartExportMenu ? 'PNG export' : 'SVG, PNG, and CSV'}
            </span>
          </>
        )}
      </button>

      {isOpen ? (
        <FloatingVisualizationMenu
          anchorRect={menuAnchorRect}
          isOpen={isOpen}
          width={300}
          onMouseEnter={openMenu}
          onMouseLeave={scheduleClose}
          onFocus={openMenu}
        >
            <div className="px-3 pb-2 pt-1 text-xs font-bold uppercase tracking-[0.16em] text-[var(--peridot-color-hex-6f6554)]">
              Export {activeVisualizationLabel}
            </div>

            <div className="grid gap-1">
              {canExportChartPng ? (
                <button
                  type="button"
                  onClick={() => runAction(handleExportChartPng)}
                  className={actionButtonClass(canExportChartPng)}
                  disabled={!canExportChartPng}
                >
                  <span>Export chart PNG</span>
                  {chartCount !== null ? (
                    <span className="shrink-0 rounded-full border border-[var(--peridot-color-hex-d8c79a)] bg-[var(--peridot-color-hex-f5ecd2)] px-2 py-0.5 text-[10px] font-bold text-[var(--peridot-color-hex-6f6554)]">
                      {chartCount}
                    </span>
                  ) : null}
                </button>
              ) : null}

              {canExportSvg ? (
                <button
                  type="button"
                  onClick={() => runAction(handleExportSvg)}
                  className={actionButtonClass(canExportSvg)}
                  disabled={!canExportSvg}
                >
                  <span>Export visualization SVG</span>
                </button>
              ) : null}
              {canExportPng ? (
                <button
                  type="button"
                  onClick={() => runAction(handleExportPng)}
                  className={actionButtonClass(canExportPng)}
                  disabled={!canExportPng}
                >
                  <span>Export visualization PNG</span>
                </button>
              ) : null}
              {typeof handleExportNodesCsv === 'function' ? (
                <button
                  type="button"
                  onClick={() => runAction(handleExportNodesCsv)}
                  className={actionButtonClass(canExportNodes)}
                  disabled={!canExportNodes}
                >
                  <span>Export nodes CSV</span>
                  <span className="shrink-0 rounded-full border border-[var(--peridot-color-hex-d8c79a)] bg-[var(--peridot-color-hex-f5ecd2)] px-2 py-0.5 text-[10px] font-bold text-[var(--peridot-color-hex-6f6554)]">
                    {nodeCount}
                  </span>
                </button>
              ) : null}
              {typeof handleExportEdgesCsv === 'function' ? (
                <button
                  type="button"
                  onClick={() => runAction(handleExportEdgesCsv)}
                  className={actionButtonClass(canExportEdges)}
                  disabled={!canExportEdges}
                >
                  <span>Export routes / edges CSV</span>
                  <span className="shrink-0 rounded-full border border-[var(--peridot-color-hex-d8c79a)] bg-[var(--peridot-color-hex-f5ecd2)] px-2 py-0.5 text-[10px] font-bold text-[var(--peridot-color-hex-6f6554)]">
                    {edgeCount}
                  </span>
                </button>
              ) : null}
            </div>

            {exportStatus?.message ? (
              <div
                className={[
                  'mx-1 mt-3 rounded-xl border p-3 text-xs leading-relaxed',
                  exportStatus.kind === 'error'
                    ? 'border-[var(--peridot-role-status-danger-border)] bg-[var(--peridot-role-status-danger-text)] text-[var(--peridot-role-status-danger-bg)]'
                    : 'border-[var(--peridot-color-hex-cbdab2)] bg-[var(--peridot-color-hex-edf4df)] text-[var(--peridot-color-hex-26382b)]',
                ].join(' ')}
              >
                {exportStatus.message}
                {exportStatus.filename ? (
                  <div className="mt-1 font-semibold">{exportStatus.filename}</div>
                ) : null}
              </div>
            ) : null}
        </FloatingVisualizationMenu>
      ) : null}
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
  onOpenExplore,
  timelineControlsProps,
  exportControls,
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
  const [openMenuAnchorRect, setOpenMenuAnchorRect] = useState(null);
  const [isHeaderExpanded, setIsHeaderExpanded] = useState(true);
  const [isTimelineExpanded, setIsTimelineExpanded] = useState(true);
  const headerToggleAnchorRef = useRef(null);
  const timelineToggleAnchorRef = useRef(null);
  const [chartExportControls, setChartExportControls] = useState(null);
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

  const openMenu = (categoryLabel, anchorElement = null) => {
    cancelMenuClose();
    if (anchorElement && typeof anchorElement.getBoundingClientRect === 'function') {
      setOpenMenuAnchorRect(anchorElement.getBoundingClientRect());
    }
    setOpenMenuCategory(categoryLabel);
  };

  const closeMenu = () => {
    cancelMenuClose();
    setOpenMenuCategory(null);
    setOpenMenuAnchorRect(null);
  };

  const scheduleMenuClose = () => {
    cancelMenuClose();
    menuCloseTimerRef.current = window.setTimeout(() => {
      setOpenMenuCategory(null);
      setOpenMenuAnchorRect(null);
      menuCloseTimerRef.current = null;
    }, 260);
  };

  /*
   * Build the active visualization-menu registry.
   *
   * Map/network entries are handwritten because they switch App-owned view modes.
   * Chart entries are derived from `ANALYTICS_CHART_DEFINITIONS` so adding a
   * chart in the Analytics registry automatically surfaces it in the
   * Visualizations header, provided the derivation and renderer branches also
   * exist.
   */
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
      action: onOpenExplore,
      unavailableTitle: '',
      why: '',
      availableInstead: [],
    },
  }), [availability.hasCharts, availability.hasExploreData, availability.hasNetwork, availability.hasPointMap, availability.hasRouteMap, onOpenAnalytics, onOpenChartVisualization, onOpenExplore, onSelectForceDirected, onSelectPeopleNetwork, onSelectPlaceMap]);

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
      description: 'Advanced search and capabilities',
      tools: [VISUALIZATION_TOOLS.CAPABILITY_SUMMARY],
      directAction: onOpenExplore,
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
    'relative rounded-2xl border text-[var(--peridot-color-hex-fbf7ea)] transition focus-within:ring-2 focus-within:ring-[var(--peridot-color-hex-d6a36a-a60)]',
    active
      ? 'border-[var(--peridot-color-hex-f5ecd2-a90)] bg-[var(--peridot-color-hex-b58b42-a75)] shadow-[0_12px_28px_var(--peridot-color-rgba-rgba-0-0-0-0-26)]'
      : 'border-[var(--peridot-color-hex-dfe9c8-a40)] bg-[var(--peridot-color-hex-dfe9c8-a10)] hover:border-[var(--peridot-color-hex-f5ecd2-a80)] hover:bg-[var(--peridot-color-hex-b58b42-a70)]',
  ].join(' ');
  const menuItemClass = (active, available) => [
    'flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2 text-left text-sm transition focus:outline-none focus:ring-2 focus:ring-[var(--peridot-color-hex-d6a36a-a60)]',
    active
      ? 'bg-[var(--peridot-color-hex-b58b42)] font-bold text-[var(--peridot-color-hex-fff8e8)] shadow-inner'
      : available
        ? 'text-[var(--peridot-color-hex-1d3326)] hover:bg-[var(--peridot-color-hex-dfe9c8)]'
        : 'text-[var(--peridot-color-hex-4f4330)] hover:bg-[var(--peridot-color-hex-f3e4bf)]',
  ].join(' ');

  const counts = [
    { label: 'Point places', value: numberLabel(availability.pointCount) },
    { label: 'Routes', value: numberLabel(availability.routeCount) },
    { label: 'Network edges', value: numberLabel(availability.networkEdgeCount) },
    { label: 'Rows', value: numberLabel(availability.rowCount) },
  ];

  const isChartWorkspaceActive = selectedTool === VISUALIZATION_TOOLS.CHART_WORKSPACE || Boolean(chartTypeFromToolKey(selectedTool));
  const activeExportControls = isChartWorkspaceActive ? chartExportControls : exportControls;

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
        <div className="peridot-analytics-workspace peridot-illuminated-panel min-h-0 flex-1 overflow-hidden rounded-[28px] border border-[var(--peridot-color-hex-c4e0ef-a50)] bg-[var(--peridot-color-rgba-rgba-8-39-25-0-9)] p-2 shadow-[0_20px_54px_var(--peridot-color-rgba-rgba-0-0-0-0-34)] backdrop-blur-sm md:p-3">
          <AnalyticsPanelContent
            analyticsState={analyticsWorkspaceProps.analyticsState}
            onChartExportControlsChange={setChartExportControls}
          />
        </div>
      );
    }

    return (
      <div className="peridot-map-plate flex min-h-0 flex-1 overflow-hidden rounded-[28px] border border-[var(--peridot-color-hex-c4e0ef-a50)] bg-[var(--map-water)] shadow-[0_20px_54px_var(--peridot-color-rgba-rgba-0-0-0-0-34)]">
        <MapStageComponent {...mapStageProps} />
      </div>
    );
  };

  return (
    <section className="flex h-full min-h-0 flex-col overflow-hidden bg-[var(--peridot-color-hex-04160f)] text-[var(--peridot-color-hex-fbf7ea)]">
      <div className="peridot-workspace-field flex min-h-0 flex-1 flex-col overflow-hidden">
        <div className="relative z-0 flex min-h-0 flex-1 flex-col gap-3 px-4 py-4">
          <div
            ref={headerToggleAnchorRef}
            className={[
              'peridot-illuminated-panel relative z-[850] shrink-0 rounded-[28px] border border-[var(--peridot-color-hex-c4e0ef-a70)] bg-[linear-gradient(135deg,var(--peridot-color-rgba-rgba-8-39-25-0-95),var(--peridot-color-rgba-rgba-5-29-19-0-96))] pl-[76px] shadow-[0_18px_46px_var(--peridot-color-rgba-rgba-0-0-0-0-34)] backdrop-blur-sm sm:pl-[80px]',
              isHeaderExpanded ? 'px-4 pb-4 pt-3' : 'px-4 py-2',
            ].join(' ')}
          >
            {isHeaderExpanded ? (
              <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                <div className="min-w-0">
                  <p className="peridot-kicker !mb-0 text-[10px]">Visualization workspace</p>
                  <h1 className="mt-1 truncate [font-family:Georgia,'Palatino_Linotype','Book_Antiqua',Palatino,serif] text-2xl font-bold tracking-[-0.035em] text-[var(--peridot-color-hex-f5ecd2)] md:text-3xl">
                    {activeVisualizationLabel}
                  </h1>
                </div>

                <div className="flex flex-col gap-2 xl:flex-row xl:items-stretch">
                  <div className="relative z-[900] grid gap-2 sm:grid-cols-2 xl:min-w-[660px] xl:grid-cols-4">
                    {categories.map((category) => {
                      const isDirectAction = typeof category.directAction === 'function';
                      const isOpen = !isDirectAction && openMenuCategory === category.label;
                      const handleCategoryClick = (event) => {
                        if (isDirectAction) {
                          closeMenu();
                          category.directAction();
                          return;
                        }
                        if (isOpen) {
                          closeMenu();
                        } else {
                          openMenu(category.label, event.currentTarget.closest('[data-visualization-menu-anchor]'));
                        }
                      };
                      return (
                        <div
                          key={category.label}
                          data-visualization-menu-anchor="true"
                          className={categoryClass(isOpen)}
                          onMouseEnter={(event) => {
                            if (!isDirectAction) {
                              openMenu(category.label, event.currentTarget);
                            }
                          }}
                          onMouseLeave={isDirectAction ? undefined : scheduleMenuClose}
                          onFocus={(event) => {
                            if (!isDirectAction) {
                              openMenu(category.label, event.currentTarget);
                            }
                          }}
                        >
                          <button
                            type="button"
                            className="w-full px-3 py-2 text-left focus:outline-none"
                            onClick={handleCategoryClick}
                            aria-expanded={isOpen}
                          >
                            <span className="block text-sm font-bold">{category.label}</span>
                            <span className="mt-1 block text-[11px] leading-snug text-[var(--peridot-color-hex-dfe9c8)]">{category.description}</span>
                          </button>
                          {isOpen ? (
                            <FloatingVisualizationMenu
                              anchorRect={openMenuAnchorRect}
                              isOpen={isOpen}
                              width={280}
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
                            </FloatingVisualizationMenu>
                          ) : null}
                        </div>
                      );
                    })}
                  </div>
                  <VisualizationExportMenu
                    exportControls={activeExportControls}
                    activeVisualizationLabel={activeVisualizationLabel}
                  />
                </div>
              </div>
            ) : (
              <div className="flex h-8 items-center justify-between gap-3">
                <div className="min-w-0">
                  <span className="peridot-kicker !mb-0 mr-3 inline text-[9px] text-[var(--peridot-color-hex-dfe9c8)]">Visualization workspace</span>
                  <span className="truncate text-sm font-bold text-[var(--peridot-color-hex-f5ecd2)]">{activeVisualizationLabel}</span>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <VisualizationExportMenu
                    exportControls={activeExportControls}
                    activeVisualizationLabel={activeVisualizationLabel}
                    compact
                  />
                  <span className="rounded-full border border-[var(--peridot-color-hex-dfe9c8-a35)] bg-[var(--peridot-color-hex-dfe9c8-a10)] px-3 py-1 text-[11px] font-semibold text-[var(--peridot-color-hex-dfe9c8)]">
                    Navigation minimized
                  </span>
                </div>
              </div>
            )}
            <FloatingOrnamentArrowToggle
              anchorRef={headerToggleAnchorRef}
              placement="bottom"
              expanded={isHeaderExpanded}
              onClick={() => setIsHeaderExpanded((value) => !value)}
              expandedLabel="Hide visualization header"
              collapsedLabel="Show visualization header"
              expandedArrow="⌃"
              collapsedArrow="⌄"
            />
          </div>

          <div className="relative z-[20] flex min-h-0 flex-1 flex-col gap-3" onMouseEnter={scheduleMenuClose}>
            <div className="min-h-0 flex flex-1">
              {renderWorkspaceBody()}
            </div>
            {timelineControlsProps ? (
              <div ref={timelineToggleAnchorRef} className="relative shrink-0 pt-2">
                <FloatingOrnamentArrowToggle
                  anchorRef={timelineToggleAnchorRef}
                  placement="top"
                  expanded={isTimelineExpanded}
                  onClick={() => setIsTimelineExpanded((value) => !value)}
                  expandedLabel="Hide timeline"
                  collapsedLabel="Show timeline"
                  expandedArrow="⌄"
                  collapsedArrow="⌃"
                />
                {isTimelineExpanded ? (
                  <VisualizationTimelineScrubber {...timelineControlsProps} />
                ) : (
                  <div className="flex h-10 items-center justify-between rounded-[24px] border border-[var(--peridot-color-hex-c4e0ef-a50)] bg-[linear-gradient(135deg,var(--peridot-color-rgba-rgba-8-39-25-0-96),var(--peridot-color-rgba-rgba-5-29-19-0-98))] px-5 text-[var(--peridot-color-hex-fbf7ea)] shadow-[0_12px_32px_var(--peridot-color-rgba-rgba-0-0-0-0-26)]">
                    <span className="peridot-kicker !mb-0 text-[10px] text-[var(--peridot-color-hex-dfe9c8)]">Timeline</span>
                    <span className="text-sm font-semibold text-[var(--peridot-color-hex-f5ecd2)]">{timelineControlsProps.currentRangeLabel}</span>
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
