# Peridot (Correspondence Visualizer)

## 1. Project title

**Peridot** is the current app identity for the repository **Correspondence Visualizer**. It is a research-oriented interactive web app for exploring humanistic tabular datasets through maps, networks, timelines, charts, search/filter workflows, exports, and evidence dossiers. Correspondence networks remain the mature first case, but Peridot now also supports point/site datasets that do not require people or network relationships.

---

## 2. One-paragraph summary

The application ingests humanistic tabular data, derives the structures the mapped fields can safely support, and renders an interactive workspace for exploring records through point maps, route maps, person-centered networks, force-directed graphs, chart-based Analytics, full-window Search & Filter, theme controls, export tools, timeline playback, and evidence inspection. The current interface has moved away from the earlier map-first, persistent-rail model: Peridot now opens to a Home / welcome workspace, uses a hamburger-triggered menu, and provides full-window workspaces for Home, Data, Visualizations, Search & Filter, Theme, and Export. Timeline remains a transitional side-panel bridge for now, while Inspector now uses a dual-mode model: compact side-panel summaries for visualization clicks and a full evidence-dossier workspace for deeper navigation.

## 3. Current status

This repository represents an **active prototype / research tool in ongoing development**.

The current documented safe baseline is:

- **`e7c3b57` — `Add point-location role mapping`** on branch **`main`**

This baseline records the active legacy D3/SVG Peridot path after the workspace-routing milestone, the completed dual-mode Inspector implementation cluster, and the first implemented broader data-capability milestone. The Inspector now uses compact side-panel summaries for visualization clicks and a full evidence-dossier workspace for hamburger/Expand/linked-data navigation, sharing selection and multi-step Back history. The upload workflow now uses role-based mapping and can support point/site datasets that render in Place Map without People Network or Force-Directed readiness. Early MapLibre preview files remain present but dormant unless the development-only `?maplibrePreview=1` URL flag is used. The later, more ambitious MapLibre migrated-overlay work remains set aside on its separate branch and should not be treated as the active production direction unless explicitly resumed.

The current state of the active `main` project includes:

- a Home / welcome workspace with **Upload my data** and **Use sample data** start paths
- a hamburger-triggered menu as the primary visible navigation surface
- full-window workspaces for:
  - **Home**
  - **Data**
  - **Visualizations**
  - **Search & Filter**
  - **Theme**
  - **Export**
- transitional legacy side-panel bridge behavior for:
  - **Timeline**
- dual-mode Inspector behavior:
  - compact side-panel summaries from visualization clicks
  - full Inspector workspace from hamburger/Expand/linked-data navigation
- working geographic and person-network visualization modes
- compact Visualizations workspace selector for:
  - **Place Map**
  - **People Network**
  - **Force-Directed**
  - **Analytics**
- Analytics embedded inside the Visualizations workspace with constrained preview sizing and retained expanded chart view
- mapped imports routing users into the Visualizations workspace, defaulting to the map/geographic view
- a full-window Data workspace using one unified CSV / TSV / XLSX / XLS table-workbook uploader
- a downloadable CSV template using the current public Peridot column names
- arbitrary CSV/TSV column-mapping workflow for non-template tables
- workbook import support for `.xlsx` and `.xls` files
- multi-sheet workbook mapping with user-configured unique-ID joins
- role-based upload mapping for records, time, places, relationships, evidence/analysis, and capability review
- explicit support for single dates, start/end date intervals, display-date labels, point locations, separated coordinates, and latitude-first coordinate pairs
- point/site datasets that can render in Place Map without requiring people/network relationships
- upload validation that reports which records are Inspector-ready, Search-ready, Point-map-ready, Route-map-ready, Network-ready, Timeline-ready, Chart-ready, and Export-ready
- legacy Geography / Raw Data / Person Metadata upload controls removed from the ordinary public workflow after the one-file and mapped-import direction became active
- implemented Search & Filter controls for keyword, person, place, route-place, route-people, minimum weight, and date range, now in a full workspace
- actionable cluster inspector behavior
- cluster inspector members grouped by place
- dynamic node radius contrast based on active data
- volume-based zoom-responsive cluster sizing
- theme preset support in a full Theme workspace
- full Export workspace with live visualization preview for SVG/PNG export
- export tooling for both images and tabular data
- a true pre-settled **force-directed person-network layout** backed by `d3-force`
- a **geographic-anchor person layout** that places correspondents by mappable location
- inspector-internal navigation between people, places, routes, clusters, and linked-letter detail pages
- rich person/place profile summaries with related people, related places, directed routes, linked-letter counts, and selected uploaded fields
- compact Inspector summary tiles that open the full workspace
- linked-letter source/target people and places that open full dossiers
- directed route rows that open route/edge dossiers
- a working Inspector **Back** button for multi-step internal navigation

