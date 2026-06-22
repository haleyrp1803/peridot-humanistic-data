# Peridot Core Documentation Restructuring Plan

## Purpose and Pass Boundary

This planning document translates the **Peridot Core Documentation Governance Protocol** into a concrete, source-preserving restructuring plan for Peridot’s core documentation.

It is a planning artifact only. It does **not** rewrite the README, Maintainer’s Guide, Project Workflow Charter, Changelog, or Governance Protocol. The future implementation pass must reread this document, the Governance Protocol, and all current core documents before preparing replacements.

### Planning-pass classification

- **Change type:** documentation / structural planning
- **Goal:** establish a complete section-by-section map for reorganizing the four core documents without losing technical, historical, workflow, or design knowledge.
- **In scope:** document roles, target table of contents, section destinations, duplication handling, current-checkpoint handling, preservation requirements, and sequencing for the later rewrite.
- **Out of scope:** changing source code, altering app behavior, deleting historical content, rewriting the four core documents, or deciding unresolved product behavior.
- **Acceptance condition:** a future documentation pass can use this plan to move, retain, summarize, cross-reference, archive, or correct each major current documentation region without relying on memory.

## Current Documentation Context

The planning baseline is the clean synchronized `main` state reported after:

```text
70d8b31 — Move documentation governance protocol to core documentation
```

The current core-document set is:

```text
core_documentation/
  README.md
  MAINTAINERS_GUIDE.md
  PROJECT_WORKFLOW_CHARTER.md
  CHANGELOG.md
  PERIDOT_CORE_DOCUMENTATION_GOVERNANCE_PROTOCOL.md
```

The Governance Protocol is the standing authority for future core-documentation work. This restructuring plan supplements it by mapping the current documents into the protocol’s intended long-term structure.

## Governing Preservation Rules

1. Preserve information before improving navigation.
2. Treat every detailed current section as retained, moved, summarized with an authoritative cross-reference, archived, or corrected explicitly. Never silently delete it.
3. Keep one primary home for each kind of information.
4. Use concise cross-references instead of reproducing large current-state narratives in several documents.
5. Keep historical and rolled-back work discoverable and visibly labeled.
6. Treat the Changelog as the authoritative current-checkpoint and chronological-history source.
7. Treat the Maintainer’s Guide as the authoritative current-architecture and regression-contract source.
8. Treat the Charter as the authoritative process and decision-governance source.
9. Treat the README as the public orientation and user-workflow source.
10. Keep the Governance Protocol stable unless the documentation architecture itself changes.

## Structural Diagnosis

### Primary issues to resolve

- The four documents currently repeat broad “current state” narratives at different lengths.
- Several documents retain obsolete current-baseline hashes, including `639e30f` and `0c5a219`, although the latest synchronized checkpoint is later.
- The README lacks the Executive Summary required by the Governance Protocol.
- The README repeats detailed technical architecture and fragile-zone information better owned by the Maintainer’s Guide.
- The Maintainer’s Guide contains long grouped milestone/commit lists that belong in the Changelog.
- The Charter combines stable workflow law with volatile project inventories, detailed subsystem contracts, and a large flat decision list.
- The Changelog contains competing current-state blocks: stylesheet milestone, historical baseline, milestone narratives, current branch status, and the full history table.
- The Governance Protocol already provides the target ownership model; the later implementation pass should make the documents conform to it rather than revising the model ad hoc.

### Information that must remain especially protected

- Source-of-truth and applied-file continuity rules.
- Recovery lessons from failed patching, responsive panel changes, and compatibility-path renaming.
- Data policy: permissive database-first imports; no silent standardization; explicit user-controlled mapping.
- Active/deferred scope uncertainty for Search and Timeline × Analytics.
- Inspector dual-mode shared state/history and mounted-overlay contract.
- Accessibility, visual-language, asset-license, and public-visibility decisions.
- MapLibre archived-branch status.
- Current screenshot archive and explicit labels distinguishing current from historical images.
- Complete commit history and all meaningful milestone rationale.

