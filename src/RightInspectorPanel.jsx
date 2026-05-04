import React from 'react';
import { InspectorBodyRouter } from './InspectorBodyRouter.jsx';

function sidebarSurfaceClassName() {
  return 'relative overflow-visible border-[var(--sidebar-border)] bg-[var(--sidebar-bg)] backdrop-blur-sm transition-all duration-300';
}

export function RightInspectorPanel({
  sidebar,
  inspectorState,
  letterState,
  shellComponents,
  viewComponents,
}) {
  const {
    showRightSidebar,
    setShowRightSidebar,
    showInspectorInfo,
    setShowInspectorInfo,
  } = sidebar;

  const {
    canGoBack,
    onBackInspector,
  } = inspectorState;

  const {
    SidebarToggleComponent,
    InspectorHeaderComponent,
    InspectorBackButtonComponent,
  } = shellComponents;

  if (!showRightSidebar) return null;

  return (
    <aside className={`${sidebarSurfaceClassName()} border-l xl:absolute xl:right-0 xl:top-0 xl:h-full xl:z-30 w-[420px]`}>
      <SidebarToggleComponent side="right" open={showRightSidebar} onToggle={() => setShowRightSidebar(false)} />
      <div className="relative h-full overflow-auto p-5 pl-20 pb-24">
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
        </div>
    </aside>
  );
}
