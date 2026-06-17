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

import React from 'react';
import { InspectorBodyRouter } from './InspectorBodyRouter.jsx';

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
  } = inspectorState;

  const {
    InspectorHeaderComponent,
  } = shellComponents;

  const isWorkspace = presentation === 'workspace';

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
    '--peridot-role-inspector-card-bg': '#f0e8d4',
    '--peridot-role-inspector-card-border': 'rgba(176, 132, 50, 0.34)',
    '--peridot-role-inspector-card-text': '#102515',
    '--peridot-role-inspector-card-muted-text': '#314331',
    '--peridot-role-inspector-card-hover-bg': '#eadfbd',
    '--peridot-role-inspector-summary-card-bg': '#eee6cf',
    '--peridot-role-inspector-summary-card-border': 'rgba(176, 132, 50, 0.38)',
    '--peridot-role-inspector-summary-card-text': '#102515',
    '--peridot-role-inspector-section-bg': '#f0e8d4',
    '--peridot-role-inspector-section-border': 'rgba(176, 132, 50, 0.30)',
    '--peridot-role-inspector-panel-bg': '#142d19',
    '--peridot-role-inspector-stat-card-bg': '#d6cfab',
    '--peridot-role-inspector-button-bg': '#c79b3d',
    '--peridot-role-inspector-button-border': '#f0d27a',
    '--peridot-role-inspector-button-text': '#0a2110',
    '--peridot-role-inspector-button-hover-bg': '#d4aa4c',
    '--peridot-role-inspector-button-hover-border': '#f6df96',
    '--peridot-role-inspector-button-hover-text': '#07190c',
    '--peridot-role-inspector-button-active-bg': '#e0bb62',
    '--peridot-role-inspector-button-active-border': '#fae9b1',
    '--peridot-role-inspector-button-active-hover-bg': '#e7c777',
    '--peridot-role-inspector-badge-bg': '#d6cfab',
    '--peridot-role-inspector-badge-text': '#102515',
    '--peridot-role-inspector-empty-state-bg': '#f0e8d4',
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
    ? 'peridot-inspector-shell peridot-inspector-shell-workspace flex h-full min-h-0 flex-col rounded-[2.1rem] border border-[var(--peridot-role-inspector-chrome-border)] bg-[#142d19] p-4 text-[var(--peridot-role-inspector-chrome-text)] shadow-2xl shadow-black/65 ring-1 ring-[rgba(246,223,150,0.20)]'
    : 'peridot-inspector-shell peridot-inspector-shell-compact flex min-h-full flex-col rounded-[1.85rem] border border-[var(--peridot-role-inspector-chrome-border)] bg-[#142d19] p-4 text-[var(--peridot-role-inspector-chrome-text)] shadow-xl shadow-black/40 ring-1 ring-[rgba(246,223,150,0.20)]';

  const controlsClassName = 'mb-3 flex items-center justify-end gap-2';

  const headerClassName = isWorkspace
    ? 'peridot-inspector-header mb-4 rounded-[1.55rem] border border-[var(--peridot-role-inspector-header-border)] bg-[#0d2911] px-5 py-4 shadow-inner shadow-black/25'
    : 'peridot-inspector-header mb-4 rounded-[1.35rem] border border-[var(--peridot-role-inspector-header-border)] bg-[#0d2911] px-4 py-4 shadow-inner shadow-black/20';

  const bodyClassName = isWorkspace
    ? '[scrollbar-color:var(--peridot-role-inspector-clickable-bg)_var(--peridot-role-inspector-body-bg)] peridot-inspector-body inspector-scroll min-h-0 flex-1 overflow-auto rounded-[1.55rem] border border-[var(--peridot-role-inspector-body-border)] bg-[#142d19] p-5 text-[var(--peridot-role-inspector-body-text)] shadow-inner shadow-[var(--peridot-role-inspector-body-shadow)]'
    : '[scrollbar-color:var(--peridot-role-inspector-clickable-bg)_var(--peridot-role-inspector-body-bg)] peridot-inspector-body inspector-scroll rounded-[1.35rem] border border-[var(--peridot-role-inspector-body-border)] bg-[#142d19] p-4 text-[var(--peridot-role-inspector-body-text)] shadow-inner shadow-[var(--peridot-role-inspector-body-shadow)]';

  const actionButtonClassName = 'rounded-full border border-[var(--button-border)] bg-[var(--button-bg)] px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-[var(--button-text)] shadow-sm transition hover:border-[var(--button-hover-border)] hover:bg-[var(--button-hover-bg)] hover:text-[var(--button-hover-text)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/45';

  const closeButtonClassName = 'flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[var(--button-border)] bg-[var(--button-bg)] text-lg font-bold leading-none text-[var(--button-text)] shadow-sm transition hover:border-[var(--button-hover-border)] hover:bg-[var(--button-hover-bg)] hover:text-[var(--button-hover-text)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/45';

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
            {isWorkspace ? (
              <p className="mt-3 max-w-3xl text-sm leading-relaxed text-[var(--peridot-role-inspector-chrome-text)]">
                Evidence dossier for the current selection. The visualization remains loaded underneath this workspace.
              </p>
            ) : null}
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
