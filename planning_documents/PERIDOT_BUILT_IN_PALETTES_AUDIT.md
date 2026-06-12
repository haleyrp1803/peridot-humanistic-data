# Built-in palette preset audit

## Pass type

Visual / theme preset addition.

## Scope

This pass adds two named source palettes to `PERIDOT_SOURCE_PALETTES` so they appear automatically in the existing Theme workspace palette selector.

## Files changed

- `src/peridotTheme.js`
- `PERIDOT_THEME_PALETTE_GUIDE.md`

## Added presets

### Peridot Archive Balanced

A conservative general-purpose Peridot palette with deep green-black anchors, archival greens, soft paper lights, and restrained ochre highlights.

### Peridot Map Legible

A cartography-oriented palette designed to preserve light ocean/land separation while reserving darker and bolder colors for nodes, routes, selected states, and highlights.

## Out of scope

- No component layout changes.
- No palette importer changes.
- No map renderer changes.
- No role metadata changes required because palette options are derived automatically from `PERIDOT_SOURCE_PALETTES`.

## Acceptance test

1. Run `npm.cmd run build`.
2. Run `npm.cmd run dev`.
3. Open Themes and Accessibility.
4. Confirm **Peridot Archive Balanced** and **Peridot Map Legible** appear as selectable palette buttons/cards.
5. Select each preset and confirm the app reloads into that palette.
6. Confirm the map, timeline, charts, and theme role dashboard still render.
