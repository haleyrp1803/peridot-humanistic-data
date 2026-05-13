# MapLibre-Native Geographic View Plan

## Status and purpose

This document is the Pass 0 design/audit document for pivoting Peridot from an incremental MapLibre preview adaptation toward a MapLibre-native geographic map subsystem.

It is written for the branch:

```text
maplibre-native-geographic-view
```

Current MapLibre preview checkpoint:

```text
10051c0 — Add MapLibre selected filter layers
```

Rollback landmarks:

```text
Pre-MapLibre clean rollback point:
4e08720 — Direct workflow charter baseline reference to changelog

MapLibre preview prototype checkpoint:
checkpoint-maplibre-preview-prototype / 10051c0 — Add MapLibre selected filter layers

Native MapLibre subsystem branch:
maplibre-native-geographic-view
```

The purpose of this document is to stop treating the MapLibre work as a direct adaptation of the existing D3/SVG behavior and instead define a clean MapLibre-native geographic view architecture. The target is to preserve Peridot's research semantics while rebuilding the live geographic map substrate around MapLibre's source/layer/event model.

---

## Executive summary

The current MapLibre preview has already proven that MapLibre can render Peridot's geographic nodes and routes as GeoJSON sources/layers, use a route hit layer for easier targeting, route feature clicks into the existing Inspector, provide cursor-only hover feedback, and visually mark selected nodes/routes through selected filter layers.

However, the failed cluster experiment showed that directly adapting the existing D3/SVG cluster behavior into `MapLibreMapStage.jsx` is the wrong next step. The symptom was decisive: zooming caused nodes/clusters to recompute, the screen flashed white, and the map reset to its default center/zoom. That points to a lifecycle boundary problem: map initialization, source/layer registration, source-data updates, and zoom-responsive cluster recomputation were not cleanly separated.

The next phase should define and build a MapLibre-native geographic subsystem with explicit source schemas, layer stack, update lifecycle, event model, selection model, and cluster/route behavior. The current preview should remain useful as a prototype and evidence base, but cluster behavior should not be patched further into the current file without first restructuring the MapLibre data/layer boundary.

---

## Current architecture audit: legacy Peridot geographic map

### Legacy rendering model

The production geographic view still lives primarily inside `src/App.jsx`. It uses D3 geography and SVG rendering. At the current checkpoint, `App.jsx` imports `geoNaturalEarth1`, `geoPath`, TopoJSON conversion, `countries50m`, and several extracted helper modules. It also imports `MapLibreMapStage`, which is currently gated behind the preview query parameter rather than replacing production behavior.

The production map path owns or coordinates:

- geographic projection
- country basemap rendering
- nodes
- edges/routes
- clusters
- labels
- hover cards
- selected visual state
- click routing
- inspector opening
- timeline/playback interaction
- export serialization

The production D3/SVG path visualizes selected state inline. Nodes and edges are rendered with conditional SVG attributes based on selected item kind and ID. This model works in SVG because render-time attribute changes can be controlled directly by React.

### Data and interaction semantics to preserve

The MapLibre-native work should preserve the semantic behaviors already validated in Peridot:

- clicking a node opens the relevant node/person/place Inspector view
- clicking an edge opens route/edge Inspector detail
- clicking blank map clears selection
- selected node/route is visibly distinguished
- route hit targeting is forgiving
- clusters represent grouped visible nodes at lower zoom levels
- clicking a cluster opens an actionable cluster Inspector view
- cluster members are grouped by place and ordered by visible volume
- clicking a member inside a cluster Inspector opens detail
- Inspector Back returns to the prior internal Inspector panel
- timeline filters update the visible graph
- Force-Directed mode remains a non-geographic/SVG mode unless separately redesigned

### Legacy risks

The legacy geographic map is already a known fragile zone. Changes that touch projection, clustering, selection, viewport centering/reset, inspector auto-open, timeline/playback, or export can interact unexpectedly. The MapLibre migration should therefore isolate live-map rendering from app-level graph semantics, rather than expanding `App.jsx` or introducing mixed D3/MapLibre behavior into the same render path.

