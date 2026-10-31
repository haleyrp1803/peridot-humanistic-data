# Maintainer's Guide

## Executive Summary

This guide is Peridot’s authoritative current architecture and maintenance reference. Use it to identify ownership boundaries, current data and interaction contracts, fragile systems, stylesheet responsibilities, regression expectations, and the active technical backlog before changing source code.

It complements the Project Workflow Charter, which governs process, and the Changelog, which preserves historical chronology. This guide does not reproduce full commit history; it records what the current architecture requires a maintainer to understand and preserve.

## Quick Navigation

- [Current architecture snapshot](#1-current-architecture-snapshot)
- [Application boundaries and route model](#2-application-boundaries-and-route-model)
- [Data lifecycle and scope vocabulary](#3-data-lifecycle-and-scope-vocabulary)
- [Visualizations, Timeline, Inspector, and Export](#4-visualizations-timeline-inspector-and-export-contracts)
- [Advanced Search / Explore](#5-advanced-search--explore-contract)
- [Analytics](#6-analytics-contract)
- [Data import and workbooks](#7-data-import-and-workbook-contract)
- [Theme and stylesheet architecture](#8-theme-and-stylesheet-architecture)
- [Module ownership index](#9-module-ownership-index)
- [Fragile zones and regression tests](#10-fragile-zones-and-regression-test-matrix)
- [Active backlog](#11-active-technical-backlog)
- [Archived and compatibility paths](#12-archived-and-compatibility-paths)
- [Fresh-chat handoff](#13-fresh-chat-handoff-essentials)

## Document Role and Boundaries

This document owns current architecture, source/module ownership, state and data contracts, fragile-zone descriptions, regression matrices, compatibility paths, and the active technical backlog. It does not own full commit chronology, broad public onboarding, or the mandatory process rules for changing source; those belong respectively to the Changelog, README, and Project Workflow Charter.

Current synchronized checkpoint:

```text
5e785ed — Refine About manuscript design and Data workspace responsiveness
Branch: main
Status: clean working tree; HEAD, origin/main, and origin/HEAD aligned (user-confirmed 2026-10-30)
```

For detailed milestone interpretation and full commit history, see [CHANGELOG.md](CHANGELOG.md).


## 1. Current Architecture Snapshot

Peridot is a Vite/React/Tailwind research application organized around a workspace-first, multimodal exploration environment. `src/App.jsx` remains the top-level orchestration boundary, while dedicated workspaces and pure/helper modules own most UI, import, visualization, theme, search, Inspector, export, and generalized mapping behavior.

The active data architecture is now one generalized user-mapping model over the canonical normalized research model. The public upload workflow no longer asks the researcher to choose Correspondence / Directed Record versus Genealogy / Person-Centered, and the former separate experimental “universal mapper” surface has been removed. Ordinary CSV/TSV/XLS/XLSX/XLSM uploads pass through the generalized mapping workflow; older correspondence/genealogy normalizers and adapters may remain internally as compatibility/specialization boundaries, but they are not competing public semantic authorities.

Generalized mapping is authoritative for Relations, Identity, Time, Places, Evidence, per-field cardinality, and record/participant subject attribution. Recurring-entity Identity is integrated into the mappings where entities are declared rather than exposed as a separate required page: simple data defaults to the displayed name/label, while stronger rules can use stable source IDs or alternate compound recipes such as `(Name A + Title A) OR (Name B + Title B)`. Canonical entity IDs remain identity authority; canonical entity labels are a separate presentation authority consumed by Network and Inspector.

Inspector has likewise crossed the generalized semantic boundary. Compact and full person/entity/place dossiers derive connected people, participant-attached places, temporal assertions, semantic relationships, canonical display labels, and subject-aware mapped Evidence from generalized structures rather than assuming every record has one Source and one Target. Subject attribution is authoritative and multiplicative: a mapping can describe the record, several participants, or both, while normalized assertions remain atomic. The same source place can therefore represent a child's birthplace and the mother's childbirth location without attaching both meanings to both people. Participant-attributed Evidence is projected from canonical mapped-Evidence assertions; record-only Evidence does not leak onto connected entities.

Mapped uploads are now editable after import. The Data workspace can reopen the original source with the active mapping, and **Apply changes** recompiles the dataset through the generalized import path. Workbook joins remain explicit unique-ID joins; unsafe duplicate join IDs are blocked rather than multiplied silently. Identity suggestions shown in the mapper are materialized into authoritative mapping state when accepted untouched, while intentionally cleared suggestions remain cleared.

Sample data is now first-class generalized data rather than hidden embedded fallback state. Peridot starts with **no active dataset**. A researcher must explicitly select a sample or upload their own data. `public/sample_data/` contains three ordinary downloadable source files—correspondence network, family tree, and cardinals—and `src/peridotSampleDatasets.js` pairs each with a preserved generalized mapping. The Sample Datasets tab remains accessible and may be revisited repeatedly; selection state is owned at the application level so choosing one sample does not prevent replacement with another. Sample mappings can be edited for learning/QA without mutating the shipped mapping; **Reset to sample mapping** restores the canonical interpretation.

Canonical temporal semantics remain fully authoritative across active consumers. The former `parsedDate`, `parseHistoricalDate`, duplicate capability parser, and lexical date-sorting fallbacks are retired from active `src`. ISO 8601 timestamp strings are accepted as day-precision temporal values while preserving the complete source text; parsing uses the lexical source calendar date rather than timezone-shifting historical dates. Search consumes generalized relationships and places plus canonical subject-aware Evidence; its Results presentation is generalized rather than route-shaped, and the Search/Timeline/Analytics scope audit is complete.

Network semantics have now crossed the principal generalized boundary as well. Geographic relationship scope respects Timeline-visible dated relationship observations while retaining genuinely undated structural relationships; `peridotEntityNetwork.js` provides generalized geographic anchor semantics; the old separate place/person map distinction has been collapsed into one Geographic Map; Map settings apply anchor roles, display identities, relationship-line location rules, and fallbacks transactionally; geographic edges require both exact visible endpoint node instances; hover/provenance language is generalized; and playback highlighting consumes the rendered generalized graph rather than rebuilding a correspondence-shaped Source→Target pair. The accepted playback/interaction performance sequence from `c8a7c46` remains current: the bottom playback scrubber uses transient local preview state, pointer panning and wheel zoom use transient SVG transforms before durable state commits, and Force playback reuses a stable full-scope graph instead of rebuilding/re-simulating geometry on every playback tick. The discarded playback tween/geometry-animation prototypes remain absent.

The active public workflow now uses a persistent site-wide header rather than a hamburger-first route model. The Peridot logo returns to Home; **Data**, **Visualize**, and **Explore** occupy the primary task group; **Tutorials** and **About** occupy the project/help group. The header persists across public pages, and page navigation does not intentionally unload the active dataset or reset accepted workspace state. Visualize owns Map, Network, Timeline, Charts, and Export; Explore owns Browse, Advanced Query, and Refine; Data owns project start/edit plus the full-page mapping workspace; About owns About Peridot, Creator, AI Disclosure, Open Source, and Feedback. Themes and Accessibility remains implemented as an internal compatibility/development route but is not a public header destination. The historical Home tutorial placeholder remains retired; the active Home now has one Get Started entry action. Substantive guided Tutorials remain deferred.

### Current source context

- Local source of truth: `C:\Users\haley\OneDrive\Desktop\Peridot\`
- Active continuation branch: `main`
- Repository: `https://github.com/haleyrp1803/peridot-humanistic-data`
- Active D3/SVG path: MapLibre experimental work is archived and not part of active `main`.

### Supporting planning documents

The following tracked planning documents remain relevant maintenance references:

- `planning_documents/PERIDOT_INTERFACE_REDESIGN_PLAN.md` — original workspace-first redesign rationale and public-navigation direction.
- `planning_documents/PERIDOT_ROUTING_CONTRACT_AUDIT.md` — routing and compatibility-boundary audit.
- `planning_documents/PERIDOT_INSPECTOR_WORKSPACE_CONTRACT.md` — compact/full Inspector model and shared-state contract.
- `planning_documents/PERIDOT_CODE_STRUCTURE_AUDIT.md` — structural cleanup roadmap and bounded future decomposition reference.
- `planning_documents/PERIDOT_NORMALIZED_DATA_MODEL_PLAN.md` — historical/architectural plan that established the canonical normalized model, provenance/temporal contracts, correspondence compatibility boundary, and genealogy normalization sequence; much of this plan is now implemented.

### Application-boundary inventory

| System | Primary owner | Core responsibility | Sensitive coupling | Minimum regression check |
|---|---|---|---|---|
| Top-level orchestration | `App.jsx` | state, derived data, routing, Inspector history, export wiring | filters, timeline, compact/full Inspector bridge | open each workspace; upload/use sample; click node/edge/cluster |
| Workspace navigation | `App.jsx`, global header/navigation boundaries, `peridotWorkspaceConfig.js` | persistent public routing, state continuity, hidden Theme compatibility | active dataset, workspace/viewport state, Inspector presentation | logo/Home; Data/Visualize/Explore/Tutorials/About; cross-page state persistence |
| First-time tutorial | tutorial state, panel, dock, anchor/highlight, and Home-entry boundaries | retained seven-stage guided workflow; Home launcher currently disabled pending revision | workspace routing, Inspector close behavior, target observation, keyboard focus | verify disabled Home placeholder now; rerun full seven-stage regression when launcher is re-enabled |
| Data import | Data workspace + mapping/import helpers | parse, map, validate, normalize, capability audit | upload reset and downstream data scope | template, CSV, TSV, XLSX, XLSM, XLS, mapped import |
| Visualizations | `PeridotVisualizationsWorkspace.jsx`, `PeridotTimelineWorkspace.jsx` | map/network/chart modes, dedicated Timeline workspace, shared playback control, header, stage, Export menu | stage sizing, Inspector overlay, search/playback scope, portal layers | map/network/timeline/chart switch; Timeline orientation/zoom/pan/categories; header/playback controls |
| Search | `PeridotSearchWorkspace.jsx` | draft/apply search and Explore UI | active dataset, facets, Inspector handoff | Apply/Clear, suggestion, pagination, Inspect return |
| Inspector | Inspector modules + `App.jsx` | compact/full evidence dossier and history | selection resolution, mounted overlay | node/edge/cluster; Expand; Back; close |
| Analytics | Analytics modules | controls, derivation, SVG rendering and chart export | scope/date handling, palette roles | chart switch, series selection, export |
| Theme/CSS | theme modules + stylesheets | semantic colors and component presentation | import order, dropdown/z-index, reduced motion | theme role/palette change; each workspace |
| Export | `exportHelpers.js` + Visualizations header | image/tabular export | visible/selected/charted scope | SVG/PNG/CSV output |

## 2. Application Boundaries and Route Model

Peridot uses a workspace-first route model with a **persistent global header**. The logo is the Home control; **Data**, **Visualize**, and **Explore** are the primary task destinations; **Tutorials** and **About** are persistent project/help destinations. Lightweight page navigation is immediate; the heavier transition overlay is reserved for expensive workspace/visualization changes and for entering the full-page mapping workspace. **Themes and Accessibility** remains implemented and route-compatible internally, but is intentionally absent from the public header.

### Workspace boundaries

| Surface | User-facing role | Primary boundary | Important maintenance condition |
|---|---|---|---|
| Home | concise start surface and return anchor | `PeridotHomeWorkspace.jsx` + global header/logo routing | preserve branded entry composition; logo remains a reliable Home action |
| Data | project start, source replacement, mapping, validation | `PeridotDataWorkspace.jsx`, `PeridotSampleSelectionPage.jsx`, `PeridotColumnMappingModal.jsx`, mapping/import helpers | preserve permissive database-first ingestion, explicit user mapping, and full-page mapping behavior |
| Visualize | Map, Network, dedicated Timeline visualization, Charts, shared playback, Export | `PeridotVisualizationsWorkspace.jsx`, `PeridotTimelineWorkspace.jsx` | preserve stage sizing, mounted Inspector behavior, state persistence, Timeline viewport/navigation, and header/playback layering |
| Explore | Browse, Advanced Query, Refine, applied research scope | `PeridotSearchWorkspace.jsx` | preserve draft/apply semantics, three-mode local navigation, result/facet/capability placement, and return-to-state Inspector handoff |
| Tutorials | public help/tutorial destination | current tutorial routing/placeholder boundaries | destination is established; substantive Tutorials redesign remains deferred |
| About | project context, creator, AI disclosure, open source, Feedback | `PeridotLearnMoreWorkspace.jsx`, `PeridotFeedbackForm.jsx` | preserve local About hierarchy, readable scroll containment, inline Feedback, and scholarly project context |
| Themes and Accessibility | internal appearance/settings workspace | `PeridotThemeWorkspace.jsx` | retain route/component even while public entry is hidden |
| Inspector | compact selection summary and full dossier | Inspector modules + `App.jsx` | compact/full modes share selection and Back history |

### First-time tutorial contract

The tutorial is a retained guided overlay system rather than a separate workspace, but it is **not currently launched from Home**. Historically, `b7482cb` removed the floating invitation and added a disabled **Tutorial** placeholder beneath two Home data-entry actions. That placeholder was later superseded by the current Cartographic Editorial Home; Tutorials remains available as a global navigation destination, while substantive guided content is deferred.

When tutorial work resumes, preserve the existing seven-stage implementation as the starting baseline unless an explicit redesign supersedes it: Visualizations → Timeline → Inspector → Explore → Browse / Apply → Working Set → Export. The existing draggable/minimized panel, Back/Continue, recovery, target-observation, and keyboard-accessibility behavior remains source/history to protect during revision; do not silently revive the old floating Home invitation.

Current minimum regression check: Home displays the single **Get Started** action linking to Data onboarding, the **New to Peridot?** banner guidance, and informational three-column banner, Tutorials remains a global navigation destination, and no obsolete floating tutorial invitation or disabled Home placeholder reappears. When the guided launcher is re-enabled, rerun the full seven-stage, drag, minimize/restore, keyboard, Inspector-close, anchor, and recovery regression suite.

### Current route and visualization model

- Visualizations exposes one unified **Geographic Map**, a separate **Force-Directed Network**, and Chart Visualizations. The former Place Map / People Map split is superseded.
- Geographic Map settings can label nodes as Places, People / entities, or both; choose one or more mapped geographic anchor roles; choose relationship-line event geography plus explicit fallback behavior; and reserve an Appearance section for later sizing/scaling work.
- Map settings use a draft/Apply model. Reset affects draft state; graph recomputation occurs on Apply; Geographic and Force viewport state is preserved separately; Fit View is explicit.
- Geographic edges render only when both resolved endpoint node instances are currently visible. Never draw a floating edge to a hidden endpoint or manufacture Cartesian products across several visible anchors.
- Timeline has **two distinct Visualizations roles** that must not be conflated: (1) a dedicated Timeline visualization workspace for event-card chronology, categories, zoom/pan, and mapped connections; and (2) the existing compact bottom Timeline/playback control for global range clamping and playback across visualization modes. The dedicated workspace is additive and did not replace the bottom control. Scrubbing previews locally while dragging and commits canonical playback position on release. Export is a shared Visualizations header menu rather than a separate workspace.
- Advanced Search is the primary Explore surface and owns global applied filtering.
- Legacy rail and panel paths exist only as compatibility bridges where they preserve visualization-click Inspector behavior.
- MapLibre work is archived; active `main` uses the D3/SVG path.

Detailed subsystem contracts appear in Sections 4–8. The module index in Section 9 identifies the concrete source owners.

## 3. Data Lifecycle and Scope Vocabulary

Use these terms consistently:

| Scope term | Definition | Created by | Consumed by | Known audit caveat |
|---|---|---|---|---|
| loaded data | all records currently loaded in the app | sample-data or import path | Search, visualization derivation, Analytics, export | may contain incomplete but accepted records |
| mapped/normalized data | accepted source interpretations represented in the canonical model, plus compatibility/runtime projections where a consumer still requires them | profile/universal mapping, canonical normalizers, and runtime adapters | graph, capability, search, Inspector, genealogy, and future universal consumers | mapping remains user-owned; not every canonical-only universal dataset has a current runtime consumer |
| applied/filtered data | records remaining after the active Timeline range and committed Advanced Search criteria; stable across playback | Timeline range + Search Apply Filters | Search Results/Refine, visualizations, Inspector dossiers, Analytics inputs, exports | Browse intentionally uses loaded data instead |
| timeline-visible data | applied/filtered records visible at the current playback moment | Timeline playback | active map/network stage and visible graph exports | Analytics adds genuinely undated/non-positionable records back to chart scope unless explicitly excluded |
| selected data | node, edge, cluster, entity, place, route, or record under inspection | interaction/Inspector state | compact/full Inspector | entity/place dossiers use applied/filtered linked-record scope rather than shrinking with playback |
| charted data | records or derived values supplied to a chart | Analytics derivation helpers | chart renderer and chart export | dated rows obey Timeline/playback and chart-local date range; undated rows remain by default unless **Exclude undated records?** is checked |
| exported data | output explicitly described by an export action | export helpers/header actions | image/CSV file | graph exports reflect the visible graph; chart export reflects charted data; provenance includes structured and capability Search filters |

The Search/Timeline/Analytics scope audit is complete at `656010d`. Preserve these distinctions rather than collapsing applied/filtered, playback-visible, selected, charted, and exported data into one implied scope.

## 4. Visualizations, Timeline, Inspector, and Export Contracts

### Inspector

The Inspector is a dual-mode evidence system. Visualization clicks open compact side-panel summaries; **Expand**, linked-data navigation, and full Inspector routes open the dossier workspace. Compact and full modes share one selected target and a central multi-step history owned through `App.jsx`.

The linked-data navigation model remains a hard preservation contract. Researchers must be able to move through chains such as node → connected person → another connected person → connected place → connected record, then use **Back** several times and branch from an earlier dossier without losing the previous sequence. Full Inspector continues to overlay the mounted Visualizations or Explore workspace rather than remounting it.

Generalized Inspector semantics plus canonical identity/Evidence projection established before the Search audit remain the accepted model through `1810a40`:

- `PeridotRecordStructure.jsx` / `peridotRecordStructure.js` expose mapped temporal assertions, generalized relationship participants, participant-attached places, semantic relationship counterparts, and evidence without forcing records into Source/Target display.
- `peridotIdentityRuntime.js`, the generalized mapping runtime, `peridotEntityNetwork.js`, and Inspector selection/aggregation paths preserve authoritative mapped entity IDs when available. Same-label people remain distinct when their mapped identities differ; one recurring entity remains unified across different mapped roles.
- `peridotEntityDisplayLabels.js` resolves presentation labels from canonical entities so downstream consumers do not independently choose between raw reference IDs and human-readable names; unresolved references remain source-faithful IDs.
- `peridotEntityEvidence.js` projects canonical `mapped-evidence:*` assertions onto the selected canonical entity and filters them to the current applied/filtered linked-record scope. Record-only Evidence remains on records rather than being inherited by every participant; playback does not silently shrink entity/place dossiers.
- Person/entity dossiers derive Connected People from explicit generalized relationships and include later Part C/D/etc. participants rather than truncating to a legacy pair.
- Place and temporal information respect mapped subjects. A row that contains both a child and mother may legitimately provide the child’s birth date/place and the mother’s childbirth date/place without attaching both assertions to both people.
- Place profiles derive connected people through participant-place associations. A place may therefore connect to people even when there is no correspondence-style source/target route.
- User-named place roles remain visible and semantically distinct. The same underlying source value can appear under different participant-specific meanings.
- Directed place connections are shown only when explicit directed place pairs exist in the mapped record. Non-correspondence data is not required to produce artificial routes.
- Connected-record tables preserve chronological sorting, filtering, pagination, and generalized mapped-information drilldown. Correspondence-shaped columns may still appear when the data genuinely maps those roles, but they are no longer the universal semantic source.

Ownership remains:

- `App.jsx` owns Inspector presentation mode, selection resolution, central history, and linked person/place/record/route navigation.
- `InspectorPanel.jsx` owns shared Inspector content chrome; `InspectorBodyRouter.jsx` resolves view type.
- `InspectorNodeView.jsx`, `InspectorEdgeView.jsx`, and `InspectorClusterView.jsx` own the principal dossier views.
- **Unknown** remains a first-class place-like bucket for genuinely unresolved/missing location evidence.
- `peridotRecordStructure.js` is the preferred generalized semantic reader for mapped-information detail and entity-attributed structures; avoid reintroducing separate Source/Target-only aggregation logic.

Minimum regression checks: node, edge, and cluster click; compact close; Expand; related person/place; record and legitimate route navigation; at least a five-step linked-data chain; repeated Back; branch from an earlier history state; Explore-to-Inspector return; full Inspector open/close without stage reanimation; genealogy mother/father/partner coverage; participant-specific time/place attribution; duplicate-label identity cases; and correspondence sender/recipient preservation.

### Visualizations and Timeline

Visualizations owns the unified Geographic Map, Force-Directed Network, dedicated Timeline visualization workspace, chart entry points, header presentation, the shared bottom Timeline/playback control, and the shared Export menu. The dedicated Timeline workspace and the bottom playback control are separate responsibilities. Both consume canonical `temporalAssertions[]`; the former `parsedDate` fallback has been retired from active source. A record may contribute multiple assertion-level timeline events, and interval filtering uses temporal intersection rather than only an interval start.

The Geographic Map is one projection over generalized entity/place assertions rather than two separate place/person maps. `peridotEntityNetwork.js` resolves researcher-selected anchor roles plus an independent **Most frequent place** rule, deduplicates identical entity/place coordinates, and retains role/provenance information. Relationship-line geography follows the explicit hierarchy **relationship/event geography → selected fallback anchor → no defensible location, no line**. Several source-supported geographic manifestations may exist when several explicit relationship observations support them; Peridot must not generate a Cartesian product across unrelated visible anchors.

Map settings are transactional. Draft changes do not eagerly rebuild the graph; **Apply** commits node-label, anchor, and relationship-line rules together, while **Reset** changes only the draft. Geographic and Force viewport state are remembered independently. Fit/recenter occurs for initial/new data or an explicit user action rather than every settings or playback change. A geographic edge may render only when both exact endpoint node instances are visible under the applied settings.

Playback highlighting is generalized at `ddc0aca`. The active playback record set is matched against provenance already stored on rendered graph edges; every rendered edge supported by the active record(s) can highlight, and highlighted endpoint node IDs come from those actual rendered edges. This supports multipart relationships without inventing links among co-participants. Co-current playback highlights the full set of relationships active at the current moment; cumulative playback emphasizes the newly reached record. Relationship-free temporal assertions can still highlight relevant visible entity nodes. Cluster display can inherit active-member highlighting. The implementation deliberately does **not** contain the later experimental pulse/tween/geometry-animation systems: those prototypes were rolled back before `ddc0aca`.

Performance work through `c8a7c46` deliberately separates transient interaction from expensive semantic/geometry derivation. Pointer drag applies an imperative transient SVG transform and commits durable viewport state on release. Wheel zoom uses a native non-passive wheel listener, applies transient zoom immediately, and settles durable viewport state after interaction; clustering/label derivation therefore does not rerun for every wheel event. Force playback derives a stable full-scope Force graph and filters its rendered provenance/degree/radius against the current playback scope instead of calling `buildPersonGraph()` and rerunning synchronous force ticks for every playback frame. The analogous Geographic preload experiment did not materially improve performance and was excluded from the clean candidate.

The **dedicated Timeline workspace** was added in the `d82406e` → `a32ef05` sequence. `peridotTimelineWorkspaceModel.js` projects the already-applied Search scope into assertion-level Timeline events while preserving source record identity, temporal form/precision/uncertainty metadata, record-versus-participant temporal subject, and plural Evidence-derived category membership. Category inventories are evidence-driven; category visibility is OR-based across enabled memberships rather than requiring one exclusive category per event.

Timeline workspace presentation is owned by `PeridotTimelineWorkspace.jsx`. Horizontal is the default orientation and places earliest → latest left-to-right. Vertical places earliest → latest bottom-to-top. Both orientations keep chronology exact on the temporal axis and use the secondary axis for layout. The viewport is the same bounded visualization-stage concept as Map/Network: overflow is navigated inside the stage rather than by expanding the page. Scrollbars remain available, click-and-drag pans the viewport, mouse wheel zooms smoothly, and +/- controls provide explicit alternatives. Scroll extent is padded so the earliest/latest event can be isolated at the corresponding edge rather than being permanently pinned against neighboring content.

The Timeline axis is zoom-adaptive rather than year-only. It moves among year/month/day granularity as space permits and performs collision suppression after tick placement so adjacent boundary labels do not overwrite one another. Zoom is continuous rather than restricted to arbitrary percentage stops; the displayed zoom value is descriptive, not a finite preset scale.

Timeline category controls derive candidate category fields from mapped Evidence. Users opt fields in, then toggle their values. Events may carry several categories simultaneously, and visible membership composes plurally. Markers can be encoded by color or shape so category differentiation does not rely on color alone. The Categories panel has fixed dimensions, closes on outside click, and is grouped with orientation/zoom controls rather than resizing with its contents.

Timeline event selection opens the shared Inspector behavior used by other visualizations. Compact selection is event-oriented, while **Open full dossier** bridges back to the complete source record/subject evidence system. Search/Explore remains authoritative for the applied event scope, so committed queries constrain the Timeline in the same way they constrain the other visualizations.

Mapped Timeline connections are conservative. They are derived only from explicit mapped relationships; shared categories, shared participants in unrelated records, or chronological proximity do not create edges. Relationship records that are already represented as their own temporal event are not reinterpreted as arbitrary event-to-event lines. Structural relationship projection resolves two distinct relationship endpoint subjects to representative visible events, preferring a subject's lifespan where available before fallback temporal assertions. The current `a32ef05` model adds subject-strict endpoint checks, a continuous relationship/collision-aware secondary-axis layout, and a visually distinct interval-duration treatment. **Relationship-line routing/presentation remains unfinished active work**: current geometry is a foundation, not a final accepted ClioVis-level connection treatment.

The shared bottom Timeline/playback control remains unchanged in role. It derives available **Time types** from mapped temporal roles and keeps controls visible even when only one role is available. Playback supports **Cumulative Events** and **Co-current Events**. Cumulative mode retains records after their date or period begins/occurs; co-current mode recalculates visibility at the current moment, removes ended intervals, bounds point dates to their temporal unit, and inserts interval-end checkpoints so disappearing records are observable. A co-current moment with zero active rows is a valid empty visualization state and must not cause capability routing to replace the workspace with an unavailable-state screen. The bottom control combines range-clamping handles with a draggable playback playhead; local preview state is used during drag and the canonical playback index is committed on release.

### Export

Export is a header action rather than a top-level workspace. Map/network exports include SVG, PNG, nodes CSV, and edges/routes CSV; Chart Visualizations provides PNG export through the same header menu. Map PNG default output is map-only, without mandatory Peridot branding, with optional title and metadata annotations.

## 5. Advanced Search / Explore Contract

Explore is the owner of global **applied/filtered data** and now presents three local modes: **Browse**, **Advanced Query**, and **Refine**. It retains the explicit draft/apply model: typing, suggestions, Browse selections, facets, and structured criteria change draft state until **Apply Filters** commits the scope.

### Responsibilities

- **Browse** indexes the loaded dataset. Generalized Places and canonical Evidence are included; explicit Routes remain separate and appear only when meaningful route data exists.
- **Advanced Query** contains Build Search plus the current generalized result set. Build Search supports keyword, person/entity, place, explicit route-place, entity-relationship, date, capability, and structured criteria inputs; Results remain neutral Date / People or entities / Places rows with pagination, mapped-information drilldown, and Inspector handoff.
- Structured criteria support Required / Any-of / Excluded groups plus optional **count conditions attached to a specific criterion**. Count conditions use plain language such as **This person has at least N connected entities**, **This place has at least N connected places**, or **People in these records have at least N connected entities**.
- Count-condition reference counts are derived from the loaded/mapped Search dataset; the primary criterion determines which records are returned. Place-to-place connection counts use explicit directed place connections and never infer a route merely because several mapped places occur in one record.
- **Refine** exposes applied-result facets, Inspector handoff guidance, and dataset capability review. Generalized place and canonical Evidence facets fill draft controls for later Apply rather than silently changing scope.
- Results and Capabilities remain behaviors/content areas but are no longer independent top-level Explore modes.
- Inspect opens the full Inspector above the current Explore state, so closing it returns the researcher to the same search context.
- The legacy global minimum correspondence/connection weight is retired. Do not restore it as a universal dataset filter; the generalized replacement is criterion-attached count conditions.

### Scope and regression contract

Search is a fragile active-data boundary. Browse intentionally uses loaded data; Results and Refine use applied/filtered data and remain stable while playback advances. Entity/place Inspector dossiers opened from Search use the same applied/filtered scope rather than playback visibility.

After changes, verify draft suggestions, Apply, Clear, Boolean criteria, attached count conditions, generalized Place behavior, canonical Evidence behavior, Browse/facet behavior, Results pagination, Inspector return-to-state behavior, and interaction with Timeline, Analytics, and Export.

Known bounded follow-up: **Any record text** does not yet guarantee that every generalized mapped semantic value is indexed. Explicit fielded criteria such as Place correctly search generalized assertions.


### Preserved detailed Search regression expectations

The following implementation-level expectations were relocated from the Project Workflow Charter so the Charter can remain process-focused. They remain current maintenance requirements.

<details>
<summary><strong>Open detailed Advanced Search preservation notes</strong></summary>

Advanced Search is the intended consolidation point for global filters and the primary Explore Your Data surface.

Committed Advanced Search controls include:

- keyword search
- person filter
- place filter
- **Route Filter (Place)**
- **Route Filter (People)**
- date range
- predictive suggestions for person, place, route-place, route-people, start-year, end-year, and structured-criteria value fields
- structured criteria with AND / OR / EXCLUDING connectors
- dataset-wide Browse indexes for people/entities, places, routes, and evidence fields
- result cards with Inspector handoff
- result facets based on the current applied result set
- Capabilities tab containing what-this-data-can-do summaries
- **Apply Filters**
- **Clear Filters**
- pre-update status feedback

Future Advanced Search controls may include:

- language/relationship filters
- mappability filters
- safe categorical metadata filters
- inspector actions such as “filter to this person/place/route”

Filter controls should not trigger expensive graph/data recomputation on every keystroke or draft edit. Use draft values with an explicit **Apply Filters** action when the filter can affect the active dataset. Use **Clear Filters** to reset the global filter state. For expensive full-dataset updates, show visible feedback before committing state changes so users understand that the app is updating.

When changing Advanced Search, explicitly test:

- typing in a text field does not freeze the app
- filters apply only when intended
- current applied filter scope is clear to the user and remains visible near the top of the workspace
- Timeline playback remains functional
- Analytics receives the intended filtered scope
- Export scope remains clear

---

Detailed subsystem regression checks belong in the Maintainer’s Guide. Preserve the distinction between active paths, compatibility paths, and archived experiments.

</details>

## 6. Analytics Contract

Analytics is conceptually part of Visualizations. It supports Bar, Grouped Bar, Stacked Bar, Line, Multi-Line, Histogram, Pie, Sunburst, and Heatmap views; tabbed controls; manual category/series selection; persistent summaries/legends; a default finite 30-color series library; and chart PNG export.

Core ownership:
- `AnalyticsPanel.jsx` owns the configuration UI and registers export upward.
- `analyticsConfig.js` owns chart metadata, defaults, and curated variable definitions.
- `analyticsDerivationHelpers.js` owns variable detection, bucketing, filtering, aggregation, and chart-ready data.
- `analyticsChartComponents.jsx` owns SVG rendering, card/legend geometry, visible summaries, ticks/gridlines, theme-series marks, and exportable SVG surface.

The current accepted chart model uses a quarter-width control rail and three-quarter chart/legend card. Bar charts default to vertical orientation. Use semantic chart series roles rather than local hardcoded colors.

Analytics receives the Search-filtered/playback-visible dated scope while preserving genuinely undated/non-positionable Search-matching records for charting. Its local Start/End Year controls constrain dated records; **Exclude undated records?** is a separate explicit checkbox and is off by default. This contract was verified during the `656010d` scope pass and must remain aligned across chart derivation, visible totals/legends, category inventories, and PNG export.

## 7. Data Import and Workbook Contract

Peridot supports a simple downloadable template, arbitrary CSV/TSV mapping, workbook-aware XLSX/XLSM/XLS import, editable post-import mappings, and three first-class sample datasets. The public import model is now **one generalized mapping system** rather than a Correspondence-versus-Genealogy profile choice. The canonical model remains database-first: source material may remain useful even when it is not map-, network-, timeline-, or chart-ready.

### Canonical normalization and compatibility boundary

The current public import architecture is:

```text
parsed/staged source
→ explicit user-owned generalized mapping
→ authoritative generalized runtime observations / canonical normalization
→ validation and capability derivation
→ compatibility/consumer projections only where still required
```

Older correspondence and genealogy profile/normalizer modules remain in source where they still provide compatibility or specialized canonical/runtime projection behavior. They are not public ontology choices and must not override accepted generalized mappings. A later retirement audit should remove only code whose replacement has been proven end-to-end.

### Import contract

- `PeridotDataWorkspace.jsx` and `PeridotSampleSelectionPage.jsx` own the four-tab entry through **Get Started**, **Sample Datasets**, **Templates**, and **Upload Data**. It no longer exposes the old Correspondence/Genealogy profile selector or a separate experimental universal-mapper surface.
- Peridot starts with **no active dataset**. Do not restore a hidden sample fallback beneath Home/Data. A dataset becomes active only after an explicit sample selection or user upload.
- `PeridotColumnMappingModal.jsx` retains its historical filename but now renders the generalized mapping workflow as a **full-page Data workspace**, not a modal overlay. The local mapping rail is directly navigable and uses Preview, Sheets where applicable, Relations, Time, Places, Evidence, and **Review and Upload**. Recurring-entity Identity controls are integrated into Relations/Places when needed rather than occupying a separate required page. Cancel is separated from the Back/Next progression group; entering mapping uses the established heavier transition to avoid a flash of unstyled/settling content.
- Mapping is explicit, progressive, reversible, and user-owned. Peridot may propose recognizable structures, but it does not silently standardize values, merge entities, assign scholarly meaning, or infer irreversible relationships.
- Existing uploaded mappings are editable after import. **Apply changes** recompiles the active dataset from the preserved original uploaded source with the revised mapping rather than patching only the rendered runtime rows.
- Identity mapping separates **record identity** from **recurring entity identity**. Simple recurring entities default to the mapped display name/label; stronger rules may use stable IDs or alternate compound recipes whose complete branches represent equivalent appearances of the same entity across roles/sheets.
- `peridotIdentityRuntime.js` compiles accepted Identity mappings into stable runtime entity keys. `peridotEntityDisplayLabels.js` separately supplies canonical presentation labels; display text does not become identity authority.
- Visible suggested Identity assignments are materialized into authoritative mapping state when accepted unchanged. If the researcher explicitly clears a suggested field, the blank remains intentional and is not silently restored.
- Relations uses repeatable `relationshipParts` (Part A/B/C...) with per-part participant and role mappings, plus optional relationship-level type/label fields. N-part relationships must not be silently reduced to one Source/Target pair.
- Time uses repeatable temporal mappings. Each user-named Date or Period/range can describe the record, one or more mapped participants, or both. Mapping-level multiplicity fans out into atomic single-subject temporal assertions. Date sources may be one column or separate year/month/day columns; Period sources may be one range column or separate beginning/end representations, including six-column Y/M/D + Y/M/D ranges. Structured component representations remain structured units rather than parallel list arrays.
- Each temporal assertion may attach researcher-note columns. Notes remain separate from machine-derived temporal structure and do not silently control visualization eligibility.
- Places uses repeatable `placeParts` (Place A/B/C...) with a place source, researcher-visible named role, record/participant subject selection, optional recurring-place Identity, per-field cardinality, and optional combined or separate coordinates for single-valued place cells. Multi-valued place cells cannot reuse one row-level coordinate pair.
- Place subjects are authoritative. Reusing one source column for two different participant-specific mappings is valid; for example a child’s source-row place may be mapped as `place of birth` for the child and as `birthed child here` for the mother.
- Workbook Relations, Identity, Time, and Places use sheet-qualified references and the same generalized semantic model.
- Evidence retains explicit Include/Ignore controls, optional display labels, examples, per-field cardinality, record/participant subject selection, and downstream chart/search availability where appropriate. Cardinality splits first and subject attribution fans out second. Canonical subject-aware Evidence assertions link to the existing per-record EvidenceSource, while compatibility `customFields` remain deduplicated by source interpretation. Structurally mapped fields may remain visible without being duplicated as evidence.
- **Review and Upload** is the summary + validation + correction checkpoint. It repeats accepted assignments, reports temporal/capability information, and exposes warnings without treating legacy correspondence-shaped requirements as semantic authority. For edits to an active mapping, the final action remains an apply-changes operation rather than pretending the source is a new upload.
- Workbooks use a selected primary record sheet and explicit unique-ID joins. Row order is not a primary join strategy. Duplicate join IDs that would make assembly unsafe must be blocked or clearly surfaced rather than multiplying rows silently.
- The generalized mapping/source/transformation layer is authoritative. Legacy correspondence-shaped fields may exist only as downstream compatibility projections.

### First-class sample-data contract

The sample system is QA infrastructure and a public learning surface, not a separate demo architecture.

Canonical source files:

```text
public/sample_data/correspondence_network_sample.xlsx
public/sample_data/family_tree_sample.csv
public/sample_data/cardinals_1600_1640_sample.xlsx
```

`src/peridotSampleDatasets.js` owns each sample’s display metadata, source path, and preserved generalized mapping.

Rules:

- samples are ordinary source files passing through ordinary generalized mappings;
- the user must explicitly choose a sample before it becomes active;
- the Sample Datasets tab is explicitly available and revisitable after a sample is active and supports replacing one active sample with another without stale local gating state;
- sample source files are downloadable and may be modified/re-uploaded as ordinary user data;
- sample mappings are inspectable and editable in the active session;
- editing a sample changes the active interpretation only, not the shipped sample mapping or source file;
- the mapping editor must show: **“You’re editing Peridot’s interpretation of this sample data. Your changes will affect the active sample, but the original sample mapping is preserved and can be restored at any time.”**
- **Reset to sample mapping** restores the preserved shipped mapping before the user reapplies it;
- sample mapping edits remain identifiable as sample state rather than being silently converted to researcher-upload state;
- the retired `src/peridotSampleData.js` embedded fallback must not be restored.


### Shared mapping interface presentation (first implemented design checkpoint)

At `f3cf4fb`, Relations, Time, and Places gained the first shared Cartographic Editorial mapping presentation system over the existing generalized model. `PeridotMappingPresentation.jsx` owns reusable stage mastheads, hierarchy markers, info-trigger/popup presentation, and contextual guidance components; `PeridotMappingFieldControls.jsx` composes stage-specific questions, while `PeridotValueHandlingControl.jsx` and `PeridotSubjectSelectionControl.jsx` retain shared cardinality and subject controls. `PeridotColumnMappingModal.jsx` still owns the full-page mapping shell and navigation, and `PeridotColumnMappingModal.css` owns its stage UI and compact options. These UI changes are not a change to researcher-owned mapping semantics.

Preserve: icon-and-pill navigation indicating optional mapping categories; compact stage title/subtitle; primary questions and indented lettered refinements; consistent card top alignment (including avoiding inherited `space-y-*` margins in horizontal option rows); content-sized choice cards while preserving real radio-versus-checkbox semantics; accessible `(i)` help on hover/focus/click and Escape; source examples, current interpretation, and Additional Context / Good to know; and visible warnings, constraints, and validation. Keep source values faithful and never hard-code illustrative mockup labels as actual defaults. Future refinements should consolidate shared Identity controls and extend the system to Preview, Sheets, Evidence, and Review and Upload without making optional data categories a mandatory sequence.

The planning references committed in `27e3cf7` are `planning_documents/Mockup Florence Atlas Homepage.png`, `Mockup Places Data Mapping Interface.png`, `Mockup Relations Mapping Interface.png`, `Mockup Sample Data Selection Interface.png`, and `planning_documents/Peridot_Genealogy_Retirement_Audit_20261026_v1.md`. The last item is an audit, **not** authorization or evidence that specialized genealogy import/runtime files have been deleted. Retain generalized genealogy data support and verify active dependencies before future retirement.

### Progressive disclosure and Excel import error contract (2026-10-28)

At `c0e1fb3`, `PeridotColumnMappingModal.jsx` introduced user-triggered activation for the existing Relations, Time, and Places editing surfaces: **Add a Relationship**, **Add a Date or Time Period**, and **Add a Location** appear before the full mapping form. `PeridotMappingFieldControls.jsx` retains the original full-width, two-column field-editor compositions and nested **Add another part** behavior. Suggested source mappings may still be identified, but they should only populate the newly opened form after user action. Relevant integrated Identity controls follow form activation. Preserve the difference between a suggested mapping and an accepted mapping; closing/navigating must not discard researcher-approved values. Test empty, suggested, previously mapped, and revisited states in both single-table and workbook entry paths.

**Relationship capacity:** the accepted model still represents one relationship group with `relationshipParts` (Part A/B/C...). Multiple *independent* relationship groups per row are not implemented. Do not represent a one-to-many participant collection as separately configured Mother/Father/Spouse relationships, or create clique edges from co-occurrence. The extension is deferred pending schema, compilation, canonical projection, Network/Inspector, and compatibility regression work.

At `55453a8`, the recognized Excel formats gained `.xlsm` in addition to `.xlsx` and `.xls`, including file chooser and upload routing support. The workbook parser reads worksheet data without executing macro code. Unsupported formats, failed parsing/unreadable workbooks, and data with no usable table must yield actionable user-facing errors, not misleading successful staging. Include `.xlsm` and failed-file cases in import regressions, including sample-selection entry, without changing the established unique-ID join contract.

### Current mapping-model status

The two major mapping-model questions previously deferred here are now implemented:

1. **Cardinality / multiple values in one cell.** Suitable mapped items support one-versus-many declarations plus an explicit researcher-chosen delimiter. Peridot normalizes common quoted delimiter input, preserves original source cells, and does not infer punctuation. Structured component dates/period endpoints remain structured units. Multi-valued place cells cannot apply one shared row-level coordinate pair.
2. **Record/participant attribution multiplicity.** Time, Places, and Evidence can describe the record, one or more mapped participants, or both through the shared subject-selection model. Mapping fan-out produces atomic single-subject assertions rather than subject arrays.

These capabilities should now be treated as preservation contracts, not backlog items.

### Minimum regression checks

Test: first launch with no active data; persistent-header navigation and logo/Home return; template download; all three sample chooser entries; sample source download; sample mapping edit/cancel/reset; CSV and TSV mapping; XLSX, XLSM, and XLS staging; full-page mapping entry without flash; direct mapping-section navigation; primary-sheet selection; multiple joins; duplicate-ID blocking; joined-field mapping; Identity continuity across repeated roles; Review and Upload/apply behavior; post-upload mapping re-edit/apply; retained accepted incomplete rows; cross-page active-dataset/state persistence; Search reset/coherence; Timeline and Analytics scope after upload; Inspector participant attribution and linked navigation; and relevant exports.

### Preserved detailed import regression expectations

The following implementation-level expectations were relocated from the Project Workflow Charter so the Charter can remain process-focused. They remain current maintenance requirements.

<details>
<summary><strong>Open detailed data-import preservation notes</strong></summary>

Committed Data behavior includes:

- downloadable simple Peridot template;
- one unified CSV / TSV / XLSX / XLSM table-workbook upload control;
- no implicit/default loaded sample on first use;
- explicit sample selection among ordinary generalized source files;
- downloadable sample source files and editable/resettable sample mappings;
- arbitrary CSV/TSV/Excel upload staging and role-based generalized mapping;
- editable post-import mapping that recompiles from the original source;
- post-upload validation and capability reporting;
- workbook parsing, mapping, explicit unique-ID joins, duplicate-join safeguards, and import assembly;
- selected workbook evidence/metadata visible in linked-record and entity-profile Inspector views;
- generic chart/evidence records admitted when they contain useful source content;
- Evidence Include/Ignore controls that default to Include;
- authoritative generalized relationship, Identity, temporal, place, and evidence semantics;
- stable cross-role entity identity where the researcher maps equivalent identity components;
- participant-specific temporal/place attribution;
- correspondence/genealogy-specific modules retained only where still needed as internal compatibility/specialization paths.

Future Data changes should explicitly test:

- the app begins with no active dataset;
- template download works;
- choosing a sample is required before sample data becomes active;
- sample files download correctly;
- sample mappings can be edited, cancelled, and reset without mutating the canonical mapping;
- uploading a valid mapped file updates the app data;
- reopening mapped data shows the current accepted mapping;
- applying mapping changes recompiles the original source;
- uploading a workbook stages sheets without freezing on reasonably sized files;
- workbook mapping can configure primary sheet, unique-ID joins, generalized roles, and selected evidence fields;
- duplicate workbook join IDs do not silently multiply records;
- untouched accepted Identity suggestions become authoritative;
- explicit mapping blanks stay blank;
- rows lacking coordinates are not silently discarded if otherwise accepted;
- rows lacking parseable dates are not silently discarded if otherwise accepted;
- Inspector still opens after upload and respects mapped participant subjects;
- Search remains coherent after import/remap;
- Timeline playback does not use stale date scope after upload;
- Analytics receives the intended uploaded/filtered rows;
- Export labels and exports the intended data scope;
- repeated visualization switching remains responsive after large workbook import.

Do not reintroduce the legacy three-file workflow, public Correspondence/Genealogy profile-choice screen, separate experimental universal-mapper surface, or embedded default sample fallback without an explicit architecture decision.

</details>

### Sample Selection, Tutorials, and informational workspace presentation (2026-10-27–28)

The sample chooser is now a dedicated parchment-backed selection page with three illustrated cards, one per shipped dataset: letter, Medici family tree, and Cardinal Carlo portrait. Image crop/frame settings are presentation only; sample files, generalized mapping definitions, and the requirement for explicit selection remain unchanged. The Home entrance effects use restrained sequential editorial animation; a decorative dotted-route trial was rejected.

The public Tutorials page now presents a Coming Soon state; do not claim the retained guided overlay is publicly launched. The no-dataset Visualize/Explore and About/Tutorials pages have had redundant eyebrow labels removed. The Creator page was returned to its earlier smaller-portrait and adjacent-biography layout after an experimental large profile-card series was rejected; the later `5e785ed` manuscript pass adds an external red ornamental portrait frame and artwork-aware wrapping without resurrecting the rejected large profile card. The revised Creator bio from that experiment is not the accepted live copy. The Feedback form remains the two-column editorial design. These are presentation decisions, not semantic or routing changes.

### Current Data onboarding and persistent dataset-management surface (2026-10-30)

At `ee4c3ff` (refined by `761d72d`), the Data landing surface has four top-level tabs: **Get Started**, **Sample Datasets**, **Templates**, and **Upload Data**. Get Started contains three standalone cards with a four-tile sample-choice icon, a template entry, and an upload entry. Sample Datasets retains historical-image cards for Correspondence, Genealogy, and Cardinals with **Use Sample**, **Edit mapping**, **Download source**, and **Details**. Templates offers the existing correspondence-oriented template, not a claim of several newly authored templates. Upload Data retains CSV/TSV/XLSX/XLSM/XLS support. The always-visible bottom status panel distinguishes no active dataset from **Your Active Dataset**, names the active source, and offers a prominent oxblood **Edit Mapping** action.

The Home's single **Get Started** CTA now enters this Data start surface. Entry and tab transitions use staggered top-to-bottom motion with prompt onset; the accepted desktop layout preserves room for the bottom status panel without forcing page-level scrolling. Mapping itself remains the established full-page generalized editor. Maintain continuity across tab switches and public navigation, preserve source/download/edit actions, and test no-data, active upload, active sample, sample replacement, and map-edit states. Do not conflate these presentation changes with a new parser or semantic model.

### Current asset naming and path ownership (2026-10-30)

Commit `52cf1f8` standardized the active decorative asset collection in top-level `assets/` using semantic prefixes including `base_`, `corner_`, `divider_`, `detail_`, `panel_`, `label_`, and `img_`. Directional corner variants use `TL`, `TR`, `BL`, `BR`; numeric differentiators, when needed, go at the end. All runtime image imports and CSS URLs must reference the actual committed names and preserve exact letter case on GitHub Pages. Commit `c71e265` repaired Home, Data sample, parchment, and Creator references after renaming; the user verified rendering. The later 44-file experimental labels/frames set was rejected and must not be assumed present. Historical asset names in earlier commits are provenance/history, not current source paths. Any later asset work requires alpha-edge inspection, viewport checks, and separate provenance/licensing review; adding a PNG to the repository does not automatically authorize its use everywhere.

### About manuscript composition and responsive Data regression contract (2026-10-30)

At `5e785ed`, About's page-specific illustrated corner overlays and revised parchment became accepted public-page presentation. The corner assets belong to the About content surface, not the browser viewport, global header, or navigation bar. Their outer corners remain registered to that surface, with controlled clipping/overscan as needed. Use artwork-aware text flow or shape exclusions to preserve the visual effect of type wrapping around a torn page, rather than forcing all text and controls into a permanent rectangular inset. Keep a small clearance from the visible torn boundary, and prevent rules, borders, input fields, notes, and buttons from drawing over the illustration. Preserve usable scrolling when a narrow viewport cannot contain the entire page.

**Page-specific composition:** About Peridot uses a top-left illuminated letter; Creator uses top-right alchemical imagery and a four-corner red decorative frame positioned *outside* the portrait; AI Disclosure uses lower-left celestial art; Open Source uses lower-right pomegranate art; Feedback uses top-left and lower-right alchemical corners. The Creator biography flows around the top-right asset and stays clear of the portrait's frame. Feedback retains its two-column form and a large, left-aligned Send feedback action in the second column; the footer/explanatory note and textareas must clear the lower-right corner even when columns narrow. The current use of warm `base_parchment_2` is a design choice, not a change to source data or application state.

**Data responsive contract:** At laptop-height desktop viewports, the Data entry screen should keep the four-tab navigation, sample title, three illustrated sample cards, and persistent bottom dataset-status panel readable without unnecessarily increasing vertical overflow. Preserve text scale when reducing card height; reduce vertical padding and illustration/card footprint rather than shrinking body type. The status panel's overall design remains unchanged, with a small but visible lower viewport gap; ensure controls stay accessible if the window is shorter. Do not change sample chooser semantics, mapping edits, or active-dataset state while tuning geometry.

**Minimum visual regressions:** check all five About tabs at wide and narrower laptop windows, especially irregular top-left and top-right text wrapping, bottom-corner note/textarea/button clearance, divider termination, full-page scroll, accessible Feedback submission, Creator photo/frame separation, and non-overlap with the global header. Check Data's Get Started, Sample Datasets, Templates, and Upload Data at the same widths/heights, with both no-data and active-data status and direct sample actions. The exact implementation selectors and measured breakpoints should be read from the current source before changing them; these notes describe user-accepted behavior based on screenshot QA and the verified commit, not an independently performed source-code audit.

## 8. Theme and Stylesheet Architecture

### Semantic theme ownership

`peridotTheme.js` is the semantic theme control surface. New color work should extend theme roles rather than scatter component constants. `peridotThemeRoleMetadata.js` supplies human-facing role descriptions; `peridotColorPalette.js` remains a legacy compatibility adapter. Chart-targeted palette imports may override `analytics.series` without recoloring unrelated chrome.

### Stylesheet cascade contract

The active stylesheet architecture is component-oriented. `index.css` owns only shared/global rules: Tailwind setup, document defaults, shared cards/forms/buttons/ornaments, shared theme/design contracts, Visualizations-stage transitions, timeline choreography, and reduced-motion behavior.

`main.jsx` owns this functional cascade order:

```jsx
import './index.css';
import './InspectorPanel.css';
import './AnalyticsPanel.css';
import './PeridotSearchWorkspace.css';
import './PeridotColumnMappingModal.css';
import './PeridotLearnMoreWorkspace.css';
import './PeridotFeedbackForm.css';
```

| Stylesheet | Ownership boundary | Sensitive behavior | Verify after change |
|---|---|---|---|
| `index.css` | shared global layer | shared selectors and cross-workspace defaults | Home, Data, Visualize, Explore, About |
| `InspectorPanel.css` | compact/full/Explore Inspector | overlay and dossier presentation | compact click, Expand, Back, Explore handoff |
| `AnalyticsPanel.css` | chart builder and renderer chrome | controls, dropdown layering, reduced motion | chart switch, menus, export |
| `PeridotSearchWorkspace.css` | Explore workspace | three-mode local navigation, query/facet/result layout, scroll containment | Browse/Advanced Query/Refine switching; expanded criteria/facets/results |
| `PeridotColumnMappingModal.css` | full-page role-mapping workspace (historical filename) | mapping header/section rail, page containment, step transitions, footer actions | table/workbook mapping flow; direct section navigation; Cancel/Back/Next |
| `PeridotLearnMoreWorkspace.css` | About reading surface | local About navigation, title scale, portrait/text flow, page scrolling | About Peridot, Creator, AI Disclosure, Open Source, Feedback |
| `PeridotFeedbackForm.css` | Feedback form in inline and compatibility-modal modes | form layout, inline embedding, compatibility overlay behavior | About Feedback page; modal compatibility path |

**Current editorial styling layers (verified through the accepted homepage replacement and tracked development artifacts):** `src/styles/workspaces/home.css` owns the Home composition; `src/styles/components/buttons.css` and `src/styles/components/panels.css` provide shared component styling; `src/styles/workspaces/data.css` owns Data-specific styling. The accepted work also includes `planning_documents/Peridot_Sitewide_Button_Inventory_20261017_v1.md` and Visualize component-ownership notes. These are not substitutes for inspecting the actual import graph when touching a style: several historical rules remain in the Home stylesheet, and cascade order still matters. Primary/secondary buttons are shared variants; do not add ad-hoc component-specific button color rules that compete with them.

**Homepage viewport contract:** Peridot's parent app shell already determines the height below the persistent header. The accepted Home uses `height: 100%` of that allocated workspace on desktop and divides the available height between the flexible hero and the bounded lower banner. Do **not** independently subtract an assumed 72-pixel header height or move the entire banner with a transform. When adjusting optical alignment, change only the feature content group, leaving the corner collage offsets and hero/banner seam intact. Check a complete desktop browser viewport for unwanted bottom gaps and scrollbars.

CSS extraction, dead-rule removal, behavior repairs, and visual redesign are distinct bounded passes. The earlier component-style extraction sequence is historical context in the Changelog; the `7df46a8` import restoration is a correction to preserve this functional cascade, not a new architectural direction.

### Cartographic Editorial ownership and visual-source contracts (current)

The visual overhaul uses a **centralized styling foundation** established by `ec5152c` through `f667329`, followed by palette/contrast (`2e20bba`), typography (`243ea6c`), compact global-header typography (`fe9634b`), and the art-directed Home (`fd02d84`). The earlier stylesheet-extraction history above is retained, but it is **not** a complete inventory of the newer `src/styles/` ownership layers. Before changing any style, inspect actual `src/main.jsx` imports, affected workspace CSS and shared tokens, and the residual cascade audit; do not assume an obsolete selector has ceased to apply.

- **Current Home:** `src/PeridotHomeWorkspace.jsx` plus `src/styles/workspaces/home.css` own the accepted layered Home. The left area is a paper-textured editorial reading surface with large oxblood **PERIDOT**, a compact serif subtitle/description and one primary **Get Started** action leading to the Data onboarding surface. The right side uses a cropped historic Florence panorama. An irregular stock-paper mask separates these layers. This is the accepted **H2e** hero boundary restored in H2g; do not reuse the rejected H2f diagonal mask.
- **Current lower banner:** a full-width, parchment-textured rectangular lower section with **three informational columns** (Manage data / Visualize / Explore evidence) and two independently placed transparent corner-collage PNGs, `assets/ChatGPT_Home_BannerLowerLeft_Collage_20261025.png` and `assets/ChatGPT_Home_BannerUpperRight_Collage_20261025.png`. The column grid is shifted slightly right/down for optical balance without changing its internal spacing; the corner assets are positioned independently. Prior banner arrows were removed because the columns are not live buttons. Future interactions must be chosen explicitly.
- **Current global header:** compact ivory bar with a large serif `Peridot` Home wordmark, editorial-sized serif navigation, active underline close to the corresponding label, hover feedback on Home, and no old gemstone graphic. The thin-line, forest-green gemstone and its possible network-line animation are deferred concepts, not part of current routing.
- **Type and color:** visual foundation emphasizes editorial display serif and substantial readable serif use, with functional controls legible and efficient. Paper, oxblood, forest green, and near-black ink are brand roles; analytics series and relationship encodings must not be silently recolored for decorative consistency.
- **Desktop contract:** concentrate design evaluation on full-screen desktop workspaces and preserve vertical stage height. A small-window blocking experience was discussed by analogy with StoryMaps, but no verified implementation or final threshold is attested; do not describe this as a shipped feature.
- **Visual QA:** check hero text clearance, irregular-edge opacity at upper-left, historical-image crop, CTA visibility, no overlays intercepting buttons, banner legibility and exactly three columns, plus the active dataset and navigation invariants. A sufficiently diagonal hero mask previously put imagery over the wordmark; that is an explicitly rejected regression.
- **Asset inventory:** `src/assets/editorial/rosselli-florence.webp`, `benincasa-portolan-detail.webp`, `home-stock-torn-hero-mask.png`, `home-stock-feature-parchment.webp`, `home-stock-paper-texture.webp`, `home-feature-edge-top.webp`, `home-feature-edge-bottom.webp`, and the adjacent `ASSET_CREDITS.md` / `STOCK_ASSET_NOTES.md` were included in local commit `fd02d84`. Respect the recorded source-page attributions and the user's licensed stock asset provenance. These assets entered the historical `fd02d84` commit, and subsequent changes have been pushed by `4e6fb11`. Exact licensing and derivative redistribution permission **remain to be verified**, independent of whether Git publication has already occurred; a stock license is not by itself proof that a source repository may redistribute the image files.
- **Historical untracked work at the October 15 handoff:** `planning_documents/Peridot_ Florence Atlas Homepage.png`, `src/assets/editorial/home-cartography-placeholder.svg`, `home-route-decal.svg`, `home-torn-paper-mask.svg`, and `paper-grain.webp`. Their **current** tracked/untracked status cannot be established from the latest five-commit Git log; check the working tree before deciding to stage, delete, or replace them. Do not wipe or bulk-stage unknown assets.
- **Historical material:** the earlier green/gilded logo, the retired Adobe filigree artwork, older fixed-ratio green title-card Home, and prior logo-centric instructions are **historical design references only**. On 2026-10-25 the user intentionally deleted all five tracked `assets/Adobe Stock Filigree*.png` variants. Active Data, Tutorials, Inspector, and Explore views should no longer import or render that artwork. Preserve historical provenance in documentation; do not reintroduce the deleted images to satisfy historical references.

### Current Theme and Routing State

The default interface is Peridot-inspired and controlled through semantic roles in `peridotTheme.js`. `peridotThemeRoleMetadata.js` must remain aligned with those roles, while `peridotColorPalette.js` supports older compatibility paths. Chart-targeted palette imports may change chart series only; they must not recolor unrelated interface chrome.

Current routing is centered on the persistent global header: logo/Home, Data, Visualize, Explore, Tutorials, and About. Workspace-local navigation is centered where appropriate; Export stays at the right edge of Visualize local navigation. Themes and Accessibility remains internally routable but hidden. Lightweight page changes do not receive an added transition; the heavier transition is reserved for expensive visualization/workspace changes. The active dataset and accepted workspace state persist across page navigation, and the persistent rail survives only as an Inspector compatibility bridge. For the historical routing sequence, see the Changelog.

## 9. Module Ownership Index

Use this index by subsystem rather than as an alphabetical file list. Module descriptions below remain the current ownership record; detailed behavioral contracts belong in Sections 4–8.

- [Application shell and workspace routing](#application-shell-and-workspace-routing)
- [Data import and mapping](#data-import-and-mapping)
- [Visualizations, map, and timeline](#visualizations-map-and-timeline)
- [Search and interaction resolution](#search-and-interaction-resolution)
- [Analytics](#analytics)
- [Inspector](#inspector)
- [Theme, styles, and visual language](#theme-styles-and-visual-language)
- [Export and shared utilities](#export-and-shared-utilities)

### Application shell and workspace routing

#### `src/App.jsx`

Main orchestration file. It owns top-level state, derived-data wiring, workspace composition, side-panel compatibility contracts, Search state, Timeline state, Inspector presentation/selection/history, export wiring, connected-record rendering, and the live generalized Data workflow. It coordinates template download, explicit sample selection, sample mapping edit/reset state, user upload parsing, editable table/workbook mapping, validation, authoritative Identity/runtime compilation, active-source replacement, and visualization resets after imports/remaps.

`App.jsx` must preserve the no-preloaded-data contract: null/no source means no active dataset rather than an implicit sample fallback. It no longer contains the inline Home, Data, Theme, Visualizations, Explore, Learn More, Search, Export, or hamburger-menu UI components; dedicated `Peridot*Workspace` / menu files own those presentations.

#### `src/peridotWorkspaceConfig.js`

Workspace-mode vocabulary and helper functions used by `App.jsx` for Home, Data, Visualize, Explore, About/Learn More compatibility, Search, Inspector, and Themes/Accessibility routing. Export and Timeline remain Visualize-integrated features rather than standalone workspace modes; Tutorials is a public navigation destination whose substantive content remains deferred.

#### `src/PeridotHamburgerMenu.jsx`

Legacy/compatibility navigation component retained where older paths still reference it. It is no longer the primary public navigation model; the persistent global header owns ordinary page-to-page navigation. Themes and Accessibility remains intentionally non-public unless a later appearance/settings pass restores it.

#### `src/PeridotHomeWorkspace.jsx`

Current Cartographic Editorial Home component. It owns the Florence image/paper hero, prominent Peridot introduction and distinct Upload your data / Explore sample data actions, plus the New to Peridot? guidance and three informational lower-banner columns (Manage data, Visualize, Explore evidence). `src/styles/workspaces/home.css` owns the parent-height filling flex layout and the full-width parchment banner, while the corner-collage PNGs under `assets/` provide decoration only. The lower-banner columns are **not** navigation buttons. The older gilded-logo/title-card model is historical, not the current Home source contract. Avoid reintroducing a fixed `100dvh - 72px` subtraction when the application shell already measures workspace height.

#### `src/PeridotDataWorkspace.jsx`

Full Data workspace for the three explicit entry paths: **Start with a Template**, **Start with Sample Data**, and **Upload Your Data**. It also identifies the active source, exposes **Edit mapped data** for researcher uploads, exposes **Edit sample mapping** for active samples, and routes sample selection/download/mapping actions. It must preserve the no-preloaded-data contract: first launch has no active dataset until the user explicitly chooses or uploads one.

#### `src/PeridotVisualizationsWorkspace.jsx`

Full Visualize workspace. The current shell is flattened: a compact second bar centers **Map / Network / Timeline / Charts**, with **Export** held separately at the right. The former oversized visualization title/banner framing has been removed. The workspace renders unavailable-state explanations when a dataset cannot support a selected view, hosts Charts, places the compact bottom Timeline/playback control, exposes Map settings, and wraps the live map/network stage. Visualization state is intended to persist while moving among public pages and visualization modes rather than being reset by navigation.

#### `src/PeridotSearchWorkspace.jsx`

Full Explore workspace. Its public local modes are **Browse / Advanced Query / Refine**. Advanced Query contains the query builder and current result set; Refine contains applied-result facets, Inspector handoff guidance, and capability review. The component still owns keyword/person/place/explicit-route/date filters, predictive suggestions, capability filters, structured Required / Any-of / Excluded criteria, criterion-attached count conditions, dataset-wide Browse ledgers, generalized Results presentation, Apply Filters, Clear Filters, and search-result Inspector handoff. Inspect actions open the full Inspector above the current Explore state so closing it returns to the same context. A larger content/layout redesign remains deferred.

#### `src/PeridotThemeWorkspace.jsx`

Themes and Accessibility workspace for Peridot default, Early modern map, Modern map presets, custom palette import, role-targeted palette application, and future accessibility/appearance controls. It remains implemented and route-compatible, but the hamburger menu entry is currently hidden while the page remains more development-facing than user-ready. Theme controls should continue to operate through semantic role targets rather than one-off component overrides. Explicit chart-targeted imports should alter chart series colors without recoloring unrelated app chrome.

#### `src/PeridotExploreWorkspace.jsx`

Compatibility routing boundary for the old Explore workspace. Current Explore entry points should route directly to `PeridotSearchWorkspace.jsx`; the former capability-summary role has moved into the Advanced Search **Capabilities** tab.

#### `src/PeridotLearnMoreWorkspace.jsx`

Public **About** workspace with local destinations **About Peridot / Creator / AI Disclosure / Open Source / Feedback**. The old Project Information Hub / Return to visualizations framing is superseded. The current presentation is intentionally flat and scholarly: restrained rules/spacing, reduced page-title scale, and a workspace-owned vertical scrollbar when content exceeds the viewport. Creator keeps the portrait and expandable biography; AI Disclosure preserves separate human and ChatGPT accounts; Open Source exposes repository/core-documentation references; Feedback is rendered inline as a normal About page.

#### `src/PeridotFeedbackForm.jsx`

Feedback form component used inline by **About → Feedback** and still capable of compatibility-modal rendering. It owns feedback-type selection, required message validation, optional context/email capture, Formspree submission, success/error states, and form actions. Do not assume modal presentation is the only public contract.

### Data import and mapping

#### `src/peridotCsvSchema.js`

Owns the public Peridot CSV schema contract. It defines:

- exact template column names
- field groupings
- minimum record rules
- capability labels
- upload tips
- validation summary copy
- small pure helpers for values, coordinates, person-pair/place-pair checks, mappability, machine-readable dates, accepted-record status, and missing-column checks

This file records the product rule that Peridot is database-first and that missing coordinates/dates should be flagged rather than silently rejecting otherwise useful records.

#### `src/peridotCsvNormalizer.js`

Owns pure conversion from public one-file template rows into the existing internal row shapes. It creates:

- internal geography rows
- internal letter/Inspector metadata rows
- lightweight exact-name person metadata rows
- map-ready places
- accepted/unsupported row groupings

It does not clean or standardize user-entered values.

#### `src/peridotCsvValidation.js`

Owns pure post-upload validation summaries. It produces:

- row-level capability reports
- total uploaded rows
- accepted record counts
- unsupported row counts
- missing-column warnings
- capability counts
- popup-ready summary lines
- persistent side-panel latest-upload summary text

#### `src/PeridotColumnMappingModal.jsx`

Owns the generalized column/workbook-mapping workspace for arbitrary CSV/TSV/XLSX/XLSM/XLS imports and editable sample mappings. Despite its historical filename, it now renders as a **full-page Data workspace**, not a modal. The active local sections are Preview, Sheets where applicable, Relations, Time, Places, Evidence, and **Review and Upload**; recurring-entity Identity controls are integrated where entities are mapped rather than exposed as a separate required page. It exposes repeatable relationship participants, authoritative Identity rules, repeatable temporal assertions, repeatable participant-attached places, workbook primary-sheet selection, multi-sheet unique-ID joins, and selected Evidence/Analytics metadata.

The same full-page workspace is reused after import. Researcher uploads can be reopened and recompiled from their preserved original source. Samples open an editable active copy of the shipped mapping and display the approved warning that sample edits affect only the active interpretation; a reset action restores the canonical sample mapping. Mapping sections are directly navigable, while Back/Next remain convenience progression controls and Cancel is separated from that pair.

This file remains partially decomposed: static UI labels/section groupings live in `peridotColumnMappingUiConfig.js`; repeated Time/Places/Relations controls live in `PeridotMappingFieldControls.jsx`; Identity presentation lives in `PeridotIdentityMappingControls.jsx`; Evidence Include/Ignore controls live in `PeridotEvidenceFieldControls.jsx`. The workspace owns mapping state transitions, workbook state, edit/apply/cancel/reset behavior, final mapping assembly, and mapping-workspace presentation.

#### `src/peridotColumnMappingUiConfig.js`

Static UI configuration for the mapping workspace: single-table/workbook section sequences, display labels, field groupings, capability labels, and formatting helpers. It intentionally contains no React state and no import/application logic.

#### `src/PeridotMappingFieldControls.jsx`

Presentational mapping controls used by the full-page mapping workspace for generalized repeatable Relations, Time, Places, and workbook-qualified equivalents. Time presents repeatable Date/Period cards, source-representation controls, Y/M/D component selectors, relationship-participant attachment, and related-note selectors. Places support arbitrary Place A/B/C parts with role source and optional coordinates; Relations support Part A/B/C participants with per-part role source and optional relationship metadata. Workbook controls use combined sheet-column references while preserving the internal workbook reference shape. This file should remain stateless and receive current values plus callbacks from `PeridotColumnMappingModal.jsx`.

#### `src/PeridotIdentityMappingControls.jsx`

Presentational generalized Identity controls used inside the mappings where recurring entities are declared. Simple mappings can keep the displayed-name/label default; stronger rules support stable ID selection and complex alternate complete recognition recipes across relationship/place appearances. The component should not re-emerge as a mandatory standalone Identity step unless the public mapping architecture is explicitly redesigned. Runtime identity authority remains downstream in `peridotIdentityRuntime.js`.

#### `src/peridotRecordStructure.js` and `src/PeridotRecordStructure.jsx`

Generalized record-structure reader and renderer introduced during the SI1 Inspector-legibility work. They expose mapped temporal assertions, participants, places, generalized semantic relationships, and evidence without forcing every record into Source/Target display. `buildPeridotEntityAttributedStructure()` scopes participant-attached information to the selected entity and prefers canonical entity IDs where present. The renderer preserves linked person/place navigation callbacks. These modules are the semantic reference surface for the current generalized Inspector implementation and mapped-information detail; they do not replace central Inspector history.

#### `src/peridotRecordStructureFixtures.js`

Dependency-light regression fixtures for generalized record/entity-attribution semantics, including relationship role resolution, duplicate/self-relationship handling, and same-label canonical identity cases.

#### `src/PeridotEvidenceFieldControls.jsx`

Presentational Evidence Include/Ignore controls for single-table and workbook imports. Included fields also expose per-field value handling and the shared record/participant subject-selection control when relationship participants exist. Workbook Evidence remains grouped by sheet, default display labels use the column name only, and each field may show source examples. Structurally mapped Time/Place/Relation fields remain visible but are treated as already used rather than duplicated as Evidence. The modal owns state and update handlers; this file owns repeated Evidence-row presentation.

#### `src/peridotColumnMapping.js`

Owns helper logic for arbitrary table column mapping, including common-name suggestions, core-field mapping rules, temporal-role mapping, point-location role mapping, route coordinate-pair mapping, and selected evidence/Analytics metadata handling. It preserves the existing correspondence-compatible route/network fields while adding role mappings for point/site datasets, start/end/display dates, and latitude-first combined coordinate pairs.

#### `src/peridotWorkbookMapping.js`

Owns workbook-aware mapping and import assembly helpers. It models primary record sheets, sheet/column references, arbitrary unique-ID joins, workbook validation, joined-row context construction, Peridot-shaped row assembly, temporal/point/route role mappings, and selected evidence/Analytics field handling from primary and joined sheets.

#### `src/peridotDataCapabilityAudit.js`

Pure UI-agnostic helper for inspecting uploaded rows and reporting field roles, row capabilities, and dataset-level readiness for Inspector, Search, point maps, route maps, networks, timelines, charts, and export. It supports temporal intervals, latitude-first coordinate pairs, point/site records, route records, time-series-like numeric fields, and generic evidence records.

#### `src/peridotWorkbookParsing.js`

Owns workbook parsing helper logic for CSV, TSV, XLSX, and XLS inputs. It isolates the `xlsx` dependency, parses all sheets into a shared workbook model, ignores formatting/merged-cell styling, and reads saved/displayed cell values only.

#### `src/peridotSampleDatasets.js`

First-class sample-data registry. It identifies the ordinary source file for each bundled sample, preserves the shipped generalized mapping, provides display/chooser metadata, and supplies the immutable reset baseline used when a user experiments with a sample mapping. Samples are not a separate parser or runtime architecture.

Canonical public sample sources live under `public/sample_data/`:

- `correspondence_network_sample.xlsx`
- `family_tree_sample.csv`
- `cardinals_1600_1640_sample.xlsx`

The earlier embedded `src/peridotSampleData.js` module has been retired and must not be restored as an implicit first-load fallback.

#### `src/peridotNormalizedModel.js`

Owns the consumer-neutral canonical dataset envelope and constructors for entities, places, records, events, relationships, participations, evidence sources, assertions, validation/capability metadata, source manifests, saved variable definitions, and universal mapping state. This is the authoritative normalized research representation; consumer-specific flattening belongs in adapters.

#### `src/peridotNormalizationProvenance.js`

Owns machine-readable source and transformation provenance for normalized items. Provenance records how Peridot obtained a claim and remains distinct from scholarly evidence explaining why the researcher accepts it.

#### `src/peridotTemporalAssertions.js`

Owns conservative parsing and preservation of canonical temporal assertions. Original source text always survives. The parser distinguishes temporal shape, known components, approximation, boundedness, consistency, warnings, and machine usability rather than forcing every value into one JavaScript date. It supports ordinary point dates, mixed-precision and open intervals, approximation markers, partial values such as `1607/00/02` and `0000/08/08`, and chronologically backwards ranges that remain preserved but unsafe for ordinary interval computation. Annotated date strings may be parsed from viable outer date expressions, while cells containing competing date possibilities remain flagged rather than collapsed into false certainty. Researcher-supplied temporal notes remain separate from Peridot's derived temporal structure.

#### `src/peridotTemporalMapping.js`

Owns generalized temporal-mapping normalization and composition. It represents repeatable Date/Period mappings independently from display labels, supports one-column and Y/M/D source representations, composes beginning/end endpoints for periods, allows source-column reuse across assertions, and carries relationship-participant attachment and related temporal-note mappings into canonical temporal assertions.

#### `src/peridotNormalizedValidation.js`

Owns cross-collection canonical structural validation and blocking/error/warning/information reporting.

#### `src/peridotCorrespondenceProfile.js`

Normalizes current correspondence/directed-record mapped rows into canonical records, entities, places, participations, evidence, assertions, temporal structures, and provenance. It now also creates atomic canonical `mapped-evidence:*` assertions for subject-aware generalized Evidence occurrences while retaining one EvidenceSource per record and the compatibility custom-field representation.

#### `src/peridotLegacyCompatibilityAdapter.js`

Active compatibility boundary for correspondence. It projects canonical correspondence datasets back into the accepted legacy runtime shapes by delegating compatibility-sensitive row shaping to `peridotCsvNormalizer.js`. Do not remove this adapter until downstream parity has been proven without it.

#### `src/peridotCanonicalRuntimeModel.js`

Active correspondence normalization entry point. It makes canonical normalization authoritative, validates the canonical dataset, and then supplies current `App.jsx` consumers through the legacy compatibility adapter.

#### `src/peridotNormalizationShadowAudit.js`

Parity/audit boundary retained from the canonical migration sequence. It compares direct legacy normalization with the canonical-through-adapter path and should remain available for regression diagnosis.

#### `src/peridotDatasetProfiles.js`

Compatibility registry for the older Correspondence / Directed Record and Genealogy / Person-Centered profile vocabulary. The public upload flow no longer asks users to choose between these profiles; retain this module only where current internal normalizers/runtime adapters still depend on it, and include it in the later legacy-retirement audit.

#### `src/peridotGenealogyProfile.js`

Normalizes person-centered genealogy rows into canonical people/entities, birth/death events, parent-child and partnership relationships, places, attributes, evidence, temporal assertions, and provenance. It preserves direct source relationships and does not infer false movement or derived kinship.

#### `src/peridotGenealogyMapping.js` and `src/PeridotGenealogyMappingControls.jsx`

Own genealogy-specific mapping schema, defaults/suggestions, validation, supplemental-row handling, capability summaries, and presentational mapping controls for Identity, Parents, Partners, Life events, Places, Attributes, and Review.

#### `src/peridotGenealogyRuntimeModel.js`

Projects validated canonical genealogy datasets into the current active genealogy runtime model without routing them through the correspondence compatibility adapter.

#### `src/peridotGeneralizedMappingRuntime.js`

Authoritative runtime application boundary for accepted generalized single-table mappings. It turns user-confirmed relationships, Identity rules, places, temporal assertions, Evidence, cardinality declarations, and subject selections into generalized observations plus compatibility projections only where older consumers still require them. Multi-valued fields split through shared value handling before subject fan-out; Time/Place/Evidence occurrences retain singular downstream subjects; identity mappings compile to stable participant/entity IDs.

#### `src/peridotIdentityRuntime.js`

Compiles accepted generalized Identity definitions into deterministic machine-facing keys for records and recurring entities. It preserves equivalence across participant roles/sheets when the researcher maps the same conceptual identity components, distinguishes same-label entities when stronger identity differs, and provides controlled unresolved/row-scoped fallback only when no usable mapped identity is available. Suggested Identity fields must be materialized into the accepted mapping before compilation rather than remaining UI-only defaults.

#### `src/PeridotSubjectSelectionControl.jsx`, `src/peridotSubjectSelection.js`, and fixtures

Shared subject-attribution UI/normalization boundary for Time, Places, and Evidence. The mapping representation can include the record and multiple participant indices, while runtime normalization fans that selection into atomic single-subject occurrences/assertions. Legacy singular `subjectParticipantIndex` mappings remain interpretable through normalization.

#### `src/PeridotValueHandlingControl.jsx`, `src/peridotMappedValueHandling.js`, and fixtures

Shared per-field cardinality/delimiter boundary. Researchers explicitly declare one versus multiple values. Delimiter normalization accepts literal and common quoted inputs, splits only the mapped field, trims token boundaries appropriately, and preserves the original source cell. Structured date components and endpoint structures are not treated as parallel arrays.

#### `src/peridotEntityDisplayLabels.js` and fixtures

Canonical entity display-label authority. Consumers resolve a canonical entity ID to its canonical human-readable label when available and otherwise preserve the unresolved source/reference identity. Network/Inspector should not rebuild independent label-preference heuristics.

#### `src/peridotEntityEvidence.js` and fixtures

Canonical subject-aware Evidence projection for entity Inspector. It selects `mapped-evidence:*` assertions by canonical entity ID and limits them to the active linked-record scope, preventing record-only or filtered-out Evidence from leaking onto the entity dossier.

#### Identity/place/workbook regression fixtures

`src/peridotIdentityRuntimeFixtures.js`, `src/peridotPlaceSubjectMappingFixtures.js`, `src/peridotWorkbookMappingValidationFixtures.js`, `src/peridotCorrespondenceUniversalModelFixtures.js`, and the generalized runtime/workbook fixture suites preserve the recently accepted identity continuity, participant-place subject, correspondence aggregation, and safe workbook-join behavior. Extend these fixtures rather than relying only on visual QA when changing these boundaries.

#### `src/peridotGeneralizedMappingRuntimeFixtures.js` and `src/peridotGeneralizedWorkbookRuntimeFixtures.js`

Regression fixtures for authoritative generalized single-table/workbook runtime behavior. Future Identity-authority work should extend these fixtures with true end-to-end duplicate-label and cross-role identity cases rather than testing only preconstructed runtime rows.

#### `src/peridotUniversalMappingModel.js`

Phase 1 universal mapping vocabulary. Owns saved variable definitions, source-field assignments, sheet-purpose assignments, repeated-heading groups, and table-connection definitions. Mapping ownership is the user's; the model does not preserve a confidence/origin column stating who assigned a mapping.

#### `src/peridotSourceModel.js`

Phase 1 generalized source-file/table/field descriptors and workbook-to-source-manifest helpers. It provides stable structural references without duplicating the full workbook content into every canonical dataset.

#### `src/peridotUniversalTransformations.js`

Phase 1 deterministic transformation compiler/executor. It supports ordinary field preservation, repeated headings becoming generated header/value variables, transpose, and non-flattening table connections, with provenance retained. It does not perform AI/domain interpretation.

#### `src/peridotUniversalRuntimeCompatibility.js`

Phase 1 compatibility classifier. It explicitly permits current correspondence and genealogy runtime projections while keeping broader universal datasets canonical-only until a downstream consumer deliberately supports them.

Each of these model/profile modules has dependency-free fixture or audit companions where present. The universal fixture set includes correspondence, genealogy, wide/transposed stock-price, Alaskan-airfield, and Maria-Maddalena-style structures so future changes can test generality without encoding those examples as special-case application logic.

### Visualizations, map, and timeline

#### `src/mapLayoutHelpers.js`

Pure map/layout helper logic, including viewport construction, clustering, cluster radius calculation, label visibility, and geometric calculations.

#### `src/mapStageComponents.jsx`

Map-stage-adjacent UI/chrome components.

#### `src/mapInteractionHandlers.js`

Top-level map interaction handlers.

#### `src/timelinePlaybackHelpers.js`

Pure canonical Timeline/playback derivation helpers. It consumes `row.temporalAssertions[]`, derives temporal roles, builds assertion-level entries and interval boundaries, filters ranges by temporal intersection, and deduplicates active assertion entries back to visualization rows. Legacy `parsedDate` fallback behavior has been retired. It also owns Cumulative versus Co-current playback visibility semantics and period-end checkpoints.

#### `src/timelinePlaybackComponents.jsx`

Shared Timeline/playback panel UI boundary. It renders dataset-derived Time types, the selected temporal-role controls, Cumulative Events / Co-current Events mode controls and explanatory hover text, range/playback controls, and empty/unavailable states. This is the persistent bottom playback control and is distinct from the dedicated Timeline visualization workspace.

#### `src/peridotTimelineWorkspaceModel.js`

Pure Timeline-workspace projection and relationship semantics. It converts the current applied/filtered row scope into assertion-level events, preserves temporal subject/form/precision/uncertainty metadata, derives plural Evidence-backed categories and OR-based visibility, and resolves explicit mapped relationships conservatively onto distinct subject events. Do not infer connections from co-occurrence.

#### `src/peridotTimelineWorkspaceFixtures.js`

Dependency-light Timeline-workspace regression fixtures. Current checks cover Search-scope authority, plural temporal assertions, subject preservation, plural categories, evidence-driven category inventory/counting, OR visibility, uncertainty metadata, and relationship endpoint semantics.

#### `src/PeridotTimelineWorkspace.jsx`

Dedicated Timeline visualization workspace and interaction/layout boundary. It owns horizontal/vertical orientation, adaptive temporal-axis rendering, event cards, fixed-size category panel, category color/shape markers, smooth wheel/button zoom, scrollbar plus click-drag panning, Inspector selection handoff, duration rendering, and the current continuous secondary-axis event/relationship layout.

#### `src/peridotEntityNetwork.js`

Owns generalized entity-network derivation and geographic anchor/relationship-line semantics. It preserves canonical entity identity and semantic relationship direction/type/label, derives multipart relationships without creating co-occurrence cliques, resolves one or more participant-place anchor roles plus the independent **Most frequent place** option, deduplicates identical entity/place coordinates, retains anchor role/provenance, and derives source-supported geographic relationship-line segments. Geographic consumers must still verify that both exact endpoint node instances are visible before rendering an edge.

#### `src/peridotEntityNetworkFixtures.js`

Regression fixtures for generalized relationship semantics, including multipart relationships, canonical identity preservation, direction, and repeated observations.

#### `src/personForceLayoutHelpers.js`

Pure helper logic for the pre-settled force-directed person-network layout.


### Search and interaction resolution

#### `src/interactionHelpers.js`

Pure interaction-resolution and selection-building helpers. This file owns helper logic for nearby candidate generation, selection resolution, cluster selection payload building, connected-correspondent ordering, `person-detail` / `place-detail` payload derivation, Unknown-as-place resolution, person-detail sent/received place-section derivation, and person-graph fallback resolution for related-person navigation from geographic contexts.

### Analytics

#### `src/AnalyticsPanel.jsx`

Owns the Analytics / Chart Visualizations control UI. It renders chart type selection, tabbed Chart/Fields/Categories/Present controls, chart descriptions/example questions, date controls, variable controls, manual category/series selection controls, selection-mode and comparison-total controls, optional presentation-title editing, and the large chart workspace. It preserves compatible chart settings as users switch chart types where possible, defaults Bar Chart orientation to Vertical, and registers chart PNG export with the Visualizations header Export menu rather than rendering a separate export control in the chart rail.

#### `src/analyticsConfig.js`

Owns Analytics chart configuration, including chart labels/descriptions, example research questions, default Analytics state, aggregation options, top-N display options, manual-selection defaults, curated variable definitions, and **Route (Place)** / **Route (Person)** definitions.

#### `src/analyticsDerivationHelpers.js`

Owns Analytics data derivation, including available variable detection, numeric measure detection, conservative filtering of dynamic metadata fields, Year and Full date bucketing, flexible chart data construction, record-count aggregation, manual selected-category filtering, selected-only/Other/dataset-total comparison behavior, grouped/stacked/multi-line count buckets, and semantic alias handling for curated fields such as Language and Relationship.

Dynamic variable detection should exclude technical or non-categorical fields such as IDs, latitude/longitude fields, date fields, mappability flags, object/array values, purely numeric values, long note-like fields, and near-unique row identifiers.

#### `src/analyticsChartComponents.jsx`

Owns SVG chart rendering and shared chart hover tooltip styling for Bar Chart, Grouped Bar Chart, Stacked Bar Chart, Line Chart, Multi-Line Chart, Histogram, Pie Chart, Sunburst Chart, and Heatmap. It also owns shared chart frames, the shared three-quarter chart / one-quarter legend layout, complete simplified summary/legend panels, ranked/segment/line/trend/bin/matrix/slice/sunburst annotation panels, major/minor axis ticks, gridline styling, active theme-series mark colors for every chart type, and the rendered SVG surface used for chart PNG export.

The shared chart tooltip uses a mossy/title-green background with light text for legibility over dense charts such as heatmaps. Axis and panel styling should stay legible against the warm chart-paper background and should not depend on hover-only disclosure for core values. Keep chart-card geometry centralized through the shared layout helper rather than reintroducing unrelated per-chart spacing constants.

### Inspector

#### `src/LeftControlPanel.jsx`

Compact Inspector side-panel shell. Earlier rail/workflow content has been removed. This file now exists primarily to preserve visualization-click Inspector behavior: node, edge, and cluster clicks still open the compact Inspector while deeper evidence navigation routes into the full Inspector workspace.

The old `showRightSidebar` naming remains semantically stale but compatibility-sensitive. Do not rename this path casually; explicitly test node click, edge click, cluster click, contained member navigation, compact close, Expand, and Back behavior before changing it.

#### `src/InspectorPanel.jsx`

Owns inspector content only. It no longer owns the outer panel shell. It renders the inspector header, inspector-internal Back button, and `InspectorBodyRouter`.

#### `src/InspectorBodyRouter.jsx`

Routes resolved inspector state to the appropriate extracted view.

#### `src/InspectorEmptyState.jsx`

Owns the empty inspector state.

#### `src/InspectorClusterView.jsx`

Owns the cluster inspector view. Current behavior groups contained members by place and sorts groups/members by represented visible volume.

#### `src/InspectorEdgeView.jsx`

Owns the edge inspector state boundary.

#### `src/InspectorNodeView.jsx`

Owns the node / person-detail / place-detail inspector boundary. It renders the scholarly reference-entry Inspector layout: lead summary, optional image/placeholder, compact summary facts, role-grouped connected places and people, directed connections, expandable high-volume lists, canonical subject-aware Evidence for the selected entity, selected compatibility fields, and connected-record navigation entry points. It also preserves **Unknown** as a place-like bucket when source/target location values are missing or unresolved.

#### `src/InspectorConnectedCorrespondents.jsx`

Inspector navigation component for person-to-person movement.

#### `src/InspectorPersonPlaces.jsx`

Inspector navigation component for person-to-place movement. It shows two explicit sections:

- **Places this person sent letters to**
- **Places where this person received letters**

#### `src/InspectorBackButton.jsx`

Inspector-internal Back button. It uses a small local history model for inspector-internal navigation only and does not track ordinary map clicks as navigation history.

---


### Theme, styles, and visual language

#### `src/peridotTheme.js`

Semantic theme control surface for the whole app. It defines source palettes, custom theme override storage, palette import targets, the finite 30-color default chart series library, semantic role construction, legacy color adaptation, map/network roles, chart roles, navigation chrome roles, timeline roles, search roles, Inspector/search roles, and CSS-variable export. Chart-targeted palette imports should override only `analytics.series`, while the legacy compatibility adapter should not use chart-only overrides to recolor unrelated chrome.

Future color work should start here unless a component genuinely lacks a theme role. Do not scatter new hardcoded colors through chart, Inspector, map, or workspace components when the correct fix is to extend the semantic theme roles.

#### `src/peridotThemeRoleMetadata.js`

Human-facing metadata for theme roles and role groups used by the Themes and Accessibility workspace. This file should stay aligned with `peridotTheme.js` so users can understand what each role controls and so palette imports remain explainable.

#### `src/peridotColorPalette.js`

Legacy compatibility palette adapter. Prefer `peridotTheme.js` for new color work; keep this file available for older component paths that still import legacy tokens.

### Export and shared utilities

#### `src/exportHelpers.js`

Pure export utilities and export row-builder helpers.

## 10. Fragile Zones and Regression Test Matrix



These areas still deserve narrow, explicit passes:

- workspace routing and persistent header behavior;
- first-time tutorial placeholder now, plus progression/target/panel/minimize/workspace behavior when the launcher is re-enabled;
- shared `src/index.css` delivery: broad replacements can silently overwrite newer unrelated visual rules;
- map viewport centering/reset behavior and map/network viewport measurement after switching visualization modes;
- dense map hover/click interaction and selection persistence across filters;
- shared timeline/playback state coupling;
- dedicated Timeline workspace projection/layout: Search scope, horizontal/vertical chronology, zoom-adaptive axis, pan/scroll behavior, category OR visibility, Inspector selection, explicit relationship endpoints, and duration-versus-relationship visual distinction;
- unified Geographic Map settings: draft/applied settings, anchor-role resolution, endpoint visibility, and separate Geographic/Force viewport persistence;
- playback highlighting provenance: rendered generalized edge IDs and node endpoint IDs must remain authoritative; do not reintroduce legacy `sourcePerson`/`targetPerson` or `sourcePlaceId`/`targetPlaceId` reconstruction;
- playback animation experiments are rolled back at `ddc0aca`; if animation work resumes, begin with a fresh design audit rather than resurrecting discarded screen-space geometry tween code;
- export rendering/state coupling;
- broad orchestration work in `src/App.jsx`;
- generalized Data state: genuine no-data startup, explicit sample selection, researcher upload replacement, and active-source reset behavior;
- editable mapping state: reopen/cancel/apply must preserve the original source and current accepted interpretation;
- sample mapping state: editing must not mutate the canonical sample mapping/source; reset must restore the shipped definition;
- Identity materialization/runtime authority: visible accepted suggestions, explicit blanks, same-label distinct entities, and cross-role composite identity must remain stable;
- cardinality/value handling: splitting must stay per mapped field, preserve raw cells, avoid positional array-zipping, and keep multi-valued place coordinates disabled;
- participant attribution: place/time/Evidence assertions must remain attached only to the mapped record/subject(s);
- canonical entity labels and entity Evidence projection: resolved IDs must display canonical names when available, unresolved IDs must remain source-faithful, and record-only Evidence must not leak to entities;
- workbook assembly: duplicate join IDs must not silently multiply rows;
- internal compatibility boundaries: public generalized mappings are authoritative, while correspondence/genealogy adapters may still be needed by current consumers;
- Review warning/validation logic: distinguish real runtime constraints from old correspondence-specific assumptions;
- shared side-panel shell and Inspector-open interactions;
- cluster grouping and Inspector navigation;
- Analytics expanded overlay positioning, dynamic variable detection, and SVG-to-PNG chart export;
- Search active-dataset state, especially draft/apply coordination across keyword, person, place, relationship, date, weight, Timeline, Analytics, Inspector, and Export;
- archived MapLibre work if it is ever explicitly resumed.

### Practical regression matrix

| Fragile zone | Typical regression | Minimum test |
|---|---|---|
| Workspace routing | wrong workspace or lost state | Home/upload/sample actions and each persistent-header route; preserve cross-page data and viewport state |
| First-time tutorial | placeholder disappears/becomes primary, or future launcher regresses overlay behavior | now: disabled secondary Home button + tooltip + no floating invitation; when re-enabled: full seven-stage suite |
| Inspector bridge | compact Inspector fails to open | node, edge, cluster, contained member, Expand, Back |
| Search scope | generalized place/Evidence values disappear, count conditions mis-scope, or Results/facets use playback visibility | draft suggestion, Apply, Clear, attached count conditions, Place/Evidence criteria, pagination, Inspect handoff during playback |
| Geographic Map / Network | hidden endpoints, wrong anchor role, viewport reset, or correspondence-shaped playback | toggle node labels/anchors; Apply/Reset; relationship-line fallback; pan/zoom; multipart playback; Force/Geographic switch |
| Timeline workspace | wrong chronology/orientation, clipped scroll extent, zoom/pan regression, category mis-filter, card collision, or invented/misresolved relationship | correspondence + family-tree samples; horizontal/vertical; wheel/+/- zoom; drag + scrollbars; adaptive labels; category OR visibility; Inspector selection; subject-strict connection fixture |
| Timeline playback / Analytics | dated/undated scope diverges or playback silently changes non-temporal evidence | alter shared timeline/playback, local chart years, **Exclude undated records?**, visible totals, chart export |
| Data import | loss of accepted rows, hidden default data, or bad joins | no-data first launch; template/upload; workbook join; validation |
| Sample system | canonical sample mutated, chooser starts open unexpectedly, active sample cannot be replaced, or implicit fallback restored | choose Correspondence → Family Tree → Cardinals → Correspondence; chooser collapsed on Data entry; download; edit/cancel/reset mapping; hard refresh with no selected source |
| Identity/runtime | duplicate-label conflation or one entity split by role/row | same-label ID fixture; untouched suggestion; explicit blank; Source/Target composite identity |
| Cardinality/value handling | unsplit values, accidental delimiter guessing, list-zipping, or shared coordinates across split places | relationship/place/time/Evidence fixtures; quoted delimiter forms; multi-place coordinate guard |
| Participant attribution | child/mother or Evidence information bleeds across entities | multi-subject Time/Place/Evidence fixtures and Inspector dossier |
| Canonical entity presentation | raw IDs shown despite known labels, or record Evidence leaks onto entities | display-label fixtures; entity-Evidence fixtures; unresolved-reference fallback |
| Compatibility boundary | generalized mapping overridden by profile/legacy projection | correspondence adapter audit; genealogy fixture; generalized runtime fixtures |
| Visual stage | remount/reanimation, viewport shift, or post-import freeze | repeated map/network/chart switching; full Inspector open/close |
| CSS cascade | late stylesheet masks accepted behavior | inspect shared tokens, `styles/components/buttons.css`, `styles/components/panels.css`, Home/Data workspace CSS, and workspace imports; verify buttons and all public pages |
| Editorial Home viewport | bottom gap, scrollbar, shifted corner artwork, or cropped hero | check full-window desktop render; confirm parent-height fill, hero/banner seam, collage crop, and optical three-column alignment |
| Chart rendering/export | mismatched labels, colors, or PNG | multiple chart types, manual series, PNG export |
| Theme roles | chart-only changes recolor chrome | apply chart-targeted palette and inspect map/header |
| Export | wrong output scope or broken render | map PNG/SVG, CSV, chart PNG |

## 11. Active Technical Backlog

**Deferred mapping architecture (2026-10-28):** multiple independent relationships per source row need a new grouping layer above `relationshipParts`, with corresponding workbook, runtime, canonical model, Inspector, Network, and export handling. Progressive form activation is already implemented and should not be mistaken for this feature.


**Cartographic Editorial active visual work (separate from the older technical priority order):** `c71e265` is the latest clean, synchronized checkpoint; the earlier `4e6fb11` editorial Home and button work has since been refined by `7280e30`, `2117659`, and `60b8643`. The Florence/paper hero, full-width banner, corner-collage frame, and optical content position are accepted; do not revive the earlier green title card or rejected H2f diagonal. Remaining visual work is targeted CSS/token cleanup, consistent buttons and workspaces, tutorial content, and verification across supported desktop viewport sizes. Asset publication is confirmed by Git, but licensing/redistribution rights are **not** established merely by the push. Preserve attribution notes and verify the applicable licenses separately. The present art direction prioritizes full-screen desktop; minimum supported viewport enforcement remains unresolved.


1. **Timeline relationship rendering / connection legibility — immediate.**
   - Preserve the `a32ef05` subject-strict relationship projection and continuous secondary-axis layout.
   - Redesign relationship-line routing/presentation so each explicit connection reads unambiguously as card → relationship → card in both Horizontal and Vertical views.
   - Use Peridot's curved-edge visual language, but do not let lifespan/period duration graphics resemble relationship edges.
   - Continue collision/layout tuning where dense connected events still overlap or fail to use available secondary-axis space.
   - Keep chronology exact on the temporal axis; only the orthogonal coordinate may move for legibility.
   - Do not create lines between two temporal assertions for the same subject unless the source mapping itself explicitly represents that relationship.

2. **Timeline polish after relationship geometry.**
   - Recheck event-card compactness, truncation, uncertainty/partial/approximate cues, duration-band treatment, relationship arrowheads, and selected-connection emphasis across Correspondence, Family Tree, and Cardinals samples.
   - Keep Search/Explore scope authoritative, categories plural/OR-based, and Color/Shape marker accessibility intact.
   - Consider optional filters for approximate, partial, open-ended, or inconsistent temporal structures only if analytically useful and human-readable.
   - Do not add density aggregation/clustering until a real dataset demonstrates a need; current zoom/pan and collision layout should be evaluated first.

3. **Network Pass 4 — consumer and vocabulary cleanup.**
   - Audit remaining Network/Map consumers for correspondence-shaped presentation or compatibility assumptions after the semantic migration through `ddc0aca`.
   - Remove or generalize stale user-facing `Weight`, `linked_letters`, sender/recipient, Source/Target, route, or directional wording where the current mapping does not actually declare those semantics.
   - Preserve correspondence-specific language where a correspondence mapping genuinely supplies it.
   - Include exports, capability wording, comments, hover/Inspector bridges, and any remaining compatibility field names that leak into generalized presentation.

4. **Network Pass 5 — geometry / presentation correctness.**
   - Continue Geographic cluster/Inspector presentation QA from the accepted generalized Network architecture. Apparent same-label “duplicates” must be verified semantically before clustering changes are made.
   - Audit Force-Directed initial framing/fit behavior after the semantic work.
   - Terminate directed arrowheads at node boundaries instead of allowing them to disappear into node centers.
   - Correct bounded edge/path geometry issues without changing generalized relationship semantics or Map settings.

5. **Network Pass 6 — visual tuning and Appearance controls.**
   - Audit and tune individual node size, cluster size, edge width, clustering threshold/sensitivity, and dense-versus-sparse defaults.
   - Decide explicitly what cluster size encodes (member count, represented relationship volume, or another documented quantity) rather than relying on opaque historical scaling.
   - Evaluate researcher-facing controls in the reserved **Appearance** section of Map settings for node size, cluster size, edge width, and possibly clustering sensitivity.
   - Keep visual scaling controls presentation-only: they must not alter data counts, identities, relationship membership, or scholarly semantics.

6. **Navigation/interface and playback follow-up.**
   - **Completed:** persistent global navigation, logo-as-Home behavior, active dataset/workspace-state persistence, compact centered Visualize local navigation, flattened Visualize framing, three-mode Explore navigation, full-page Data mapping, and normalized About/Feedback hierarchy.
   - **Completed:** sample selection now uses the visible **Sample Datasets** tab with direct **Use / Edit / Download / Details** actions and supports replacing one active sample with another; the earlier compact collapsed chooser is historical.
   - **Completed:** direct Timeline playback scrubbing uses transient preview during drag and canonical commit on release.
   - **Completed foundation:** dedicated Timeline workspace with horizontal/vertical orientations, smooth zoom, drag/scroll navigation, adaptive temporal axis, evidence-driven categories, and relationship-aware event layout.
   - **Explore redesign:** the Browse / Advanced Query / Refine architecture is accepted, but Explore remains dense and needs a later content/layout redesign without undoing its scope semantics.
   - **Data-mapping redesign:** the first shared Relations/Time/Places UI redesign is committed at `f3cf4fb` (compact question hierarchy, guidance popovers, contextual panels, shared pill navigation); further polish and other mapping stages remain pending. Continue without returning to a modal/wizard shell.
   - **About visual polish:** structure is accepted; later global palette/typography work may refine colors without restoring decorative container-heavy framing.
   - **Playback speed calibration:** retain **Slow / Medium / Fast** only and calibrate their intervals against the optimized runtime.
   - **Playback presentation:** animation/tweening remains unfinished design work, not accepted current behavior. Revisit it only from the stable post-optimization architecture; do not resurrect discarded screen-space geometry tween code.

7. **Search generalized-text follow-up.**
   - `Any record text` does not yet guarantee indexing of every generalized mapped semantic value; explicit Place and canonical Evidence criteria already work.
   - Audit the general text corpus before broadening it so canonical values are added without duplicating compatibility projections or inflating matches.

8. **Universal data architecture — Phase 3 Chart Builder.**
   - Build chart controls from saved variables and generalized mapped fields.
   - Retain the structured scholarly-sentence/autocomplete direction rather than unrestricted natural-language prompting.
   - Use the wide/transposed multi-company stock-price case as a required regression dataset.

9. **Repository-wide legacy/compatibility retirement audit.**
   - Inventory old Source/Target-only mapping code, obsolete profile routing, correspondence-shaped assembly logic, compatibility adapters, stale fixtures/comments, and old sample/data fallback paths.
   - Classify each item as **delete now**, **still-required compatibility layer**, **legitimate specialization**, or **uncertain/retain**.
   - Include the older `customInspectorFields` duplicate-label collapse: the authoritative generalized Evidence path preserves repeated values, while the older correspondence-oriented object-construction path can collapse duplicate labels.
   - Do not remove code simply because the public generalized workflow no longer exposes it.

10. **Homepage/tutorial follow-up — deferred visual/content work.**
    - Preserve the current Home Upload your data / Explore sample data actions, the accepted parent-height geometry, and the existing persistent-header/logo-as-Home behavior.
    - The dedicated **Tutorials** global destination exists, but substantive tutorial content/interaction remains deferred; the **former Home Tutorial placeholder was superseded by the Cartographic Editorial Home** and must not be described as a current Home button.
    - The Home artwork/layout foundation was accepted through `4e6fb11` and refined through `7280e30`/`60b8643`. Any future Home/Data entry integration is a separate content/interaction decision, not unfinished implementation of the current banner; do not combine it with Timeline/Network semantic passes.
    - Tutorial attention choreography, panel placement, typography spacing, accessibility, semantic keyword highlighting, animation order/timing, and a final UX walkthrough remain later bounded work.

11. **Inspector → Advanced Search actions and safe metadata filters**, after the current Timeline connection work unless a concrete Search need arises first.

12. Continue bounded structural work only when a concrete maintenance need exists; `App.jsx` remains concentrated but should not be casually refactored.

### Rolled-back playback-animation experiments — do not resume from discarded code

After generalized playback highlighting was implemented, several local-only animation prototypes explored SVG entrance animation, `requestAnimationFrame` tweening, screen-space geometry interpolation, dormant assets, and transient node/cluster/edge effects. Testing showed repeated semantic and rendering problems: high-speed playback became erratic; clusters could retrigger or appear to re-enter; screen-space geometry tweening caused nodes to detach from a panned map and snap back; and rapid graph-state changes did not support the intended cinematic animation language reliably.

The project deliberately rolled back to the clean generalized **pre-animation** `App.jsx` and committed that state as `ddc0aca`. None of the experimental playback-animation machinery is part of current `main`. If playback animation is reconsidered, start from `ddc0aca` (or its descendant) and a new architecture/design audit. Do not copy code from the abandoned animation ZIPs or assume their dormant-scene/tween approaches are accepted architecture.

## 12. Archived and Compatibility Paths



### Canonical correspondence/genealogy adapters and profile vocabulary — active internal compatibility paths

The generalized public mapping architecture is authoritative. Current downstream consumers may still receive established correspondence-shaped row structures through `peridotLegacyCompatibilityAdapter.js` / `peridotCanonicalRuntimeModel.js`, while genealogy-specific canonical/runtime modules may still provide specialized projection behavior. The public Data workflow no longer exposes Correspondence / Directed Record versus Genealogy / Person-Centered as a required choice.

These modules are **active internal compatibility/specialization boundaries**, not automatically dead code. Do not remove them merely because the generalized public workflow has superseded profile selection. Remove or collapse them only after remaining consumers have migrated or been shown not to need them. The separate legacy date interpretation path and embedded sample fallback are already retired.

### MapLibre migrated-overlay branch paused / active preview removed

The later `maplibre-native-geographic-view` branch remains an archived experiment. Active `main` no longer contains the dormant MapLibre preview files or dependency after `55a368c`. The removed active-main preview path included `src/MapLibreMapStage.jsx`, `src/mapStyleConfig.js`, and the `maplibre-gl` dependency.

If MapLibre work resumes, begin with a fresh source-of-truth audit and intentionally reintroduce any required package dependencies and stage files. Do not assume the old experiment can be merged directly.

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

The archived MapLibre branch, legacy side-panel naming, and responsive panel lessons remain relevant only as labeled compatibility/history context. For the complete chronology and all rolled-back records, see the Changelog.

## 13. Fresh-Chat Handoff Essentials

A future chat should start from:

- source of truth folder: `C:\Users\haley\OneDrive\Desktop\Peridot\`
- active branch: `main`
- current synchronized checkpoint: **`5e785ed` — `Refine About manuscript design and Data workspace responsiveness`**, with `HEAD`, `origin/main`, and `origin/HEAD` aligned and a clean working tree in the latest user-provided sync output
- local development command on the user's machine: **`npm.cmd run dev`**
- current Timeline state: canonical assertion-level projection, horizontal/vertical visualization workspace, smooth wheel/button zoom, scrollbars + click-drag panning, zoom-adaptive axis, evidence-driven plural categories with OR visibility, shared Inspector handoff, subject-strict mapped relationship projection, continuous secondary-axis layout, and revised duration treatment are committed; relationship-line routing/presentation is the immediate unfinished item.
- the existing bottom Timeline/playback control remains intact and separate from the dedicated Timeline visualization workspace.

A future chat should also be told that:

- generalized mapping is the ordinary public upload model; there is no public Correspondence/Genealogy profile-choice gate or separate experimental universal-mapper surface;
- Peridot starts with no active dataset; samples are ordinary source files with editable/resettable generalized mappings;
- the Sample Datasets tab remains accessible and can be revisited repeatedly; switching Correspondence → Family Tree → Cardinals → Correspondence should replace the active sample cleanly;
- recurring-entity Identity is integrated into relationship/place mapping. Simple entities use their displayed name/label; stronger identity can use stable IDs or alternate compound recognition recipes;
- canonical entity display labels are authoritative downstream: known IDs resolve to canonical human-readable labels, unresolved references remain visible IDs;
- cardinality is implemented per mapped item with researcher-declared delimiters. Peridot does not guess punctuation or zip parallel list-valued fields; multi-value place cells cannot reuse row-level coordinates;
- Time and Places support record + multiple-participant subject selection and fan out to atomic single-subject assertions; participant-specific temporal assertions are scoped to the correct participations;
- Evidence supports the same cardinality and subject selection. Canonical mapped-Evidence assertions link to the existing EvidenceSource, while broad compatibility custom fields remain deduplicated;
- entity Inspector consumes canonical subject-aware Evidence assertions in the current linked-record scope; record-only Evidence does not become entity metadata;
- the Family Tree sample includes mother **Place of childbirth** semantics derived from the child's birthplace source and is an important attribution QA case;
- generalized Search Passes 1–5 are complete: mapped places feed Place search/Browse/Refine, Results use neutral generalized columns, canonical Evidence powers Evidence search/facets, and the old global minimum weight has been replaced by criterion-attached count conditions;
- Search Results/Refine and entity/place Inspector dossiers use stable applied/filtered scope rather than playback visibility; Analytics preserves undated records by default and can explicitly exclude them locally;
- one bounded Search text gap remains: **Any record text** does not yet guarantee every generalized mapped semantic value;
- generalized Geographic/Force relationship and playback semantics remain accepted; playback animation experiments were rolled back and are not part of current `main`;
- Phase 3 Chart Builder and the no-loss compatibility retirement audit remain later major tasks;
- the accepted Home is the art-directed Cartographic Editorial Florence composition with distinct Upload your data and Explore sample data actions, New to Peridot? guidance, and an informational three-column parchment banner framed by two corner collages; the earlier Home CTAs and the historical centered disabled Tutorial button belong to previous Home versions. The dedicated Tutorials public navigation destination remains; existing tutorial code is retained for later revision;
- MapLibre remains archived.

For the current **visual redesign continuation**, start from the committed Cartographic Editorial Home/Visualize layout through `5e785ed`, preserve both lower-banner corner collages and the optically shifted informational grid, and distinguish asset-license verification from code-push status. Further visual changes should be separately bounded rather than reopening the accepted composition. The pre-existing **technical backlog priority** remains Timeline relationship-line rendering/presentation, using the current `a32ef05` subject-strict connection model and continuous secondary-axis layout as the source of truth. Before changing `PeridotTimelineWorkspace.jsx`, reread the entire exact current file under the Project Workflow Charter. Preserve adaptive-axis, zoom/pan, categories, Search scope, Inspector behavior, and relationship endpoint semantics while changing only connection/duration presentation.