## Target Shared Front Matter

The four core documents should all use this order:

```text
Title
Executive Summary
Quick Navigation
Document Role and Boundaries
Current Synchronized Checkpoint
```

The Governance Protocol already has its own structure and should not be mechanically forced into this template unless a future governance revision explicitly requires it.

### Standard checkpoint block

Use the same concise block in README, Maintainer’s Guide, and Charter:

```text
Current synchronized checkpoint:
70d8b31 — Move documentation governance protocol to core documentation
Branch: main
Status: local and origin/main aligned after the latest sync ritual

For detailed milestone interpretation and complete history, see CHANGELOG.md.
```

The Changelog should use the same hash but owns the expanded interpretation.

## Target Document Structures

### README — public orientation and user workflows

```text
Title
Executive Summary
Quick Navigation
Document Role and Boundaries
Current Synchronized Checkpoint

1. What Peridot Is
2. Audience, Research Uses, and Supported Data
3. Current Public Workflow
   3.1 Start
   3.2 Load and map data
   3.3 Visualize
   3.4 Explore and inspect
   3.5 Export
   3.6 Send feedback
4. Current Interface Examples
5. Historical Interface Archive
6. Install and Run Locally
7. Data-Input Guide
8. Known User-Facing Limitations
9. Documentation and Project References
10. Author, License, and Attribution
```

### Maintainer’s Guide — current architecture and maintenance contracts

```text
Title
Executive Summary
Quick Navigation
Document Role and Boundaries
Current Synchronized Checkpoint

1. Current Architecture Snapshot
2. Application Boundaries and Route Model
3. Data Lifecycle and Scope Vocabulary
4. Visualizations, Timeline, Inspector, and Export Contracts
5. Advanced Search / Explore Contract
6. Analytics Contract
7. Data Import and Workbook Contract
8. Theme and Stylesheet Architecture
9. Module Ownership Index
10. Fragile Zones and Regression Test Matrix
11. Active Technical Backlog
12. Archived and Compatibility Paths
13. Fresh-Chat Handoff Essentials
```

### Project Workflow Charter — process governance and decision records

```text
Title
Executive Summary
Quick Navigation
Document Role and Boundaries
Current Synchronized Checkpoint

1. Non-Negotiable Operating Rules
   1.1 Source of truth and applied-file continuity
   1.2 Bounded-pass rule
   1.3 Full-file review and safe replacement
   1.4 Fragile-zone preflight requirement
2. Delivery, Testing, and Commit Protocol
3. Recovery Protocol
4. Documentation Maintenance Policy
5. Dependency and Tooling Freeze
6. Project-Specific Operating Cautions
7. Decision Records by Domain
   7.1 Data policy and imports
   7.2 Routing and workspace model
   7.3 Inspector
   7.4 Search and data scope
   7.5 Analytics
   7.6 Themes and visual language
   7.7 Export
   7.8 Archived or superseded decisions
8. Standard Handoff and Completion Template
```

### Changelog — checkpoint, milestones, archive, history

```text
Title
Executive Summary
Quick Navigation
Document Role and Boundaries

1. Current Synchronized Checkpoint
2. Recent Milestones, Newest First
3. Deferred, Archived, and Rolled-Back Work
4. Full Development History
```

### Governance Protocol — stable documentation-maintenance protocol

Retain the current Governance Protocol structure. It should remain the control document for document ownership, preservation, cross-referencing, checkpoint usage, and future documentation-pass preflight.

## Section Mapping: README

