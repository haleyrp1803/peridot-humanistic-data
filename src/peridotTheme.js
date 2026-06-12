/*
 * Semantic Peridot theme system.
 *
 * This is the editable site-wide color control surface. Use this file for
 * palette experiments instead of editing individual components. Colors are
 * organized in two ways:
 *
 * 1. `PERIDOT_SOURCE_PALETTES` stores compact palette candidates by tone.
 *    Add new palettes here, or change `ACTIVE_PERIDOT_PALETTE_ID` to try one.
 * 2. `buildSemanticTheme` assigns those tones to interface, card, button,
 *    inspector, search, analytics, and visualization roles.
 *
 * The legacy raw-token file (`peridotColorPalette.js`) remains as a compatibility
 * adapter for older component code. When this file points at a non-legacy
 * palette, legacy tokens are tone-mapped so old imports still follow the active
 * site-wide palette.
 */

export const DEFAULT_PERIDOT_PALETTE_ID = 'legacyCurrent';
export const PERIDOT_PALETTE_STORAGE_KEY = 'peridot.activePaletteId';
export const PERIDOT_CUSTOM_THEME_STORAGE_KEY = 'peridot.customThemeOverrides';

export const PERIDOT_SOURCE_PALETTES = Object.freeze({
  legacyCurrent: {
    label: 'Peridot Upload Guide',
    // This single built-in palette is adapted from the generated upload guide.
    // It keeps the ornamental folio language while avoiding the oversaturated
    // orange cast that appears when the warm accent is used as a large surface.
    dark: ['#102613', '#043D0B', '#0B4510', '#31452B'],
    mid: ['#3E8137', '#6C8A50', '#90AA57', '#9DAF72'],
    light: ['#CCD9C7', '#E7E2C5', '#FBF5E8', '#FFF8E8'],
    highlight: ['#E6B24D', '#D5A043', '#B58B42'],
  },
});

export const PERIDOT_PALETTE_OPTIONS = Object.freeze(
  Object.entries(PERIDOT_SOURCE_PALETTES).map(([id, palette]) => ({
    id,
    label: palette.label || id,
    swatches: getPaletteSwatchesForPreview(palette),
  }))
);


export const PERIDOT_PALETTE_IMPORT_TARGETS = Object.freeze([
  {
    id: 'wholeApp',
    label: 'Whole app',
    description: 'Map the detected palette across interface surfaces, buttons, charts, map/network marks, Inspector, search, and status colors.',
  },
  {
    id: 'interface',
    label: 'Interface',
    description: 'Apply the palette to app backgrounds, workspace surfaces, panels, cards, forms, borders, and general text.',
  },
  {
    id: 'mapNetwork',
    label: 'Map and network',
    description: 'Apply the palette to map ocean/canvas, land, nodes, edges, labels, and visualization series colors only.',
  },
  {
    id: 'charts',
    label: 'Charts',
    description: 'Apply the palette to analytics chart backgrounds, text, gridlines, tooltips, and categorical chart series colors only.',
  },
  {
    id: 'buttonsHighlights',
    label: 'Buttons and highlights',
    description: 'Apply the palette to primary actions, hover states, focus accents, warnings, and highlighted UI states.',
  },
  {
    id: 'navigationChrome',
    label: 'Navigation and workspace chrome',
    description: 'Apply the palette to hamburger menus, workspace headers, tabs, dropdowns, and high-level navigation chrome.',
  },
  {
    id: 'timeline',
    label: 'Timeline controls',
    description: 'Apply the palette to timeline panels, tracks, handles, scrubbers, and playback controls.',
  },
  {
    id: 'searchWorkspace',
    label: 'Search workspace',
    description: 'Apply the palette to advanced-search panels, criterion cards, form controls, and result surfaces.',
  },
  {
    id: 'inspectorSearch',
    label: 'Inspector and search',
    description: 'Apply the palette to Inspector chrome, Inspector cards, clickable chips, search result surfaces, and status callouts.',
  },
  {
    id: 'textBorders',
    label: 'Text and borders',
    description: 'Apply the palette to broad text, muted text, borders, dividers, focus rings, and form outlines.',
  },
]);

function writeOverridePath(source, path, value) {
  const keys = String(path || '').split('.').filter(Boolean);
  if (!keys.length) return source;
  const next = source && typeof source === 'object' && !Array.isArray(source) ? source : {};
  let cursor = next;
  keys.forEach((key, index) => {
    if (index === keys.length - 1) {
      cursor[key] = value;
      return;
    }
    if (!cursor[key] || typeof cursor[key] !== 'object' || Array.isArray(cursor[key])) cursor[key] = {};
    cursor = cursor[key];
  });
  return next;
}

function saturation(hex) {
  const { r, g, b } = hexToRgb(hex);
  const max = Math.max(r, g, b) / 255;
  const min = Math.min(r, g, b) / 255;
  if (max === 0) return 0;
  return (max - min) / max;
}

function warmScore(hex) {
  const { r, g, b } = hexToRgb(hex);
  return (r * 1.15 + g * 0.55 - b * 0.55) / 255 + saturation(hex) * 0.5;
}

