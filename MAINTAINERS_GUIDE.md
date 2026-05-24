# Maintainer's Guide

## Purpose

This document is the architectural reference for the Peridot correspondence visualizer app. It should stay aligned with the committed source of truth in the repository and with the workflow rules in `PROJECT_WORKFLOW_CHARTER.md`.

This guide is updated on committed architectural changes and should be sufficient to hand off work into a fresh chat session without depending on older conversation context.

---

## Source of truth and working assumptions

Current source of truth folder:

- `C:\Users\haley\OneDrive\Desktop\CorrespondenceVisualizer\`

Current active branch for continued legacy work:

- **`main`**

Current documented baseline:

- **`01de3d8` — `Show filter update status before applying changes`**

This baseline records the active legacy D3/SVG Peridot path after the Search & Filter milestone. Search & Filter now owns draft/apply global filters for keyword, person, place, route-place, route-people, minimum weight, and date range, with predictive suggestions and pre-update status feedback. The earlier MapLibre preview files remain present but dormant unless `?maplibrePreview=1` is used.

The preceding Analytics milestone remains:

- **`3352403` — `Fix Analytics expanded overlay and variable options`**

Current GitHub repository:

- `https://github.com/haleyrp1803/correspondence-visualizer`

When the local folder and GitHub are confirmed aligned by the sync ritual, treat the current Git commit as the source of truth.

This project should continue to follow the user's bounded-pass workflow:

- one source of truth per pass
- classify each pass as exactly one of: behavior, visual, structural, documentation
- keep one clear goal per pass
- use explicit acceptance tests
- checkpoint before higher-risk work
- separate behavior changes from visual changes
- when runtime issues appear after interaction, check the **F12 browser console early**

---

## Repository shape

Current live app surface includes:

- `src/App.jsx`
- `src/index.css`
- `src/main.jsx`

Current panel / inspector / Analytics boundaries in `src/`:

- `src/AnalyticsPanel.jsx`
- `src/LeftControlPanel.jsx`
- `src/InspectorPanel.jsx`
- `src/InspectorBodyRouter.jsx`
- `src/InspectorEmptyState.jsx`
- `src/InspectorClusterView.jsx`
- `src/InspectorEdgeView.jsx`
- `src/InspectorNodeView.jsx`
- `src/InspectorConnectedCorrespondents.jsx`
- `src/InspectorPersonPlaces.jsx`
- `src/InspectorBackButton.jsx`

Extracted support modules in `src/`:

- `src/analyticsChartComponents.jsx`
- `src/analyticsConfig.js`
- `src/analyticsDerivationHelpers.js`
- `src/mapLayoutHelpers.js`
- `src/mapStageComponents.jsx`
- `src/interactionHelpers.js`
- `src/mapInteractionHandlers.js`
- `src/timelinePlaybackHelpers.js`
- `src/timelinePlaybackComponents.jsx`
- `src/exportHelpers.js`
- `src/personForceLayoutHelpers.js`
- `src/MapLibreMapStage.jsx` — dormant gated preview path inherited from `main`
- `src/mapStyleConfig.js` — dormant MapLibre preview style config

Maintainer/workflow documents at repo root:

- `README.md`
- `MAINTAINERS_GUIDE.md`
- `PROJECT_WORKFLOW_CHARTER.md`
- `CHANGELOG.md`

---

## Architectural summary

Peridot is a Vite/React/Tailwind correspondence visualizer with three user-facing visualization choices:

- **People**
- **Place**
- **Force-Directed**

Internally, the app still uses the geographic/person view split plus person layout mode, but the user-facing control model uses direct view buttons.

The app includes:

- CSV ingestion and normalization
- graph derivation
- interactive SVG-based rendering
- year-based timeline filtering and playback
- shared side-panel inspection workflow
- persistent side-panel icon rail with dedicated Controls, Data Inputs, Export, Timeline, Analytics, and Inspector tabs
- implemented Search & Filter consolidation defining one active filtered dataset for map, Inspector, Analytics, Timeline, and Export workflows
- theme presets and visual controls
- export tools for image and tabular outputs
- Analytics charting tools with compact previews, expanded overlay, variable controls, date-range controls, and PNG chart export

