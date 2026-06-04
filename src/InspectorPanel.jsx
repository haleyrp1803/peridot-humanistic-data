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
}) {
  const {
    showInspectorInfo,
    setShowInspectorInfo,
  } = sidebar;

  const {
    canGoBack,
    onBackInspector,
  } = inspectorState;

  const {
    InspectorHeaderComponent,
    InspectorBackButtonComponent,
  } = shellComponents;

  return (
    <>
      {showHeader ? (
        <InspectorHeaderComponent
          showInspectorInfo={showInspectorInfo}
          setShowInspectorInfo={setShowInspectorInfo}
        />
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
