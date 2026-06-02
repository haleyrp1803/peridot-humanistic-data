# Maintainer's Guide

## Purpose

This document is the architectural reference for the Peridot correspondence visualizer app. It should stay aligned with the committed source of truth in the repository and with the workflow rules in `PROJECT_WORKFLOW_CHARTER.md`.

This guide is updated on committed architectural changes and should be sufficient to hand off work into a fresh chat session without depending on older conversation context.

The full commit history is intentionally preserved in one place in `CHANGELOG.md`; this guide summarizes architecture and current-state responsibilities rather than duplicating the complete commit log.

---

## Source of truth and working assumptions

Current source of truth folder:

- `C:\Users\haley\OneDrive\Desktop\CorrespondenceVisualizer\`

Current active branch for continued legacy work:

- **`main`**

Current documented baseline:

- **`4d11cb3` — `Add Peridot workbook parsing helper`**

This baseline records the active legacy D3/SVG Peridot path after the Search & Filter implementation/layout milestone, Analytics visual-polish sequence, standardized one-file Peridot CSV upload workflow, arbitrary CSV/TSV column-mapping import path, removal of the public legacy three-file upload workflow, and the first workbook parsing helper. Data Inputs now foregrounds one public Peridot CSV template path plus mapped arbitrary-table import.

Preceding data-input milestones include:

- **`d270c9d` — `Import mapped arbitrary CSV and TSV data`**
- **`a058730` — `Add Peridot column mapping workspace`**
- **`cbc35d0` — `Add single Peridot CSV upload workflow`**

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
- `src/PeridotColumnMappingModal.jsx`
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
- `src/peridotCsvSchema.js`
- `src/peridotCsvNormalizer.js`
- `src/peridotCsvValidation.js`
- `src/peridotColumnMapping.js`
- `src/peridotWorkbookParsing.js`
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

- standardized one-file Peridot CSV ingestion
- arbitrary CSV/TSV column mapping and mapped import
- workbook parsing helper for the planned Excel path
- database-first handling of messy/incomplete historical records
- graph derivation
- interactive SVG-based rendering
- year-based timeline filtering and playback
- shared side-panel inspection workflow
- persistent side-panel icon rail with dedicated Controls, Data Inputs, Search & Filter, Export, Timeline, Analytics, and Inspector tabs
- implemented Search & Filter consolidation defining one active filtered dataset for map, Inspector, Analytics, Timeline, and Export workflows
- theme presets and visual controls
- export tools for image and tabular outputs
- Analytics charting tools with compact previews, expanded overlay, variable controls, date-range controls, and PNG chart export

The main maintenance challenge remains structural concentration in `src/App.jsx`, but that concentration has been reduced through bounded extraction passes.

### Data input architecture

The public Data Inputs workflow now includes the Peridot template CSV path and arbitrary CSV/TSV column mapping:

```text
Peridot template CSV or arbitrary CSV/TSV
→ parsed/staged rows
→ template normalization or user-confirmed column mapping
→ schema/capability checks
→ normalized geography rows / letter metadata / person metadata / places / selected custom metadata
→ active app data
```

The current public template columns are:

```text
Archive
Collection
Page(s)
Date
Source_Name
Source_Title
Source_Location
Source_Latitude
Source_Longitude
Target_Name
Target_Title
Target_Location
Target_Latitude
Target_Longitude
Relationship
Topic
Language
Transcription
Notes
Link(s)
```

Peridot treats uploaded data as database records first. A row can be accepted if it has either:

- `Source_Name` and `Target_Name`; or
- source-side and target-side place information, using place names, coordinate pairs, or both.

Coordinates and parseable dates are capability-enabling fields, not upload-admission requirements. The validation summary reports which accepted records can support specific tools:

- Inspector-ready
- People-network-ready
- Place-network-ready
- Map-ready
- Timeline-ready
- Analytics-ready
- Export-ready

Peridot does **not** clean, standardize, merge, or enforce controlled vocabularies for person names, place names, date strings, titles, topics, relationships, languages, notes, or links. Users are responsible for standardizing values outside the app if they want cleaner networks, filters, and charts.

The legacy three-file upload path is superseded by the one-file and mapped-import workflows and has been removed from the ordinary public workflow.

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

Main orchestration file. It owns top-level state, derived data wiring, workspace composition, theme token definitions, side-panel contract building, Search & Filter state, timeline state, inspector navigation state, export wiring, and the live Data Inputs workflow. It wires template download, CSV upload parsing, arbitrary CSV/TSV mapping flow, validation summary state, normalization output, upload-source reset behavior, and modal visibility.

### `src/LeftControlPanel.jsx`

Owns the shared side-panel shell and persistent icon rail. The shell includes:

- persistent icon rail that is available when the panel is closed and when it is open
- open-state close button at the top of the rail
- rail-driven panel views for **Controls**, **Data Inputs**, **Search & Filter**, **Export**, **Timeline**, **Analytics**, and **Inspector**
- **Data Inputs** content rendering for one public Peridot CSV upload workflow, arbitrary CSV/TSV column mapping, template download, upload button, latest-upload summary, validation popup, and data tips
- legacy three-file upload workflow superseded by the one-file and mapped-import workflows
- **Search & Filter** content rendering for the compact advanced-search layout
- current applied filter scope at the top of Search & Filter
- keyword, person, place, route-place, route-people, minimum-weight, and date-range filters
- predictive suggestion menus for person, place, route-place, route-people, start-year, and end-year fields
- draft/apply filter UI with Apply Filters, Clear Filters, current applied scope, and pre-update status feedback above the action buttons
- Controls content rendering for visualization, display, theme, summary, and diagnostics controls
- Export content rendering for SVG, PNG, nodes CSV, and edges/routes CSV controls
- Timeline content rendering for year-range and playback controls
- Analytics content rendering through `AnalyticsPanelContent`
- Inspector content rendering through `InspectorPanelContent`

This file currently remains named `LeftControlPanel.jsx`, but it is now conceptually the shared side-panel shell and rail-tab host. Compatibility-sensitive `showLeftSidebar` / `showRightSidebar` state names still exist and should not be casually renamed because they are tied to inspector auto-open behavior.

### `src/peridotCsvSchema.js`

Owns the public Peridot CSV schema contract. It defines:

- exact template column names
- field groupings
- minimum record rules
- capability labels
- upload tips
- validation summary copy
- small pure helpers for values, coordinates, person-pair/place-pair checks, mappability, machine-readable dates, accepted-record status, and missing-column checks

This file records the product rule that Peridot is database-first and that missing coordinates/dates should be flagged rather than silently rejecting otherwise useful records.

### `src/peridotCsvNormalizer.js`

Owns pure conversion from public one-file template rows into the existing internal row shapes. It creates:

- internal geography rows
- internal letter/Inspector metadata rows
- lightweight exact-name person metadata rows
- map-ready places
- accepted/unsupported row groupings

It does not clean or standardize user-entered values.

### `src/peridotCsvValidation.js`

Owns pure post-upload validation summaries. It produces:

- row-level capability reports
- total uploaded rows
- accepted record counts
- unsupported row counts
- missing-column warnings
- capability counts
- popup-ready summary lines
- persistent side-panel latest-upload summary text

### `src/PeridotColumnMappingModal.jsx`

Owns the large column-mapping workspace for arbitrary CSV/TSV imports. It presents Peridot core fields, source-column selections, user-confirmed mappings, and optional custom metadata selection for Inspector/Analytics use.

### `src/peridotColumnMapping.js`

Owns helper logic for arbitrary table column mapping, including common-name suggestions, core-field mapping rules, and selected custom metadata handling. Core Peridot fields remain limited to Date, source/target person names, source/target place names, and source/target coordinates; other mapped columns are treated as optional metadata rather than graph-driving core fields.

### `src/peridotWorkbookParsing.js`

Owns workbook parsing helper logic for the planned Excel import path. Treat this as a helper boundary and verify current UI wiring before assuming full Excel import behavior in a future pass.

### `src/AnalyticsPanel.jsx`

Owns the Analytics panel UI. It renders chart selection, chart descriptions/example questions, variable controls, Analytics-local date-range controls, compact chart preview, expanded chart overlay trigger, and chart PNG export action.

The expanded chart view is rendered through a React portal and overlays the map area without changing map state. Its current visual treatment uses a dark green translucent backdrop (`#182c25` at 70% opacity), cool off-white text/borders, the existing blurred-map effect behind the overlay, and a white/cream chart card.

