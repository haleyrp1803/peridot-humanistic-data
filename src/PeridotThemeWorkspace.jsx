/*
 * Themes and Accessibility workspace.
 * 
 * This component presents appearance-related settings, including existing map/interface theme presets and placeholder space for future accessibility options.
 * 
 * Important relationships:
 * - Theme application is still owned by `App.jsx`; this component renders the controls and explanatory UI.
 * 
 * Maintenance cautions:
 * - Keep appearance/accessibility settings grouped here rather than scattering them across visualization components.
 */

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
              <p className="peridot-kicker">Themes and accessibility</p>
              <h1 className="peridot-title-medium">Choose Peridot&apos;s appearance</h1>
              <p className="peridot-lede">
                Themes and accessibility holds Peridot appearance settings. These presets adjust the map and interface palette without changing loaded data, filters, timeline, Inspector, or export scope. Accessibility-specific controls can be added here as the interface matures.
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
                  'peridot-card-inner text-left transition-all duration-150 hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-[#d6a36a]/60',
                  active ? 'peridot-gold-active ring-2 ring-[#f5ecd2]/65' : 'peridot-surface-card peridot-gold-hover',
                ].join(' ')}
              >
                <span className="peridot-section-label block">{active ? 'Active theme' : 'Theme preset'}</span>
                <span className="mt-3 block text-2xl font-bold text-[#fbf7ea]">{option.title}</span>
                <span className="mt-3 block text-sm leading-7 text-[#f7f2df]/82">{option.description}</span>
              </button>
            );
          })}
        </div>

        <div className="mt-6 rounded-[28px] border border-[#dfe9c8]/32 bg-[#dfe9c8]/10 p-5 text-[#f8f4e6] shadow-[0_18px_46px_rgba(0,0,0,0.22)]">
          <p className="peridot-kicker text-[11px] text-[#dfe9c8]">Accessibility settings</p>
          <h2 className="[font-family:Georgia,'Palatino_Linotype','Book_Antiqua',Palatino,serif] text-2xl font-bold tracking-[-0.035em] text-[#f5ecd2]">
            More controls can live here later.
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-[#dfe9c8]">
            This workspace now owns appearance-related settings. Future passes can add contrast, density, motion, or label-display preferences here without changing the main visualization workflow.
          </p>
        </div>
      </div>
    </section>
  );
}
