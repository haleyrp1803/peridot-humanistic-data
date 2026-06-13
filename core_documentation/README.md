# Peridot (Correspondence Visualizer)

<p align="center">
  <img src="../assets/Peridot%20Logo.png" alt="Peridot logo" width="360" />
</p>

## 1. Project title

**Peridot** is the current app identity for the repository **Correspondence Visualizer**. It is a research-oriented interactive web app for exploring humanistic tabular datasets through maps, networks, timelines, charts, search/filter workflows, exports, and evidence dossiers. Correspondence networks remain the mature first case, but Peridot now also supports point/site datasets, chart-first time-series datasets, and generic evidence records that do not require people or network relationships.

---

## 2. One-paragraph summary

The application ingests humanistic tabular data, derives the structures the mapped fields can safely support, and renders an interactive workspace for exploring records through point maps, route maps, person-centered networks, force-directed graphs, chart-based Analytics, full-window Advanced Search, theme controls, export tools, timeline playback, and evidence inspection. The current interface has moved away from the earlier map-first, persistent-rail model: Peridot now opens to a Home / welcome workspace, uses a hamburger-triggered menu, and provides full-window workspaces for Home, Data, Visualizations, Explore, Learn More, Advanced Search, and Themes and Accessibility. Timeline is now a bottom Visualizations scrubber, while Inspector uses a dual-mode model: compact side-panel summaries for visualization clicks and a full evidence-dossier workspace for deeper navigation.

## 3. Current status

This repository represents an **active prototype / research tool in ongoing development**.

The current documented safe baseline is:

- **`e50ebf6` — `Scope chart palette imports to chart series`** on branch **`main`**

This baseline records the active D3/SVG Peridot path after the workspace-routing milestone, the completed dual-mode Inspector implementation cluster, the broader humanistic-data capability milestone, the visualization-workspace compression/navigation/export consolidation pass, the June 2026 structural cleanup/commenting pass, the Advanced Search / Explore consolidation milestone, the theme/color consolidation work, and the current Analytics chart-layout/theme milestone. The app now uses a simplified product menu: **Manage Your Data**, **Visualize Your Data**, **Explore Your Data**, **Learn More about Peridot**, and **Themes and Accessibility**. Visualizations now include a collapsible header, bottom timeline scrubber, minimized map overlays, a large chart workspace, and in-place header export controls. Analytics now uses a tabbed chart builder, quarter-width control rail, shared chart/legend layout, complete simplified legends, tightened chart-card spacing, anchored title/subtitle text, vertical Bar Chart defaults, method labels, and theme-routed chart series colors. The curated 30-color Peridot chart library is the default graph palette, while explicit chart-targeted palette imports can override chart series colors without recoloring unrelated app chrome. The upload workflow uses role-based mapping and can support point/site datasets, chart-first datasets, and generic evidence records without requiring People Network or Force-Directed readiness. Old MapLibre preview files and dependency have been removed from active `main`. The later, more ambitious MapLibre migrated-overlay work remains set aside on its separate branch and should not be treated as the active production direction unless explicitly resumed.

The current state of the active `main` project includes:

- a Home / welcome workspace with **Upload my data** and **Use sample data** start paths
- user-designed Peridot logo assets in `assets/`, with the transparent logo integrated into the Home workspace hero
- a hamburger-triggered menu as the primary visible navigation surface
- simplified hamburger menu entries for:
  - **Manage Your Data**
  - **Visualize Your Data**
  - **Explore Your Data**
  - **Learn More about Peridot**
  - **Themes and Accessibility**
- full-window workspaces for Data, Visualizations, Advanced Search, Learn More, Themes and Accessibility, and Inspector-compatible evidence review paths
- bottom Timeline scrubber integrated into the Visualizations workspace
- dual-mode Inspector behavior:
  - compact side-panel summaries from visualization clicks
  - full Inspector workspace from hamburger/Expand/linked-data navigation
- working geographic and person-network visualization modes
- compact Visualizations workspace selector for:
  - **Place Map**
  - **People Network**
  - **Force-Directed**
  - **Chart Visualizations**
