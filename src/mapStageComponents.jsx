/*
 * Small visual overlays for the map/network stage.
 * 
 * This module contains chrome around the SVG visualization: legend, controls, hover card, and title bar. These components should remain presentational and receive all behavior/state through props.
 * 
 * Important relationships:
 * - `App.jsx` and `PeridotVisualizationsWorkspace.jsx` decide when these overlays appear.
 * - Export captures the visualization stage, so overlay placement and SVG contents can affect what users expect in exported views.
 * 
 * Maintenance cautions:
 * - Legend and controls are intentionally minimized by default on map views to preserve workspace space.
 * - Avoid adding data derivation here; keep this file focused on stage-adjacent UI.
 */

import React, { useState } from 'react';

function mapUtilityButtonClassName(position = 'left') {
  const attachedSide = position === 'right' ? 'rounded-r-[18px]' : 'rounded-l-[18px]';
  return [
    'absolute bottom-4 z-20 inline-flex items-center gap-2 border border-[var(--peridot-role-ornament-line-muted)]',
    'bg-[color-mix(in_srgb,var(--peridot-role-interface-panel-background-strong)_84%,transparent)] px-3.5 py-2 text-[11px] font-bold uppercase tracking-[0.14em]',
    'text-[var(--peridot-role-interface-text-on-dark)] shadow-[0_10px_24px_rgba(0,0,0,0.28)] backdrop-blur-[1px]',
    'transition duration-150 hover:border-[var(--peridot-role-ornament-line)] hover:text-[var(--peridot-role-ornament-sparkle)] focus:outline-none focus:ring-2 focus:ring-[var(--peridot-role-interface-text-on-dark)]',
    attachedSide,
    position === 'right' ? 'right-4' : 'left-4',
  ].join(' ');
}

function MapUtilityLegendIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 18 18" className="h-4 w-4 text-[var(--peridot-role-ornament-line)]" fill="none">
      <path d="M9 2.5C7.7 5.1 5.7 7.1 3.1 8.5C5.7 9.9 7.7 11.9 9 15.5C10.3 11.9 12.3 9.9 14.9 8.5C12.3 7.1 10.3 5.1 9 2.5Z" fill="currentColor" />
      <path d="M9 5.8V11.8" stroke="var(--peridot-role-interface-panel-background-strong)" strokeWidth="1.15" strokeLinecap="round" opacity="0.65" />
    </svg>
  );
}

function MapUtilityControlsIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 18 18" className="h-4 w-4 text-[var(--peridot-role-ornament-line)]" fill="none">
      <circle cx="9" cy="9" r="3.2" stroke="currentColor" strokeWidth="1.7" />
      <path d="M9 1.9V4.1M9 13.9V16.1M1.9 9H4.1M13.9 9H16.1M4 4L5.5 5.5M12.5 12.5L14 14M14 4L12.5 5.5M5.5 12.5L4 14" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" />
    </svg>
  );
}

export function MapLegendOverlay({ nodes, edges, clusterPluralLabel, floatingCardClassName }) {
  const [isOpen, setIsOpen] = useState(false);

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={mapUtilityButtonClassName('left')}
        aria-label="Open map legend"
      >
        <MapUtilityLegendIcon />
        <span>Legend</span>
      </button>
    );
  }

  return (
    <div className={`absolute bottom-4 left-4 z-20 p-3 text-xs ${floatingCardClassName()}`}>
      <div className="mb-2 flex items-start justify-between gap-3">
        <div className="text-[var(--muted-text)]">Nodes: {nodes.length} | Routes: {edges.length}</div>
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          className="rounded-full border border-[var(--button-secondary-border)] bg-[var(--button-secondary-bg)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--button-secondary-text)] hover:bg-[var(--button-secondary-hover)]"
          aria-label="Minimize map legend"
          title="Minimize map legend"
        >
          −
        </button>
      </div>
      <div className="mb-1 font-semibold text-[var(--text-main)]">Legend</div>
      <div className="space-y-1 text-[var(--muted-text)]">
        <div><span className="font-medium">Primary circles</span>: {clusterPluralLabel}</div>
        <div><span className="font-medium">Cluster circles</span>: low-zoom {clusterPluralLabel} clusters</div>
        <div><span className="font-medium">Curved paths</span>: aggregated {clusterPluralLabel === 'places' ? 'geographic routes' : 'person-to-person connections'}</div>
        <div><span className="font-medium">Thicker line</span>: more letters on that route</div>
        <div><span className="font-medium">Mouse wheel</span>: zoom</div>
        <div><span className="font-medium">Drag</span>: pan</div>
      </div>
    </div>
  );
}

