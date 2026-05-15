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
- Current branch baseline at this handoff: **`268b18c` — `Add MapLibre hover feedback`**

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

Confirmed working in the MapLibre preview/prototype path at `268b18c`:

- MapLibre map renders inside the Peridot workspace.
- Peridot Place-view nodes render as MapLibre GeoJSON circle layers.
- Dynamic MapLibre clusters render from current node features.
- Cluster count labels render above dynamic clusters.
- Cluster-member nodes are hidden when represented by visible clusters.
- Cluster clicks route into the existing Inspector path.
- Curved aggregated visible-endpoint routes render between visible nodes and visible clusters.
- Aggregated routes use represented letter volume for route thickness.
- Aggregated route clicks route into the Inspector and show aggregated route details.
- Selected visual feedback works for clusters and aggregated routes.
- Hover feedback works for unclustered nodes, dynamic clusters, and aggregated routes, with node/cluster priority over crossing routes.
- Pure feature-building logic has been extracted to `src/mapLibreFeatureBuilders.js` for the original route/node feature builders.
- Source/layer IDs and route/node layer definitions have been partially extracted to `src/mapLibreLayerConfig.js`; newer cluster/aggregate behavior currently remains mostly in `src/MapLibreMapStage.jsx` after an extraction regression.

Not yet solved:

- People and Force-Directed views do not yet have visible nodes/edges in the MapLibre branch; only Place view currently has the migrated MapLibre overlay.
- Final Peridot-aligned basemap and style design remain open.
- Playback highlighting parity under MapLibre remains open.
- Production replacement decision remains open.
- Export parity under a MapLibre live map remains open.

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

Route behavior under clustered nodes has moved from an open question to a current working diagnostic policy:

- hidden member nodes are represented by visible clusters;
- routes are aggregated between currently visible endpoints, which may be visible nodes or visible clusters;
- multiple directed routes between the same visible source and target are combined into thicker curved lines based on represented letter volume;
- routes whose source and target collapse into the same visible cluster are skipped.

This policy is currently implemented in the gated MapLibre preview path and should remain subject to revision as People / Place / Force-Directed parity and final visual design are developed.

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

## Recommended next implementation sequence

### Pass group: make all three views functional in the MapLibre branch

**Change type:** behavior

**Goal:** preserve the migrated MapLibre Place-view overlay while making **People**, **Place**, and **Force-Directed** functional in the branch. At this handoff, only Place view has visible MapLibre nodes/edges.

**In scope:**

- audit the current `App.jsx` → `MapLibreMapStage.jsx` prop path for People / Place / Force-Directed
- determine whether People view should share the migrated MapLibre geographic overlay or needs a separate node/edge projection path
- preserve the existing non-geographic D3-force Force-Directed view or deliberately route around MapLibre for that mode
- keep the production D3/SVG path unchanged

**Out of scope for the first pass:**

- no basemap redesign
- no playback highlighting parity
- no export changes
- no broad structural extraction of `MapLibreMapStage.jsx`

**Later pass groups:**

1. Explore prettier / more Peridot-aligned MapLibre basemap and visual-style options.
2. Add playback highlighting parity for MapLibre.
3. Revisit structural extraction only after behavior and visual direction stabilize.

---

## Longer-term staged plan

1. Preserve current production D3/SVG behavior.
2. Preserve current MapLibre preview prototype at `10051c0` / tag `checkpoint-maplibre-preview-prototype`.
3. Continue native subsystem work on `maplibre-native-geographic-view`.
4. Preserve the migrated MapLibre Place-view overlay now available at `268b18c`.
5. Make People, Place, and Force-Directed functional in the MapLibre branch.
6. Explore prettier / more Peridot-aligned MapLibre basemap and visual styles.
7. Add playback highlighting parity.
8. Decide whether and when MapLibre replaces the production geographic map.
9. Revisit export policy separately.
10. Revisit structural extraction only with tiny, source-of-truth-verified passes.

---

## Structural extraction caution

The `dd148e1` constants extraction attempt regressed the migrated overlay by reintroducing an older preview-stage shape. It was superseded by `c0a4b8a`, which restored the migrated overlay. Future extraction should be treated as a high-risk structural operation unless it is a very small patch against the exact current source of truth.

Safe later extraction candidates include static ID constants and pure layer-definition builders. Do not extract live map lifecycle setup, zoom/move recalculation, hidden-node filtering, selected/hover filter application, or Inspector payload construction until the subsystem is more stable.

---

## Export policy note

The live MapLibre map is WebGL/canvas-based. It should not be assumed to replace the current SVG/PNG export path automatically.

The most likely medium-term policy is:

```text
Live geographic exploration: MapLibre
Export: existing Peridot vector/SVG export path or a separately designed export renderer
```

Do not merge MapLibre live rendering and export behavior without a dedicated export pass.
