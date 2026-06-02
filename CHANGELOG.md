# Changelog

## Current documented safe baseline

- **`930c807` — `Persist Peridot upload summary in Data Inputs`** on branch **`main`**

This baseline records the active legacy D3/SVG Peridot path after the Search & Filter visual redesign, Analytics visual-polish sequence, and the standardized single-CSV Data Inputs workflow.

The current Data Inputs workflow now provides:

- one primary Peridot CSV upload control;
- a downloadable template using the public Peridot column names;
- permissive database-first upload handling;
- validation/capability reporting;
- an upload summary popup;
- a persistent latest-upload summary in the Data Inputs panel;
- hidden legacy Geography / Raw Data / Person Metadata upload controls retained in code during transition.

The current Search & Filter workflow uses a compact database-style advanced-search layout with current applied scope at the top, draft/apply global filtering, predictive suggestions, year text inputs with suggestions, and pre-update status feedback. Analytics has higher-contrast chart tooltips and an expanded chart view with a dark green translucent backdrop, cool off-white text/borders, a preserved blurred-map layer, and the chart itself retained on a white/cream card.

The early MapLibre preview code remains present and gated behind `?maplibrePreview=1`, but it is dormant for ordinary use. The later `maplibre-native-geographic-view` experiment remains set aside rather than merged into the active implementation path.

---

## Current milestone notes

### Standardized single-CSV Data Inputs milestone

- Added `src/peridotCsvSchema.js` to define the public template columns, field groupings, minimum record rule, capability labels, and upload tips.
- Added `src/peridotCsvNormalizer.js` to convert the public one-file template into existing internal geography, letter metadata, person metadata, and place row shapes.
- Added `src/peridotCsvValidation.js` to build validation summaries and row-capability reports.
- Simplified the ordinary Data Inputs panel to foreground:
  - **Download CSV template**
  - **Upload completed CSV**
  - latest upload summary
  - concise data tips
- Added an upload validation popup and kept the same information accessible after close through a persistent side-panel summary.
- Hid the legacy three-file Geography / Raw Data / Person Metadata upload controls from ordinary UI, while retaining the code path during transition.
- Established the database-first upload policy:
  - rows can be accepted with either source/target names or source/target place information;
  - coordinates are not required for upload;
  - parseable dates are not required for upload;
  - incomplete accepted rows should remain available where possible rather than being silently discarded;
  - Peridot does not clean, standardize, merge, or enforce controlled vocabularies for uploaded user data.

### Search & Filter implementation and layout milestone

- Implemented the dedicated **Search & Filter** rail tab and promoted it from planning contract to active global-filtering UI.
- Search & Filter now owns draft/apply controls for keyword search, person filter, place filter, **Route Filter (Place)**, **Route Filter (People)**, minimum correspondence weight, and date range.
- Predictive suggestion menus appear after at least two typed characters, are capped visually to about five visible suggestions, allow scrolling for more matches, and fill draft fields only.
- **Apply Filters** commits all active filter controls together.
- **Clear Filters** clears keyword/person/place/route filters, restores minimum weight to `1`, restores the full available date range, and resets playback.
- Pre-update status feedback appears before expensive full-dataset recomputation begins.
- Later visual refinements converted Search & Filter from stacked explanatory cards into a compact advanced-search form.

### Analytics visual-polish milestone

- Improved Analytics chart hover tooltip contrast by giving shared chart tooltips an opaque mossy/title-green background with light text.
- Refined the expanded Analytics view:
  - outer layer uses `#182c25` at 70% opacity;
  - border and expanded-view text use cool off-white tones;
  - the existing blurred-map effect remains visible behind the overlay;
  - the chart itself remains on its white/cream card.
- These changes are visual only; chart data derivation, chart controls, and export behavior were not changed.

---

## Current branch status

- **`930c807` — `Persist Peridot upload summary in Data Inputs`** is the current documented `main` baseline.
- **`cbc35d0` — `Add single Peridot CSV upload workflow`** is the preceding live single-CSV workflow implementation milestone.
- **`bdd0843` — `Refine expanded analytics backdrop contrast`** is the preceding Analytics visual-polish baseline.
- **`01de3d8` — `Show filter update status before applying changes`** is the preceding full Search & Filter implementation milestone.
- **`3352403` — `Fix Analytics expanded overlay and variable options`** is the preceding Analytics feature milestone.
- **`10051c0` — `Add MapLibre selected filter layers`** was the earlier legacy-continuation starting point that includes the dormant gated MapLibre preview path.

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

