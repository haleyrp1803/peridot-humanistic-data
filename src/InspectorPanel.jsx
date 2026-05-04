import React from 'react';
import { InspectorBodyRouter } from './InspectorBodyRouter.jsx';

function sidebarSurfaceClassName() {
  return 'relative overflow-visible border-[var(--sidebar-border)] bg-[var(--sidebar-bg)] backdrop-blur-sm transition-all duration-300';
}


function PanelModeTabs({ activePanel, onShowControls, onShowInspector, onClose }) {
  const baseClass = 'flex-1 rounded-xl px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/40';
  const activeClass = 'border border-[var(--button-primary-border)] bg-[var(--button-primary-bg)] text-[var(--button-primary-text)] shadow-[0_8px_18px_rgba(0,0,0,0.22)]';
  const inactiveClass = 'border border-[var(--button-secondary-border)] bg-[var(--button-secondary-bg)] text-[var(--button-secondary-text)] hover:bg-[var(--button-secondary-hover)]';

  return (
    <div className="mb-5 rounded-2xl border border-[var(--section-border)] bg-[var(--section-bg)] p-2 shadow-[0_8px_22px_rgba(0,0,0,0.24)]">
      <div className="flex items-center gap-2">
        <button
          type="button"
          className={`${baseClass} ${activePanel === 'controls' ? activeClass : inactiveClass}`}
          onClick={onShowControls}
          aria-pressed={activePanel === 'controls'}
        >
          Controls
        </button>
        <button
          type="button"
          className={`${baseClass} ${activePanel === 'inspector' ? activeClass : inactiveClass}`}
          onClick={onShowInspector}
          aria-pressed={activePanel === 'inspector'}
        >
          Inspector
        </button>
        <button
          type="button"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[var(--button-secondary-border)] bg-[var(--button-secondary-bg)] text-sm font-bold text-[var(--button-secondary-text)] transition-colors hover:bg-[var(--button-secondary-hover)]"
          onClick={onClose}
          aria-label="Close side panel"
          title="Close panel"
        >
          ×
        </button>
      </div>
    </div>
  );
}

export function InspectorPanel({
  sidebar,
  inspectorState,
  letterState,
  shellComponents,
  viewComponents,
}) {
  const {
    showRightSidebar,
    setShowRightSidebar,
    setShowLeftSidebar,
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
    <aside className={`${sidebarSurfaceClassName()} border-r xl:absolute xl:left-0 xl:top-0 xl:h-full xl:z-40 w-[420px]`}>
      <SidebarToggleComponent side="left" open={showRightSidebar} onToggle={() => setShowRightSidebar(false)} />
      <div className="relative h-full overflow-auto p-5 pr-20 pb-24">
          <PanelModeTabs
            activePanel="inspector"
            onShowControls={() => setShowLeftSidebar(true)}
            onShowInspector={() => setShowRightSidebar(true)}
            onClose={() => setShowRightSidebar(false)}
          />
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
