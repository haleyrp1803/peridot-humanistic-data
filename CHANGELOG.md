# Changelog

## Current documented safe baseline

- **`10051c0` — `Add MapLibre selected filter layers`** on branch **`legacy-peridot-continuation`**

This baseline intentionally continues from `main` while returning active development attention to the normal legacy D3/SVG Peridot path. The early MapLibre preview code remains present and gated behind `?maplibrePreview=1`, but it is dormant for ordinary use. The later `maplibre-native-geographic-view` experiment has been set aside rather than merged into this continuation branch.

The preceding stable legacy UI milestone remains:

- **`8539c68` — `Clarify timeline rail icon`**

That milestone reflects the current clean Peridot state after the cluster-interaction, node-sizing, cluster-sizing, cluster-inspector, shared side-panel, persistent icon-rail, and dedicated Data Inputs / Export / Timeline tab work completed in bounded passes.

---

## Current branch transition

### `10051c0` — Add MapLibre selected filter layers

- This commit is the current `main` / `legacy-peridot-continuation` starting point.
- It includes an early, development-only MapLibre preview path gated behind `?maplibrePreview=1`.
- The default app path remains the D3/SVG Peridot production renderer.
- Current active work is returning to the legacy Peridot path rather than continuing the larger MapLibre migrated-overlay experiment.

### MapLibre migrated-overlay branch paused

- The branch `maplibre-native-geographic-view` explored a fuller MapLibre migrated overlay after `10051c0`.
- That work reached a later stopping point that included dynamic MapLibre clusters, cluster labels, hidden cluster-member nodes, curved aggregated routes, aggregated route Inspector details, selected feedback, hover feedback, and a People-view coordinate fix.
- A Force-Directed fallback issue remained unresolved, and the project has chosen to set that work aside for now.
- Do not treat the MapLibre migrated-overlay branch as the active implementation baseline unless the user explicitly resumes it.

## Recent committed work

### `8539c68` — Clarify timeline rail icon

- Replaced the timeline rail icon after testing several small-format timeline concepts.
- Settled on a simple clock-style icon because the earlier horizontal progression concepts lost detail at rail-button size.
- Preserved Timeline tab behavior, playback, and active start/end year controls.

### `def4265` — Add timeline side panel tab

- Added a dedicated **Timeline** icon button to the shared side-panel rail.
- Moved existing year-range and playback controls out of the general Control Panel and into the Timeline tab.
- Preserved year-based filtering, playback behavior, and active start/end year adjustment after restoring required timeline props.
- Kept timeline/playback logic unchanged; this pass moved the UI boundary only.

### `6a672d9` — Add export side panel tab

- Added a dedicated **Export** icon button to the shared side-panel rail.
- Moved existing export controls out of the general Control Panel and into the Export tab.
- Kept export options visible by default when the Export tab opens.
- Replaced the export icon with a distinct outward/share-style icon so it does not duplicate the upload/Data Inputs icon.
- Preserved SVG, PNG, nodes CSV, and edges/routes CSV export behavior.

### `f1394c6` — Add data inputs side panel tab

- Added a dedicated **Data Inputs** icon button to the shared side-panel rail.
- Moved Geography, Raw Data, and Person Metadata upload controls out of the general Control Panel and into the Data Inputs tab.
- Preserved the upload controls and their existing data-ingestion behavior.
- Kept Data Inputs terminology to avoid confusion with the broader concept of app data.

### `5b38c4e` — Update shared panel rail icons

- Updated the Controls rail icon from a cog to a three-line stack.
- Updated the Inspector rail icon from a three-line stack to a magnifying glass.
- Preserved existing Controls and Inspector switching behavior.

### `dcce703` — Style shared panel icon rail

- Styled the persistent side-panel icon rail as its own visual zone.
- Added a mossy/peridot-toned rail background.
- Tuned inactive, hover, and active rail-button colors so the buttons remain legible against the rail.
- Added comfortable spacing between the rail and the panel scrollbar.

### `2acdb91` — Remove obsolete side panel top tabs

