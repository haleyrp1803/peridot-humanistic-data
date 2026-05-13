# Peridot Hybrid Map-System Audit and MapLibre Migration Decision Memo

## Pass 0 status

**Change type:** documentation / planning  
**Implementation status:** no code changes proposed in this pass  
**Current source of truth:** `C:\Users\haley\OneDrive\Desktop\CorrespondenceVisualizer\`  
**Current confirmed baseline for this chat:** `4e08720 — Direct workflow charter baseline reference to changelog`  
**Purpose:** define a safe MapLibre migration strategy before dependency, rendering, projection, or interaction code is changed.

---

## Executive summary

Peridot should migrate toward a **MapLibre-first live geographic map architecture**, but the migration should begin with a **hybrid bridge** rather than an immediate rewrite. The short-term bridge should place a MapLibre basemap in the live geographic map area while preserving Peridot's existing SVG/D3 correspondence overlay long enough to validate coordinate alignment, panel behavior, inspector auto-open, timeline filtering, clustering, and export assumptions.

The long-term target should be **MapLibre-native GeoJSON sources and layers** for geographic correspondence routes, nodes, labels, and Peridot-derived clusters. Force-Directed mode should remain a separate non-geographic SVG/D3 force layout because it is not fundamentally a map. Export should remain a Peridot-owned vector/SVG export path at first; the live MapLibre canvas should not become the authoritative export surface until a later export-specific decision.

---

## Current Peridot map-system audit

### Current architecture

Peridot currently uses a React/Vite/Tailwind app structure with substantial map, inspector, timeline, panel, and export logic already separated into modules, but important orchestration remains concentrated in `src/App.jsx`.

Current map-relevant modules include:

- `src/App.jsx`
- `src/mapLayoutHelpers.js`
- `src/mapStageComponents.jsx`
- `src/mapInteractionHandlers.js`
- `src/interactionHelpers.js`
- `src/exportHelpers.js`
- `src/personForceLayoutHelpers.js`

Current live visualization modes:

1. **People**
2. **Place**
3. **Force-Directed**

Current layout model:

- **Place view:** geographic correspondence routes between places.
- **People view:** person network anchored to geographic locations.
- **Force-Directed view:** non-geographic pre-settled D3-force person network.

Current map/rendering capabilities:

- SVG-based map-stage rendering.
- D3 geographic projection / geometry logic.
- `world-atlas` / TopoJSON country basemap.
- Dynamic node radius contrast based on active data.
- Volume-based zoom-responsive cluster sizing.
- Zoom-responsive proximity clustering.
- Edge sizing preserved independently from node and cluster sizing.
- SVG and PNG export from Peridot's vector/SVG rendering pipeline.

### Current interaction and research workflow

Peridot's most important value is not the current basemap. It is the research interaction layer:

- hover and click inspection;
- node, edge, and cluster selection;
- inspector auto-open from map clicks;
- cluster inspector views;
- cluster members grouped by place;
- person/place internal inspector navigation;
- linked record browsing;
- year-based timeline filtering and playback;
- SVG/PNG/CSV export tools.

These behaviors are already known to be fragile in places, so the map migration should protect them explicitly.

---

## MapLibre decision

### Chosen direction

Use **MapLibre GL JS** as the intended live geographic map engine.

### Why MapLibre

MapLibre is a WebGL browser map library whose map appearance is controlled by a style document. It is better suited than the current D3-only basemap for modern pan/zoom behavior, vector/raster basemap styling, layer ordering, and future data-driven map-layer control.

MapLibre also gives Peridot a clearer long-term architecture:

```text
MapLibre geographic map
  ├─ basemap style
  ├─ Peridot route GeoJSON source/layers
  ├─ Peridot node GeoJSON source/layers
  ├─ Peridot cluster GeoJSON source/layers
  └─ Peridot hover/click selection routing into existing inspector state

Force-Directed mode
  └─ existing non-geographic SVG/D3 force layout

Exports
  └─ Peridot-owned vector/SVG export path, at least initially
```

### What MapLibre should not own

MapLibre should not own:

- CSV ingestion;
- graph derivation;
- timeline bucketing/filtering;
- inspector payload semantics;
- cluster membership semantics;
- export row building;
- force-directed person layout.

These should remain Peridot-owned.

---

## Hybrid migration target

### Short-term target: hybrid bridge

The first production-facing migration stage should be:

```text
MapLibre basemap
  └─ existing Peridot SVG overlay
       ├─ nodes
       ├─ edges
       ├─ clusters
       ├─ labels
       └─ existing hover/click handlers