The main maintenance challenge remains structural concentration in `src/App.jsx`, but that concentration has been reduced through bounded extraction passes.

### MapLibre status

MapLibre work is currently paused. The active continuation branch should be treated as a legacy D3/SVG Peridot branch. Early MapLibre preview files remain in the repository because `main` includes the gated preview prototype at `10051c0`, but those files are dormant in ordinary use.

A later branch, `maplibre-native-geographic-view`, explored a much larger MapLibre migrated overlay. That branch is not the active source of truth. It should be preserved as an experiment and revisited only after an explicit fresh audit.

The current person-network layouts are:

- **geographic-anchor**
- **force-directed** using pre-settled `d3-force`

The force-directed person view renders on a clean theme-driven background rather than on top of the geographic map backdrop.

---

## Current module responsibilities

### `src/App.jsx`

Main orchestration file. It owns top-level state, derived data wiring, workspace composition, theme token definitions, side-panel contract building, timeline state, inspector navigation state, and export wiring.

### `src/LeftControlPanel.jsx`

Owns the shared side-panel shell and persistent icon rail. The shell includes:

- persistent icon rail that is available when the panel is closed and when it is open
- open-state close button at the top of the rail
- rail-driven panel views for **Controls**, **Data Inputs**, **Export**, **Timeline**, **Analytics**, and **Inspector**
- **Search & Filter** content rendering for keyword, person, place, route-place, route-people, minimum-weight, and date-range filters
- predictive suggestion menus for person, place, route-place, and route-people fields
- draft/apply filter UI with Apply Filters, Clear Filters, current applied scope, and pre-update status feedback
- Controls content rendering for visualization, display, theme, summary, and diagnostics controls
- Data Inputs content rendering for Geography, Raw Data, and Person Metadata uploads
- Export content rendering for SVG, PNG, nodes CSV, and edges/routes CSV controls
- Timeline content rendering for year-range and playback controls
- Analytics content rendering through `AnalyticsPanelContent`
- Inspector content rendering through `InspectorPanelContent`

This file currently remains named `LeftControlPanel.jsx`, but it is now conceptually the shared side-panel shell and rail-tab host. Compatibility-sensitive `showLeftSidebar` / `showRightSidebar` state names still exist and should not be casually renamed because they are tied to inspector auto-open behavior.

### `src/AnalyticsPanel.jsx`

Owns the Analytics panel UI. It renders:

- chart selection grid
- chart descriptions and example questions
- variable controls
- Analytics-local date-range controls
- compact chart preview
- expanded chart overlay trigger
- chart PNG export action

The expanded chart view is rendered through a React portal and overlays the map area without changing map state.

### `src/analyticsConfig.js`

Owns Analytics chart configuration, including:

- chart labels and descriptions
- example research questions
- default Analytics state
- top-N display options
- curated variable definitions
- **Route (Place)** and **Route (Person)** definitions

### `src/analyticsDerivationHelpers.js`

Owns Analytics data derivation, including:

- available variable detection
- conservative filtering of dynamic metadata fields
- time-period bucketing for date-range charts
- chart data construction
- semantic alias handling for curated fields such as Language and Relationship

Dynamic variable detection should exclude technical or non-categorical fields such as IDs, latitude/longitude fields, date fields, mappability flags, object/array values, purely numeric values, long note-like fields, and near-unique row identifiers.

### `src/analyticsChartComponents.jsx`

Owns SVG chart rendering for:

- Bar Chart
- Grouped Bar Chart
- Stacked Bar Chart
- Line Chart
- Multi-Line Chart
- Histogram
- Pie Chart
- Sunburst Chart
- Heatmap

### `src/InspectorPanel.jsx`

Owns inspector content only. It no longer owns the outer panel shell. It renders:

- inspector header
- inspector-internal Back button
- `InspectorBodyRouter`

