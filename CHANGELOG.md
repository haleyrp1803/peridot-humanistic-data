# Changelog

## Current documented safe baseline

- **`57b946e` — `Make timeline year-based`**

---

## Recent committed work

### `57b946e` — Make timeline year-based
- Converted the timeline from month-based controls to year-only controls
- Removed month selectors from the Timeline block
- Preserved the broader range/playback model while changing timeline bucketing/filtering to years
- Established the current safe baseline after the recent behavior passes

### `79d5ae1` — Remove show all dates shortcut
- Removed the old **Show all dates** shortcut from Display Controls
- Clarified that date behavior is now controlled through the Timeline block rather than a separate display toggle
- Simplified the control-panel mental model before the year-only timeline pass

### `3fedd97` — Tighten minimum weight helper text
- Finalized the committed minimum-weight control change by simplifying helper copy
- Preserved the new numeric input with Enter / Update apply behavior

### `96064e2` — Set people as default view and simplify view buttons
- Replaced the old two-step view-selection UI with three direct buttons:
  - People
  - Place
  - Force-Directed
- Made **People** the default startup view

### `fa486b8` — Remove orphaned panel helper functions
- Removed high-confidence orphaned helper/style functions from `src/App.jsx`
- Continued cleanup after the panel/inspector extraction work stabilized

### `2d627e2` — Remove legacy inspector bodies from App
- Removed dead legacy inspector `_UNUSED` bodies from `src/App.jsx`
- Repaired the extracted edge-inspector dependency during the same cleanup sequence

### `149315a` — Extract inspector node view
- Moved the node / person-detail / place-detail inspector view into `src/InspectorNodeView.jsx`
- Continued the inspector-view extraction sequence

### `003fae1` — Split empty cluster and edge inspector views
- Moved the easier inspector views into:
  - `src/InspectorEmptyState.jsx`
  - `src/InspectorClusterView.jsx`
  - `src/InspectorEdgeView.jsx`

### `c0a15fd` — Extract inspector shell and router
- Moved the inspector shell into `src/RightInspectorPanel.jsx`
- Moved inspector routing into `src/InspectorBodyRouter.jsx`

### `6a32004` — Harden inspector contract in place
- Stabilized the inspector selection contract in `src/App.jsx`
- Prepared the inspector for later extraction passes

### `86ad35f` — Extract left control panel component
- Moved the left control panel out of `src/App.jsx`
- Created `src/LeftControlPanel.jsx`

### `113fb84` — Harden control panel contract in place
- Consolidated and stabilized the left-panel prop contract inside `src/App.jsx`
- Prepared the control panel for extraction work

### `4236952` — Append full development history to changelog
- Extended `CHANGELOG.md` to preserve the full cumulative development trajectory

### `391174a` — Refresh Peridot documentation for publication baseline
- Updated `README.md`, `MAINTAINERS_GUIDE.md`, and `CHANGELOG.md`
- Renamed the documented project identity to **Peridot**
- Aligned the documentation with the publication-ready browser baseline

### `951b450` — Replace embedded sample data with current publication dataset
- Replaced the embedded sample/fallback data in `src/App.jsx`
- Established the publication dataset baseline used for browser release

### `f859595` — Add itch.io HTML5 build packaging support
- Updated `vite.config.js` to use a relative base path for safer subdirectory hosting
- Added `Build_Itch_Zip.py`
- Established a repeatable HTML5 packaging workflow for itch.io publication

### `f959fac` — Use countries50m as the fixed basemap
- Replaced the earlier fixed `countries110m` basemap with `countries50m`
- Simplified the retained geographic baseline after a more complex atlas-scale experiment was abandoned

### `b1fdbd5` — Update maintainer handoff documentation
- Refreshed the maintainer handoff baseline used for later bounded passes

### `dd12281` — Normalize summary panel spacing
- Added matching top spacing above **Summary and Diagnostics**
- Restored more consistent vertical rhythm inside the **OPTIONS** stack

### `4fdaf73` — Rename timeline panel heading
- Renamed **Timeline and playback** to **Timeline**
- Kept timeline behavior unchanged at that stage

### `db5bb1f` — Tighten left panel organization
- Reorganized the left control panel
- Added a **Visualization Type** section
- Shifted the section order toward the current preferred arrangement

### `ba746b1` — Simplify theme panel text
- Renamed **Map appearance** to **Theme**
- Removed explanatory theme copy that no longer matched the preferred presentation

### `c0fc600` — Retune active country fills for peridot and modern maps
- Retuned Peridot active-country fill
- Retuned Modern active-country fill
- Left Early Modern active-country coloring unchanged

### `56f0080` — Highlight countries containing visible nodes
- Added active-country highlighting for countries containing currently visible nodes
- Used hint matching and coordinate fallback to determine country membership

### `5cbe9c3` — Refine early modern node hover and selected colors
- Tuned Early Modern hover state
- Tuned Early Modern selected state

### `850176f` — Refine hovered and selected node states
- Strengthened hover/selected node differentiation
- Continued theme-aware node-state polish

---

## Deferred / rolled-back work

### Cluster inspector drill-down attempt (uncommitted; rolled back)
After `57b946e`, a bounded attempt was made to support cluster drill-down through the inspector:

- clicking a cluster should open a cluster-member list
- clicking a represented member should open that member’s detail
- Back should return to the cluster view

This work was **not committed** and was rolled back to preserve the safe baseline when the pass became unreliable in the long chat context. The current safe state at `57b946e` does **not** include committed cluster drill-down behavior.

---

# Full development history

This section preserves the cumulative development trajectory for future reference. Older documented entries should remain below this point unless they are clearly obsolete or duplicated by a more accurate retained entry.