---

## Current architecture audit: MapLibre preview prototype

### What works now

The current MapLibre preview path is gated behind:

```text
?maplibrePreview=1
```

At checkpoint `10051c0`, `src/MapLibreMapStage.jsx` includes:

- MapLibre map initialization
- MapLibre style config via `mapStyleConfig.js`
- GeoJSON route source
- visible gold route layer
- wide transparent route hit layer
- GeoJSON node source
- cyan node circle layer
- node/route click routing into existing Inspector handlers
- blank map click routing into existing blank-map handler
- cursor-only hover on nodes/routes
- selected route filter layer using the route source
- selected node filter layer using the node source
- node diagnostics in the preview panel

The working feature model is already close to MapLibre-native logic:

```text
route source
  visible route layer
  route hit layer
  selected route layer

node source
  visible node layer
  selected node layer
```

### What the preview has proven

The prototype has demonstrated several useful facts:

1. Peridot route features can be represented as GeoJSON `LineString` features.
2. Peridot node features can be represented as GeoJSON `Point` features.
3. MapLibre layers can render the same data that the legacy view derives.
4. MapLibre feature click events can bridge back to Peridot's Inspector semantics.
5. A route hit layer is effective and should be part of the final architecture.
6. Selected visual state should use MapLibre filters on existing sources rather than a separate selected feature source.
7. Full-file replacement is the preferred protocol for `MapLibreMapStage.jsx` changes when the repo is synced.

### What failed and what it taught us

The first cluster attempt failed because it combined too many behaviors:

- cluster derivation
- node hiding
- cluster rendering
- cluster click routing
- selected feedback
- route implications
- zoom responsiveness

The observed failure was:

```text
nodes disappeared at plausible cluster thresholds
clusters did not appear
routes did not respond to node disappearance
zooming caused flash/reset to the default view
```

The critical lesson is that cluster behavior must be introduced through a MapLibre-native update lifecycle. The map must not be reinitialized when zoom, source data, or clusters change.

---

## MapLibre-native target architecture

MapLibre GL JS is a browser mapping library that renders interactive maps with WebGL and controls map appearance through a style document. The Map object owns the interactive camera, event system, style, sources, and layers. A MapLibre-native Peridot geographic view should align with that model rather than recreate SVG-render logic inside React.

### Core principle

```text
Initialize the MapLibre map once.
Register sources and layers after style load.
Update GeoJSON source data imperatively with source.setData(...).
Update selection/visibility with layer filters and feature-state where appropriate.
Never recreate the map for graph, zoom, hover, selection, or cluster updates.
```

### Proposed file boundaries

The current `MapLibreMapStage.jsx` should not become a second `App.jsx`. The next phase should introduce helper boundaries:

```text
src/MapLibreMapStage.jsx
  React/MapLibre component boundary.
  Owns map initialization, lifecycle, layer registration, event handlers, and status diagnostics.

src/mapLibreFeatureBuilders.js
  Pure functions for building GeoJSON feature collections from Peridot graph state.

src/mapLibreLayerConfig.js
  Source IDs, layer IDs, layer ordering, paint/layout definitions, empty filters, and helper filters.

src/mapLibreClusterHelpers.js
  Pure cluster derivation for the MapLibre geographic view.
  May be separate from mapLibreFeatureBuilders.js once cluster logic grows.
```

This separation is important because the current preview file already contains data building, MapLibre lifecycle, layer setup, interaction handling, diagnostics, and selection logic in one file. That is acceptable for a prototype but not for the native subsystem.

---

## Proposed source schemas

### Route source

Source ID:

```text
peridot-route-source
```

Geometry:

```text
LineString
```

Core properties:

```text
id
sourceId
targetId
sourceLabel
targetLabel
count
routeKind
isAggregated
```

Possible future properties:

```text
sourceClusterId
targetClusterId
visibleCount
letterIds
```

### Route layers

