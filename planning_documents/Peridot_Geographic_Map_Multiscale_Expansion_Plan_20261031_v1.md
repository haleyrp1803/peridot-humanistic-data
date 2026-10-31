# Peridot — Multiscale Geographic Map Expansion Plan

**Document type:** Planning document (proposed; not an implementation record)  
**Prepared:** 2026-10-31  
**Version:** 1.0  
**Recommended repository destination:** `planning_documents/Peridot_Geographic_Map_Multiscale_Expansion_Plan_20261031_v1.md`  
**Documented project baseline:** `fc42306`, `main`, user-confirmed synchronized 2026-10-31  
**Status:** Research and architectural planning only. No changes have been implemented or committed under this plan.

## 1. Executive summary

Peridot's current Geographic Map uses D3/SVG to place researcher-mapped geographic observations, nodes, clusters, and relationships on a global basemap. This plan proposes retaining that visualization engine while adding *multiscale geographic detail*: users should be able to navigate from a world overview through countries and cities to streets and neighborhoods without losing the alignment or scholarly meaning of their research data.

**Recommendation:** Begin with a tightly bounded projection/viewport audit, then build a proof of concept for a raster-tile basemap below existing SVG research overlays. Do not immediately replace D3, revive the archived MapLibre branch, or rewrite generalized geographic data semantics. Progress to full integration only after the proof of concept passes alignment, interaction, performance, and export feasibility checks.

The central technical decision is how to reconcile Peridot's currently inspected **Natural Earth** projection with conventional tiled basemaps built around **Web Mercator**. A simple increase to the current zoom-scale limit will not create city streets or neighborhood information absent from the underlying geographic dataset.

## 2. Goals and non-goals

### Goals

- Support navigable geographic context at world, country/region, city, and neighborhood/street scales.
- Preserve accurate longitude/latitude positioning for researcher-provided places and geographic entity anchors.
- Preserve existing research overlays and semantics: Map settings, explicit relationships, node/edge visibility, clustering, Inspector handoff, Search scope, Timeline playback, and exports.
- Keep map performance responsive during drag, wheel zoom, and rapid viewport changes.
- Retain the existing SVG/D3 visualization architecture unless a tested limitation justifies a separate decision.
- Handle tile attribution, delivery policy, errors, browser security, and deployment on GitHub Pages explicitly.

### Non-goals for the initial expansion

- No change to canonical Relations, Identity, Time, Places, Evidence, cardinality, or subject-attribution semantics.
- No silent geocoding, name standardization, invented geographic coordinates, or inferred relationships.
- No change to Force-Directed Network geometry or semantics.
- No immediate 3D terrain/globe, historical basemap georeferencing, new map styling system, or unrestricted vector-tile rendering.
- No unapproved dependency or Vite configuration changes.
- No assumption that the archived MapLibre branch is production-ready.

## 3. Evidence, source coverage, and verification boundaries

### 3.1 Project documentation

The latest uploaded core documentation (2026-10-31, 22:47) records `fc42306` as the last user-confirmed clean synchronized checkpoint. The Maintainer's Guide describes the active D3/SVG map architecture, generalized geographic anchor rules, transactional Map settings, viewport preservation, Inspector interactions, playback highlighting, and performance safeguards. The Workflow Charter requires bounded implementation passes, exact raw-current-file review before editing, explicit fragile-zone checks, and a versioned handoff.

### 3.2 Source-code inspection supporting this plan

An available archive, `src(20261031-223721).zip`, was inspected for the earlier technical assessment. In the extracted snapshot:

| File / location | Observed technical fact | Planning significance |
|---|---|---|
| `src/App.jsx` | Imports `geoNaturalEarth1` and `geoPath` from `d3-geo` | Current projection is not Web Mercator |
| `src/App.jsx` | Imports `world-atlas/countries-50m.json` | Existing background emphasizes country-scale geography |
| `src/App.jsx` | Defines a clamped viewport scale with minimum 0.6 and maximum 160 | This is a transform scale, not a conventional tiled-map zoom-level contract |
| `src/mapLayoutHelpers.js` | Provides map geometry/layout support | Audit clustering and screen-coordinate assumptions |
| `src/mapStageComponents.jsx` | Contains map-stage interaction/presentation components | Preserve controls, labels, hover, and stage behavior |
| `src/peridotEntityNetwork.js` | Provides generalized geographic entity/network derivation | Keep research semantics independent of the background renderer |

