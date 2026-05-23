# Project Workflow Charter

## Purpose

This document defines how changes should be made to the Peridot correspondence visualizer app. Its purpose is to reduce risk, prevent version drift, keep source-of-truth discipline, and make changes easier to review and maintain.

This charter should be consulted before every implementation pass.

---

## 1. Source-of-truth rule

At the start of any pass, establish one authoritative source of truth.

During active editing, the source of truth must be exactly one of the following:

- one specific local project folder
- one specific pasted/exported file
- one recently synced Git commit when the user has confirmed local and GitHub alignment through the sync ritual

GitHub, canvas copies, temporary zips, downloaded replacements, and other artifacts may be references, but they must not be treated as co-equal authoritative sources during the same pass unless that divergence is explicitly acknowledged.

Current project source of truth folder:

```text
C:\Users\haley\OneDrive\Desktop\CorrespondenceVisualizer\
```

Current clean baseline:

```text
See `CHANGELOG.md` for the most recent documented safe baseline.
```

Current branch note:

```text
The current active continuation path is on `main` unless the user explicitly creates or switches to another branch. MapLibre migrated-overlay work remains set aside and should not be treated as the active source of truth unless explicitly resumed.
```

---

## 2. Bounded-pass rule

Before each coding pass, state:

- change type: exactly one of **behavior**, **visual**, **structural**, or **documentation**
- goal
- in-scope files/regions
- out-of-scope files/regions
- one plain-language acceptance test
- expected artifact: pasted diff, full file, `.txt` replacement, zip, or commit-ready instructions

Do not mix functional changes, visual redesign, broad refactors, and documentation updates in a single implementation pass unless the user explicitly chooses that scope.

---

## 3. Fragile-zones preflight

Before touching a fragile zone, state:

- affected fragile zone
- what might break
- what is intentionally not being touched
- how the result will be verified afterward

Current fragile zones include:

- map viewport centering/reset behavior
- dense-map hover/click interaction
- selection persistence across filters
- playback/timeline state coupling
- export rendering/state coupling
- broad orchestration work inside `src/App.jsx`
- shared side-panel shell behavior
- inspector-open interactions after map clicks
- cluster grouping and cluster inspector navigation
- Analytics expanded overlay positioning above the map area
- Analytics dynamic variable detection from uploaded/current row data
- Analytics SVG-to-PNG chart export rendering
- future Search & Filter active-dataset state, especially when it begins coordinating date, weight, person/place/route, metadata, Analytics, Timeline, Inspector, and Export behavior

---

## 4. Checkpoint and commit distinction

A **checkpoint** is a tested intermediate state that may still be revised soon.

A **commit** is a coherent completed pass with one clear outcome.

Use commits for coherent completed passes. Use checkpoints when the user wants recoverability before additional risky work.

---

## 5. Delivery format rule

Use the safest delivery mode for the current pass.

Preferred modes:

- small local edit: targeted replacement block with clear anchors
- medium bounded file area: replacement block or full replacement file
- fragile/high-risk file: full replacement from the current source of truth
- generated source replacement: provide a `.txt` file that the user can copy into place

When delivering files, include exact Windows PowerShell copy commands.

Do not use `git add .` while `itch_upload/` or other generated artifacts are untracked. Use targeted adds or `git add -A src` only when a source-file rename/deletion is intentional.

---

## 6. Recovery protocol

When something goes wrong:

1. Stop further edits.
2. Identify the current source of truth.
3. Restore the last good checkpoint/commit.
4. Restate the goal in one sentence.
5. Make one bounded fix only.
6. Rerun the acceptance test.

Do not stack speculative fixes on top of an unstable state.

Recent examples reinforced this rule:

- a responsive shared-panel sizing attempt was rolled back after it disrupted the normal landscape layout
- a semantic shared-panel prop rename was rolled back after it broke inspector auto-open behavior
- the team returned to the last clean baseline before proceeding

---

## 7. Sync ritual

Run the sync ritual after actual commits or major checkpoints, not after discussion-only turns.

Canonical sync ritual:

```powershell
git status
git log --oneline -5
Get-ChildItem -Name
Get-ChildItem src -Name
```

After the user provides a clean sync showing local `HEAD`, `origin/main`, and `origin/HEAD` aligned, trust the synced Git state as the current source of truth. Do not repeatedly ask for uploaded files unless there is a specific reason to believe the file has drifted or the needed file content is not otherwise available.

---

## 8. Documentation policy

Do not update documentation after every small code commit. That slows development.

Instead, defer README / Maintainer Guide / Changelog updates until:

- a meaningful batch of changes has accumulated
- a milestone has been reached
- a fresh-chat handoff is needed
- the current conversation is becoming laggy or unreliable

When documentation is updated, preserve the full development history in `CHANGELOG.md`.

Documentation passes should default to adding new milestone/current-state information where reasonable. Subtract or rewrite existing documentation only when the text is clearly obsolete, duplicated by a more accurate retained entry, or actively misleading.

---

## 9. Dependency and tooling freeze