The codebase is functional, but it is still under active maintenance. The largest remaining structural risks are the transitional Timeline/Inspector bridge through `LeftControlPanel.jsx` and the remaining top-level orchestration responsibilities in `src/App.jsx`.

## 4. Key features

### Workspace navigation

- Home / welcome workspace with sample-data and upload-data entry points
- hamburger-triggered menu replacing the earlier persistent icon rail as the primary navigation surface
- full workspaces for Home, Data, Visualizations, Search & Filter, Theme, and Export
- transitional side-panel bridge retained for Timeline and Inspector until their redesigned models are ready

### Visualization modes

- **Place Map** view for mapping correspondence routes between places
- **People Network** view for exploring correspondence as a network of people anchored to geography
- **Force-Directed** person layout using a pre-settled `d3-force` simulation
- **Analytics** embedded in the Visualizations workspace with compact and expanded chart views

### Data interaction

- unified CSV / TSV / XLSX / XLS upload path in the Data workspace
- standardized one-file **Peridot CSV** template download
- arbitrary CSV/TSV/Excel workbook mapping for non-template uploaded tables
- workbook-aware import with primary sheet selection and multi-sheet unique-ID joins
- role-based mapping stages for record identity, time, places, relationships, evidence/analysis, and capability review
- point-location mapping for one-location-per-record datasets
- route coordinate mapping with separated latitude/longitude fields or combined latitude-first coordinate pairs
- permissive database-first ingestion model: accepted rows can remain useful even when they cannot support every visualization
- post-upload validation popup and persistent latest-upload summary
- embedded baseline data so the app can render before uploads
- derived node, edge, cluster, and timeline structures based on uploaded or embedded data
- legacy three-file upload workflow removed from the ordinary public data-entry path

### Research workflow tools

- full-window Search & Filter workspace defining one active filtered dataset for map, Inspector, Timeline, Analytics, and Export
- hover and click inspection
- compact side-panel Inspector for selected nodes, edges, clusters, and linked records, plus a full Inspector evidence-dossier workspace
- inspector-internal navigation between people and places
- dedicated linked-letter detail pages inside Inspector
- actionable cluster inspector lists
- cluster members grouped by place and ordered by represented visible volume
- connected-correspondent navigation ordered by relationship weight
- person-detail place sections for:
  - **Places this person sent letters to**
  - **Places where this person received letters**
- inspector **Back** button for returning to the previous internal panel
- year-based timeline range filtering and playback through the current transitional Timeline bridge

### Analytics tools

- **Analytics** available inside the Visualizations workspace
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
- compact chart preview inside Visualizations
- expanded chart overlay with an X close button
- PNG export for chart previews

### Visual encoding

- dynamic node sizing with stronger contrast for high-volume nodes
- volume-based cluster sizing
- zoom-responsive cluster grouping for nearby people/places
- edge sizing preserved independently from node and cluster sizing

### Visual customization

- full Theme workspace with Peridot default, Early modern map, and Modern map presets
- theme token system with presets
- map and interface chroming controlled primarily through theme values rather than a large global stylesheet
- mode-sensitive stage rendering so the **Force-Directed** view uses a clean themed background while geographic modes retain the map backdrop

### Export tools

- full Export workspace
- export current visualization state as **SVG**
- render SVG export to **PNG**
- export derived **nodes CSV**
- export derived **edges/routes CSV**
- export Analytics chart previews as **PNG**

## 5. Current interface notes

The current interface is now workspace-first rather than side-panel-first.

Current top-level navigation:

- a hamburger-triggered labeled menu, implemented in `src/PeridotHamburgerMenu.jsx`
- full-window workspaces for:
  - **Home** — landing page with upload/sample choices
  - **Data** — CSV / TSV / XLSX / XLS upload, mapping, template download, and validation summary
  - **Visualizations** — Place Map, People Network, Force-Directed, and Analytics
  - **Search & Filter** — global advanced-search/filter scope controls
  - **Theme** — appearance presets
  - **Export** — image and tabular export tools with live visualization preview
- transitional bridge workflow for:
  - **Timeline** — currently still opens through the legacy side-panel bridge
