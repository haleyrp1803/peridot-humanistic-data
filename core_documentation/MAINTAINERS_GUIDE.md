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

- **`55fae50` — `Update routing contract after workspace promotions`**

This baseline records the active legacy D3/SVG Peridot path after the interface redesign planning pass, workspace-state introduction, Home/Data startup workspaces, hamburger-menu replacement, full-workspace promotions for Theme, Visualizations, Export, and Search & Filter, and the routing-contract update that records the current hybrid state. Earlier milestones include standardized one-file Peridot CSV upload, arbitrary CSV/TSV mapping, workbook/Excel import support, and Inspector person/place profile refinements.

Preceding data-input milestones include:

- **`9c8971b` — `Display custom Inspector fields in linked letters`**
- **`5f25322` — `Select custom Inspector fields from joined workbook sheets`**
- **`964ce57` — `Import multi-sheet workbooks by unique ID joins`**
- **`ac31c38` — `Configure workbook sheet joins by unique ID`**
- **`77b1575` — `Preview multi-sheet workbook mapping`**
- **`d270c9d` — `Import mapped arbitrary CSV and TSV data`**
- **`a058730` — `Add Peridot column mapping workspace`**
- **`cbc35d0` — `Add single Peridot CSV upload workflow`**

Recent interface-routing milestones include:

- **`55fae50` — `Update routing contract after workspace promotions`**
- **`82178c5` — `Promote Search to full workspace`**
- **`2c53796` — `Promote Export to full workspace`**
- **`8fc96b3` — `Extract Peridot workspace config`**
- **`25fc046` — `Extract Peridot visualizations workspace`**
- **`fcf6bb6` — `Extract Peridot data workspace`**
- **`9428766` — `Extract Peridot theme workspace`**
- **`18c2912` — `Extract Peridot home workspace`**
- **`6c16403` — `Extract Peridot hamburger menu`**
- **`30b114b` — `Add Peridot routing contract audit`**
- **`b42f6fd` — `Add Peridot interface redesign plan`**

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

Current workspace / routing boundaries in `src/`:

- `src/peridotWorkspaceConfig.js`
- `src/PeridotHamburgerMenu.jsx`
- `src/PeridotHomeWorkspace.jsx`
- `src/PeridotDataWorkspace.jsx`
- `src/PeridotVisualizationsWorkspace.jsx`
- `src/PeridotSearchWorkspace.jsx`
- `src/PeridotThemeWorkspace.jsx`
- `src/PeridotExportWorkspace.jsx`

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
- `src/peridotWorkbookMapping.js`
- `src/peridotWorkbookParsing.js`
- `src/MapLibreMapStage.jsx` — dormant gated preview path inherited from `main`
- `src/mapStyleConfig.js` — dormant MapLibre preview style config

Maintainer/workflow documents at repo root:

- `README.md`
- `MAINTAINERS_GUIDE.md`
- `PROJECT_WORKFLOW_CHARTER.md`
- `CHANGELOG.md`
- `PERIDOT_INTERFACE_REDESIGN_PLAN.md`
- `PERIDOT_ROUTING_CONTRACT_AUDIT.md`

## Architectural summary

Peridot is a Vite/React/Tailwind correspondence visualizer that has moved from a map-first side-panel interface toward a workspace-first multimodal exploration environment.

The current top-level interface includes:

- Home / welcome workspace
- Data workspace
- Visualizations workspace
- Search & Filter workspace
- Theme workspace
- Export workspace
- Timeline transitional side-panel bridge
- Inspector transitional side-panel bridge

The current Visualizations workspace includes:

- **Place Map**
- **People Network**
- **Force-Directed**
- **Analytics**

Internally, the app still uses the geographic/person view split plus person layout mode, but the user-facing model now groups map, network, force-directed, and chart tools together inside Visualizations.

The app includes:

- standardized one-file Peridot CSV template workflow
- arbitrary CSV/TSV column mapping and mapped import
- workbook/Excel mapping with multi-sheet unique-ID joins
- workbook/Excel parser and workbook-aware mapping/import path
- database-first handling of messy/incomplete historical records
- graph derivation
- interactive SVG-based rendering
- year-based timeline filtering and playback through the current bridge
- transitional side-panel inspection workflow
- implemented Search & Filter consolidation defining one active filtered dataset for map, Inspector, Analytics, Timeline, and Export workflows
- theme presets and visual controls in a full workspace
- export tools for image and tabular outputs in a full workspace
- Analytics charting tools embedded in Visualizations