| Current README region | Current role | Future destination | Handling | Preservation requirement |
|---|---|---|---|---|
| Title and logo | Public identity | Title / opening presentation | Retain and modernize surrounding navigation only | Preserve image path and appropriate alt text |
| `1. Project title` and `2. One-paragraph summary` | Public orientation | Executive Summary + `1. What Peridot Is` | Consolidate without loss of product scope | Retain correspondence, point/site, chart-first, and generic evidence support |
| `3. Current status` | Large mixed current-state inventory | Concise checkpoint plus `1–3` public orientation/workflow; technical remainder cross-referenced | Split; do not retain as a single monolith | Preserve claims in their primary homes; do not delete unique public facts |
| `4. Key features` | Feature inventory | `2. Audience, Research Uses, and Supported Data` plus `3. Current Public Workflow` | Reorganize by user task | Preserve every supported user-facing capability, but avoid duplicate lists |
| `5. Current interface notes` | Current navigation and interaction explanation | `3. Current Public Workflow` | Retain, shorten duplicated implementation names | Preserve workspace-first, hamburger, dual-mode Inspector, Timeline/Export placement |
| `6. Screenshots` | Public visual documentation | `4. Current Interface Examples` and `5. Historical Interface Archive` | Retain largely intact | Preserve current/historical captions and all working image paths |
| `7. Tech stack` | Public technical overview | Short section within `9. Documentation and Project References` or standalone subsection after install | Retain concise list | Do not turn into module architecture |
| `8. Project structure` + module overview | Technical architecture | Maintainer’s Guide `9. Module Ownership Index` | Replace with concise architecture pointer | Preserve detail by moving it; remove duplicated source listing from README |
| `9. Installation and development` | User/developer setup | `6. Install and Run Locally` | Retain | Preserve commands exactly unless build tooling changes |
| `10. Data inputs` and `11. How to use` | User guidance | `3. Current Public Workflow` + `7. Data-Input Guide` | Consolidate task-oriented material | Preserve public template columns, data policy, mapping/workbook guidance |
| `12. MapLibre status` | Public technical/deferred status | `8. Known User-Facing Limitations` plus cross-reference | Summarize | Full archival details remain in Changelog / Maintainer’s Guide |
| `13. Known limitations and fragile zones` | Mixed user + maintainer risk list | User-facing portion in README `8`; technical portion in Maintainer’s Guide | Split | Preserve all fragile-zone details in Maintainer’s Guide |
| `14. Maintainer documents` | Documentation routing | `9. Documentation and Project References` | Retain and expand to include Governance Protocol | Keep exact core-document paths |
| `15. Roadmap / near-term priorities` | Mixed active backlog | Maintainer’s Guide `11. Active Technical Backlog`; README receives only concise public “development status” | Move detailed list | Preserve all active items and ordering |
| `16. Author / maintainer / license` | Public attribution | `10. Author, License, and Attribution` | Retain | Preserve asset/license attribution language |

## Section Mapping: Maintainer’s Guide

