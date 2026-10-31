# Peridot — Geographic Map Phase 1: Projection and Viewport Compatibility Audit

**Date:** 2026-10-31  
**Status:** Source-informed preliminary audit; current-source verification pending  
**Pass type:** Behavior / technical investigation, **no source-code modifications**  
**Related plan:** `planning_documents/Peridot_Geographic_Map_Multiscale_Expansion_Plan_20261031_v1.md`  
**Latest user-confirmed synchronized Git checkpoint:** `fc42306` on `main`; the user reports the multiscale plan is now an **uncommitted local addition**.  

## 1. Executive decision

**Provisional recommendation:** retain Peridot's D3/SVG visualization engine; test a **single Web Mercator coordinate frame for the Geographic Map** before introducing raster tiles. Preserve the present Natural Earth implementation as a reproducible baseline and do not change the Force-Directed Network. A projection switch must reproject all geographic nodes, edge endpoints, geographic backdrop paths, annotations, hit-testing and export together. Simply rendering Web Mercator tiles beneath today's Natural Earth coordinates will misalign the map.

**Phase 1 gate status:** the static architecture/coordinate audit and a recommendation are complete against the available source archive, but the gate is **not fully closed**: the exact latest local map-related source files have not been verified and no production browser/regression comparison has been performed. Do not implement a full-file replacement from this archived source.

## 2. Evidence and verification boundaries

- **Inspected source:** `src(20261031-223721).zip` (extracted at `/mnt/data/peridot_map_review/src/` for inspection). Inspected portions of `App.jsx`, `mapLayoutHelpers.js`, `mapStageComponents.jsx`, `exportHelpers.js`, and references to `peridotEntityNetwork.js`.
- **Governing current project documentation:** user-uploaded 2026-10-31 22:47 versions of the Changelog, Maintainer's Guide, Workflow Charter, README, and Core Documentation Governance Protocol. They report `fc42306` and establish the exact-current-source rule.
- **Uncommitted local change:** the user's multiscale expansion planning document has been copied to `planning_documents/` but intentionally not committed.
- **Not verified:** current raw post-`fc42306` source byte equivalence, source after any local uncommitted code edits, live UI behavior, builds, tile requests, or exports. No code was modified.
- **External technical sources:** D3 official projection documentation (`https://d3js.org/d3-geo/projection`); D3 zoom (`https://d3js.org/d3-zoom`); D3 tile repository (`https://github.com/d3/d3-tile`). Source-supported engineering judgments below are explicitly provisional when requiring execution.

## 3. Existing pipeline (source-derived)

### 3.1 Geographic coordinates to SVG

1. `App.jsx` imports `geoNaturalEarth1`, `geoPath`, and `geoContains` from `d3-geo`, and `world-atlas/countries-50m.json`.
2. `createWorldProjection(width,height)` returns `geoNaturalEarth1().fitExtent([[24,24],[width-24,height-24]], {type:'Sphere'})`.
3. `projectToSvg(lon,lat,width,height)` constructs that projection and returns the projected point (or a viewport-center fallback on null).
4. `buildGraph` projects place nodes and route endpoints; generalized geographic person/entity anchor construction also projects source-derived anchor longitude/latitude. A separate legacy geographic person path projects its chosen location too. All usages of `projectToSvg` need to be accounted for in a projection change.
5. The backdrop converts country features to SVG paths using `geoPath(projection)`. The water-label decorations use `projectToSvg`; country highlighting uses `projection.invert([node.x,node.y])` followed by `geoContains` when place-name hints are absent.
6. The stage applies `translate(view.tx view.ty) scale(view.scale)` to a shared SVG geography group. This fits the current D3 projection, not a Web Mercator slippy-tile coordinate system.

### 3.2 Viewport and interaction

- `view` stores `{scale,tx,ty}`. The inspected implementation clamps scale to `[0.6,160]`. These numbers are **SVG multipliers**, not standard tile zoom levels.
- Wheel zoom is cursor-anchored: inverse the old affine transform at pointer position, adjust scale, then recalculate translation. A temporary transform is applied immediately and committed after approximately 120 ms.
- Drag panning uses transient SVG translation and commits durable viewport state on pointer release. This is an accepted performance optimization, not disposable implementation detail.
- Map controls implement center-based zoom and continuous hold-to-pan/zoom.
- Default fit considers node and geographic edge-endpoint bounds; remembered viewport state is associated with reset keys. Geographic and force-mode viewport refs are separated by `activeMapLayoutKey`.
- On resize, translation is adjusted by half the viewport dimension difference. Because projection itself is recreated using new dimensions and `fitExtent`, this interaction deserves an explicit geographic-center/anchor-preservation regression test. Static inspection **does not prove** that resize preserves exact longitude/latitude at viewport center.