- dual-mode Inspector workflow:
  - visualization node/edge/cluster clicks open compact Inspector
  - hamburger **Inspector**, **Expand**, compact summary buttons, and linked-data clicks open the full Inspector workspace

Important current behavior:

- the app opens to the Home workspace
- **Use sample data** opens Visualizations with the embedded sample data
- **Upload my data** opens the Data workspace
- mapped imports route into Visualizations and default to the map/geographic view
- Analytics lives inside Visualizations rather than as a primary side-panel workflow
- Search & Filter and Export are full workspaces, not side-panel tabs in the current hamburger workflow
- Timeline is intentionally **not** being promoted to a full workspace; the preferred future design is a bottom timeline/scrubber integrated with Visualizations
- Inspector now uses the planned dual-mode model: compact side-panel summaries preserve click-and-glance context, while the full workspace supports evidence-dossier navigation
- the old persistent rail and Controls path may still exist in `LeftControlPanel.jsx` as compatibility/dead code, but they are no longer the intended primary user-facing navigation model

Screenshots in the repository likely need refresh because the interface has changed materially since the earlier rail/side-panel documentation baseline.

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
  MapLibreMapStage.jsx          # dormant gated preview path on this branch
  mapInteractionHandlers.js
  mapLayoutHelpers.js
  mapStageComponents.jsx
  mapStyleConfig.js             # dormant MapLibre preview style config
  PeridotColumnMappingModal.jsx
  PeridotDataWorkspace.jsx
  PeridotExportWorkspace.jsx
  PeridotHamburgerMenu.jsx
  PeridotHomeWorkspace.jsx
  PeridotSearchWorkspace.jsx
  PeridotThemeWorkspace.jsx
  PeridotVisualizationsWorkspace.jsx
  peridotColumnMapping.js
  peridotCsvNormalizer.js
  peridotCsvSchema.js
  peridotCsvValidation.js
  peridotWorkbookMapping.js
  peridotWorkbookParsing.js
  peridotWorkspaceConfig.js
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

The main orchestration layer. It handles top-level application state, data ingestion and normalization, graph derivation, theme token logic, timeline state, inspector state, Search & Filter state, export wiring, workspace composition, and compatibility routing to the remaining legacy Timeline/Inspector side-panel bridge.

#### `src/peridotWorkspaceConfig.js`

Defines the Peridot workspace-mode vocabulary and guard helpers used by `App.jsx` and workspace routing.

#### `src/PeridotHamburgerMenu.jsx`

Primary visible navigation component. It renders the hamburger button and labeled menu entries for Home, Data, Visualizations, Search & Filter, Timeline, Analytics, Inspector, Theme, and Export.

#### `src/PeridotHomeWorkspace.jsx`

Home / welcome workspace with introductory copy, **Upload my data**, **Use sample data**, and feature summary cards.

#### `src/PeridotDataWorkspace.jsx`

Full-window Data workspace for template download, unified CSV / TSV / XLSX / XLS upload, staged table/workbook summary, mapping launch, latest upload summary, and navigation to Visualizations.

#### `src/PeridotVisualizationsWorkspace.jsx`

Full-window Visualizations workspace. It hosts the compact selector for Place Map, People Network, Force-Directed, and Analytics, renders Analytics in-workspace, and wraps the current map/network stage.

#### `src/PeridotSearchWorkspace.jsx`

Full-window Search & Filter workspace. It renders the current applied scope, keyword/person/place/route filters, date and weight controls, predictive suggestions, Apply Filters, Clear Filters, and navigation back to Visualizations.

#### `src/PeridotThemeWorkspace.jsx`

Full-window Theme workspace for Peridot default, Early modern map, and Modern map presets.

#### `src/PeridotExportWorkspace.jsx`

Full-window Export workspace. It provides SVG, PNG, nodes CSV, and edges/routes CSV export actions and preserves a live visualization preview so SVG/PNG export can operate on a mounted stage.

#### `src/LeftControlPanel.jsx`

Legacy shared side-panel shell. It still supports the transitional Timeline and Inspector bridge and contains older panel/rail content for compatibility. It should not be broadly cleaned up until Timeline and Inspector routing are resolved.

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

Builds upload validation summaries and row-capability reports for the post-upload popup and the persistent latest-upload summary.

#### `src/AnalyticsPanel.jsx`

Analytics UI boundary. It owns the chart picker, chart configuration controls, Analytics-local date-range controls, PNG chart export action, compact preview region, and expanded chart overlay trigger. It is currently rendered inside the Visualizations workspace.