| Current Maintainer’s Guide region | Future destination | Handling | Preservation requirement |
|---|---|---|---|
| Title, Executive Summary, Purpose | Shared front matter | Reformat into required sequence | Preserve architecture-reference role |
| Source of truth and working assumptions | `1. Current Architecture Snapshot` plus brief checkpoint block | Split source location from architecture narrative | Charter owns detailed source-of-truth rule; guide only records current context |
| Executive-summary maintenance convention | Cross-reference to Governance Protocol / Charter | Replace duplicated full convention with concise reference | Governance Protocol remains authoritative |
| Stylesheet architecture and current audit backlog | `8. Theme and Stylesheet Architecture` + `11. Active Technical Backlog` | Keep technical specifics; move long milestone lists to Changelog | Preserve import order, CSS ownership, audit boundaries |
| Long recent milestone groups | Changelog `2. Recent Milestones` | Replace with grouped references | Preserve commit context in Changelog, not Guide |
| Repository shape | `1. Current Architecture Snapshot` or `9. Module Ownership Index` | Consolidate with source-tree ownership map | Remove duplicates carefully |
| Architectural summary | `1. Current Architecture Snapshot` and `2. Application Boundaries` | Retain and organize | Preserve workspace-first model and application-level boundaries |
| Current module responsibilities | `9. Module Ownership Index` | Retain as primary architecture record; use grouped subsystem tables | Preserve each module’s ownership, especially compatibility paths |
| Current dual-mode Inspector architecture | `4. Visualizations, Timeline, Inspector, and Export Contracts` | Retain and expand into contract table + explanatory notes | Preserve shared state/history, mounted overlay, Back, Unknown, record tables |
| Current functional state | Distributed across sections `2–8` | Split by subsystem; eliminate duplicated inventories | Preserve unique capability details |
| Workbook import contract | `7. Data Import and Workbook Contract` | Retain | Preserve join policy, mapping order, tests |
| Search & Filter active-dataset contract | `3. Data Lifecycle and Scope Vocabulary` + `5. Advanced Search / Explore Contract` | Retain in authoritative home | Preserve draft/apply model and scope uncertainty |
| Data Inputs contract | `7. Data Import and Workbook Contract` | Retain | Preserve database-first policy, validation behavior, tests |
| Brand asset and Home workspace state | `8. Theme and Stylesheet Architecture` or concise `2` routing/workspace context | Retain asset attribution and layout contract; remove public-gallery duplication | Preserve Adobe licensing and Home layout constraints |
| Current theme and routing state | `2. Application Boundaries` + `8. Theme and Stylesheet Architecture` | Split | Preserve semantic role and hidden-theme-menu decisions |
| Deferred / rolled-back work | `12. Archived and Compatibility Paths`, with full history in Changelog | Retain active maintenance consequences | Preserve MapLibre, shared-panel rename, responsive-panel lessons |
| Current fragile zones | `10. Fragile Zones and Regression Test Matrix` | Retain, group by subsystem | Preserve all regression checks |
| Additional caution / workflow reminders | Charter cross-reference + relevant contracts | Reduce duplication | Keep only architecture-specific cautions |
| Fresh-chat handoff note | `13. Fresh-Chat Handoff Essentials` | Retain and strengthen | Include required documents and synchronization facts |
| Code commenting standard | Charter process rule, with Guide cross-reference | Move primary rule to Charter | Preserve practical maintenance expectation |

## Section Mapping: Project Workflow Charter

| Current Charter region | Future destination | Handling | Preservation requirement |
|---|---|---|---|
| Title, Executive Summary, Purpose | Shared front matter | Reformat into standard order | Preserve mandatory-process framing |
| Source-of-truth rule / applied-file continuity | `1.1 Source of truth and applied-file continuity` | Retain as core law | Preserve exact local-source and current-file safeguards |
| Brand-asset inventory in source-of-truth section | Maintainer’s Guide / README attribution | Move out of Charter | Preserve licensing/asset-origin information elsewhere |
| Bounded-pass rule | `1.2 Bounded-pass rule` | Retain | Preserve behavior/visual/structural/documentation classification |
| Fragile-zones preflight | `1.4 Fragile-zone preflight requirement` | Retain rule; replace exhaustive system list with link to Maintainer’s Guide matrix | Preserve requirement and method |
| Full-file review / safeguards / code comments / uploads | `1.3 Full-file review and safe replacement` | Retain | Preserve all anti-stale and script-safety lessons |
| Checkpoint and commit distinction | `2. Delivery, Testing, and Commit Protocol` | Retain | Preserve definitions |
| Delivery format rule | `2. Delivery, Testing, and Commit Protocol` | Retain | Preserve individual-file and copy-command convention |
| Recovery protocol | `3. Recovery Protocol` | Retain | Preserve rollback and stop conditions |
| Sync ritual | `2. Delivery, Testing, and Commit Protocol` | Retain | Preserve exact canonical commands |
| Documentation policy | `4. Documentation Maintenance Policy` | Retain with Governance Protocol cross-reference | Preserve additive documentation standard |
| Dependency/tooling freeze | `5. Dependency and Tooling Freeze` | Retain | Preserve explicit freeze |
| Modularization roadmap | `6. Project-Specific Operating Cautions` or `7` as architecture decision | Retain concise direction; cross-reference code audit | Preserve extraction order |
| Decision records | `7. Decision Records by Domain` | Reformat into categorized records | Preserve every decision; do not flatten rationale |
| Project-specific cautions | `6. Project-Specific Operating Cautions` | Retain but move subsystem test matrices to Guide | Preserve side-panel, MapLibre, cluster, Data, Search cautions |
| Standard delivery summary | `8. Standard Handoff and Completion Template` | Retain | Preserve exact final-pass reporting expectations |
| Fresh-chat handoff | `8. Standard Handoff and Completion Template` or Guide `13` | Charter keeps process template; Guide keeps architecture payload | Preserve handoff requirement |

