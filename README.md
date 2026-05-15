# Peridot (Correspondence Visualizer)

## 1. Project title

**Peridot** is the current app identity for the repository **Correspondence Visualizer**. It is a research-oriented interactive web app for exploring historical correspondence networks as either geographic route maps or person-centered relationship graphs.

---

## 2. One-paragraph summary

The application ingests correspondence-related tabular data, derives network structures from that data, and renders an interactive visualization workspace with filtering, inspection, timeline controls, playback, theme customization, and export tools. The production app currently uses the committed D3/SVG geographic map path and the pre-settled D3 force-directed person-network path. On the `maplibre-native-geographic-view` branch, Peridot also contains a gated MapLibre preview/prototype path used to design a future MapLibre-native geographic subsystem without replacing the production map.

---

## 3. Current status

This repository represents an **active prototype / research tool in ongoing development**.

### Current branch context at this handoff

- Active development branch: **`maplibre-native-geographic-view`**
- Current branch baseline: **`268b18c` — `Add MapLibre hover feedback`**
- Current `main` baseline / MapLibre preview prototype checkpoint: **`10051c0` — `Add MapLibre selected filter layers`**
- Tag for current MapLibre preview prototype: **`checkpoint-maplibre-preview-prototype`**
- Pre-MapLibre clean rollback point: **`4e08720` — `Direct workflow charter baseline reference to changelog`**

The production app remains functional. The MapLibre work is still gated behind the development/test URL parameter:

```text
?maplibrePreview=1
```

The current MapLibre branch has advanced beyond the original route/node prototype. It now includes dynamic MapLibre clusters, cluster labels, cluster-member node hiding, curved visible-endpoint aggregated routes, aggregated route Inspector payloads and display, selected feedback for clusters and aggregated routes, and hover feedback that prioritizes nodes/clusters over crossing routes.

Important recent landmarks include:

- `3f26cc2` — `Broaden MapLibre lifecycle diagnostics`
- `bb11f6a` — `Add static MapLibre cluster lifecycle diagnostic`
- `1e8456f` — `Add dynamic MapLibre cluster diagnostic`
- `be7d9ae` — `Route MapLibre cluster clicks to inspector`
- `8a563cc` — `Hide MapLibre cluster member nodes`
- `526534a` — `Aggregate MapLibre routes between visible endpoints`
- `084ce9d` — `Enrich MapLibre aggregated route inspector payload`
- `2ccaaeb` — `Show MapLibre aggregated route details in inspector`
- `57d3cc1` — `Add MapLibre cluster count labels`
- `8137db7` — `Curve MapLibre aggregated routes`
- `268b18c` — `Add MapLibre hover feedback`

The attempted structural extraction `dd148e1` regressed the migrated overlay and was followed by `c0a4b8a`, which restored the migrated MapLibre overlay. Future MapLibre structural extraction should be narrow, source-of-truth verified, and tested after each small step.

### Current production behavior

The production behavior includes:

- working geographic and person-network visualization modes
- direct view-selection buttons for **People**, **Place**, and **Force-Directed**
- **People** as the default startup view
- a committed minimum-weight numeric input with **Enter** / **Update** apply behavior
- year-based timeline filtering and playback infrastructure
- a shared left-side panel with a persistent rail for Controls, Data Inputs, Export, Timeline, and Inspector
- actionable cluster inspector behavior
- cluster inspector members grouped by place
- dynamic node radius contrast based on active data
- volume-based zoom-responsive cluster sizing
- theme preset support and map-stage overlays
- export tooling for both images and tabular data
- a true pre-settled **force-directed person-network layout** backed by `d3-force`
- a **geographic-anchor person layout** that places correspondents by mappable location
- inspector-internal navigation between people and places
- a working inspector **Back** button for internal navigation

The codebase is functional, but it remains under active maintenance. The largest remaining structural issue is that important orchestration logic still lives in `src/App.jsx`, even though panel, inspector, map, timeline, interaction, export, and now MapLibre feature/layer logic have been substantially extracted.

---

## 4. Key features

### Visualization modes

- **Place** view for mapping correspondence routes between places
- **People** view for exploring correspondence as a network of people anchored to geography
- **Force-Directed** person layout using a pre-settled `d3-force` simulation

### Data interaction

- CSV-based data ingestion
- embedded baseline data so the app can render before uploads
- derived node, edge, cluster, and timeline structures based on uploaded or embedded data

### Research workflow tools

- hover and click inspection
- shared side-panel Inspector tab for selected nodes, edges, clusters, and linked records
- dedicated side-panel tabs for Data Inputs, Export, and Timeline workflows
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

### Visual encoding