Do not change dependencies, package manager files, Vite config, Tailwind config, lint/format rules, filenames, or folder structure unless the pass is explicitly about tooling or architecture.

Generated artifacts such as `itch_upload/` should not be committed during ordinary source-development passes.

---

## 10. Modularization roadmap

Maintain a modularization roadmap for eventual `App.jsx` decomposition, but do not execute it casually.

Preferred order:

1. pure data helpers
2. export helpers
3. theme/constants
4. small reusable UI pieces
5. map interaction helpers
6. panel and inspector content components
7. app orchestration last

Stop structural cleanup once the file is stable unless there is a concrete bug, a planned architectural pass, or a specific maintenance pain point.

---

## 11. Decision records

For non-obvious implementation choices, record:

- what was chosen
- what alternative was rejected
- why

Current notable decisions:

- The map remains dynamic rather than fixed to a canonical live stage for now.
- Panel standardization focused on a shared side panel instead of freezing the whole viewport.
- The Inspector is now content inside the shared side panel, not a separate right-side shell.
- Cluster sizing now reflects represented letter volume.
- Cluster grouping is zoom-responsive.
- Cluster inspector members are grouped by place.
- MapLibre migrated-overlay work is paused; legacy D3/SVG Peridot on `main` is the active continuation path unless the user explicitly resumes MapLibre.
- Analytics variables should combine curated semantic fields with conservatively detected categorical metadata fields rather than exposing every raw column indiscriminately.
- Analytics route variables are split into **Route (Place)** and **Route (Person)** to avoid ambiguity.
- Add a dedicated **Search & Filter** panel tab as the long-term owner of global dataset filtering, so Controls/View defines presentation, Timeline focuses on chronological playback, Analytics charts the current filtered dataset, Inspector remains selection-driven, and Export labels whether it exports loaded, filtered, visible, selected, or charted data.

---

## 12. Search & Filter panel contract

### Purpose

Peridot should distinguish between:

```text
data source
→ active filtered dataset
→ visualization / inspection / analytics / export
```

The future **Search & Filter** panel should become the primary place where the user defines the **active filtered dataset**. The user should not need to remember that date filtering, weight filtering, chart data scope, and entity exploration are distributed across several implementation-era panel locations.

The governing research question for this subsystem is:

```text
What subset of the correspondence corpus am I looking at right now?
```

### Panel responsibility model

#### Data Inputs

**Purpose:** define the available dataset.

Data Inputs should continue to own Geography, Raw Data, and Person Metadata upload/replacement tools. It should not become the filter owner.

#### Search & Filter

**Purpose:** define the active subset of the loaded dataset.

Search & Filter should eventually contain global filters, search tools, sorting/ranking controls, and a visible summary of the active corpus.

Likely global filters include:

- date range
- minimum correspondence weight
- sender / source person
- recipient / target person
- source place
- target place
- route, including both place-route and person-route concepts
- relationship
- language
- mappability status
- safe categorical metadata fields

Likely search tools include:

- person search
- place search
- route search
- metadata keyword search, if feasible later

Likely sorting/ranking tools include:

- sort people by total letters
- sort places by total letters
- sort routes by volume
- sort correspondents by relationship weight
- sort records chronologically

Search & Filter should eventually show an active-scope summary such as:

```text
Active records: 284
Date range: 1600–1625
Minimum route weight: 2
Person filter: Suor Colomba
Place filter: Siena
Metadata filters: Language = Italian
```

#### Controls / View

**Purpose:** define how the active dataset is displayed.

Controls/View should retain visualization mode, display options, theme controls, map/view settings, and diagnostics. It should gradually lose controls whose primary purpose is filtering the dataset, such as minimum weight.

#### Timeline

**Purpose:** animate and navigate the active date range.

Long term, Search & Filter should own or clearly mirror the active date range, while Timeline focuses on playback, chronological animation, play/pause, stepping behavior, and temporal context.

Preferred long-term model:

```text
Search & Filter owns the active date range.
Timeline consumes that range for playback and chronological exploration.
```

#### Analytics

**Purpose:** chart the active filtered dataset.

Analytics should continue to own chart type selection, chart-specific variable choices, chart preview, expanded chart overlay, PNG export, chart descriptions, and example questions. It should clearly inherit the active filtered dataset by default and eventually show a data-scope statement such as:

```text
Charting 284 records from current filters.
Date range: 1600–1625.
Minimum weight: 2.
Includes unmappable records: Yes.
```

#### Inspector

**Purpose:** inspect selected entities within the active view.

Inspector should remain selection-driven and should not become the global filter owner. Later, Inspector may offer explicit actions such as **Filter to this person**, **Filter to this place**, **Filter to this route**, or **Show only linked records**. Those actions should be added only in narrow behavior passes because inspector-open interactions are fragile.

#### Export

**Purpose:** export the current visualized or filtered result.

Export should eventually make clear whether it is exporting all loaded data, current filtered data, current visible nodes/edges, the current chart, the current selected entity, or the current map view.

### Active filtered dataset definition

