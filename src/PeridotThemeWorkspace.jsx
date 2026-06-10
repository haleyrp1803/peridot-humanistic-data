/*
 * Themes and Accessibility workspace.
 *
 * This component presents appearance-related settings, including map/interface
 * theme presets and the semantic site-wide palette switcher used for palette
 * experiments.
 *
 * Important relationships:
 * - Map style presets are still owned by `App.jsx` through `themeTuning`.
 * - Site-wide semantic palettes are owned by `peridotTheme.js` and persisted in
 *   localStorage so a full page reload can rehydrate every CSS variable and
 *   module-level visualization token from the selected palette.
 *
 * Maintenance cautions:
 * - Keep appearance/accessibility settings grouped here rather than scattering
 *   them across visualization components.
 * - Palette switching intentionally reloads the app. Some visualization values
 *   are imported as module constants, so a reload is the safest way to test a
 *   palette consistently across interface and chart/map rendering.
 */

import React from 'react';
import {
  ACTIVE_PERIDOT_PALETTE_ID,
  DEFAULT_PERIDOT_PALETTE_ID,
  PERIDOT_PALETTE_OPTIONS,
  resetActivePeridotPaletteId,
  setActivePeridotPaletteId,
} from './peridotTheme.js';

export function PeridotThemeWorkspace({ themePresetKey, applyThemePreset, resetTheme, onOpenVisualizations }) {
  const themeOptions = [
    { key: 'peridot', title: 'Peridot default', description: 'Return to the current mossy green Peridot interface and map palette.', action: resetTheme },
    { key: 'preModern', title: 'Early modern map', description: 'Use the warmer historical-map palette for geographic exploration.', action: () => applyThemePreset('preModern') },
    { key: 'modern', title: 'Modern map', description: 'Use the higher-contrast modern map palette.', action: () => applyThemePreset('modern') },
  ];

  return (
    <section className="peridot-workspace-field text-[var(--peridot-color-hex-fbf7ea)]">
      <div className="peridot-workspace-frame">
        <div className="peridot-hero-card">
          <div className="peridot-workspace-header-row">
            <div>
              <p className="peridot-kicker">Themes and accessibility</p>
              <h1 className="peridot-title-medium">Choose Peridot&apos;s appearance</h1>
              <p className="peridot-lede">
                Themes and accessibility holds Peridot appearance settings. These controls adjust map styles and the site-wide semantic palette without changing loaded data, filters, timeline, Inspector, or export scope.
              </p>
            </div>
            <button type="button" onClick={onOpenVisualizations} className="peridot-button-secondary shrink-0">
              Return to visualizations
            </button>
          </div>
        </div>

        <div className="mt-6 rounded-[28px] border border-[var(--peridot-role-interface-border-subtle)] bg-[var(--peridot-role-card-dark-surface-bg)] p-5 text-[var(--peridot-role-interface-text-on-dark)] shadow-[0_18px_46px_var(--peridot-role-card-shadow)]">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="peridot-kicker text-[11px]">Site-wide palette</p>
              <h2 className="[font-family:Georgia,'Palatino_Linotype','Book_Antiqua',Palatino,serif] text-2xl font-bold tracking-[-0.035em] text-[var(--peridot-role-interface-text-on-dark)]">
                Test interface and visualization palettes
              </h2>
              <p className="mt-2 max-w-3xl text-sm leading-relaxed text-[var(--peridot-role-interface-text-muted-on-dark)]">
                These palette choices route through the semantic theme system. Selecting one saves it locally and reloads Peridot so cards, buttons, Inspector, charts, map colors, and export styling can rehydrate from the same palette source.
              </p>
            </div>
            <button
              type="button"
              onClick={() => resetActivePeridotPaletteId()}
              className="peridot-button-secondary shrink-0"
              disabled={ACTIVE_PERIDOT_PALETTE_ID === DEFAULT_PERIDOT_PALETTE_ID}
            >
              Reset site palette
            </button>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {PERIDOT_PALETTE_OPTIONS.map((palette) => {
              const active = ACTIVE_PERIDOT_PALETTE_ID === palette.id;
              return (
                <button
                  key={palette.id}
                  type="button"
                  onClick={() => setActivePeridotPaletteId(palette.id)}
                  className={[
                    'rounded-[22px] border p-4 text-left transition-all duration-150 hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-[var(--peridot-role-interface-focus-ring)]',
                    active
                      ? 'border-[var(--peridot-role-button-primary-hover-bg)] bg-[var(--peridot-role-button-secondary-hover-bg)] text-[var(--peridot-role-button-secondary-text)] shadow-[0_14px_32px_var(--peridot-role-card-shadow)]'
                      : 'border-[var(--peridot-role-interface-border-subtle)] bg-[var(--peridot-role-card-dark-bg)] text-[var(--peridot-role-interface-text-on-dark)] hover:border-[var(--peridot-role-button-primary-hover-bg)] hover:bg-[var(--peridot-role-card-dark-surface-bg)]',
                  ].join(' ')}
                >
                  <span className="text-[0.68rem] font-black uppercase tracking-[0.22em] text-[var(--peridot-role-interface-text-muted-on-dark)]">
                    {active ? 'Active site palette' : 'Palette candidate'}
                  </span>
                  <span className="mt-2 block text-lg font-extrabold text-[var(--peridot-role-interface-text-on-dark)]">
                    {palette.label}
                  </span>
                  <span className="mt-3 grid grid-cols-5 overflow-hidden rounded-2xl border border-[var(--peridot-role-interface-border-subtle)]">
                    {palette.swatches.map((swatch) => (
                      <span
                        key={`${palette.id}-${swatch}`}
                        className="h-9 border-r border-[var(--peridot-role-interface-border-subtle)] last:border-r-0"
                        style={{ backgroundColor: swatch }}
                        aria-hidden="true"
                      />
                    ))}
                  </span>
                </button>
              );
            })}
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
                  'peridot-card-inner text-left transition-all duration-150 hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-[var(--peridot-role-interface-focus-ring)]',
                  active ? 'peridot-gold-active ring-2 ring-[var(--peridot-role-button-primary-border)]' : 'peridot-surface-card peridot-gold-hover',
                ].join(' ')}
              >
                <span className="peridot-section-label block">{active ? 'Active map style' : 'Map style preset'}</span>
                <span className="mt-3 block text-2xl font-bold text-[var(--peridot-role-interface-text-on-dark)]">{option.title}</span>
                <span className="mt-3 block text-sm leading-7 text-[var(--peridot-role-interface-text-muted-on-dark)]">{option.description}</span>
              </button>
            );
          })}
        </div>

        <div className="mt-6 rounded-[28px] border border-[var(--peridot-role-interface-border-subtle)] bg-[var(--peridot-role-button-secondary-bg)] p-5 text-[var(--peridot-role-interface-text-on-dark)] shadow-[0_18px_46px_var(--peridot-role-card-shadow)]">
          <p className="peridot-kicker text-[11px]">Accessibility settings</p>
          <h2 className="[font-family:Georgia,'Palatino_Linotype','Book_Antiqua',Palatino,serif] text-2xl font-bold tracking-[-0.035em] text-[var(--peridot-role-interface-text-on-dark)]">
            More controls can live here later.
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-[var(--peridot-role-interface-text-muted-on-dark)]">
            This workspace now owns appearance-related settings. Future passes can add contrast, density, motion, or label-display preferences here without changing the main visualization workflow.
          </p>
        </div>
      </div>
    </section>
  );
}
