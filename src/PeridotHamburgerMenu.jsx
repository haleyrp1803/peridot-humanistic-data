import React from 'react';

export function PeridotHamburgerMenu({
  open,
  onToggle,
  onClose,
  activePanelTab,
  workspaceMode,
  isSidePanelOpen,
  onGoHome,
  onOpenData,
  onOpenVisualizations,
  onOpenSearch,
  onOpenTimeline,
  onOpenAnalytics,
  onOpenInspector,
  onOpenTheme,
  onOpenExport,
  onCloseSidePanel,
}) {
  const menuItems = [
    {
      key: 'home',
      title: 'Home',
      description: 'Return to the Peridot welcome screen.',
      action: onGoHome,
      active: workspaceMode === 'home',
    },
    {
      key: 'data',
      title: 'Data',
      description: 'Upload, stage, map, and validate correspondence records.',
      action: onOpenData,
      active: workspaceMode === 'data',
    },
    {
      key: 'visualizations',
      title: 'Visualizations',
      description: 'Open maps, networks, and chart options for the current data.',
      action: onOpenVisualizations,
      active: workspaceMode === 'visualizations',
    },
    {
      key: 'search',
      title: 'Search & Filter',
      description: 'Define the active dataset used by views, charts, timeline, and export.',
      action: onOpenSearch,
      active: isSidePanelOpen && activePanelTab === 'search',
    },
    {
      key: 'timeline',
      title: 'Timeline',
      description: 'Control date scope and playback for the active correspondence data.',
      action: onOpenTimeline,
      active: isSidePanelOpen && activePanelTab === 'timeline',
    },
    {
      key: 'analytics',
      title: 'Analytics',
      description: 'Configure and preview charts from the current filtered records.',
      action: onOpenAnalytics,
      active: isSidePanelOpen && activePanelTab === 'analytics',
    },
    {
      key: 'inspector',
      title: 'Inspector',
      description: 'Review selected people, places, routes, clusters, and linked records.',
      action: onOpenInspector,
      active: isSidePanelOpen && activePanelTab === 'inspector',
    },
    {
      key: 'theme',
      title: 'Theme',
      description: 'Open appearance presets as a full workspace.',
      action: onOpenTheme,
      active: workspaceMode === 'theme',
    },
    {
      key: 'export',
      title: 'Export',
      description: 'Export the current visualization and derived node or route tables.',
      action: onOpenExport,
      active: isSidePanelOpen && activePanelTab === 'export',
    },
  ];

  const runAction = (action) => {
    action?.();
    onClose?.();
  };

  return (
    <>
      <button
        type="button"
        onClick={onToggle}
        className="fixed left-3 top-3 z-[90] flex h-11 w-11 items-center justify-center rounded-full border border-[var(--toggle-border)] bg-[var(--toggle-bg-open)] text-[var(--toggle-text)] shadow-[0_12px_28px_rgba(0,0,0,0.26)] transition hover:bg-[var(--utility-panel-bg)] hover:text-[var(--toggle-text-hover)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50"
        aria-label={open ? 'Close Peridot menu' : 'Open Peridot menu'}
        title={open ? 'Close menu' : 'Open menu'}
        aria-expanded={open}
      >
        <span className="sr-only">{open ? 'Close Peridot menu' : 'Open Peridot menu'}</span>
        {open ? (
          <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4.5 7h15" />
            <path d="M4.5 12h15" />
            <path d="M4.5 17h15" />
          </svg>
        )}
      </button>

      {open ? (
        <div className="fixed inset-0 z-[80]" role="presentation">
          <button
            type="button"
            className="absolute inset-0 cursor-default bg-[rgba(8,13,10,0.24)] backdrop-blur-[2px]"
            aria-label="Close Peridot menu"
            onClick={onClose}
          />
          <nav
            className="absolute left-3 top-16 max-h-[calc(100vh-5rem)] w-[min(92vw,420px)] overflow-y-auto rounded-[24px] border border-[var(--panel-card-border)]/85 bg-[var(--panel-card-bg)]/96 p-3 text-[var(--text-main)] shadow-[0_24px_64px_rgba(0,0,0,0.38)] backdrop-blur-md"
            aria-label="Peridot main menu"
          >
            <div className="px-2 pb-2">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--accent)]">Peridot</p>
              <h2 className="mt-1 [font-family:Georgia,'Palatino_Linotype','Book_Antiqua',Palatino,serif] text-xl font-bold text-[var(--heading-text)]">
                Main menu
              </h2>
            </div>
            <div className="space-y-2">
              {menuItems.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => runAction(item.action)}
                  className={[
                    'group block w-full rounded-xl border px-4 py-3 text-center transition focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/45',
                    item.active
                      ? 'border-[var(--button-primary-active-border)] bg-[var(--button-primary-active-bg)] text-[var(--button-primary-text)] shadow-[0_10px_22px_rgba(0,0,0,0.22)]'
                      : 'border-[var(--section-border)] bg-[var(--section-bg)] text-[var(--text-main)] hover:bg-[var(--panel-card-hover)]',
                  ].join(' ')}
                >
                  <span className="block text-lg font-bold leading-6">{item.title}</span>
                  <span className="mx-auto mt-0 block max-h-0 max-w-[19rem] overflow-hidden text-sm leading-5 opacity-0 transition-all duration-200 group-hover:mt-1 group-hover:max-h-16 group-hover:opacity-85 group-focus-visible:mt-1 group-focus-visible:max-h-16 group-focus-visible:opacity-85">
                    {item.description}
                  </span>
                </button>
              ))}
            </div>
            {isSidePanelOpen ? (
              <button
                type="button"
                onClick={() => runAction(onCloseSidePanel)}
                className="mt-2 w-full rounded-xl border border-[var(--button-secondary-border)] bg-[var(--button-secondary-bg)] px-4 py-2.5 text-left text-sm font-semibold text-[var(--button-secondary-text)] transition hover:bg-[var(--button-secondary-hover)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/45"
              >
                Close current panel
              </button>
            ) : null}
          </nav>
        </div>
      ) : null}
    </>
  );
}