#### `src/analyticsConfig.js`

Analytics configuration module. It defines chart metadata, chart labels, descriptions, example questions, default Analytics state, top-N display options, curated variable definitions, and the explicit **Route (Place)** / **Route (Person)** variable distinction.

#### `src/analyticsDerivationHelpers.js`

Analytics data-derivation module. It derives available variable options from current row data, filters unsuitable dynamic metadata fields, builds chart data, handles time-period bucketing, and prepares chart-specific data structures.

#### `src/analyticsChartComponents.jsx`

SVG chart-rendering module for Analytics. It renders compact and expanded chart previews for bar, grouped bar, stacked bar, line, multi-line, histogram, pie, sunburst, and heatmap chart types.

#### `src/InspectorPanel.jsx`

Inspector content boundary. It renders the inspector header, Back button, and body router inside the transitional side-panel shell.

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

Timeline/playback UI boundary. The current Timeline bridge is year-based; the future design is a bottom Visualizations scrubber rather than a standalone workspace.

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

Peridot now treats uploaded data through a standardized one-file CSV template, arbitrary CSV/TSV mapping, workbook-aware Excel mapping/import, and a broader role-based capability model.

The Data workspace provides:

- **Download CSV template**
- unified **Upload table or workbook** control for CSV / TSV / XLSX / XLS
- staged table/workbook summary
- column/workbook mapping launch
- post-upload validation popup
- persistent **Latest upload summary** card
- concise data tips

For the standardized correspondence template, each row should represent one letter, document, or correspondence record. The public template columns are:

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

For arbitrary tables and workbooks, the mapping workflow now asks users to describe field roles rather than forcing every table into a correspondence schema. Current role groups include record identity, time, places, relationships, evidence/analysis fields, and final capability review. This allows datasets such as point/site tables to map one location per row and render in Place Map even when they have no source-target people and therefore do not populate People Network or Force-Directed views.

Coordinate-pair fields are interpreted as latitude first, longitude second, including `POINT(latitude longitude)` strings. Route datasets may use separated source/target latitude-longitude columns or combined source/target coordinate-pair columns.

Legacy Geography / Raw Data / Person Metadata uploads have been removed from the ordinary public workflow. The active direction is one-file template download plus mapped arbitrary-table/workbook import through the unified uploader.

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

## 11. How to use the app

A typical workflow is:

1. Open the app.
2. Start from the Home workspace.
3. Choose **Use sample data** or **Upload my data**.
4. If uploading data, use the Data workspace to download the template or upload a CSV/TSV/XLSX/XLS table/workbook.
5. Use the mapping workspace if the uploaded file needs column or workbook mapping.
6. Map fields by role: identify records, map time, map places, map relationships if present, choose evidence/analysis fields, and review capabilities.
7. For workbooks, configure the primary sheet, unique-ID joins, role mappings, and selected evidence/Analytics fields.
7. Review the upload validation popup and persistent latest-upload summary.
8. Open Visualizations and choose **Place Map**, **People Network**, **Force-Directed**, or **Analytics**.
9. Use **Search & Filter** to define the active filtered dataset.
10. Use the current Timeline bridge for year-based filtering and playback.
11. Hover or click nodes, edges, or clusters to inspect them.
12. Use **Inspector** to navigate between people, places, cluster members, and linked records.
13. Use the inspector **Back** button to return to the previous internal panel.
14. Use **Analytics** inside Visualizations to generate compact charts, expand a chart, and export chart previews as PNG files.
15. Use **Export** to save the current visualization state as SVG, PNG, or CSV outputs.

### Search & Filter workflow

Search & Filter defines the active filtered dataset:

```text
data source
→ active filtered dataset
→ visualization / inspection / analytics / export
```

Under that model:

- **Data** defines which data is loaded.
- **Search & Filter** defines which records, people, places, routes, and metadata categories are in scope.
- **Visualizations** defines how the active dataset is displayed or charted.
- **Timeline** currently focuses on playback and chronological navigation through the transitional side-panel bridge; the planned future design is a bottom Visualizations scrubber.
- **Analytics** charts the current filtered dataset by default inside Visualizations.
- **Inspector** remains selection-driven.
- **Export** labels whether it is exporting loaded, filtered, visible, selected, or charted data.

Implemented Search & Filter controls include keyword, person, place, Route Filter (Place), Route Filter (People), minimum correspondence weight, date range, predictive suggestions, Apply Filters, Clear Filters, current applied scope, and pre-update status feedback.

