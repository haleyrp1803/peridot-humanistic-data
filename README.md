# Peridot (Correspondence Visualizer)

## 1. Project title

**Peridot** is the current app identity for the repository **Correspondence Visualizer**. It is a research-oriented interactive web app for exploring historical correspondence networks as geographic route maps, person-centered relationship graphs, and force-directed person networks.

---

## 2. One-paragraph summary

The application ingests correspondence-related tabular data, derives network structures from that data, and renders an interactive visualization workspace with filtering, inspection, timeline controls, playback, theme customization, Analytics charting, and export tools. The current app includes a shared left-side panel with a persistent icon rail, dedicated panel tabs for Controls, Data Inputs, Search & Filter, Export, Timeline, Analytics, and Inspector, a standardized single-CSV upload workflow with a downloadable template and validation summary, an arbitrary CSV/TSV/Excel workbook-mapping workflow, actionable cluster inspection, dynamic node sizing, volume-based zoom-responsive cluster sizing, year-based timeline controls, compact and expanded chart views, and image/tabular export tools.

---

## 3. Current status

This repository represents an **active prototype / research tool in ongoing development**.

The current documented safe baseline is:

- **`0f72182` — `Remove redundant Inspector correspondents summary row`** on branch **`main`**

This baseline records the active legacy D3/SVG Peridot path after the Search & Filter implementation/layout milestone, Analytics visual-polish sequence, and the standardized one-file Peridot CSV upload workflow, arbitrary CSV/TSV column mapping/import, full workbook import support, and Inspector profile/navigation refinement. Early MapLibre preview files remain present but dormant unless the development-only `?maplibrePreview=1` URL flag is used. The later, more ambitious MapLibre migrated-overlay work has been set aside on its separate branch and should not be treated as the active production direction unless explicitly resumed.

The current state of the active `main` project includes:

- working geographic and person-network visualization modes
- direct view-selection buttons for:
  - **People**
  - **Place**
  - **Force-Directed**
- **People** as the default startup view
- year-based timeline filtering and playback infrastructure
- a shared left-side panel with a persistent rail for Controls, Data Inputs, Search & Filter, Export, Timeline, Analytics, and Inspector
- a standardized one-file **Peridot CSV** upload workflow in Data Inputs
- a downloadable CSV template using the current public Peridot column names
- an arbitrary CSV/TSV column-mapping workflow for non-template tables
- workbook import support for `.xlsx` and `.xls` files
- multi-sheet workbook mapping with user-configured unique-ID joins
- upload validation that reports which records are Inspector-ready, People-network-ready, Place-network-ready, Map-ready, Timeline-ready, Analytics-ready, and Export-ready
- a validation popup plus a persistent latest-upload summary in the Data Inputs panel
- legacy Geography / Raw Data / Person Metadata upload controls removed from the ordinary public workflow after the one-file and mapped-import direction became active
- implemented Search & Filter controls for keyword, person, place, route-place, route-people, minimum weight, and date range
- actionable cluster inspector behavior
- cluster inspector members grouped by place
- dynamic node radius contrast based on active data
- volume-based zoom-responsive cluster sizing
- theme preset support and map-stage overlays
- export tooling for both images and tabular data
- an Analytics side-panel tab with compact chart previews, expanded chart overlay, PNG chart export, dynamic variable controls, and multiple chart types
- a true pre-settled **force-directed person-network layout** backed by `d3-force`
- a **geographic-anchor person layout** that places correspondents by mappable location
- inspector-internal navigation between people, places, and linked-letter detail pages
- rich person/place profile summaries with related people, related places, directed routes, linked-letter counts, and selected uploaded fields
- a working inspector **Back** button for internal navigation

The codebase is functional, but it is still under active maintenance. The largest remaining structural issue is that important orchestration logic still lives in `src/App.jsx`, even though panel, inspector, map, timeline, interaction, export, Analytics, and upload-schema logic have been substantially extracted.

---

## 4. Key features

### Visualization modes

- **Place** view for mapping correspondence routes between places
- **People** view for exploring correspondence as a network of people anchored to geography
- **Force-Directed** person layout using a pre-settled `d3-force` simulation

### Data interaction

