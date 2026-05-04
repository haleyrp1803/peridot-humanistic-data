import React from 'react';
import { InspectorBodyRouter } from './InspectorBodyRouter.jsx';

export function InspectorPanelContent({
  sidebar,
  inspectorState,
  letterState,
  shellComponents,
  viewComponents,
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
      <InspectorHeaderComponent
        showInspectorInfo={showInspectorInfo}
        setShowInspectorInfo={setShowInspectorInfo}
      />

      <InspectorBackButtonComponent
        canGoBack={canGoBack}
        onBack={onBackInspector}
      />

      <InspectorBodyRouter
        inspectorState={inspectorState}
        letterState={letterState}
        viewComponents={viewComponents}
      />
    </>
  );
}

export function InspectorPanel(props) {
  return <InspectorPanelContent {...props} />;
}
