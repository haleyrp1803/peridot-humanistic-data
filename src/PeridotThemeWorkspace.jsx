import React from 'react';

export function PeridotThemeWorkspace({ themePresetKey, applyThemePreset, resetTheme, onOpenVisualizations }) {
  const themeOptions = [
    { key: 'peridot', title: 'Peridot default', description: 'Return to the current mossy green Peridot interface and map palette.', action: resetTheme },
    { key: 'preModern', title: 'Early modern map', description: 'Use the warmer historical-map palette for geographic exploration.', action: () => applyThemePreset('preModern') },
    { key: 'modern', title: 'Modern map', description: 'Use the higher-contrast modern map palette.', action: () => applyThemePreset('modern') },
  ];

  return (
    <section className="peridot-workspace-field text-[#fbf7ea]">
      <div className="peridot-workspace-frame">
        <div className="peridot-hero-card">
          <div className="peridot-workspace-header-row">
            <div>
              <p className="peridot-kicker">Theme workspace</p>
              <h1 className="peridot-title-medium">Choose Peridot&apos;s appearance</h1>
              <p className="peridot-lede">
                Theme now lives as its own workspace rather than inside the legacy Controls panel. These presets adjust the map and interface palette without changing the loaded data, filters, timeline, Inspector, or export scope.
              </p>
            </div>
            <button type="button" onClick={onOpenVisualizations} className="peridot-button-secondary shrink-0">
              Return to visualizations
            </button>
          </div>
        </div>

        <div className="mt-6 peridot-card-grid peridot-card-grid-3">
          {themeOptions.map((option) => {
            const active = themePresetKey === option.key;
            return (
              <button
                key={option.key}
                type="button"
                onClick={option.action}
                className={[
                  'peridot-card-inner text-left transition-all duration-150 hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-[#dfe9c8]/50',
                  active ? 'peridot-action-card ring-2 ring-[#f5ecd2]/55' : 'peridot-surface-card hover:bg-[#143b27]',
                ].join(' ')}
              >
                <span className="peridot-section-label block">{active ? 'Active theme' : 'Theme preset'}</span>
                <span className="mt-3 block text-2xl font-bold text-[#fbf7ea]">{option.title}</span>
                <span className="mt-3 block text-sm leading-7 text-[#f7f2df]/82">{option.description}</span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