- dynamic node sizing with stronger contrast for high-volume nodes
- volume-based cluster sizing in the production D3/SVG path
- zoom-responsive cluster grouping for nearby people/places in the production D3/SVG path
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

---

## 5. Current interface notes

The current interface includes:

- a shared left-side panel shell owned by `src/LeftControlPanel.jsx`
- a persistent icon rail that remains available when the panel is closed and when it is open
- a close button at the top of the icon rail when the panel is open
- a mossy/peridot-toned rail background with lighter green buttons, lighter hover states, and cream active-state styling
- rail-driven panel tabs for:
  - **Controls** — general visualization, display, theme, summary, and diagnostics controls
  - **Data Inputs** — Geography, Raw Data, and Person Metadata upload controls
  - **Export** — SVG, PNG, nodes CSV, and edges/routes CSV export controls
  - **Timeline** — year-range filtering and playback controls
  - **Inspector** — selected nodes, edges, clusters, linked records, and internal navigation

Other current behavior:

- the app opens in **People** view by default
- the old minimum-weight slider has been replaced by a committed numeric input
- the old **Show all dates** shortcut has been removed
- the timeline now uses **year-only** start/end selectors rather than month selectors
- the old horizontal Controls / Inspector top tab row has been removed; the persistent rail now functions as the panel-view switcher

---

## 6. Screenshots

The screenshots in `docs/images/` may need refresh because the side-panel architecture, MapLibre preview work, and cluster inspector behavior have changed materially since the earlier documentation baseline.

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
- **d3-geo** for projection and map geometry work in the production D3/SVG geographic path
- **d3-force** for pre-settled force-directed person-network layout
- **topojson-client** for geographic feature handling
- **world-atlas** for world basemap data
- **MapLibre GL JS** for the gated MapLibre geographic preview/prototype path on the native MapLibre branch

The production map-stage rendering logic remains SVG-based, with exported SVG optionally rasterized to PNG during export workflows. The MapLibre path is a development/prototype subsystem and is not yet the production geographic renderer.

---

## 8. Project structure

The current `src/` structure includes:

```text
src/
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
  mapInteractionHandlers.js
  mapLayoutHelpers.js
  mapLibreFeatureBuilders.js
  mapLibreLayerConfig.js
  MapLibreMapStage.jsx
  mapStageComponents.jsx
  mapStyleConfig.js
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

The main orchestration layer. It handles top-level application state, data ingestion and normalization, graph derivation, theme token logic, timeline state, inspector state, shared side-panel state, and workspace composition. It also gates the current MapLibre preview behind `?maplibrePreview=1`.

#### `src/LeftControlPanel.jsx`

Owns the shared side-panel shell and persistent icon rail. It renders the rail-driven panel views for Controls, Data Inputs, Export, Timeline, and Inspector. Inspector content is rendered through `InspectorPanelContent`, while the Data Inputs, Export, and Timeline tabs reuse existing panel content boundaries rather than changing ingestion, export, or playback logic.

#### `src/InspectorPanel.jsx`

Inspector content boundary. It renders the inspector header, Back button, and body router inside the shared side-panel shell.

#### `src/InspectorBodyRouter.jsx`

Routes inspector state to the appropriate extracted inspector view.

#### `src/InspectorEmptyState.jsx`

Empty inspector state view.

#### `src/InspectorClusterView.jsx`

Cluster inspector view. Current production behavior groups contained members by place and sorts by visible represented volume.

#### `src/InspectorEdgeView.jsx`

Edge inspector view boundary.

#### `src/InspectorNodeView.jsx`

Node / person-detail / place-detail inspector view boundary.

#### `src/mapLayoutHelpers.js`

Pure map/layout helper logic for the production D3/SVG path, including viewport construction, clustering, cluster radius calculation, label visibility, and geometric calculations.

#### `src/interactionHelpers.js`

Selection and inspection logic, including nearby candidate generation, selection resolution, cluster selection payload derivation, person-detail and place-detail payload derivation, weighted connected-correspondent ordering, and person-detail place-section derivation.

#### `src/mapInteractionHandlers.js`

Centralized map interaction handler factory for hover/click/selection behavior in the production D3/SVG path.

#### `src/MapLibreMapStage.jsx`

Development/prototype MapLibre stage. Current branch behavior renders the migrated MapLibre Place-view overlay: dynamic clusters, cluster count labels, hidden cluster-member nodes, curved aggregated visible-endpoint routes, selected and hover feedback, and Inspector routing for nodes, clusters, and aggregated routes. People and Force-Directed view functionality remain the next branch-level parity priority.

#### `src/mapLibreFeatureBuilders.js`

Pure MapLibre feature-building helpers. Current branch owns node and route GeoJSON feature construction and projectable route counting for the MapLibre preview.

#### `src/mapLibreLayerConfig.js`

MapLibre source/layer IDs, empty selected filters, selected ID filter helpers, and layer definition builders for the current route, node, route-hit, and selected-feature layers.

#### `src/mapStyleConfig.js`

MapLibre style configuration for the current preview path.

#### `src/timelinePlaybackHelpers.js`

Pure timeline/playback derivation helpers.

#### `src/timelinePlaybackComponents.jsx`

Timeline/playback UI boundary.

#### `src/mapStageComponents.jsx`

Map-stage-adjacent UI/chrome components.

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

### Test the MapLibre preview path

On the `maplibre-native-geographic-view` branch or a branch containing the MapLibre preview commits, start the development server and open:

```text
http://localhost:5173/?maplibrePreview=1
```

Use the actual Vite port if it differs.

### Repository location

```text
https://github.com/haleyrp1803/correspondence-visualizer
```

---

## 10. Data inputs

This is a data-driven visualization app. It is intended to work with correspondence-related tabular data that includes some combination of:

- dates
- source person
- target person
- source location
- target or inferred target location
- source latitude / longitude
- target latitude / longitude
- linked letter metadata
- person metadata

The source code currently includes embedded baseline data so that the app can render before user uploads are provided.

---

## 11. How to use the app

A typical production workflow is:

1. Open the app.
2. Load data or work from the embedded baseline data.
3. Choose **People**, **Place**, or **Force-Directed**.
4. Use **Data Inputs** to upload or replace Geography, Raw Data, and Person Metadata files as needed.
5. Adjust display, theme, and weight filters in **Controls**.
6. Use **Timeline** for year-based filtering and playback.
7. Hover or click nodes, edges, or clusters to inspect them.
8. Use **Inspector** to navigate between people, places, cluster members, and linked records.
9. Use the inspector **Back** button to return to the previous internal panel.
10. Use **Export** to save the current state as SVG, PNG, or CSV outputs.

The MapLibre preview path is for development and should not yet be treated as a production replacement for the geographic view.

---

## 12. Known limitations and fragile zones

### Current structural limitation

`src/App.jsx` still contains a large amount of orchestration logic and remains the main concentration point in the codebase.

### Current MapLibre limitation

The MapLibre preview now has a functional migrated **Place** view with MapLibre-rendered nodes, dynamic clusters, cluster count labels, hidden cluster-member nodes, curved aggregated visible-endpoint routes, route/node/cluster click routing into the Inspector, aggregated route detail display, selected feedback, and hover feedback. It is still gated behind `?maplibrePreview=1` and is not yet the production geographic renderer.

Remaining MapLibre limitations include:

- only the **Place** view currently has visible MapLibre nodes/edges; **People** and **Force-Directed** still need functional treatment in the MapLibre branch;
- playback highlighting parity has not yet been implemented in the MapLibre preview;
- final Peridot-aligned basemap and visual styling are still open design questions;
- export parity has not been decided, because live MapLibre rendering is canvas/WebGL-based while the existing export path is SVG-oriented;
- `src/MapLibreMapStage.jsx` has absorbed a large amount of now-working migration logic and should not be broadly refactored without small, verified structural passes.

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
- MapLibre map lifecycle/source setup, especially if future cluster work depends on zoom/move state

### Practical implication

If you are making changes, avoid broad mixed-purpose edits. Prefer bounded passes that touch one subsystem at a time.

---

## 13. Maintainer documents

This repository includes internal maintenance and workflow documents that should be consulted before major edits:

- **`MAINTAINERS_GUIDE.md`**
- **`PROJECT_WORKFLOW_CHARTER.md`**
- **`CHANGELOG.md`**
- **`docs/MAPLIBRE_NATIVE_GEOGRAPHIC_VIEW_PLAN.md`**

---

## 14. Roadmap / near-term priorities

Likely near-term priorities include:

- preserve the current production D3/SVG map behavior unless and until the MapLibre subsystem reaches parity
- make **People**, **Place**, and **Force-Directed** functional in the MapLibre branch, noting that the migrated MapLibre overlay currently works best in **Place** view
- explore prettier basemap and visual-design options that align more closely with Peridot's historical/research aesthetic
- add playback highlighting parity to the MapLibre preview
- keep `src/MapLibreMapStage.jsx` stable; defer broad extraction unless there is a concrete maintenance pain point
- if structural extraction resumes, proceed in tiny source-of-truth-verified patches, not broad full-file rewrites
- refresh screenshots after the MapLibre direction and shared side-panel UI stabilize
- standardize visual export dimensions later if needed
- preserve full commit history in documentation updates

---

## 15. Author / maintainer / license

### Author / Maintainer

Repository owner: **Haley R. P.**

### License

Add the project’s chosen license here if and when one is finalized.