- Removed the redundant horizontal Controls / Inspector tab row from the open shared side panel.
- Made the persistent icon rail the sole panel-view switcher.
- Preserved Controls, Inspector, close, and map-click auto-open behavior.

### `6142817` — Anchor shared panel icon rail to panel shell

- Changed the persistent icon rail from viewport-anchored positioning to panel-shell anchoring.
- Kept the rail positioned on the right side of the open panel where the spare space already exists.
- Preserved closed-panel access to the rail buttons.
- Kept the close button at the top of the rail when the panel is open.

### `4653f20` — Remove obsolete audit documentation listings

- Removed stale listings for obsolete audit documents from active documentation.
- Preserved active documentation references to `README.md`, `MAINTAINERS_GUIDE.md`, `PROJECT_WORKFLOW_CHARTER.md`, and `CHANGELOG.md`.

### `8882b69` — Remove obsolete audit documentation references

- Deleted obsolete root-level audit documentation files that no longer functioned as active maintainer references.
- Removed `CONTROL_PANEL_DEPENDENCY_MAP.md` and `VIEWPORT_TIMELINE_AUDIT.md` from the committed repository.

### `06c1843` — Clean shared side panel source comments

- Removed obsolete source comments and unused import residue from the shared side-panel cleanup.
- Clarified source comments so `LeftControlPanel.jsx` is described as the shared side-panel shell rather than only a left control panel.
- Avoided renaming compatibility-sensitive `showLeftSidebar` / `showRightSidebar` state paths.

### `f7407eb` — Refresh documentation for shared panel baseline

- Refreshed documentation after the shared side-panel baseline.
- Recorded the then-current shared panel architecture before later rail-tab work expanded it.

### `4a17d1c` — Make inspector panel content-only

- Removed obsolete inspector shell/tab code from `src/InspectorPanel.jsx`.
- Kept inspector header, Back button, and body-router rendering intact.
- Clarified that the shared side-panel shell and tabs now live in `src/LeftControlPanel.jsx`.
- Preserved existing inspector behavior, including map-click auto-open, cluster inspector grouping, and Back behavior.

### `b62c74b` — Use shared side panel shell

- Converted the prior split panel arrangement into a single shared left-side panel shell.
- Made Controls and Inspector behave as tabs inside one side panel.
- Put open/close animation on the shared shell rather than on separate panel bodies.
- Preserved Inspector auto-open behavior from node, edge, and cluster interactions.

### `e41d8bc` — Split side panel open state from active tab

- Split the side-panel model into two concepts:
  - whether the side panel is open
  - which tab is active: Controls or Inspector
- Prepared the app for a single shared side-panel shell where tab switching does not imply open/close animation.

### `88b0c19` — Rename inspector panel shell for left dock

- Renamed the former `RightInspectorPanel.jsx` file to `InspectorPanel.jsx`.
- Updated imports and component names so the source structure no longer implies a right-side inspector shell.

### `2126c9b` — Open inspector in left panel dock

- Changed the inspector shell positioning so the Inspector opens on the left rather than the right.
- Preserved existing inspector content, Back behavior, and map-click auto-open behavior.

### `f98b3e5` — Add panel mode switcher tabs

- Added Controls / Inspector tabs to the open panel.
- Allowed switching between Controls and Inspector from inside the panel.
- Preserved the single-active-panel behavior.

### `df4075a` — Move side panel toggles to left rail

- Moved both collapsed toggle icons to the left rail.
- Kept the cog as the Controls opener.
- Kept the menu/hamburger icon as the Inspector opener.
- Removed the need for a separate right-side collapsed inspector rail.

### `17cf020` — Enforce single active side panel

- Replaced independent left/right panel visibility behavior with a single active-panel model.
- Ensured only one panel could be open at a time.
- Preserved Inspector auto-open behavior on node, edge, and cluster interaction.

### `0063145` — Use menu icon for inspector toggle

- Changed the collapsed Inspector toggle icon from a magnifying glass to a three-line menu/hamburger icon.
- Preserved the Controls cog icon.

