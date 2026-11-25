# Maintainer's Guide

## Executive Summary

This is Peridot's authoritative *living technical reference* for a new human or AI maintainer. It begins with an architecture-at-a-glance index, follows with current subsystem contracts, and retains source ownership, regression and compatibility detail in a maintenance reference. The Changelog owns detailed development chronology; the Project Workflow Charter owns required editing and recovery process.

This navigation revision retains the detailed source-document material, including historical decisions and validation limits. A clearly labeled preserved historical statement is not a substitute for the current contract. For code changes, inspect the entire exact current source file and follow the Charter before modifying it.

## How to Use This Guide

**This guide is Peridot's technical handbook.** It is written for someone taking over maintenance of the project—whether a human developer encountering Peridot for the first time or an AI assistant continuing work in a new conversation. You do not need to have participated in its development to use it. Start here to understand how the application is put together, find the code responsible for a feature, and learn what must be protected when making changes.

The guide is organized into three levels. **You do not need to read it straight through**: begin with an overview, follow the link for the system you are working on, and consult the detailed reference when you need to implement or troubleshoot something.

| Level | What you will find | When to use it |
|---|---|---|
| **[Level 1 — Architecture at a Glance](#level-1--architecture-at-a-glance)** | Brief introductions to Peridot's major systems: what each does, its principal modules, the data it uses, and the most important rules it must preserve. | **Start here** to orient yourself or locate the relevant system. |
| **[Level 2 — Authoritative Subsystem Contracts](#level-2--authoritative-subsystem-contracts)** | The current detailed explanation of each system: ownership, inputs and outputs, behavior, state, invariants, dependencies, tests, and known limitations. | **Read before changing a feature** to understand its responsibilities and interactions with the rest of Peridot. |
| **[Level 3 — Maintenance and Implementation Reference](#level-3--maintenance-and-implementation-reference)** | File-level references, fragile areas, regression checks, the active technical backlog, compatibility notes, and a handoff guide. | **Consult while implementing, testing, debugging, or taking over work** to locate exact files and avoid known failure modes. |

**Where to begin:** If you are new to Peridot, read [Level 1](#level-1--architecture-at-a-glance), then open the relevant [Level 2 contract](#level-2--authoritative-subsystem-contracts). Before editing source, consult the [Level 3 maintenance references](#level-3--maintenance-and-implementation-reference) and follow the **[Project Workflow Charter](PROJECT_WORKFLOW_CHARTER.md)**, which governs how changes are made. For the project's purpose and user-facing workflow, see the **[README](README.md)**; for the chronology of development and past decisions, see the **[Changelog](CHANGELOG.md)**. Historical accounts in this guide provide context but do not override the current subsystem contracts.

## Quick Navigation

- [How to use this guide](#how-to-use-this-guide)
- [Current synchronized checkpoint](#current-synchronized-checkpoint)
- [Level 1 — Architecture at a Glance](#level-1--architecture-at-a-glance)
  - [Application shell and navigation](#level1-application-shell-and-navigation)
  - [Data import and generalized mapping](#level1-data-import-and-generalized-mapping)
  - [Shared data scope and chronology](#level1-shared-data-scope-and-chronology)
  - [Geographic Map and Force Network](#level1-geographic-map-and-force-network)
  - [Timeline](#level1-timeline)
  - [Charts](#level1-charts)
  - [Explore / Search](#level1-explore-search)
  - [Inspector](#level1-inspector)
  - [Exports](#level1-exports)
  - [Themes, editorial presentation and loading](#level1-themes-editorial-presentation-and-loading)
- [Level 2 — Authoritative Subsystem Contracts](#level-2--authoritative-subsystem-contracts)
  - [Application shell and navigation](#contract-application-shell-and-navigation)
  - [Data import and generalized mapping](#contract-data-import-and-generalized-mapping)
  - [Shared data scope and chronology](#contract-shared-data-scope-and-chronology)
  - [Geographic Map and Force Network](#contract-geographic-map-and-force-network)
  - [Timeline](#contract-timeline)
  - [Charts](#contract-charts)
  - [Explore and Search](#contract-explore-and-search)
  - [Inspector](#contract-inspector)
  - [Exports](#contract-exports)
  - [Themes, editorial presentation and loading](#contract-themes-editorial-presentation-and-loading)
- [Level 3 — Maintenance and Implementation Reference](#level-3--maintenance-and-implementation-reference)
  - [Module ownership register](#module-ownership-register)
  - [Fragile zones and regression matrix](#fragile-zones-and-regression-matrix)
  - [Active technical backlog](#active-technical-backlog)
  - [Compatibility and historical paths](#compatibility-and-historical-paths)
  - [Fresh-maintainer handoff](#fresh-maintainer-handoff)
  - [Preservation and revision audit](#preservation-and-revision-audit)
- [Technical Terms Glossary](#technical-terms-glossary)

## Document Role and Boundaries

**Owns:** current architecture, state and data contracts, responsible modules, integration risks, regression expectations, compatibility paths, and the technical backlog. **Does not own:** public onboarding (README), process law (Project Workflow Charter), or complete historical chronology (Changelog). This revision changes document organization, not application behavior.

## Current Synchronized Checkpoint

```text
01b03bc — Complete compact Inspector integration across Map, Network, Timeline, and Charts
Branch: main
Status: HEAD, origin/main and origin/HEAD aligned (user-confirmed 2026-11-25); working tree NOT clean: locally modified core documentation and uncommitted voluntary-support/header source, config, and planning files. These are not part of 01b03bc.
```

The latest confirmed source checkpoint `01b03bc` consolidates compact Inspector work across Map, Network, Timeline, and Charts. Its predecessor checkpoints include `d94911f` (resizable compact Inspector) and `b619be4` (Inspector mockup). Uncommitted support/header work is tracked separately and has not been audited as an implemented source milestone here. See `CHANGELOG.md` for history and verification scope; the uploaded source archive is not evidence of an installed build.

<a id="1-current-architecture-snapshot"></a>

<a id="level-1--architecture-at-a-glance"></a>

## Level 1 — Architecture at a Glance

*Purpose: Help a new maintainer understand Peridot's principal systems, their responsibilities, and their relationships.*

**How to use:** Read the compact entries below, then follow the detailed-reference link for the system you need. These entries intentionally identify only the principal modules and highest-risk invariants; the authoritative explanations appear in Level 2.

<a id="level1-application-shell-and-navigation"></a>

### Application shell and navigation

Coordinates page routing and preserves the active research session across public workspaces.

- **Function / purpose:** Owns public routing, workspace continuity and shell-level coordination.
- **Primary modules:** `src/App.jsx`, `src/peridotWorkspaceConfig.js`, workspace components
- **Data / dependencies:** Active dataset, route state, workspace state, Inspector history
- **Critical invariants:** Navigation must not silently unload the dataset or reset accepted workspace state.
- **Detailed reference:** [Shell and routing contract](#contract-application-shell-and-navigation)

<a id="level1-data-import-and-generalized-mapping"></a>

### Data import and generalized mapping

Interprets uploaded and sample sources through researcher-controlled mappings and canonical normalized research structures.

- **Function / purpose:** Compiles researcher-accepted source interpretations into normalized data.
- **Primary modules:** `src/PeridotColumnMappingModal.jsx`, generalized mapping and normalization helpers
- **Data / dependencies:** CSV/TSV/XLS/XLSX/XLSM, mapped Relations/Identity/Time/Places/Evidence
- **Critical invariants:** Do not infer source semantics, silently merge identities, multiply workbook joins, or preload sample data.
- **Detailed reference:** [Data import contract](#contract-data-import-and-generalized-mapping)

<a id="level1-shared-data-scope-and-chronology"></a>

### Shared data scope and chronology

Provides consistent data-scope vocabulary and a date-faithful range/playback contract across views.

- **Function / purpose:** Defines the scope distinctions and shared calendar-day navigation contracts.
- **Primary modules:** `src/PeridotChronologyDock.jsx`, chronology helpers, `src/App.jsx`
- **Data / dependencies:** Canonical temporal assertions, loaded and applied data, playback and date windows
- **Critical invariants:** Preserve source-derived 10% padding, separate selected range, independent visualization sessions, and genuine undated evidence.
- **Detailed reference:** [Shared data and chronology contract](#contract-shared-data-scope-and-chronology)

<a id="level1-geographic-map-and-force-network"></a>

### Geographic Map and Force Network

Renders defensible source-backed spatial and relational connections, with independent geographic and force layouts.

- **Function / purpose:** Projects explicit relationships into geographic and force-layout views.
- **Primary modules:** `src/peridotEntityNetwork.js`, `src/mapStageComponents.jsx`, `src/mapInteractionHandlers.js`
- **Data / dependencies:** Mapped places/entities, explicit relationships, chronology-visible observations
- **Critical invariants:** Never invent endpoints or connections; show geographic edges only between visible, exact endpoint instances.
- **Detailed reference:** [Map and Network contract](#contract-geographic-map-and-force-network)

<a id="level1-timeline"></a>

### Timeline

Displays temporal events and periods through Chronological or researcher-prioritized Grouped layouts.

- **Function / purpose:** Positions assertions in time and offers evidence-backed comparative groupings.
- **Primary modules:** `src/PeridotTimelineII.jsx`, `src/peridotTimelineGroupedLanes.js`, category modules
- **Data / dependencies:** Mapped temporal assertions, categorical source attributes, applicable Search scope
- **Critical invariants:** Preserve exact dates, source-backed category associations and one-lane-per-event Grouped assignment.
- **Detailed reference:** [Timeline contract](#contract-timeline)

<a id="level1-charts"></a>

### Charts

Offers a recommendations-first catalogue, a configurable builder and chart-local analysis and publication exports.

- **Function / purpose:** Supports descriptive analyses through chart families, local controls and outputs.
- **Primary modules:** `src/PeridotChartsIIFoundation.jsx`, `src/analyticsChartComponents.jsx`, `src/chartsII*` modules
- **Data / dependencies:** Mapped categorical, numeric and temporal fields; chart-local filters
- **Critical invariants:** Presentation cannot change calculations; local filters must not alter Explore or other views.
- **Detailed reference:** [Charts contract](#contract-charts)

<a id="level1-explore-search"></a>

### Explore / Search

Builds and applies global research queries and provides browse/refine/results interfaces.

- **Function / purpose:** Owns draft and applied research queries across the active dataset.
- **Primary modules:** `src/PeridotSearchWorkspace.jsx` and Search helpers
- **Data / dependencies:** Loaded and normalized data, mapped places/evidence, applied criteria
- **Critical invariants:** Draft searches do not change applied scope until Apply; Browse retains its loaded-data scope.
- **Detailed reference:** [Explore contract](#contract-explore-and-search)

<a id="level1-inspector"></a>

### Inspector

Presents compact selection summaries and deep evidence dossiers with linked-history navigation.

- **Function / purpose:** Provides evidence dossiers and reversible linked-data navigation.
- **Primary modules:** `src/InspectorPanel.jsx`, `src/InspectorBodyRouter.jsx`, `src/InspectorChartMarkView.jsx`, `src/peridotInspectorSelectionEvidence.js`, `src/App.jsx`
- **Data / dependencies:** Selected records/entities/places/relationships and applied linked evidence
- **Critical invariants:** Preserve subject attribution, canonical entity identity and dossier history across navigation.
- **Detailed reference:** [Inspector contract](#contract-inspector)

<a id="level1-exports"></a>

### Exports

Produces explicitly scoped map, network, chart and tabular outputs with attribution.

- **Function / purpose:** Preserves the intended visual and research scope in output artifacts.
- **Primary modules:** `src/exportHelpers.js`, `src/chartsIIExport.js`, Visualize and Charts controls
- **Data / dependencies:** Rendered marks/visible graph, charted data, provenance, raster basemap tiles
- **Critical invariants:** Chart PNG must reflect live configuration; CARTO geographic export must embed tiles and credits.
- **Detailed reference:** [Export contract](#contract-exports)

<a id="level1-themes-editorial-presentation-and-loading"></a>

### Themes, editorial presentation and loading

Maintains semantic styling, editorial pages, responsive constraints and persistent worker-backed transitions.

- **Function / purpose:** Coordinates semantic visual roles, editorial page styles and loading transitions.
- **Primary modules:** `src/peridotTheme.js`, relevant workspace CSS, loading renderer and worker
- **Data / dependencies:** Theme roles, static assets, transition state and viewport measurement
- **Critical invariants:** Preserve reduced-motion behavior, existing licensing cautions, and React-owned Canvas lifecycle.
- **Detailed reference:** [Presentation and loading contract](#contract-themes-editorial-presentation-and-loading)

<a id="level-2--authoritative-subsystem-contracts"></a>

## Level 2 — Authoritative Subsystem Contracts

*Purpose: Give a developer enough information to understand and safely modify a particular system.*

Every contract follows the same ten-field order. **Not applicable** means the field has no meaningful application; **Not verified** denotes a relevant claim that the supplied materials do not establish. The detailed source-preserved explanations below the fields retain important design and verification context. Historical passages embedded in those explanations are labeled as historical source records, not alternative current authority.

<a id="2-application-boundaries-and-route-model"></a>

### Contract: Application shell and navigation

<a id="contract-application-shell-and-navigation"></a>

- **Purpose and scope:** Coordinates page routing and preserves the active research session across public workspaces.
- **Module ownership:** `src/App.jsx`, `src/peridotWorkspaceConfig.js`, workspace components
- **Inputs and data contracts:** Active dataset and route/workspace state
- **Outputs and consumers:** Workspace routing, navigation and state preservation
- **Behavior and interaction:** Persistent shell, page navigation and Inspector bridge
- **Invariants:** Preserve navigational continuity, avoid replacing the accepted Home with obsolete controls
- **Fragile dependencies:** Shared state ownership and route transitions; About/Tutorials compatibility
- **Verification:** Route through all public workspaces, inspect active dataset persistence
- **Known limitations / deferred work:** Tutorial content remains deferred
- **Historical context and related planning documents:** Changelog routing milestones; `planning_documents/PERIDOT_ROUTING_CONTRACT_AUDIT.md` (path recorded in original guide)

#### Application boundaries and route model


Peridot uses a workspace-first route model with a **persistent global header**. The logo is the Home control; **Data**, **Visualize**, and **Explore** are the primary task destinations; **Tutorials** and **About** are persistent project/help destinations. Lightweight page navigation is immediate; the heavier transition overlay is reserved for expensive workspace/visualization changes and for entering the full-page mapping workspace. **Themes and Accessibility** remains implemented and route-compatible internally, but is intentionally absent from the public header.

##### Workspace boundaries

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

##### First-time tutorial contract

The tutorial is a retained guided overlay system rather than a separate workspace, but it is **not currently launched from Home**. Historically, `b7482cb` removed the floating invitation and added a disabled **Tutorial** placeholder beneath two Home data-entry actions. That placeholder was later superseded by the current Cartographic Editorial Home; Tutorials remains available as a global navigation destination, while substantive guided content is deferred.

When tutorial work resumes, preserve the existing seven-stage implementation as the starting baseline unless an explicit redesign supersedes it: Visualizations → Timeline → Inspector → Explore → Browse / Apply → Working Set → Export. The existing draggable/minimized panel, Back/Continue, recovery, target-observation, and keyboard-accessibility behavior remains source/history to protect during revision; do not silently revive the old floating Home invitation.

Current minimum regression check: Home displays the single **Get Started** action linking to Data onboarding, the **New to Peridot?** banner guidance, and informational three-column banner, Tutorials remains a global navigation destination, and no obsolete floating tutorial invitation or disabled Home placeholder reappears. When the guided launcher is re-enabled, rerun the full seven-stage, drag, minimize/restore, keyboard, Inspector-close, anchor, and recovery regression suite.

##### Current route and visualization model

- Visualizations exposes one unified **Geographic Map**, a separate **Force-Directed Network**, and Chart Visualizations. The former Place Map / People Map split is superseded.
- Geographic Map settings can label nodes as Places, People / entities, or both; choose one or more mapped geographic anchor roles; choose relationship-line event geography plus explicit fallback behavior; and reserve an Appearance section for later sizing/scaling work.
- Map settings use a draft/Apply model. Reset affects draft state; graph recomputation occurs on Apply; Geographic and Force viewport state is preserved separately; Fit View is explicit.
- Geographic edges render only when both resolved endpoint node instances are currently visible. Never draw a floating edge to a hidden endpoint or manufacture Cartesian products across several visible anchors.
- Timeline has **two distinct responsibilities** that must not be conflated: (1) the one active dedicated Timeline visualization (`PeridotTimelineII.jsx`) for chronological event/period display; and (2) the shared chronology dock for range selection and playback across Map/Network/Timeline/Charts. The original Timeline I event-card visualization has been retired from public navigation; its old contracts below are historical context rather than active feature claims. Scrubbing previews locally while dragging and commits canonical playback position on release. Export is a shared Visualizations header menu rather than a separate workspace.
- Advanced Search is the primary Explore surface and owns global applied filtering.
- Legacy rail and panel paths exist only as compatibility bridges where they preserve visualization-click Inspector behavior.
- MapLibre work is archived; active `main` uses the D3/SVG path.

Detailed subsystem contracts appear in Sections 4–8. The module index in Section 9 identifies the concrete source owners.

#### Application-boundary inventory and source context


- Local source of truth: `C:\Users\haley\OneDrive\Desktop\Peridot\`
- Active continuation branch: `main`
- Repository: `https://github.com/haleyrp1803/peridot-humanistic-data`
- Active D3/SVG path: MapLibre experimental work is archived and not part of active `main`.

##### Supporting planning documents

The following tracked planning documents remain relevant maintenance references:

- `planning_documents/PERIDOT_INTERFACE_REDESIGN_PLAN.md` — original workspace-first redesign rationale and public-navigation direction.
- `planning_documents/PERIDOT_ROUTING_CONTRACT_AUDIT.md` — routing and compatibility-boundary audit.
- `planning_documents/PERIDOT_INSPECTOR_WORKSPACE_CONTRACT.md` — compact/full Inspector model and shared-state contract.
- `planning_documents/PERIDOT_CODE_STRUCTURE_AUDIT.md` — structural cleanup roadmap and bounded future decomposition reference.
- `planning_documents/PERIDOT_NORMALIZED_DATA_MODEL_PLAN.md` — historical/architectural plan that established the canonical normalized model, provenance/temporal contracts, correspondence compatibility boundary, and genealogy normalization sequence; much of this plan is now implemented.

##### Application-boundary inventory

| System | Primary owner | Core responsibility | Sensitive coupling | Minimum regression check |
|---|---|---|---|---|
| Top-level orchestration | `App.jsx` | state, derived data, routing, Inspector history, export wiring | filters, timeline, compact/full Inspector bridge | open each workspace; upload/use sample; click node/edge/cluster |
| Workspace navigation | `App.jsx`, global header/navigation boundaries, `peridotWorkspaceConfig.js` | persistent public routing, state continuity, hidden Theme compatibility | active dataset, workspace/viewport state, Inspector presentation | logo/Home; Data/Visualize/Explore/Tutorials/About; cross-page state persistence |
| First-time tutorial | tutorial state, panel, dock, anchor/highlight, and Home-entry boundaries | retained seven-stage guided workflow; public Tutorials page remains Coming Soon | workspace routing, Inspector close behavior, target observation, keyboard focus | verify no Home tutorial launcher; rerun full seven-stage regression when launcher is re-enabled |
| Data import | Data workspace + mapping/import helpers | parse, map, validate, normalize, capability audit | upload reset and downstream data scope | template, CSV, TSV, XLSX, XLSM, XLS, mapped import |
| Visualizations | `PeridotVisualizationsWorkspace.jsx`, `PeridotTimelineWorkspace.jsx` | map/network/chart modes, dedicated Timeline workspace, shared playback control, header, stage, Export menu | stage sizing, Inspector overlay, search/playback scope, portal layers | map/network/timeline/chart switch; Timeline orientation/zoom/pan/categories; header/playback controls |
| Search | `PeridotSearchWorkspace.jsx` | draft/apply search and Explore UI | active dataset, facets, Inspector handoff | Apply/Clear, suggestion, pagination, Inspect return |
| Inspector | Inspector modules + `App.jsx` | compact/full evidence dossier and history | selection resolution, mounted overlay | node/edge/cluster; Expand; Back; close |
| Charts II | `PeridotChartsIIFoundation.jsx`, `analyticsChartComponents.jsx`, `chartsII*` helpers | Catalogue, Builder, chart-local filters, Appearance, SVG rendering and PNG export | canonical date scope, cached fields, stable colors, drag-release, shared palette | 15 chart families, selection persistence, filters, appearance, export |
| Theme/CSS | theme modules + stylesheets | semantic colors and component presentation | import order, dropdown/z-index, reduced motion | theme role/palette change; each workspace |
| Export | `exportHelpers.js` + Visualizations header | image/tabular export | visible/selected/charted scope | SVG/PNG/CSV output |

<a id="7-data-import-and-workbook-contract"></a>


#### Additional source-preserved architectural context

Peridot is a Vite/React/Tailwind research application organized around a workspace-first, multimodal exploration environment. `src/App.jsx` remains the top-level orchestration boundary, while dedicated workspaces and pure/helper modules own most UI, import, visualization, theme, search, Inspector, export, and generalized mapping behavior.

The active public workflow now uses a persistent site-wide header rather than a hamburger-first route model. The Peridot logo returns to Home; **Data**, **Visualize**, and **Explore** occupy the primary task group; **Tutorials** and **About** occupy the project/help group. The header persists across public pages, and page navigation does not intentionally unload the active dataset or reset accepted workspace state. Visualize owns Map, Network, the sole active Timeline (implemented in `PeridotTimelineII.jsx`), Charts, and Export; Explore owns Browse, Advanced Query, and Refine; Data owns project start/edit plus the full-page mapping workspace; About owns About Peridot, Creator, AI Disclosure, Open Source, and Feedback. Themes and Accessibility remains implemented as an internal compatibility/development route but is not a public header destination. The historical Home tutorial placeholder remains retired; the active Home now has one Get Started entry action. Substantive guided Tutorials remain deferred.


[Back to Quick Navigation](#quick-navigation) · [Level 1 overview](#level-1--architecture-at-a-glance) · [Module ownership register](#module-ownership-register)

### Contract: Data import and generalized mapping

<a id="contract-data-import-and-generalized-mapping"></a>

- **Purpose and scope:** Interprets uploaded and sample sources through researcher-controlled mappings and canonical normalized research structures.
- **Module ownership:** `src/PeridotColumnMappingModal.jsx`, generalized mapping and normalization helpers
- **Inputs and data contracts:** Uploaded sources and explicit researcher mappings
- **Outputs and consumers:** Canonical model, runtime projections and sample/edit workflows
- **Behavior and interaction:** Workbook review, mapping edits, validation and normalization
- **Invariants:** Never infer data semantics or merge subject attribution
- **Fragile dependencies:** Worker revision invalidation, unique-ID workbook joins and compatibility adapters
- **Verification:** Import, mapping and sample fixture regressions; production build
- **Known limitations / deferred work:** Independent per-domain worker caches deferred; multiple relationship groups require architectural work
- **Historical context and related planning documents:** Changelog import milestones; `planning_documents/PERIDOT_NORMALIZED_DATA_MODEL_PLAN.md`

#### Data import, workbook, sample and mapping contracts


##### Confirmed import safeguards and performance findings (2026-11-01)

- `64dfbae` strengthens `PeridotColumnMappingModal.jsx`: the workbook confirm handler independently requires a successful current Review result for the current workbook/mapping, rather than trusting the disabled button alone. This is defense-in-depth, **not** a claim that every rapid-edit stale-result race has been exercised.
- `8dd208a` restores the intended **fresh versus previously mapped** distinction. Suggested mappings on a new upload do not pre-open Relations, Time, or Places; explicit Add actions reveal new configuration. Already accepted/sample mappings display their substantive assignments immediately. Preserve the previously accepted one-new-place-per-Add interaction and visually active, multi-subject checkboxes.
- `481acd9` optimizes capability readiness in `peridotCorrespondenceProfile.js`: precompute per-record participation counts and route-related assertion flags rather than repeatedly scanning all participations/assertions for each record. This is a **semantic-preservation** optimization, not a new definition of network or route eligibility. Test ordinary correspondence, multipart relations, geographic assertions, empty records, and non-correspondence datasets after future changes to these calculations.
- The workbook performance investigation used **temporary, since removed** timing instrumentation in `App.jsx` and `peridotCanonicalRuntimeModel.js`. In a 4,999-record run, synchronous import measured ~4.08 s, dominated by canonical construction (~3.67 s) rather than repeated assembly (~0.17 s) or legacy compatibility (~0.10 s). A post-optimization 4,999-record case measured ~0.49 s canonical construction. Different primary sheets/mappings prevent calling this a controlled benchmark; the observed ~86.8% reduction is descriptive only.
- A multi-sheet workbook's **primary sheet determines the source-record set**. Supporting geographic sheets with placeholder-bearing rows can have a different row cardinality even if the researcher considers fewer rows substantively informative. Never silently drop those rows as a performance optimization; use researcher-selected record sheets and explicit unique-ID joins. Separating support-sheet counts from primary research-record counts is future usability work, not a change made here.
- Final assembly can still run synchronously after Review; optimization of worker-result reuse is **deferred**, not implemented. The user elected not to undertake a separate worker-race/security follow-up in this cleanup cycle. The deeper regression-fixture review is deferred.

##### Verified mapping display and Review behavior (2026-10-31, `973d40d`)

When the researcher opens an existing or sample mapping, accepted Places, Time, and Relations assignments must be visible immediately without another Add action. In Places, **Add a Location** creates/reveals only one new unmapped place card per activation; it does not convert the full historical `placeParts` array into newly added visible cards. Existing substantive mappings remain intact and visible even if there are several. Preserve the generalized `placeParts` schema, field references, and subject provenance.

The shared `PeridotSubjectSelectionControl.jsx` communicates **choose any that apply**: record subject and several participant subjects may be selected concurrently, with a clear selected state that never appears greyed out or disabled. An at-least-one-subject constraint remains; switching the sole selected subject requires selecting another before clearing the original. Do not change the accepted multiplicative subject-attribution logic to match visual checkbox expectations. The Review page must be able to access its `mappedRowsCapabilityAudit` calculation without a reference error. Regression: sample Correspondence and Family Tree mapping revisit, repeated single-place Add, Part A+Part B toggling, Review after changes, Apply/Confirm, and ordinary uploaded workbook/CSV paths.

##### Six-month SheetJS and Browserslist maintenance register

Review both dependencies every **six calendar months**, and preserve **last installed/verified update** and **last review** as separate recorded events. If a review determines an update is unnecessary, advance the last-reviewed date and next due date without changing the last-updated date. Record the observed installed version, security/advisory outcome, target-browser changes (if any), Vite build result, and relevant import test results. The review is a maintenance obligation, not authorization for silent upgrades or `npm audit fix --force`.

| Dependency | Verified current version | Last updated (user-local) | Last reviewed | Next six-month review due | Verification and distribution |
|---|---|---|---|---|---|
| SheetJS (`xlsx`) | `0.20.3` | **2026-10-31** | **2026-10-31** | **2027-04-30** | Installed from version-pinned official `https://cdn.sheetjs.com/xlsx-0.20.3/xlsx-0.20.3.tgz`; npm version/tree checks and Vite build passed; user reported CSV/XLS/XLSX/XLSM/browser mapping regressions passed |
| Browserslist compatibility database (`caniuse-lite`) | `1.0.30001820` | **2026-10-31** | **2026-10-31** | **2027-04-30** | Updated with `npx.cmd update-browserslist-db@latest` (Windows PowerShell execution policy blocks `npx.ps1`); updater reported success and no target browser changes; a separate post-update build output is not present in the supplied log |

On each review, check SheetJS official release/advisory notices as well as npm advisory results; npm's public `xlsx` version history may not represent the current official CDN release, so a lower npm audit count is not itself proof of a fix. Retest workbook sheet reading, explicit unique-ID joins, XLSM worksheet-only processing, source mappings, revisits, worker Review, Confirm/Apply, and stale-result protection when changing SheetJS. For Browserslist, refresh its data only after determining the update is needed, examine any target-browser changes, and run the production build. Record the actual results and update date; do not assume a nominal scheduled review has occurred.


Peridot supports a simple downloadable template, arbitrary CSV/TSV mapping, workbook-aware XLSX/XLSM/XLS import, editable post-import mappings, and three first-class sample datasets. The public import model is now **one generalized mapping system** rather than a Correspondence-versus-Genealogy profile choice. The canonical model remains database-first: source material may remain useful even when it is not map-, network-, timeline-, or chart-ready.

##### Canonical normalization and compatibility boundary

The current public import architecture is:

```text
parsed/staged source
→ explicit user-owned generalized mapping
→ authoritative generalized runtime observations / canonical normalization
→ validation and capability derivation
→ compatibility/consumer projections only where still required
```

Older correspondence and genealogy profile/normalizer modules remain in source where they still provide compatibility or specialized canonical/runtime projection behavior. They are not public ontology choices and must not override accepted generalized mappings. A later retirement audit should remove only code whose replacement has been proven end-to-end.

##### Import contract

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

##### Workbook Review worker, provisional preprocessing, and invalidation

`PeridotColumnMappingModal.jsx` coordinates workbook review jobs and `peridotWorkbookReview.worker.js` performs heavy assembly/audit outside React rendering. It is a **full-review worker**, not an independent per-category incremental processor. Revisions of workbook/sheet joins or mapping settings must invalidate prior results, including a job that finishes after a newer edit. The worker may begin provisional processing after mapping inputs settle, before Review is opened; researchers remain free to edit Time, Places, Relations, Evidence, and joins without locking controls. Revisit and rapid-edit tests must verify that only the latest valid mapping can be confirmed. Errors must be displayed rather than converted to accepted-record count zero. Confirm upload may still perform synchronous final work; future stage caching is deferred pending measurement.

##### First-class sample-data contract

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


##### Shared mapping interface presentation (first implemented design checkpoint)

At `f3cf4fb`, Relations, Time, and Places gained the first shared Cartographic Editorial mapping presentation system over the existing generalized model. `PeridotMappingPresentation.jsx` owns reusable stage mastheads, hierarchy markers, info-trigger/popup presentation, and contextual guidance components; `PeridotMappingFieldControls.jsx` composes stage-specific questions, while `PeridotValueHandlingControl.jsx` and `PeridotSubjectSelectionControl.jsx` retain shared cardinality and subject controls. `PeridotColumnMappingModal.jsx` still owns the full-page mapping shell and navigation, and `PeridotColumnMappingModal.css` owns its stage UI and compact options. These UI changes are not a change to researcher-owned mapping semantics.

Preserve: icon-and-pill navigation indicating optional mapping categories; compact stage title/subtitle; primary questions and indented lettered refinements; consistent card top alignment (including avoiding inherited `space-y-*` margins in horizontal option rows); content-sized choice cards while preserving real radio-versus-checkbox semantics; accessible `(i)` help on hover/focus/click and Escape; source examples, current interpretation, and Additional Context / Good to know; and visible warnings, constraints, and validation. Keep source values faithful and never hard-code illustrative mockup labels as actual defaults. Future refinements should consolidate shared Identity controls and extend the system to Preview, Sheets, Evidence, and Review and Upload without making optional data categories a mandatory sequence.

The planning references committed in `27e3cf7` are `planning_documents/Mockup Florence Atlas Homepage.png`, `Mockup Places Data Mapping Interface.png`, `Mockup Relations Mapping Interface.png`, `Mockup Sample Data Selection Interface.png`, and `planning_documents/Peridot_Genealogy_Retirement_Audit_20261026_v1.md`. The last item is an audit, **not** authorization or evidence that specialized genealogy import/runtime files have been deleted. Retain generalized genealogy data support and verify active dependencies before future retirement.

##### Progressive disclosure and Excel import error contract (2026-10-28)

At `c0e1fb3`, `PeridotColumnMappingModal.jsx` introduced user-triggered activation for the existing Relations, Time, and Places editing surfaces: **Add a Relationship**, **Add a Date or Time Period**, and **Add a Location** appear before the full mapping form. `PeridotMappingFieldControls.jsx` retains the original full-width, two-column field-editor compositions and nested **Add another part** behavior. Suggested source mappings may still be identified, but they should only populate the newly opened form after user action. Relevant integrated Identity controls follow form activation. Preserve the difference between a suggested mapping and an accepted mapping; closing/navigating must not discard researcher-approved values. Test empty, suggested, previously mapped, and revisited states in both single-table and workbook entry paths.

**Relationship capacity:** the accepted model still represents one relationship group with `relationshipParts` (Part A/B/C...). Multiple *independent* relationship groups per row are not implemented. Do not represent a one-to-many participant collection as separately configured Mother/Father/Spouse relationships, or create clique edges from co-occurrence. The extension is deferred pending schema, compilation, canonical projection, Network/Inspector, and compatibility regression work.

At `55453a8`, the recognized Excel formats gained `.xlsm` in addition to `.xlsx` and `.xls`, including file chooser and upload routing support. The workbook parser reads worksheet data without executing macro code. Unsupported formats, failed parsing/unreadable workbooks, and data with no usable table must yield actionable user-facing errors, not misleading successful staging. Include `.xlsm` and failed-file cases in import regressions, including sample-selection entry, without changing the established unique-ID join contract.

##### Current mapping-model status

The two major mapping-model questions previously deferred here are now implemented:

1. **Cardinality / multiple values in one cell.** Suitable mapped items support one-versus-many declarations plus an explicit researcher-chosen delimiter. Peridot normalizes common quoted delimiter input, preserves original source cells, and does not infer punctuation. Structured component dates/period endpoints remain structured units. Multi-valued place cells cannot apply one shared row-level coordinate pair.
2. **Record/participant attribution multiplicity.** Time, Places, and Evidence can describe the record, one or more mapped participants, or both through the shared subject-selection model. Mapping fan-out produces atomic single-subject assertions rather than subject arrays.

These capabilities should now be treated as preservation contracts, not backlog items.

##### Minimum regression checks

Test: first launch with no active data; persistent-header navigation and logo/Home return; template download; all three sample chooser entries; sample source download; sample mapping edit/cancel/reset; CSV and TSV mapping; XLSX, XLSM, and XLS staging; full-page mapping entry without flash; direct mapping-section navigation; primary-sheet selection; multiple joins; duplicate-ID blocking; joined-field mapping; Identity continuity across repeated roles; Review and Upload/apply behavior; post-upload mapping re-edit/apply; retained accepted incomplete rows; cross-page active-dataset/state persistence; Search reset/coherence; Timeline and Analytics scope after upload; Inspector participant attribution and linked navigation; and relevant exports.

##### Preserved detailed import regression expectations

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

#### Data entry and mapping presentation


The sample chooser is now a dedicated parchment-backed selection page with three illustrated cards, one per shipped dataset: letter, Medici family tree, and Cardinal Carlo portrait. Image crop/frame settings are presentation only; sample files, generalized mapping definitions, and the requirement for explicit selection remain unchanged. The Home entrance effects use restrained sequential editorial animation; a decorative dotted-route trial was rejected.

The public Tutorials page now presents a Coming Soon state; do not claim the retained guided overlay is publicly launched. The no-dataset Visualize/Explore and About/Tutorials pages have had redundant eyebrow labels removed. The Creator page was returned to its earlier smaller-portrait and adjacent-biography layout after an experimental large profile-card series was rejected; the later `5e785ed` manuscript pass adds an external red ornamental portrait frame and artwork-aware wrapping without resurrecting the rejected large profile card. The revised Creator bio from that experiment is not the accepted live copy. The Feedback form remains the two-column editorial design. These are presentation decisions, not semantic or routing changes.

##### Current Data onboarding and persistent dataset-management surface (2026-10-30)

At `ee4c3ff` (refined by `761d72d`), the Data landing surface has four top-level tabs: **Get Started**, **Sample Datasets**, **Templates**, and **Upload Data**. Get Started contains three standalone cards with a four-tile sample-choice icon, a template entry, and an upload entry. Sample Datasets retains historical-image cards for Correspondence, Genealogy, and Cardinals with **Use Sample**, **Edit mapping**, **Download source**, and **Details**. Templates offers the existing correspondence-oriented template, not a claim of several newly authored templates. Upload Data retains CSV/TSV/XLSX/XLSM/XLS support. The always-visible bottom status panel distinguishes no active dataset from **Your Active Dataset**, names the active source, and offers a prominent oxblood **Edit Mapping** action.

The Home's single **Get Started** CTA now enters this Data start surface. Entry and tab transitions use staggered top-to-bottom motion with prompt onset; the accepted desktop layout preserves room for the bottom status panel without forcing page-level scrolling. Mapping itself remains the established full-page generalized editor. Maintain continuity across tab switches and public navigation, preserve source/download/edit actions, and test no-data, active upload, active sample, sample replacement, and map-edit states. Do not conflate these presentation changes with a new parser or semantic model.

##### Current asset naming and path ownership (2026-10-30)

Commit `52cf1f8` standardized the active decorative asset collection in top-level `assets/` using semantic prefixes including `base_`, `corner_`, `divider_`, `detail_`, `panel_`, `label_`, and `img_`. Directional corner variants use `TL`, `TR`, `BL`, `BR`; numeric differentiators, when needed, go at the end. All runtime image imports and CSS URLs must reference the actual committed names and preserve exact letter case on GitHub Pages. Commit `c71e265` repaired Home, Data sample, parchment, and Creator references after renaming; the user verified rendering. The later 44-file experimental labels/frames set was rejected and must not be assumed present. Historical asset names in earlier commits are provenance/history, not current source paths. Any later asset work requires alpha-edge inspection, viewport checks, and separate provenance/licensing review; adding a PNG to the repository does not automatically authorize its use everywhere.

##### About manuscript composition and responsive Data regression contract (2026-10-30)

At `5e785ed`, About's page-specific illustrated corner overlays and revised parchment became accepted public-page presentation. The corner assets belong to the About content surface, not the browser viewport, global header, or navigation bar. Their outer corners remain registered to that surface, with controlled clipping/overscan as needed. Use artwork-aware text flow or shape exclusions to preserve the visual effect of type wrapping around a torn page, rather than forcing all text and controls into a permanent rectangular inset. Keep a small clearance from the visible torn boundary, and prevent rules, borders, input fields, notes, and buttons from drawing over the illustration. Preserve usable scrolling when a narrow viewport cannot contain the entire page.

**Page-specific composition:** About Peridot uses a top-left illuminated letter; Creator uses top-right alchemical imagery and a four-corner red decorative frame positioned *outside* the portrait; AI Disclosure uses lower-left celestial art; Open Source uses lower-right pomegranate art; Feedback uses top-left and lower-right alchemical corners. The Creator biography flows around the top-right asset and stays clear of the portrait's frame. Feedback retains its two-column form and a large, left-aligned Send feedback action in the second column; the footer/explanatory note and textareas must clear the lower-right corner even when columns narrow. The current use of warm `base_parchment_2` is a design choice, not a change to source data or application state.

**Data responsive contract:** At laptop-height desktop viewports, the Data entry screen should keep the four-tab navigation, sample title, three illustrated sample cards, and persistent bottom dataset-status panel readable without unnecessarily increasing vertical overflow. Preserve text scale when reducing card height; reduce vertical padding and illustration/card footprint rather than shrinking body type. The status panel's overall design remains unchanged, with a small but visible lower viewport gap; ensure controls stay accessible if the window is shorter. Do not change sample chooser semantics, mapping edits, or active-dataset state while tuning geometry.

**Minimum visual regressions:** check all five About tabs at wide and narrower laptop windows, especially irregular top-left and top-right text wrapping, bottom-corner note/textarea/button clearance, divider termination, full-page scroll, accessible Feedback submission, Creator photo/frame separation, and non-overlap with the global header. Check Data's Get Started, Sample Datasets, Templates, and Upload Data at the same widths/heights, with both no-data and active-data status and direct sample actions. The exact implementation selectors and measured breakpoints should be read from the current source before changing them; these notes describe user-accepted behavior based on screenshot QA and the verified commit, not an independently performed source-code audit.

<a id="3-data-lifecycle-and-scope-vocabulary"></a>


#### Additional source-preserved architectural context

The active data architecture is now one generalized user-mapping model over the canonical normalized research model. The public upload workflow no longer asks the researcher to choose Correspondence / Directed Record versus Genealogy / Person-Centered, and the former separate experimental “universal mapper” surface has been removed. Ordinary CSV/TSV/XLS/XLSX/XLSM uploads pass through the generalized mapping workflow; older correspondence/genealogy normalizers and adapters may remain internally as compatibility/specialization boundaries, but they are not competing public semantic authorities.

Generalized mapping is authoritative for Relations, Identity, Time, Places, Evidence, per-field cardinality, and record/participant subject attribution. Recurring-entity Identity is integrated into the mappings where entities are declared rather than exposed as a separate required page: simple data defaults to the displayed name/label, while stronger rules can use stable source IDs or alternate compound recipes such as `(Name A + Title A) OR (Name B + Title B)`. Canonical entity IDs remain identity authority; canonical entity labels are a separate presentation authority consumed by Network and Inspector.

Mapped uploads are now editable after import. The Data workspace can reopen the original source with the active mapping, and **Apply changes** recompiles the dataset through the generalized import path. Workbook joins remain explicit unique-ID joins; unsafe duplicate join IDs are blocked rather than multiplied silently. Identity suggestions shown in the mapper are materialized into authoritative mapping state when accepted untouched, while intentionally cleared suggestions remain cleared.

Sample data is now first-class generalized data rather than hidden embedded fallback state. Peridot starts with **no active dataset**. A researcher must explicitly select a sample or upload their own data. `public/sample_data/` contains three ordinary downloadable source files—correspondence network, family tree, and cardinals—and `src/peridotSampleDatasets.js` pairs each with a preserved generalized mapping. The Sample Datasets tab remains accessible and may be revisited repeatedly; selection state is owned at the application level so choosing one sample does not prevent replacement with another. Sample mappings can be edited for learning/QA without mutating the shipped mapping; **Reset to sample mapping** restores the canonical interpretation.


[Back to Quick Navigation](#quick-navigation) · [Level 1 overview](#level-1--architecture-at-a-glance) · [Module ownership register](#module-ownership-register)

### Contract: Shared data scope and chronology

<a id="contract-shared-data-scope-and-chronology"></a>

- **Purpose and scope:** Provides consistent data-scope vocabulary and a date-faithful range/playback contract across views.
- **Module ownership:** `src/PeridotChronologyDock.jsx`, chronology helpers, `src/App.jsx`
- **Inputs and data contracts:** Loaded/normalized/applied/visible/selected/charted/exported data; temporal assertions
- **Outputs and consumers:** Consistent scope and selected windows across visualization consumers
- **Behavior and interaction:** Gregorian-day chronology, playback and scope distinctions
- **Invariants:** Search and date-window scope must not be conflated
- **Fragile dependencies:** Shared chronology state and deferred-mount measurements
- **Verification:** Four focused chronology Node tests and four-view browser regression
- **Known limitations / deferred work:** Not applicable
- **Historical context and related planning documents:** Changelog `4fca872` and earlier shared chronology milestones

#### Data lifecycle and scope vocabulary


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


#### Additional source-preserved architectural context

Canonical temporal semantics remain fully authoritative across active consumers. The former `parsedDate`, `parseHistoricalDate`, duplicate capability parser, and lexical date-sorting fallbacks are retired from active `src`. ISO 8601 timestamp strings are accepted as day-precision temporal values while preserving the complete source text; parsing uses the lexical source calendar date rather than timezone-shifting historical dates. Search consumes generalized relationships and places plus canonical subject-aware Evidence; its Results presentation is generalized rather than route-shaped, and the Search/Timeline/Analytics scope audit is complete.


[Back to Quick Navigation](#quick-navigation) · [Level 1 overview](#level-1--architecture-at-a-glance) · [Module ownership register](#module-ownership-register)

### Contract: Geographic Map and Force Network

<a id="contract-geographic-map-and-force-network"></a>

- **Purpose and scope:** Renders defensible source-backed spatial and relational connections, with independent geographic and force layouts.
- **Module ownership:** `src/peridotEntityNetwork.js`, `src/mapStageComponents.jsx`, `src/mapInteractionHandlers.js`
- **Inputs and data contracts:** Mapped entity/place and relation assertions
- **Outputs and consumers:** Geographic graph, force graph, map settings and source-backed edges
- **Behavior and interaction:** Pan/zoom, viewport fitting, graph edges, playback and basemap selection
- **Invariants:** Exact visible endpoints and provenance faithful graph
- **Fragile dependencies:** Tile embedding, live-drag performance and first mount lifecycle
- **Verification:** Map/Force smoke tests, 3,000-node sample caveat and export attribution
- **Known limitations / deferred work:** Large arbitrary-data performance not universally verified
- **Historical context and related planning documents:** Changelog CARTO and Network milestones

#### Web Mercator, CARTO and Map export contract


**Production CARTO configuration (repaired at `54dfa2c`, live-site verified 2026-11-01):** `.github/workflows/deploy-pages.yml` builds `./dist` with `GITHUB_PAGES: 'true'` and forwards `VITE_CARTO_BASEMAP_KEY` from the GitHub Actions repository secret to the Vite build. An absent build-time variable caused CARTO to return `API KEY REQUIRED` tiles on GitHub Pages despite successful localhost rendering. GitHub Actions secrets keep credentials out of tracked workflow text, but Vite embeds `VITE_` values in publicly served client assets; **do not describe this as a private server-side key**. Apply provider-side domain/usage restrictions and monitoring where supported; never commit or disclose the raw value. Test deployed Voyager, Positron, and Dark Matter after changes to this build contract.

The active **Geographic Map** remains D3/SVG, but now uses a tiled **Web Mercator** CARTO basemap, replacing the earlier Natural Earth geographic backdrop in that view. CARTO **Voyager** is the default, with **Positron** and **Dark Matter** alternatives selected inside transactional **Map settings** (draft, Apply, Reset). The basemap key is read from `VITE_CARTO_BASEMAP_KEY` in local configuration and must never be placed in tracked files, logs, exported SVG URLs, or public documentation. Attribution to **© OpenStreetMap contributors** and **© CARTO** must be retained alongside Peridot attribution in geographic PNG/SVG exports and the relevant live view.

The geographic implementation supports east–west world wrapping with wrapped geographic research overlays, but constrains north–south navigation to Web Mercator bounds. The successful zoom-20 fix renders raster tiles in **viewport-relative SVG coordinates**, avoiding enormous parent transforms at high magnification. The map retains prior imagery while new tiles load, uses buffered visible-first/progressive tile loading with bounded in-session caching, and samples tile-selection work more slowly than immediate pointer/scroll movements. Research relationship lines use screen-space clipping and offscreen culling; navigation temporarily simplifies costly edge presentation, with detailed rendering restored after interaction. Preserve fast drag-to-wheel transitions, click/Inspector semantics, visibility/provenance, map-style changes, playback, and drag-time prevention of browser text selection. Temporary tile, frame, and layer-isolation diagnostic controls were removed at `ae3574c`.

Geographic export must **embed** visible raster basemap tiles in a self-contained SVG before producing either SVG or PNG; merely referencing external CARTO images can make PNG output blank and can expose tile-key URLs. Ensure export metadata and required CARTO/OpenStreetMap credit are opaque/readable even if optional title/metadata are omitted. If required tile embedding fails (including cross-origin restrictions), report an explicit error rather than silently exporting the research overlay alone. Test PNG and SVG using each style and a populated map; distinguish live-browser rendering, local export, production build, and deployed GitHub Pages verification.

**Workbook Review & Upload** now uses `src/peridotWorkbookReview.worker.js` coordinated by `src/PeridotColumnMappingModal.jsx` for expensive full-workbook review assembly/capability auditing. The UI stays available while review work runs, displays pending/error states, and prevents accepting an unfinished result. Provisional review preparation can begin after a stable mapping change (approximately 500 ms debounce), including before the user opens Review, and may be reused between tabs. Current user selections remain authoritative: a superseded worker result must not overwrite a newer mapping revision. **This is not independent cached processing for Time/Places/Relations/Evidence.** Confirm-upload assembly, exact join semantics, and remaining synchronous mapping validations must be regression-tested separately. The user observed reduced final Review waiting but has not run a complete stale-result race test.

A map containing approximately **3,000 nodes** was user-tested successfully; performance under substantially more edges, concurrent playback, and arbitrary imported files is not thereby guaranteed.

<a id="4-visualizations-timeline-inspector-and-export-contracts"></a>


#### Additional source-preserved architectural context

Network semantics have now crossed the principal generalized boundary as well. Geographic relationship scope respects Timeline-visible dated relationship observations while retaining genuinely undated structural relationships; `peridotEntityNetwork.js` provides generalized geographic anchor semantics; the old separate place/person map distinction has been collapsed into one Geographic Map; Map settings apply anchor roles, display identities, relationship-line location rules, and fallbacks transactionally; geographic edges require both exact visible endpoint node instances; hover/provenance language is generalized; and playback highlighting consumes the rendered generalized graph rather than rebuilding a correspondence-shaped Source→Target pair. The earlier playback/interaction performance sequence from `c8a7c46` remains historical foundation (superseded for Geographic Map interactions by the newer CARTO live-drag and viewport-relative implementation): the bottom playback scrubber uses transient local preview state, pointer panning and wheel zoom use transient SVG transforms before durable state commits, and Force playback reuses a stable full-scope graph instead of rebuilding/re-simulating geometry on every playback tick. The discarded playback tween/geometry-animation prototypes remain absent.


[Back to Quick Navigation](#quick-navigation) · [Level 1 overview](#level-1--architecture-at-a-glance) · [Module ownership register](#module-ownership-register)

### Contract: Timeline

<a id="contract-timeline"></a>

- **Purpose and scope:** Displays temporal events and periods through Chronological or researcher-prioritized Grouped layouts.
- **Module ownership:** `src/PeridotTimelineII.jsx`, `src/peridotTimelineGroupedLanes.js`, category modules
- **Inputs and data contracts:** Canonical temporal assertions plus explicitly mapped category associations
- **Outputs and consumers:** Chronological/Grouped event and period rendering
- **Behavior and interaction:** Source-backed categories, star priority, marker modes, calendar positioning
- **Invariants:** No invented event associations; exact date positions and one eligible grouped lane
- **Fragile dependencies:** Shared-stage `min-w-0` conditional, sparse/dense layout, legacy model references
- **Verification:** Timeline category/grouped-lane tests; chronology/orientation/browser regression
- **Known limitations / deferred work:** Event-density/coincident-event exploration; event-to-event arcs deferred
- **Historical context and related planning documents:** [Timeline II horizontal-scroll risk plan](../planning_documents/PERIDOT_TIMELINE_II_HORIZONTAL_SCROLL_LAYOUT_RISK_20261111.md) (named in current guide); Changelog `f5791f1`

#### Categories: source-backed configuration


The sole active dedicated Timeline is `src/PeridotTimelineII.jsx`. Its **Timeline / Categories** tabs preserve the independently navigable chronological view and researcher-controlled category configuration. The Categories editor now has five horizontally arranged regions: **Source columns**, **Values to track**, **Priority**, **Color**, and **Icons**. The earlier three-column Source/Values/Appearance layout is historical. Eligible category sources include mapped Evidence, participant/place/relationship attributes, and original uploaded fields where the existing mapped record can support a defensible event association; availability does not itself establish an event relationship. The UI presents the original uploaded column header as its main label while retaining sheet, mapping role and source provenance separately. Identity must not collapse same-named columns on different sheets or in distinct mapped roles.

**Core modules and preservation rules:** `peridotTimelineCategorySourceInventory.js` discovers available values and available provenance without assigning memberships; `peridotTimelineCategoryAssociationResolver.js` evaluates researcher-specified **record**, **subject**, or **temporal assertion** association and rejects unsupported joins; `peridotTimelineGeneralizedCategories.js` integrates the discovered sources into the existing Timeline categories; `peridotTimelineCategoryConfiguration.js` owns session-level selection, display names, independent colors and symbols; `PeridotTimelineCategoryEditor.jsx` renders the editor; `PeridotTimelineCategoryMarks.jsx` renders the marks and shared previews; `PeridotTimelineCategorySymbols.jsx` supplies the curated symbols. Record-scoped mapping can legitimately apply a letter's sending location to its record-derived date event; subject-specific and assertion-specific assignments must remain narrower when chosen. A category must never silently modify the original mapped data, search filters or historical event identity. Unselected fields do not become categories automatically, and the researcher can choose all values or a subset.

**Presentation:** the category palette includes 42 preset colors in ordered swatches plus a custom hex color; a **100-icon** locally bundled Tabler Icons selection is offered with symbols optional. Three user-facing modes are **Colors only**, **Colors and symbols** (default for new configurations), and **Expanded labels**. Plural category membership is supported; point events can show divided colored discs and a count for additional memberships; periods are striped. Uncategorized events remain visible with a neutral charcoal mark. Category chips/large previews show the actual colored symbol rather than a color dot. Category appearance and selection persist across navigation within the dataset session but are not saved across browser sessions or embedded in the original upload.

**Tabler licensing and asset organization:** dependency `@tabler/icons-react@3.50.0`; Tabler Icons are MIT-licensed. The full third-party notice belongs at `public/TABLER_ICONS_LICENSE.md` (included in Vite's built public files), while the curated icon list belongs at `assets/TIMELINE_CATEGORY_ICON_INVENTORY.csv` (repository research/design resource, not a runtime fetch or an additional mandatory core document). Retain attribution in distributed output, confirm the license is present in `dist/` after production builds, and review the installed exports and license when updating the icon package. Original Peridot symbol artwork is retained only where required for compatibility.

**Verification:** focused Node tests `peridotTimelineCategoryConfiguration.test.mjs`, `peridotTimelineCategorySourceInventory.test.mjs`, `peridotTimelineCategoryAssociationResolver.test.mjs`, and `peridotTimelineGeneralizedCategories.test.mjs` test configuration and association contracts. The researcher reported build/test success and visually accepted correspondence sending-place, Family Tree person attribute, and Cardinals mapping cases. These are meaningful representative checks, not every workbook configuration. Recheck field identity/provenance, record versus subject versus assertion scope, zero and multiple memberships, category color persistence, Timeline orientation/zoom/playback, Inspector selection, and display mode after changes.

#### Grouped swimlanes and editor sizing


**Researcher-owned interpretive layout:** `PeridotTimelineII.jsx` retains the **Chronological / Grouped** comparison. Grouped is a researcher-directed alternative use of the orthogonal axis, not a different chronology or a changed source mapping. `peridotTimelineGroupedLanes.js` derives category-based swimlane geometry and a light congestion estimate from current visible events. It preserves exact Gregorian temporal coordinates; adaptive heights update after navigation settles (initial implementation approximately 210 ms), rather than continually reassigning lanes during pan/zoom. Category lane backgrounds are attenuated versions of category colors, leaving node colors/symbols prominent. Every starred lane remains present, becoming very narrow when no corresponding events are visible.

**Eligibility versus event assignment:** Researchers star (filled star) or unstar (outline) individual tracked category values in the Priority column; starred categories alone are eligible to define category swimlanes. This is not the same as assigning every event exclusively to the category. Events may have arbitrarily many source-supported secondary category memberships for multicolor/symbol display, but occupy only **one** swimlane. A source-backed eligible membership and current priority order determine the default assignment when several starred memberships apply; explicit event-level primary overrides remain a distinct underlying capability and must not fabricate memberships. Events with no starred membership use a separate **No priority category** lane, not a fabricated category or invisibility state. The category system is session-only pending a separately designed portable project format. Check candidate/selected memberships across Correspondence, Family Tree, and Cardinals, including the interpretive contrast between creator-Popes and conclaves.

**Five-column Categories editor and scroll ownership:** `PeridotTimelineCategoryEditor.jsx` owns a full-height, horizontally oversized Source columns / Values to track / Priority / Color / Icons track with its own **native horizontal scrollbar and draggable thumb**; individual columns may scroll vertically. Priority is intentionally a simple star/unstar list with Clear all, not the superseded dimension dropdown, ranked-event form or custom horizontal slider. The old three-column description remains relevant only as history. The scroll viewport must have `scrollWidth > clientWidth` at narrower application widths. A visible clipped fifth column with `clientWidth = scrollWidth` on `.peridot-category-horizontal-scroll` means the scrollbar owns no actual overflow, even if its track is painted.

**Shared-stage sizing risk:** The final browser-accepted correction resides in **`PeridotVisualizationsWorkspace.jsx`**. Its `.peridot-visualization-stage-transition-shell` and `.peridot-visualization-stage-transition-content` flex wrappers gain `min-w-0` **conditionally when `selectedTool === VISUALIZATION_TOOLS.TIMELINE_II`**. Without both constraints, the intermediate editor stage can retain the approximately 1,770 px intrinsic track width and be clipped by a narrower ancestor, creating a thumb-less scrollbar despite visible overflow. Do not broaden this conditional or replace the shared file wholesale: Map, Network, Charts I and uncommitted Charts II share the stage infrastructure, and future structural changes could alter their layout, transitions, or preview sizing. The original diagnostic, rollback boundaries, and checks are retained in [Timeline II horizontal-scroll risk plan](../planning_documents/PERIDOT_TIMELINE_II_HORIZONTAL_SCROLL_LAYOUT_RISK_20261111.md) (browser-accepted status).

**Minimum regression:** resize browser and dock DevTools; confirm native thumb can reveal all Icons, with `el.scrollWidth - el.clientWidth > 0` whenever the five columns exceed viewport width. Verify independent vertical column scrolling, no page-wide horizontal overflow, category priority/star changes, single-lane assignment and No priority fallback, color/symbol rendering, Chronological/Grouped switching, horizontal/vertical chronology, wheel/pan/playback/Inspector state, and timed lane stability. Switch Timeline → Map/Network/Charts I/Charts II and check stage transitions and sizing; re-run `peridotTimelineCategoryConfiguration.test.mjs`, `peridotTimelineGroupedLanes.test.mjs`, and a production build. Browser confirmation of scrollbar success and the local focused test history do not establish exhaustive automated/cross-browser acceptance.

#### Timeline and chronology detailed contracts


###### Current Timeline and shared chronology architecture (chronology through `4fca872`; categories through `9c2bb0e`; earlier history retained below)

**One active Timeline visualization, one shared chronology presentation.** Commit `688bc17` retired Timeline I from public visualization navigation and promoted the Timeline II implementation as the sole **Timeline** tab. `PeridotTimelineII.jsx` is the active dedicated Timeline renderer, using calendar-day coordinates, assertion-level dates and periods, stable orthogonal-axis event packing, and horizontal/vertical layouts. Older `PeridotTimelineWorkspace.jsx` / `peridotTimelineWorkspaceModel.js` discussion below is retained as historical/compatibility information; do not confuse legacy card UI or its mapped relationship presentation with features already implemented in the current Timeline. Verify any retained model helpers against current imports before retiring them.

**Single visual-component authority:** `src/PeridotChronologyDock.jsx` owns the approved ruler/clamp, playback transport, and tooltip markup and orientation presentation. `src/PeridotTimelineII.jsx` supplies its calendar-day window, playhead and pointer/controller behavior. `src/PeridotSharedChronologyAdapter.jsx` converts the existing `App.jsx` timeline index/range and assertion-level playback props into the same dock presentation; `src/PeridotVisualizationsWorkspace.jsx` mounts the adapter for Map, Network, and Charts, while Timeline II renders the shared dock through its own component. Do not recreate the approved dock in another module: the rejected v34 `PeridotUnifiedChronologyDock.jsx` was a separate lookalike, not the accepted architecture. The old `timelinePlaybackComponents.jsx` remains a historical/compatibility reference, not the active cross-workspace dock.

**Shared chronology domain with distinct controller responsibilities (current at `4fca872`).** The current Timeline and the Map/Network/Charts adapter navigate a consistent continuous Gregorian-day domain with shared ruler geometry. `peridotChronologyWindow.js` calculates padded bounds/ticks and `peridotChronologyNavigationBridge.js` coordinates App-owned navigation and retained indexed playback compatibility where required; `timelinePlaybackHelpers.js` applies canonical calendar-window intersection and playback semantics to dated evidence. `App.jsx` owns independent persistent visualization sessions and Search-filter/playback integration. `rangeStart`/`rangeEnd`, `timelineMonths`, and `playbackIndex` may still exist as internal compatibility state; **they are not authority for snapping a continuous researcher-selected window to the nearest populated year**. User-facing playback types remain **Cumulative** and **Concurrent** (`co-current` compatibility value). Respect multiple/partial temporal assertions, period intersections, genuinely undated evidence, and separate applied Search filters.

**Dataset extent and accepted display:** Use the complete unfiltered source-positionable temporal assertions (including period endpoints), calculate 10% additional chronological span on each side, and initialize/reset to that entire padded range. Do not recompute the range from Search results, temporal-role selection, active playback, or chart-local filters. The selected teal range has independent handles; actual dataset endpoints use **gold diamond markers, a fine dashed guide, and a “Data extent” label** (approved Option C), not the superseded red line. The source-extent indicators remain tied to historical data endpoints when the selected window moves. Ruler ticks, corresponding dates and boundaries must match across visualizations. Each visualization's window/playback session persists independently when navigating away and back; dataset replacement resets sessions.

**Deferred-mount width lifecycle:** the adapter may initially receive an empty `timelineMonths` array and render no ruler. Its width measurement must rerun when entries first become available; otherwise a 1,200px fallback can persist in an approximately 1,886px container and appear fixed only after visiting Timeline II and remounting. The user confirmed the deferred-mount correction at v43. This is a concrete fragile zone: test Map first after choosing a dataset, then Network/Timeline/Charts before and after visiting Timeline II, checking full ruler width, dates, clamping, pan, playback and resizing. Temporary console diagnostics must not be reintroduced.

**Map chronology-performance preservation:** Map scrubbing became responsive after reuse of the D3 geographic projection within a graph build and removal of unused country containment computations (`activeCountryIds`/`geoContains`) that reran as nodes changed. Preserve this by testing continuous playback in Map against Network; do not restore dead country containment calculations or recalculate a geographic projection for each endpoint. Initial Map fit must wait for the applicable temporal-role/range readiness without recentering on every scrub, pan, or zoom.

**Vertical Timeline II geometry:** before `ddee7e2`, the ruler and event positions were both based on an axis length shortened by the left playback controls' height. The v44 control-compaction attempt recovered only limited room. The accepted v45 geometry instead places the ruler and event positions along the full plot length with a narrow navigator beside the compact playback controls in the left rail. Preserve identical date-to-pixel mapping for ruler and marks, full-height usable area, lane placement and clipping, and separate horizontal behavior. Test date ticks, first/last events, periods, zoom clamps, orientation switching, and dense datasets; do not shrink controls as a substitute for auditing geometry.

**Historical verification limits:** the earlier v45 vertical-layout pass was browser-reviewed at `ddee7e2` without a separately observed post-v45 build. **Current chronology QA:** the researcher explicitly accepted consistent ruler ticks, full-dataset padded-domain behavior, calendar filtering, and the Option C extent indicators before confirming push `4fca872`. Four focused Node tests cover calendar windows, navigation compatibility, ruler parity and calendar filtering. These do not replace end-to-end browser, accessibility, production build or deployed-site regression checks.

**Active Timeline follow-up and fragile zone:** Grouped researcher-starred category swimlanes are implemented; next examine density and coincident-event readability. Event-to-event relationship arcs remain deliberately deferred pending defensible explicit event relationships. Preserve exact temporal positions, stable packing and performance, explicit mapped relationship endpoints, Search scope, Inspector linkage, orientation/ruler alignment and period-duration distinction. A 12-color/12-symbol category presentation, optional Grouped swimlanes with primary-category ordering, density histogram, adaptive simultaneous-event clustering and uncertainty display remain approved/planned directions but are not certified fully implemented by the latest chronology pass. The old Timeline I connection code is not proof of present Timeline functionality. **Relationship Option C is distinct from dataset-extent Option C.**


Visualizations owns the unified Geographic Map, Force-Directed Network, the sole dedicated Timeline visualization, chart entry points, header presentation, shared chronology dock, and shared Export menu. The dedicated Timeline workspace and the bottom playback control are separate responsibilities. Both consume canonical `temporalAssertions[]`; the former `parsedDate` fallback has been retired from active source. A record may contribute multiple assertion-level timeline events, and interval filtering uses temporal intersection rather than only an interval start.

The Geographic Map is one projection over generalized entity/place assertions rather than two separate place/person maps. `peridotEntityNetwork.js` resolves researcher-selected anchor roles plus an independent **Most frequent place** rule, deduplicates identical entity/place coordinates, and retains role/provenance information. Relationship-line geography follows the explicit hierarchy **relationship/event geography → selected fallback anchor → no defensible location, no line**. Several source-supported geographic manifestations may exist when several explicit relationship observations support them; Peridot must not generate a Cartesian product across unrelated visible anchors.

Map settings are transactional. Draft changes do not eagerly rebuild the graph; **Apply** commits node-label, anchor, and relationship-line rules together, while **Reset** changes only the draft. Geographic and Force viewport state are remembered independently. Fit/recenter occurs for initial/new data or an explicit user action rather than every settings or playback change. A geographic edge may render only when both exact endpoint node instances are visible under the applied settings.

Playback highlighting is generalized at `ddc0aca`. The active playback record set is matched against provenance already stored on rendered graph edges; every rendered edge supported by the active record(s) can highlight, and highlighted endpoint node IDs come from those actual rendered edges. This supports multipart relationships without inventing links among co-participants. Co-current playback highlights the full set of relationships active at the current moment; cumulative playback emphasizes the newly reached record. Relationship-free temporal assertions can still highlight relevant visible entity nodes. Cluster display can inherit active-member highlighting. The implementation deliberately does **not** contain the later experimental pulse/tween/geometry-animation systems: those prototypes were rolled back before `ddc0aca`.

Performance work through `c8a7c46` deliberately separates transient interaction from expensive semantic/geometry derivation. Pointer drag applies an imperative transient SVG transform and commits durable viewport state on release. Wheel zoom uses a native non-passive wheel listener, applies transient zoom immediately, and settles durable viewport state after interaction; clustering/label derivation therefore does not rerun for every wheel event. Force playback derives a stable full-scope Force graph and filters its rendered provenance/degree/radius against the current playback scope instead of calling `buildPersonGraph()` and rerunning synchronous force ticks for every playback frame. The analogous Geographic preload experiment did not materially improve performance and was excluded from the clean candidate.

**Historical Timeline I contract (retained for provenance; not a current Timeline II feature inventory):** The **original dedicated Timeline workspace** was added in the `d82406e` → `a32ef05` sequence. `peridotTimelineWorkspaceModel.js` projects the already-applied Search scope into assertion-level Timeline events while preserving source record identity, temporal form/precision/uncertainty metadata, record-versus-participant temporal subject, and plural Evidence-derived category membership. Category inventories are evidence-driven; category visibility is OR-based across enabled memberships rather than requiring one exclusive category per event.

Timeline workspace presentation is owned by `PeridotTimelineWorkspace.jsx`. Horizontal is the default orientation and places earliest → latest left-to-right. Vertical places earliest → latest bottom-to-top. Both orientations keep chronology exact on the temporal axis and use the secondary axis for layout. The viewport is the same bounded visualization-stage concept as Map/Network: overflow is navigated inside the stage rather than by expanding the page. Scrollbars remain available, click-and-drag pans the viewport, mouse wheel zooms smoothly, and +/- controls provide explicit alternatives. Scroll extent is padded so the earliest/latest event can be isolated at the corresponding edge rather than being permanently pinned against neighboring content.

The Timeline axis is zoom-adaptive rather than year-only. It moves among year/month/day granularity as space permits and performs collision suppression after tick placement so adjacent boundary labels do not overwrite one another. Zoom is continuous rather than restricted to arbitrary percentage stops; the displayed zoom value is descriptive, not a finite preset scale.

Timeline category controls derive candidate category fields from mapped Evidence. Users opt fields in, then toggle their values. Events may carry several categories simultaneously, and visible membership composes plurally. Markers can be encoded by color or shape so category differentiation does not rely on color alone. The Categories panel has fixed dimensions, closes on outside click, and is grouped with orientation/zoom controls rather than resizing with its contents.

Timeline event selection opens the shared Inspector behavior used by other visualizations. Compact selection is event-oriented, while **Open full dossier** bridges back to the complete source record/subject evidence system. Search/Explore remains authoritative for the applied event scope, so committed queries constrain the Timeline in the same way they constrain the other visualizations.

Mapped Timeline connections are conservative. They are derived only from explicit mapped relationships; shared categories, shared participants in unrelated records, or chronological proximity do not create edges. Relationship records that are already represented as their own temporal event are not reinterpreted as arbitrary event-to-event lines. Structural relationship projection resolves two distinct relationship endpoint subjects to representative visible events, preferring a subject's lifespan where available before fallback temporal assertions. The current `a32ef05` model adds subject-strict endpoint checks, a continuous relationship/collision-aware secondary-axis layout, and a visually distinct interval-duration treatment. **Relationship-line routing/presentation remains unfinished active work**: current geometry is a foundation, not a final accepted ClioVis-level connection treatment.

The shared bottom Timeline/playback control remains unchanged in role. It derives available **Time types** from mapped temporal roles and keeps controls visible even when only one role is available. Playback supports **Cumulative Events** and **Co-current Events**. Cumulative mode retains records after their date or period begins/occurs; co-current mode recalculates visibility at the current moment, removes ended intervals, bounds point dates to their temporal unit, and inserts interval-end checkpoints so disappearing records are observable. A co-current moment with zero active rows is a valid empty visualization state and must not cause capability routing to replace the workspace with an unavailable-state screen. The bottom control combines range-clamping handles with a draggable playback playhead; local preview state is used during drag and the canonical playback index is committed on release.

<a id="6-analytics-contract"></a>

<a id="analytics"></a>


[Back to Quick Navigation](#quick-navigation) · [Level 1 overview](#level-1--architecture-at-a-glance) · [Module ownership register](#module-ownership-register)

### Contract: Charts

<a id="contract-charts"></a>

- **Purpose and scope:** Offers a recommendations-first catalogue, a configurable builder and chart-local analysis and publication exports.
- **Module ownership:** `src/PeridotChartsIIFoundation.jsx`, `src/analyticsChartComponents.jsx`, `src/chartsII*` modules
- **Inputs and data contracts:** Generalized mapped numeric/categorical/temporal data and local filters
- **Outputs and consumers:** Catalogue, Builder, family-specific derivations, adaptive SVG and PNG
- **Behavior and interaction:** 15 chart families, date-axis semantics, mark styling, export annotations
- **Invariants:** Local filters scoped to charts; appearance does not modify analytical values
- **Fragile dependencies:** Chronology drag-release, semantic palette identity, dense labels
- **Verification:** Chart-specific test suite, manual appearance and export regressions
- **Known limitations / deferred work:** Further dense-chart label/accessibility QA may be useful
- **Historical context and related planning documents:** Changelog Charts II completion milestones; archived Charts I in source history

#### Charts II: sole current Charts workspace


##### Current Charts workspace: Charts II (authoritative at `e96c375`)

The public **Charts** tab owns the sole chart workspace. At `8baa733`, Charts I's live interface and `src/AnalyticsPanel.jsx` were retired; `PeridotVisualizationsWorkspace.jsx` routes **Charts** to the Charts II Catalogue/Builder. Do not reintroduce the legacy parallel Charts / Charts II tabs or resurrect `AnalyticsPanel.jsx` from this document's historical milestone sections. The retained `AnalyticsPanel.css` is **active shared styling** for the modern Builder, despite its historical filename.

The **15 catalogue families** are Bar / Column, Grouped Bar, Stacked Bar (standard and 100%), Line / Multi-Line, Area, Stacked Area, Pie / Donut, Sunburst, Histogram, Heatmap, Scatter / Bubble, Box Plot, Dot Plot, Slope Chart, and Treemap. The recommendations-first Catalogue provides advisory **Likely fit** and **May not work well** flags, leaving uncertain cases unbadged and every family selectable. Suitability profiling uses usable categorical/numerical/temporal observations and paired fields where appropriate. Assigned source/target/point latitude/longitude coordinates remain manually selectable but must not count as substantive numerical evidence for chart recommendations.

**Scope and derivation:** `App.jsx` and `PeridotVisualizationsWorkspace.jsx` supply the stable Explore/availability scope for variable inventories and recommendations and the chronology/playback-derived chart scope for render derivations. Chart-local categorical (OR within rule) and inclusive numerical-range rules (AND between rules) are applied **only to chart input**; they must not alter the uploaded dataset, Explore results, shared Search filters, or other visualization sessions. Single-series Line/Area modes allow one category per local categorical rule; multi-series modes permit plural selections. Inventory caching by source-row identity prevents repeated expensive field scans. Valid choices must remain stable when filters or chronology change. Genuinely undated records and partial-precision assertions follow the canonical shared chronology and each chart's explicit date semantics; do not invent precise dates, treat blanks as measured zeroes, or silently conflate date-axis navigation with record filtering. Chronology drag-release freezes expensive chart derivations (including Scatter/Bubble and Slope) until pointer release.

**Renderer and interaction:** `PeridotChartsIIFoundation.jsx` owns the Builder configuration, selection persistence, Filters/Appearance integration, and Charts-specific export action; `analyticsChartComponents.jsx` owns shared SVG chart frames and the renderers, with the chart-specific `chartsII*Data.js` modules holding derivations. Treemap retains source-backed category members in expandable **Other** groups, allows semantic drill-down via breadcrumbs, and preserves stable subgroup identity across changing chronology. Box Plot computes quartiles and outlier definitions independently of its full/focused vertical-scale presentation. Stacked Bar's 100% mode is a percentage rendering of additive, nonnegative totals, retaining absolute values and handling zero totals explicitly. Temporal series use precision-aware interval derivation and gap semantics, including wide-format multiple numerical source columns.

**Appearance:** `PeridotChartsIIAppearance.jsx` and `chartsIIAppearance.js` manage chart-local category/series color overrides keyed to semantic labels. `peridotSharedCategoryColors.js` is the shared source of the Timeline II / Charts color swatches; `PeridotTimelineCategoryEditor.jsx` consumes the same palette. `PeridotChartsIIStyle.jsx` / `chartsIIStyle.js` provide family-specific mark styling, and `PeridotChartsIIPresentation.jsx` / `chartsIIPresentation.js` provide adaptive labels, titles, legend/summary visibility, text density and format. Presentation options must never modify underlying analytical values. The resizable Builder divider applies layout width on release rather than triggering data derivation continuously. The accepted default appearance remains authoritative until changed; color overrides remain stable across filtering/reordering and PNG output.

**Exports:** `chartsIIExport.js` and `exportHelpers.js` export the **live Charts II SVG** to PNG, including current marks, colors, visible titles/axes and summary if enabled. A separate export panel permits optional publication-specific title, axis annotations, multiline footnotes and Peridot provenance (record scopes, chronology interpretation and chart-local filter exclusions). The publication annotation layer is independent of Builder data/appearance configuration. Preserve the export's white background, typography, legible margins, clipping safeguards, and correct distinction between Scatter's Date-axis viewport and actual chart-record filtering. Legacy Charts I registration through the global Visualizations Export menu is removed; Map/Network export pathways remain separate.

**Chart-to-Inspector provenance (accepted through `01b03bc`):** The chart families retain calculated mark values together with lightweight contributing-record references so the renderer and compact Inspector consume a single analytical result. Categorical, temporal, numerical, distribution, hierarchical and paired-period marks have distinct observation/record semantics. This preservation adds metadata to the derivations without changing their documented aggregation formulas; it must remain aligned with current filtering and chronology eligibility. The Inspector's search is not restricted to the first displayed records and should prefer researcher-mapped record identifiers while retaining internal Peridot IDs for navigation. See [the Inspector contract](#contract-inspector) for detailed selection/invalidation, click-versus-drill, and test boundaries.

**Maintenance/regression:** Run `chartsIIRegression.test.mjs`, `chartsIIRecommendations.test.mjs`, `chartsIILocalFilters.test.mjs`, `chartsIIExport.test.mjs`, `chartsIIAppearance.test.mjs`, `chartsIIStyle.test.mjs`, `chartsIIPresentation.test.mjs`, `chartsIIAdaptivePresentation.test.mjs`, and `chartsRetirement.test.mjs`, together with relevant chronology tests, when editing these contracts. Verify browser behavior for all 15 families, chronology drag-release, valid-state persistence, filtering, category colors, adaptive controls, resized sidebar, and PNG output. The pre-existing Timeline grouped-lanes test wording mismatch (`Uncategorized` versus `No priority category`) is separate from Charts acceptance and should be addressed in a dedicated Timeline pass. Automated tests do not guarantee label-collision-free SVGs or deployed-site performance; preserve the user's visually accepted behavior and inspect dense charts manually.

<a id="5-advanced-search--explore-contract"></a>


[Back to Quick Navigation](#quick-navigation) · [Level 1 overview](#level-1--architecture-at-a-glance) · [Module ownership register](#module-ownership-register)

### Contract: Explore and Search

<a id="contract-explore-and-search"></a>

- **Purpose and scope:** Builds and applies global research queries and provides browse/refine/results interfaces.
- **Module ownership:** `src/PeridotSearchWorkspace.jsx` and Search helpers
- **Inputs and data contracts:** Loaded data, canonical place/Evidence and applied Search state
- **Outputs and consumers:** Browse, Advanced Query, Refine and Inspector handoff
- **Behavior and interaction:** Structured criteria, count conditions, draft/Apply/Clear and results
- **Invariants:** Never treat draft controls as committed applied scope
- **Fragile dependencies:** Inspector overlay, count-condition counts and generalized text corpus
- **Verification:** Search suggestions, pagination, scope, Refine, linked Inspector
- **Known limitations / deferred work:** Any record text still lacks guaranteed complete generalized semantic coverage
- **Historical context and related planning documents:** Changelog generalized Search passes

#### Explore contract and regression details


Explore is the owner of global **applied/filtered data** and now presents three local modes: **Browse**, **Advanced Query**, and **Refine**. It retains the explicit draft/apply model: typing, suggestions, Browse selections, facets, and structured criteria change draft state until **Apply Filters** commits the scope.

##### Responsibilities

- **Browse** indexes the loaded dataset. Generalized Places and canonical Evidence are included; explicit Routes remain separate and appear only when meaningful route data exists.
- **Advanced Query** contains Build Search plus the current generalized result set. Build Search supports keyword, person/entity, place, explicit route-place, entity-relationship, date, capability, and structured criteria inputs; Results remain neutral Date / People or entities / Places rows with pagination, mapped-information drilldown, and Inspector handoff.
- Structured criteria support Required / Any-of / Excluded groups plus optional **count conditions attached to a specific criterion**. Count conditions use plain language such as **This person has at least N connected entities**, **This place has at least N connected places**, or **People in these records have at least N connected entities**.
- Count-condition reference counts are derived from the loaded/mapped Search dataset; the primary criterion determines which records are returned. Place-to-place connection counts use explicit directed place connections and never infer a route merely because several mapped places occur in one record.
- **Refine** exposes applied-result facets, Inspector handoff guidance, and dataset capability review. Generalized place and canonical Evidence facets fill draft controls for later Apply rather than silently changing scope.
- Results and Capabilities remain behaviors/content areas but are no longer independent top-level Explore modes.
- Inspect opens the full Inspector above the current Explore state, so closing it returns the researcher to the same search context.
- The legacy global minimum correspondence/connection weight is retired. Do not restore it as a universal dataset filter; the generalized replacement is criterion-attached count conditions.

##### Scope and regression contract

Search is a fragile active-data boundary. Browse intentionally uses loaded data; Results and Refine use applied/filtered data and remain stable while playback advances. Entity/place Inspector dossiers opened from Search use the same applied/filtered scope rather than playback visibility.

After changes, verify draft suggestions, Apply, Clear, Boolean criteria, attached count conditions, generalized Place behavior, canonical Evidence behavior, Browse/facet behavior, Results pagination, Inspector return-to-state behavior, and interaction with Timeline, Analytics, and Export.

Known bounded follow-up: **Any record text** does not yet guarantee that every generalized mapped semantic value is indexed. Explicit fielded criteria such as Place correctly search generalized assertions.


##### Preserved detailed Search regression expectations

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


[Back to Quick Navigation](#quick-navigation) · [Level 1 overview](#level-1--architecture-at-a-glance) · [Module ownership register](#module-ownership-register)

### Contract: Inspector

<a id="contract-inspector"></a>

- **Purpose and scope:** Presents compact selection summaries and deep evidence dossiers with linked-history navigation.
- **Module ownership:** `src/InspectorPanel.jsx`, `src/InspectorBodyRouter.jsx`, `src/App.jsx`
- **Inputs and data contracts:** Canonical selected records, subjects, entities, places, temporal assertions, relationships and chart-mark analytical provenance
- **Outputs and consumers:** Compact Inspector, full dossiers and linked-history navigation
- **Behavior and interaction:** Compact Overview/Data/Next steps, persistent expanded disclosures, category legend, contributing-record search, full dossier and multi-step Back
- **Invariants:** Subject-aware Evidence and canonical entity identity must survive navigation
- **Fragile dependencies:** Shared shell and App-controlled selection history
- **Verification:** Compact/Expand/Back and multi-step navigation regressions
- **Known limitations / deferred work:** Map/Network edge click reliability audit; cross-visualization regression; contextual settings shortcut; expanded dossier and Explore redesign
- **Historical context and related planning documents:** `planning_documents/PERIDOT_INSPECTOR_WORKSPACE_CONTRACT.md` (recorded in original guide)

#### Current compact selection-evidence hierarchy (accepted through `01b03bc`)

The compact Inspector is a resizable, left-docked panel with the persistent navigation **What am I seeing? / What data is being visualized? / Where can I go next?** (Overview, Data and Next steps). A selected mark must be described as a representation, its supporting mapped assertions and source records identified separately, and broader linked evidence presented without misrepresenting it as support for that particular mark. Expandable long evidence and mapping explanations remain open on pointer exit; a different selected mark may start with its own compact disclosure state. Compact and full Inspector navigation must preserve the accepted shared selection/history contract.

**Map and Network:** Nodes and clusters use the shared `peridotInspectorSelectionEvidence.js` contract and compact grouped-evidence presentation. Source and target roles must only appear where mapped semantics warrant them; counts of relationship occurrences and distinct contributing records are not interchangeable. `InspectorEdgeView.jsx` exists, but reliable edge/connection hit testing, selection, and evidence accuracy across Geographic Map and Force Network are the **next targeted audit**, not yet accepted through this milestone.

**Timeline:** Clicking an actual event/period mark opens the Inspector; interacting with the Categories editor, including color/symbol/priority/label changes, does not create new selections. The selected mark's date placement, partial/open precision, and point-versus-duration meaning follow mapped temporal assertions, not invented calendar certainty. The category mini-legend is based on the **active rendered memberships, labels, colors and optional symbols**, not all mapped source fields. Category changes may refresh an existing selection's presentation without reopening it. Source provenance and broader record fields are deduplicated by field identity rather than matching display strings.

**Charts II:** `analyticsChartComponents.jsx` dispatches supported chart-mark selections through `PeridotChartsIIFoundation.jsx` and `PeridotVisualizationsWorkspace.jsx` to the shared `App.jsx` Inspector bridge. The analytical results carry their contributing source-row references **as calculated**, so the Inspector does not independently recompute counts, averages, comparisons, temporal bins, frequencies, or distributions. `InspectorChartMarkView.jsx` displays the analytical result, measure/series/category, number of contributing records, and a searchable incremental record list. Display IDs prefer generalized researcher-mapped Unique IDs (including composite mappings), then Peridot's generated identity; internal record links remain stable and distinct from display labels. First 25 records are shown, followed by 50 per request; all contributors remain accessible. Missing values must not be rendered as numerical zero, and record counts must not be confused with numerical measurements or observation counts. Returning to the Charts Catalogue or leaving the Builder closes the chart Inspector; changed calculations invalidate the old chart mark. Treemap primary click preserves drill-down; Shift+click inspects expandable tiles, while terminal tiles can be inspected directly. Preserve semantics for Box Plot quartiles/outliers, Slope endpoint-versus-comparison, hierarchical Other groups, Scatter's measured coordinates, histogram bin frequencies, and partial/undated temporal data.

**Acceptance and limitations:** Haley browser-accepted the compact Map/Network and Timeline improvements, and the four Charts Inspector passes through 2026-11-25. The last source-level Charts test report was 202/203 passing, with the previously observed unrelated grouped-lane label test mismatch; an integrated production build was not verified in that pass. This acceptance does **not** establish all edge clicks, all chart accessibility interactions, or deployed-site performance.

**Targeted tests:** `peridotInspectorSelectionEvidence.test.mjs`, `peridotInspectorCompactGrouping.test.mjs`, `peridotInspectorTimelineCompact.test.mjs`, `peridotInspectorTimelinePresentation.test.mjs`, `peridotTimelineInspectorPresentationUpdate.test.mjs`, `chartsIIInspectorProvenance.test.mjs`, `chartsIIInspectorPass2Provenance.test.mjs`, `chartsIIInspectorPass3Provenance.test.mjs`, `chartsIIInspectorIntegrationRegression.test.mjs`, `peridotChartContributingRecordLabel.test.mjs`, `peridotChartContributionList.test.mjs`, and `peridotChartInspectorFormatting.test.mjs`. Check the actual source/test tree when making further changes.

#### Inspector evidence and history contract


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


#### Additional source-preserved architectural context

Inspector has likewise crossed the generalized semantic boundary. Compact and full person/entity/place dossiers derive connected people, participant-attached places, temporal assertions, semantic relationships, canonical display labels, and subject-aware mapped Evidence from generalized structures rather than assuming every record has one Source and one Target. Subject attribution is authoritative and multiplicative: a mapping can describe the record, several participants, or both, while normalized assertions remain atomic. The same source place can therefore represent a child's birthplace and the mother's childbirth location without attaching both meanings to both people. Participant-attributed Evidence is projected from canonical mapped-Evidence assertions; record-only Evidence does not leak onto connected entities.


[Back to Quick Navigation](#quick-navigation) · [Level 1 overview](#level-1--architecture-at-a-glance) · [Module ownership register](#module-ownership-register)

### Contract: Exports

<a id="contract-exports"></a>

- **Purpose and scope:** Produces explicitly scoped map, network, chart and tabular outputs with attribution.
- **Module ownership:** `src/exportHelpers.js`, `src/chartsIIExport.js`, Visualize and Charts controls
- **Inputs and data contracts:** Current graph/selected chart output and provenance
- **Outputs and consumers:** Map PNG/SVG, charts PNG, tabular exports
- **Behavior and interaction:** Presentation annotations distinct from data and rendered provenance
- **Invariants:** Required CARTO credits and embedded raster tiles; visible chart export
- **Fragile dependencies:** Cross-origin raster and clipping/metadata errors
- **Verification:** Map PNG/SVG, chart PNG and scoped CSV checks
- **Known limitations / deferred work:** Not applicable
- **Historical context and related planning documents:** Changelog map export and Charts II PNG milestones

#### Map, network and Charts export contract


Export is not a top-level workspace. Map/network SVG, PNG, nodes CSV, and edges/routes CSV remain on the shared Visualizations header; **Charts II PNG export is owned by its Builder's Export PNG action**, not the retired Charts I header export registration. Map PNG default output is map-only with optional title/metadata annotations, but **geographic CARTO exports always require legible Peridot and CARTO/OpenStreetMap attribution**; embedded raster tile imagery is mandatory for self-contained PNG/SVG output.

<a id="8-theme-and-stylesheet-architecture"></a>


[Back to Quick Navigation](#quick-navigation) · [Level 1 overview](#level-1--architecture-at-a-glance) · [Module ownership register](#module-ownership-register)

### Contract: Themes, editorial presentation and loading

<a id="contract-themes-editorial-presentation-and-loading"></a>

- **Purpose and scope:** Maintains semantic styling, editorial pages, responsive constraints and persistent worker-backed transitions.
- **Module ownership:** `src/peridotTheme.js`, relevant workspace CSS, loading renderer and worker
- **Inputs and data contracts:** Theme roles, assets, browser viewport and worker state
- **Outputs and consumers:** Semantic styles, editorial workspaces, loader transition and rendering
- **Behavior and interaction:** Staged entrance and reduced motion, static boot still, persistent worker
- **Invariants:** Theme-only changes must not corrupt chart marks, Canvas remains React-owned
- **Fragile dependencies:** CSS cascade, Vite asset bundling, renderer/frame handoff
- **Verification:** Responsive/browser/worker fallback and asset attribution checks
- **Known limitations / deferred work:** Full deployed and licensing coverage remains separately unverified
- **Historical context and related planning documents:** Peridot Editorial Interface Style Guide (title supplied by researcher; exact path/content not verified in provided materials); Changelog editorial milestones

#### Theme and stylesheet architecture


##### Semantic theme ownership

`peridotTheme.js` is the semantic theme control surface. New color work should extend theme roles rather than scatter component constants. `peridotThemeRoleMetadata.js` supplies human-facing role descriptions; `peridotColorPalette.js` remains a legacy compatibility adapter. Chart-targeted palette imports may override `analytics.series` without recoloring unrelated chrome.

##### Stylesheet cascade contract

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
| `AnalyticsPanel.css` | active Charts II Builder and renderer chrome (historical filename retained) | controls, dropdown layering, reduced motion | chart switch, menus, export |
| `PeridotSearchWorkspace.css` | Explore workspace | three-mode local navigation, query/facet/result layout, scroll containment | Browse/Advanced Query/Refine switching; expanded criteria/facets/results |
| `PeridotColumnMappingModal.css` | full-page role-mapping workspace (historical filename) | mapping header/section rail, page containment, step transitions, footer actions | table/workbook mapping flow; direct section navigation; Cancel/Back/Next |
| `PeridotLearnMoreWorkspace.css` | About reading surface | local About navigation, title scale, portrait/text flow, page scrolling | About Peridot, Creator, AI Disclosure, Open Source, Feedback |
| `PeridotFeedbackForm.css` | Feedback form in inline and compatibility-modal modes | form layout, inline embedding, compatibility overlay behavior | About Feedback page; modal compatibility path |

**Current editorial styling layers (verified through the accepted homepage replacement and tracked development artifacts):** `src/styles/workspaces/home.css` owns the Home composition; `src/styles/components/buttons.css` and `src/styles/components/panels.css` provide shared component styling; `src/styles/workspaces/data.css` owns Data-specific styling. The accepted work also includes `planning_documents/Peridot_Sitewide_Button_Inventory_20261017_v1.md` and Visualize component-ownership notes. These are not substitutes for inspecting the actual import graph when touching a style: several historical rules remain in the Home stylesheet, and cascade order still matters. Primary/secondary buttons are shared variants; do not add ad-hoc component-specific button color rules that compete with them.

**Homepage viewport contract:** Peridot's parent app shell already determines the height below the persistent header. The accepted Home uses `height: 100%` of that allocated workspace on desktop and divides the available height between the flexible hero and the bounded lower banner. Do **not** independently subtract an assumed 72-pixel header height or move the entire banner with a transform. When adjusting optical alignment, change only the feature content group, leaving the corner collage offsets and hero/banner seam intact. Check a complete desktop browser viewport for unwanted bottom gaps and scrollbars.

CSS extraction, dead-rule removal, behavior repairs, and visual redesign are distinct bounded passes. The earlier component-style extraction sequence is historical context in the Changelog; the `7df46a8` import restoration is a correction to preserve this functional cascade, not a new architectural direction.

##### Cartographic Editorial ownership and visual-source contracts (current)

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

##### Current Theme and Routing State

The default interface is Peridot-inspired and controlled through semantic roles in `peridotTheme.js`. `peridotThemeRoleMetadata.js` must remain aligned with those roles, while `peridotColorPalette.js` supports older compatibility paths. Chart-targeted palette imports may change chart series only; they must not recolor unrelated interface chrome.

Current routing is centered on the persistent global header: logo/Home, Data, Visualize, Explore, Tutorials, and About. Workspace-local navigation is centered where appropriate; Export stays at the right edge of Visualize local navigation. Themes and Accessibility remains internally routable but hidden. Lightweight page changes do not receive an added transition; the heavier transition is reserved for expensive visualization/workspace changes. The active dataset and accepted workspace state persist across page navigation, and the persistent rail survives only as an Inspector compatibility bridge. For the historical routing sequence, see the Changelog.

#### Editorial gateway asset/transition contract


The public **Visualize**, **Explore**, and **Tutorials** no-dataset/coming-soon surfaces use a coordinated parchment-background gateway with a prominent heading, explanatory text, one **Go to Data** CTA, and an illustrated full-width tear below the action. Visualize and Explore use **No Dataset Active**, while Tutorials uses **Tutorials Coming Soon** and remains a placeholder, **not** an activated guided tutorial. The three tears are `divider_tear_illuminated.png`, `divider_tear_celestial.png`, and `divider_tear_alchemy_mineral.png`; `base_parchment_2.png` is the shared background. These images are visual, not controls; the CTA uses the existing Data navigation and may not silently load a sample or change mapping state.

`PeridotDatasetRequiredWorkspace.jsx` owns the shared Visualize/Explore no-dataset presentation; `PeridotTutorialsWorkspace.jsx` owns the public tutorial placeholder; `PeridotEditorialGatewayAnimation.css` owns their staged editorial entrance effects; `App.jsx` remains the routing/prop-wiring owner. Preserve approximately 24px explanatory text, prominent button sizing, stationary full-width tear, first-entry staggered fade/rise (heading → explanatory text → CTA) followed by a tear fade, replay on relevant page changes, and `prefers-reduced-motion` behavior. The **horizontal outgoing/incoming** cross-route prototype was rolled back after an `App.jsx` reference/scope crash; it is not part of the approved route contract.

**Production assets:** Image references inside React components must use Vite-managed static imports from the existing repository `assets/` directory, as already established on Home, or an equivalently build-verified method. JavaScript literals such as `/assets/foo.png` and manually base-prefixed strings do **not** make Vite emit files from an arbitrary top-level assets directory. Do not move or duplicate these images into `public/assets/` as an undocumented workaround. For changes, verify that the production build emits the required images and that their URLs work from GitHub Pages' `/peridot-humanistic-data/` base. Localhost rendering, Git push, and deployment are separate verification steps.

Minimum regression: visit Visualize, Explore, and Tutorials with no dataset; inspect all parchment and tear imagery at laptop and desktop sizes; verify title, text, and button; navigate to Data; confirm that active-data Visualize/Explore functionality and session state are not affected; switch among the three pages and verify approved animation replay and reduced-motion behavior; run `npm.cmd run build` and inspect `dist/assets` output; verify the actual deployed site after publication. The latest confirmed Git state is `481acd9`; post-`fc42306` deployed gateway rendering remains separately unverified in this documentation pass.

#### About manuscript animations


**Ownership and intent:** `src/PeridotLearnMoreWorkspace.css` owns the CSS-only entrance animations for the five About subpages. `src/PeridotLearnMoreWorkspace.jsx` owns About page structure/local navigation, and `src/PeridotFeedbackForm.jsx` with `src/PeridotFeedbackForm.css` retains Feedback form behavior/layout. The About manuscript choreography is **not** the worker-backed `PeridotTransitionOverlay` used for expensive workspace changes; lightweight About navigation stays immediate and the local header, parchment, and scroll region remain stationary.

**Accepted sequence:** on entering or switching an About subpage, the heading/lede and major reading blocks fade in with subtle upward movement and overlapping staggered timing (typically approximately 1,050 ms per text beat). Creator's portrait and red frame enter as a unit; AI Disclosure panels and Open Source links reveal in reading order. Feedback reveals the selection areas, writing/contact sections, and submission/privacy material as coherent grouped beats, never individual checkboxes. After main content begins its staged entrance, the manuscript corner illustrations make the **final** appearance, with approximately 1,200 ms gentle fade/translation; **both Feedback corners begin simultaneously**, framing that subpage together. Once settled, illustrations are stationary. CSS `prefers-reduced-motion: reduce` must remove the animation and leave all content fully visible.

**Fragile zones and minimum regression:** preserve the approved page-specific corner positions, alpha-shaped content wraps, responsive text separation, Creator portrait frame/float, Feedback two-column layout, live field focus/validation/submission, scroll containment, and persistent About navigation. Check initial entry, all five local tabs, replay after switching away/back, appropriate stagger order and last-corner timing (including simultaneous paired Feedback corners), laptop/desktop viewport widths, keyboard operation while animations play, and reduced-motion preferences. This milestone was user visually accepted in-browser and committed, but no comprehensive automated/accessibility/deployed-site suite is asserted.

#### Loader and first-map-mount contract


**Presentation and ownership:** `index.html` provides the forest preboot background and an embedded still generated from the approved renderer at animation time zero; the outer graduated ring is absent at that instant. `src/main.jsx` coordinates React's initial loading/Suspense boundary, with `src/PeridotBootLoader.css` and `src/PeridotLoadingGem.css` styling the first-load surfaces. The initial still should remain visually aligned with the Canvas until first-frame readiness or normal app mount triggers the handoff. Do not replace this with a simplified SVG or a fully completed-ring frame, and do not impose a mandatory startup delay solely for aesthetics.

**Canvas/worker contract:** `src/PeridotLoadingGem.jsx` owns the React-managed HTML Canvas and the worker/fallback lifecycle. `src/PeridotLoadingGemRenderer.js` owns the shared actual drawing calculations and approved colors/phase behavior; `src/PeridotLoadingGem.worker.js` renders via `OffscreenCanvas` with worker-side scheduling. A Canvas element transferred through `transferControlToOffscreen()` must not be reused for a conflicting main-thread context or imperatively swapped outside React. Respect React Strict Mode's development effect replay, transfer once per Canvas instance, terminate or pause workers intentionally, and handle initialization failures through React-managed fallback. Preserve reduced-motion behavior and the 75%-speed Forest Study, including pine-ink `#2D5942`, eight-arm pulse, individually shaded facets, diagonal illumination, and two-origin clockwise ring draw/erase. Worker compositing can still be affected by overall browser resource contention; test rather than guarantee unlimited animation smoothness.

**Persistent transition lifecycle:** `src/PeridotTransitionOverlay.jsx` keeps the animated loader mounted across transitions and toggles its active state. The rendering worker is retained and paused while hidden; subsequent substantial workspace changes resume/restart the animation rather than remounting a new worker. `src/PeridotTransitionOverlay.css` owns overlay presentation. `src/App.jsx` owns `runPeridotTransition()`, its pre-processing paint opportunity and minimum-duration behavior, and the mapped-data confirmation wrapper. Development-only loader/workbook timing and frame-gap diagnostics distinguish wrapper duration from subsequent browser/React work, but a short operation duration does not certify that a visualization has finished rendering. The workbook-review worker (`src/peridotWorkbookReview.worker.js`) is separate and continues to protect revision-specific provisional mapping reviews.

**Initial Geographic Map readiness (bounded repair, not a general protocol):** the Map viewport starts with zero dimensions and the Map SVG requires positive measured width/height. On first import, conditional mounting could occur after a measurement effect attempted to observe a nonexistent element, leaving a blank stage until a later visualization switch retriggered measurement. The accepted `App.jsx` Map viewport callback-ref/`ResizeObserver` wiring measures when the **actual Map DOM element mounts** and tears down observation when appropriate. Initial map fitting still respects existing chronology role/range readiness; do not re-fit on every playback step, pan, or zoom. `runPeridotTransition()` is not a universal Map-ready signal and does not wait for every CARTO tile. If future blank-first-load bugs arise, inspect DOM mount, nonzero dimensions, chronology initialization, and tile status separately rather than blindly extending the loading duration.

**Minimum regressions:** cold development startup and local production preview; exact still/frame-zero alignment; animation across mapped-data confirmation and large-dataset Map/Network/Timeline/Timeline II/Charts switches; hidden-worker pause/resume and repeated navigation; worker startup failure and main-thread fallback; reduced motion; first Map after upload without navigating away; resize and return-to-Map; preserve viewport and chronology range/playback; no-data startup and ordinary sample/upload flow. User browser tests confirmed the principal large-data animations, startup handoff, fast local production preview, and initial Map recovery; a complete automated/cross-browser/deployed-site matrix has not been claimed.


[Back to Quick Navigation](#quick-navigation) · [Level 1 overview](#level-1--architecture-at-a-glance) · [Module ownership register](#module-ownership-register)

<a id="level-3--maintenance-and-implementation-reference"></a>

## Level 3 — Maintenance and Implementation Reference

*Purpose: Preserve the deeper technical information needed when changing, debugging, or extending the application.*

Three reference formats are used: module, fragile-zone/regression, and compatibility/history. The standard fields always appear; **Not applicable** means an inapplicable field rather than a missing entry. Extensive original reference material is preserved beneath the standardized orientation fields, usually in an expandable section.

<a id="9-module-ownership-index"></a>

### Module ownership register

*Use the register by subsystem. Individual entries below follow the same eight fields, with original implementation descriptions retained as notes. “Not verified” is intentionally distinct from “Not applicable”: exact exports and import dependencies require an exact-source inspection before any code change.*

**Jump to module group:**

- [Loading and transition ownership (2026-11-03)](#module-group-loading-and-transition-ownership-2026-11-03)
- [Application shell and workspace routing](#module-group-application-shell-and-workspace-routing)
- [Data import and mapping](#module-group-data-import-and-mapping)
- [Active Timeline category module index (added 2026-11-10)](#module-group-active-timeline-category-module-index-added-2026-11-10)
- [Visualizations, map, and timeline](#module-group-visualizations-map-and-timeline)
- [Search and interaction resolution](#module-group-search-and-interaction-resolution)
- [Analytics / Charts II](#module-group-analytics-charts-ii)
- [Inspector](#module-group-inspector)
- [Theme, styles, and visual language](#module-group-theme-styles-and-visual-language)
- [Export and shared utilities](#module-group-export-and-shared-utilities)

<details>
<summary><strong>Open complete source-preserved module inventory</strong></summary>


<a id="module-group-loading-and-transition-ownership-2026-11-03"></a>

#### Loading and transition ownership (2026-11-03)

**Related subsystem contract:** [Open current contract](#contract-themes-editorial-presentation-and-loading)


| File | Present responsibility |
|---|---|
| `index.html` | Early static frame-zero forest preboot before React initialization |
| `src/main.jsx`, `src/PeridotBootLoader.css` | Initial React boot/Suspense handoff and loading presentation |
| `src/PeridotTransitionOverlay.jsx`, `src/PeridotTransitionOverlay.css` | Session-persistent transition overlay, retained Canvas, visibility and presentation |
| `src/PeridotLoadingGem.jsx`, `src/PeridotLoadingGem.css` | React-owned Canvas, worker/fallback startup, pause/resume, readiness and accessibility |
| `src/PeridotLoadingGem.worker.js` | Independent OffscreenCanvas animation scheduling and worker-message handling |
| `src/PeridotLoadingGemRenderer.js` | Shared exact Forest Study drawing and animation timing for worker/main-thread fallback |
| `src/App.jsx` | Transition orchestration, mapping-confirmation wrapper, and first-mount Map viewport observation |

<a id="module-group-application-shell-and-workspace-routing"></a>

#### Application shell and workspace routing

**Related subsystem contract:** [Open current contract](#contract-application-shell-and-navigation)



#### `src/App.jsx`

- **Module / path:** `src/App.jsx`
- **Responsibility:** Main orchestration file.
- **Principal exports / components:** Not verified (inspect exact current module before editing).
- **Dependencies and consumers:** See the source-preserved notes below and [current subsystem contract](#contract-application-shell-and-navigation); exact import graph not verified.
- **State ownership / data transformation:** See source-preserved notes below; not independently source-audited.
- **Implementation cautions:** Preserve the documented behavior and check current imports before changing or retiring this module.
- **Related subsystem contract:** [Open contract](#contract-application-shell-and-navigation)
- **Related planning documents:** See [relevant subsystem contract](#contract-application-shell-and-navigation); exact additional path not verified unless identified there.

**Detailed implementation notes (source-preserved):**


Main orchestration file. It owns top-level state, derived-data wiring, workspace composition, side-panel compatibility contracts, Search state, Timeline state, Inspector presentation/selection/history, export wiring, connected-record rendering, and the live generalized Data workflow. It coordinates template download, explicit sample selection, sample mapping edit/reset state, user upload parsing, editable table/workbook mapping, validation, authoritative Identity/runtime compilation, active-source replacement, and visualization resets after imports/remaps.

`App.jsx` must preserve the no-preloaded-data contract: null/no source means no active dataset rather than an implicit sample fallback. It no longer contains the inline Home, Data, Theme, Visualizations, Explore, Learn More, Search, Export, or hamburger-menu UI components; dedicated `Peridot*Workspace` / menu files own those presentations.


#### `src/peridotWorkspaceConfig.js`

- **Module / path:** `src/peridotWorkspaceConfig.js`
- **Responsibility:** Workspace-mode vocabulary and helper functions used by `App.jsx` for Home, Data, Visualize, Explore, About/Learn More compatibility, Search, Inspector, and Themes/Accessibility routing.
- **Principal exports / components:** Not verified (inspect exact current module before editing).
- **Dependencies and consumers:** See the source-preserved notes below and [current subsystem contract](#contract-application-shell-and-navigation); exact import graph not verified.
- **State ownership / data transformation:** See source-preserved notes below; not independently source-audited.
- **Implementation cautions:** Preserve the documented behavior and check current imports before changing or retiring this module.
- **Related subsystem contract:** [Open contract](#contract-application-shell-and-navigation)
- **Related planning documents:** See [relevant subsystem contract](#contract-application-shell-and-navigation); exact additional path not verified unless identified there.

**Detailed implementation notes (source-preserved):**


Workspace-mode vocabulary and helper functions used by `App.jsx` for Home, Data, Visualize, Explore, About/Learn More compatibility, Search, Inspector, and Themes/Accessibility routing. Export and Timeline remain Visualize-integrated features rather than standalone workspace modes; Tutorials is a public navigation destination whose substantive content remains deferred.


#### `src/PeridotHamburgerMenu.jsx`

- **Module / path:** `src/PeridotHamburgerMenu.jsx`
- **Responsibility:** Legacy/compatibility navigation component retained where older paths still reference it.
- **Principal exports / components:** Not verified (inspect exact current module before editing).
- **Dependencies and consumers:** See the source-preserved notes below and [current subsystem contract](#contract-application-shell-and-navigation); exact import graph not verified.
- **State ownership / data transformation:** See source-preserved notes below; not independently source-audited.
- **Implementation cautions:** Preserve the documented behavior and check current imports before changing or retiring this module.
- **Related subsystem contract:** [Open contract](#contract-application-shell-and-navigation)
- **Related planning documents:** See [relevant subsystem contract](#contract-application-shell-and-navigation); exact additional path not verified unless identified there.

**Detailed implementation notes (source-preserved):**


Legacy/compatibility navigation component retained where older paths still reference it. It is no longer the primary public navigation model; the persistent global header owns ordinary page-to-page navigation. Themes and Accessibility remains intentionally non-public unless a later appearance/settings pass restores it.


#### `src/PeridotHomeWorkspace.jsx`

- **Module / path:** `src/PeridotHomeWorkspace.jsx`
- **Responsibility:** Current Cartographic Editorial Home component.
- **Principal exports / components:** Not verified (inspect exact current module before editing).
- **Dependencies and consumers:** See the source-preserved notes below and [current subsystem contract](#contract-application-shell-and-navigation); exact import graph not verified.
- **State ownership / data transformation:** See source-preserved notes below; not independently source-audited.
- **Implementation cautions:** Preserve the documented behavior and check current imports before changing or retiring this module.
- **Related subsystem contract:** [Open contract](#contract-application-shell-and-navigation)
- **Related planning documents:** See [relevant subsystem contract](#contract-application-shell-and-navigation); exact additional path not verified unless identified there.

**Detailed implementation notes (source-preserved):**


**Historical presentation note:** This source-preserved module account mentions two Home entry actions superseded by the current single Get Started action. Verify current UI against the Level 2 shell contract before making changes.

Current Cartographic Editorial Home component. It owns the Florence image/paper hero, prominent Peridot introduction and distinct Upload your data / Explore sample data actions, plus the New to Peridot? guidance and three informational lower-banner columns (Manage data, Visualize, Explore evidence). `src/styles/workspaces/home.css` owns the parent-height filling flex layout and the full-width parchment banner, while the corner-collage PNGs under `assets/` provide decoration only. The lower-banner columns are **not** navigation buttons. The older gilded-logo/title-card model is historical, not the current Home source contract. Avoid reintroducing a fixed `100dvh - 72px` subtraction when the application shell already measures workspace height.


#### `src/PeridotDataWorkspace.jsx`

- **Module / path:** `src/PeridotDataWorkspace.jsx`
- **Responsibility:** Full Data workspace for the three explicit entry paths: **Start with a Template**, **Start with Sample Data**, and **Upload Your Data**.
- **Principal exports / components:** Not verified (inspect exact current module before editing).
- **Dependencies and consumers:** See the source-preserved notes below and [current subsystem contract](#contract-application-shell-and-navigation); exact import graph not verified.
- **State ownership / data transformation:** See source-preserved notes below; not independently source-audited.
- **Implementation cautions:** Preserve the documented behavior and check current imports before changing or retiring this module.
- **Related subsystem contract:** [Open contract](#contract-application-shell-and-navigation)
- **Related planning documents:** See [relevant subsystem contract](#contract-application-shell-and-navigation); exact additional path not verified unless identified there.

**Detailed implementation notes (source-preserved):**


Full Data workspace for the three explicit entry paths: **Start with a Template**, **Start with Sample Data**, and **Upload Your Data**. It also identifies the active source, exposes **Edit mapped data** for researcher uploads, exposes **Edit sample mapping** for active samples, and routes sample selection/download/mapping actions. It must preserve the no-preloaded-data contract: first launch has no active dataset until the user explicitly chooses or uploads one.


#### `src/PeridotVisualizationsWorkspace.jsx`

- **Module / path:** `src/PeridotVisualizationsWorkspace.jsx`
- **Responsibility:** Full Visualize workspace.
- **Principal exports / components:** Not verified (inspect exact current module before editing).
- **Dependencies and consumers:** See the source-preserved notes below and [current subsystem contract](#contract-application-shell-and-navigation); exact import graph not verified.
- **State ownership / data transformation:** See source-preserved notes below; not independently source-audited.
- **Implementation cautions:** Preserve the documented behavior and check current imports before changing or retiring this module.
- **Related subsystem contract:** [Open contract](#contract-application-shell-and-navigation)
- **Related planning documents:** See [relevant subsystem contract](#contract-application-shell-and-navigation); exact additional path not verified unless identified there.

**Detailed implementation notes (source-preserved):**


Full Visualize workspace. The current shell is flattened: a compact second bar centers **Map / Network / Timeline / Charts**, with **Export** held separately at the right. The former oversized visualization title/banner framing has been removed. The workspace renders unavailable-state explanations when a dataset cannot support a selected view, hosts Charts, places the compact bottom Timeline/playback control, exposes Map settings, and wraps the live map/network stage. Visualization state is intended to persist while moving among public pages and visualization modes rather than being reset by navigation.


#### `src/PeridotSearchWorkspace.jsx`

- **Module / path:** `src/PeridotSearchWorkspace.jsx`
- **Responsibility:** Full Explore workspace.
- **Principal exports / components:** Not verified (inspect exact current module before editing).
- **Dependencies and consumers:** See the source-preserved notes below and [current subsystem contract](#contract-application-shell-and-navigation); exact import graph not verified.
- **State ownership / data transformation:** See source-preserved notes below; not independently source-audited.
- **Implementation cautions:** Preserve the documented behavior and check current imports before changing or retiring this module.
- **Related subsystem contract:** [Open contract](#contract-application-shell-and-navigation)
- **Related planning documents:** See [relevant subsystem contract](#contract-application-shell-and-navigation); exact additional path not verified unless identified there.

**Detailed implementation notes (source-preserved):**


Full Explore workspace. Its public local modes are **Browse / Advanced Query / Refine**. Advanced Query contains the query builder and current result set; Refine contains applied-result facets, Inspector handoff guidance, and capability review. The component still owns keyword/person/place/explicit-route/date filters, predictive suggestions, capability filters, structured Required / Any-of / Excluded criteria, criterion-attached count conditions, dataset-wide Browse ledgers, generalized Results presentation, Apply Filters, Clear Filters, and search-result Inspector handoff. Inspect actions open the full Inspector above the current Explore state so closing it returns to the same context. A larger content/layout redesign remains deferred.


#### `src/PeridotThemeWorkspace.jsx`

- **Module / path:** `src/PeridotThemeWorkspace.jsx`
- **Responsibility:** Themes and Accessibility workspace for Peridot default, Early modern map, Modern map presets, custom palette import, role-targeted palette application, and future accessibility/appearance controls.
- **Principal exports / components:** Not verified (inspect exact current module before editing).
- **Dependencies and consumers:** See the source-preserved notes below and [current subsystem contract](#contract-application-shell-and-navigation); exact import graph not verified.
- **State ownership / data transformation:** See source-preserved notes below; not independently source-audited.
- **Implementation cautions:** Preserve the documented behavior and check current imports before changing or retiring this module.
- **Related subsystem contract:** [Open contract](#contract-application-shell-and-navigation)
- **Related planning documents:** See [relevant subsystem contract](#contract-application-shell-and-navigation); exact additional path not verified unless identified there.

**Detailed implementation notes (source-preserved):**


Themes and Accessibility workspace for Peridot default, Early modern map, Modern map presets, custom palette import, role-targeted palette application, and future accessibility/appearance controls. It remains implemented and route-compatible, but the hamburger menu entry is currently hidden while the page remains more development-facing than user-ready. Theme controls should continue to operate through semantic role targets rather than one-off component overrides. Explicit chart-targeted imports should alter chart series colors without recoloring unrelated app chrome.


#### `src/PeridotExploreWorkspace.jsx`

- **Module / path:** `src/PeridotExploreWorkspace.jsx`
- **Responsibility:** Compatibility routing boundary for the old Explore workspace.
- **Principal exports / components:** Not verified (inspect exact current module before editing).
- **Dependencies and consumers:** See the source-preserved notes below and [current subsystem contract](#contract-application-shell-and-navigation); exact import graph not verified.
- **State ownership / data transformation:** See source-preserved notes below; not independently source-audited.
- **Implementation cautions:** Preserve the documented behavior and check current imports before changing or retiring this module.
- **Related subsystem contract:** [Open contract](#contract-application-shell-and-navigation)
- **Related planning documents:** See [relevant subsystem contract](#contract-application-shell-and-navigation); exact additional path not verified unless identified there.

**Detailed implementation notes (source-preserved):**


Compatibility routing boundary for the old Explore workspace. Current Explore entry points should route directly to `PeridotSearchWorkspace.jsx`; the former capability-summary role has moved into the Advanced Search **Capabilities** tab.


#### `src/PeridotLearnMoreWorkspace.jsx`

- **Module / path:** `src/PeridotLearnMoreWorkspace.jsx`
- **Responsibility:** Public **About** workspace with local destinations **About Peridot / Creator / AI Disclosure / Open Source / Feedback**.
- **Principal exports / components:** Not verified (inspect exact current module before editing).
- **Dependencies and consumers:** See the source-preserved notes below and [current subsystem contract](#contract-application-shell-and-navigation); exact import graph not verified.
- **State ownership / data transformation:** See source-preserved notes below; not independently source-audited.
- **Implementation cautions:** Preserve the documented behavior and check current imports before changing or retiring this module.
- **Related subsystem contract:** [Open contract](#contract-application-shell-and-navigation)
- **Related planning documents:** See [relevant subsystem contract](#contract-application-shell-and-navigation); exact additional path not verified unless identified there.

**Detailed implementation notes (source-preserved):**


Public **About** workspace with local destinations **About Peridot / Creator / AI Disclosure / Open Source / Feedback**. The old Project Information Hub / Return to visualizations framing is superseded. The current presentation is intentionally flat and scholarly: restrained rules/spacing, reduced page-title scale, and a workspace-owned vertical scrollbar when content exceeds the viewport. Creator keeps the portrait and expandable biography; AI Disclosure preserves separate human and ChatGPT accounts; Open Source exposes repository/core-documentation references; Feedback is rendered inline as a normal About page.


#### `src/PeridotFeedbackForm.jsx`

- **Module / path:** `src/PeridotFeedbackForm.jsx`
- **Responsibility:** Feedback form component used inline by **About → Feedback** and still capable of compatibility-modal rendering.
- **Principal exports / components:** Not verified (inspect exact current module before editing).
- **Dependencies and consumers:** See the source-preserved notes below and [current subsystem contract](#contract-application-shell-and-navigation); exact import graph not verified.
- **State ownership / data transformation:** See source-preserved notes below; not independently source-audited.
- **Implementation cautions:** Preserve the documented behavior and check current imports before changing or retiring this module.
- **Related subsystem contract:** [Open contract](#contract-application-shell-and-navigation)
- **Related planning documents:** See [relevant subsystem contract](#contract-application-shell-and-navigation); exact additional path not verified unless identified there.

**Detailed implementation notes (source-preserved):**


Feedback form component used inline by **About → Feedback** and still capable of compatibility-modal rendering. It owns feedback-type selection, required message validation, optional context/email capture, Formspree submission, success/error states, and form actions. Do not assume modal presentation is the only public contract.

<a id="module-group-data-import-and-mapping"></a>

#### Data import and mapping

**Related subsystem contract:** [Open current contract](#contract-data-import-and-generalized-mapping)



#### `src/peridotCsvSchema.js`

- **Module / path:** `src/peridotCsvSchema.js`
- **Responsibility:** Owns the public Peridot CSV schema contract.
- **Principal exports / components:** Not verified (inspect exact current module before editing).
- **Dependencies and consumers:** See the source-preserved notes below and [current subsystem contract](#contract-data-import-and-generalized-mapping); exact import graph not verified.
- **State ownership / data transformation:** See source-preserved notes below; not independently source-audited.
- **Implementation cautions:** Preserve the documented behavior and check current imports before changing or retiring this module.
- **Related subsystem contract:** [Open contract](#contract-data-import-and-generalized-mapping)
- **Related planning documents:** See [relevant subsystem contract](#contract-data-import-and-generalized-mapping); exact additional path not verified unless identified there.

**Detailed implementation notes (source-preserved):**


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

- **Module / path:** `src/peridotCsvNormalizer.js`
- **Responsibility:** Owns pure conversion from public one-file template rows into the existing internal row shapes.
- **Principal exports / components:** Not verified (inspect exact current module before editing).
- **Dependencies and consumers:** See the source-preserved notes below and [current subsystem contract](#contract-data-import-and-generalized-mapping); exact import graph not verified.
- **State ownership / data transformation:** See source-preserved notes below; not independently source-audited.
- **Implementation cautions:** Preserve the documented behavior and check current imports before changing or retiring this module.
- **Related subsystem contract:** [Open contract](#contract-data-import-and-generalized-mapping)
- **Related planning documents:** See [relevant subsystem contract](#contract-data-import-and-generalized-mapping); exact additional path not verified unless identified there.

**Detailed implementation notes (source-preserved):**


Owns pure conversion from public one-file template rows into the existing internal row shapes. It creates:

- internal geography rows
- internal letter/Inspector metadata rows
- lightweight exact-name person metadata rows
- map-ready places
- accepted/unsupported row groupings

It does not clean or standardize user-entered values.


#### `src/peridotCsvValidation.js`

- **Module / path:** `src/peridotCsvValidation.js`
- **Responsibility:** Owns pure post-upload validation summaries.
- **Principal exports / components:** Not verified (inspect exact current module before editing).
- **Dependencies and consumers:** See the source-preserved notes below and [current subsystem contract](#contract-data-import-and-generalized-mapping); exact import graph not verified.
- **State ownership / data transformation:** See source-preserved notes below; not independently source-audited.
- **Implementation cautions:** Preserve the documented behavior and check current imports before changing or retiring this module.
- **Related subsystem contract:** [Open contract](#contract-data-import-and-generalized-mapping)
- **Related planning documents:** See [relevant subsystem contract](#contract-data-import-and-generalized-mapping); exact additional path not verified unless identified there.

**Detailed implementation notes (source-preserved):**


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

- **Module / path:** `src/PeridotColumnMappingModal.jsx`
- **Responsibility:** Owns the generalized column/workbook-mapping workspace for arbitrary CSV/TSV/XLSX/XLSM/XLS imports and editable sample mappings.
- **Principal exports / components:** Not verified (inspect exact current module before editing).
- **Dependencies and consumers:** See the source-preserved notes below and [current subsystem contract](#contract-data-import-and-generalized-mapping); exact import graph not verified.
- **State ownership / data transformation:** See source-preserved notes below; not independently source-audited.
- **Implementation cautions:** Preserve the documented behavior and check current imports before changing or retiring this module.
- **Related subsystem contract:** [Open contract](#contract-data-import-and-generalized-mapping)
- **Related planning documents:** See [relevant subsystem contract](#contract-data-import-and-generalized-mapping); exact additional path not verified unless identified there.

**Detailed implementation notes (source-preserved):**


Owns the generalized column/workbook-mapping workspace for arbitrary CSV/TSV/XLSX/XLSM/XLS imports and editable sample mappings. Despite its historical filename, it now renders as a **full-page Data workspace**, not a modal. The active local sections are Preview, Sheets where applicable, Relations, Time, Places, Evidence, and **Review and Upload**; recurring-entity Identity controls are integrated where entities are mapped rather than exposed as a separate required page. It exposes repeatable relationship participants, authoritative Identity rules, repeatable temporal assertions, repeatable participant-attached places, workbook primary-sheet selection, multi-sheet unique-ID joins, and selected Evidence/Analytics metadata.

The same full-page workspace is reused after import. Researcher uploads can be reopened and recompiled from their preserved original source. Samples open an editable active copy of the shipped mapping and display the approved warning that sample edits affect only the active interpretation; a reset action restores the canonical sample mapping. Mapping sections are directly navigable, while Back/Next remain convenience progression controls and Cancel is separated from that pair.

This file remains partially decomposed: static UI labels/section groupings live in `peridotColumnMappingUiConfig.js`; repeated Time/Places/Relations controls live in `PeridotMappingFieldControls.jsx`; Identity presentation lives in `PeridotIdentityMappingControls.jsx`; Evidence Include/Ignore controls live in `PeridotEvidenceFieldControls.jsx`. The workspace owns mapping state transitions, workbook state, edit/apply/cancel/reset behavior, final mapping assembly, and mapping-workspace presentation.


#### `src/peridotColumnMappingUiConfig.js`

- **Module / path:** `src/peridotColumnMappingUiConfig.js`
- **Responsibility:** Static UI configuration for the mapping workspace: single-table/workbook section sequences, display labels, field groupings, capability labels, and formatting helpers.
- **Principal exports / components:** Not verified (inspect exact current module before editing).
- **Dependencies and consumers:** See the source-preserved notes below and [current subsystem contract](#contract-data-import-and-generalized-mapping); exact import graph not verified.
- **State ownership / data transformation:** See source-preserved notes below; not independently source-audited.
- **Implementation cautions:** Preserve the documented behavior and check current imports before changing or retiring this module.
- **Related subsystem contract:** [Open contract](#contract-data-import-and-generalized-mapping)
- **Related planning documents:** See [relevant subsystem contract](#contract-data-import-and-generalized-mapping); exact additional path not verified unless identified there.

**Detailed implementation notes (source-preserved):**


Static UI configuration for the mapping workspace: single-table/workbook section sequences, display labels, field groupings, capability labels, and formatting helpers. It intentionally contains no React state and no import/application logic.


#### `src/PeridotMappingFieldControls.jsx`

- **Module / path:** `src/PeridotMappingFieldControls.jsx`
- **Responsibility:** Presentational mapping controls used by the full-page mapping workspace for generalized repeatable Relations, Time, Places, and workbook-qualified equivalents.
- **Principal exports / components:** Not verified (inspect exact current module before editing).
- **Dependencies and consumers:** See the source-preserved notes below and [current subsystem contract](#contract-data-import-and-generalized-mapping); exact import graph not verified.
- **State ownership / data transformation:** See source-preserved notes below; not independently source-audited.
- **Implementation cautions:** Preserve the documented behavior and check current imports before changing or retiring this module.
- **Related subsystem contract:** [Open contract](#contract-data-import-and-generalized-mapping)
- **Related planning documents:** See [relevant subsystem contract](#contract-data-import-and-generalized-mapping); exact additional path not verified unless identified there.

**Detailed implementation notes (source-preserved):**


Presentational mapping controls used by the full-page mapping workspace for generalized repeatable Relations, Time, Places, and workbook-qualified equivalents. Time presents repeatable Date/Period cards, source-representation controls, Y/M/D component selectors, relationship-participant attachment, and related-note selectors. Places support arbitrary Place A/B/C parts with role source and optional coordinates; Relations support Part A/B/C participants with per-part role source and optional relationship metadata. Workbook controls use combined sheet-column references while preserving the internal workbook reference shape. This file should remain stateless and receive current values plus callbacks from `PeridotColumnMappingModal.jsx`.


#### `src/PeridotIdentityMappingControls.jsx`

- **Module / path:** `src/PeridotIdentityMappingControls.jsx`
- **Responsibility:** Presentational generalized Identity controls used inside the mappings where recurring entities are declared.
- **Principal exports / components:** Not verified (inspect exact current module before editing).
- **Dependencies and consumers:** See the source-preserved notes below and [current subsystem contract](#contract-data-import-and-generalized-mapping); exact import graph not verified.
- **State ownership / data transformation:** See source-preserved notes below; not independently source-audited.
- **Implementation cautions:** Preserve the documented behavior and check current imports before changing or retiring this module.
- **Related subsystem contract:** [Open contract](#contract-data-import-and-generalized-mapping)
- **Related planning documents:** See [relevant subsystem contract](#contract-data-import-and-generalized-mapping); exact additional path not verified unless identified there.

**Detailed implementation notes (source-preserved):**


Presentational generalized Identity controls used inside the mappings where recurring entities are declared. Simple mappings can keep the displayed-name/label default; stronger rules support stable ID selection and complex alternate complete recognition recipes across relationship/place appearances. The component should not re-emerge as a mandatory standalone Identity step unless the public mapping architecture is explicitly redesigned. Runtime identity authority remains downstream in `peridotIdentityRuntime.js`.


#### `src/peridotRecordStructure.js` and `src/PeridotRecordStructure.jsx`

- **Module / path:** `src/peridotRecordStructure.js` and `src/PeridotRecordStructure.jsx`
- **Responsibility:** Generalized record-structure reader and renderer introduced during the SI1 Inspector-legibility work.
- **Principal exports / components:** Not verified (inspect exact current module before editing).
- **Dependencies and consumers:** See the source-preserved notes below and [current subsystem contract](#contract-data-import-and-generalized-mapping); exact import graph not verified.
- **State ownership / data transformation:** See source-preserved notes below; not independently source-audited.
- **Implementation cautions:** Preserve the documented behavior and check current imports before changing or retiring this module.
- **Related subsystem contract:** [Open contract](#contract-data-import-and-generalized-mapping)
- **Related planning documents:** See [relevant subsystem contract](#contract-data-import-and-generalized-mapping); exact additional path not verified unless identified there.

**Detailed implementation notes (source-preserved):**


Generalized record-structure reader and renderer introduced during the SI1 Inspector-legibility work. They expose mapped temporal assertions, participants, places, generalized semantic relationships, and evidence without forcing every record into Source/Target display. `buildPeridotEntityAttributedStructure()` scopes participant-attached information to the selected entity and prefers canonical entity IDs where present. The renderer preserves linked person/place navigation callbacks. These modules are the semantic reference surface for the current generalized Inspector implementation and mapped-information detail; they do not replace central Inspector history.


#### `src/peridotRecordStructureFixtures.js`

- **Module / path:** `src/peridotRecordStructureFixtures.js`
- **Responsibility:** Dependency-light regression fixtures for generalized record/entity-attribution semantics, including relationship role resolution, duplicate/self-relationship handling, and same-label canonical identity cases.
- **Principal exports / components:** Not verified (inspect exact current module before editing).
- **Dependencies and consumers:** See the source-preserved notes below and [current subsystem contract](#contract-data-import-and-generalized-mapping); exact import graph not verified.
- **State ownership / data transformation:** See source-preserved notes below; not independently source-audited.
- **Implementation cautions:** Preserve the documented behavior and check current imports before changing or retiring this module.
- **Related subsystem contract:** [Open contract](#contract-data-import-and-generalized-mapping)
- **Related planning documents:** See [relevant subsystem contract](#contract-data-import-and-generalized-mapping); exact additional path not verified unless identified there.

**Detailed implementation notes (source-preserved):**


Dependency-light regression fixtures for generalized record/entity-attribution semantics, including relationship role resolution, duplicate/self-relationship handling, and same-label canonical identity cases.


#### `src/PeridotEvidenceFieldControls.jsx`

- **Module / path:** `src/PeridotEvidenceFieldControls.jsx`
- **Responsibility:** Presentational Evidence Include/Ignore controls for single-table and workbook imports.
- **Principal exports / components:** Not verified (inspect exact current module before editing).
- **Dependencies and consumers:** See the source-preserved notes below and [current subsystem contract](#contract-data-import-and-generalized-mapping); exact import graph not verified.
- **State ownership / data transformation:** See source-preserved notes below; not independently source-audited.
- **Implementation cautions:** Preserve the documented behavior and check current imports before changing or retiring this module.
- **Related subsystem contract:** [Open contract](#contract-data-import-and-generalized-mapping)
- **Related planning documents:** See [relevant subsystem contract](#contract-data-import-and-generalized-mapping); exact additional path not verified unless identified there.

**Detailed implementation notes (source-preserved):**


Presentational Evidence Include/Ignore controls for single-table and workbook imports. Included fields also expose per-field value handling and the shared record/participant subject-selection control when relationship participants exist. Workbook Evidence remains grouped by sheet, default display labels use the column name only, and each field may show source examples. Structurally mapped Time/Place/Relation fields remain visible but are treated as already used rather than duplicated as Evidence. The modal owns state and update handlers; this file owns repeated Evidence-row presentation.


#### `src/peridotColumnMapping.js`

- **Module / path:** `src/peridotColumnMapping.js`
- **Responsibility:** Owns helper logic for arbitrary table column mapping, including common-name suggestions, core-field mapping rules, temporal-role mapping, point-location role mapping, route coordinate-pair mapping, and selected evidence/Analytics metadata handling.
- **Principal exports / components:** Not verified (inspect exact current module before editing).
- **Dependencies and consumers:** See the source-preserved notes below and [current subsystem contract](#contract-data-import-and-generalized-mapping); exact import graph not verified.
- **State ownership / data transformation:** See source-preserved notes below; not independently source-audited.
- **Implementation cautions:** Preserve the documented behavior and check current imports before changing or retiring this module.
- **Related subsystem contract:** [Open contract](#contract-data-import-and-generalized-mapping)
- **Related planning documents:** See [relevant subsystem contract](#contract-data-import-and-generalized-mapping); exact additional path not verified unless identified there.

**Detailed implementation notes (source-preserved):**


Owns helper logic for arbitrary table column mapping, including common-name suggestions, core-field mapping rules, temporal-role mapping, point-location role mapping, route coordinate-pair mapping, and selected evidence/Analytics metadata handling. It preserves the existing correspondence-compatible route/network fields while adding role mappings for point/site datasets, start/end/display dates, and latitude-first combined coordinate pairs.


#### `src/peridotWorkbookMapping.js`

- **Module / path:** `src/peridotWorkbookMapping.js`
- **Responsibility:** Owns workbook-aware mapping and import assembly helpers.
- **Principal exports / components:** Not verified (inspect exact current module before editing).
- **Dependencies and consumers:** See the source-preserved notes below and [current subsystem contract](#contract-data-import-and-generalized-mapping); exact import graph not verified.
- **State ownership / data transformation:** See source-preserved notes below; not independently source-audited.
- **Implementation cautions:** Preserve the documented behavior and check current imports before changing or retiring this module.
- **Related subsystem contract:** [Open contract](#contract-data-import-and-generalized-mapping)
- **Related planning documents:** See [relevant subsystem contract](#contract-data-import-and-generalized-mapping); exact additional path not verified unless identified there.

**Detailed implementation notes (source-preserved):**


Owns workbook-aware mapping and import assembly helpers. It models primary record sheets, sheet/column references, arbitrary unique-ID joins, workbook validation, joined-row context construction, Peridot-shaped row assembly, temporal/point/route role mappings, and selected evidence/Analytics field handling from primary and joined sheets.


#### `src/peridotDataCapabilityAudit.js`

- **Module / path:** `src/peridotDataCapabilityAudit.js`
- **Responsibility:** Pure UI-agnostic helper for inspecting uploaded rows and reporting field roles, row capabilities, and dataset-level readiness for Inspector, Search, point maps, route maps, networks, timelines, charts, and export.
- **Principal exports / components:** Not verified (inspect exact current module before editing).
- **Dependencies and consumers:** See the source-preserved notes below and [current subsystem contract](#contract-data-import-and-generalized-mapping); exact import graph not verified.
- **State ownership / data transformation:** See source-preserved notes below; not independently source-audited.
- **Implementation cautions:** Preserve the documented behavior and check current imports before changing or retiring this module.
- **Related subsystem contract:** [Open contract](#contract-data-import-and-generalized-mapping)
- **Related planning documents:** See [relevant subsystem contract](#contract-data-import-and-generalized-mapping); exact additional path not verified unless identified there.

**Detailed implementation notes (source-preserved):**


Pure UI-agnostic helper for inspecting uploaded rows and reporting field roles, row capabilities, and dataset-level readiness for Inspector, Search, point maps, route maps, networks, timelines, charts, and export. It supports temporal intervals, latitude-first coordinate pairs, point/site records, route records, time-series-like numeric fields, and generic evidence records.


#### `src/peridotWorkbookParsing.js`

- **Module / path:** `src/peridotWorkbookParsing.js`
- **Responsibility:** Owns workbook parsing helper logic for CSV, TSV, XLSX, and XLS inputs.
- **Principal exports / components:** Not verified (inspect exact current module before editing).
- **Dependencies and consumers:** See the source-preserved notes below and [current subsystem contract](#contract-data-import-and-generalized-mapping); exact import graph not verified.
- **State ownership / data transformation:** See source-preserved notes below; not independently source-audited.
- **Implementation cautions:** Preserve the documented behavior and check current imports before changing or retiring this module.
- **Related subsystem contract:** [Open contract](#contract-data-import-and-generalized-mapping)
- **Related planning documents:** See [relevant subsystem contract](#contract-data-import-and-generalized-mapping); exact additional path not verified unless identified there.

**Detailed implementation notes (source-preserved):**


Owns workbook parsing helper logic for CSV, TSV, XLSX, and XLS inputs. It isolates the `xlsx` dependency, parses all sheets into a shared workbook model, ignores formatting/merged-cell styling, and reads saved/displayed cell values only.


#### `src/peridotSampleDatasets.js`

- **Module / path:** `src/peridotSampleDatasets.js`
- **Responsibility:** First-class sample-data registry.
- **Principal exports / components:** Not verified (inspect exact current module before editing).
- **Dependencies and consumers:** See the source-preserved notes below and [current subsystem contract](#contract-data-import-and-generalized-mapping); exact import graph not verified.
- **State ownership / data transformation:** See source-preserved notes below; not independently source-audited.
- **Implementation cautions:** Preserve the documented behavior and check current imports before changing or retiring this module.
- **Related subsystem contract:** [Open contract](#contract-data-import-and-generalized-mapping)
- **Related planning documents:** See [relevant subsystem contract](#contract-data-import-and-generalized-mapping); exact additional path not verified unless identified there.

**Detailed implementation notes (source-preserved):**


First-class sample-data registry. It identifies the ordinary source file for each bundled sample, preserves the shipped generalized mapping, provides display/chooser metadata, and supplies the immutable reset baseline used when a user experiments with a sample mapping. Samples are not a separate parser or runtime architecture.

Canonical public sample sources live under `public/sample_data/`:

- `correspondence_network_sample.xlsx`
- `family_tree_sample.csv`
- `cardinals_1600_1640_sample.xlsx`

The earlier embedded `src/peridotSampleData.js` module has been retired and must not be restored as an implicit first-load fallback.


#### `src/peridotNormalizedModel.js`

- **Module / path:** `src/peridotNormalizedModel.js`
- **Responsibility:** Owns the consumer-neutral canonical dataset envelope and constructors for entities, places, records, events, relationships, participations, evidence sources, assertions, validation/capability metadata, source manifests, saved variable definitions, and universal mapping state.
- **Principal exports / components:** Not verified (inspect exact current module before editing).
- **Dependencies and consumers:** See the source-preserved notes below and [current subsystem contract](#contract-data-import-and-generalized-mapping); exact import graph not verified.
- **State ownership / data transformation:** See source-preserved notes below; not independently source-audited.
- **Implementation cautions:** Preserve the documented behavior and check current imports before changing or retiring this module.
- **Related subsystem contract:** [Open contract](#contract-data-import-and-generalized-mapping)
- **Related planning documents:** See [relevant subsystem contract](#contract-data-import-and-generalized-mapping); exact additional path not verified unless identified there.

**Detailed implementation notes (source-preserved):**


Owns the consumer-neutral canonical dataset envelope and constructors for entities, places, records, events, relationships, participations, evidence sources, assertions, validation/capability metadata, source manifests, saved variable definitions, and universal mapping state. This is the authoritative normalized research representation; consumer-specific flattening belongs in adapters.


#### `src/peridotNormalizationProvenance.js`

- **Module / path:** `src/peridotNormalizationProvenance.js`
- **Responsibility:** Owns machine-readable source and transformation provenance for normalized items.
- **Principal exports / components:** Not verified (inspect exact current module before editing).
- **Dependencies and consumers:** See the source-preserved notes below and [current subsystem contract](#contract-data-import-and-generalized-mapping); exact import graph not verified.
- **State ownership / data transformation:** See source-preserved notes below; not independently source-audited.
- **Implementation cautions:** Preserve the documented behavior and check current imports before changing or retiring this module.
- **Related subsystem contract:** [Open contract](#contract-data-import-and-generalized-mapping)
- **Related planning documents:** See [relevant subsystem contract](#contract-data-import-and-generalized-mapping); exact additional path not verified unless identified there.

**Detailed implementation notes (source-preserved):**


Owns machine-readable source and transformation provenance for normalized items. Provenance records how Peridot obtained a claim and remains distinct from scholarly evidence explaining why the researcher accepts it.


#### `src/peridotTemporalAssertions.js`

- **Module / path:** `src/peridotTemporalAssertions.js`
- **Responsibility:** Owns conservative parsing and preservation of canonical temporal assertions.
- **Principal exports / components:** Not verified (inspect exact current module before editing).
- **Dependencies and consumers:** See the source-preserved notes below and [current subsystem contract](#contract-data-import-and-generalized-mapping); exact import graph not verified.
- **State ownership / data transformation:** See source-preserved notes below; not independently source-audited.
- **Implementation cautions:** Preserve the documented behavior and check current imports before changing or retiring this module.
- **Related subsystem contract:** [Open contract](#contract-data-import-and-generalized-mapping)
- **Related planning documents:** See [relevant subsystem contract](#contract-data-import-and-generalized-mapping); exact additional path not verified unless identified there.

**Detailed implementation notes (source-preserved):**


Owns conservative parsing and preservation of canonical temporal assertions. Original source text always survives. The parser distinguishes temporal shape, known components, approximation, boundedness, consistency, warnings, and machine usability rather than forcing every value into one JavaScript date. It supports ordinary point dates, mixed-precision and open intervals, approximation markers, partial values such as `1607/00/02` and `0000/08/08`, and chronologically backwards ranges that remain preserved but unsafe for ordinary interval computation. Annotated date strings may be parsed from viable outer date expressions, while cells containing competing date possibilities remain flagged rather than collapsed into false certainty. Researcher-supplied temporal notes remain separate from Peridot's derived temporal structure.


#### `src/peridotTemporalMapping.js`

- **Module / path:** `src/peridotTemporalMapping.js`
- **Responsibility:** Owns generalized temporal-mapping normalization and composition.
- **Principal exports / components:** Not verified (inspect exact current module before editing).
- **Dependencies and consumers:** See the source-preserved notes below and [current subsystem contract](#contract-data-import-and-generalized-mapping); exact import graph not verified.
- **State ownership / data transformation:** See source-preserved notes below; not independently source-audited.
- **Implementation cautions:** Preserve the documented behavior and check current imports before changing or retiring this module.
- **Related subsystem contract:** [Open contract](#contract-data-import-and-generalized-mapping)
- **Related planning documents:** See [relevant subsystem contract](#contract-data-import-and-generalized-mapping); exact additional path not verified unless identified there.

**Detailed implementation notes (source-preserved):**


Owns generalized temporal-mapping normalization and composition. It represents repeatable Date/Period mappings independently from display labels, supports one-column and Y/M/D source representations, composes beginning/end endpoints for periods, allows source-column reuse across assertions, and carries relationship-participant attachment and related temporal-note mappings into canonical temporal assertions.


#### `src/peridotNormalizedValidation.js`

- **Module / path:** `src/peridotNormalizedValidation.js`
- **Responsibility:** Owns cross-collection canonical structural validation and blocking/error/warning/information reporting.
- **Principal exports / components:** Not verified (inspect exact current module before editing).
- **Dependencies and consumers:** See the source-preserved notes below and [current subsystem contract](#contract-data-import-and-generalized-mapping); exact import graph not verified.
- **State ownership / data transformation:** See source-preserved notes below; not independently source-audited.
- **Implementation cautions:** Preserve the documented behavior and check current imports before changing or retiring this module.
- **Related subsystem contract:** [Open contract](#contract-data-import-and-generalized-mapping)
- **Related planning documents:** See [relevant subsystem contract](#contract-data-import-and-generalized-mapping); exact additional path not verified unless identified there.

**Detailed implementation notes (source-preserved):**


Owns cross-collection canonical structural validation and blocking/error/warning/information reporting.


#### `src/peridotCorrespondenceProfile.js`

- **Module / path:** `src/peridotCorrespondenceProfile.js`
- **Responsibility:** Normalizes current correspondence/directed-record mapped rows into canonical records, entities, places, participations, evidence, assertions, temporal structures, and provenance.
- **Principal exports / components:** Not verified (inspect exact current module before editing).
- **Dependencies and consumers:** See the source-preserved notes below and [current subsystem contract](#contract-data-import-and-generalized-mapping); exact import graph not verified.
- **State ownership / data transformation:** See source-preserved notes below; not independently source-audited.
- **Implementation cautions:** Preserve the documented behavior and check current imports before changing or retiring this module.
- **Related subsystem contract:** [Open contract](#contract-data-import-and-generalized-mapping)
- **Related planning documents:** See [relevant subsystem contract](#contract-data-import-and-generalized-mapping); exact additional path not verified unless identified there.

**Detailed implementation notes (source-preserved):**


Normalizes current correspondence/directed-record mapped rows into canonical records, entities, places, participations, evidence, assertions, temporal structures, and provenance. It now also creates atomic canonical `mapped-evidence:*` assertions for subject-aware generalized Evidence occurrences while retaining one EvidenceSource per record and the compatibility custom-field representation.


#### `src/peridotLegacyCompatibilityAdapter.js`

- **Module / path:** `src/peridotLegacyCompatibilityAdapter.js`
- **Responsibility:** Active compatibility boundary for correspondence.
- **Principal exports / components:** Not verified (inspect exact current module before editing).
- **Dependencies and consumers:** See the source-preserved notes below and [current subsystem contract](#contract-data-import-and-generalized-mapping); exact import graph not verified.
- **State ownership / data transformation:** See source-preserved notes below; not independently source-audited.
- **Implementation cautions:** Preserve the documented behavior and check current imports before changing or retiring this module.
- **Related subsystem contract:** [Open contract](#contract-data-import-and-generalized-mapping)
- **Related planning documents:** See [relevant subsystem contract](#contract-data-import-and-generalized-mapping); exact additional path not verified unless identified there.

**Detailed implementation notes (source-preserved):**


Active compatibility boundary for correspondence. It projects canonical correspondence datasets back into the accepted legacy runtime shapes by delegating compatibility-sensitive row shaping to `peridotCsvNormalizer.js`. Do not remove this adapter until downstream parity has been proven without it.


#### `src/peridotCanonicalRuntimeModel.js`

- **Module / path:** `src/peridotCanonicalRuntimeModel.js`
- **Responsibility:** Active correspondence normalization entry point.
- **Principal exports / components:** Not verified (inspect exact current module before editing).
- **Dependencies and consumers:** See the source-preserved notes below and [current subsystem contract](#contract-data-import-and-generalized-mapping); exact import graph not verified.
- **State ownership / data transformation:** See source-preserved notes below; not independently source-audited.
- **Implementation cautions:** Preserve the documented behavior and check current imports before changing or retiring this module.
- **Related subsystem contract:** [Open contract](#contract-data-import-and-generalized-mapping)
- **Related planning documents:** See [relevant subsystem contract](#contract-data-import-and-generalized-mapping); exact additional path not verified unless identified there.

**Detailed implementation notes (source-preserved):**


Active correspondence normalization entry point. It makes canonical normalization authoritative, validates the canonical dataset, and then supplies current `App.jsx` consumers through the legacy compatibility adapter.


#### `src/peridotNormalizationShadowAudit.js`

- **Module / path:** `src/peridotNormalizationShadowAudit.js`
- **Responsibility:** Parity/audit boundary retained from the canonical migration sequence.
- **Principal exports / components:** Not verified (inspect exact current module before editing).
- **Dependencies and consumers:** See the source-preserved notes below and [current subsystem contract](#contract-data-import-and-generalized-mapping); exact import graph not verified.
- **State ownership / data transformation:** See source-preserved notes below; not independently source-audited.
- **Implementation cautions:** Preserve the documented behavior and check current imports before changing or retiring this module.
- **Related subsystem contract:** [Open contract](#contract-data-import-and-generalized-mapping)
- **Related planning documents:** See [relevant subsystem contract](#contract-data-import-and-generalized-mapping); exact additional path not verified unless identified there.

**Detailed implementation notes (source-preserved):**


Parity/audit boundary retained from the canonical migration sequence. It compares direct legacy normalization with the canonical-through-adapter path and should remain available for regression diagnosis.


#### `src/peridotDatasetProfiles.js`

- **Module / path:** `src/peridotDatasetProfiles.js`
- **Responsibility:** Compatibility registry for the older Correspondence / Directed Record and Genealogy / Person-Centered profile vocabulary.
- **Principal exports / components:** Not verified (inspect exact current module before editing).
- **Dependencies and consumers:** See the source-preserved notes below and [current subsystem contract](#contract-data-import-and-generalized-mapping); exact import graph not verified.
- **State ownership / data transformation:** See source-preserved notes below; not independently source-audited.
- **Implementation cautions:** Preserve the documented behavior and check current imports before changing or retiring this module.
- **Related subsystem contract:** [Open contract](#contract-data-import-and-generalized-mapping)
- **Related planning documents:** See [relevant subsystem contract](#contract-data-import-and-generalized-mapping); exact additional path not verified unless identified there.

**Detailed implementation notes (source-preserved):**


Compatibility registry for the older Correspondence / Directed Record and Genealogy / Person-Centered profile vocabulary. The public upload flow no longer asks users to choose between these profiles; retain this module only where current internal normalizers/runtime adapters still depend on it, and include it in the later legacy-retirement audit.


#### `src/peridotGenealogyProfile.js`

- **Module / path:** `src/peridotGenealogyProfile.js`
- **Responsibility:** Normalizes person-centered genealogy rows into canonical people/entities, birth/death events, parent-child and partnership relationships, places, attributes, evidence, temporal assertions, and provenance.
- **Principal exports / components:** Not verified (inspect exact current module before editing).
- **Dependencies and consumers:** See the source-preserved notes below and [current subsystem contract](#contract-data-import-and-generalized-mapping); exact import graph not verified.
- **State ownership / data transformation:** See source-preserved notes below; not independently source-audited.
- **Implementation cautions:** Preserve the documented behavior and check current imports before changing or retiring this module.
- **Related subsystem contract:** [Open contract](#contract-data-import-and-generalized-mapping)
- **Related planning documents:** See [relevant subsystem contract](#contract-data-import-and-generalized-mapping); exact additional path not verified unless identified there.

**Detailed implementation notes (source-preserved):**


Normalizes person-centered genealogy rows into canonical people/entities, birth/death events, parent-child and partnership relationships, places, attributes, evidence, temporal assertions, and provenance. It preserves direct source relationships and does not infer false movement or derived kinship.


#### `src/peridotGenealogyMapping.js` and `src/PeridotGenealogyMappingControls.jsx`

- **Module / path:** `src/peridotGenealogyMapping.js` and `src/PeridotGenealogyMappingControls.jsx`
- **Responsibility:** Own genealogy-specific mapping schema, defaults/suggestions, validation, supplemental-row handling, capability summaries, and presentational mapping controls for Identity, Parents, Partners, Life events, Places, Attributes, and Review.
- **Principal exports / components:** Not verified (inspect exact current module before editing).
- **Dependencies and consumers:** See the source-preserved notes below and [current subsystem contract](#contract-data-import-and-generalized-mapping); exact import graph not verified.
- **State ownership / data transformation:** See source-preserved notes below; not independently source-audited.
- **Implementation cautions:** Preserve the documented behavior and check current imports before changing or retiring this module.
- **Related subsystem contract:** [Open contract](#contract-data-import-and-generalized-mapping)
- **Related planning documents:** See [relevant subsystem contract](#contract-data-import-and-generalized-mapping); exact additional path not verified unless identified there.

**Detailed implementation notes (source-preserved):**


Own genealogy-specific mapping schema, defaults/suggestions, validation, supplemental-row handling, capability summaries, and presentational mapping controls for Identity, Parents, Partners, Life events, Places, Attributes, and Review.


#### `src/peridotGenealogyRuntimeModel.js`

- **Module / path:** `src/peridotGenealogyRuntimeModel.js`
- **Responsibility:** Projects validated canonical genealogy datasets into the current active genealogy runtime model without routing them through the correspondence compatibility adapter.
- **Principal exports / components:** Not verified (inspect exact current module before editing).
- **Dependencies and consumers:** See the source-preserved notes below and [current subsystem contract](#contract-data-import-and-generalized-mapping); exact import graph not verified.
- **State ownership / data transformation:** See source-preserved notes below; not independently source-audited.
- **Implementation cautions:** Preserve the documented behavior and check current imports before changing or retiring this module.
- **Related subsystem contract:** [Open contract](#contract-data-import-and-generalized-mapping)
- **Related planning documents:** See [relevant subsystem contract](#contract-data-import-and-generalized-mapping); exact additional path not verified unless identified there.

**Detailed implementation notes (source-preserved):**


Projects validated canonical genealogy datasets into the current active genealogy runtime model without routing them through the correspondence compatibility adapter.


#### `src/peridotGeneralizedMappingRuntime.js`

- **Module / path:** `src/peridotGeneralizedMappingRuntime.js`
- **Responsibility:** Authoritative runtime application boundary for accepted generalized single-table mappings.
- **Principal exports / components:** Not verified (inspect exact current module before editing).
- **Dependencies and consumers:** See the source-preserved notes below and [current subsystem contract](#contract-data-import-and-generalized-mapping); exact import graph not verified.
- **State ownership / data transformation:** See source-preserved notes below; not independently source-audited.
- **Implementation cautions:** Preserve the documented behavior and check current imports before changing or retiring this module.
- **Related subsystem contract:** [Open contract](#contract-data-import-and-generalized-mapping)
- **Related planning documents:** See [relevant subsystem contract](#contract-data-import-and-generalized-mapping); exact additional path not verified unless identified there.

**Detailed implementation notes (source-preserved):**


Authoritative runtime application boundary for accepted generalized single-table mappings. It turns user-confirmed relationships, Identity rules, places, temporal assertions, Evidence, cardinality declarations, and subject selections into generalized observations plus compatibility projections only where older consumers still require them. Multi-valued fields split through shared value handling before subject fan-out; Time/Place/Evidence occurrences retain singular downstream subjects; identity mappings compile to stable participant/entity IDs.


#### `src/peridotIdentityRuntime.js`

- **Module / path:** `src/peridotIdentityRuntime.js`
- **Responsibility:** Compiles accepted generalized Identity definitions into deterministic machine-facing keys for records and recurring entities.
- **Principal exports / components:** Not verified (inspect exact current module before editing).
- **Dependencies and consumers:** See the source-preserved notes below and [current subsystem contract](#contract-data-import-and-generalized-mapping); exact import graph not verified.
- **State ownership / data transformation:** See source-preserved notes below; not independently source-audited.
- **Implementation cautions:** Preserve the documented behavior and check current imports before changing or retiring this module.
- **Related subsystem contract:** [Open contract](#contract-data-import-and-generalized-mapping)
- **Related planning documents:** See [relevant subsystem contract](#contract-data-import-and-generalized-mapping); exact additional path not verified unless identified there.

**Detailed implementation notes (source-preserved):**


Compiles accepted generalized Identity definitions into deterministic machine-facing keys for records and recurring entities. It preserves equivalence across participant roles/sheets when the researcher maps the same conceptual identity components, distinguishes same-label entities when stronger identity differs, and provides controlled unresolved/row-scoped fallback only when no usable mapped identity is available. Suggested Identity fields must be materialized into the accepted mapping before compilation rather than remaining UI-only defaults.


#### `src/PeridotSubjectSelectionControl.jsx`, `src/peridotSubjectSelection.js`, and fixtures

- **Module / path:** `src/PeridotSubjectSelectionControl.jsx`, `src/peridotSubjectSelection.js`, and fixtures
- **Responsibility:** Shared subject-attribution UI/normalization boundary for Time, Places, and Evidence.
- **Principal exports / components:** Not verified (inspect exact current module before editing).
- **Dependencies and consumers:** See the source-preserved notes below and [current subsystem contract](#contract-data-import-and-generalized-mapping); exact import graph not verified.
- **State ownership / data transformation:** See source-preserved notes below; not independently source-audited.
- **Implementation cautions:** Preserve the documented behavior and check current imports before changing or retiring this module.
- **Related subsystem contract:** [Open contract](#contract-data-import-and-generalized-mapping)
- **Related planning documents:** See [relevant subsystem contract](#contract-data-import-and-generalized-mapping); exact additional path not verified unless identified there.

**Detailed implementation notes (source-preserved):**


Shared subject-attribution UI/normalization boundary for Time, Places, and Evidence. The mapping representation can include the record and multiple participant indices, while runtime normalization fans that selection into atomic single-subject occurrences/assertions. Legacy singular `subjectParticipantIndex` mappings remain interpretable through normalization.


#### `src/PeridotValueHandlingControl.jsx`, `src/peridotMappedValueHandling.js`, and fixtures

- **Module / path:** `src/PeridotValueHandlingControl.jsx`, `src/peridotMappedValueHandling.js`, and fixtures
- **Responsibility:** Shared per-field cardinality/delimiter boundary.
- **Principal exports / components:** Not verified (inspect exact current module before editing).
- **Dependencies and consumers:** See the source-preserved notes below and [current subsystem contract](#contract-data-import-and-generalized-mapping); exact import graph not verified.
- **State ownership / data transformation:** See source-preserved notes below; not independently source-audited.
- **Implementation cautions:** Preserve the documented behavior and check current imports before changing or retiring this module.
- **Related subsystem contract:** [Open contract](#contract-data-import-and-generalized-mapping)
- **Related planning documents:** See [relevant subsystem contract](#contract-data-import-and-generalized-mapping); exact additional path not verified unless identified there.

**Detailed implementation notes (source-preserved):**


Shared per-field cardinality/delimiter boundary. Researchers explicitly declare one versus multiple values. Delimiter normalization accepts literal and common quoted inputs, splits only the mapped field, trims token boundaries appropriately, and preserves the original source cell. Structured date components and endpoint structures are not treated as parallel arrays.


#### `src/peridotEntityDisplayLabels.js` and fixtures

- **Module / path:** `src/peridotEntityDisplayLabels.js` and fixtures
- **Responsibility:** Canonical entity display-label authority.
- **Principal exports / components:** Not verified (inspect exact current module before editing).
- **Dependencies and consumers:** See the source-preserved notes below and [current subsystem contract](#contract-data-import-and-generalized-mapping); exact import graph not verified.
- **State ownership / data transformation:** See source-preserved notes below; not independently source-audited.
- **Implementation cautions:** Preserve the documented behavior and check current imports before changing or retiring this module.
- **Related subsystem contract:** [Open contract](#contract-data-import-and-generalized-mapping)
- **Related planning documents:** See [relevant subsystem contract](#contract-data-import-and-generalized-mapping); exact additional path not verified unless identified there.

**Detailed implementation notes (source-preserved):**


Canonical entity display-label authority. Consumers resolve a canonical entity ID to its canonical human-readable label when available and otherwise preserve the unresolved source/reference identity. Network/Inspector should not rebuild independent label-preference heuristics.


#### `src/peridotEntityEvidence.js` and fixtures

- **Module / path:** `src/peridotEntityEvidence.js` and fixtures
- **Responsibility:** Canonical subject-aware Evidence projection for entity Inspector.
- **Principal exports / components:** Not verified (inspect exact current module before editing).
- **Dependencies and consumers:** See the source-preserved notes below and [current subsystem contract](#contract-data-import-and-generalized-mapping); exact import graph not verified.
- **State ownership / data transformation:** See source-preserved notes below; not independently source-audited.
- **Implementation cautions:** Preserve the documented behavior and check current imports before changing or retiring this module.
- **Related subsystem contract:** [Open contract](#contract-data-import-and-generalized-mapping)
- **Related planning documents:** See [relevant subsystem contract](#contract-data-import-and-generalized-mapping); exact additional path not verified unless identified there.

**Detailed implementation notes (source-preserved):**


Canonical subject-aware Evidence projection for entity Inspector. It selects `mapped-evidence:*` assertions by canonical entity ID and limits them to the active linked-record scope, preventing record-only or filtered-out Evidence from leaking onto the entity dossier.


#### Identity/place/workbook regression fixtures

- **Module / path:** Identity/place/workbook regression fixtures
- **Responsibility:** `src/peridotIdentityRuntimeFixtures.js`, `src/peridotPlaceSubjectMappingFixtures.js`, `src/peridotWorkbookMappingValidationFixtures.js`, `src/peridotCorrespondenceUniversalModelFixtures.js`, and the generalized runtime/workbook fixture suites preserve the recently accepted identity continuity, pa…
- **Principal exports / components:** Not verified (inspect exact current module before editing).
- **Dependencies and consumers:** See the source-preserved notes below and [current subsystem contract](#contract-data-import-and-generalized-mapping); exact import graph not verified.
- **State ownership / data transformation:** See source-preserved notes below; not independently source-audited.
- **Implementation cautions:** Preserve the documented behavior and check current imports before changing or retiring this module.
- **Related subsystem contract:** [Open contract](#contract-data-import-and-generalized-mapping)
- **Related planning documents:** See [relevant subsystem contract](#contract-data-import-and-generalized-mapping); exact additional path not verified unless identified there.

**Detailed implementation notes (source-preserved):**


`src/peridotIdentityRuntimeFixtures.js`, `src/peridotPlaceSubjectMappingFixtures.js`, `src/peridotWorkbookMappingValidationFixtures.js`, `src/peridotCorrespondenceUniversalModelFixtures.js`, and the generalized runtime/workbook fixture suites preserve the recently accepted identity continuity, participant-place subject, correspondence aggregation, and safe workbook-join behavior. Extend these fixtures rather than relying only on visual QA when changing these boundaries.


#### `src/peridotGeneralizedMappingRuntimeFixtures.js` and `src/peridotGeneralizedWorkbookRuntimeFixtures.js`

- **Module / path:** `src/peridotGeneralizedMappingRuntimeFixtures.js` and `src/peridotGeneralizedWorkbookRuntimeFixtures.js`
- **Responsibility:** Regression fixtures for authoritative generalized single-table/workbook runtime behavior.
- **Principal exports / components:** Not verified (inspect exact current module before editing).
- **Dependencies and consumers:** See the source-preserved notes below and [current subsystem contract](#contract-data-import-and-generalized-mapping); exact import graph not verified.
- **State ownership / data transformation:** See source-preserved notes below; not independently source-audited.
- **Implementation cautions:** Preserve the documented behavior and check current imports before changing or retiring this module.
- **Related subsystem contract:** [Open contract](#contract-data-import-and-generalized-mapping)
- **Related planning documents:** See [relevant subsystem contract](#contract-data-import-and-generalized-mapping); exact additional path not verified unless identified there.

**Detailed implementation notes (source-preserved):**


Regression fixtures for authoritative generalized single-table/workbook runtime behavior. Future Identity-authority work should extend these fixtures with true end-to-end duplicate-label and cross-role identity cases rather than testing only preconstructed runtime rows.


#### `src/peridotUniversalMappingModel.js`

- **Module / path:** `src/peridotUniversalMappingModel.js`
- **Responsibility:** Phase 1 universal mapping vocabulary.
- **Principal exports / components:** Not verified (inspect exact current module before editing).
- **Dependencies and consumers:** See the source-preserved notes below and [current subsystem contract](#contract-data-import-and-generalized-mapping); exact import graph not verified.
- **State ownership / data transformation:** See source-preserved notes below; not independently source-audited.
- **Implementation cautions:** Preserve the documented behavior and check current imports before changing or retiring this module.
- **Related subsystem contract:** [Open contract](#contract-data-import-and-generalized-mapping)
- **Related planning documents:** See [relevant subsystem contract](#contract-data-import-and-generalized-mapping); exact additional path not verified unless identified there.

**Detailed implementation notes (source-preserved):**


Phase 1 universal mapping vocabulary. Owns saved variable definitions, source-field assignments, sheet-purpose assignments, repeated-heading groups, and table-connection definitions. Mapping ownership is the user's; the model does not preserve a confidence/origin column stating who assigned a mapping.


#### `src/peridotSourceModel.js`

- **Module / path:** `src/peridotSourceModel.js`
- **Responsibility:** Phase 1 generalized source-file/table/field descriptors and workbook-to-source-manifest helpers.
- **Principal exports / components:** Not verified (inspect exact current module before editing).
- **Dependencies and consumers:** See the source-preserved notes below and [current subsystem contract](#contract-data-import-and-generalized-mapping); exact import graph not verified.
- **State ownership / data transformation:** See source-preserved notes below; not independently source-audited.
- **Implementation cautions:** Preserve the documented behavior and check current imports before changing or retiring this module.
- **Related subsystem contract:** [Open contract](#contract-data-import-and-generalized-mapping)
- **Related planning documents:** See [relevant subsystem contract](#contract-data-import-and-generalized-mapping); exact additional path not verified unless identified there.

**Detailed implementation notes (source-preserved):**


Phase 1 generalized source-file/table/field descriptors and workbook-to-source-manifest helpers. It provides stable structural references without duplicating the full workbook content into every canonical dataset.


#### `src/peridotUniversalTransformations.js`

- **Module / path:** `src/peridotUniversalTransformations.js`
- **Responsibility:** Phase 1 deterministic transformation compiler/executor.
- **Principal exports / components:** Not verified (inspect exact current module before editing).
- **Dependencies and consumers:** See the source-preserved notes below and [current subsystem contract](#contract-data-import-and-generalized-mapping); exact import graph not verified.
- **State ownership / data transformation:** See source-preserved notes below; not independently source-audited.
- **Implementation cautions:** Preserve the documented behavior and check current imports before changing or retiring this module.
- **Related subsystem contract:** [Open contract](#contract-data-import-and-generalized-mapping)
- **Related planning documents:** See [relevant subsystem contract](#contract-data-import-and-generalized-mapping); exact additional path not verified unless identified there.

**Detailed implementation notes (source-preserved):**


Phase 1 deterministic transformation compiler/executor. It supports ordinary field preservation, repeated headings becoming generated header/value variables, transpose, and non-flattening table connections, with provenance retained. It does not perform AI/domain interpretation.


#### `src/peridotUniversalRuntimeCompatibility.js`

- **Module / path:** `src/peridotUniversalRuntimeCompatibility.js`
- **Responsibility:** Phase 1 compatibility classifier.
- **Principal exports / components:** Not verified (inspect exact current module before editing).
- **Dependencies and consumers:** See the source-preserved notes below and [current subsystem contract](#contract-data-import-and-generalized-mapping); exact import graph not verified.
- **State ownership / data transformation:** See source-preserved notes below; not independently source-audited.
- **Implementation cautions:** Preserve the documented behavior and check current imports before changing or retiring this module.
- **Related subsystem contract:** [Open contract](#contract-data-import-and-generalized-mapping)
- **Related planning documents:** See [relevant subsystem contract](#contract-data-import-and-generalized-mapping); exact additional path not verified unless identified there.

**Detailed implementation notes (source-preserved):**


Phase 1 compatibility classifier. It explicitly permits current correspondence and genealogy runtime projections while keeping broader universal datasets canonical-only until a downstream consumer deliberately supports them.

Each of these model/profile modules has dependency-free fixture or audit companions where present. The universal fixture set includes correspondence, genealogy, wide/transposed stock-price, Alaskan-airfield, and Maria-Maddalena-style structures so future changes can test generality without encoding those examples as special-case application logic.

<a id="module-group-active-timeline-category-module-index-added-2026-11-10"></a>

#### Active Timeline category module index (added 2026-11-10)

**Related subsystem contract:** [Open current contract](#contract-timeline)


| Module | Responsibility |
|---|---|
| `PeridotTimelineII.jsx` | active Timeline and Categories tab orchestration; calendar-faithful rendering and category application |
| `PeridotTimelineCategoryEditor.jsx` | five-column horizontally scrollable category source/value/priority/color/icon editor; native scrollbar |
| `PeridotTimelineCategoryMarks.jsx` | colored point/period marks and visual previews |
| `PeridotTimelineCategorySymbols.jsx` | curated Tabler symbol dictionary and rendering |
| `peridotTimelineCategoryConfiguration.js` | pure category settings, selection and identity; starring/primary precedence, session-only presentation overrides |
| `peridotTimelineCategorySourceInventory.js` | discover source-backed candidate fields and distinct values with provenance |
| `peridotTimelineCategoryAssociationResolver.js` | explicit record/subject/assertion membership applicability; refuses unsupported joins |
| `peridotTimelineGeneralizedCategories.js` | connect generalized source candidates and association policy to Timeline events |
| `peridotTimelineGroupedLanes.js` | pure grouped category-lane sizing/assignment geometry with stabilization; see its `.test.mjs` companion |
| `*.test.mjs` companions for the four pure modules | focused behavior/regression contracts |

The historical `PeridotTimelineWorkspace.jsx` module notes below describe the retired original Timeline and must not be used as ownership guidance for the active rendered category editor.

<a id="module-group-visualizations-map-and-timeline"></a>

#### Visualizations, map, and timeline

**Related subsystem contract:** [Open current contract](#contract-geographic-map-and-force-network)



#### `src/mapLayoutHelpers.js`

- **Module / path:** `src/mapLayoutHelpers.js`
- **Responsibility:** Pure map/layout helper logic, including viewport construction, clustering, cluster radius calculation, label visibility, and geometric calculations.
- **Principal exports / components:** Not verified (inspect exact current module before editing).
- **Dependencies and consumers:** See the source-preserved notes below and [current subsystem contract](#contract-geographic-map-and-force-network); exact import graph not verified.
- **State ownership / data transformation:** See source-preserved notes below; not independently source-audited.
- **Implementation cautions:** Preserve the documented behavior and check current imports before changing or retiring this module.
- **Related subsystem contract:** [Open contract](#contract-geographic-map-and-force-network)
- **Related planning documents:** See [relevant subsystem contract](#contract-geographic-map-and-force-network); exact additional path not verified unless identified there.

**Detailed implementation notes (source-preserved):**


Pure map/layout helper logic, including viewport construction, clustering, cluster radius calculation, label visibility, and geometric calculations.


#### `src/mapStageComponents.jsx`

- **Module / path:** `src/mapStageComponents.jsx`
- **Responsibility:** Map-stage-adjacent UI/chrome components.
- **Principal exports / components:** Not verified (inspect exact current module before editing).
- **Dependencies and consumers:** See the source-preserved notes below and [current subsystem contract](#contract-geographic-map-and-force-network); exact import graph not verified.
- **State ownership / data transformation:** See source-preserved notes below; not independently source-audited.
- **Implementation cautions:** Preserve the documented behavior and check current imports before changing or retiring this module.
- **Related subsystem contract:** [Open contract](#contract-geographic-map-and-force-network)
- **Related planning documents:** See [relevant subsystem contract](#contract-geographic-map-and-force-network); exact additional path not verified unless identified there.

**Detailed implementation notes (source-preserved):**


Map-stage-adjacent UI/chrome components.


#### `src/mapInteractionHandlers.js`

- **Module / path:** `src/mapInteractionHandlers.js`
- **Responsibility:** Top-level map interaction handlers.
- **Principal exports / components:** Not verified (inspect exact current module before editing).
- **Dependencies and consumers:** See the source-preserved notes below and [current subsystem contract](#contract-geographic-map-and-force-network); exact import graph not verified.
- **State ownership / data transformation:** See source-preserved notes below; not independently source-audited.
- **Implementation cautions:** Preserve the documented behavior and check current imports before changing or retiring this module.
- **Related subsystem contract:** [Open contract](#contract-geographic-map-and-force-network)
- **Related planning documents:** See [relevant subsystem contract](#contract-geographic-map-and-force-network); exact additional path not verified unless identified there.

**Detailed implementation notes (source-preserved):**


Top-level map interaction handlers.


#### `src/timelinePlaybackHelpers.js`

- **Module / path:** `src/timelinePlaybackHelpers.js`
- **Responsibility:** Pure canonical Timeline/playback derivation helpers.
- **Principal exports / components:** Not verified (inspect exact current module before editing).
- **Dependencies and consumers:** See the source-preserved notes below and [current subsystem contract](#contract-geographic-map-and-force-network); exact import graph not verified.
- **State ownership / data transformation:** See source-preserved notes below; not independently source-audited.
- **Implementation cautions:** Preserve the documented behavior and check current imports before changing or retiring this module.
- **Related subsystem contract:** [Open contract](#contract-geographic-map-and-force-network)
- **Related planning documents:** See [relevant subsystem contract](#contract-geographic-map-and-force-network); exact additional path not verified unless identified there.

**Detailed implementation notes (source-preserved):**


Pure canonical Timeline/playback derivation helpers. It consumes `row.temporalAssertions[]`, derives temporal roles, builds assertion-level entries and interval boundaries, filters ranges by temporal intersection, and deduplicates active assertion entries back to visualization rows. Legacy `parsedDate` fallback behavior has been retired. It also owns Cumulative versus Co-current playback visibility semantics and period-end checkpoints.


#### `src/timelinePlaybackComponents.jsx`

- **Module / path:** `src/timelinePlaybackComponents.jsx`
- **Responsibility:** Shared Timeline/playback panel UI boundary.
- **Principal exports / components:** Not verified (inspect exact current module before editing).
- **Dependencies and consumers:** See the source-preserved notes below and [current subsystem contract](#contract-geographic-map-and-force-network); exact import graph not verified.
- **State ownership / data transformation:** See source-preserved notes below; not independently source-audited.
- **Implementation cautions:** Preserve the documented behavior and check current imports before changing or retiring this module.
- **Related subsystem contract:** [Open contract](#contract-geographic-map-and-force-network)
- **Related planning documents:** See [relevant subsystem contract](#contract-geographic-map-and-force-network); exact additional path not verified unless identified there.

**Detailed implementation notes (source-preserved):**


Shared Timeline/playback panel UI boundary. It renders dataset-derived Time types, the selected temporal-role controls, Cumulative Events / Co-current Events mode controls and explanatory hover text, range/playback controls, and empty/unavailable states. This is the persistent bottom playback control and is distinct from the dedicated Timeline visualization workspace.


#### `src/peridotTimelineWorkspaceModel.js`

- **Module / path:** `src/peridotTimelineWorkspaceModel.js`
- **Responsibility:** Pure Timeline-workspace projection and relationship semantics.
- **Principal exports / components:** Not verified (inspect exact current module before editing).
- **Dependencies and consumers:** See the source-preserved notes below and [current subsystem contract](#contract-geographic-map-and-force-network); exact import graph not verified.
- **State ownership / data transformation:** See source-preserved notes below; not independently source-audited.
- **Implementation cautions:** Preserve the documented behavior and check current imports before changing or retiring this module.
- **Related subsystem contract:** [Open contract](#contract-geographic-map-and-force-network)
- **Related planning documents:** See [relevant subsystem contract](#contract-geographic-map-and-force-network); exact additional path not verified unless identified there.

**Detailed implementation notes (source-preserved):**


Pure Timeline-workspace projection and relationship semantics. It converts the current applied/filtered row scope into assertion-level events, preserves temporal subject/form/precision/uncertainty metadata, derives plural Evidence-backed categories and OR-based visibility, and resolves explicit mapped relationships conservatively onto distinct subject events. Do not infer connections from co-occurrence.


#### `src/peridotTimelineWorkspaceFixtures.js`

- **Module / path:** `src/peridotTimelineWorkspaceFixtures.js`
- **Responsibility:** Dependency-light Timeline-workspace regression fixtures.
- **Principal exports / components:** Not verified (inspect exact current module before editing).
- **Dependencies and consumers:** See the source-preserved notes below and [current subsystem contract](#contract-geographic-map-and-force-network); exact import graph not verified.
- **State ownership / data transformation:** See source-preserved notes below; not independently source-audited.
- **Implementation cautions:** Preserve the documented behavior and check current imports before changing or retiring this module.
- **Related subsystem contract:** [Open contract](#contract-geographic-map-and-force-network)
- **Related planning documents:** See [relevant subsystem contract](#contract-geographic-map-and-force-network); exact additional path not verified unless identified there.

**Detailed implementation notes (source-preserved):**


Dependency-light Timeline-workspace regression fixtures. Current checks cover Search-scope authority, plural temporal assertions, subject preservation, plural categories, evidence-driven category inventory/counting, OR visibility, uncertainty metadata, and relationship endpoint semantics.


#### `src/PeridotTimelineWorkspace.jsx`

- **Module / path:** `src/PeridotTimelineWorkspace.jsx`
- **Responsibility:** Dedicated Timeline visualization workspace and interaction/layout boundary.
- **Principal exports / components:** Not verified (inspect exact current module before editing).
- **Dependencies and consumers:** See the source-preserved notes below and [current subsystem contract](#contract-geographic-map-and-force-network); exact import graph not verified.
- **State ownership / data transformation:** See source-preserved notes below; not independently source-audited.
- **Implementation cautions:** Preserve the documented behavior and check current imports before changing or retiring this module.
- **Related subsystem contract:** [Open contract](#contract-geographic-map-and-force-network)
- **Related planning documents:** See [relevant subsystem contract](#contract-geographic-map-and-force-network); exact additional path not verified unless identified there.

**Detailed implementation notes (source-preserved):**


Dedicated Timeline visualization workspace and interaction/layout boundary. It owns horizontal/vertical orientation, adaptive temporal-axis rendering, event cards, fixed-size category panel, category color/shape markers, smooth wheel/button zoom, scrollbar plus click-drag panning, Inspector selection handoff, duration rendering, and the current continuous secondary-axis event/relationship layout.


#### `src/peridotEntityNetwork.js`

- **Module / path:** `src/peridotEntityNetwork.js`
- **Responsibility:** Owns generalized entity-network derivation and geographic anchor/relationship-line semantics.
- **Principal exports / components:** Not verified (inspect exact current module before editing).
- **Dependencies and consumers:** See the source-preserved notes below and [current subsystem contract](#contract-geographic-map-and-force-network); exact import graph not verified.
- **State ownership / data transformation:** See source-preserved notes below; not independently source-audited.
- **Implementation cautions:** Preserve the documented behavior and check current imports before changing or retiring this module.
- **Related subsystem contract:** [Open contract](#contract-geographic-map-and-force-network)
- **Related planning documents:** See [relevant subsystem contract](#contract-geographic-map-and-force-network); exact additional path not verified unless identified there.

**Detailed implementation notes (source-preserved):**


Owns generalized entity-network derivation and geographic anchor/relationship-line semantics. It preserves canonical entity identity and semantic relationship direction/type/label, derives multipart relationships without creating co-occurrence cliques, resolves one or more participant-place anchor roles plus the independent **Most frequent place** option, deduplicates identical entity/place coordinates, retains anchor role/provenance, and derives source-supported geographic relationship-line segments. Geographic consumers must still verify that both exact endpoint node instances are visible before rendering an edge.


#### `src/peridotEntityNetworkFixtures.js`

- **Module / path:** `src/peridotEntityNetworkFixtures.js`
- **Responsibility:** Regression fixtures for generalized relationship semantics, including multipart relationships, canonical identity preservation, direction, and repeated observations.
- **Principal exports / components:** Not verified (inspect exact current module before editing).
- **Dependencies and consumers:** See the source-preserved notes below and [current subsystem contract](#contract-geographic-map-and-force-network); exact import graph not verified.
- **State ownership / data transformation:** See source-preserved notes below; not independently source-audited.
- **Implementation cautions:** Preserve the documented behavior and check current imports before changing or retiring this module.
- **Related subsystem contract:** [Open contract](#contract-geographic-map-and-force-network)
- **Related planning documents:** See [relevant subsystem contract](#contract-geographic-map-and-force-network); exact additional path not verified unless identified there.

**Detailed implementation notes (source-preserved):**


Regression fixtures for generalized relationship semantics, including multipart relationships, canonical identity preservation, direction, and repeated observations.


#### `src/personForceLayoutHelpers.js`

- **Module / path:** `src/personForceLayoutHelpers.js`
- **Responsibility:** Pure helper logic for the pre-settled force-directed person-network layout.
- **Principal exports / components:** Not verified (inspect exact current module before editing).
- **Dependencies and consumers:** See the source-preserved notes below and [current subsystem contract](#contract-geographic-map-and-force-network); exact import graph not verified.
- **State ownership / data transformation:** See source-preserved notes below; not independently source-audited.
- **Implementation cautions:** Preserve the documented behavior and check current imports before changing or retiring this module.
- **Related subsystem contract:** [Open contract](#contract-geographic-map-and-force-network)
- **Related planning documents:** See [relevant subsystem contract](#contract-geographic-map-and-force-network); exact additional path not verified unless identified there.

**Detailed implementation notes (source-preserved):**


Pure helper logic for the pre-settled force-directed person-network layout.


<a id="module-group-search-and-interaction-resolution"></a>

#### Search and interaction resolution

**Related subsystem contract:** [Open current contract](#contract-explore-and-search)



#### `src/interactionHelpers.js`

- **Module / path:** `src/interactionHelpers.js`
- **Responsibility:** Pure interaction-resolution and selection-building helpers.
- **Principal exports / components:** Not verified (inspect exact current module before editing).
- **Dependencies and consumers:** See the source-preserved notes below and [current subsystem contract](#contract-explore-and-search); exact import graph not verified.
- **State ownership / data transformation:** See source-preserved notes below; not independently source-audited.
- **Implementation cautions:** Preserve the documented behavior and check current imports before changing or retiring this module.
- **Related subsystem contract:** [Open contract](#contract-explore-and-search)
- **Related planning documents:** See [relevant subsystem contract](#contract-explore-and-search); exact additional path not verified unless identified there.

**Detailed implementation notes (source-preserved):**


Pure interaction-resolution and selection-building helpers. This file owns helper logic for nearby candidate generation, selection resolution, cluster selection payload building, connected-correspondent ordering, `person-detail` / `place-detail` payload derivation, Unknown-as-place resolution, person-detail sent/received place-section derivation, and person-graph fallback resolution for related-person navigation from geographic contexts.

<a id="module-group-analytics-charts-ii"></a>

#### Analytics / Charts II

**Related subsystem contract:** [Open current contract](#contract-charts)



#### `src/PeridotChartsIIFoundation.jsx`

- **Module / path:** `src/PeridotChartsIIFoundation.jsx`
- **Responsibility:** Current Charts Catalogue/Builder orchestration: chart-family selection, Data & Interpretation, chart-local Filters, Appearance, chronology-scoped derivations, independently retained valid configuration, live SVG and the Builder-owned PNG export.
- **Principal exports / components:** Not verified (inspect exact current module before editing).
- **Dependencies and consumers:** See the source-preserved notes below and [current subsystem contract](#contract-charts); exact import graph not verified.
- **State ownership / data transformation:** See source-preserved notes below; not independently source-audited.
- **Implementation cautions:** Preserve the documented behavior and check current imports before changing or retiring this module.
- **Related subsystem contract:** [Open contract](#contract-charts)
- **Related planning documents:** See [relevant subsystem contract](#contract-charts); exact additional path not verified unless identified there.

**Detailed implementation notes (source-preserved):**


Current Charts Catalogue/Builder orchestration: chart-family selection, Data & Interpretation, chart-local Filters, Appearance, chronology-scoped derivations, independently retained valid configuration, live SVG and the Builder-owned PNG export. `src/AnalyticsPanel.jsx` was deliberately deleted at `8baa733`; no active navigation route should import it.


#### `src/chartsIIDataProfile.js`, `src/chartsIIFieldInventory.js`, `src/chartsIIBuilderContract.js`

- **Module / path:** `src/chartsIIDataProfile.js`, `src/chartsIIFieldInventory.js`, `src/chartsIIBuilderContract.js`
- **Responsibility:** Catalogue suitability evidence, stable Explore-scope cached field inventories, and Builder field/variable contracts.
- **Principal exports / components:** Not verified (inspect exact current module before editing).
- **Dependencies and consumers:** See the source-preserved notes below and [current subsystem contract](#contract-charts); exact import graph not verified.
- **State ownership / data transformation:** See source-preserved notes below; not independently source-audited.
- **Implementation cautions:** Preserve the documented behavior and check current imports before changing or retiring this module.
- **Related subsystem contract:** [Open contract](#contract-charts)
- **Related planning documents:** See [relevant subsystem contract](#contract-charts); exact additional path not verified unless identified there.

**Detailed implementation notes (source-preserved):**


Catalogue suitability evidence, stable Explore-scope cached field inventories, and Builder field/variable contracts. Recommendation evidence excludes geographical coordinates while retaining deliberate manual coordinate selection.


#### `src/PeridotChartsIILocalFilters.jsx`, `src/chartsIILocalFilters.js`

- **Module / path:** `src/PeridotChartsIILocalFilters.jsx`, `src/chartsIILocalFilters.js`
- **Responsibility:** Chart-only categorical/numeric filters and their UI.
- **Principal exports / components:** Not verified (inspect exact current module before editing).
- **Dependencies and consumers:** See the source-preserved notes below and [current subsystem contract](#contract-charts); exact import graph not verified.
- **State ownership / data transformation:** See source-preserved notes below; not independently source-audited.
- **Implementation cautions:** Preserve the documented behavior and check current imports before changing or retiring this module.
- **Related subsystem contract:** [Open contract](#contract-charts)
- **Related planning documents:** See [relevant subsystem contract](#contract-charts); exact additional path not verified unless identified there.

**Detailed implementation notes (source-preserved):**


Chart-only categorical/numeric filters and their UI. The chart-input scope is reduced without mutating Explore or other visualizations.


#### `src/PeridotChartsIIAppearance.jsx`, `src/chartsIIAppearance.js`, `src/peridotSharedCategoryColors.js`

- **Module / path:** `src/PeridotChartsIIAppearance.jsx`, `src/chartsIIAppearance.js`, `src/peridotSharedCategoryColors.js`
- **Responsibility:** Category/series color overrides and the shared 42-color Timeline II palette.
- **Principal exports / components:** Not verified (inspect exact current module before editing).
- **Dependencies and consumers:** See the source-preserved notes below and [current subsystem contract](#contract-charts); exact import graph not verified.
- **State ownership / data transformation:** See source-preserved notes below; not independently source-audited.
- **Implementation cautions:** Preserve the documented behavior and check current imports before changing or retiring this module.
- **Related subsystem contract:** [Open contract](#contract-charts)
- **Related planning documents:** See [relevant subsystem contract](#contract-charts); exact additional path not verified unless identified there.

**Detailed implementation notes (source-preserved):**


Category/series color overrides and the shared 42-color Timeline II palette. Also preserve chart-session sidebar-width ownership in the Builder.


#### `src/PeridotChartsIIStyle.jsx`, `src/chartsIIStyle.js`, `src/PeridotChartsIIPresentation.jsx`, `src/chartsIIPresentation.js`

- **Module / path:** `src/PeridotChartsIIStyle.jsx`, `src/chartsIIStyle.js`, `src/PeridotChartsIIPresentation.jsx`, `src/chartsIIPresentation.js`
- **Responsibility:** Family-specific mark styling and adaptive label/legend/typography controls, without changing data derivation.
- **Principal exports / components:** Not verified (inspect exact current module before editing).
- **Dependencies and consumers:** See the source-preserved notes below and [current subsystem contract](#contract-charts); exact import graph not verified.
- **State ownership / data transformation:** See source-preserved notes below; not independently source-audited.
- **Implementation cautions:** Preserve the documented behavior and check current imports before changing or retiring this module.
- **Related subsystem contract:** [Open contract](#contract-charts)
- **Related planning documents:** See [relevant subsystem contract](#contract-charts); exact additional path not verified unless identified there.

**Detailed implementation notes (source-preserved):**


Family-specific mark styling and adaptive label/legend/typography controls, without changing data derivation.


#### `src/chartsIIExport.js`

- **Module / path:** `src/chartsIIExport.js`
- **Responsibility:** Charts II SVG-to-PNG capture and optional publication annotations/provenance, using the shared `exportHelpers.js` path.
- **Principal exports / components:** Not verified (inspect exact current module before editing).
- **Dependencies and consumers:** See the source-preserved notes below and [current subsystem contract](#contract-charts); exact import graph not verified.
- **State ownership / data transformation:** See source-preserved notes below; not independently source-audited.
- **Implementation cautions:** Preserve the documented behavior and check current imports before changing or retiring this module.
- **Related subsystem contract:** [Open contract](#contract-charts)
- **Related planning documents:** See [relevant subsystem contract](#contract-charts); exact additional path not verified unless identified there.

**Detailed implementation notes (source-preserved):**


Charts II SVG-to-PNG capture and optional publication annotations/provenance, using the shared `exportHelpers.js` path. Keep Builder presentation and export-only annotations distinct.


#### `src/chartsII*Data.js`

- **Module / path:** `src/chartsII*Data.js`
- **Responsibility:** Per-family analytical derivations for temporal series, Scatter/Bubble, Box Plot, Dot Plot, Slope Chart, Treemap and related chart families.
- **Principal exports / components:** Not verified (inspect exact current module before editing).
- **Dependencies and consumers:** See the source-preserved notes below and [current subsystem contract](#contract-charts); exact import graph not verified.
- **State ownership / data transformation:** See source-preserved notes below; not independently source-audited.
- **Implementation cautions:** Preserve the documented behavior and check current imports before changing or retiring this module.
- **Related subsystem contract:** [Open contract](#contract-charts)
- **Related planning documents:** See [relevant subsystem contract](#contract-charts); exact additional path not verified unless identified there.

**Detailed implementation notes (source-preserved):**


Per-family analytical derivations for temporal series, Scatter/Bubble, Box Plot, Dot Plot, Slope Chart, Treemap and related chart families. Retain canonical date precision, missing/invalid exclusions, outlier semantics and additive normalization, respectively.


#### `src/analyticsConfig.js`

- **Module / path:** `src/analyticsConfig.js`
- **Responsibility:** Retained shared/compatibility chart definitions and curated variable metadata.
- **Principal exports / components:** Not verified (inspect exact current module before editing).
- **Dependencies and consumers:** See the source-preserved notes below and [current subsystem contract](#contract-charts); exact import graph not verified.
- **State ownership / data transformation:** See source-preserved notes below; not independently source-audited.
- **Implementation cautions:** Preserve the documented behavior and check current imports before changing or retiring this module.
- **Related subsystem contract:** [Open contract](#contract-charts)
- **Related planning documents:** See [relevant subsystem contract](#contract-charts); exact additional path not verified unless identified there.

**Detailed implementation notes (source-preserved):**


Retained shared/compatibility chart definitions and curated variable metadata. This file does **not** own a live Charts I route; verify active imports before removing any compatibility metadata.


#### `src/analyticsDerivationHelpers.js`

- **Module / path:** `src/analyticsDerivationHelpers.js`
- **Responsibility:** Retained shared analytical field discovery, numeric measures, normalization and semantic aliases consumed by Charts II's Builder and profile helpers.
- **Principal exports / components:** Not verified (inspect exact current module before editing).
- **Dependencies and consumers:** See the source-preserved notes below and [current subsystem contract](#contract-charts); exact import graph not verified.
- **State ownership / data transformation:** See source-preserved notes below; not independently source-audited.
- **Implementation cautions:** Preserve the documented behavior and check current imports before changing or retiring this module.
- **Related subsystem contract:** [Open contract](#contract-charts)
- **Related planning documents:** See [relevant subsystem contract](#contract-charts); exact additional path not verified unless identified there.

**Detailed implementation notes (source-preserved):**


Retained shared analytical field discovery, numeric measures, normalization and semantic aliases consumed by Charts II's Builder and profile helpers. The original Charts I aggregation contracts are historical and must not be mistaken for a live `AnalyticsPanel.jsx` consumer.

Dynamic variable detection should exclude technical or non-categorical fields such as IDs, latitude/longitude fields, date fields, mappability flags, object/array values, purely numeric values, long note-like fields, and near-unique row identifiers.


#### `src/analyticsChartComponents.jsx`

- **Module / path:** `src/analyticsChartComponents.jsx`
- **Responsibility:** Owns the active Charts II SVG chart components and shared chart frame, tooltip, axis, summary/legend and mark geometry across all 15 chart families, including the newer Area, Scatter/Bubble, Box Plot, Dot Plot, Slope Chart and Treemap renderers.
- **Principal exports / components:** Not verified (inspect exact current module before editing).
- **Dependencies and consumers:** See the source-preserved notes below and [current subsystem contract](#contract-charts); exact import graph not verified.
- **State ownership / data transformation:** See source-preserved notes below; not independently source-audited.
- **Implementation cautions:** Preserve the documented behavior and check current imports before changing or retiring this module.
- **Related subsystem contract:** [Open contract](#contract-charts)
- **Related planning documents:** See [relevant subsystem contract](#contract-charts); exact additional path not verified unless identified there.

**Detailed implementation notes (source-preserved):**


Owns the active Charts II SVG chart components and shared chart frame, tooltip, axis, summary/legend and mark geometry across all 15 chart families, including the newer Area, Scatter/Bubble, Box Plot, Dot Plot, Slope Chart and Treemap renderers. It accepts chart-specific color, mark-style and presentation configuration and produces the SVG captured by the Charts II PNG exporter.

The shared chart tooltip uses a mossy/title-green background with light text for legibility over dense charts such as heatmaps. Axis and panel styling should stay legible against the warm chart-paper background and should not depend on hover-only disclosure for core values. Keep chart-card geometry centralized through the shared layout helper rather than reintroducing unrelated per-chart spacing constants.

<a id="module-group-inspector"></a>

#### Inspector

**Related subsystem contract:** [Open current contract](#contract-inspector)



#### `src/LeftControlPanel.jsx`

- **Module / path:** `src/LeftControlPanel.jsx`
- **Responsibility:** Compact Inspector side-panel shell.
- **Principal exports / components:** Not verified (inspect exact current module before editing).
- **Dependencies and consumers:** See the source-preserved notes below and [current subsystem contract](#contract-inspector); exact import graph not verified.
- **State ownership / data transformation:** See source-preserved notes below; not independently source-audited.
- **Implementation cautions:** Preserve the documented behavior and check current imports before changing or retiring this module.
- **Related subsystem contract:** [Open contract](#contract-inspector)
- **Related planning documents:** See [relevant subsystem contract](#contract-inspector); exact additional path not verified unless identified there.

**Detailed implementation notes (source-preserved):**


Compact Inspector side-panel shell. Earlier rail/workflow content has been removed. This file now exists primarily to preserve visualization-click Inspector behavior: node, edge, and cluster clicks still open the compact Inspector while deeper evidence navigation routes into the full Inspector workspace.

The old `showRightSidebar` naming remains semantically stale but compatibility-sensitive. Do not rename this path casually; explicitly test node click, edge click, cluster click, contained member navigation, compact close, Expand, and Back behavior before changing it.


#### `src/InspectorPanel.jsx`

- **Module / path:** `src/InspectorPanel.jsx`
- **Responsibility:** Owns inspector content only.
- **Principal exports / components:** Not verified (inspect exact current module before editing).
- **Dependencies and consumers:** See the source-preserved notes below and [current subsystem contract](#contract-inspector); exact import graph not verified.
- **State ownership / data transformation:** See source-preserved notes below; not independently source-audited.
- **Implementation cautions:** Preserve the documented behavior and check current imports before changing or retiring this module.
- **Related subsystem contract:** [Open contract](#contract-inspector)
- **Related planning documents:** See [relevant subsystem contract](#contract-inspector); exact additional path not verified unless identified there.

**Detailed implementation notes (source-preserved):**


Owns inspector content only. It no longer owns the outer panel shell. It renders the inspector header, inspector-internal Back button, and `InspectorBodyRouter`.


#### `src/InspectorBodyRouter.jsx`

- **Module / path:** `src/InspectorBodyRouter.jsx`
- **Responsibility:** Routes resolved inspector state to the appropriate extracted view.
- **Principal exports / components:** Not verified (inspect exact current module before editing).
- **Dependencies and consumers:** See the source-preserved notes below and [current subsystem contract](#contract-inspector); exact import graph not verified.
- **State ownership / data transformation:** See source-preserved notes below; not independently source-audited.
- **Implementation cautions:** Preserve the documented behavior and check current imports before changing or retiring this module.
- **Related subsystem contract:** [Open contract](#contract-inspector)
- **Related planning documents:** See [relevant subsystem contract](#contract-inspector); exact additional path not verified unless identified there.

**Detailed implementation notes (source-preserved):**


Routes resolved inspector state to the appropriate extracted view.


#### `src/InspectorEmptyState.jsx`

- **Module / path:** `src/InspectorEmptyState.jsx`
- **Responsibility:** Owns the empty inspector state.
- **Principal exports / components:** Not verified (inspect exact current module before editing).
- **Dependencies and consumers:** See the source-preserved notes below and [current subsystem contract](#contract-inspector); exact import graph not verified.
- **State ownership / data transformation:** See source-preserved notes below; not independently source-audited.
- **Implementation cautions:** Preserve the documented behavior and check current imports before changing or retiring this module.
- **Related subsystem contract:** [Open contract](#contract-inspector)
- **Related planning documents:** See [relevant subsystem contract](#contract-inspector); exact additional path not verified unless identified there.

**Detailed implementation notes (source-preserved):**


Owns the empty inspector state.


#### `src/InspectorClusterView.jsx`

- **Module / path:** `src/InspectorClusterView.jsx`
- **Responsibility:** Owns the cluster inspector view.
- **Principal exports / components:** Not verified (inspect exact current module before editing).
- **Dependencies and consumers:** See the source-preserved notes below and [current subsystem contract](#contract-inspector); exact import graph not verified.
- **State ownership / data transformation:** See source-preserved notes below; not independently source-audited.
- **Implementation cautions:** Preserve the documented behavior and check current imports before changing or retiring this module.
- **Related subsystem contract:** [Open contract](#contract-inspector)
- **Related planning documents:** See [relevant subsystem contract](#contract-inspector); exact additional path not verified unless identified there.

**Detailed implementation notes (source-preserved):**


Owns the cluster inspector view. Current behavior groups contained members by place and sorts groups/members by represented visible volume.


#### `src/InspectorEdgeView.jsx`

- **Module / path:** `src/InspectorEdgeView.jsx`
- **Responsibility:** Owns the edge inspector state boundary.
- **Principal exports / components:** Not verified (inspect exact current module before editing).
- **Dependencies and consumers:** See the source-preserved notes below and [current subsystem contract](#contract-inspector); exact import graph not verified.
- **State ownership / data transformation:** See source-preserved notes below; not independently source-audited.
- **Implementation cautions:** Preserve the documented behavior and check current imports before changing or retiring this module.
- **Related subsystem contract:** [Open contract](#contract-inspector)
- **Related planning documents:** See [relevant subsystem contract](#contract-inspector); exact additional path not verified unless identified there.

**Detailed implementation notes (source-preserved):**


Owns the edge inspector state boundary.


#### `src/InspectorNodeView.jsx`

- **Module / path:** `src/InspectorNodeView.jsx`
- **Responsibility:** Owns the node / person-detail / place-detail inspector boundary.
- **Principal exports / components:** Not verified (inspect exact current module before editing).
- **Dependencies and consumers:** See the source-preserved notes below and [current subsystem contract](#contract-inspector); exact import graph not verified.
- **State ownership / data transformation:** See source-preserved notes below; not independently source-audited.
- **Implementation cautions:** Preserve the documented behavior and check current imports before changing or retiring this module.
- **Related subsystem contract:** [Open contract](#contract-inspector)
- **Related planning documents:** See [relevant subsystem contract](#contract-inspector); exact additional path not verified unless identified there.

**Detailed implementation notes (source-preserved):**


Owns the node / person-detail / place-detail inspector boundary. It renders the scholarly reference-entry Inspector layout: lead summary, optional image/placeholder, compact summary facts, role-grouped connected places and people, directed connections, expandable high-volume lists, canonical subject-aware Evidence for the selected entity, selected compatibility fields, and connected-record navigation entry points. It also preserves **Unknown** as a place-like bucket when source/target location values are missing or unresolved.


#### `src/InspectorConnectedCorrespondents.jsx`

- **Module / path:** `src/InspectorConnectedCorrespondents.jsx`
- **Responsibility:** Inspector navigation component for person-to-person movement.
- **Principal exports / components:** Not verified (inspect exact current module before editing).
- **Dependencies and consumers:** See the source-preserved notes below and [current subsystem contract](#contract-inspector); exact import graph not verified.
- **State ownership / data transformation:** See source-preserved notes below; not independently source-audited.
- **Implementation cautions:** Preserve the documented behavior and check current imports before changing or retiring this module.
- **Related subsystem contract:** [Open contract](#contract-inspector)
- **Related planning documents:** See [relevant subsystem contract](#contract-inspector); exact additional path not verified unless identified there.

**Detailed implementation notes (source-preserved):**


Inspector navigation component for person-to-person movement.


#### `src/InspectorPersonPlaces.jsx`

- **Module / path:** `src/InspectorPersonPlaces.jsx`
- **Responsibility:** Inspector navigation component for person-to-place movement.
- **Principal exports / components:** Not verified (inspect exact current module before editing).
- **Dependencies and consumers:** See the source-preserved notes below and [current subsystem contract](#contract-inspector); exact import graph not verified.
- **State ownership / data transformation:** See source-preserved notes below; not independently source-audited.
- **Implementation cautions:** Preserve the documented behavior and check current imports before changing or retiring this module.
- **Related subsystem contract:** [Open contract](#contract-inspector)
- **Related planning documents:** See [relevant subsystem contract](#contract-inspector); exact additional path not verified unless identified there.

**Detailed implementation notes (source-preserved):**


Inspector navigation component for person-to-place movement. It shows two explicit sections:

- **Places this person sent letters to**
- **Places where this person received letters**


#### `src/InspectorBackButton.jsx`

- **Module / path:** `src/InspectorBackButton.jsx`
- **Responsibility:** Inspector-internal Back button.
- **Principal exports / components:** Not verified (inspect exact current module before editing).
- **Dependencies and consumers:** See the source-preserved notes below and [current subsystem contract](#contract-inspector); exact import graph not verified.
- **State ownership / data transformation:** See source-preserved notes below; not independently source-audited.
- **Implementation cautions:** Preserve the documented behavior and check current imports before changing or retiring this module.
- **Related subsystem contract:** [Open contract](#contract-inspector)
- **Related planning documents:** See [relevant subsystem contract](#contract-inspector); exact additional path not verified unless identified there.

**Detailed implementation notes (source-preserved):**


Inspector-internal Back button. It uses a small local history model for inspector-internal navigation only and does not track ordinary map clicks as navigation history.

---


<a id="module-group-theme-styles-and-visual-language"></a>

#### Theme, styles, and visual language

**Related subsystem contract:** [Open current contract](#contract-themes-editorial-presentation-and-loading)



#### `src/peridotTheme.js`

- **Module / path:** `src/peridotTheme.js`
- **Responsibility:** Semantic theme control surface for the whole app.
- **Principal exports / components:** Not verified (inspect exact current module before editing).
- **Dependencies and consumers:** See the source-preserved notes below and [current subsystem contract](#contract-themes-editorial-presentation-and-loading); exact import graph not verified.
- **State ownership / data transformation:** See source-preserved notes below; not independently source-audited.
- **Implementation cautions:** Preserve the documented behavior and check current imports before changing or retiring this module.
- **Related subsystem contract:** [Open contract](#contract-themes-editorial-presentation-and-loading)
- **Related planning documents:** See [relevant subsystem contract](#contract-themes-editorial-presentation-and-loading); exact additional path not verified unless identified there.

**Detailed implementation notes (source-preserved):**


Semantic theme control surface for the whole app. It defines source palettes, custom theme override storage, palette import targets, the finite 30-color default chart series library, semantic role construction, legacy color adaptation, map/network roles, chart roles, navigation chrome roles, timeline roles, search roles, Inspector/search roles, and CSS-variable export. Chart-targeted palette imports should override only `analytics.series`, while the legacy compatibility adapter should not use chart-only overrides to recolor unrelated chrome.

Future color work should start here unless a component genuinely lacks a theme role. Do not scatter new hardcoded colors through chart, Inspector, map, or workspace components when the correct fix is to extend the semantic theme roles.


#### `src/peridotThemeRoleMetadata.js`

- **Module / path:** `src/peridotThemeRoleMetadata.js`
- **Responsibility:** Human-facing metadata for theme roles and role groups used by the Themes and Accessibility workspace.
- **Principal exports / components:** Not verified (inspect exact current module before editing).
- **Dependencies and consumers:** See the source-preserved notes below and [current subsystem contract](#contract-themes-editorial-presentation-and-loading); exact import graph not verified.
- **State ownership / data transformation:** See source-preserved notes below; not independently source-audited.
- **Implementation cautions:** Preserve the documented behavior and check current imports before changing or retiring this module.
- **Related subsystem contract:** [Open contract](#contract-themes-editorial-presentation-and-loading)
- **Related planning documents:** See [relevant subsystem contract](#contract-themes-editorial-presentation-and-loading); exact additional path not verified unless identified there.

**Detailed implementation notes (source-preserved):**


Human-facing metadata for theme roles and role groups used by the Themes and Accessibility workspace. This file should stay aligned with `peridotTheme.js` so users can understand what each role controls and so palette imports remain explainable.


#### `src/peridotColorPalette.js`

- **Module / path:** `src/peridotColorPalette.js`
- **Responsibility:** Legacy compatibility palette adapter.
- **Principal exports / components:** Not verified (inspect exact current module before editing).
- **Dependencies and consumers:** See the source-preserved notes below and [current subsystem contract](#contract-themes-editorial-presentation-and-loading); exact import graph not verified.
- **State ownership / data transformation:** See source-preserved notes below; not independently source-audited.
- **Implementation cautions:** Preserve the documented behavior and check current imports before changing or retiring this module.
- **Related subsystem contract:** [Open contract](#contract-themes-editorial-presentation-and-loading)
- **Related planning documents:** See [relevant subsystem contract](#contract-themes-editorial-presentation-and-loading); exact additional path not verified unless identified there.

**Detailed implementation notes (source-preserved):**


Legacy compatibility palette adapter. Prefer `peridotTheme.js` for new color work; keep this file available for older component paths that still import legacy tokens.

<a id="module-group-export-and-shared-utilities"></a>

#### Export and shared utilities

**Related subsystem contract:** [Open current contract](#contract-exports)



#### `src/exportHelpers.js`

- **Module / path:** `src/exportHelpers.js`
- **Responsibility:** Pure export utilities and export row-builder helpers.
- **Principal exports / components:** Not verified (inspect exact current module before editing).
- **Dependencies and consumers:** See the source-preserved notes below and [current subsystem contract](#contract-exports); exact import graph not verified.
- **State ownership / data transformation:** See source-preserved notes below; not independently source-audited.
- **Implementation cautions:** Preserve the documented behavior and check current imports before changing or retiring this module.
- **Related subsystem contract:** [Open contract](#contract-exports)
- **Related planning documents:** See [relevant subsystem contract](#contract-exports); exact additional path not verified unless identified there.

**Detailed implementation notes (source-preserved):**


Pure export utilities and export row-builder helpers.

</details>

<a id="10-fragile-zones-and-regression-test-matrix"></a>

### Fragile zones and regression matrix

- **Affected behavior and modules:** See the original subsystem-by-subsystem matrix below
- **Failure mechanism:** State coupling, stale source, accidental semantic changes and UI lifecycle/layout failures
- **What can break:** Routing, chronology, mapping, data scope, visualization, Inspector, export, presentation
- **Preservation requirements:** Respect Level 2 invariants and the Charter's fragile-zone preflight
- **Automated tests:** Run focused modules in `src/` where present; passing tests do not prove deployed behavior
- **Manual regression checks:** Follow the complete original matrix and the Level 2 subsystem-specific checks
- **Related planning documents:** Timeline horizontal-scroll risk plan; relevant architecture and persistence plans as cited by subsystem

#### Current practical regression matrix

This is the active checklist, using the documented current Home/Tutorials contract. Historical testing expectations remain available in the Changelog and preceding source history.

| Fragile zone | Typical regression | Minimum test |
|---|---|---|
| Loading overlay / preboot | wrong first-frame still, blank handoff, remounted/stalled worker, missing switch animation | cold boot and production preview; long mapped-data confirmation; repeated heavy visualization switches; reduced motion and fallback |
| First-load Map viewport | empty stage on first upload; viewport measured only on return | load large workbook directly into Map, assert positive viewport and populated stage without switching; resize/return, preserve chronology-first fit |
| Workspace routing | wrong workspace or lost state | Home/upload/sample actions and each persistent-header route; preserve cross-page data and viewport state |
| First-time tutorial | obsolete Home launcher reappears, or future launcher regresses overlay behavior | now: one Get Started Home action and Tutorials Coming Soon destination; no disabled secondary Home button or floating invitation; when re-enabled: full seven-stage suite |
| Inspector bridge | compact Inspector fails to open | node, edge, cluster, contained member, Expand, Back |
| Compact Inspector and Charts provenance | stale chart mark, category-tab accidental selection, repeated mapped fields, missing number shown as zero, inaccessible contributors | event/period only clicks, category editor, expanded disclosure pointer exit, chart mark selection across all families, mapped Unique ID and generated fallback, filter/search/show more, Builder exit, Treemap drill-down |
| Search scope | generalized place/Evidence values disappear, count conditions mis-scope, or Results/facets use playback visibility | draft suggestion, Apply, Clear, attached count conditions, Place/Evidence criteria, pagination, Inspect handoff during playback |
| Geographic Map / Network | hidden endpoints, wrong anchor role, viewport reset, or correspondence-shaped playback | toggle node labels/anchors; Apply/Reset; relationship-line fallback; pan/zoom; multipart playback; Force/Geographic switch |
| Timeline workspace | wrong chronology/orientation, grouped lane precedence, missing scrollbar thumb, clipped scroll extent, zoom/pan regression, category mis-filter, card collision, or invented relationship | Correspondence / Family Tree / Cardinals; Chronological vs Grouped; star/unstar; No priority category; horizontal/vertical; resize and drag native scrollbar to Icons; wheel/+/- zoom; Inspector and shared chronology |
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
| Chart rendering/export | mismatched calculations, labels, colors, annotation clipping, or PNG | all 15 Charts II families; manual series, filters/chronology, adaptive labels, style resets, and publication PNG |
| Theme roles | chart-only changes recolor chrome | apply chart-targeted palette and inspect map/header |
| Export | wrong output scope or broken render | map PNG/SVG, CSV, chart PNG |

<details>
<summary><strong>Open complete source-preserved fragile-zone checklist and regression matrix</strong></summary>

**Historical correction:** The previous source matrix checked an obsolete disabled secondary Home Tutorial button. The current matrix above uses the accepted single Get Started action and the separate Tutorials destination. The former test wording was: `now: disabled secondary Home button + tooltip + no floating invitation; when re-enabled: full seven-stage suite`. The original misplaced Markdown separator was a formatting error, not an architectural constraint.


**Shared chronology regression contract (accepted `4fca872`):** for Map, Network, Timeline and Charts, check Reset's 10%-padded unfiltered domain, common year ticks, fixed gold Data extent endpoints, independently remembered windows, empty selected historical ranges, exact intersections with mixed-precision dates and periods, Cumulative/Concurrent playback, Search/temporal-role invariance, dataset replacement and Timeline orientation. Run the four `src/peridotChronology*.test.mjs` focused Node tests and a production build when chronology implementation changes. Visual and performance regression checks remain separate; preserve Charts II uncommitted work when touching shared application/shell files.



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
- Charts II Catalogue/Builder state, cached field discovery and recommendations, 15 chart families, chart-local filters, responsive Appearance divider, adaptive labels and independent SVG-to-PNG export;
- Search active-dataset state, especially draft/apply coordination across keyword, person, place, relationship, date, weight, Timeline, Analytics, Inspector, and Export;
- archived MapLibre work if it is ever explicitly resumed.

</details>

<a id="11-active-technical-backlog"></a>

### Active technical backlog

**Current priorities from the uploaded guide and confirmed source-development history:** Timeline event-density/coincident-event readability, cross-layout and accessibility/Inspector regressions, targeted Network/Map presentation and generalized Search text follow-ups, interface/tutorial work, and careful later compatibility review. Event-to-event Timeline arcs remain deferred pending a source-defensible authoring contract. Charts II is implemented and Charts I retired. See the Changelog for completed milestones.

**Current Inspector continuation after `01b03bc` (ordered):** (1) Audit and repair selectable Geographic Map / Force Network edges with correct endpoints, direction, relationship evidence and overlapping mark hit targets; (2) complete cross-visualization compact Inspector regression for Map, Network, Timeline, and Charts, including filters, playback, panel resizing, disclosure persistence and chart Builder exit; (3) add context-sensitive **Adjust visualization settings** navigation within Next steps without resetting selection/state; (4) separately redesign the expanded dossier, then Explore. **Separate deferred task:** verify automatic Timeline II category and Charts II series color assignment uses the full intended palette, stable mappings, distinguishable marks and respected researcher overrides. Do not silently combine this audit with Inspector passes.

The longer backlog below is retained as an **historical planning record**, not a second set of current instructions. Several entries were overtaken by completed work (notably Charts II and the single-action Home). Assess each item against the current contract before treating it as active.

- **Current status:** Current priorities summarized above; detailed older planning record follows
- **Ownership:** See Level 2 corresponding subsystem contracts
- **Constraints:** Do not revive legacy or deferred work without explicit authorization and current-source review
- **Verification:** Scope and acceptance tests must be set separately for every bounded pass
- **Related planning documents:** Relevant linked plans in Level 2; Changelog historical milestones

<details>
<summary><strong>Open historical accumulated technical backlog (source-preserved)</strong></summary>


**Timeline priorities updated 2026-11-11 (`f5791f1`):** Grouped researcher-starred category swimlanes, adaptive lane geometry, and the five-column Categories editor with a browser-accepted native horizontal scrollbar are now implemented. Next: **event-density overview and carefully justified handling of coincident events**; then multi-orientation/keyboard/Inspector/uncertainty/large-data regression checks and consideration of durable researcher-owned configurations. Preserve the Timeline-only stage-wrapper shrink constraint and check other visualization widths if refactoring the shared shell. **Event-to-event relationship arcs are on hold** because arbitrary representative-event selection can fabricate relationships; require explicit source-backed/event-authored connection semantics first. Charts II is committed, and the legacy Charts I implementation was retired at `8baa733`; see the current Analytics / Charts II contract. The original note about concurrent uncommitted development is historical. The older numbered list is historical, including its superseded immediate-relationship priority.



**Cleanup status update (2026-11-01):** The previous import-performance investigation closed with the `481acd9` capability-scan optimization. The repository-level legacy importer audit was completed read-only and recommended **no code deletions**; future retirement requires a fresh dependency/fixture review. Dedicated worker-race and dependency-security follow-ups are excluded from the present cleanup cycle by researcher choice, while comprehensive regression-fixture review is **deferred**. This does not change the existing active Timeline, Network, Explore, and Analytics priorities below.

**Deferred mapping architecture (2026-10-28):** multiple independent relationships per source row need a new grouping layer above `relationshipParts`, with corresponding workbook, runtime, canonical model, Inspector, Network, and export handling. Progressive form activation is already implemented and should not be mistaken for this feature.


**Cartographic Editorial active visual work (separate from the older technical priority order):** `c71e265` was an earlier clean, synchronized checkpoint; the earlier `4e6fb11` editorial Home and button work has since been refined by `7280e30`, `2117659`, and `60b8643`. The Florence/paper hero, full-width banner, corner-collage frame, and optical content position are accepted; do not revive the earlier green title card or rejected H2f diagonal. Remaining visual work is targeted CSS/token cleanup, consistent buttons and workspaces, tutorial content, and verification across supported desktop viewport sizes. Asset publication is confirmed by Git, but licensing/redistribution rights are **not** established merely by the push. Preserve attribution notes and verify the applicable licenses separately. The present art direction prioritizes full-screen desktop; minimum supported viewport enforcement remains unresolved.


1. **Timeline relationship rendering / connection legibility — historical priority; now deferred.**
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

##### Rolled-back playback-animation experiments — do not resume from discarded code

After generalized playback highlighting was implemented, several local-only animation prototypes explored SVG entrance animation, `requestAnimationFrame` tweening, screen-space geometry interpolation, dormant assets, and transient node/cluster/edge effects. Testing showed repeated semantic and rendering problems: high-speed playback became erratic; clusters could retrigger or appear to re-enter; screen-space geometry tweening caused nodes to detach from a panned map and snap back; and rapid graph-state changes did not support the intended cinematic animation language reliably.

The project deliberately rolled back to the clean generalized **pre-animation** `App.jsx` and committed that state as `ddc0aca`. None of the experimental playback-animation machinery is part of current `main`. If playback animation is reconsidered, start from `ddc0aca` (or its descendant) and a new architecture/design audit. Do not copy code from the abandoned animation ZIPs or assume their dormant-scene/tween approaches are accepted architecture.

</details>

<a id="12-archived-and-compatibility-paths"></a>

### Compatibility and historical paths

- **Current status:** Archived or compatibility paths only unless otherwise stated
- **Reason for retention:** Historical recoverability, production-reachable adapters and preserved regression knowledge
- **Active dependencies:** Module-specific; verify actual import graph before removal
- **Preservation cautions:** Do not revive archived MapLibre, retired Timeline I or old Charts I UI by inference
- **Related history:** Changelog historical work and rollbacks
- **Safe retirement conditions:** Read-only dependency/fixture audit plus bounded tests before deletion
- **Related planning documents:** `planning_documents/PERIDOT_CODE_STRUCTURE_AUDIT.md` (recorded in original guide)

<details>
<summary><strong>Open complete source-preserved compatibility and archive records</strong></summary>


##### Legacy importer retirement classification — read-only audit (2026-11-01)

The November 1 source/import-graph audit classified the old Universal Upload Prototype UI, test harness, and related prototype engine as **outside the inspected active-app import graph**, not as automatically safe deletions. `peridotUniversalRuntimeCompatibility.js` and `peridotNormalizationShadowAudit.js` still have regression-fixture/parity roles. The production model still depends on `peridotLegacyCompatibilityAdapter.js`, correspondence-profile processing, and genealogy-related mapping/runtime code. The repository-level check did not find legacy-importer entries in normal npm scripts, the GitHub Pages workflow, or the itch.io packaging script, but this is not an exhaustive audit of manually invoked tests or every historical entry point.

**Disposition: retain all of these files; no deletion performed.** The regression-fixture review is explicitly deferred. The available source archive predates the optimization at `481acd9`; inspect exact current source and dependent fixtures before any future retirement. Historical experiment preservation is a project goal, not evidence of a production dependency.



##### Canonical correspondence/genealogy adapters and profile vocabulary — active internal compatibility paths

The generalized public mapping architecture is authoritative. Current downstream consumers may still receive established correspondence-shaped row structures through `peridotLegacyCompatibilityAdapter.js` / `peridotCanonicalRuntimeModel.js`, while genealogy-specific canonical/runtime modules may still provide specialized projection behavior. The public Data workflow no longer exposes Correspondence / Directed Record versus Genealogy / Person-Centered as a required choice.

These modules are **active internal compatibility/specialization boundaries**, not automatically dead code. Do not remove them merely because the generalized public workflow has superseded profile selection. Remove or collapse them only after remaining consumers have migrated or been shown not to need them. The separate legacy date interpretation path and embedded sample fallback are already retired.

##### MapLibre migrated-overlay branch paused / active preview removed

The later `maplibre-native-geographic-view` branch remains an archived experiment. Active `main` no longer contains the dormant MapLibre preview files or dependency after `55a368c`. The removed active-main preview path included `src/MapLibreMapStage.jsx`, `src/mapStyleConfig.js`, and the `maplibre-gl` dependency.

If MapLibre work resumes, begin with a fresh source-of-truth audit and intentionally reintroduce any required package dependencies and stage files. Do not assume the old experiment can be merged directly.

##### Shared-panel semantic prop rename

An attempted cleanup of old `showLeftSidebar` / `showRightSidebar` compatibility names was rolled back because it broke inspector auto-open behavior from node, edge, and cluster clicks.

Do not rename this compatibility path casually. If revisited, explicitly test:

- node click opens Inspector
- edge click opens Inspector
- cluster click opens Inspector
- contained cluster member opens detail
- Back behavior still works

##### Responsive side-panel sizing

An attempted universal responsive positioning change for the shared side panel was rolled back because it disrupted the normal full-size landscape layout and forced scrolling before the map.

Future responsive work should be a narrow-window-specific override, not a universal replacement of the panel positioning model.

---

The archived MapLibre branch, legacy side-panel naming, and responsive panel lessons remain relevant only as labeled compatibility/history context. For the complete chronology and all rolled-back records, see the Changelog.

</details>

<a id="13-fresh-chat-handoff-essentials"></a>

### Fresh-maintainer handoff

**Audience:** A new human maintainer or a fresh AI conversation without historical chat context.

1. Confirm the latest `git status`/`git log` rather than treating a documentation-only checkpoint as proof of source changes; the latest supplied aligned checkpoint is `2be3ea0`.
2. Identify the local project source of truth: `C:\Users\haley\OneDrive\Desktop\Peridot\` on `main`. Use `npm.cmd run dev` locally.
3. Read the Project Workflow Charter before edits, then navigate from Level 1 to the relevant Level 2 contract and Level 3 regression/module entry.
4. Verify current raw source files in full before editing; preserve already applied changes and keep passes bounded.
5. Consult the *current* technical backlog above, not the historical backlog snapshot. Use the Changelog for commit chronology and verification history.

**Source availability check before requesting uploads (handoff reminder; the Charter remains authoritative):** Before asking the researcher for source files, inventory accessible original full-file uploads, source archives, and the assistant’s own complete replacement artifacts. Establish the latest relevant baseline, check which subsequent accepted or committed replacements affect the specific files in scope, and verify that the resulting *exact current* full-file contents are available for inspection. A new conversation, a new pass, or a later documentation/planning-only commit is **not**, by itself, grounds for another upload. Do not equate a Git hash or file-summary narrative with access to the exact current file. If an intervening change is not verifiable, or the required complete current file cannot be established, request **only the specific missing or uncertain files**, explaining the gap; never reconstruct source from remembered code or excerpts as a substitute for the Charter’s exact-raw-source rule.

**Researcher-facing command convention:** For review, use concise Git summaries (`git diff --stat`, `git diff --name-only`, `git diff --check`, `git status --short`), not full textual `git diff` output unless explicitly requested. After source-file replacement/copy instructions, include `npm.cmd run dev` so the researcher can immediately launch the local browser test. A development-server command is not necessary for documentation-only edits. The binding process wording for these reminders belongs in the Project Workflow Charter at the next formal core-documentation synchronization; this Guide records their practical handoff application in the meantime.

**Status reminders:** sole public Timeline is implemented by Timeline II; sole public Charts uses Charts II and has 15 families; Peridot begins with no dataset; generalized mappings and canonical semantic attribution remain authoritative; shared chronology dock uses consistent date-faithful behavior.

- **Purpose:** Reliable independent continuation without access to prior conversations
- **Source of truth:** Verified local current files, with clean Git checkpoint when established
- **Initial actions:** Confirm Git alignment, read Charter, choose subsystem contract, inspect exact raw source
- **Known high risk work:** Shared App orchestration, chronology, Search scope, mapping, Inspector, export, CSS and coupled presentation
- **Verification:** Run targeted tests and browser acceptance checks for the chosen scope
- **Related documents:** README, Charter, Changelog and appropriate planning documents

<details>
<summary><strong>Open earlier fresh-chat handoff as historical evidence (superseded)</strong></summary>

This is **not the current checkout instruction**: its `ea7cda8` status and anticipated Phase 3 Charts work were superseded by later commits. The text is retained unchanged below as historical documentation.


A future chat should start from:

- source of truth folder: `C:\Users\haley\OneDrive\Desktop\Peridot\`
- active branch: `main`
- current synchronized checkpoint: **`ea7cda8`**, with `HEAD`, `origin/main`, and `origin/HEAD` aligned in the latest user-provided Git output; the working tree remains **not clean** due only to separate Charts II development
- local development command on the user's machine: **`npm.cmd run dev`**
- current active Timeline: the Timeline II implementation is the sole public Timeline tab, with horizontal/vertical calendar-day rendering and optimized event packing. Earlier original Timeline I category/card/connection contracts remain historical unless verified in the live implementation. Generalized categories and starred adaptive Grouped swimlanes are accepted; event-density and coincident-event readability are next. Event-to-event relationship arcs remain deferred rather than automatically inferred.
- `PeridotChronologyDock.jsx` is the single shared chronology interface; Map/Network/Charts use `PeridotSharedChronologyAdapter.jsx` and the active Timeline uses `PeridotTimelineII.jsx`, with consistent calendar-day domain/ticks, independent session persistence, canonical calendar filtering, source-extent 10% padding and approved gold-diamond Data extent markers. Tests in `src/peridotChronology*.test.mjs` are focused regressions, not browser automation.

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
- the accepted Home is the art-directed Cartographic Editorial Florence composition with one Get Started action leading to the Data onboarding tabs, New to Peridot? guidance, and an informational three-column parchment banner framed by two corner collages; the earlier Home CTAs and the historical centered disabled Tutorial button belong to previous Home versions. The dedicated Tutorials public navigation destination remains; existing tutorial code is retained for later revision;
- MapLibre remains archived.

For the current **visual redesign continuation**, start from the committed Cartographic Editorial Home/Visualize layout through `5e785ed`, preserve both lower-banner corner collages and the optically shifted informational grid, and distinguish asset-license verification from code-push status. Further visual changes should be separately bounded rather than reopening the accepted composition. The **current Timeline backlog priority** is evidence-faithful event-density/coincident-event readability and cross-layout regression; event-to-event relationship visualization remains deferred until an explicit event-authored, source-backed semantic contract is agreed. The older `a32ef05` subject-strict connection model is historical design context, not proof of live Timeline II relationship rendering. Before editing, read the entire exact current affected source under the Project Workflow Charter. Preserve adaptive-axis, zoom/pan, categories, Search scope, Inspector behavior, and relationship endpoint semantics while changing only connection/duration presentation.

</details>

### Preservation and revision audit

This organizational pass is compared against the exact v01 guide. The original v01 front-matter duplication (including its historically superseded checkpoint and navigation) is retained in the separate preservation record distributed with the revision, rather than copied into the current technical guide. Substantive architecture and maintenance accounts remain in the guide; detailed development chronology remains in the Changelog.

**Verification boundary:** This handoff uses the supplied core documentation and `/src` snapshot, not a complete repository or deployed-site audit. Planning-document paths and contents not supplied for this pass are not presented as newly verified.

<a id="technical-terms-glossary"></a>

## Technical Terms Glossary

*Purpose: Explain technical and Peridot-specific terminology used in this guide so a new human or AI maintainer can understand the contracts without already knowing the project’s vocabulary.*

**How to use:** Look up a term when you encounter it in Levels 1–3; you do not need to learn the glossary in advance. Definitions describe terminology **as used in this guide**, including distinctions that are particularly important to preserving Peridot’s data semantics. Each entry links to the most relevant current contract or reference. Historical uses of a term may differ from its current meaning.

**Alphabetical navigation:** [A–D](#glossary-a-d) · [E–H](#glossary-e-h) · [I–M](#glossary-i-m) · [N–R](#glossary-n-r) · [S–Z](#glossary-s-z)

**Scope:** This is a reference vocabulary, not a new technical specification. The detailed Level 2 contracts remain authoritative if a short definition omits an edge case.


<a id="glossary-a-d"></a>

### A–D

**Active dataset.** The source and accepted mapping currently loaded into Peridot; it persists as the user moves among workspaces. [Relevant reference](#contract-application-shell-and-navigation).

**Adapter.** A module that translates one internal representation or interface into another while consumers are migrated or kept compatible. An adapter is not automatically obsolete. [Relevant reference](#compatibility-and-historical-paths).

**Aggregation.** Combining records or values into a summary, such as a count or chart total; aggregation must respect the chart’s selected scope. [Relevant reference](#contract-charts).

**Applied / filtered data.** The stable set of records remaining after committed Advanced Search criteria and the active chronology range; it is not the same as the records currently shown at one playback instant. [Relevant reference](#contract-shared-data-scope-and-chronology).

**Assertion.** A canonical statement drawn from mapped source data, such as a temporal, place, relationship, or Evidence claim. Its meaning must not be invented during transformation. [Relevant reference](#contract-data-import-and-generalized-mapping).

**Atomic single-subject assertion.** An assertion attributed to one subject at a time. When a mapped field describes several participants, Peridot creates separate subject-specific assertions instead of leaving an ambiguous subject list. [Relevant reference](#contract-data-import-and-generalized-mapping).

**Attribution (data subject).** The assignment of a date, place, or Evidence value to the record, to specified participant(s), or to both; distinct from crediting software or map providers. [Relevant reference](#contract-data-import-and-generalized-mapping).

**Basemap.** The geographic background beneath research overlays. Peridot’s active Geographic Map uses CARTO raster tiles in a Web Mercator view. [Relevant reference](#contract-geographic-map-and-force-network).

**Bounded pass.** A deliberately limited development or documentation change with an explicit scope, preservation requirements, and verification. [Relevant reference](#fresh-maintainer-handoff).

**Build-time environment variable.** A configuration value read when Vite builds the client application. A `VITE_` value is included in client-served assets and must not be treated as a private server-side secret. [Relevant reference](#contract-geographic-map-and-force-network).

**Canonical data model.** Peridot’s authoritative normalized representation of researcher-accepted source interpretations, independent of older feature-specific runtime shapes. [Relevant reference](#contract-data-import-and-generalized-mapping).

**Canonical entity identity.** The preserved identity of an entity across records and roles, not merely its displayed name. Different entities may share a label. [Relevant reference](#contract-data-import-and-generalized-mapping).

**Capability audit.** An assessment of which analyses or features the currently mapped data can support; it should not substitute older correspondence-specific assumptions for researcher mappings. [Relevant reference](#contract-data-import-and-generalized-mapping).

**Cardinality.** Whether a mapped field contains one value or multiple values. Multi-value handling follows a researcher-specified delimiter, not guessed punctuation. [Relevant reference](#contract-data-import-and-generalized-mapping).

**Chart-local filter.** A filter used within Charts II that changes the chosen chart’s inputs without altering global Explore/Search criteria or other visualizations. [Relevant reference](#contract-charts).

**Charted data.** The records or derived values supplied to a chart after relevant chronology and chart-local settings are applied. Undated data has special inclusion rules. [Relevant reference](#contract-shared-data-scope-and-chronology).

**Chronology dock.** The shared range and playback interface used by Map, Network, Timeline, and Charts; its state contract is separate from the dedicated Timeline II rendering surface. [Relevant reference](#contract-shared-data-scope-and-chronology).

**Client-side asset.** An image, script, or other resource shipped to the browser. Static asset paths must be processed correctly by the production Vite build. [Relevant reference](#contract-themes-editorial-presentation-and-loading).

**Compatibility projection.** A downstream representation of canonical data maintained for an older consumer; it must not override or redefine the researcher-accepted mapping. [Relevant reference](#contract-data-import-and-generalized-mapping).

**Concurrent playback.** A chronology playback mode whose visible evidence is governed by the active playback position according to concurrent-time semantics, as distinct from accumulation over time. [Relevant reference](#contract-shared-data-scope-and-chronology).

**CSS cascade.** The browser’s rules for resolving overlapping styles. Later or more specific rules can unexpectedly mask accepted interface behavior. [Relevant reference](#contract-themes-editorial-presentation-and-loading).

**Cumulative playback.** A chronology playback mode that accumulates eligible evidence through the playback position, rather than displaying only evidence concurrent with that position. [Relevant reference](#contract-shared-data-scope-and-chronology).

**Data provenance.** The traceable origin and mapping interpretation of a displayed assertion or relationship; visual presentation and export must not misrepresent that source. [Relevant reference](#contract-data-import-and-generalized-mapping).

**Data scope.** The particular population of records or derived values used for an operation—loaded, applied, timeline-visible, selected, charted, or exported—which must be named precisely. [Relevant reference](#contract-shared-data-scope-and-chronology).

**Debounce.** A short delay that lets rapid edits settle before expensive work begins. Workbook review uses provisional preparation after mapping changes settle. [Relevant reference](#contract-data-import-and-generalized-mapping).

**Derived data.** Values or graph/chart structures calculated from accepted source interpretations; calculations must respect the relevant scope and must not invent source relationships. [Relevant reference](#contract-shared-data-scope-and-chronology).

**Directed relationship.** A source-backed relation whose endpoints have meaningful roles or direction, rather than an undifferentiated connection between co-occurring records. [Relevant reference](#contract-geographic-map-and-force-network).

**Draft / Apply pattern.** Settings or search criteria are edited provisionally and affect the committed view only when Apply is activated; Reset need not mean the same thing as Apply. [Relevant reference](#contract-application-shell-and-navigation).

[Back to glossary navigation](#technical-terms-glossary) · [Back to Quick Navigation](#quick-navigation)

<a id="glossary-e-h"></a>

### E–H

**Edge.** A rendered link between graph nodes representing a supported relation. Geographic edges require exact visible endpoint instances. [Relevant reference](#contract-geographic-map-and-force-network).

**Entity.** A recurring person, place, or other mapped subject resolved through the Identity model; identity must not be inferred solely from similar labels. [Relevant reference](#contract-data-import-and-generalized-mapping).

**Evidence assertion.** A source-backed Evidence value with an explicit record or participant subject, separate from generic source-row text and compatibility custom fields. [Relevant reference](#contract-data-import-and-generalized-mapping).

**EvidenceSource.** The existing per-record source object to which canonical mapped-Evidence assertions remain linked. [Relevant reference](#contract-data-import-and-generalized-mapping).

**Export scope.** The records, rendered marks, graph, or chart data that an export is supposed to capture. Different export actions deliberately use different scopes. [Relevant reference](#contract-exports).

**Facet.** A browsing or refinement dimension produced from mapped data, such as place or Evidence values, used in Explore. [Relevant reference](#contract-explore-and-search).

**Fallback.** A deliberately defined alternative path when a preferred operation is unavailable, such as main-thread loading animation if a rendering worker fails; it must preserve required behavior. [Relevant reference](#contract-themes-editorial-presentation-and-loading).

**Force-directed layout.** A network layout that positions entities according to a force simulation, distinct from their geographic coordinates. [Relevant reference](#contract-geographic-map-and-force-network).

**Geographic anchor role.** The mapped place role selected to position entities or relationship observations on the Geographic Map. A record may have more than one potential anchor. [Relevant reference](#contract-geographic-map-and-force-network).

**Grouped swimlane.** A Timeline II layout that places events into researcher-prioritized category lanes while preserving their chronological positions. [Relevant reference](#contract-timeline).

**Hot path.** Code executed frequently during interaction or rendering, where costly computation can produce visible lag. [Relevant reference](#fragile-zones-and-regression-matrix).

[Back to glossary navigation](#technical-terms-glossary) · [Back to Quick Navigation](#quick-navigation)

<a id="glossary-i-m"></a>

### I–M

**Identity materialization.** The process of applying accepted Identity mappings to create canonical entity identities without conflating same-label entities or overriding explicit blank choices. [Relevant reference](#contract-data-import-and-generalized-mapping).

**Inspector dossier.** The fuller Inspector view of linked evidence for an entity, place, or other selection, distinguished from the compact selection summary. [Relevant reference](#contract-inspector).

**Invariant.** A behavior, semantic rule, or architectural condition that must remain true when code changes; a successful build alone does not prove one is preserved. [Relevant reference](#fragile-zones-and-regression-matrix).

**Join (workbook).** The explicit association of records from separate sheets using selected unique identifiers. Row order is not a valid substitute and duplicate IDs must not silently multiply records. [Relevant reference](#contract-data-import-and-generalized-mapping).

**Legacy compatibility boundary.** Code retained so generalized canonical data can still serve older internal consumers; its presence does not authorize restoring obsolete public workflows. [Relevant reference](#compatibility-and-historical-paths).

**Loaded data.** All records currently accepted into the active dataset, before applied research filters or playback visibility; Browse intentionally uses this scope. [Relevant reference](#contract-shared-data-scope-and-chronology).

**Mapped / normalized data.** Researcher-accepted source values represented in canonical structures and, where needed, downstream runtime projections. [Relevant reference](#contract-shared-data-scope-and-chronology).

**Mapping fan-out.** Producing distinct canonical assertions for each explicitly selected subject of one mapped source value; subject assignment follows per-field value handling. [Relevant reference](#contract-data-import-and-generalized-mapping).

**Mapping suggestion.** A possible field interpretation shown to the researcher. It does not become accepted mapping semantics until the researcher chooses it. [Relevant reference](#contract-data-import-and-generalized-mapping).

**Module ownership.** The file or component responsible for a defined part of the application, including the boundary between it and dependent consumers. [Relevant reference](#module-ownership-register).

[Back to glossary navigation](#technical-terms-glossary) · [Back to Quick Navigation](#quick-navigation)

<a id="glossary-n-r"></a>

### N–R

**Node.** A graph mark representing an entity or resolved geographic instance; the graph must not invent nodes or endpoints unsupported by source data. [Relevant reference](#contract-geographic-map-and-force-network).

**Normalization.** Converting researcher-mapped source data into consistent canonical structures while preserving source content and chosen interpretation. [Relevant reference](#contract-data-import-and-generalized-mapping).

**OffscreenCanvas.** A browser canvas mechanism that allows the loading animation renderer to run in a worker; transfer and fallback lifecycle must remain compatible with React ownership. [Relevant reference](#contract-themes-editorial-presentation-and-loading).

**Pan / zoom viewport.** The currently visible area and magnification of a visualization; Geographic Map, Force Network, and Timeline maintain important independent state. [Relevant reference](#contract-geographic-map-and-force-network).

**Participant.** A subject position in a mapped relationship or record, such as Part A/B/C, whose distinct identity and attributed evidence must be preserved. [Relevant reference](#contract-data-import-and-generalized-mapping).

**Playback-visible data.** Applied/filtered evidence visible at the current chronology playback position; it is narrower or otherwise different from the stable applied set. [Relevant reference](#contract-shared-data-scope-and-chronology).

**Preboot still.** The image displayed before React’s first working loading-animation frame; it is designed to match the renderer’s time-zero state. [Relevant reference](#contract-themes-editorial-presentation-and-loading).

**Progressive disclosure.** An interface pattern in which optional mapping controls appear when the researcher explicitly activates them, rather than forcing every mapping category into a mandatory sequence. [Relevant reference](#contract-data-import-and-generalized-mapping).

**Projection (geographic).** The mathematical mapping from geographic coordinates to a two-dimensional surface. The current Geographic Map uses Web Mercator. [Relevant reference](#contract-geographic-map-and-force-network).

**Provenance-faithful graph.** A graph whose nodes, edges, roles, and visibility derive from supported mapped relationships rather than inferred co-occurrence or fabricated endpoints. [Relevant reference](#contract-geographic-map-and-force-network).

**React-managed lifecycle.** The component-controlled creation, update, and cleanup of UI or Canvas resources; direct manipulation that conflicts with React can break mounting and worker transfer. [Relevant reference](#contract-themes-editorial-presentation-and-loading).

**Regression.** An unintended loss or change in established behavior. Verification requires focused tests for the systems and fragile zones touched. [Relevant reference](#fragile-zones-and-regression-matrix).

**Render / rendering.** Turning data and interface state into visible marks or components. Rendering correctness, performance, and export correctness are separate concerns. [Relevant reference](#module-ownership-register).

**Researcher-owned semantics.** The principle that researchers explicitly define the meaning and attribution of mapped source values; the software must not silently guess or overwrite those meanings. [Relevant reference](#contract-data-import-and-generalized-mapping).

**Responsive layout.** Interface sizing and positioning that adapts to viewport dimensions without hiding controls, breaking stage measurement, or unintentionally scrolling primary views. [Relevant reference](#contract-themes-editorial-presentation-and-loading).

**Revision invalidation.** The rule that results of an older asynchronous workbook-review job must be ignored if the mapping or joins have changed since that job began. [Relevant reference](#contract-data-import-and-generalized-mapping).

**Runtime adapter.** A code path that projects canonical or generalized data into a consumer’s expected runtime shape; distinguish it from the authoritative source model. [Relevant reference](#contract-data-import-and-generalized-mapping).

[Back to glossary navigation](#technical-terms-glossary) · [Back to Quick Navigation](#quick-navigation)

<a id="glossary-s-z"></a>

### S–Z

**Selected data.** The record, node, edge, entity, place, route, or cluster currently inspected; dossier scope does not necessarily shrink with playback. [Relevant reference](#contract-shared-data-scope-and-chronology).

**Semantic theme role.** A named styling responsibility such as an interface or chart color role, distinct from choosing an arbitrary fixed color in one component. [Relevant reference](#contract-themes-editorial-presentation-and-loading).

**Sheet-qualified reference.** A workbook field reference that identifies both the worksheet and column, preventing ambiguity between similarly named columns on different sheets. [Relevant reference](#contract-data-import-and-generalized-mapping).

**Source of truth.** The current verified repository file or authoritative data contract, as opposed to a stale snapshot, earlier chat, or historical note. [Relevant reference](#fresh-maintainer-handoff).

**Source-backed category.** A Timeline category derived from researcher-selected mapped source columns or values rather than a label inferred by the visualization. [Relevant reference](#contract-timeline).

**Source-preservation ledger.** An audit trail recording where earlier technical or historical material was retained during documentation reorganization. [Relevant reference](#preservation-and-revision-audit).

**State persistence.** The retention of accepted dataset, filters, viewport, or other workspace state while navigating and switching visualization modes. [Relevant reference](#contract-application-shell-and-navigation).

**Structured temporal assertion.** A canonical date, period, or component-date claim represented with its actual precision and assigned subject, not merely parsed into a convenient display string. [Relevant reference](#contract-data-import-and-generalized-mapping).

**Subject selection.** The mapping control through which a researcher assigns a field to the record, one or more participants, or both. [Relevant reference](#contract-data-import-and-generalized-mapping).

**Temporal precision.** How specifically a date is known (for example, year, month, or day); Peridot’s chronology must not invent precision absent from source material. [Relevant reference](#contract-timeline).

**Timeline II.** Peridot’s sole current dedicated timeline view, distinct from the shared chronology dock and retired Timeline I event-card implementation. [Relevant reference](#contract-timeline).

**Transactional settings.** Settings modified as a draft and committed explicitly with Apply, so intermediate edits do not recompute the accepted view. [Relevant reference](#contract-application-shell-and-navigation).

**Undated evidence.** Accepted records or assertions without a positionable temporal value. Such evidence must not be silently assigned a date and has explicit chart-inclusion rules. [Relevant reference](#contract-shared-data-scope-and-chronology).

**Viewport measurement.** The observation of a mounted visualization container’s real dimensions; an initial zero-sized Map stage can render blank until it is measured. [Relevant reference](#contract-themes-editorial-presentation-and-loading).

**Web Mercator.** The tiled geographic projection used by the active CARTO Geographic Map, with horizontal wrapping and bounded north–south navigation. [Relevant reference](#contract-geographic-map-and-force-network).

**Worker.** A browser thread used for expensive work outside the main React rendering path, such as workbook review or the loading animation. [Relevant reference](#contract-themes-editorial-presentation-and-loading).

**Working tree.** The local repository files and uncommitted changes; a previous clean Git checkpoint is not evidence that the current working tree is still clean. [Relevant reference](#fresh-maintainer-handoff).

[Back to glossary navigation](#technical-terms-glossary) · [Back to Quick Navigation](#quick-navigation)

