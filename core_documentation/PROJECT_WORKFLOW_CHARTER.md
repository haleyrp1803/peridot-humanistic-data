# Project Workflow Charter

## Executive Summary

This Charter is Peridot’s controlling process document for safely changing the project. It defines the source-of-truth rule, bounded-pass method, review and delivery safeguards, recovery protocol, testing/commit discipline, documentation policy, and durable decision governance.

Use it before every implementation or documentation pass. It governs **how** work is done; the Maintainer’s Guide governs the current architecture, the Changelog governs history, and the Core Documentation Governance Protocol governs preservation and ownership during core-documentation maintenance.

## The Golden Rule — When in Doubt, Ask Haley

**Intention:** Prevent avoidable mistakes caused by misunderstood instructions, uncertain source authority, or unwarranted confidence. Genuine questions are part of responsible human–AI collaboration, not evidence of failure.

**Origin / context:** Peridot's safeguards arose from real development problems. More effective communication can prevent an error before it requires a rollback, source recovery, or corrective documentation pass. Haley welcomes genuine questions and is generally happy to offer clarification or a deeper explanation when needed.

**Requirement:** If a consequential requirement, source file, scope boundary, technical decision, or instruction remains genuinely uncertain, **ask Haley rather than guessing**. State what is known, what is uncertain, why it matters, and the narrow question that would resolve it.

**Trigger:** Unresolved uncertainty that could materially affect correctness, safety, scope, preservation, or the truthfulness of a claim.

**Prohibited actions:** Do not manufacture confidence, conceal uncertainty, silently choose between materially different interpretations, or treat a plausible inference as verified fact. Do not repeatedly request confirmation of decisions already established in current authoritative materials.

**If clarification is unavailable:** Do not make an irreversible or potentially destructive change based on a guess. Finish only safely bounded, verifiable work; identify what remains unresolved.

**Verification:** A material ambiguity is either resolved with identified evidence, clarified by Haley, or explicitly marked as unresolved. Do not represent an unresolved assumption as accepted.

**Interpretation principle:** Follow each rule's explicit requirements **and** protect its stated intention. The intention explains how to recognize a dangerous shortcut; it is **not** permission to waive a mandatory requirement. If literal wording and the underlying safeguard appear to conflict, surface the conflict and apply the Golden Rule. Ordinary low-risk decisions governed by existing instructions should proceed without unnecessary questions.


## Quick Navigation

