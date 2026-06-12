# Peridot map palette assignment audit

## Purpose

This pass narrows the imported-palette assignment behavior for map and network roles.

## Issue observed

After whole-app palette imports, the map could assign the darkest detected swatch to the map ocean/canvas. That made the cartographic background too heavy and left nodes/edges without enough contrast.

## Correction

Map/network assignment now reserves lighter detected swatches for cartographic base layers and uses darker or bolder swatches for evidence marks.

## Map role policy

- `visualization.canvasBg`: lighter palette swatch for ocean/canvas.
- `visualization.frameBg`: light/cream swatch for the map frame.
- `visualization.landFill`: lightest swatch for base land.
- `visualization.landActiveFill`: mid-light swatch for active/selected land.
- `visualization.edge`, `edgeActive`, `edgeSelected`: dark or bold swatches.
- `visualization.node`, `nodeHover`, `nodeSelected`: dark or bold swatches.
- `visualization.nodeStroke`: lightest swatch for contrast.
- `visualization.labelText`: darkest swatch.
- `visualization.labelStroke`: lightest swatch.

## Scope

Changed:

- `src/peridotTheme.js`
- `PERIDOT_THEME_PALETTE_GUIDE.md`

Not changed:

- component layout
- map interaction behavior
- chart assignment behavior
- image detection logic
