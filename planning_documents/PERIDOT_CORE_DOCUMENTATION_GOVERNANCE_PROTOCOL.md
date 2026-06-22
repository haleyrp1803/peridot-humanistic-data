# Peridot Core Documentation Governance Protocol

## Purpose

This protocol defines the intended ownership, structure, maintenance rules, and preservation safeguards for Peridot’s four core documents:

- `core_documentation/README.md`
- `core_documentation/MAINTAINERS_GUIDE.md`
- `core_documentation/PROJECT_WORKFLOW_CHARTER.md`
- `core_documentation/CHANGELOG.md`

Its purpose is to prevent documentation drift, accidental loss of institutional knowledge, duplicate current-state narratives, and casual rewriting of material whose historical or technical significance is not immediately obvious.

This file is a standing planning and maintenance reference. Before every core-documentation pass, read this protocol together with the current versions of all four core documents. Use it to determine where new information belongs, what may be revised, what must remain additive, and when a cross-reference is preferable to duplication.

This protocol does not replace the Project Workflow Charter. The Charter remains the governing process document for all project work. This protocol narrows that process specifically for core-documentation maintenance.

---

## 1. Governing principles

### 1.1 Preserve information before improving presentation

Peridot’s core documentation contains cumulative technical, product, visual, workflow, and historical knowledge. Restructuring must improve navigation without silently deleting or flattening that knowledge.

When a section is difficult to navigate, prefer one of these approaches before deletion:

1. add a clearer heading;
2. split a long section into named subsections;
3. move the section to the document that owns its subject;
4. replace duplicated prose with a concise summary and a cross-reference;
5. move superseded material into a clearly labeled historical, archived, or deferred section.

Do not remove a detailed statement merely because a newer summary exists.

### 1.2 One primary home for each kind of information

A fact may be referenced in more than one document, but it must have one authoritative primary home.

The purpose of this rule is to reduce synchronization burden and avoid four differently worded versions of the same current-state statement.

### 1.3 Structure changes are not content deletion

A documentation restructuring pass should preserve substantive content unless a statement is:

- factually obsolete;
- duplicated by a clearer retained statement;
- actively misleading;
- superseded by a documented correction; or
- deliberately moved to an archive/history section where it remains discoverable.

When moving content, preserve its meaning and any critical conditions, cautions, or rationale.

### 1.4 Current state must be concise and singular

Every core document may include a compact current-checkpoint reference, but only the Changelog should explain the checkpoint in detail.

Do not create multiple competing “current baseline,” “current branch status,” “recent milestone,” or “current state” blocks in the same document.

### 1.5 Historical detail is a project asset

Old interface models, rolled-back experiments, earlier design decisions, and superseded workflows are not automatically clutter. Retain them where they help:

- diagnose regressions;
- explain compatibility code;
- document scholarly/project development;
- preserve decision rationale;
- distinguish archived work from active direction.

Historical detail should be labeled clearly so readers do not mistake it for current operating guidance.

---

## 2. Required preflight before every documentation pass

Before editing any core document:

1. Read this protocol in full.
2. Read the current full versions of all four core documents.
3. Confirm the current synchronized Git checkpoint from the user’s latest sync ritual.
4. Classify the documentation task:
   - current-state update;
   - milestone/history update;
   - structural/navigation improvement;
   - terminology correction;
   - cross-document synchronization;
   - archival/deferred-work clarification.
5. Identify:
   - which document is the primary home for each new fact;
   - which documents should only reference it;
   - what existing content must be preserved;
   - what can be consolidated through cross-reference;
   - whether any section is historical and should be labeled as such.
6. State the proposed pass boundary before preparing replacements.

Do not perform a broad documentation rewrite from memory or a single document alone.

---

## 3. Shared front matter and navigation standard

Each core document should begin with the following sequence:

1. **Title**
2. **Executive Summary**
3. **Quick Navigation**
4. **Document Role and Boundaries**
5. **Current Synchronized Checkpoint**

