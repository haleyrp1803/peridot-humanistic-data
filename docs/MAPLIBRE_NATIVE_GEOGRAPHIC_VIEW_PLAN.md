# MapLibre Native Geographic View Plan

## Purpose

This document records the plan to move Peridot from a D3/SVG-only geographic map architecture toward a MapLibre-native geographic subsystem while preserving the current production D3/SVG map until MapLibre reaches functional parity.

The goal is not a wholesale rewrite of Peridot. The goal is to rebuild the geographic map renderer and interaction layer in MapLibre's native concepts: sources, layers, filters, feature-state or selected filter layers, hit layers, and explicit map lifecycle management.

---

## Current rollback and branch landmarks

- Pre-MapLibre clean rollback point: **`4e08720` — `Direct workflow charter baseline reference to changelog`**
- Main / MapLibre preview prototype checkpoint: **`10051c0` — `Add MapLibre selected filter layers`**
- Prototype tag: **`checkpoint-maplibre-preview-prototype`**
- Active native subsystem branch: **`maplibre-native-geographic-view`**
- Current branch baseline at this handoff: **`4c9ed6f` — `Extract MapLibre layer configuration`**

---

## Current production architecture audit

The production Peridot geographic map remains a D3/SVG-based renderer. It owns:

- D3 geographic projection
- SVG route drawing
- SVG node drawing
- zoom-responsive clustering
- volume-based cluster sizing
- selected node/edge visual styling
- hover/click behavior through Peridot map interaction handlers
- Inspector routing for nodes, edges, and clusters
- SVG/PNG export compatibility

The production path is functional and should not be replaced until the MapLibre subsystem reaches parity.

The production Force-Directed view remains non-geographic and should remain separate from MapLibre. It is a D3-force person-network view rendered on a clean themed background.

---

## Current MapLibre prototype audit

The current MapLibre preview is gated behind:

```text
?maplibrePreview=1
```

Confirmed working in the MapLibre preview/prototype path:

- MapLibre map renders inside the Peridot workspace.
- Peridot routes render as MapLibre GeoJSON line layers.
- Peridot nodes render as MapLibre GeoJSON circle layers.
- A transparent route hit layer improves route targeting.
- Node and route clicks route into the existing Inspector.
- Cursor-only hover works for nodes/routes.
- Selected node/route visual feedback works through selected filter layers on existing sources.
- Pure feature-building logic has been extracted to `src/mapLibreFeatureBuilders.js`.
- Source/layer IDs and layer definitions have been extracted to `src/mapLibreLayerConfig.js`.

Not yet solved:

- MapLibre cluster source/layer setup.
- MapLibre cluster click routing.
- MapLibre node hiding under clusters.
- Route behavior when nodes cluster.
- Production replacement decision.
- Export parity under a MapLibre live map.

---

## Current module boundaries

### `src/MapLibreMapStage.jsx`

Owns the MapLibre map instance, lifecycle, source/layer update calls, preview diagnostics, click routing, selected filter updates, and cursor-only hover.

This file should use the special full-file replacement protocol:

1. Read exact current committed file from GitHub.
2. Treat it as source of truth.
3. Generate a complete replacement file from that source.
4. Make only the bounded planned change.
5. Provide `.txt` and `.jsx` versions.
6. User copies `.txt` into place.
7. Build/test.
8. Commit if accepted.

### `src/mapLibreFeatureBuilders.js`

Owns pure graph-to-GeoJSON feature-building logic. Current branch includes node and route feature construction.

Future additions should include cluster feature builders only after source/layer lifecycle is proven.

### `src/mapLibreLayerConfig.js`

Owns MapLibre source IDs, layer IDs, selected filters, and layer definition builders.

Future additions should include cluster source/layer definitions only after a minimal local cluster source/layer diagnostic has proven where the lifecycle hookup belongs.

### `src/mapStyleConfig.js`

Owns MapLibre style configuration for the current preview path.

---

## Target MapLibre-native architecture

The desired final MapLibre geographic subsystem should use explicit source/layer groups.

### Sources

```text
route source
node source
cluster source
selected or feature-state strategy
```

### Route layers