function normalizeDetectedPaletteColors(rawColors) {
  const values = (Array.isArray(rawColors) ? rawColors : [])
    .map((value) => String(value || '').trim())
    .filter((value) => /^#[0-9a-fA-F]{6}$/.test(value))
    .map((value) => value.toLowerCase());

  const unique = [];
  values.forEach((value) => {
    if (!unique.includes(value)) unique.push(value);
  });
  return unique;
}

function expandPaletteColors(colors) {
  const normalized = normalizeDetectedPaletteColors(colors);
  const fallback = getPaletteSwatchesForPreview(PERIDOT_SOURCE_PALETTES[DEFAULT_PERIDOT_PALETTE_ID]);
  const seed = normalized.length ? normalized : fallback;
  const expanded = [...seed];
  while (expanded.length < 8) {
    const base = expanded[expanded.length % seed.length] || '#6d8b53';
    expanded.push(expanded.length % 2 ? shade(base, 0.18) : shade(base, -0.18));
  }
  return expanded;
}

function buildPaletteAssignment(colors) {
  const expanded = expandPaletteColors(colors);
  const sorted = [...expanded].sort((a, b) => luminance(a) - luminance(b));
  const mids = sorted.filter((value) => luminance(value) >= 0.14 && luminance(value) <= 0.72);
  const nonWhite = sorted.filter((value) => luminance(value) < 0.92);
  const warmCandidates = [...nonWhite].sort((a, b) => warmScore(b) - warmScore(a));
  const highSaturation = [...nonWhite].sort((a, b) => saturation(b) - saturation(a));
  const pickByPosition = (position, fallback) => {
    const index = Math.max(0, Math.min(sorted.length - 1, Math.round((sorted.length - 1) * position)));
    return sorted[index] || fallback;
  };

  // Preserve the incoming image/read order for categorical series so chart
  // colors match the uploaded palette swatches instead of being reordered by
  // luminance. Broad surface roles use the luminance-sorted scale below.
  const series = expanded
    .filter((value, index, array) => array.indexOf(value) === index)
    .slice(0, 10);

  // Hard anchors: these are intentionally the literal darkest and lightest
  // detected colors. Whole-app imports use them for Peridot's deepest shells
  // and palest/readable surfaces so palette extremes are represented directly.
  const darkest = sorted[0];
  const lightest = sorted[sorted.length - 1] || shade(darkest, 0.78);

  const dark = sorted[1] || shade(darkest, 0.12);
  const deep = sorted[2] || pickByPosition(0.22, dark);
  const mid = mids[0] || pickByPosition(0.35, deep);
  const midAlt = mids[1] || pickByPosition(0.48, mid);
  const primary = mids[2] || highSaturation[0] || pickByPosition(0.55, midAlt);
  const secondary = mids[3] || highSaturation[1] || pickByPosition(0.62, primary);
  const soft = pickByPosition(0.70, shade(secondary, 0.35));
  const pale = pickByPosition(0.82, shade(soft, 0.2));
  const cream = pickByPosition(0.92, shade(pale, 0.2));
  const paper = lightest;
  const highlight = warmCandidates[0] || primary;
  const highlightLight = warmCandidates[1] || shade(highlight, 0.22);

  return {
    darkest,
    lightest,
    dark,
    deep,
    mid,
    midAlt,
    primary,
    secondary,
    soft,
    pale,
    cream,
    paper,
    highlight,
    highlightLight,
    series,
  };
}

function assignPaths(colors, pathValues) {
  return pathValues.reduce((overrides, [path, value]) => writeOverridePath(overrides, path, value), {});
}

function buildDarkLightAnchorPaletteOverrides(assignment) {
  return assignPaths(assignment, [
    // Foundation tone anchors.
    ['tones.ink', assignment.darkest],
    ['tones.paper', assignment.lightest],

    // Deepest app shells and high-contrast chrome.
    ['interface.appBackground', assignment.darkest],
    ['interface.panelBackgroundStrong', assignment.darkest],
    ['navigation.menuBg', assignment.darkest],
    ['workspaceChrome.headerBg', assignment.darkest],
    ['inspector.chromeBgStrong', assignment.darkest],
    ['inspector.chromeBg', assignment.darkest],
    ['inspector.headerBg', assignment.darkest],
    ['analytics.tooltipBg', assignment.darkest],
    ['timeline.trackBg', assignment.darkest],

    // Palest readable surfaces and text-on-dark roles.
    ['interface.cardBackground', assignment.lightest],
    ['interface.textOnDark', assignment.lightest],
    ['interface.textInverse', assignment.lightest],
    ['button.primaryText', assignment.lightest],
    ['button.secondaryText', assignment.lightest],
    ['analytics.chartBg', assignment.lightest],
    ['analytics.tooltipText', assignment.lightest],
    ['form.bgLight', assignment.lightest],
    ['form.textDark', assignment.lightest],
    ['inspector.cardBg', assignment.lightest],
    ['inspector.statCardBg', assignment.lightest],
    ['inspector.buttonBg', assignment.lightest],
    ['search.panelBg', assignment.lightest],
    ['search.inputBg', assignment.lightest],
    ['timeline.handleBg', assignment.lightest],
  ]);
}

function buildFoundationTonePaletteOverrides(assignment) {
  return assignPaths(assignment, [
    ['tones.ink', assignment.darkest],
    ['tones.night', assignment.dark],
    ['tones.deep', assignment.deep],
    ['tones.forest', assignment.mid],
    ['tones.mid', assignment.midAlt],
    ['tones.midAlt', assignment.secondary],
    ['tones.leaf', assignment.primary],
    ['tones.sage', assignment.secondary],
    ['tones.soft', assignment.soft],
    ['tones.pale', assignment.pale],
    ['tones.cream', assignment.cream],
    ['tones.paper', assignment.paper],
    ['tones.gold', assignment.highlight],
    ['tones.goldLight', assignment.highlightLight],
  ]);
}

function buildInterfacePaletteOverrides(assignment) {
  return assignPaths(assignment, [
    ['interface.appBackground', assignment.darkest],
    ['interface.appBackgroundAlt', assignment.dark],
    ['interface.workspaceBackground', assignment.deep],
    ['interface.panelBackground', assignment.dark],
    ['interface.panelBackgroundStrong', assignment.darkest],
    ['interface.cardBackground', assignment.lightest],
    ['interface.cardBackgroundWarm', assignment.cream],
    ['interface.cardBackgroundMuted', assignment.pale],
    ['interface.cardBackgroundDark', assignment.deep],
    ['interface.borderSubtle', withAlpha(assignment.midAlt, 0.32)],
    ['interface.borderStrong', withAlpha(assignment.soft, 0.62)],
    ['interface.textOnDark', assignment.lightest],
    ['interface.textMutedOnDark', assignment.pale],
    ['interface.textOnLight', assignment.deep],
    ['interface.textMutedOnLight', assignment.midAlt],
    ['interface.focusRing', withAlpha(assignment.highlightLight, 0.45)],
    ['card.darkBg', withAlpha(assignment.dark, 0.88)],
    ['card.darkSurfaceBg', withAlpha(assignment.deep, 0.88)],
    ['card.creamBg', withAlpha(assignment.lightest, 0.94)],
    ['card.creamText', assignment.deep],
    ['card.border', withAlpha(assignment.pale, 0.58)],
    ['card.shadow', withAlpha(assignment.darkest, 0.28)],
    ['form.bgDark', withAlpha(assignment.dark, 0.62)],
    ['form.bgLight', withAlpha(assignment.lightest, 0.88)],
    ['form.border', withAlpha(assignment.pale, 0.54)],
    ['form.textDark', assignment.paper],
    ['form.textLight', assignment.deep],
    ['form.placeholder', withAlpha(assignment.paper, 0.58)],
  ]);
}


function buildNavigationChromePaletteOverrides(assignment) {
  return assignPaths(assignment, [
    ['navigation.menuBg', assignment.darkest],
    ['navigation.menuBorder', withAlpha(assignment.pale, 0.32)],
    ['navigation.menuText', assignment.paper],
    ['navigation.menuMutedText', assignment.pale],
    ['navigation.itemBg', withAlpha(assignment.pale, 0.08)],
    ['navigation.itemHoverBg', withAlpha(assignment.highlight, 0.72)],
    ['navigation.itemActiveBg', assignment.highlight],
    ['navigation.itemActiveText', assignment.paper],
    ['navigation.itemBorder', withAlpha(assignment.pale, 0.38)],
    ['navigation.itemActiveBorder', withAlpha(assignment.cream, 0.82)],
    ['workspaceChrome.headerBg', assignment.dark],
    ['workspaceChrome.headerText', assignment.paper],
    ['workspaceChrome.headerMutedText', assignment.pale],
    ['workspaceChrome.headerBorder', withAlpha(assignment.pale, 0.32)],
    ['workspaceChrome.tabBg', withAlpha(assignment.pale, 0.10)],
    ['workspaceChrome.tabHoverBg', withAlpha(assignment.highlight, 0.35)],
    ['workspaceChrome.tabActiveBg', assignment.highlight],
    ['workspaceChrome.tabText', assignment.paper],
    ['workspaceChrome.dropdownBg', assignment.cream],
    ['workspaceChrome.dropdownText', assignment.deep],
    ['workspaceChrome.dropdownActiveBg', assignment.highlight],
    ['workspaceChrome.dropdownActiveText', assignment.paper],
  ]);
}

function buildTimelinePaletteOverrides(assignment) {
  return assignPaths(assignment, [
    ['timeline.panelBg', assignment.dark],
    ['timeline.panelBorder', withAlpha(assignment.pale, 0.40)],
    ['timeline.panelText', assignment.paper],
    ['timeline.panelMutedText', assignment.pale],
    ['timeline.trackBg', assignment.darkest],
    ['timeline.activeTrackBg', assignment.highlight],
    ['timeline.handleBg', assignment.lightest],
    ['timeline.handleBorder', assignment.highlightLight],
    ['timeline.buttonBg', assignment.cream],
    ['timeline.buttonText', assignment.deep],
    ['timeline.buttonActiveBg', assignment.highlight],
    ['timeline.buttonActiveText', assignment.paper],
  ]);
}

function buildSearchWorkspacePaletteOverrides(assignment) {
  return assignPaths(assignment, [
    ['search.shellBg', assignment.dark],
    ['inspector.cardBg', assignment.lightest],
    ['inspector.statCardBg', assignment.lightest],
    ['inspector.buttonBg', assignment.lightest],
    ['search.panelBg', assignment.lightest],
    ['search.panelBorder', withAlpha(assignment.midAlt, 0.36)],
    ['search.cardBg', assignment.cream],
    ['search.cardActiveBg', assignment.highlightLight],
    ['search.cardText', assignment.deep],
    ['search.cardMutedText', assignment.midAlt],
    ['search.inputBg', assignment.lightest],
    ['search.inputBorder', withAlpha(assignment.midAlt, 0.54)],
    ['search.criterionBg', assignment.pale],
    ['search.criterionActiveBg', assignment.highlight],
    ['search.resultBg', assignment.paper],
    ['search.resultBorder', withAlpha(assignment.midAlt, 0.38)],
    ['search.badgeBg', assignment.primary],
    ['search.badgeText', assignment.paper],
  ]);
}

function buildMapNetworkPaletteOverrides(assignment) {
  const mapMutedGreen = assignment.secondary || assignment.midAlt || assignment.primary;
  const mapActiveGreen = assignment.midAlt || assignment.mid || shade(mapMutedGreen, -0.18);
  const mapMutedGold = shade(assignment.highlight, -0.14);
  const mapMutedGoldLight = shade(assignment.highlightLight || assignment.highlight, -0.10);

  return assignPaths(assignment, [
    // Map imports deliberately invert the whole-app dark/light instinct: the
    // cartographic field should stay readable. Use the previous light land tone
    // as the sea/canvas wash, use a muted green for default land, and reserve a
    // deeper green between land and node/edge colors for active countries.
    // High-attention gold marks also use muted variants so imported palettes do
    // not make clusters or hover routes look neon against the parchment plate.
    ['visualization.canvasBg', assignment.lightest],
    ['visualization.frameBg', assignment.cream],
    ['visualization.frameBorder', assignment.midAlt],
    ['visualization.landFill', withAlpha(mapMutedGreen, 0.48)],
    ['visualization.landActiveFill', withAlpha(mapActiveGreen, 0.82)],
    ['visualization.landStroke', withAlpha(mapActiveGreen, 0.58)],
    ['visualization.gridStroke', withAlpha(assignment.midAlt, 0.22)],
    ['visualization.edge', assignment.deep],
    ['visualization.edgeHover', mapMutedGold],
    ['visualization.edgeActive', assignment.darkest],
    ['visualization.edgeSelected', assignment.darkest],
    ['visualization.node', assignment.deep],
    ['visualization.nodeCluster', mapMutedGold],
    ['visualization.nodeAnimated', mapMutedGreen],
    ['visualization.nodeHover', mapMutedGoldLight],
    ['visualization.nodeSelected', assignment.darkest],
    ['visualization.nodeStroke', assignment.lightest],
    ['visualization.labelText', assignment.darkest],
    ['visualization.labelStroke', assignment.lightest],
    ['visualization.series', [mapMutedGreen, assignment.midAlt, assignment.mid, mapMutedGold, mapMutedGoldLight, assignment.soft, assignment.secondary, assignment.deep].filter(Boolean)],
  ]);
}

function buildChartsPaletteOverrides(assignment) {
  const chartSeries = [
    assignment.secondary,
    shade(assignment.highlight, -0.12),
    assignment.deep,
    '#6f8f95',
    assignment.primary,
    '#a87968',
    assignment.highlightLight,
    assignment.midAlt,
    '#4f6f76',
    assignment.mid,
    shade(assignment.highlight, 0.12),
    assignment.dark,
  ].filter(Boolean);

  return assignPaths(assignment, [
    ['analytics.shellBg', withAlpha(assignment.dark, 0.86)],
    ['analytics.sidebarBg', assignment.pale],
    ['analytics.chartBg', assignment.lightest],
    ['analytics.chartText', assignment.deep],
    ['analytics.chartMutedText', assignment.midAlt],
    ['analytics.grid', withAlpha(assignment.midAlt, 0.32)],
    ['analytics.accent', assignment.primary],
    ['analytics.accentDark', assignment.deep],
    ['analytics.accentLight', assignment.soft],
    ['analytics.tooltipBg', assignment.darkest],
    ['analytics.tooltipText', assignment.lightest],
    ['analytics.series', chartSeries],
  ]);
}

function buildButtonHighlightPaletteOverrides(assignment) {
  return assignPaths(assignment, [
    ['button.primaryBg', assignment.primary],
    ['button.primaryHoverBg', assignment.highlight],
    ['button.primaryText', assignment.paper],
    ['button.primaryBorder', withAlpha(assignment.pale, 0.55)],
    ['button.secondaryBg', withAlpha(assignment.pale, 0.10)],
    ['button.secondaryHoverBg', assignment.highlight],
    ['button.secondaryText', assignment.paper],
    ['button.secondaryBorder', withAlpha(assignment.pale, 0.48)],
    ['button.creamBg', assignment.cream],
    ['button.creamText', assignment.deep],
    ['button.creamBorder', withAlpha(assignment.midAlt, 0.38)],
    ['interface.focusRing', withAlpha(assignment.highlightLight, 0.45)],
    ['status.warningBg', withAlpha(assignment.highlight, 0.25)],
    ['status.warningBorder', withAlpha(assignment.highlightLight, 0.50)],
    ['status.warningText', assignment.paper],
  ]);
}

function buildInspectorSearchPaletteOverrides(assignment) {
  return assignPaths(assignment, [
    ['inspector.chromeBg', assignment.dark],
    ['inspector.chromeBgStrong', assignment.darkest],
    ['inspector.chromeBg', assignment.darkest],
    ['inspector.headerBg', assignment.darkest],
    ['inspector.chromeBorder', withAlpha(assignment.pale, 0.42)],
    ['inspector.chromeText', assignment.paper],
    ['inspector.chromeMutedText', assignment.pale],
    ['inspector.headerBg', assignment.deep],
    ['inspector.headerBorder', withAlpha(assignment.pale, 0.34)],
    ['inspector.headingText', assignment.cream],
    ['inspector.bodyBg', assignment.pale],
    ['inspector.bodyText', assignment.deep],
    ['inspector.bodyMutedText', assignment.midAlt],
    ['inspector.bodyBorder', withAlpha(assignment.midAlt, 0.60)],
    ['inspector.bodyShadow', withAlpha(assignment.darkest, 0.24)],
    ['inspector.summaryCardBg', assignment.highlightLight],
    ['inspector.summaryCardBorder', assignment.cream],
    ['inspector.summaryCardText', assignment.deep],
    ['inspector.cardBg', assignment.cream],
    ['inspector.cardBorder', assignment.soft],
    ['inspector.cardText', assignment.deep],
    ['inspector.cardMutedText', assignment.midAlt],
    ['inspector.cardHoverBg', assignment.pale],
    ['inspector.sectionBg', assignment.soft],
    ['inspector.sectionBorder', assignment.midAlt],
    ['inspector.panelBg', assignment.soft],
    ['inspector.statCardBg', assignment.cream],
    ['inspector.buttonBg', assignment.cream],
    ['inspector.buttonBorder', withAlpha(assignment.midAlt, 0.42)],
    ['inspector.buttonText', assignment.deep],
    ['inspector.buttonHoverBg', assignment.highlight],
    ['inspector.buttonHoverBorder', assignment.darkest],
    ['inspector.buttonHoverText', assignment.darkest],
    ['inspector.buttonActiveBg', assignment.highlight],
    ['inspector.buttonActiveBorder', assignment.darkest],
    ['inspector.buttonActiveHoverBg', assignment.highlightLight],
    ['inspector.badgeBg', assignment.cream],
    ['inspector.badgeText', assignment.deep],
    ['inspector.emptyStateBg', assignment.cream],
    ['inspector.emptyStateBorder', assignment.midAlt],
    ['inspector.emptyStateText', assignment.midAlt],
    ['inspector.detailLabelText', assignment.midAlt],
    ['inspector.linkText', assignment.primary],
    ['inspector.linkHoverText', assignment.highlight],
    ['inspector.accent', assignment.highlight],
    ['inspector.clickableBg', assignment.primary],
    ['inspector.clickableBorder', assignment.secondary],
    ['inspector.clickableText', assignment.paper],
    ['inspector.clickableMutedText', assignment.cream],
    ['inspector.clickableHoverBg', assignment.highlight],
    ['inspector.clickableHoverBorder', assignment.darkest],
    ['inspector.clickableHoverText', assignment.darkest],
    ['inspector.clickableBadgeBg', assignment.cream],
    ['inspector.clickableBadgeText', assignment.deep],
    ['search.resultBg', assignment.paper],
    ['search.resultBorder', withAlpha(assignment.midAlt, 0.38)],
    ['status.warningBg', withAlpha(assignment.highlight, 0.25)],
    ['status.warningBorder', withAlpha(assignment.highlightLight, 0.50)],
    ['status.warningText', assignment.paper],
    ['status.dangerBg', withAlpha(assignment.deep, 0.32)],
    ['status.dangerBorder', withAlpha(assignment.highlight, 0.62)],
    ['status.dangerText', assignment.paper],
  ]);
}

function buildTextBorderPaletteOverrides(assignment) {
  return assignPaths(assignment, [
    ['interface.textOnDark', assignment.lightest],
    ['interface.textMutedOnDark', assignment.pale],
    ['interface.textOnLight', assignment.deep],
    ['interface.textMutedOnLight', assignment.midAlt],
    ['interface.textInverse', assignment.lightest],
    ['interface.borderSubtle', withAlpha(assignment.midAlt, 0.32)],
    ['interface.borderStrong', withAlpha(assignment.soft, 0.62)],
    ['interface.focusRing', withAlpha(assignment.highlightLight, 0.45)],
    ['card.border', withAlpha(assignment.pale, 0.58)],
    ['form.border', withAlpha(assignment.pale, 0.54)],
  ]);
}

export function buildPeridotPaletteImportOverrides(rawColors, targetId = 'wholeApp') {
  const assignment = buildPaletteAssignment(rawColors);
  const target = String(targetId || 'wholeApp');
  const builders = {
    interface: buildInterfacePaletteOverrides,
    navigationChrome: buildNavigationChromePaletteOverrides,
    timeline: buildTimelinePaletteOverrides,
    searchWorkspace: buildSearchWorkspacePaletteOverrides,
    mapNetwork: buildMapNetworkPaletteOverrides,
    charts: buildChartsPaletteOverrides,
    buttonsHighlights: buildButtonHighlightPaletteOverrides,
    inspectorSearch: buildInspectorSearchPaletteOverrides,
    textBorders: buildTextBorderPaletteOverrides,
  };

  if (target === 'wholeApp') {
    const broadOverrides = Object.values(builders).reduce(
      (merged, builder) => deepMerge(merged, builder(assignment)),
      buildFoundationTonePaletteOverrides(assignment)
    );
    return deepMerge(broadOverrides, buildDarkLightAnchorPaletteOverrides(assignment));
  }

  return builders[target] ? builders[target](assignment) : buildChartsPaletteOverrides(assignment);
}

function isBrowserRuntime() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function normalizePaletteId(paletteId) {
  const id = String(paletteId || '').trim();
  return Object.prototype.hasOwnProperty.call(PERIDOT_SOURCE_PALETTES, id) ? id : DEFAULT_PERIDOT_PALETTE_ID;
}

function getPaletteSwatchesForPreview(palette) {
  if (palette.swatches) return palette.swatches.map((value) => String(value).trim().toLowerCase());
  return [...(palette.dark || []), ...(palette.mid || []), ...(palette.light || []), ...(palette.highlight || [])].map((value) => String(value).trim().toLowerCase());
}

export function getActivePeridotPaletteId() {
  if (!isBrowserRuntime()) return DEFAULT_PERIDOT_PALETTE_ID;
  try {
    return normalizePaletteId(window.localStorage.getItem(PERIDOT_PALETTE_STORAGE_KEY));
  } catch (_error) {
    return DEFAULT_PERIDOT_PALETTE_ID;
  }
}

export function setActivePeridotPaletteId(paletteId, options = {}) {
  const nextPaletteId = normalizePaletteId(paletteId);
  if (isBrowserRuntime()) {
    try {
      window.localStorage.setItem(PERIDOT_PALETTE_STORAGE_KEY, nextPaletteId);
    } catch (_error) {
      // Ignore storage failures; callers can still use the returned palette id.
    }
    if (options.reload !== false) {
      window.location.reload();
    }
  }
  return nextPaletteId;
}

export function resetActivePeridotPaletteId(options = {}) {
  if (isBrowserRuntime()) {
    try {
      window.localStorage.removeItem(PERIDOT_PALETTE_STORAGE_KEY);
    } catch (_error) {
      // Ignore storage failures; callers can still fall back to the default id.
    }
    if (options.reload !== false) {
      window.location.reload();
    }
  }
  return DEFAULT_PERIDOT_PALETTE_ID;
}


function deepClone(value) {
  if (Array.isArray(value)) return value.map((item) => deepClone(item));
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, deepClone(item)]));
  }
  return value;
}