```

This bridge is not the final architecture. It is a safety mechanism that lets us verify MapLibre's map container, projection behavior, zoom/pan lifecycle, and layout compatibility before rewriting the data layers.

### Long-term target: native MapLibre geographic layers

Once the bridge is stable, migrate the geographic overlay into MapLibre sources/layers:

```text
MapLibre basemap
  ├─ route GeoJSON source + line layers
  ├─ node GeoJSON source + circle/symbol layers
  ├─ cluster GeoJSON source + circle/symbol layers
  └─ feature events routed into existing Peridot inspector logic
```

The cluster source should remain **Peridot-derived**, not generic MapLibre clustering, because Peridot's clusters have research-specific inspector behavior and member grouping.

---

## Key architectural decisions

### Decision 1: MapLibre becomes the live geographic map engine

**Chosen:** MapLibre for Place view and geographic-anchor People view.  
**Rejected:** staying D3-only for live geography.  
**Reason:** D3-only gives maximum SVG/export control, but it leaves Peridot responsible for too much map-like behavior: basemap rendering, projection, pan/zoom, and map-layer management.

### Decision 2: Force-Directed mode remains separate

**Chosen:** Force-Directed mode remains custom SVG/D3.  
**Rejected:** forcing the force-directed person network into MapLibre.  
**Reason:** Force-Directed mode is not geographic; using MapLibre there would add map-engine complexity without conceptual benefit.

### Decision 3: Use a hybrid SVG overlay bridge before native layers

**Chosen:** temporary MapLibre basemap + existing Peridot SVG overlay.  
**Rejected:** immediately rewriting nodes, edges, clusters, and labels as MapLibre layers.  
**Reason:** the current inspector/timeline/cluster behavior is too valuable and too fragile to rewrite in the same pass as the map-engine swap.

### Decision 4: Native MapLibre layers are the long-term target

**Chosen:** migrate routes, nodes, labels, and clusters to GeoJSON-backed MapLibre layers after the bridge is stable.  
**Rejected:** keeping SVG overlays permanently.  
**Reason:** MapLibre's long-term value comes from its source/layer model, WebGL rendering, style expressions, and feature events.

### Decision 5: Keep Peridot's cluster semantics

**Chosen:** Peridot derives cluster membership and renders clusters through MapLibre.  
**Rejected:** adopting MapLibre automatic GeoJSON clustering as the default.  
**Reason:** Peridot clusters are not only visual aggregations. They power grouped inspector views, member click-through, visible-volume ordering, and Back navigation.

### Decision 6: Export remains a separate Peridot-owned subsystem

**Chosen:** retain Peridot vector/SVG export path initially.  
**Rejected:** making the live MapLibre canvas the authoritative SVG/PNG export source in the first migration.  
**Reason:** MapLibre renders through WebGL/canvas. Live-map screenshot export has different technical and attribution constraints than the current Peridot SVG export path.

---

## Numbered implementation passes

### Phase 1 — Safe foothold

#### Pass 1.1 — Add MapLibre dependency and isolated shell

**Change type:** structural  
**Goal:** install MapLibre and create an isolated map-stage component without replacing the current map.

**Likely files:**

- `package.json`
- `package-lock.json`
- `src/MapLibreMapStage.jsx`

**In scope:**

- install `maplibre-gl`;
- import MapLibre CSS;
- create an isolated MapLibre component;
- render a simple map behind a temporary internal flag or developer-only test area;
- verify build.

**Out of scope:**

- no D3 map removal;
- no live production map replacement;
- no inspector changes;
- no timeline changes;
- no export changes.

**Acceptance test:**

```powershell
npm.cmd run build
npm.cmd run dev
```

The current Peridot map still works, and the isolated MapLibre map renders without breaking layout.

---

#### Pass 1.2 — Add map style configuration

**Change type:** structural  
**Goal:** centralize MapLibre style/source choices before they spread into app logic.

**Likely files:**

- `src/mapStyleConfig.js`

**In scope:**

- define initial style URL or local style object;
- define attribution expectations;
- define notes about provider/deployment constraints;
- avoid API-key handling unless needed by the selected style provider.

**Out of scope:**

- no user-facing style selector yet;
- no theme integration yet.

**Acceptance test:**

The MapLibre shell reads style configuration from one module rather than hard-coding it inside `App.jsx`.

---

#### Pass 1.3 — Mount MapLibre inside the real map-stage layout behind a non-production toggle

**Change type:** structural  
**Goal:** test MapLibre inside the actual Peridot layout without making it the primary map.

**Likely files:**

- `src/App.jsx`
- `src/MapLibreMapStage.jsx`

**In scope:**

- render MapLibre in the same stage dimensions used by the current map;
- verify side panel and rail do not collide with MapLibre controls;
- call `map.resize()` when needed.

**Out of scope:**

- no overlay migration;
- no production replacement.

**Acceptance test:**

Panel open/close and rail behavior remain normal while the MapLibre test map occupies the map stage.

---

### Phase 2 — Temporary hybrid bridge

#### Pass 2.1 — Add MapLibre projection adapter

**Change type:** structural  
**Goal:** make coordinate projection swappable without rewriting all map logic.

**Likely files:**

- `src/mapLayoutHelpers.js`
- possibly `src/mapProjectionAdapters.js`
- possibly `src/App.jsx`

**In scope:**

- define a projection adapter boundary;
- keep existing D3 projection path intact;
- add a MapLibre `map.project([lng, lat])` path for live MapLibre use.

**Out of scope:**

- no native MapLibre data layers yet;
- no cluster rewrite.

**Acceptance test:**

Known coordinates can be projected through either the old D3 path or new MapLibre path without changing data derivation.

---

#### Pass 2.2 — Render current SVG overlay over MapLibre

**Change type:** behavior  
**Goal:** make the current Peridot overlay follow MapLibre pan/zoom.

**Likely files:**

- `src/App.jsx`
- `src/MapLibreMapStage.jsx`
- `src/mapLayoutHelpers.js`
- `src/mapStageComponents.jsx`

**In scope:**

- place existing SVG overlay above MapLibre;
- update overlay positions on MapLibre `move`, `zoom`, and `resize`;
- preserve existing SVG click/hover capture.

**Out of scope:**

- no native MapLibre feature layers yet;
- no cluster semantic changes.

**Acceptance test:**

Known locations visually align with the MapLibre basemap and do not drift during pan/zoom.

---

#### Pass 2.3 — Inspector and timeline regression check

**Change type:** behavior  
**Goal:** confirm the hybrid map does not break Peridot's research workflow.

**In scope:**

- test node click;
- test edge click;
- test cluster click;
- test contained cluster-member navigation;
- test Back behavior;
- test timeline filtering;
- test playback.

**Out of scope:**

- no code changes unless a specific regression is found.

**Acceptance test:**

```text
node click opens Inspector
edge click opens Inspector
cluster click opens Inspector
contained cluster member opens detail
Back behavior remains intact
timeline filtering still updates visible nodes/edges/clusters
```

---

### Phase 3 — Native MapLibre geographic layers

#### Pass 3.1 — Convert routes to GeoJSON line layers

**Change type:** behavior  
**Goal:** move correspondence routes from SVG paths to MapLibre line layers.

**Likely files:**

- `src/mapLibreDataAdapters.js`
- `src/MapLibreMapStage.jsx`
- `src/App.jsx`

**In scope:**

- derive route `FeatureCollection`;
- create visible and hit-target line layers;
- route click/hover feature events into existing inspector logic.

**Out of scope:**

- nodes and clusters remain SVG/hybrid for this pass.

**Acceptance test:**

Clicking an edge opens the same Inspector edge detail as before.

---

#### Pass 3.2 — Convert nodes to GeoJSON circle/symbol layers

**Change type:** behavior  
**Goal:** move geographic nodes to MapLibre point layers.

**In scope:**

- derive node `FeatureCollection`;
- render data-driven circle radius/color;
- render labels through symbol layers or a temporary retained SVG label layer;
- route click/hover events into existing inspector logic.

**Out of scope:**

- cluster conversion deferred to the next pass.

**Acceptance test:**

Clicking a person/place node opens the same Inspector detail as before.

---

#### Pass 3.3 — Convert Peridot-derived clusters to GeoJSON layers

**Change type:** behavior  
**Goal:** render Peridot's existing cluster semantics through MapLibre layers.

**In scope:**

- keep Peridot cluster derivation;
- convert clusters to a GeoJSON source;
- render cluster circles and labels;
- preserve grouped cluster inspector behavior.

**Out of scope:**

- do not adopt generic MapLibre clustering yet.

**Acceptance test:**

```text
cluster click opens Inspector
cluster members are grouped by place
member click opens detail
Back returns to the cluster view
cluster sizing remains volume-based
```

---

#### Pass 3.4 — Reconcile timeline/playback source updates

**Change type:** behavior  
**Goal:** ensure MapLibre sources update cleanly during filters and playback.

**In scope:**

- update route/node/cluster sources when filters change;
- preserve or clear selected state intentionally;
- implement playback highlighting through layers or feature state.

**Out of scope:**

- no timeline UI redesign.

**Acceptance test:**

Timeline playback changes visible map features and highlight state without breaking the Inspector.

---

### Phase 4 — Preserve non-map mode and export

#### Pass 4.1 — Keep Force-Directed mode non-MapLibre

**Change type:** behavior  
**Goal:** keep Force-Directed mode as its current custom SVG/D3 rendering path.

**In scope:**

- clearly branch geographic vs. force-directed map stage;
- cleanly mount/unmount or hide MapLibre when switching views;
- preserve clean themed background in Force-Directed mode.

**Acceptance test:**

Switching People / Place / Force-Directed does not white-screen, reset panels unexpectedly, or initialize unnecessary map resources in Force-Directed mode.

---

#### Pass 4.2 — Export policy implementation

**Change type:** behavior / documentation  
**Goal:** preserve exports after live MapLibre migration.

**Recommended export policy:**

- CSV exports remain unchanged.
- SVG/PNG exports remain Peridot-owned vector exports.
- Live MapLibre basemap is not treated as the authoritative export surface at first.
- UI copy should make this explicit if the exported visual map differs from the live basemap.

**Acceptance test:**

SVG, PNG, nodes CSV, and edges/routes CSV exports still work after the MapLibre migration.

---

### Phase 5 — Theme integration and documentation

#### Pass 5.1 — Add restrained map-style/theme integration

**Change type:** visual  
**Goal:** connect Peridot's existing theme model to MapLibre style choices without creating a full style studio.

**In scope:**

- one controlled map-style selector or theme-to-style mapping;
- separate basemap style from Peridot overlay colors;
- preserve existing Peridot theme tokens for overlay styling.

**Out of scope:**

- no arbitrary MapLibre style editor;
- no large theme-studio feature.

**Acceptance test:**

Changing map style changes only the basemap style and does not alter filters, timeline state, selected inspector item, or export settings.

---

#### Pass 5.2 — Documentation refresh

**Change type:** documentation  
**Goal:** update maintainer docs after a stable MapLibre baseline.

**Files likely affected:**

- `README.md`
- `MAINTAINERS_GUIDE.md`
- `CHANGELOG.md`
- possibly `PROJECT_WORKFLOW_CHARTER.md`

**Documentation should record:**

- MapLibre is the live geographic map engine;
- Force-Directed remains custom SVG/D3;
- Peridot data is adapted into GeoJSON sources/layers for geographic modes;
- clustering remains Peridot-owned;
- exports use a separate vector path;
- new fragile zones around MapLibre source/layer lifecycle and style reloads.

**Acceptance test:**

A fresh chat can read the docs and understand the live map architecture without relying on this conversation.

---

## New fragile zones introduced by MapLibre

1. **MapLibre source/layer lifecycle**
   - Custom sources and layers must be attached after style load.
   - Style reloads may remove custom layers unless we reattach them.

2. **Geographic/non-geographic view switching**
   - MapLibre should be active for Place and geographic-anchor People views.
   - Force-Directed mode should remain separate.

3. **Projection boundary**
   - During the hybrid bridge, overlay positions must update from MapLibre map projection rather than D3 projection.

4. **Cluster zoom mapping**
   - Leaf/D3 scale assumptions will not directly match MapLibre zoom levels.

5. **MapLibre feature events**
   - Click/hover behavior must route into existing Peridot inspector logic.

6. **Export divergence**
   - Live WebGL/canvas map rendering and Peridot vector export are different rendering systems.

7. **Attribution and basemap provider policy**
   - MapLibre is the library, not the data provider.
   - Basemap style/data providers may have attribution and usage requirements.

---

## Source/layer lifecycle principles

Use consistent layer and source names. Suggested conventions:

```text
peridot-routes-source
peridot-routes-hit-layer
peridot-routes-visible-layer

