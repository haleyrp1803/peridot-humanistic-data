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
e7c3b57 — Add point-location role mapping
```

Current branch note:

```text
The current active continuation branch may intentionally differ from experimental branches. As of the legacy-continuation handoff, MapLibre migrated-overlay work is set aside and should not be treated as the active source of truth unless explicitly resumed.
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
- workspace routing and hamburger-menu behavior
- map/network viewport measurement after switching between Analytics and map/network visualizations
- shared side-panel shell behavior
- inspector-open interactions after map clicks
- cluster grouping and cluster inspector navigation
- Search & Filter active-dataset state, including keyword, person, place, route-place, route-people, weight, date-range, predictive-suggestion, apply/clear, and future metadata filters
- Analytics expanded overlay positioning and backdrop contrast
- Analytics dynamic variable detection
- Analytics SVG-to-PNG export rendering
- Data Inputs upload state, one-file CSV normalization, arbitrary CSV/TSV/Excel role mapping, workbook parsing and mapping behavior, unique-ID join configuration, capability-audit reporting, validation summary behavior, point/site import behavior, coordinate-pair parsing, date-range/display-date handling, and legacy upload cleanup

---

## 4. Full-file review and replacement rule

Before writing any code edit or patch script, read and review the complete current affected file or files from the real source of truth.

When the user has confirmed local and GitHub are synced, use the current GitHub files as the source for full-file review unless the user explicitly states that local files have diverged.

For code changes, prefer full-file replacements by default, especially when working in dense or fragile files such as:

- `src/App.jsx`
- `src/LeftControlPanel.jsx`
- `src/timelinePlaybackComponents.jsx`
- inspector components
- map interaction components
- export components
- Analytics components

Do not rely on inferred snippets, broad regex patching, partial excerpts, or assumptions about code shape. Use the knowledge gained from reading the actual file to make grounded changes.

Small targeted replacement blocks are allowed only when all of the following are true:

- the full affected file has already been reviewed;
- the edit is genuinely local;
- the anchor text is unambiguous;
- repeated code patterns or prop names will not make the replacement brittle;
- the risk is lower than a full-file replacement.

If a patch fails, begins to loop, or requires repeated corrective scripts, stop immediately. Roll back to the last clean commit/checkpoint, restate the goal, and switch to a reviewed full-file replacement or a new implementation plan.

This project is grounded in real code and real data. Do not reconstruct likely code from memory, snippets, or expectations when the actual file can be read.

### Most-recent-upload rule

When the user uploads files after being asked for current source files, treat those most recent uploads as the authoritative source for that pass unless the user explicitly says otherwise.

Do not assume that a same-name file already present in `/mnt/data`, a prior generated replacement file, or an older upload is the latest source. Same-name files from different points in the conversation are common during this project.

Before making claims that a user-uploaded source file is stale, verify that the file being inspected is actually the newest uploaded file for the pass. If there is any ambiguity about file recency or identity, stop and ask rather than declaring the user’s upload stale.

---

## 5. Checkpoint and commit distinction

A **checkpoint** is a tested intermediate state that may still be revised soon.

A **commit** is a coherent completed pass with one clear outcome.

Use commits for coherent completed passes. Use checkpoints when the user wants recoverability before additional risky work.

---

## 6. Delivery format rule

Use the safest delivery mode for the current pass.

Preferred modes:

- documentation-only pass: replacement `.txt` or `.md` file generated from the reviewed current document
- small local edit: targeted replacement block with clear anchors, only after full-file review
- medium bounded file area: full replacement file unless a targeted block is demonstrably safer
- fragile/high-risk file: full replacement from the current source of truth
- generated source replacement: provide a `.txt` file that the user can copy into place

When delivering files, include exact Windows PowerShell copy commands.

Do not use `git add .` while `itch_upload/` or other generated artifacts are untracked.

Use targeted adds or `git add -A src` only when a source-file rename/deletion is intentional.

---

## 7. Recovery protocol

When something goes wrong:

1. Stop further edits.
2. Identify the current source of truth.
3. Restore the last good checkpoint/commit.
4. Restate the goal in one sentence.
5. Make one bounded fix only, or switch delivery mode to full-file replacement after full-file review.
6. Rerun the acceptance test.

Do not stack speculative fixes on top of an unstable state.

Recent examples reinforced this rule:

- a responsive shared-panel sizing attempt was rolled back after it disrupted the normal landscape layout
- a semantic shared-panel prop rename was rolled back after it broke inspector auto-open behavior
- repeated Search & Filter patch-script failures showed that dense UI files should not be edited through brittle snippet assumptions
- the team returned to the last clean baseline before proceeding

---

## 8. Sync ritual

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

## 9. Documentation policy

Do not update documentation after every small code commit. That slows development.

Instead, defer README / Maintainer Guide / Changelog updates until:

- a meaningful batch of changes has accumulated
- a milestone has been reached
- a fresh-chat handoff is needed
- the current conversation is becoming laggy or unreliable

When documentation is updated, preserve the full development history in `CHANGELOG.md`.

Documentation passes should default to adding new milestone/current-state information where reasonable. Subtract or rewrite existing documentation only when the text is clearly obsolete, duplicated by a more accurate retained entry, or actively misleading.

---

## 10. Dependency and tooling freeze

Do not change dependencies, package manager files, Vite config, Tailwind config, lint/format rules, filenames, or folder structure unless the pass is explicitly about tooling or architecture.

Generated artifacts such as `itch_upload/` should not be committed during ordinary source-development passes.

---

## 11. Modularization roadmap

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

## 12. Decision records

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
- MapLibre migrated-overlay work is paused; legacy D3/SVG Peridot is the active continuation path unless the user explicitly resumes MapLibre.
- Search & Filter is the long-term owner of global dataset filtering.
- Controls / View should govern display, not the active filtered dataset.
- Timeline should focus on chronological playback and consume the active date range.
- Analytics should chart the currently filtered dataset by default.
- Search & Filter uses draft inputs plus explicit Apply Filters rather than live filtering.
- Predictive suggestions should support discovery without becoming full dropdown selectors.
- Route filtering is split into Route Filter (Place) and Route Filter (People).
- Search & Filter should visually resemble a compact database/library advanced-search interface rather than a stack of explanatory cards.
- Expanded Analytics charts should keep the chart on a white/cream card while the layer behind it can use a dark translucent green with blur to preserve map context.
- Data Inputs should use one standardized Peridot CSV upload as the public workflow.
- Peridot should treat uploaded correspondence data as database records first and visualization inputs second.
- Rows can be accepted when they contain either source/target names or source/target place information; coordinates and parseable dates are capability-enabling fields, not upload-admission requirements.
- Peridot should not clean, standardize, merge, or enforce controlled vocabularies for uploaded names, places, dates, topics, relationships, languages, titles, notes, or links. Users are responsible for standardization outside the app.
- Arbitrary CSV/TSV imports should use an explicit user-confirmed column-mapping workflow rather than silent guessing.
- Core correspondence-compatible Peridot variables remain supported for route/network workflows, but the upload mapping UI should present field roles rather than asking users to conform to correspondence-only “Peridot variables.”
- Peridot should support broader humanistic datasets through role-based mapping for record identity, time, places, relationships, evidence/analysis, and capability review.
- Point/site datasets with one mapped location should be valid Place Map datasets even when they have no People Network or Force-Directed network readiness.
- People Network and Force-Directed views should remain unavailable or empty for datasets that do not map source-target entity relationships; that is correct behavior, not a failed import.
- Coordinate pairs should be interpreted as latitude first, longitude second, including `POINT(latitude longitude)` strings.
- Route datasets should support separated source/target latitude-longitude fields and combined source/target coordinate-pair fields.
- Date handling should distinguish single date, date start, date end, and display date roles. Display dates are human-readable labels and may represent a single date or a composed range.
- Other uploaded columns should be preserved as optional evidence/analysis metadata, with user-selected fields available for Inspector and suitable Analytics visualizations.
- Workbook parsing is now connected to a workbook-aware import path for CSV, TSV, XLSX, and XLS.
- Multi-sheet workbook imports should use user-configured unique-ID joins. Header names for ID columns do not have to match, and row-order joining should not be used as the primary strategy.
- Users may select custom Inspector/Analytics fields from primary and joined workbook sheets.
- Person/place profile views should aggregate linked-record information and display related people, related places, directed routes, date spans, linked letters, and selected uploaded fields where available.
- Linked letters should open as dedicated Inspector detail views rather than long inline expansions.
- Peridot’s primary interface direction is now workspace-first rather than side-panel-first.
- The hamburger-triggered labeled menu is the intended primary navigation surface; the old persistent icon rail is legacy/compatibility code unless explicitly revived.
- Home, Data, Visualizations, Search & Filter, Theme, and Export are full workspaces.
- Timeline should not be promoted to a standalone full workspace; the preferred future direction is a bottom timeline/scrubber integrated with Visualizations.
- Inspector is now dual-mode: visualization clicks open compact side-panel summaries, while hamburger **Inspector**, compact **Expand**, compact summary buttons, and linked-data clicks open the full Inspector workspace.
- Compact and full Inspector modes must share one selection state and multi-step Back history.
- Linked-letter detail pages are part of shared Inspector state/history, not a local-only subview.
- Compact summary tiles should remain at-a-glance affordances that open the full workspace for deeper reading.
- Directed route rows should open route/edge Inspector dossiers and participate in Back history.
- Analytics is conceptually part of Visualizations, not an independent side-panel-first workflow.
- The ordinary legacy Geography / Raw Data / Person Metadata three-file workflow is superseded by the one-file template upload and mapped arbitrary-table import workflows; do not reintroduce it unless a specific recovery or compatibility need is identified.