### 3.3 Clustering and hit geometry

- Cluster threshold is configured as **42 screen pixels** and converted to source/projected-space threshold by division by `view.scale`.
- `buildClusteredNodes` groups projected node coordinates using that threshold; screen-node coordinates subsequently use `screenX = view.tx + node.x * view.scale` and analogous Y.
- Node/cluster labels and hit regions depend on projected and screen geometry. Projection changes can change clustering even if raw data are unchanged; intended tests must distinguish real co-location from merely nearby places.
- Edge geometry is created from projected endpoints, including curved SVG paths; relationship semantic rules should not change during a projection pass.

### 3.4 Export

- SVG export serializes the current stage via `serializeSvgForExport` in `exportHelpers.js`.
- PNG export serializes/renderers SVG and draws the result to a canvas (`renderSvgElementToPngBlob`). External tile `<image>` resources may require explicit image embedding and CORS-compatible asset handling; their successful on-screen display does **not** establish export success.

## 4. Projection options and tradeoffs

| Option | Benefits | Costs / risks | Phase 1 view |
|---|---|---|---|
| A. Natural Earth at every scale | Preserves existing world styling and geometry | Ordinary XYZ street tiles use Web Mercator coordinates; tile alignment requires warping/resampling, specialized tile source, or a projection-aware intermediate render; not a simple tile layer | **Not recommended** for direct conventional XYZ raster tiles |
| B. Web Mercator for entire Geographic Map | Common coordinate system for tiled map layers and researcher overlays; consistent pan/zoom/inversion | Changes world silhouette; considerable high-latitude area exaggeration, finite latitude domain, antimeridian/wrapping complexity | **Preferred feasibility prototype**, not yet accepted production decision |
| C. Natural Earth world view → Web Mercator detail view | Retains familiar world view and supports standard detail tiles | Projection transition requires preserving geographic center, reprojection of all layers, viewport conversion, potential selection/cluster shifts and transient animation; much greater complexity | **Defer** unless testing establishes a world-view requirement that outweighs complexity |

D3 documents `projection.fitExtent`, `projection.invert`, projection scale and clipping; its geographic projection scale is not interchangeable with Web Mercator's standard tile zoom. `d3-tile` computes visible tile indices and positions; it is **not** itself a tile-hosting, caching, reprojection or export solution.

### High-latitude and longitude policy (requires design decision)

A conventional Web Mercator tile grid typically restricts latitude to roughly ±85.0511°. Peridot must never silently distort, clamp without communicating, or drop researcher-supplied polar coordinates. Test explicit visibility/unsupported-state treatment. Longitude normalization and dateline wrapping also require an intentional policy so one map node does not accidentally produce duplicate semantic entities or spurious wraparound edges.

## 5. Primary engineering findings

1. **Projection is cross-cutting inside `App.jsx`.** It appears in geographic node and edge builders, backdrop paths, optional inverse country classification, and decoration. Changing only `createWorldProjection` without testing all consumers is unsafe.
2. **Do not conflate projection scale with viewport scale or tile Z.** Define an explicit transformation model: `[lon,lat] -> Web Mercator world coordinates -> current SVG viewport transform -> screen`, with invert and tile-resolution conversion well specified.
3. **A projection fitted to the resize-dependent SVG is not a stable slippy-map tile frame by default.** A later tile implementation should use an explicit geographic origin/center, normalized world coordinate scale, and conversion to visible tile indices; it must not assume a `fitExtent(Sphere)` projection is tile-ready.
4. **The current transient zoom and pan path should survive.** New tile loading should react to a controlled visible geographic viewport and not cause geographic graph recomputation for each raw wheel/drag event.
5. **Cluster membership is screen-scale-based.** Increasing zoom should separate nearby locations while preserving exact shared coordinates. No semantic graph edges may be added or inferred by background features.
6. **Viewport state migration must be explicit.** Stored `{scale,tx,ty}` for Natural Earth is not transferable unmodified to another projection. Convert a known geographic center and effective geographic resolution, or deliberately reset with user-visible behavior at the migration boundary.
7. **World-scale visuals are a real acceptance criterion.** Web Mercator's distortion can materially change the world overview; compare against existing Peridot screenshot(s) before accepting it.
8. **Export is a gated follow-on.** Plan an explicit overlay-only fallback if permitted basemap tiles cannot be embedded into SVG/PNG safely.

