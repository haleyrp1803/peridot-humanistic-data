# Project Workflow Charter

## Purpose

This document defines how changes should be made to the correspondence visualizer app. Its purpose is to reduce risk, prevent version drift, keep source-of-truth discipline, and make changes easier to review and maintain. This charter should be consulted before every implementation pass.

---

## 1. Source-of-truth rule

At the start of any pass, establish one authoritative source of truth.

During active editing, the source of truth must be exactly one of the following:

- one specific local project folder
- one specific pasted/exported file

GitHub, canvas copies, temporary zips, and other artifacts may be references, but they must not be treated as co-equal authoritative sources during the same pass unless that divergence is explicitly acknowledged.

---

## 2. Alignment rule before starting a new pass

Do not begin a new implementation pass until the current relationship among these is known:

- local folder
- GitHub repository
- pasted/exported file
- temporary delivered artifact

They must be either:

- confirmed aligned, or
- explicitly acknowledged as intentionally divergent

---

## 3. Bounded-pass template

Every coding pass must begin with a bounded-pass definition that states:

- **change type**: behavior, visual, structural, or documentation
- **goal**
- **in-scope files/regions**
- **out-of-scope files/regions**
- **one plain-language acceptance test**
- **expected artifact**: targeted patch, replacement block, full file, zip, or commit-ready instructions

This is mandatory.

---

## 4. Change-type separation rule

Do not casually mix the following in one pass:

- behavior changes
- visual changes
- structural refactors
- documentation updates

If a pass truly must combine them, that combination should be explicit and justified. Default behavior is one change type per pass.

---

## 5. Fragile-zones preflight rule

Before touching a fragile zone, explicitly state:

- which fragile zone is affected
- what might break
- what is intentionally not being touched
- how the result will be verified afterward

Known fragile zones include:

- viewport centering/reset
- dense-map hover/click interaction
- selection persistence across filters
- inspector-open interactions
- playback/timeline state
- export rendering

---

## 6. Refactor threshold rule

If a requested change can be completed safely with local edits, do that. If the change would require touching more than one fragile subsystem, do not let it silently expand into a rewrite. Convert it into a planned structural pass instead.

---

## 7. Tooling and dependency freeze rule

Unless a pass is explicitly about tooling or architecture, do not introduce:

- package upgrades
- config rewrites
- lint/format churn
- file renames
- folder moves

These changes create noise and increase risk when mixed into normal feature work.

---

## 8. Delivery-mode rule

Use the smallest safe delivery format.

- **small local edit** → targeted patch instructions
- **medium bounded area** → replacement block with anchors
- **high-risk or unstable file** → full-file replacement from the current source of truth

The delivery mode should match the risk level, not convenience.

---

## 9. Acceptance-test rule

Every bounded pass must end with one explicit plain-language acceptance test.

Examples:

- "Selecting a node still opens the inspector without resetting the viewport."
- "Changing the theme preset updates panel styling without affecting map interaction."

If the acceptance test cannot be clearly stated, the pass is probably too vague.

---

## 10. Checkpoint vs commit rule

Use these terms precisely.

### Checkpoint
A **checkpoint** is a tested intermediate state that may still be revised soon.

### Commit
A **commit** is a coherent completed pass with one clear behavioral, visual, structural, or documentation outcome.

Do not blur the distinction.

---

## 11. Behavior-first / cleanup-second rule

For UI and interaction changes, prefer this sequence:

1. make the behavior change
2. verify it with the explicit acceptance test
3. only then run a cleanup pass for dead code, copy changes, or adapter simplification

Do not combine speculative cleanup with an unverified new behavior if it can be avoided.

---

## 12. Live-file targeting rule

When creating scripted patches, target the **exact current live file shape**, not an assumed earlier state.

If a UI change does not visibly appear:

- verify the live file immediately with direct inspection
- confirm whether the patch actually landed
- do not stack additional speculative patches until the current live file state is known

This is now a standing reliability rule.

---

## 13. Recovery rule for drifting passes

If a pass becomes unstable or starts requiring repeated speculative fixes:

- stop stacking patches
- identify the last safe commit
- restore the working tree to that safe state
- document the attempted-but-rolled-back work as deferred if needed
- restart from a fresh bounded pass

A safe rollback is preferable to an increasingly unreliable patch chain.

---

## 14. Documentation preservation rule

When updating documentation:

- preserve older useful text unless it is clearly obsolete
- add new material rather than rewriting aggressively by default
- distinguish carefully between:
  - committed safe-baseline work
  - attempted but uncommitted / rolled-back work

Documentation should be cumulative and trustworthy, not merely tidy.

---

## 15. Full-history changelog rule

The changelog should preserve the full development trajectory.

That means:

- every safe commit should be documented
- rolled-back work may be noted, but only when clearly labeled as deferred / uncommitted
- the full-history section should remain cumulative rather than being replaced each time

---

## 16. Fresh-chat escalation rule

When a conversation becomes long enough that patching starts becoming unreliable or laggy:

- restore the safe baseline
- update documentation
- continue in a new chat

This is a normal recovery procedure, not a failure.

---

## 17. Current safe-baseline handoff rule

When ending a long or unstable sequence of passes, documentation and handoff notes should explicitly record the current safe baseline commit so future work starts from the correct point.

At the current documentation baseline, that safe commit is:

- **`57b946e` — `Make timeline year-based`**

---

## 18. Closing reminder

The app has become safer to modify through bounded extraction work, but it still contains fragile orchestration in `src/App.jsx`. The correct response to this is not broad rewriting; it is disciplined bounded passes, verified outcomes, and clean recovery when needed.