```text
visible route layer
wide transparent route hit layer
selected route layer
possibly aggregate cluster-route layer later
```

### Node layers

```text
visible node layer
selected node layer
possibly hidden-member filtering when clusters are active
```

### Cluster layers

```text
visible cluster circle layer
cluster label layer
cluster hit layer
selected cluster layer
```

### Event model

```text
node click -> existing Inspector node/place/person detail
route click -> existing Inspector edge/route detail
cluster click -> existing Inspector cluster view
blank click -> existing blank-map selection clearing
mouseenter/mouseleave or cursor-only hover -> non-invasive feedback
```

### Selection model

Current successful selected feedback uses selected filter layers on existing node/route sources. This is preferable to passing `selectedProps` into the MapLibre component or creating a separate selected GeoJSON source.

Future cluster selection should follow the same pattern once cluster source/layers are stable.

---

## Cluster design questions still open

MapLibre does not solve Peridot cluster semantics automatically. Peridot clusters are research objects, not just display blobs.

Open route-behavior options when nodes are clustered:

1. Keep original routes even when member nodes are hidden.
2. Hide routes involving hidden member nodes.
3. Reroute original routes to cluster centers.
4. Aggregate cluster-to-cluster routes.
5. Show original routes faintly under clusters.

No route behavior should be implemented until cluster source/layer rendering and cluster click routing are stable.

---

## Failed/rolled-back cluster findings

Several uncommitted cluster diagnostic attempts were restored.

Observed results:

- static cluster features could be built in React-side diagnostics;
- MapLibre repeatedly reported `Cluster source: no` and `Cluster layer: no`;
- attempts that hid nodes made nodes disappear at plausible clustering thresholds but did not render clusters;
- route behavior did not respond to hidden nodes;
- one attempt caused zoom/pan flash and reset behavior.

Conclusion:

- the next pass must not be a styling/layer-order pass;
- the next pass should instrument source/layer setup lifecycle directly;
- cluster source/layer setup should be proven before node hiding, route changes, or click routing.

---

## Recommended next implementation pass

### Pass: Instrument MapLibre cluster source/layer lifecycle

**Change type:** diagnostic / structural

**File:** `src/MapLibreMapStage.jsx` only at first

**Goal:** determine why static cluster features are built but never appear as a MapLibre source/layer.

**In scope:**

- add hard-coded local cluster features inside `MapLibreMapStage.jsx`
- add local cluster source/layer setup in the same file
- add diagnostic counters:
  - setup attempts
  - last setup phase: update / load / styledata / idle
  - readiness guard result
  - setup error message if any
  - source exists yes/no
  - layer exists yes/no
  - rendered count

**Out of scope:**

- no `App.jsx` changes
- no helper/config extraction changes yet
- no node hiding
- no route changes
- no cluster labels
- no cluster Inspector routing
- no zoom-responsive derived clusters

**Acceptance test:**

```text
?maplibrePreview=1 shows diagnostics for cluster setup attempts.
If source/layer still report no, the panel explains why.
Zoom/pan does not flash or reset.
Nodes/routes/selection still work.
Normal production URL remains unchanged.
npm.cmd run build succeeds.
```

---

## Longer-term staged plan

1. Preserve current production D3/SVG behavior.
2. Preserve current MapLibre preview prototype at `10051c0` / tag `checkpoint-maplibre-preview-prototype`.
3. Continue native subsystem work on `maplibre-native-geographic-view`.
4. Instrument and solve MapLibre cluster source/layer lifecycle.
5. Add stable static cluster rendering.
6. Add cluster click routing into existing Inspector cluster view.
7. Add derived cluster features from node data.
8. Add node hiding under clusters only after cluster rendering/click routing works.
9. Decide route behavior under clustered nodes.
10. Decide whether and when MapLibre replaces the production geographic map.
11. Revisit export policy separately.

---

## Export policy note

The live MapLibre map is WebGL/canvas-based. It should not be assumed to replace the current SVG/PNG export path automatically.

The most likely medium-term policy is:

```text
Live geographic exploration: MapLibre
Export: existing Peridot vector/SVG export path or a separately designed export renderer
```

Do not merge MapLibre live rendering and export behavior without a dedicated export pass.
