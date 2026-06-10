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

This dashboard is intentionally read-only. It is meant to make the current color system legible before adding a noisier custom color-picker interface.

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