## 12. MapLibre status

MapLibre work is currently paused. The active branch for continued work is **`main`**, which keeps the normal D3/SVG Peridot behavior as the working app direction.

The branch still contains early gated MapLibre preview files from `main` at `10051c0`, including `src/MapLibreMapStage.jsx` and `src/mapStyleConfig.js`. These files are dormant unless a developer explicitly opens the development URL with `?maplibrePreview=1`. Do not use the MapLibre preview flag for ordinary legacy Peridot testing.

A later experimental branch, `maplibre-native-geographic-view`, explored a fuller MapLibre migrated overlay with clusters, aggregated routes, hover feedback, and partial view-mode support. That work is intentionally set aside for now and should be treated as archived research rather than the active implementation baseline.

---

## 13. Known limitations and fragile zones

### Current structural limitation

`src/App.jsx` has been reduced through workspace extraction, but it still contains substantial orchestration logic and remains a concentration point for top-level data, selection, timeline, export, map-stage, and compatibility wiring.

### Current routing limitation

Most major workflows are now full workspaces, but two transitional paths remain:

- **Timeline** still uses the legacy side-panel bridge. It should eventually become a bottom timeline/scrubber integrated with Visualizations rather than a standalone full workspace.
- **Inspector** now uses a dual-mode system: compact side-panel summaries auto-open from map/network selections, and a full evidence-dossier workspace opens from hamburger/Expand/linked-data navigation.

### Known fragile zones

The maintainer documentation identifies the following areas as especially sensitive:

- workspace routing and hamburger-menu behavior
- viewport centering/reset behavior
- map/network viewport measurement after switching between Analytics and map/network visualizations
- dense-map hover/click interaction
- selection persistence across filters
- playback/timeline state coupling
- export rendering/state coupling
- broad orchestration work inside `src/App.jsx`
- inspector-open interactions
- shared side-panel shell behavior
- cluster grouping and cluster inspector navigation
- Search & Filter active-dataset state
- Data upload state, single-CSV normalization, workbook mapping/import assembly, and validation summary behavior
- Analytics expanded overlay positioning above the map area
- Analytics dynamic variable detection from uploaded/current row data
- Analytics SVG-to-PNG chart export rendering

### Practical implication

If you are making changes, avoid broad mixed-purpose edits. Prefer bounded passes that touch one subsystem at a time.

## 14. Maintainer documents

This repository includes internal maintenance and workflow documents that should be consulted before major edits:

- **`core_documentation/MAINTAINERS_GUIDE.md`**
- **`core_documentation/PROJECT_WORKFLOW_CHARTER.md`**
- **`core_documentation/CHANGELOG.md`**
- **`planning_documents/PERIDOT_INTERFACE_REDESIGN_PLAN.md`**
- **`planning_documents/PERIDOT_ROUTING_CONTRACT_AUDIT.md`**
- **`planning_documents/PERIDOT_INSPECTOR_WORKSPACE_CONTRACT.md`**

The full commit history, through the current documented baseline, is preserved in one place in **`CHANGELOG.md`**.

## 15. Roadmap / near-term priorities

Likely near-term priorities include:

- continue from the legacy D3/SVG Peridot path on `main`
- keep dormant MapLibre files untouched unless explicitly resuming that experiment
- preserve the current workspace-first routing model
- keep Timeline deferred until the bottom Visualizations timeline/scrubber design is ready
- refine the implemented dual-mode Inspector workspace, including section anchors, breadcrumbs, and future selected-entity/filter actions
- test the one-file Peridot CSV workflow, arbitrary role-based mapping, point/site imports, route coordinate pairs, and workbook importer against larger and messier datasets
- refine upload validation/capability wording if user testing shows confusion
- treat the legacy three-file upload workflow as superseded by the one-file and mapped-import workflows
- continue improving Analytics usability and data-scope clarity inside Visualizations
- consider future safe metadata filters after the upload/mapping model settles
- continue safe reduction of orchestration pressure inside `src/App.jsx`
- avoid renaming shared-panel compatibility props unless the inspector auto-open path is explicitly tested
- refresh screenshots after the dual-mode Inspector and current workspace/hamburger interface stabilize
- standardize visual export dimensions later if needed
- preserve full commit history in `CHANGELOG.md`

## 16. Author / maintainer / license

### Author / Maintainer

Repository owner: **Haley R. P.**

### License

Add the project’s chosen license here if and when one is finalized.