### `src/InspectorBodyRouter.jsx`

Routes resolved inspector state to the appropriate extracted view.

### `src/InspectorEmptyState.jsx`

Owns the empty inspector state.

### `src/InspectorClusterView.jsx`

Owns the cluster inspector view. Current behavior groups contained members by place and sorts groups/members by represented visible volume.

### `src/InspectorEdgeView.jsx`

Owns the edge inspector state boundary.

### `src/InspectorNodeView.jsx`

Owns the node / person-detail / place-detail inspector boundary.

### `src/mapLayoutHelpers.js`

Pure map/layout helper logic, including viewport construction, clustering, cluster radius calculation, label visibility, and geometric calculations.

### `src/mapStageComponents.jsx`

Map-stage-adjacent UI/chrome components.

### `src/interactionHelpers.js`

Pure interaction-resolution and selection-building helpers. This file owns helper logic for:

- nearby candidate generation
- selection resolution
- cluster selection payload building
- connected-correspondent ordering
- `person-detail` and `place-detail` payload derivation
- person-detail sent/received place-section derivation

### `src/mapInteractionHandlers.js`

Top-level map interaction handlers.

### `src/timelinePlaybackHelpers.js`

Pure timeline/playback derivation helpers.

### `src/timelinePlaybackComponents.jsx`

Timeline/playback panel UI boundary. The timeline is now **year-based**, not month-based.

### `src/exportHelpers.js`

Pure export utilities and export row-builder helpers.

### `src/personForceLayoutHelpers.js`

Pure helper logic for the pre-settled force-directed person-network layout.

### `src/MapLibreMapStage.jsx`

Dormant development-only MapLibre preview stage inherited from `main` at `10051c0`. It is not the active production renderer on `main`. Avoid changing it unless the user explicitly resumes MapLibre work.

### `src/mapStyleConfig.js`

Dormant MapLibre preview style configuration.

### `src/InspectorConnectedCorrespondents.jsx`

Inspector navigation component for person-to-person movement.

### `src/InspectorPersonPlaces.jsx`

Inspector navigation component for person-to-place movement. It shows two explicit sections:

- **Places this person sent letters to**
- **Places where this person received letters**

### `src/InspectorBackButton.jsx`

Inspector-internal Back button. It uses a small local history model for inspector-internal navigation only and does not track ordinary map clicks as navigation history.

---

## Current functional state

### Visualization modes

- Place view
- People view
- Force-Directed view

### Person-network layouts

- geographic-anchor layout
- pre-settled force-directed layout

### Side-panel capabilities

- one shared left-side panel shell
- persistent icon rail as the panel-view switcher
- close button at the top of the open-state rail
- dedicated rail tabs for Controls, Data Inputs, Search & Filter, Export, Timeline, Analytics, and Inspector
- Data Inputs, Search & Filter, Export, Timeline, and Analytics moved out of the general Controls panel into dedicated views
- shell-level open/close behavior
- Inspector auto-opens from node, edge, and cluster interactions

### Search & Filter capabilities

- dedicated Search & Filter rail tab
- draft/apply global filtering model
- **Apply Filters** commits all filter changes together
- **Clear Filters** clears keyword/person/place/route fields, restores minimum weight to `1`, restores the full date range, and resets playback
- status feedback appears before expensive filter recomputation begins
- current applied filter scope is displayed in the panel
- text filters include:
  - keyword search
  - person filter
  - place filter
  - **Route Filter (Place)**
  - **Route Filter (People)**
- non-text filters include:
  - minimum correspondence weight
  - date range
- predictive suggestions are available for:
  - person
  - place
  - route-place
  - route-people
- suggestion menus show after at least two typed characters, show about five suggestions at once, and scroll for more matches
- selecting a suggestion fills a draft field only; the map/network updates only after **Apply Filters**

### Inspector capabilities

- hover and click inspection
- linked records browsing
- internal navigation between people and places
- Back button support for inspector-internal navigation
- actionable cluster inspector views
- cluster members grouped by place and ordered by visible volume

### Timeline capabilities

