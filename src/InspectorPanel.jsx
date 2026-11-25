/*
 * Shared Inspector content shell.
 * 
 * This component renders the Inspector header, close/expand affordances, Back button, and routed body content. It is intentionally content-only so compact side-panel and full workspace Inspector modes can share selection state and history.
 * 
 * Important relationships:
 * - `App.jsx` owns selection state, presentation mode, and history.
 * - `InspectorBodyRouter.jsx` chooses the correct detailed view for the current selection.
 * 
 * Maintenance cautions:
 * - Do not split compact and full Inspector into independent state systems. They must remain views over the same selected evidence state.
 */

import React, { useRef, useState } from 'react';
import { buildPeridotRecordStructure } from './peridotRecordStructure.js';
import { InspectorBodyRouter } from './InspectorBodyRouter.jsx';
import { buildPeridotInspectorSelectionEvidence } from './peridotInspectorSelectionEvidence.js';
import { describePeridotTimelineMark } from './peridotInspectorTimelinePresentation.js';

/**
 * Shared Inspector content boundary.
 *
 * This component deliberately owns only Inspector chrome and body routing. It does
 * not decide whether the Inspector is shown in the compact side panel or the full
 * workspace. Both presentation modes render from the same inspectorState,
 * letterState, and viewComponents objects so the selected item and Back history
 * do not diverge. `letterState` remains a compatibility name from the
 * correspondence-first Inspector; user-facing language should continue moving
 * toward linked records until the Inspector data model is renamed deliberately.
 */
