import React from 'react';
import { InspectorBodyRouter } from './InspectorBodyRouter.jsx';

/**
 * Shared Inspector content boundary.
 *
 * This component deliberately owns only Inspector chrome and body routing. It does
 * not decide whether the Inspector is shown in the compact side panel or a later
 * full workspace. Both presentation modes should render from the same
 * inspectorState, letterState, and viewComponents objects so the selected item
 * and Back history do not diverge.
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
    InspectorBackButtonComponent,
  } = shellComponents;

  return (
    <>
      {showHeader ? (
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <InspectorHeaderComponent
              showInspectorInfo={showInspectorInfo}
              setShowInspectorInfo={setShowInspectorInfo}
            />
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {showExpandButton && typeof onExpandInspector === 'function' ? (
              <button
                type="button"
                onClick={onExpandInspector}
                className="rounded-full border border-[var(--panel-border)] bg-[var(--button-secondary-bg)] px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--button-secondary-text)] shadow-sm transition hover:bg-[var(--button-secondary-hover-bg)] hover:text-[var(--button-secondary-hover-text)]"
                aria-label="Expand Inspector workspace"
                title="Expand Inspector"
              >
                Expand
              </button>
            ) : null}
            {showInlineCloseButton && typeof onCloseInspector === 'function' ? (
              <button
                type="button"
                onClick={onCloseInspector}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[var(--panel-border)] bg-[var(--panel-card-bg)] text-lg font-semibold leading-none text-[var(--panel-text)] shadow-sm transition hover:bg-[var(--button-secondary-hover-bg)]"
                aria-label="Close Inspector"
                title="Close Inspector"
              >
                ×
              </button>
            ) : null}
          </div>
        </div>
      ) : null}

      {showBackButton ? (
        <InspectorBackButtonComponent
          canGoBack={canGoBack}
          onBack={onBackInspector}
        />
      ) : null}

      <InspectorBodyRouter
        inspectorState={inspectorState}
        letterState={letterState}
        viewComponents={viewComponents}
      />
    </>
  );
}

/**
 * Compatibility wrapper for the current compact side-panel Inspector.
 *
 * Existing callers import InspectorPanelContent, so this export must remain
 * stable while the full Inspector workspace is introduced in a later pass.
 */
export function InspectorPanelContent(props) {
  return <InspectorContent {...props} />;
}

export function InspectorPanel(props) {
  return <InspectorPanelContent {...props} />;
}
