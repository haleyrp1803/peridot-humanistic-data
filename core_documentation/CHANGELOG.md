# Changelog

## Executive Summary

This Changelog is Peridot’s authoritative historical record. Use the area and period indexes to reach the full reverse-chronological development table, then consult linked, expandable milestone accounts for decisions, regressions, and verification context. The current synchronized checkpoint appears first; earlier checkpoint evidence is archived separately.

The Changelog owns chronology and milestone interpretation, not the complete current architecture or workflow rules. For current contracts, use the Maintainer’s Guide; for process, use the Project Workflow Charter.

## How to Use This Changelog

**This is Peridot’s development history.** It records what changed as the project grew, including significant decisions, revisions, failed approaches, and what was actually verified. You do not need to read it from beginning to end. Most readers can use the development-history table to find a change and only open the longer accounts when they need to understand its background.

| Part of the document | What you will find | When to use it |
|---|---|---|
| **[Current checkpoint](#1-current-synchronized-checkpoint)** | The latest confirmed Git state at the time this document was updated. | **Start here** to orient yourself in the recorded repository history. Check Git again before making changes. |
| **[Find by area and period](#2-find-by-area-and-period)** | Shortcuts to development topics and calendar periods. | Use when you know the feature or approximate time, but not the commit. |
| **[Full development history](#3-full-development-history)** | The main reverse-chronological table of recorded commits, with brief explanations and links to relevant details. | **Use this most of the time** to answer what changed and when. |
| **[Detailed milestone archive](#4-detailed-milestone-archive)** | Expandable accounts of consequential implementations, decisions, corrections, and testing. | Open only when you need to understand *how or why* something happened. |
| **[Historical checkpoint evidence](#5-historical-checkpoint-evidence)** | Earlier repository-state confirmations and contextual snapshots. | Consult when reconstructing the exact state of work at an earlier point. |
| **[Deferred, archived, and rolled-back work](#6-deferred-archived-and-rolled-back-work)** | Records of postponed, superseded, archived, or reversed work. | Consult to distinguish previous approaches from accepted development; use the Maintainer’s Guide for the **current** technical backlog. |

**How to follow the history:** Choose an area, month, or commit in the table. Where a **Details** link appears, it takes you to the relevant expandable milestone account. The table is the quickest orientation; the narratives are retained for deeper investigation, not required reading. Recorded historical status describes its own moment in time and should not override newer commits or the current architecture.

For what Peridot does and how to use it, see the [README](README.md). For current modules, technical contracts, known risks, and outstanding work, see the [Maintainer’s Guide](MAINTAINERS_GUIDE.md). Before modifying the project, follow the [Project Workflow Charter](PROJECT_WORKFLOW_CHARTER.md).

## Quick Navigation

- [How to use this Changelog](#how-to-use-this-changelog)
- [Current checkpoint](#1-current-synchronized-checkpoint)
- [Find by area and period](#2-find-by-area-and-period)
- [Full development history](#3-full-development-history)
- [Detailed milestone archive](#4-detailed-milestone-archive)
- [Historical checkpoint evidence](#5-historical-checkpoint-evidence)
- [Deferred, archived, and rolled-back work](#6-deferred-archived-and-rolled-back-work)

## Document Role and Boundaries

This document owns the verified current checkpoint, reverse-chronological development register, detailed milestone archive, deferred/archived/rolled-back record, and historical checkpoint evidence. It does not own broad module specifications, public workflows, or process law.

## 1. Current Synchronized Checkpoint

```text
1203087 — Synchronize core documentation through Evidence Workspace completion
Branch: main (last observed commit in user-supplied dated Git log, 2026-11-27)
Status: Local commit observed; remote-ref alignment and a clean working tree at this commit were not established by the dated log.
```

**Earlier verification (before `1203087`):** On 2026-11-27 the researcher supplied `git log --oneline -10` with `4bdab6c` tagged `HEAD -> main`, `origin/main`, and `origin/HEAD`, followed by `6c149e7`, `3c64813`, `1c310e8`, and `59ce6a7`. The preceding Inspector commit `6c149e7` also has an independently supplied clean `git status` and synchronized push confirmation. The new log confirms the test-fix commit and ref alignment, **not** a new clean-working-tree observation or a production-build/deployment result. `3c64813` captures earlier Evidence Workspace dossier, search and connected-place refinements; `6c149e7` consolidates the accepted expanded Inspector integration across the four visualizations; `4bdab6c` corrects a test expectation only. The assistant's reconstructed-source Node test run passed **217/217** following the correction; the user's local post-commit test run and full production build are not independently confirmed. See [Evidence Workspace milestone](#milestone-evidence-workspace-20261127) and [the historical Support milestone](#milestone-voluntary-support-20261125).

**Subsequent evidence and date convention:** The researcher supplied `git log -10 --format="%h | %ad | %s" --date=short` on 2026-11-27, establishing `1203087` as the newest displayed commit and its recorded **author date** of 2026-11-27. This also supplies author dates for nine preceding commits. It does not display committer dates, remote-ref pointers, or a clean working-tree status; earlier `4bdab6c` remote alignment and `6c149e7` clean state remain separate observations. The detailed milestone and verification status below are not overwritten by the new date evidence.

**Checkpoint interpretation:** The date and hash written here are the last known baseline *when this revision was prepared*. A later documentation commit necessarily adds a new hash not knowable from the document before committing. A one-or-more-commit lag is expected; always inspect Git for actual current HEAD and worktree state. The governing date and lag policy is in the [Core Documentation Governance Protocol](PERIDOT_CORE_DOCUMENTATION_GOVERNANCE_PROTOCOL.md#111a-exact-git-dates-and-documentation-commit-baseline-lag-current-rule-2026-11-27).

The older repository-state snapshots are preserved in the [historical checkpoint evidence archive](#5-historical-checkpoint-evidence), rather than in this current-state introduction.

## 2. Find by Area and Period


### Find milestones by development area

This index points to **detailed milestone narratives**, not a second history or a replacement for the chronological record. A milestone can span several areas; links below highlight useful entry points. For exact commit subjects and the continuous recorded sequence, use [the development-history table](#3-full-development-history).

| Development area | Start with these milestone narratives |
|---|---|
| Charts / Analytics | [Expanded Evidence Workspace](#milestone-evidence-workspace-20261127); [Compact Inspector and chart provenance](#milestone-compact-inspector-20261125); [Charts II completion](#milestone-charts-ii); [earlier Charts foundations](#milestone-charts-foundations) |
| Timeline / chronology | [Expanded Evidence Workspace](#milestone-evidence-workspace-20261127); [Grouped swimlanes](#milestone-timeline-grouped); [source-backed categories](#milestone-timeline-categories); [shared calendar navigation](#milestone-chronology); [Timeline II foundation](#milestone-timeline-foundation) |
| Map / Network | [CARTO map and exports](#milestone-carto-map); [generalized Network](#milestone-generalized-network); [Map and Timeline interaction](#milestone-timeline-map) |
| Data import / canonical model | [Workbook and normalization](#milestone-workbook); [generalized mapping foundations](#milestone-mapping-foundation); [canonical normalization](#milestone-canonical) |
| Search / Inspector | [Expanded Evidence Workspace](#milestone-evidence-workspace-20261127); [Compact Inspector and chart provenance](#milestone-compact-inspector-20261125); [Generalized Search](#milestone-search); [Inspector / Identity](#milestone-inspector) |
| Interface / design / About | [Voluntary support](#milestone-voluntary-support-20261125); [About animations](#milestone-about-animations); [public gateways](#milestone-gateways); [Cartographic Editorial foundation](#milestone-editorial) |
| Infrastructure / documentation / testing | [Evidence Workspace regression and Timeline test correction](#milestone-evidence-workspace-20261127); [Documentation architecture and governance revision](#milestone-documentation-reorganization); [Loader and first Map mount](#milestone-loader); [deployment and dependency maintenance](#milestone-dependencies); [earlier documentation governance](#milestone-governance) |

The area labels in the commit-history table are **editorial finding aids**, not original Git metadata or assertions of implementation scope. The recorded subjects and historical notes remain unchanged.

### Jump to period

[Date unverified](#history-undated) · [2026-11](#history-2026-11) · [2026-10](#history-2026-10) · [2026-09](#history-2026-09) · [2026-08](#history-2026-08) · [2026-07](#history-2026-07) · [2026-06](#history-2026-06) · [2026-05](#history-2026-05) · [2026-04](#history-2026-04)

## 3. Full Development History

**Start here for the complete commit record.** Newest entries appear first. Select **Details** to reach a related expandable milestone account. Use the [period index](#jump-to-period) to move directly to a month.

<details>
<summary><strong>How to read this history — source and verification notes</strong></summary>

**Start here.** The register below preserves the original v01 Changelog register (619 rows) and includes later user-confirmed documentation commits, newest first. Exact recorded date strings, commit hashes, messages, area labels, historical notes, and independently recorded verification qualifiers have been retained. The first four columns facilitate scanning; the last provides the original historical note, any documented verification, and a **Details** link where the commit is discussed in the milestone archive. The **Area** labels are editorial, not original Git metadata.

A dash in the historical note means none was originally recorded; absence of a verification qualifier does **not** imply that a commit was untested. Historical branch annotations are not present-day Git status. Some dates remain explicitly unverified. Ten newly verified dates in the recent section come from the researcher-provided Git **author-date** output (`%ad`), not independently checked committer dates (`%cd`); older dated entries retain their original provenance unless checked. The current convention prefers the committer date when established and labels author-date fallbacks. This register has not been checked against a fresh full-repository `git log`.

</details>

| Date | Commit | Exact recorded message | Area (editorial) | Significance / detail |
|---|---|---|---|---|
| <a id="history-2026-11"></a>2026-11-27 | `1203087` | Synchronize core documentation through Evidence Workspace completion | Documentation / evidence | Documentation-only synchronization following Inspector v25 and the grouped-lane test correction; hash and author date supplied by researcher on 2026-11-27. See this checkpoint and [Evidence Workspace milestone](#milestone-evidence-workspace-20261127). |
| 2026-11-27 | `4bdab6c` | Update Timeline grouped-lane test to match priority semantics | Timeline / testing | Test-only correction: `Uncategorized` expectation replaced by `No priority category`, which is the intentional grouped-lane label. Reconstructed-source Node suite 217/217; user-local post-commit run not independently confirmed. [Details](#milestone-evidence-workspace-20261127) |
| 2026-11-27 | `6c149e7` | Complete Evidence Workspace integration across visualizations | Inspector / evidence | Expanded shared dossier integration across Map, Network, Charts II, and Timeline II, with visualization-specific provenance and typed linked navigation. User screenshots accepted; 216/217 pre-fix Node tests and static source checks, production build not confirmed. [Details](#milestone-evidence-workspace-20261127) |
| 2026-11-27 | `3c64813` | Refine Evidence Workspace dossiers, search, and connected places | Inspector / search | Accepted place incoming/outgoing pairs, dossier records, research navigation, query drafting and autocomplete refinements. [Details](#milestone-evidence-workspace-20261127) |
| 2026-11-25 | `1c310e8` | Document voluntary support integration and update interface gallery | Documentation / interface | Follow-up documentation and gallery checkpoint preceding Evidence Workspace integration; confirmed in user Git log. [Details](#milestone-voluntary-support-20261125) |
| 2026-11-25 | `59ce6a7` | Implement voluntary support integration with GitHub Sponsors and Ko-fi | Interface / support | Accepted header utility, staged activation, repository funding metadata and planning records. User-confirmed clean synchronized HEAD; local link and design acceptance; post-activation production/deployment not explicitly confirmed. [Details](#milestone-voluntary-support-20261125) |
| 2026-11-25 | `c60c0da` | Synchronize core documentation through Inspector integration | Documentation / planning | Core documentation checkpoint after compact Inspector integration, confirmed by supplied Git log. [Details](#milestone-compact-inspector-20261125) |
| 2026-11-25 | `01b03bc` | Complete compact Inspector integration across Map, Network, Timeline, and Charts | Inspector / Charts | Consolidated accepted compact Inspector and Charts II mark selection, provenance, records, tests and integration. <em>Verification:</em> User-confirmed synchronized HEAD; user-browser accepted chart-family passes; test report 202/203, known unrelated Timeline label mismatch. [Details](#milestone-compact-inspector-20261125) |
| 2026-11-23 | `b619be4` | add inspector mockup to planning documents | Documentation / planning | Reference mockup preceding the bounded compact Inspector work. [Details](#milestone-compact-inspector-20261125) |
| 2026-11-23 | `d94911f` | Implement resizable compact Inspector panel | Inspector | Initial accepted left-docked resizable panel, subsequently expanded in uncommitted iterative passes and consolidated at `01b03bc`. [Details](#milestone-compact-inspector-20261125) |
| Date not independently established (confirmed by 2026-11-25) | `e3798f4` | Synchronize core documentation after governance reorganization | Documentation / planning | Documentation checkpoint preceding compact Inspector development; confirmed in latest supplied Git log. [Details](#milestone-documentation-reorganization) |
| <a id="history-undated"></a>Date not independently established (confirmed by 2026-11-22) | `9f63175` | Refine documentation governance and workflow charter | Documentation / planning | Historical synchronized documentation checkpoint; accepted Charter v03 and Governance Protocol v01, with the historical restructuring plan retained as non-governing provenance. <em>Verification:</em> User-confirmed Git status/log; no source-app test implied [Details](#milestone-documentation-reorganization) |
| Date not independently established (confirmed by 2026-11-22) | `d5d7a1b` | Reorganize core information documentation and add glossaries | Documentation / planning | Accepted Changelog v04, Maintainer's Guide v04, and README v02 reorganizations; reader onboarding, indexes and glossaries. <em>Verification:</em> User-confirmed Git status/log; no source-app test implied [Details](#milestone-documentation-reorganization) |
| Date not independently established | `2be3ea0` | Synchronize documentation through Charts II completion and appearance customization | Documentation / planning | Historical synchronized checkpoint per researcher-provided Git log and status (2026-11-22); superseded by later documentation commits. <em>Verification:</em> Git status/log confirmed; no new source test implied [Details](#milestone-charts-ii) |
| 2026-11-22 | `e96c375` | Implement Charts appearance customization and adaptive presentation | Charts / Analytics | historical Charts II Appearance checkpoint; Charts II Appearance colors, styles, adaptive labels, resizable panel, and PNG continuity <em>Verification:</em> User browser-accepted; source-level Charts tests reported passing [Details](#milestone-charts-ii) |
| 2026-11-22 | `8baa733` | Retire legacy Charts I and consolidate Charts II workspace | Charts / Analytics | single public Charts tab; removed `AnalyticsPanel.jsx`; shared helpers/CSS retained <em>Verification:</em> User browser regression accepted; retirement test recorded [Details](#milestone-charts-ii) |
| 2026-11-22 | `5c75472` | Implement Charts II chart-local filters and single-series selection | Charts / Analytics | filter scope isolation and compatible single/multi-series value selection <em>Verification:</em> See Charts II milestone; local filter behavior reported accepted [Details](#milestone-charts-ii) |
| 2026-11 (day unverified) | `1dba2eb` | Refine Charts II recommendations using analytical data suitability | Charts / Analytics | genuine paired/numeric/temporal evidence; coordinates excluded from recommendation evidence [Details](#milestone-charts-ii) |
| 2026-11 (day unverified) | `60c626a` | Implement customizable Charts II PNG exports | Charts / Analytics | optional title, axes, notes, provenance; white, unclipped figure output [Details](#milestone-charts-ii) |
| 2026-11 (day unverified) | `afbddee` | Implement Charts II 100 percent stacked bar visualization | Charts / Analytics | normalized additive segment totals, optional absolute values, revised bar labeling [Details](#milestone-charts-ii) |
| 2026-11 (day unverified) | `7aebea9` | Add Charts II regression coverage and stabilize chronology interactions | Charts / Analytics | Dot Plot selection correction; Scatter/Bubble drag-release regression [Details](#milestone-charts-ii) |
| 2026-11 (day unverified) | `d3186ed` | Implement Charts II interactive treemaps with hierarchical drill-down | Charts / Analytics | semantic drill-down and stable Other identity [Details](#milestone-charts-ii) |
| 2026-11 (day unverified) | `bdd7366` | Implement Charts II slope charts with chronological comparisons | Charts / Analytics | canonical two-period comparison [Details](#milestone-charts-ii) |
| 2026-11 (day unverified) | `ee8e0cc` | Implement Charts II dot plots with readable numerical axes | Charts / Analytics | Dot Plot family [Details](#milestone-charts-ii) |
| 2026-11 (day unverified) | `b6e0db5` | Implement Charts II box plots with outlier-aware scaling | Charts / Analytics | Box Plot family [Details](#milestone-charts-ii) |
| 2026-11 (day unverified) | `19fe63b` | Implement Charts II scatter, bubble, and wide-format numerical series | Charts / Analytics | numerical/date comparisons and multi-column measures [Details](#milestone-charts-ii) |
| 2026-11 (day unverified) | `0cf09fd` | Implement Charts II area charts and precision-aware temporal aggregation | Charts / Analytics | Area/Stacked Area; temporal intervals [Details](#milestone-charts-ii) |
| 2026-11 (day unverified) | `6f341f3` | Implement Charts II catalogue and eight functional chart families | Charts / Analytics | initial Catalogue + Builder implementation [Details](#milestone-charts-ii) |
| 2026-11 (day unverified) | `5487cc3` | Synchronize documentation through Timeline II grouped swimlanes | Documentation / planning | earlier core documentation checkpoint |
| 2026-11-11 | `ea7cda8` | Remove obsolete src.zip archive | Other / general | historical checkpoint; intentional deletion of obsolete tracked source ZIP; Charts II work then uncommitted [Details](#milestone-timeline-grouped) |
| 2026-11-11 | `f5791f1` | Implement Timeline II adaptive grouped swimlanes and category workspace | Timeline / chronology | grouped researcher-starred category lanes, five-column editor, browser-accepted Timeline-scoped width constraint <em>Verification:</em> User browser-accepted; focused source tests reported [Details](#milestone-timeline-grouped) |
| 2026-11-10 | `f56e75f` | Synchronize Timeline documentation and organize supporting project resources | Documentation / planning | preceding core documentation/resource checkpoint |
| 2026-11-10 | `9c2bb0e` | Generalize Timeline categories across mapped dataset attributes | Timeline / chronology | preceding source-backed category association milestone; three sample datasets <em>Verification:</em> Researcher-tested on three samples; focused tests reported [Details](#milestone-timeline-categories) |
| 2026-11-10 | `27c5b52` | Implement Timeline category configuration and curated symbol library | Timeline / chronology | researcher-customized categories, optional colors/symbols, 100 curated Tabler icons <em>Verification:</em> Researcher-tested; category tests reported [Details](#milestone-timeline-categories) |
| 2026-11-09 | `4702f3b` | Synchronize documentation through shared chronology completion | Documentation / planning | previous synchronized documentation checkpoint |
| 2026-11-09 | `4fca872` | Unify shared chronology navigation, filtering, and dataset extent presentation | Timeline / chronology | historical chronology checkpoint; visually accepted; concurrent Charts II work uncommitted <em>Verification:</em> Researcher browser-accepted; four focused Node tests reported [Details](#milestone-chronology) |
| Date not independently established | `9c15045` | Document About manuscript entrance animations | Documentation / planning | user-confirmed preceding Git history |
| 2026-11-05 | `71833b3` | Add staggered manuscript entrance animations to About pages | Interface / design | accepted v04 About animation, synchronized last-arriving decorative corners on Feedback; HEAD/origin aligned, working tree contains unrelated changes <em>Verification:</em> User browser-accepted; broader suite not claimed [Details](#milestone-about-animations) |
| Date not independently established | `688bc17` | Retire legacy Timeline I and promote Timeline II | Timeline / chronology | confirmed in prior development context; only active Timeline tab uses the Timeline II implementation [Details](#milestone-chronology) |
| Date not independently established | `d119550` | Added planning docs for a chart builder redesign | Documentation / planning | confirmed preceding Git-log entry; other-workstream details not audited in this pass [Details](#milestone-about-animations) |
| Date not independently established | `c74aa55` | Persist independent chronology sessions across visualizations | Timeline / chronology | confirmed preceding Git-log entry; other-workstream details not audited in this pass [Details](#milestone-chronology) |
| Date not independently established | `50c1be5` | Document persistent loading architecture and first-load Map repair | Documentation / planning | confirmed preceding Git-log entry; other-workstream details not audited in this pass [Details](#milestone-about-animations) |
| 2026-11-03 | `81c3719` | Implement persistent loading animation and repair initial Map mounting | Map / geography | this-conversation loader and Map first-mount repair; pushed; post-push clean status not supplied <em>Verification:</em> User browser-accepted; deployment not independently verified [Details](#milestone-loader) |
| 2026-11-01 | `ddee7e2` | Extend Timeline II vertical chronology to full plotting height | Timeline / chronology | user-approved vertical-axis improvement; clean push and working tree [Details](#milestone-timeline-map) |
| 2026-11-01 | `8cb1cbc` | Unify chronology controls and stabilize Map playback and initialization | Timeline / chronology | shared chronology component/adapter; Map scrubbing and initialization repairs [Details](#milestone-timeline-map) |
| 2026-11-01 | `2664fbf` | Unify Timeline II chronology navigation and playback controls | Timeline / chronology | Timeline II chronology navigation and playback checkpoint [Details](#milestone-timeline-map) |
| 2026-11-01 | `8899b8d` | put old planning docs into planning docs folder | Documentation / planning | intervening planning-doc organization [Details](#milestone-timeline-map) |
| 2026-11-01 | `3f0ae7c` | Introduce Timeline II and stabilize chronological event packing | Timeline / chronology | initial Timeline II and packing checkpoint [Details](#milestone-timeline-map) |
| 2026-11-01 | `0f60f5d` | Add Timeline category system design reference | Timeline / chronology | verified in earlier user log; earlier design reference |
| 2026-11-01 | `481acd9` | Optimize canonical capability readiness calculations | Data / mapping | precomputed per-record capability indexes; functional tests accepted; clean sync [Details](#milestone-workbook) |
| 2026-11-01 | `8dd208a` | Restore progressive disclosure for new data uploads | Data / mapping | distinguish suggested fresh-upload fields from existing accepted mappings [Details](#milestone-workbook) |
| 2026-11-01 | `64dfbae` | Guard workbook confirmation against stale review results | Data / mapping | defense inside confirmation handler [Details](#milestone-workbook) |
| 2026-11-01 | `54dfa2c` | Provide CARTO basemap key to GitHub Pages build | Map / geography | GitHub Actions secret forwarded to Vite build; live-site fix confirmed [Details](#milestone-workbook) |
| 2026-11-01 | `be5fea5` | Synchronize documentation through dependency maintenance and mapping refinements | Documentation / planning | preceding documentation synchronization [Details](#milestone-workbook) |
| 2026-11-01 | `973d40d` | Refine mapping disclosure and subject selection and repair Review | Map / geography | one-at-a-time Places Add, visible existing mappings, Review fix [Details](#milestone-dependencies) |
| <a id="history-2026-10"></a>2026-10-31 | `74ca40e` | Upgrade SheetJS and refresh Browserslist compatibility data | Search / Explore | official SheetJS 0.20.3; caniuse-lite refresh [Details](#milestone-dependencies) |
| 2026-10-31 | `3da30ec` | Remove obsolete MapLibre dependencies from lockfile | Map / geography | orphaned MapLibre lockfile tree removed [Details](#milestone-dependencies) |
| 2026-10-31 | `1a58e44` | Synchronize documentation through CARTO map and workbook processing improvements | Documentation / planning | prior documentation sync [Details](#milestone-dependencies) |
| 2026-10-31 | `ae3574c` | Finalize geographic map interface and improve workbook review processing | Map / geography | latest user-confirmed clean, pushed checkpoint; map settings and provisional importer worker [Details](#milestone-carto-map) |
| 2026-10-31 | `2684b3c` | Repair geographic map exports and preserve CARTO attribution | Map / geography | embedded raster exports, attribution, corrected zoom-after-drag behavior [Details](#milestone-carto-map) |
| 2026-10-31 | `3c0a43e` | Optimize geographic map rendering and interaction performance | Map / geography | optimized tile loading, clipped/culling edges, rapid-interaction recovery [Details](#milestone-carto-map) |
| 2026-10-31 | `bc99e31` | Stabilize CARTO world wrapping, high-zoom rendering, and map interactions | Map / geography | continuous horizontal wrapping and zoom-20 rendering [Details](#milestone-carto-map) |
| 2026-10-31 | `0794002` | Establish Web Mercator and CARTO multiscale map prototype | Map / geography | initial tiled geographic implementation [Details](#milestone-carto-map) |
| 2026-10-31 | `005db62` | Synchronize documentation through editorial gateways and production asset repair | Documentation / planning | historical documentation checkpoint |
| 2026-10-31 | `87bc8f0` | Include editorial gateway artwork in production build | Interface / design | published Git message from later user Git log [Details](#milestone-gateways) |
| 2026-10-31 | `2214d8e` | Add editorial entrance animations to onboarding pages | Interface / design | published Git message from later user Git log [Details](#milestone-gateways) |
| 2026-10-31 | `fc42306` | Subject not supplied in sync ritual | Other / general | historical clean aligned checkpoint at the time; Vite import correction was the accepted functional change [Details](#milestone-gateways) |
| 2026-10-31 | `5d5f528` | Fix editorial gateway asset paths for GitHub Pages | Interface / design | earlier base-path-only fix, superseded by Vite imports [Details](#milestone-gateways) |
| 2026-10-31 | `c150444` | Modify some decorative assets | Interface / design | subsequent artwork adjustments [Details](#milestone-gateways) |
| 2026-10-31 | `dd11827` | Redesign Visualize and Explore no-data onboarding | Search / Explore | illustrated no-dataset screens, Data CTA [Details](#milestone-gateways) |
| 2026-10-31 | `1a6554d` | Synchronize documentation through About manuscript and Data responsive refinements | Documentation / planning | preceding core-documentation synchronization [Details](#milestone-gateways) |
| 2026-10-30 | `5e785ed` | Refine About manuscript design and Data workspace responsiveness | Interface / design | historical clean aligned checkpoint; About corner/wrapping/portrait and laptop Data density [Details](#milestone-gateways) |
| 2026-10-30 | `7df38d0` | Synchronize documentation through Data onboarding and asset organization | Documentation / planning | preceding documentation synchronization [Details](#milestone-detail-12) |
| 2026-10-30 | `c71e265` | Repair asset references after decorative asset renaming | Interface / design | historical accepted checkpoint; user-tested image paths [Details](#milestone-detail-13) |
| 2026-10-30 | `52cf1f8` | add and rename decorative assets | Interface / design | role-based naming and asset catalog; 44 experimental labels/frames excluded [Details](#milestone-detail-13) |
| 2026-10-30 | `761d72d` | Refine Data workspace controls and sample selection icon | Data / mapping | oxblood Edit Mapping and four-tiles icon [Details](#milestone-detail-13) |
| 2026-10-30 | `ee4c3ff` | Redesign Data onboarding and refine workspace animations | Interface / design | four Data tabs, status panel, sample actions, Home Get Started [Details](#milestone-detail-13) |
| 2026-10-30 | `86cb3d0` | Synchronize documentation through mapping and interface refinements | Documentation / planning | preceding documentation checkpoint [Details](#milestone-detail-13) |
| 2026-10-28 | `87d6955` | Refine informational workspace presentation and restore Creator layout | Interface / design | historical clean synchronized checkpoint [Details](#milestone-detail-14) |
| 2026-10-28 | `c0e1fb3` | Add progressive disclosure to relationship time and place mapping | Map / geography | user-activated Add controls; original editor layouts [Details](#milestone-detail-14) |
| 2026-10-28 | `55453a8` | Support XLSM workbooks and improve file import errors | Data / mapping | workbook acceptance and actionable errors [Details](#milestone-detail-14) |
| 2026-10-27 | `3bb71be` | Replace unfinished tutorial entry with coming soon page | Interface / design | public Tutorials placeholder [Details](#milestone-detail-14) |
| 2026-10-27 | `fb18799` | Organize historical design assets and retain portrait reference | Interface / design | reference-asset relocation [Details](#milestone-detail-14) |
| 2026-10-27 | `263cad0` | Refine homepage styling and add sample dataset artwork | Data / mapping | Florence and sample artwork [Details](#milestone-detail-14) |
| 2026-10-27 | `2217373` | Unify About workspace editorial styling and refine feedback layout | Interface / design | About/Feedback presentation [Details](#milestone-detail-14) |
| 2026-10-26 | `83dd4fa` | Refine sample selection layout for laptop viewports | Data / mapping | compact card sizing [Details](#milestone-detail-14) |
| 2026-10-26 | `d75fa1e` | Add staggered Sample Selection entrance animations | Data / mapping | sample-page animation [Details](#milestone-detail-14) |
| 2026-10-26 | `5f4a7f2` | Refine Cartographic Editorial homepage entrance animations | Map / geography | homepage animation [Details](#milestone-detail-14) |
| 2026-10-26 | `d443585` | Redesign sample selection and Data entry workspace | Data / mapping | sample chooser and Data entry [Details](#milestone-detail-14) |
| 2026-10-26 | `4133bb7` | Synchronize documentation through shared mapping redesign | Documentation / planning | preceding documentation checkpoint |
| 2026-10-26 | `27e3cf7` | Update interface mockups and genealogy retirement audit | Data / mapping | historical clean checkpoint; planning artifacts only [Details](#milestone-detail-15) |
| 2026-10-26 | `f3cf4fb` | Refine shared mapping workspace layout and contextual guidance | Map / geography | accepted first-stage Relations/Time/Places UI redesign [Details](#milestone-detail-15) |
| 2026-10-26 | `89aaa50` | Align mapping workspace palette and improve contrast | Map / geography | mapping visual palette pass [Details](#milestone-detail-15) |
| 2026-10-26 | `60b8643` | Open file chooser directly from homepage | Interface / design | direct upload action [Details](#milestone-detail-15) |
| 2026-10-26 | `2117659` | Connect homepage sample button to sample chooser | Data / mapping | explicit sample selection [Details](#milestone-detail-15) |
| 2026-10-26 | `7280e30` | Refine homepage typography and onboarding layout | Interface / design | two primary actions and editorial banner guidance [Details](#milestone-detail-15) |
| 2026-10-26 | `57f6ef3` | Document Adobe filigree asset retirement | Documentation / planning | documentation checkpoint [Details](#milestone-detail-15) |
| 2026-10-26 | `07ec80d` | Retire Adobe filigree assets and decorations | Interface / design | removed five filigree assets and active references [Details](#milestone-detail-15) |
| 2026-10-26 | `6667505` | Synchronize documentation through Cartographic Editorial overhaul | Documentation / planning | preceding documentation checkpoint |
| 2026-10-31 | `973d40d` | Refine mapping disclosure and subject selection and repair Review | Map / geography | latest user-confirmed clean/pushed checkpoint; mapping UI and Review repairs [Details](#milestone-dependencies) |
| 2026-10-31 | `74ca40e` | Upgrade SheetJS and refresh Browserslist compatibility data | Search / Explore | pinned SheetJS 0.20.3 and refreshed caniuse-lite; user import QA passed [Details](#milestone-dependencies) |
| 2026-10-31 | `3da30ec` | Remove obsolete MapLibre dependencies from lockfile | Map / geography | orphaned dependency retirement; archived branch retained [Details](#milestone-dependencies) |
| 2026-10-31 | `1a58e44` | Synchronize documentation through CARTO map and workbook processing improvements | Documentation / planning | preceding core-documentation checkpoint [Details](#milestone-dependencies) |
| 2026-10-25 | `4e6fb11` | Refine Cartographic Editorial homepage composition | Map / geography | historical; amended from `c88056d` [Details](#milestone-detail-17) |
| 2026-10-25 | `2472c57` | Consolidate primary and secondary button styling | Interface / design | accepted button consolidation [Details](#milestone-detail-17) |
| 2026-10-17 | `9e12305` | Document Visualize component ownership and styling architecture | Documentation / planning | accepted ownership notes [Details](#milestone-detail-17) |
| 2026-10-17 | `ad14727` | Refine Visualize workspace styling and viewport | Interface / design | accepted Visualize pass [Details](#milestone-detail-17) |
| 2026-10-17 | `aaef93b` | Integrate Cartographic Editorial homepage assets | Map / geography | historical predecessor |
| 2026-10-15 | `fd02d84` | Build Cartographic Editorial Home composition | Map / geography | historical local-only checkpoint; later superseded [Details](#milestone-detail-17) |
| 2026-10-15 | `fe9634b` | Redesign global header with editorial typography | Interface / design | historical prior remote checkpoint [Details](#milestone-editorial) |
| 2026-10-15 | `243ea6c` | Establish Cartographic Editorial typography foundations | Map / geography | prior accepted commit [Details](#milestone-editorial) |
| 2026-10-15 | `889ebae` | Document legacy CSS and cascade verification | Documentation / planning | prior accepted commit [Details](#milestone-editorial) |
| 2026-10-15 | `2e20bba` | Integrate Cartographic Editorial palette and restore UI contrast | Map / geography | prior accepted commit [Details](#milestone-editorial) |
| 2026-10-15 | `f667329` | Establish Home and Data workspace styling ownership | Interface / design | prior accepted commit [Details](#milestone-editorial) |
| 2026-10-15 | `bc4761e` | Consolidate shared panel and workspace framing styles | Interface / design | prior accepted commit [Details](#milestone-editorial) |
| 2026-10-15 | `98bcbcb` | Consolidate shared button form and card styles | Interface / design | prior accepted commit [Details](#milestone-editorial) |
| 2026-10-15 | `d108bb2` | Migrate shared styles to centralized design tokens | Interface / design | prior accepted commit [Details](#milestone-editorial) |
| 2026-10-15 | `ec5152c` | Establish centralized styling foundations and editorial design plan | Interface / design | prior accepted commit [Details](#milestone-editorial) |
| 2026-10-14 | `2024897` | Synchronize documentation through navigation redesign | Documentation / planning | preceding documentation checkpoint [Details](#milestone-editorial) |
| 2026-10-14 | `cd625a2` | Normalize About workspace and feedback | Data / mapping | historical checkpoint at time [Details](#milestone-detail-19) |
| 2026-10-01 | `f139f53` | Move data mapping into full-page workspace | Map / geography | — [Details](#milestone-detail-19) |
| 2026-10-01 | `4a6cd2e` | Support ISO 8601 temporal values | Timeline / chronology | — [Details](#milestone-detail-19) |
| <a id="history-2026-09"></a>2026-09-30 | `e9ddf1f` | Restructure Explore workspace navigation | Search / Explore | — [Details](#milestone-detail-19) |
| 2026-09-30 | `f59402f` | Flatten visualization workspace framing | Interface / design | — [Details](#milestone-detail-19) |
| 2026-09-30 | `1810bf9` | Simplify visualization workspace navigation | Interface / design | — [Details](#milestone-detail-19) |
| 2026-09-30 | `a1f4d56` | Add persistent navigation and workspace state | Interface / design | — [Details](#milestone-detail-19) |
| 2026-09-28 | `360682f` | Synchronize documentation through timeline workspace | Documentation / planning | — [Details](#milestone-detail-19) |
| 2026-09-27 | `a32ef05` | Add timeline relationship layout and sample switching fixes | Timeline / chronology | — [Details](#milestone-timeline-foundation) |
| 2026-09-27 | `90f93d2` | Refine timeline navigation and temporal axis | Timeline / chronology | — [Details](#milestone-timeline-foundation) |
| 2026-09-27 | `d1fd010` | Optimize timeline rendering performance | Timeline / chronology | — [Details](#milestone-timeline-foundation) |
| 2026-09-27 | `98f3841` | Refine timeline readability and zoom | Timeline / chronology | — [Details](#milestone-timeline-foundation) |
| 2026-09-27 | `0d0380a` | Add evidence-driven timeline categories | Timeline / chronology | — [Details](#milestone-timeline-foundation) |
| 2026-09-27 | `d410c3d` | Add vertical timeline orientation | Timeline / chronology | — [Details](#milestone-timeline-foundation) |
| 2026-09-27 | `8188ac0` | Add horizontal timeline workspace | Timeline / chronology | — [Details](#milestone-timeline-foundation) |
| 2026-09-27 | `d82406e` | Add canonical timeline workspace projection | Timeline / chronology | — [Details](#milestone-timeline-foundation) |
| 2026-09-27 | `7eddfb0` | Synchronize documentation through playback performance | Documentation / planning | — [Details](#milestone-timeline-foundation) |
| 2026-09-27 | `c8a7c46` | Optimize network playback and viewport interaction | Timeline / chronology | — [Details](#milestone-detail-21) |
| 2026-09-27 | `da87f6d` | Isolate wheel zoom from clustering updates | Network | — [Details](#milestone-detail-21) |
| 2026-09-27 | `f34207d` | Isolate viewport panning from graph rendering | Other / general | — [Details](#milestone-detail-21) |
| 2026-09-27 | `a92ec9a` | Restore smooth timeline playback scrubbing | Timeline / chronology | — [Details](#milestone-detail-21) |
| 2026-09-27 | `04d8244` | Add direct sample data actions | Data / mapping | — [Details](#milestone-detail-21) |
| 2026-09-27 | `239f11f` | Refine sample data chooser interaction | Data / mapping | — [Details](#milestone-detail-21) |
| 2026-09-25 | `852fd72` | Synchronize documentation through Network playback generalization | Documentation / planning | — [Details](#milestone-detail-21) |
| 2026-09-25 | `ddc0aca` | Generalize network playback highlighting | Timeline / chronology | (HEAD -> main, origin/main, origin/HEAD) [Details](#milestone-detail-21) |
| 2026-09-14 | `cab2ffc` | Stabilize geographic map settings and hover semantics | Map / geography | — [Details](#milestone-generalized-network) |
| 2026-09-14 | `0afd2dd` | Unify geographic map projection | Map / geography | — [Details](#milestone-generalized-network) |
| 2026-09-14 | `19345df` | Add map settings and compact visualization controls | Map / geography | — [Details](#milestone-generalized-network) |
| 2026-09-14 | `e0fd1c0` | Add generalized geographic anchor model | Map / geography | — [Details](#milestone-generalized-network) |
| 2026-09-14 | `9ecb4f8` | Align geographic network relationship scope | Map / geography | — [Details](#milestone-generalized-network) |
| 2026-09-07 | `9166e3e` | Synchronize documentation through Search generalization | Documentation / planning | — [Details](#milestone-generalized-network) |
| 2026-09-07 | `1810a40` | Replace minimum weight with count conditions | Other / general | (HEAD -> main, origin/main, origin/HEAD) [Details](#milestone-search) |
| 2026-09-07 | `656010d` | Align Search scope across Inspector and Analytics | Charts / Analytics | — [Details](#milestone-search) |
| 2026-09-07 | `f1a6942` | Generalize Search evidence semantics | Search / Explore | — [Details](#milestone-search) |
| 2026-09-07 | `2fd0084` | Generalize Search results presentation | Search / Explore | — [Details](#milestone-search) |
| 2026-09-07 | `aabc8bb` | Generalize Search place semantics | Search / Explore | — [Details](#milestone-search) |
| <a id="history-2026-08"></a>2026-08-31 | `e697bd2` | Refine timeline slider interaction | Timeline / chronology | — [Details](#milestone-search) |
| 2026-08-31 | `5e3289c` | Synchronize documentation through subject-aware evidence | Documentation / planning | — [Details](#milestone-search) |
| 2026-08-31 | `b7482cb` | Add homepage tutorial placeholder | Interface / design | — [Details](#milestone-detail-24) |
| 2026-08-31 | `ef1c95f` | Project subject-aware Evidence into Inspector | Inspector | — [Details](#milestone-detail-24) |
| 2026-08-31 | `c7069da` | Add canonical subject-aware Evidence assertions | Data / mapping | — [Details](#milestone-detail-24) |
| 2026-08-31 | `8e69bb6` | Add subject-aware Evidence mapping | Map / geography | — [Details](#milestone-detail-24) |
| 2026-08-31 | `3f921d0` | Generalize place and time subject attribution | Other / general | — [Details](#milestone-detail-24) |
| 2026-08-31 | `4405f40` | Guard multi-value place coordinate mapping | Map / geography | — [Details](#milestone-detail-24) |
| 2026-08-31 | `d82e669` | Canonicalize entity display labels | Data / mapping | — [Details](#milestone-detail-24) |
| 2026-08-24 | `1d34b89` | Generalize cardinality and integrated identity mapping | Map / geography | — [Details](#milestone-detail-24) |
| 2026-08-21 | `951c21e` | Synchronize documentation for generalized sample datasets | Documentation / planning | — [Details](#milestone-detail-24) |
| 2026-08-21 | `8290696` | Add first-class generalized sample datasets | Data / mapping | (HEAD -> main, origin/main, origin/HEAD) [Details](#milestone-inspector) |
| 2026-08-21 | `e944e60` | Stabilize generalized correspondence mapping | Map / geography | — [Details](#milestone-inspector) |
| 2026-08-21 | `bc37b08` | Make mapped identity and place subjects authoritative | Map / geography | — [Details](#milestone-inspector) |
| 2026-08-21 | `287ca50` | Generalize Inspector semantics and participant attribution | Inspector | — [Details](#milestone-inspector) |
| 2026-08-19 | `959d874` | Synchronize documentation for identity and inspector groundwork | Documentation / planning | — [Details](#milestone-inspector) |
| 2026-08-19 | `4076e5b` | Checkpoint generalized identity mapping groundwork | Map / geography | (HEAD -> main, origin/main, origin/HEAD) [Details](#milestone-inspector) |
| 2026-08-19 | `a24034f` | Checkpoint generalized geographic network groundwork | Map / geography | — [Details](#milestone-detail-26) |
| 2026-08-19 | `ccc2482` | Complete generalized relationship search helpers | Search / Explore | — [Details](#milestone-detail-26) |
| 2026-08-19 | `3b3c537` | Use generalized relationships in search and network capabilities | Network | — [Details](#milestone-detail-26) |
| 2026-08-19 | `9cc9d93` | Retire legacy temporal interpretation paths | Timeline / chronology | — [Details](#milestone-detail-26) |
| 2026-08-19 | `df9511b` | Migrate temporal consumers and checkpoint network foundations | Timeline / chronology | — [Details](#milestone-detail-26) |
| 2026-08-19 | `9fe62a3` | Synchronize documentation for temporal and timeline updates | Documentation / planning | — [Details](#milestone-detail-26) |
| 2026-08-17 | `2d5e668` | Generalize temporal mapping and timeline playback | Timeline / chronology | (HEAD -> main, origin/main, origin/HEAD) [Details](#milestone-detail-26) |
| 2026-08-17 | `ce46f08` | Derive timeline from canonical temporal assertions | Timeline / chronology | — [Details](#milestone-detail-27) |
| 2026-08-17 | `ac95c13` | Bridge canonical temporal assertions to runtime rows | Timeline / chronology | — [Details](#milestone-detail-27) |
| 2026-08-17 | `ba07895` | Add temporal assertions foundation | Timeline / chronology | — [Details](#milestone-detail-27) |
| 2026-08-09 | `6fd19e0` | Refine network availability for generalized relationships | Network | — [Details](#milestone-detail-27) |
| 2026-08-09 | `358202c` | Generalize workbook join validation | Data / mapping | — [Details](#milestone-detail-27) |
| 2026-08-08 | `c600295` | Make generalized mappings authoritative for workbook import | Map / geography | — [Details](#milestone-detail-27) |
| 2026-08-08 | `0fa8925` | Make generalized mappings authoritative for single-table import | Map / geography | — [Details](#milestone-detail-27) |
| 2026-08-08 | `858ac26` | Synchronize documentation for Phase 2 mapping redesign | Documentation / planning | — [Details](#milestone-detail-27) |
| 2026-08-08 | `134c67c` | Refine upload review checkpoint | Data / mapping | — [Details](#milestone-detail-28) |
| 2026-08-08 | `0ae7e03` | Refine evidence mapping workflow | Map / geography | — [Details](#milestone-detail-28) |
| 2026-08-08 | `967b293` | Generalize relationship mapping workflow | Map / geography | — [Details](#milestone-detail-28) |
| 2026-08-08 | `90a3a3b` | Generalize place mapping workflow | Map / geography | — [Details](#milestone-detail-28) |
| 2026-08-08 | `fb400db` | Fix time examples for row-oriented tables | Infrastructure / maintenance | — [Details](#milestone-detail-28) |
| 2026-08-08 | `14f48cb` | Add upload table orientation guidance | Data / mapping | — [Details](#milestone-detail-28) |
| 2026-08-08 | `0aa0c21` | Improve temporal data mapping workflow | Timeline / chronology | — [Details](#milestone-detail-28) |
| 2026-08-08 | `cc43c9e` | Improve upload data preview | Data / mapping | — [Details](#milestone-detail-28) |
| 2026-08-08 | `050e3ed` | Mount universal mapper for interactive testing | Map / geography | — [Details](#milestone-detail-28) |
| 2026-08-08 | `3b30367` | Add reversible universal mapping edits | Map / geography | — [Details](#milestone-detail-28) |
| 2026-08-08 | `2d96b1a` | Add operational related sheet connections | Data / mapping | — [Details](#milestone-detail-28) |
| 2026-08-08 | `8b52af6` | Add repeated data orientation mapping | Map / geography | — [Details](#milestone-detail-28) |
| 2026-08-08 | `3153861` | Make universal sheet purposes operational | Data / mapping | — [Details](#milestone-detail-28) |
| 2026-08-08 | `157574e` | Add editable universal mapping suggestions | Map / geography | — [Details](#milestone-detail-28) |
| 2026-08-08 | `7588269` | Add universal upload workflow prototype | Data / mapping | — [Details](#milestone-detail-28) |
| 2026-08-07 | `e10c062` | Synchronize documentation for universal data phase 1 | Documentation / planning | — [Details](#milestone-detail-28) |
| 2026-08-07 | `301a1e1` | Add universal runtime compatibility boundary | Other / general | (HEAD -> main, origin/main, origin/HEAD) [Details](#milestone-mapping-foundation) |
| 2026-08-07 | `ebcd7d0` | Add universal transformation helpers | Other / general | — [Details](#milestone-mapping-foundation) |
| 2026-08-07 | `eda0b88` | Add generalized source sheet model | Data / mapping | — [Details](#milestone-mapping-foundation) |
| 2026-08-07 | `a05130f` | Add universal mapping schema foundation | Map / geography | — [Details](#milestone-mapping-foundation) |
| <a id="history-2026-07"></a>2026-07-24 | `8f19997` | Activate canonical genealogy imports | Data / mapping | — [Details](#milestone-canonical) |
| 2026-07-24 | `2ef36a6` | Add genealogy mapping workflow | Map / geography | — [Details](#milestone-canonical) |
| 2026-07-24 | `1e661da` | Add genealogy mapping schema and validation | Map / geography | — [Details](#milestone-canonical) |
| 2026-07-24 | `94b9d46` | Add dataset profile selection and routing | Other / general | — [Details](#milestone-canonical) |
| 2026-07-24 | `402336f` | Add genealogy normalization profile | Data / mapping | — [Details](#milestone-canonical) |
| 2026-07-24 | `ba844cc` | Switch imports to canonical normalization source | Data / mapping | — [Details](#milestone-canonical) |
| 2026-07-24 | `53c1116` | Add normalization shadow comparison | Data / mapping | — [Details](#milestone-canonical) |
| 2026-07-24 | `6c04e84` | Add normalized model compatibility adapter | Data / mapping | — [Details](#milestone-canonical) |
| 2026-07-24 | `1e17596` | Add correspondence normalization profile | Data / mapping | — [Details](#milestone-canonical) |
| 2026-07-24 | `d612c3e` | Add normalized data model foundations | Data / mapping | — [Details](#milestone-canonical) |
| 2026-07-24 | `3aaee49` | Add normalized data model foundations | Data / mapping | — [Details](#milestone-canonical) |
| 2026-07-24 | `805163d` | update changlog | Other / general | — |
| 2026-07-24 | `a09716c` | Synchronize documentation for first-time tutorial | Documentation / planning | — |
| 2026-07-14 | `619bab0` | Restore stable tutorial attention behavior | Interface / design | (HEAD -> main, origin/main, origin/HEAD) [Details](#milestone-canonical) |
| 2026-07-14 | `d3c3c24` | Refine tutorial presentation and dialogue layout | Interface / design | — [Details](#milestone-detail-31) |
| 2026-07-14 | `297430f` | Improve tutorial accessibility and focus handling | Interface / design | — [Details](#milestone-detail-31) |
| 2026-07-14 | `8241f3a` | Harden tutorial recovery and anchor resolution | Interface / design | — [Details](#milestone-detail-31) |
| 2026-07-14 | `16cf7cc` | Complete tutorial export and finish flow | Interface / design | — [Details](#milestone-detail-31) |
| 2026-07-14 | `a52b9ca` | Add working set tutorial explanation | Interface / design | — [Details](#milestone-detail-31) |
| 2026-07-14 | `783acc1` | Add Browse and applied search tutorial guidance | Search / Explore | — [Details](#milestone-detail-31) |
| 2026-07-14 | `67fc073` | Guide tutorial navigation into Explore | Search / Explore | — [Details](#milestone-detail-31) |
| 2026-07-14 | `48f680a` | Add Inspector tutorial guidance and placement | Inspector | — [Details](#milestone-detail-31) |
| 2026-07-14 | `ed6466f` | Add interactive timeline tutorial guidance | Timeline / chronology | — [Details](#milestone-detail-31) |
| 2026-07-14 | `da0a472` | Anchor tutorial to visualization and timeline controls | Timeline / chronology | — [Details](#milestone-detail-31) |
| 2026-07-14 | `84fe3cc` | Add tutorial foundation and step state machine | Interface / design | — [Details](#milestone-detail-31) |
| <a id="history-2026-06"></a>2026-06-22 | `42149ab` | Add metadata refinement and connected entity search | Search / Explore | — |
| 2026-06-22 | `14aa380` | Separate Search scope from playback visibility | Timeline / chronology | — |
| 2026-06-22 | `f01ed59` | Build unified Search metadata records | Search / Explore | — |
| 2026-06-22 | `b1a32b6` | Expand Browse and Refine index coverage | Search / Explore | — |
| 2026-06-22 | `e7dfb3d` | Update PROJECT_WORKFLOW_CHARTER.md | Charts / Analytics | — |
| 2026-06-22 | `8a5c6f3` | Update README.md with AI disclosure | Documentation / planning | — |
| 2026-06-22 | `07cb6be` | Update README.md | Documentation / planning | — |
| 2026-06-22 | `03e3e82` | Create README.md redirect for GitHub users | Documentation / planning | — |
| 2026-06-22 | `3fc7331` | Restructure and audit core documentation | Documentation / planning | — |
| 2026-06-22 | `a9b9c81` | Add core documentation restructuring plan | Documentation / planning | — |
| 2026-06-22 | `70d8b31` | Move documentation governance protocol to core documentation | Documentation / planning | — |
| 2026-06-22 | `6d05409` | Add core documentation governance protocol | Documentation / planning | — |
| 2026-06-22 | `dc5f20b` | Add core documentation governance protocol | Documentation / planning | — |
| 2026-06-22 | `58fdd08` | Refresh README screenshots and preserve interface history | Documentation / planning | — |
| 2026-06-21 | `7df46a8` | Restore extracted workspace stylesheet imports | Data / mapping | — |
| 2026-06-21 | `8f2d1ca` | Refine feedback form and visualization control layering | Interface / design | — |
| 2026-06-21 | `639e30f` | Extract Inspector stylesheet | Inspector | (HEAD -> main, origin/main, origin/HEAD) [Details](#milestone-detail-33) |
| 2026-06-21 | `f7e885c` | Extract Analytics stylesheet | Charts / Analytics | — [Details](#milestone-detail-33) |
| 2026-06-21 | `19acc89` | Extract Search workspace stylesheet | Search / Explore | — [Details](#milestone-detail-33) |
| 2026-06-21 | `407becc` | Remove obsolete column mapping stylesheet rules | Map / geography | — [Details](#milestone-detail-33) |
| 2026-06-21 | `5c0532d` | Remove residual Learn More global stylesheet rules | Data / mapping | — [Details](#milestone-detail-33) |
| 2026-06-21 | `7b9ddf3` | Extract column mapping modal stylesheet | Map / geography | — [Details](#milestone-detail-33) |
| 2026-06-21 | `264e8d9` | Remove obsolete Data workspace stylesheet rules | Data / mapping | — [Details](#milestone-detail-33) |
| 2026-06-19 | `0c5a219` | Add Learn More section dividers | Other / general | (HEAD -> main, origin/main, origin/HEAD) [Details](#milestone-detail-33) |
| 2026-06-19 | `795f0f7` | Restore Explore folio corner containment | Search / Explore | — [Details](#historical-milestone-01) |
| 2026-06-19 | `98cccf5` | Warm Learn More parchment surfaces | Interface / design | — [Details](#historical-milestone-01) |
| 2026-06-19 | `59f7d69` | Refine Learn More expanded biography layout | Interface / design | — [Details](#historical-milestone-01) |
| 2026-06-19 | `39983e3` | Refine Learn More project information layout | Interface / design | — [Details](#historical-milestone-01) |
| 2026-06-19 | `2307d5a` | Stabilize visualization header entrance and Explore folio frame | Search / Explore | — [Details](#historical-milestone-01) |
| 2026-06-19 | `7a115f7` | Fix Explore folio frame clipping | Search / Explore | — [Details](#historical-milestone-01) |
| 2026-06-19 | `81f6311` | Add Learn More author assets | Interface / design | — [Details](#historical-milestone-01) |
| 2026-06-19 | `9fbd200` | Expand Learn More author and GitHub sections | Other / general | — [Details](#historical-milestone-01) |
| 2026-06-19 | `e5f832c` | Animate Explore workspace transitions | Search / Explore | (HEAD -> main, origin/main, origin/HEAD) [Details](#historical-milestone-02) |
| 2026-06-19 | `d3e4625` | Open Inspector over Explore workspace | Inspector | — |
| 2026-06-19 | `7942fda` | Convert Explore Browse to compact ledgers | Network | — |
| 2026-06-19 | `efd6d95` | Compact Explore Build and Capabilities layouts | Search / Explore | — |
| 2026-06-19 | `a793c06` | Make Explore Refine facets route-aware | Map / geography | — |
| 2026-06-19 | `3e96f59` | Refine Explore facet panel behavior | Search / Explore | — |
| 2026-06-19 | `7e5df91` | Polish Explore Results ledger density | Network | — |
| 2026-06-19 | `dd09003` | Match Explore Results pagination to Inspector | Inspector | — |
| 2026-06-19 | `1542c04` | Refine Explore Results ledger | Network | — |
| 2026-06-18 | `d04eaf6` | Hide theme menu entry and animate learn more cards | Interface / design | — [Details](#historical-milestone-03) |
| 2026-06-18 | `342e606` | Simplify upload step transitions | Data / mapping | — |
| 2026-06-18 | `35946d4` | Animate upload mapping transitions | Map / geography | — |
| 2026-06-18 | `18419a5` | Refine workbook sheet assembly layout | Data / mapping | — |
| 2026-06-18 | `3d2704e` | Refine workbook mapping controls | Map / geography | — |
| 2026-06-18 | `e12862c` | Refine review warning display | Other / general | — |
| 2026-06-18 | `4330312` | Refine preview and places mapping details | Map / geography | — |
| 2026-06-18 | `b9c113c` | Refine relationship mapping layout | Map / geography | — |
| 2026-06-18 | `d3bda6f` | Refine places mapping layout | Map / geography | — |
| 2026-06-17 | `74db963` | Refine Inspector reference layout and record tables | Inspector | (HEAD -> main, origin/main, origin/HEAD) [Details](#historical-milestone-04) |
| 2026-06-17 | `d6baedf` | Refine Inspector reference layout and record tables | Inspector | — |
| 2026-06-17 | `05fe40f` | Keep visualizations mounted behind Inspector overlay | Inspector | — |
| 2026-06-17 | `306650f` | Fix Inspector person navigation from geographic context | Map / geography | — |
| 2026-06-16 | `dd8e9c5` | Refresh documentation for animation and inspector milestones | Documentation / planning | — |
| 2026-06-16 | `bd9b807` | Refine inspector workspace styling | Inspector | (HEAD -> main, origin/main, origin/HEAD) [Details](#historical-milestone-05) |
| 2026-06-16 | `2bd6b3a` | Center force network on dense cluster | Network | — |
| 2026-06-16 | `7c1f9fd` | Polish chart builder controls | Charts / Analytics | — |
| 2026-06-16 | `6dfd4c6` | Animate chart workspace reveal | Charts / Analytics | — |
| 2026-06-16 | `7af288f` | Refine visualization workspace transitions | Interface / design | — |
| 2026-06-16 | `ef8e188` | Add workspace entrance animations | Interface / design | — |
| 2026-06-16 | `3777fbc` | Correct filigree asset spelling | Interface / design | — |
| 2026-06-16 | `f8ea541` | add a filegree asset | Interface / design | — |
| 2026-06-16 | `6f008ce` | Redesign data workspace landing page | Interface / design | — |
| 2026-06-16 | `68f99da` | add some homepage assets | Interface / design | — [Details](#historical-milestone-06) |
| 2026-06-16 | `bb971a5` | Redesign Peridot homepage | Interface / design | — |
| 2026-06-16 | `e0d2399` | Finalize map export options and ignore design source files | Map / geography | — |
| 2026-06-16 | `499acc7` | Improve map export annotation readability | Map / geography | — |
| 2026-06-16 | `d835953` | Clarify capability and availability wording | Other / general | — |
| 2026-06-16 | `97843c7` | Refine capability wording for point datasets | Other / general | — |
| 2026-06-16 | `7d2b888` | Fix route capability wording for point datasets | Map / geography | — |
| 2026-06-16 | `212fb4a` | Track Peridot branding and palette assets | Interface / design | — |
| 2026-06-16 | `72bcae7` | Add Peridot logo branding assets | Interface / design | — |
| 2026-06-13 | `954f553` | Refresh documentation for analytics layout and theme milestone | Documentation / planning | — |
| 2026-06-13 | `e50ebf6` | Scope chart palette imports to chart series | Charts / Analytics | (HEAD -> main, origin/main, origin/HEAD) [Details](#historical-milestone-08) |
| 2026-06-13 | `6334840` | Route remaining analytics chart marks through theme series | Charts / Analytics | — |
| 2026-06-13 | `db2bea6` | Anchor analytics chart titles and restore vertical bar default | Charts / Analytics | — |
| 2026-06-13 | `a1ce00a` | Tighten analytics chart canvas spacing | Charts / Analytics | — |
| 2026-06-13 | `69ea23a` | Simplify analytics legend rows | Charts / Analytics | — |
| 2026-06-13 | `b868bb3` | Add analytics chart method labels | Charts / Analytics | — |
| 2026-06-13 | `b0a4b65` | Improve analytics bar labels and metric options | Charts / Analytics | — |
| 2026-06-12 | `8b3ead9` | Resize analytics builder for quarter-panel layout | Charts / Analytics | — |
| 2026-06-12 | `f9a74fd` | Refine tabbed analytics builder proportions | Charts / Analytics | — |
| 2026-06-12 | `d7f10c9` | Add tabbed analytics chart builder | Charts / Analytics | — |
| 2026-06-12 | `e712102` | Refresh documentation for chart and theme milestones | Documentation / planning | — |
| 2026-06-12 | `f143de6` | Refresh documentation for chart and theme milestones | Documentation / planning | — |
| 2026-06-12 | `10f6e19` | Polish analytics chart axes and summary panels | Charts / Analytics | — |
| 2026-06-12 | `880cfff` | Add manual analytics series selection | Charts / Analytics | — |
| 2026-06-12 | `cd7dfff` | Fix grouped chart count buckets | Charts / Analytics | — |
| 2026-06-12 | `699e33a` | Default chart date axis to year | Charts / Analytics | — |
| 2026-06-12 | `805f770` | Harden analytics chart logic | Charts / Analytics | — |
| 2026-06-12 | `8f55a47` | Add finite chart color library | Charts / Analytics | — |
| 2026-06-12 | `5e895ad` | Refine chart dropdown and series contrast | Charts / Analytics | — |
| 2026-06-12 | `ab6dc8b` | Refine chart workspace controls and colors | Charts / Analytics | — |
| 2026-06-12 | `2e57f42` | Compact chart controls sidebar | Charts / Analytics | — |
| 2026-06-12 | `c5ff6c6` | Polish chart controls sidebar | Charts / Analytics | — |
| 2026-06-11 | `7396864` | Add light navy sea map treatment | Map / geography | — |
| 2026-06-11 | `aba420e` | Rebalance map palette and label density | Map / geography | — |
| 2026-06-11 | `cc21008` | Polish visualization header tabs | Interface / design | — |
| 2026-06-11 | `15985bf` | Improve visualization edge handles and map utility buttons | Map / geography | — |
| 2026-06-11 | `cb26bdf` | Refine visualization bar toggle ornament | Other / general | — |
| 2026-06-11 | `e643a16` | Route Inspector colors through theme roles | Map / geography | — |
| 2026-06-11 | `790ec66` | Clean up theming design audit files | Other / general | — |
| 2026-06-11 | `81dd7af` | Apply upload guide color direction and dropdown layering | Data / mapping | — |
| 2026-06-11 | `aa00efb` | Apply upload guide design direction | Data / mapping | — |
| 2026-06-11 | `0a686fe` | Add built-in Peridot palette presets | Interface / design | — |
| 2026-06-11 | `4747639` | Anchor imported palettes to darkest and lightest roles | Data / mapping | — |
| 2026-06-11 | `ee4f75e` | Route whole-app palette imports through foundation tones | Map / geography | — |
| 2026-06-11 | `1ba1682` | Improve palette image swatch detection | Interface / design | — |
| 2026-06-11 | `e35ab68` | Add image palette import by theme area | Data / mapping | — |
| 2026-06-11 | `6e8dfa6` | Add palette role dashboard | Interface / design | — |
| 2026-06-11 | `fed7d2e` | Add semantic palette system and theme toggle | Interface / design | — |
| 2026-06-11 | `034ec67` | Centralize explicit color palette values | Interface / design | — |
| 2026-06-10 | `d52392a` | Add capabilities tab to advanced search | Search / Explore | (HEAD -> main, origin/main, origin/HEAD) [Details](#historical-milestone-09) |
| 2026-06-10 | `3d296cb` | Route Explore directly to advanced search | Map / geography | — |
| 2026-06-10 | `37f2755` | Clarify structured search Boolean labels | Search / Explore | — |
| 2026-06-10 | `13fd533` | Add Boolean structured search criteria | Search / Explore | — |
| 2026-06-10 | `86952c8` | Improve advanced search moss contrast | Search / Explore | — |
| 2026-06-10 | `d7b0e2f` | Add dataset-wide advanced search browse indexes | Search / Explore | — |
| 2026-06-10 | `8104739` | Wire structured criteria filtering | Search / Explore | — |
| 2026-06-10 | `c8cbd5e` | Add structured search suggestions | Search / Explore | — |
| 2026-06-10 | `e3c36e1` | Condense advanced search results layout | Search / Explore | — |
| 2026-06-10 | `a21bbd9` | Refine advanced search layout and palette | Search / Explore | — |
| 2026-06-10 | `e12ed84` | Add search facets and capability filters | Search / Explore | — |
| 2026-06-10 | `4dc1bdf` | Add search result Inspector handoff | Inspector | — |
| 2026-06-10 | `2135c1b` | Refresh documentation for structural cleanup milestone | Documentation / planning | — |
| 2026-06-06 | `fcd2e1f` | Document timeline scope and clamp chart date range | Documentation / planning | — [Details](#historical-milestone-10) |
| 2026-06-06 | `84e6a4f` | Add code structure audit planning document | Documentation / planning | — |
| 2026-06-06 | `55a368c` | Remove dormant MapLibre preview code | Map / geography | — |
| 2026-06-06 | `876eb1d` | Document Analytics chart extension contract | Documentation / planning | — |
| 2026-06-06 | `0f712b5` | Add extracted evidence field controls | Data / mapping | — |
| 2026-06-06 | `338f204` | Restore evidence action normalization helper | Data / mapping | — |
| 2026-06-06 | `1fe9f82` | Extract column mapping field controls | Map / geography | — |
| 2026-06-06 | `ce7c092` | Extract column mapping modal UI config | Map / geography | — |
| 2026-06-06 | `5e8e022` | Reduce left control panel to compact Inspector shell | Inspector | — |
| 2026-06-06 | `e8ec660` | Extract embedded sample data from App | Data / mapping | — |
| 2026-06-06 | `133fd91` | Add developer orientation comments across source | Other / general | — |
| 2026-06-06 | `cfe8207` | Refresh documentation for visualization workspace consolidation | Documentation / planning | — |
| 2026-06-06 | `43fa09d` | Remove obsolete export workspace route | Map / geography | (HEAD -> main, origin/main, origin/HEAD) |
| 2026-06-06 | `aca8f1f` | Update visualization export wiring | Other / general | — |
| 2026-06-06 | `b6eb7c0` | Move chart export into visualization header | Charts / Analytics | — |
| 2026-06-06 | `0b0cacd` | Simplify hamburger menu and add Explore workspace | Search / Explore | — |
| 2026-06-06 | `47aaa03` | Remove redundant chart workspace header | Charts / Analytics | — |
| 2026-06-06 | `675a655` | Fit charts to workspace and minimize map overlays | Charts / Analytics | — |
| 2026-06-06 | `b10a68b` | Compact visualization header and timeline controls | Timeline / chronology | — |
| 2026-06-06 | `b0d83fb` | Simplify chart workspace and add bottom timeline scrubber | Charts / Analytics | — |
| 2026-06-06 | `7fcb348` | Document flexible data and chart capability milestone | Documentation / planning | — |
| 2026-06-06 | `08b628b` | Use include and ignore checkboxes for evidence fields | Data / mapping | (HEAD -> main, origin/main, origin/HEAD) [Details](#historical-milestone-13) |
| 2026-06-06 | `231ccde` | Accept generic chart records | Charts / Analytics | — |
| 2026-06-06 | `b19019e` | Generalize user-facing language beyond correspondence | Other / general | — |
| 2026-06-06 | `ab7affa` | Clean up flexible Analytics chart controls | Charts / Analytics | — [Details](#historical-milestone-12) |
| 2026-06-06 | `ec6a70e` | Support record-count sunburst charts | Charts / Analytics | — |
| 2026-06-06 | `596b958` | Support record-count histograms | Charts / Analytics | — |
| 2026-06-06 | `b2dcde5` | Add flexible Analytics chart variables | Charts / Analytics | — |
| 2026-06-06 | `6d0b37c` | Wire visualization availability state | Other / general | — |
| 2026-06-06 | `b273a27` | Make visualization menu hover more forgiving | Other / general | — |
| 2026-06-06 | `aae209a` | Document data capability mapping milestone | Documentation / planning | — |
| 2026-06-06 | `e7c3b57` | Add point-location role mapping | Map / geography | — [Details](#historical-milestone-14) |
| 2026-06-06 | `85f3d46` | Move data capability audit to mapping review | Map / geography | — |
| 2026-06-06 | `eef9cfe` | Show read-only data capability summaries | Other / general | — |
| 2026-06-06 | `1889b95` | Add data capability audit helper | Other / general | — |
| 2026-06-06 | `bfc8872` | Add Peridot data capability model plan | Other / general | — |
| 2026-06-05 | `4f280a0` | Use gold accent for workspace button hover states | Interface / design | — |
| 2026-06-05 | `737a970` | Apply Home-style visual system to full workspaces | Interface / design | — |
| 2026-06-05 | `c0ea2ab` | Refine Home workspace layout and menu access | Interface / design | — |
| 2026-06-05 | `a9a25f1` | Remove Home navigation from active workspaces | Interface / design | — |
| 2026-06-05 | `88ab302` | Refine Home workspace card styling | Interface / design | — |
| 2026-06-04 | `b24e19a` | Link Inspector directed route rows | Map / geography | — [Details](#historical-milestone-16) |
| 2026-06-04 | `ed0f2c7` | Make compact Inspector summary tiles open workspace | Map / geography | — |
| 2026-06-04 | `ace7f52` | Fix linked letter person and place navigation | Interface / design | — |
| 2026-06-04 | `0a1b57a` | Link letter detail people and places | Other / general | — |
| 2026-06-04 | `6f67ac7` | Move linked letters into Inspector history | Inspector | — |
| 2026-06-04 | `6c38fac` | Open Inspector person and place links in workspace | Inspector | — |
| 2026-06-04 | `6994b35` | Reduce compact Inspector content | Inspector | — |
| 2026-06-04 | `f2336f8` | Apply Inspector shell palette refinements | Inspector | — |
| 2026-06-04 | `45d1c8b` | Adjust Inspector clickable object palette | Inspector | — |
| 2026-06-04 | `e02a4a3` | Refine dual-mode Inspector visual treatment | Inspector | — |
| 2026-06-04 | `224bf5d` | Refine dual-mode Inspector close and expand behavior | Inspector | — |
| 2026-06-04 | `7a9e310` | Route menu Inspector away from compact panel | Map / geography | — |
| 2026-06-04 | `99c0b99` | Track compact Inspector presentation mode | Inspector | — |
| 2026-06-04 | `c2808ce` | Add inert Inspector presentation mode state | Inspector | — |
| 2026-06-04 | `aa90665` | Organize project documentation | Documentation / planning | — |
| 2026-06-04 | `3377274` | Prepare shared Inspector content boundary | Inspector | — |
| 2026-06-04 | `b7e3edd` | Add Inspector workspace design contract | Inspector | — |
| 2026-06-04 | `b47fda2` | Refresh documentation for workspace routing milestone | Documentation / planning | — |
| 2026-06-02 | `55fae50` | Update routing contract after workspace promotions | Interface / design | — |
| 2026-06-02 | `82178c5` | Promote Search to full workspace | Search / Explore | — |
| 2026-06-02 | `2c53796` | Promote Export to full workspace | Interface / design | — |
| 2026-06-02 | `8fc96b3` | Extract Peridot workspace config | Interface / design | — |
| 2026-06-02 | `9cd3f3f` | Clean workspace routing comments | Interface / design | — |
| 2026-06-02 | `9240745` | Fix Visualizations workspace export | Interface / design | — |
| 2026-06-02 | `25fc046` | Extract Peridot visualizations workspace | Interface / design | — |
| 2026-06-02 | `fcf6bb6` | Extract Peridot data workspace | Interface / design | — |
| 2026-06-02 | `9428766` | Extract Peridot theme workspace | Interface / design | — |
| 2026-06-02 | `18c2912` | Extract Peridot home workspace | Interface / design | — |
| 2026-06-02 | `6c16403` | Extract Peridot hamburger menu | Other / general | — |
| 2026-06-02 | `30b114b` | Add Peridot routing contract audit | Other / general | — |
| 2026-06-02 | `8384dee` | Fit Analytics workspace preview | Charts / Analytics | — |
| 2026-06-02 | `7a8ed7d` | Compact Visualizations workspace controls | Interface / design | — |
| 2026-06-02 | `9b67d28` | Move Theme to full workspace | Interface / design | — |
| 2026-06-02 | `bb0c0ed` | Refine hamburger menu visual layout | Interface / design | — |
| 2026-06-02 | `2336915` | Route mapped imports to visualization workspace | Map / geography | — |
| 2026-06-02 | `576bb72` | Fix visualization workspace viewport initialization | Interface / design | — |
| 2026-06-02 | `56f2a49` | Add internal workspace state model | Interface / design | — |
| 2026-06-02 | `b42f6fd` | Add Peridot interface redesign plan | Other / general | — |
| 2026-06-02 | `10017ec` | Document workbook import and Inspector profile milestone | Documentation / planning | — |
| 2026-06-02 | `0f72182` | Remove redundant Inspector correspondents summary row | Inspector | — |
| 2026-06-02 | `8564e33` | Fix place profiles and split directed route summaries | Map / geography | — |
| 2026-06-02 | `b1ef30a` | Refine Inspector profile relationship sections | Inspector | — |
| 2026-06-02 | `d9f0090` | Improve Inspector person place profiles and linked letter navigation | Inspector | — |
| 2026-06-02 | `9c8971b` | Display custom Inspector fields in linked letters | Inspector | — |
| 2026-06-02 | `5f25322` | Select custom Inspector fields from joined workbook sheets | Inspector | — |
| 2026-06-02 | `964ce57` | Import multi-sheet workbooks by unique ID joins | Data / mapping | — |
| 2026-06-02 | `ac31c38` | Configure workbook sheet joins by unique ID | Data / mapping | — |
| 2026-06-02 | `77b1575` | Preview multi-sheet workbook mapping | Map / geography | — |
| 2026-06-02 | `2a800b3` | Add Peridot workbook mapping model helper | Map / geography | — |
| 2026-06-02 | `dd22abc` | Stabilize multi-sheet workbook staging | Data / mapping | — |
| 2026-06-02 | `f503df6` | Refresh documentation with full commit history | Documentation / planning | — |
| 2026-06-02 | `4d11cb3` | Add Peridot workbook parsing helper | Data / mapping | — |
| 2026-06-02 | `212d689` | Clarify column mapping cancel and import actions | Map / geography | — |
| 2026-06-02 | `d270c9d` | Import mapped arbitrary CSV and TSV data | Map / geography | — |
| 2026-06-02 | `a058730` | Add Peridot column mapping workspace | Map / geography | — |
| 2026-06-02 | `a4062ba` | Stage arbitrary CSV and TSV column mapping uploads | Map / geography | — |
| 2026-06-02 | `bba50e1` | Add Peridot column mapping helper | Map / geography | — |
| 2026-06-02 | `f432ccc` | Remove legacy three-file upload workflow | Data / mapping | — |
| 2026-06-02 | `44d2042` | Document single Peridot CSV upload workflow | Documentation / planning | — |
| 2026-06-02 | `930c807` | Persist Peridot upload summary in Data Inputs | Data / mapping | — |
| 2026-06-02 | `cbc35d0` | Add single Peridot CSV upload workflow | Data / mapping | — |
| 2026-06-01 | `61f3c4b` | Add Peridot CSV validation summary helper | Other / general | — |
| 2026-06-01 | `3d5fb79` | Add Peridot CSV template normalizer | Data / mapping | — |
| 2026-06-01 | `8e7a8a4` | Add Peridot CSV schema contract | Other / general | — |
| <a id="history-2026-05"></a>2026-05-23 | `9453232` | Document Search and Filter layout and Analytics polish | Documentation / planning | — |
| 2026-05-23 | `bdd0843` | Refine expanded analytics backdrop contrast | Charts / Analytics | — |
| 2026-05-23 | `64d44f2` | Improve analytics tooltip contrast | Charts / Analytics | — |
| 2026-05-23 | `e02c1de` | Move filter status above action buttons | Search / Explore | — |
| 2026-05-23 | `8bfd422` | Refine compact Search and Filter layout | Search / Explore | — |
| 2026-05-23 | `b2147bb` | Consolidate Search and Filter layout | Search / Explore | — |
| 2026-05-23 | `1ae3f03` | Document Search and Filter milestone | Documentation / planning | — |
| 2026-05-23 | `01de3d8` | Show filter update status before applying changes | Search / Explore | — |
| 2026-05-23 | `c98c242` | Split route filters by place and people | Map / geography | — |
| 2026-05-23 | `1578d10` | Add route filter | Map / geography | — |
| 2026-05-23 | `ea19fc8` | Improve predictive suggestion menu scrolling | Other / general | — |
| 2026-05-23 | `9c179f7` | Add predictive suggestions for person and place filters | Search / Explore | — |
| 2026-05-23 | `cc26530` | Add person and place filters | Search / Explore | — |
| 2026-05-23 | `019acef` | Add clear filters and reset playback on apply | Timeline / chronology | — |
| 2026-05-23 | `d5e7667` | Apply Search and Filter changes on request | Search / Explore | — |
| 2026-05-23 | `8912b8f` | Strengthen full-file review workflow rule | Other / general | — |
| 2026-05-23 | `b348f12` | Move date range controls into Search and Filter | Timeline / chronology | — |
| 2026-05-23 | `a890b13` | Move minimum weight filter into Search and Filter | Search / Explore | — |
| 2026-05-23 | `e6b477d` | Add Search and Filter panel shell | Search / Explore | — |
| 2026-05-23 | `2eb3461` | Document Search and Filter panel contract | Documentation / planning | — |
| 2026-05-23 | `9d24fbf` | Document Analytics feature milestone | Documentation / planning | — |
| 2026-05-23 | `3352403` | Fix Analytics expanded overlay and variable options | Charts / Analytics | — |
| 2026-05-23 | `4b631be` | Refine Analytics variables and expanded chart overlay | Charts / Analytics | — |
| 2026-05-23 | `416dced` | Refine Analytics chart icons and expanded view | Charts / Analytics | — |
| 2026-05-23 | `2320bfe` | Expand Analytics chart controls | Charts / Analytics | — |
| 2026-05-23 | `961bf45` | Clarify Analytics chart variable controls | Charts / Analytics | — |
| 2026-05-23 | `4b90e4e` | Add additional Analytics chart types | Charts / Analytics | — |
| 2026-05-23 | `caddd3c` | Refine Analytics chart panel interactions | Charts / Analytics | — |
| 2026-05-23 | `04d95a7` | Add Analytics side panel charts | Charts / Analytics | — |
| 2026-05-14 | `b5dc2b5` | Document legacy continuation after pausing MapLibre work | Documentation / planning | — |
| 2026-05-14 | `2d76839` | Fix linked letter encoding display | Infrastructure / maintenance | (tag: checkpoint-maplibre-migrated-overlay-paused, origin/maplibre-native-geographic-view, maplibre-native-geographic-view) |
| 2026-05-14 | `2c0be03` | Make MapLibre people view and force-directed fallback work | Map / geography | — |
| 2026-05-14 | `5762d0e` | Refresh documentation for MapLibre migrated overlay milestone | Documentation / planning | — |
| 2026-05-14 | `268b18c` | Add MapLibre hover feedback | Map / geography | — |
| 2026-05-14 | `8137db7` | Curve MapLibre aggregated routes | Map / geography | — |
| 2026-05-13 | `c0a4b8a` | Restore MapLibre migrated overlay after extraction regression | Map / geography | — |
| 2026-05-13 | `dd148e1` | Extract MapLibre cluster and aggregate IDs | Map / geography | — |
| 2026-05-13 | `57d3cc1` | Add MapLibre cluster count labels | Map / geography | — |
| 2026-05-13 | `c7da28c` | Add MapLibre cluster selection feedback | Map / geography | — |
| 2026-05-13 | `2ccaaeb` | Show MapLibre aggregated route details in inspector | Map / geography | — |
| 2026-05-13 | `084ce9d` | Enrich MapLibre aggregated route inspector payload | Map / geography | — |
| 2026-05-13 | `526534a` | Aggregate MapLibre routes between visible endpoints | Map / geography | — |
| 2026-05-13 | `8a563cc` | Hide MapLibre cluster member nodes | Map / geography | — |
| 2026-05-13 | `be7d9ae` | Route MapLibre cluster clicks to inspector | Map / geography | — |
| 2026-05-13 | `1e8456f` | Add dynamic MapLibre cluster diagnostic | Map / geography | — |
| 2026-05-13 | `bb11f6a` | Add static MapLibre cluster lifecycle diagnostic | Map / geography | — |
| 2026-05-13 | `3f26cc2` | Broaden MapLibre lifecycle diagnostics | Map / geography | — |
| 2026-05-13 | `3646cc6` | Refresh documentation for MapLibre native branch handoff | Documentation / planning | — |
| 2026-05-13 | `4c9ed6f` | Extract MapLibre layer configuration | Map / geography | — |
| 2026-05-13 | `c420a5d` | Extract MapLibre feature builders | Map / geography | — |
| 2026-05-13 | `b7fb244` | Add MapLibre native geographic view plan | Map / geography | — |
| 2026-05-13 | `10051c0` | Add MapLibre selected filter layers | Map / geography | (tag: checkpoint-maplibre-preview-prototype) |
| 2026-05-13 | `b7c61a2` | Add MapLibre route hit layer | Map / geography | — |
| 2026-05-13 | `f2fdcf9` | Add cursor-only MapLibre hover detection | Map / geography | — |
| 2026-05-13 | `5f3f053` | Route MapLibre feature clicks to inspector | Map / geography | — |
| 2026-05-13 | `2597462` | Remove MapLibre SVG node probe overlay | Map / geography | — |
| 2026-05-13 | `7eebdee` | Add simple MapLibre node layer probe | Map / geography | — |
| 2026-05-13 | `1f0d322` | Render MapLibre route probes as GeoJSON layer | Map / geography | — |
| 2026-05-13 | `443d7ac` | Add MapLibre route projection probe | Map / geography | — |
| 2026-05-12 | `6096069` | Add MapLibre projection probe | Map / geography | — |
| 2026-05-12 | `33afaae` | Add MapLibre preview diagnostics | Map / geography | — |
| 2026-05-12 | `da1463f` | Add MapLibre workspace preview path | Map / geography | — |
| 2026-05-12 | `93f0961` | Add isolated MapLibre map stage | Map / geography | — |
| 2026-05-12 | `1d816a5` | Add MapLibre hybrid map-system audit | Map / geography | — |
| 2026-05-12 | `4e08720` | Direct workflow charter baseline reference to changelog | Documentation / planning | — |
| 2026-05-12 | `d893050` | Refresh documentation for side panel rail tabs | Documentation / planning | — |
| 2026-05-12 | `8539c68` | Clarify timeline rail icon | Timeline / chronology | — |
| 2026-05-12 | `def4265` | Add timeline side panel tab | Timeline / chronology | — |
| 2026-05-12 | `6a672d9` | Add export side panel tab | Interface / design | — |
| 2026-05-12 | `f1394c6` | Add data inputs side panel tab | Data / mapping | — |
| 2026-05-12 | `5b38c4e` | Update shared panel rail icons | Interface / design | — |
| 2026-05-04 | `dcce703` | Style shared panel icon rail | Interface / design | — |
| 2026-05-04 | `2acdb91` | Remove obsolete side panel top tabs | Interface / design | — |
| 2026-05-04 | `6142817` | Anchor shared panel icon rail to panel shell | Interface / design | — |
| 2026-05-04 | `4653f20` | Remove obsolete audit documentation listings | Documentation / planning | — |
| 2026-05-04 | `8882b69` | Remove obsolete audit documentation references | Documentation / planning | — |
| 2026-05-04 | `06c1843` | Clean shared side panel source comments | Interface / design | — |
| 2026-05-04 | `f7407eb` | Refresh documentation for shared panel baseline | Documentation / planning | — |
| 2026-05-04 | `4a17d1c` | Make inspector panel content-only | Inspector | — |
| 2026-05-04 | `b62c74b` | Use shared side panel shell | Interface / design | — |
| 2026-05-04 | `e41d8bc` | Split side panel open state from active tab | Interface / design | — |
| 2026-05-04 | `88b0c19` | Rename inspector panel shell for left dock | Inspector | — |
| 2026-05-04 | `2126c9b` | Open inspector in left panel dock | Inspector | — |
| 2026-05-04 | `f98b3e5` | Add panel mode switcher tabs | Interface / design | — |
| 2026-05-04 | `df4075a` | Move side panel toggles to left rail | Interface / design | — |
| 2026-05-04 | `17cf020` | Enforce single active side panel | Interface / design | — |
| 2026-05-04 | `0063145` | Use menu icon for inspector toggle | Inspector | — |
| 2026-05-02 | `63003c1` | Group cluster inspector members by place | Network | — |
| 2026-05-02 | `fed4b5b` | Use volume-based zoom-responsive cluster sizing | Network | — |
| 2026-05-02 | `3187d05` | Increase dynamic node radius contrast | Network | — |
| 2026-05-02 | `ed39e55` | Make cluster nodes open actionable inspector views | Network | — |
| 2026-05-02 | `04eb8b5` | Refresh documentation for safe year-based baseline | Documentation / planning | — |
| 2026-05-02 | `57b946e` | Make timeline year-based | Timeline / chronology | — |
| <a id="history-2026-04"></a>2026-04-30 | `79d5ae1` | Remove show all dates shortcut | Other / general | — |
| 2026-04-30 | `3fedd97` | Tighten minimum weight helper text | Other / general | — |
| 2026-04-30 | `96064e2` | Set people as default view and simplify view buttons | Interface / design | — |
| 2026-04-30 | `fa486b8` | Remove orphaned panel helper functions | Interface / design | — |
| 2026-04-30 | `2d627e2` | Remove legacy inspector bodies from App | Inspector | — |
| 2026-04-30 | `149315a` | Extract inspector node view | Network | — |
| 2026-04-30 | `003fae1` | Split empty cluster and edge inspector views | Network | — |
| 2026-04-30 | `c0a15fd` | Extract inspector shell and router | Map / geography | — |
| 2026-04-30 | `6a32004` | Harden inspector contract in place | Inspector | — |
| 2026-04-30 | `86ad35f` | Extract left control panel component | Interface / design | — |
| 2026-04-30 | `113fb84` | Harden control panel contract in place | Interface / design | — |
| 2026-04-22 | `4236952` | Append full development history to changelog | Documentation / planning | — |
| 2026-04-22 | `391174a` | Refresh Peridot documentation for publication baseline | Documentation / planning | — |
| 2026-04-22 | `951b450` | Replace embedded sample data with current publication dataset | Data / mapping | — |
| 2026-04-22 | `f859595` | Add itch.io HTML5 build packaging support | Infrastructure / maintenance | — |
| 2026-04-22 | `f959fac` | Use countries50m as the fixed basemap | Map / geography | — |
| 2026-04-21 | `b1fdbd5` | Update maintainer handoff documentation | Documentation / planning | — |
| 2026-04-21 | `dd12281` | Normalize summary panel spacing | Data / mapping | — |
| 2026-04-21 | `4fdaf73` | Rename timeline panel heading | Timeline / chronology | — |
| 2026-04-21 | `db5bb1f` | Tighten left panel organization | Interface / design | — |
| 2026-04-21 | `ba746b1` | Simplify theme panel text | Interface / design | — |
| 2026-04-21 | `c0fc600` | Retune active country fills for peridot and modern maps | Map / geography | (tag: checkpoint-map-theme-c0fc600) |
| 2026-04-21 | `56f0080` | Highlight countries containing visible nodes | Network | — |
| 2026-04-21 | `5cbe9c3` | Refine early modern node hover and selected colors | Network | — |
| 2026-04-21 | `850176f` | Refine hovered and selected node states | Network | — |
| 2026-04-21 | `3e43dc9` | Add hovered node color feedback | Network | — |
| 2026-04-21 | `919ea5f` | Increase green layering in peridot map theme | Map / geography | — |
| 2026-04-21 | `c666d29` | Add peridot default app theme | Interface / design | — |
| 2026-04-20 | `9be5f4a` | Tighten maintainer docs audit fixes | Documentation / planning | — |
| 2026-04-20 | `43403c3` | Restore detail to maintainer documentation | Documentation / planning | — |
| 2026-04-20 | `02ecb11` | Document inspector navigation feature set | Documentation / planning | — |
| 2026-04-20 | `5af819b` | Add inspector back navigation | Inspector | — |
| 2026-04-20 | `b3e6fe8` | Add place navigation sections to person inspector | Inspector | — |
| 2026-04-20 | `6772c1d` | Clarify connected correspondents count label | Other / general | — |
| 2026-04-20 | `ab0e1fe` | Show relationship counts in connected correspondents buttons | Interface / design | — |
| 2026-04-20 | `06e0b3b` | Sort connected correspondents by relationship weight | Other / general | — |
| 2026-04-20 | `17be829` | Add connected correspondents inspector navigation section | Inspector | — |
| 2026-04-20 | `cfa6d63` | Add inspector selection plumbing for person and place detail targets | Inspector | — |
| 2026-04-20 | `2b3c265` | Document person force layout and force-view background behavior | Documentation / planning | — |
| 2026-04-20 | `ffb5a30` | Hide map backdrop in force-directed person view | Map / geography | — |
| 2026-04-20 | `225c7e4` | Wire person force layout into App graph builder | Charts / Analytics | — |
| 2026-04-20 | `3480858` | Add pre-settled d3-force person network layout | Network | — |
| 2026-04-20 | `81a75d0` | Add d3-force dependency for person-network layout work | Network | — |
| 2026-04-20 | `5a17721` | Replace README with current repository overview | Documentation / planning | — |
| 2026-04-20 | `8241ae1` | Add screenshots and standardize image paths | Other / general | — |
| 2026-04-20 | `99584a9` | Document completed export behavior fixes | Documentation / planning | — |
| 2026-04-20 | `5575007` | Reflect visible date range in export metadata | Timeline / chronology | — |
| 2026-04-20 | `c9f010e` | Fix PNG export color rendering | Infrastructure / maintenance | — |
| 2026-04-20 | `248833a` | Document completed timeline behavior fixes | Documentation / planning | — |
| 2026-04-20 | `1b2655e` | Preserve viewport during timeline playback interactions | Timeline / chronology | — |
| 2026-04-20 | `fd0d77a` | Add viewport timeline reset audit | Timeline / chronology | — |
| 2026-04-20 | `6c41fce` | Constrain timeline end date to selected start date | Timeline / chronology | — |
| 2026-04-20 | `099882a` | Add control panel dependency map | Map / geography | — |
| 2026-04-20 | `a53ccbf` | Add maintainer comments for control panel architecture | Interface / design | — |
| 2026-04-20 | `c526e6c` | Document deferred export panel extraction | Documentation / planning | — |
| 2026-04-20 | `4ddf444` | Document deferred PNG export issue | Documentation / planning | — |
| 2026-04-20 | `5bbdad8` | Extract export helpers from App | Other / general | — |
| 2026-04-20 | `897e06a` | Document step 2 timeline work and deferred follow-ups | Documentation / planning | — |
| 2026-04-20 | `383ecc0` | Extract timeline playback panel from App | Timeline / chronology | (tag: checkpoint-pre-step-2c) |
| 2026-04-20 | `b2dbe35` | Extract timeline playback helpers from App | Timeline / chronology | — |
| 2026-04-17 | `dad15a4` | Update maintainer guide and add changelog | Documentation / planning | (tag: checkpoint-between-step-1-and-step-2) |
| 2026-04-17 | `145cfc2` | Extract map interaction handlers from App | Map / geography | — |
| 2026-04-17 | `30e5b1b` | Extract interaction resolution helpers from App | Other / general | — |
| 2026-04-17 | `181a63e` | Extract map stage components from App | Map / geography | (tag: checkpoint-pre-step-1c) |
| 2026-04-17 | `02dcfc4` | Extract pure map layout helpers from App | Map / geography | — |
| 2026-04-17 | `7742149` | Update README to reflect current app and workflow | Documentation / planning | — |
| 2026-04-17 | `c3f856f` | Add maintainer guide and project workflow charter | Documentation / planning | — |
| 2026-04-17 | `8e07339` | Use dark navy modern node labels with white outline | Network | — |
| 2026-04-17 | `0791ffd` | Strengthen modern node label typography | Network | — |
| 2026-04-17 | `100d3fb` | Refine modern theme colors and label contrast | Interface / design | — |
| 2026-04-17 | `b7e4749` | Use clean themed canvas for force-directed person view | Network | — |
| 2026-04-17 | `f207a37` | Implement true force-directed person layout | Network | — |
| 2026-04-17 | `e4f64c6` | Remove stray project folders from repo root | Other / general | — |
| 2026-04-17 | `80bbb97` | Adjust shared edge multiplier to 5 | Network | — |
| 2026-04-17 | `db38072` | Checkpoint before applying person scaling update | Other / general | — |
| 2026-04-17 | `eb3ba4b` | Initial rebuilt app baseline | Other / general | — |

## 4. Detailed Milestone Archive

<details>
<summary><a id="milestone-evidence-workspace-20261127"></a><strong>Expanded Evidence Workspace, shared dossiers and grouped-lane test alignment — accepted 2026-11-27</strong></summary>

### Expanded Evidence Workspace and source-faithful dossier navigation — 2026-11-27

**Scope and research purpose.** After the accepted compact Inspector, the researcher and ChatGPT conducted bounded presentation, evidence, and navigation passes to turn the expanded Inspector into a shared **Evidence Workspace**. The research model is a navigable set of distinct dossier sheets, not one generalized Source→Target correspondence report. The modal retains its dark forest-green outer frame, oxblood manuscript corners, parchment pages, gold ledger dividers, restrained typography, full-row botanical-green hover and two-column registers. Inspector and Explore are workspace tabs; switching sheets does not create research-history entries. Following a linked person, place, connection, or source record does, and Back can retrace the chain. This is deliberately distinct from applying search filters or changing the selected visualization.

**Dossier composition.** Person and place folders retain Overview, Connected people, Connected places, Relationships, Contributing records and Investigate further. Connections, Chart marks, and Timeline events/periods use three sheets where appropriate: **Overview**, **Contributing records**, **Investigate further**; record dossiers provide Record information and Investigate further. The same searchable, sortable, progressively disclosed source-row ledger and linked typed-person/place/record navigation are reused while retaining each selection's original scope. Record information separates mapped dates/periods, people, places, relationships and other evidence; it does not assume a transcription field exists. The Overview is intentionally not a duplicate search workspace.

**Map and Network / connected places.** Map geographic links and Network links, as well as `Inspect connection` in an entity's Relationships sheet, navigate to a real mapped pair rather than only a co-occurrence. Place dossiers distinguish incoming **Source places in related records** and outgoing **Target places in related records**, based on actual mapped geographic source→target pairs and looked up in both directions. Source/Target slots do not necessarily establish the historical agency of a relationship; undirected relationships must not be represented as directed historical actions. Entity identity, endpoint type and contributing records must survive the Inspector research trail. People displayed at mapped geographic anchors remain person endpoints, not places merely because the mark was selected on Map.

**Charts II.** An inspected chart mark retains the original calculation (measure, grouping/series, derived value) and the actual chart-local source rows that contributed to it; the chart's aggregate or observation count must not automatically be treated as the number of distinct source records. Overview offers a two-column register of actual mapped people and places in those rows, with a subtle **Matches chart category** note only when the exact mapped subject qualifies. A duplicate primary-subject card and an extra Overview search bar were intentionally removed in the accepted v24 refinement. Opening a mapped person/place shows its normal broader dossier while retaining correct history; it does not retroactively change the chart's contributing-row scope.

**Timeline II.** Selecting a temporal point, period or open/uncertain interval preserves the actual temporal role, precision, boundary/qualifier interpretation, displayed date and active category encoding. The selected event's retained source row supplies its contributing-record sheet; other mapped people/places in that row are available for typed dossier navigation without automatically becoming the subject of the temporal assertion. The accepted v25 design follows the same parchment-and-gold two-column registers and three-sheet organization as Charts II. The compact Inspector remains a separate presentation surface.

**Investigate further and Explore.** The shared search composer offers dataset-backed suggestions for mapped people, places, endpoints and years, and a draft path to Explore. Entering Investigate further or carrying the query draft to Explore does not apply global search filters; **Apply Filters** in Explore remains the authoritative action. Broader Explore content redesign and a visualization-settings shortcut remain deferred; these are not conflated with completed dossier search/navigation behavior.

**Development checkpoints.** Accepted intermediate handoff ZIPs, including v22 typed connection endpoints, v24 Charts Overview and v25 Timeline dossier, are design/source-review artifacts, **not separate Git commits**. `3c64813` consolidated earlier dossier, query and connected-place refinements; `6c149e7` committed expanded integration across all visualizations (the researcher confirmed a clean `main` and successful push). `4bdab6c` subsequently committed only the grouped Timeline lane test assertion change from the obsolete **Uncategorized** wording to the intentional **No priority category** label. There was no corresponding Timeline production behavior change.

**Verification and limitations.** The researcher accepted connection v22, Charts Overview v24 and Timeline v25 through screenshots and interactive local review. A source-level regression run reconstructed the available upload plus accepted handoffs, with 216/217 Node tests passing initially; the single pre-existing `peridotTimelineGroupedLanes.test.mjs` label mismatch was isolated, and after updating only that test the same reconstructed suite passed **217/217**. Additional JSX/CSS parsing and seven static wiring checks passed. This evidence is narrower than a local Git-checkout production build, a comprehensive browser/keyboard regression, or deployment/performance verification, none of which was independently established in this pass. The exact current contracts and remaining checks belong to the [Maintainer's Guide](MAINTAINERS_GUIDE.md#contract-inspector).

</details>

<details>
<summary><a id="milestone-voluntary-support-20261125"></a><strong>Voluntary support integration — accepted 2026-11-25 (`59ce6a7`)</strong></summary>

### Voluntary support integration — accepted 2026-11-25

**Decision and collaboration:** The researcher requested a subtle, optional support mechanism for a free and open-source humanities tool. ChatGPT compared hosted funding options; the researcher selected GitHub Sponsors and Ko-fi together, the muted sage Option C trigger, custom faceted gemstone and anchored nonmodal disclosure, and accepted full-label-first responsive behavior. The plan was prepared before the concurrent Inspector work reached `01b03bc`; the researcher saved the reference as `planning_documents/Donation Button Reference.png`. See [the preserved plan](../planning_documents/PERIDOT_VOLUNTARY_SUPPORT_INTEGRATION_PLAN_20261125.md).

**Development sequence:** Pass 1 introduced the isolated disclosure and fail-closed configuration, with development-only preview and disabled provider rows. The researcher reported a passing build and accepted placement and presentation. Pass 2A added trigger/close hover, pressed and open-state feedback; Pass 2B added decorative provider icons, external-link arrows, narrow-width spacing and icon-only fallback. The researcher accepted both refinements and responsive sizing. Pass 3 reviewed keyboard, focus, Escape coordination with the compact Inspector, outside dismissal, layering and research continuity; the researcher reported that it passed and supplied screenshots of the pre-activation production interface without Support. No additional source changes were made during Pass 3.

**Activation:** The researcher chose to activate before documentation synchronization. Pass 5A populated the two verified public profile destinations and enabled live rows; the researcher tested both links and reported that they worked. Pass 5A.1 adopted forest-green primary-button colors for live rows with sage hover treatment at the researcher's request; the final screenshot and appearance were accepted. Pass 5B created previously absent `.github/FUNDING.yml`; its two entries were user-confirmed. The accepted implementation and planning files were committed together at `59ce6a7`, after Inspector documentation commit `c60c0da`. The intermediate ZIP handoffs are not independent Git commits. Planned dormant documentation/checkpoint was superseded by the user's decision to activate before a consolidated documentation pass.

**Verification and limits:** Reported source checks included JSX/CSS syntax, configuration cases and ZIP integrity; isolated Chromium layout checks were not full-application cross-browser testing. The researcher accepted the pre-activation build and production isolation, local keyboard/interaction regression pass, responsive appearance and actual provider links. Final post-activation production build/preview and deployed GitHub Pages / native Sponsor button were requested but not explicitly confirmed in the supplied conversation. No payment transaction was performed or tested. Clean synchronized Git state at `59ce6a7` was explicitly confirmed. Private personal and financial information is excluded from the project record.

**Scope:** `src/PeridotGlobalHeader.jsx`, `src/PeridotGlobalHeader.css`, `src/PeridotSupportPopover.jsx`, `src/PeridotSupportPopover.css`, `src/peridotSupportConfig.js`, `.github/FUNDING.yml`, and two planning records. No `App.jsx`, Inspector, visualization, routing, data-model or dependency changes were needed. The current implementation contract is in the [Maintainer's Guide](MAINTAINERS_GUIDE.md#contract-voluntary-support); current screenshots are in the [README gallery](README.md#7-interface-examples-and-historical-gallery).

</details>

<details>
<summary><a id="milestone-compact-inspector-20261125"></a><strong>Compact Inspector and Charts II analytical provenance — accepted through 2026-11-25</strong></summary>

### Compact Inspector and Charts II analytical provenance — accepted through 2026-11-25 (`01b03bc`)

**Development sequence and collaboration.** After the initial left-docked resizable panel was committed at `d94911f`, the researcher and ChatGPT iterated on its three-section organization, source/representation distinction, editorial styling, search/navigation, grouped evidence, and data density. The researcher tested screenshots and browser behavior repeatedly, requested reductions in duplicated mapped fields, and required expanded disclosures to persist after pointer exit. The reference mockup was committed at `b619be4`. The implementation was built through bounded ZIP handoffs, with acceptance of Map/Network node/cluster, Timeline event/period and eventually Charts II mark presentations. These intermediate handoffs were not separately committed; `01b03bc` is the accepted consolidated source checkpoint. It is incorrect to imply that their separate phases have distinct Git commits.

**Timeline:** Selected event/period explanations distinguish mapped temporal assertions from visual computation, including partial and open-ended dates. A mini-legend identifies actual rendered category colors/symbols and memberships; source/provenance fields are presented once when identities match. Category Editor interactions do not create Inspector selections; changing active category configuration can refresh existing legend content without reopening the panel.

**Charts II:** An audit established that existing SVG charts largely provided hover values but lacked a general Inspector selection pipeline and complete per-mark source references. The researcher suggested retaining source and calculation information at derivation time, eliminating the need to reconstruct it for the Inspector. Four accepted passes implemented (1) categorical Bar/Column, Pie/Donut, Grouped/Stacked Bar; (2) temporal and numerical Line/Multi-Line, Area/Stacked Area, Scatter/Bubble, Histogram, Heatmap, plus improved record-ID search contrast; (3) Box Plot, Dot Plot, Slope Chart, Treemap, Sunburst, preserving direct drill-down; (4) integration/regression and correction of absent numeric values formerly rendered as zero. The resulting contract is calculate once, retain contributing source/observation references, render and inspect from the same analytical result. Treemap uses ordinary click to drill down and Shift+click to inspect expandable tiles. Navigating out of the Builder clears chart-mark Inspector state; changes to the chart's calculations invalidate stale selections.

**Evidence-access refinements:** The researcher identified an arbitrary `25` compact / `100` full cutoff and found researcher-mapped Unique IDs were incorrectly displayed as generated compatibility IDs. Corrections made the compact list searchable across all contributors, progressively show 25 then 50 more per click without a terminal restriction, and resolve display identity from generalized authoritative mapping before falling back to Peridot-generated ID. Links retain internal stable record references. Distinguish records, contributing observations, plotted aggregate values and missing numerical evidence. The archive retains user screenshots and assistant handoff discussions as evidence of design iteration; they are not substitute source-code verification.

**Verification and limits:** Browser acceptance was explicitly reported for the first three Charts passes and subsequent Pass 4 correction was accepted. The reported final source-level suite passed 202/203 tests; the sole failure was the already known grouped Timeline label mismatch (`Uncategorized` vs `No priority category`). Some individual passes reported syntax and ZIP checks; an integrated Vite production build and deployed-site check were **not** performed in the final handoff. Map/Network edge click selection and hit testing still require a focused audit despite existing Inspector edge views. Next work: edge inspection, cross-visualization compact regression, contextual settings shortcut, expanded dossier, Explore redesign. Automatic category/series palette completeness in Timeline and Charts is separately deferred. The November 25 voluntary-support/header files remain uncommitted as reported; no completion or acceptance is attributed to them in this milestone.

[Back to development history](#3-full-development-history)

</details>

<details>
<summary><a id="milestone-documentation-reorganization"></a><strong>Core documentation reorganization and governance renewal — confirmed 2026-11-22</strong></summary>

### Core documentation reorganization and governance renewal — confirmed 2026-11-22

- **`d5d7a1b` — `Reorganize core information documentation and add glossaries`:** Haley approved and committed a reader-oriented README (plain-language onboarding, scan-friendly summaries, 69-term glossary), a three-level Maintainer's Guide (architecture overview, authoritative subsystem contracts, implementation references, 83-term technical glossary), and a navigable Changelog (full recorded development-history table, area/period indexes, expandable milestone and checkpoint archives). Substantive historical and technical material was preserved through verified relocation, cross-reference, or contextual retention; the author's personally written README AI-collaboration statement was preserved verbatim.
- **`9f63175` — `Refine documentation governance and workflow charter`:** Haley approved and committed the revised Project Workflow Charter and Core Documentation Governance Protocol, including the Golden Rule to ask for clarification when consequential uncertainty remains, source-authority and documentation-change decision trees, risk-based build checking, bounded scope expansion, non-destructive recovery, rule intentions/origins, historical-decision statuses, and preservation-verified restructuring rules. Targeted README, Charter, and Governance references now classify `planning_documents/PERIDOT_CORE_DOCUMENTATION_RESTRUCTURING_PLAN.md` as an **implemented historical planning record**, retained for provenance but no longer a standing maintenance authority.
- **Review and acceptance:** The researcher reviewed and accepted the five core-document reorganization drafts and later confirmed `git status` clean with `HEAD`, `origin/main`, and `origin/HEAD` aligned at `9f63175`. This establishes documentation acceptance and repository synchronization, **not** a new source-code test or a claim of live-site verification. The present Changelog entry records that work; this synchronization draft is not itself a committed revision until Haley applies and commits it.

[Back to development history](#3-full-development-history)

</details>

These original milestone narratives preserve the implementation history, decisions, rejected approaches, diagnoses, tests, and stated limitations. They are historical accounts, not a competing present-day source of architectural or backlog instructions. **Expand a milestone only when you need its context.** Links in the development register lead to the associated milestone heading.

<details>
<summary><a id="milestone-charts-ii"></a><strong>Charts II completion, Charts I retirement, and adaptive Appearance — through 2026-11-22 (committed, browser-accepted)</strong></summary>

### Charts II completion, Charts I retirement, and adaptive Appearance — through 2026-11-22 (committed, browser-accepted)

- **`2be3ea0` — `Synchronize documentation through Charts II completion and appearance customization`** is the newer user-confirmed synchronized documentation commit, following `e96c375` and `8baa733`. This updates the historical checkpoint; it is not an additional Charts source implementation or a fresh verification of browser/deployed behavior.

- **`e96c375` — `Implement Charts appearance customization and adaptive presentation`** was the latest synchronized checkpoint for the source-development pass, before the later documentation commit `2be3ea0`. The Charts Builder's Appearance section now reuses Timeline II's 42-color swatch library, supports stable semantic series/category overrides, family-specific mark styling, adaptive controls for titles, axes, values, hierarchical/proportional labels and summary panels, and a draggable configuration-panel width applied on release. Charts PNG exports inherit presentation changes. B4.6–B4.9 were developed in bounded packages and visually tested with multiple chart families. Further label-collision and chart-specific usability refinement remains possible; the accepted defaults and scholarly calculations were preserved.
- **`8baa733` — `Retire legacy Charts I and consolidate Charts II workspace`** removed the obsolete `src/AnalyticsPanel.jsx` UI and Charts I-specific state/export registration. Visualize now exposes a single **Charts** tab leading to the Charts II Catalogue/Builder. `AnalyticsPanel.css`, `analyticsConfig.js`, `analyticsDerivationHelpers.js`, `analyticsChartComponents.jsx`, `exportHelpers.js`, the shared chronology dock, and Explore data-scope infrastructure remain because active consumers depend on them. R1/R2/R3 passed the researcher's browser regression and added `chartsRetirement.test.mjs`.
- **`5c75472` — `Implement Charts II chart-local filters and single-series selection`** provides categorical OR-within-rule and AND-between-rule filters, inclusive numerical ranges, reset and provenance accounting, without changing Explore or other visualization scopes. Single-series Line/Area categorical filters permit one selected value; multi-series modes can retain plural values.
- **`1dba2eb` — `Refine Charts II recommendations using analytical data suitability`** replaces simple field-presence suitability with populated/paired measurements and meaningful date/category overlap. Latitude and longitude remain deliberate numeric chart-field choices but do not promote charts in the recommendations-first Catalogue. Only **Likely fit** and **May not work well** flags are used; all charts remain selectable.
- **`60c626a` — `Implement customizable Charts II PNG exports`** captures the live configured chart rather than legacy Charts I or Builder controls. Researchers can customize/omit titles, axis annotations, footnotes and provenance; subsequent accepted refinements produce a white publication canvas, consistent typography, unclipped margins, and multiline notes. Date-axis viewport metadata is distinguished from actual chronology filtering.
- **`afbddee` — `Implement Charts II 100 percent stacked bar visualization`** adds proportional segment rendering with correct nonnegative additive totals, safe zero-total behavior and raw-value inspection; repetitive 100% captions above bars were removed after browser review.
- **`7aebea9` — `Add Charts II regression coverage and stabilize chronology interactions`** adds cross-family derivation tests, fixes Dot Plot's top-category ranking to apply the requested metric before truncation, and safeguards Scatter/Bubble chronology drag-release. The researcher accepted the no-redraw-during-drag behavior.
- **`d3186ed` — `Implement Charts II interactive treemaps with hierarchical drill-down`** introduces parent/child navigation, expandable Other categories with stable identity across chronology changes, breadcrumbs, and retained totals. The user verified one-level-per-click navigation and chronology persistence.
- **`bdd7366` — `Implement Charts II slope charts with chronological comparisons`** adds a two-period comparison chart; `ee8e0cc` implements readable Dot Plot axes; `b6e0db5` adds outlier-aware Box Plots; `19fe63b` adds Scatter/Bubble and wide-format numerical series; `0cf09fd` adds Area and precision-aware temporal aggregation; and `6f341f3` establishes the initial Charts II Catalogue and eight family implementations. These were separate accepted milestones, not one unverified feature drop.
- **Core-documentation synchronization (historical preparation status after `e96c375`; subsequently committed at `2be3ea0`):** Updates the README user workflow, Maintainer's Guide Charts II architecture/module ownership/fragile-zone contracts, Charter checkpoint and historical Analytics decision label, and the Changelog checkpoint and verified Charts milestone sequence. The five uploaded governance/core documents were used as the source; the governance protocol itself is unchanged. Do not count this handoff as an additional Git commit.
- **Acceptance and limitation:** Charts II has 15 implemented chart families and is the current charting interface; browser evaluation accepted filtering, colors, mark styling, adaptive labels, drag-release, responsive sidebar sizing, and exported PNGs. The available source-level suite was reported passing; a separate Timeline grouped-lanes test still expects “Uncategorized” where current implementation uses “No priority category.” Dense labels, accessibility, unusual data shapes, and deployed-site behavior may warrant later focused work. No claim is made that every chart is suitable for every source or that further appearance refinement is complete forever.

[Back to development history](#3-full-development-history)

</details>

<details>
<summary><a id="milestone-timeline-grouped"></a><strong>Adaptive Grouped Timeline swimlanes and category workspace — 2026-11-10 to 2026-11-11 (committed; scrollbar browser-accepted)</strong></summary>

### Adaptive Grouped Timeline swimlanes and category workspace — 2026-11-10 to 2026-11-11 (committed; scrollbar browser-accepted)

- **`f5791f1` — `Implement Timeline II adaptive grouped swimlanes and category workspace`** adds Grouped alongside Chronological presentation. Grouped arranges mapped temporal events in one researcher-directed category swimlane each, without duplicating events or changing their dates. Starred categories (filled stars) are swimlane-eligible; unstarred memberships remain as color/symbol encodings. Priority order resolves multiple eligible memberships by default, with source-backed event-level primary overrides supported by the model. A **No priority category** lane holds events with no eligible membership. Lane bands retain category color in a subdued treatment; lanes persist even when empty in the visible interval and contract to narrow bands. Heights adapt to visible temporal congestion after navigation settles, avoiding continuous regrouping during pan/zoom. Grouped layout does not supersede Chronological collision packing.
- The Categories editor now uses a five-column **Source columns / Values to track / Priority / Color / Icons** workspace. Priority is a direct outline/filled-star toggle, not a primary-dimension dropdown or an elaborate ranking form. The color and symbol libraries remain researcher-controlled. **Colors and symbols** is the default display setting for new configurations; **Colors only** and **Expanded labels** remain choices. The five-column region uses a native horizontal scrollbar with a visible thumb and independent vertical column scrolling, not the rejected custom slider/column-navigation controls.
- **Scrollbar diagnostic and accepted correction:** Intermediate versions v4–v9 visually clipped the fifth column without usable scrolling. Chrome measured an approximately 1,770 px scrolling element with `clientWidth = scrollWidth`, despite a much narrower ancestor. Styling the thumb did not solve this: the stage-transition flex wrappers allowed the editor to keep its intrinsic width, while a narrower ancestor clipped it. The accepted v10 correction conditionally adds `min-w-0` to the stage-transition shell and content **only for Timeline II** in `src/PeridotVisualizationsWorkspace.jsx`, permitting the editor viewport to shrink and its native thumb to work. The researcher explicitly reported success. Risks and rollback are maintained in `planning_documents/PERIDOT_TIMELINE_II_HORIZONTAL_SCROLL_LAYOUT_RISK_20261111.md` and the Maintainer's Guide; the conditional must not be broadened casually to Map, Network, Charts I, or concurrent Charts II.
- **`ea7cda8` — `Remove obsolete src.zip archive`** is the separate repository cleanup commit following the Timeline implementation. It intentionally removes the obsolete tracked ZIP. Uncommitted Charts II files and edits were preserved, not silently added to these commits.
- **Validation boundary:** Focused category/grouped-lane tests and JSX syntax checks passed during the staged handoffs; user screenshots accepted grouped lane appearance and the browser confirmed the final scrollbar fix. A comprehensive performance, accessibility, production/deployed-site, or orientation-by-orientation regression suite has not been demonstrated. Next: event-density/simultaneity research, broader data and responsive regression; event-to-event relationship arcs remain deferred pending explicit source-supported authoring semantics.

[Back to development history](#3-full-development-history)

</details>

<details>
<summary><a id="milestone-timeline-categories"></a><strong>Dataset-derived Timeline categories and curated symbols — 2026-11-09 to 2026-11-10 (committed, researcher-tested)</strong></summary>

### Dataset-derived Timeline categories and curated symbols — 2026-11-09 to 2026-11-10 (committed, researcher-tested)

- **`27c5b52` — `Implement Timeline category configuration and curated symbol library`** introduces the active **Timeline / Categories** tabs, three-column researcher-controlled category configuration, plural category memberships, editable labels, 42 preset rainbow-organized colors plus a custom-color control, category preview, the three display modes **Colors only / Colors and symbols / Expanded labels**, and a curated **100-icon** selection from `@tabler/icons-react@3.50.0`. The symbols are independent of color and optional; charcoal is the default for uncategorized marks. Point marks use color divisions (with an overflow count when necessary); duration bands use color striping. The active source and mark components include `PeridotTimelineCategoryEditor.jsx`, `PeridotTimelineCategoryMarks.jsx`, `PeridotTimelineCategorySymbols.jsx` and `peridotTimelineCategoryConfiguration.js`. Tabler icons are MIT-licensed; the notice and curated CSV inventory are independent supporting resources, not core process documents.
- **`9c2bb0e` — `Generalize Timeline categories across mapped dataset attributes`** expands researcher-selected categories beyond mapped Evidence to other source-backed mapped attributes and eligible original columns. `peridotTimelineCategorySourceInventory.js`, `peridotTimelineCategoryAssociationResolver.js`, and `peridotTimelineGeneralizedCategories.js` supply testable discovery, provenance and researcher-selected event association. The editor presents original uploaded column names (rather than internal mapping identifiers), allows selection of field values and record/subject/assertion-level association as applicable, and retains user-chosen appearance when returning to the Timeline. No automatic joins between unrelated workbook records or new historical claims are authorized. Categories alter visual encoding, not the canonical underlying source data or global Search filters.
- **Verification boundary:** Synthetic category-related tests passed in development and the researcher reported successful local command-line checks/build. The researcher visually tested source-location categories for correspondence (including the Maria Magdalena sending-location use case), person-level Family Tree categories, and Cardinals creation-related categories, approving the displayed results and requesting the commit. This is representative multi-sample acceptance, **not** a universal joined-workbook or accessibility/performance guarantee. During Pass C, a source hash guard failed and the user subsequently applied files manually; the resulting tree was tested and committed. Preserve that history and use exact current-file guards for future changes.
- **Next Timeline work:** Grouped category swimlanes with researcher-ordered primary category and Uncategorized lane; event-density overview and narrowly justified simultaneous-event expansion; cross-orientation, keyboard/accessibility, Inspector, uncertainty and large-data regressions. Automatic event-to-event relationship arcs remain **deliberately deferred** pending a provenance-faithful, researcher-authored connection approach and future project-persistence decisions. Charts II continues separately.

[Back to development history](#3-full-development-history)

</details>

<details>
<summary><a id="milestone-chronology"></a><strong>Shared chronology calendar correctness, 10% padding, and dataset-extent display — 2026-11-09 (committed, browser-accepted)</strong></summary>

### Shared chronology calendar correctness, 10% padding, and dataset-extent display — 2026-11-09 (committed, browser-accepted)

- **`4fca872` — `Unify shared chronology navigation, filtering, and dataset extent presentation`** is the latest researcher-confirmed pushed commit. This closes the bounded chronology correction sequence that followed `c74aa55` (independent visualization sessions). `688bc17` previously retired the old Timeline I presentation and promoted Timeline II as the sole active **Timeline** tab; the retained `PeridotTimelineII.jsx` filename is an implementation name, not a second public Timeline choice. Do not reinstate Timeline I because older documentation uses the terms “original Timeline” and “Timeline II.”
- **One dock, one ruler geometry:** `PeridotChronologyDock.jsx` remains the single UI authority for Map, Network, Timeline, and Charts. Map/Network/Charts navigation uses a continuous Gregorian-day window via `peridotChronologyWindow.js` and `peridotChronologyNavigationBridge.js`; Timeline retains its calendar-day control. The ruler shares dataset-derived domain endpoints and a common tick-positioning/collision approach across these views. Each visualization keeps an independent session (window, playback state and applicable settings) across navigation. Calendar windows can traverse intervals with no records; such intervals must not be silently projected to the nearest available recorded year.
- **Full dataset and filtering:** the chronology domain is derived from the complete unfiltered dataset's source-positionable temporal assertions, including duration endpoints; its minimum and maximum are expanded by 10% of the source span **on each side**. Search, playback, and enabled temporal-role selection do not shrink that base domain. Reset selects the complete padded window, so the draggable handles remain at the outer boundaries. Once a date window is adjusted, Map/Network/Charts use canonical calendar-day overlap/filtering rather than year-index snapping. Cumulative and Concurrent semantics, partial-precision dates, intersecting periods, genuinely undated evidence, and Search scope remain scholarly contracts, not grounds for invented records or dates.
- **Accepted extent presentation:** the dataset's actual start/end dates are identified in the shared dock by two gold diamond endpoint markers, a fine dashed guide, and a **Data extent** label (Option C). This intentionally distinguishes the historical source extent from the padded navigable range and the teal selected window. The prior unlabeled oxblood/red extent line and proposed shaded-margin/bracket alternatives were superseded by user-approved Option C. Horizontal and compact vertical forms must remain readable.
- **Test and validation boundary:** four focused Node tests were added and committed: `peridotChronologyWindow.test.mjs`, `peridotChronologyNavigationBridge.test.mjs`, `peridotChronologyRulerParity.test.mjs`, and `peridotChronologyCalendarFiltering.test.mjs`. During development the tests passed; the researcher confirmed the padding/filtering behavior in the browser and explicitly approved the final extent-marker visual. This does not claim a complete automated React/browser, production/deployed-site, or large-dataset regression suite.
- **Future work:** the next substantive Timeline phase is a read-only audit and prototype of event-to-event relationship arcs, preserving mapped relationship identity and avoiding synthetic event edges. Category encoding completeness, grouped category swimlanes, responsive clustering/density, and uncertainty/Inspector interaction refinement remain planned or require source-level verification before implementation. These were not implemented by the chronology checkpoint. Concurrent Charts II development remains separate.

[Back to development history](#3-full-development-history)

</details>

<details>
<summary><a id="milestone-about-animations"></a><strong>About manuscript entrance animations — 2026-11-05 (committed, user-accepted)</strong></summary>

### About manuscript entrance animations — 2026-11-05 (committed, user-accepted)

- **`71833b3` — `Add staggered manuscript entrance animations to About pages`** is the confirmed pushed commit. Across **About Peridot**, **Creator**, **AI Disclosure**, **Open Source**, and **Feedback**, the reading surfaces use a restrained, CSS-only manuscript reveal consistent with Home and the no-dataset editorial gateways. The stationary parchment and local About navigation remain visible while headings and content fade and rise in overlapping stages; the decorative torn-paper corners float in **last**, once per tab entrance, and then remain stationary. Switching About subpages replays the sequence without introducing a route-loading overlay or an outgoing cross-page transition.
- **Accepted pacing and variation:** following v01's overly rapid entrance, v02 extended heading/content beats to approximately **1,050 ms** and corner fades to approximately **1,200 ms**, with broader overlapping stagger delays. The Creator portrait and red ornamental frame animate together as one figure, AI Disclosure reading panels enter in order, Open Source links enter sequentially, and Feedback content enters in coherent chunks (feedback type, relevant app area, writing fields, contact/privacy/submission), not field-by-field. Feedback's upper-left and lower-right decorative corners now animate **simultaneously as the final framing gesture**. v04 is the accepted handoff revision.
- **Ownership and preservation:** `src/PeridotLearnMoreWorkspace.css` owns the About entrance keyframes, element selectors, delays, and reduced-motion override. No new JavaScript animation lifecycle, React component rewrite, routing change, or changes to the Feedback form's input/validation/submission behavior were part of this pass. Preserve existing corner anchors, irregular text wrapping, Creator portrait layout, local navigation, scroll containment, and `prefers-reduced-motion` behavior. The user reviewed the successive browser appearances and explicitly approved v04 before committing; full automated/cross-browser/deployed verification is not claimed.
- **Concurrent-work boundary:** `d119550`, `c74aa55`, and `50c1be5` are separately confirmed historical commits from the recent Git log, but this About-only documentation pass does not infer or audit their complete implementation details. Current uncommitted Timeline/Charts II changes are excluded.

[Back to development history](#3-full-development-history)

</details>

<details>
<summary><a id="milestone-loader"></a><strong>Persistent OffscreenCanvas loading, seamless preboot, and first-mount Map recovery — 2026-11-02 to 2026-11-03 (committed and user-tested)</strong></summary>

### Persistent OffscreenCanvas loading, seamless preboot, and first-mount Map recovery — 2026-11-02 to 2026-11-03 (committed and user-tested)

- **`81c3719` — `Implement persistent loading animation and repair initial Map mounting`** is the user-confirmed source commit, pushed to `main` on 2026-11-03 (10 files; 747 insertions, 97 deletions). This commit records only the loader and first-load Map work of this development conversation. The push advanced `origin/main` from `688bc17` to `81c3719`; intervening Timeline II development is outside this documentation pass and is not reconstructed here.
- **Accepted animation:** a forest-green, antique-gold/red compass with a pine-ink (`#2D5942`) outlined, individually shaded brilliant-cut peridot; eight sequentially pulsing arms; diagonal facet illumination; a two-origin clockwise graduated ring draw/erase; and 75% playback speed. The selected Forest Study is a Canvas drawing, not the earlier SVG/CSS approximation. `src/PeridotLoadingGemRenderer.js` supplies the drawing for both worker and fallback, and `src/PeridotLoadingGem.worker.js` advances OffscreenCanvas rendering independently of main-thread JavaScript when supported. React owns its Canvas elements; transferred nodes are not replaced directly through imperative DOM manipulation. The main-thread fallback and reduced-motion behavior remain available.
- **Lifecycle and user acceptance:** `src/PeridotTransitionOverlay.jsx` retains the loading component/worker across visualization switches, pausing it while hidden and restarting its animation on subsequent transitions rather than initializing a worker every time. After a large-dataset test, the researcher reported continuous, visually correct loading during Map/Network/other visualization switches and during longer processing. `src/App.jsx` also schedules a rendering opportunity before mapped-data work and retains development timing diagnostics for loader transitions, workbook parsing, and frame gaps. The existing `peridotWorkbookReview.worker.js` is a separate provisional workbook-review worker and must not be conflated with the rendering worker.
- **Startup handoff:** `index.html` embeds a static image rendered from the actual approved animation **at time zero** (ring initially absent), rather than a simplified emblem or the fully drawn/reduced-motion frame. `src/main.jsx`, `src/PeridotBootLoader.css`, and the loader handoff coordinate presentation until a first Canvas frame is available, avoiding a visible still-to-animation jump. The researcher verified the handoff in the browser. Development-server startup initially seemed slow, but `npm.cmd run build` followed by `npm.cmd run preview` yielded nearly instantaneous startup in the researcher's local production preview. That observation is not a guarantee of GitHub Pages network performance or a separate deployed-site test.
- **First-load Geographic Map repair:** on the first import of a large dataset, the Map stage sometimes appeared blank after the loader dismissed, yet worked when navigating away and back. A read-only source audit identified that viewport observation could run before the conditional Map element mounted and fail to attach; `src/App.jsx` now measures the actual Map element through mount-aware ref/observer wiring. Initial-fit chronology policy and subsequent viewport continuity are preserved. The researcher tested the corrected initial Map and reported that it now displays correctly. This is a targeted viewport lifecycle correction, not a new global visualization-readiness protocol or a guarantee that all CARTO tiles are loaded when the overlay ends.
- **Rejected/rolled-back implementations and diagnostic evidence:** an earlier worker attempt replaced React-owned Canvas elements imperatively and produced a white-screen regression during upload; it was rolled back before the accepted implementation. A diagnostic main-thread Canvas pass recorded significant frame gaps, including a roughly 7.2-second gap during mapped-data processing, establishing the animation's vulnerability to main-thread starvation while not isolating every costly React/map operation. Shorter timers, repeated `requestAnimationFrame` calls, and a return to unfaithful SVG/CSS prototypes were not selected as the solution. Do not reinstate the discarded worker implementation or its DOM-replacement workaround.
- **Verification boundary:** the user validated loader visuals, sustained animation, initial still handoff, large-dataset switching, first-load Map recovery, and fast local production preview. Syntax/ZIP reviews were conducted on delivered files. These observations do not represent a complete automated cross-browser, accessibility, reduced-motion, fallback, or production-deployment regression suite. The separate Timeline II workstream is intentionally excluded from this milestone.

[Back to development history](#3-full-development-history)

</details>

<details>
<summary><a id="milestone-timeline-map"></a><strong>Timeline II, one shared chronology dock, and Map performance/initialization — 2026-11-01 (committed; browser-reviewed)</strong></summary>

### Timeline II, one shared chronology dock, and Map performance/initialization — 2026-11-01 (committed; browser-reviewed)

- **`3f0ae7c` — `Introduce Timeline II and stabilize chronological event packing`** introduces a parallel **Timeline II** visualization alongside the original Timeline, using assertion-level events and periods, calendar-faithful placement, secondary-axis lane packing, and dedicated horizontal/vertical presentation. The detailed implementation was iterated locally before later checkpoints; do not conflate Timeline II with the older card-based Timeline workspace.
- **`8899b8d` — `put old planning docs into planning docs folder`** is the user-confirmed intervening repository-organization commit. Do not infer additional file moves from its subject alone.
- **`2664fbf` — `Unify Timeline II chronology navigation and playback controls`** checkpoints Timeline II's chronology range navigation, date ruler, playhead, playback/speed and Cumulative/Concurrent controls, including orientation-specific layouts. Later extraction did not authorize a second visual implementation.
- **`8cb1cbc` — `Unify chronology controls and stabilize Map playback and initialization`** consolidates the approved dock markup in `src/PeridotChronologyDock.jsx`; Timeline II renders that shared interface, while `src/PeridotSharedChronologyAdapter.jsx` bridges the existing App-owned indexed timeline/playback state for Map, Network, the original Timeline, and Charts via `src/PeridotVisualizationsWorkspace.jsx`. One shared visual component does **not** yet mean one temporal-coordinate controller: Timeline II retains calendar-day positioning, while the older shared playback domain uses year-list indices/assertion-level entries. The Map pass reuses a D3 projection within a graph build, removes unused `activeCountryIds`/geographic containment work during scrubbing, and corrects first-load readiness. User reported a substantial Map scrubbing improvement, confirmed first-load map rendering, and subsequently verified the shared ruler's delayed-mount width fix. Earlier duplicate v34 chronology implementation, temporary v42 diagnostics, and failed speculative v39/v41 repairs are not accepted architecture.
- **`ddee7e2` — `Extend Timeline II vertical chronology to full plotting height`** was the latest clean, pushed checkpoint at this historical 2026-11-01 milestone. The vertical event and ruler coordinate mapping no longer subtracts the full playback-control stack from the available plotting length; a narrow left-rail navigator coexists with compact playback controls. The user reported this full-height geometry materially improved vertical plotting; horizontal Timeline II and other shared chronology renderers remain separate regression obligations. The preceding v44 control-compaction-only attempt was insufficient and was superseded.
- **Source/verification boundary:** The final user-provided Vite production build passed before the Timeline II vertical update, and a clean synced Git ritual was supplied for `ddee7e2`. The v45 replacement passed JSX parsing but no separate post-`ddee7e2` production build log was supplied. Browser screenshots/feedback validate the described visual outcomes, not an exhaustive automated regression suite.

[Back to development history](#3-full-development-history)

</details>

<details>
<summary><a id="milestone-workbook"></a><strong>Live CARTO deployment, workbook correctness, normalization speed, and legacy audit — 2026-11-01 (committed milestones; audit read-only)</strong></summary>

### Live CARTO deployment, workbook correctness, normalization speed, and legacy audit — 2026-11-01 (committed milestones; audit read-only)

- **`be5fea5` — `Synchronize documentation through dependency maintenance and mapping refinements`** recorded the previous core-documentation pass. The present pass supersedes that document checkpoint without rewriting its historical record.
- **`54dfa2c` — `Provide CARTO basemap key to GitHub Pages build`** adds `VITE_CARTO_BASEMAP_KEY: ${{ secrets.VITE_CARTO_BASEMAP_KEY }}` to the existing `npm run build` step in `.github/workflows/deploy-pages.yml`, alongside `GITHUB_PAGES: 'true'`. The workflow still uses `npm ci`, builds `./dist`, and deploys the artifact using GitHub Actions. The live site initially displayed CARTO's `API KEY REQUIRED` tiles despite working locally; the user subsequently confirmed the published Geographic Map was fixed. The key must be provided through GitHub's Actions repository secret. **A Vite `VITE_` environment variable is embedded in browser-delivered assets and is not server-side secret material after publication**: CARTO-side restrictions/monitoring, if supported, remain important. Never record the actual key in source, logs, or documentation.
- **`64dfbae` — `Guard workbook confirmation against stale review results`** adds a defensive current-worker-review readiness check inside the workbook confirmation handler, supplementing the disabled-button condition. The user reported browser/build acceptance and a clean pushed checkpoint. This does not assert that an exhaustive stale-worker race suite was run.
- **`8dd208a` — `Restore progressive disclosure for new data uploads`** distinguishes automatically suggested fields in *fresh* uploads from accepted assignments in *existing/sample mappings*. Fresh Relations, Time, and Places pages remain behind their Add controls; revisited assignments remain immediately visible and Places still adds only one mapping at a time. The user tested the repair and committed/pushed it.
- **`481acd9` — `Optimize canonical capability readiness calculations`** replaces repeated whole-array scans for per-record network participation and geographic route readiness with precomputed indexed counts/flags in `src/peridotCorrespondenceProfile.js`. Source data, accepted mapping semantics, capability criteria, and normalized research assertions were intended to remain unchanged; the user reported successful functional regression checks, then committed and pushed the one-file optimization. Temporary timing instrumentation in `src/App.jsx` and `src/peridotCanonicalRuntimeModel.js` was restored before the clean Git synchronization.
- **Measured performance (informative, not a controlled benchmark):** during diagnosis, 4,999-row workbook confirmation took approximately **4,082 ms** of synchronous import, including **3,817 ms** of total normalization; of that, canonical construction was approximately **3,674 ms**, legacy compatibility **102 ms**, assembly **173 ms**, and validation **92 ms**. After the capability-scan optimization, a 4,999-row case showed **485 ms** canonical construction and **616 ms** combined normalization. This is an observed approximately **86.8%** lower canonical-construction duration across runs, **not an isolated causal benchmark**, because primary-sheet selection, mapping choices, and other conditions differed. A separate 2,994-row primary-sheet case reflects different source-record cardinality, not necessarily the researcher's subjective count of substantive rows. Do not automatically discard placeholder-bearing rows; the researcher selects the primary record sheet and explicit joins.
- **Read-only legacy-importer retirement audit:** a November 1 `src` archive and available repository entry points were audited. Universal-upload prototype/UI/harness modules appear outside the active application import graph, but some have fixture/test-only dependencies. `peridotUniversalRuntimeCompatibility.js` and `peridotNormalizationShadowAudit.js` retain development/fixture roles. `peridotLegacyCompatibilityAdapter.js`, the correspondence profile, and genealogy-related modules remain production-reachable. No deletions were authorized or made; retained test/archival code must not be labeled safe for deletion without renewed current-source and fixture assessment. The source snapshot predated the final `481acd9` commit; this limits exact-checkpoint conclusions.
- **Scope decisions:** the separately proposed comprehensive worker-race follow-up and dependency-security follow-up are excluded from this cleanup cycle at the researcher's direction; a deeper regression-fixture review is **deferred**. The workbook performance measurement/optimization cycle and read-only legacy retirement classification are closed. Timeline relationship-line visual legibility remains an active next feature/design issue.

[Back to development history](#3-full-development-history)

</details>

<details>
<summary><a id="milestone-dependencies"></a><strong>MapLibre retirement, dependency maintenance, and mapping UX/Review repairs — 2026-10-31 (committed)</strong></summary>

### MapLibre retirement, dependency maintenance, and mapping UX/Review repairs — 2026-10-31 (committed)

- **`1a58e44` — `Synchronize documentation through CARTO map and workbook processing improvements`** closed the preceding documentation pass at the CARTO/worker milestone.
- **`3da30ec` — `Remove obsolete MapLibre dependencies from lockfile`** removes the orphaned `maplibre-gl` dependency tree remaining in `package-lock.json` after the active application/manifest had already stopped depending on MapLibre. The user verified that npm removed 27 installed packages, the Vite production build succeeded, and the commit was pushed with a clean working tree. The experimental `maplibre-native-geographic-view` Git branch and historical development references remain archived, not deleted.
- **`74ca40e` — `Upgrade SheetJS and refresh Browserslist compatibility data`** pins `xlsx` to the official SheetJS 0.20.3 distribution tarball instead of npm's 0.18.5 release, removes eight now-unneeded transitive dependencies, and refreshes the Browserslist `caniuse-lite` dataset from `1.0.30001788` to `1.0.30001820` without altering configured target browsers. The npm installation originally reported 10 audit findings (including one production `xlsx` finding); after SheetJS replacement it reported nine remaining findings. The user verified the exact installed `xlsx@0.20.3`, reviewed the dependency diff, obtained a successful Vite production build, and reported successful import regression tests. The later Browserslist update was reported successful; the transcript does not separately show a second post-Browserslist production-build log, so do not state that specific run was independently observed. The dependency changes were committed and pushed with a clean tree.
- **`973d40d` — `Refine mapping disclosure and subject selection and repair Review`** corrects optional mapping presentation: **Add a Location** reveals one new place mapping rather than exposing several prebuilt entries; existing Places, Time, and Relations assignments display immediately when sample or uploaded mappings are revisited; Review no longer crashes on the undefined `mappedRowsCapabilityAudit` reference; and the shared record/participant subject selector more clearly communicates multi-select, retains its required-at-least-one-subject guard, and does not visually disable the last selected option. The user confirmed the interaction fix and reported the final browser/build tests passing before committing and pushing. These are mapping UX and Review correctness repairs, not changes to accepted canonical subject attribution.
- **Maintenance policy accepted:** review **both** SheetJS and Browserslist/caniuse-lite every six calendar months. Record the last installed and verified update **date and exact version** independently from the last review date, the review result, and the next review due date. Initial successful-update date for both is **2026-10-31** (user-local date of the completed upgrade sequence); next review due **2027-04-30**. A review without an upgrade updates *last reviewed*, not *last updated*. The Maintainer's Guide owns the operating register and regression expectations; the Project Workflow Charter owns the recurring-process rule.

[Back to development history](#3-full-development-history)

</details>

<details>
<summary><a id="milestone-carto-map"></a><strong>Web Mercator/CARTO map, performance, exports, and workbook review — 2026-10-31 (committed)</strong></summary>

### Web Mercator/CARTO map, performance, exports, and workbook review — 2026-10-31 (committed)

- **`0794002` — `Establish Web Mercator and CARTO multiscale map prototype`** introduced tiled Web Mercator geography over the existing D3/SVG map. CARTO Voyager is the default, with Positron and Dark Matter alternatives. The CARTO credential is read from local `VITE_CARTO_BASEMAP_KEY` configuration; do not commit `.env.local`, leak its value in documentation, or treat a displayed range as proof of successfully rendered tiles.
- **`bc99e31` — `Stabilize CARTO world wrapping, high-zoom rendering, and map interactions`** captures continuous east–west world wrapping, bounded north–south panning, buffered geographic tile selection, retained imagery during zoom, and viewport-coordinate raster tile positioning. The latter corrected the formerly blank basemap above approximately zoom 16.3; the user subsequently demonstrated geography at zoom 20. Research node/edge alignment and provenance remain governed by the existing generalized map contracts.
- **`3c0a43e` — `Optimize geographic map rendering and interaction performance`** checkpoints visible-first/progressive tile handling, bounded in-session request caching, lower-frequency tile-selection updates, and screen-space clipping/culling plus simplified rendering of relationship edges during navigation. Edge isolation with the 500 Letters sample established that research edges, not just CARTO, accounted for significant high-zoom lag; rapid-interaction recovery and drag-time text-selection prevention were then tested and accepted. Avoid claiming formal frame-time benchmarks from these subjective/browser diagnostic trials.
- **`2684b3c` — `Repair geographic map exports and preserve CARTO attribution`** repairs PNG/SVG geographic exports by embedding CARTO raster imagery rather than relying on exported external tile URLs, and ensures readable Peridot / OpenStreetMap contributors / CARTO credit in the image. Export should fail visibly if necessary tiles cannot be embedded; previous externally linked SVGs could expose a tile-key query parameter. The final wheel-after-drag regression fix restores immediate zoom responsiveness.
- **`ae3574c` — `Finalize geographic map interface and improve workbook review processing`** removes temporary tile/performance/isolation diagnostics, places Voyager/Positron/Dark Matter in transactional Map settings, and adds `peridotWorkbookReview.worker.js` to move workbook assembly/review auditing off the UI thread. The current review worker can begin a debounced (~500 ms), provisional full-review preparation while mapping is underway, reuse a current result, and reject superseded mapping revisions. **Independent cached processing of Time, Places, Relations, and Evidence is not implemented**; final confirmation and some mapping validation remain separate work. The user reported less waiting at Review, with no disruptive workflow change.
- **User acceptance boundary:** the Geographic Map was user-tested with a dataset of approximately 3,000 nodes and worked well; this is not a universal performance guarantee. Map PNG and SVG exports, attribution legibility, and the drag/zoom fix were reported working. Full production deployment, every map-style/export combination, and deliberately racing old/new importer mapping revisions are not independently verified. That map milestone was synchronized at `ae3574c`; the current repository checkpoint has since advanced to `481acd9`.

[Back to development history](#3-full-development-history)

</details>

<details>
<summary><a id="milestone-gateways"></a><strong>Illustrated gateway pages, entrance motion, and GitHub Pages asset repair — 2026-10-31 (committed)</strong></summary>

### Illustrated gateway pages, entrance motion, and GitHub Pages asset repair — 2026-10-31 (committed)

- **`1a6554d` — `Synchronize documentation through About manuscript and Data responsive refinements`** established the previous documentation pass after `5e785ed`.
- **`dd11827` — `Redesign Visualize and Explore no-data onboarding`** introduced coordinated, parchment-backed no-dataset pages with the large **No Dataset Active** heading, 24px explanatory copy, a single prominent **Go to Data** action, and full-width illustrated tears. Visualize uses `divider_tear_illuminated.png`; Explore uses `divider_tear_celestial.png`. The tear is intentionally a visual rupture signaling that the research workspace requires a loaded dataset, not a functional control.
- **`c150444` — `Modify some decorative assets`** is the subsequent asset-modification checkpoint. The user later declined a separate regenerated high-resolution set of six tears; that trial is not the approved baseline.
- **Tutorials manuscript gateway:** the public **Tutorials Coming Soon** page was brought into the same editorial structure, using `divider_tear_alchemy_mineral.png`, the large Data CTA, and the same parchment background, without activating the still-deferred guided tutorial. The change included the existing Data-routing callback in `App.jsx`.
- **Accepted page motion (v38/v39):** the heading fades and rises, followed by explanatory copy, the Data button, and a stationary tear fade. Visualize/Explore replay their entrance sequence when destinations change; reduced-motion preferences must remain respected. A later proposed *horizontal outgoing/incoming cross-page transition* (v40/v41) introduced `ReferenceError: datasetRequiredDestination is not defined` and was deliberately rolled back. The accepted experience is the simpler staggered entrance/replay, **not** the shared horizontal transitioning gateway.
- **`5d5f528` — `Fix editorial gateway asset paths for GitHub Pages`** attempted to prefix root-relative `/assets/` strings with Vite's base path. That was insufficient because string-built asset paths were not necessarily emitted into the Vite production bundle. The corrective pass imports PNGs from the established repository `assets/` directory into React so Vite can process, fingerprint, and reference them correctly, rather than duplicating art under `public/assets/`. The user confirmed a later clean push at **`fc42306`**. The intermediate deployment/repair commits include hashes `2214d8e` and `87bc8f0` reported as push endpoints, but their exact commit messages were not furnished here and must not be invented.
- **Verification boundary:** local appearance and the user-reported Git push/clean tree are established; a post-`fc42306` published-site visual verification was not provided in this conversation. Successful Git synchronization is not itself evidence that GitHub Pages deployed and rendered all imagery. No semantics, source data, visualization calculation, Search behavior, or tutorial-guidance functionality changed in this milestone.

[Back to development history](#3-full-development-history)

</details>

<details>
<summary><a id="milestone-detail-12"></a><strong>About manuscript presentation and responsive Data refinements — 2026-10-30 (committed)</strong></summary>

### About manuscript presentation and responsive Data refinements — 2026-10-30 (committed)

- **`5e785ed` — `Refine About manuscript design and Data workspace responsiveness`** was the user-confirmed clean, pushed checkpoint for that historical milestone. The About section now uses an illustrated-manuscript treatment: page-specific torn-corner graphics remain anchored to the outermost About content bounds, with parchment coordinated to the artwork. About Peridot, Creator, AI Disclosure, Open Source, and Feedback retain their existing navigation and content semantics. Rather than rigidly reserving a large rectangular blank area for an irregular illustration, text and supported content flow around the corner art with a small readable buffer. Dividers and controls should not visually cross the illustrations.
- The **Creator** portrait now has a four-corner red ornamental frame outside the photo edges, with visible breathing room between image and ornament. The biography wraps around the top-right illustrated corner rather than overlaying it or leaving a disproportionately wide gap. The **Feedback** form retains two columns with a prominent left-aligned **Send feedback** action in its right column; explanatory text and form fields avoid the bottom-right illustration. Smaller-window behavior was visually tested and refined separately from desktop placement.
- The **Data** entry and Sample Datasets card layout was refined for laptop-height viewports: sample-card vertical density and padding were reduced without shrinking text, while the persistent **No Dataset Loaded / active dataset** status panel remains distinct and preserves a small, comfortable bottom-viewport clearance. These changes are presentation/responsiveness, not altered sample semantics, upload parsing, navigation state, or mapping logic. The latest user-provided screenshots and commit verification establish the accepted appearance; precise CSS selectors and breakpoint values must be verified against current raw source before further implementation.
- **`7df38d0` — `Synchronize documentation through Data onboarding and asset organization`** committed the prior core-documentation synchronization. It precedes the new About/Data refinement checkpoint.
- Corner tests involving alternate homepage assets and other experimental ornament placements were subject to explicit rollback during the design cycle; do not describe those trials as accepted homepage state. Asset licensing/provenance review remains a separate obligation.

[Back to development history](#3-full-development-history)

</details>

<details>
<summary><a id="milestone-detail-13"></a><strong>Data onboarding, decorative asset organization, and reference repair — 2026-10-30 (committed)</strong></summary>

### Data onboarding, decorative asset organization, and reference repair — 2026-10-30 (committed)

- **`c71e265` — `Repair asset references after decorative asset renaming`** updates image paths for Home's parchment and editorial collage pieces, Data's three sample illustrations, and the Creator portrait after the asset-filename normalization. The user tested the resulting pages successfully; source-image loading and design composition were restored without intended changes to layout, behavior, animation, or data semantics.
- **`52cf1f8` — `add and rename decorative assets`** introduces and standardizes a larger catalog of reusable parchment, illuminated-manuscript, cartographic, botanical, celestial, alchemical, and peridot-gemstone assets under role-based filenames. Current asset roles include `base_`, `corner_`, `divider_`, `detail_`, `panel_`, `label_`, and `img_` as applicable. Corner orientation suffixes use `TL`, `TR`, `BL`, `BR`; any numeric differentiators appear at the end of the descriptive filename. **The later experimental collection of 44 small labels/modular frames was not accepted into the repository.** Asset origin, transparent-edge QA, and source licensing remain separate review concerns.
- **`761d72d` — `Refine Data workspace controls and sample selection icon`** enlarges and recolors the persistent **Edit Mapping** action in oxblood and replaces the Get Started sample-choice wheel with a four-tiles symbol.
- **`ee4c3ff` — `Redesign Data onboarding and refine workspace animations`** establishes the four-tab Data landing page (**Get Started / Sample Datasets / Templates / Upload Data**) with a persistent bottom active-dataset/status panel, direct actions for each sample, isolated three-card Get Started surface, and appropriately sized one-screen desktop presentation. The Home now features one **Get Started** action routing to Data, superseding the earlier two Home calls to action. Data tab transitions use a gentle top-to-bottom entrance sequence with quick onset on first navigation and tab switches; visual changes preserve the generalized mapping and import path. Historical sample-card artwork and direct Use/Edit mapping/Download source/Details actions remain available.
- **`86cb3d0` — `Synchronize documentation through mapping and interface refinements`** is the last committed documentation synchronization preceding this pass.

**Documentation synchronization prepared 2026-10-30 (uncommitted handoff):** the four core documents were updated against user-confirmed clean checkpoint `c71e265`. The Core Documentation Governance Protocol was read and intentionally left unchanged. No new Git commit is asserted by this handoff.

[Back to development history](#3-full-development-history)

</details>

<details>
<summary><a id="milestone-detail-14"></a><strong>Cartographic Editorial public pages, import compatibility, and mapping disclosure — 2026-10-26 to 2026-10-28 (committed)</strong></summary>

### Cartographic Editorial public pages, import compatibility, and mapping disclosure — 2026-10-26 to 2026-10-28 (committed)

**Documentation synchronization prepared 2026-10-30 (not yet committed):** current user-confirmed checkpoint, public workflow, import compatibility, mapping disclosure, informational workspaces, and deferred status were reconciled across the four core documents. The Governance Protocol was reviewed and left unchanged. This documentation artifact does not assert a new Git commit.

- **`87d6955` — `Refine informational workspace presentation and restore Creator layout`** removes redundant eyebrow text from the no-data Visualize/Explore screens, Tutorials, and applicable About pages; returns Creator to its earlier photo-and-biography composition after a trial of a large portrait/name/CV profile card; and preserves the existing About/Feedback navigation. The experimental profile-card variants and their proposed biography replacement were not retained. This was the user-confirmed clean `main` checkpoint at that historical milestone.
- **`c0e1fb3` — `Add progressive disclosure to relationship time and place mapping`** adds user-triggered **Add a Relationship**, **Add a Date or Time Period**, and **Add a Location** entry controls, deferring display of the full mapping form until requested while keeping source-column suggestions and existing underlying mapping semantics. Initial experimental collapsed-summary versions were rejected because they displaced the Places grid and exposed inferred fields too soon; the corrected parent-level activation preserves the original form layout. Multiple **independent** relationship groups remain deferred; `relationshipParts` still denotes participant parts within a single relationship.
- **`55453a8` — `Support XLSM workbooks and improve file import errors`** accepts `.xlsm` as Excel worksheet data (without executing VBA) alongside CSV, TSV, XLSX, and XLS. User-facing errors distinguish unsupported extension, unreadable workbook, and unusable source rather than mislabeling a failed upload as staged. The historical London stock-price `.xlsm` workbook exposed the omission and was user-tested successfully after the fix.
- **`3bb71be` — `Replace unfinished tutorial entry with coming soon page`** removes the misleading guided-tutorial start action from the public Tutorials destination and describes future tutorials accurately.
- **`fb18799` — `Organize historical design assets and retain portrait reference`** relocates eight planning/reference images from active `assets/` into `planning_documents/` and retains the Maria Maddalena portrait as a source asset.
- **`263cad0` — `Refine homepage styling and add sample dataset artwork`** preserves accepted no-dotted-route Florence/Atlas entrance treatment, aligns the two Home CTA text treatments, and adds the letter, Medici family tree, and Cardinal Carlo portrait to the three sample cards with constrained crop geometry. The Cardinal Carlo crop was refined to reveal more historical dress without enlarging the card.
- **`2217373` — `Unify About workspace editorial styling and refine feedback layout`** applies the shared public editorial language to About and gives Feedback a two-column organization; Creator was later returned to its earlier presentation.
- **`83dd4fa` — `Refine sample selection layout for laptop viewports`**, **`d75fa1e` — `Add staggered Sample Selection entrance animations`**, **`5f4a7f2` — `Refine Cartographic Editorial homepage entrance animations`**, and **`d443585` — `Redesign sample selection and Data entry workspace`** established the current illustrated-card layout and entry experience.

**Deferred after this milestone:** multiple independent relationship mappings per record; unfinished Timeline relationship-line presentation; broader Sample Selection color experimentation; Creator profile-card redesign; remaining mapping-page presentation/Explore-content redesign and substantive guided Tutorials. The responsive sample-card proportions and the earlier Creator layout are the accepted configurations.

[Back to development history](#3-full-development-history)

</details>

<details>
<summary><a id="milestone-detail-15"></a><strong>Shared mapping UI, Home onboarding, and planning references — 2026-10-26 (committed)</strong></summary>

### Shared mapping UI, Home onboarding, and planning references — 2026-10-26 (committed)

- **`27e3cf7` — `Update interface mockups and genealogy retirement audit`** records the approved Florence Home and mapping-interface reference images, sample-selection concept mockup, and `planning_documents/Peridot_Genealogy_Retirement_Audit_20261026_v1.md`. The genealogy-specific workflow remains an **audit/retirement proposal**, not a completed source removal; generalized genealogy data support must be preserved.
- **`f3cf4fb` — `Refine shared mapping workspace layout and contextual guidance`** checkpoints the first broad visual/structural redesign of Relations, Time, and Places: shared icon-pill section navigation, stage mastheads, primary/refinement/lettered question hierarchy, content-sized choices, corrected option-row vertical alignment, source-example and interpretation context panels, Additional Context / Good to know guidance, and accessible `(i)` explanatory popovers. Original mapping handlers, source semantics, identity/cardinality/attribution rules, validation, and import workflow remain unchanged. The screens are **improved but not final**; shared Identity UI and Preview/Sheets/Evidence/Review are subsequent design work.
- **`89aaa50` — `Align mapping workspace palette and improve contrast`** harmonized the mapper with forest green, oxblood, parchment, and ivory; visual/browser contrast improvements were user-reviewed, but no exhaustive WCAG audit is claimed.
- **`60b8643` — `Open file chooser directly from homepage`** connects Home's **Upload your data** action to the existing native file chooser and generalized mapping flow. Canceling the chooser leaves Home intact.
- **`2117659` — `Connect homepage sample button to sample chooser`** opens existing sample selection from Home without activating a dataset implicitly.
- **`7280e30` — `Refine homepage typography and onboarding layout`** establishes the final hero wording/subtitle, two primary Home actions (**Upload your data** and **Explore sample data**), shortened editorial typography spacing, and a compact **New to Peridot?** explanation grouped toward the right of the parchment informational banner. The previous numbered 01/02/03 labels and Home compass rose were removed; the three workspace columns remain informational rather than a mandatory linear sequence.
- **`57f6ef3` — `Document Adobe filigree asset retirement`** and **`07ec80d` — `Retire Adobe filigree assets and decorations`** commit the removal of five Adobe Stock filigree PNGs and their active decorative uses in Data/Manage, tutorial, Inspector, and Explore. Historical records of the original design remain in the Changelog. This retirement is specific to those filigree images, **not** a blanket assertion that all stock-derived paper art or provenance concerns have been resolved.

[Back to development history](#3-full-development-history)

</details>

<details>
<summary><a id="milestone-detail-16"></a><strong>Adobe filigree retirement — 2026-10-25 (historical local stage; committed 2026-10-26)</strong></summary>

### Adobe filigree retirement — 2026-10-25 (historical local stage; committed 2026-10-26)

- The user intentionally deleted `assets/Adobe Stock Filigree 1.png`, `2.png`, `3.png`, `Divider Set.png`, and `Full Set.png`. Git reports these five files as tracked deletions; those deletions were subsequently committed in `07ec80d`.
- The accompanying source cleanup removes active Adobe filigree dependencies and decorations from the Data/Manage entry page, guided tutorial, full Inspector profile, and Explore divider areas. JSX imports and associated image CSS paths are removed. Retain the content sections; do not replace these ornaments automatically.
- This paragraph describes the historical pre-commit handoff; the deletion and associated documentation are now committed (`07ec80d`, `57f6ef3`). Browser/build validation was conducted as part of user-side iterations, but no independent production deployment is asserted.
- Historical entries about earlier filigree design choices remain valid historical records; asset filenames in those entries no longer denote files that should exist in the active working tree.

[Back to development history](#3-full-development-history)

</details>

<details>
<summary><a id="milestone-detail-17"></a><strong>Cartographic Editorial Visualize, homepage, and buttons — 2026-10-15 to 2026-10-25 (historical preceding design)</strong></summary>

### Cartographic Editorial Visualize, homepage, and buttons — 2026-10-15 to 2026-10-25 (historical preceding design)

- **`ad14727` — `Refine Visualize workspace styling and viewport`** and the Visualize styling sequence following the editorial foundations established the accepted compact, single editorial outer frame. The map/network/timeline workspaces preserve their functional geometry and vertical working area. Legend defaults closed; map controls and legend sit nearer the stage edges; the bottom playback surface and normal play button use oxblood, with a darker hover and green playing state. A prior decorative inner SVG border was removed. The asset/style work preserves visualization state and semantics rather than remapping research data.
- **`9e12305` — `Document Visualize component ownership and styling architecture`** recorded component/styling responsibilities as a maintenance reference ahead of the homepage/button passes.
- **`2472c57` — `Consolidate primary and secondary button styling`** committed shared button styling changes across common controls, Data, and playback surfaces. Maintain primary/secondary roles and centralized styling instead of proliferating one-off button variants.
- **`4e6fb11` — `Refine Cartographic Editorial homepage composition`** was the **historical synchronized checkpoint for this milestone**. It contains the accepted current homepage component and stylesheet refinements, two newly added layered corner-collage images in `assets/`, and `planning_documents/Peridot_Sitewide_Button_Inventory_20261017_v1.md`. The original message for this commit was `Consolidate primary and secondary button styling 2` (`c88056d`), subsequently amended by the user to the accurate homepage message; **only `4e6fb11` belongs in the current ancestry**.
- At that historical milestone, Home retained the editorial paper-and-Florence hero, primary Get started action, and a full-width parchment-textured lower banner with three *informational* columns for Manage data, Visualize, and Explore evidence. The large transparent collages at the lower-left and upper-right frame the banner. The final bounded polish adjusted the collage crop, filled the homepage's actual available parent height rather than calculating `100dvh - 72px`, and optically shifted the three-column content right/down without moving its corner artwork. These were CSS/layout changes; no new data semantics were introduced.
- **Current-state correction:** the earlier H2e/H2f mask experiments and the `fd02d84` local-only status remain historical. No assertion of public-repository asset-distribution permission follows from a completed Git push; the existing provenance/licensing notes remain relevant. Subsequent Home/Visualize work should avoid unverified global sizing fixes or broad cascade rewrites.

[Back to development history](#3-full-development-history)

</details>

<details>
<summary><a id="milestone-editorial"></a><strong>Cartographic Editorial foundation, header, and layered Home — 2026-10-14 to 2026-10-15</strong></summary>

### Cartographic Editorial foundation, header, and layered Home — 2026-10-14 to 2026-10-15

- **`2024897` — `Synchronize documentation through navigation redesign`** was the documented clean foundation before the new visual work. This earlier documentation baseline is historical, not the current local HEAD.
- **`ec5152c` — `Establish centralized styling foundations and editorial design plan`** established the structural groundwork for token-led Cartographic Editorial styling.
- **`d108bb2` — `Migrate shared styles to centralized design tokens`**, **`98bcbcb` — `Consolidate shared button form and card styles`**, **`bc4761e` — `Consolidate shared panel and workspace framing styles`**, and **`f667329` — `Establish Home and Data workspace styling ownership`** formed bounded styling ownership passes before substantive visual redesign. They did not change canonical data semantics.
- **`2e20bba` — `Integrate Cartographic Editorial palette and restore UI contrast`** adopted paper/ivory, oxblood, forest green, ink, and restrained sand tones, with subsequent contrast repairs confirmed by screenshots. **`889ebae` — `Document legacy CSS and cascade verification`** preserved the audit of residual competing styles.
- **`243ea6c` — `Establish Cartographic Editorial typography foundations`** put serif typography into the editorial hierarchy; it was accepted provisionally, to be judged again after the larger composition was complete.
- **`fe9634b` — `Redesign global header with editorial typography`** established a compact, ivory editorial header with a large Peridot wordmark, larger serif navigation labels, close active underlines, and hover behavior for the Home wordmark. The previous gemstone image was removed from the header. A minimal line-only gemstone is a *future concept*, not an installed asset or animation.
- **`fd02d84` — `Build Cartographic Editorial Home composition`** committed the locally tested, layered Home: ivory paper reading area, the historical Florence panorama, a stock-paper irregular hero boundary, oxblood CTA, and a **rectangular three-column** Manage / Visualize / Explore orientation banner with decorative paper-edge accents. The three banner arrows were removed because the columns are informational, not active buttons. Image/source and stock provenance notes were staged with the artwork. The accepted hero is **H2e**, not the experimental H2f strong diagonal.
- **Visual design decisions:** The approved design direction is a more expressive cartographic/editorial publication, not a corporate dashboard or a universal parchment treatment for data workspaces. Historical images and licensed stock paper textures support the art-directed public Home; dense analytical workspaces retain readable, performant utility styles. Desktop/full-screen use takes priority over mobile adaptation; exact minimum-supported viewport behavior remains a later implementation decision. Decorative route lines and ornaments were deliberately deferred during the last Home pass.
- **Rejected experiment:** H2f's stronger diagonal hero mask exposed Florence above the wordmark in the top-left and intruded into the text. That treatment was reverted before `fd02d84` was committed. A future asymmetric diagonal is an art-direction problem to revisit with its own mask/crop tests; do not assume H2f is accepted.
- **Asset provenance / distribution gate:** `src/assets/editorial/ASSET_CREDITS.md` and `STOCK_ASSET_NOTES.md` accompany the committed assets. The user supplied Wikimedia Commons source-page references for the Rosselli-attributed *Pianta della Catena* and Grazioso Benincasa portolan, and personally licensed Adobe Stock paper assets. **Do not infer blanket permission to redistribute Adobe Stock derivatives as reusable source assets in a public repository.** Review specific license and repository distribution mode before pushing the local commit. Licensing is unresolved in this handoff, not a determination that the use is forbidden.
- **Untracked, deliberately excluded:** `planning_documents/Peridot_ Florence Atlas Homepage.png` plus `home-cartography-placeholder.svg`, `home-route-decal.svg`, `home-torn-paper-mask.svg`, and `paper-grain.webp` under `src/assets/editorial/`. Preserve until separately triaged; do not run `git add .` or `git clean` by default.
- **Next visual work:** after the publication gate, polish the banner's paper layering and its eventual useful content, then art-direct the remaining public entry/workspace surfaces separately. Preserve the currently accepted hero and the compact header unless a new bounded visual pass explicitly changes them.

[Back to development history](#3-full-development-history)

</details>

<details>
<summary><a id="milestone-detail-19"></a><strong>Persistent navigation, workspace normalization, full-page mapping, ISO dates, and About — 2026-09-28 to 2026-10-14</strong></summary>

### Persistent navigation, workspace normalization, full-page mapping, ISO dates, and About — 2026-09-28 to 2026-10-14

- **`360682f` — `Synchronize documentation through timeline workspace`** closed the previous documentation cycle before the navigation audit began.
- The navigation redesign was informed by comparison with established mapping, visualization, digital-humanities, archive, journal, and portfolio sites. The project adopted a conventional persistent global header rather than continuing the hamburger-first public model.
- **`a1f4d56` — `Add persistent navigation and workspace state`** added the global header and preserved the active dataset plus accepted workspace state while users move among pages. The Peridot logo returns Home. Heavy transition treatment is reserved for expensive changes rather than ordinary page navigation.
- **`1810bf9` — `Simplify visualization workspace navigation`** compressed Visualize navigation, and **`f59402f` — `Flatten visualization workspace framing`** removed oversized title/container framing so the stage receives more vertical space. Map / Network / Timeline / Charts are centered in the local bar; Export remains separate at the right.
- **`e9ddf1f` — `Restructure Explore workspace navigation`** replaced the former numbered five-step navigation with **Browse / Advanced Query / Refine**. Results are contextual to Advanced Query; capability review is contextual to Refine. The Explore page still needs a later content/layout redesign, but this three-mode architecture is the accepted shell.
- **`4a6cd2e` — `Support ISO 8601 temporal values`** extended canonical temporal parsing to common machine-readable timestamps such as `1397-02-21T00:00:00Z`, preserving source text and interpreting the lexical calendar date conservatively.
- Data normalization first exposed a false start that duplicated the data-selection page without fixing the mapper hierarchy. That local design was rejected before commit. The accepted direction was to keep the existing Data landing surface and change the mapping layer itself.
- **`f139f53` — `Move data mapping into full-page workspace`** makes mapping a full Data page under the global header rather than a modal. Subsequent accepted local refinements before the next commit added the mapping-entry transition, directly accessible mapping sections, **Review and Upload**, and the separated Cancel / Back / Next footer composition.
- **`cd625a2` — `Normalize About workspace and feedback`** makes About a scholarly project section with **About Peridot / Creator / AI Disclosure / Open Source / Feedback**, flattens decorative container nesting, scales page titles down to ordinary page-heading proportions, allows page scrolling as needed, and embeds Feedback as a normal About subpage while preserving compatibility modal rendering.
- Deferred after this sequence: a larger mapping-content redesign; a larger Explore-content redesign; substantive Tutorials; Home refinement; header hover/active/logo polish; broader cross-site palette/typography/animation work.
- This documentation pass synchronizes the core documents through clean checkpoint `cd625a2` and strengthens the file-continuity/handoff protocol so already-available current files are reused and replacement-bundle commands must match the delivered ZIP's actual internal structure.

[Back to development history](#3-full-development-history)

</details>

<details>
<summary><a id="milestone-timeline-foundation"></a><strong>Dedicated Timeline visualization workspace, adaptive navigation, categories, and relationship-layout foundation — 2026-09-27 to 2026-09-28</strong></summary>

### Dedicated Timeline visualization workspace, adaptive navigation, categories, and relationship-layout foundation — 2026-09-27 to 2026-09-28

- **`7eddfb0` — `Synchronize documentation through playback performance`** recorded the documentation baseline immediately before the new Timeline visualization project began.
- **`d82406e` — `Add canonical timeline workspace projection`** added `peridotTimelineWorkspaceModel.js` and regression fixtures. The model preserves Search scope, plural temporal assertions, temporal semantics/subject attribution, plural Evidence categories, OR category visibility, and uncertainty metadata without changing the existing playback Timeline.
- **`8188ac0` — `Add horizontal timeline workspace`** introduced the first dedicated event-card Timeline visualization. The default chronology runs earliest → latest left-to-right and uses the same overall visualization/Inspector shell as other views.
- **`d410c3d` — `Add vertical timeline orientation`** added earliest → latest bottom-to-top orientation and corrected viewport/scroll behavior so overflow stays inside the visualization stage.
- **`0d0380a` — `Add evidence-driven timeline categories`** made mapped Evidence fields available as researcher-selected Timeline categories. Events may have several category memberships; filtering is OR-based; category values can be marked by color or shape; the category panel is fixed-size, grouped with Timeline controls, and closes on outside click.
- **`98f3841` — `Refine timeline readability and zoom`** moved the Timeline to a pale reading surface, established a more readable default event scale, and added continuous mouse-wheel zoom plus explicit +/- controls.
- **`d1fd010` — `Optimize timeline rendering performance`** reduced unnecessary Timeline rendering work before the deferred navigation refinements resumed.
- **`90f93d2` — `Refine timeline navigation and temporal axis`** completed click-and-drag panning alongside retained scrollbars, adaptive year/month/day axis granularity, and label-collision suppression. Chronology remains fixed while navigation is continuous rather than limited to arbitrary zoom stops.
- Connection design then moved toward a ClioVis-inspired model while preserving Peridot's data-derived semantics. Relationship projection only uses explicit mapped relationships; same-subject birth/lifespan assertions are not legitimate relationship endpoints merely because they concern the same entity.
- Several local connection-layout iterations exposed two distinct problems: rigid lanes prevented relationship legibility, and duration lines could be mistaken for relationship edges. The accepted correction makes relationship endpoints subject-strict, treats chronology as the fixed axis and the orthogonal axis as a continuous collision/relationship-layout space, and gives intervals a separate duration treatment.
- **`a32ef05` — `Add timeline relationship layout and sample switching fixes`** checkpoints that relationship/layout foundation plus a Data-workspace regression fix. The sample chooser once again starts collapsed and may be reopened after loading one sample so a different sample can replace it.
- Relationship-line **routing and visual legibility are explicitly unfinished** at this checkpoint. The next Timeline pass should improve curved card-to-card connection rendering without loosening the accepted endpoint semantics or reverting the continuous secondary-axis layout.
- This documentation pass synchronizes the core documents to `a32ef05`. The Governance Protocol ownership model remains unchanged; only its stale pre-audit scope caveat is corrected. The restructuring plan is marked implemented and retained as a historical planning record.

[Back to development history](#3-full-development-history)

</details>

<details>
<summary><a id="milestone-detail-21"></a><strong>Sample chooser, Timeline scrubber, and Network interaction/playback performance — 2026-09-27</strong></summary>

### Sample chooser, Timeline scrubber, and Network interaction/playback performance — 2026-09-27

- **`852fd72` — `Synchronize documentation through Network playback generalization`** recorded the clean generalized Network/playback baseline after `ddc0aca`.
- **`239f11f` — `Refine sample data chooser interaction`** established the compact chooser composition and interaction model.
- **`04d8244` — `Add direct sample data actions`** completed direct **Use / Edit / Download / Details** actions for the three first-class samples while preserving their ordinary-file/generalized-mapping architecture.
- **`a92ec9a` — `Restore smooth timeline playback scrubbing`** restored the playback playhead inside the existing Timeline range control. Dragging now uses local preview state and commits canonical playback position on release, avoiding full expensive state churn for every pointer movement.
- **`f34207d` — `Isolate viewport panning from graph rendering`** moved pointer-drag panning to a transient imperative SVG transform and defers the durable React viewport commit until release.
- **`da87f6d` — `Isolate wheel zoom from clustering updates`** applied the same separation to wheel zoom: transient zoom is immediate, durable state settles after interaction, and clustering/label derivation no longer runs for every wheel event.
- Performance diagnostics also identified and corrected a passive-wheel-listener warning and duplicate static basemap React keys. Pure clustering/screen-node/label/edge derivation did not emerge as the dominant measured cost in the tested runs.
- A Geographic graph-preload experiment was tested but produced no meaningful improvement and was excluded from the accepted clean candidate.
- **`c8a7c46` — `Optimize network playback and viewport interaction`** checkpointed the accepted performance sequence. Force playback now reuses a stable full-scope Force graph and filters its rendered provenance and visible node/edge presentation by playback scope instead of rebuilding the semantic graph and rerunning force simulation on each playback frame.
- User testing reported the Force-Directed Network as working well and the application as materially smoother except at the historical **Very Fast** setting. The next playback-speed pass should therefore simplify the choices to **Slow / Medium / Fast** and calibrate them against the optimized runtime.
- Playback animation/tweening remains unfinished. The rejected pre-`ddc0aca` screen-space geometry experiments remain rolled back; future presentation work should start from the stable post-optimization architecture.
- Post-checkpoint Geographic QA remains **uncommitted**. Investigation established that the large cluster initially suspected as a duplicate Roma node was Siena, while a smaller Roma cluster was separate. A temporary atomic co-location clustering fix was therefore not committed. A later local Inspector-semantics experiment correctly distinguished entity-anchor count from distinct represented places and removed sentinel `0` directed endpoints, but wording cleanup remained before any commit.
- This documentation pass synchronizes the four core documents to `c8a7c46`. The Governance Protocol and restructuring plan remain unchanged because documentation ownership/process architecture did not change.

[Back to development history](#3-full-development-history)

</details>

<details>
<summary><a id="milestone-generalized-network"></a><strong>Generalized Network scope, unified Geographic Map, Map settings, and playback highlighting — 2026-09-14 to 2026-09-25</strong></summary>

### Generalized Network scope, unified Geographic Map, Map settings, and playback highlighting — 2026-09-14 to 2026-09-25

- **`9166e3e` — `Synchronize documentation through Search generalization`** established the documentation handoff immediately before the dedicated Network sequence.
- **`9ecb4f8` — `Align geographic network relationship scope`** separated Timeline/playback-visible dated relationship observations from genuinely undated structural relationships so historical structural data can remain while dated relationships outside the active temporal scope disappear.
- **`e0fd1c0` — `Add generalized geographic anchor model`** added generalized entity/place anchor resolution with multiple selected place roles, an independent **Most frequent place** rule, coordinate deduplication, retained occurrence counts, and preserved role/provenance semantics.
- **`19345df` — `Add map settings and compact visualization controls`** introduced compact Map settings, a map-first Visualizations workspace, a compact Timeline/playback bar, map utilities, compact legend, and the reserved **Appearance (Coming soon)** area for later node/cluster/edge tuning.
- The relationship-line design established an explicit hierarchy: use where the relationship/event occurred when defensible; otherwise use the researcher-selected fallback anchor; otherwise draw no geographic line. Multiple explicit source-supported geographic manifestations are allowed, but the map must never manufacture a Cartesian product across several visible anchors.
- **`0afd2dd` — `Unify geographic map projection`** collapsed the old Place Map / Person-or-Entity Map distinction into one **Geographic Map**. The researcher can show/label Places, People / entities, or both over the same geographic evidence. Force-Directed Network remains a distinct non-geographic visualization. The Visualizations header also moved single-destination Mapping, Network, Charts, and Explore actions to direct clicks; Export remains a menu.
- Transactional Map-settings work following `0afd2dd` separated draft from applied settings, made **Reset** draft-only, reduced unnecessary graph recomputation, preserved Geographic and Force viewport state separately, and stopped settings/Timeline/Search/playback updates from intentionally refitting the map.
- Geographic edge/node coherence became a hard invariant: an edge renders only when both exact endpoint node instances are visible under the applied map settings. Changing a relationship-line rule therefore resolves against the exact visible node pair rather than leaving floating or stale lines.
- **`cab2ffc` — `Stabilize geographic map settings and hover semantics`** checkpointed the transactional settings/viewport work plus generalized hover/provenance. Hover no longer universally reports `Weight`; direction is displayed only when mapped, occurrence counts replace correspondence-shaped weight language, and node hover identity remains meaningful even if map labels are hidden.
- **`ddc0aca` — `Generalize network playback highlighting`** replaced legacy playback reconstruction from `sourcePerson`/`targetPerson` or source/target place IDs with provenance-based matching against the actual rendered graph. Multipart records can highlight every explicit rendered relationship, and co-current playback can highlight the complete active relationship set without inventing edges.
- A subsequent local-only playback-animation exploration tested mount-based SVG animation, `requestAnimationFrame` tweening, screen-space geometry interpolation, stable/dormant scene ideas, sage node pulses, dusty-rose cluster pulses, and directed/undirected edge-reveal concepts. Testing exposed severe high-speed jitter, cluster retrigger ambiguity, and map-detachment/snap behavior when geometry was tweened in screen coordinates. The experiments were deliberately rolled back; `ddc0aca` is the accepted pre-animation baseline and contains no experimental tween/geometry animation system.
- User-facing interface observations from this sequence are queued rather than mixed into Network semantics: redesign the open sample chooser so it harmonizes with the dark-green Data workspace; restore a draggable playback playhead/scrubber inside the existing Timeline range clamp; and compress the oversized Visualizations header to return vertical space to the stage.
- Remaining Network plan: **Pass 4 consumer/vocabulary cleanup**, **Pass 5 geometry/presentation correctness**, then **Pass 6 visual tuning / Appearance controls**.
- Prepared the bounded core-documentation synchronization against clean checkpoint `ddc0aca`; the Governance Protocol remains unchanged because documentation ownership/process rules did not change.

[Back to development history](#3-full-development-history)

</details>

<details>
<summary><a id="milestone-search"></a><strong>Generalized Search, scope alignment, and count-condition redesign — 2026-09-07</strong></summary>

### Generalized Search, scope alignment, and count-condition redesign — 2026-09-07

- **`5e3289c` — `Synchronize documentation through subject-aware evidence`** preserved the documentation baseline after canonical subject-aware Evidence reached Inspector.
- **`e697bd2` — `Refine timeline slider interaction`** refined the Timeline scrubber immediately before the Search generalization sequence.
- **`aabc8bb` — `Generalize Search place semantics`** made ordinary Place filtering, suggestions, structured Place criteria, Browse Places, Refine Places, and map-readiness consume generalized mapped place assertions while preserving conservative explicit-route behavior.
- **`2fd0084` — `Generalize Search results presentation`** replaced the route-shaped Search Results ledger with generalized Date / People or entities / Places presentation. Detailed mapped information and legitimate directed-route semantics remain available without forcing every record into Source/Target columns.
- **`f1a6942` — `Generalize Search evidence semantics`** moved Search Evidence inventory, structured Evidence criteria, Browse, Refine, Evidence-rich capability, and Evidence text search onto canonical subject-aware `mapped-evidence:*` assertions. Record- and entity-attributed assertions remain distinct internally, while per-record Browse/Refine counts are deduplicated.
- **`656010d` — `Align Search scope across Inspector and Analytics`** completed the Search/Timeline/Analytics scope audit. Entity/place Inspector dossiers use applied/filtered rather than playback-visible scope; Analytics retains genuinely undated records by default while dated records continue to obey Timeline/playback; its local date controls can explicitly exclude undated records; export provenance now includes structured and capability filters.
- The audit confirmed the scope distinction: Search Results/Refine represent applied/filtered data and remain stable during playback, while visualization graph exports represent the playback-visible graph and chart export represents charted data.
- **`1810a40` — `Replace minimum weight with count conditions`** retired the old global minimum correspondence/connection weight from Search and graph filtering. The useful analytical idea survives as optional count conditions attached to individual structured criteria, using plain language such as **This person has at least N connected entities**, **This place has at least N connected places**, or **People in these records have at least N connected entities**.
- Count-condition reference counts come from the loaded/mapped Search dataset; the primary structured criterion determines which records are returned. Place-to-place connection counts remain conservative and use explicit directed place connections rather than inferred co-occurrence.
- Live QA across Family Tree and correspondence-style data confirmed generalized Place search, neutral Results presentation, canonical Evidence search, stable Inspector scope, Analytics undated-record behavior, and the attached count-condition interaction.
- One bounded Search follow-up remains: **Any record text** does not yet guarantee inclusion of every generalized mapped semantic value; explicit fielded criteria such as Place work correctly.
- The next large project is the generalized Network audit. A later bounded Network presentation pass should tune node/cluster sizing and evaluate a small user-facing scaling controller rather than hard-coding one visual scale.
- Prepared this bounded core-documentation synchronization against clean checkpoint `1810a40`. The Charter now states the exact-raw-source implementation rule explicitly; the Governance Protocol itself remains unchanged.

[Back to development history](#3-full-development-history)

</details>

<details>
<summary><a id="milestone-detail-24"></a><strong>Cardinality, integrated Identity, subject-aware assertions, and Home tutorial placeholder — 2026-08-31</strong></summary>

### Cardinality, integrated Identity, subject-aware assertions, and Home tutorial placeholder — 2026-08-31

- **`951c21e` — `Synchronize documentation for generalized sample datasets`** documented the first-class sample-data milestone before the next data-model sequence began.
- **`1d34b89` — `Generalize cardinality and integrated identity mapping`** established researcher-declared per-field one/many semantics and delimiter handling, integrated recurring-entity Identity into relationship/place mapping rather than requiring a separate Identity page, and added complex alternate identity recipes while keeping simple datasets on the displayed-name default.
- Cardinality explicitly follows the spreadsheet structure rather than code-array assumptions: parallel columns/rows are structural relationships in the table, not lists that Peridot should zip element-by-element. Structured component dates and separate interval endpoints therefore remain scalar structured units.
- Multi-value delimiter entry accepts ordinary literal delimiters plus quoted forms; user-entered values such as `" "`, `' '`, `"/"`, and `'/'` normalize to the intended delimiter while source cells remain preserved.
- Family Tree sample mapping was refined so former-partner IDs can resolve through stable entity IDs when a corresponding labeled entity exists, while source references without a represented/labeled entity remain visibly unresolved rather than receiving invented names.
- The Family Tree sample also maps a child's birthplace as the mother's **Place of childbirth**, preserving separate semantic roles for the same source value. Live QA showed this can reveal historically meaningful court mobility across childbearing years.
- **`d82e669` — `Canonicalize entity display labels`** made the canonical entity registry authoritative for human-readable labels in Network and Inspector. Resolved references use the canonical display label; genuinely unresolved references remain IDs.
- **`4405f40` — `Guard multi-value place coordinate mapping`** closed the principal Cardinality Pass 2 safety hole: a multi-valued place cell cannot reuse one row-level coordinate pair for every split place. Single-valued place mappings retain coordinate support. This pass also recorded the legacy `customInspectorFields` duplicate-label collapse for the later compatibility/retirement audit rather than patching the old path independently.
- **`3f921d0` — `Generalize place and time subject attribution`** replaced mutually exclusive record-or-one-participant attribution with reusable subject selection that can include the record, multiple participants, or both. Mapping fan-out remains atomic downstream, and participant-specific temporal assertions no longer ride indiscriminately on unrelated participations.
- **`8e69bb6` — `Add subject-aware Evidence mapping`** extended the same subject-selection model to Evidence while preserving current broad Search/custom-field compatibility behavior. Cardinality is resolved before subject fan-out.
- **`c7069da` — `Add canonical subject-aware Evidence assertions`** created canonical mapped-Evidence assertions linked to the existing per-record EvidenceSource, preserving one source interpretation while allowing several subject-specific semantic assertions.
- **`ef1c95f` — `Project subject-aware Evidence into Inspector`** made entity Inspector Evidence consume the canonical assertions rather than re-scraping source rows. Record-only Evidence remains record-level, participant Evidence appears only on the selected canonical entity, and visible-record scope filters assertion projection.
- **`b7482cb` — `Add homepage tutorial placeholder`** removed the floating Home tutorial invitation and added a centered secondary **Tutorial** button beneath the two primary data-entry actions. The button is intentionally shorter/less prominent, disabled for now, and shows **“Tutorial coming soon.”** on hover/focus.
- Live QA across Cardinals, Family Tree, and correspondence samples confirmed multi-value Evidence/place behavior, ID/name resolution, place-of-childbirth attribution, both geographic map modes, and subject-aware Inspector presentation through this sequence.
- Prepared this bounded core-documentation synchronization against `b7482cb` before a fresh-chat handoff. The Governance Protocol remains unchanged because its ownership and preservation rules did not change.

[Back to development history](#3-full-development-history)

</details>

<details>
<summary><a id="milestone-inspector"></a><strong>Generalized Inspector/Identity authority, editable mappings, and first-class sample datasets — 2026-08-21</strong></summary>

### Generalized Inspector/Identity authority, editable mappings, and first-class sample datasets — 2026-08-21

- **`959d874` — `Synchronize documentation for identity and inspector groundwork`** preserved the `4076e5b` handoff baseline before the runtime/Inspector migration continued.
- **`287ca50` — `Generalize Inspector semantics and participant attribution`** replaced the old correspondence-shaped Inspector derivation with generalized participant, relationship, temporal, place, and evidence semantics while preserving compact/full presentation, linked-record navigation, and central multi-step Back history.
- Inspector QA against genealogy data exposed and then resolved several attribution failures: later relationship participants no longer disappear merely because they are Part C/D; participant-attached dates/places no longer bleed onto every entity represented by a row; and non-correspondence data no longer has to masquerade as directed Source/Target routes.
- The place-mapping contract now preserves researcher-named semantic roles and participant subjects independently. The same source column can therefore support `place of birth` for a child and `birthed child here` / childbirth location for the mother without treating those as the same assertion.
- **`bc37b08` — `Make mapped identity and place subjects authoritative`** completed runtime authority for mapped entity identity and participant-place subjects. Stable mapped IDs distinguish same-label people such as different historical Anne von Habsburg entries, while repeated appearances of one person remain connected.
- Identity authority supports role-equivalent composite identity components. A correspondence person represented by `Source + Source Title` in some records and `Target + Target Title` in others can resolve as one entity when the researcher maps both pairs to the same conceptual Name + Title identity structure.
- Workbook and Inspector regression work also added/strengthened safeguards for null relationship references, duplicate workbook join IDs, generalized relationship counterparts, place subjects, and mapped-information rendering.
- The Data workspace was simplified around the generalized model: the old Correspondence-versus-Genealogy public profile chooser and the separate experimental universal-mapper surface are no longer part of the ordinary user flow.
- Uploaded mapped data can now be reopened through **Edit mapped data** and recompiled from the original uploaded source after mapping changes.
- **`e944e60` — `Stabilize generalized correspondence mapping`** fixed the correspondence cross-role identity-continuity failure. Visible suggested Identity mappings are now materialized into authoritative mapping state even when the user accepts them without touching the dropdown; explicit clearing remains respected. The 500-record correspondence sample verified one Cristina identity across Source and Target appearances and aggregated Inspector scope instead of one entity per occurrence.
- The same stabilization work addressed the severe visualization-switch behavior encountered after importing the larger Maria Maddalena workbook; subsequent QA could move among force/network and map views without reproducing the prior application-freeze sequence.
- **`8290696` — `Add first-class generalized sample datasets`** made sample data ordinary project files rather than hidden built-in records:
  - `public/sample_data/correspondence_network_sample.xlsx`
  - `public/sample_data/family_tree_sample.csv`
  - `public/sample_data/cardinals_1600_1640_sample.xlsx`
- `src/peridotSampleDatasets.js` now defines sample metadata and preserved generalized mappings. Samples use the same parsing/mapping/runtime path as researcher uploads, may be downloaded as source files, and can be inspected as mapping examples.
- Peridot no longer preloads any sample under a first-time user. A dataset becomes active only after the user explicitly chooses a sample or uploads their own data.
- Sample mappings are editable in the active session with the warning: **“You’re editing Peridot’s interpretation of this sample data. Your changes will affect the active sample, but the original sample mapping is preserved and can be restored at any time.”** **Reset to sample mapping** restores the shipped interpretation without modifying the canonical sample definition or source file.
- The former embedded `src/peridotSampleData.js` module is retired.
- Prepared this bounded core-documentation synchronization against `8290696` after rereading the Governance Protocol, current README, Maintainer’s Guide, Project Workflow Charter, Changelog, and retained restructuring plan; the Governance Protocol itself remains unchanged because its ownership/process model did not change.
- Deferred from this milestone: per-field multi-value/cardinality declarations and delimiter handling; richer record-versus-participant attribution; generalized Network place/event scoping and anchor rules; Search place/facet generalization; Phase 3 Chart Builder; the Search and Timeline × Analytics scope audits; and a later homepage/tutorial redesign that merges the current Home/Data entry strengths and replaces the current tutorial pop-up/launch treatment with a static tutorial button.

[Back to development history](#3-full-development-history)

</details>

<details>
<summary><a id="milestone-detail-26"></a><strong>Temporal retirement, generalized relationship semantics, identity groundwork, and Inspector legibility checkpoint — 2026-08-19</strong></summary>

### Temporal retirement, generalized relationship semantics, identity groundwork, and Inspector legibility checkpoint — 2026-08-19

- **`9fe62a3` — `Synchronize documentation for temporal and timeline updates`** preserved the earlier `2d5e668` temporal/Timeline milestone before downstream temporal consumers were fully migrated.
- **`df9511b` — `Migrate temporal consumers and checkpoint network foundations`** made canonical Temporal Assertions authoritative across Inspector chronology, Analytics/Charts, App-level chronological aggregation, genealogy Timeline readiness, and linked-record sorting while establishing the first generalized entity-network semantic layer.
- **`9cc9d93` — `Retire legacy temporal interpretation paths`** removed `parsedDate` from active source, replaced the duplicate capability parser with canonical temporal interpretation, fixed null/open-bound handling, and removed lexical date sorting. Peridot now has one active temporal interpretation system.
- **`3b3c537` — `Use generalized relationships in search and network capabilities`** and **`ccc2482` — `Complete generalized relationship search helpers`** migrated Search relationship readiness, people/entity facets, relationship facets, structured connected-entity criteria, and summaries to generalized participant relationships.
- **`a24034f` — `Checkpoint generalized geographic network groundwork`** separated structural relationship scope from Timeline-visible event/place scope for geographic People Map derivation. The checkpoint is intentionally incomplete: relationship/event scoping, transparent geographic anchoring, generalized playback highlighting, force viewport fitting, and arrowhead geometry remain deferred.
- The Network audit established that multipart relationships should connect the primary mapped participant to each explicitly mapped counterpart without inventing relationships among all co-occurring participants.
- Network testing also exposed a new requirement for semantically named participant-place associations so the same place can mean different things for different participants (e.g. place of birth versus place of childbirth); that mapping enhancement remains planned after current Inspector/identity work.
- SI1 introduced **`peridotRecordStructure.js`**, **`PeridotRecordStructure.jsx`**, and **`peridotRecordStructureFixtures.js`** as a generalized record/entity-attribution reader. Search/Inspector can now expose mapped temporal assertions, participants, places, semantic relationships, and evidence directly rather than only through correspondence-shaped summaries.
- Live genealogy testing revealed that same-label people can be conflated when the generalized mapping runtime lacks a stable entity-identity rule. Downstream canonical-ID preference alone cannot solve identity if the mapping layer never supplies an ID.
- The project therefore adopted a broader researcher-owned identity model: records and recurring entities may be distinguished by a displayed label, one identifying field, several fields used together, or intentional row-level uniqueness. Multiple recurring entity groups such as People and Places can use independent rules, and equivalent identity components can be mapped across different roles/sheets (for example `Source + Source Title` and `Target + Target Title` as Name + Title).
- **`4076e5b` — `Checkpoint generalized identity mapping groundwork`** preserves the current Identity UI/state plus canonical-ID groundwork in network/Inspector-related paths. The Identity page is accepted as a workable first mapping flow but is not yet authoritative in the generalized runtime.
- Current live QA confirms that the lower generalized mapped-information reader is much closer to the user's mapping than the legacy upper Inspector profile. Remaining failures—such as fathers omitted while mothers appear, place profiles reporting no connected people despite mapped birth places, and genealogy `Unknown` routes—come from old Source/Target profile derivation rather than from the generalized relationship mapping itself.
- Next implementation: move Identity immediately after Relations, then overhaul compact and expanded Inspector profiles from generalized semantics while preserving linked-data navigation and multi-step Back history.
- Prepared a bounded core-documentation synchronization against `4076e5b` for fresh-chat handoff; the Governance Protocol remains unchanged.

[Back to development history](#3-full-development-history)

</details>

<details>
<summary><a id="milestone-detail-27"></a><strong>Generalized runtime authority, Temporal Assertions, and canonical Timeline playback — 2026-08-17</strong></summary>

### Generalized runtime authority, Temporal Assertions, and canonical Timeline playback — 2026-08-17

- **`858ac26` — `Synchronize documentation for Phase 2 mapping redesign`** recorded the earlier generalized-mapper state before the authority migration.
- **`0fa8925` — `Make generalized mappings authoritative for single-table import`** and **`c600295` — `Make generalized mappings authoritative for workbook import`** moved accepted generalized mappings from preserved UI state into authoritative import/runtime semantics.
- **`358202c` — `Generalize workbook join validation`** aligned workbook validation with the generalized mapping model.
- **`6fd19e0` — `Refine network availability for generalized relationships`** made Network capability detection more consistent with generalized relationships while leaving additional Network consumer/layout work deferred.
- **`ba07895` — `Add temporal assertions foundation`** established the canonical temporal model: original source text survives; partial, approximate, open, mixed-precision, unknown, and inconsistent values are represented conservatively; researcher note columns remain separate from machine-derived temporal structure; and multiple temporal assertions can coexist for one subject.
- **`ac95c13` — `Bridge canonical temporal assertions to runtime rows`** carried canonical `temporalAssertions[]` across the legacy compatibility boundary without removing existing legacy date fields.
- **`ce46f08` — `Derive timeline from canonical temporal assertions`** migrated Timeline derivation to assertion-level chronology, including multiple temporal entries per record, interval intersection, role derivation, and legacy fallback.
- **`2d5e668` — `Generalize temporal mapping and timeline playback`** completed the current user-facing temporal milestone: repeatable user-named Date/Period mappings; one-column or Y/M/D representations; six-column start/end component periods; reusable source columns; relationship-participant attachment; temporal note columns; dataset-derived Time types; canonical Timeline readiness/Search diagnostics; and **Cumulative Events** / **Co-current Events** playback.
- Live regression testing used the Maria Maddalena correspondence workbook, a Cardinals workbook with Creation date + Lifespan, and a genealogy/family-tree workbook. These tests confirmed nuanced partial-date handling, multiple simultaneous temporal assertions, source-column reuse, interval participation, role-specific Timeline controls, and co-current disappearance of ended periods.
- Empty Co-current moments now remain valid empty visualization states rather than triggering the visualization-unavailable screen.
- Historical note: this milestone still deferred retirement of `parseHistoricalDate()` / `parsedDate`; that cleanup was completed later at `9cc9d93`. Optional Approximate/Partial/etc. Timeline structure filters remain deferred if they can stay human-readable.
- Deferred Network follow-up remains separate: consume all generalized relationships where needed, fit the Force-Directed Network to the viewport, and terminate arrowheads at node boundaries.

[Back to development history](#3-full-development-history)

</details>

<details>
<summary><a id="milestone-detail-28"></a><strong>Progressive universal upload redesign and Review checkpoint — 2026-08-08</strong></summary>

### Progressive universal upload redesign and Review checkpoint — 2026-08-08

- **`e10c062` — `Synchronize documentation for universal data phase 1`** closed the Phase 1 documentation cycle before Phase 2 implementation began.
- **`7588269` — `Add universal upload workflow prototype`**, **`157574e` — `Add editable universal mapping suggestions`**, **`3153861` — `Make universal sheet purposes operational`**, **`8b52af6` — `Add repeated data orientation mapping`**, **`2d96b1a` — `Add operational related sheet connections`**, and **`3b30367` — `Add reversible universal mapping edits`** built the intentionally complete experimental mapper and reversible mapping state.
- Human testing showed that the experimental shell exposed internal architecture as a logic puzzle. The project changed direction: reuse the existing production role-mapper shell and generalize its human-facing grammar instead of polishing a separate six-step universal UI.
- **`050e3ed` — `Mount universal mapper for interactive testing`** established the production test surface for that redesign.
- **`cc43c9e` — `Improve upload data preview`**, **`14f48cb` — `Add upload table orientation guidance`**, and **`fb400db` — `Fix time examples for row-oriented tables`** established source-faithful Preview behavior plus orientation-aware downstream mapping/examples.
- **`0aa0c21` — `Improve temporal data mapping workflow`** simplified Time to Date, Beginning date, and Ending date with plain-language guidance and source examples.
- **`90a3a3b` — `Generalize place mapping workflow`** replaced point/route user classification with repeatable Place A/B/C mappings, per-place role source, optional coordinates, and workbook parity.
- **`967b293` — `Generalize relationship mapping workflow`** replaced binary Source/Target UI assumptions with repeatable Part A/B/C participants, per-part roles, optional relationship metadata, and workbook parity.
- **`0ae7e03` — `Refine evidence mapping workflow`** retained the successful Include/Ignore Evidence model, added source examples/readability improvements, and prevented structurally mapped fields from being duplicated as Evidence.
- **`134c67c` — `Refine upload review checkpoint`** made Review a summary + validation + correction checkpoint, repeated user assignments, collapsed point/route map readiness into one **Map** status, and stopped missing legacy Source/Target concepts from overriding accepted generalized place/relationship mappings in the Review presentation.
- The remaining warning system still contains legacy correspondence/workbook assumptions. That audit is intentionally deferred until generalized mappings are authoritative in the runtime.
- Prepared this bounded core-documentation synchronization against `134c67c` before moving the authoritative-runtime work to a fresh conversation.

[Back to development history](#3-full-development-history)

</details>

<details>
<summary><a id="milestone-mapping-foundation"></a><strong>Universal mapping/source foundation and runtime compatibility boundary — 2026-08-07</strong></summary>

### Universal mapping/source foundation and runtime compatibility boundary — 2026-08-07

- Completed Phase 1 of the universal data architecture without changing the public upload UI or current chart-builder UI.
- **`a05130f` — `Add universal mapping schema foundation`** added user-owned saved variables, field assignments, sheet-purpose assignments, repeated-heading groups, and table-connection definitions to the canonical dataset vocabulary.
- **`eda0b88` — `Add generalized source sheet model`** added stable source-file, source-table, and source-field descriptors plus workbook/source-manifest helpers without duplicating complete workbook content inside each canonical dataset.
- **`ebcd7d0` — `Add universal transformation helpers`** added deterministic field preservation, repeated-heading conversion, transpose, and non-flattening table-connection operations while retaining provenance.
- **`301a1e1` — `Add universal runtime compatibility boundary`** proved that correspondence remains on the canonical-through-legacy adapter path, genealogy remains on its direct canonical runtime path, and stock-price/Alaskan-airfield/Maria-style universal structures can remain valid canonical-only datasets rather than being forced into a legacy row shape.
- The fixtures deliberately use varied real research-data shapes as architecture tests rather than encoding stock prices, Alaska, or Maria Maddalena as special-case domain logic.
- Phase 2 is reserved for the progressive human-readable universal upload/mapping workflow; Phase 3 is reserved for the direct-variable and structured scholarly-sentence chart builder.
- Prepared this bounded Phase 1 core-documentation synchronization against `301a1e1`; no source behavior, upload UI, chart behavior, CSS, or runtime wiring is changed by the documentation pass.
- Recorded the Peridot delivery convention requested during Phase 1: coding and documentation replacements should default to one uniquely versioned ZIP bundle with transparent PowerShell extract/copy commands.

[Back to development history](#3-full-development-history)

</details>

<details>
<summary><a id="milestone-canonical"></a><strong>Canonical normalization, correspondence parity, and active genealogy imports — 2026-07-24</strong></summary>

### Canonical normalization, correspondence parity, and active genealogy imports — 2026-07-24

- Implemented the canonical normalized research model planned after `619bab0`, including serializable entities, places, records, events, relationships, participations, evidence sources, assertions, temporal assertions, provenance, validation, and deterministic canonical IDs.
- Added the correspondence normalization profile and legacy compatibility adapter, then used shadow comparison to verify parity before switching correspondence imports to the canonical source while retaining the established runtime arrays for current consumers.
- The repository log confirms the canonical-model foundation sequence as **`3aaee49` — `Add normalized data model foundations`** followed by **`d612c3e` — `Add normalized data model foundations`**, then **`1e17596` — `Add correspondence normalization profile`**, **`6c04e84` — `Add normalized model compatibility adapter`**, **`53c1116` — `Add normalization shadow comparison`**, and **`ba844cc` — `Switch imports to canonical normalization source`**. The two foundation commits are preserved separately because Git records them as distinct commits with the same message; this documentation does not collapse or reinterpret them.
- **`402336f` — `Add genealogy normalization profile`** added person-centered canonical normalization for people, life events, parent/partner relationships, places, attributes, evidence, and provenance without converting life-event locations into false movement routes.
- **`94b9d46` — `Add dataset profile selection and routing`**, **`1e661da` — `Add genealogy mapping schema and validation`**, **`2ef36a6` — `Add genealogy mapping workflow`**, and **`8f19997` — `Activate canonical genealogy imports`** moved genealogy from schema/profile groundwork to an active import path.
- Correspondence and Genealogy are now active profiles over the canonical architecture. They remain valuable specialized presets/normalizers and should not be removed merely because broader universal mapping is under development.

[Back to development history](#3-full-development-history)

</details>

<details>
<summary><a id="milestone-detail-31"></a><strong>First-time tutorial framework, flow redesign, and stable attention baseline — 2026-07-14</strong></summary>

### First-time tutorial framework, flow redesign, and stable attention baseline — 2026-07-14

- Implemented a complete first-time tutorial system with a multi-step state machine, draggable panels, minimize/restore docking, step progression, recovery logic, keyboard-accessibility improvements, target anchoring/highlighting, and a Home-page tutorial entry.
- Removed the former standalone Start page. The accepted tutorial now begins immediately in Visualizations and proceeds through seven major stages: Visualizations, Timeline, Inspector, Explore, Browse / Apply, Working Set, and Export.
- Redesigned tutorial dialogue around a large centered title, one concise sentence per frame, footer-based Back/progress/Continue controls, and the Adobe Stock Filigree 3 divider.
- Redesigned the Home tutorial card to align with the workspace-card visual system and removed obsolete title/progress border rules at their source rather than masking them with overrides.
- Added interaction guidance across the full tutorial path, including explicit instruction to close the Inspector before continuing.
- Stabilized target highlighting and observer behavior. **`619bab0` — `Restore stable tutorial attention behavior`** is the accepted baseline for later polish.
- Preserved the exact implementation sequence in the full history: `84fe3cc`, `da0a472`, `ed6466f`, `48f680a`, `67fc073`, `783acc1`, `a52b9ca`, `16cf7cc`, `8241f3a`, `297430f`, `d3c3c24`, and `619bab0`.
- Prepared this bounded core-documentation synchronization against `619bab0`; no source-code, tutorial redesign, or animation experimentation is included in the documentation pass.

[Back to development history](#3-full-development-history)

</details>

<details>
<summary><a id="milestone-governance"></a><strong>Documentation governance, screenshot history, feedback, and stylesheet-import restoration — 2026-06-21</strong></summary>

### Documentation governance, screenshot history, feedback, and stylesheet-import restoration — 2026-06-21

- Added a standing Core Documentation Governance Protocol and then moved it to `core_documentation/` so it is reviewed with the four core documents before every documentation pass.
- Added a Core Documentation Restructuring Plan that maps current sections into their proper long-term document owners and protects historical/technical material during reorganization.
- Refreshed the README screenshot gallery with dated `2026-06-21` current-interface images in `planning_documents/images/`, while retaining and clearly labeling older rail/side-panel-first images as historical records.
- Added the persistent feedback form, including optional-email handling, compact modal behavior, Formspree submission, and a layering repair so feedback covers Visualizations controls.
- Restored missing extracted CSS imports in `main.jsx`, including the feedback-form stylesheet, preserving the established shared → Inspector → Analytics → Search → Mapping → Learn More → Feedback cascade.
- Removed obsolete local `index.css` backup snapshots as a housekeeping cleanup; Git remains the authoritative recovery history.

[Back to development history](#3-full-development-history)

</details>

<details>
<summary><a id="milestone-detail-33"></a><strong>Component stylesheet extraction sequence — historical structural milestone</strong></summary>

### Component stylesheet extraction sequence — historical structural milestone

#### Historical stylesheet architecture milestone

Historical checkpoint at the time of extraction:

- **`639e30f` — `Extract Inspector stylesheet`** on branch **`main`**

The completed structural sequence moved component-owned stylesheet layers out of `src/index.css` while preserving the established stylesheet cascade in `src/main.jsx`:

- **`264e8d9` — `Remove obsolete Data workspace stylesheet rules`**
- **`7b9ddf3` — `Extract column mapping modal stylesheet`**
- **`5c0532d` — `Remove residual Learn More global stylesheet rules`**
- **`407becc` — `Remove obsolete column mapping stylesheet rules`**
- **`19acc89` — `Extract Search workspace stylesheet`**
- **`f7e885c` — `Extract Analytics stylesheet`**
- **`639e30f` — `Extract Inspector stylesheet`**

At that historical checkpoint, the component stylesheet order was:

```jsx
import './index.css';
import './InspectorPanel.css';
import './AnalyticsPanel.css';
import './PeridotSearchWorkspace.css';
import './PeridotColumnMappingModal.css';
import './PeridotLearnMoreWorkspace.css';
```

`index.css` was retained as the shared/global layer at that checkpoint. Search, Analytics, Inspector, Mapping, and Learn More owned their component-specific presentation rules. The Search extraction includes the ordered scroll and folio-corner containment cascade; Analytics includes builder/dropdown and reduced-motion behavior; Inspector includes compact/full/Explore dossier presentation; Mapping and Learn More retain their previously extracted visual layers.

The next substantive behavior work is intentionally deferred into two separate audits: Search dataset coverage/scope and timeline playback × Analytics scope. These must not be conflated with stylesheet cleanup.

The detailed records below preserve the earlier `0c5a219` and related checkpoint narratives as historical milestones; they are not active baseline statements.

[Back to development history](#3-full-development-history)

</details>

<a id="milestone-charts-foundations"></a>

### Detailed historical milestone narratives

The following milestone narratives are retained as historical records. They remain useful for regression diagnosis, decision reconstruction, and project-development history. They are not competing current-baseline statements.

<details>
<summary><a id="historical-milestone-01"></a><strong>Learn More project-information hub, divider choreography, and Explore folio-containment milestone</strong></summary>

#### Learn More project-information hub, divider choreography, and Explore folio-containment milestone

- Recorded the then-current checkpoint as **`0c5a219` — `Add Learn More section dividers`**.
- Replaced the earlier Learn More placeholder composition with a public project-information hub that gives project context without making the minimal Home workspace carry long onboarding material.
- Added public creator assets and a compact creator biography with a **Read full bio** expansion path plus a CV entry point.
- Designed the expanded biography as an editorial reading flow: the portrait appears inside the longer biography, prose wraps beside it at the opening, and later paragraphs continue beneath it.
- Added a compact open-source/GitHub resource panel with direct repository, README, Maintainer’s Guide, Project Workflow Charter, and Changelog links.
- Added an AI-disclosure section with two independently expandable companion papers, preserving the distinction between the creator’s account of the project and ChatGPT’s account of its role.
- Added a Tutorials surface for forthcoming research-workflow material.
- Warmed the large Learn More parchment/reading surfaces while retaining legible dark ink and the existing dark-green/cream hierarchy.
- Added Inspector/Explore-style gold filigree dividers between the header, creator/GitHub row, AI disclosure, and Tutorials sections; dividers use dedicated dark-green breathing room rather than consuming card interior space.
- Staged Learn More entrance choreography as a vertical reading sequence: each divider resolves before its following section, while the creator and GitHub cards enter together as a shared row.
- Preserved the responsive creator/GitHub reallocation model: expanding the biography increases creator reading space while the GitHub resource card contracts but remains usable.
- Restored the rounded Explore folio clipping boundary after a late scroll-restoration rule allowed dark inner layers to project through square corners; Explore scrolling remains on the workspace rather than the rounded folio shell.
- Historical code sequence: **`9fbd200`**, **`81f6311`**, **`7a115f7`**, **`2307d5a`**, **`39983e3`**, **`59f7d69`**, **`98cccf5`**, **`795f0f7`**, and **`0c5a219`**.

[Back to development history](#3-full-development-history)

</details>

<details>
<summary><a id="historical-milestone-02"></a><strong>Search/Explore compact-ledger, Inspector overlay, and animation milestone</strong></summary>

#### Search/Explore compact-ledger, Inspector overlay, and animation milestone

- Recorded the then-current checkpoint as **`e5f832c` — `Animate Explore workspace transitions`**.
- Completed the Search/Explore Workspace redesign around a compact folio interface for **Build Search**, **Browse**, **Results**, **Refine / Inspect**, and **Capabilities**.
- Refined Build Search so the default page fits in one viewport, removed redundant empty Structured Criteria helper copy, simplified the Structured Criteria card wording, and preserved normal scrolling when users add criteria or otherwise expand the page.
- Converted Browse into compact index ledgers with panel-scoped search fields for people/entities, places/locations, and route pairs; the Routes panel appears only when the active dataset has meaningful source-target route data.
- Made Browse route-aware for point-only datasets so point/site uploads show entity and location indexes without self-route artifacts.
- Reworked Results into a compact ledger/table model with route-aware columns, point-dataset columns, Inspector-style pagination, 10/25/50 page-size controls, row-density tuning, and descender-safe text rendering.
- Reworked Refine / Inspect into a route-aware facet dashboard with compact default panels, fuller collapsed chip counts, Show all / Show less expansion, row-height expansion that moves lower panels down cleanly, and no route-only facets for point datasets.
- Tightened Capabilities spacing so its default review page fits the workspace better, and corrected the dark-background **Review note** text to use cream/light text.
- Changed Explore Inspector handoff so clicking **Inspect** from Explore opens the full Inspector as an overlay above the current Explore page instead of navigating away from the researcher’s active search context.
- Added gentle Explore entrance and tab-transition choreography: folio/header reveal, left-to-right step-button sequencing, slower content dissolve/rise, animated Refine panels, Results row “page-turn” filing, Browse index-row filing, and reduced-motion fallbacks.
- Restored Explore scrolling after animation-layer testing so expanded Refine panels, Results pages, Browse lists, and criteria-heavy Build views can scroll normally.

[Back to development history](#3-full-development-history)

</details>

<details>
<summary><a id="historical-milestone-03"></a><strong>Data mapping redesign, workbook controls, upload animation, menu, and Learn More polish milestone</strong></summary>

#### Data mapping redesign, workbook controls, upload animation, menu, and Learn More polish milestone

- Recorded the then-current checkpoint as **`d04eaf6` — `Hide theme menu entry and animate learn more cards`**.
- Redesigned the column/workbook mapping modal into a more compact Peridot folio workflow: shorter header chrome, compact step rail, Preview/Sheets/Time/Places/Relations/Evidence/Review sequencing, cream working cards, clearer right-side guidance panels, and consistent gold divider ornaments.
- Refined Preview so uploaded tables show a compact file-preview strip and an 11-row horizontally scrollable preview table without the older large statistic cards.
- Reworked Time, Places, Relations, and Review mapping pages so users see role-oriented controls rather than large explanatory stacks, with workbook and single-sheet paths kept visually aligned.
- Rebuilt the workbook **Sheets** step as a two-column workbook-assembly page with primary record sheet, primary unique-ID column, joined-sheet setup, guidance copy, and a compact likely-primary-sheet note.
- Replaced stacked workbook sheet/column selectors on Time, Places, and Relations with combined sheet-column field selectors while preserving the internal `{ sheetName, columnName }` workbook mapping model.
- Kept workbook Evidence grouped by sheet, but simplified default field labels so the sheet name is no longer duplicated inside each evidence display label.
- Refined Review warnings so capability reassurance appears once, coordinate warnings are consolidated, and all warning cards share the same neutral warning styling.
- Added staged upload-mapping entrance animation for the mapping modal, including slow modal/header/step/body/footer reveal and left-to-right step sequencing.
- Simplified step-to-step upload navigation after testing carousel variants; the accepted behavior is an opacity-only step transition that avoids bright cream flashes, lateral jolts, scale changes, blur, or upward drift.
- Removed **Themes and Accessibility** from the visible hamburger menu while retaining the internal Theme workspace mode, component, and routing path for future restoration.
- Added matching entrance animation to the two **Learn More about Peridot** placeholder cards by reusing the existing Data workspace float-in classes.

[Back to development history](#3-full-development-history)

</details>

<details>
<summary><a id="historical-milestone-04"></a><strong>Inspector reference-entry layout, mounted overlay, Unknown-as-place, and record-table capability milestone</strong></summary>

#### Inspector reference-entry layout, mounted overlay, Unknown-as-place, and record-table capability milestone

- Recorded the then-current checkpoint as **`74db963` — `Refine Inspector reference layout and record tables`**.
- Kept the Visualizations workspace mounted behind the full Inspector overlay so opening/closing the full Inspector no longer reloads or replays the underlying map/network/chart workspace.
- Suppressed Visualizations header/timeline hide-show buttons while the full Inspector overlay is open so those controls do not layer above the Inspector.
- Fixed Inspector related-person navigation from geographic/place contexts by preserving the people-graph fallback through selection resolution; related person and related place navigation now share the same full-workspace Inspector pathway and Back history.
- Reworked the full person/place Inspector from a dashboard-card model into a scholarly reference-entry layout with a lead summary, optional image/placeholder, prose description, compact summary facts, connected places, connected people, directed connections, selected fields, and connected records.
- Refined the compact side Inspector so it remains an at-a-glance summary while using the same Peridot dark-green/cream/gold reference visual language as the full Inspector.
- Added expandable connected people/place/connection lists so high-volume entities such as Firenze/Fiorenza and von Habsburg, Maria Magdalena do not silently truncate at an arbitrary count.
- Treated **Unknown** as a first-class place-like bucket, parallel to person/entity values such as **Illegible**, so unresolved or missing place values are preserved, counted, and navigable where the record metadata can support an Inspector view.
- Updated connected-record tables to support sorting, per-column filtering, 10/25/50 page-size controls, first/previous/numbered/next/end pagination, and date-first chronological defaults.
- Made connected-record table columns capability-aware: relational source-target datasets show source entity, target entity, source location, and target location columns, while point-only datasets show the simpler entity/location form.
- Shifted Inspector wording from correspondence-only language toward generic humanistic-data language: related records / connected records, person/entity, connected places, connected people, and directed connections.
- Updated Inspector filigree assets and divider styling so the full and compact Inspector can use thin unobtrusive gold ornaments without relying on heavy glow/diamond fallback effects.

[Back to development history](#3-full-development-history)

</details>

<details>
<summary><a id="historical-milestone-05"></a><strong>Workspace animation, chart-builder polish, force-network focus, and Inspector styling milestone</strong></summary>

#### Workspace animation, chart-builder polish, force-network focus, and Inspector styling milestone

- Recorded the then-current checkpoint as **`bd9b807` — `Refine inspector workspace styling`**.
- Added staged entrance choreography for Home, Manage Your Data, Visualizations, Timeline controls, and Chart Visualizations.
- Added visualization-stage transitions that fade the outgoing view into a solid dark-green field and fade directly into the next visualization without a loading label or intentional hold.
- Added left-to-right timeline element sequencing after the timeline bar itself floats into place.
- Redesigned Chart Visualizations as a more cohesive builder surface: muted dark-green side panel, four clearer builder tabs now labeled **Chart type**, **X/Y variables**, **Visible categories**, and **Presentation**, high-contrast inactive/hover/active tab states, one-time guided reveal, and chart fade-in after the builder context appears.
- Applied a consistent Peridot gold treatment to chart-builder cream-card interactables, including buttons, dropdowns, steppers, text inputs, reset buttons, and category controls, while preserving side-panel scroll and dropdown layering.
- Centered the Force-Directed Network initial viewport on the densest network cluster / strongest nearby focal area rather than presenting the whole graph evenly.
- Updated the Inspector full workspace and compact side panel to share the chart-builder visual language: muted dark-green shell, cream information cards, gold primary commands, muted-green related-object navigation, and more restrained passive metadata treatment.
- Suppressed visualization header/timeline hide-show toggles when the full Inspector workspace is open, while preserving those controls in ordinary Visualizations mode.
- Recorded an open Inspector behavior issue for a fresh diagnostic pass: related-person navigation from some Inspector contexts opens the blank state; related-place navigation is working. The failed attempted fix touched `interactionHelpers.js` and `InspectorClusterView.jsx` and was rolled back with a clean tree.

[Back to development history](#3-full-development-history)

</details>

<details>
<summary><a id="historical-milestone-06"></a><strong>Home title-card, map export options, branding assets, and capability wording milestone</strong></summary>

#### Home title-card, map export options, branding assets, and capability wording milestone

- Recorded the then-current checkpoint as **`68f99da` — `add some homepage assets`**.
- Renamed the local source-of-truth folder in documentation to `C:\Users\haley\OneDrive\Desktop\Peridot\`.
- Updated the repository URL in documentation to `https://github.com/haleyrp1803/peridot-humanistic-data`.
- Redesigned the Home workspace as an informative-minimalist fixed-ratio title-card composition.
- Home now centers the app identity around the gilded transparent Peridot logo, a single concise sentence, and two CTAs: **Use sample data** and **Upload your data**.
- Moved detailed onboarding expectations out of Home and into the future **Learn More about Peridot** direction.
- Added and documented the homepage layout contract: the logo is the largest object, the sentence is second-level text, button labels are smallest, and the filigree frames the content without overlapping it.
- Added the selected licensed Adobe Stock filigree to the Home workspace as decorative framing.
- Tracked the larger licensed Adobe Stock filigree set as a future design-reference asset.
- Added homepage mockup and annotated mockup references so future homepage changes preserve the intended proportional layout.
- Added the current homepage screenshot reference for documentation.
- Added gilded Peridot logo variants and palette/design reference assets to `assets/`.
- Preserved `assets/Peridot Logo Workspace.psd` as an ignored local design source rather than a committed runtime/documentation asset.
- Finalized map PNG export options: default output is map-only, with no Peridot branding or extra text.
- Added optional map export title placement above the map image and optional metadata placement below the map image.
- Improved map export annotation readability with larger Peridot typography and tighter whitespace.
- Clarified Data/Advanced Search/Visualizations capability wording: internal capability diagnostics were removed from user-facing review; point and route map readiness language was combined/clarified where appropriate; unavailable visualization language now says the visualization is **not available** for the dataset rather than **limited**.
- Confirmed point/site datasets such as Alaskan Airfields do not incorrectly advertise relational route/network readiness when no source-target relationships are mapped.

[Back to development history](#3-full-development-history)

</details>

<details>
<summary><a id="historical-milestone-07"></a><strong>Peridot logo and home-workspace branding milestone</strong></summary>

#### Peridot logo and home-workspace branding milestone

- Added the user-designed Peridot logo assets to `assets/` as `Peridot Logo.png` and `Peridot Logo Transparent.png`.
- Integrated the transparent-background logo into the Home workspace hero while preserving an accessible hidden `h1` for the app name.
- Documented the logo asset locations in README, Maintainer Guide, and Workflow Charter so future branding passes keep the app and documentation synchronized.

[Back to development history](#3-full-development-history)

</details>

<details>
<summary><a id="historical-milestone-08"></a><strong>Theme, visualization chrome, map palette, and Analytics chart layout/theme milestone</strong></summary>

#### Theme, visualization chrome, map palette, and Analytics chart layout/theme milestone

- Routed Inspector and related evidence surfaces through semantic theme roles so color changes are controlled from the central theme system rather than scattered component constants.
- Preserved the Peridot ornamental folio language while tightening visualization chrome, including header tabs, edge handles, map utility buttons, collapse/expand affordances, and chart control surfaces.
- Reworked the Visualizations header and Timeline collapse/expand controls as ornamental, high-layer edge controls so the buttons remain in front of map/chart surfaces and communicate direction without relying on text-heavy labels.
- Added dropdown/portal layering safeguards for chart and workspace menus so expanded menus do not fall behind visualization layers.
- Added a light navy sea map treatment, dark map frame, muted green land treatment, active-land olive emphasis, and label-density/collision polish.
- Added a finite 30-color Analytics chart series library sourced from the approved green, gold, blue, and pink palettes, with greens/golds dominant and blues/pinks used as supporting contrast. This remains the default chart palette rather than a hard lock.
- Documented the color/theming audit trail in `planning_documents`, including color centralization, theme palette, built-in palette, classic itch palette, theme-control, map-assignment, upload-guide, dropdown-portal, and ornamental-toggle audits.
- Refined the Chart Visualizations control rail, dropdown hover treatment, series contrast, and chart workspace surface colors.
- Defaulted Analytics ordered date charts to **Year**, with **Full date** available as an explicit higher-granularity option.
- Hardened chart derivation logic for record counts, part-to-whole charts, grouped bars, stacked bars, multi-line charts, histograms, heatmaps, and year/full-date handling.
- Fixed grouped bar and multi-line count buckets so grouped yearly values use real counts rather than presence/absence.
- Added manual category/series selection across chart types, with compatible settings preserved as users switch between charts.
- Added persistent chart summary panels for ranked values, segment totals, line totals, trend summaries, bin ranges, matrix combinations, slices/shares, and sunburst parent totals.
- Added stronger major and minor axis ticks/gridlines for axis-based charts and kept chart PNG export using the rendered SVG panel/axis system.
- Rebuilt the Analytics builder as a tabbed control surface with **Chart**, **Fields**, **Categories**, and **Present** tabs.
- Resized the builder/chart composition so controls occupy roughly one-quarter of the workspace and the chart area occupies roughly three-quarters.
- Added custom presentation-title support and kept generated chart titles available as the default reference.
- Improved bar labels, metric choices, and chart-method labeling so chart cards communicate axis/measure/hierarchy semantics without relying only on hover.
- Reworked chart-card geometry around a shared renderer layout: left three-fourths for chart marks, right fourth for complete simplified legend/summary rows.
- Removed folded “x more” legend behavior so legends represent every displayed item, then simplified each row to label/value to avoid metadata clutter.
- Tightened chart-card padding and anchored title/subtitle placement near the top of the card while preserving chart/legend scale.
- Restored Bar Chart default orientation to **Vertical**, while keeping horizontal orientation available.
- Scoped chart-targeted palette imports so **Charts** changes update `analytics.series` without recoloring app chrome.
- Routed remaining bar, histogram, and heatmap marks through the active chart series palette so every chart type responds to explicit chart-palette imports.
- Then-current Analytics/theme baseline: **`e50ebf6` — `Scope chart palette imports to chart series`**.

[Back to development history](#3-full-development-history)

</details>

<details>
<summary><a id="historical-milestone-09"></a><strong>Advanced Search / Explore consolidation milestone</strong></summary>

#### Advanced Search / Explore consolidation milestone

- Routed **Explore Your Data** directly to Advanced Search from both the hamburger menu and the Visualizations header.
- Moved the former "what this data can do" capability summary into a dedicated **Capabilities** tab inside Advanced Search.
- Reworked Search into a tabbed research workflow: **Build Search**, **Browse**, **Results**, **Refine / Inspect**, and **Capabilities**.
- Added result cards with compact record summaries, match explanations, capability badges, and full Inspector handoff.
- Added result facets with counts so users can refine current results by people/entities, places, routes, years, capabilities, and evidence fields.
- Added global capability filters for Inspector/map/route/network/timeline/evidence readiness and missing date/coordinate conditions.
- Added dataset-wide Browse indexes for People / Entities, Places, Routes, and Evidence Fields; Browse items fill draft search criteria and preserve the explicit Apply Filters workflow.
- Added structured criteria rows with predictive suggestions and an increased five-row cap.
- Added Boolean structured-search logic with user-facing connectors: first criterion starts the group, later criteria use **AND**, **OR**, or **EXCLUDING**.
- Preserved the core draft/apply model: typing, suggestions, Browse selections, facet selections, and structured criteria edits change draft state only until **Apply Filters** is pressed.
- Then-current Advanced Search baseline: **`d52392a` — `Add capabilities tab to advanced search`**.

[Back to development history](#3-full-development-history)

</details>

<details>
<summary><a id="historical-milestone-10"></a><strong>Structural cleanup, commenting, and scope-contract milestone</strong></summary>

#### Structural cleanup, commenting, and scope-contract milestone

- Added developer-orientation comments across the source tree so a new human developer can understand major sections, cross-file responsibilities, fragile compatibility paths, and non-obvious state coupling.
- Added `planning_documents/PERIDOT_CODE_STRUCTURE_AUDIT.md` as the standing structural audit and cleanup roadmap.
- Extracted embedded sample data from `App.jsx` into `src/peridotSampleData.js`.
- Reduced `src/LeftControlPanel.jsx` to the compact Inspector side-panel shell, removing obsolete rail/workflow content while preserving visualization-click Inspector behavior.
- Extracted column-mapping modal static UI configuration into `src/peridotColumnMappingUiConfig.js`.
- Extracted repeated column-mapping field controls into `src/PeridotMappingFieldControls.jsx`.
- Extracted evidence/analysis Include/Ignore controls into `src/PeridotEvidenceFieldControls.jsx`.
- Documented the Analytics chart-extension contract across config, derivation, rendering, panel, and visualization-header files.
- Removed dormant MapLibre preview files and dependency from active `main`.
- Documented the loaded/filter/timeline/playback/export scope pipeline and clamped chart-local date ranges so chart animation does not get stuck on stale time selections.
- Then-current structural-cleanup baseline: **`fcd2e1f` — `Document timeline scope and clamp chart date range`**.

[Back to development history](#3-full-development-history)

</details>

<details>
<summary><a id="historical-milestone-11"></a><strong>Visualization workspace compression, menu simplification, timeline, and export consolidation milestone</strong></summary>

#### Visualization workspace compression, menu simplification, timeline, and export consolidation milestone

- Redesigned Chart Visualizations from a compact chart-picker panel into a large chart workspace with controls on the left and a full-size chart canvas on the right.
- Removed the redundant chart-workspace header and scaled chart rendering so charts fit the available workspace without internal scrolling.
- Added a collapsible Visualizations header and a collapsible bottom Timeline bar, both starting expanded.
- Implemented the Timeline as a compact bottom scrubber inside Visualizations with dual range handles, playback controls, reset/all-dates controls, and playback position controls.
- Changed map legend and controls to start minimized as bottom-corner buttons that can be opened and minimized in place.
- Simplified the hamburger menu to **Manage Your Data**, **Visualize Your Data**, **Explore Your Data**, **Learn More about Peridot**, and, at that stage, **Themes and Accessibility** before the later user-facing menu hide.
- Added `src/PeridotExploreWorkspace.jsx` for combined capability summary, Search access, and Inspector-adjacent evidence review.
- Added `src/PeridotLearnMoreWorkspace.jsx` as a placeholder for future project information, credits, tutorials, and help content.
- Reframed Theme as **Themes and Accessibility**.
- Moved map/network export actions into the Visualizations header Export menu.
- Moved chart PNG export out of the chart controls rail and into the same Visualizations header Export menu.
- Removed the obsolete standalone Export workspace route and deleted `src/PeridotExportWorkspace.jsx` from the active source tree.
- Then-current visualization-workspace/export baseline: **`fcd2e1f` — `Document timeline scope and clamp chart date range`**.

[Back to development history](#3-full-development-history)

</details>

<details>
<summary><a id="historical-milestone-12"></a><strong>Visualization capability and flexible Analytics milestone</strong></summary>

#### Visualization capability and flexible Analytics milestone

- Added capability-aware Visualizations workspace menus for Mapping Visualizations, Network Visualizations, Chart Visualizations, and Explore Your Data.
- Added readable availability labels, forgiving hover behavior, and unavailable-state explanations when a dataset cannot support a selected map, network, or chart view.
- Changed Chart Visualizations so the dropdown lists chart types directly rather than a broad Analytics entry.
- Generalized Analytics chart controls around user-selected x-axis/category fields, y-axis/metric fields, aggregation, grouping/series fields, heatmap rows/columns, histogram distributions, and selected wide numeric series.
- Made **Record count** an explicit metric for aggregate chart types, including histogram and sunburst.
- Cleaned chart language so generic record/metric charts no longer imply that all values are letters.
- Then-current flexible-Analytics baseline: **`ab7affa` — `Clean up flexible Analytics chart controls`**.

[Back to development history](#3-full-development-history)

</details>

<details>
<summary><a id="historical-milestone-13"></a><strong>Generic chart/evidence record and mapping-field inclusion milestone</strong></summary>

#### Generic chart/evidence record and mapping-field inclusion milestone

- Generalized user-facing app language beyond correspondence-only wording while preserving compatibility terms and legacy internal names where still required.
- Added generic chart/evidence row admission so chart-first and evidence-first datasets can enter the active dataset without map or network roles.
- Kept map and network availability capability-based: generic chart records can be chart-ready and export-ready while remaining unmappable and non-network-ready.
- Replaced the Evidence and analysis include/ignore dropdown control with explicit **Include** and **Ignore** checkboxes per field, defaulting to Include.
- Then-current generic-record and evidence-field UI baseline: **`08b628b` — `Use include and ignore checkboxes for evidence fields`**.

[Back to development history](#3-full-development-history)

</details>

<details>
<summary><a id="historical-milestone-14"></a><strong>Data capability and role-based mapping milestone</strong></summary>

#### Data capability and role-based mapping milestone

- Added `planning_documents/PERIDOT_DATA_CAPABILITY_MODEL_PLAN.md` to define Peridot's broader humanistic-data capability model.
- Added `src/peridotDataCapabilityAudit.js` as a pure helper for field-role inference and dataset capability reporting.
- Moved the data capability audit to the mapping-review decision point instead of leaving it as a post-cancel Data workspace status card.
- Reorganized the mapping modal away from **Map Peridot variables** and **Choose Inspector fields** toward role-based stages: **Identify records**, **Time**, **Places**, **Relationships**, **Evidence and analysis**, and **Review capabilities**.
- Added explicit temporal mapping roles for single date, date start, date end, and display date.
- Added point-location mapping roles for datasets with one location per record.
- Added combined coordinate-pair mapping roles for point records and source/target route records, using latitude-first pairs.
- Preserved existing correspondence route/network behavior while allowing non-network point/site datasets to import and render in Place Map.
- Confirmed that point/site datasets without source-target relationships correctly do not populate People Network or Force-Directed views.
- Then-current data-capability baseline: **`e7c3b57` — `Add point-location role mapping`**.

[Back to development history](#3-full-development-history)

</details>

<details>
<summary><a id="historical-milestone-15"></a><strong>Home/workspace visual-system milestone</strong></summary>

#### Home/workspace visual-system milestone

- Refined the Home workspace layout and menu access.
- Removed Home navigation from active workspaces.
- Applied the Home-style visual system to full workspaces.
- Standardized most workspace button hover/highlight states around the existing gold-brown accent.

[Back to development history](#3-full-development-history)

</details>

<details>
<summary><a id="historical-milestone-16"></a><strong>Dual-mode Inspector workspace milestone</strong></summary>

#### Dual-mode Inspector workspace milestone

- Added `planning_documents/PERIDOT_INSPECTOR_WORKSPACE_CONTRACT.md` to define the compact/full Inspector model.
- Prepared `InspectorPanel.jsx` as a reusable Inspector content boundary.
- Added Inspector presentation modes for `closed`, `compact`, `workspace`, and `empty-workspace`.
- Changed visualization clicks so nodes, edges, and clusters open the compact side-panel Inspector.
- Changed hamburger **Inspector** so it opens the full Inspector workspace rather than the compact side panel.
- Added compact **Expand Inspector** behavior and `[x]`/Escape close behavior for compact and full modes.
- Kept the most recently used Visualizations state mounted underneath the full Inspector workspace.
- Refined the dual-mode Inspector visual treatment with a Peridot/moss/cream palette.
- Reduced compact Inspector content so it functions as an at-a-glance summary rather than a full dossier.
- Moved linked-letter detail into shared Inspector state/history.
- Made linked-letter source/target people and places clickable.
- Made compact summary tiles open the full Inspector workspace for the same selected entity.
- Made directed route rows open route/edge Inspector dossiers with linked letters.
- Then-current Inspector baseline: **`b24e19a` — `Link Inspector directed route rows`**.

[Back to development history](#3-full-development-history)

</details>

<details>
<summary><a id="historical-milestone-17"></a><strong>Interface redesign and workspace-routing milestone</strong></summary>

#### Interface redesign and workspace-routing milestone

- Added `PERIDOT_INTERFACE_REDESIGN_PLAN.md` to define the shift from a map-first side-panel app toward a multimodal correspondence data exploration workspace.
- Added internal workspace state and extracted workspace configuration into `src/peridotWorkspaceConfig.js`.
- Added Home / welcome startup behavior and routed users into Data or Visualizations from the landing page.
- Replaced the visible persistent icon rail with a hamburger-triggered labeled menu.
- Promoted Theme to a full workspace.
- Created and extracted full workspace components for Home, Data, Theme, Visualizations, Export, and Search & Filter.
- Added `src/PeridotHamburgerMenu.jsx`, `src/PeridotHomeWorkspace.jsx`, `src/PeridotDataWorkspace.jsx`, `src/PeridotThemeWorkspace.jsx`, `src/PeridotVisualizationsWorkspace.jsx`, `src/PeridotExportWorkspace.jsx`, `src/PeridotSearchWorkspace.jsx`, and `src/peridotWorkspaceConfig.js`.
- Moved Analytics into the Visualizations workspace while preserving compact preview sizing and expanded chart behavior.
- Promoted Export to a full workspace with a live visualization preview preserved for SVG/PNG export.
- Promoted Search & Filter to a full workspace while preserving existing keyword/person/place/route/date/weight controls and predictive suggestions.
- Updated `PERIDOT_ROUTING_CONTRACT_AUDIT.md` after Search and Export were promoted.
- Deferred Timeline promotion; the preferred future design is now a bottom timeline/scrubber integrated with Visualizations.
- Deferred Inspector promotion pending a careful full evidence-dossier design contract.

[Back to development history](#3-full-development-history)

</details>

<details>
<summary><a id="historical-milestone-18"></a><strong>Workbook / Excel import and Inspector profile milestone</strong></summary>

#### Workbook / Excel import and Inspector profile milestone

- Added workbook-aware staging and parsing for CSV, TSV, XLSX, and XLS files.
- Added workbook mapping helpers that model primary record sheets, sheet/column references, core Peridot field mappings, and unique-ID joins.
- Added a workbook mapping workspace for multi-sheet Excel files.
- Let users manually add multiple joined sheets and choose arbitrary unique-ID columns on the primary and joined sheets.
- Assembled multi-sheet workbook rows into Peridot-shaped records using configured unique-ID joins.
- Let users choose custom Inspector/Analytics fields from primary and joined workbook sheets.
- Displayed user-selected custom fields in linked letter cards.
- Reworked person and place Inspector views into profile summaries with related people, related places, directed routes, date spans, linked-letter counts, and selected uploaded fields.
- Added dedicated linked-letter detail pages inside the Inspector rather than expanding long records inline.
- Fixed place-profile fallback behavior so places clicked from profile lists can resolve from linked-record metadata.
- Removed redundant top-level Inspector fields once the richer profile sections covered the same information.

[Back to development history](#3-full-development-history)

</details>

<details>
<summary><a id="historical-milestone-19"></a><strong>Arbitrary column mapping and workbook-parsing milestone</strong></summary>

#### Arbitrary column mapping and workbook-parsing milestone

- Added `src/peridotColumnMapping.js` to define column-mapping helpers for mapping user-uploaded tables into Peridot’s internal field model.
- Added `src/PeridotColumnMappingModal.jsx` as the large mapping workspace for arbitrary CSV/TSV imports.
- Staged arbitrary CSV and TSV uploads for mapping rather than assuming incoming files already match the Peridot template.
- Imported mapped arbitrary CSV/TSV data into the active Peridot data pipeline.
- Clarified cancel/import actions so the mapping workflow is less ambiguous.
- Added `src/peridotWorkbookParsing.js` as the workbook parsing helper for the planned Excel path.
- Removed the ordinary legacy three-file upload workflow after the one-file/mapped-import direction became the active public data-ingestion model.

[Back to development history](#3-full-development-history)

</details>

<details>
<summary><a id="historical-milestone-20"></a><strong>Standardized single-CSV Data Inputs milestone</strong></summary>

#### Standardized single-CSV Data Inputs milestone

- Added `src/peridotCsvSchema.js` to define the public template columns, field groupings, minimum record rule, capability labels, and upload tips.
- Added `src/peridotCsvNormalizer.js` to convert the public one-file template into existing internal geography, letter metadata, person metadata, and place row shapes.
- Added `src/peridotCsvValidation.js` to build validation summaries and row-capability reports.
- Simplified the ordinary Data Inputs panel to foreground **Download CSV template**, **Upload completed CSV**, latest upload summary, and concise data tips.
- Added an upload validation popup and kept the same information accessible after close through a persistent side-panel summary.
- Established the database-first upload policy: accepted rows may be incomplete; coordinates and parseable dates are capability-enabling fields rather than upload-admission requirements; Peridot does not clean, standardize, merge, or enforce controlled vocabularies for uploaded user data.

[Back to development history](#3-full-development-history)

</details>

<details>
<summary><a id="historical-milestone-21"></a><strong>Search &amp; Filter implementation and layout milestone</strong></summary>

#### Search & Filter implementation and layout milestone

- Implemented the dedicated **Search & Filter** rail tab and promoted it from planning contract to active global-filtering UI.
- Search & Filter owns draft/apply controls for keyword search, person filter, place filter, **Route Filter (Place)**, **Route Filter (People)**, minimum correspondence weight, and date range.
- Predictive suggestion menus appear after at least two typed characters, are capped visually to about five visible suggestions, allow scrolling for more matches, and fill draft fields only.
- **Apply Filters** commits all active filter controls together.
- **Clear Filters** clears keyword/person/place/route filters, restores minimum weight to `1`, restores the full available date range, and resets playback.
- Pre-update status feedback appears before expensive full-dataset recomputation begins.
- Later visual refinements converted Search & Filter from stacked explanatory cards into a compact advanced-search form.

[Back to development history](#3-full-development-history)

</details>

<details>
<summary><a id="historical-milestone-22"></a><strong>Analytics feature and visual-polish milestone</strong></summary>

#### Analytics feature and visual-polish milestone

- Added the Analytics side-panel tab with chart previews, chart controls, chart descriptions, and PNG export.
- Added multiple chart types, expanded chart controls, dynamic variable detection, route-place/route-person variables, and an expanded chart overlay.
- Improved Analytics chart hover-tooltip contrast.
- Refined the expanded Analytics view: dark green translucent backdrop, cool off-white text/borders, preserved blurred-map effect, and white/cream chart card.

[Back to development history](#3-full-development-history)

</details>

<details>
<summary><a id="historical-milestone-23"></a><strong>Side-panel and cluster milestones</strong></summary>

#### Side-panel and cluster milestones

- Consolidated the app around a shared left-side panel shell with a persistent rail.
- Added dedicated rail tabs for Data Inputs, Search & Filter, Export, Timeline, Analytics, Controls, and Inspector.
- Made the Inspector content-only inside the shared panel shell.
- Made clusters actionable in the inspector, grouped cluster members by place, and made cluster sizing reflect represented letter volume.

---

[Back to development history](#3-full-development-history)

</details>

## 5. Historical Checkpoint Evidence

<details>
<summary><strong>Historical checkpoint — Inspector integration and uncommitted Support work (2026-11-25)</strong></summary>

```text
01b03bc — Complete compact Inspector integration across Map, Network, Timeline, and Charts
Branch: main
Status: HEAD, origin/main and origin/HEAD aligned (user-confirmed 2026-11-25); working tree NOT clean: locally modified core documentation and uncommitted voluntary-support/header source, config, and planning files. These are not part of 01b03bc.
```

**Source of verification:** The researcher supplied `git status` and `git log --oneline -15` on 2026-11-25 confirming `01b03bc` at `HEAD`, `origin/main`, and `origin/HEAD`. The commit includes the accepted accumulated compact Inspector source across Map, Network, Timeline and Charts. Working-tree changes remain outside that commit: modified Maintainer's Guide and Charter, uncommitted voluntary-support/header source and styling, `.github/FUNDING.yml`, and support planning assets. These files are **not yet recorded as a completed or committed feature**. The development's browser acceptance and source-level test reports are described in the milestone below; no fresh production-build or deployed-site verification is implied.

This was superseded by `c60c0da` and `59ce6a7`; its pending-work statements describe the earlier snapshot only.

</details>

The paragraphs below are preserved as historical records of repository states and documentation handoffs at the time recorded. Their former references to “latest” commits or pending changes **do not describe today's repository**. They are separated from the current checkpoint because routine use of the Changelog should not require reading successive historical `git status` accounts.


The records below describe the Git and working-tree states **at the dates stated**, not the present state. Their original wording is retained as historical evidence.

<details>
<summary><strong>Historical checkpoint verification (2026-11-22; superseded by `2be3ea0`)</strong></summary>

**Historical checkpoint verification (2026-11-22; superseded by `2be3ea0`):** The researcher supplied `git push origin main`, `git status`, and `git log --oneline -3` confirming that `e96c375` is aligned at `HEAD`, `origin/main`, and `origin/HEAD`, with **nothing to commit and a clean working tree**. The latest three verified commits are `e96c375` (Charts appearance customization and adaptive presentation), `8baa733` (retire legacy Charts I and consolidate Charts II workspace), and `5c75472` (Charts II chart-local filters and single-series selection). Charts II is now the sole public Charts workspace and has 15 implemented families, Catalogue and Builder, filter and chronology integration, shared Timeline color selection, mark styling, adaptive presentation, a resizable controls panel, and customizable PNG exports. The user tested and accepted the integrated behavior locally. Source-level Charts regression tests were reported passing; one known, independently reproduced Timeline grouped-lanes expected-label mismatch remains outside the Charts work. The present core-documentation handoff has **not** been committed as part of this checkpoint.

</details>

<details>
<summary><strong>Historical checkpoint verification (2026-11-11; superseded by `e96c375`)</strong></summary>

**Historical checkpoint verification (2026-11-11; superseded by `e96c375`):** The researcher supplied `git status` followed by `git log --oneline -5` confirming `ea7cda8` at `HEAD`, `origin/main`, and `origin/HEAD`. The source milestone is `f5791f1` — `Implement Timeline II adaptive grouped swimlanes and category workspace`; the immediately following `ea7cda8` — `Remove obsolete src.zip archive` intentionally deletes the obsolete tracked source ZIP. The working tree is **not clean**: `src/PeridotVisualizationsWorkspace.jsx` remains modified for concurrent Charts II work, and `src/PeridotChartsIIFoundation.jsx` / `src/chartsIIDataProfile.js` remain untracked. Do not confuse those changes with the already committed Timeline-only width fix. The researcher confirmed in Chrome that the native Categories horizontal scrollbar works after the conditional stage-wrapper constraint. The documentation replacements prepared after this checkpoint are **not yet committed**. The source commits are Git-confirmed; automated cross-browser/deployed-site verification is not claimed.

</details>

<details>
<summary><strong>Historical checkpoint verification (2026-11-10)</strong></summary>

**Historical checkpoint verification (2026-11-10):** The researcher supplied `git status` and `git log --oneline -5` confirming `9c2bb0e` at `HEAD`, `origin/main`, and `origin/HEAD`, with no staged changes. The working tree is intentionally not clean: `src.zip` is deleted locally, `src/PeridotVisualizationsWorkspace.jsx` is modified for independent Charts II work, and untracked Charts II and planning files remain outside the Timeline Categories commits. `9c2bb0e` and `27c5b52` are the newly verified category development commits; `4702f3b` is the preceding documentation checkpoint. Proposed document updates and icon-resource moves in this handoff are **not yet committed** and must not be represented as part of `9c2bb0e`.

</details>

<details>
<summary><strong>Checkpoint verification (2026-11-09)</strong></summary>

**Checkpoint verification (2026-11-09):** The researcher supplied `git status` and `git log --oneline -5` confirming `4fca872` as `HEAD`, `origin/main`, and `origin/HEAD`, with no staged changes and a non-clean working tree. Commit subject: `Unify shared chronology navigation, filtering, and dataset extent presentation`. Earlier commits `9c15045` (About animation documentation), `71833b3` (About animation implementation), `d119550` (chart-builder planning), and `c74aa55` (persistent independent chronology sessions) are also confirmed in that log. The remaining uncommitted work is the `src.zip` deletion, `src/PeridotVisualizationsWorkspace.jsx` changes for Charts II, untracked `src/PeridotChartsIIFoundation.jsx`, `src/chartsIIDataProfile.js`, and `planning_documents/Peridot Load Animation.html`. **These changes are not part of `4fca872`; do not stage, replace, or mislabel them as committed chronology work.** The documentation replacement package prepared on 2026-11-09 does not itself establish a subsequent commit.

</details>

<details>
<summary><strong>Historical checkpoint verification (2026-11-05; superseded by `4fca872`)</strong></summary>

**Historical checkpoint verification (2026-11-05; superseded by `4fca872`):** The researcher supplied `git status` and `git log --oneline -5` showing `71833b3` at `HEAD`, `origin/main`, and `origin/HEAD`. The commit subject is verified: `Add staggered manuscript entrance animations to About pages`. The working tree is **not clean** because independent Timeline/Charts/source-development work continues in parallel (modified `src/App.jsx`, `src/PeridotSharedChronologyAdapter.jsx`, `src/PeridotTimelineII.jsx`, and `src/PeridotVisualizationsWorkspace.jsx`; untracked Charts II and chronology files; and a deleted `src.zip`). Those local changes were not part of the About animation commit and must not be staged, overwritten, or described as committed by this documentation pass. The five confirmed recent commits are `71833b3`, `d119550`, `c74aa55`, `50c1be5`, and `81c3719`; only the About change is documented technically here. The earlier `81c3719` checkpoint narrative remains retained below as history, not the current HEAD.

</details>

<details>
<summary><strong>Historical checkpoint verification (2026-11-03)</strong></summary>

**Historical checkpoint verification (2026-11-03):** The researcher committed and pushed `81c3719` to `origin/main`. The supplied push confirms publication (`688bc17..81c3719`), but does not establish a post-push clean working tree. The immediately preceding pushed commit shown by Git is `688bc17`; its subject and intermediate history have not been supplied in this conversation, so this documentation pass does not reconstruct them. The following detailed account of `ddee7e2` remains preserved as a **historical previous clean checkpoint**, not the current HEAD. At that earlier checkpoint, the latest user-confirmed clean synchronization was **`ddee7e2`** on `main` (2026-11-01), with `HEAD`, `origin/main`, and `origin/HEAD` aligned and no local changes. The five most recent commit subjects confirmed in the latest user Git log are `ddee7e2`, `8cb1cbc`, `2664fbf`, `8899b8d`, and `3f0ae7c`. The preceding documentation checkpoint is `481acd9`; the following historical checkpoint narrative is retained for continuity. At the previous documentation pass, the user-confirmed clean synchronization was `481acd9` on `main` (2026-11-01), with `HEAD`, `origin/main`, and `origin/HEAD` aligned and no local changes. Following the previous documented `973d40d` checkpoint, the confirmed commits are `be5fea5` (documentation synchronization), `54dfa2c` (GitHub Pages CARTO key build configuration), `64dfbae` (Review confirmation guard), `8dd208a` (new-upload progressive disclosure), and `481acd9` (canonical capability-scan optimization). Earlier intervening commits `1a58e44`, `3da30ec`, and `74ca40e` remain documented in the milestone section and full history. The earlier `ae3574c` map/workbook-review checkpoint remains an important historical baseline. This checkpoint incorporates the Web Mercator/CARTO Geographic Map, high-zoom and interaction performance repairs, self-contained attributed geographic exports, finalized Map-settings basemap selection, and provisional background workbook-review processing. Its immediately preceding confirmed checkpoints are `2684b3c` (export repair), `3c0a43e` (map performance), `bc99e31` (world wrapping/high-zoom interaction), and `0794002` (CARTO prototype). The historical `fc42306` Vite asset-import milestone remains below. The exact subject of `fc42306` was not furnished at its historical synchronization, so its descriptive label is not a verified Git subject. The earlier `5e785ed` checkpoint is historical and is followed by the verified gateway-design, animation, and asset-loading work below. The older `c71e265` asset-name repair and `7df38d0` documentation pass remain distinct preceding milestones. The previous checkpoint narrative is retained here for historical context: The `c71e265` asset-reference repair is a prior accepted milestone; commits `7df38d0` and `5e785ed` supersede it as the latest documentation and interface checkpoints. The previous `87d6955` milestone is historical. The prior `27e3cf7` state remains an earlier historical checkpoint, following `f3cf4fb` (shared mapping workspace layout/contextual guidance), `89aaa50` (mapping palette and contrast), `60b8643` (direct Home file chooser), and the intervening Home onboarding/asset-retirement commits. `27e3cf7` updates tracked design mockups and the genealogy retirement audit; **it does not retire genealogy code**. Earlier statements about uncommitted Adobe filigree deletions, a sole Home “Get started” button, and a wholly deferred mapping-content redesign describe earlier stages, not the current implementation. Browser observations and source changes are distinguished from verified Git synchronization; asset licensing is a separate unresolved review.

</details>

<details>
<summary><strong>Historical checkpoint narrative (`cd625a2`)</strong></summary>

**Historical checkpoint narrative (`cd625a2`):** This checkpoint closes the first major navigation-normalization sequence. Peridot now uses a persistent site-wide header and conventional page hierarchy while preserving the research session underneath it: the active dataset and accepted workspace state survive navigation, Visualize/Explore/Data/About use compact local navigation, mapping is a full-page Data workspace rather than a modal, and About is a first-class scholarly project section. The same sequence also adds native ISO 8601 timestamp support to canonical temporal parsing.

Current architectural significance:

- **`a1f4d56`** established persistent global navigation plus workspace-state continuity. The Peridot logo is a Home control; Data, Visualize, Explore, Tutorials, and About are persistent public destinations. Lightweight page changes do not receive an added loading overlay.
- **`1810bf9`** and **`f59402f`** compacted and flattened Visualize. Map / Network / Timeline / Charts are centered on a local second bar, Export remains distinct at the right, and the prior oversized workspace framing no longer consumes the visualization stage.
- **`e9ddf1f`** reorganized Explore around **Browse / Advanced Query / Refine**. Results live with Advanced Query; capability review and Inspector handoff context live with Refine. Search draft/apply and scope semantics remain unchanged.
- **`4a6cd2e`** accepts ISO 8601 timestamp strings as day-precision temporal values while preserving full source text and using the lexical source calendar date rather than timezone-shifting historical evidence.
- **`f139f53`** moved Data mapping out of a modal/scrim and into the Data page beneath the persistent global header. Mapping sections are directly navigable; the final section is **Review and Upload**; Cancel is separated from Back/Next; entry uses the established heavier transition to avoid flash.
- **`cd625a2`** normalizes About into **About Peridot / Creator / AI Disclosure / Open Source / Feedback**, removes the old Project Information Hub/return-to-visualizations framing, renders Feedback inline as a normal About page, reduces title scale, and restores page scrolling when content exceeds the viewport.
- The accepted generalized mapping, Search scope, Timeline, Network, Inspector, and export semantics remain authoritative underneath the navigation redesign. This sequence changes how researchers move among those systems, not what the mapped evidence means.
- The first shared Relations/Time/Places mapping-content redesign and Home onboarding refinement are now committed; remaining mapping sections, integrated Identity styling, Explore-content overhaul, and Tutorials remain pending.
- Timeline relationship-line routing/presentation remains unfinished; the `a32ef05` subject-strict relationship semantics and continuous secondary-axis layout remain the foundation.
- The accepted Network performance architecture from `c8a7c46` remains in place; discarded playback tween/geometry-animation prototypes remain absent.

</details>

<details>
<summary><strong>Original table-boundary note (historical)</strong></summary>

### Original table-boundary note (historical)

This was the original transition note between the two historical tables: “This is the single authoritative place in the documentation for the cumulative commit trajectory. The table is retained exhaustively, newest first. New rows are appended during synchronized documentation passes.” The two tables are now combined above.

</details>

## 6. Deferred, Archived, and Rolled-Back Work

**Reading note:** This section retains decisions and deferrals as they were recorded at different milestones. Older “future work” language is **historical to its stated checkpoint**, not an automatically current task list. The Maintainer’s Guide owns the active technical backlog; newer milestone entries supersede older expectations where implementation has since changed. In particular, the original “Phase 3 Chart Builder” planning entry below predates the completed Charts II workspace.

### Loading animation alternatives rolled back or superseded (2026-11-02 to 2026-11-03)

The main-thread Canvas renderer remained visually faithful but could not advance during lengthy synchronous data/visualization work. An early OffscreenCanvas worker using imperative replacement of React-owned Canvas DOM nodes caused a white-screen regression and was rolled back. The separately prototyped SVG/CSS solution did not meet the approved visual design. These are **historical rejected paths**, not current implementation options. The accepted rendering worker and persistent component were committed at `81c3719`; the simpler preboot SVG and later completed-emblem still were also superseded by an exact frame-zero image with a first-frame handoff. No further loading-screen rewrite is currently accepted or required.


**2026-10-31 gateway rollback:** The attempted horizontal text/tear slide-and-crossfade between Visualize, Explore, and Tutorials (v40/v41) was rejected after an `App.jsx` scope error. The user restored v37/v38/v39 files and approved the simpler per-page staggered entrances. Avoid reapplying v40/v41 or replacing a current `App.jsx` with an older partial snapshot; any future cross-route animation requires a fresh source audit and route-lifecycle regression. The regenerated six-image high-resolution tear experiment was also rolled back/not adopted. The URL-prefix-only production image repair was superseded by Vite-managed imports.


**Historical visual status at `5e785ed` (2026-10-30):** About manuscript-corner treatment and red portrait framing are accepted through `5e785ed`; responsive page wrapping requires continued viewport regression checks as content changes. The historical Creator profile-card experiment remains rejected. The core-documentation governance protocol was reviewed during this documentation pass and remains unchanged.

**2026-10-30 asset/design deferrals:** The 44-file small-label/modular-frame experiment was rejected for messy crops/edges and is not part of the committed asset catalog. Additional decorative placement and edge QA remain exploratory; added assets are not presumed deployed.

**2026-10-28 deferrals and rejected interface trials:** The multi-relationship design (separate Mother/Father/Spouse groups within one record) remains unimplemented because runtime and graph consumers assume one relationship group with multipart participants; a future implementation must preserve group boundaries and never infer edges between unrelated groups. The sample card color treatments (ivory/green/oxblood accents) were discussed but not applied. The larger Creator profile-card experiment and alternative biography were reversed; the earlier portrait/biography layout is accepted. The dotted SVG Home route treatment and early collapsed-summary/offset-grid mapping variants were rejected. The corrected Add-on-demand mapping form activation is committed.



**Checkpoint update (2026-10-25):** The prior broad “Home refinement” and “Visualize palette/frame overhaul” requests have substantial accepted implementation through `4e6fb11`. Remaining work is targeted cross-workspace visual consistency, content and interaction decisions, tutorial development, CSS cascade cleanup, and future responsiveness/window-minimum testing—not a claim that the original entry composition is still unbuilt. The historic entries below are retained to explain what had been deferred at earlier checkpoints.

### Current Timeline follow-up after Grouped swimlanes `f5791f1` (2026-11-11)

Generalized source-backed categories, researcher-starred Grouped swimlanes, and the horizontally scrolling five-column Categories editor are implemented. Remaining work includes event-density overview, carefully justified handling of truly coincident events, broader orientation/keyboard/Inspector/uncertainty/large-dataset tests, and durable researcher-owned configuration/project persistence design. Event-to-event relationship arcs remain deliberately deferred; do not revive historical automatic subject-to-representative-event projection as though it were current approved behavior. The earlier 2026-11-10 prioritization is preserved in the historical milestone above.

### Deferred Timeline, Network, navigation/interface, Chart, compatibility, Search follow-up, and tutorial work (originally recorded after `cd625a2`)

- **Timeline relationship-line presentation — historical earlier priority; now deferred:** preserve subject-strict mapped endpoint semantics and the continuous secondary-axis layout, but redesign line routing/contrast/anchors so each relationship reads clearly as event → event in Horizontal and Vertical views. Keep duration bands visually distinct from relationship edges.
- **Timeline dense-layout/card polish:** recheck collision cleanup, event-card footprint/truncation, uncertainty/partial-date cues, relationship arrowheads, and selected-edge emphasis after the line pass. Do not add aggregation/clustering until a real dataset demonstrates that zoom/pan plus collision-aware layout is insufficient.
- **Optional Timeline temporal-structure filters:** approximate/partial/open/inconsistent controls remain optional future work if they can be made analytically useful and human-readable.
- **Network Pass 4 — consumer/vocabulary cleanup:** audit remaining exports, capability text, comments, Inspector/hover bridges, and compatibility-facing presentation for stale `Weight`, `linked_letters`, Source/Target, sender/recipient, route, or forced-direction language. Preserve correspondence-specific vocabulary only where the mapping genuinely supplies it.
- **Network Pass 5 — geometry/presentation correctness:** revisit Force-Directed initial framing/fit where still needed, terminate directed arrowheads at node boundaries, and repair bounded path/geometry issues without reopening semantic scope.
- **Network Pass 6 — visual tuning / Appearance controls:** tune node size, cluster size, edge width, clustering threshold/sensitivity, and dense-versus-sparse defaults; decide explicitly what cluster size encodes; evaluate researcher-facing scaling controls in the reserved Map settings **Appearance** area.
- **Playback animation remains rolled back:** local-only animation/tweening prototypes after generalized playback were rejected and are not in current `main`. Any future animation project should begin with a fresh architecture/design audit rather than copying discarded screen-space geometry code.
- **Playback performance follow-up:** transient pan/zoom, local scrub preview, and stable Force playback geometry are accepted. Remaining work is speed calibration and any later presentation animation.
- **Visualize shell compression — completed in navigation redesign:** the oversized visualization header/framing was flattened; centered Map / Network / Timeline / Charts navigation and right-aligned Export are now the accepted local shell.
- **Explore content redesign:** preserve the accepted Browse / Advanced Query / Refine shell and draft/apply semantics, but revisit the dense internal content/layout later for clarity and space efficiency.
- **Data mapping content redesign:** preserve the full-page Data mapping architecture and direct section navigation; redesign the mapping content later because it remains confusing and space-inefficient. Do not return to a modal/wizard shell.
- **About / global visual polish:** About structure is accepted. Colors, typography, hover/active states, and logo/transition animation can be refined in a later cross-site cosmetic pass without restoring decorative container-heavy framing.
- **Search generalized-text follow-up:** `Any record text` still does not guarantee indexing of every generalized mapped semantic value.
- **Phase 3 Chart Builder:** build chart controls from saved/generalized variables with structured human-readable sentence/autocomplete interaction; keep the wide/transposed stock case as a required regression dataset.
- **Repository-wide compatibility retirement audit:** classify old Source/Target/profile/adapter/sample-fallback paths as delete now, still-required compatibility, legitimate specialization, or uncertain/retain.
- **Home/tutorial redesign (status updated at `4e6fb11`):** the editorial Home layout, full-width banner, and global Home return are implemented. Remaining Home work is optional, separately scoped content/entry refinements rather than a missing banner implementation. Substantive Tutorials, including attention choreography, placement, accessibility, animation timing, and the walkthrough, remain deferred.

### Tutorial attention-animation experiments rolled back before `619bab0`

The following tutorial experiments were intentionally removed and are not current functionality:

- aggressive breathing animations;
- 5% target scaling;
- Timeline gesture animation;
- SVG node animation;
- replacement of tutorial controls with real-control guidance;
- animated Inspector close-button guidance;
- animated Browse controls.

These experiments were rolled back because target behavior was unreliable, source-file coverage was insufficient for a robust implementation, and behavior was inconsistent across stages. Future tutorial motion work must begin from the stable `619bab0` baseline and proceed as bounded experiments. The remaining polish sequence is attention choreography, placement audit, typography spacing, semantic keyword highlighting, and a final UX walkthrough. Final visual polish must include an explicit review of tutorial-animation order and timing.

### MapLibre migrated-overlay work paused / active preview removed

The later MapLibre migrated-overlay branch is paused and should be retained as an archived experiment, not treated as active `main` code. The old dormant MapLibre preview files and dependency have now been removed from active `main` in `55a368c`.

If MapLibre is revisited later, start from a fresh branch/source-of-truth audit and reintroduce any needed dependencies intentionally. Do not assume the experimental branch can be merged wholesale.

### Force-Directed fallback issue on MapLibre experiment

During the later MapLibre experiment, Force-Directed was intended to bypass MapLibre and use the legacy D3/SVG force-directed view. That routing was partly established, but the force view still blanked after briefly rendering. Several speculative sizing fixes were rolled back, and the branch was set aside. Future work should diagnose the legacy force-render path directly before attempting new fixes.

### Shared-panel prop rename attempt, after `4a17d1c`

A cleanup attempt was made to rename the old `showLeftSidebar` / `showRightSidebar` compatibility prop path to newer shared-panel naming. This was rolled back because it broke Inspector auto-open behavior when clicking nodes, edges, or clusters.

Future work should treat this path as fragile. If the old names are renamed later, the pass must explicitly test node click, edge click, cluster click, contained cluster-member click, and Back behavior.

### Panel responsive sizing attempt, after `b62c74b`

A responsive panel-sizing experiment attempted to make the shared side panel absolutely positioned at all viewport sizes. It was rolled back because it disrupted the full-size landscape layout and forced scrolling before the map. Future responsive-panel work should be designed as a narrow-window override rather than a universal positioning replacement.

---