- year-based date filtering
- playback controls
- timeline controls now appear in a dedicated side-panel Timeline tab
- timeline panel UI extracted into supporting components/helpers
- month selectors removed in favor of start-year / end-year controls
- active start/end year controls and playback behavior were preserved during the Timeline-tab move

### Map and sizing capabilities

- dynamic node radius contrast based on visible active data
- volume-based zoom-responsive cluster sizing
- zoom-responsive proximity clustering for nearby nodes/places
- edge sizing unchanged by the recent node/cluster sizing work

### Export capabilities

- SVG export
- PNG export
- nodes CSV export
- edges/routes CSV export
- Analytics chart PNG export
- export controls now appear in a dedicated side-panel Export tab

### Analytics capabilities

- dedicated side-panel Analytics tab
- chart picker with Bar, Grouped Bar, Stacked Bar, Line, Multi-Line, Histogram, Pie, Sunburst, and Heatmap chart types
- chart descriptions and example questions
- chart-specific variable controls
- curated semantic variables plus usable dynamically detected categorical metadata fields
- explicit **Route (Place)** and **Route (Person)** variables
- Analytics-local date-range controls for time-based charts
- automatic time-period granularity based on selected date range
- compact side-panel chart preview
- expanded chart overlay over the map area
- PNG chart export

---

## Search & Filter active-dataset contract

The dedicated **Search & Filter** tab is implemented and is now the owner of global filtering behavior.

### Core model

Peridot distinguishes:

```text
data source
→ active filtered dataset
→ visualization / inspection / analytics / export
```

Search & Filter defines the **active filtered dataset**: the subset of loaded correspondence records that pass all enabled global filters.

### Current responsibilities

- **Data Inputs** defines which data is loaded.
- **Search & Filter** defines which records, people, places, routes, and time/weight scopes are in the active dataset.
- **Controls / View** defines how the active dataset is displayed.
- **Timeline** focuses on chronological playback and temporal navigation while consuming the applied date scope.
- **Analytics** charts the current filtered dataset by default.
- **Inspector** remains selection-driven, with possible later actions to filter to the selected person/place/route.
- **Export** should label whether it exports loaded, filtered, visible, selected, or charted data.

### Current filters

Implemented Search & Filter controls:

- keyword search
- person filter
- place filter
- **Route Filter (Place)**
- **Route Filter (People)**
- minimum correspondence weight
- date range

Autocomplete/predictive suggestions are implemented for:

- person
- place
- source-place → target-place routes
- source-person → target-person routes

### Implementation cautions

Search & Filter is a fragile active-dataset state boundary. Future changes should be narrow and should explicitly test:

- typing in text fields does not recompute on every keystroke
- predictive suggestions fill draft fields only
- Apply Filters commits all filters together
- Clear Filters resets all filters and playback
- timeline playback respects the applied filter/date scope
- inspector clicks still open after filtering
- Analytics and Export still receive the intended filtered scope
- pre-update status appears before expensive full-dataset recomputation begins

Do not use Search & Filter work as an opportunity for broad `App.jsx` refactoring. Do not merge Timeline, Analytics, and Inspector into one panel. Do not make Analytics or Inspector the global filter owner. Do not rename compatibility-sensitive `showLeftSidebar` / `showRightSidebar` paths during this work. Do not touch dormant MapLibre files as part of Search & Filter work.


## Current theme and panel state

The default full-app theme remains **Peridot-inspired**.

Other retained presets still function as map-focused alternatives:

- Early modern map
- Modern map

Important current side-panel state:

- the persistent rail, not a horizontal top-tab row, is now the panel-view switcher
- rail tabs are currently:
  1. **Controls** — Visualization Type, Display Controls, Theme, Summary and Diagnostics, and remaining general options
  2. **Data Inputs** — Geography, Raw Data, and Person Metadata upload controls
  3. **Search & Filter** — active-dataset filters, predictive suggestions, Apply Filters, Clear Filters, and filter status feedback
  4. **Export** — SVG, PNG, nodes CSV, and edges/routes CSV export controls
  5. **Timeline** — year-range filtering and playback controls
  6. **Analytics** — chart selection, chart configuration, expanded chart overlay, and chart PNG export
  7. **Inspector** — selected nodes, edges, clusters, linked records, and inspector-internal navigation