- [The Golden Rule — When in Doubt, Ask Haley](#the-golden-rule--when-in-doubt-ask-haley)
- [Operational index — When you need to…](#operational-index--when-you-need-to)
- [Required preflight and source-authority decision tree](#required-preflight-and-source-authority-decision-tree)
- [Non-negotiable operating rules](#1-non-negotiable-operating-rules)
- [Delivery, testing, and commit protocol](#2-delivery-testing-and-commit-protocol)
- [Recovery protocol](#3-recovery-protocol)
- [Documentation maintenance policy](#4-documentation-maintenance-policy)
- [Dependency and tooling freeze](#5-dependency-and-tooling-freeze)
- [Project-specific operating cautions](#6-project-specific-operating-cautions)
- [Decision records by domain](#7-decision-records-by-domain)
- [Standard handoff and completion template](#8-standard-handoff-and-completion-template)

## Operational Index — When You Need To…

*Purpose: Find the controlling procedure for the task in front of you. These links point to binding instructions; this index does not replace them.*

| When you need to… | Go to |
|---|---|
| Begin a development or documentation pass | [Preflight checklist and outcome](#required-preflight-before-each-pass) and [bounded-pass rule](#12-bounded-pass-rule) |
| Resolve a genuine ambiguity with Haley | [Golden Rule](#the-golden-rule--when-in-doubt-ask-haley) |
| Identify the authoritative source file | [Source-of-truth decision tree](#source-of-truth-decision-tree) and [applied-file continuity](#applied-file-continuity-rule) |
| Read and safely modify source code | [Full-file review and safe replacement](#13-full-file-review-and-safe-replacement) |
| Discover necessary changes outside approved scope | [Unexpected scope-expansion procedure](#unexpected-scope-expansion-procedure) |
| Work in a fragile subsystem | [Fragile-zone preflight](#14-fragile-zone-preflight-requirement) |
| Package and deliver replacements | [Delivery format](#delivery-format) |
| Decide which build/test is useful | [Risk-based build checks](#risk-based-build-checks-during-consecutive-passes) |
| Diagnose a regression or recover a working state | [Recovery protocol](#3-recovery-protocol) |
| Alter dependencies or tooling | [Dependency and tooling freeze](#5-dependency-and-tooling-freeze) |
| Interpret an old design decision | [Decision-status key](#decision-domain-index-and-status-reading-key) |
| Update core documents | [Documentation policy](#4-documentation-maintenance-policy) and [Governance Protocol](PERIDOT_CORE_DOCUMENTATION_GOVERNANCE_PROTOCOL.md) |
| Hand off to another conversation | [Fresh-chat handoff](#fresh-chat-handoff) |

## Document Role and Boundaries

This Charter owns mandatory process rules, source-of-truth continuity, delivery/recovery protocol, commit discipline, tooling constraints, and non-obvious decision governance. It does not own the exhaustive module map, regression matrix, screenshot archive, public product manual, or full commit history.

Current synchronized checkpoint:

```text
d5d7a1b — Reorganize core information documentation and add glossaries
Branch: main
Status: local and origin/main aligned after the latest user-confirmed sync ritual; working tree clean (2026-11-22, America/New_York)
```

For detailed milestone interpretation and full commit history, see [CHANGELOG.md](CHANGELOG.md).


## Required Preflight and Source-Authority Decision Tree

*Purpose: Turn the Charter's already-binding safeguards into an ordered check that a new AI session can follow before changing anything. This guide clarifies the rules; it does not create exceptions to them.*

### Required preflight before each pass

| Check | Required determination | If unresolved |
|---|---|---|
| **Authority** | Which exact current local file, uploaded file, or verified commit governs each affected file? | Apply the Golden Rule; do not edit an uncertain source |
| **Permission** | What change has Haley authorized, and what remains a proposal or discussion? | Ask before implementing a materially different choice |
| **Pass type** | Exactly one: behavior, visual, structural, or documentation | Clarify scope before mixing types |
| **Boundaries** | In-scope files/regions and deliberately out-of-scope regions | Do not silently enlarge scope |
| **Fragility** | What downstream behavior or researcher data semantics could regress? | Consult the Maintainer's Guide and affected source |
| **Acceptance** | What plain-language result and checks establish success? | Specify a test before editing |
| **Delivery** | What ordinary files/ZIP and verified application steps are needed? | Do not improvise an unverified handoff |

**Preflight outcome — choose one before editing:**

- **Proceed:** The mandatory conditions are satisfied and the authorized bounded change can begin.
- **Clarification required:** A consequential instruction, choice, or source-authority question remains ambiguous. Explain it briefly and ask Haley the focused question that resolves it. Do not execute the ambiguous change.
- **Blocked:** A required technical condition is absent—for example, complete exact raw source is inaccessible or a required safeguard cannot be met. Do not edit; identify what source or prerequisite is missing. If the blockage also requires a human decision, ask Haley rather than inventing an exception.

**Completion criterion:** Record the outcome in the pass preflight at an appropriate level of detail. A recommendation to proceed is not permission to enlarge the already agreed scope.

### Source-of-truth decision tree

**Why this exists:** Local changes may be accepted and tested before a Git commit. A clean historical commit or an easily retrieved older copy must not overwrite newer approved work. The authoritative *revision* and availability of its *exact contents* are separate questions.

1. **Has Haley explicitly identified the source for this pass?** If yes, identify its exact version and check that no later applied changes supersede it. If no, use the most recent user-confirmed sync ritual and any confirmed subsequent local changes to determine the candidate authority.
2. **Was an affected file subsequently edited, replaced, or tested locally without a commit?** If yes, that latest applied local file is authoritative for the file. If no, the confirmed synchronized revision may establish authority.
3. **Is the candidate file demonstrably the most recent version?** If multiple uploads or artifacts exist, identify the latest *applicable* file, not simply a matching filename or an arbitrary `/mnt/data` copy. If provenance conflicts, ask Haley.
4. **Can the entire exact current affected file be inspected from available raw contents?** If yes, complete full-file review and the remaining preflight. If only excerpts, memory, reconstructed content, or inaccessible references are available, **stop the edit** and obtain the exact source; a confirmed commit alone does not waive full-file review.
5. **Do the proposed changes preserve unrelated material and the approved pass boundary?** If no or uncertain, narrow the edit, verify the source, or ask before proceeding.

**Interpretation safeguard:** When two branches seem to apply, prefer the branch that preserves the newest verified accepted work; never *guess* that one is newer. Identifying a candidate authority is not evidence that its raw bytes have been read.

### Authorization and verification distinctions

- **Discussion is not automatically implementation authorization.** Distinguish design exploration, an accepted direction, permission to audit, and approval to change specific files. Respect existing explicit approval; do not demand it repeatedly.
- **A build is not browser acceptance.** Distinguish static checks, automated tests, local browser verification, deployed-site behavior, and Haley's acceptance.
- **A ZIP being created is not proof it is correct.** Verify its entries, relative paths, intended contents, and copy commands.
- **A clean Git tree confirms repository state, not application correctness.** Do not make broader verification claims than the tests support.


### How to read the governing rules

For each rule, **Intention** describes the safeguard; **Origin / context** explains what prompted it; **Trigger** identifies when it applies; **Prohibited shortcut** identifies a likely failure; **If blocked or uncertain** specifies what to do instead of guessing; and **Verification** describes evidence of compliance. **The original binding procedure immediately following each interpretation remains mandatory.** These explanations clarify its meaning but never relax its requirements. When an explanation and a binding step disagree, apply the Golden Rule and reconcile the operative wording; do not select the less protective interpretation merely because it is easier.

**Proportionate reporting:** Complete the preflight reasoning on every pass, but communicate it at a level suited to the risk. Small authorized changes can have concise preflight and handoff statements; fragile or architectural changes warrant explicit detail. The protective checks are never optional merely because the written report is brief.

## 1. Non-Negotiable Operating Rules

### 1.1 Source of Truth and Applied-File Continuity

**Rule interpretation (read together with the full binding instructions below):**

- **Intention:** Prevent newer accepted work from being overwritten by older, easier-to-find files.
- **Origin / context:** Development frequently involves locally applied replacements before commits, and older ZIPs/uploads may still be present.
- **Trigger:** At the beginning of a pass and whenever a file changes after a confirmed checkpoint.
- **Prohibited shortcut:** Do not treat a remembered snapshot or Git marker as equivalent to the latest file contents.
- **If blocked or uncertain:** Stop editing, identify divergence, and ask Haley if version authority remains ambiguous.
- **Verification:** Record the authoritative revision for each affected file and the exact contents inspected.


At the start of any pass, establish one authoritative source of truth.

During active editing, the source of truth must be exactly one of the following:

- one specific local project folder
- one specific pasted/exported file
- one recently synced Git commit when the user has confirmed local and GitHub alignment through the sync ritual

GitHub, canvas copies, temporary zips, downloaded replacements, and other artifacts may be references, but they must not be treated as co-equal authoritative sources during the same pass unless that divergence is explicitly acknowledged.

Current project source of truth folder:

```text
C:\Users\haley\OneDrive\Desktop\Peridot\
```

Current synchronized checkpoint is recorded in the standardized block above. The Changelog is the authoritative source for detailed checkpoint interpretation and complete chronology.

### Applied-file continuity rule

**Rule interpretation (read together with the full binding instructions below):**

- **Intention:** Keep local tested changes authoritative until deliberately superseded.
- **Origin / context:** A stale replacement of shared files can silently undo unrelated working repairs.
- **Trigger:** After an applied, tested but uncommitted replacement or manual edit.
- **Prohibited shortcut:** Do not reconstruct from a superseded version or request an already available exact file reflexively.
- **If blocked or uncertain:** Obtain the newest actual local file when it is unavailable; do not assume the latest assistant output was applied.
- **Verification:** Confirm the user-applied revision and its raw contents.


After the user applies and tests an uncommitted replacement, script, or manual edit, the resulting **local file** becomes the new source of truth for that file. Before a later change to the same file, either:

- use that exact current file if it is already available in the active conversation/runtime (including the user's original current upload or the latest assistant-generated replacement that the user confirmed was applied);
- obtain that exact current local file if it is not already available; or
- work from a newly committed Git state that the user has confirmed contains the tested change.

Do **not** ask the user to upload a current file again merely because it was supplied earlier in the same active conversation. Re-request only when there is concrete ambiguity, drift, an uncommitted local change not represented in the conversation, or inability to access the exact file bytes.

Do not regenerate a broad replacement from an earlier upload, superseded generated artifact, or remembered snapshot. This is especially important for shared files such as `src/index.css`, where unrelated workspace rules may coexist and a stale full-file handoff can silently revert a successful visual repair.

Current branch note:

```text
The current active continuation branch may intentionally differ from experimental branches. MapLibre preview code has been removed from active `main`; the later MapLibre migrated-overlay branch remains archived and should not be treated as the active source of truth unless explicitly resumed.
```

Asset-origin and licensing information must remain preserved in the README and Maintainer’s Guide. This Charter governs the process requirement to protect that information when relevant, not the asset inventory itself.

---

### 1.2 Bounded-Pass Rule

**Rule interpretation (read together with the full binding instructions below):**

- **Intention:** Make cause, effect, approval, and rollback understandable by constraining change scope.
- **Origin / context:** Mixed repairs and redesigns made regressions harder to isolate and evaluate.
- **Trigger:** Before each implementation or documentation pass.
- **Prohibited shortcut:** Do not bundle unrelated behavior, appearance, and restructuring without explicit scope agreement.
- **If blocked or uncertain:** Clarify the change boundary before editing.
- **Verification:** State pass type, goal, exact scope, excluded work, acceptance test, and artifact.


Before each coding pass, state:

- change type: exactly one of **behavior**, **visual**, **structural**, or **documentation**
- goal
- in-scope files/regions
- out-of-scope files/regions
- one plain-language acceptance test
- expected artifact: usually a uniquely versioned replacement ZIP bundle plus extract/copy instructions; use pasted diff, isolated file, or commit-ready instructions only when that better fits the bounded pass

Do not mix functional changes, visual redesign, broad refactors, and documentation updates in a single implementation pass unless the user explicitly chooses that scope.

#### Unexpected scope-expansion procedure

**Intention:** Prevent the assistant from expanding an apparently small approved change into a broader implementation without Haley's knowledge. Unexpected dependencies are a reason to reassess the pass, not implicit authorization to change more files.

**Origin / context:** Shared state, stylesheets, workspace wrappers, and Inspector/visualization interactions have caused regressions when changes crossed subsystem boundaries unexpectedly.

| Discovery | Required response |
|---|---|
| The fix stays within the authorized scope | Continue with the agreed checks |
| More investigation is needed, without changing additional files | Investigate only within the agreed review boundaries; do not treat inspection as authorization to edit |
| An additional file, behavior, or pass type must change | Stop the affected edit; state the dependency, risk, and proposed expansion, then obtain Haley's approval before changing the new area |
| An unrelated defect is discovered | Record it separately, with its evidence; do not silently repair it in this pass |
| The solution would violate an established invariant | Stop and reassess the design or seek clarification; do not implement the shortcut |

**Verification:** Compare the final changed-file list and behavioral effects against the authorized in-scope/out-of-scope boundaries. Note separately any deferred discoveries. Do not mistake Haley's approval of an objective for blanket approval of unforeseen changes.

---

### 1.3 Full-File Review and Safe Replacement

**Rule interpretation (read together with the full binding instructions below):**

- **Intention:** Prevent damage caused by working from incomplete or incorrectly reconstructed code.
- **Origin / context:** Snippet-based edits and repetitive patch attempts failed in dense shared components.
- **Trigger:** Before every code edit, including an apparently small targeted change.
- **Prohibited shortcut:** Do not confuse mandatory full-file *inspection* with a mandatory full-file *delivery*.
- **If blocked or uncertain:** If exact complete raw source is inaccessible, stop; request the needed file rather than pretending retrieval excerpts suffice.
- **Verification:** Identify files read in full and the source-derived edit strategy.


Before writing any code edit or patch script, read and review the complete current affected file or files from the real source of truth.

**Exact raw-source rule:** Before editing a Peridot source file, the entire exact current source-of-truth file must be read, and the replacement file must be derived directly from that exact raw file. Repository/GitHub snapshots, retrieval excerpts, normalized text, or reconstructed file content may support verification or historical context but may not serve as the sole implementation source.

A clean synchronized Git checkpoint establishes which revision is authoritative, but it does not waive the raw-file requirement for implementation. If exact current raw bytes are unavailable to the execution environment, stop rather than reconstructing a replacement from indexed/retrieved text. Any temporary exception requires explicit user agreement and must be described as a fallback rather than equivalent to raw-file access.

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

### Shared-stylesheet and script safeguards

**Rule interpretation (read together with the full binding instructions below):**

- **Intention:** Preserve unrelated presentation behavior while editing high-coupling stylesheets.
- **Origin / context:** Earlier layout repairs regressed other pages because shared CSS was overwritten or brittle scripts were retried.
- **Trigger:** Edits to shared CSS, fragile selectors, or generated patch procedures.
- **Prohibited shortcut:** Do not equate a small visual request with low regression risk or use repeated permissive patch scripts.
- **If blocked or uncertain:** Stop after a failed patch, establish whether files changed, restore source certainty, and choose one bounded repair.
- **Verification:** Check target appearance and preservation of unrelated layouts, selectors, and style import order.


`src/index.css` is a high-risk shared dependency even when a requested visual change is small. For a narrowly scoped color, spacing, or animation adjustment:

- do not send a full stylesheet replacement merely for convenience;
- start from the exact latest local stylesheet or a confirmed commit that contains all accepted interim changes;
- identify preservation checks for unrelated behaviors that must survive the change;
- use a narrow, source-verified edit only when its selector/anchor is stable and unambiguous;
- prefer an ordinary replacement file delivered inside the pass bundle over an executable patch script unless the user explicitly requests a script.

Do not rely on comment markers as the only verification anchor for a generated script. Comment text may be altered by text encoding or prior tooling. Verify stable selector or structural hooks instead.

If a generated patch script fails, stop and confirm that no changes were written. Do not iterate through increasingly permissive scripts against an uncertain local file. Re-establish the current source, then choose one bounded repair or restore a clean checkpoint.

If a patch fails, begins to loop, or requires repeated corrective scripts, stop immediately. Roll back to the last clean commit/checkpoint, restate the goal, and switch to a reviewed full-file replacement or a new implementation plan.

This project is grounded in real code and real data. Do not reconstruct likely code from memory, snippets, or expectations when the actual file can be read.

### Human-readable code comment rule

**Rule interpretation (read together with the full binding instructions below):**

- **Intention:** Leave future human maintainers intelligible architectural and compatibility rationale.
- **Origin / context:** Large, long-lived components and legacy bridges otherwise require prior chat context to interpret.
- **Trigger:** Whenever editing relevant code or removing existing explanatory comments.
- **Prohibited shortcut:** Do not replace reasoning with descriptions of obvious syntax or delete unique rationale casually.
- **If blocked or uncertain:** Mark uncertain comments for verification instead of inventing a reason.
- **Verification:** Check comments near edited logic against actual behavior and preserve important rationale.


Code should be commented thoroughly enough for a new human developer to understand what each major section does and how it relates to other app sections and files. Comments should explain architecture, data flow, fragile compatibility paths, non-obvious state coupling, and why a decision was made. They should not merely restate obvious syntax.

When editing a file, review nearby comments for accuracy. Update comments that describe obsolete UI paths, removed routes, or superseded data workflows. Add short architectural comments before complex state blocks, exported helper groups, compatibility bridges, and cross-file wiring. Avoid large noisy comment blocks, but leave enough context that a future maintainer can safely continue work without relying on prior chat history.

Before deleting comments, verify that the information is either obsolete, duplicated by clearer documentation, or obvious from the code. If a path is retained only for compatibility, comment that explicitly.

### Most-recent-upload rule

**Rule interpretation (read together with the full binding instructions below):**

- **Intention:** Protect the current source from accidental substitution by an older same-name file.
- **Origin / context:** Multiple timestamped exports and generated replacements often coexist.
- **Trigger:** When Haley provides new source files during a pass.
- **Prohibited shortcut:** Do not rely on filename equality, directory listing order, or an older generated artifact.
- **If blocked or uncertain:** Resolve recency or scope ambiguity with Haley before editing.
- **Verification:** Identify exact uploaded file/revision inspected.


When the user uploads files after being asked for current source files, treat those most recent uploads as the authoritative source for that pass unless the user explicitly says otherwise.

Do not assume that a same-name file already present in `/mnt/data`, a prior generated replacement file, or an older upload is the latest source. Same-name files from different points in the conversation are common during this project.

Before making claims that a user-uploaded source file is stale, verify that the file being inspected is actually the newest uploaded file for the pass. If there is any ambiguity about file recency or identity, stop and ask rather than declaring the user’s upload stale.

---

### 1.4 Fragile-Zone Preflight Requirement

**Rule interpretation (read together with the full binding instructions below):**

- **Intention:** Prevent seemingly localized changes from breaking coupled subsystems or changing evidence semantics.
- **Origin / context:** Shared Inspector, map, mapping, Search, and styling logic has regressed under unrelated-looking changes.
- **Trigger:** Before touching any fragile area identified in the Maintainer’s Guide.
- **Prohibited shortcut:** Do not treat the examples in this Charter as the exhaustive regression inventory.
- **If blocked or uncertain:** Consult the current technical contract or ask for clarification before proceeding.
- **Verification:** Name risk, out-of-scope behavior, and focused regression checks before edit.


Before touching a fragile zone, state the affected zone, what could break, what is deliberately out of scope, and how the result will be verified. The authoritative detailed fragile-zone regression matrix is in the Maintainer’s Guide; this Charter requires the preflight, not a duplicate technical inventory.

High-risk examples include `App.jsx` orchestration, workspace routing, compact/full Inspector behavior, Search applied-data state, Timeline/Analytics coupling, upload/mapping behavior, export rendering, shared stylesheets, stylesheet import order, semantic theme roles, and map/chart portal layering.

## 2. Delivery, Testing, and Commit Protocol

**Rule interpretation (read together with the full binding instructions below):**

- **Intention:** Make every handoff reproducible, inspectable, and limited to authorized files.
- **Origin / context:** Unverified archive layouts, broad staging, and ambiguous replacements can lead to wrong files being copied or committed.
- **Trigger:** Whenever delivering changed source, assets, or documents; and at checkpoint/commit boundaries.
- **Prohibited shortcut:** Do not assume archive paths, use blanket Git staging, or claim browser verification from a build alone.
- **If blocked or uncertain:** Verify actual artifact and paths; if verification fails, repair before delivery.
- **Verification:** Show tested ZIP members, exact copy destinations, and distinct test/acceptance status.


A **checkpoint** is a tested intermediate state that may still be revised soon. A **commit** is a coherent completed pass with one clear outcome. Use commits for coherent completed passes; use checkpoints when the user wants recoverability before additional risk.

### Delivery format

- **Default Peridot coding and documentation delivery:** provide one uniquely versioned ZIP bundle per pass containing all new/replacement files for that pass.
- Always provide exact PowerShell commands to extract the bundle into a uniquely named temporary folder and copy each contained file to its intended path under `C:\Users\haley\OneDrive\Desktop\Peridot\`.
- **Before delivery, inspect the completed ZIP's actual internal path structure and write the PowerShell copy commands against those exact paths.** Do not assume the archive contains `src\...`, a versioned top-level directory, or any other layout without checking it.
- The handoff commands must be complete enough to execute the pass from the project root: extraction, every required `Copy-Item`, and the **verification commands warranted by the pass**. Include `git status` when appropriate; do not automatically repeat `npm.cmd run build` or `npm.cmd run dev` after every small source pass. Apply the risk-based build-check rule below.
- Bundle-internal replacement filenames should also be unique/versioned when practical so downloads from different passes cannot be confused. Repository destination filenames remain the canonical project filenames.
- Avoid separate individual-file downloads unless there is a specific reason to provide one, such as isolated recovery of one file.
- Do not use executable apply/patch scripts unless explicitly requested. The bundle should contain ordinary source/document/asset files and the chat should provide transparent copy commands.
- Small local edits may still use targeted, source-verified blocks only after full-file review when that is demonstrably safer than a replacement bundle.
- For image, brand, screenshot, or other asset passes, include the assets inside the same pass bundle and provide exact copy destinations.
- Do not use `git add .` while generated artifacts such as `itch_upload/` or unrelated working files are untracked.
- Use targeted `git add <file>...` commands by default. Use `git add -A src` only when an intentional source-file rename or deletion requires it.

### Diagnostic-output requests and source-workflow clarification (2026-11-03)

**Rule interpretation (read together with the full binding instructions below):**

- **Intention:** Request diagnostic evidence only when it answers a concrete question.
- **Origin / context:** Routine successful logs create unnecessary work; source-guessing delays actual runtime diagnosis.
- **Trigger:** When investigating build, browser, or source failures.
- **Prohibited shortcut:** Do not ask for repetitive generic build logs or ignore an available relevant browser exception.
- **If blocked or uncertain:** Describe the missing diagnostic and why it matters.
- **Verification:** Distinguish build, browser, deployment, and user acceptance.


Do not routinely ask the researcher to paste successful build output or repeat routine build logs when no particular diagnostic question requires them. State any concrete reason for requesting build/console output, and distinguish a local syntax/build check from browser acceptance and deployed-site verification. Use targeted console measurements or an actual browser exception early when a runtime regression warrants it. Keep source handoffs as complete, versioned ordinary replacement files with checked ZIP paths and transparent `Copy-Item` commands; do not deliver executable patch scripts by default. This clarification reinforces, rather than supersedes, the full-file review, applied-file continuity, and recovery rules above.

### Risk-based build checks during consecutive passes

**Intention:** Verify changes when a build can reveal a meaningful problem, without repeatedly assigning Haley the same low-value command during closely related, back-to-back development passes. Preserve efficient collaboration without sacrificing necessary regression checks.

**Origin / context:** Repeated instructions to run the Peridot build after each minor iteration create friction when the recent build baseline is known and the current changes are unlikely to affect compilation, packaging, or production assets. This rule extends the existing policy against requesting repetitive successful build logs; it does **not** abolish build verification.

**Trigger:** Each time the assistant chooses or recommends verification for a bounded pass, especially during a sequence of small changes to the same feature.

**Requirement:** Choose verification according to what changed and what failure is plausible. Distinguish a build, automated tests, browser interaction checks, and deployed-site verification; one does not substitute for the others.

- **Run or request a production build when it has a concrete purpose**, including changes to dependencies, configuration, build-time imports, assets or their paths, packaging, exports, code with meaningful compilation risk, or before a significant release/checkpoint when required by the acceptance plan. A recent build does not waive checks when a new change creates fresh build risk.
- **For small consecutive visual or interaction passes**, when the last known build baseline remains relevant and the edited change has little build-specific risk, prefer a focused browser acceptance/regression check or relevant automated test. Do not automatically add `npm.cmd run build` to every handoff.
- **Do not repeatedly ask Haley to paste routine successful build output.** Ask for a failure, warning, or specific diagnostic only when it bears on a concrete question.
- **State why a build is needed when requesting one**, or briefly identify that the build is intentionally deferred because the pass is low-risk and already covered by more relevant checks. Do not claim a build was run when it was not.
- **When several small passes accumulate**, reassess whether an integrated build and wider regression pass is warranted; do not defer indefinitely solely because each individual edit seemed small.

**Prohibited shortcut:** Do not treat skipping a low-value build as permission to skip all verification. Do not substitute an old build for a newly required check, or claim that browser behavior is correct solely because the project builds.

**If blocked or uncertain:** Identify the specific build or runtime risk and ask Haley whether an additional check is warranted when the existing acceptance plan does not resolve the question. Follow the Golden Rule for consequential uncertainty.

**Verification:** In the handoff, name the checks actually completed or delegated, distinguish any deferred build from a passed build, and identify remaining risk. No successful-build output is required unless a specific diagnostic need arises.

### Sync ritual

**Rule interpretation (read together with the full binding instructions below):**

- **Intention:** Keep future work anchored to a verified repository revision without losing newer local edits.
- **Origin / context:** Repeatedly asking for sources after confirmed syncs wasted effort; stale checkpoints also caused drift.
- **Trigger:** After commits/major checkpoints and before relying on Git as authority.
- **Prohibited shortcut:** Do not treat an old ritual as proof no newer uncommitted changes exist.
- **If blocked or uncertain:** Ask for updated sync or exact local file only when there is concrete uncertainty.
- **Verification:** Record `HEAD`, branch alignment, working-tree status, and any subsequent applied edits.


Run after actual commits or major checkpoints:

```powershell
git status
git log --oneline -5
Get-ChildItem -Name
Get-ChildItem src -Name
```

A clean ritual showing local `HEAD`, `origin/main`, and `origin/HEAD` aligned establishes the synced Git state as the current source of truth.

After a clean aligned sync ritual, do not repeatedly request uploaded source files unless there is a specific reason to believe the relevant file has drifted, the exact current contents are unavailable to the execution environment, or the task requires an uncommitted local version. If the exact necessary file is already present in the active conversation, use it.

## 3. Recovery Protocol

**Rule interpretation (read together with the full binding instructions below):**

- **Intention:** Restore a known-good working state without layering speculative fixes or destroying unrelated work.
- **Origin / context:** Repeated Search patch attempts, Inspector behavior regressions, and responsive-panel rollbacks demonstrated the value of stopping early.
- **Trigger:** When a patch, build, or browser test fails or produces unexpected behavior.
- **Prohibited shortcut:** Do not assume “restore checkpoint” authorizes discarding unrelated or uncommitted user work.
- **If blocked or uncertain:** Identify failed files and preserve unaffected changes; request approval before destructive reset/restore.
- **Verification:** Confirm recovery target, scope, retained unrelated changes, and rerun acceptance checks.


When something goes wrong:

1. Stop further edits.
2. Identify the current source of truth.
3. When a runtime issue appears after user interaction, inspect the F12 browser console early before attempting source edits or speculative fixes.
4. **Plan and carry out only a bounded, non-destructive restoration to the last known-good state.** Identify the exact files and changes affected, protect unrelated or uncommitted work, and obtain Haley’s authorization before any restoration that would overwrite or discard it. Never assume a clean checkpoint permits a broad working-tree reset.
5. Restate the goal in one sentence.
6. Make one bounded fix only, or switch delivery mode to full-file replacement after full-file review.
7. Rerun the acceptance test.

Do not stack speculative fixes on top of an unstable state.

Recent examples reinforced this rule:

- a responsive shared-panel sizing attempt was rolled back after it disrupted the normal landscape layout
- a semantic shared-panel prop rename was rolled back after it broke inspector auto-open behavior
- repeated Search & Filter patch-script failures showed that dense UI files should not be edited through brittle snippet assumptions
- the team returned to the last clean baseline before proceeding
- an Inspector related-person navigation fix that also changed place cluster display was rolled back after it caused related places to disappear and people clicks still opened the blank state

---

## 4. Documentation Maintenance Policy

**Rule interpretation (read together with the full binding instructions below):**

- **Intention:** Keep documentation accurate without interrupting every small development change or losing history.
- **Origin / context:** The core docs carry cumulative knowledge needed by new maintainers and scholarly reviewers.
- **Trigger:** At milestones, meaningful batches, handoffs, and authorized documentation passes.
- **Prohibited shortcut:** Do not mistake additive-by-default preservation for a ban on verified restructuring, or a license to discard history.
- **If blocked or uncertain:** Use the Governance Protocol to map retained, moved, archived, and corrected content.
- **Verification:** Check primary ownership, history preservation, cross-links, and current claims.


Do not update documentation after every small code commit. That slows development.

Instead, defer README / Maintainer Guide / Changelog updates until:

- a meaningful batch of changes has accumulated
- a milestone has been reached
- a fresh-chat handoff is needed
- the current conversation is becoming laggy or unreliable

When documentation is updated, preserve the full development history in `CHANGELOG.md`.

Documentation passes should default to adding new milestone/current-state information where reasonable. Subtract or rewrite existing documentation only when the text is clearly obsolete, duplicated by a more accurate retained entry, or actively misleading. **A specifically authorized, preservation-verified structural reorganization is also permitted under the Governance Protocol:** map each moved, consolidated, corrected, or archived item to its retained location; preserve unique technical knowledge and historical evidence; and disclose any truly removed text. Structural permission is not permission to silently delete substance.

---

### Executive-summary maintenance rule

**Rule interpretation (read together with the full binding instructions below):**

- **Intention:** Keep accessible orientation stable without casually rewriting technical or historical detail.
- **Origin / context:** Repeated incremental updates can turn front matter into a mini-changelog and duplicate current-state claims.
- **Trigger:** Whenever editing one of the four core documents.
- **Prohibited shortcut:** Do not treat the executive-summary exception as permission to rewrite the remainder without preservation review.
- **If blocked or uncertain:** Document why an authorized structural pass needs relocation or correction under Governance Protocol safeguards.
- **Verification:** Confirm the opening accurately states audience and purpose; check information-preservation mapping.


Each core document—`README.md`, `MAINTAINERS_GUIDE.md`, `PROJECT_WORKFLOW_CHARTER.md`, and `CHANGELOG.md`—must begin with a one- or two-paragraph **Executive Summary** for human readers.

The Executive Summary is the **only region routinely eligible for non-additive prose revision without a separately authorized structural pass**. It is a stable orientation layer, not a miniature changelog: update it only when the document's purpose, audience, or high-level scope has materially changed. All remaining documentation remains additive, meticulous, and exhaustive by default. Exceptions are explicitly corrected obsolete/duplicated/misleading text **or** a Haley-authorized reorganization with a documented preservation audit under the Governance Protocol. Neither exception permits loss of unique historical rationale, technical contracts, or failure evidence.

For every core-documentation pass, follow `PERIDOT_CORE_DOCUMENTATION_GOVERNANCE_PROTOCOL.md` and read the current complete versions of all four core documents before editing. The historical Core Documentation Restructuring Plan remains available in `planning_documents/` as a record of the original restructuring, but is not a standing procedural authority. Consult historical planning documents when relevant to understanding an earlier decision or preserving its rationale.

### Six-month dependency maintenance review — SheetJS and Browserslist

**Rule interpretation (read together with the full binding instructions below):**

- **Intention:** Prevent silent dependency obsolescence without risky or unverified upgrade cascades.
- **Origin / context:** SheetJS distribution/security practices and Browserslist data require different verification than ordinary package updates.
- **Trigger:** At six-month review dates and explicitly approved tooling passes.
- **Prohibited shortcut:** Do not equate an audit report with official security coverage, or an update attempt with a verified upgrade.
- **If blocked or uncertain:** Log review findings and deferral; do not force incompatible upgrades.
- **Verification:** Record versions, update/review dates, advisories, build and importer regressions.


**Decision (2026-10-31):** check SheetJS (`xlsx`) and the Browserslist compatibility database (`caniuse-lite`) every six calendar months. A review is required even if no package update is made. Maintain in the Maintainer's Guide a ledger with each dependency's exact installed version, the date it was last successfully installed and verified, the separate last-review date, the review findings and test evidence, and the next due date. As the initial updates were completed on **2026-10-31**, the first due date is **2027-04-30**. After a review, schedule the next check six calendar months after that review; record a new *last updated* date only after actual upgrade verification.

Keep this as a bounded tooling/maintenance pass: inspect official security advisories and distribution sources, assess necessity and compatibility, inspect exact manifest/lockfile diffs, run the build and appropriate import regressions, then commit only tested changes. `npm audit` is informative but not exhaustive for the official SheetJS CDN tarball. Avoid forcing transitive upgrades or mixing importer redesign with a dependency refresh. The Maintainer's Guide owns version-specific verification and test instructions.

---

## 5. Dependency and Tooling Freeze

**Rule interpretation (read together with the full binding instructions below):**

- **Intention:** Prevent unrelated infrastructure changes from obscuring the results of a bounded feature pass.
- **Origin / context:** Package and configuration changes can introduce unrelated failures and deployment drift.
- **Trigger:** Every ordinary development pass outside explicitly approved tooling/architecture work.
- **Prohibited shortcut:** Do not casually modify lockfiles, configuration, dependencies, or folder topology.
- **If blocked or uncertain:** Ask Haley before enlarging scope to a tooling change.
- **Verification:** Inspect changed-file list for unauthorized infrastructure edits.


Do not change dependencies, package manager files, Vite config, Tailwind config, lint/format rules, filenames, or folder structure unless the pass is explicitly about tooling or architecture.

Generated artifacts such as `itch_upload/` should not be committed during ordinary source-development passes.

---

## 6. Project-Specific Operating Cautions

**Rule interpretation (read together with the full binding instructions below):**

- **Intention:** Expose known high-coupling areas before a developer acts on an apparently local task.
- **Origin / context:** Prior architectural transitions left compatibility bridges, performance sensitivities, and known failure modes.
- **Trigger:** When a proposed pass touches one of the named areas.
- **Prohibited shortcut:** Do not treat a caution as a standalone current architecture specification if the Maintainer’s Guide supersedes its detail.
- **If blocked or uncertain:** Consult current Level 2/3 contracts and ask before removing a compatibility path.
- **Verification:** Use domain-specific regressions from the Maintainer’s Guide.


### Modularization roadmap

Maintain a modularization roadmap for eventual `App.jsx` decomposition, but do not execute it casually. Preferred order: pure data helpers; export helpers; theme/constants; small reusable UI pieces; map interaction helpers; panel and Inspector content components; then app orchestration last. Stop structural cleanup once the file is stable unless there is a concrete bug, a planned architectural pass, or a specific maintenance pain point.


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

### Archived MapLibre work

Active `main` no longer contains dormant MapLibre preview files or the `maplibre-gl` dependency.

The later `maplibre-native-geographic-view` branch remains an archived experiment and should not be treated as active production code. Do not reintroduce MapLibre files, dependencies, or preview flags unless the pass is explicitly about resuming MapLibre after a fresh source-of-truth audit.

### Cluster behavior

Cluster behavior is now committed and functional.

Future cluster changes should preserve:

- cluster click opens Inspector
- cluster inspector lists contained members
- members are grouped by place
- member click opens detail
- Back returns to the cluster view
- cluster sizing remains visually meaningful

### Data import, canonical normalization, and mapping caution

Data import is a fragile boundary. Keep the public direction intact: one generalized CSV / TSV / XLSX / XLSM / XLS mapping system, explicit user-owned semantics, permissive database-first admission, editable post-import mappings, and no silent standardization. The former public Correspondence-versus-Genealogy profile gate and separate experimental universal-mapper surface are superseded; compatibility/profile modules may remain internally only where current runtime behavior still requires them.

Peridot must begin with **no active dataset**. Do not restore an implicit sample fallback. Sample data must be explicitly selected by the user and should remain ordinary files processed by ordinary generalized mappings. Canonical sample mappings may be edited in the active session for learning/QA, but the shipped mapping and source file remain preserved and resettable.

Generalized Relations, integrated Identity, Time, Places, Evidence, per-field cardinality, and subject attribution are authoritative through runtime/canonical consumption. Stable IDs and alternate compound Identity recipes must produce stable entity identity independently of display labels; canonical display labels remain presentation. Legacy Source/Target or profile-specific fields may remain only as explicit compatibility projections and must not override accepted mappings.

Subject attribution is semantic authority. Time, Place, and Evidence mappings may describe the record, one or more participants, or both; normalized assertions remain atomic. A value mapped to one participant must not become information about every participant in the row. The same source field may legitimately support different researcher-named roles for different participants. Directed correspondence-style place pairs should exist only where the mapping explicitly supplies directed pairs.

Workbooks continue to use user-configured unique-ID joins rather than row order. Duplicate join IDs that make assembly unsafe must be blocked or surfaced rather than silently multiplying records. Mapping suggestions visible to the user must either be materialized into accepted state or clearly presented as unaccepted suggestions; a visible default must not disappear merely because the user did not touch its control.

Do not create a new profile or parser for each unusual spreadsheet shape. Multiple-partner/multiple-value support now belongs to the shared per-mapped-item cardinality model rather than genealogy-specific parsing. Do not extend that model into positional zipping of parallel list-valued columns. Conversely, do not delete compatibility modules without the no-loss retirement audit.

For the current import/sample/Identity contract and detailed regression checks, see the [Maintainer’s Guide — Data Import and Workbook Contract](MAINTAINERS_GUIDE.md#contract-data-import-and-generalized-mapping).

### Advanced Search and applied-scope caution

Advanced Search is the primary owner of global applied filtering and the Explore surface. Preserve its draft/apply model, explicit route filters, structured criteria, Browse, Results, Refine / Inspect, Capabilities, and Inspector-overlay return behavior. Do not turn draft edits into uncontrolled full-dataset recomputation or combine Search work with unrelated `App.jsx`, Timeline, Analytics, Inspector, or MapLibre changes.

For the current Search contract and detailed regression checks, see the [Maintainer’s Guide — Advanced Search / Explore Contract](MAINTAINERS_GUIDE.md#contract-explore-and-search).

## 7. Decision Records by Domain

**Rule interpretation (read together with the full binding instructions below):**

- **Intention:** Preserve why decisions were made without allowing old proposals to become current instructions.
- **Origin / context:** Peridot has undergone many deliberate revisions of its workspace, import, chart, and timeline designs.
- **Trigger:** When interpreting or updating a non-obvious technical/product decision.
- **Prohibited shortcut:** Do not adopt archived prose merely because it uses imperative “should” language.
- **If blocked or uncertain:** Use current contract and later decision status; if the replacement cannot be established, ask Haley.
- **Verification:** Record status, rationale, rejected alternative, consequence, and replacement reference.


The domain summaries below index decisions and preservation constraints from different development periods. **Current authority comes from the latest accepted decision and the corresponding Maintainer’s Guide contract**, not automatically from every historical sentence here. Treat an earlier imperative as historical when superseded; if its status is unclear, use the Golden Rule. When recording a new or materially revised non-obvious decision, add it beneath the relevant domain using:

```text
Status: Current / Superseded / Historical / Deferred / Rolled back / Compatibility (verify)
Decision:
Context:
Chosen approach:
Rejected alternative:
Reason:
Maintenance consequence:
Superseded by / related contract: (where applicable)
```

Detailed historical decision rationale remains preserved in the archived inventory below.

### Decision-domain index and status reading key

| Domain | Current technical authority | Historical handling |
|---|---|---|
| [Data policy and imports](#71-data-policy-and-imports) | Maintainer’s Guide — Data import and generalized mapping | Earlier profile modes and proposed chart controls are not current instructions |
| [Routing and workspace model](#72-routing-and-workspace-model) | Maintainer’s Guide — Application shell and navigation | Preserve prior Home and navigation experiments as historical |
| [Inspector](#73-inspector) | Maintainer’s Guide — Inspector | Preserve former panel modes and compatibility rationale |
| [Search and data scope](#74-search-and-data-scope) | Maintainer’s Guide — Explore / Search and shared scope | Preserve prior Search models where relevant |
| [Analytics](#75-analytics) | Maintainer’s Guide — Charts II | Legacy Charts I controls explicitly superseded |
| [Themes and visual language](#76-themes-and-visual-language) | Maintainer’s Guide — Themes, editorial presentation and loading | Older decorative/asset designs remain historical |
| [Export](#77-export) | Maintainer’s Guide — Exports | Retain retired Export workspace decisions as history |
| [Archived or superseded decisions](#78-archived-or-superseded-decisions) | Changelog and relevant current contracts | Never use this archive as an active implementation directive |

**Status vocabulary:** Current = binding unless superseded by a newer accepted decision; Superseded = replaced; Historical = descriptive of an earlier state; Deferred = not presently authorized work; Rolled back = intentionally not active; Compatibility = retained for an identified present dependency. **Qualified status** (such as "Current in principle; interface details historical") means preserve the enduring decision but check the current Maintainer’s Guide and source before using its old implementation details. A missing or uncertain status is **not evidence of current authority**. Refer to the source-of-truth rule and ask Haley if competing records cannot be reconciled.

**Status application:** Each detailed decision record below now carries a status and related-authority note. The six-field original decision narrative is retained unchanged. Domain-level bullets and the expandable archived inventory describe mixed periods; where they lack an individual status, do not treat them as new implementation authorization.


### 7.1 Data policy and imports

#### Performance optimization without semantic reclassification (2026-11-01)

**Status:** Current — preservation principle; historical optimization event. **Related authority:** Data mapping and generalized runtime contracts; Changelog 481acd9. This label classifies the record; current behavior must be verified against the latest accepted contract before implementation.

```text
Decision:
Optimize repeated per-record capability lookups without changing the conditions under which a mapped record supports a Network or geographic route.

Context:
Profiling workbook confirmation found canonical construction, not workbook assembly or the legacy adapter, dominated the measured synchronous import time. Repeated whole-collection scans occurred in capability readiness calculations.

Chosen approach:
At 481acd9, precompute record-indexed participation counts and geographic assertion flags, preserving current eligibility logic and normalized output. Remove temporary performance instrumentation after accepted browser tests.

Rejected alternative:
Treat placeholder data as disposable, redefine capability readiness for speed, or redesign the workbook worker without evidence that repeated assembly was the primary cost.

Reason:
Peridot's researcher-owned mapped semantics must remain stable across implementation-level performance improvements.

Maintenance consequence:
Retest capability availability, multipart relations, mapped route geography, and ordinary sample/workbook import after future changes. Measured before/after runs used different mapping conditions and are not a controlled benchmark; see the Maintainer's Guide and Changelog.
```

- Peridot is database-first: accepted research items may be incomplete, and coordinates/dates are capability-enabling rather than admission requirements.
- Peridot does not silently standardize, merge, infer domain meaning, or enforce controlled vocabularies.
- The canonical normalized model is the consumer-neutral research representation. It preserves entities, places, records, events, relationships, participations, evidence, assertions, temporal structure, and machine-readable provenance.
- The public upload model is now one generalized mapping system. Older Correspondence / Directed Record and Genealogy / Person-Centered profile modules are internal compatibility/specialization paths rather than user-facing ontology choices.
- Arbitrary tables use explicit user-confirmed mappings; workbooks use user-confirmed unique-ID joins rather than row-order matching.
- Generalized mapping is deterministic and user-owned: relationship parts, Identity rules, temporal assertions, place parts, evidence assignments, workbook references, source descriptors, and transformations record what the researcher has told Peridot.
- Generalized Identity is authoritative at runtime. Display labels are not universal identity, and equivalent conceptual identity components may be mapped across different participant roles/sheets.
- Record/participant subjects are authoritative for mapped Time, Places, and Evidence. One mapping may select the record, one or more participants, or both; downstream assertions remain atomic.
- Peridot starts with no active dataset. Sample data is explicitly selected and uses ordinary source files plus ordinary generalized mappings.
- Sample mappings are editable for learning/QA while the shipped mapping and source remain preserved and resettable.
- Generalized mappings are authoritative through canonical/runtime consumption. Legacy fields may remain only as explicit compatibility projections while the repository-wide retirement audit determines which paths are still required.
**Historical proposal — not a current Charts II implementation instruction:** The following earlier Phase 3 idea is preserved as decision history. The accepted Charts II contract and later Changelog milestones govern present development.

- Phase 3 should build chart controls from saved/generalized variables, including a structured autocomplete sentence builder that mirrors scholarly questions without implementing unrestricted natural-language prompting.


#### Provisional background review and researcher edit authority decision (2026-10-31)

**Status:** Current — worker invalidation and researcher-edit authority; historical implementation context. **Related authority:** Data import/mapping; background processing. This label classifies the record; current behavior must be verified against the latest accepted contract before implementation.

```text
Decision:
Allow debounced, provisional workbook-review processing in a worker without locking researcher mapping edits.

Context:
Multi-sheet workbooks with thousands of mapped records caused a browser freeze upon entering Review & Upload when assembly and capability auditing occurred synchronously in React rendering.

Chosen approach:
Run full-workbook review assembly and auditing in a Web Worker, start provisional processing after stable mapping changes, reuse a result only for its matching mapping revision, and reject superseded worker results. Keep Confirm upload gated on current successful validation.

Rejected alternative:
Treat a short editing pause as finalized scholarly approval, disable Time/Places/Relations edits during processing, accept a worker result from an older mapping revision, or claim independent mapping-category caches already exist.

Reason:
Researcher-owned, reversible interpretation must remain authoritative while expensive computation moves off the interface thread.

Maintenance consequence:
Test rapid corrections, worker failure, changed workbook joins, navigation between mapping tabs, stale-result races, and final confirmation separately. Full independent per-category caching remains deferred. See Maintainer’s Guide Section 7.
```

#### Generalized-mapper authority decision

**Status:** Current. **Related authority:** Data import and generalized mapping contract. This label classifies the record; current behavior must be verified against the latest accepted contract before implementation.

```text
Decision:
Treat accepted generalized mapping assignments as the authoritative semantic inputs for ordinary uploads and samples.

Context:
The public mapping system now carries repeatable relationship participants, researcher-declared Identity, generalized temporal assertions, participant-attached places, evidence mappings, workbook-qualified references, and editable post-import state through active runtime consumption.

Chosen approach:
Use one generalized mapping model as the public semantic authority. Retain only explicit downstream compatibility projections where current consumers still require them. Continue retirement through bounded audits rather than broad deletion.

Rejected alternative:
Keep Correspondence/Genealogy profile selection or legacy Source/Target, point/route, or single-Date fields as co-equal semantic authorities; maintain a separate “universal mapper” test path; or delete all compatibility code at once.

Reason:
One authoritative mapping architecture prevents accepted user mappings from being silently overridden while preserving rollback-safe compatibility for consumers that have not yet migrated.

Maintenance consequence:
New consumer work should read generalized/canonical structures first. Compatibility fields and profile modules are projections/specializations, not competing sources of truth.
```

#### Temporal assertions and Timeline semantics decision

**Status:** Current in canonical temporal semantics; historical references to former component names require verification. **Related authority:** Shared chronology and Timeline II contracts. This label classifies the record; current behavior must be verified against the latest accepted contract before implementation.

```text
Decision:
Preserve temporal evidence as repeatable canonical Date/Period assertions and let Timeline expose both accumulation and simultaneity.

Context:
Humanistic datasets may contain multiple dates/periods per record, partial or approximate dates, open intervals, mixed precision, researcher-supplied temporal notes, and source layouts ranging from one range column to separate Y/M/D fields for both endpoints.

Chosen approach:
Preserve original temporal text; derive machine-usable temporal structure conservatively; keep researcher notes separate from inferred structure; allow repeatable user-named Date/Period mappings with reusable source columns; and carry canonical temporalAssertions[] into active runtime consumers. The shared bottom Timeline/playback control derives dataset-specific Time types and supports Cumulative Events and Co-current Events. A separate dedicated Timeline visualization workspace projects the same canonical temporal assertions into an explorable chronology without replacing the shared playback control.

Rejected alternative:
Force one privileged Date per row, normalize every date to a JavaScript Date, invent missing components, let certainty/completeness notes silently determine visualization eligibility, or make empty co-current moments look like visualization failures.

Reason:
The canonical model must preserve historical uncertainty and partiality while still supporting defensible chronological filtering, playback, and comparison of overlapping periods.

Maintenance consequence:
Temporal consumers use canonical `temporalAssertions[]`; the former `parsedDate`/duplicate-parser fallback paths have been retired. The dedicated Timeline workspace must preserve the distinction between exact chronological placement and secondary-axis presentation/layout. Future structure filters must distinguish machine-derived temporal form from researcher-supplied notes.
```

#### Dedicated Timeline visualization-workspace decision

**Status:** Superseded in implementation specifics; enduring separation of shared chronology and dedicated Timeline remains applicable. **Related authority:** Timeline II and shared chronology contracts; later generalized-category decisions. This label classifies the record; current behavior must be verified against the latest accepted contract before implementation.

```text
Decision:
Add a dedicated Timeline visualization workspace while preserving the existing bottom Timeline/playback control as a separate shared chronological control.

Context:
The existing bottom Timeline successfully controls date range and playback across Map/Network/Charts, but it is not a full event-centered visualization. Researchers also need a chronologically faithful workspace for reading events, switching horizontal/vertical orientation, assigning plural Evidence-based categories, filtering the Timeline through Search/Explore, and seeing explicit mapped relationships among temporal subjects.

Chosen approach:
Keep the bottom Timeline/playback control unchanged in role. Add a dedicated Timeline visualization workspace inside Visualizations. Horizontal chronology runs earliest → latest left-to-right; Vertical runs earliest → latest bottom-to-top. Chronology fixes the temporal axis, while the orthogonal axis may be used for collision avoidance and relationship legibility. Categories are evidence-driven and plural; visible membership is OR-based. Mapped connections come only from explicit relationship semantics and must resolve distinct relationship endpoint subjects rather than being inferred from co-occurrence.

Rejected alternative:
Replace the bottom playback control with the new Timeline; make Timeline a separate top-level route outside Visualizations; force one category per event; infer event connections from shared participants/categories; or keep rigid lanes that prevent relationship structure from being read.

Reason:
The two Timeline roles answer different research questions. Shared playback coordinates the active temporal scope across visualizations, while the dedicated workspace is itself a visualization of temporal evidence. Keeping them separate preserves existing behavior and enables richer chronological analysis without manufacturing scholarly relationships.

Maintenance consequence:
Do not conflate `timelinePlaybackComponents.jsx` with `PeridotTimelineWorkspace.jsx`. Preserve exact temporal-axis placement, Search-scope authority, plural category semantics, conservative relationship derivation, and the ability to use both orientations, zoom, panning, scrollbars, and the shared Inspector. Relationship-line styling/routing may change, but not by loosening endpoint semantics.
```

#### Researcher-declared record and entity identity decision

**Status:** Current. **Related authority:** Data import and generalized mapping contract. This label classifies the record; current behavior must be verified against the latest accepted contract before implementation.

```text
Decision:
Treat identity as an explicit researcher-owned mapping concern, separate from display labels and from the row/record unit.

Context:
Generalized datasets can contain repeated display names, several roles for the same recurring entity, multiple kinds of recurring entities, and source tables without a pre-existing database ID. The same historical person may appear in sender, recipient, parent, partner, or profile columns, while different people may share the same displayed name.

Chosen approach:
Treat record identity and recurring-entity identity separately, but keep recurring Identity controls integrated into the relationship/place mappings where the entity is declared. Simple entities default to the displayed name/label. Stronger recognition may use a stable source ID or alternate complete compound recipes across roles/sheets—for example `(Source + Source Title) OR (Target + Target Title)` when both pairs describe the same Name + Title identity.

Rejected alternative:
Assume matching display names always identify one entity; require every user to add a dedicated ID column; infer entity merges automatically; or force one universal identity rule across all recurring things in a dataset.

Reason:
Humanistic source structures often encode identity relationally or through combinations of fields rather than modern database keys. The researcher is better positioned than Peridot to state what makes two appearances the same historical entity.

Maintenance consequence:
Display labels are presentation, not universal identity. Accepted Identity rules compile into stable runtime IDs; canonical entity labels are resolved separately for downstream presentation. Simple displayed-name defaults must remain low-friction, while stronger ID/compound rules stay researcher-controlled. Regression tests must cover same-label distinct entities, one entity recurring across roles, known ID→label resolution, and unresolved-reference fallback.
```

#### First-class sample-data decision

**Status:** Current. **Related authority:** Data workflow and sample-data contract. This label classifies the record; current behavior must be verified against the latest accepted contract before implementation.

```text
Decision:
Treat bundled samples as ordinary downloadable source files with ordinary generalized mappings, and never preload one implicitly.

Context:
Sample data is useful both for first-time exploration and for repeatable QA. An embedded fallback makes the application look as though data exists before the user has chosen it and obscures how the generalized mapper actually interprets the source.

Chosen approach:
Ship correspondence, family-tree, and cardinals source files under `public/sample_data/`; pair them with preserved generalized mappings; require explicit sample selection; allow source download; and let users edit the active sample mapping while preserving a resettable canonical mapping.

Rejected alternative:
Keep hidden embedded sample rows as the default app state; hard-code sample-specific parsers; or make the canonical sample mapping read-only.

Reason:
Samples should demonstrate the same transparent data path that researchers use and should double as stable QA fixtures.

Maintenance consequence:
No-data is a valid first-launch state. Sample-specific behavior belongs in metadata/mapping definitions, not a second runtime architecture. Editing a sample changes only the active interpretation and must not mutate the shipped source or canonical mapping. The chooser should start collapsed and remain repeatable: selecting one sample must not create local UI state that prevents a later sample from replacing it.
```

#### Cardinality / delimiter decision

**Status:** Current. **Related authority:** Data mapping, relationships and parsing contracts. This label classifies the record; current behavior must be verified against the latest accepted contract before implementation.

```text
Decision:
Model multiple values per cell as a per-mapped-item researcher declaration rather than a file-wide assumption or dataset-specific parser.

Context:
Humanistic tables may mix single-valued and multi-valued cells. Examples include multiple partner IDs in genealogy and evidence such as `clerical, familial, diplomatic`.

Chosen approach:
For each mapped item, let the researcher declare one value versus multiple values. If multiple, require the delimiter. Trim leading/trailing whitespace around values for non-space delimiters; if a literal space is explicitly chosen as the delimiter, treat that space as semantic.

Rejected alternative:
Guess delimiters automatically; apply one delimiter/cardinality rule to the whole upload; or implement a one-off genealogy partner parser.

Reason:
Cardinality varies by column and by scholarly structure. The researcher knows whether punctuation is data or separation.

Maintenance consequence:
This behavior is implemented through shared per-mapped-item value handling across suitable generalized mappings. Preserve explicit delimiter ownership, common quoted-delimiter normalization, raw source values, and the rule against positional zipping of parallel list-valued fields. Structured component dates/period endpoints remain structured units; multi-valued place cells cannot reuse one row-level coordinate pair.
```


#### Record/participant subject-attribution decision

**Status:** Current. **Related authority:** Canonical assertions and mapping contract. This label classifies the record; current behavior must be verified against the latest accepted contract before implementation.

```text
Decision:
Let one mapped Time, Place, or Evidence item describe the record, one or more mapped participants, or both while keeping canonical assertions atomic.

Context:
A historical source row can contain claims about several represented people/entities and about the record itself. A mutually exclusive “record or one participant” control cannot express shared claims and encourages information to bleed across participants.

Chosen approach:
Use one shared subject-selection model. The mapping may include the record plus multiple participant indices; runtime processing fans the mapping out into separate single-subject occurrences/assertions. Evidence preserves its per-record EvidenceSource while creating subject-aware canonical assertions linked back to that source.

Rejected alternative:
Treat all row metadata as belonging to every participant; store arrays of subjects on every canonical assertion; or add separate one-off attribution systems for Time, Places, and Evidence.

Reason:
Atomic subject-predicate-value assertions remain simpler for Inspector, Search, Network, export, and provenance while still allowing the researcher to express shared source meaning at mapping time.

Maintenance consequence:
Do not infer participant ownership from co-occurrence in a row. Preserve record-only Evidence as record-level, participant-specific Evidence as canonical entity assertions, and the shared subject-selection compatibility normalization.
```

#### User-activated optional mapping decision (2026-10-28)

**Status:** Current in principle; controls and names must be checked against current UI. **Related authority:** Data mapping contract. This label classifies the record; current behavior must be verified against the latest accepted contract before implementation.

```text
Decision:
Reveal optional Relations, Time, and Places configuration through explicit Add actions, while preserving automatic suggestion detection.

Context:
Automatically detected fields made full mapping forms appear before researchers asked to configure those aspects of their sources. Earlier collapsed-summary experiments obscured the intended Add workflow and displaced the Places editing grid.

Chosen approach:
Present Add a Relationship / Add a Date or Time Period / Add a Location at the top of the relevant page. Only populate a new visible form after the user activates it, while preserving the original full-width editing layout and mapped-data semantics.

Rejected alternative:
Automatically expand every inferred mapping, replace Add with an Edit summary, or insert disclosure wrappers as new children inside the Places two-column grid.

Reason:
Researchers should decide which semantic categories to configure without losing the benefit of likely column suggestions.

Maintenance consequence:
Retain the accepted single-group multipart `relationshipParts` model. Multiple independently configured relationships require a separate architectural pass, not a UI-only duplicate button.
```


#### One authoritative chronology component and evidence-first geometry repair (2026-11-01)

**Status:** Current in chronology-authority principle; implementation path must be checked against current architecture. **Related authority:** Shared chronology and geographic Map contracts. This label classifies the record; current behavior must be verified against the latest accepted contract before implementation.

```text
Decision:
Reuse the exact approved Timeline II chronology presentation across Visualize rather than duplicating its appearance, and diagnose geometry/initialization failures through complete state and coordinate tracing before modifying layout.

Context:
The initial shared-playback implementation independently recreated Timeline II controls, causing visual and pointer/temporal differences. Subsequent speculative Map framing and ruler-width changes failed until diagnostic logs revealed a delayed-mount measurement problem. Vertical Timeline II likewise remained truncated after compaction-only changes because its date-to-pixel axis length was itself shortened by the playback control reservation.

Chosen approach:
Extract PeridotChronologyDock.jsx as the single presentation owner, use a shared-state adapter for the existing App timeline index contract, and preserve Timeline II's calendar-day controller. Measure the shared ruler when chronology entries become available. Compute vertical event and ruler positions from the same full-height axis, using a narrow left-rail navigator beside playback controls.

Rejected alternative:
A second copy of the approved UI, unverified source-state assumptions, repeated speculative patching, or adjusting the playback controls instead of inspecting date-to-pixel geometry.

Reason:
Shared controls should remain consistent and independently testable, while temporal filtering remains faithful to researcher evidence. Cross-workspace lifecycle defects must be diagnosed using runtime values and full related source, not screenshots alone.

Maintenance consequence:
Read all exact affected sources, compare initial vs remounted state and actual container dimensions, preserve shared markup, and run first-load/return/resize/playback/horizontal-vertical regression checks. See the Maintainer's Guide chronology contract and Changelog commits 8cb1cbc and ddee7e2.
```

#### Unified calendar chronology, independent sessions, and source-extent presentation (2026-11-09)

**Status:** Current. **Related authority:** Shared chronology and Timeline II contracts. This label classifies the record; current behavior must be verified against the latest accepted contract before implementation.

```text
Decision:
Give Map, Network, Timeline and Charts one chronologically faithful padded ruler while maintaining per-visualization navigation/playback sessions and canonical event eligibility.

Context:
A shared-looking dock originally concealed distinct year-index and Gregorian-day domains. Map and Timeline could display inconsistent year ticks; empty time windows could be projected to the nearest populated year. Even after 10% padding worked, selected handles at the outer reset boundaries made the source-versus-padded distinction unclear.

Chosen approach:
Retain PeridotChronologyDock.jsx as the single presentation authority. Calculate domain bounds from the unfiltered complete dataset's source-supported temporal endpoints and add 10% on each side; use shared day-based window/ruler helpers and canonical date filtering. Keep sessions independent across visualization navigation. Mark the source endpoints with two gold diamonds, a dashed guide and a Data extent label (approved visual Option C). Commit the focused chronology tests alongside the implementation at 4fca872.

Rejected alternative:
Separate visually similar docks, year-index snapping of continuous windows, domain recomputation from applied Search filters or active roles, a lone unlabeled red extent line, or combining chronology implementation with concurrent Charts II development.

Reason:
The selected interval, full allowed domain, and source-backed actual record extent are different analytical objects. Users must be able to explore even empty historical time without Peridot inventing evidence; the chronology controls must also remain visually self-explanatory and preserve separate work sessions.

Maintenance consequence:
Preserve exact date/tick alignment, source-derived padding, period and partial-date intersection, Cumulative/Concurrent behavior, Search/role isolation, original source provenance, and dataset-switch resets. Check all four visualizations and both Timeline orientations; retain and run focused chronology Node tests. Keep uncommitted Charts II work outside the chronology commit. For architecture and regression details use the Maintainer's Guide; for milestone and verification limits use the Changelog.
```

#### Generalized, researcher-owned Timeline category decision (2026-11-10)

**Status:** Current. **Related authority:** Timeline II category editor contract. This label classifies the record; current behavior must be verified against the latest accepted contract before implementation.

```text
Decision:
Make Timeline categories a researcher-controlled visual interpretation of source-backed event attributes, not a fixed Evidence-only list or an automatically assigned taxonomy.

Context:
The correspondence, family-tree and cardinals samples expose different useful attributes. An Evidence-only category inventory concealed mapped people and places; automatic mapping-to-event assignments can misattribute values when one record contains multiple subjects or dates.

Chosen approach:
Discover candidate sources and values from actual uploaded/mapped data; preserve original column labels plus stable source provenance; allow explicit record-, subject- and assertion-level association policies; retain plural memberships, user-editable names, colors and optional symbols. Preserve the curated local Tabler icon library. The three-column editor described here is historical and was superseded by the five-column Source/Values/Priority/Color/Icons editor in decision 2026-11-11 above. Keep these presentation choices session-only pending a separately designed researcher-owned project format.

Rejected alternative:
Treat one sample's columns as universal, infer joins across unrelated sheets, equate all subjects within a record, or change canonical research evidence when a user chooses a visualization category.

Reason:
Visual categories help historians interrogate their own sources without asserting unsupported relationships or standardizing heterogeneous uploaded data.

Maintenance consequence:
Maintain field/source provenance, exact historical event associations, category identity and appearance across navigation; rerun the four category test modules and representative Correspondence, Family Tree and Cardinals browser cases. Do not restart automatically projected event-to-event arcs; their intended authoring/persistence semantics remain deferred.
```

#### Grouped swimlane interpretive priority and scoped scroll ownership (2026-11-11)

**Status:** Current. **Related authority:** Timeline II grouped lanes and horizontal scroll layout-risk plan. This label classifies the record; current behavior must be verified against the latest accepted contract before implementation.

```text
Decision:
Treat researcher-selected category swimlanes as an explicit interpretive organization and constrain their horizontal editor viewport at the Timeline II stage boundary, without changing unrelated visualization stage sizing.

Context:
Implicit first-category precedence limited the research questions a Grouped timeline could foreground. A wider five-column Categories editor initially clipped its fifth column: the scrollbar's 1,770-pixel owner reported zero internal scroll range, while a narrower ancestor clipped the editor. Repeated custom-navigation and thumb-styling passes did not fix the root width propagation.

Chosen approach:
Researchers star/unstar individual categories to establish swimlane eligibility; events occupy one eligible lane according to ordered default precedence or a legitimate explicit event-level assignment, with a No priority category fallback. Secondary memberships remain visual. Retain adaptive lane heights that settle after navigation. Use native horizontal scrollbar ownership in the Categories viewport and apply min-w-0 to both shared Visualize stage-transition wrappers only when Timeline II is selected. Keep Map, Network, Charts I and the separately developed Charts II on their existing stage sizing path.

Rejected alternative:
A single primary-dimension dropdown, conflating visual secondary memberships with spatial assignments, duplicating events across lanes, continuous per-frame regrouping, an elaborate Priority editor, custom slider/tab navigation, arbitrary scrollbar coloring as a substitute for true overflow, or unconditional shared-stage changes.

Reason:
The spatial category axis is itself a scholarly comparison; researcher authority must remain explicit and evidence-faithful. The browser needs the actual viewport to be narrower than its intrinsic content track for a native draggable thumb to exist. Conditional sizing limits unintended effects on other visualizations.

Maintenance consequence:
Preserve source-backed category membership and one-lane-per-event semantics, user-facing five-column horizontal/independent vertical scrolling, and the two Timeline-only conditional min-w-0 classes in PeridotVisualizationsWorkspace.jsx. Regression-check Timeline resizing/orientation, grouping, chronology, Inspector, and transitions to Map, Network and Charts; do not overwrite concurrent Charts II changes. See Maintainer's Guide current contract, the accepted source milestone f5791f1, and planning_documents/PERIDOT_TIMELINE_II_HORIZONTAL_SCROLL_LAYOUT_RISK_20261111.md.
```

#### Persistent OffscreenCanvas loader and first-mount Map decision (2026-11-03)

**Status:** Current where present; exact runtime ownership must be checked. **Related authority:** Loading and geographic Map contracts. This label classifies the record; current behavior must be verified against the latest accepted contract before implementation.

```text
Decision:
Retain a visually faithful Peridot loading animation independently of main-thread processing and correct first-load Geographic Map viewport registration.

Context:
The approved main-thread Canvas animation stalled during large workbook processing and visualization changes. A preliminary worker implementation imperatively replaced React-managed Canvas elements and was rolled back after a white-screen regression. A completed-ring startup still jumped when the animated frame-zero state began. Initial large-data Map activation could also leave the viewport unmeasured until navigation away and back.

Chosen approach:
Use the approved Forest Study through shared procedural Canvas drawing in an OffscreenCanvas worker with a React-owned lifecycle and fallback. Keep the transition worker mounted across workspace switches and pause it when hidden. Use an exact frame-zero embedded preboot image with first-frame handoff. Register Map viewport measurement when its DOM element actually mounts; retain existing chronology-first fit semantics. Source commit: 81c3719.

Rejected alternative:
Return to SVG/CSS artwork that failed the approved visual comparison; rely on additional main-thread frame delays; imperatively replace a transferred React-owned Canvas; or conceal an unmeasured Map viewport behind an arbitrary longer loader timer.

Reason:
Separate loader animation from long synchronous application work without changing the generalized research data model, while addressing the actual first-mount Map lifecycle defect rather than masking it.

Maintenance consequence:
Preserve worker/fallback/reduced-motion behavior, the exact Forest Study design, persistent pause/resume and startup handoff, and mount-aware Map measurement. Test large-data first load and repeated Map/Network/Timeline/Charts switching. Source-worker details and regression matrix live in the Maintainer's Guide; rollback chronology lives in the Changelog. Other-chat Timeline II work is outside this decision's scope.
```

### 7.2 Routing and workspace model

- The active public model is workspace-first with a persistent global header: **logo/Home, Data, Visualize, Explore, Tutorials, About**.
- Public page navigation must not intentionally unload the active dataset or discard accepted workspace state. Visualize keeps Map/Network/Timeline/Charts local navigation plus Export; Explore keeps Browse/Advanced Query/Refine; About keeps its scholarly project subpages.
- Heavy transition treatment is reserved for expensive visualization/workspace changes and mapping entry. Lightweight page navigation should remain immediate rather than receiving decorative loading overlays.
- Themes and Accessibility remains implemented but hidden from public navigation. Export remains a Visualize-local action. Timeline remains Visualize-integrated in two forms: a dedicated Timeline visualization workspace and the separate shared bottom Timeline/playback control.
- First launch has no active dataset. **Use sample data** must require an explicit sample choice rather than silently activating a fallback. The Sample Datasets tab remains accessible and supports sample replacement.
- Data mapping is a full-page Data workspace, not a modal/wizard shell. Its local section navigation is directly accessible. A first Relations/Time/Places mapping-UI redesign was committed at `f3cf4fb`; other stages and shared Identity presentation still require follow-up.
- The Cartographic Editorial Home and its three-column informational banner originated at `4e6fb11` and were refined at `7280e30`, `2117659`, and `60b8643`; these two Home actions were subsequently superseded in `ee4c3ff` by one Get Started action leading to the four-tab Data entry surface. Further Home interaction changes must not be smuggled into unrelated data-model passes.
- Tutorials is now a first-class navigation destination, but substantive tutorial revision remains deferred; do not restore the old floating invitation.
- About is the scholarly project-information destination and contains About Peridot, Creator, AI Disclosure, Open Source, and Feedback.
- MapLibre migrated-overlay work is archived. Active `main` continues the D3/SVG path.

#### Data entry and decorative-asset maintenance decision (2026-10-30)

**Status:** Current in accepted Data workflow; older animation/asset details require current verification. **Related authority:** Application shell, Data entry, and assets. This label classifies the record; current behavior must be verified against the latest accepted contract before implementation.

```text
Decision:
Keep public onboarding choices inside a four-tab Data workspace and preserve descriptive, role-based asset naming.

Context:
Beta testing showed that users needed clearer entry choices and a persistent path back to active mapping. A growing decorative catalog also required stable names and image-reference repair.

Chosen approach:
Use a single Home Get Started action, Data tabs Get Started / Sample Datasets / Templates / Upload Data, and a persistent active-dataset panel with Edit Mapping. Keep the three samples as ordinary downloadable/mappable files. Prefix asset names by role and put numeric differentiators at the end; use TL/TR/BL/BR for directional corners.

Rejected alternative:
Keep two competing Home entry buttons, hide mapping editing after loading data, silently preload samples, or deploy the experimental 44-file label/frame pack with unaccepted crop quality.

Reason:
Onboarding and map-edit access should be obvious without changing the generalized semantic workflow; durable, accurate asset paths are necessary for deployment.

Maintenance consequence:
Preserve Data tab continuity, dataset state, sample actions, safe viewport fit, and low-latency staggered entry animation. Repair image references when filenames move; never assume unaccepted artwork exists in the committed repository.
```

#### No-data editorial gateway, transition rollback, and production asset decision (2026-10-31)

**Status:** Current in no-data and asset-safety principles; historical transition experiment. **Related authority:** Application shell, no-data gateways, and loading. This label classifies the record; current behavior must be verified against the latest accepted contract before implementation.

```text
Decision:
Present Visualize/Explore no-dataset and Tutorials Coming Soon as coordinated editorial gateway pages, and load their artwork through Vite imports.

Context:
The same research-start prerequisite appears in multiple destinations; the earlier two-CTA treatment duplicated Data onboarding. An experimental horizontal cross-page transition later caused an undefined-variable crash. Root-relative and manually base-prefixed image URL strings failed to reliably package artwork for GitHub Pages.

Chosen approach:
Give each page one prominent Go to Data action, common parchment and full-width illustrative tear, and staged first-entry/page-replay animation with reduced-motion support. Keep the approved simpler animation model; use static asset imports from the established assets directory so Vite manages deployment paths.

Rejected alternative:
Offer competing upload/sample choices on every gateway, restore a default sample, keep the faulty horizontal outgoing/incoming transition, rely on hardcoded /assets/ URLs, or duplicate top-level artwork into public/assets as an unreviewed workaround.

Reason:
One clear route to Data reduces friction and keeps onboarding semantics centralized. Source-aware image imports preserve both local rendering and build output; rollback of a fragile routing experiment protects the established working interface.

Maintenance consequence:
Preserve the Visualize/Explore/Tutorials gateway distinction from active-data workspaces, App routing, CTA behavior, animation replay, and reduced-motion handling. Inspect exact current files before route changes; build and verify production asset outputs as well as the deployed site before declaring publication success.
```

### 7.3 Inspector

- Inspector is dual-mode: compact visualization-click summaries and full dossier navigation share selection state and **central multi-step Back history**.
- Full Inspector overlays rather than remounts Visualizations. Linked records, legitimate routes, people/entities, places, and clusters participate in shared history.
- Linked-data curiosity is a hard preservation contract: a researcher must be able to follow a chain such as node → connected person → another connected person → connected place → connected record, use Back several times, and then branch from an earlier dossier.
- Generalized Inspector derivation is now the accepted model. Compact and expanded views consume generalized relationship, participant-place, temporal, Identity, and evidence semantics at different densities rather than assuming universal Source/Target pairs.
- Correspondence-specific sender/recipient or origin/destination summaries remain valid when the mapping genuinely supports them; non-correspondence datasets must not inherit fake directed routes or omit later n-part participants because of a compatibility projection.
- Participant attribution is authoritative: mapped Time, Places, and Evidence about one participant must not bleed onto another merely because both occur in the same row. Entity Inspector Evidence should consume canonical subject-aware assertions rather than re-scraping source rows.
- `Unknown` remains a first-class bucket only for genuinely unresolved source evidence; connected-record sorting/filtering/pagination behavior remains a preservation contract.

### 7.4 Search and data scope

- Explore is the owner of global applied filtering.
- The accepted public Explore shell is **Browse / Advanced Query / Refine**. Advanced Query retains the query builder plus current Results; Refine contains applied-result facets, Inspector handoff guidance, and capability review. These are presentation groupings over the existing draft/apply semantics, not changes to scope authority.
- Generalized Place semantics use mapped place assertions without inventing routes from co-occurrence. Search Evidence uses canonical subject-aware mapped-Evidence assertions. Results presentation is neutral/generalized rather than universally Source/Target.
- The legacy global minimum correspondence/connection weight is retired. Optional count conditions attach to an individual structured criterion and state explicitly what is counted—for example **This place has at least N connected places** or **People in these records have at least N connected entities**. Reference counts come from loaded/mapped Search data; the primary criterion determines returned records.
- Browse uses loaded data. Search Results/Refine use applied/filtered data and remain stable during playback. Entity/place Inspector dossiers also use applied/filtered linked-record scope rather than shrinking with playback.
- One bounded follow-up remains: **Any record text** does not yet guarantee indexing of every generalized mapped semantic value.

### 7.5 Analytics

**Historical decision record, superseded in its interface details:** The following principles were adopted for the original Analytics/Charts I implementation. The active interface is now the Charts II Catalogue/Builder, with a separate Builder PNG export, chart-local Filters, and adaptive Appearance; see the Maintainer's Guide, section 6, and the Changelog milestones through `e96c375`. Preserve the dated/undated distinction and the intent of stable, explicit researcher-controlled chart semantics rather than resurrecting the obsolete Charts I panel or local year controls.

- Chart Visualizations belongs inside Visualizations, with tabbed controls and a large chart surface.
- Dated chart records obey the global Timeline/playback scope; genuinely undated/non-positionable Search-matching records remain available to Analytics by default.
- The local Start/End Year controls constrain dated chart records. **Exclude undated records?** is a separate explicit option and is off by default.
- Record count is explicit; Year is the default ordered date axis; compatible settings and manual selections should persist where safe.
- Chart summaries/legends must represent displayed values persistently and export with the chart.
- Chart series colors come from the finite Peridot palette by default and semantic theme roles when users explicitly target charts.

### 7.6 Themes and visual language

**Current visual-decision note (originally through 2026-10-26; later Data/asset changes documented below):** Cartographic Editorial is the approved art direction for Home/public-facing editorial surfaces; the accepted Florence/paper hero, informational three-column parchment banner, corner collages, compact Visualize editorial frame, and shared button roles are now established at `4e6fb11` and subsequently refined through `27e3cf7`. The original H2e hero decision entered at `fd02d84`; that old local-only status is historical. H2f's diagonal-mask experiment was rejected due to wordmark/text intrusion. Future visual passes may crop/rotate licensed paper derivatives and change banner content, but must preserve legibility, functional navigation, research-workspace vertical room, and explicit asset credits. The old green/gold Home rules below are historic design guidance superseded by this deliberate decision. For any stock-containing files already published, verify source-redistribution rights and required remediation separately; before future publication, check permissions rather than inferring them from licensing for website use. These visual decisions do not authorize changing semantic data behavior or introducing a new theme engine.


- Color changes should use semantic roles in `peridotTheme.js` and related metadata.
- Cartographic Editorial uses paper/ivory, oxblood, forest green, and readable ink for editorial surfaces; map/chrome/chart palettes and dropdown layering remain semantic/system concerns rather than local cosmetic overrides.
- Home is now a layered historical-map/paper editorial composition; **About** carries expanded scholarly project information; historical map and licensed asset provenance must remain clear.

#### Cartographic Editorial homepage geometry and shared-button decision (2026-10-25)

**Status:** Historical in exact Home geometry; current shared-style and preservation principles remain relevant. **Related authority:** Application shell and editorial presentation; later Home redesign. This label classifies the record; current behavior must be verified against the latest accepted contract before implementation.

```text
Decision:
Preserve the accepted full-screen desktop editorial composition and use shared button role styling instead of independent one-off button variants.

Context:
Home's Florence/paper hero and corner-framed information banner underwent several layout refinements. A narrow blank strip at the viewport bottom exposed duplicated header-height subtraction; separate collage crop and feature-grid adjustments were needed to achieve optical rather than mathematical centering. Concurrent work consolidated shared button variants.

Chosen approach:
Let the application shell allocate the area beneath the global header; make Home fill that parent area and use flex sizing for hero and lower banner. Keep the parchment banner, informational feature grid, and independently positioned transparent corner collages separate. Offset only the content grid for optical balance. Use shared primary/secondary button styles and appropriate semantic oxblood/green playback states.

Rejected alternative:
Subtract `72px` from `100dvh` inside Home after the shell has already sized it; translate the entire banner to hide a bottom gap; move the corner assets along with unrelated content; or add special-purpose button rules for every workspace.

Reason:
Parent-relative geometry resolves the actual layout boundary, while independent decorative and information layers allow predictable adjustment without cropping or accidental clicks. Shared controls reduce competing CSS behavior.

Maintenance consequence:
Preserve the one-screen desktop composition and its decorative crop, prevent bottom gaps and scrollbars, and test button semantics in Data, Visualize/playback, and other relevant workspaces. Do not change canonical data interpretation as part of visual adjustments. The provenance of imagery remains subject to source-specific licensing checks, independently of Git publication.
```

#### About manuscript-style layout and responsive Data presentation decision (2026-10-30)

**Status:** Current in editorial/readability principles; exact geometry should be verified. **Related authority:** About and Data presentation contracts. This label classifies the record; current behavior must be verified against the latest accepted contract before implementation.

```text
Decision:
Use outer-edge torn-illustration corners as part of the About page's manuscript composition, and favor close shape-aware content wrapping rather than oversized fixed rectangular image exclusions.

Context:
The original rigid column offsets either put text and divider rules over irregular artwork or left large unused cushions. About and Feedback also had to remain usable in narrower laptop windows. Data's sample cards and bottom dataset-status panel needed to share a shorter viewport without sacrificing text size.

Chosen approach:
Anchor each corner to the outer About content boundary; let content and rules clear the actual image with modest padding. Keep the Creator photo framed by four red ornaments outside its edges. Retain Feedback's two-column workflow, using a prominent left-aligned submit button and avoiding bottom-right image collisions. For Data, reduce sample-card vertical padding/footprint while preserving text scale and bottom-panel visibility.

Rejected alternative:
Overlay content with decorative images, impose a large universal rectangular left/right spacer, shrink all card text, or resize the persistent dataset-status panel merely to fit the sample cards.

Reason:
The design aims to resemble a page in an illustrated manuscript without sacrificing readable, responsive research workflows.

Maintenance consequence:
Regression-test About pages, Feedback submission, the Creator portrait, and Data entry across laptop and larger viewports. Use the latest exact source before changing breakpoints or CSS; these visual decisions do not alter generalized data or application scope contracts.
```

#### CARTO geographic basemap and self-contained export decision (2026-10-31)

**Status:** Current. **Related authority:** Geographic Map and Export contracts. This label classifies the record; current behavior must be verified against the latest accepted contract before implementation.

```text
Decision:
Retain the existing D3/SVG geographic research system while using CARTO Web Mercator raster tiles and self-contained attributed exports.

Context:
The initial tile renderer suffered vertical overshoot, blank gaps, high-zoom SVG positioning failure, slow research-edge rendering, and missing basemap images in exports.

Chosen approach:
Use viewport-relative raster tile positioning, horizontal world wrapping, bounded vertical panning, buffered/cached tile loading, clipped/culling edges, and a basemap selector in transactional Map settings. Embed tiles into exported SVG/PNG and include readable Peridot, OpenStreetMap contributors, and CARTO attribution.

Rejected alternative:
Treat a tile-request success flag as successful high-zoom rendering, ship research-only image exports without visible basemap errors, expose private API key URLs in exported SVG, or migrate away from the accepted D3/SVG engine without a bounded architectural review.

Reason:
Preserve research semantics, responsive interaction, shareable images, and map-provider attribution within the current architecture.

Maintenance consequence:
Keep the CARTO key untracked and excluded from export URLs; regression-test zoom, wrapping, drag/scroll races, Inspector edges, style Apply/Reset, playback, and exported PNG/SVG imagery and credits.
```

### 7.7 Export

- Export is an in-place Visualizations header action.
- Map PNG default output is unbranded map-only content, with optional title/metadata using Peridot typography.

### Navigation-state persistence and public header decision

**Status:** Current. **Related authority:** Application shell and shared state contracts. This label classifies the record; current behavior must be verified against the latest accepted contract before implementation.

```text
Decision:
Use one persistent global header across Peridot's public pages and preserve the active research state while users navigate.

Context:
The earlier hamburger/workspace model made ordinary navigation feel detached from established website conventions, prevented a reliable return to Home, and made near-instant page changes feel heavier than necessary.

Chosen approach:
Keep the Peridot logo as Home; expose Data, Visualize, Explore, Tutorials, and About persistently; use workspace-local second bars for Visualize, Explore, mapping, and About; preserve the active dataset plus accepted filtering/playback/viewport/workspace state across page changes; reserve the heavier loading transition for genuinely expensive changes.

Rejected alternative:
Keep the hamburger as the primary public navigation system; reload/reset research state on page changes; or place a transition overlay on every lightweight route.

Reason:
Researchers need predictable website-level orientation without losing the analytical state of their working session.

Maintenance consequence:
Navigation changes must be tested for active-dataset continuity, filters, playback position, visualization state, and direct Home return. Do not add a general page-transition animation to ordinary lightweight navigation.
```

### Full-page Data mapping decision

**Status:** Current in full-workspace model; earlier UI details may have evolved. **Related authority:** Data import and generalized mapping contract. This label classifies the record; current behavior must be verified against the latest accepted contract before implementation.

```text
Decision:
Treat upload/mapping as a full Data workspace rather than a modal wizard.

Context:
The modal mapping shell duplicated the Data selection page underneath it, obscured page hierarchy, and consumed space while implying a strictly linear workflow.

Chosen approach:
Open mapping beneath the persistent global header as a full-page Data surface. Keep directly accessible mapping sections, rename the final section Review and Upload, and visually separate Cancel from the grouped Back/Next controls.

Rejected alternative:
Keep a scrim/modal over the Data landing page or redesign the entire mapping content during the navigation pass.

Reason:
The structural navigation problem could be solved independently while preserving the existing mapping semantics for a later focused usability redesign.

Maintenance consequence:
Do not return mapping to modal presentation. The first shared Relations/Time/Places mapping presentation redesign is committed at `f3cf4fb`; remaining mapping screens and identity styling are further redesign targets.
```

### 7.8 Archived or superseded decisions

- Earlier persistent-rail, standalone Export, top-level/standalone Timeline-route, legacy three-file upload, and MapLibre preview directions are historical or superseded. The current dedicated Timeline is a visualization subworkspace inside Visualizations and does not revive the older standalone-route model. Active replacements are identified in the contracts above and in the Changelog.


<details>
<summary><strong>Historical flat decision inventory retained for preservation</strong></summary>

This is a preserved legacy archive of the earlier cumulative decision list. It is not the active organizational model: the concise decision records above are the authoritative categorized index. New or revised decisions must be added under Sections 7.1–7.8, using the stated decision-record format. The archive remains available so no historical rationale is lost during the transition.

The following detailed inventory is retained to preserve the complete decision record that previously existed as a flat list. Future decisions should be added under the domain headings above and, when needed, expanded into the consistent record format below.

```text
Decision:
Context:
Chosen approach:
Rejected alternative:
Reason:
Maintenance consequence:
```


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
- Advanced Search is the long-term owner of global dataset filtering and the primary Explore Your Data surface.
- The completed Search/Explore redesign uses a compact folio workflow: Build fits by default, Browse uses compact route-aware ledgers, Results uses Inspector-style pagination and route-aware ledger rows, Refine uses route-aware expandable facet cards, and Capabilities uses compact review cards.
- Inspect actions from Explore should open the full Inspector as an overlay above the current Explore page instead of navigating away; closing Inspector should return to the same Explore tab/state.
- Explore animations should remain gentle and useful: left-to-right step-button sequencing, soft content transitions, default Results/Browse row filing effects, normal scrolling after expansion, and reduced-motion fallbacks.
- Controls / View should govern display, not the active filtered dataset.
- Timeline should focus on chronological playback and consume the active date range.
- Analytics should chart the currently filtered dataset by default.
- Advanced Search uses draft inputs plus explicit Apply Filters rather than live filtering.
- Predictive suggestions should support discovery without becoming full dropdown selectors.
- Route filtering is split into Route Filter (Place) and Route Filter (People).
- Advanced Search should visually resemble a compact database/library advanced-search interface rather than a stack of explanatory cards.
- Expanded Analytics charts should keep the chart on a white/cream card while the layer behind it can use a dark translucent green with blur to preserve map context.
- Data Inputs should use one standardized Peridot CSV upload as the public workflow.
- The Data/workbook mapping modal should use the compact Preview/Sheets/Time/Places/Relations/Evidence/Review workflow, combined workbook sheet-column selectors, neutral Review warnings, and opacity-only step transitions.
- Peridot should treat uploaded correspondence data as database records first and visualization inputs second.
- Rows can be accepted when they contain either source/target names or source/target place information; coordinates and parseable dates are capability-enabling fields, not upload-admission requirements.
- Peridot should not clean, standardize, merge, or enforce controlled vocabularies for uploaded names, places, dates, topics, relationships, languages, titles, notes, or links. Users are responsible for standardization outside the app.
- Arbitrary CSV/TSV imports should use an explicit user-confirmed column-mapping workflow rather than silent guessing.
- Core correspondence-compatible Peridot variables remain supported for route/network workflows, but the upload mapping UI should present field roles rather than asking users to conform to correspondence-only “Peridot variables.”
- Peridot should support broader humanistic datasets through role-based mapping for record identity, time, places, relationships, evidence/analysis, and capability review.
- Generalized Identity mapping should let researchers declare how records and recurring people/places/other things are recognized, including label, single-field, composite-field, and row-unique strategies; display labels are not universal identity.
- The same recurring entity may appear in different roles or sheets. Equivalent identity components should be mapped across those contexts rather than treating source column names such as Source and Target as different identities.

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
- The hamburger menu is now product-task oriented: Manage Your Data, Visualize Your Data, Explore Your Data, and Learn More about Peridot.
- Explore Your Data routes directly to Advanced Search; Inspector remains available through visualization/evidence workflows and compatibility paths rather than as a standalone top-level hamburger destination.
- Export should be an in-place visualization header action rather than a standalone top-level workspace.
- Chart Visualizations should use a dedicated large workspace with controls on the left and the chart canvas on the right.
- Chart Visualizations should use a tabbed builder when that avoids a long cramped control rail; the current accepted tab set is **Chart type**, **X/Y variables**, **Visible categories**, and **Presentation**.
- Timeline is now implemented as a bottom Visualizations scrubber; future timeline work should refine this integration rather than reviving a standalone timeline workspace.
- Map legend and controls should start minimized to preserve visualization workspace area.
- Learn More about Peridot is a public project-information hub for creator context, project resources, AI-method disclosures, tutorials, and help content. Keep detailed onboarding there rather than rebuilding it into the minimal Home workspace.
- Themes and Accessibility is the appearance/settings hub; future accessibility controls should live there.
- Themes and Accessibility is currently hidden from the public hamburger menu because it remains more useful for development than for ordinary users. Keep the workspace, route mode, and component intact so the menu entry can be restored later.
- The hamburger-triggered labeled menu is the intended primary navigation surface; the old persistent icon rail is legacy/compatibility code unless explicitly revived.
- Home, Data, Visualizations, Advanced Search, and Learn More are the primary public full workspaces; Themes and Accessibility remains an internal/development-facing full workspace; Export is integrated into the Visualizations header.
- Timeline should not be promoted to a standalone full workspace; the preferred future direction is a bottom timeline/scrubber integrated with Visualizations.
- Inspector is now dual-mode: visualization clicks open compact side-panel summaries, while hamburger **Inspector**, compact **Expand**, compact summary buttons, and linked-data clicks open the full Inspector workspace.
- Compact and full Inspector modes must share one selection state and multi-step Back history.
- Linked-letter detail pages are part of shared Inspector state/history, not a local-only subview.
- Compact summary tiles should remain at-a-glance affordances that open the full workspace for deeper reading.
- Directed route rows should open route/edge Inspector dossiers and participate in Back history.
- Analytics is conceptually part of Visualizations, not an independent side-panel-first workflow.
- The ordinary legacy Geography / Raw Data / Person Metadata three-file workflow is superseded by the one-file template upload and mapped arbitrary-table import workflows; do not reintroduce it unless a specific recovery or compatibility need is identified.
- Capability-aware visualization menus should explain unavailable views instead of showing empty workspaces when the active dataset cannot support a selected visualization.
- Chart Visualizations should list chart types directly, and each chart should expose relevant variable controls rather than routing users to one broad Analytics choice.
- Record count is a chart metric, not an implicit hidden default; it should be selectable where aggregate charts use record aggregation.
- Generic chart/evidence records should be accepted into the active dataset when they contain useful temporal, numeric, categorical, citation, link, note, or selected metadata content, even when they are not map-ready or network-ready.
- Evidence and analysis field inclusion should use explicit Include and Ignore choices, defaulting to Include, so users understand what metadata will be preserved for Inspector, charts, search, and export.
- Color changes should flow through `peridotTheme.js`, `peridotThemeRoleMetadata.js`, and semantic role targets whenever possible. Component-local hardcoded colors should be treated as compatibility exceptions or temporary defects to centralize later.
- Theme palette import should remain role-targeted so users can apply a detected palette to the whole app or to narrower scopes such as charts, map/network, navigation, timeline, search, Inspector/search, or text/borders.
- The finite Analytics chart color library should remain a curated 30-color default with greens/golds dominant and blues/pinks reserved for supporting contrast. Arbitrary imported palettes should replace chart series colors only when the user explicitly applies a palette to **Charts** or the whole app.
- Chart-targeted palette imports should be scoped to Analytics series colors. They should not recolor headers, timeline, map controls, search, hamburger menu, or other non-chart chrome.
- Visualization header and Timeline collapse/expand controls should stay as high-layer ornamental edge controls. They must remain in front of visualization layers and communicate expansion direction pictorially rather than relying on large text labels.
- Dropdowns and palette/control menus that open over the chart/map stage must be layered above visualization surfaces; treat dropdown portal/z-index regressions as visual bugs, not cosmetic preferences.
- Planning and audit documents from color/theming work belong in `planning_documents/` and should stay tracked there when they describe active design decisions or implementation constraints.
- The palette-system commits from `034ec67` through `81dd7af` establish the current theme-editing direction: central palette values, semantic roles, role dashboards, image palette import by theme area, foundation-tone routing, darkest/lightest role anchoring, built-in Peridot presets, and upload-guide/dropdown-layering behavior.
- Chart date axes should default to **Year** because most historical users care primarily about yearly patterns; **Full date** should remain available when month/day specificity matters.
- Partial dates should follow chart settings: month/day should not affect a Year chart, while Full date charts should use the most specific parseable date label available.
- Chart users should be able to manually choose the people, places, routes, categories, or comparable values they want to visualize instead of relying only on automatic Top N.
- Compatible chart settings should persist across chart-type switches where possible, especially date windows, selected fields, selected manual categories, selection mode, comparison-total mode, and display limits.
- Chart summary/legend panels should make key values visible persistently rather than hiding them only in hover tooltips; panels should be included in SVG/PNG chart export.
- Chart legends should faithfully represent every displayed series/category/slice/cell group rather than folding visible items into a generic “x more” label.
- Axis-based charts should use readable major and minor ticks/gridlines with adequate contrast against the parchment chart surface.
- Chart colors should come from the finite Peridot chart color library by default and from active semantic chart-series roles when the user explicitly applies a chart palette; do not scatter one-off chart series colors through chart renderers.
- Map and visualization chrome colors should be routed through semantic theme roles where possible.
- Peridot’s logo assets should live in `assets/`; solid-background variants are used for documentation/reference display, and transparent variants are used by the Home workspace hero.
- The Home workspace should remain an informative-minimalist title-card surface: a large Peridot logo, one concise description sentence, and two CTAs (**Use sample data** and **Upload your data**). Detailed onboarding belongs in **Learn More about Peridot**.
- **Historical Home title-card contract (superseded):** the older fixed-ratio stage privileged logo/text/buttons with decorative filigree framing. This is not the current Cartographic Editorial Home contract; do not restore its Adobe filigree.
- The Home text hierarchy should remain: **PERIDOT** wordmark largest, “Your go-to…” sentence second, button labels smallest.
- **Historical provenance:** the old homepage filigree came from licensed Adobe Stock images. The five tracked filigree PNGs were deliberately removed from the working tree on 2026-10-25. Keep their origin documented, but do not treat them as current dependencies or freely redistributable project artwork.
- Map PNG export defaults to map-only output with no Peridot branding. Optional export title appears above the map image; optional metadata appears below it. This supports researchers using exports in presentations without unnecessary branding or whitespace.
- Map PNG export should use Peridot’s in-app typography and readable text sizes for presentation legibility.
- Capability wording should use plain availability language: unavailable visualization types are **not available** for the dataset, not merely “limited.” User-facing capability cards should avoid internal diagnostics language.
- Staged workspace animations are acceptable when they orient the user without blocking work; the current visual direction uses subtle entrance choreography and a solid dark-green visualization transition rather than text-heavy loading states.
- Force-Directed Network initial framing should privilege the densest information cluster / strongest node neighborhood rather than always fitting the whole network evenly.
- Chart-builder and Inspector visual language now distinguish primary commands, related-object navigation, evidence/information cards, and passive metadata. Gold should not be used indiscriminately for every clickable object.
- The full Inspector should behave like a scholarly reference entry rather than a dashboard stack: a compact lead summary, optional image/placeholder, connected people/places, directed connections, selected fields, and connected-record tables.
- The full Inspector overlays the existing Visualizations workspace without remounting the map/network/chart surface; closing the Inspector should feel like setting a reference book aside rather than reloading the desk underneath.
- `Unknown` is treated as a first-class place-like bucket, parallel to unresolved person/entity values such as `Illegible`, so missing/unresolved place values are preserved, counted, and inspected rather than silently dropped.
- Connected-record tables should be capability-aware: relational datasets show source entity, target entity, source location, and target location; point-only datasets show entity and location. This table-specific distinction should not force the relationship-summary sections to drop their source/target role logic.
- Connected-record tables should support date-first chronological defaults, sorting, filtering, 10/25/50 page sizes, and pagination so high-volume dossiers remain usable.


- Learn More about Peridot is now a public project-information hub rather than a placeholder. It should keep compact reading as the default, retain expandable creator and disclosure prose, preserve access to open-source project resources, and keep tutorials/help material separate from the minimal Home workspace.
- **Historical Learn More styling (superseded):** its ornamental divider treatment followed an earlier Inspector/Explore filigree language. The current removal pass retires filigree decorations in active Inspector/Explore; do not copy those deleted assets into present-day page designs.
- The Learn More expanded biography may grow while the GitHub resource card contracts. The portrait belongs to the biography’s reading flow and should allow prose to wrap alongside it and continue beneath it.
- A small shared-style change must preserve the accepted behavior of unrelated current rules. For example, a Learn More parchment-color adjustment must not reintroduce an earlier portrait crop or remove the expanded biography’s text-flow rules.

- Component-specific CSS is now extracted into dedicated stylesheets for Inspector, Analytics, Search, Mapping, and Learn More. `index.css` remains a shared/global contract, and `main.jsx` import order is treated as functional cascade behavior.
- CSS extraction, dead-rule cleanup, visual redesign, and functional repairs are separate bounded passes. Never remove or rewrite suspect component styles merely because a selector appears unused until the extraction has been visually verified.
- Search has a deferred coverage/scope audit: verify loaded dataset versus applied result set versus the records/counts displayed by Browse, Results, Refine, facets, pagination, capability filters, structured criteria, and Inspector handoff.
- Timeline playback has a deferred Analytics audit: verify timeline range/playback scope against chart input rows, chart-local date controls, rendering updates, titles/counts/legends, and export output.

---

</details>

## 8. Standard Handoff and Completion Template

**Rule interpretation (read together with the full binding instructions below):**

- **Intention:** Make work repeatable across conversations without reconstructing previous context.
- **Origin / context:** Earlier fresh-chat records contained frozen checkpoints and tasks that later became obsolete.
- **Trigger:** At every pass completion and new-session continuation.
- **Prohibited shortcut:** Do not copy an older handoff snapshot as current state.
- **If blocked or uncertain:** Verify checkpoint or mark it unconfirmed; ask only for genuinely unavailable current source.
- **Verification:** Provide exact change list, tests, residual risks, artifact paths, and current authority.


Each implementation pass should end with:

- what changed;
- exact files changed;
- one acceptance test;
- whether the result is a checkpoint or commit;
- a uniquely versioned replacement bundle when files are being delivered;
- exact PowerShell extract/copy commands verified against the bundle's actual internal structure;
- verification commands appropriate to the pass;
- exact Git commands;
- known residual risks.

### Fresh-chat handoff

**Apply the Golden Rule:** When the prior session leaves genuinely material uncertainty about source authority or accepted scope, identify the exact missing fact and ask Haley; do not silently fill the gap with an old handoff note.

A new chat should begin with the confirmed source-of-truth folder, active branch, and current synchronized checkpoint from the most recent clean sync ritual (see the single standardized checkpoint block near this document’s beginning). It should also receive the narrow current task, relevant current source files, and the applicable planning/contract documents. Each new conversation should begin by rereading the four core documents before any development work is done.

**Historical handoff snapshot (superseded, retained for provenance):** At the `ea7cda8` checkpoint, local development on the user's Windows machine was started with `npm.cmd run dev`; local Charts II changes then remained intentionally uncommitted. This does not describe the current `d5d7a1b` checkpoint.

For core documentation work, provide all four core documents and `PERIDOT_CORE_DOCUMENTATION_GOVERNANCE_PROTOCOL.md` before edits begin.

### Documentation-pass completion addition

For core-documentation work, complete the Governance Protocol checklist before delivery: confirm checkpoint, ownership, preservation, navigation, and delivery conditions; record the documentation result in the Changelog; and do not silently delete historical or technical knowledge.
