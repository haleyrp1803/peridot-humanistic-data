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

import React, { useEffect, useRef, useState } from 'react';
import { InspectorPanelContent } from './InspectorPanel.jsx';

// Keep this width preference independent of Inspector selection/history. The compact
// shell unmounts on close, so component state alone cannot preserve the preference.
const COMPACT_INSPECTOR_WIDTH_KEY = 'peridot-compact-inspector-width-v1';
const DEFAULT_COMPACT_INSPECTOR_WIDTH = 420;
const MIN_COMPACT_INSPECTOR_WIDTH = 340;
const MAX_COMPACT_INSPECTOR_WIDTH = 680;
const MIN_VISUALIZATION_REMAINDER = 520;

function clampCompactInspectorWidth(width) {
  const available = typeof window === 'undefined' ? 1200 : window.innerWidth;
  const ceiling = Math.min(MAX_COMPACT_INSPECTOR_WIDTH, Math.max(MIN_COMPACT_INSPECTOR_WIDTH, available - MIN_VISUALIZATION_REMAINDER));
  return Math.max(MIN_COMPACT_INSPECTOR_WIDTH, Math.min(ceiling, Math.round(width)));
}

function readCompactInspectorWidth() {
  try {
    const stored = Number(window.sessionStorage.getItem(COMPACT_INSPECTOR_WIDTH_KEY));
    return clampCompactInspectorWidth(Number.isFinite(stored) && stored > 0 ? stored : DEFAULT_COMPACT_INSPECTOR_WIDTH);
  } catch {
    return DEFAULT_COMPACT_INSPECTOR_WIDTH;
  }
}

/**
 * Shared visual surface for the compact side-panel Inspector.
 *
 * The class intentionally preserves the old side-panel visual tokens and absolute
 * positioning so this cleanup does not alter compact Inspector placement. Only the
 * obsolete non-Inspector panel contents were removed.
 */
function sidebarSurfaceClassName() {
  // Compact Inspector itself owns the full-height banner and parchment body.
  // Avoid a second green frame and inset padding in this compatibility shell.
  return 'relative overflow-visible bg-transparent';
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
  const [panelWidth, setPanelWidth] = useState(readCompactInspectorWidth);
  const [isResizing, setIsResizing] = useState(false);
  const resizeGuideRef = useRef(null);
  const resizeGestureRef = useRef(null);

  const commitWidth = (value) => {
    const nextWidth = clampCompactInspectorWidth(value);
    setPanelWidth(nextWidth);
    try {
      window.sessionStorage.setItem(COMPACT_INSPECTOR_WIDTH_KEY, String(nextWidth));
    } catch {
      // Session storage may be disabled; resizing remains functional in memory.
    }
  };

  // Remove window listeners even if the panel is closed during a resize.
  useEffect(() => {
    const cancelGesture = () => {
      resizeGestureRef.current?.cancel?.();
    };
    const onWindowResize = () => {
      setPanelWidth((current) => clampCompactInspectorWidth(current));
    };
    window.addEventListener('blur', cancelGesture);
    window.addEventListener('resize', onWindowResize);
    return () => {
      resizeGestureRef.current?.cancel?.();
      window.removeEventListener('blur', cancelGesture);
      window.removeEventListener('resize', onWindowResize);
    };
  }, []);

  const startResize = (event) => {
    if (event.button !== 0 || !window.matchMedia('(min-width: 1280px)').matches) return;
    event.preventDefault();
    event.stopPropagation();
    const gesture = { startX: event.clientX, startWidth: panelWidth, nextWidth: panelWidth };
    resizeGestureRef.current = gesture;
    setIsResizing(true);
    const move = (pointer) => {
      if (resizeGestureRef.current !== gesture) return;
      const next = clampCompactInspectorWidth(gesture.startWidth + pointer.clientX - gesture.startX);
      gesture.nextWidth = next;
      if (resizeGuideRef.current) resizeGuideRef.current.style.left = `${next}px`;
    };
    const cleanup = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', stop);
      window.removeEventListener('pointercancel', cancel);
      window.removeEventListener('blur', cancel);
    };
    const stop = (pointer) => {
      move(pointer);
      cleanup();
      if (resizeGestureRef.current === gesture) commitWidth(gesture.nextWidth);
      resizeGestureRef.current = null;
      setIsResizing(false);
    };
    const cancel = () => {
      cleanup();
      resizeGestureRef.current = null;
      setIsResizing(false);
    };
    gesture.cancel = cancel;
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', stop);
    window.addEventListener('pointercancel', cancel);
    window.addEventListener('blur', cancel);
  };

  const resizeByKeyboard = (event) => {
    const step = event.shiftKey ? 40 : 16;
    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
      event.preventDefault();
      commitWidth(panelWidth + (event.key === 'ArrowRight' ? step : -step));
    } else if (event.key === 'Home') {
      event.preventDefault();
      commitWidth(DEFAULT_COMPACT_INSPECTOR_WIDTH);
    }
  };

  if (!showRightSidebar) {
    return null;
  }

  return (
    <aside
      className={`${sidebarSurfaceClassName()} xl:absolute xl:left-0 xl:top-0 xl:z-30 xl:h-full w-[420px]`}
      aria-label="Compact Inspector side panel"
      data-peridot-compatibility-shell="compact-inspector"
      style={{ width: `min(${panelWidth}px, calc(100vw - 16px))` }}
    >
      <div className="h-full min-h-0 overflow-hidden">
        <InspectorPanelContent
          {...inspectorPanelProps}
          shellComponents={inspectorShellComponents}
          viewComponents={inspectorViewComponents}
        />
      </div>
      {/* The resizing grip sits outside the Inspector's scrollable content. */}
      <div
        role="separator"
        aria-label="Resize compact Inspector"
        aria-orientation="vertical"
        aria-valuemin={MIN_COMPACT_INSPECTOR_WIDTH}
        aria-valuemax={typeof window !== 'undefined' ? clampCompactInspectorWidth(MAX_COMPACT_INSPECTOR_WIDTH) : MAX_COMPACT_INSPECTOR_WIDTH}
        aria-valuenow={panelWidth}
        aria-valuetext={`${panelWidth} pixels wide`}
        tabIndex={0}
        onPointerDown={startResize}
        onDoubleClick={() => commitWidth(DEFAULT_COMPACT_INSPECTOR_WIDTH)}
        onKeyDown={resizeByKeyboard}
        title="Drag to resize Inspector; double-click or press Home to reset"
        className="group absolute inset-y-0 -right-[7px] z-40 hidden w-[14px] cursor-col-resize touch-none items-center justify-center xl:flex focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7C211E]"
      >
        <span aria-hidden="true" className="h-16 w-[5px] rounded-full border border-[#bfa875] bg-[#f5efe4] shadow-sm transition-colors group-hover:bg-[#d5b355] group-focus-visible:bg-[#d5b355]" />
      </div>
      {isResizing && (
        <div
          ref={resizeGuideRef}
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 z-50 hidden w-[2px] bg-[#7C211E] xl:block"
          style={{ left: panelWidth }}
        />
      )}
    </aside>
  );
}
