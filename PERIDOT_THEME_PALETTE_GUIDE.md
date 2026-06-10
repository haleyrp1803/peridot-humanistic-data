# Peridot theme palette guide

This pass centralizes site-wide color editing in `src/peridotTheme.js`.

## How to try a palette

Open `src/peridotTheme.js` and change:

```js
export const ACTIVE_PERIDOT_PALETTE_ID = 'legacyCurrent';
```

to one of:

```js
'peridot4'
'peridot6'
'peridot1'
'peridot3'
'peridot5'
'peridot2'
```

Then run:

```powershell
npm.cmd run build
npm.cmd run dev
```

## How the file is organized

`PERIDOT_SOURCE_PALETTES` stores compact swatch sets.

`buildSemanticTheme` assigns those swatches to roles:

- `interface`: app backgrounds, text, borders, scrims, focus rings
- `button`: primary, secondary, and cream button colors
- `card`: card surfaces, card borders, shadows
- `form`: input and select surfaces
- `status`: warning and danger treatments
- `visualization`: map/network/chart data colors
- `inspector`: Inspector chrome, body, cards, and clickable states
- `analytics`: chart panel, tooltip, grid, and series colors

`peridotColorPalette.js` remains as a compatibility adapter. Older generated token names such as `PERIDOT_COLORS.HEX_DFE9C8` now resolve through the active palette instead of being fixed values.

## Centralization rule

Do not add hex, RGB/RGBA, HSL/HSLA, or Tailwind stock color utilities directly inside components. Add or adjust the role in `peridotTheme.js`, then consume it through a CSS variable or semantic export.