The main maintenance challenge remains structural concentration in `src/App.jsx`, but that concentration has been reduced through bounded extraction passes.

## Current module responsibilities

### `src/App.jsx`

Main orchestration file. It owns top-level state, derived data wiring, workspace composition, theme token definitions, side-panel compatibility contract building, Search & Filter state, timeline state, inspector navigation state, export wiring, and the live Data workflow. It wires template download, upload parsing, arbitrary CSV/TSV/workbook mapping flow, validation summary state, normalization output, upload-source reset behavior, and modal visibility.

`App.jsx` no longer contains the inline Home, Data, Theme, Visualizations, Search, Export, or hamburger-menu UI components. Those have been extracted into dedicated `Peridot*Workspace` / menu files. It still remains the main state/orchestration boundary.

### `src/LeftControlPanel.jsx`

Legacy shared side-panel shell and compatibility host. It still contains the old rail/panel structure and legacy panel content. In the current hamburger workflow, most major workflows have moved to full workspaces; the side-panel shell remains structurally important primarily for:

- **Timeline** bridge behavior
- **Inspector** bridge behavior and auto-open interactions from map/network clicks

Do not broadly delete or rename this file’s compatibility-sensitive paths until Timeline and Inspector routing are resolved. In particular, old `showLeftSidebar` / `showRightSidebar` naming may still preserve Inspector auto-open behavior even though the names are semantically stale.


### `src/peridotWorkspaceConfig.js`

Workspace-mode vocabulary and helper functions used by `App.jsx` for Home, Data, Visualizations, Search, Inspector, Timeline, Theme, and Export routing.

### `src/PeridotHamburgerMenu.jsx`

Primary visible navigation component. It renders the hamburger button and labeled menu options. It replaces the earlier persistent icon rail as the intended user-facing navigation model.

### `src/PeridotHomeWorkspace.jsx`

Full Home / welcome workspace with introductory copy, **Upload my data**, **Use sample data**, and feature summary cards.

### `src/PeridotDataWorkspace.jsx`

Full Data workspace for CSV template download, unified CSV/TSV/XLSX/XLS upload, staged table/workbook summary, mapping launch, latest-upload summary, and navigation to Visualizations.

### `src/PeridotVisualizationsWorkspace.jsx`

Full Visualizations workspace. It contains the compact Place Map / People Network / Force-Directed / Analytics selector, renders Analytics in-workspace, and wraps the live map/network stage.

### `src/PeridotSearchWorkspace.jsx`

Full Search & Filter workspace. It renders active-scope summary, keyword/person/place/route/date/weight controls, predictive suggestions, Apply Filters, Clear Filters, and navigation back to Visualizations.

### `src/PeridotThemeWorkspace.jsx`

Full Theme workspace for Peridot default, Early modern map, and Modern map presets.

### `src/PeridotExportWorkspace.jsx`

Full Export workspace for SVG, PNG, nodes CSV, and edges/routes CSV export actions. It keeps a live visualization preview mounted so SVG/PNG export can operate on the current stage.

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

Owns the large column/workbook-mapping workspace for arbitrary CSV/TSV/XLSX/XLS imports. It presents Peridot core fields, source-column selections, user-confirmed mappings, optional custom metadata selection for Inspector/Analytics use, workbook primary-sheet selection, multi-sheet unique-ID joins, workbook core mappings, and custom field selection from joined workbook sheets.

### `src/peridotColumnMapping.js`

Owns helper logic for arbitrary table column mapping, including common-name suggestions, core-field mapping rules, and selected custom metadata handling. Core Peridot fields remain limited to Date, source/target person names, source/target place names, and source/target coordinates; other mapped columns are treated as optional metadata rather than graph-driving core fields.

### `src/peridotWorkbookMapping.js`

Owns workbook-aware mapping and import assembly helpers. It models primary record sheets, sheet/column references, arbitrary unique-ID joins, workbook validation, joined-row context construction, Peridot-shaped row assembly, and selected custom Inspector field handling from primary and joined sheets.

### `src/peridotWorkbookParsing.js`

Owns workbook parsing helper logic for CSV, TSV, XLSX, and XLS inputs. It isolates the `xlsx` dependency, parses all sheets into a shared workbook model, ignores formatting/merged-cell styling, and reads saved/displayed cell values only.

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

Owns the node / person-detail / place-detail inspector boundary. It now renders richer person/place profile summaries, role-grouped related people/places, directed route summaries, selected user-uploaded fields, and linked-record navigation entry points.

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

### Workspace routing