- Chart Visualizations embedded inside the Visualizations workspace as a large chart workspace with left-side tabbed controls and a full-size chart canvas
- mapped imports routing users into the Visualizations workspace, defaulting to the map/geographic view
- a full-window Data workspace using one unified CSV / TSV / XLSX / XLS table-workbook uploader
- a downloadable CSV template using the current public Peridot column names
- arbitrary CSV/TSV column-mapping workflow for non-template tables
- workbook import support for `.xlsx` and `.xls` files
- multi-sheet workbook mapping with user-configured unique-ID joins
- role-based upload mapping for records, time, places, relationships, evidence/analysis, and capability review
- explicit support for single dates, start/end date intervals, display-date labels, point locations, separated coordinates, and latitude-first coordinate pairs
- point/site datasets that can render in Place Map without requiring people/network relationships
- chart-first and generic evidence records that can enter the active dataset without map or network roles
- capability-aware Visualizations menus for mapping, network, chart, and data-exploration views
- chart-type selection inside the Chart Visualizations control rail for Bar, Grouped Bar, Stacked Bar, Line, Multi-Line, Histogram, Pie, Sunburst, and Heatmap
- Year as the default chart date axis, with Full date available for finer granularity
- manual category/series selection across chart types, with compatible settings preserved while switching chart views
- chart summary/legend panels for ranked values, segment totals, line totals, trend summaries, bin ranges, matrix combinations, slices/shares, and sunburst parent totals, with complete simplified legend rows where the chart displays multiple items
- readable major/minor axis ticks and gridlines for axis-based charts
- finite 30-color chart series library coordinated with the Peridot green/gold/blue/pink palette as the default graph palette
- flexible Analytics controls for x-axis/category, y-axis/metric, aggregation, grouping/series, heatmap axes, histogram distributions, and selected wide numeric series
- Record count available as an explicit metric across aggregate charts
- Evidence and analysis field inclusion using explicit Include and Ignore checkboxes that default to Include
- upload validation that reports which records are Inspector-ready, Search-ready, Point-map-ready, Route-map-ready, Network-ready, Timeline-ready, Chart-ready, and Export-ready
- legacy Geography / Raw Data / Person Metadata upload controls removed from the ordinary public workflow after the one-file and mapped-import direction became active
- implemented Advanced Search as the direct Explore Your Data destination, with Build Search, Browse, Results, Refine / Inspect, and Capabilities tabs; keyword/person/place/route/date/weight filters; capability filters; dataset-wide browse indexes; structured AND / OR / EXCLUDING criteria; result cards; facets; and Inspector handoff
- actionable cluster inspector behavior
- cluster inspector members grouped by place
- dynamic node radius contrast based on active data
- volume-based zoom-responsive cluster sizing
- theme preset support in a **Themes and Accessibility** workspace
- centralized semantic color roles for interface, map/network, charts, Inspector/search, navigation chrome, timeline, buttons/highlights, and ornaments
- documented palette-system sequence from explicit palette centralization through built-in presets, image palette import, upload-guide color/design direction, and dropdown layering
- custom palette import targets and a finite 30-color Analytics chart series library using approved green, gold, blue, and pink palettes; explicit **Charts** imports override chart series colors without altering unrelated app chrome
- visualization chrome polish for header tabs, ornamental edge controls, map utility buttons, dropdown layering, map palette, chart controls, chart summary panels, and axis ticks
- in-place Visualizations header Export menu for SVG, PNG, nodes CSV, routes/edges CSV, and chart PNG export
- extracted sample data, mapping UI config, mapping field controls, and evidence field controls that reduce pressure on `App.jsx` and `PeridotColumnMappingModal.jsx`
- source-wide developer-orientation comments and a tracked code-structure audit planning document
- export tooling for both images and tabular data
- a true pre-settled **force-directed person-network layout** backed by `d3-force`
- a **geographic-anchor person layout** that places correspondents by mappable location
- inspector-internal navigation between people, places, routes, clusters, and linked-letter detail pages
- rich person/place profile summaries with related people, related places, directed routes, linked-letter counts, and selected uploaded fields
- compact Inspector summary tiles that open the full workspace
- linked-letter source/target people and places that open full dossiers
- directed route rows that open route/edge dossiers
- a working Inspector **Back** button for multi-step internal navigation

The codebase is functional, but it is still under active maintenance. The largest remaining structural risk is the continued top-level orchestration concentration in `src/App.jsx`, though recent cleanup has reduced it.

## 4. Key features

### Workspace navigation