- standardized one-file **Peridot CSV** upload workflow
- arbitrary CSV/TSV column mapping for non-template uploaded tables
- downloadable Peridot CSV template from the Data Inputs panel
- permissive database-first ingestion model: accepted rows can remain useful even when they cannot support every visualization
- post-upload validation popup and persistent latest-upload summary
- embedded baseline data so the app can render before uploads
- derived node, edge, cluster, and timeline structures based on uploaded or embedded data
- legacy three-file upload workflow removed from the ordinary public data-entry path

### Research workflow tools

- hover and click inspection
- shared side-panel Inspector tab for selected nodes, edges, clusters, and linked records
- dedicated side-panel tabs for Data Inputs, Search & Filter, Export, Timeline, and Analytics workflows
- implemented Search & Filter workflow defining one active filtered dataset for map, Inspector, Timeline, Analytics, and Export
- inspector-internal navigation between people and places
- actionable cluster inspector lists
- cluster members grouped by place and ordered by represented visible volume
- connected-correspondent navigation ordered by relationship weight
- person-detail place sections for:
  - **Places this person sent letters to**
  - **Places where this person received letters**
- inspector **Back** button for returning to the previous internal panel
- year-based timeline range filtering
- playback controls for chronological exploration
- map legend, title bar, and floating control overlays

### Analytics tools

- dedicated **Analytics** side-panel tab
- chart picker with:
  - **Bar Chart**
  - **Grouped Bar Chart**
  - **Stacked Bar Chart**
  - **Line Chart**
  - **Multi-Line Chart**
  - **Histogram**
  - **Pie Chart**
  - **Sunburst Chart**
  - **Heatmap**
- chart-specific descriptions and example research questions
- chart-specific variable controls derived from curated Peridot fields and usable categorical metadata in the current rows
- explicit **Route (Place)** and **Route (Person)** variables
- Analytics-local date-range controls for time-based charts
- automatic period granularity for time charts:
  - more than 5 years = yearly
  - 5 years or less = half-year periods
  - 3 years or less = quarter periods
  - 1 year or less = monthly periods
- compact chart preview inside the side panel
- expanded chart overlay over the map area, with an X close button
- PNG export for chart previews

### Visual encoding

- dynamic node sizing with stronger contrast for high-volume nodes
- volume-based cluster sizing
- zoom-responsive cluster grouping for nearby people/places
- edge sizing preserved independently from node and cluster sizing

### Visual customization

- theme token system with presets
- map and interface chroming controlled primarily through theme values rather than a large global stylesheet
- mode-sensitive stage rendering so the **Force-Directed** view uses a clean themed background while geographic modes retain the map backdrop

### Export tools

- export current visualization state as **SVG**
- render SVG export to **PNG**
- export derived **nodes CSV**
- export derived **edges/routes CSV**
- export Analytics chart previews as **PNG**

---

## 5. Current interface notes

The current interface includes:

- a shared left-side panel shell owned by `src/LeftControlPanel.jsx`
- a persistent icon rail that remains available when the panel is closed and when it is open
- a close button at the top of the icon rail when the panel is open
- a mossy/peridot-toned rail background with lighter green buttons, lighter hover states, and cream active-state styling
- rail-driven panel tabs for:
  - **Controls** — general visualization, display, theme, summary, and diagnostics controls
  - **Data Inputs** — standardized Peridot CSV template download, one-file CSV upload, validation popup, persistent latest-upload summary, and data tips
  - **Search & Filter** — global active-dataset filters with draft/apply behavior
  - **Export** — SVG, PNG, nodes CSV, and edges/routes CSV export controls
  - **Timeline** — year-range filtering and playback controls
  - **Analytics** — compact charting, chart configuration, expanded chart overlay, and PNG chart export
  - **Inspector** — selected nodes, edges, clusters, linked records, and internal navigation

Other current behavior:

- the app opens in **People** view by default
- the old minimum-weight slider has been replaced by a committed numeric input and then moved into Search & Filter
- the old **Show all dates** shortcut has been removed
- the timeline now uses **year-only** start/end selectors rather than month selectors
- the old horizontal Controls / Inspector top tab row has been removed; the persistent rail now functions as the panel-view switcher
- the legacy three-file upload workflow is superseded by the one-file and mapped-import workflows

