import React from 'react';
import { InspectorBodyRouter } from './InspectorBodyRouter.jsx';

/**
 * Shared Inspector content boundary.
 *
 * This component deliberately owns only Inspector chrome and body routing. It does
 * not decide whether the Inspector is shown in the compact side panel or the full
 * workspace. Both presentation modes render from the same inspectorState,
 * letterState, and viewComponents objects so the selected item and Back history
 * do not diverge.
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

  const inspectorPaletteStyle = {
    '--summary-card-bg': '#bda77a',
    '--summary-card-border': '#f4efd9',
    '--summary-card-text': '#11231a',
    '--panel-card-bg': '#e1e8cc',
    '--panel-card-border': '#b4c29c',
    '--panel-card-text': '#14261d',
    '--panel-card-muted-text': '#52624d',
    '--panel-card-hover': '#d7dfbc',
    '--utility-panel-bg': '#d7e0bd',
    '--section-bg': '#c4d0a8',
    '--section-border': '#91a276',
    '--panel-bg': '#9fb088',
    '--card-bg': '#dbe4c3',
    '--stat-card-bg': '#f4efd9',
    '--button-bg': '#f4efd9',
    '--button-border': '#c8bea0',
    '--button-text': '#16271d',
    '--button-hover-bg': '#b99b63',
    '--button-hover-border': '#7d6140',
    '--button-hover-text': '#0d1c13',
    '--button-secondary-bg': '#f4efd9',
    '--button-secondary-border': '#c8bea0',
    '--button-secondary-text': '#16271d',
    '--button-secondary-hover': '#b99b63',
    '--button-primary-bg': '#f4efd9',
    '--button-primary-border': '#c8bea0',
    '--button-primary-text': '#16271d',
    '--button-primary-hover': '#b99b63',
    '--button-primary-active-bg': '#b99b63',
    '--button-primary-active-border': '#7d6140',
    '--button-primary-active-hover': '#a98954',
    '--badge-bg': '#f4efd9',
    '--badge-text': '#3b4f2e',
    '--empty-state-bg': '#dbe4c3',
    '--empty-state-border': '#91a276',
    '--empty-state-text': '#52624d',
    '--detail-label-text': '#54694d',
    '--text-main': '#14261d',
    '--text-muted': '#52624d',
    '--text-strong': '#102117',
    '--heading-text': '#f6f3dc',
    '--link-text': '#4c6e35',
    '--link-hover-text': '#7d6140',
    '--accent': '#f4efd9',
    '--inspector-clickable-bg': '#5f724c',
    '--inspector-clickable-border': '#87966a',
    '--inspector-clickable-text': '#f7f2dd',
    '--inspector-clickable-muted-text': '#e8e0bd',
    '--inspector-clickable-hover-bg': '#b99b63',
    '--inspector-clickable-hover-border': '#7d6140',
    '--inspector-clickable-hover-text': '#0d1c13',
    '--inspector-clickable-badge-bg': '#f4efd9',
    '--inspector-clickable-badge-text': '#3b4f2e',
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
