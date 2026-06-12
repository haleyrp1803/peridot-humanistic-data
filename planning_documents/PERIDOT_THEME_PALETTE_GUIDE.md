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


## Built-in experimental palettes

The Theme workspace includes two additional built-in palette presets for rapid testing:

```js
peridotArchiveBalanced: {
  label: 'Peridot Archive Balanced',
  dark: ['#020D07', '#072617', '#2C393F', '#344E41'],
  mid: ['#456C51', '#588157', '#708961', '#91A67D'],
  light: ['#C8D9AD', '#DAD7CD', '#EDE6D1', '#F2ECD6'],
  highlight: ['#A68053', '#C5A479'],
}

peridotMapLegible: {
  label: 'Peridot Map Legible',
  dark: ['#1E2F23', '#273338', '#3B3B1A', '#4D4C2F'],
  mid: ['#546B41', '#6B7959', '#8A784E', '#9CB080'],
  light: ['#AEC8A4', '#DCCCAC', '#E7EFC7', '#FFF4D8'],
  highlight: ['#BC6C25', '#DDA15E'],
}
```

Use **Peridot Archive Balanced** as the safer general-purpose interface/map palette. Use **Peridot Map Legible** when evaluating cartographic readability, especially the lighter ocean/land assignment and darker route/node marks.

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


## Map/network imported palette behavior

When applying an imported palette to **Map and network** or **Whole app**, Peridot uses a map-specific assignment rule instead of sending the darkest swatch to the ocean/canvas. The map should remain legible as a cartographic field:

- lighter swatches become the map ocean/canvas, frame, and base land colors;
- a mid-tone swatch becomes active/selected land;
- darker or bolder swatches become nodes, edges, selected nodes, selected edges, and hover states;
- labels use dark text with a light halo so they remain readable over light map surfaces.

This keeps the darkest palette colors available for evidence marks rather than flooding the entire map background.

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


## Theme-control enforcement notes

The theme system now has a stricter compatibility layer for older component styling.

Some components still contain legacy CSS variables named `--peridot-color-*`. Those variables are no longer treated as fixed green/gold/cream colors when a non-default palette or custom role override is active. At runtime, `peridotColorPalette.js` asks `peridotTheme.js` to map each legacy variable to the closest semantic role in the active theme. This keeps older component classes working while allowing image-import overrides and role edits to reach more of the app without replacing layout code.

Additional broad role groups are available in the Theme workspace:

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

The image palette importer now includes additional target areas for navigation/workspace chrome, timeline controls, and the search workspace. For whole-app tests, these groups are included with the interface, map/network, charts, buttons/highlights, Inspector/search, and text/border groups.


## Whole-app imported palette behavior

When applying an imported palette to **Whole app**, Peridot also overrides the foundation `tones.*` roles. This prevents the active base palette from leaking through older compatibility variables or role rows that are keyed directly to foundation tones.

## Dark/light anchor behavior for imported palettes

When applying an imported palette to **Whole app**, Peridot now treats the palette extremes as hard anchors:

- the darkest detected swatch is assigned to the deepest shell, chrome, tooltip, and foundation-dark roles;
- the lightest detected swatch is assigned to the palest card, chart, form, handle, and text-on-dark roles;
- map roles use a cartographic assignment: lighter swatches for ocean/canvas and base land, a mid-tone for selected/active land, and the darkest or boldest swatches for nodes, edges, and highlighted route/node states;
- middle swatches are still distributed across panels, selected states, chart series, and accents;
- chart and visualization series keep the original detected swatch order where possible, so categorical marks still resemble the uploaded palette.

This makes dramatic palettes more predictable: the darkest and lightest colors in the source image should appear in Peridot's darkest and lightest jobs instead of being diluted into only mid-tone roles.

## Peridot Classic Itch palette

`Peridot Classic Itch` reconstructs the favored earlier itch.io build palette from the packaged production assets. It keeps the older dark green shell, cream paper surfaces, sage/olive map tones, and warm gold highlights while still using the current role-based theme system.

Extracted source colors:

```js
peridotClassicItch: {
  label: 'Peridot Classic Itch',
  dark: ['#02110B', '#04160F', '#082719', '#173120'],
  mid: ['#33412F', '#52624D', '#6E8475', '#8AA36D'],
  light: ['#DFE9C8', '#F5ECD2', '#FBF7EA', '#FFF8E8'],
  highlight: ['#B58B42', '#D6A36A', '#B99B63'],
}
```

Use this preset when you want the older Peridot atmosphere without reverting the newer theme editor, image-import workflow, chart wiring, or semantic role controls.
