# Peridot dropdown portal layering fix audit

## Scope

This pass is intentionally narrow. It addresses visualization workspace dropdowns that can render behind the map stage or become unclickable because their absolutely positioned menus remain inside clipped/stacked workspace containers.

## Files changed

- `src/PeridotVisualizationsWorkspace.jsx`

## Implementation

- Added a local `FloatingVisualizationMenu` helper that renders dropdown content through `createPortal(document.body)`.
- Moved visualization-category dropdown panels into the fixed portal layer.
- Moved the Export dropdown into the same fixed portal layer.
- Kept the existing menu behavior, labels, availability pills, export actions, selected visualization state, and hover-delay close behavior.
- Did not change map rendering, chart rendering, theme colors, data behavior, routing, or timeline behavior.

## Why this is safer than z-index-only fixes

The previous fix raised z-index values inside `PeridotVisualizationsWorkspace.jsx`, but z-index cannot escape ancestor clipping or independent stacking contexts. Rendering the dropdown in `document.body` avoids the map stage's local stacking context and keeps the menu above the visualization surface.

## Acceptance test

1. Run `npm.cmd run build`.
2. Run `npm.cmd run dev`.
3. Open Route Map.
4. Open each top navigation dropdown:
   - Mapping Visualizations
   - Network Visualizations
   - Chart Visualizations
   - Explore Your Data
   - Export
5. Confirm each dropdown appears above the map and remains clickable.
6. Select a dropdown item and confirm the visualization switches normally.
