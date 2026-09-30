/*
 * Shared Peridot workspace transition overlay.
 *
 * The overlay gives expensive workspace changes an immediate visual response
 * while preserving the destination workspace's mounted state underneath it.
 * It deliberately stays visually restrained in this first pass so later
 * animation work can build on one stable transition boundary.
 */

import React from 'react';
import peridotLogo from '../assets/Peridot Logo Gilded Transparent.png';
import './PeridotTransitionOverlay.css';

export function PeridotTransitionOverlay({ active = false, label = 'Opening…' }) {
  return (
    <div
      className={`peridot-transition-overlay${active ? ' is-active' : ''}`}
      aria-hidden={active ? undefined : 'true'}
      aria-live="polite"
      aria-busy={active ? 'true' : 'false'}
      role="status"
      data-peridot-transition-overlay="true"
    >
      <div className="peridot-transition-overlay-content">
        <img
          src={peridotLogo}
          alt=""
          className="peridot-transition-overlay-logo"
          draggable="false"
        />
        <div className="peridot-transition-overlay-name">Peridot</div>
        <div className="peridot-transition-overlay-label">{label}</div>
      </div>
    </div>
  );
}
