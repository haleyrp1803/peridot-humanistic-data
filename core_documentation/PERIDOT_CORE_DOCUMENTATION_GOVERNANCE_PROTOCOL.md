# Peridot Core Documentation Governance Protocol

## Purpose

This protocol governs **how Peridot’s core documentation is maintained**, so that it remains accurate, readable, navigable, technically dependable, and historically accountable. Its primary audience is ChatGPT and future maintainers responsible for documentation changes. It also makes the standards visible to Haley, who approves decisions about scope, preservation, and acceptance.

It applies to four core documents:

- `core_documentation/README.md` — public orientation, research workflows, and accessible terminology.
- `core_documentation/MAINTAINERS_GUIDE.md` — current architecture, subsystem contracts, maintenance references, and technical terminology.
- `core_documentation/PROJECT_WORKFLOW_CHARTER.md` — binding procedures and decision governance for development collaboration.
- `core_documentation/CHANGELOG.md` — the full development record and historical evidence.

**How to use this protocol:** Before a core-documentation pass, establish the current authoritative files, read the Charter and this protocol, complete the preflight in Section 2, identify which document owns each fact (Section 4), and apply the preservation requirements in Sections 10–13. A newcomer need not memorize every provision: use the task-oriented index below and follow its linked procedures. Historical detail is deliberately retained, but current claims and operating rules must be clearly distinguished from archival evidence.

**Relationship to the Charter:** The [Project Workflow Charter](PROJECT_WORKFLOW_CHARTER.md) governs all Peridot work, including exact-source review, bounded passes, recovery, delivery, and the **Golden Rule: when consequential uncertainty remains, ask Haley rather than guessing**. This protocol adds the documentation-specific requirements; it does not replace or weaken the Charter. If the two appear to conflict, surface the discrepancy and ask Haley rather than silently choosing an interpretation.

## Quick Navigation — When You Need To…

