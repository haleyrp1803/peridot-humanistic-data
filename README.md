# Peridot (Correspondence Visualizer)

## 1. Project title

**Peridot** is the current app identity for the repository **Correspondence Visualizer**. It is a research-oriented interactive web app for exploring historical correspondence networks as either geographic route maps or person-centered relationship graphs.

---

## 2. One-paragraph summary

The application ingests correspondence-related tabular data, derives network structures from that data, and renders an interactive visualization workspace with filtering, inspection, timeline controls, playback, theme customization, and export tools. The current app includes a shared left-side panel with Controls and Inspector tabs, actionable cluster inspection, dynamic node sizing, volume-based zoom-responsive cluster sizing, year-based timeline controls, and image/tabular export tools.

---

## 3. Current status

This repository represents an **active prototype / research tool in ongoing development**.

The current safe baseline is:

- **`4a17d1c` — `Make inspector panel content-only`**

The current state of the project includes:

- working geographic and person-network visualization modes
- direct view-selection buttons for:
  - **People**
  - **Place**
  - **Force-Directed**
- **People** as the default startup view
- a committed minimum-weight numeric input with **Enter** / **Update** apply behavior
- year-based timeline filtering and playback infrastructure
- a shared left-side panel with Controls and Inspector tabs
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

The codebase is functional, but it is still under active maintenance. The largest remaining structural issue is that important orchestration logic still lives in `src/App.jsx`, even though panel, inspector, map, timeline, interaction, and export logic have been substantially extracted.

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

---

## 5. Current interface notes

The current interface includes:

- a shared left-side panel
- collapsed left rail with:
  - cog icon for Controls
  - menu/hamburger icon for Inspector
- open side panel with Controls / Inspector tabs
- a Controls tab for data, visualization, display, timeline, theme, export, and diagnostics
- an Inspector tab for selected nodes, edges, clusters, and internal navigation

Other current behavior:

- the app opens in **People** view by default
- the old minimum-weight slider has been replaced by a committed numeric input
- the old **Show all dates** shortcut has been removed
- the timeline now uses **year-only** start/end selectors rather than month selectors

These are part of the current safe baseline and should be treated as live behavior unless changed in a later committed pass.

---

## 6. Screenshots

The screenshots in `docs/images/` may need refresh because the side-panel architecture and cluster inspector behavior have changed materially since the earlier documentation baseline.

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

The map-stage rendering logic is SVG-based, with exported SVG optionally rasterized to PNG during export workflows.

---

## 8. Project structure

The current `src/` structure is:

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
  mapStageComponents.jsx
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

The main orchestration layer. It handles top-level application state, data ingestion and normalization, graph derivation, theme token logic, timeline state, inspector state, shared side-panel state, and workspace composition.

#### `src/LeftControlPanel.jsx`

Owns the shared side-panel shell. It renders the collapsed rail, panel tabs, Controls content, and Inspector content through `InspectorPanelContent`.

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

Selection and inspection logic, including:

- nearby candidate generation
- selection resolution
- cluster selection payload derivation
- person-detail and place-detail payload derivation
- weighted connected-correspondent ordering
- person-detail place-section derivation

#### `src/mapInteractionHandlers.js`

Centralized map interaction handler factory for hover/click/selection behavior.

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

A typical workflow is:

1. Open the app.
2. Load data or work from the embedded baseline data.
3. Choose **People**, **Place**, or **Force-Directed**.
4. Adjust display and weight filters.
5. Use the year-based timeline if needed.
6. Hover or click nodes, edges, or clusters to inspect them.
7. Use the Inspector tab to navigate between people, places, cluster members, and linked records.
8. Use the inspector **Back** button to return to the previous internal panel.
9. Export the current state as SVG, PNG, or CSV outputs.

---

## 12. Known limitations and fragile zones

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

### Practical implication

If you are making changes, avoid broad mixed-purpose edits. Prefer bounded passes that touch one subsystem at a time.

---

## 13. Maintainer documents

This repository includes internal maintenance and workflow documents that should be consulted before major edits:

- **`MAINTAINERS_GUIDE.md`**
- **`PROJECT_WORKFLOW_CHARTER.md`**
- **`CHANGELOG.md`**

---

## 14. Roadmap / near-term priorities

Likely near-term priorities include:

- continue safe reduction of orchestration pressure inside `src/App.jsx`
- avoid renaming shared-panel compatibility props unless the inspector auto-open path is explicitly tested
- revisit responsive side-panel sizing only as a narrow-window-specific pass
- refresh screenshots after the shared side-panel UI stabilizes
- standardize visual export dimensions later if needed
- preserve full commit history in documentation updates

---

## 15. Author / maintainer / license

### Author / Maintainer

Repository owner: **Haley R. P.**

### License

Add the project’s chosen license here if and when one is finalized.
