# Peridot theming and visual design record

## Purpose

This document replaces the temporary Peridot color, palette, dropdown-layering, Upload Guide, and ornamental-toggle audit files created during the 2026 theming pass. It is intended for future maintainers who need to understand why the current theme architecture and visual direction look the way they do, without preserving every intermediate audit as a separate document.

The short version: Peridot now treats color as a semantic design system rather than a set of fixed green, cream, and gold literals. The app keeps the archival Peridot atmosphere, but the implementation should be maintained through role-based theme assignments, palette presets, custom role overrides, and narrowly scoped component styling.

## Maintainer summary

Peridot's current visual system has four core decisions:

1. **Use semantic roles, not scattered literals.** Broad visual jobs such as app shell, workspace chrome, cards, map ocean, land, nodes, routes, chart series, buttons, search panels, and timeline controls should be controlled through `src/peridotTheme.js` and exposed through role metadata where appropriate.
2. **Preserve legacy styling through compatibility mapping.** Some components still use older `--peridot-color-*` variables. These should not be treated as fixed colors. The compatibility layer maps them to the active semantic theme so older styling can keep working while palette experiments still propagate.
3. **Keep cartographic backgrounds light enough for evidence marks.** Map and network palette assignment should reserve lighter tones for ocean/canvas/land and darker or bolder tones for nodes, routes, selected states, and labels.
4. **Use ornamentation as small, functional emphasis.** Warm gold, illuminated corners, gem marks, dividers, and ornamental arrows are part of the Peridot visual language, but they should not overwhelm large surfaces or interfere with interaction.

## Main source files

| File | Role |
| --- | --- |
| `src/peridotTheme.js` | Main color-control file. Defines source palettes, tone-building behavior, semantic role assignment, imported-palette mapping, and legacy compatibility resolution. |
| `src/peridotThemeRoleMetadata.js` | Human-facing role descriptions used by Themes and Accessibility. |
| `src/peridotColorPalette.js` | Compatibility adapter for older raw color token imports and legacy `--peridot-color-*` variables. |
| `src/PeridotThemeWorkspace.jsx` | In-app palette switcher, palette role dashboard, temporary role edits, and export/copy workflow. |
| `src/index.css` | Shared design layer: folio/paper styling, guide-frame ornamentation, illuminated corners, dividers, and global visual refinements. |
| `src/PeridotVisualizationsWorkspace.jsx` | Visualization workspace chrome, dropdown portals, guide-frame usage, and floating header/timeline arrow toggles. |
| `src/PeridotHamburgerMenu.jsx` | Gem-like menu button and guide-frame menu styling. |

## Palette and theme architecture

The active site-wide palette is selected in **Themes and Accessibility** and stored in local storage as:

```text
peridot.activePaletteId
```

Palette switching reloads the app so module-level visualization constants, CSS variables, charts, maps, Inspector panels, and exports rehydrate from the same active palette.

The preferred editing model is:

1. Add or adjust source palettes in `PERIDOT_SOURCE_PALETTES`.
2. Let the tone builder derive broad dark, mid, light, and highlight groups.
3. Adjust `buildSemanticTheme` when a tone should be assigned differently to a role.
4. Use the Theme workspace role dashboard for temporary experiments and exported override JSON.

Role-level overrides are stored locally under:

```text
peridot.customThemeOverrides
```

Applied role overrides layer over the currently active base palette.

## Important role groups

The broad interface is controlled through roles such as:

```js
interface: {
  appBackground,
  workspaceBackground,
  panelBackground,
  cardBackground,
  cardBackgroundWarm,
  cardBackgroundMuted,
  borderSubtle,
  borderStrong,
  textOnDark,
  textMutedOnDark,
  textOnLight,
  textMutedOnLight,
}
```

Map and network appearance is controlled through roles such as:

```js
visualization: {
  canvasBg,
  frameBg,
  landFill,
  landActiveFill,
  node,
  nodeHover,
  nodeSelected,
  nodeStroke,
  edge,
  edgeHover,
  edgeSelected,
  labelText,
  labelStroke,
  series,
}
```

Additional role groups were added for areas that previously leaked older visual colors:

```js
navigation: {
  menuBg,
  menuText,
  itemHoverBg,
  itemActiveBg,
}

workspaceChrome: {
  headerBg,
  tabBg,
  tabActiveBg,
  dropdownBg,
  dropdownActiveBg,
}

timeline: {
  panelBg,
  trackBg,
  activeTrackBg,
  handleBg,
  buttonBg,
}

search: {
  shellBg,
  panelBg,
  cardBg,
  cardActiveBg,
  inputBg,
  criterionBg,
  resultBg,
}
```

## Legacy compatibility policy

Earlier components still contain many `--peridot-color-*` CSS variables. A previous broad attempt to replace every legacy variable directly was too regression-prone, so the safer policy is:

- keep the legacy classes where they are structurally stable;
- route their values through the active semantic theme;
- only replace legacy styling locally when a component is already being edited for a bounded visual pass.

`resolvePeridotLegacyColor` should continue to map old color tokens against the active semantic theme, including local custom image-import overrides. This is the main protection against old fixed green/gold/cream residues reappearing when a non-default palette or custom role override is active.

## Imported palette behavior

### Whole-app imports

When an imported palette is applied to **Whole app**, Peridot should override both semantic roles and `tones.*` foundation roles. This prevents the active base palette from leaking through older compatibility variables or Theme dashboard rows that reference foundation tones directly.

For dramatic imported palettes, the darkest and lightest detected swatches are treated as hard anchors:

