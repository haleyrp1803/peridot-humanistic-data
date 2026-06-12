# Peridot Upload Guide design pass audit

## Scope

This pass removes the experimental preset palette list and makes the Upload Guide palette/design direction the single default Peridot source palette.

## Files changed

- `src/peridotTheme.js`
  - Replaced the preset list with one default `legacyCurrent` palette labeled `Peridot Upload Guide`.
  - Added `ornament.*` semantic roles for guide-inspired rules, corner accents, gem marks, and panel glow.
  - Refined default map semantic roles so the map uses light ocean/land fields and dark/bold nodes and edges.
- `src/peridotThemeRoleMetadata.js`
  - Added an `Ornament and guide motifs` dashboard group.
- `src/index.css`
  - Added the Upload Guide design layer: illuminated panel corners, divider diamonds, paper/folio styling, refined button accents, and map-plate framing.
- `src/PeridotVisualizationsWorkspace.jsx`
  - Added reusable guide-frame classes to the visualization header, map plate, and chart workspace plate.
- `src/PeridotHamburgerMenu.jsx`
  - Added reusable guide-frame classes to the menu and gem-like menu button.

## Intentional non-goals

- No data behavior changed.
- No routing behavior changed.
- No chart derivation or map geometry logic changed.
- The theme editor and image import workflow remain available.

## Acceptance test

1. Run `npm.cmd run build`.
2. Run `npm.cmd run dev`.
3. Confirm the Theme workspace shows only the Peridot Upload Guide default palette option.
4. Check Route Map, Chart Visualizations, Explore/Inspector, Data, Search, and the hamburger menu.
5. Confirm the app retains the Upload Guide design direction: dark folio shell, cream paper surfaces, sage map fields, warm gold action accents, small diamond dividers, and illuminated panel corners.