### `63003c1` — Group cluster inspector members by place

- Updated the cluster inspector so contained members are grouped by place.
- Ordered place groups from highest represented visible volume to lowest.
- Ordered members inside each place group from highest individual volume to lowest.
- Preserved contained-item click navigation and Back behavior.

### `fed4b5b` — Use volume-based zoom-responsive cluster sizing

- Updated cluster sizing so cluster radius reflects total represented letter volume.
- Made cluster grouping more responsive to zoom/proximity so nearby locations can merge at lower zoom and separate at higher zoom.
- Preserved cluster click and inspector behavior.

### `3187d05` — Increase dynamic node radius contrast

- Replaced overly compressed node sizing with dynamic log/max sizing.
- Increased visual contrast between low-, medium-, and high-volume nodes.
- Preserved caps so high-volume nodes remain legible.
- Left edge sizing unchanged.

### `ed39e55` — Make cluster nodes open actionable inspector views

- Made cluster nodes clickable.
- Preserved full cluster member payloads during cluster selection.
- Allowed cluster inspector members to open person/place detail views.
- Preserved Back behavior inside the inspector.

### `04eb8b5` — Refresh documentation for safe year-based baseline

- Refreshed documentation around the then-current year-based timeline baseline.
- This documentation has now been superseded by the current `4a17d1c` baseline.

### `57b946e` — Make timeline year-based

- Converted the timeline from month-based controls to year-only controls.
- Removed month selectors from the Timeline block.
- Preserved the broader range/playback model while changing timeline bucketing/filtering to years.

### `79d5ae1` — Remove show all dates shortcut

- Removed the old **Show all dates** shortcut from Display Controls.
- Clarified that date behavior is now controlled through the Timeline block rather than a separate display toggle.

### `3fedd97` — Tighten minimum weight helper text

- Finalized the committed minimum-weight control change by simplifying helper copy.
- Preserved the numeric input with Enter / Update apply behavior.

### `96064e2` — Set people as default view and simplify view buttons

- Replaced the old two-step view-selection UI with three direct buttons:
  - People
  - Place
  - Force-Directed
- Made **People** the default startup view.

---

## Deferred / rolled-back work

### MapLibre migrated-overlay work paused

The later MapLibre migrated-overlay branch is paused. It should be retained as an archived experiment, not deleted. The current continuation branch keeps early gated MapLibre preview files dormant while returning active development to the legacy D3/SVG app. If MapLibre is revisited later, start from a fresh audit and do not assume the experimental branch can be merged wholesale.

### Force-Directed fallback issue on MapLibre experiment

During the later MapLibre experiment, Force-Directed was intended to bypass MapLibre and use the legacy D3/SVG force-directed view. That routing was partly established, but the force view still blanked after briefly rendering. Several speculative sizing fixes were rolled back, and the branch was set aside. Future work should diagnose the legacy force-render path directly before attempting new fixes.


### Shared-panel prop rename attempt, after `4a17d1c`

A cleanup attempt was made to rename the old `showLeftSidebar` / `showRightSidebar` compatibility prop path to newer shared-panel naming. This was rolled back because it broke Inspector auto-open behavior when clicking nodes, edges, or clusters.

Future work should treat this path as fragile. If the old names are renamed later, the pass must explicitly test:

- node click opens Inspector
- edge click opens Inspector
- cluster click opens Inspector
- contained cluster-member click opens detail
- Back behavior remains intact

### Panel responsive sizing attempt, after `b62c74b`

A responsive panel-sizing experiment attempted to make the shared side panel absolutely positioned at all viewport sizes. It was rolled back because it disrupted the full-size landscape layout and forced scrolling before the map.

Future responsive-panel work should be designed as a narrow-window override rather than a universal positioning replacement.

### Superseded cluster drill-down note

Earlier documentation described cluster drill-down as attempted but uncommitted. That note is now superseded by committed cluster work:

- `ed39e55` made cluster nodes actionable in the inspector.
- `63003c1` grouped cluster inspector members by place.