- the open-state rail has a mossy/peridot background, lighter green inactive buttons, lighter hover states, and cream active-state buttons

Recent committed behavior includes:

- direct view buttons for **People**, **Place**, and **Force-Directed**
- **People** as the default startup view
- Search & Filter draft/apply model for keyword, person, place, route-place, route-people, minimum-weight, and date-range controls
- removal of the old **Show all dates** shortcut
- year-only timeline selectors
- removal of the old horizontal Controls / Inspector top tabs
- dedicated rail tabs for Data Inputs, Export, Timeline, and Analytics

---

## Recent development trajectory

### Analytics sequence

#### `04d95a7` — Add Analytics side panel charts

Added the Analytics side-panel tab, initial Bar Chart and Line Chart support, chart descriptions/example questions, variable availability, compact preview, and PNG export.

#### `caddd3c` — Refine Analytics chart panel interactions

Replaced the chart selector with square chart-icon buttons, moved descriptive chart text into the Configure area, added hover tooltips, and improved chart PNG export behavior.

#### `4b90e4e` — Add additional Analytics chart types

Added Pie Chart, Heatmap, Stacked Bar Chart, and Multi-Line Chart support.

#### `961bf45` — Clarify Analytics chart variable controls

Clarified chart variable counts, variable roles, and default best-use cases.

#### `2320bfe` — Expand Analytics chart controls

Added Grouped Bar Chart, Sunburst Chart, Histogram, bar-chart orientation control, Analytics-local date-range controls, and automatic period granularity.

#### `416dced` — Refine Analytics chart icons and expanded view

Reordered chart icons, capitalized labels, fixed grouped/stacked bar icon baselines, and added the first expanded chart view.

#### `4b631be` — Refine Analytics variables and expanded chart overlay

Expanded top-N options, added dynamic categorical metadata field detection, and moved the expanded chart view toward the map area.

#### `3352403` — Fix Analytics expanded overlay and variable options

Fixed the expanded chart overlay so it renders through a React portal over the map area, strengthened dynamic variable filtering, added semantic aliases for curated variables, and split route variables into **Route (Place)** and **Route (Person)**.

### Cluster and sizing sequence

#### `ed39e55` — Make cluster nodes open actionable inspector views

Made cluster nodes clickable and made contained cluster members navigable through the inspector.

#### `3187d05` — Increase dynamic node radius contrast

Introduced stronger dynamic node radius contrast based on active data while preserving caps.

#### `fed4b5b` — Use volume-based zoom-responsive cluster sizing

Made cluster sizing reflect represented letter volume and made clustering respond more appropriately to zoom/proximity.

#### `63003c1` — Group cluster inspector members by place

Grouped cluster inspector members by place and ordered groups/members by volume.

### Shared side-panel sequence

#### `0063145` — Use menu icon for inspector toggle

Changed the collapsed Inspector toggle icon from magnifying glass to menu/hamburger.

#### `17cf020` — Enforce single active side panel

Ensured only one side panel could be open at a time.

#### `df4075a` — Move side panel toggles to left rail

Moved both panel opener icons to the left rail.

#### `f98b3e5` — Add panel mode switcher tabs

Added Controls / Inspector tabs inside the open panel.

#### `2126c9b` — Open inspector in left panel dock

Moved the inspector to the left-side panel area.

#### `88b0c19` — Rename inspector panel shell for left dock

Renamed `RightInspectorPanel.jsx` to `InspectorPanel.jsx`.

#### `e41d8bc` — Split side panel open state from active tab

Separated side-panel open/closed state from active tab state.

#### `b62c74b` — Use shared side panel shell

Created one shared side-panel shell for both Controls and Inspector.

#### `4a17d1c` — Make inspector panel content-only