```text
route-visible-layer
route-hit-layer
route-selected-layer
route-muted-layer or route-hidden-filter logic, if needed later
```

Layer responsibilities:

- `route-visible-layer`: visible line styling
- `route-hit-layer`: wide transparent interaction target
- `route-selected-layer`: selected route highlight, filter by `id`

### Node source

Source ID:

```text
peridot-node-source
```

Geometry:

```text
Point
```

Core properties:

```text
id
label
weight
degree
placeId
personId
nodeKind
isClustered
clusterId
```

### Node layers

```text
node-visible-layer
node-hit-layer, if needed later
node-selected-layer
node-label-layer, later
```

The current prototype uses only a visible circle layer and selected circle layer. A hit layer may become useful if node sizes become small.

### Cluster source

Source ID:

```text
peridot-cluster-source
```

Geometry:

```text
Point
```

Core properties:

```text
id
label
memberCount
representedVolume
memberIds
placeGroupCount
zoomBucket
```

Important: `memberIds` may not be usable as an array property in every MapLibre style/filter context. It can still be stored in feature properties for app lookup, but Inspector payloads should probably use a parallel JavaScript map keyed by cluster ID.

### Cluster layers

```text
cluster-visible-layer
cluster-hit-layer
cluster-label-layer
cluster-selected-layer
```

Layer responsibilities:

- `cluster-visible-layer`: visible cluster circle, radius based on represented volume
- `cluster-hit-layer`: large transparent interaction target
- `cluster-label-layer`: visible count/label
- `cluster-selected-layer`: highlight selected cluster

---

## Layer order

The likely layer stack, from bottom to top:

```text
basemap style layers
route-visible-layer
route-selected-layer
route-hit-layer
node-visible-layer
node-selected-layer
node-hit-layer, if added
cluster-visible-layer
cluster-selected-layer
cluster-label-layer
cluster-hit-layer
MapLibre controls / attribution
Peridot panel shell / diagnostics overlays
```

The route hit layer should remain above visible routes but should not prevent node or cluster selection. Node/cluster click handlers should have explicit priority over route click handling where geometries overlap.

---

## Event model

### Click priority

Click handling should use explicit priority:

```text
1. cluster hit layer
2. node layer / node hit layer
3. route hit layer
4. blank map
```

MapLibre layer click handlers may be used, but route click handlers must check whether a node or cluster is also under the click. This pattern already exists in the preview where route clicks check for node hits before handling the route.

### Hover model

Cursor-only hover is stable and should remain the first level of hover support.

Richer hover diagnostics should be added later in small passes:

```text
Pass 1: cursor-only hover
Pass 2: hover feature identity in diagnostic panel
Pass 3: hover card UI
Pass 4: optional feature-state hover styling
```

Avoid combining hover UI with cluster/routing changes.

### Selection model

Selected visual feedback should use filters on selected layers that reuse existing sources:

```text
selected node layer → filter by node id
selected route layer → filter by route id
selected cluster layer → filter by cluster id
```

Do not pass `selectedProps` from `App.jsx` into the MapLibre preview until the MapLibre-native subsystem has stable lifecycle boundaries. Do not use a separate selected GeoJSON source unless there is a specific reason.

---

## Cluster model

Cluster behavior needs an explicit design. It should not be patched as a visual afterthought.

### Cluster derivation options

#### Option A — Peridot-owned custom clustering

Peridot derives clusters from current visible nodes and current zoom.

Pros:

- preserves custom scholarly cluster semantics
- supports cluster Inspector payloads
- can group members by place and volume
- avoids relying on MapLibre's built-in clustering semantics

Cons:

- must manage zoom-responsive recomputation carefully
- must define route behavior under clusters
- requires a parallel cluster-member lookup

Recommendation: use this option.

#### Option B — MapLibre built-in GeoJSON clustering

MapLibre clusters a GeoJSON point source internally.

Pros:

- less custom clustering code
- native map clustering model

Cons:

- harder to preserve Peridot's existing cluster Inspector semantics
- cluster membership is less directly controlled
- grouping members by place/volume would require additional lookup or expansion logic

Recommendation: do not use as the first native implementation.

### Cluster data structures

Cluster derivation should return both:

```text
clusterFeatureCollection
clusterLookupById
```

The feature collection is for MapLibre rendering. The lookup is for Inspector payloads and member drill-down.

### Cluster update lifecycle

Cluster source updates must not trigger map reconstruction.

Preferred lifecycle:

```text
on graph/timeline/filter change:
  build current node/route inputs
  update node and route sources
  derive cluster data for current zoom bucket
  update cluster source

on zoomend/moveend or zoom bucket change:
  recompute clusters
  update cluster source
  update node visibility source/filter
  do not recreate map
```

Avoid recomputing clusters on every raw `zoom` frame unless performance is proven acceptable. Prefer `zoomend`, `moveend`, or coarse zoom buckets.

---

## Route behavior under clustering

This is the major unresolved design question.

### Option 1 — Keep original routes unchanged

Routes always connect original endpoints, even if endpoint nodes are hidden under clusters.

Pros:

- simplest
- preserves raw routes
- minimal data transformation

Cons:

- visually incoherent when endpoints disappear
- routes may appear to terminate in empty space

Use only as a temporary diagnostic state.

### Option 2 — Hide routes involving hidden member nodes

If a node is folded into a cluster, routes attached to that node are hidden.

Pros:

- visually clean
- easier than route aggregation

Cons:

- loses visible correspondence volume
- clusters may appear disconnected from the network they represent

Could be acceptable as a temporary first production candidate.

### Option 3 — Reroute original routes to cluster centers

If an endpoint belongs to a cluster, draw the route to the cluster center.

Pros:

- visually coherent
- preserves route visibility

Cons:

- may imply that letters originated/terminated at artificial cluster centers
- duplicate routes may overlap heavily
- needs careful labeling/legend language

Could be useful but must be clearly represented as clustered visualization.

### Option 4 — Aggregate cluster-to-cluster and cluster-to-node routes

Routes are aggregated by visible endpoint representation:

```text
node → node
node → cluster
cluster → node
cluster → cluster
```

Pros:

- best long-term visual logic
- volume can be encoded cleanly
- consistent with visible node/cluster state

Cons:

- most complex
- requires new route aggregation keyed to cluster membership
- Inspector semantics must distinguish aggregate cluster routes from original routes

Recommendation: this is the likely long-term target, but not the first cluster pass.

---

## Migration sequence for the MapLibre-native subsystem

### Pass 0 — This document

Create this architecture/audit document on `maplibre-native-geographic-view`.

Acceptance test:

```text
Document exists under docs/.
Rollback landmarks are recorded.
Current preview architecture is audited.
Target MapLibre-native architecture is specified.
Cluster/route behavior options are documented.
```

### Pass 1 — Extract MapLibre feature builders

Create:

```text
src/mapLibreFeatureBuilders.js
```

Move pure node/route feature builders out of `MapLibreMapStage.jsx` without changing behavior.

Acceptance test:

```text
MapLibre preview behaves exactly as at 10051c0.
Node/route rendering, clicks, hover cursor, route hit layer, and selected filters still work.
```

### Pass 2 — Extract MapLibre layer/source configuration

Create:

```text
src/mapLibreLayerConfig.js
```

Move layer/source IDs, empty filters, and paint definitions out of `MapLibreMapStage.jsx`.

Acceptance test:

```text
No behavior change.
MapLibre preview still works exactly as before.
```

### Pass 3 — Separate MapLibre lifecycle helpers

Refactor `MapLibreMapStage.jsx` so map initialization, source/layer registration, and source data updates are clearly separated.

Acceptance test:

```text
Zooming and panning never recreate the map.
Node/route source updates do not reset view.
Click/hover/selection still works.
```

### Pass 4 — Static cluster sanity layer

Add three hard-coded cluster circles.

Acceptance test:

