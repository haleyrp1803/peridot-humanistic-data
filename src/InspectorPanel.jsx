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
    '--button-secondary-bg': 'var(--peridot-role-inspector-button-bg)',
    '--button-secondary-border': 'var(--peridot-role-inspector-button-border)',
    '--button-secondary-text': 'var(--peridot-role-inspector-button-text)',
    '--button-secondary-hover': 'var(--peridot-role-inspector-button-hover-bg)',
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
    ? 'flex h-full min-h-0 flex-col rounded-[2.1rem] border border-[var(--peridot-role-inspector-chrome-border)] bg-[linear-gradient(145deg,var(--peridot-role-inspector-chrome-bg-strong),var(--peridot-role-inspector-chrome-bg)_44%,var(--peridot-role-interface-panel-background))] p-4 text-[var(--peridot-role-inspector-chrome-text)] shadow-2xl shadow-black/65 ring-1 ring-[var(--peridot-role-interface-focus-ring)]'
    : 'flex min-h-full flex-col rounded-[1.85rem] border border-[var(--peridot-role-inspector-chrome-border)] bg-[linear-gradient(160deg,var(--peridot-role-inspector-chrome-bg-strong),var(--peridot-role-inspector-chrome-bg)_52%,var(--peridot-role-interface-panel-background))] p-4 text-[var(--peridot-role-inspector-chrome-text)] shadow-xl shadow-black/40 backdrop-blur-md ring-1 ring-[var(--peridot-role-interface-focus-ring)]';

  const controlsClassName = 'mb-3 flex items-center justify-end gap-2';

  const headerClassName = isWorkspace
    ? 'mb-4 rounded-[1.55rem] border border-[var(--peridot-role-inspector-header-border)] bg-[linear-gradient(135deg,var(--peridot-role-inspector-header-bg),var(--peridot-role-inspector-chrome-bg)_58%,var(--peridot-role-interface-card-background-dark))] px-5 py-4 shadow-inner shadow-black/25'
    : 'mb-4 rounded-[1.35rem] border border-[var(--peridot-role-inspector-header-border)] bg-[linear-gradient(135deg,var(--peridot-role-inspector-header-bg),var(--peridot-role-inspector-chrome-bg)_58%,var(--peridot-role-interface-card-background-dark))] px-4 py-4 shadow-inner shadow-black/20';

  const bodyClassName = isWorkspace
    ? '[scrollbar-color:var(--peridot-role-inspector-clickable-bg)_var(--peridot-role-inspector-body-bg)] inspector-scroll min-h-0 flex-1 overflow-auto rounded-[1.55rem] border border-[var(--peridot-role-inspector-body-border)] bg-[linear-gradient(180deg,var(--peridot-role-inspector-card-bg),var(--peridot-role-inspector-body-bg)_38%,var(--peridot-role-inspector-section-bg)_72%,var(--peridot-role-inspector-card-bg))] p-5 text-[var(--peridot-role-inspector-body-text)] shadow-inner shadow-[var(--peridot-role-inspector-body-shadow)]'
    : '[scrollbar-color:var(--peridot-role-inspector-clickable-bg)_var(--peridot-role-inspector-body-bg)] inspector-scroll rounded-[1.35rem] border border-[var(--peridot-role-inspector-body-border)] bg-[linear-gradient(180deg,var(--peridot-role-inspector-card-bg),var(--peridot-role-inspector-body-bg)_38%,var(--peridot-role-inspector-section-bg)_72%,var(--peridot-role-inspector-card-bg))] p-4 text-[var(--peridot-role-inspector-body-text)] shadow-inner shadow-[var(--peridot-role-inspector-body-shadow)]';

  const actionButtonClassName = 'rounded-full border border-[var(--button-border)] bg-[var(--button-bg)] px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-[var(--button-text)] shadow-sm transition hover:border-[var(--button-hover-border)] hover:bg-[var(--button-hover-bg)] hover:text-[var(--button-hover-text)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/35';

  const closeButtonClassName = 'flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[var(--button-border)] bg-[var(--button-bg)] text-lg font-bold leading-none text-[var(--button-text)] shadow-sm transition hover:border-[var(--button-hover-border)] hover:bg-[var(--button-hover-bg)] hover:text-[var(--button-hover-text)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/35';

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