### `src/analyticsConfig.js`

Owns Analytics chart configuration, including chart labels/descriptions, example research questions, default Analytics state, top-N display options, curated variable definitions, and **Route (Place)** / **Route (Person)** definitions.

### `src/analyticsDerivationHelpers.js`

Owns Analytics data derivation, including available variable detection, conservative filtering of dynamic metadata fields, time-period bucketing for date-range charts, chart data construction, and semantic alias handling for curated fields such as Language and Relationship.

Dynamic variable detection should exclude technical or non-categorical fields such as IDs, latitude/longitude fields, date fields, mappability flags, object/array values, purely numeric values, long note-like fields, and near-unique row identifiers.

### `src/analyticsChartComponents.jsx`

Owns SVG chart rendering and shared chart hover tooltip styling for Bar Chart, Grouped Bar Chart, Stacked Bar Chart, Line Chart, Multi-Line Chart, Histogram, Pie Chart, Sunburst Chart, and Heatmap.

The shared chart tooltip uses a mossy/title-green background with light text for legibility over dense charts such as heatmaps.

### `src/InspectorPanel.jsx`

Owns inspector content only. It no longer owns the outer panel shell. It renders the inspector header, inspector-internal Back button, and `InspectorBodyRouter`.

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

Pure interaction-resolution and selection-building helpers. This file owns helper logic for nearby candidate generation, selection resolution, cluster selection payload building, connected-correspondent ordering, `person-detail` / `place-detail` payload derivation, and person-detail sent/received place-section derivation.

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

