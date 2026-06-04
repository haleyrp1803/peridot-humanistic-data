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
    InspectorBackButtonComponent,
  } = shellComponents;

  const isWorkspace = presentation === 'workspace';
  const rootClassName = isWorkspace
    ? 'flex h-full min-h-0 flex-col rounded-[2rem] border border-[#d8e0c8]/30 bg-[#0d1d16] p-5 text-[#f8f3e8] shadow-2xl shadow-black/55'
    : 'rounded-3xl border border-[#d8e0c8]/25 bg-[#0d1d16] p-4 text-[#f8f3e8] shadow-xl shadow-black/25';
  const headerClassName = isWorkspace
    ? 'mb-5 flex items-start justify-between gap-4 rounded-[1.5rem] border border-[#d8e0c8]/25 bg-[#152a20] px-5 py-4 shadow-inner shadow-black/20'
    : 'mb-4 flex items-start justify-between gap-3 rounded-2xl border border-[#d8e0c8]/20 bg-[#152a20] px-4 py-3 shadow-inner shadow-black/15';
  const bodyClassName = isWorkspace
    ? 'min-h-0 flex-1 overflow-auto rounded-[1.5rem] border border-[#d8e0c8]/30 bg-[#f6efdf] p-5 text-[#17271f] shadow-inner shadow-[#0d1d16]/20'
    : 'rounded-2xl border border-[#d8e0c8]/25 bg-[#f6efdf] p-4 text-[#17271f] shadow-inner shadow-[#0d1d16]/15';
  const actionButtonClassName = 'rounded-full border border-[#d8e0c8]/45 bg-[#f6efdf] px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#17271f] shadow-sm transition hover:bg-[#e7ddc8] hover:text-[#0d1d16] focus:outline-none focus:ring-2 focus:ring-[#d8e0c8]/70';
  const closeButtonClassName = 'flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#f6efdf]/65 bg-[#f6efdf] text-lg font-semibold leading-none text-[#0d1d16] shadow-sm transition hover:bg-[#e7ddc8] focus:outline-none focus:ring-2 focus:ring-[#d8e0c8]/75';

  return (
    <div className={rootClassName} data-inspector-presentation={presentation}>
      {showHeader ? (
        <div className={headerClassName}>
          <div className="min-w-0 flex-1">
            <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#d8e0c8]/85">
              {isWorkspace ? 'Inspector workspace' : 'Inspector'}
            </div>
            <InspectorHeaderComponent
              showInspectorInfo={showInspectorInfo}
              setShowInspectorInfo={setShowInspectorInfo}
            />
            {isWorkspace ? (
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#d8e0c8]">
                Evidence dossier for the current selection. The visualization remains loaded underneath this workspace.
              </p>
            ) : null}
          </div>
          <div className="flex shrink-0 items-center gap-2">
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
        </div>
      ) : null}

      <div className={bodyClassName}>
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
      </div>
    </div>
  );
}

/**
 * Compatibility wrapper for the current compact side-panel Inspector.
 *
 * Existing callers import InspectorPanelContent, so this export must remain
 * stable while the full Inspector workspace is introduced in a later pass.
 */
export function InspectorPanelContent(props) {
  return <InspectorContent {...props} presentation="compact" />;
}

export function InspectorPanel(props) {
  return <InspectorPanelContent {...props} />;
}
