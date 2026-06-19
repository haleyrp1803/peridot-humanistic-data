/*
 * Primary product navigation menu.
 * 
 * This component renders the hamburger-triggered menu. It exposes the current top-level product model: data management, visualization, exploration, and project information.
 * 
 * Important relationships:
 * - It calls workspace route setters owned by `App.jsx`.
 * - Not every internal workspace mode should appear here; Search, Inspector, Timeline, and Export can still be reached through contextual UI when appropriate.
 * 
 * Maintenance cautions:
 * - Treat this as user-facing product vocabulary. Label changes affect the conceptual model of the app, not only navigation text.
 */

import React from 'react';

export function PeridotHamburgerMenu({
  open,
  onToggle,
  onClose,
  workspaceMode,
  onOpenData,
  onOpenVisualizations,
  onOpenExplore,
  onOpenLearnMore,
}) {
  if (workspaceMode === 'home') {
    return null;
  }

  const menuItems = [
    {
      key: 'data',
      title: 'Manage Your Data',
      description: 'Upload, stage, map, join, and validate your records.',
      action: onOpenData,
      active: workspaceMode === 'data',
    },
    {
      key: 'visualizations',
      title: 'Visualize Your Data',
      description: 'Open maps, networks, charts, and timeline controls.',
      action: onOpenVisualizations,
      active: workspaceMode === 'visualizations',
    },
    {
      key: 'explore',
      title: 'Explore Your Data',
      description: 'Review dataset capability and inspect selected evidence.',
      action: onOpenExplore,
      active: workspaceMode === 'explore' || workspaceMode === 'search' || workspaceMode === 'inspector',
    },
    {
      key: 'learn-more',
      title: 'Learn More about Peridot',
      description: 'Project information, credits, tutorials, and guides.',
      action: onOpenLearnMore,
      active: workspaceMode === 'learn-more',
    },
    /*
     * Themes and Accessibility remains an internal workspace for development,
     * but is intentionally hidden from the public hamburger menu for now.
     * Restore the menu entry by re-adding the item that opens the THEME route.
     */
  ];

  const handleItemClick = (item) => {
    if (typeof item.action === 'function') {
      item.action();
    }
    onClose();
  };

  return (
    <div className="fixed left-5 top-5 z-[200]">
      <button
        type="button"
        onClick={onToggle}
        className="peridot-gem-button flex h-11 w-11 items-center justify-center rounded-full border border-[var(--peridot-color-hex-dfe9c8-a70)] bg-[var(--peridot-color-hex-f5f1df)] text-xl font-black text-[var(--peridot-color-hex-173120)] shadow-[0_12px_28px_var(--peridot-color-rgba-rgba-0-0-0-0-38)] transition hover:bg-[var(--peridot-color-hex-d6a36a)] focus:outline-none focus:ring-2 focus:ring-[var(--peridot-color-hex-f5ecd2-a80)]"
        aria-label={open ? 'Close Peridot menu' : 'Open Peridot menu'}
        aria-expanded={open}
      >
        {open ? '×' : '≡'}
      </button>

      {open ? (
        <div
          className="peridot-illuminated-panel mt-3 w-[min(360px,calc(100vw-2.5rem))] overflow-hidden rounded-[28px] border border-[var(--peridot-color-hex-dfe9c8-a55)] bg-[linear-gradient(145deg,var(--peridot-color-rgba-rgba-2-20-13-0-98),var(--peridot-color-rgba-rgba-12-44-31-0-96))] p-3 text-[var(--peridot-color-hex-fbf7ea)] shadow-[0_24px_70px_var(--peridot-color-rgba-rgba-0-0-0-0-58)] backdrop-blur-md"
          role="menu"
          aria-label="Peridot navigation"
        >
          <div className="border-b border-[var(--peridot-color-hex-dfe9c8-a20)] px-3 pb-3 pt-2">
            <p className="peridot-kicker !mb-0 text-[10px] text-[var(--peridot-color-hex-dfe9c8)]">Peridot menu</p>
            <h2 className="[font-family:Georgia,'Palatino_Linotype','Book_Antiqua',Palatino,serif] text-2xl font-bold tracking-[-0.035em] text-[var(--peridot-color-hex-f5ecd2)]">
              Workspaces
            </h2>
          </div>

          <div className="mt-3 grid gap-2">
            {menuItems.map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => handleItemClick(item)}
                className={[
                  'group rounded-2xl border px-4 py-3 text-left transition focus:outline-none focus:ring-2 focus:ring-[var(--peridot-color-hex-d6a36a-a70)]',
                  item.active
                    ? 'border-[var(--peridot-color-hex-f5ecd2-a85)] bg-[var(--peridot-color-hex-b58b42-a72)] text-[var(--peridot-color-hex-fff8e8)] shadow-[0_12px_28px_var(--peridot-color-rgba-rgba-0-0-0-0-26)]'
                    : 'border-[var(--peridot-color-hex-dfe9c8-a22)] bg-[var(--peridot-color-hex-dfe9c8-a8)] text-[var(--peridot-color-hex-fbf7ea)] hover:border-[var(--peridot-color-hex-f5ecd2-a65)] hover:bg-[var(--peridot-color-hex-dfe9c8-a14)]',
                ].join(' ')}
                role="menuitem"
              >
                <span className="block text-sm font-bold">{item.title}</span>
                <span className={['mt-1 block text-xs leading-relaxed', item.active ? 'text-[var(--peridot-color-hex-fff3d4)]' : 'text-[var(--peridot-color-hex-dfe9c8)]'].join(' ')}>
                  {item.description}
                </span>
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