- Home / welcome workspace with sample-data and upload-data entry points
- hamburger-triggered menu replacing the earlier persistent icon rail as the primary navigation surface
- task-oriented hamburger menu for Manage Your Data, Visualize Your Data, Explore Your Data, Learn More about Peridot, and Themes and Accessibility
- bottom Timeline scrubber integrated into Visualizations
- compact side-panel bridge retained for visualization-click Inspector summaries

### Visualization modes

- **Point Map / Place Map** support for one-location records and mapped point/site datasets
- **Route Map** support for correspondence and other source-target route datasets
- **Entity / People Network** view for datasets with source-target entity relationships
- **Force-Directed Network** layout using a pre-settled `d3-force` simulation where network data exists
- **Chart Visualizations** embedded in the Visualizations workspace with direct chart-type choices, compact previews, and expanded chart views

### Data interaction

- unified CSV / TSV / XLSX / XLS upload path in the Data workspace
- standardized one-file **Peridot CSV** template download
- arbitrary CSV/TSV/Excel workbook mapping for non-template uploaded tables
- workbook-aware import with primary sheet selection and multi-sheet unique-ID joins
- role-based mapping stages for record identity, time, places, relationships, evidence/analysis, and capability review
- point-location mapping for one-location-per-record datasets
- route coordinate mapping with separated latitude/longitude fields or combined latitude-first coordinate pairs
- generic chart/evidence record admission for rows with useful temporal, numeric, categorical, citation, or evidence fields
- explicit Include and Ignore checkboxes for evidence/analysis fields, defaulting to Include
- permissive database-first ingestion model: accepted rows can remain useful even when they cannot support every visualization
- post-upload validation popup and persistent latest-upload summary
- embedded baseline data so the app can render before uploads
- derived node, edge, cluster, and timeline structures based on uploaded or embedded data
- legacy three-file upload workflow removed from the ordinary public data-entry path

### Research workflow tools

- full-window Advanced Search workspace defining one active filtered dataset for map, Inspector, Timeline, Analytics, and Export
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


### Advanced Search / Explore tools

- **Explore Your Data** opens Advanced Search directly from the hamburger menu and the Visualizations header.
- Advanced Search is organized into **Build Search**, **Browse**, **Results**, **Refine / Inspect**, and **Capabilities** tabs.
- Build Search supports simple fields for keyword, person/entity, place, route-place, route-people, date range, minimum weight, and capability filters.
- Structured criteria allow up to five rows with predictive suggestions and explicit **AND**, **OR**, and **EXCLUDING** connectors after the first criterion.
- Browse indexes expose dataset-wide people/entities, places, routes, and evidence fields before a search is applied.
- Results show compact record cards with matched-field explanations, capability badges, and full Inspector handoff.
- Refine / Inspect shows facets with counts based on the current applied result set and fills draft filters for later Apply.
- Capabilities preserves the former "what this data can do" summary inside Advanced Search.

### Analytics tools

- **Chart Visualizations** available inside the Visualizations workspace
- tabbed Analytics builder with **Chart**, **Fields**, **Categories**, and **Present** tabs
- quarter-width control rail paired with a larger right-side chart card
- chart menu with:
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
- flexible x-axis/category, y-axis/metric, aggregation, grouping/series, heatmap row/column, histogram distribution, and selected wide numeric-series controls
- Record count available as an explicit metric for aggregate charts, alongside numeric field aggregation where applicable
- explicit **Route (Place)** and **Route (Person)** variables
- **Year** as the default ordered date axis, with **Full date** available for more granular date labels
- manual category/series selection so users can choose exact people, places, routes, categories, or comparable values
- compatible chart settings persist where possible when switching chart types
- selected-only, selected + Other, and selected + dataset-total comparison behavior where the chart type can support it safely
- summary/legend panels for ranked values, grouped/stacked segment totals, line totals, trend summaries, histogram bin ranges, heatmap top combinations, pie slices/shares, and sunburst parent totals
- major and minor ticks/gridlines for axis-based charts
- finite 30-color chart series library coordinated with the Peridot palette as the default graph palette
- large chart workspace inside Visualizations with a left controls rail and right chart canvas
- chart rendering scaled to fit the available workspace without internal scrolling
- shared chart-card layout reserving the left three-fourths for chart marks and the right fourth for complete simplified legend/summary rows
- anchored chart title/subtitle placement and reduced internal chart-card whitespace
- optional editable presentation title in the **Present** tab
- method labels for chart measure/hierarchy context where helpful
- Bar Chart defaults to **Vertical**, with horizontal orientation still available
- year-default ordered date charts, with Full date available as the explicit higher-granularity option
- manual category/series selection across compatible chart types, with settings preserved where possible while switching charts
- persistent chart summary panels for ranked values, totals, shares, trends, bins, matrix combinations, and sunburst parents
- stronger major/minor axis ticks and gridlines for axis-based charts
- finite 30-color chart series library with greens/golds dominant and blues/pinks as supporting contrast; explicit chart-targeted palette imports can override the series cycle for all chart types
- PNG export through the shared Visualizations header Export menu