- the darkest swatch feeds deepest shell, chrome, tooltip, and foundation-dark roles;
- the lightest swatch feeds the palest card, chart, form, handle, and text-on-dark roles;
- middle swatches distribute across panels, selected states, chart series, and accents;
- chart and visualization series preserve the original detected swatch order where possible.

### Map and network imports

Map/network imports use a cartographic assignment policy rather than simply applying the darkest swatch to the background.

Use this policy:

- lighter swatches become `visualization.canvasBg`, `visualization.frameBg`, and `visualization.landFill`;
- a mid-light swatch becomes active/selected land;
- darker or bolder swatches become nodes, routes, selected nodes, selected routes, and hover states;
- labels use dark text with a light halo/stroke.

This keeps the map readable and leaves the strongest colors available for evidence marks.

## Built-in palette decisions

### Peridot Upload Guide

The Upload Guide direction became the default design target during this pass. Its broad jobs are:

- cream/paper for chart backgrounds, cards, forms, and readable light surfaces;
- pale sage for ocean and calm map fields;
- light land as a distinct warm-light surface;
- mid sage/green for selected land and soft emphasis;
- deep green for the app shell, nodes, routes, and strong map marks;
- gold for ornament lines, buttons, focus states, hover states, selected accents, and the timeline active range.

Gold should not dominate map ocean, map land, workspace backgrounds, or large chrome fills.

### Peridot Classic Itch

`Peridot Classic Itch` reconstructs the older itch.io build atmosphere while preserving the current role-based theme system.

```js
peridotClassicItch: {
  label: 'Peridot Classic Itch',
  dark: ['#02110B', '#04160F', '#082719', '#173120'],
  mid: ['#33412F', '#52624D', '#6E8475', '#8AA36D'],
  light: ['#DFE9C8', '#F5ECD2', '#FBF7EA', '#FFF8E8'],
  highlight: ['#B58B42', '#D6A36A', '#B99B63'],
}
```

Use this preset when evaluating whether the current app still carries the older Peridot atmosphere without reverting the theme editor, image-import workflow, chart wiring, or semantic roles.

### Earlier experimental presets

`Peridot Archive Balanced` and `Peridot Map Legible` were useful during palette testing. They do not need separate audit records. If retained in source, they should be treated as test/reference palettes rather than the main design direction.

## Upload Guide visual layer

The Upload Guide design pass added a more explicit Peridot surface language:

- dark folio shell;
- cream paper surfaces;
- sage map fields;
- warm gold action accents;
- small diamond dividers;
- illuminated panel corners;
- guide-frame classes for visualization plates and menu surfaces;
- gem-like menu treatment.

These details belong in shared CSS or reusable component classes where possible. Avoid hand-copying new ornamental effects across many components unless the pass is intentionally visual and bounded.

## Visualization workspace layering

The Visualizations workspace has two independent layering problems that should not be solved by z-index alone.

### Dropdowns

Visualization dropdowns previously risked rendering behind the map stage or becoming unclickable because the menus were positioned inside clipped or independently stacked workspace containers.

The accepted correction is a local portal helper:

```js
FloatingVisualizationMenu
```

It renders dropdown content through `createPortal(document.body)`, including:

- Mapping Visualizations;
- Network Visualizations;
- Chart Visualizations;
- Explore Your Data;
- Export.

This is safer than z-index-only fixes because a child z-index cannot escape ancestor clipping or an independent stacking context.

### Header and timeline toggles

The accepted header/timeline expand-collapse controls are compact ornamental arrow controls, not text pills.

The current approach uses:

```js
FloatingOrnamentArrowToggle
```

The control:

- mounts into `document.body`;
- uses a very high fixed z-index;
- measures its anchor with `getBoundingClientRect()`;
- positions itself at the midpoint of the relevant boundary;
- anchors the header toggle to the header panel's bottom center;
- anchors the timeline toggle to the timeline region's top center;
- keeps accessible labels and titles even though the visible control is icon-only.

This pass was specifically intended to keep both controls in front of the map/timeline layer and to avoid earlier text-pill or smile-like arrow experiments.

## Design process record

The process moved through several temporary artifacts:

1. color literal inventory and centralization reports;
2. built-in palette preset experiments;
3. map-specific imported-palette assignment;
4. theme-control enforcement and compatibility routing;
5. Upload Guide visual direction;
6. Upload Guide color restraint;
7. Classic Itch palette restoration;
8. dropdown portal layering;
9. ornamented text toggle experiment;
10. final compact ornamental arrow toggle.

Only the consolidated conclusions matter for maintainers. The intermediate audit files can be removed after this document is committed.

## Regression risks

Watch these areas after future theme edits:

- imported whole-app palettes leaving base `tones.*` values visible;
- legacy `--peridot-color-*` variables becoming fixed again instead of routed through semantic roles;
- map ocean/canvas becoming too dark and competing with evidence marks;
- selected nodes/routes losing contrast against land/ocean;
- dropdowns trapped behind the map because they were moved out of the portal layer;
- header/timeline toggles hidden behind map/timeline surfaces;
- gold accents expanding into large surfaces and weakening the Upload Guide restraint.

## Acceptance test for future visual/theme passes

Run:

```powershell
npm.cmd run build
npm.cmd run dev
```

Then verify:

1. Themes and Accessibility loads.
2. Palette switching reloads the app and updates the role dashboard.
3. Custom role edits can be applied and cleared.
4. Route Map uses light cartographic fields with darker evidence marks.
5. Mapping, Network, Chart, Explore, and Export dropdowns open above the map and remain clickable.
6. Header and timeline arrow toggles remain visible, ornamental, and clickable.
7. Chart Visualizations, Explore/Inspector, Manage Data, Search, and the hamburger menu retain readable contrast.
8. Exports still render with the active theme.