Removed obsolete shell/tab code from `InspectorPanel.jsx`.

### Shared side-panel rail-tab sequence

#### `f7407eb` — Refresh documentation for shared panel baseline

Refreshed documentation after the shared side-panel baseline and recorded the then-current shared panel architecture before later rail-tab expansion.

#### `06c1843` — Clean shared side panel source comments

Cleaned obsolete shared-panel source comments and avoided renaming compatibility-sensitive side-panel state paths.

#### `8882b69` — Remove obsolete audit documentation references

Removed obsolete root-level audit documentation files that no longer served as active maintainer references.

#### `4653f20` — Remove obsolete audit documentation listings

Removed stale references to the obsolete audit documents from active documentation.

#### `6142817` — Anchor shared panel icon rail to panel shell

Anchored the icon rail to the shared panel shell rather than hard-coded viewport coordinates. The rail remains available when the panel is open and closed, and the close button appears at the top of the rail when open.

#### `2acdb91` — Remove obsolete side panel top tabs

Removed the horizontal Controls / Inspector tab row and made the persistent rail the active panel-view switcher.

#### `dcce703` — Style shared panel icon rail

Styled the rail as a distinct mossy/peridot visual zone with lighter green inactive buttons, lighter hover states, and cream active-state buttons.

#### `5b38c4e` — Update shared panel rail icons

Updated Controls to use the three-line stack icon and Inspector to use a magnifying-glass icon.

#### `f1394c6` — Add data inputs side panel tab

Added the **Data Inputs** rail tab and moved Geography, Raw Data, and Person Metadata upload controls into that dedicated panel view.

#### `6a672d9` — Add export side panel tab

Added the **Export** rail tab, moved existing export controls into that dedicated panel view, and kept export options visible when the tab opens.

#### `def4265` — Add timeline side panel tab

Added the **Timeline** rail tab and moved existing year-range and playback controls into that dedicated panel view while preserving active year adjustment and playback behavior.

#### `8539c68` — Clarify timeline rail icon

Settled the Timeline rail icon on a simple clock-style symbol after horizontal progression icons lost too much detail at rail-button size.


### Search & Filter sequence

#### `2eb3461` — Document Search and Filter panel contract

Documented the Search & Filter design contract and active-filtered-dataset model before implementation.

#### `e6b477d` — Add Search and Filter panel shell

Added the Search & Filter rail-tab shell.

#### `a890b13` — Move minimum weight filter into Search and Filter

Moved minimum correspondence weight into Search & Filter while preserving behavior.

#### `b348f12` — Move date range controls into Search and Filter

Moved date-range controls into Search & Filter while preserving Timeline playback behavior.

#### `d5e7667` — Apply Search and Filter changes on request

Moved keyword search into Search & Filter and introduced the draft/apply model.

#### `019acef` — Add clear filters and reset playback on apply

Added Clear Filters and reset playback on filter apply/clear.

#### `cc26530` — Add person and place filters

Added free-text person and place filters.

#### `9c179f7` — Add predictive suggestions for person and place filters

Added predictive suggestions for person and place filters.

#### `ea19fc8` — Improve predictive suggestion menu scrolling

Improved predictive suggestion menu overflow and scrolling.

#### `1578d10` — Add route filter

Added the first route filter with source-place → target-place suggestions.

#### `c98c242` — Split route filters by place and people

Split route filtering into **Route Filter (Place)** and **Route Filter (People)**.

#### `01de3d8` — Show filter update status before applying changes

Added pre-update Search & Filter status feedback so users see feedback before expensive map updates begin.

---

## Deferred / rolled-back work

### MapLibre migrated-overlay branch paused

The later `maplibre-native-geographic-view` branch explored a fuller MapLibre migrated overlay. It produced substantial experimental progress but also accumulated fragility around structural extraction and Force-Directed fallback behavior. The project has set this work aside and returned to a legacy continuation branch.

Current practice: keep the MapLibre files dormant; do not remove them casually, and do not use `?maplibrePreview=1` for ordinary legacy testing. If MapLibre work resumes, begin with a fresh source-of-truth audit.