peridot-nodes-source
peridot-nodes-circle-layer
peridot-nodes-label-layer
peridot-nodes-hover-layer
peridot-nodes-selected-layer

peridot-clusters-source
peridot-clusters-circle-layer
peridot-clusters-label-layer
```

Rules:

1. Add sources before layers.
2. Add hit layers separately from visible layers where needed.
3. Add routes below nodes.
4. Add clusters above ordinary nodes if cluster mode is active.
5. Add labels above circles.
6. Re-add Peridot layers after style changes.
7. Keep inspector payload construction outside MapLibre rendering code.

---

## Acceptance-test suite for the full migration

After every meaningful MapLibre pass, test:

```text
Build succeeds.
App opens in People view.
Place view renders.
People geographic-anchor view renders.
Force-Directed view renders without MapLibre dependency.
Node click opens Inspector.
Edge click opens Inspector.
Cluster click opens Inspector.
Contained cluster member opens detail.
Back behavior works.
Timeline filtering updates visible features.
Playback updates visible/highlighted features.
Export buttons still work according to current export policy.
Side-panel rail remains usable open and closed.
No unexpected map reset occurs after panel/timeline/inspector interaction.
```

---

## Recommended next pass

Proceed to **Pass 1.1 — Add MapLibre dependency and isolated shell** only.

Do not replace the current map in that pass. The first code pass should prove that MapLibre can be installed, imported, styled, initialized, cleaned up, and built inside the Vite/React app without disrupting the current D3/SVG map.