### 3.1 Executive Summary

Each Executive Summary should be one or two concise paragraphs that answer:

- What is this document for?
- Who should use it?
- What does it contain?
- How should the reader use it?

The Executive Summary is the only region that may be rewritten non-additively as a matter of normal maintenance. It should be revised only when the document’s purpose, audience, or high-level scope materially changes.

It is not a miniature Changelog and should not become a dense capability inventory.

### 3.2 Quick Navigation

Each document should include a short linked contents list near the top. The goal is to help a human reader reach the correct section quickly without scanning a long document.

Quick Navigation should point to the document’s major tasks, not every subheading.

### 3.3 Document Role and Boundaries

This short section must say what the document owns and what it deliberately does not own.

Example:

- README: public orientation and user workflows; not exhaustive architecture.
- Maintainer’s Guide: current architecture and contracts; not full commit history.
- Charter: process rules and decision governance; not broad product manual.
- Changelog: historical record and checkpoint chronology; not detailed module specification.

### 3.4 Current Synchronized Checkpoint

Use one consistent compact block in every core document:

```text
Current synchronized checkpoint:
<short hash> — <commit message>
Branch: main
Status: local and origin/main aligned after the latest sync ritual
```

Only the Changelog should provide expanded milestone interpretation. Other documents should link or refer to the Changelog’s current-checkpoint section.

If no fresh sync ritual has been supplied, do not invent or infer a checkpoint.

---

## 4. Primary document ownership

| Information type | Primary home | Secondary documents should do |
|---|---|---|
| Public purpose, audience, core capabilities | README | Link or provide concise orientation |
| User-facing workflows and data-input guidance | README | Reference authoritative architecture where needed |
| Current application architecture | Maintainer’s Guide | Provide concise overview only |
| Module ownership and code boundaries | Maintainer’s Guide | Link to guide |
| Data lifecycle and scope vocabulary | Maintainer’s Guide | Use consistent terms |
| Fragile zones and regression checks | Maintainer’s Guide | Charter requires preflight but does not duplicate full matrix |
| Mandatory workflow rules | Project Workflow Charter | Reference them concisely |
| Source-of-truth, delivery, recovery, commit rules | Project Workflow Charter | Follow them; do not replicate in detail |
| Non-obvious decision rationale | Project Workflow Charter | Link or summarize only |
| Current checkpoint and milestone chronology | Changelog | Cite/reference only |
| Full commit history | Changelog | Never duplicate full history |
| Deferred, archived, and rolled-back work | Changelog for historical record; Maintainer’s Guide for active technical backlog | Reference appropriate status |
| Screenshots and public visual documentation | README | Mention only when historically relevant |
| Documentation governance rules | This protocol and Project Workflow Charter | Apply, do not duplicate wholesale |

---

## 5. README ownership and intended structure

### 5.1 Role

The README is Peridot’s public orientation and user-facing entry document.

It should help a new reader understand:

- what Peridot is;
- who it is for;
- what kinds of data it supports;
- what workflows are available;
- how to install/run it;
- how to begin using it;
- where to find technical maintenance and historical documentation.

### 5.2 Intended structure

```text
Title
Executive Summary
Quick Navigation
Document Role and Boundaries
Current Synchronized Checkpoint

1. What Peridot Is
2. Audience, Research Uses, and Supported Data
3. Current Public Workflow
   - Start
   - Load and map data
   - Visualize
   - Explore and inspect
   - Export
   - Send feedback
4. Current Interface Examples
5. Historical Interface Archive
6. Install and Run Locally
7. Data-Input Guide
8. Known User-Facing Limitations
9. Documentation and Project References
10. Author, License, and Attribution
```

### 5.3 README should own

- public product description;
- public workflows;
- basic installation/development instructions;
- data-input overview and user-facing constraints;
- current screenshots and historical screenshot archive;
- concise user-facing limitations;
- links to repository, core documentation, and relevant planning documents;
- licensing/asset attribution appropriate for public readers.