- app opens to the Home workspace
- hamburger menu is the primary visible navigation surface
- full workspaces exist for Home, Data, Visualizations, Search & Filter, Theme, and Export
- Timeline remains on a transitional side-panel bridge
- Inspector remains on a transitional side-panel bridge and auto-opens from node/edge/cluster interactions
- Timeline should eventually become a bottom timeline/scrubber integrated with Visualizations, not a standalone full workspace
- Inspector should eventually become a full evidence-dossier workspace after a dedicated design contract

### Visualization modes

- Place Map view
- People Network view
- Force-Directed view
- Analytics inside Visualizations

### Person-network layouts

- geographic-anchor layout
- pre-settled force-directed layout

### Side-panel capabilities

- legacy shared side-panel shell remains available for Timeline and Inspector bridge behavior
- Inspector auto-opens from node, edge, and cluster interactions
- legacy rail/Controls/Data/Search/Export/Analytics code may still exist in `LeftControlPanel.jsx`, but it is no longer the intended primary user-facing navigation path for workflows already promoted to full workspaces

### Data capabilities

- full Data workspace
- unified CSV / TSV / XLSX / XLS upload path
- downloadable Peridot CSV template
- arbitrary CSV/TSV column-mapping workflow
- XLSX/XLS workbook staging, mapping, unique-ID joins, and import assembly
- database-first permissive upload model
- upload validation popup
- persistent latest-upload summary
- concise data tips explaining row granularity, incomplete data, coordinates, and user responsibility for standardization
- legacy three-file public upload workflow superseded by one-file and mapped-import workflows

### Search & Filter capabilities

- full Search & Filter workspace
- draft/apply global filtering model
- **Apply Filters** commits all filter changes together
- **Clear Filters** clears keyword/person/place/route fields, restores minimum weight to `1`, restores the full date range, and resets playback
- status feedback appears before expensive filter recomputation begins
- current applied filter scope is displayed at the top of the workspace
- compact advanced-search criteria form modeled on database/library advanced-search interfaces
- text filters include keyword search, person filter, place filter, **Route Filter (Place)**, and **Route Filter (People)**
- non-text filters include minimum correspondence weight and date range
- predictive suggestions are available for person, place, route-place, route-people, start year, and end year
- suggestion menus show after at least two typed characters, show about five suggestions at once, and scroll for more matches
- selecting a suggestion fills a draft field only; the map/network updates only after **Apply Filters**

### Inspector capabilities

- hover and click inspection
- linked records browsing
- dedicated linked-letter detail pages inside Inspector
- internal navigation between people, places, and linked letters
- Back button support for inspector-internal navigation
- actionable cluster inspector views
- cluster members grouped by place and ordered by visible volume

### Timeline capabilities

- year-based date filtering
- playback controls
- timeline currently opens through a transitional side-panel bridge
- month selectors removed in favor of start-year / end-year controls
- future target: bottom Visualizations timeline/scrubber that can toggle/scrub while users view maps, networks, or charts

### Map and sizing capabilities

- dynamic node radius contrast based on visible active data
- volume-based zoom-responsive cluster sizing
- zoom-responsive proximity clustering for nearby nodes/places
- edge sizing unchanged by recent node/cluster sizing work

### Export capabilities

- full Export workspace
- SVG export
- PNG export
- nodes CSV export
- edges/routes CSV export
- Analytics chart PNG export
- live visualization preview preserved for SVG/PNG export

### Analytics capabilities

- Analytics is now shown inside the Visualizations workspace
- chart picker with Bar, Grouped Bar, Stacked Bar, Line, Multi-Line, Histogram, Pie, Sunburst, and Heatmap chart types
- chart descriptions and example questions
- chart-specific variable controls
- curated semantic variables plus usable dynamically detected categorical metadata fields
- explicit **Route (Place)** and **Route (Person)** variables
- Analytics-local date-range controls for time-based charts
- automatic time-period granularity based on selected date range
- constrained compact preview sizing inside Visualizations
- higher-contrast shared chart hover tooltips
- expanded chart overlay with dark green translucent backdrop, cool off-white text/borders, preserved blur, and white/cream chart card
- PNG chart export

## Workbook import contract

Peridot supports `.csv`, `.tsv`, `.xlsx`, and `.xls` imports through the Data Inputs workflow.

For workbook imports:

- CSV/TSV files are represented internally as one-sheet workbooks.
- Excel workbooks expose all usable sheets.
- Users choose a primary record sheet.
- Users can add multiple joined sheets.
- Users choose the primary-sheet unique-ID column and the joined-sheet unique-ID column for each join.
- Header names for unique-ID columns do not need to match.
- The user-confirmed join configuration is authoritative.
- Core Peridot fields can be mapped from any sheet available in the joined row context.
- Custom Inspector/Analytics fields can be selected from the primary and joined sheets.
- Person and place names can act as exact-match keys, but Peridot does not normalize variants.