### Shared-panel semantic prop rename

An attempted cleanup of old `showLeftSidebar` / `showRightSidebar` compatibility names was rolled back because it broke inspector auto-open behavior from node, edge, and cluster clicks.

Do not rename this compatibility path casually. If revisited, explicitly test:

- node click opens Inspector
- edge click opens Inspector
- cluster click opens Inspector
- contained cluster member opens detail
- Back behavior still works

### Responsive side-panel sizing

An attempted universal responsive positioning change for the shared side panel was rolled back because it disrupted the normal full-size landscape layout and forced scrolling before the map.

Future responsive work should be a narrow-window-specific override, not a universal replacement of the panel positioning model.

---

## Current fragile zones

These areas still deserve narrow, explicit passes:

- map viewport centering/reset behavior
- dense map hover/click interaction
- selection persistence across filters
- timeline/playback state coupling
- export rendering/state coupling
- broad orchestration work in `src/App.jsx`
- shared side-panel shell and inspector-open interactions
- cluster grouping and cluster inspector navigation
- Analytics expanded overlay positioning above the map area
- Analytics dynamic variable detection from uploaded/current row data
- Analytics SVG-to-PNG chart export rendering
- Search & Filter active-dataset state, especially draft/apply coordination across keyword, person, place, route-place, route-people, date, weight, Timeline, Analytics, Inspector, and Export behavior
- dormant MapLibre preview code if it is ever reactivated

---

## Additional caution

Generated helper scripts and backup files should be removed after use.

Examples of things that should not linger in the repo folder:

- temporary Python patch scripts
- temporary PowerShell patch scripts
- `itch_upload/`
- backup `.jsx` / `.js` files made during local patching

---

## Workflow reminders

Future work should continue to follow the user's established workflow:

- one bounded pass at a time
- classify each pass as **behavior**, **visual**, **structural**, or **documentation**
- one explicit acceptance test per pass
- prefer local/small edits when safe
- use checkpoints before higher-risk changes
- only ask for the sync ritual after an actual checkpoint or commit
- prefer direct file delivery and exact Windows PowerShell commands
- prefer `.txt` delivery for generated source replacements when direct source-file downloads are unreliable
- when runtime issues appear after interaction, check the **F12 browser console early**

This recent work also reinforced these process rules:

- trust GitHub/local source when a recent sync ritual confirms they match
- target changes against the exact live file shape
- if a UI change does not appear, verify the live file before stacking more patches
- do behavior pass first, then cleanup pass second
- if a pass starts drifting, restore to the last safe commit rather than continuing to stack speculative fixes
- when a long conversation becomes unreliable or laggy, restore the safe baseline, update docs, and continue in a fresh chat

---

## Fresh-chat handoff note

A future chat should start from:

- source of truth folder: `C:\Users\haley\OneDrive\Desktop\CorrespondenceVisualizer\`
- active branch: `main`
- current documented baseline: **`01de3d8` — `Show filter update status before applying changes`**
- last documented pre-Analytics UI milestone: **`8539c68` — `Clarify timeline rail icon`**

A future chat should also be told that:

- the app identity is **Peridot**
- the fixed basemap is `countries50m`
- itch.io packaging support is already committed
- the current shared side panel and rail-tab structure are committed
- `InspectorPanel.jsx` is content-only
- `LeftControlPanel.jsx` owns the shared panel shell, persistent rail, and Controls/Data Inputs/Export/Timeline/Analytics/Inspector panel views
- `AnalyticsPanel.jsx`, `analyticsConfig.js`, `analyticsDerivationHelpers.js`, and `analyticsChartComponents.jsx` own the Analytics subsystem
- current cluster features are committed, not deferred
- MapLibre migrated-overlay work is paused and should not be treated as the active implementation direction
- documentation should preserve the full commit trajectory carefully
- the implemented Search & Filter panel consolidates global filtering and defines the active filtered dataset before Analytics, Timeline, Inspector, and Export consume it