---

## 6. Screenshots

The screenshots in `docs/images/` may need refresh because the side-panel architecture, Search & Filter layout, Analytics overlay, Data Inputs workflow, and cluster inspector behavior have changed materially since the earlier documentation baseline.

Existing screenshot references:

### Geographic view overview

![Geographic view overview](docs/images/geographic-view-overview.png)

### Person view overview

![Person view overview](docs/images/person-view-overview.png)

### Timeline and playback controls

![Timeline and playback controls](docs/images/timeline-playback.png)

### Inspector detail view

![Inspector detail view](docs/images/person-network-inspector.png)

### Geographic inspector example

![Geographic inspector example](docs/images/geographic-inspector.png)

### Control panel overview

![Control panel overview](docs/images/control-panel-overview.png)

### Additional control panel state

![Additional control panel state](docs/images/control-panel-secondary.png)

### Modern theme examples

![Modern theme example 1](docs/images/modern-theme-1.png)

![Modern theme example 2](docs/images/modern-theme-2.png)

---

## 7. Tech stack

This project currently uses:

- **React 18** for UI composition and stateful interaction
- **Vite** for development/build tooling
- **Tailwind CSS** for utility-driven styling
- **d3-geo** for projection and map geometry work
- **d3-force** for pre-settled force-directed person-network layout
- **topojson-client** for geographic feature handling
- **world-atlas** for world basemap data
- **xlsx / SheetJS** for client-side Excel workbook parsing

The normal production map-stage rendering logic is SVG-based, with exported SVG optionally rasterized to PNG during export workflows.

Early MapLibre preview code may still exist in the repository because `main` includes the gated preview prototype at `10051c0`. That code is dormant in ordinary use and is not the current production map direction.

---

## 8. Project structure

The current `src/` structure is:

```text
src/
  analyticsChartComponents.jsx
  analyticsConfig.js
  analyticsDerivationHelpers.js
  AnalyticsPanel.jsx
  App.jsx
  exportHelpers.js
  index.css
  InspectorBackButton.jsx
  InspectorBodyRouter.jsx
  InspectorClusterView.jsx
  InspectorConnectedCorrespondents.jsx
  InspectorEdgeView.jsx
  InspectorEmptyState.jsx
  InspectorNodeView.jsx
  InspectorPanel.jsx
  InspectorPersonPlaces.jsx
  interactionHelpers.js
  LeftControlPanel.jsx
  main.jsx
  PeridotColumnMappingModal.jsx
  mapInteractionHandlers.js
  mapLayoutHelpers.js
  MapLibreMapStage.jsx          # dormant gated preview path on this branch
  mapStageComponents.jsx
  mapStyleConfig.js             # dormant MapLibre preview style config
  peridotCsvNormalizer.js
  peridotCsvSchema.js
  peridotCsvValidation.js
  peridotColumnMapping.js
  peridotWorkbookMapping.js
  peridotWorkbookParsing.js
  personForceLayoutHelpers.js
  timelinePlaybackComponents.jsx
  timelinePlaybackHelpers.js
```

### Module overview

#### `src/main.jsx`

Bootstraps the React application.

#### `src/index.css`

Contains the minimal global layer for Tailwind directives, layout rules, and base font settings.

#### `src/App.jsx`

The main orchestration layer. It handles top-level application state, data ingestion and normalization, graph derivation, theme token logic, timeline state, inspector state, shared side-panel state, Search & Filter state, Peridot CSV upload wiring, validation summary state, and workspace composition.

#### `src/LeftControlPanel.jsx`

Owns the shared side-panel shell and persistent icon rail. It renders the rail-driven panel views for Controls, Data Inputs, Search & Filter, Export, Timeline, Analytics, and Inspector. The Data Inputs tab now presents the single-file Peridot CSV workflow plus arbitrary CSV/TSV column mapping; the legacy three-file workflow is no longer the ordinary public path.

#### `src/PeridotColumnMappingModal.jsx`