function deepMerge(baseValue, overrideValue) {
  if (Array.isArray(overrideValue)) return deepClone(overrideValue);
  if (!overrideValue || typeof overrideValue !== 'object') {
    return overrideValue === undefined ? deepClone(baseValue) : overrideValue;
  }

  const merged = baseValue && typeof baseValue === 'object' && !Array.isArray(baseValue)
    ? deepClone(baseValue)
    : {};

  Object.entries(overrideValue).forEach(([key, value]) => {
    merged[key] = deepMerge(merged[key], value);
  });

  return merged;
}

function readJsonFromLocalStorage(key, fallback) {
  if (!isBrowserRuntime()) return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : fallback;
  } catch (_error) {
    return fallback;
  }
}

export function getPeridotCustomThemeOverrides() {
  return readJsonFromLocalStorage(PERIDOT_CUSTOM_THEME_STORAGE_KEY, {});
}

export function setPeridotCustomThemeOverrides(overrides, options = {}) {
  const nextOverrides = overrides && typeof overrides === 'object' && !Array.isArray(overrides) ? overrides : {};
  if (isBrowserRuntime()) {
    try {
      window.localStorage.setItem(PERIDOT_CUSTOM_THEME_STORAGE_KEY, JSON.stringify(nextOverrides));
    } catch (_error) {
      // Ignore storage failures; callers can still use exported override JSON.
    }
    if (options.reload !== false) {
      window.location.reload();
    }
  }
  return nextOverrides;
}

