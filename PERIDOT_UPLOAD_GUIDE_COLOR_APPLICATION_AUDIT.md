# Peridot Upload Guide color application audit

## Pass type
Visual / theme enforcement.

## Goal
Preserve the decorative and typographic design direction from the Upload Guide pass, but adjust the default semantic palette so the app inherits the guide image's quieter cream, sage, dark green, and gold color system instead of overusing the warm accent as a large surface color.

## Files changed
- `src/peridotTheme.js`
- `src/PeridotVisualizationsWorkspace.jsx`

## Color policy changes

### Presets
`PERIDOT_SOURCE_PALETTES` remains reduced to a single built-in palette:

- `legacyCurrent` / **Peridot Upload Guide**

No additional preset palettes are reintroduced.

### Default color direction
The built-in palette keeps the guide image's broad color jobs:

- paper / cream for chart backgrounds, cards, forms, and readable light surfaces
- pale sage for ocean and calm map fields
- light land as a separate warm-light surface
- mid sage/green for selected land and soft emphasis
- deep green for app shell, nodes, routes, and strong map marks
- gold for ornament lines, buttons, focus, hover, and small active accents

### Warm accent restraint
The warm gold accent is now used primarily for:

- ornamentation
- focus rings
- primary action buttons
- timeline active range
- hover/selected accents

It is deliberately not used as a dominant map ocean, map land, workspace background, or major chrome fill.

## Layering fix
`PeridotVisualizationsWorkspace.jsx` raises visualization header menus and dropdowns above the map stage. This is intended to prevent map/network/chart dropdowns from becoming trapped visually or interactively behind the map plate.

## Acceptance test
1. Run `npm.cmd run build`.
2. Run `npm.cmd run dev`.
3. Clear custom role overrides in Themes and Accessibility.
4. Confirm the default app uses the guide-inspired cream / sage / forest / gold palette.
5. Open Route Map and verify the ocean is light, land is distinct, and nodes/edges are dark or bold.
6. Open Mapping / Network / Chart dropdowns and verify all dropdown panels are clickable above the map.
7. Check Chart Visualizations, Explore/Inspector, Data, and Theme pages for readable contrast.