### Data Inputs capabilities

- primary one-file Peridot CSV upload workflow
- arbitrary CSV/TSV column-mapping workflow
- downloadable CSV template
- database-first permissive upload model
- upload validation popup
- persistent latest-upload summary in the side panel
- concise data tips explaining row granularity, incomplete data, coordinates, and user responsibility for standardization
- legacy three-file public upload workflow superseded by one-file and mapped-import workflows

### Search & Filter capabilities

- dedicated Search & Filter rail tab
- draft/apply global filtering model
- **Apply Filters** commits all filter changes together
- **Clear Filters** clears keyword/person/place/route fields, restores minimum weight to `1`, restores the full date range, and resets playback
- status feedback appears before expensive filter recomputation begins
- current applied filter scope is displayed at the top of the panel
- compact advanced-search criteria form modeled on database/library advanced-search interfaces
- text filters include keyword search, person filter, place filter, **Route Filter (Place)**, and **Route Filter (People)**
- non-text filters include minimum correspondence weight and date range
- predictive suggestions are available for person, place, route-place, route-people, start year, and end year
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
- higher-contrast shared chart hover tooltips
- expanded chart overlay over the map area with dark green translucent backdrop, cool off-white text/borders, preserved blur, and white/cream chart card
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

Autocomplete/predictive suggestions are implemented for person, place, source-place → target-place routes, and source-person → target-person routes.

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

---

## Data Inputs contract

The dedicated **Data Inputs** tab is now the public owner of the standardized Peridot CSV workflow.

### Core model

```text
template CSV
→ parsed uploaded rows
→ validation/capability summary
→ normalized app data
→ active data source
```

### Current responsibilities

- Provide a downloadable Peridot CSV template.
- Provide one primary completed-CSV upload control.
- Present upload feedback in a popup immediately after upload.
- Keep the latest upload summary visible in the Data Inputs panel after the popup closes.
- Explain that incomplete records may still be preserved even if they are not compatible with every visualization.
- Keep the ordinary public data-entry path focused on one-file template upload plus mapped arbitrary-table import.

### Implementation cautions

Data Inputs is now a fragile data-ingestion boundary. Future changes should explicitly test:

- template download works;
- uploading a valid template CSV updates the app data;
- upload summary popup appears;
- closing the popup does not erase the persistent side-panel summary;
- rows lacking coordinates are not silently discarded if otherwise accepted;
- rows lacking parseable dates are not silently discarded if otherwise accepted;
- Inspector still opens after upload;
- Search & Filter resets or remains coherent after upload;
- Timeline playback does not use stale date scope after upload;
- Analytics receives the intended uploaded/filtered rows;
- Export still labels and exports the intended data scope.

Do not reintroduce the legacy three-file workflow unless there is a specific recovery or compatibility reason. The active public direction is one-file template upload plus mapped arbitrary-table import.

---

## Current theme and panel state

The default full-app theme remains **Peridot-inspired**.

Other retained presets still function as map-focused alternatives:

- Early modern map
- Modern map

Important current side-panel state:

- the persistent rail, not a horizontal top-tab row, is now the panel-view switcher
- rail tabs are currently:
  1. **Controls** — Visualization Type, Display Controls, Theme, Summary and Diagnostics, and remaining general options
  2. **Data Inputs** — Peridot CSV template download, one-file upload, validation popup, persistent latest-upload summary, and data tips
  3. **Search & Filter** — compact advanced-search form, current applied scope, active-dataset filters, predictive suggestions, Apply Filters, Clear Filters, and filter status feedback
  4. **Export** — SVG, PNG, nodes CSV, and edges/routes CSV export controls
  5. **Timeline** — year-range filtering and playback controls
  6. **Analytics** — chart selection, chart configuration, expanded chart overlay, and chart PNG export
  7. **Inspector** — selected nodes, edges, clusters, linked records, and inspector-internal navigation
- the open-state rail has a mossy/peridot background, lighter green inactive buttons, lighter hover states, and cream active-state buttons

Recent committed behavior includes:

- direct view buttons for **People**, **Place**, and **Force-Directed**
- **People** as the default startup view
- compact Search & Filter advanced-search layout with current applied scope at the top and predictive year inputs
- Search & Filter draft/apply model for keyword, person, place, route-place, route-people, minimum-weight, and date-range controls
- higher-contrast Analytics tooltips and expanded chart backdrop styling
- standardized single-CSV Data Inputs workflow
- persistent upload summary card after popup close
- removal of the old **Show all dates** shortcut
- year-only timeline selectors
- removal of the old horizontal Controls / Inspector top tabs
- dedicated rail tabs for Data Inputs, Search & Filter, Export, Timeline, and Analytics

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
- Data Inputs upload state, one-file CSV normalization, arbitrary table mapping, workbook parsing helper, and validation summary behavior
- shared side-panel shell and inspector-open interactions
- cluster grouping and cluster inspector navigation
- Analytics expanded overlay positioning and backdrop contrast above the map area
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
- current documented baseline: **`4d11cb3` — `Add Peridot workbook parsing helper`**

A future chat should also be told that:

- the app identity is **Peridot**
- the fixed basemap is `countries50m`
- itch.io packaging support is already committed
- the current shared side panel and rail-tab structure are committed
- `InspectorPanel.jsx` is content-only
- `LeftControlPanel.jsx` owns the shared panel shell, persistent rail, and Controls/Data Inputs/Search & Filter/Export/Timeline/Analytics/Inspector panel views
- `peridotCsvSchema.js`, `peridotCsvNormalizer.js`, `peridotCsvValidation.js`, `peridotColumnMapping.js`, `PeridotColumnMappingModal.jsx`, and `peridotWorkbookParsing.js` own the current template upload, arbitrary table mapping, validation, and workbook-helper boundaries
- current cluster features are committed, not deferred
- MapLibre migrated-overlay work is paused and should not be treated as the active implementation direction
- documentation should preserve the full commit trajectory carefully in `CHANGELOG.md`
- the implemented Search & Filter panel consolidates global filtering and defines the active filtered dataset before Analytics, Timeline, Inspector, and Export consume it
- Search & Filter currently uses a compact advanced-search layout with current applied scope at the top
- Data Inputs currently uses a one-file Peridot CSV workflow with a downloadable template, validation popup, and persistent upload summary
- Analytics currently uses higher-contrast tooltips and a dark green translucent expanded-view backdrop