**Important:** The inspected source archive precedes `fc42306`. The later documented commits were primarily editorial gateways and production asset imports; nevertheless, these map files have *not been byte-verified against the latest local checkout*. The findings above are **snapshot observations**, not a claim that the latest source was fully inspected or that the proposed solution has been tested. The exact current source must be reviewed before implementation.

### 3.3 Public technical references

- D3 geographic projections: https://d3js.org/d3-geo/projection
- D3 zoom behavior: https://d3js.org/d3-zoom
- D3 tile calculation library: https://github.com/d3/d3-tile
- OpenStreetMap Foundation tile use policy: https://operations.osmfoundation.org/policies/tiles/

**Interpretation:** D3 provides projection, pan/zoom, and tile-layout primitives. `d3-tile` computes visible tile indices/placements but does not supply imagery, fetch/cache tiles, or automatically solve browser exports. The choice of tile provider, map style, and rendering method remains an application decision.

## 4. Design premise: separate geographic context from scholarly evidence

The Geographic Map should have two conceptually distinct layers that share a geographic viewport:

1. **Basemap/background:** country outlines at broad scale and (if selected/available) detailed tiled geographic features for regional, urban, and neighborhood contexts.
2. **Research overlays:** Peridot's existing mapped places, entity anchors, clusters, labels, explicitly supported relationships, selection targets, and Inspector interactions.

Both layers must resolve to the same screen coordinates at the same map center, projection, scale, and viewport translation. Changing background detail must never change the research observations, their provenance, or which relationship edges are semantically legitimate.

A possible high-level pipeline:

```text
Research data → accepted generalized mappings → geographic anchors/edges
                                                  ↓
                                shared geographic viewport/projection
                                                  ↓
       geographic background tiles + existing SVG research overlays
                                                  ↓
                             visible Geographic Map + Inspector/export
```

### Projection decision

The inspected map uses `geoNaturalEarth1()` while standard slippy-map raster tiles use the Web Mercator coordinate system. Transforming Web Mercator tiles with a Natural Earth SVG projection does not yield a correctly aligned basemap. Two approaches deserve evaluation:

- **Preferred initial hypothesis — unified Web Mercator Geographic Map:** Simpler persistent alignment for conventional street tiles; different global visual appearance and latitude/pole behavior must be accepted or mitigated explicitly.
- **Alternative — projection modes:** Preserve Natural Earth for global overview and switch to Web Mercator for detailed geography. This adds complexity for center/scale transitions, overlay reprojection, selection stability, and export; undertake only if the project values the Natural Earth global presentation enough to justify the cost.

**Decision gate:** Neither approach should be declared accepted until a prototype demonstrates consistent nodes, edges, clusters, viewport state, and readable global framing. `geoMercator` is available in `d3-geo`; a switch is conceptually possible but may require substantial integration adjustments.

## 5. Proposed implementation phases

### Phase 1 — Current-source audit and projection feasibility

**Pass type:** Behavior/technical investigation; no public UI change.  
**Likely owners to inspect:** `src/App.jsx`, geographic map components/layout helpers, viewport interaction helpers, `src/peridotEntityNetwork.js`, relevant stylesheet(s), export code, and build configuration as needed. File ownership must be reverified in latest raw sources.

Tasks:

1. Verify the latest raw contents of all affected map and interaction files against the `fc42306` checkpoint or subsequent user-confirmed local edits.
2. Trace the full coordinate pipeline: source `[longitude, latitude]` → D3 projection → SVG transform → pointer interaction → hover/hit testing → export.
3. Inventory viewport state, zoom/clamp behavior, fit-to-data, preservation across visualization switches, and stage resize.
4. Identify whether basemap and node/edge rendering can consume a common Web Mercator viewport without refactoring unrelated consumers.
5. Compare fixed Web Mercator with a two-projection strategy, documenting changes in global presentation, dateline wrapping, clipping, and high-latitude behavior.

**Acceptance gate:** A written projection/viewport decision with an explicit preservation matrix. No source modifications are required to finish this phase.

### Phase 2 — Minimal tiled raster proof of concept

**Pass type:** Behavior; bounded new map background layer.  
**Dependencies:** Phase 1 decision, approved tile source and any exact package addition.

Tasks:

1. Add a focused tile-layout helper (`d3-tile` if approved, or a small source-reviewed equivalent).
2. Derive the visible raster tile set from the common Web Mercator viewport and tile zoom; request only visible tiles plus a modest bounded buffer.
3. Render images *behind* Peridot's SVG research overlays, while preserving clipping and pointer-event isolation.
4. Keep transient pan/zoom responsive; avoid rebuilding graph geometry for each tile request, and prevent outdated tile responses from displacing current viewport imagery.
5. Demonstrate one detailed test region (Florence is a useful historically relevant location) and a world overview using the same research overlay data.
6. Display loading/unavailable state and provider attribution, rather than silently presenting a blank map.

**Acceptance gate:** Navigate continuously from global view to neighborhood streets with geographic nodes and edges correctly aligned through zoom, pan, and viewport resize; no unexpected Inspector regression.

**Stop condition:** If projection, alignment, or performance cannot be made reliable within a bounded D3/SVG tile layer, document the measured blocker before considering a renderer migration. Do not stack speculative map rewrites.

### Phase 3 — Scale-aware geography and presentation

**Pass type:** Visual or behavior as appropriate; separate passes if both are substantial.

Tasks:

- Define the basemap presentation at broad, intermediate, city, and neighborhood scales.
- Preserve world-scale country context; avoid visually cluttered low-zoom street labels.
- Determine tile crossfade/placeholder behavior, maximum available tile zoom, and what happens beyond provider detail limits.
- Establish readable contrast between basemap labels and research overlays under Peridot's approved Cartographic Editorial palette.
- Make attribution and tile loading state discoverable without covering map controls or research elements.
- Test very small and very large windows independently of the map's parent layout.

**Acceptance gate:** Legible geographic context at each target scale; no visual interference with the existing legend, controls, selection, or Inspector.

### Phase 4 — Integrate preserved research interactions

**Pass type:** Behavior; fragile-zone regression pass.

Required checks:

- Explicitly mapped anchor roles and the independent **Most frequent place** rule retain their semantics.
- Exact-coordinate deduplication remains intact; high zoom allows distinct close-together locations to separate visually where supported by their coordinates.
- Clusters, cluster membership, labels, hover, and node/edge hit areas operate consistently under the new projection.
- Relationship-line location rules remain **explicit event geography → selected fallback anchor → no defensible line**.
- An edge appears only when both exact endpoint node instances are visible; no spurious Cartesian products or inferred co-occurrence routes.
- Transactional Map settings **Apply** and **Reset** remain distinct.
- Geographic and Force viewport states remain separate; changing map settings, Search scope, or playback does not trigger unwanted fit/recenter.
- Timeline playback highlighting and Search/Inspector applied-versus-visible scope keep their established meanings.
- Correspondence, Family Tree, and Cardinals samples continue to function; test both data with and without detailed coordinates.

**Acceptance gate:** Complete the targeted regression matrix using real shipped sample datasets and one controlled neighborhood-scale geographic fixture.

### Phase 5 — Export, provider policy, performance and production

**Pass type:** Behavior/production verification.

Tasks:

1. Test SVG/PNG export with external raster images. Browser CORS, image tainting, and serialized-SVG compatibility can cause a displayed map to export incompletely or fail.
2. Choose and document one of: (a) permitted CORS-compatible basemap inclusion with attribution; or (b) explicit research-overlay-only export. Do not imply basemap imagery will necessarily appear in exported files.
3. Verify provider terms, visible attribution, rate limits, privacy implications of third-party tile requests, and applicable cost/hosting constraints. OpenStreetMap data licensing must not be conflated with free, unrestricted use of the Foundation's public tile servers.
4. Ensure requests are viewport-bounded, stale loads are discarded, and browser/network load remains acceptable during fast pan/zoom and Timeline playback.
5. Run build verification and inspect output; test GitHub Pages' `/peridot-humanistic-data/` base path, remote tile availability, and published rendering separately from a successful Git push.
6. Document fallback behavior when disconnected or when the tile provider is unavailable.

**Acceptance gate:** A production-build and deployed-site QA report, with documented export behavior and tile-service compliance, before release.

### Phase 6 — Optional follow-on: historical cartographic layers

**Not part of the first neighborhood-zoom release.** Assess support for user-selected, appropriately licensed/georeferenced historical rasters, opacity controls, map fitting, temporal metadata, and the distinction between precise coordinates and approximate historical geography. A historical image is not automatically a georeferenced map. Treat this as its own later architecture and interface proposal.

## 6. Risk register

