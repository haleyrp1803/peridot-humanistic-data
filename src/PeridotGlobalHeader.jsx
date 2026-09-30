/*
 * Persistent global navigation shell.
 *
 * This component exposes Peridot's stable top-level information architecture:
 * Home (through the brand), research navigation (Data, Visualize, Explore),
 * and scholarly/informational navigation (Tutorials, About).
 * Workspace-local controls remain inside their owning workspace.
 */

import React from 'react';
import peridotLogo from '../assets/Peridot Logo Gilded Transparent.png';
import './PeridotGlobalHeader.css';

const PRIMARY_NAV_ITEMS = Object.freeze([
  { key: 'data', label: 'Data' },
  { key: 'visualize', label: 'Visualize' },
  { key: 'explore', label: 'Explore' },
]);

const SECONDARY_NAV_ITEMS = Object.freeze([
  { key: 'tutorials', label: 'Tutorials' },
  { key: 'about', label: 'About' },
]);

function GlobalNavGroup({ items, activeSection, actions, ariaLabel, className = '' }) {
  return (
    <nav className={`peridot-global-nav ${className}`.trim()} aria-label={ariaLabel}>
      {items.map((item) => (
        <button
          key={item.key}
          type="button"
          className={`peridot-global-nav-link${activeSection === item.key ? ' is-active' : ''}`}
          onClick={actions[item.key]}
          aria-current={activeSection === item.key ? 'page' : undefined}
          data-peridot-global-nav={item.key}
        >
          {item.label}
        </button>
      ))}
    </nav>
  );
}

export function PeridotGlobalHeader({
  activeSection = '',
  onOpenHome,
  onOpenData,
  onOpenVisualize,
  onOpenExplore,
  onOpenTutorials,
  onOpenAbout,
}) {
  const actions = {
    data: onOpenData,
    visualize: onOpenVisualize,
    explore: onOpenExplore,
    tutorials: onOpenTutorials,
    about: onOpenAbout,
  };

  return (
    <header className="peridot-global-header" data-peridot-global-header="true">
      <button
        type="button"
        className="peridot-global-brand"
        onClick={onOpenHome}
        aria-label="Peridot home"
        title="Peridot home"
      >
        <img src={peridotLogo} alt="" className="peridot-global-brand-logo" draggable="false" />
        <span className="peridot-global-brand-name">Peridot</span>
      </button>

      <GlobalNavGroup
        items={PRIMARY_NAV_ITEMS}
        activeSection={activeSection}
        actions={actions}
        ariaLabel="Research navigation"
        className="peridot-global-nav-primary"
      />

      <GlobalNavGroup
        items={SECONDARY_NAV_ITEMS}
        activeSection={activeSection}
        actions={actions}
        ariaLabel="Project information navigation"
        className="peridot-global-nav-secondary"
      />
    </header>
  );
}