This is the single authoritative place in the documentation for the cumulative commit trajectory. Keep new commit entries here, newest first. Avoid maintaining a second split list of recent commits elsewhere in the documentation.

### `930c807` — Persist Peridot upload summary in Data Inputs

- Kept the latest Peridot CSV upload summary visible in the Data Inputs panel after the upload popup closes.
- Separated validation-summary data from modal-open state so closing the popup does not erase the summary.
- Placed the persistent summary between the upload controls and data tips.

### `cbc35d0` — Add single Peridot CSV upload workflow

- Added the primary one-file Peridot CSV upload workflow to Data Inputs.
- Added template download and wired uploaded template rows through the new schema, normalizer, and validation helpers.
- Fed normalized geography rows, letter metadata rows, person metadata rows, and places into the existing app pipeline.
- Hid the legacy Geography / Raw Data / Person Metadata upload controls from ordinary UI while retaining the code path during transition.

### `61f3c4b` — Add Peridot CSV validation summary helper

- Added `src/peridotCsvValidation.js`.
- Added pure validation-summary helpers for uploaded template rows.
- Reports accepted records, unsupported rows, missing columns, row capabilities, and warning groups for missing coordinates, invalid coordinates, missing names/places, missing dates, and unparseable dates.

### `3d5fb79` — Add Peridot CSV template normalizer

- Added `src/peridotCsvNormalizer.js`.
- Added pure conversion from public Peridot template rows into internal geography rows, letter metadata rows, person metadata rows, and place rows.
- Preserved original template rows and avoided cleaning, merging, or standardizing user-entered values.

### `8e7a8a4` — Add Peridot CSV schema contract

- Added `src/peridotCsvSchema.js`.
- Recorded public template columns, field categories, minimum record rules, capability labels, upload tips, and schema helper functions.
- Established the database-first upload policy for incomplete historical data.

### `9453232` — Document Search and Filter layout and Analytics polish

- Refreshed documentation after the Search & Filter layout refinements and Analytics visual-polish sequence.
- Recorded the then-current baseline after documentation had lagged one push behind the code.

### `bdd0843` — Refine expanded analytics backdrop contrast

- Refined the expanded Analytics view backdrop after several visual tests.
- Set the expanded overlay background to `#182c25` at 70% opacity.
- Set expanded-view text and borders to cool off-white tones.
- Preserved the existing blurred-map backdrop effect.
- Preserved the chart itself on its white/cream card.

### `64d44f2` — Improve analytics tooltip contrast

- Improved Analytics chart hover-tooltip legibility.
- Gave shared chart tooltips a mossy/title-green background with light text.
- Strengthened the tooltip border/shadow so hover data remains readable over heatmaps and dense chart labels.

### `e02c1de` — Move filter status above action buttons

- Moved the Search & Filter status message above **Apply Filters** and **Clear Filters**.
- Prevented the status message from being cut off near the lower edge of the visible panel area.
- Preserved pre-update status timing and existing filter behavior.

### `8bfd422` — Refine compact Search and Filter layout

- Moved **Current applied filter scope** to the top of the Search & Filter panel.
- Replaced date-range dropdowns with start/end year text fields using predictive suggestions.
- Simplified panel copy to clarify that applied filters affect the map, charts, and timeline animation.
- Removed redundant suggestion-helper text.

### `b2147bb` — Consolidate Search and Filter layout

- Converted Search & Filter from a stack of explanatory cards into one compact database-style advanced-search form.
- Consolidated keyword, person, place, route-place, route-people, minimum-weight, and date-range controls into a single criteria card.
- Removed repeated per-filter helper text.
- Retained the applied-scope summary, Apply Filters, Clear Filters, predictive suggestions, and pre-update status feedback.

### `01de3d8` — Show filter update status before applying changes

- Added Search & Filter status feedback that appears before expensive map recomputation begins.
- **Apply Filters** now shows **Updating view…** before committing the state changes that redraw the map/network.
- **Clear Filters** now shows **Filters cleared. Updating view…** before restoring the full dataset scope.
- Used an animation-frame boundary so the browser can paint the status message before applying the expensive filter reset/update.

### `c98c242` — Split route filters by place and people

- Split the earlier route filter into **Route Filter (Place)** and **Route Filter (People)**.
- Added predictive suggestions for source-person → target-person routes.
- Preserved source-place → target-place route suggestions.
- Updated Apply Filters, Clear Filters, applied-scope summaries, and export subtitles to include both route-filter types.

### `1578d10` — Add route filter