| Risk | Why it matters | Mitigation / decision gate |
|---|---|---|
| Natural Earth / Web Mercator mismatch | Raster streets will not align if projections differ | Resolve in Phase 1; prove exact overlay alignment |
| Broad-scale appearance changes | Mercator changes global framing and de-emphasizes/omits poles | Review global and polar view needs before acceptance |
| High-zoom clustering | Close, distinct points may need to uncluster; exact co-location must not split | Test pixel-distance rules and original coordinates |
| Interaction performance | Tile loads may re-trigger costly React or graph work | Preserve transient SVG interaction and bounded state commits |
| Cross-origin image export | Browser can render images it cannot serialize into an export | Test CORS/export early; choose documented fallback |
| Tile provider/service constraints | Public tiles are not unlimited production infrastructure | Provider selection and usage-policy review before release |
| Vite/GitHub Pages behavior | Development success does not prove deployed rendering | Production build and published-site QA |
| Shared `App.jsx` fragility | Geographic edits can affect routing, Inspector, other views | Exact-current raw review; limited diffs; full regression |
| Geographic uncertainty | Street precision may suggest falsely certain historical place assignments | No automatic coordinate enhancement or inference |
| Historical imagery licensing | Third-party images may have reproduction restrictions | Separate licensing/provenance review |

## 7. Decision log (proposed, not accepted implementation)

| Decision | Current proposal | Status |
|---|---|---|
| Retain D3/SVG | Prefer extending existing engine first | Proposed |
| Projection | Evaluate common Web Mercator first; compare alternative | Open |
| Tile technology | Prototype raster tiles calculated via `d3-tile` | Proposed, not installed/approved |
| Provider | Select after policy, quality, cost, and CORS analysis | Open |
| World overview | Preserve a useful full-world experience | Required, precise style open |
| Clustering and Map settings | Preserve existing semantics and state contracts | Required |
| Export | Decide and validate full basemap versus overlay-only | Open |
| Vector tiles or renderer migration | Defer until measured need | Deferred |
| Historical maps | Separate later feature | Deferred |

## 8. Bounded-pass workflow and handoff requirements

For every implementation phase:

1. State one change type (**behavior**, **visual**, **structural**, or **documentation**), bounded goal, in-scope and out-of-scope files/regions, a plain-language acceptance test, and the expected deliverable.
2. Read **entire exact current raw files** before editing. The 2026-10-31 archive used for planning is not automatically authoritative if a newer local revision exists.
3. Before touching fragile routes or SVG interaction code, identify the specific regression risks and required preservation checks.
4. Never combine a projection migration, full map restyle, dependency update, and unrelated code cleanup in one unbounded pass.
5. Prefer a uniquely versioned ordinary-source ZIP handoff with verified internal paths, exact PowerShell copy commands, and user-run build/browser checks. No automated patch scripts unless separately requested.
6. Commit coherent tested results separately. Record accepted/rolled-back experiments in the Changelog at the next appropriate documentation synchronization, rather than claiming this plan itself is a committed feature.

## 9. Suggested first execution checkpoint

**Phase 1 deliverable:** a current-source projection/viewport audit reporting (a) exact source ownership, (b) feasible Web Mercator integration boundaries, (c) an alignment test strategy, (d) a candidate tile provider and export feasibility question, and (e) a go/no-go decision for a small D3 raster-tile prototype.

**Minimal researcher-visible success case for the later Phase 2 prototype:** Open Geographic Map with known coordinates for Florence, zoom from world to a Florence neighborhood, and see street geography appear under correctly positioned Peridot nodes/edges while zoom/pan, map controls, and Inspector selections continue to work.

**Overall completion criterion:** Peridot provides defensible, performant, legible world-to-neighborhood geographic context without modifying accepted research semantics or introducing hidden geographic inference.

---

### Related internal references

- `core_documentation/MAINTAINERS_GUIDE.md` — current geographic projection, Map settings, viewport and regression contracts.
- `core_documentation/PROJECT_WORKFLOW_CHARTER.md` — exact-source, bounded-pass, fragile-zone and delivery process.
- `core_documentation/CHANGELOG.md` — implemented milestones, archived MapLibre experiments and verified checkpoint.
- `planning_documents/Peridot_Genealogy_Retirement_Audit_20261026_v1.md` — unrelated, retained compatibility planning; not in scope.

**Documentation note:** This document records a proposed future development path. It does not amend the four core documents, assert deployment verification, or change the accepted current design.
