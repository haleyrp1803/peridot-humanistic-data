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

export const PERIDOT_SOURCE_PALETTES = Object.freeze({
  legacyCurrent: {
    label: 'Current Peridot palette',
    dark: ['#03160f', '#04160f', '#082417', '#11231a'],
    mid: ['#26352b', '#4f654d', '#6d8b53', '#86a66b'],
    light: ['#dfe9c8', '#f5ecd2', '#fbf7ea', '#fff8e8'],
    highlight: ['#b58b42', '#d6a36a'],
  },
  peridot4: {
    label: 'Peridot 4 reference',
    swatches: ["#6D8BA6", "#2C3A40", "#020D08", "#0D261A", "#6C8C54", "#587345", "#C7D9AD", "#9EA692", "#F2EBD5", "#A68053"],
  },
  peridot6: {
    label: 'Peridot 6 reference',
    swatches: ["#082618", "#030D08", "#456B51", "#718961", "#91A67C", "#DFE5D5", "#CFD6B8", "#B19D81", "#C5A479", "#8C704D"],
  },
  peridot1: {
    label: 'Peridot 1 reference',
    swatches: ["#C9B16B", "#9E713F", "#222601", "#7C8241", "#414606", "#C9D5AF"],
  },
  peridot3: {
    label: 'Peridot 3 reference',
    swatches: ["#14421A", "#5F814C", "#7FB551", "#658234", "#F2EBD5", "#A68053"],
  },
  peridot5: {
    label: 'Peridot 5 reference',
    swatches: ["#6D8B3E", "#2C3A40", "#020D08", "#0D261A", "#6C8C54", "#587345", "#C7D9AD", "#9EA692", "#F2EBD5", "#A68053"],
  },
  peridot2: {
    label: 'Peridot 2 reference',
    swatches: ["#F2EAB7", "#8F7944", "#AAC187", "#445C36", "#82A368"],
  },
});

export const PERIDOT_PALETTE_OPTIONS = Object.freeze(
  Object.entries(PERIDOT_SOURCE_PALETTES).map(([id, palette]) => ({
    id,
    label: palette.label || id,
    swatches: getPaletteSwatchesForPreview(palette),
  }))
);

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

function withAlpha(hex, alpha) {
  const { r, g, b } = hexToRgb(hex);
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
  if (ACTIVE_PERIDOT_PALETTE_ID === 'legacyCurrent') return source;

  const rgbaMatch = source.match(/^rgba?\(([^)]+)\)$/i);
  if (rgbaMatch) {
    const parts = rgbaMatch[1].split(',').map((part) => part.trim());
    const alpha = parts.length >= 4 ? parts[3] : '1';
    const asHex = rgbToHex({ r: Number(parts[0]), g: Number(parts[1]), b: Number(parts[2]) });
    return withAlpha(resolvePeridotLegacyColor(asHex), alpha);
  }

  if (!/^#[0-9a-fA-F]{6}$/.test(source)) return source;

  const tones = PERIDOT_TONES;
  const candidates = [
    tones.ink,
    tones.night,
    tones.deep,
    tones.forest,
    tones.mid,
    tones.midAlt,
    tones.leaf,
    tones.sage,
    tones.soft,
    tones.pale,
    tones.cream,
    tones.paper,
    tones.gold,
    tones.goldLight,
  ];
  return candidates.reduce((best, candidate) => (
    colorDistance(source, candidate) < colorDistance(source, best) ? candidate : best
  ), candidates[0]);
}

export function buildSemanticTheme(tones = PERIDOT_TONES) {
  return Object.freeze({
    tones,
    interface: {
      appBackground: tones.ink,
      appBackgroundAlt: tones.night,
      workspaceBackground: tones.deep,
      panelBackground: tones.forest,
      panelBackgroundStrong: tones.night,
      cardBackground: tones.paper,
      cardBackgroundWarm: tones.cream,
      cardBackgroundMuted: tones.pale,
      cardBackgroundDark: tones.deep,
      borderSubtle: withAlpha(tones.pale, 0.32),
      borderStrong: withAlpha(tones.soft, 0.62),
      textOnDark: tones.cream,
      textMutedOnDark: tones.pale,
      textOnLight: tones.deep,
      textMutedOnLight: tones.midAlt,
      textInverse: '#ffffff',
      focusRing: withAlpha(tones.goldLight, 0.45),
      scrim: withAlpha(tones.ink, 0.50),
      scrimStrong: withAlpha(tones.ink, 0.65),
    },
    button: {
      primaryBg: tones.leaf,
      primaryHoverBg: tones.gold,
      primaryText: tones.paper,
      primaryBorder: withAlpha(tones.pale, 0.55),
      secondaryBg: withAlpha(tones.pale, 0.10),
      secondaryHoverBg: tones.gold,
      secondaryText: tones.paper,
      secondaryBorder: withAlpha(tones.pale, 0.48),
      creamBg: tones.cream,
      creamText: tones.deep,
      creamBorder: withAlpha(tones.midAlt, 0.38),
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
      canvasBg: tones.pale,
      frameBg: tones.cream,
      frameBorder: tones.midAlt,
      landFill: tones.soft,
      landActiveFill: tones.sage,
      landStroke: tones.midAlt,
      gridStroke: tones.pale,
      edge: tones.gold,
      edgeHover: tones.goldLight,
      edgeActive: tones.mid,
      edgeSelected: tones.night,
      node: tones.sage,
      nodeCluster: tones.goldLight,
      nodeAnimated: tones.leaf,
      nodeHover: tones.mid,
      nodeSelected: tones.forest,
      nodeStroke: tones.paper,
      labelText: tones.deep,
      labelStroke: tones.paper,
      series: [tones.leaf, tones.sage, tones.mid, tones.gold, tones.goldLight, tones.soft, tones.midAlt, tones.forest],
    },
    inspector: {
      chromeBg: tones.forest,
      chromeBgStrong: tones.night,
      bodyBg: tones.pale,
      bodyText: tones.deep,
      cardBg: tones.cream,
      cardBorder: tones.soft,
      clickableBg: tones.mid,
      clickableText: tones.paper,
      clickableHoverBg: tones.gold,
      headingText: tones.cream,
    },
    analytics: {
      shellBg: tones.cream,
      sidebarBg: tones.pale,
      chartBg: tones.paper,
      chartText: tones.deep,
      chartMutedText: tones.midAlt,
      grid: withAlpha(tones.midAlt, 0.32),
      accent: tones.leaf,
      accentDark: tones.forest,
      accentLight: tones.soft,
      tooltipBg: tones.midAlt,
      tooltipText: tones.paper,
      series: [tones.leaf, tones.sage, tones.forest, tones.gold, tones.goldLight, tones.midAlt, tones.soft, tones.deep],
    },
  });
}

export const PERIDOT_THEME = buildSemanticTheme(PERIDOT_TONES);

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