export function clearPeridotCustomThemeOverrides(options = {}) {
  if (isBrowserRuntime()) {
    try {
      window.localStorage.removeItem(PERIDOT_CUSTOM_THEME_STORAGE_KEY);
    } catch (_error) {
      // Ignore storage failures; the base palette remains available.
    }
    if (options.reload !== false) {
      window.location.reload();
    }
  }
  return {};
}

export const PERIDOT_CUSTOM_THEME_OVERRIDES = Object.freeze(getPeridotCustomThemeOverrides());

export const ACTIVE_PERIDOT_PALETTE_ID = getActivePeridotPaletteId();

function normalizeHex(value) {
  const text = String(value || '').trim();
  if (/^#[0-9a-fA-F]{6}$/.test(text)) return text.toLowerCase();
  return '#000000';
}

function hexToRgb(hex) {
  const clean = normalizeHex(hex).slice(1);
  return {
    r: parseInt(clean.slice(0, 2), 16),
    g: parseInt(clean.slice(2, 4), 16),
    b: parseInt(clean.slice(4, 6), 16),
  };
}

function rgbToHex({ r, g, b }) {
  return `#${[r, g, b].map((part) => Math.max(0, Math.min(255, Math.round(part))).toString(16).padStart(2, '0')).join('')}`;
}

function luminance(hex) {
  const { r, g, b } = hexToRgb(hex);
  const [rr, gg, bb] = [r, g, b].map((channel) => {
    const value = channel / 255;
    return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * rr + 0.7152 * gg + 0.0722 * bb;
}

function colorDistance(hexA, hexB) {
  const a = hexToRgb(hexA);
  const b = hexToRgb(hexB);
  return Math.hypot(a.r - b.r, a.g - b.g, a.b - b.b);
}

function withAlpha(color, alpha) {
  const text = String(color || '').trim();
  const rgbaMatch = text.match(/^rgba?\(([^)]+)\)$/i);
  if (rgbaMatch) {
    const parts = rgbaMatch[1].split(',').map((part) => part.trim());
    return `rgba(${parts[0]}, ${parts[1]}, ${parts[2]}, ${alpha})`;
  }
  const { r, g, b } = hexToRgb(text);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function shade(hex, amount) {
  const rgb = hexToRgb(hex);
  const target = amount >= 0 ? 255 : 0;
  const pct = Math.abs(amount);
  return rgbToHex({
    r: rgb.r + (target - rgb.r) * pct,
    g: rgb.g + (target - rgb.g) * pct,
    b: rgb.b + (target - rgb.b) * pct,
  });
}

function getSwatches(palette) {
  if (palette.swatches) return palette.swatches.map(normalizeHex);
  return [...palette.dark, ...palette.mid, ...palette.light, ...palette.highlight].map(normalizeHex);
}

function buildToneScale(palette) {
  const swatches = getSwatches(palette);
  const sorted = [...swatches].sort((a, b) => luminance(a) - luminance(b));
  const nearest = (target) => sorted.reduce((best, value) => (
    Math.abs(luminance(value) - target) < Math.abs(luminance(best) - target) ? value : best
  ), sorted[0]);

  const dark = palette.dark?.map(normalizeHex) || sorted.slice(0, Math.min(4, sorted.length));
  const mid = palette.mid?.map(normalizeHex) || sorted.slice(Math.max(1, Math.floor(sorted.length * 0.35)), Math.max(2, Math.floor(sorted.length * 0.72)));
  const light = palette.light?.map(normalizeHex) || sorted.slice(Math.max(1, Math.floor(sorted.length * 0.65)));
  const highlight = palette.highlight?.map(normalizeHex) || [sorted.find((value) => {
    const { r, g, b } = hexToRgb(value);
    return r >= g && g >= b && luminance(value) > 0.18 && luminance(value) < 0.75;
  }) || nearest(0.35)];

  return {
    ink: dark[0] || nearest(0.02),
    night: dark[1] || nearest(0.05),
    deep: dark[2] || nearest(0.09),
    forest: dark[3] || nearest(0.12),
    mid: mid[0] || nearest(0.22),
    midAlt: mid[1] || nearest(0.30),
    leaf: mid[2] || nearest(0.38),
    sage: mid[3] || nearest(0.48),
    soft: light[0] || nearest(0.62),
    pale: light[1] || nearest(0.72),
    cream: light[2] || nearest(0.84),
    paper: light[3] || nearest(0.92),
    gold: highlight[0] || nearest(0.36),
    goldLight: highlight[1] || shade(highlight[0] || nearest(0.36), 0.25),
  };
}

export const ACTIVE_PERIDOT_SOURCE_PALETTE = PERIDOT_SOURCE_PALETTES[ACTIVE_PERIDOT_PALETTE_ID] || PERIDOT_SOURCE_PALETTES.legacyCurrent;
export const PERIDOT_TONES = Object.freeze(buildToneScale(ACTIVE_PERIDOT_SOURCE_PALETTE));

export function resolvePeridotLegacyColor(value) {
  const source = String(value || '').trim();

  const rgbaMatch = source.match(/^rgba?\(([^)]+)\)$/i);
  if (rgbaMatch) {
    const parts = rgbaMatch[1].split(',').map((part) => part.trim());
    const alpha = parts.length >= 4 ? parts[3] : '1';
    const asHex = rgbToHex({ r: Number(parts[0]), g: Number(parts[1]), b: Number(parts[2]) });
    const resolved = resolvePeridotLegacyColor(asHex);
    return withAlpha(resolved, alpha);
  }

  if (!/^#[0-9a-fA-F]{6}$/.test(source)) return source;

  const hasCustomOverrides = Boolean(PERIDOT_CUSTOM_THEME_OVERRIDES && Object.keys(PERIDOT_CUSTOM_THEME_OVERRIDES).length);
  if (ACTIVE_PERIDOT_PALETTE_ID === 'legacyCurrent' && !hasCustomOverrides) return source;

  const candidates = getLegacyThemeCandidatePairs();
  if (!candidates.length) return source;

  return candidates.reduce((best, candidate) => (
    colorDistance(source, candidate.anchor) < colorDistance(source, best.anchor) ? candidate : best
  ), candidates[0]).value;
}

export function buildSemanticTheme(tones = PERIDOT_TONES) {
  const mapMutedGreen = tones.sage || tones.midAlt || tones.leaf;
  const mapActiveGreen = tones.midAlt || tones.mid || shade(mapMutedGreen, -0.18);
  const mapSeaBlue = '#dbe3ec';
  const mapMutedGold = shade(tones.gold, -0.14);
  const mapMutedGoldLight = shade(tones.goldLight || tones.gold, -0.10);

  return Object.freeze({
    tones,
    interface: {
      appBackground: tones.ink,
      appBackgroundAlt: tones.night,
      workspaceBackground: tones.deep,
      panelBackground: tones.night,
      panelBackgroundStrong: tones.ink,
      cardBackground: tones.paper,
      cardBackgroundWarm: tones.cream,
      cardBackgroundMuted: tones.pale,
      cardBackgroundDark: tones.deep,
      borderSubtle: withAlpha(tones.pale, 0.34),
      borderStrong: withAlpha(tones.goldLight, 0.62),
      textOnDark: tones.paper,
      textMutedOnDark: tones.pale,
      textOnLight: tones.ink,
      textMutedOnLight: tones.forest,
      textInverse: tones.paper,
      focusRing: withAlpha(tones.gold, 0.42),
      scrim: withAlpha(tones.ink, 0.50),
      scrimStrong: withAlpha(tones.ink, 0.68),
    },
    button: {
      primaryBg: tones.gold,
      primaryHoverBg: tones.goldLight,
      primaryText: tones.ink,
      primaryBorder: withAlpha(tones.paper, 0.62),
      secondaryBg: withAlpha(tones.paper, 0.08),
      secondaryHoverBg: withAlpha(tones.gold, 0.18),
      secondaryText: tones.paper,
      secondaryBorder: withAlpha(tones.pale, 0.48),
      creamBg: tones.cream,
      creamText: tones.ink,
      creamBorder: withAlpha(tones.midAlt, 0.38),
    },
    navigation: {
      menuBg: tones.ink,
      menuBorder: withAlpha(tones.gold, 0.42),
      menuText: tones.paper,
      menuMutedText: tones.pale,
      itemBg: withAlpha(tones.paper, 0.055),
      itemHoverBg: withAlpha(tones.gold, 0.16),
      itemActiveBg: withAlpha(tones.gold, 0.24),
      itemActiveText: tones.paper,
      itemBorder: withAlpha(tones.pale, 0.28),
      itemActiveBorder: withAlpha(tones.goldLight, 0.86),
    },
    workspaceChrome: {
      headerBg: tones.ink,
      headerText: tones.paper,
      headerMutedText: tones.pale,
      headerBorder: withAlpha(tones.gold, 0.46),
      tabBg: withAlpha(tones.paper, 0.08),
      tabHoverBg: withAlpha(tones.gold, 0.15),
      tabActiveBg: withAlpha(tones.gold, 0.20),
      tabText: tones.paper,
      dropdownBg: tones.paper,
      dropdownText: tones.ink,
      dropdownActiveBg: tones.cream,
      dropdownActiveText: tones.ink,
    },
    timeline: {
      panelBg: tones.ink,
      panelBorder: withAlpha(tones.gold, 0.40),
      panelText: tones.paper,
      panelMutedText: tones.pale,
      trackBg: withAlpha(tones.paper, 0.20),
      activeTrackBg: tones.gold,
      handleBg: tones.paper,
      handleBorder: tones.goldLight,
      buttonBg: tones.cream,
      buttonText: tones.ink,
      buttonActiveBg: tones.gold,
      buttonActiveText: tones.ink,
    },
    search: {
      shellBg: tones.ink,
      panelBg: tones.paper,
      panelBorder: withAlpha(tones.midAlt, 0.36),
      cardBg: tones.cream,
      cardActiveBg: tones.pale,
      cardText: tones.ink,
      cardMutedText: tones.forest,
      inputBg: tones.paper,
      inputBorder: withAlpha(tones.midAlt, 0.54),
      criterionBg: tones.pale,
      criterionActiveBg: withAlpha(tones.gold, 0.22),
      resultBg: tones.paper,
      resultBorder: withAlpha(tones.midAlt, 0.38),
      badgeBg: tones.forest,
      badgeText: tones.paper,
    },
    card: {
      darkBg: withAlpha(tones.forest, 0.88),
      darkSurfaceBg: withAlpha(tones.deep, 0.88),
      creamBg: withAlpha(tones.paper, 0.94),
      creamText: tones.deep,
      border: withAlpha(tones.pale, 0.58),
      shadow: withAlpha(tones.ink, 0.28),
    },
    form: {
      bgDark: withAlpha(tones.night, 0.62),
      bgLight: withAlpha(tones.paper, 0.88),
      border: withAlpha(tones.pale, 0.54),
      textDark: tones.paper,
      textLight: tones.deep,
      placeholder: withAlpha(tones.paper, 0.58),
    },
    status: {
      warningBg: withAlpha(tones.gold, 0.25),
      warningBorder: withAlpha(tones.goldLight, 0.50),
      warningText: tones.paper,
      dangerBg: withAlpha('#7a2f2f', 0.32),
      dangerBorder: withAlpha('#b56c5d', 0.62),
      dangerText: '#fff5f2',
    },
    visualization: {
      canvasBg: mapSeaBlue,
      frameBg: tones.cream,
      frameBorder: '#0A2616',
      landFill: withAlpha(mapMutedGreen, 0.48),
      landActiveFill: withAlpha(mapActiveGreen, 0.82),
      landStroke: withAlpha(mapActiveGreen, 0.58),
      gridStroke: 'rgba(82, 100, 112, 0.22)',
      edge: tones.night,
      edgeHover: mapMutedGold,
      edgeActive: tones.deep,
      edgeSelected: tones.ink,
      node: tones.night,
      nodeCluster: mapMutedGold,
      nodeAnimated: mapMutedGreen,
      nodeHover: mapMutedGoldLight,
      nodeSelected: tones.ink,
      nodeStroke: tones.paper,
      labelText: tones.ink,
      labelStroke: tones.paper,
      series: [mapMutedGreen, tones.sage, tones.mid, mapMutedGold, mapMutedGoldLight, tones.soft, tones.midAlt, tones.forest],
    },
    inspector: {
      chromeBg: tones.forest,
      chromeBgStrong: tones.night,
      chromeBorder: withAlpha(tones.pale, 0.44),
      chromeText: tones.paper,
      chromeMutedText: tones.pale,
      headerBg: tones.forest,
      headerBorder: withAlpha(tones.pale, 0.34),
      headingText: tones.cream,
      bodyBg: tones.pale,
      bodyText: tones.deep,
      bodyMutedText: tones.forest,
      bodyBorder: withAlpha(tones.midAlt, 0.62),
      bodyShadow: withAlpha(tones.ink, 0.24),
      summaryCardBg: tones.goldLight,
      summaryCardBorder: tones.cream,
      summaryCardText: tones.night,
      cardBg: tones.cream,
      cardBorder: tones.soft,
      cardText: tones.deep,
      cardMutedText: tones.forest,
      cardHoverBg: tones.pale,
      sectionBg: tones.soft,
      sectionBorder: tones.midAlt,
      panelBg: tones.soft,
      statCardBg: tones.paper,
      buttonBg: tones.cream,
      buttonBorder: withAlpha(tones.midAlt, 0.42),
      buttonText: tones.night,
      buttonHoverBg: tones.gold,
      buttonHoverBorder: tones.forest,
      buttonHoverText: tones.ink,
      buttonActiveBg: tones.gold,
      buttonActiveBorder: tones.forest,
      buttonActiveHoverBg: tones.goldLight,
      badgeBg: tones.cream,
      badgeText: tones.forest,
      emptyStateBg: tones.cream,
      emptyStateBorder: tones.midAlt,
      emptyStateText: tones.forest,
      detailLabelText: tones.midAlt,
      linkText: tones.leaf,
      linkHoverText: tones.gold,
      accent: tones.gold,
      clickableBg: tones.mid,
      clickableBorder: tones.sage,
      clickableText: tones.paper,
      clickableMutedText: tones.cream,
      clickableHoverBg: tones.gold,
      clickableHoverBorder: tones.forest,
      clickableHoverText: tones.ink,
      clickableBadgeBg: tones.cream,
      clickableBadgeText: tones.forest,
    },
    analytics: {
      shellBg: withAlpha(tones.night, 0.88),
      sidebarBg: tones.pale,
      chartBg: tones.paper,
      chartText: tones.ink,
      chartMutedText: tones.forest,
      grid: withAlpha(tones.midAlt, 0.30),
      accent: tones.leaf,
      accentDark: tones.night,
      accentLight: tones.soft,
      tooltipBg: tones.ink,
      tooltipText: tones.paper,
      series: [
        tones.sage,
        shade(tones.gold, -0.12),
        tones.forest,
        '#6f8f95',
        tones.leaf,
        '#a87968',
        tones.goldLight,
        tones.midAlt,
        '#4f6f76',
        tones.mid,
        shade(tones.gold, 0.12),
        tones.deep,
      ],
    },
    ornament: {
      line: tones.gold,
      lineMuted: withAlpha(tones.gold, 0.48),
      corner: withAlpha(tones.goldLight, 0.70),
      cornerMuted: withAlpha(tones.pale, 0.38),
      gemFill: tones.leaf,
      gemStroke: tones.gold,
      sparkle: tones.goldLight,
      paperRule: withAlpha(tones.midAlt, 0.30),
      panelGlow: withAlpha(tones.gold, 0.14),
    },
  });
}


const LEGACY_REFERENCE_THEME = Object.freeze(buildSemanticTheme(buildToneScale(PERIDOT_SOURCE_PALETTES.legacyCurrent)));

function comparableHexFromColor(value) {
  const text = String(value || '').trim();
  if (/^#[0-9a-fA-F]{6}$/.test(text)) return text.toLowerCase();
  const rgbaMatch = text.match(/^rgba?\(([^)]+)\)$/i);
  if (rgbaMatch) {
    const parts = rgbaMatch[1].split(',').map((part) => Number(part.trim()));
    if (parts.length >= 3 && parts.slice(0, 3).every((part) => Number.isFinite(part))) {
      return rgbToHex({ r: parts[0], g: parts[1], b: parts[2] });
    }
  }
  return null;
}

function flattenThemeColorLeaves(value, path = '', output = []) {
  if (Array.isArray(value)) {
    value.forEach((item, index) => flattenThemeColorLeaves(item, `${path}.${index}`, output));
    return output;
  }

  if (value && typeof value === 'object') {
    Object.entries(value).forEach(([key, nested]) => {
      flattenThemeColorLeaves(nested, path ? `${path}.${key}` : key, output);
    });
    return output;
  }

  const comparable = comparableHexFromColor(value);
  if (comparable) {
    output.push({ path, value, comparable });
  }
  return output;
}

function getLegacyThemeCandidatePairs() {
  const currentByPath = new Map(flattenThemeColorLeaves(PERIDOT_THEME).map((entry) => [entry.path, entry.value]));
  return flattenThemeColorLeaves(LEGACY_REFERENCE_THEME)
    .map((entry) => ({
      anchor: entry.comparable,
      value: currentByPath.get(entry.path) || entry.value,
    }))
    .filter((entry) => comparableHexFromColor(entry.value));
}

export const PERIDOT_BASE_THEME = Object.freeze(buildSemanticTheme(PERIDOT_TONES));
export const PERIDOT_THEME = Object.freeze(deepMerge(PERIDOT_BASE_THEME, PERIDOT_CUSTOM_THEME_OVERRIDES));

function flattenTheme(value, prefix = '--peridot-role', output = {}) {
  Object.entries(value || {}).forEach(([key, nested]) => {
    const cssKey = `${prefix}-${key.replace(/[A-Z]/g, (match) => `-${match.toLowerCase()}`)}`;
    if (nested && typeof nested === 'object' && !Array.isArray(nested)) {
      flattenTheme(nested, cssKey, output);
    } else if (Array.isArray(nested)) {
      nested.forEach((item, index) => {
        output[`${cssKey}-${index + 1}`] = item;
      });
    } else {
      output[cssKey] = nested;
    }
  });
  return output;
}

export const PERIDOT_THEME_CSS_VARIABLES = Object.freeze(flattenTheme(PERIDOT_THEME));

export function applyPeridotThemeVariables(root = document.documentElement) {
  Object.entries(PERIDOT_THEME_CSS_VARIABLES).forEach(([name, value]) => {
    root.style.setProperty(name, value);
  });
}

export const PERIDOT_APP_THEME_DEFAULTS = Object.freeze({
  shellBg: PERIDOT_THEME.interface.cardBackgroundWarm,
  textMain: PERIDOT_THEME.interface.textOnLight,
  headingText: PERIDOT_THEME.interface.textOnLight,
  titleDisplayText: PERIDOT_THEME.interface.textOnDark,
  mutedText: PERIDOT_THEME.interface.textMutedOnLight,
  detailLabelText: PERIDOT_THEME.interface.textMutedOnLight,
  groupHeadingText: PERIDOT_THEME.interface.textOnLight,
  sectionTitleText: PERIDOT_THEME.interface.textOnLight,
  sidebarBg: PERIDOT_THEME.interface.cardBackground,
  sidebarBorder: PERIDOT_THEME.interface.borderSubtle,
  groupBgTop: PERIDOT_THEME.interface.cardBackgroundWarm,
  groupBgBottom: PERIDOT_THEME.interface.cardBackgroundMuted,
  groupBorder: PERIDOT_THEME.interface.borderSubtle,
  sectionBg: PERIDOT_THEME.interface.cardBackground,
  sectionBorder: PERIDOT_THEME.interface.borderSubtle,
  floatingBg: PERIDOT_THEME.interface.cardBackground,
  floatingBorder: PERIDOT_THEME.interface.borderSubtle,
  accent: PERIDOT_THEME.button.primaryBg,
  accentHover: PERIDOT_THEME.button.primaryHoverBg,
  buttonPrimaryText: PERIDOT_THEME.button.primaryText,
  buttonPrimaryBg: PERIDOT_THEME.button.primaryBg,
  buttonPrimaryHover: PERIDOT_THEME.button.primaryHoverBg,
  buttonPrimaryBorder: PERIDOT_THEME.button.primaryBorder,
  buttonPrimaryActiveBg: PERIDOT_THEME.button.primaryHoverBg,
  buttonPrimaryActiveHover: PERIDOT_THEME.visualization.nodeAnimated,
  buttonPrimaryActiveBorder: PERIDOT_THEME.button.primaryBorder,
  buttonSecondaryBg: PERIDOT_THEME.interface.cardBackgroundMuted,
  buttonSecondaryHover: PERIDOT_THEME.interface.cardBackgroundWarm,
  buttonSecondaryBorder: PERIDOT_THEME.interface.borderSubtle,
  buttonSecondaryText: PERIDOT_THEME.interface.textOnLight,
  ghostHover: PERIDOT_THEME.interface.cardBackgroundMuted,
  utilityPanelBg: PERIDOT_THEME.interface.cardBackgroundWarm,
  utilityTintBg: PERIDOT_THEME.interface.cardBackgroundMuted,
  studioCardBg: PERIDOT_THEME.interface.cardBackgroundMuted,
  controlInputBg: PERIDOT_THEME.form.bgLight,
  titleBarBg: PERIDOT_THEME.interface.cardBackgroundMuted,
  titleInputBg: PERIDOT_THEME.interface.panelBackground,
  titleInputBorder: PERIDOT_THEME.interface.borderStrong,
  titlePlaceholder: PERIDOT_THEME.interface.textMutedOnDark,
  sliderTrackBg: PERIDOT_THEME.interface.borderSubtle,
  sliderDotBg: PERIDOT_THEME.interface.cardBackground,
  sliderDotBorder: PERIDOT_THEME.interface.borderStrong,
  sliderLabelActive: PERIDOT_THEME.interface.textOnLight,
  sliderLabelInactive: PERIDOT_THEME.interface.textMutedOnLight,
  toggleBgOpen: PERIDOT_THEME.interface.cardBackgroundMuted,
  toggleBgClosed: PERIDOT_THEME.interface.cardBackgroundWarm,
  toggleBorder: PERIDOT_THEME.interface.borderSubtle,
  toggleAccent: PERIDOT_THEME.button.primaryBg,
  toggleText: PERIDOT_THEME.interface.textMutedOnLight,
  toggleTextHover: PERIDOT_THEME.interface.textOnLight,
  mapCanvasBg: PERIDOT_THEME.visualization.canvasBg,
  mapFrameBg: PERIDOT_THEME.visualization.frameBg,
  mapFrameBorder: PERIDOT_THEME.visualization.frameBorder,
  mapLandFill: PERIDOT_THEME.visualization.landFill,
  mapLandActiveFill: PERIDOT_THEME.visualization.landActiveFill,
  mapLandStroke: PERIDOT_THEME.visualization.landStroke,
  mapGridStroke: PERIDOT_THEME.visualization.gridStroke,
  mapEdge: PERIDOT_THEME.visualization.edge,
  mapEdgeHover: PERIDOT_THEME.visualization.edgeHover,
  mapEdgeActive: PERIDOT_THEME.visualization.edgeActive,
  mapEdgeSelected: PERIDOT_THEME.visualization.edgeSelected,
  mapNode: PERIDOT_THEME.visualization.node,
  mapNodeCluster: PERIDOT_THEME.visualization.nodeCluster,
  mapNodeAnimated: PERIDOT_THEME.visualization.nodeAnimated,
  mapNodeHover: PERIDOT_THEME.visualization.nodeHover,
  mapNodeSelected: PERIDOT_THEME.visualization.nodeSelected,
  mapNodeStroke: PERIDOT_THEME.visualization.nodeStroke,
  mapLabelText: PERIDOT_THEME.visualization.labelText,
  mapLabelHalo: 'transparent',
  mapLabelFontFamily: 'Avenir Next, Century Gothic, Montserrat, Jost, Manrope, Inter, Segoe UI, sans-serif',
  mapLabelFontWeight: '600',
  mapLabelFontStyle: 'normal',
  mapLabelStroke: PERIDOT_THEME.visualization.labelStroke,
  mapLabelStrokeWidth: '0.45',
  mapWaterLabelFontFamily: 'Avenir Next, Century Gothic, Montserrat, Jost, Manrope, Inter, Segoe UI, sans-serif',
  mapTextureSea: PERIDOT_THEME.visualization.canvasBg,
  mapTextureSeaLine: PERIDOT_THEME.visualization.gridStroke,
  mapTextureLandTint: PERIDOT_THEME.visualization.landFill,
  mapTextureLandLine: PERIDOT_THEME.visualization.landStroke,
  mapTextureFrameWash: PERIDOT_THEME.visualization.frameBg,
  mapTextureCompass: PERIDOT_THEME.visualization.edgeActive,
  mapWarningBg: PERIDOT_THEME.status.warningBg,
  mapWarningText: PERIDOT_THEME.interface.textInverse,
  fileChipBg: PERIDOT_THEME.interface.cardBackgroundMuted,
  fileChipBorder: PERIDOT_THEME.interface.borderStrong,
  fileChipText: PERIDOT_THEME.interface.textOnLight,
  textareaBg: PERIDOT_THEME.form.bgLight,
  textareaBorder: PERIDOT_THEME.form.border,
  textareaText: PERIDOT_THEME.form.textLight,
  textareaMutedText: PERIDOT_THEME.interface.textMutedOnLight,
  panelCardBg: PERIDOT_THEME.interface.cardBackground,
  panelCardBorder: PERIDOT_THEME.interface.borderSubtle,
  panelCardText: PERIDOT_THEME.interface.textOnLight,
  panelCardMutedText: PERIDOT_THEME.interface.textMutedOnLight,
  panelCardHover: PERIDOT_THEME.interface.cardBackgroundWarm,
  statCardBg: PERIDOT_THEME.interface.cardBackgroundMuted,
  statCardText: PERIDOT_THEME.interface.textOnLight,
  statCardMutedText: PERIDOT_THEME.interface.textMutedOnLight,
  inputBg: PERIDOT_THEME.form.bgLight,
  inputBorder: PERIDOT_THEME.form.border,
  inputText: PERIDOT_THEME.form.textLight,
  inputPlaceholder: PERIDOT_THEME.interface.textMutedOnLight,
  emptyStateBg: PERIDOT_THEME.interface.cardBackgroundWarm,
  emptyStateBorder: PERIDOT_THEME.interface.borderSubtle,
  emptyStateText: PERIDOT_THEME.interface.textMutedOnLight,
  emptyStateHeading: PERIDOT_THEME.interface.textOnLight,
  overlayCardBg: PERIDOT_THEME.interface.cardBackground,
  overlayCardBorder: PERIDOT_THEME.interface.borderSubtle,
  overlayCardText: PERIDOT_THEME.interface.textOnLight,
  overlayCardMutedText: PERIDOT_THEME.interface.textMutedOnLight,
  pickerBg: PERIDOT_THEME.interface.cardBackground,
  pickerBorder: PERIDOT_THEME.interface.borderSubtle,
  pickerText: PERIDOT_THEME.interface.textOnLight,
  pickerMutedText: PERIDOT_THEME.interface.textMutedOnLight,
  pickerHoverBg: PERIDOT_THEME.interface.cardBackgroundMuted,
  iconButtonBg: PERIDOT_THEME.interface.cardBackgroundMuted,
  iconButtonBorder: PERIDOT_THEME.interface.borderSubtle,
  iconButtonText: PERIDOT_THEME.interface.textMutedOnLight,
  iconButtonHoverBg: PERIDOT_THEME.interface.cardBackgroundWarm,
  iconButtonHoverText: PERIDOT_THEME.interface.textOnLight,
  linkText: PERIDOT_THEME.visualization.nodeAnimated,
  linkHoverText: PERIDOT_THEME.visualization.nodeHover,
  navigationMenuBg: PERIDOT_THEME.navigation.menuBg,
  navigationMenuBorder: PERIDOT_THEME.navigation.menuBorder,
  navigationMenuText: PERIDOT_THEME.navigation.menuText,
  navigationMenuMutedText: PERIDOT_THEME.navigation.menuMutedText,
  navigationItemBg: PERIDOT_THEME.navigation.itemBg,
  navigationItemHoverBg: PERIDOT_THEME.navigation.itemHoverBg,
  navigationItemActiveBg: PERIDOT_THEME.navigation.itemActiveBg,
  navigationItemActiveText: PERIDOT_THEME.navigation.itemActiveText,
  workspaceHeaderBg: PERIDOT_THEME.workspaceChrome.headerBg,
  workspaceHeaderText: PERIDOT_THEME.workspaceChrome.headerText,
  workspaceTabBg: PERIDOT_THEME.workspaceChrome.tabBg,
  workspaceTabActiveBg: PERIDOT_THEME.workspaceChrome.tabActiveBg,
  workspaceDropdownBg: PERIDOT_THEME.workspaceChrome.dropdownBg,
  workspaceDropdownActiveBg: PERIDOT_THEME.workspaceChrome.dropdownActiveBg,
  timelinePanelBg: PERIDOT_THEME.timeline.panelBg,
  timelinePanelBorder: PERIDOT_THEME.timeline.panelBorder,
  timelineTrackBg: PERIDOT_THEME.timeline.trackBg,
  timelineActiveTrackBg: PERIDOT_THEME.timeline.activeTrackBg,
  timelineHandleBg: PERIDOT_THEME.timeline.handleBg,
  timelineButtonBg: PERIDOT_THEME.timeline.buttonBg,
  timelineButtonText: PERIDOT_THEME.timeline.buttonText,
  searchShellBg: PERIDOT_THEME.search.shellBg,
  searchPanelBg: PERIDOT_THEME.search.panelBg,
  searchCardBg: PERIDOT_THEME.search.cardBg,
  searchCardActiveBg: PERIDOT_THEME.search.cardActiveBg,
  searchInputBg: PERIDOT_THEME.search.inputBg,
  searchCriterionBg: PERIDOT_THEME.search.criterionBg,
});

export const PERIDOT_MAP_STYLE_PRESETS = Object.freeze({
  preModern: {
    ...PERIDOT_APP_THEME_DEFAULTS,
    mapCanvasBg: PERIDOT_THEME.visualization.canvasBg,
    mapFrameBg: PERIDOT_THEME.interface.cardBackgroundWarm,
    mapFrameBorder: PERIDOT_THEME.visualization.frameBorder,
    mapLandFill: PERIDOT_THEME.visualization.landFill,
    mapLandActiveFill: PERIDOT_THEME.visualization.landActiveFill,
    mapLandStroke: PERIDOT_THEME.visualization.landStroke,
    mapGridStroke: PERIDOT_THEME.visualization.gridStroke,
    mapEdge: PERIDOT_THEME.visualization.edge,
    mapEdgeHover: PERIDOT_THEME.visualization.edgeHover,
    mapEdgeActive: PERIDOT_THEME.visualization.edgeActive,
    mapEdgeSelected: PERIDOT_THEME.visualization.edgeSelected,
    mapNode: PERIDOT_THEME.visualization.node,
    mapNodeCluster: PERIDOT_THEME.visualization.nodeCluster,
    mapNodeAnimated: PERIDOT_THEME.visualization.nodeAnimated,
    mapNodeHover: PERIDOT_THEME.visualization.nodeHover,
    mapNodeSelected: PERIDOT_THEME.visualization.nodeSelected,
    mapNodeStroke: PERIDOT_THEME.visualization.nodeStroke,
    mapLabelText: PERIDOT_THEME.visualization.labelText,
    mapLabelHalo: 'transparent',
    mapLabelFontFamily: 'Georgia, Palatino Linotype, Book Antiqua, Palatino, serif',
    mapLabelFontWeight: '400',
    mapLabelFontStyle: 'italic',
    mapLabelStroke: 'transparent',
    mapLabelStrokeWidth: '0',
    mapWaterLabelFontFamily: 'Georgia, Palatino Linotype, Book Antiqua, Palatino, serif',
  },
  modern: {
    ...PERIDOT_APP_THEME_DEFAULTS,
    mapCanvasBg: PERIDOT_THEME.interface.panelBackgroundStrong,
    mapFrameBg: PERIDOT_THEME.interface.panelBackground,
    mapFrameBorder: PERIDOT_THEME.interface.borderStrong,
    mapLandFill: PERIDOT_THEME.interface.cardBackgroundWarm,
    mapLandActiveFill: PERIDOT_THEME.visualization.edgeSelected,
    mapLandStroke: PERIDOT_THEME.interface.textMutedOnLight,
    mapGridStroke: PERIDOT_THEME.interface.borderSubtle,
    mapEdge: PERIDOT_THEME.visualization.edgeHover,
    mapEdgeHover: PERIDOT_THEME.visualization.nodeStroke,
    mapEdgeActive: PERIDOT_THEME.visualization.edge,
    mapEdgeSelected: PERIDOT_THEME.visualization.nodeHover,
    mapNode: PERIDOT_THEME.visualization.node,
    mapNodeCluster: PERIDOT_THEME.status.warningBorder,
    mapNodeAnimated: PERIDOT_THEME.visualization.edgeHover,
    mapNodeHover: PERIDOT_THEME.status.dangerBorder,
    mapNodeSelected: PERIDOT_THEME.interface.panelBackgroundStrong,
    mapNodeStroke: PERIDOT_THEME.interface.cardBackgroundWarm,
    mapLabelText: PERIDOT_THEME.interface.panelBackground,
    mapLabelHalo: PERIDOT_THEME.interface.cardBackgroundWarm,
    mapLabelStroke: PERIDOT_THEME.interface.textInverse,
    mapLabelStrokeWidth: '0.65',
  },
});