Large column/workbook-mapping workspace for arbitrary CSV/TSV/Excel imports. It lets users map uploaded source columns to Peridot core fields, configure multi-sheet workbook joins by unique ID, and choose additional custom fields from primary and joined sheets for Inspector/Analytics use.

#### `src/peridotColumnMapping.js`

Column-mapping helper module for arbitrary uploaded tables. It supports suggested mappings, core-field mapping rules, and preservation of user-selected custom metadata fields.

#### `src/peridotWorkbookMapping.js`

Workbook-aware mapping helper for primary record sheet selection, sheet/column references, arbitrary unique-ID joins across multiple sheets, workbook mapping validation, multi-sheet row assembly, and selected custom Inspector field handling.

#### `src/peridotWorkbookParsing.js`

Workbook parsing helper for CSV, TSV, XLSX, and XLS input. It isolates the `xlsx` dependency, parses all workbook sheets, ignores formatting/merged-cell styling, reads saved/displayed values only, and produces a shared workbook model for mapping.

#### `src/peridotCsvSchema.js`

Defines the public Peridot CSV template columns, field groupings, minimum record rules, row capability labels, upload tips, and small capability helpers. It records the database-first data policy and the decision not to clean or standardize user-entered values inside Peridot.

#### `src/peridotCsvNormalizer.js`

Normalizes parsed rows from the public one-file Peridot CSV template into the existing internal geography, letter metadata, person metadata, and place shapes used by the legacy app pipeline.

#### `src/peridotCsvValidation.js`

Builds upload validation summaries and row-capability reports for the post-upload popup and the persistent Data Inputs latest-upload summary.

#### `src/AnalyticsPanel.jsx`

Analytics panel UI boundary. It owns the chart picker, chart configuration controls, Analytics-local date-range controls, PNG chart export action, compact preview region, and expanded chart overlay trigger.

#### `src/analyticsConfig.js`

Analytics configuration module. It defines chart metadata, chart labels, descriptions, example questions, default Analytics state, top-N display options, curated variable definitions, and the explicit **Route (Place)** / **Route (Person)** variable distinction.

#### `src/analyticsDerivationHelpers.js`

Analytics data-derivation module. It derives available variable options from current row data, filters unsuitable dynamic metadata fields, builds chart data, handles time-period bucketing, and prepares chart-specific data structures.

#### `src/analyticsChartComponents.jsx`

SVG chart-rendering module for the Analytics panel. It renders compact and expanded chart previews for bar, grouped bar, stacked bar, line, multi-line, histogram, pie, sunburst, and heatmap chart types.

#### `src/InspectorPanel.jsx`

Inspector content boundary. It renders the inspector header, Back button, and body router inside the shared side-panel shell.

#### `src/InspectorBodyRouter.jsx`

Routes inspector state to the appropriate extracted inspector view.

#### `src/InspectorEmptyState.jsx`

Empty inspector state view.

#### `src/InspectorClusterView.jsx`

Cluster inspector view. Current behavior groups contained cluster members by place and sorts by visible represented volume.

#### `src/InspectorEdgeView.jsx`

Edge inspector view boundary.

#### `src/InspectorNodeView.jsx`

Node / person-detail / place-detail inspector view boundary.

#### `src/mapLayoutHelpers.js`

Pure helper logic for viewport construction, clustering, cluster radius calculation, label visibility, and geometric calculations.

#### `src/interactionHelpers.js`

Selection and inspection logic, including nearby candidate generation, selection resolution, cluster selection payload derivation, person-detail/place-detail payload derivation, weighted connected-correspondent ordering, and person-detail place-section derivation.

#### `src/mapInteractionHandlers.js`

Centralized map interaction handler factory for hover/click/selection behavior.

#### `src/timelinePlaybackHelpers.js`

Pure timeline/playback derivation helpers.

#### `src/timelinePlaybackComponents.jsx`

Timeline/playback UI boundary.

#### `src/mapStageComponents.jsx`

Map-stage-adjacent UI/chrome components.

#### `src/MapLibreMapStage.jsx`

Dormant development-only MapLibre preview stage inherited from `main` at `10051c0`. It should not be used as the active production map path unless work explicitly resumes on MapLibre.

#### `src/mapStyleConfig.js`