---

# Full development history

This section preserves the cumulative development trajectory for future reference. Older documented entries should remain below this point unless they are clearly obsolete or duplicated by a more accurate retained entry.

## `391174a` — Refresh Peridot documentation for publication baseline

- Updated `README.md`, `MAINTAINERS_GUIDE.md`, and `CHANGELOG.md`.
- Renamed the documented project identity to **Peridot**.
- Aligned the documentation with the publishable browser baseline.

## `951b450` — Replace embedded sample data with current publication dataset

- Replaced the embedded sample/fallback data in `src/App.jsx`.
- Set the built-in browser/demo state to use the intended publication dataset.
- Established the publication dataset baseline used for browser release.

## `f859595` — Add itch.io HTML5 build packaging support

- Updated `vite.config.js` to use a relative base path for safer subdirectory hosting.
- Added `Build_Itch_Zip.py`.
- Established a repeatable HTML5 packaging workflow for itch.io publication.
- Kept generated ZIP artifacts out of normal source commits.

## `f959fac` — Use countries50m as the fixed basemap

- Replaced the earlier fixed `countries110m` basemap with `countries50m`.
- Simplified the committed map baseline after experimental multi-scale atlas work was abandoned.

## `b1fdbd5` — Update maintainer handoff documentation

- Refreshed maintainer handoff documentation used for later bounded passes.

## `dd12281` — Normalize summary panel spacing

- Added matching top spacing above **Summary and Diagnostics**.
- Restored more consistent vertical rhythm inside the **OPTIONS** stack.

## `4fdaf73` — Rename timeline panel heading

- Renamed **Timeline and playback** to **Timeline**.
- Kept timeline behavior unchanged.

## `db5bb1f` — Tighten left panel organization

- Reorganized the left control panel.
- Added a **Visualization Type** section.
- Moved visualization-mode controls into that section.

## `ba746b1` — Simplify theme panel text

- Renamed **Map appearance** to **Theme**.
- Removed explanatory theme copy that no longer matched the preferred presentation.

## `c0fc600` — Retune active country fills for peridot and modern maps

- Retuned Peridot active-country fill.
- Retuned Modern active-country fill.
- Left Early Modern active-country coloring unchanged.

## `56f0080` — Highlight countries containing visible nodes

- Added active-country highlighting for countries containing currently visible nodes.
- Used hint matching and coordinate fallback to determine country membership.

## `5cbe9c3` — Refine early modern node hover and selected colors

- Tuned Early Modern hover state.
- Tuned Early Modern selected state.

## `850176f` — Refine hovered and selected node states

- Strengthened hover/selected node differentiation.
- Continued theme-aware node-state polish.

## `3e43dc9` — Add hovered node color feedback

- Added stronger hovered-node color feedback to improve interaction clarity.

## `919ea5f` — Increase green layering in peridot map theme

- Increased Peridot map-theme green layering and depth.

## `c666d29` — Add peridot default app theme

- Added the Peridot-inspired full-app default theme.

## `9be5f4a` — Tighten maintainer docs audit fixes

- Applied follow-up corrections to maintainer-facing documentation after audit review.

## `43403c3` — Restore detail to maintainer documentation

- Restored architectural and workflow detail that had been thinned too aggressively.

## `02ecb11` — Document inspector navigation feature set

- Updated documentation to reflect the inspector-navigation feature set more explicitly.

## `5af819b` — Add inspector back navigation

- Added inspector-internal Back navigation support.

## `b3e6fe8` — Add place navigation sections to person inspector

- Added explicit place-navigation sections to person detail views.

## `6772c1d` — Clarify connected correspondents count label

- Clarified relationship-count labeling in connected-correspondent UI.

## `ab0e1fe` — Show relationship counts in connected correspondents buttons

- Added relationship counts to connected-correspondent navigation buttons.

## Earlier history

Continue preserving older entries already recorded in repository history. Do not delete older documented history unless it is clearly duplicated by a more accurate retained entry.