## Section Mapping: Changelog

| Current Changelog region | Future destination | Handling | Preservation requirement |
|---|---|---|---|
| Title, Executive Summary, executive-summary convention | Shared front matter | Reformat; retain short convention or cross-reference Governance Protocol | Preserve explanation that full history remains authoritative |
| Current stylesheet architecture milestone | `1. Current Synchronized Checkpoint` or `2. Recent Milestones` | Retain as a dated milestone, not a competing present baseline | Preserve component stylesheet history and import order |
| Historical documented safe baseline | `2. Recent Milestones, Newest First` | Retain as historical milestone | Label historical, do not call current |
| Current milestone notes | `2. Recent Milestones, Newest First` | Retain all milestone narratives, ordered newest first | Preserve detailed feature history |
| Current branch status | Remove as separate section; integrate newest facts into `1` and chronological table | Consolidate | Preserve all commits in history table |
| Deferred / rolled-back work | `3. Deferred, Archived, and Rolled-Back Work` | Retain | Preserve MapLibre and rollback lessons |
| Full development history | `4. Full Development History` | Retain entire table; append later commits | Preserve every history row |
| Any duplicate baseline prose | Historical milestone or cross-reference | Consolidate, never silently remove unique detail | Preserve prior rationale in milestone sections |

## Required Terminology and Correction List for the Later Rewrite

The implementation pass must correct these known document-level issues while preserving the facts they attempted to convey:

1. Replace stale “current baseline” references with the actual clean checkpoint from the most recent sync ritual.
2. Add the required Executive Summary to the README.
3. Add Quick Navigation and Document Role and Boundaries to all four core documents.
4. Add the feedback form to appropriate current public/architecture documentation:
   - README: public workflow, feedback.
   - Maintainer’s Guide: component ownership, Formspree integration, modal/layering interactions.
   - Changelog: milestone entry.
   - Charter: only if process rules changed; otherwise no repeated feature description.
5. Add `PeridotFeedbackForm.css` to the stylesheet cascade documentation where current imports are listed.
6. Clarify that the restored stylesheet-import commit was a correction to the functional cascade, not a new architecture direction.
7. Record removal of obsolete `index.css` backup files only as a maintenance cleanup/history item; do not present it as user-facing functionality.
8. Record the screenshot refresh in the Changelog and retain the README’s current-versus-historical image distinction.
9. Correct README source-tree/module duplication and move exhaustive module descriptions to the Maintainer’s Guide.
10. Ensure the Governance Protocol is listed in the core-document set and documentation-reference routes.
11. Preserve current uncertainty around Search dataset coverage/scope and Timeline playback × Analytics scope; do not claim full resolution before their dedicated audits.
12. Keep archived MapLibre material visibly historical and separate from active main direction.

## Future Contract Table Inventory

The Maintainer’s Guide implementation should use the following table set.

### A. Application boundary table

| System | Primary owner | Core responsibility | Important dependency | Minimum regression check |
|---|---|---|---|---|

Rows should include: App orchestration, workspace routing, Visualizations, Search, Inspector, Timeline, Analytics, Data import, Theme, Export.

### B. Data-scope vocabulary table

| Scope term | Definition | Created by | Consumed by | Known audit caveat |
|---|---|---|---|---|

Rows should include: loaded, mapped/normalized, applied/filtered, timeline-visible, selected, charted, exported.

### C. Stylesheet ownership table