Dormant MapLibre preview style configuration used only by the gated MapLibre prototype path.

#### `src/exportHelpers.js`

Export subsystem utilities for CSV, SVG, and PNG output.

#### `src/personForceLayoutHelpers.js`

Pure helper logic for the pre-settled force-directed person-network layout.

#### `src/InspectorConnectedCorrespondents.jsx`

Inspector navigation component for person-to-person navigation, showing correspondents ordered by relationship weight and labeled by letter count.

#### `src/InspectorPersonPlaces.jsx`

Inspector navigation component for person-to-place navigation.

#### `src/InspectorBackButton.jsx`

Inspector-internal Back button component for returning to the previous internal inspector panel.

---

## 9. Installation and development

### Prerequisites

You should have a recent version of:

- **Node.js**
- **npm**

### Install dependencies

```bash
npm install
```

### Start the development server

```bash
npm run dev
```

### Build for production

```bash
npm run build
```

### Preview the production build

```bash
npm run preview
```

### Repository location

```text
https://github.com/haleyrp1803/correspondence-visualizer
```

---

## 10. Data inputs

Peridot now treats uploaded data through a standardized one-file CSV workflow, arbitrary CSV/TSV mapping, and workbook-aware Excel mapping/import.

The Data Inputs tab provides:

- **Download CSV template**
- **Upload completed CSV**
- arbitrary CSV/TSV/Excel upload staging and column/workbook mapping
- a post-upload validation popup
- a persistent **Latest upload summary** card
- concise data tips

Each row should represent one letter, document, or correspondence record. The public template columns are:

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

Peridot uses a permissive database-first model. A row can be accepted if it has either:

- `Source_Name` and `Target_Name`, or
- source-side and target-side place information, using place names, coordinate pairs, or both.

Coordinates and dates are not required for upload. Instead, the upload summary tells the user which rows can support which tools:

- Inspector-ready
- People-network-ready
- Place-network-ready
- Map-ready
- Timeline-ready
- Analytics-ready
- Export-ready

Peridot does **not** clean or standardize person names, place names, dates, topics, relationships, languages, titles, or other user-entered values. Charts, filters, and labels use uploaded values exactly as entered. Users who want cleaner networks or less fragmented Analytics categories should standardize their data before upload.

Legacy Geography / Raw Data / Person Metadata uploads have been removed from the ordinary public workflow. The active direction is one-file template upload plus mapped arbitrary-table/workbook import.


### Workbook / Excel import

For `.xlsx` and `.xls` files, Peridot now supports a workbook-aware import path:

- upload workbook;
- review workbook/sheet summary;
- choose a primary record sheet;
- choose a primary unique-ID column;
- add one or more joined sheets;
- choose the primary-sheet ID column and joined-sheet ID column for each join;
- map the nine core Peridot variables from any available sheet in the row context;
- choose custom Inspector/Analytics fields from the primary and joined sheets;
- confirm import to assemble Peridot rows from the configured unique-ID joins.

Header names for unique IDs do not have to match. The user-selected join configuration is authoritative. Person and place names remain exact-match keys; variants such as `Rome` / `Roma` or `Florence` / `Firenze` are treated as distinct unless standardized before upload.

---

## 11. How to use the app

A typical workflow is:

1. Open the app.
2. Work from the embedded baseline data or open **Data Inputs**.
3. Download the Peridot CSV template if needed.
4. Fill one row per letter, document, or correspondence record.
5. Upload the completed Peridot CSV, or upload a CSV/TSV/XLSX/XLS file and use the mapping workspace.
6. For workbooks, configure the primary sheet, unique-ID joins, core field mappings, and selected Inspector fields.
7. Review the upload validation popup and the persistent **Latest upload summary** in Data Inputs.
8. Choose **People**, **Place**, or **Force-Directed**.
9. Use **Search & Filter** to define the active filtered dataset.
10. Use **Timeline** for year-based filtering and playback.
11. Hover or click nodes, edges, or clusters to inspect them.
12. Use **Inspector** to navigate between people, places, cluster members, and linked records.
13. Use the inspector **Back** button to return to the previous internal panel.
14. Use **Analytics** to generate compact charts from the current filtered data, expand a chart over the map area, and export chart previews as PNG files.
15. Use **Export** to save the current visualization state as SVG, PNG, or CSV outputs.

