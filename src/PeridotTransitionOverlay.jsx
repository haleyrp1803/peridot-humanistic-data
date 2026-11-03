/* Shared workspace transition overlay. App.jsx owns activation.
 * Keep the Canvas mounted so visualization switches reuse the same worker.
 * Inactive periods pause drawing rather than tearing down the renderer. */
import React from 'react';
import { PeridotLoadingGem, DEFAULT_PERIDOT_LOADER_THEME } from './PeridotLoadingGem.jsx';
import './PeridotTransitionOverlay.css';

export function PeridotTransitionOverlay({ active = false, label = 'Opening…' }) {
  return (
    <div
      className={`peridot-transition-overlay peridot-loader-theme-${DEFAULT_PERIDOT_LOADER_THEME}${active ? ' is-active' : ''}`}
      aria-hidden={active ? undefined : 'true'}
      aria-live="polite"
      aria-busy={active ? 'true' : 'false'}
      role="status"
      data-peridot-transition-overlay="true"
    >
      <div className="peridot-transition-overlay-content">
        <PeridotLoadingGem active={active} />
        <div className="peridot-transition-overlay-label">{label}</div>
      </div>
    </div>
  );
}