| Stylesheet | Ownership boundary | Import order | Sensitive behavior | Verify after change |
|---|---|---|---|---|

Rows should include: `index.css`, `InspectorPanel.css`, `AnalyticsPanel.css`, `PeridotSearchWorkspace.css`, `PeridotColumnMappingModal.css`, `PeridotLearnMoreWorkspace.css`, `PeridotFeedbackForm.css`.

### D. Fragile-zone regression matrix

| Fragile zone | Typical regression | Out-of-scope protection | Minimum test |
|---|---|---|---|

Rows should cover routing, Inspector, Search scope, Timeline/Analytics scope, Data import, export, CSS cascade, map stage, chart rendering, and theme roles.

### E. Module ownership index

Use grouped tables or subheadings by domain instead of one long alphabetical prose list:

- application shell and workspace routing;
- Data Import and mapping;
- Visualizations, map, and timeline;
- Search and scope;
- Analytics;
- Inspector;
- Theme, styles, and visual language;
- export and shared utilities;
- archived/compatibility modules.

## Recommended Implementation Sequence

The later rewrite should be one dedicated documentation pass and proceed in this order:

1. Confirm a clean current sync ritual and use it as the only checkpoint source.
2. Reread the Governance Protocol, this restructuring plan, and all four core documents in full.
3. Create a private section-movement checklist from this plan.
4. Rebuild the Changelog first:
   - establish one current checkpoint;
   - retain and order milestone narratives;
   - preserve deferred/rolled-back section;
   - append all newly missing commits;
   - retain full history.
5. Rebuild the Maintainer’s Guide second:
   - move architecture/module/contract content into the target structure;
   - replace long milestone lists with Changelog references;
   - create contract tables and regression matrix;
   - retain compatibility and active-backlog material.
6. Rebuild the Charter third:
   - preserve stable process rules;
   - relocate volatile inventories;
   - categorize decision records;
   - link to Guide contracts.
7. Rebuild the README fourth:
   - restore public Executive Summary;
   - move exhaustive technical detail to Guide;
   - preserve screenshots and public data/workflow guidance;
   - include public feedback route and documentation links.
8. Review all four together against the Governance Protocol completion checklist.
9. Verify all internal Markdown links and relative screenshot paths.
10. Add one Changelog milestone explaining the documentation restructuring and confirming that historical and technical detail was preserved through relocation/cross-reference rather than deletion.

## Documentation Restructuring Acceptance Checklist

- [ ] Every core document has title, Executive Summary, Quick Navigation, Document Role and Boundaries, and standardized checkpoint block where required.
- [ ] README is public/user-facing and no longer contains the exhaustive module specification.
- [ ] Maintainer’s Guide is the clear primary source for current architecture, contracts, module ownership, fragile zones, and regression checks.
- [ ] Charter contains stable process governance and categorized decision records, not duplicated subsystem manuals.
- [ ] Changelog contains one current checkpoint, recent milestones, deferred/archive material, and complete history.
- [ ] The Governance Protocol remains intact and is referenced from the other documents.
- [ ] Every meaningful current section from the pre-restructure documents is retained, moved, summarized with an authoritative cross-reference, archived, or explicitly corrected.
- [ ] No historical milestone, rollback lesson, asset-license note, compatibility constraint, scope caveat, or test expectation is lost.
- [ ] No document contains competing current-baseline blocks.
- [ ] Newly completed feedback, CSS-cascade restoration, backup-file cleanup, governance-protocol placement, and screenshot-refresh work are recorded in the correct primary homes.
- [ ] The working tree is checked and the final documentation commit is made only after a full cross-document review.

## Maintenance Instruction

Retain this file in `planning_documents/` as the implementation map for the first core-document restructuring pass. After that pass is complete, do not delete this file. Mark it as **implemented** and retain it as a historical record of the documentation architecture migration.

Before subsequent smaller documentation updates, the Governance Protocol—not this migration plan—remains the mandatory standing preflight document.
