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
import { PERIDOT_COLORS } from './peridotColorPalette.js';

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
    '--summary-card-bg': PERIDOT_COLORS.HEX_BDA77A,
    '--summary-card-border': PERIDOT_COLORS.HEX_F4EFD9,
    '--summary-card-text': PERIDOT_COLORS.HEX_11231A,
    '--panel-card-bg': PERIDOT_COLORS.HEX_E1E8CC,
    '--panel-card-border': PERIDOT_COLORS.HEX_B4C29C,
    '--panel-card-text': PERIDOT_COLORS.HEX_14261D,
    '--panel-card-muted-text': PERIDOT_COLORS.HEX_52624D,
    '--panel-card-hover': PERIDOT_COLORS.HEX_D7DFBC,
    '--utility-panel-bg': PERIDOT_COLORS.HEX_D7E0BD,
    '--section-bg': PERIDOT_COLORS.HEX_C4D0A8,
    '--section-border': PERIDOT_COLORS.HEX_91A276,
    '--panel-bg': PERIDOT_COLORS.HEX_9FB088,
    '--card-bg': PERIDOT_COLORS.HEX_DBE4C3,
    '--stat-card-bg': PERIDOT_COLORS.HEX_F4EFD9,
    '--button-bg': PERIDOT_COLORS.HEX_F4EFD9,
    '--button-border': PERIDOT_COLORS.HEX_C8BEA0,
    '--button-text': PERIDOT_COLORS.HEX_16271D,
    '--button-hover-bg': PERIDOT_COLORS.HEX_B99B63,
    '--button-hover-border': PERIDOT_COLORS.HEX_7D6140,
    '--button-hover-text': PERIDOT_COLORS.HEX_0D1C13,
    '--button-secondary-bg': PERIDOT_COLORS.HEX_F4EFD9,
    '--button-secondary-border': PERIDOT_COLORS.HEX_C8BEA0,
    '--button-secondary-text': PERIDOT_COLORS.HEX_16271D,
    '--button-secondary-hover': PERIDOT_COLORS.HEX_B99B63,
    '--button-primary-bg': PERIDOT_COLORS.HEX_F4EFD9,
    '--button-primary-border': PERIDOT_COLORS.HEX_C8BEA0,
    '--button-primary-text': PERIDOT_COLORS.HEX_16271D,
    '--button-primary-hover': PERIDOT_COLORS.HEX_B99B63,
    '--button-primary-active-bg': PERIDOT_COLORS.HEX_B99B63,
    '--button-primary-active-border': PERIDOT_COLORS.HEX_7D6140,
    '--button-primary-active-hover': PERIDOT_COLORS.HEX_A98954,
    '--badge-bg': PERIDOT_COLORS.HEX_F4EFD9,
    '--badge-text': PERIDOT_COLORS.HEX_3B4F2E,
    '--empty-state-bg': PERIDOT_COLORS.HEX_DBE4C3,
    '--empty-state-border': PERIDOT_COLORS.HEX_91A276,
    '--empty-state-text': PERIDOT_COLORS.HEX_52624D,
    '--detail-label-text': PERIDOT_COLORS.HEX_54694D,
    '--text-main': PERIDOT_COLORS.HEX_14261D,
    '--text-muted': PERIDOT_COLORS.HEX_52624D,
    '--text-strong': PERIDOT_COLORS.HEX_102117,
    '--heading-text': PERIDOT_COLORS.HEX_F6F3DC,
    '--link-text': PERIDOT_COLORS.HEX_4C6E35,
    '--link-hover-text': PERIDOT_COLORS.HEX_7D6140,
    '--accent': PERIDOT_COLORS.HEX_F4EFD9,
    '--inspector-clickable-bg': PERIDOT_COLORS.HEX_5F724C,
    '--inspector-clickable-border': PERIDOT_COLORS.HEX_87966A,
    '--inspector-clickable-text': PERIDOT_COLORS.HEX_F7F2DD,
    '--inspector-clickable-muted-text': PERIDOT_COLORS.HEX_E8E0BD,
    '--inspector-clickable-hover-bg': PERIDOT_COLORS.HEX_B99B63,
    '--inspector-clickable-hover-border': PERIDOT_COLORS.HEX_7D6140,
    '--inspector-clickable-hover-text': PERIDOT_COLORS.HEX_0D1C13,
    '--inspector-clickable-badge-bg': PERIDOT_COLORS.HEX_F4EFD9,
    '--inspector-clickable-badge-text': PERIDOT_COLORS.HEX_3B4F2E,
  };

  const rootClassName = isWorkspace
    ? 'flex h-full min-h-0 flex-col rounded-[2.1rem] border border-[#91a276]/55 bg-[linear-gradient(145deg,rgba(3,17,11,0.98),rgba(10,35,25,0.96)_44%,rgba(36,55,38,0.94))] p-4 text-[#f6f3dc] shadow-2xl shadow-black/65 ring-1 ring-[#b7c884]/16'
    : 'flex min-h-full flex-col rounded-[1.85rem] border border-[#91a276]/48 bg-[linear-gradient(160deg,rgba(4,20,13,0.95),rgba(13,39,28,0.92)_52%,rgba(45,66,45,0.88))] p-4 text-[#f6f3dc] shadow-xl shadow-black/40 backdrop-blur-md ring-1 ring-[#b7c884]/14';

  const controlsClassName = 'mb-3 flex items-center justify-end gap-2';

  const headerClassName = isWorkspace
    ? 'mb-4 rounded-[1.55rem] border border-[#c5d99b]/38 bg-[linear-gradient(135deg,rgba(18,50,35,0.98),rgba(47,73,47,0.94)_58%,rgba(83,92,55,0.82))] px-5 py-4 shadow-inner shadow-black/25'
    : 'mb-4 rounded-[1.35rem] border border-[#c5d99b]/34 bg-[linear-gradient(135deg,rgba(18,50,35,0.96),rgba(47,73,47,0.9)_58%,rgba(83,92,55,0.76))] px-4 py-4 shadow-inner shadow-black/20';

  const bodyClassName = isWorkspace
    ? '[scrollbar-color:#7d8d68_#dce5c3] inspector-scroll min-h-0 flex-1 overflow-auto rounded-[1.55rem] border border-[#b4c29c]/65 bg-[linear-gradient(180deg,#dce5c3,#d3dfb7_38%,#c9d6aa_72%,#bdcc9b)] p-5 text-[#14261d] shadow-inner shadow-[#06190f]/25'
    : '[scrollbar-color:#7d8d68_#dce5c3] inspector-scroll rounded-[1.35rem] border border-[#b4c29c]/60 bg-[linear-gradient(180deg,#dce5c3,#d4dfb8_38%,#cad7aa_72%,#bfce9d)] p-4 text-[#14261d] shadow-inner shadow-[#06190f]/20';

  const actionButtonClassName = 'rounded-full border border-[#c8bea0] bg-[#f4efd9] px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-[#16271d] shadow-sm transition hover:border-[#7d6140] hover:bg-[#b99b63] hover:text-[#0d1c13] focus:outline-none focus:ring-2 focus:ring-[#f4efd9]/80';

  const closeButtonClassName = 'flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#c8bea0] bg-[#f4efd9] text-lg font-bold leading-none text-[#11251b] shadow-sm transition hover:border-[#7d6140] hover:bg-[#b99b63] hover:text-[#0d1c13] focus:outline-none focus:ring-2 focus:ring-[#f4efd9]/80';

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
            <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#dfe9b2]">
              {isWorkspace ? 'Inspector workspace' : 'Inspector'}
            </div>
            <InspectorHeaderComponent
              showInspectorInfo={showInspectorInfo}
              setShowInspectorInfo={setShowInspectorInfo}
            />
            {isWorkspace ? (
              <p className="mt-3 max-w-3xl text-sm leading-relaxed text-[#f6f3dc]">
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