## `391174a` — Refresh Peridot documentation for publication baseline
- Updated `README.md`, `MAINTAINERS_GUIDE.md`, and `CHANGELOG.md`
- Renamed the documented project identity to **Peridot**
- Aligned the documentation with the current publishable browser baseline
- Recorded the recent publication trajectory more explicitly

## `951b450` — Replace embedded sample data with current publication dataset
- Replaced the embedded sample/fallback data in `src/App.jsx`
- Set the built-in browser/demo state to use the current intended publication dataset
- Preserved existing app behavior while changing the default embedded content
- Established the publication dataset baseline used for browser release

## `f859595` — Add itch.io HTML5 build packaging support
- Updated `vite.config.js` to use a relative base path for safer subdirectory hosting
- Added `Build_Itch_Zip.py`
- Established a repeatable build-and-package workflow for itch.io HTML5 publication
- Kept generated ZIP artifacts out of normal source commits

## `f959fac` — Use countries50m as the fixed basemap
- Replaced the earlier fixed `countries110m` basemap with `countries50m`
- Simplified the committed map baseline after experimental multi-scale atlas work was abandoned
- Preserved the rest of the map interaction and rendering flow

## `b1fdbd5` — Update maintainer handoff documentation
- Refreshed the maintainer handoff baseline used for later bounded passes
- Improved the documentation foundation for subsequent app and publication work

## `dd12281` — Normalize summary panel spacing
- Added matching top spacing above **Summary and Diagnostics**
- Restored more consistent vertical rhythm inside the **OPTIONS** stack of the left control panel

## `4fdaf73` — Rename timeline panel heading
- Renamed **Timeline and playback** to **Timeline**
- Kept timeline behavior unchanged

## `db5bb1f` — Tighten left panel organization
- Reorganized the left control panel
- Added a **Visualization Type** section
- Moved visualization-mode controls into that section
- Shifted the section order toward the current preferred arrangement
- Continued the cleanup of the panel’s top-level organization

## `ba746b1` — Simplify theme panel text
- Renamed **Map appearance** to **Theme**
- Removed explanatory theme copy that no longer matched the preferred presentation
- Kept theme behavior unchanged

## `c0fc600` — Retune active country fills for peridot and modern maps
- Retuned Peridot active-country fill
- Retuned Modern active-country fill
- Left Early Modern active-country coloring unchanged

## `56f0080` — Highlight countries containing visible nodes
- Added active-country highlighting for countries containing currently visible nodes
- Used hint matching and coordinate fallback to determine country membership
- Improved geographic context without changing core route behavior

## `5cbe9c3` — Refine early modern node hover and selected colors
- Tuned Early Modern hover state
- Tuned Early Modern selected state
- Preserved white node outlines for contrast

## `850176f` — Refine hovered and selected node states
- Strengthened hover/selected node differentiation
- Continued theme-aware node-state polish

## `3e43dc9` — Add hovered node color feedback
- Added stronger hovered-node color feedback to improve interaction clarity

## `919ea5f` — Increase green layering in peridot map theme
- Increased Peridot map-theme green layering and depth

## `c666d29` — Add peridot default app theme
- Added the Peridot-inspired full-app default theme

## `9be5f4a` — Tighten maintainer docs audit fixes
- Applied follow-up corrections to maintainer-facing documentation after audit review

## `43403c3` — Restore detail to maintainer documentation
- Restored architectural and workflow detail that had been thinned too aggressively

## `02ecb11` — Document inspector navigation feature set
- Updated documentation to reflect the inspector-navigation feature set more explicitly

## `5af819b` — Add inspector back navigation
- Added inspector-internal Back navigation support

## `b3e6fe8` — Add place navigation sections to person inspector
- Added explicit place-navigation sections to person detail views

## `6772c1d` — Clarify connected correspondents count label
- Clarified relationship-count labeling in connected-correspondent UI

## `ab0e1fe` — Show relationship counts in connected correspondents buttons
- Added relationship counts to connected-correspondent navigation buttons

## `8c2d?` — [Preserve older entries below if already present in the existing changelog]
- Continue retaining earlier full-history entries already recorded in the repository
- Do not delete older documented history unless it is clearly duplicated or incorrect

## Newer steps added after the earlier publication/docs baseline

### `4236952` — Append full development history to changelog
- Extended the changelog so the full cumulative history remained explicit

### `113fb84` — Harden control panel contract in place
- Stabilized the left-panel contract before extraction

### `86ad35f` — Extract left control panel component
- Moved left-panel rendering into `src/LeftControlPanel.jsx`

### `6a32004` — Harden inspector contract in place
- Stabilized inspector state/prop flow before extraction

### `c0a15fd` — Extract inspector shell and router
- Moved the inspector shell and router into dedicated files

### `003fae1` — Split empty cluster and edge inspector views
- Extracted the easier inspector views into dedicated files

### `149315a` — Extract inspector node view
- Extracted the remaining major inspector view into `src/InspectorNodeView.jsx`

### `2d627e2` — Remove legacy inspector bodies from App
- Removed dead in-file inspector render bodies after extraction stabilized

### `fa486b8` — Remove orphaned panel helper functions
- Removed now-unused helper/style functions from `src/App.jsx`

### `96064e2` — Set people as default view and simplify view buttons
- Replaced the old two-step mode selection with direct buttons
- Set **People** as the default view

### `3fedd97` — Tighten minimum weight helper text
- Finalized the minimum-weight control wording after the committed slider-to-input redesign

### `79d5ae1` — Remove show all dates shortcut
- Removed the old display-level date shortcut in favor of Timeline-only date control

### `57b946e` — Make timeline year-based
- Converted timeline boundaries from month-based to year-based
- Established the current safe baseline