### Search & Filter workflow

Search & Filter defines the active filtered dataset:

```text
data source
→ active filtered dataset
→ visualization / inspection / analytics / export
```

Under that model:

- **Data Inputs** defines which data is loaded.
- **Search & Filter** defines which records, people, places, routes, and metadata categories are in scope.
- **Controls / View** defines how the active dataset is displayed.
- **Timeline** focuses on playback and chronological navigation.
- **Analytics** charts the current filtered dataset by default.
- **Inspector** remains selection-driven.
- **Export** labels whether it is exporting loaded, filtered, visible, selected, or charted data.

Implemented Search & Filter controls include keyword, person, place, Route Filter (Place), Route Filter (People), minimum correspondence weight, date range, predictive suggestions, Apply Filters, Clear Filters, current applied scope, and pre-update status feedback.

---

## 12. MapLibre status

MapLibre work is currently paused. The active branch for continued work is **`main`**, which keeps the normal D3/SVG Peridot behavior as the working app direction.

The branch still contains early gated MapLibre preview files from `main` at `10051c0`, including `src/MapLibreMapStage.jsx` and `src/mapStyleConfig.js`. These files are dormant unless a developer explicitly opens the development URL with `?maplibrePreview=1`. Do not use the MapLibre preview flag for ordinary legacy Peridot testing.

A later experimental branch, `maplibre-native-geographic-view`, explored a fuller MapLibre migrated overlay with clusters, aggregated routes, hover feedback, and partial view-mode support. That work is intentionally set aside for now and should be treated as archived research rather than the active implementation baseline.

---

## 13. Known limitations and fragile zones

### Current structural limitation

`src/App.jsx` still contains a large amount of orchestration logic and remains the main concentration point in the codebase.

### Known fragile zones

The maintainer documentation identifies the following areas as especially sensitive:

- viewport centering/reset behavior
- dense-map hover/click interaction
- selection persistence across filters
- playback/timeline state coupling
- export rendering/state coupling
- broad orchestration work inside `src/App.jsx`
- inspector-open interactions
- shared side-panel shell behavior
- cluster grouping and cluster inspector navigation
- Search & Filter active-dataset state
- Data Inputs upload state, single-CSV normalization, workbook mapping/import assembly, and validation summary behavior
- Analytics expanded overlay positioning above the map area
- Analytics dynamic variable detection from uploaded/current row data
- Analytics SVG-to-PNG chart export rendering

### Practical implication

If you are making changes, avoid broad mixed-purpose edits. Prefer bounded passes that touch one subsystem at a time.

---

## 14. Maintainer documents

This repository includes internal maintenance and workflow documents that should be consulted before major edits:

- **`MAINTAINERS_GUIDE.md`**
- **`PROJECT_WORKFLOW_CHARTER.md`**
- **`CHANGELOG.md`**

The full commit history, through `0f72182`, is preserved in one place in **`CHANGELOG.md`**.

---

## 15. Roadmap / near-term priorities

Likely near-term priorities include:

- continue from the legacy D3/SVG Peridot path on `main`
- keep dormant MapLibre files untouched unless explicitly resuming that experiment
- test the one-file Peridot CSV workflow and workbook importer against larger and messier datasets
- refine upload validation wording if user testing shows confusion
- treat the legacy three-file upload workflow as superseded by the one-file and mapped-import workflows
- continue improving Analytics usability and data-scope clarity
- consider future safe metadata filters after the single-CSV upload model settles
- continue safe reduction of orchestration pressure inside `src/App.jsx`
- avoid renaming shared-panel compatibility props unless the inspector auto-open path is explicitly tested
- revisit responsive side-panel sizing only as a narrow-window-specific pass
- refresh screenshots after the shared side-panel, Search & Filter, Analytics, and Data Inputs UI stabilizes
- standardize visual export dimensions later if needed
- preserve full commit history in `CHANGELOG.md`

---

## 16. Author / maintainer / license

### Author / Maintainer

Repository owner: **Haley R. P.**

### License

Add the project’s chosen license here if and when one is finalized.