---

## 13. Project-specific cautions

### Shared side-panel compatibility path

The app still contains old compatibility naming around left/right panel visibility in some places. Although the names are misleading, that path currently preserves Inspector auto-open behavior.

Do **not** casually rename these props or setters.

If revisited, explicitly test:

- node click opens Inspector
- edge click opens Inspector
- cluster click opens Inspector
- contained cluster member opens detail
- Back behavior still works

### Responsive panel sizing

A prior attempt to make the shared side panel absolutely positioned at all viewport sizes was rolled back because it disrupted normal full-size landscape layout.

Future responsive panel work should be a narrow-window-specific override, not a universal positioning replacement.

### Dormant MapLibre work

The repository may contain dormant MapLibre preview files from `main`.

These should not be treated as active production code during legacy Peridot work. Do not remove, revive, or refactor MapLibre code unless the pass is explicitly about MapLibre.

If MapLibre work resumes, first establish the correct branch/source-of-truth and perform a fresh audit.

### Cluster behavior

Cluster behavior is now committed and functional.

Future cluster changes should preserve:

- cluster click opens Inspector
- cluster inspector lists contained members
- members are grouped by place
- member click opens detail
- Back returns to the cluster view
- cluster sizing remains visually meaningful

### Data Inputs behavior

Data Inputs is now the public owner of the standardized single-CSV upload workflow and the arbitrary table column-mapping workflow.

Committed Data Inputs behavior includes:

- downloadable Peridot CSV template;
- one unified CSV / TSV / XLSX / XLS table-workbook upload control;
- arbitrary CSV/TSV/Excel upload staging and role-based column mapping;
- mapped arbitrary-table import into Peridot data;
- post-upload validation popup;
- persistent latest-upload summary in the Data Inputs panel after the popup closes;
- capability reporting for Inspector, Search, point-map readiness, route-map readiness, network readiness, timeline readiness, Analytics/chart readiness, and Export;
- public legacy Geography / Raw Data / Person Metadata upload controls superseded by the one-file and mapped-import workflows;
- workbook parsing, mapping, unique-ID joins, and import assembly for XLSX/XLS workbooks;
- selected workbook custom fields visible in linked-letter and entity-profile Inspector views.

Future Data Inputs changes should explicitly test:

- template download works;
- uploading a valid template CSV updates the app data;
- uploading a workbook stages sheets without freezing on reasonably sized files;
- workbook mapping can configure primary sheet, unique-ID joins, core field mapping, and selected Inspector fields;
- upload summary popup appears;
- closing the popup does not erase the persistent side-panel summary;
- rows lacking coordinates are not silently discarded if otherwise accepted;
- rows lacking parseable dates are not silently discarded if otherwise accepted;
- Inspector still opens after upload;
- Search & Filter resets or remains coherent after upload;
- Timeline playback does not use stale date scope after upload;
- Analytics receives the intended uploaded/filtered rows;
- Export still labels and exports the intended data scope.

Do not reintroduce the legacy three-file upload workflow unless there is a specific recovery or compatibility reason; the active public direction is one-file template upload plus mapped arbitrary-table import.


### Search & Filter behavior

Search & Filter is the intended consolidation point for global filters.

Committed Search & Filter controls include:

- keyword search
- person filter
- place filter
- **Route Filter (Place)**
- **Route Filter (People)**
- minimum correspondence weight
- date range
- predictive suggestions for person, place, route-place, route-people, start-year, and end-year fields
- **Apply Filters**
- **Clear Filters**
- pre-update status feedback

Future Search & Filter controls may include:

- language/relationship filters
- mappability filters
- safe categorical metadata filters
- inspector actions such as “filter to this person/place/route”

Filter controls should not trigger expensive graph/data recomputation on every keystroke or draft edit. Use draft values with an explicit **Apply Filters** action when the filter can affect the active dataset. Use **Clear Filters** to reset the global filter state. For expensive full-dataset updates, show visible feedback before committing state changes so users understand that the app is updating.

When changing Search & Filter, explicitly test:

- typing in a text field does not freeze the app
- filters apply only when intended
- current applied filter scope is clear to the user and remains visible near the top of the panel
- Timeline playback remains functional
- Analytics receives the intended filtered scope
- Export scope remains clear

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
Source of truth folder: C:\Users\haley\OneDrive\Desktop\CorrespondenceVisualizer\
Current documented clean baseline: See `CHANGELOG.md` for the most recent documented safe baseline.
```

The new chat should be told:

- Peridot is the current app identity.
- The current fixed basemap is `countries50m`.
- The app uses a hamburger-triggered labeled menu and full workspaces for Home, Data, Visualizations, Search & Filter, Theme, and Export.
- Timeline remains a transitional side-panel bridge and is later intended to become a bottom Visualizations timeline/scrubber.
- Inspector is dual-mode: compact side-panel summaries are still used for visualization clicks, and the full evidence-dossier workspace is implemented for hamburger/Expand/linked-data navigation.
- `LeftControlPanel.jsx` owns the legacy shared side-panel shell, the transitional Timeline bridge, and compact Inspector presentation.
- `InspectorPanel.jsx` is the shared compact/full Inspector content shell.
- Cluster interaction, volume-based cluster sizing, and grouped cluster inspector behavior are committed features.
- The compatibility path for inspector auto-open is fragile; do not rename it casually.
- Documentation updates are batched, not performed after every small code commit.
- MapLibre migrated-overlay work is paused while legacy Peridot continuation proceeds.
- Before any code change, fully read/review the complete current affected GitHub file(s) when local and GitHub are synced.
- Use full-file replacements by default for code changes in affected files, especially dense or fragile files.
- Avoid brittle snippet-based patching unless the full file has been reviewed and the edit is clearly unambiguous.
- When the user uploads source files after being asked for current files, treat the most recent uploads as authoritative for that pass unless told otherwise.
- Search & Filter currently uses a compact advanced-search layout, not the earlier stacked-card layout.
- Data Inputs currently uses a one-file Peridot CSV workflow, arbitrary CSV/TSV column mapping, workbook import with unique-ID joins, validation popup, and persistent latest-upload summary.
- Analytics expanded chart views currently use a dark translucent green backdrop with cool off-white text/borders and a white/cream chart card.
- Inspector person/place profiles currently show profile summaries, compact summary buttons, role-grouped related people/places, directed route summaries, selected uploaded fields, shared linked-letter detail navigation, clickable linked people/places, and route-row dossier navigation.
