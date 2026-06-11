# Peridot semantic palette guide

Peridot now has a role-based theme system. The goal is to make palette experiments site-wide and editable by design intent rather than by hunting for individual color literals.

## Main files

- `src/peridotTheme.js` is the main color-control file.
- `src/peridotThemeRoleMetadata.js` describes the human-facing palette role dashboard shown in the Themes and Accessibility workspace.
- `src/peridotColorPalette.js` remains as a compatibility adapter for older raw color token imports.
- `src/PeridotThemeWorkspace.jsx` provides the in-app palette switcher and role dashboard.

## How to switch palettes in the app

Open Peridot, go to **Themes and Accessibility**, and use the **Site-wide palette** section.

The choice is stored in local storage under:

```text
peridot.activePaletteId
```

Palette switching reloads the app so module-level visualization constants, CSS variables, charts, maps, Inspector panels, and exports all rehydrate from the same active palette.

## How to edit colors creatively

For broad creative control, edit the source palette and semantic role assignments in `src/peridotTheme.js`.

Use the in-app **Palette roles** dashboard to see what each broad role currently controls. The intended editing model is:

1. Choose or add a source palette in `PERIDOT_SOURCE_PALETTES`.
2. Let `buildToneScale` derive broad tones: dark tones, mid tones, light tones, and highlights.
3. Adjust `buildSemanticTheme` when a tone should be assigned differently to a role.

For example, these are the roles to edit when changing the map/network look:

```js
visualization: {
  canvasBg,       // map ocean / canvas
  frameBg,        // map frame and visualization surface
  landFill,       // map land
  node,           // default nodes
  nodeHover,      // hovered nodes
  nodeSelected,   // selected nodes
  edge,           // default routes / correspondence edges
  edgeHover,      // hovered routes
  edgeSelected,   // selected routes
  series,         // ordered visualization marks
}
```

These are the roles to edit when changing the broad interface look:

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

These are the roles to edit when changing buttons:

```js
button: {
  primaryBg,
  primaryHoverBg,
  primaryText,
  secondaryBg,
  secondaryHoverBg,
  secondaryText,
  creamBg,
  creamText,
}
```

## Role dashboard

The Theme workspace now includes a **Palette roles** section. It shows the current color for broad design groups such as:

- foundation tones
- interface roles
- text roles
- buttons and actions
- cards, forms, and surfaces
- map and visualization roles
- analytics and chart roles
- Inspector, search, and status roles

The dashboard now includes a lightweight edit/export workflow. Edit role values in the dashboard, use **Apply edited roles** to save them as local custom overrides, and use **Download override JSON** or **Copy override JSON** to preserve the experiment. Applied overrides are stored in localStorage under `peridot.customThemeOverrides` and layer over the currently active base palette.


## Trying temporary role edits

The Theme workspace supports temporary role-level overrides without editing source files:

1. Open **Themes and Accessibility**.
2. Choose a base site-wide palette.
3. In **Palette roles**, edit broad roles such as `interface.appBackground`, `button.primaryBg`, `visualization.canvasBg`, `visualization.nodeSelected`, or `analytics.series`.
4. Use **Apply edited roles** to save the current draft to localStorage and reload Peridot.
5. Use **Download override JSON** or **Copy override JSON** to export the experiment.
6. Use **Clear applied custom roles** to remove local overrides and return to the active base palette.

Arrays such as chart or visualization series are edited one color per line. Direct `appDefaults.*` rows are displayed for orientation but are derived from underlying semantic roles; edit the interface or visualization role that feeds them instead.

## Adding another palette

Add another entry to `PERIDOT_SOURCE_PALETTES`:

```js
myPalette: {
  label: 'My palette',
  swatches: ['#020d08', '#0d261a', '#587345', '#c7d9ad', '#f2ebd5', '#a68053'],
},
```

The tone builder will sort and assign those swatches into broad tone roles automatically. If the automatic mapping is not good enough, use explicit tone arrays:

```js
myPalette: {
  label: 'My palette',
  dark: ['#020d08', '#0d261a', '#2c3a40'],
  mid: ['#587345', '#6c8c54', '#9ea692'],
  light: ['#c7d9ad', '#f2ebd5'],
  highlight: ['#a68053'],
},
```

## Acceptance test

```powershell
npm.cmd run build
npm.cmd run dev
```

Then open Themes and Accessibility, switch palettes, and confirm that:

1. the app reloads,
2. the palette selector changes active state,
3. the Palette roles dashboard updates,
4. Home, Visualizations, Explore/Search, Inspector, Analytics, map/network marks, and exports still render.

## Importing a palette from an image

The Theme workspace now includes **Palette image import** inside the palette edit/export section.

Use this workflow when you have an Adobe Color screenshot or another palette reference image:

1. Open **Themes and Accessibility**.
2. In **Palette edit and export**, choose an image file.
3. Choose the target group to apply it to:
   - Whole app
   - Interface
   - Map and network
   - Charts
   - Buttons and highlights
   - Inspector and search
   - Text and borders
4. Review the detected swatches and the draft assignment preview.
5. Click **Apply detected palette to draft roles**.
6. Fine-tune any role values manually in the Palette roles dashboard.
7. Click **Apply edited roles** to reload and test the changes site-wide.
8. Use **Download override JSON** or **Copy override JSON** to save the experiment.

Image import is intentionally scoped. Applying a palette to **Charts** should update chart backgrounds, chart text/grid/tooltip colors, and categorical series colors without changing the global interface. Applying a palette to **Map and network** should update canvas/ocean, land, nodes, edges, labels, and visualization series colors without changing chart cards.

## Visualization color enforcement

Chart-rendering primitives now read categorical chart colors from:

```js
PERIDOT_THEME.analytics.series
```

Map/network and non-analytics visualization marks read from:

```js
PERIDOT_THEME.visualization.series
```

That means palette image imports and role-level overrides should affect stacked bars, grouped bars, pie slices, multiline charts, and map/network marks through the same visible role groups shown in the Theme workspace.

## Palette image detection notes

Palette image import now prefers large connected swatch blocks instead of simple frequency buckets. This is intended for Adobe Color-style palette exports and similar grid images where the actual palette appears as large rectangles with labels below. The detector filters page whites and small label text, then reads the remaining large swatch regions in visual order. For chart imports, the detected swatch order is preserved for categorical series colors so chart bars follow the uploaded palette rather than being reordered by lightness.
