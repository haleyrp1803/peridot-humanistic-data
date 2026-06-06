/*
 * Compact Inspector side-panel compatibility shell.
 *
 * The current Peridot interface is workspace-first: data management, visualizations,
 * exploration/search, themes/accessibility, timeline controls, and export actions
 * are no longer meant to live in the old left-side rail. Earlier versions of this
 * file contained the full legacy side-panel system for controls, data inputs,
 * Search & Filter, Timeline, Analytics, Theme, and Export. Those user-facing paths
 * have been promoted to workspaces or visualization-header controls.
 *
 * This file now keeps only the compatibility surface that is still active:
 * visualization clicks can open the compact Inspector as a side panel while the
 * map/network/chart workspace remains mounted underneath. The full Inspector
 * workspace uses the same Inspector content through `InspectorPanel.jsx`, but it
 * is rendered elsewhere by `App.jsx`.
 *
 * Important relationships:
 * - `App.jsx` still owns the master side-panel state and passes a broader
 *   compatibility prop object into this component. Those extra props are
 *   intentionally ignored here so older App-side state can be reduced in later,
 *   separately tested passes.
 * - `InspectorPanel.jsx` owns the shared Inspector chrome/body router. This file
 *   should not duplicate Inspector content logic.
 * - `InspectorBodyRouter.jsx` and the extracted Inspector views own the actual
 *   evidence-detail rendering.
 *
 * Maintenance cautions:
 * - Do not reintroduce old side-panel tabs here. New workflow surfaces should live
 *   in the relevant workspace or in the Visualizations header.
 * - Do not split compact and full Inspector state. This component is only a
 *   presentation shell over the Inspector state owned by `App.jsx`.
 * - If compact Inspector behavior changes, explicitly test node click, edge click,
 *   cluster click, linked-record navigation, Back, Expand, and close behavior.
 */

import React from 'react';
import { InspectorPanelContent } from './InspectorPanel.jsx';

/**
 * Shared visual surface for the compact side-panel Inspector.
 *
 * The class intentionally preserves the old side-panel visual tokens and absolute
 * positioning so this cleanup does not alter compact Inspector placement. Only the
 * obsolete non-Inspector panel contents were removed.
 */
function sidebarSurfaceClassName() {
  return 'relative overflow-visible border-[var(--sidebar-border)] bg-[var(--sidebar-bg)] backdrop-blur-sm transition-all duration-300';
}

/**
 * Render the compact Inspector side panel when visualization interactions request it.
 *
 * `sidebarState.showRightSidebar` is the historical compatibility flag for the
 * compact Inspector. The name is stale because the project once had separate left
 * and right sidebars, then a shared side-panel shell. It is intentionally preserved
 * until `App.jsx` state naming can be simplified in a dedicated pass.
 *
 * `sidebarState.showLeftSidebar` used to open the old controls/data/search/export
 * side-panel. That product path has been retired. If an old caller toggles it, this
 * component deliberately renders nothing instead of reviving obsolete UI.
 */
export function LeftControlPanel({
  sidebarState = {},
  inspectorPanelProps,
  inspectorShellComponents,
  inspectorViewComponents,
}) {
  const { showRightSidebar } = sidebarState;

  if (!showRightSidebar) {
    return null;
  }

  return (
    <aside
      className={`${sidebarSurfaceClassName()} relative border-r xl:absolute xl:left-0 xl:top-0 xl:z-30 xl:h-full w-[420px]`}
      aria-label="Compact Inspector side panel"
      data-peridot-compatibility-shell="compact-inspector"
    >
      <div className="h-full overflow-auto p-5 pr-5">
        <InspectorPanelContent
          {...inspectorPanelProps}
          shellComponents={inspectorShellComponents}
          viewComponents={inspectorViewComponents}
        />
      </div>
    </aside>
  );
}
