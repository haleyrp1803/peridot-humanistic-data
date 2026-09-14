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
  return [
    'absolute bottom-6 z-20 inline-flex items-center gap-2 rounded-full border border-[var(--peridot-role-ornament-line-muted)]',
    'bg-[var(--peridot-color-hex-102c20)] px-4 py-2 text-[11px] font-bold uppercase tracking-[0.14em]',
    'text-[var(--peridot-role-interface-text-on-dark)] shadow-[0_10px_24px_rgba(0,0,0,0.28)] backdrop-blur-[1px]',
    'transition duration-150 hover:border-[var(--peridot-role-ornament-line)] hover:text-[var(--peridot-role-ornament-sparkle)] focus:outline-none focus:ring-2 focus:ring-[var(--peridot-role-interface-text-on-dark)]',
    position === 'right' ? 'right-6' : 'left-6',
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
  const [isOpen, setIsOpen] = useState(true);
  const isPlaceMap = clusterPluralLabel === 'places';
  const clusterLabel = isPlaceMap ? 'Place cluster' : 'People / entity cluster';
  const singleLabel = isPlaceMap ? 'Single place' : 'Single person / entity';
  const edgeLabel = isPlaceMap ? 'Geographic route' : 'Relationship';
  const edgeCountLabel = isPlaceMap ? 'Routes' : 'Connections';

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
        <span aria-hidden="true" className="text-[10px]">⌃</span>
      </button>
    );
  }

  return (
    <div className={`absolute bottom-6 left-6 z-20 w-[220px] p-3 text-xs ${floatingCardClassName()}`}>
      <div className="mb-2 flex items-center justify-between gap-3">
        <div className="[font-family:Georgia,'Palatino_Linotype','Book_Antiqua',Palatino,serif] text-[14px] font-bold text-[var(--text-main)]">Legend</div>
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          className="flex h-5 w-5 items-center justify-center rounded-full border border-[var(--button-secondary-border)] bg-[var(--button-secondary-bg)] text-[10px] font-bold text-[var(--button-secondary-text)] hover:bg-[var(--button-secondary-hover)]"
          aria-label="Collapse map legend"
          title="Collapse map legend"
        >
          ⌃
        </button>
      </div>

      <div className="space-y-2 text-[11px] leading-[1.25] text-[var(--muted-text)]">
        <div className="flex items-center gap-2.5">
          <span className="h-7 w-7 shrink-0 rounded-full border-2 border-[var(--peridot-color-hex-fff8e8)] bg-[var(--peridot-color-hex-b58b42)] shadow-[0_2px_5px_rgba(0,0,0,0.14)]" aria-hidden="true" />
          <span><span className="font-semibold text-[var(--text-main)]">{clusterLabel}</span><br /><span>(number = {clusterPluralLabel})</span></span>
        </div>
        <div className="flex items-center gap-2.5">
          <svg aria-hidden="true" viewBox="0 0 20 20" className="h-5 w-5 shrink-0">
            <circle cx="10" cy="10" r="7" fill="var(--peridot-color-hex-214f2f)" stroke="var(--peridot-color-hex-fff8e8)" strokeWidth="2.2" />
          </svg>
          <span className="font-semibold text-[var(--text-main)]">{singleLabel}</span>
        </div>
        <div className="flex items-center gap-2.5">
          <span className="h-[2px] w-8 shrink-0 rounded-full bg-[var(--peridot-color-hex-b58b42)]" aria-hidden="true" />
          <span><span className="font-semibold text-[var(--text-main)]">{edgeLabel}</span><br /><span>(aggregated)</span></span>
        </div>
      </div>

      <div className="mt-2.5 flex items-center gap-3 border-t border-[var(--peridot-color-hex-d8c79a)] pt-2 text-[10px] font-semibold text-[var(--muted-text)]">
        <span>Nodes: {nodes.length}</span>
        <span className="h-3 w-px bg-[var(--peridot-color-hex-d8c79a)]" aria-hidden="true" />
        <span>{edgeCountLabel}: {edges.length}</span>
      </div>
    </div>
  );
}

export function MapControlsOverlay({
  onZoomIn,
  onZoomOut,
  onStop,
  onReset,
}) {
  const controlClassName = 'flex h-9 w-9 items-center justify-center rounded-full border border-[var(--peridot-color-hex-d8c79a)] bg-[color-mix(in_srgb,var(--peridot-color-hex-fffaf0)_94%,transparent)] text-[var(--peridot-color-hex-203429)] shadow-[0_7px_18px_rgba(0,0,0,0.22)] backdrop-blur-sm transition hover:border-[var(--peridot-role-ornament-line)] hover:bg-[var(--peridot-color-hex-f5ecd2)] focus:outline-none focus:ring-2 focus:ring-[var(--peridot-color-hex-d6a36a-a60)]';

  return (
    <div className="pointer-events-auto absolute right-[196px] top-6 z-[110] flex items-center gap-2.5" aria-label="Map view controls">
      <button
        type="button"
        onMouseDown={onZoomOut}
        onMouseUp={onStop}
        onMouseLeave={onStop}
        onTouchStart={onZoomOut}
        onTouchEnd={onStop}
        className={controlClassName}
        aria-label="Zoom out"
        title="Zoom out"
      >
        <svg aria-hidden="true" viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
          <circle cx="8.5" cy="8.5" r="5" />
          <path d="M5.8 8.5h5.4M12.2 12.2l4 4" />
        </svg>
      </button>
      <button
        type="button"
        onMouseDown={onZoomIn}
        onMouseUp={onStop}
        onMouseLeave={onStop}
        onTouchStart={onZoomIn}
        onTouchEnd={onStop}
        className={controlClassName}
        aria-label="Zoom in"
        title="Zoom in"
      >
        <svg aria-hidden="true" viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
          <circle cx="8.5" cy="8.5" r="5" />
          <path d="M5.8 8.5h5.4M8.5 5.8v5.4M12.2 12.2l4 4" />
        </svg>
      </button>
      <button
        type="button"
        onClick={onReset}
        className={controlClassName}
        aria-label="Reset map view"
        title="Reset map view"
      >
        <svg aria-hidden="true" viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M7 3.5H3.5V7M13 3.5h3.5V7M7 16.5H3.5V13M13 16.5h3.5V13" />
          <path d="M6.2 10h7.6" opacity="0.55" />
        </svg>
      </button>
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