export function MapControlsOverlay({
  floatingCardClassName,
  buttonClassName,
  onPanUp,
  onPanLeft,
  onPanDown,
  onPanRight,
  onZoomIn,
  onZoomOut,
  onStop,
  onReset,
}) {
  const [isOpen, setIsOpen] = useState(false);

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={mapUtilityButtonClassName('right')}
        aria-label="Open map controls"
      >
        <MapUtilityControlsIcon />
        <span>Controls</span>
      </button>
    );
  }

  return (
    <div className={`absolute bottom-4 right-4 z-20 p-3 ${floatingCardClassName()}`}>
      <div className="mb-2 flex items-center justify-between gap-3 px-1">
        <div className="[font-family:Georgia,&quot;Palatino_Linotype&quot;,&quot;Book_Antiqua&quot;,Palatino,serif] text-[13px] font-bold uppercase tracking-[0.12em] text-[var(--group-heading-text)]">Map controls</div>
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          className="rounded-full border border-[var(--button-secondary-border)] bg-[var(--button-secondary-bg)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--button-secondary-text)] hover:bg-[var(--button-secondary-hover)]"
          aria-label="Minimize map controls"
          title="Minimize map controls"
        >
          −
        </button>
      </div>
      <div className="flex flex-col gap-2">
        <div className="flex justify-center">
          <button onMouseDown={onPanUp} onMouseUp={onStop} onMouseLeave={onStop} onTouchStart={onPanUp} onTouchEnd={onStop} aria-label="Pan up" className={`${buttonClassName()} min-w-[52px] shadow-sm`}>↑</button>
        </div>
        <div className="flex gap-2">
          <button onMouseDown={onPanLeft} onMouseUp={onStop} onMouseLeave={onStop} onTouchStart={onPanLeft} onTouchEnd={onStop} aria-label="Pan left" className={`${buttonClassName()} min-w-[52px] shadow-sm`}>←</button>
          <button onMouseDown={onPanDown} onMouseUp={onStop} onMouseLeave={onStop} onTouchStart={onPanDown} onTouchEnd={onStop} aria-label="Pan down" className={`${buttonClassName()} min-w-[52px] shadow-sm`}>↓</button>
          <button onMouseDown={onPanRight} onMouseUp={onStop} onMouseLeave={onStop} onTouchStart={onPanRight} onTouchEnd={onStop} aria-label="Pan right" className={`${buttonClassName()} min-w-[52px] shadow-sm`}>→</button>
        </div>
        <div className="flex gap-2">
          <button onMouseDown={onZoomIn} onMouseUp={onStop} onMouseLeave={onStop} onTouchStart={onZoomIn} onTouchEnd={onStop} aria-label="Zoom in" className={`${buttonClassName()} min-w-[52px] shadow-sm`}>+</button>
          <button onMouseDown={onZoomOut} onMouseUp={onStop} onMouseLeave={onStop} onTouchStart={onZoomOut} onTouchEnd={onStop} aria-label="Zoom out" className={`${buttonClassName()} min-w-[52px] shadow-sm`}>−</button>
          <button onClick={onReset} aria-label="Reset map view" className={`${buttonClassName()} shadow-sm`}>Reset</button>
        </div>
      </div>
    </div>
  );
}

export function HoverCardOverlay({ hoverCard, mapViewportSize }) {
  if (!hoverCard) return null;

  return (
    <div
      className="pointer-events-none absolute z-20 max-w-[320px] rounded-2xl border border-[var(--overlay-card-border)] bg-[var(--overlay-card-bg)] px-4 py-3 text-sm shadow-[0_16px_36px_var(--peridot-color-rgba-rgba-0-0-0-0-26)]"
      style={{
        left: Math.min(hoverCard.x + 18, Math.max(16, mapViewportSize.width - 340)),
        top: Math.max(16, hoverCard.y + 18),
      }}
    >
      <div className="font-semibold text-[var(--overlay-card-text)]">{hoverCard.title}</div>
      <div className="mt-1 text-[var(--overlay-card-muted-text)]">{hoverCard.subtitle}</div>
    </div>
  );
}

export function MapTitleBar({ pageTitle, setPageTitle }) {
  return (
    <div className="border-b border-[var(--section-border)] bg-[var(--title-bar-bg)] px-6 py-4">
      <input
        value={pageTitle}
        onChange={(e) => setPageTitle(e.target.value)}
        className="w-full rounded-xl border border-[var(--title-input-border)] bg-[var(--title-input-bg)] px-4 py-3 text-lg font-semibold text-[var(--title-display-text)] placeholder:text-[var(--title-placeholder)]"
        placeholder="Map title"
      />
    </div>
  );
}