The **active filtered dataset** is the subset of loaded correspondence records that pass all enabled global filters in Search & Filter.

Derived structures should then be computed from that active filtered dataset:

```text
active filtered records
→ visible people
→ visible places
→ visible routes/edges
→ visible clusters
→ Analytics chart inputs
→ export rows, where relevant
```

Minimum weight requires special care because it is usually a derived edge/route filter rather than a raw-record filter. The implementation should distinguish among:

- **record-level filters** — date, sender, recipient, places, language, relationship, metadata, mappability
- **derived edge/route filters** — minimum weight, reciprocal-only routes, one-way-only routes, routes involving selected entities
- **view/display controls** — theme, labels, cluster display, node sizing, map style, visualization mode
- **Analytics chart controls** — chart type, variables, grouping, top-N, orientation, chart-specific date bucketing

### Initial implementation sequence

1. Add a Search & Filter rail tab with placeholder/read-only content only. Do not move behavior yet.
2. Move the existing minimum-weight numeric input from Controls/View to Search & Filter.
3. Move or mirror date filtering carefully, preserving Timeline playback.
4. Add lightweight person/place/route search.
5. Add an Analytics data-scope summary showing which filtered records are being charted.

### Search & Filter cautions

Do not begin by rewriting the whole filtering pipeline. Do not merge Timeline, Analytics, and Inspector into one panel. Do not make Analytics or Inspector the owner of global filters. Do not rename compatibility-sensitive shared-panel state during this work. Do not touch MapLibre as part of this effort.

Search & Filter work should proceed as narrow bounded passes because it will eventually touch multiple fragile zones: timeline state, selection persistence, map rendering, Analytics derivation, export rows, inspector behavior, and broad `App.jsx` orchestration.

---

## 13. Project-specific cautions

### Shared side-panel compatibility path

The app still contains old compatibility naming around left/right panel visibility in some places. Although the names are misleading, that path currently preserves Inspector auto-open behavior.

Do **not** casually rename these props or setters. If revisited, explicitly test:

- node click opens Inspector
- edge click opens Inspector
- cluster click opens Inspector
- contained cluster member opens detail
- Back behavior still works

### Responsive panel sizing

A prior attempt to make the shared side panel absolutely positioned at all viewport sizes was rolled back because it disrupted normal full-size landscape layout.

Future responsive panel work should be a narrow-window-specific override, not a universal positioning replacement.

### Dormant MapLibre work

The repository may contain dormant MapLibre preview files from `main`. These should not be treated as active production code during legacy Peridot work. Do not remove, revive, or refactor MapLibre code unless the pass is explicitly about MapLibre. If MapLibre work resumes, first establish the correct branch/source-of-truth and perform a fresh audit.

### Analytics behavior

Analytics is now an active side-panel subsystem. Future Analytics changes should preserve:

- chart picker opens from the Analytics rail tab
- chart descriptions and example questions remain visible in the Configure area
- variable options include curated semantic fields and useful categorical metadata fields
- technical fields such as IDs, coordinates, dates, mappability flags, object/array values, purely numeric values, long note-like fields, and near-unique row identifiers are not treated as ordinary chart variables
- **Route (Place)** remains source-place to target-place
- **Route (Person)** remains sender to recipient
- expanded chart view overlays the map area without resetting map state
- PNG chart export still works

### Cluster behavior

Cluster behavior is now committed and functional. Future cluster changes should preserve:

- cluster click opens Inspector
- cluster inspector lists contained members
- members are grouped by place
- member click opens detail
- Back returns to the cluster view
- cluster sizing remains visually meaningful

---

## 14. Standard delivery summary

Each implementation pass should end with:

- what changed
- exact files changed
- one acceptance test
- whether the result is a checkpoint or commit
- exact Git commands
- exact copy commands if files are being moved
- known residual risks

---

## 15. Fresh-chat handoff

For a new chat, start with:

```text
Source of truth folder:
C:\Users\haley\OneDrive\Desktop\CorrespondenceVisualizer\

Current documented clean baseline:
See `CHANGELOG.md` for the most recent documented safe baseline.
```

The new chat should be told:

- Peridot is the current app identity.
- The current fixed basemap is `countries50m`.
- The app currently uses a shared left-side panel with Controls, Data Inputs, Export, Timeline, Analytics, and Inspector tabs.
- The next planned panel-design direction is a dedicated Search & Filter tab that will consolidate global filtering and define the active filtered dataset.
- `LeftControlPanel.jsx` owns the shared side-panel shell.
- `InspectorPanel.jsx` is content-only.
- Analytics is handled by `AnalyticsPanel.jsx`, `analyticsConfig.js`, `analyticsDerivationHelpers.js`, and `analyticsChartComponents.jsx`.
- Cluster interaction, volume-based cluster sizing, and grouped cluster inspector behavior are committed features.
- The compatibility path for inspector auto-open is fragile; do not rename it casually.
- Documentation updates are batched, not performed after every small code commit.
- MapLibre migrated-overlay work is paused while legacy Peridot continuation proceeds on `main`.
