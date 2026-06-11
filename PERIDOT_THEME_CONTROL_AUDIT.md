# Peridot theme-control audit
## Scope
This pass used the current uploaded `src.zip` after rollback as the source. It avoids broad component layout rewrites and focuses on routing residual visible colors through the existing semantic theme system.
## Findings
- No app-owned raw `#hex`, `rgb(...)`, `rgba(...)`, `hsl(...)`, or `hsla(...)` literals remain outside `peridotTheme.js` and `peridotColorPalette.js` after this pass.
- Many visible legacy classes still reference `--peridot-color-*` variables. Replacing all of those component-by-component previously caused a regression, so this pass preserves the component classes and changes the compatibility layer instead.
- `resolvePeridotLegacyColor` now maps legacy colors against the active semantic theme, including local custom image-import overrides. This is the main enforcement mechanism for old green/gold/cream residues.

## Files with legacy `--peridot-color-*` variables still present but now routed dynamically
- `InspectorNodeView.jsx` — 6 references
- `InspectorPanel.jsx` — 48 references
- `PeridotColumnMappingModal.jsx` — 5 references
- `PeridotDataWorkspace.jsx` — 25 references
- `PeridotExploreWorkspace.jsx` — 35 references
- `PeridotHamburgerMenu.jsx` — 26 references
- `PeridotHomeWorkspace.jsx` — 46 references
- `PeridotLearnMoreWorkspace.jsx` — 8 references
- `PeridotSearchWorkspace.jsx` — 234 references
- `PeridotThemeWorkspace.jsx` — 1 references
- `PeridotVisualizationsWorkspace.jsx` — 156 references
- `index.css` — 69 references
- `mapStageComponents.jsx` — 3 references
- `timelinePlaybackComponents.jsx` — 43 references

## Direct edits made
- `src/peridotTheme.js`: added navigation, workspace chrome, timeline, and search semantic role groups; added image-import targets for those groups; changed legacy-color resolution so custom role overrides affect legacy CSS variables.
- `src/peridotThemeRoleMetadata.js`: added human-readable dashboard groups for navigation/workspace chrome, timeline controls, and the search workspace.
- `src/App.jsx`: replaced the remaining literal Inspector header/workspace colors and shadow colors with semantic role variables.
- `PERIDOT_THEME_PALETTE_GUIDE.md`: documented the compatibility-layer behavior and new role groups.

## Checks performed in the generation environment
- `node --check src/peridotTheme.js` passed.
- A Node import test confirmed `PERIDOT_THEME` exports the new role groups.
- A simulated custom override test confirmed a legacy gold token resolves to the custom override color.

## Manual acceptance test
1. Run `npm.cmd run build`.
2. Run `npm.cmd run dev`.
3. Open Themes and Accessibility.
4. Upload the purple palette and apply it to Whole app.
5. Apply edited roles and reload.
6. Check the hamburger menu, workspace tabs/dropdowns, timeline, Inspector, Advanced Search, charts, and map/network canvas.
7. If a visible old green/gold/cream area remains, record the screen and area; it should now be a smaller, identifiable role gap rather than a broad system gap.


## V3 follow-up correction

The V2 stress test showed that custom whole-app image imports still left base palette tone values visible in the Theme dashboard and in any components or compatibility variables that referenced `tones.*`. V3 adds explicit `tones.*` overrides when the image import target is `Whole app`.

The image detector also now rejects large connected components that touch all four image edges or look like a low-saturation page/background field. This is intended to keep gray page backgrounds from being detected as palette swatches while preserving actual swatch rectangles.