The workbook import path should continue to avoid row-order joining as the primary strategy. If multiple sheets are assembled into letter-level records, use explicit user-confirmed unique-ID joins.

Future workbook work should explicitly test:

- upload does not freeze the app on reasonably sized workbooks;
- workbook summary appears;
- primary sheet can be changed;
- multiple joined sheets can be added;
- unique-ID match summaries update;
- core mappings can use joined-sheet columns;
- selected custom fields from joined sheets appear in linked-letter Inspector detail;
- imported rows still validate through the existing Peridot validation summary.

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
- Provide one unified CSV / TSV / XLSX / XLS table-workbook upload control.
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

## Current theme and routing state

The default full-app theme remains **Peridot-inspired**.

Other retained presets still function as map-focused alternatives:

- Early modern map
- Modern map

Current routing state:

- Home, Data, Visualizations, Search & Filter, Theme, and Export are full workspaces
- hamburger-triggered labeled menu is the intended navigation model
- the persistent rail is no longer the intended primary visible navigation surface
- Timeline remains transitional and side-panel-based for now
- Inspector remains transitional and side-panel-based for now
- the legacy shared side-panel shell should be treated as a compatibility layer until Timeline and Inspector are redesigned

Recent committed behavior includes:

- Home / welcome startup workspace
- unified Data workspace upload path for CSV / TSV / XLSX / XLS
- compact Visualizations workspace with Place Map, People Network, Force-Directed, and Analytics
- Search & Filter promoted to full workspace
- Export promoted to full workspace with live visualization preview
- Theme promoted to full workspace
- routing contract updated after workspace promotions
- Timeline deliberately deferred as a future bottom Visualizations timeline/scrubber
- Inspector deliberately deferred pending a full evidence-dossier design contract

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

- workspace routing and hamburger-menu behavior
- map viewport centering/reset behavior
- map/network viewport measurement after switching between Analytics and map/network modes
- dense map hover/click interaction
- selection persistence across filters
- timeline/playback state coupling
- export rendering/state coupling
- broad orchestration work in `src/App.jsx`
- Data upload state, one-file CSV normalization, arbitrary table mapping, workbook parsing helper, and validation summary behavior
- shared side-panel shell and inspector-open interactions
- cluster grouping and cluster inspector navigation
- Analytics expanded overlay positioning and backdrop contrast above the map area
- Analytics dynamic variable detection from uploaded/current row data
- Analytics SVG-to-PNG chart export rendering
- Search & Filter active-dataset state, especially draft/apply coordination across keyword, person, place, route-place, route-people, date, weight, Timeline, Analytics, Inspector, and Export behavior
- dormant MapLibre preview code if it is ever reactivated

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
- current documented baseline: **`55fae50` — `Update routing contract after workspace promotions`**

A future chat should also be told that:

- the app identity is **Peridot**
- the fixed basemap is `countries50m`
- itch.io packaging support is already committed
- the current hamburger/workspace structure is committed; the shared side panel remains as a transitional bridge for Timeline and Inspector
- `InspectorPanel.jsx` is content-only
- `LeftControlPanel.jsx` owns the legacy shared panel shell and transitional Timeline/Inspector bridge; Home/Data/Visualizations/Search/Theme/Export are full workspaces
- `peridotCsvSchema.js`, `peridotCsvNormalizer.js`, `peridotCsvValidation.js`, `peridotColumnMapping.js`, `PeridotColumnMappingModal.jsx`, and `peridotWorkbookParsing.js` own the current template upload, arbitrary table mapping, validation, and workbook-helper boundaries
- current cluster and Inspector profile features are committed, not deferred
- MapLibre migrated-overlay work is paused and should not be treated as the active implementation direction
- documentation should preserve the full commit trajectory carefully in `CHANGELOG.md`
- the implemented Search & Filter panel consolidates global filtering and defines the active filtered dataset before Analytics, Timeline, Inspector, and Export consume it
- Search & Filter currently uses a compact advanced-search layout with current applied scope at the top
- Data Inputs currently uses a one-file Peridot CSV workflow, arbitrary CSV/TSV mapping, workbook import with unique-ID joins, downloadable template, validation popup, and persistent upload summary
- Analytics currently uses higher-contrast tooltips and a dark green translucent expanded-view backdrop
