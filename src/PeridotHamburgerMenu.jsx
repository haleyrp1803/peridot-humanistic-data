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
  onOpenTheme,
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
    {
      key: 'theme',
      title: 'Themes and Accessibility',
      description: 'Adjust Peridot appearance and future accessibility settings.',
      action: onOpenTheme,
      active: workspaceMode === 'theme',
    },
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
        className="flex h-11 w-11 items-center justify-center rounded-full border border-[#dfe9c8]/70 bg-[#f5f1df] text-xl font-black text-[#173120] shadow-[0_12px_28px_rgba(0,0,0,0.38)] transition hover:bg-[#d6a36a] focus:outline-none focus:ring-2 focus:ring-[#f5ecd2]/80"
        aria-label={open ? 'Close Peridot menu' : 'Open Peridot menu'}
        aria-expanded={open}
      >
        {open ? '×' : '≡'}
      </button>

      {open ? (
        <div
          className="mt-3 w-[min(360px,calc(100vw-2.5rem))] overflow-hidden rounded-[28px] border border-[#dfe9c8]/55 bg-[linear-gradient(145deg,rgba(2,20,13,0.98),rgba(12,44,31,0.96))] p-3 text-[#fbf7ea] shadow-[0_24px_70px_rgba(0,0,0,0.58)] backdrop-blur-md"
          role="menu"
          aria-label="Peridot navigation"
        >
          <div className="border-b border-[#dfe9c8]/20 px-3 pb-3 pt-2">
            <p className="peridot-kicker !mb-0 text-[10px] text-[#dfe9c8]">Peridot menu</p>
            <h2 className="[font-family:Georgia,'Palatino_Linotype','Book_Antiqua',Palatino,serif] text-2xl font-bold tracking-[-0.035em] text-[#f5ecd2]">
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
                  'group rounded-2xl border px-4 py-3 text-left transition focus:outline-none focus:ring-2 focus:ring-[#d6a36a]/70',
                  item.active
                    ? 'border-[#f5ecd2]/85 bg-[#b58b42]/72 text-[#fff8e8] shadow-[0_12px_28px_rgba(0,0,0,0.26)]'
                    : 'border-[#dfe9c8]/22 bg-[#dfe9c8]/8 text-[#fbf7ea] hover:border-[#f5ecd2]/65 hover:bg-[#dfe9c8]/14',
                ].join(' ')}
                role="menuitem"
              >
                <span className="block text-sm font-bold">{item.title}</span>
                <span className={['mt-1 block text-xs leading-relaxed', item.active ? 'text-[#fff3d4]' : 'text-[#dfe9c8]'].join(' ')}>
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