| Task | Go to |
|---|---|
| Understand why the Protocol exists | [Governing principles](#1-governing-principles) |
| Begin a documentation change | [Required preflight](#2-required-preflight-before-every-documentation-pass) |
| Decide whether to proceed, clarify, or stop | [Documentation-change decision tree](#21-documentation-change-decision-tree) |
| Format onboarding and contents | [Front matter and navigation](#3-reader-orientation-and-navigation) |
| Decide where information belongs | [Document ownership](#4-primary-document-ownership) and [document-specific contracts](#5-readme-ownership-and-current-approved-structure) |
| Make a README change | [README](#5-readme-ownership-and-current-approved-structure) |
| Make a Maintainer's Guide change | [Maintainer's Guide](#6-maintainers-guide-ownership-and-current-approved-structure) |
| Make a Charter change | [Charter](#7-project-workflow-charter-ownership-and-current-approved-structure) |
| Make a Changelog change | [Changelog](#8-changelog-ownership-and-current-approved-structure) |
| Link to other documents/plans | [Cross-references](#9-cross-reference-rules) |
| Reorganize, consolidate, or correct text | [Preservation and rewrite safeguards](#10-preservation-and-rewrite-safeguards) |
| Handle checkpoint or scope terminology | [Checkpoint and terminology maintenance](#11-current-checkpoint-and-terminology-maintenance) |
| Check a draft and its bundle | [Completion checklist](#12-documentation-pass-completion-checklist) |
| Undertake a major reorganization | [Restructuring protocol](#13-restructuring-protocol) |
| Complete a handoff | [Standing instructions](#14-standing-instruction-for-future-documentation-work) |

## Governing Interpretation: Protect the Reason, Not Just the Wording

**Intention:** Prevent either of two failures: rigidly preserving obsolete formatting as though it were historical evidence, or rewriting useful technical and historical content merely because a cleaner layout is possible.

**Origin / context:** Earlier additive-first documentation preserved important development history but accumulated duplicated summaries, stale current-state claims, and difficult-to-navigate technical material. The accepted reorganization of the README, Maintainer's Guide, and Changelog deliberately introduced reader-specific onboarding, extensive linked navigation, scan-friendly summaries, appendices and glossaries, while retaining substantive contracts and historical evidence. The Charter similarly gained a Golden Rule, decision trees, risk-based verification, and rule-intention explanations. These are intentional governance decisions, not accidental exceptions.

**Requirement:** Preserve the substance that matters; use verified reorganization to make it findable. Historical evidence, authorship, technical contracts, and failure lessons deserve stronger preservation than outdated headings, duplicated navigation, and obsolete presentation scaffolding. A change in location or wording still requires an explicit semantic-preservation check.

**If uncertain:** Explain precisely what is at risk and ask Haley. Do not invent history, silently waive an existing rule, or proceed with destructive consolidation.

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


### 1.6 Presentation may change when substantive knowledge is protected

**Intention:** Permit the reader-oriented, preservation-audited restructuring already accepted by Haley without eroding institutional memory.

A separately authorized structural documentation pass may regroup, reformat, paraphrase, consolidate, or relocate content when it preserves all unique technical, historical, legal/attribution, and decision-relevant meaning. Ordinary updates remain additive by default. Verbatim preservation is required for authored statements where the wording itself is part of the authorship claim, unless the author expressly approves an edit. A word-for-word match is neither necessary nor sufficient to establish preservation of technical meaning; verify meaning and context separately. See Sections 10 and 13.

---

## 2. Required preflight before every documentation pass

**Intention:** Avoid producing a plausible-looking replacement from stale inputs, mixing document ownership, or destroying information during a readability pass.

**Origin / context:** Peridot's evolving documentation has included locally applied files not yet committed, older uploaded versions with similar filenames, and lengthy historical material that can look redundant until its purpose is understood.

Before editing:

1. **Establish source authority.** Read this protocol and the current **complete** versions of all four core documents. For a core-document edit, derive the replacement from the exact current document, not from snippets or reconstructed text. Confirm the latest Git synchronization and identify any later locally applied/uncommitted file as the authority for that file. Use the Charter's source-of-truth decision tree.
2. **Confirm authorization and scope.** State the documentation-only bounded pass, its exact target files, intended changes, out-of-scope material, and an acceptance check. Distinguish agreed plans from permission to implement.
3. **Classify the work.** Mark as current-state update, milestone/history update, structural/navigation improvement, terminology correction, cross-document synchronization, archival clarification, or a combination *within the approved documentation pass*.
4. **Assign authority.** Identify the primary document for each fact; identify secondary documents that should link rather than duplicate the authoritative treatment.
5. **Map preservation.** Record what must remain verbatim, what must remain semantically complete, what may be moved/consolidated, and what is historical, superseded, or factually uncertain.
6. **Identify verification evidence.** Plan source-comparison, link, cross-document, artifact-integrity, and—when claims require it—source-code or deployment verification. Do not claim verification that was not performed.
7. **Check relevant historical and planning context.** Consult planning documents when their contents are materially relevant to the proposed change, particularly when they establish design rationale, preservation constraints, or historical context. The implemented `planning_documents/PERIDOT_CORE_DOCUMENTATION_RESTRUCTURING_PLAN.md` is retained for provenance but is not required reading for routine documentation passes and does not override the current Governance Protocol or Project Workflow Charter. If a planning document’s authority is unclear, ask Haley rather than assuming.
8. **Choose an outcome:** **Proceed** when all mandatory conditions are satisfied; **Clarification required** when a consequential instruction or preservation choice is ambiguous; **Blocked** when exact current source or another non-waivable prerequisite is missing.

### 2.1 Documentation-change decision tree

**Why this exists:** A reorganization can be aesthetically successful and still destroy a technical caveat, incorrectly attribute authorship, or promote a historical state into a current rule.

1. **Is the exact, current, authoritative source available and read in full?** If **no**, stop; obtain it. A confirmed commit does not itself provide exact raw source bytes to an environment that cannot access them.
2. **Is the edit authorized and within the bounded pass?** If **no or unclear**, ask Haley. Do not treat prior discussion alone as scope expansion.
3. **What kind of material is affected?** Identify: authored text; technical contract/invariant; historical evidence or decision rationale; current factual claim; navigation/presentation; or duplicated/obsolete description. Several categories may apply.
4. **What preservation condition applies?** Keep authored words verbatim absent consent; preserve technical and historical meaning in full; maintain accurate provenance and status; permit formatting/navigation replacement where no unique substance is lost.
5. **Is the proposed result technically and historically supported?** Check current contracts and evidence. If proof is missing, mark the claim unverified, do not infer it. If there is a meaningful conflict, ask Haley.
6. **Can the revision be checked and delivered without exceeding scope?** If **yes**, proceed and record verification. If **uncertain**, request clarification. If **no**, stop and state the missing prerequisite.

**Interpretation:** The decision tree clarifies the existing binding requirements. It does not create permission to discard evidence, bypass exact-source review, or quietly change the meaning of a requirement.

---

## 3. Reader Orientation and Navigation

**Intention:** Make each document approachable for its actual audience without imposing a rigid layout that defeats that purpose.

**Origin / context:** Fixed identical front matter and deliberately short contents lists became poor fits for the accepted three-level Maintainer's Guide, the indexed Changelog, and the reader-first README. Each now has a distinct onboarding strategy.

### 3.1 Required orientation, flexible ordering

Every core document must have a clear title, a concise **Executive Summary**, a plain-language account of its audience and purpose, usable navigation, and a clear statement of its authority and boundaries. The Executive Summary remains normally one or two paragraphs and is not a miniature changelog. Additional *How to Use* onboarding belongs where it helps readers. The exact ordering of onboarding, contents, role/boundary statements, and checkpoint references may differ among documents, consistent with the accepted structure.

The Executive Summary is routinely eligible for focused non-additive maintenance when purpose, audience, or scope changes. A separately authorized, preservation-verified structural pass may also reorganize the rest of a document under Sections 10 and 13.

### 3.2 Navigation proportional to complexity

Use direct Markdown links to the headings and tasks readers actually seek. In long documents, include relevant subsection links, indexed domains, time periods, and glossary ranges. Do not artificially restrict the contents to major headings, and do not make it so exhaustive that the entry point becomes difficult to scan. Check link targets after edits. Provide contextual links between summary and detailed material where useful; cross-references supplement, not replace, a usable local index.

### 3.3 Document role and boundaries

Explain the primary information the document owns and the material it deliberately delegates elsewhere. This may appear as a dedicated section, introductory paragraph, or clearly labeled equivalent where discoverable. Section 4 governs ownership.

### 3.4 Current-checkpoint references

Use the Changelog as the single authoritative **detailed** checkpoint record. Secondary documents may give a compact, clearly sourced checkpoint and should not maintain duplicated competing status blocks. Do not assert that a Git commit includes later locally applied, uncommitted revisions. Verify currency from the latest user-confirmed sync ritual, and explicitly state local-file exceptions. If no fresh sync evidence is available, mark the checkpoint as last confirmed rather than pretending it is current.

### 3.5 Glossaries and accessibility

The README contains accessible explanations for researchers, while the Maintainer's Guide contains more precise technical definitions for developers. Define specialized terminology near first use where helpful, and link to the glossary for deeper reference. A long glossary is acceptable when it meaningfully serves readers and remains easy to navigate. Distinguish **Not applicable** from **Not verified** in structured technical references.

---

## 4. Primary document ownership

**Intention:** Give each category of information one authoritative home, reducing contradictory copies while preserving useful references in other documents.

**Origin / context:** Earlier docs sometimes repeated current product state with slightly different wording. The accepted three-information-document redesign makes a single current contract plus links more reliable than repeated descriptions.

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

## 5. README Ownership and Current Approved Structure

### 5.1 Role

The README is Peridot's public orientation and researcher's entry document. It should explain what the project is, who may use it, how to get started, how to interpret and prepare data, where to find help, and how to find the technical and historical records without demanding prior programming knowledge.

### 5.2 Approved structure (README v02)

1. Executive Summary, *How to Use This README*, and Quick Navigation.
2. Welcome to Peridot, including project purpose and collaboration disclosure.
3. What You Can Do and What Data You Can Use.
4. Getting Started and Using Peridot.
5. Preparing and Mapping Data (summaries plus detailed reference).
6. Installing and Running Locally.
7. Interface Examples and Historical Gallery.
8. Known Limitations.
9. Alphabetical Glossary of Terms (69 entries at acceptance).
10. Documentation, Attribution, and Licensing.

These describe the accepted information architecture, **not immutable headings or a prohibition on future improvements**. Use short prose, tables, ordered steps, and expandable historical content where appropriate; protect substantive user guidance and source attribution. Maintain the user's original personally authored AI-collaboration disclosure **verbatim** unless Haley explicitly requests edits to its wording.

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


**Verification:** Confirm a newcomer can locate core functions and data requirements without reading historical notes first; verify links, interface-status captions, glossary terms, citations/credits, and exact preservation of personally authored text.

## 6. Maintainer's Guide Ownership and Current Approved Structure

### 6.1 Role

The Maintainer's Guide is the authoritative technical reference for current architecture, responsibility boundaries, source/data contracts, fragile coupling, regression checks, and continuation by a new human or AI maintainer.

### 6.2 Approved three-level information architecture (Maintainer's Guide v04)

**Level 1 — Architecture at a Glance.** *Purpose: Help a new maintainer understand Peridot's principal systems, their responsibilities, and their relationships.* Each system uses predictable fields: Description; Function/purpose; Primary modules; Data/dependencies; Critical invariants; Detailed reference.

**Level 2 — Authoritative Subsystem Contracts.** *Purpose: Give a developer enough information to understand and safely modify a particular system.* Each contract covers Purpose/scope; Module ownership; Inputs/data contracts; Outputs/consumers; Behavior/interaction; Invariants; Fragile dependencies; Verification; Known limitations/deferred work; Historical context/related planning documents.

**Level 3 — Maintenance and Implementation Reference.** *Purpose: Preserve deeper technical information needed when changing, debugging, or extending the application.* Individual module, fragile-zone, and compatibility/historical entries use their applicable standard fields, with full implementation notes retained. Keep a technical glossary with links back to current contracts (83 entries at acceptance).

The accepted guide contains ten principal systems at Levels 1 and 2. Use a substantive but navigable contents list, links between levels, labeled historical material, and verified planning-document references. **Keep the standard fields visible even when the entry does not apply; write "Not applicable."** Write **"Not verified"** when relevant information cannot be established, rather than misclassifying it as irrelevant or inventing it.

### 6.3 Maintainer's Guide should own


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

### 6.4 Contract format and technical depth

Tables are useful for brief comparisons, but they must not replace prose required to convey technical semantics, decision rationale, implementation hazards, or edge cases. Apply the standard templates to individual relevant entries—not merely a header atop an otherwise unstructured inventory. Cross-link detailed references rather than repeating contradictory copies of the current contract.

### 6.5 Maintainer's Guide should not own


- full commit log;
- large chronological milestone lists;
- complete workflow-law text;
- public screenshot gallery;
- broad product marketing/orientation prose;
- duplicate historical narratives already preserved in the Changelog.

A Maintainer’s Guide may cite a relevant commit/hash when it materially clarifies a current compatibility boundary, but it should not reproduce long commit sequences.

---


**Verification:** Check module names against the available source tree, contract meanings against current authoritative code where possible, and cross-links to planning documents; qualify any technical claim not independently source-verified.

## 7. Project Workflow Charter Ownership and Current Approved Structure

### 7.1 Role

The Charter controls **how** Peridot changes are performed and how uncertainty, source authority, risk, recovery, delivery, testing, and decision history are handled. It is primarily an operating manual for ChatGPT, with its reasoning and obligations accessible to Haley and future human maintainers.

### 7.2 Approved structure (Charter v03, committed at `9f63175`)

- Executive Summary and prominent **Golden Rule: When in Doubt, Ask Haley**.
- Task-oriented operational index; required preflight with **Proceed / Clarification required / Blocked** outcomes.
- Source-of-truth decision tree, exact-source and applied-file continuity requirements.
- Bounded-pass and scope-expansion rules; complete-file review; fragile-zone preflight.
- Delivery, risk-based build/testing, Git and sync protocols.
- Non-destructive recovery and preservation of unrelated/uncommitted work.
- Documentation maintenance policy and dependency/tooling freeze.
- Current cautions and status-labeled decision records, with intention, origin, requirements, prohibitions, failure handling and verification guidance.
- Standard handoff and completion procedures.

**Status clarification:** Charter v03 and the Governance Protocol revision were committed at `9f63175` after their approved historical-plan reference corrections. This succeeds the earlier `d5d7a1b` documentation checkpoint; the previous locally applied/uncommitted status is historical, not current.

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

Retain the original six decision fields—**Decision, Context, Chosen approach, Rejected alternative, Reason, Maintenance consequence**—and add status plus the superseding/current authority where applicable. Mark a decision as Current, Historical, Deferred, Superseded, Rolled back, or Compatibility, using the actual evidence. Do not invent the status of an uncertain historical decision. Preserve the narrative and rationale even when it no longer governs today's behavior.

**Verification:** A new assistant should be able to identify the trigger, binding action, prohibition, handling of uncertainty, and completion evidence for a critical rule without inferring intent from multiple conflicting paragraphs.

---

## 8. Changelog Ownership and Current Approved Structure

### 8.1 Role

The Changelog is the authoritative development-history record, preserving the sequence, circumstances, setbacks, successes, decisions, and evidence of the human–AI development collaboration.

### 8.2 Approved structure (Changelog v04)

1. Executive Summary and approachable **How to Use This Changelog** introduction.
2. Quick Navigation and clear document boundaries.
3. One authoritative **Current Synchronized Checkpoint** section.
4. **Find by Area and Period** indexes.
5. **Full Development History** table (619 entries at acceptance), with exact recorded messages and navigable links to detailed accounts.
6. Expandable **Detailed Milestone Archive** and **Historical Checkpoint Evidence**.
7. **Deferred, Archived, and Rolled-Back Work**, explicitly distinguished from active priorities.

The full history table is a central navigation tool, not an appendix to a recent-milestone narrative. Retain older milestone reasoning and checkpoint accounts in discoverable expandable archives. Do not change historical commit messages or portray the archive's past status as current.

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

Keep exactly one **detailed authoritative** current synchronized checkpoint. Secondary documents may include a compact verified reference, but must not maintain competing baseline narratives. Retain older checkpoint evidence as explicitly historical material linked from the full record. Never invent commit history or imply an uncommitted local document is part of an older commit.

**Verification:** Check all history rows, message fidelity, area/period indexes, milestone links, archive disclosures, and whether status language is appropriately time-bounded.

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


### Planning-document references and status

Link relevant planning and style documents from the point of use (for example, a Timeline layout-risk record from the associated fragile zone, or the Editorial Interface Style Guide from appearance contracts). Verify the exact filename/path and what the document actually supports. Distinguish active specification, approved plan, superseded proposal, and historical evidence. Do not imply an unavailable planning document was read or verified.

---

## 10. Preservation and Rewrite Safeguards

### 10.1 Default rule and its intention

**Default:** Core documentation is additive and exhaustive for new technical knowledge, decisions, milestones, and evidence. Editing for clarity does not justify loss of unique information.

**Intention:** Preserve the record of what Peridot does, how its design developed, what failed, and why choices were made, while allowing the documents to become easier to read and maintain.

**Origin / context:** Earlier strongly additive instructions guarded against lost knowledge, but also preserved obsolete navigation, duplicated current-state claims, and overly dense prose. Haley explicitly authorized the reader-oriented, preservation-audited reorganization of three information documents and the operational clarification of the Charter.

### 10.2 Categories of material and their preservation condition

| Material | What must be preserved | What may change with authorization and review |
|---|---|---|
| Historical events, decisions, failures, chronological evidence | Accurate facts, sequence, context, rationale, outcomes and traceability | Placement, headings, summary layout; never retroactively rewrite the historical record |
| Technical contracts, invariants, data semantics, and regression cautions | Complete obligations, conditions, edge cases, warnings and links to applicable current authority | Formatting or wording if semantic equivalence is checked; relocation with a clear destination |
| Personally authored statements and attribution | Exact original wording, credit and context when personal authorship is claimed | Only as expressly requested by the author; retain comparison evidence |
| Licensing, provenance and asset origin | Accurate source, usage restrictions, attribution, and distribution status | Organization and verified correction, without erasing historical provenance |
| Navigation, duplicated front matter, obsolete template fields | Their useful orientation function, not redundant literal scaffolding | Consolidation, reordering or removal where no unique information is lost |
| Obsolete or contradicted *current* claims | Historical truth if significant; correct active instruction/description | Explicit correction, status label, link to replacement, or documented retirement |
| Unverified technical claims or document paths | Truthful uncertainty, not a fabricated confirmation | Label Not verified and investigate/ask before making authoritative claims |

### 10.3 What may be revised

Routine non-additive changes are permitted to correct headings, navigation, cross-references, checkpoint references, grammar without semantic change, duplicated prose with one retained authority, and demonstrably outdated or misleading assertions. Executive Summaries may be updated within their orientation function. A **Haley-authorized structural pass** may reorganize and rewrite larger portions only with explicit mapping and preservation verification under Section 13. Neither path permits silent loss of unique information.

### 10.4 What requires explicit preservation review

Before modifying historical milestones; decision rationale; fragile-zone cautions; rollback lessons; compatibility constraints; user-data policy; access/visibility decisions; accepted interface models; scope definitions; test expectations; file/path locations; or licensing/attribution, identify the retained content, new location and verification evidence. Avoid introducing a plausible but unsupported interpretation. If preserving exact wording matters (notably a personally authored disclosure), verify it character for character.

### 10.5 Historical status labels

Use **Current**, **Historical**, **Archived**, **Deferred**, **Rolled back**, **Superseded**, **Compatibility path**, or **Experimental** as justified. A former decision may remain important as historical evidence even though it is not an active instruction. Label its time/status at the point of use, not only once elsewhere in the document.

### 10.6 Preservation verification is both mechanical and interpretive

Mechanical checks can establish line/character retention, exact authored text, file membership, link destinations, and diff scope. They cannot by themselves establish technical semantic equivalence, correct historical interpretation, or deployed application behavior. Include an interpretive check of affected contracts and decision narratives. Report any unresolved discrepancy accurately. A source comparison must distinguish **moved, revised, consolidated, archived, corrected, and genuinely removed** material; don't claim no content was lost solely because some text still appears elsewhere.

---

## 11. Current Checkpoint and Terminology Maintenance

### 11.1 Git state and locally applied files

**Intention:** Prevent a correct historical checkpoint from masquerading as the current working file and avoid multiple contradictory current-status accounts.

At a major documentation update:

1. Record the **last user-confirmed clean synchronized Git checkpoint**, including its date and commit ID. For this review, that is `9f63175` on `main`, clean and aligned with `origin/main` and `origin/HEAD` when last reported (2026-11-22).
2. Identify any later **locally applied but uncommitted changes** separately. The Charter v03 and Governance Protocol v01 revisions, previously uncommitted at `d5d7a1b`, were subsequently committed at `9f63175`; do not continue treating them as outstanding local edits.
3. Update the Changelog's authoritative checkpoint account when the underlying Git state actually changes and evidence is available. Do not invent a new checkpoint because a draft was prepared.
4. Keep secondary references concise, linked, and accurately labeled as last-confirmed; refresh them during relevant documentation synchronization rather than duplicating full milestone narratives across all documents.
5. If current file state is uncertain, apply the Charter's source-of-truth decision tree and ask Haley rather than selecting the easiest accessible version.

### 11.2 Canonical data-scope vocabulary

The Maintainer's Guide owns the current technical definitions of **loaded**, **mapped/normalized**, **applied/filtered**, **timeline/playback-visible**, **selected**, **charted**, and **exported** data. The README translates relevant concepts for new researchers. This protocol requires that documentation use these distinctions consistently; it does **not** create another independent implementation contract.

The earlier Protocol included an extensive scope-vocabulary account covering Advanced Search Results/Refine, visualization playback, entity/place dossiers, and undated chart records. This is preserved below as *historical governance context*, not substituted for the current authoritative source contract:

<details>
<summary>Historical scope-vocabulary notes from the prior Protocol (retained for provenance)</summary>

Use the following terms consistently unless the implementation changes their meaning:

- **loaded data**: all records currently loaded into the app;
- **mapped/normalized data**: records after accepted import mapping and internal transformation;
- **applied or filtered data**: records currently included after Advanced Search filters are committed;
- **timeline-visible data**: records within the current timeline range/playback moment;
- **selected data**: a record, node, edge, cluster, person/entity, place, or route currently selected for inspection;
- **charted data**: records or derived values currently supplied to a chart;
- **exported data**: the specific loaded, filtered, visible, selected, or charted output identified by an export action.

The formal Search and Timeline/Analytics scope audits are complete. Preserve the audited distinctions rather than implying that all surfaces use one interchangeable scope: Search Results/Refine use applied/filtered data, visualization playback uses timeline-visible data, entity/place dossiers use applied/filtered linked-record scope, and Analytics has its documented treatment of genuinely undated records.

</details>

**Verification:** When correcting a scope claim, examine the current Maintainer's Guide contract and relevant source if needed; distinguish source-verified facts from inherited historical assertions.

---

## 12. Documentation-Pass Completion Checklist

**Intention:** Ensure a revised document is readable *and* evidentially defensible. Record what was actually checked rather than representing a successful generation as a successful verification.

### Source authority and authorization

- [ ] Current complete source files and the Governance Protocol/Charter were read, including any locally applied versions not yet committed.
- [ ] Last user-confirmed Git checkpoint is identified; local uncommitted differences are recorded separately.
- [ ] The documentation-only bounded pass, file scope, and authorized changes are recorded.
- [ ] Preflight outcome is Proceed; otherwise a consequential ambiguity was clarified or work was blocked.

### Ownership and content preservation

- [ ] Each substantive fact has an appropriate primary home; other documents link rather than compete.
- [ ] Source-to-destination mapping accounts for retained, moved, rewritten, consolidated, archived, corrected, and deleted content.
- [ ] Historical reasoning, failures, rollback lessons, technical invariants, compatibility cautions, and regression requirements remain available and correctly characterized.
- [ ] Personally authored text remains verbatim unless express editing authorization was given.
- [ ] Licensing and asset-origin statements remain accurate and traceable.
- [ ] A human/AI interpretive review checked for semantic drift; not only a string/line match.

### Accuracy and reader usability

- [ ] Current claims are supported by the accepted documents, authoritative source, or explicitly qualified as unverified.
- [ ] Historical and superseded claims are labeled at the point where a new reader encounters them.
- [ ] Introductions and section organization suit the document's actual audience.
- [ ] Quick Navigation, indexed headings, glossary links, and cross-document anchors resolve.
- [ ] Planning-document paths and their current/historical status are verified or honestly marked unverified.
- [ ] No contradictory current checkpoint, procedure, or technical scope is introduced.

### Delivery and acceptance

- [ ] Replacement files derive from exact current sources; no file was regenerated from a stale snapshot or excerpt.
- [ ] Diff/preservation checks and any unresolved differences are disclosed in a report.
- [ ] Bundle integrity, internal paths, and intended file membership are checked; PowerShell copy commands match **the actual ZIP layout**.
- [ ] Relevant verification types are reported separately (mechanical checks, technical review, browser checks, deployment checks, and Haley's acceptance).
- [ ] Only intended paths are staged if committing; no `git add .` against unrelated work.
- [ ] The documentation outcome and its historical significance are recorded in the Changelog at the appropriate synchronization point; do not claim an uncommitted draft is committed.

---

## 13. Restructuring Protocol

**Intention:** Allow substantial readability and navigation improvements without the accidental loss, dilution, or misplacement of meaningful technical and historical information.

**Origin / context:** The accepted restructuring of README v02, Maintainer's Guide v04, and Changelog v04 used source comparisons, reorganized navigation, retained detailed archives, and document-specific onboarding. Several improvements were impossible under a literal ban on body reorganization; their acceptance does not relax preservation duties.

For a major reorganization:

1. **Authorize a bounded structural documentation pass** specifying target documents, goals, protected wording, and out-of-scope claims.
2. **Inventory the current source** and map each major original section to its planned destination (retained, moved, consolidated, corrected, historical archive, or genuinely removed).
3. **Protect information that cannot be compressed away:** contracts, conditions, unique examples, development rationale, failures, historical statuses, authored statements, and attribution.
4. **Separate current and historical authority.** Never promote an older practice because its wording sounds mandatory, and never erase that practice's historical significance solely because it is obsolete.
5. **Implement from the exact current source.** Keep a versioned draft and a reviewable change record. Do not bundle unrelated source-code changes.
6. **Verify mechanically:** text comparison as applicable, internal links and headings, source paths, version identification, file membership, archive integrity and application commands.
7. **Verify interpretively:** read the result for changed meanings, contradictory obligations, missing technical conditions, false chronology, and changes in attribution. A report of matching lines does not prove semantic equivalence.
8. **Reconcile related documents:** read and link the relevant current contracts; avoid duplicating their full content. Note any cross-document discrepancy without silently rewriting other files outside scope.
9. **Deliver as a review draft**, specifying what is verified, unverified, accepted, and not yet committed. Follow the Charter's ZIP and recovery rules.
10. **Record the accepted outcome** in the Changelog at the appropriate documentation synchronization; a draft or locally applied file is not automatically a Git commit.

Keep an archived copy or diff of any superseded governance scaffolding when its preservation value is uncertain. Retain consequential development history in the Changelog and relevant current cautions in the Maintainer's Guide. Do not use Git recoverability alone as an excuse to erase unique information from the current manual.

---

## 14. Standing Instruction for Future Documentation Work

**Before editing:** Read this protocol, the Charter, and the exact current full README, Maintainer's Guide, and Changelog; verify current/local source authority; identify the approved bounded task and the primary home of affected information.

**During editing:** Respect the Golden Rule. Apply the documentation-change decision tree and the appropriate preservation class. Improve clarity and navigation without silently removing the technical and historical record. Label superseded information and avoid inventing source verification, document contents, authorship, or commit status.

**Before delivery:** Run the Section 12 checklist; compare the revised artifact to the authoritative source; verify internal and external links as feasible, ZIP contents, and actual copy paths; report outstanding limitations. Preserve Haley's right to review and accept before treating a documentary revision as final.

**At synchronization:** Update the Changelog's development record and current checkpoint from user-confirmed evidence, and reconcile necessary references in the other documents without manufacturing a new Git state.

This protocol must be revisited when Peridot's documentation-maintenance architecture materially changes. Its protective principles should remain stable even when specific document layouts, app components, or development tools evolve.
