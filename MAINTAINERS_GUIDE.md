# Maintainer's Guide

## Purpose

This document is the architectural reference for the Peridot correspondence visualizer app. It should stay aligned with the committed source of truth in the repository and with the workflow rules in `PROJECT_WORKFLOW_CHARTER.md`.

This guide is updated on committed architectural changes and should be sufficient to hand off work into a fresh chat session without depending on older conversation context.

---

## Source of truth and working assumptions

Current source of truth folder:

- `C:\Users\haley\OneDrive\Desktop\CorrespondenceVisualizer\`

Current active development branch for MapLibre-native work:

- `maplibre-native-geographic-view`

Current branch baseline at this handoff:

- **`268b18c` — `Add MapLibre hover feedback`**

Current `main` / MapLibre preview prototype checkpoint:

- **`10051c0` — `Add MapLibre selected filter layers`**
- Tag: **`checkpoint-maplibre-preview-prototype`**

Pre-MapLibre clean rollback point:

- **`4e08720` — `Direct workflow charter baseline reference to changelog`**

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

Current panel / inspector boundaries in `src/`:

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

- `src/mapLayoutHelpers.js`
- `src/mapStageComponents.jsx`
- `src/interactionHelpers.js`
- `src/mapInteractionHandlers.js`
- `src/timelinePlaybackHelpers.js`
- `src/timelinePlaybackComponents.jsx`
- `src/exportHelpers.js`
- `src/personForceLayoutHelpers.js`
- `src/mapLibreFeatureBuilders.js`
- `src/mapLibreLayerConfig.js`
- `src/mapStyleConfig.js`

Maintainer/workflow documents:

- `README.md`
- `MAINTAINERS_GUIDE.md`
- `PROJECT_WORKFLOW_CHARTER.md`
- `CHANGELOG.md`
- `docs/MAPLIBRE_NATIVE_GEOGRAPHIC_VIEW_PLAN.md`

---

## Architectural summary

Peridot is a Vite/React/Tailwind correspondence visualizer with three user-facing visualization choices:

- **People**
- **Place**
- **Force-Directed**

Internally, the app still uses the geographic/person view split plus person layout mode, but the user-facing control model uses direct view buttons.

The production app includes:

- CSV ingestion and normalization
- graph derivation
- interactive SVG-based rendering
- year-based timeline filtering and playback
- shared side-panel inspection workflow
- persistent side-panel icon rail with dedicated Controls, Data Inputs, Export, Timeline, and Inspector tabs
- theme presets and visual controls
- export tools for image and tabular outputs

The main maintenance challenge remains structural concentration in `src/App.jsx`, but that concentration has been reduced through bounded extraction passes.

The current person-network layouts are:

- **geographic-anchor**
- **force-directed** using pre-settled `d3-force`

The force-directed person view renders on a clean theme-driven background rather than on top of the geographic map backdrop.

---

## MapLibre-native branch status

The `maplibre-native-geographic-view` branch is a design and implementation branch for a future MapLibre-native geographic subsystem.

Current committed state at `268b18c`:

- `src/MapLibreMapStage.jsx` owns the MapLibre map instance, lifecycle, source/layer updates, preview diagnostics, interaction wiring, dynamic clusters, hidden cluster-member nodes, curved aggregated visible-endpoint routes, hover feedback, selected feedback, and Inspector routing for nodes, clusters, and aggregated routes.
- `src/mapLibreFeatureBuilders.js` owns pure MapLibre feature construction for the original node and route GeoJSON features.
- `src/mapLibreLayerConfig.js` owns the earlier route/node source IDs, selected filters, selected ID filter helpers, and route/node layer definition builders. Newer cluster/aggregate behavior currently remains mostly in `MapLibreMapStage.jsx` after the extraction regression.
- `src/mapStyleConfig.js` owns MapLibre style configuration.
- The preview remains gated behind `?maplibrePreview=1`.
- The production D3/SVG map remains unchanged.

Confirmed MapLibre preview capabilities at `268b18c`:

- renders Peridot node features as MapLibre circle layers in the Place-view preview path
- renders dynamic MapLibre clusters from current node features
- renders cluster count labels
- hides individual blue nodes when represented by visible clusters
- routes cluster clicks into the existing Inspector path
- renders curved aggregated visible-endpoint routes between visible nodes and visible clusters
- aggregates route thickness by represented letter volume
- routes aggregated route clicks into the Inspector and displays aggregated route details
- supports selected visual feedback for clusters and aggregated routes
- supports hover feedback for unclustered nodes, dynamic clusters, and aggregated routes
- prioritizes node/cluster hover over crossing routes in dense areas
- keeps the production D3/SVG path unchanged

Unsolved MapLibre-native areas:

- only the **Place** view currently has visible MapLibre nodes/edges; **People** and **Force-Directed** still need functional treatment in the MapLibre branch
- playback highlighting parity remains unimplemented in the MapLibre preview
- final Peridot-aligned basemap and styling choices remain open
- export parity remains undecided because the live MapLibre map is canvas/WebGL-based while the existing export path is SVG-oriented
- `src/MapLibreMapStage.jsx` now contains substantial working lifecycle, clustering, route aggregation, hover, selection, and Inspector-bridge logic; broad extraction is risky

Important migration findings:

- The cluster source/layer lifecycle problem was solved incrementally: static cluster source/layer proof, dynamic cluster source, cluster click routing, node hiding, route aggregation, labels, and hover feedback.
- The `dd148e1` structural extraction attempt regressed the migrated overlay and was superseded by `c0a4b8a`. Future extraction should be tiny, source-of-truth verified, and tested immediately.

---

## Current module responsibilities

### `src/App.jsx`

Main orchestration file. It owns top-level state, derived data wiring, workspace composition, theme token definitions, side-panel contract building, timeline state, inspector navigation state, and export wiring. It also gates the MapLibre preview path behind `?maplibrePreview=1`.

### `src/MapLibreMapStage.jsx`

MapLibre preview/prototype stage. It should be treated as a bounded file with its own delivery protocol: read the exact current committed GitHub file, generate a full-file replacement, make only the bounded planned changes, provide `.txt` and `.jsx` versions, and have the user copy the `.txt` into place.

Current responsibilities:

- initialize and manage the MapLibre map instance
- add/update MapLibre route and node sources/layers
- add/update dynamic cluster sources/layers and cluster label layers
- hide cluster-member nodes when represented by visible clusters
- build curved aggregated visible-endpoint routes between visible nodes/clusters
- add/update route, node, cluster, aggregated-route hit and selected/hover feedback layers
- route MapLibre node, cluster, and aggregated-route clicks into the existing Inspector handlers
- preserve aggregated route payloads for Inspector display
- provide hover feedback with node/cluster priority over crossing routes
- display preview diagnostics

Do not casually add zoom-responsive cluster or aggregation logic to the map-construction effect. Future cluster and aggregation work must protect viewport centering/reset behavior.

### `src/mapLibreFeatureBuilders.js`

Pure MapLibre feature-building helper module. Current responsibilities:

- determine usable longitude/latitude values
- build projectable node maps
- build node GeoJSON features
- build route GeoJSON features
- count projectable routes

Future cluster feature builders should be added here only after a local source/layer lifecycle diagnostic proves the cluster source can be added and rendered correctly.

### `src/mapLibreLayerConfig.js`

MapLibre layer/source schema module. Current responsibilities:

- route source/layer IDs
- route hit-layer ID
- node source/layer ID
- selected node/route layer IDs
- empty selected filters
- selected ID filter builder
- route, route-hit, node, selected route, and selected node layer definition builders

Future cluster layer configuration should be added only after cluster source/layer lifecycle is understood.

### `src/mapStyleConfig.js`

MapLibre style configuration for the current preview path.

### `src/LeftControlPanel.jsx`

Owns the shared side-panel shell and persistent icon rail. Compatibility-sensitive `showLeftSidebar` / `showRightSidebar` state names still exist and should not be casually renamed because they are tied to inspector auto-open behavior.

### `src/InspectorPanel.jsx`

Owns inspector content only. It no longer owns the outer panel shell.

### `src/InspectorClusterView.jsx`

Owns the production cluster inspector view. Current behavior groups contained members by place and sorts groups/members by represented visible volume.

### `src/mapLayoutHelpers.js`

Pure D3/SVG map/layout helper logic for viewport construction, clustering, cluster radius calculation, label visibility, and geometric calculations.

### `src/interactionHelpers.js`

Pure interaction-resolution and selection-building helpers.

### `src/mapInteractionHandlers.js`

Top-level map interaction handlers for the production D3/SVG path.

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
- dedicated rail tabs for Controls, Data Inputs, Export, Timeline, and Inspector
- Data Inputs, Export, and Timeline moved out of the general Controls panel into dedicated views
- shell-level open/close behavior
- Inspector auto-opens from node, edge, and cluster interactions

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

### Map and sizing capabilities

- dynamic node radius contrast based on visible active data
- volume-based zoom-responsive cluster sizing in the production D3/SVG path
- zoom-responsive proximity clustering for nearby nodes/places in the production D3/SVG path
- edge sizing unchanged by the recent node/cluster sizing work

### Export capabilities

- SVG export
- PNG export
- nodes CSV export
- edges/routes CSV export
- export controls now appear in a dedicated side-panel Export tab

---

## Current theme and panel state

The default full-app theme remains **Peridot-inspired**.

Other retained presets still function as map-focused alternatives:

- Early modern map
- Modern map

Important current side-panel state:

- the persistent rail, not a horizontal top-tab row, is now the panel-view switcher
- rail tabs are:
  1. **Controls** — Visualization Type, Display Controls, Theme, Summary and Diagnostics, and remaining general options
  2. **Data Inputs** — Geography, Raw Data, and Person Metadata upload controls
  3. **Export** — SVG, PNG, nodes CSV, and edges/routes CSV export controls
  4. **Timeline** — year-range filtering and playback controls
  5. **Inspector** — selected nodes, edges, clusters, linked records, and inspector-internal navigation

---

## Recent development trajectory

### MapLibre preview and native subsystem sequence

#### `1d816a5` — Add MapLibre hybrid map-system audit

Added the first MapLibre migration audit and planning document.

#### `93f0961` — Add isolated MapLibre map stage

Installed `maplibre-gl`, added `MapLibreMapStage.jsx`, and added `mapStyleConfig.js`.

#### `da1463f` — Add MapLibre workspace preview path

Inserted the MapLibre preview into the real workspace behind `?maplibrePreview=1`.

#### `33afaae` — Add MapLibre preview diagnostics

Added visible diagnostics to the MapLibre preview path.

#### `6096069` — Add MapLibre projection probe

Added projected node probes to confirm coordinate alignment.

#### `443d7ac` — Add MapLibre route projection probe

Added projected route probes.

#### `1f0d322` — Render MapLibre route probes as GeoJSON layer

Moved routes into a MapLibre GeoJSON source/layer.

#### `7eebdee` — Add simple MapLibre node layer probe

Moved nodes into a MapLibre GeoJSON source/layer.

#### `2597462` — Remove MapLibre SVG node probe overlay

Removed obsolete SVG node probes from the MapLibre preview.

#### `5f3f053` — Route MapLibre feature clicks to inspector

Routed MapLibre node/route clicks into the existing Inspector.

#### `f2fdcf9` — Add cursor-only MapLibre hover detection

Added safe cursor-only hover detection.

#### `b7c61a2` — Add MapLibre route hit layer

Added a transparent route hit layer for easier route interaction.

#### `10051c0` — Add MapLibre selected filter layers

Added selected node/route visual feedback through source filters.

#### `b7fb244` — Add MapLibre native geographic view plan

Added the native subsystem design document.

#### `c420a5d` — Extract MapLibre feature builders

Moved pure feature-building logic to `mapLibreFeatureBuilders.js`.

#### `4c9ed6f` — Extract MapLibre layer configuration

Moved MapLibre source/layer schema and definitions to `mapLibreLayerConfig.js`.

#### `3f26cc2` — Broaden MapLibre lifecycle diagnostics

Broadened passive diagnostics for sources, layers, setup phase, and rendered counts while preserving route/node rendering.

#### `bb11f6a` — Add static MapLibre cluster lifecycle diagnostic

Proved that MapLibre could receive and render a static cluster-like source/layer in the current stage lifecycle.

#### `1e8456f` — Add dynamic MapLibre cluster diagnostic

Added a dynamic MapLibre clustered source derived from current node features.

#### `be7d9ae` — Route MapLibre cluster clicks to inspector

Routed dynamic MapLibre cluster clicks into the existing Inspector path.

#### `8a563cc` — Hide MapLibre cluster member nodes

Hid individual node features when represented by visible clusters.

#### `526534a` — Aggregate MapLibre routes between visible endpoints

Aggregated directed routes between visible nodes and visible clusters.

#### `084ce9d` — Enrich MapLibre aggregated route inspector payload

Added richer metadata to aggregated route click payloads.

#### `2ccaaeb` — Show MapLibre aggregated route details in inspector

Rendered aggregated route details in the edge Inspector.

#### `57d3cc1` — Add MapLibre cluster count labels

Added count labels to dynamic MapLibre clusters.

#### `dd148e1` / `c0a4b8a` — Extraction regression and restore

A constants extraction attempt regressed the migrated overlay and was immediately superseded by a restore commit. Use this as a cautionary example for future `MapLibreMapStage.jsx` structural work.

#### `8137db7` — Curve MapLibre aggregated routes

Changed aggregated routes to curved multi-point LineStrings.

#### `268b18c` — Add MapLibre hover feedback

Added immediate hover feedback for nodes, clusters, and aggregated routes, with node/cluster hover priority over crossing routes.

### Existing production D3/SVG cluster and sizing sequence

#### `ed39e55` — Make cluster nodes open actionable inspector views

Made cluster nodes clickable and made contained cluster members navigable through the inspector.

#### `3187d05` — Increase dynamic node radius contrast

Introduced stronger dynamic node radius contrast based on active data while preserving caps.

#### `fed4b5b` — Use volume-based zoom-responsive cluster sizing

Made cluster sizing reflect represented letter volume and made clustering respond more appropriately to zoom/proximity.

#### `63003c1` — Group cluster inspector members by place

Grouped cluster inspector members by place and ordered groups/members by volume.

### Shared side-panel sequence

The shared side-panel and icon rail sequence remains documented in `CHANGELOG.md`. It includes the transition to a shared side-panel shell, persistent icon rail, dedicated Data Inputs / Export / Timeline tabs, and the content-only Inspector panel.

---

## Deferred / rolled-back work

### MapLibre cluster diagnostic attempts, after `4c9ed6f`

Several uncommitted cluster attempts were restored. The repeated diagnostic result was that cluster features existed in React-side state but MapLibre reported no cluster source and no cluster layer. A broader attempt also caused zoom/pan flashes and reset behavior. Future cluster work should start with lifecycle instrumentation inside `MapLibreMapStage.jsx`, not another visual or layer-order adjustment.

### MapLibre structural extraction caution, after `dd148e1`

The `dd148e1` extraction attempt showed that broad structural rewrites of `MapLibreMapStage.jsx` can silently reintroduce older preview-stage behavior and remove newer migration features. Future extraction should proceed only when there is a concrete maintenance reason, and should use tiny, directly verified patches rather than broad replacement.

Safe candidates include ID constants and pure layer-definition builders. Unsafe candidates include live map lifecycle setup, zoom/move recalculation, hidden-node filtering, selected/hover filter application, and Inspector payload construction.

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
- MapLibre source/layer lifecycle
- MapLibre cluster setup
- MapLibre zoom/move state and map reconstruction risk

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

### Special delivery rule for `src/MapLibreMapStage.jsx`

When the sync ritual confirms GitHub/local alignment, future changes to `src/MapLibreMapStage.jsx` should default to this protocol:

1. Read the exact current committed file from GitHub.
2. Treat that file as the source of truth.
3. Generate a complete replacement file from that exact source.
4. Make only the planned bounded changes.
5. Provide `.txt` and `.jsx` versions.
6. The user copies the `.txt` into place.
7. Build/test.
8. Commit if accepted.

Patch scripts should be reserved mainly for `App.jsx` or other large/high-risk files where full replacement is less safe.

---

## Fresh-chat handoff note

A future chat should start from:

```text
Source of truth folder:
C:\Users\haley\OneDrive\Desktop\CorrespondenceVisualizer\

Active branch:
maplibre-native-geographic-view

Current branch baseline:
268b18c — Add MapLibre hover feedback

Current main / MapLibre preview checkpoint:
10051c0 — Add MapLibre selected filter layers
Tag: checkpoint-maplibre-preview-prototype

Pre-MapLibre rollback point:
4e08720 — Direct workflow charter baseline reference to changelog
```

A future chat should also be told that:

- Peridot is the current app identity.
- The production fixed basemap is `countries50m`.
- itch.io packaging support is already committed.
- the production app uses a shared left-side panel with a persistent icon rail.
- `InspectorPanel.jsx` is content-only.
- `LeftControlPanel.jsx` owns the shared panel shell and rail-tab views.
- current production cluster features are committed in the D3/SVG path.
- The MapLibre branch now has a migrated Place-view overlay with dynamic clusters, cluster labels, hidden cluster-member nodes, curved aggregated routes, aggregated route Inspector details, selected feedback, and hover feedback.
- Only Place view currently has visible MapLibre nodes/edges; People and Force-Directed functionality are the next branch-level parity priority.
- After all three views are functional, the next design priority is prettier / more Peridot-aligned map aesthetics, followed by playback highlighting parity.
- documentation should preserve the full commit trajectory carefully and default to additive updates.