```text
Hard-coded cluster circles render.
Zooming/panning does not reset the map.
No node hiding.
No route changes.
```

### Pass 5 — Derived cluster overlay, no node hiding

Derive clusters from current visible node features at a fixed threshold. Render them above nodes.

Acceptance test:

```text
Clusters render visibly.
Nodes remain visible.
Routes remain unchanged.
No map reset on zoom/pan.
```

### Pass 6 — Cluster click routing

Clicking a cluster opens the existing cluster Inspector payload.

Acceptance test:

```text
Cluster click opens Inspector cluster view.
Cluster member click opens detail.
Back returns to cluster view.
Nodes/routes still click correctly.
```

### Pass 7 — Hide nodes represented by clusters

Only after cluster render/click behavior is stable, hide member nodes represented by clusters.

Acceptance test:

```text
Clustered member nodes hide.
Clusters remain visible.
Unclustered nodes remain visible.
No map reset.
Routes are still in their prior temporary behavior.
```

### Pass 8 — Route behavior under clustering

Choose and implement one route behavior option.

Recommendation:

```text
First implementation: suppress routes involving hidden cluster-member nodes.
Later implementation: aggregate node/cluster/cluster-to-cluster routes.
```

### Pass 9 — Production candidate toggle

Once geographic MapLibre behavior reaches parity, add a controlled UI or config-level way to compare legacy D3 geographic view and MapLibre-native geographic view.

### Pass 10 — Documentation refresh

Update README, Maintainer's Guide, and Changelog after a stable milestone, not after every small pass.

---

## Lifecycle rules for future implementation

These rules should govern every MapLibre-native code pass:

1. `new maplibregl.Map(...)` should run once per component mount.
2. `map.remove()` should only run on component unmount or intentional style reset.
3. Graph, node, route, cluster, hover, selection, and zoom changes must not recreate the map.
4. GeoJSON source updates should use `source.setData(...)`.
5. Selected state should use `map.setFilter(...)` or feature-state, not React remounts.
6. Zoom-responsive clustering should use coarse zoom buckets or `zoomend`/`moveend`, not raw frame-by-frame React state updates until proven safe.
7. Cluster lookup data for Inspector should be stored in refs or stable derived maps, not in a way that forces map reconstruction.
8. Keep Force-Directed mode separate unless explicitly redesigned.

---

## Risks and mitigations

| Risk | Severity | Mitigation |
|---|---:|---|
| Map reset on zoom/pan | High | Separate map initialization from source updates; keep cluster data out of map-construction effect dependencies. |
| Cluster Inspector mismatch | High | Preserve Peridot-owned cluster lookup keyed by cluster ID. |
| Route incoherence under clusters | High | Treat route behavior as a separate design pass. |
| `MapLibreMapStage.jsx` becoming too large | Medium/High | Extract feature builders and layer config before more cluster work. |
| Export mismatch | High | Keep export subsystem separate until live MapLibre geographic view reaches parity. |
| Map provider/style dependency | Medium | Keep style config centralized and attribution visible. |
| Production map regression | High | Keep MapLibre work gated until parity and explicitly test normal URL after each pass. |

---

## Development protocol update

For `src/MapLibreMapStage.jsx`, use this protocol by default:

```text
1. Read the exact current committed file from GitHub.
2. Treat that file as the source of truth.
3. Generate a complete replacement file from that exact source.
4. Make only the planned bounded changes.
5. Provide .txt and .jsx versions.
6. User copies the .txt into place.
7. Build/test.
8. Commit if accepted.
```

For `App.jsx`, continue to prefer narrower patching or very carefully reviewed full-file replacement only when a pass explicitly requires it.

---

## Immediate recommendation

Do not attempt cluster behavior again inside the current monolithic `MapLibreMapStage.jsx`.

Next implementation pass should be:

```text
Pass 1 — Extract MapLibre feature builders
```

This pass should move pure feature-building logic out of the component without changing behavior. It will make the subsequent lifecycle refactor and cluster design safer.