### 5.4 README should not own

- exhaustive module-by-module architecture;
- long fragile-zone lists;
- full commit/milestone narratives;
- detailed recovery rules;
- long decision logs;
- duplicated complete technical contracts.

Where technical context is needed, provide a short explanation and direct readers to the Maintainer’s Guide or Charter.

---

## 6. Maintainer’s Guide ownership and intended structure

### 6.1 Role

The Maintainer’s Guide is the authoritative current architecture and maintenance reference.

It should allow a new developer or future continuation session to answer:

- What does the app’s current architecture look like?
- Which file or subsystem owns this behavior?
- Which data/state contracts matter?
- What is fragile?
- What must be tested after changing this system?
- Which active technical tasks remain?

### 6.2 Intended structure

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

### 6.3 Maintainer’s Guide should own

- current source structure;
- current application and workspace architecture;
- module/component ownership;
- data-flow and scope terminology;
- current state contracts for Search, Timeline, Analytics, Inspector, Data Import, Theme, and Export;
- stylesheet ownership and import order;
- fragile-zone descriptions;
- regression test matrices;
- active technical backlog;
- compatibility paths that still exist in source;
- concise current architecture context for future handoffs.

### 6.4 Recommended contract-table pattern

Use tables where possible to make dense architecture easier to scan:

| System | Owner | Inputs | Outputs | Sensitive coupling | Minimum regression checks |
|---|---|---|---|---|---|

Use prose beneath a table only where explanation, rationale, or edge cases are necessary.

### 6.5 Maintainer’s Guide should not own

- full commit log;
- large chronological milestone lists;
- complete workflow-law text;
- public screenshot gallery;
- broad product marketing/orientation prose;
- duplicate historical narratives already preserved in the Changelog.

A Maintainer’s Guide may cite a relevant commit/hash when it materially clarifies a current compatibility boundary, but it should not reproduce long commit sequences.

---

## 7. Project Workflow Charter ownership and intended structure

### 7.1 Role

The Project Workflow Charter is the controlling process and governance document for safely changing Peridot.

It defines how work is done, not the full technical specification of the app.

### 7.2 Intended structure

```text
Title
Executive Summary
Quick Navigation
Document Role and Boundaries
Current Synchronized Checkpoint

1. Non-Negotiable Operating Rules
   - source of truth
   - bounded pass
   - full-file review
   - fragile-zone preflight
2. Delivery, Testing, and Commit Protocol
3. Recovery Protocol
4. Documentation Maintenance Policy
5. Dependency and Tooling Freeze
6. Project-Specific Operating Cautions
7. Decision Records by Domain
   - data policy
   - routing and workspace model
   - Inspector
   - Search and data scope
   - Analytics
   - theming and visual language
   - export
8. Standard Handoff and Completion Template
```

### 7.3 Charter should own

- source-of-truth rules;
- applied-file continuity rule;
- bounded-pass rule;
- full-file review/replacement rules;
- fragile-zone preflight requirement;
- delivery-format rules;
- commit/checkpoint distinction;
- recovery protocol;
- sync ritual;
- documentation-maintenance requirements;
- dependency/tooling freeze;
- rules for future structural work;
- curated decision records that explain non-obvious project choices.

### 7.4 Charter should not own

- exhaustive module descriptions;
- detailed subsystem contracts;
- repeated current feature inventories;
- full milestone/commit lists;
- broad user workflows;
- screenshot documentation.

### 7.5 Decision-record standard

Decision records must be grouped by domain, not maintained as one flat cumulative list.

Each decision record should use a consistent format:

```text
Decision:
Context:
Chosen approach:
Rejected alternative:
Reason:
Maintenance consequence:
```

Do not delete older decisions merely because they are no longer active. Move superseded decisions into an “Archived or Superseded Decisions” subsection, with a clear replacement reference.