### Visual encoding

- dynamic node sizing with stronger contrast for high-volume nodes
- volume-based cluster sizing
- zoom-responsive cluster grouping for nearby people/places
- edge sizing preserved independently from node and cluster sizing

### Visual customization

- full Theme workspace with Peridot default, Early modern map, and Modern map presets
- semantic theme role system in `peridotTheme.js`
- finite 30-color chart series palette used by Analytics charts as the default graph palette
- centralized chart background/text/grid/series roles, with chart-targeted palette imports scoped to series colors
- map and interface chroming controlled primarily through theme values rather than a large global stylesheet
- light navy sea treatment, muted green land, active olive land emphasis, dark map frame, and map-label density/collision polish
- visualization header, tab, edge-handle, and map utility-button polish coordinated with the ornamental Peridot folio style
- mode-sensitive stage rendering so the **Force-Directed** view uses a clean themed background while geographic modes retain the map backdrop

### Export tools

- shared **Export** menu in the Visualizations header
- export current map/network visualization state as **SVG**
- render map/network SVG export to **PNG**
- export derived **nodes CSV**
- export derived **edges/routes CSV**
- export Chart Visualizations as **PNG**
- no standalone Export workspace in the active user-facing workflow

## 5. Current interface notes

The current interface is now workspace-first rather than side-panel-first.

Current top-level navigation:

- a hamburger-triggered labeled menu, implemented in `src/PeridotHamburgerMenu.jsx`
- full-window workspaces for:
  - **Manage Your Data** — Data workspace with CSV / TSV / XLSX / XLS upload, mapping, template download, and validation summary
  - **Visualize Your Data** — Visualizations workspace with Place Map, People Network, Force-Directed, Chart Visualizations, Timeline, and in-place Export
  - **Explore Your Data** — direct entry point to Advanced Search, including data capabilities, Browse, Results, Refine / Inspect, and Inspector-adjacent evidence workflow
  - **Learn More about Peridot** — placeholder for future project information, credits, tutorials, and help content
  - **Themes and Accessibility** — appearance presets and future accessibility settings
- dual-mode Inspector workflow:
  - visualization node/edge/cluster clicks open compact Inspector
  - hamburger **Inspector**, **Expand**, compact summary buttons, and linked-data clicks open the full Inspector workspace

Important current behavior:

- the app opens to the Home workspace
- **Use sample data** opens Visualizations with the embedded sample data
- **Upload my data** opens the Data workspace
- mapped imports route into Visualizations and default to the map/geographic view
- Chart Visualizations live inside Visualizations rather than as a primary side-panel workflow
- Advanced Search is reached through Explore/workflow actions, and Export is an in-place Visualizations header menu rather than a separate hamburger workspace
- Timeline is implemented as a compact bottom scrubber integrated with Visualizations
- Inspector now uses the planned dual-mode model: compact side-panel summaries preserve click-and-glance context, while the full workspace supports evidence-dossier navigation
- `LeftControlPanel.jsx` is now reduced to the compact Inspector side-panel shell; the old persistent rail and workflow panels are no longer part of the active source

Screenshots in the repository likely need refresh because the interface has changed materially since the earlier rail/side-panel documentation baseline.

## 6. Screenshots

### Peridot logo assets

![Peridot logo](../assets/Peridot%20Logo.png)

The transparent-background variant used by the Home workspace is stored at `assets/Peridot Logo Transparent.png`.

The screenshots in `docs/images/` may need refresh because the side-panel architecture, Advanced Search layout, Analytics overlay, Data Inputs workflow, and cluster inspector behavior have changed materially since the earlier documentation baseline.

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

MapLibre is no longer a dependency of active `main`; any future MapLibre work should begin from a fresh branch/source-of-truth audit.

---

## 8. Project structure

Brand image assets are stored in `assets/`:

```text
assets/
  Peridot Logo.png
  Peridot Logo Transparent.png
```

The current `src/` structure is:

```text
src/
  analyticsChartComponents.jsx
  analyticsConfig.js
  analyticsDerivationHelpers.js
  AnalyticsPanel.jsx
  App.jsx
  peridotColorPalette.js
  peridotTheme.js
  peridotThemeRoleMetadata.js
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
  mapInteractionHandlers.js
  mapLayoutHelpers.js
  mapStageComponents.jsx
  PeridotColumnMappingModal.jsx
  PeridotEvidenceFieldControls.jsx
  PeridotDataWorkspace.jsx
  PeridotExploreWorkspace.jsx
  PeridotHamburgerMenu.jsx
  PeridotLearnMoreWorkspace.jsx
  PeridotMappingFieldControls.jsx
  PeridotHomeWorkspace.jsx
  PeridotSearchWorkspace.jsx
  PeridotThemeWorkspace.jsx
  PeridotVisualizationsWorkspace.jsx
  peridotColumnMapping.js
  peridotColumnMappingUiConfig.js
  peridotCsvNormalizer.js
  peridotCsvSchema.js
  peridotCsvValidation.js
  peridotDataCapabilityAudit.js
  peridotTheme.js
  peridotThemeRoleMetadata.js
  peridotWorkbookMapping.js
  peridotWorkbookParsing.js
  peridotSampleData.js
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

The main orchestration layer. It handles top-level application state, data ingestion and normalization, graph derivation, theme token logic, timeline state, inspector state, Advanced Search state, export wiring, workspace composition, and compatibility routing to the remaining legacy Timeline/Inspector side-panel bridge.

#### `src/peridotWorkspaceConfig.js`

Defines the Peridot workspace-mode vocabulary and guard helpers used by `App.jsx` and workspace routing.

#### `src/PeridotHamburgerMenu.jsx`

Primary visible navigation component. It renders the hamburger button and labeled menu entries for Manage Your Data, Visualize Your Data, Explore Your Data, Learn More about Peridot, and Themes and Accessibility.

#### `src/PeridotHomeWorkspace.jsx`

Home / welcome workspace with introductory copy, the transparent Peridot logo lockup, **Upload my data**, **Use sample data**, and feature summary cards. The Home workspace imports the transparent logo from `assets/Peridot Logo Transparent.png` so the same documented brand asset is used in the live app.

#### `src/PeridotDataWorkspace.jsx`

Full-window Data workspace for template download, unified CSV / TSV / XLSX / XLS upload, staged table/workbook summary, mapping launch, latest upload summary, and navigation to Visualizations.

#### `src/PeridotVisualizationsWorkspace.jsx`

Full-window Visualizations workspace. It hosts the compact selector for Place Map, People Network, Force-Directed, and Chart Visualizations; renders the large chart workspace in-place; wraps the current map/network stage; owns the collapsible visualization header, bottom timeline scrubber placement, and shared header Export menu.

#### `src/PeridotSearchWorkspace.jsx`

Full-window Advanced Search workspace and primary Explore surface. It renders the current applied scope, Build Search, Browse, Results, Refine / Inspect, and Capabilities tabs; keyword/person/place/route filters; date and weight controls; predictive suggestions; capability filters; structured AND / OR / EXCLUDING criteria; Apply Filters; Clear Filters; result cards; facets; dataset-wide browse indexes; and Inspector handoff.

#### `src/PeridotThemeWorkspace.jsx`

Themes and Accessibility workspace for Peridot default, Early modern map, Modern map presets, custom palette import, role-targeted theme application, and future appearance/accessibility settings.

#### `src/peridotTheme.js`

Semantic theme system for Peridot. It defines source palettes, palette import targets, custom overrides, semantic role assignments, chart colors, map/network colors, Inspector/search colors, navigation/timeline/button roles, ornament roles, and CSS-variable export. It keeps the curated 30-color Analytics series library as the default while allowing explicit chart-targeted palette imports to override only chart series colors. New color work should generally start here.

#### `src/peridotThemeRoleMetadata.js`

Human-facing theme-role metadata used by the Themes and Accessibility workspace so users can understand and target palette changes.

#### `src/peridotColorPalette.js`

Legacy color compatibility adapter for older component paths. New work should prefer semantic roles from `peridotTheme.js`.

#### `src/PeridotExploreWorkspace.jsx`

Compatibility Explore workspace. Explore Your Data now routes directly to Advanced Search; this component should remain only as a transitional routing boundary unless a future pass intentionally revives a separate Explore workspace.

#### `src/PeridotLearnMoreWorkspace.jsx`

Placeholder workspace for future Peridot project information, credits, tutorials, and help content.

#### `src/LeftControlPanel.jsx`

Compact Inspector side-panel shell. Earlier persistent rail/workflow panel content has been removed. This file now preserves visualization-click Inspector behavior for nodes, edges, and clusters while deeper evidence navigation routes to the full Inspector workspace.

#### `src/PeridotColumnMappingModal.jsx`

Large column/workbook-mapping workspace for arbitrary CSV/TSV/Excel imports. It lets users map uploaded source columns to Peridot core fields, configure multi-sheet workbook joins by unique ID, and choose additional custom fields from primary and joined sheets for Inspector/Analytics use.

#### `src/peridotColumnMappingUiConfig.js`

Static UI configuration for the role-based mapping modal, including step order, display labels, field groupings, and formatting helpers.

#### `src/PeridotMappingFieldControls.jsx`

Presentational mapping table controls extracted from the column/workbook mapping modal.

#### `src/PeridotEvidenceFieldControls.jsx`

Presentational Include/Ignore controls for evidence and analysis fields in single-table and workbook mapping.

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

Analytics / Chart Visualizations UI boundary. It owns chart type selection, chart configuration controls, Analytics-local date-range controls, and the large chart stage. Chart PNG export is registered upward so the shared Visualizations header Export menu is the single export surface.

#### `src/analyticsConfig.js`

Analytics configuration module. It defines chart metadata, chart labels, descriptions, example questions, default Analytics state, top-N display options, manual-selection defaults, curated variable definitions, and the explicit **Route (Place)** / **Route (Person)** variable distinction.

#### `src/analyticsDerivationHelpers.js`

Analytics data-derivation module. It derives available variable options from current row data, filters unsuitable dynamic metadata fields, builds chart data, handles Year and Full date bucketing, applies manual selected-category filters, builds selected-only/Other/dataset-total comparisons where appropriate, and prepares chart-specific data structures.

#### `src/analyticsChartComponents.jsx`

SVG chart-rendering module for Analytics. It renders chart previews for bar, grouped bar, stacked bar, line, multi-line, histogram, pie, sunburst, and heatmap chart types. It also owns chart frames, shared chart/legend layout, summary/legend panels, visible values, major/minor axis ticks, gridline styling, active theme-series mark colors, and the SVG content used for chart PNG export.

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

#### `src/exportHelpers.js`

Export subsystem utilities for CSV, SVG, and PNG output.

#### `src/peridotSampleData.js`

Bundled sample CSV constants used by the **Use sample data** path.

#### `src/peridotTheme.js`

Semantic theme and palette control surface. It owns the active Peridot palette, custom theme overrides, CSS variables, chart roles, map/network roles, legacy-token compatibility, the finite default Analytics chart series color library, and chart-targeted palette import scoping.

#### `src/peridotThemeRoleMetadata.js`

Theme-role metadata used by the Themes and Accessibility workspace and palette tooling.

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

For the standardized correspondence template, each row should represent one letter, document, or correspondence record. For mapped arbitrary tables and workbooks, rows may also represent sites, events, observations, measurements, catalogue entries, or other humanistic records. The public template columns are:

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

Peridot uses a permissive database-first model. A row can be accepted if it has any of the following:

- `Source_Name` and `Target_Name`;
- source-side and target-side place information, using place names, coordinate pairs, or both;
- point/site place or coordinate information;
- generic chart/evidence content such as dates, numeric measures, categorical fields, citation/provenance, links, notes, or other user-selected evidence fields.

Coordinates and dates are not required for upload. Instead, the upload summary tells the user which rows can support which tools:

- Inspector-ready
- People-network-ready
- Place-network-ready
- Map-ready
- Timeline-ready
- Chart-ready
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
8. Open Visualizations and choose **Place Map**, **People Network**, **Force-Directed**, or **Chart Visualizations**.
9. Use **Advanced Search** to define the active filtered dataset.
10. Use the bottom Timeline scrubber for year-based filtering and playback.
11. Hover or click nodes, edges, or clusters to inspect them.
12. Use **Inspector** to navigate between people, places, cluster members, and linked records.
13. Use the inspector **Back** button to return to the previous internal panel.
14. Use **Chart Visualizations** inside Visualizations to generate large workspace charts and export chart PNG files through the header Export menu.
15. Use the Visualizations header **Export** menu to save the current visualization state as SVG, PNG, CSV, or chart PNG outputs.

### Advanced Search workflow

Advanced Search defines the active filtered dataset:

```text
data source
→ active filtered dataset
→ visualization / inspection / analytics / export
```

Under that model:

- **Data** defines which data is loaded.
- **Advanced Search** defines which records, people, places, routes, and metadata categories are in scope.
- **Visualizations** defines how the active dataset is displayed or charted.
- **Timeline** focuses on playback and chronological navigation through the bottom Visualizations scrubber.
- **Analytics** charts the current filtered dataset by default inside Visualizations.
- **Inspector** remains selection-driven.
- **Export** labels whether it is exporting loaded, filtered, visible, selected, or charted data.

Implemented Advanced Search controls include keyword, person, place, Route Filter (Place), Route Filter (People), minimum correspondence weight, date range, predictive suggestions, Apply Filters, Clear Filters, current applied scope, and pre-update status feedback.

## 12. MapLibre status

MapLibre work is currently paused and no longer ships as dormant preview code on active `main`.

The old `src/MapLibreMapStage.jsx`, `src/mapStyleConfig.js`, and `maplibre-gl` dependency were removed from active `main` in `55a368c`. The active app direction remains the D3/SVG Peridot path.

A later experimental branch, `maplibre-native-geographic-view`, explored a fuller MapLibre migrated overlay with clusters, aggregated routes, hover feedback, and partial view-mode support. That work is intentionally set aside and should be treated as archived research rather than the active implementation baseline. If MapLibre is revisited, start with a fresh branch/source-of-truth audit.

---

## 13. Known limitations and fragile zones

### Current structural limitation

`src/App.jsx` has been reduced through workspace extraction, but it still contains substantial orchestration logic and remains a concentration point for top-level data, selection, timeline, export, map-stage, and compatibility wiring.

### Current routing limitation

Most major workflows are now full workspaces or integrated into Visualizations. The main remaining transitional path is Inspector:

- **Timeline** is now a bottom scrubber integrated with Visualizations.
- **Inspector** uses a dual-mode system: compact side-panel summaries auto-open from map/network selections, and a full evidence-dossier workspace opens from hamburger/Expand/linked-data navigation.

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
- Advanced Search active-dataset state
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
- **`planning_documents/PERIDOT_CODE_STRUCTURE_AUDIT.md`**

The full commit history, through the current documented baseline, is preserved in one place in **`CHANGELOG.md`**.

## 15. Roadmap / near-term priorities

Likely near-term priorities include:

- continue from the legacy D3/SVG Peridot path on `main`
- keep active `main` on the D3/SVG path unless explicitly resuming MapLibre on a fresh branch/audit
- preserve the current workspace-first routing model
- refine the implemented bottom Visualizations timeline/scrubber after larger-dataset testing
- refine the implemented dual-mode Inspector workspace, including section anchors, breadcrumbs, and future selected-entity/filter actions
- test the one-file Peridot CSV workflow, arbitrary role-based mapping, point/site imports, generic chart/evidence imports, route coordinate pairs, flexible Analytics charts, and workbook importer against larger and messier datasets
- refine upload validation/capability wording if user testing shows confusion
- treat the legacy three-file upload workflow as superseded by the one-file and mapped-import workflows
- continue improving Chart Visualizations usability, manual comparison workflows, visible value summaries, axis readability, theme-series behavior, and data-scope clarity inside Visualizations
- consider future safe metadata filters after the upload/mapping model settles
- continue safe reduction of orchestration pressure inside `src/App.jsx`, using the code-structure audit as the planning reference
- avoid renaming shared-panel compatibility props unless the inspector auto-open path is explicitly tested
- refresh screenshots after the dual-mode Inspector, current workspace/hamburger interface, chart summary panels, logo integration, and theme/color work stabilize
- keep the logo assets in `assets/` synchronized with the Home workspace branding
- standardize visual export dimensions later if needed
- preserve full commit history in `CHANGELOG.md`

## 16. Author / maintainer / license

### Author / Maintainer

Repository owner: **Haley R. P.**

### License

Add the project’s chosen license here if and when one is finalized.
