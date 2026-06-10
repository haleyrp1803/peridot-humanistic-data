/*
 * Themes and Accessibility workspace.
 *
 * This component presents appearance-related settings, including map/interface
 * theme presets, the semantic site-wide palette switcher used for palette
 * experiments, and a role-based palette dashboard for broad creative control.
 *
 * Important relationships:
 * - Map style presets are still owned by `App.jsx` through `themeTuning`.
 * - Site-wide semantic palettes are owned by `peridotTheme.js` and persisted in
 *   localStorage so a full page reload can rehydrate every CSS variable and
 *   module-level visualization token from the selected palette.
 * - Human-facing role labels and usage descriptions live in
 *   `peridotThemeRoleMetadata.js`; actual color values remain in
 *   `peridotTheme.js`.
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
  PERIDOT_APP_THEME_DEFAULTS,
  PERIDOT_PALETTE_OPTIONS,
  PERIDOT_THEME,
  resetActivePeridotPaletteId,
  setActivePeridotPaletteId,
} from './peridotTheme.js';
import { PERIDOT_THEME_ROLE_GROUPS } from './peridotThemeRoleMetadata.js';

function readThemePath(source, path) {
  return String(path || '')
    .split('.')
    .filter(Boolean)
    .reduce((current, key) => (current && Object.prototype.hasOwnProperty.call(current, key) ? current[key] : undefined), source);
}

function getColorPreviewItems(value) {
  if (Array.isArray(value)) {
    return value.map((item, index) => ({ id: `${index}-${item}`, value: item, label: String(index + 1) }));
  }
  if (typeof value === 'string') {
    return [{ id: value, value, label: '' }];
  }
  return [];
}

function isDisplayableColor(value) {
  const text = String(value || '').trim();
  return /^#[0-9a-fA-F]{6}$/.test(text) || /^rgba?\(/i.test(text) || text === 'transparent';
}

function ColorSwatch({ value, label }) {
  const color = String(value || '').trim();
  return (
    <span className="flex min-w-0 items-center gap-2">
      <span
        className="h-7 w-7 shrink-0 rounded-full border border-[var(--peridot-role-interface-border-subtle)] shadow-[0_5px_16px_var(--peridot-role-card-shadow)]"
        style={{ backgroundColor: isDisplayableColor(color) ? color : 'transparent' }}
        title={color}
        aria-hidden="true"
      />
      <span className="min-w-0 font-mono text-[0.72rem] font-semibold text-[var(--peridot-role-interface-text-muted-on-dark)]">
        {label ? `${label}: ` : ''}{color}
      </span>
    </span>
  );
}

function PaletteRoleRow({ role, value }) {
  const previewItems = getColorPreviewItems(value);
  return (
    <div className="grid gap-3 border-t border-[var(--peridot-role-interface-border-subtle)] py-3 first:border-t-0 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.15fr)_minmax(0,1.45fr)] md:items-center">
      <div>
        <p className="text-sm font-extrabold text-[var(--peridot-role-interface-text-on-dark)]">{role.label}</p>
        <p className="mt-1 font-mono text-[0.68rem] text-[var(--peridot-role-interface-text-muted-on-dark)]">{role.path}</p>
      </div>
      <div className="flex flex-wrap gap-2">
        {previewItems.length ? (
          previewItems.map((item) => <ColorSwatch key={item.id} value={item.value} label={Array.isArray(value) ? item.label : ''} />)
        ) : (
          <span className="font-mono text-[0.72rem] text-[var(--peridot-role-interface-text-muted-on-dark)]">{String(value ?? 'Not assigned')}</span>
        )}
      </div>
      <p className="text-sm leading-relaxed text-[var(--peridot-role-interface-text-muted-on-dark)]">{role.usage}</p>
    </div>
  );
}

function PaletteRoleGroup({ group, themeLookup }) {
  return (
    <section className="rounded-[24px] border border-[var(--peridot-role-interface-border-subtle)] bg-[var(--peridot-role-card-dark-bg)] p-4 shadow-[0_14px_34px_var(--peridot-role-card-shadow)]">
      <div className="mb-2">
        <p className="text-[0.68rem] font-black uppercase tracking-[0.22em] text-[var(--peridot-role-interface-text-muted-on-dark)]">{group.label}</p>
        <p className="mt-2 text-sm leading-relaxed text-[var(--peridot-role-interface-text-muted-on-dark)]">{group.description}</p>
      </div>
      <div>
        {group.roles.map((role) => (
          <PaletteRoleRow key={role.path} role={role} value={readThemePath(themeLookup, role.path)} />
        ))}
      </div>
    </section>
  );
}

export function PeridotThemeWorkspace({ themePresetKey, applyThemePreset, resetTheme, onOpenVisualizations }) {
  const themeOptions = [
    { key: 'peridot', title: 'Peridot default', description: 'Return to the current mossy green Peridot interface and map palette.', action: resetTheme },
    { key: 'preModern', title: 'Early modern map', description: 'Use the warmer historical-map palette for geographic exploration.', action: () => applyThemePreset('preModern') },
    { key: 'modern', title: 'Modern map', description: 'Use the higher-contrast modern map palette.', action: () => applyThemePreset('modern') },
  ];

  const themeLookup = {
    ...PERIDOT_THEME,
    appDefaults: PERIDOT_APP_THEME_DEFAULTS,
  };

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

        <div className="mt-6 rounded-[28px] border border-[var(--peridot-role-interface-border-subtle)] bg-[var(--peridot-role-card-dark-surface-bg)] p-5 text-[var(--peridot-role-interface-text-on-dark)] shadow-[0_18px_46px_var(--peridot-role-card-shadow)]">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="peridot-kicker text-[11px]">Palette roles</p>
              <h2 className="[font-family:Georgia,'Palatino_Linotype','Book_Antiqua',Palatino,serif] text-2xl font-bold tracking-[-0.035em] text-[var(--peridot-role-interface-text-on-dark)]">
                Broad color controls for creative editing
              </h2>
              <p className="mt-2 max-w-4xl text-sm leading-relaxed text-[var(--peridot-role-interface-text-muted-on-dark)]">
                This dashboard shows the role-based color assignments behind the active palette. Edit broad groups in <code className="rounded bg-[var(--peridot-role-card-dark-bg)] px-1.5 py-0.5 font-mono text-[0.78rem] text-[var(--peridot-role-interface-text-on-dark)]">src/peridotTheme.js</code> rather than hunting for individual hex values throughout the app.
              </p>
            </div>
            <div className="rounded-2xl border border-[var(--peridot-role-interface-border-subtle)] bg-[var(--peridot-role-card-dark-bg)] px-4 py-3 text-sm text-[var(--peridot-role-interface-text-muted-on-dark)]">
              Active palette: <span className="font-extrabold text-[var(--peridot-role-interface-text-on-dark)]">{PERIDOT_PALETTE_OPTIONS.find((palette) => palette.id === ACTIVE_PERIDOT_PALETTE_ID)?.label || ACTIVE_PERIDOT_PALETTE_ID}</span>
            </div>
          </div>

          <div className="mt-5 grid gap-4">
            {PERIDOT_THEME_ROLE_GROUPS.map((group) => (
              <PaletteRoleGroup key={group.id} group={group} themeLookup={themeLookup} />
            ))}
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