---

## 8. Changelog ownership and intended structure

### 8.1 Role

The Changelog is Peridot’s authoritative historical record.

It should answer:

- What is the current synchronized checkpoint?
- What changed recently?
- When did a feature, architecture boundary, or decision enter the project?
- What was deferred, archived, or rolled back?
- What was the exact commit sequence?

### 8.2 Intended structure

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

### 8.3 Changelog should own

- the detailed current checkpoint;
- concise newest-first milestone summaries;
- deferred/archived/rolled-back records;
- complete reverse-chronological Git history;
- historical context necessary for regression diagnosis and handoff.

### 8.4 Changelog should not own

- broad current architecture explanation;
- extensive module ownership text;
- repeated user workflow descriptions;
- full current technical contracts;
- workflow process rules.

### 8.5 Baseline rule

The Changelog is the only core document that should contain a detailed description of the current checkpoint and its significance.

Do not retain multiple competing “current baseline,” “historical documented safe baseline,” “current branch status,” or duplicate current-state sections. Consolidate them into:

- one current synchronized checkpoint;
- one recent-milestone section;
- one archive/deferred section;
- the full historical table.

Older baseline narratives must remain preserved either in their original historical milestone entry or in the full history table.

---

## 9. Cross-reference rules

When content belongs primarily in another core document:

- summarize it in one or two sentences;
- name the owning document;
- link to the relevant heading when Markdown anchors are practical;
- do not copy the entire section.

Examples:

- README: “For architecture and module ownership, see the Maintainer’s Guide.”
- Maintainer’s Guide: “For the required source-of-truth and delivery process, see the Project Workflow Charter.”
- Charter: “For the full Search regression matrix, see the Maintainer’s Guide.”
- Changelog: “For the present module contract, see the Maintainer’s Guide.”

Cross-reference is not deletion. It is the preferred alternative to duplicate exhaustive prose.

---

## 10. Additive preservation and rewrite safeguards

### 10.1 Default rule

Core documentation is additive and exhaustive by default.

Do not casually rewrite, condense, or remove detailed body text. A clearer structure must not become a reason to lose the conditions, constraints, examples, or historical rationale contained in an older section.

### 10.2 What may be revised

Normal maintenance may revise:

- Executive Summaries, under the stated limits;
- table of contents / Quick Navigation;
- document-role statements;
- current checkpoint block;
- cross-references;
- section ordering;
- headings;
- clearly duplicated statements, when one authoritative version remains;
- clearly obsolete or misleading claims, when corrected explicitly;
- style/grammar that does not change meaning.

### 10.3 What requires explicit preservation review

Before changing any of the following, identify where the information will remain available:

- historical milestones;
- decision rationale;
- fragile-zone cautions;
- rollback lessons;
- compatibility constraints;
- user data policy;
- access/visibility decisions;
- accepted interface models;
- scope definitions;
- test expectations;
- file/path/location references;
- external-asset licensing or attribution statements.

### 10.4 Historical labels

Use explicit labels such as:

- Current
- Historical
- Archived
- Deferred
- Rolled back
- Superseded
- Compatibility path
- Experimental

Do not leave a historical statement unmarked where a reader could reasonably mistake it for active instruction.

---

## 11. Current checkpoint and terminology maintenance

### 11.1 Checkpoint synchronization

At each major documentation refresh:

1. use the most recent clean sync ritual;
2. update the standardized checkpoint block in all four documents;
3. update the detailed checkpoint description only in the Changelog;
4. update current architecture implications in the Maintainer’s Guide;
5. update public-facing implications in the README;
6. update Charter content only if process rules changed.

### 11.2 Scope vocabulary

Use the following terms consistently unless the implementation changes their meaning:

- **loaded data**: all records currently loaded into the app;
- **mapped/normalized data**: records after accepted import mapping and internal transformation;
- **applied or filtered data**: records currently included after Advanced Search filters are committed;
- **timeline-visible data**: records within the current timeline range/playback moment;
- **selected data**: a record, node, edge, cluster, person/entity, place, or route currently selected for inspection;
- **charted data**: records or derived values currently supplied to a chart;
- **exported data**: the specific loaded, filtered, visible, selected, or charted output identified by an export action.

Until the formal Search and Timeline/Analytics audits are complete, do not overstate that all surfaces apply these scopes identically. Use precise language and identify uncertainty where appropriate.

---

## 12. Documentation-pass completion checklist

Before delivering a documentation pass:

### Current-state checks
- [ ] Current checkpoint is confirmed from a clean sync ritual.
- [ ] No stale “current baseline” statements remain.
- [ ] Current branch/source-of-truth language is accurate.
- [ ] New files, stylesheets, routes, or public controls are documented in their proper primary home.

### Ownership checks
- [ ] Each new fact is in its primary document.
- [ ] Cross-document references replace unnecessary duplicated prose.
- [ ] README remains public/user-oriented.
- [ ] Maintainer’s Guide remains architecture/maintenance-oriented.
- [ ] Charter remains process/governance-oriented.
- [ ] Changelog remains chronology/history-oriented.

### Preservation checks
- [ ] No historical rationale was silently dropped.
- [ ] Rolled-back/deferred/archived work remains discoverable.
- [ ] Compatibility cautions remain present or are relocated with a reference.
- [ ] Licensing and asset-origin statements remain intact.
- [ ] Screenshot captions distinguish current and historical interface states.

### Navigation checks
- [ ] Executive Summary is present and appropriately scoped.
- [ ] Quick Navigation is present.
- [ ] Headings are human-readable and non-duplicative.
- [ ] Long lists are grouped, tabled, or cross-referenced where appropriate.
- [ ] Historical content is visibly labeled.

### Delivery checks
- [ ] All four core documents were reviewed in full before edits.
- [ ] Replacements were generated from the current committed/local source.
- [ ] Changes are described as a bounded documentation pass.
- [ ] Copy commands use the current project source-of-truth path.
- [ ] Commit message describes the documentation outcome.
- [ ] The Changelog receives the completed documentation-pass entry.

---

## 13. Restructuring protocol

When carrying out a major documentation reorganization:

1. Create a section-mapping plan before editing.
2. List each current long section and its future destination.
3. Mark whether it will be:
   - retained in place;
   - moved;
   - summarized with cross-reference;
   - archived;
   - corrected as obsolete.
4. Do not perform content deletion without identifying a retained authoritative replacement or archive location.
5. Make the restructuring as one dedicated documentation pass.
6. Review all four documents together after restructuring.
7. Verify:
   - no broken internal links;
   - no stale file paths;
   - no duplicate competing checkpoints;
   - no lost historical milestone;
   - no loss of decision or compatibility rationale.
8. Record the restructuring decision and its purpose in the Changelog.

---

## 14. Standing instruction for future documentation work

Before every Peridot core-documentation pass:

1. Read this protocol.
2. Read the current full versions of the README, Maintainer’s Guide, Project Workflow Charter, and Changelog.
3. Identify the primary home of each new fact.
4. Preserve detailed historical and technical knowledge unless it is demonstrably obsolete, duplicated by a retained authoritative statement, or moved to a clearly labeled archive.
5. Use cross-references to reduce duplicate current-state prose.
6. Keep the documents distinct in purpose:
   - README = public orientation and user workflows;
   - Maintainer’s Guide = architecture and maintenance contracts;
   - Charter = workflow governance and decision process;
   - Changelog = historical and commit record.
7. Update the current checkpoint consistently, with detailed interpretation in the Changelog only.
8. Run the documentation-pass completion checklist before delivery.

This protocol should be reviewed whenever the project’s documentation architecture itself changes. It should otherwise remain stable so it can prevent goal drift across future passes.