export function InspectorContent({
  sidebar,
  inspectorState,
  letterState,
  shellComponents,
  viewComponents,
  showHeader = true,
  showBackButton = true,
  showInlineCloseButton = true,
  showExpandButton = true,
  presentation = 'compact',
}) {
  const {
    showInspectorInfo,
    setShowInspectorInfo,
  } = sidebar;

  const {
    canGoBack,
    onBackInspector,
    onCloseInspector,
    onExpandInspector,
    onOpenPersonDetail,
    onOpenPlaceDetail,
    onOpenLetterDetail,
    onSearchRelated,
    clearSelection,
  } = inspectorState;

  const {
    InspectorHeaderComponent,
  } = shellComponents;

  const isWorkspace = presentation === 'workspace';
  // Compact inspection has one stationary banner and one independently scrollable
  // reading surface. Refs are local navigation only; selection/history remain in App.
  const compactScrollRef = useRef(null);
  const overviewRef = useRef(null);
  const dataRef = useRef(null);
  const nextStepsRef = useRef(null);
  const [keywordInput, setKeywordInput] = useState('');
  // Disclosure state follows deliberate user toggles, never hover. The stable
  // selection key keeps it open through category/presentation updates while
  // allowing the next selected mark to start with its own disclosure state.
  const [markMethodDisclosure, setMarkMethodDisclosure] = useState({});
  const methodSelectionKey = String(inspectorState?.selectedProps?.id
    ?? inspectorState?.selectedProps?.event?.id
    ?? inspectorState?.selectedProps?.label
    ?? 'unknown-selection');
  const methodExpanded = Boolean(markMethodDisclosure[methodSelectionKey]);
  const onMethodToggle = (event) => {
    const nextOpen = event.currentTarget.open;
    setMarkMethodDisclosure((previous) => previous[methodSelectionKey] === nextOpen
      ? previous : { ...previous, [methodSelectionKey]: nextOpen });
  };

  const selected = inspectorState?.selectedProps;
  const selectedKind = inspectorState?.selectedKind;
  const selectionEvidence = buildPeridotInspectorSelectionEvidence({
    selectedKind, selectedProps: selected, viewMode: inspectorState?.viewMode,
  });
  const geographicEvidence = selectionEvidence.representation.markType === 'geographic-entity-anchor'
    && selectionEvidence.support.status === 'verified';
  const clusterEvidence = selectedKind === 'cluster' && inspectorState?.viewMode === 'geographic';
  const networkEvidence = selectionEvidence.representation.markType === 'network-entity-node';
  const markRoleLabels = selectionEvidence.representation.details
    .filter((item) => item.kind === 'mapped-role' || item.kind === 'derived-anchor')
    .map((item) => item.value);
  const markLocation = selectionEvidence.representation.details
    .find((item) => item.kind === 'mapped-place')?.value || ''; 
  // Mark-level orientation only: do not promote linked-record attributes to
  // properties of an entity, or confuse cluster members with source records.
  const event = selected?.event;
  const timelineDescription = event ? describePeridotTimelineMark(event) : null;
  const timelineKind = event?.temporalKind === 'interval' || event?.temporalKind === 'openInterval'
    ? 'Selected period' : 'Selected event';
  const isPlace = selectedKind === 'place-detail' || selected?.entityType === 'place';
  const isCluster = selectedKind === 'cluster';
  const isEdge = selectedKind === 'edge';
  const isTimeline = selectedKind === 'timeline-event';
  const isChart = selectedKind === 'chart-mark';
  const markType = isCluster ? 'Selected cluster'
    : isChart ? 'Selected chart mark'
    : isEdge ? 'Selected connection'
      : isTimeline ? timelineKind
        : selectedKind === 'letter-detail' ? 'Selected source record'
          : isPlace ? 'Selected place'
            : selectedKind === 'node' || selectedKind === 'person-detail' ? 'Selected person or entity'
              : 'Current selection';
  const clusterMembers = selected?.memberCount ?? selected?.clusterSize
    ?? selected?.memberDetails?.length;
  const eventLabel = event?.displayLabel || event?.sourceText || event?.temporalRole;
  const selectedLabel = isChart ? selected?.label
    : isEdge
    ? [selected?.sourceLabel, selected?.targetLabel].filter(Boolean).join(selected?.direction === 'directed' ? ' → ' : ' — ')
    : isTimeline ? eventLabel
      : selected?.detailLabel || selected?.label || selected?.sourceLabel || '';
  // These targets come from the actual selected mark and associated mapped
  // records, not from guessing all co-occurring row values are entity traits.
  const selectedRows = isTimeline ? [selected?.row || event?.row].filter(Boolean)
    : isEdge ? (selected?.letterMetadata || [])
      : (letterState?.selectedLetterMetadata || []);
  const selectedRecord = isTimeline ? (selected?.row || event?.row)
    : selectedKind === 'letter-detail' ? selected?.letter : selectedRows[0];
  const recordStructure = selectedRecord ? buildPeridotRecordStructure(selectedRecord) : null;
  const selectedEntityId = selected?.entityId || selected?.personMetadata?.canonicalEntityId || '';
  const personCandidate = isChart ? '' : isTimeline
    ? (event?.subject?.label && event.subject.label !== 'Record' ? event.subject.label : '')
    : isEdge ? '' // Edge endpoint object types are not guaranteed by a label alone.
      : !isPlace && !isCluster && selectedKind !== 'letter-detail' ? selectedLabel : '';
  const placeCandidate = isChart ? '' : isPlace ? selectedLabel
    : (!isCluster && !isEdge && (selected?.anchorLabel || selected?.placeLabel || selected?.locationLabel
      || recordStructure?.places?.[0]?.value || ''));
  const personCandidateId = !isEdge && !isTimeline ? selectedEntityId : '';
  // A Map-mark action must open a row that actually produced that visual mark,
  // not the first record in the broader entity's linked-record list.
  const nextActionRecords = isChart ? selected?.contributingRows || []
    : geographicEvidence
    ? selectionEvidence.support.records
    : selectedRecord ? [selectedRecord] : selectedRows;
  const markExplanation = isChart
    ? selected?.chartType === 'scatter'
      ? 'This point represents one eligible source observation at its original X and Y values. Bubble size, when enabled, comes from a mapped numerical field; any display offset for coincident points does not change the measurements.'
      : selected?.chartType === 'histogram'
        ? `This bin counts ${selected?.unit === 'categories' ? 'category totals' : 'numerical observations'} within the displayed range. Its frequency is not necessarily the number of distinct contributing source records.`
        : selected?.chartType === 'heatmap'
          ? `This cell represents ${selected?.calculation?.aggregation || 'a calculation'} for the intersection of two mapped category fields. The supporting records are restricted to this intersection.`
          : selected?.chartType === 'box'
            ? selected?.statistics?.outlier
              ? 'This point is an individual observed measurement outside the displayed distribution’s 1.5 × IQR fences. The source record, not the quartile calculation, supplies its value.'
              : 'This box summarizes the distribution of valid numerical observations. Quartiles use R type 7 interpolation; whiskers show the most extreme inliers within 1.5 × IQR. The median is a derived statistic, not necessarily one observed record.'
          : selected?.chartType === 'dot'
            ? 'Each dot represents a calculated summary for one category or numerical column, rather than a single source record. Only eligible contributing measurements determine its value.'
          : selected?.chartType === 'slope'
            ? selected?.comparison?.period
              ? 'This endpoint is an observed or calculated value for one selected calendar period. A missing value in the other period is not treated as zero.'
              : 'This comparison connects values from two separately selected calendar periods. Its change is calculated only when both endpoints are observed; the connecting line does not represent intermediate observations.'
          : selected?.chartType === 'treemap'
            ? 'This tile represents a nonnegative additive category total. Its area is proportional to that value. A consolidated Other tile combines omitted categories without discarding their contributing records.'
          : selected?.chartType === 'sunburst'
            ? 'This ring segment represents a parent category or a child within its mapped parent. Its angular share is calculated from the displayed total; hierarchy reflects the fields selected by the researcher.'
          : ['line','multiLine','area','stackedArea'].includes(selected?.chartType)
            ? `This ${selected?.chartType === 'stackedArea' ? 'stacked area segment' : selected?.chartType === 'area' ? 'area interval' : 'time-series point'} represents ${selected?.calculation?.aggregation || 'a calculation'} in the displayed calendar interval. Connected lines and filled geometry are visual representations, not additional source observations.`
            : `The ${selected?.chartType === 'pie' ? 'slice' : selected?.chartType === 'groupedBar' ? 'grouped bar' : selected?.chartType === 'stackedBar' ? 'stacked segment' : 'bar'} represents ${selected?.calculation?.aggregation || 'a calculation'} of ${selected?.calculation?.measureField || 'the selected measure'} grouped by ${selected?.calculation?.groupField || 'the selected category'}. This is an analytical result, not an individual source record.`
    : isCluster
    ? `This is a display grouping of ${clusterMembers ?? 'multiple'} visible nodes, not necessarily the same number of distinct source records.`
    : isEdge
      ? `This ${selected?.direction === 'directed' ? 'directed' : 'mapped'} connection summarizes the relationship between the selected endpoints. Its supporting records and represented weight are listed below.`
      : isTimeline
        ? `This ${timelineKind === 'Selected period' ? 'period' : 'point'} is positioned from the mapped ${event?.temporalRole || 'time'} assertion${event?.subject?.label && event.subject.label !== 'Record' ? ` about ${event.subject.label}` : ''}.`
        : selectedKind === 'letter-detail'
          ? 'An individual mapped source record; open the dossier to examine its complete contents and provenance.'
          : isPlace
            ? `A place represented in the current ${inspectorState?.viewMode === 'geographic' ? 'map' : 'visualization'}. Its mapped associations are listed below.`
            : selectedKind === 'node' || selectedKind === 'person-detail'
              ? `${selected?.anchorLabel ? `Shown at ${selected.anchorLabel} under the current map anchor settings.` : 'A mapped entity in the current visualization.'} The evidence section distinguishes assertions about this entity from fields in related records.`
              : 'Supporting mapped evidence is shown below.';
  const jumpToCompactSection = (sectionRef) => {
    const scrollArea = compactScrollRef.current;
    const section = sectionRef.current;
    if (!scrollArea || !section) return;
    // The scroll surface is positioned, so the section offset is local to it.
    scrollArea.scrollTo({ top: section.offsetTop, behavior: 'smooth' });
  };

  const inspectorPaletteStyle = {
    /*
     * Inspector visual language
     * -------------------------
     * The compact Inspector side panel now mirrors the Chart builder pattern:
     * a muted dark-green shell, warm cream evidence cards, gold primary
     * commands, and green secondary navigation rows. These overrides intentionally sit at the shared
     * Inspector shell so compact and workspace presentations keep one palette
     * without changing the routed evidence views.
     */
    '--peridot-role-inspector-chrome-bg': '#142d19',
    '--peridot-role-inspector-chrome-bg-strong': '#0d2911',
    '--peridot-role-inspector-chrome-border': 'rgba(221, 187, 105, 0.42)',
    '--peridot-role-inspector-chrome-text': '#f5ecd2',
    '--peridot-role-inspector-chrome-muted-text': '#e8d99c',
    '--peridot-role-inspector-header-bg': '#0d2911',
    '--peridot-role-inspector-header-border': 'rgba(221, 187, 105, 0.38)',
    '--peridot-role-inspector-heading-text': '#f5ecd2',
    '--peridot-role-inspector-body-bg': '#142d19',
    '--peridot-role-inspector-body-border': 'rgba(221, 187, 105, 0.24)',
    '--peridot-role-inspector-body-text': '#102515',
    '--peridot-role-inspector-body-muted-text': '#314331',
    '--peridot-role-inspector-body-shadow': 'rgba(0, 0, 0, 0.24)',
    '--peridot-role-inspector-card-bg': '#eadfc3',
    '--peridot-role-inspector-card-border': 'rgba(176, 132, 50, 0.34)',
    '--peridot-role-inspector-card-text': '#102515',
    '--peridot-role-inspector-card-muted-text': '#314331',
    '--peridot-role-inspector-card-hover-bg': '#e0cf9f',
    '--peridot-role-inspector-summary-card-bg': '#eadfc3',
    '--peridot-role-inspector-summary-card-border': 'rgba(176, 132, 50, 0.38)',
    '--peridot-role-inspector-summary-card-text': '#102515',
    '--peridot-role-inspector-section-bg': '#eadfc3',
    '--peridot-role-inspector-section-border': 'rgba(176, 132, 50, 0.30)',
    '--peridot-role-inspector-panel-bg': '#142d19',
    '--peridot-role-inspector-stat-card-bg': '#d8c692',
    '--peridot-role-inspector-button-bg': '#c79b3d',
    '--peridot-role-inspector-button-border': '#f0d27a',
    '--peridot-role-inspector-button-text': '#0a2110',
    '--peridot-role-inspector-button-hover-bg': '#d4aa4c',
    '--peridot-role-inspector-button-hover-border': '#f6df96',
    '--peridot-role-inspector-button-hover-text': '#07190c',
    '--peridot-role-inspector-button-active-bg': '#e0bb62',
    '--peridot-role-inspector-button-active-border': '#fae9b1',
    '--peridot-role-inspector-button-active-hover-bg': '#e7c777',
    '--peridot-role-inspector-badge-bg': '#d8c692',
    '--peridot-role-inspector-badge-text': '#102515',
    '--peridot-role-inspector-empty-state-bg': '#eadfc3',
    '--peridot-role-inspector-empty-state-border': 'rgba(176, 132, 50, 0.48)',
    '--peridot-role-inspector-empty-state-text': '#102515',
    '--peridot-role-inspector-detail-label-text': '#b58b42',
    '--peridot-role-inspector-link-text': '#2f6b39',
    '--peridot-role-inspector-link-hover-text': '#0d2911',
    '--peridot-role-inspector-accent': '#f6df96',
    '--peridot-role-inspector-clickable-bg': '#18391f',
    '--peridot-role-inspector-clickable-border': 'rgba(232, 199, 116, 0.55)',
    '--peridot-role-inspector-clickable-text': '#f4eedb',
    '--peridot-role-inspector-clickable-muted-text': '#d6c68c',
    '--peridot-role-inspector-clickable-hover-bg': '#214b2a',
    '--peridot-role-inspector-clickable-hover-border': '#e8c774',
    '--peridot-role-inspector-clickable-hover-text': '#fff3c8',
    '--peridot-role-inspector-clickable-badge-bg': 'rgba(246, 230, 167, 0.16)',
    '--peridot-role-inspector-clickable-badge-text': '#fff3c8',

    '--summary-card-bg': 'var(--peridot-role-inspector-summary-card-bg)',
    '--summary-card-border': 'var(--peridot-role-inspector-summary-card-border)',
    '--summary-card-text': 'var(--peridot-role-inspector-summary-card-text)',
    '--panel-card-bg': 'var(--peridot-role-inspector-card-bg)',
    '--panel-card-border': 'var(--peridot-role-inspector-card-border)',
    '--panel-card-text': 'var(--peridot-role-inspector-card-text)',
    '--panel-card-muted-text': 'var(--peridot-role-inspector-card-muted-text)',
    '--panel-card-hover': 'var(--peridot-role-inspector-card-hover-bg)',
    '--utility-panel-bg': 'var(--peridot-role-inspector-section-bg)',
    '--section-bg': 'var(--peridot-role-inspector-section-bg)',
    '--section-border': 'var(--peridot-role-inspector-section-border)',
    '--panel-bg': 'var(--peridot-role-inspector-panel-bg)',
    '--card-bg': 'var(--peridot-role-inspector-card-bg)',
    '--stat-card-bg': 'var(--peridot-role-inspector-stat-card-bg)',
    '--button-bg': 'var(--peridot-role-inspector-button-bg)',
    '--button-border': 'var(--peridot-role-inspector-button-border)',
    '--button-text': 'var(--peridot-role-inspector-button-text)',
    '--button-hover-bg': 'var(--peridot-role-inspector-button-hover-bg)',
    '--button-hover-border': 'var(--peridot-role-inspector-button-hover-border)',
    '--button-hover-text': 'var(--peridot-role-inspector-button-hover-text)',
    '--button-secondary-bg': 'var(--peridot-role-inspector-clickable-bg)',
    '--button-secondary-border': 'var(--peridot-role-inspector-clickable-border)',
    '--button-secondary-text': 'var(--peridot-role-inspector-clickable-text)',
    '--button-secondary-hover': 'var(--peridot-role-inspector-clickable-hover-bg)',
    '--button-primary-bg': 'var(--peridot-role-inspector-button-bg)',
    '--button-primary-border': 'var(--peridot-role-inspector-button-border)',
    '--button-primary-text': 'var(--peridot-role-inspector-button-text)',
    '--button-primary-hover': 'var(--peridot-role-inspector-button-hover-bg)',
    '--button-primary-active-bg': 'var(--peridot-role-inspector-button-active-bg)',
    '--button-primary-active-border': 'var(--peridot-role-inspector-button-active-border)',
    '--button-primary-active-hover': 'var(--peridot-role-inspector-button-active-hover-bg)',
    '--badge-bg': 'var(--peridot-role-inspector-badge-bg)',
    '--badge-text': 'var(--peridot-role-inspector-badge-text)',
    '--empty-state-bg': 'var(--peridot-role-inspector-empty-state-bg)',
    '--empty-state-border': 'var(--peridot-role-inspector-empty-state-border)',
    '--empty-state-text': 'var(--peridot-role-inspector-empty-state-text)',
    '--detail-label-text': 'var(--peridot-role-inspector-detail-label-text)',
    '--text-main': 'var(--peridot-role-inspector-body-text)',
    '--text-muted': 'var(--peridot-role-inspector-body-muted-text)',
    '--text-strong': 'var(--peridot-role-inspector-card-text)',
    '--heading-text': 'var(--peridot-role-inspector-heading-text)',
    '--link-text': 'var(--peridot-role-inspector-link-text)',
    '--link-hover-text': 'var(--peridot-role-inspector-link-hover-text)',
    '--accent': 'var(--peridot-role-inspector-accent)',
    '--shell-bg': 'var(--peridot-role-inspector-chrome-bg)',
    '--muted-text': 'var(--peridot-role-inspector-chrome-muted-text)',
    '--ghost-hover': 'rgba(199, 155, 61, 0.14)',
    '--inspector-clickable-bg': 'var(--peridot-role-inspector-clickable-bg)',
    '--inspector-clickable-border': 'var(--peridot-role-inspector-clickable-border)',
    '--inspector-clickable-text': 'var(--peridot-role-inspector-clickable-text)',
    '--inspector-clickable-muted-text': 'var(--peridot-role-inspector-clickable-muted-text)',
    '--inspector-clickable-hover-bg': 'var(--peridot-role-inspector-clickable-hover-bg)',
    '--inspector-clickable-hover-border': 'var(--peridot-role-inspector-clickable-hover-border)',
    '--inspector-clickable-hover-text': 'var(--peridot-role-inspector-clickable-hover-text)',
    '--inspector-clickable-badge-bg': 'var(--peridot-role-inspector-clickable-badge-bg)',
    '--inspector-clickable-badge-text': 'var(--peridot-role-inspector-clickable-badge-text)',
  };

  const rootClassName = isWorkspace
    ? 'peridot-inspector-shell peridot-inspector-shell-workspace peridot-inspector-reference-ground flex h-full min-h-0 flex-col overflow-auto rounded-[1.85rem] border border-[var(--peridot-role-inspector-chrome-border)] p-3 text-[var(--peridot-role-inspector-chrome-text)] shadow-2xl shadow-black/65 ring-1 ring-[rgba(246,223,150,0.20)]'
    : 'peridot-inspector-shell peridot-inspector-shell-compact peridot-inspector-reference-ground flex min-h-full flex-col rounded-[1.75rem] border border-[var(--peridot-role-inspector-chrome-border)] bg-[#142d19] p-3.5 text-[var(--peridot-role-inspector-chrome-text)] shadow-xl shadow-black/40 ring-1 ring-[rgba(246,223,150,0.20)]';

  const controlsClassName = 'mb-2 flex items-center justify-end gap-2';

  const headerClassName = isWorkspace
    ? 'peridot-inspector-header mb-3 rounded-[1.35rem] border border-[var(--peridot-role-inspector-header-border)] bg-[#0d2911] px-4 py-3 shadow-inner shadow-black/25'
    : 'peridot-inspector-header mb-3 rounded-[1.25rem] border border-[var(--peridot-role-inspector-header-border)] bg-[#0d2911] px-3.5 py-3 shadow-inner shadow-black/20';

  const bodyClassName = isWorkspace
    ? '[scrollbar-color:var(--peridot-role-inspector-clickable-bg)_var(--peridot-role-inspector-body-bg)] peridot-inspector-body inspector-scroll peridot-inspector-reference-body flex-none overflow-visible rounded-[1.35rem] border border-[var(--peridot-role-inspector-body-border)] p-4 text-[var(--peridot-role-inspector-body-text)] shadow-inner shadow-[var(--peridot-role-inspector-body-shadow)]'
    : '[scrollbar-color:var(--peridot-role-inspector-clickable-bg)_var(--peridot-role-inspector-body-bg)] peridot-inspector-body inspector-scroll peridot-inspector-reference-body rounded-[1.25rem] border border-[var(--peridot-role-inspector-body-border)] p-3.5 text-[var(--peridot-role-inspector-body-text)] shadow-inner shadow-[var(--peridot-role-inspector-body-shadow)]';

  const actionButtonClassName = 'rounded-full border border-[var(--button-border)] bg-[var(--button-bg)] px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--button-text)] shadow-sm transition hover:border-[var(--button-hover-border)] hover:bg-[var(--button-hover-bg)] hover:text-[var(--button-hover-text)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/45';

  const closeButtonClassName = 'flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[var(--button-border)] bg-[var(--button-bg)] text-base font-bold leading-none text-[var(--button-text)] shadow-sm transition hover:border-[var(--button-hover-border)] hover:bg-[var(--button-hover-bg)] hover:text-[var(--button-hover-text)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/45';

  // Keep the original source-backed data reader intact; Next steps provides
  // a draft keyword handoff to Explore rather than filtering this small panel.
  if (!isWorkspace && showHeader) {
    return (
      <div
        className="peridot-inspector-shell peridot-inspector-shell-compact peridot-inspector-reference-ground peridot-inspector-compact-layout"
        style={inspectorPaletteStyle}
        data-inspector-presentation="compact"
      >
        <div className="peridot-inspector-compact-banner">
          <div className="peridot-inspector-compact-banner-top">
            <div className="peridot-inspector-compact-title">
              <InspectorHeaderComponent
                showInspectorInfo={showInspectorInfo}
                setShowInspectorInfo={setShowInspectorInfo}
              />
            </div>
            <div className="peridot-inspector-compact-controls" aria-label="Inspector controls">
              {showBackButton && canGoBack && typeof onBackInspector === 'function' ? (
                <button type="button" className="peridot-inspector-compact-control" onClick={onBackInspector} title="Back" aria-label="Go back in Inspector history">Back</button>
              ) : null}
              {showExpandButton && typeof onExpandInspector === 'function' ? (
                <button type="button" className="peridot-inspector-compact-control" onClick={onExpandInspector} title="Open full dossier" aria-label="Expand Inspector workspace">Expand</button>
              ) : null}
              {showInlineCloseButton && typeof onCloseInspector === 'function' ? (
                <button type="button" className="peridot-inspector-compact-close" onClick={onCloseInspector} title="Close Inspector" aria-label="Close Inspector">×</button>
              ) : null}
            </div>
          </div>
          <nav className="peridot-inspector-compact-nav" aria-label="Inspector sections">
            <button type="button" onClick={() => jumpToCompactSection(overviewRef)}>Overview</button>
            <button type="button" onClick={() => jumpToCompactSection(dataRef)}>Data</button>
            <button type="button" onClick={() => jumpToCompactSection(nextStepsRef)}>Next steps</button>
          </nav>
        </div>
        <div className="peridot-inspector-compact-scroll" ref={compactScrollRef}>
          <section className="peridot-inspector-compact-section" ref={overviewRef} aria-labelledby="inspector-compact-overview-heading">
            <h3 id="inspector-compact-overview-heading">What am I seeing?</h3>
            <div className="peridot-inspector-compact-orientation">
              <span className="peridot-inspector-compact-eyebrow">{markType}</span>
              {selectedLabel ? <strong>{selectedLabel}</strong> : null}
              {geographicEvidence ? (
                <>
                  <p className="peridot-inspector-representation-lead">At <strong>{markLocation}</strong>{markRoleLabels.length ? ` · ${markRoleLabels.join(' · ')}` : ''}</p>
                  <div className="peridot-inspector-mark-explanation">
                    <strong>Why this mark appears</strong>
                    <p>{markRoleLabels.some((role) => role === 'Most frequent place')
                      ? `The Map positions this entity at ${markLocation} using the enabled Most frequent place calculation, based on its mapped place observations in the displayed scope.`
                      : markRoleLabels.length
                        ? `The Map positions this entity at ${markLocation} because ${markRoleLabels.join(' and ')} ${markRoleLabels.length === 1 ? 'is an enabled geographic role' : 'are enabled geographic roles'}.`
                        : `The current Map anchor settings position this entity at ${markLocation}.`}</p>
                    <details className="peridot-inspector-mark-method" open={methodExpanded} onToggle={onMethodToggle}>
                      <summary>How Peridot determined this</summary>
                      <p>The source supplies place values; the researcher defines their mapped roles; the Map uses enabled anchor settings to construct this visual node.</p>
                      <p>{selectionEvidence.support.recordCount} distinct supporting source {selectionEvidence.support.recordCount === 1 ? 'record is' : 'records are'} retained for this mark in the displayed Map scope. This does not necessarily describe all records associated with the entity.</p>
                    </details>
                  </div>
                </>
              ) : networkEvidence ? (
                <div className="peridot-inspector-mark-explanation">
                  <strong>Why this mark appears</strong>
                  {selectionEvidence.support.status === 'verified' || selectionEvidence.support.status === 'partial' ? (
                    <>
                      <p>The Network displays this entity through {selected?.networkMarkEvidence?.edgeCount ?? 0} incident connection{selected?.networkMarkEvidence?.edgeCount === 1 ? '' : 's'} in the current visualization. {selected?.networkMarkEvidence?.representedWeight !== null ? `Those connections represent ${selected.networkMarkEvidence.representedWeight} relationship occurrences.` : 'A complete relationship-occurrence weight is unavailable.'}</p>
                      <details className="peridot-inspector-mark-method" open={methodExpanded} onToggle={onMethodToggle}>
                        <summary>How Peridot determined this</summary>
                        <p>The researcher defines relationship participants and their mappings; Peridot constructs the visible Network nodes and edges from those relationships in the displayed scope.</p>
                        <p>{selectionEvidence.support.status === 'verified' ? `${selectionEvidence.support.recordCount} distinct supporting source records are retained for these connections.` : 'Some displayed connections lack record-level provenance, so a complete distinct-record total is not available.'} Other entity evidence may extend beyond the visible Network connections.</p>
                      </details>
                    </>
                  ) : <p>This entity appears in the current Network. The selected node has not supplied verified displayed-edge provenance; associated entity records cannot be treated as support for this mark.</p>}
                </div>
              ) : isTimeline && timelineDescription ? (
                <>
                  <p className="peridot-inspector-representation-lead">
                    {timelineDescription.subjectLabel ? <strong>{timelineDescription.subjectLabel}</strong> : <strong>{timelineDescription.role}</strong>}
                    {' · '}{timelineDescription.markKind === 'period' ? 'Period' : 'Point event'}
                  </p>
                  <div className="peridot-inspector-mark-explanation">
                    <strong>Why this mark appears</strong>
                    <p>{timelineDescription.explanation}</p>
                    <details className="peridot-inspector-mark-method" open={methodExpanded} onToggle={onMethodToggle}>
                      <summary>How Peridot determined this</summary>
                      <p>The source supplies the date assertion; the researcher maps its temporal role and subject; Peridot positions the mark using the mapped date and its declared precision. No historical-calendar conversion is performed.</p>
                      <p>{selectionEvidence.support.status === 'verified' ? 'The selection retains its supporting source record.' : 'Verified source-record provenance is not available for this selection.'} A partial date’s possible occurrence window is not an asserted historical period.</p>
                    </details>
                  </div>
                </>
              ) : clusterEvidence ? (
                <div className="peridot-inspector-mark-explanation">
                  <strong>Why this mark appears</strong>
                  <p>The Map groups {clusterMembers ?? 'multiple'} nearby visual nodes at this map scale. This is a display grouping, not a count of distinct source records.</p>
                </div>
              ) : <p>{markExplanation}</p>}
            </div>
          </section>
          <section className="peridot-inspector-compact-section" ref={dataRef} aria-labelledby="inspector-compact-data-heading">
            <h3 id="inspector-compact-data-heading">What data is being visualized?</h3>
            <div className="peridot-inspector-body peridot-inspector-compact-evidence">
              <InspectorBodyRouter
                inspectorState={inspectorState}
                letterState={letterState}
                viewComponents={viewComponents}
                presentation={presentation}
                selectionEvidence={selectionEvidence}
              />
            </div>
          </section>
          <section className="peridot-inspector-compact-section" ref={nextStepsRef} aria-labelledby="inspector-compact-next-heading">
            <h3 id="inspector-compact-next-heading">Where can I go next?</h3>
            {typeof onSearchRelated === 'function' ? (
              <form className="peridot-inspector-explore-search" role="search" onSubmit={(event) => {
                event.preventDefault();
                const term = keywordInput.trim();
                if (term) onSearchRelated('keyword', term);
              }}>
                <label htmlFor="peridot-inspector-explore-keyword">Search your dataset</label>
                <div className="peridot-inspector-explore-search-controls">
                  <input
                    id="peridot-inspector-explore-keyword"
                    type="search"
                    value={keywordInput}
                    placeholder="Search people, places, records…"
                    onChange={(event) => setKeywordInput(event.target.value)}
                  />
                  <button type="submit" disabled={!keywordInput.trim()}>Search</button>
                </div>
              </form>
            ) : null}
            <div className="peridot-inspector-next-actions">
              {showExpandButton && typeof onExpandInspector === 'function' ? (
                <button type="button" className="peridot-inspector-next-primary" onClick={onExpandInspector}>{isChart ? 'Open expanded Inspector' : 'Open full dossier'}</button>
              ) : null}
              {nextActionRecords.length && typeof onOpenLetterDetail === 'function' ? (
                <button type="button" onClick={() => onOpenLetterDetail(nextActionRecords[0], 0)}>View contributing record</button>
              ) : null}
              {personCandidate && typeof onOpenPersonDetail === 'function' ? (
                <button type="button" onClick={() => onOpenPersonDetail(personCandidate, personCandidateId)}>Inspect person · {personCandidate}</button>
              ) : null}
              {placeCandidate && typeof onOpenPlaceDetail === 'function' ? (
                <button type="button" onClick={() => onOpenPlaceDetail(placeCandidate)}>Inspect place · {placeCandidate}</button>
              ) : null}
              {personCandidate && typeof onSearchRelated === 'function' ? (
                <button type="button" onClick={() => onSearchRelated('person', personCandidate)}>Search person · {personCandidate}</button>
              ) : null}
              {placeCandidate && typeof onSearchRelated === 'function' ? (
                <button type="button" onClick={() => onSearchRelated('place', placeCandidate)}>Search place · {placeCandidate}</button>
              ) : null}
            </div>
            {typeof clearSelection === 'function' ? (
              <button type="button" className="peridot-inspector-next-clear" onClick={clearSelection}>Clear selection</button>
            ) : null}
          </section>
        </div>
      </div>
    );
  }

  return (
    <div className={rootClassName} style={inspectorPaletteStyle} data-inspector-presentation={presentation}>
      {showHeader ? (
        <>
          {(showExpandButton && typeof onExpandInspector === 'function')
          || (showBackButton && canGoBack && typeof onBackInspector === 'function')
          || (showInlineCloseButton && typeof onCloseInspector === 'function') ? (
            <div className={controlsClassName} aria-label="Inspector controls">
              {showExpandButton && typeof onExpandInspector === 'function' ? (
                <button
                  type="button"
                  onClick={onExpandInspector}
                  className={actionButtonClassName}
                  aria-label="Expand Inspector workspace"
                  title="Expand Inspector"
                >
                  Expand
                </button>
              ) : null}
              {showBackButton && canGoBack && typeof onBackInspector === 'function' ? (
                <button
                  type="button"
                  onClick={onBackInspector}
                  className={actionButtonClassName}
                  aria-label="Go back in Inspector history"
                  title="Back"
                >
                  Back
                </button>
              ) : null}
              {showInlineCloseButton && typeof onCloseInspector === 'function' ? (
                <button
                  type="button"
                  onClick={onCloseInspector}
                  className={closeButtonClassName}
                  aria-label="Close Inspector"
                  title="Close Inspector"
                >
                  ×
                </button>
              ) : null}
            </div>
          ) : null}

          <div className={headerClassName}>
            <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--peridot-role-inspector-chrome-muted-text)]">
              {isWorkspace ? 'Inspector workspace' : 'Inspector'}
            </div>
            <InspectorHeaderComponent
              showInspectorInfo={showInspectorInfo}
              setShowInspectorInfo={setShowInspectorInfo}
            />
          </div>
        </>
      ) : null}

      <div className={bodyClassName}>
        <InspectorBodyRouter
          inspectorState={inspectorState}
          letterState={letterState}
          viewComponents={viewComponents}
          presentation={presentation}
        />
      </div>
    </div>
  );
}

/**
 * Compatibility wrapper for the current compact side-panel Inspector.
 *
 * Existing callers import InspectorPanelContent, so this export must remain
 * stable while the full Inspector workspace is introduced and refined.
 */
export function InspectorPanelContent(props) {
  return <InspectorContent {...props} presentation="compact" />;
}

export function InspectorPanel(props) {
  return <InspectorPanelContent {...props} />;
}
