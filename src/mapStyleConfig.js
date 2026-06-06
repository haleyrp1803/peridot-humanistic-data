/*
 * Dormant MapLibre preview style configuration.
 * 
 * This file belongs to the paused MapLibre preview path. The active production renderer is still the legacy D3/SVG path.
 * 
 * Maintenance cautions:
 * - Do not refactor, remove, or revive this file unless a pass explicitly resumes MapLibre work.
 * - If MapLibre resumes, start with a fresh branch/source-of-truth audit rather than assuming the old experiment can be merged directly.
 */

// MapLibre style configuration for Peridot.
//
// This module is intentionally small and side-effect free. It gives the app a
// single place to record MapLibre style URLs, attribution expectations, and
// provider notes before MapLibre is wired into the production map stage.
//
// Pass 1 note:
// - The default style below is a MapLibre demo style used only for smoke tests.
// - A later pass should replace or supplement it with the production basemap
//   style selected for the itch.io deployment.

export const MAPLIBRE_STYLE_IDS = {
  DEMO: 'maplibre-demo',
};

export const MAPLIBRE_STYLES = {
  [MAPLIBRE_STYLE_IDS.DEMO]: {
    id: MAPLIBRE_STYLE_IDS.DEMO,
    label: 'MapLibre demo style',
    styleUrl: 'https://demotiles.maplibre.org/style.json',
    requiresApiKey: false,
    usage: 'development-smoke-test-only',
    attributionNote:
      'Uses the public MapLibre demo style for isolated integration testing. Replace or supplement before production map migration.',
  },
};

export const DEFAULT_MAPLIBRE_STYLE_ID = MAPLIBRE_STYLE_IDS.DEMO;

export function getMapLibreStyleConfig(styleId = DEFAULT_MAPLIBRE_STYLE_ID) {
  return MAPLIBRE_STYLES[styleId] || MAPLIBRE_STYLES[DEFAULT_MAPLIBRE_STYLE_ID];
}