- Added the first Search & Filter route filter.
- Derived route suggestions from source-place → target-place pairs.
- Made route filtering participate in the draft/apply model with Apply Filters and Clear Filters.
- Updated export subtitles to record route filter scope.

### `ea19fc8` — Improve predictive suggestion menu scrolling

- Fixed suggestion menus so they are not clipped by filter cards.
- Allowed about five visible suggestions at once with scrollable overflow.
- Increased the suggestion cap so larger datasets can expose more relevant predictive matches without turning the control into a full dropdown.

### `9c179f7` — Add predictive suggestions for person and place filters

- Added predictive suggestions for person and place filters.
- Derived suggestions from loaded source/target correspondents and source/target places.
- Kept suggestions draft-only so selecting one does not update the map until **Apply Filters** is pressed.

### `cc26530` — Add person and place filters

- Added simple free-text **Person filter** and **Place filter** controls.
- Person filter matches sender/source person and recipient/target person.
- Place filter matches source place and target place.
- Integrated person/place filtering into the active filtered dataset pipeline.

### `019acef` — Add clear filters and reset playback on apply

- Replaced **Reset Draft** with **Clear Filters**.
- Clear Filters now clears keyword/person/place-related draft/apply state as of that stage, restores minimum weight to `1`, restores the full date range, and resets playback.
- Apply Filters resets playback so the next run uses the newly applied date/filter scope.

### `d5e7667` — Apply Search and Filter changes on request

- Moved keyword search into the Search & Filter tab.
- Converted keyword, minimum-weight, and date-range controls to a draft/apply model.
- Added **Apply Filters** and initial current applied filter-scope display.

### `8912b8f` — Strengthen full-file review workflow rule

- Strengthened `PROJECT_WORKFLOW_CHARTER.md` to require full-file review before code edits.
- Established full-file replacements as the preferred delivery mode for dense or fragile code files.
- Clarified that brittle snippet/regex patching should be avoided unless the full file has been reviewed and the target is unambiguous.

### `b348f12` — Move date range controls into Search and Filter

- Moved date-range controls into Search & Filter.
- Preserved Timeline playback as a separate panel concern while Search & Filter began owning the applied date range.

### `a890b13` — Move minimum weight filter into Search and Filter

- Moved the minimum correspondence weight control into Search & Filter.
- Preserved the existing minimum-weight filtering behavior while relocating the UI.

### `e6b477d` — Add Search and Filter panel shell

- Added the Search & Filter rail-tab shell.
- Established the panel boundary for later filter migration.

### `2eb3461` — Document Search and Filter panel contract

- Documented the Search & Filter design contract before implementation.
- Defined the long-term active-filtered-dataset model.

### `3352403` — Fix Analytics expanded overlay and variable options

- Fixed the expanded chart view so it renders through a React portal and overlays the map area rather than being constrained by the Analytics panel.
- Strengthened dynamic variable filtering so technical fields such as mappability flags, IDs, coordinates, dates, numeric-only fields, and near-unique row identifiers are excluded from ordinary chart-variable menus.
- Added semantic alias handling for curated variables such as Language and Relationship.
- Split the ambiguous Route variable into **Route (Place)** and **Route (Person)**.

### `4b631be` — Refine Analytics variables and expanded chart overlay

- Added top-N options for 1, 2, 3, 4, 5, 10, 15, and 20 displayed categories.
- Added dynamic categorical metadata field detection from current/uploaded row data.
- Moved the expanded chart view toward the map area rather than using a centered full-screen modal.

### `416dced` — Refine Analytics chart icons and expanded view

- Reordered Analytics chart icons into a 3-column chart grid.
- Capitalized chart option labels.
- Corrected grouped and stacked bar-chart icon baselines.
- Added the first expanded chart view.

### `2320bfe` — Expand Analytics chart controls

- Added Grouped Bar Chart, Sunburst Chart, and Histogram.
- Made the Bar Chart default to vertical orientation, with a horizontal-orientation option.
- Added Analytics-local date-range controls.
- Added automatic period granularity for time-based charts: more than 5 years = year; 5 years or less = half-year; 3 years or less = quarter; 1 year or less = month.

### `961bf45` — Clarify Analytics chart variable controls

- Clarified how many variables each chart type accepts.
- Labeled chart variable controls explicitly.
- Added best-use-case notes for chart defaults.

### `4b90e4e` — Add additional Analytics chart types

- Added Pie Chart, Heatmap, Stacked Bar Chart, and Multi-Line Chart.
- Added chart data derivation and SVG rendering for the additional chart types.