## 6. Preservation and regression matrix

| System | Risk introduced by projection/viewport change | Required test |
|---|---|---|
| Geographic nodes and anchors | Coordinate drift or incorrect lat/lon order | Known coordinates in several hemispheres; exact repeatability after zoom |
| Generalized geographic edges | Endpoints do not line up with visible node instances; false routes | Explicit route test and multipart relationship fixture; no inferred extra edges |
| Map settings | Selected roles/fallbacks generate inconsistent geometry | Toggle place/entity/role/line settings; Apply/Reset semantics preserved |
| Clusters | Too many/few grouped nodes at new zoom scales | Exact co-locations and near-but-distinct points at world/city/block scales |
| Hit-testing/Inspector | SVG visible marker and click target diverge | Node, edge and cluster selections; multi-step Inspector history |
| Map hover / labels | Incorrect label or hit region after projection swap | On/off labels, dense groups, selected/hover states |
| Pan/wheel + controls | Drift, jump, jitter, repeated rederivation | Wheel-anchor stability; drag-release continuity; button hold behavior |
| Fit-to-data | Extent fit changes or unintentionally refits after interaction | Single point, two distant points, globally dispersed records |
| Stage resize | Center and anchors drift | Desktop/laptop resizing at global and neighborhood scales |
| View persistence | Force viewport overwrites Geographic viewport | Geographic → Force → Geographic and cross-page navigation |
| Search/Timeline | Filters or playback unexpectedly refit map or change semantics | Apply query; scrub/run cumulative and co-current playback |
| Country highlighting | Inverted node coordinates no longer map to correct country | Known countries with/without explicit political hints |
| Polar/dateline data | Missing, duplicated, or displaced points | Near-pole and ±180° cases and explicit fallback policy |
| SVG/PNG export | Missing or inaccessible backgrounds; incorrect transforms | Raster and vector output preview with overlay; external-image export later |
| Deployment | Tile/asset paths fail on GitHub Pages base | Production build and published URL check before declaring release |

## 7. Recommended Phase 1 verification sequence

1. **Verify exact latest source.** Use the current local `main` raw files, especially `src/App.jsx`, `src/mapLayoutHelpers.js`, `src/mapStageComponents.jsx`, `src/exportHelpers.js`, `src/peridotEntityNetwork.js`, map interaction modules, and relevant styles. Compare with the archived snapshot; preserve any post-snapshot or uncommitted changes. Do not generate replacements from retrieval snippets.
2. Establish baseline with three normal shipped samples and explicit coordinate test fixtures. Record world-view framing, city zoom, screen positions, clusters, and viewport persistence.
3. In an **isolated throwaway test harness** (not live app files), compare projected `[lon,lat]`/invert round trips using current Natural Earth and candidate Web Mercator, including Florence/Rome, west/east hemisphere, high latitude, antimeridian and viewport resize.
4. Test a candidate consistent Web Mercator coordinate transform at world and neighborhood extents, with known map center and geographic resolution, and document mapping between view scale and tile zoom.
5. Document decided policy for high-latitude records, antimeridian continuity, decorative country/water labels, and desired world silhouette.
6. If tests satisfy the matrix, mark **Phase 1 accepted** and authorize the separate bounded Phase 2 raster-tile proof of concept; otherwise retain Natural Earth and revisit renderer strategy.

## 8. Decision and acceptance record

**Proposed decision:** Evaluate fixed Web Mercator as the most direct D3/SVG-compatible route to conventional world→neighborhood tiled basemaps. Keep the existing Natural Earth implementation unchanged until a source-verified prototype proves node/tile alignment and interaction preservation.

**Acceptance evidence presently available:** static code inspection and official D3 API documentation.  
**Acceptance evidence not yet available:** exact-current-source verification, running projection harness, browser visual comparison, regression outcomes, production/export observations.  
**Overall Phase 1 status:** **preliminary recommendation; execution acceptance pending**.

## 9. Implementation boundary and handoff

- **In scope for Phase 1:** evidence gathering, coordinate architecture, projection decision, compatibility analysis, risk matrix and test specification.
- **Out of scope:** editing source, installing D3 packages, moving/renaming files, changing dependency/config files, replacing the existing engine, modifying research semantics, integrating a tile service, or modifying core project documentation.
- **Change control:** follow `PROJECT_WORKFLOW_CHARTER.md` full-file and bounded-pass rules. The local planning document previously copied by the user remains uncommitted; do not accidentally stage unrelated files. The current checkpoint in the core documentation remains `fc42306` until the user supplies a new Git sync ritual.