### `caddd3c` — Refine Analytics chart panel interactions

- Replaced the chart selector with square chart-icon buttons.
- Moved chart descriptions and example questions into the Configure area.
- Added hover tooltips for chart elements.
- Improved PNG export behavior for chart previews.

### `04d95a7` — Add Analytics side panel charts

- Added the Analytics side-panel tab.
- Added initial Bar Chart and Line Chart support.
- Added compact chart preview, variable availability, descriptors/example questions, and PNG export.

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

- Split the side-panel model into whether the side panel is open and which tab is active.
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
- This documentation has now been superseded by later baselines.

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

- Replaced the old two-step view-selection UI with three direct buttons: People, Place, Force-Directed.
- Made **People** the default startup view.

### `391174a` — Refresh Peridot documentation for publication baseline

- Updated `README.md`, `MAINTAINERS_GUIDE.md`, and `CHANGELOG.md`.
- Renamed the documented project identity to **Peridot**.
- Aligned the documentation with the publishable browser baseline.

### `951b450` — Replace embedded sample data with current publication dataset

- Replaced the embedded sample/fallback data in `src/App.jsx`.
- Set the built-in browser/demo state to use the intended publication dataset.
- Established the publication dataset baseline used for browser release.

### `f859595` — Add itch.io HTML5 build packaging support

- Updated `vite.config.js` to use a relative base path for safer subdirectory hosting.
- Added `Build_Itch_Zip.py`.
- Established a repeatable HTML5 packaging workflow for itch.io publication.
- Kept generated ZIP artifacts out of normal source commits.

### `f959fac` — Use countries50m as the fixed basemap

- Replaced the earlier fixed `countries110m` basemap with `countries50m`.
- Simplified the committed map baseline after experimental multi-scale atlas work was abandoned.

### `b1fdbd5` — Update maintainer handoff documentation

- Refreshed maintainer handoff documentation used for later bounded passes.

### `dd12281` — Normalize summary panel spacing

- Added matching top spacing above **Summary and Diagnostics**.
- Restored more consistent vertical rhythm inside the **OPTIONS** stack.

### `4fdaf73` — Rename timeline panel heading

- Renamed **Timeline and playback** to **Timeline**.
- Kept timeline behavior unchanged.

### `db5bb1f` — Tighten left panel organization

- Reorganized the left control panel.
- Added a **Visualization Type** section.
- Moved visualization-mode controls into that section.

### `ba746b1` — Simplify theme panel text

- Renamed **Map appearance** to **Theme**.
- Removed explanatory theme copy that no longer matched the preferred presentation.

### `c0fc600` — Retune active country fills for peridot and modern maps

- Retuned Peridot active-country fill.
- Retuned Modern active-country fill.
- Left Early Modern active-country coloring unchanged.

### `56f0080` — Highlight countries containing visible nodes

- Added active-country highlighting for countries containing currently visible nodes.
- Used hint matching and coordinate fallback to determine country membership.

### `5cbe9c3` — Refine early modern node hover and selected colors

- Tuned Early Modern hover state.
- Tuned Early Modern selected state.

### `850176f` — Refine hovered and selected node states

- Strengthened hover/selected node differentiation.
- Continued theme-aware node-state polish.

### `3e43dc9` — Add hovered node color feedback

- Added stronger hovered-node color feedback to improve interaction clarity.

### `919ea5f` — Increase green layering in peridot map theme

- Increased Peridot map-theme green layering and depth.

### `c666d29` — Add peridot default app theme

- Added the Peridot-inspired full-app default theme.

### `9be5f4a` — Tighten maintainer docs audit fixes

- Applied follow-up corrections to maintainer-facing documentation after audit review.

### `43403c3` — Restore detail to maintainer documentation

- Restored architectural and workflow detail that had been thinned too aggressively.

### `02ecb11` — Document inspector navigation feature set

- Updated documentation to reflect the inspector-navigation feature set more explicitly.

### `5af819b` — Add inspector back navigation

- Added inspector-internal Back navigation support.

### `b3e6fe8` — Add place navigation sections to person inspector

- Added explicit place-navigation sections to person detail views.

### `6772c1d` — Clarify connected correspondents count label

- Clarified relationship-count labeling in connected-correspondent UI.

### `ab0e1fe` — Show relationship counts in connected correspondents buttons

- Added relationship counts to connected-correspondent navigation buttons.

## Earlier history

Continue preserving older entries already recorded in repository history. Do not delete older documented history unless it is clearly duplicated by a more accurate retained entry.
