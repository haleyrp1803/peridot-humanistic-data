# Peridot — Research Project Persistence and User Profiles

**Planning and decision record · Version 1 · 2026-11-09**  
**Status:** Deferred architectural planning; **not authorized for implementation**  
**Intended location:** `planning_documents/PERIDOT_RESEARCH_PROJECT_PERSISTENCE_DESIGN_20261109_v1.md`  
**Next review:** After the active Timeline and Charts redesign work reaches an appropriate checkpoint  
**Scope:** Session-only operation, portable project files, optional browser-local persistence, and hosted user profiles; implications for research interpretation, security, maintenance, compatibility, and development workflow.

> **Reading this document later:** This is a record of the November 2026 design discussion, not an implemented specification. Distinguish agreed direction from possible future features. Re-read the then-current `core_documentation/PROJECT_WORKFLOW_CHARTER.md`, `MAINTAINERS_GUIDE.md`, `README.md`, `CHANGELOG.md`, and `planning_documents/PERIDOT_CORE_DOCUMENTATION_RESTRUCTURING_PLAN.md` before beginning a code pass. Confirm actual source and Git status; do not assume this document describes future code.

## 1. Executive summary

Peridot presently operates as a browser-based, statically hosted, account-free research visualizer. Researchers explicitly load their own source data or one of the supplied samples, map that data to Peridot's generalized canonical model, and explore it through Map, Network, Timeline, Charts, Search, and Inspector. Active research state survives navigation **within the running application**, but the application does not presently offer durable project restoration across browser sessions. This was an intentional privacy- and security-conscious architectural choice: Peridot does not operate a central service that stores researcher datasets or accounts.

Timeline relationship development prompted reconsideration. The existing Timeline relationship projection chooses representative events for related entities using a scoring heuristic. The researcher objected: which events are connected and why should be obvious, explicit, and researcher-controlled. Revisiting ClioVis highlighted the scholarly value of researcher-authored event connections, explanations, and references. But an authoring interface that loses those decisions when the session ends would not responsibly preserve intellectual labor.

We therefore considered ways of retaining research work without necessarily operating user accounts. **The favored direction for future investigation is a portable, researcher-owned project file** that saves research content and intentional configurations—not a byte-for-byte snapshot of transient interface state. Browser-local recovery may eventually supplement this using the same versioned representation, but it should remain optional and should not be mistaken for a reliable archive. Hosted user profiles and cloud projects are **not selected**; they would incur distinct security, privacy, infrastructure, maintenance, and stewardship obligations. No implementation of any persistence mechanism is authorized by this discussion.

## 2. Terminology and non-equivalences

- **Session state:** In-memory/application state retained during an active browsing session, including the loaded dataset and independent visualization navigation. This is not a durable saved project.
- **Research project:** Original source data, researcher-approved mapping semantics, intentional research annotations or event connections (if implemented), and chosen analytical/visualization configurations.
- **Project file:** A portable file explicitly saved and later reopened by a researcher. It is controlled and stored by the researcher, not in a Peridot-hosted database.
- **Browser persistence:** Local data stored by the website in browser storage (e.g., IndexedDB) for subsequent restoration on the same browser profile/device; may be cleared and is not equivalent to an archival file.
- **User profile:** Identity/authentication and profile preferences. An account alone does **not** provide durable project storage, sharing, revision history, or cross-device sync.
- **Hosted project storage:** Backend database/object storage plus authentication and authorization, operations, retention, backups, and support. Separate from merely having profiles.
- **Event-to-event assertion:** A connection between particular stable event identities, defined by source data or by a researcher, with declared relationship, direction, and grounding.
- **Entity or participation relationship:** Relations among people, places, records, and event participants. Such relations are not automatically event-to-event assertions.

## 3. Context: why this discussion happened

1. Peridot's active Timeline II offers calendar-faithful event/period positioning, independent chronology sessions, search/playback integration, and an existing arc-rendering layer. Its current representative-event selection can project entity relationships onto arbitrary favored life events (for example, lifespan/birth/death) using scoring. The researcher explicitly rejected that heuristic. This is **not** permission to edit the source now.
2. The three sample datasets reveal different evidence types: the correspondence workbook contains individually identifiable letters, but sharing correspondents does not make one letter a reply to another; the family tree contains explicit parent/partner relationships, not necessarily links among births; the cardinals workbook contains creation and conclave-attendance information, which may support participation/event modeling rather than arbitrary arcs.
3. The subsequent ClioVis comparison distinguished source-asserted connections from researcher-authored interpretive ones. Both may be legitimate if the representation makes authorship, grounding, and endpoints explicit. ClioVis's direct in-app authoring is valuable, but its persistence model should not be imported into Peridot uncritically.
4. Peridot intentionally has no user-profile-backed project persistence. A new interface for building connections would risk discarding substantial scholarly work unless a durable, user-controlled save mechanism exists.
5. This prompted the evaluation of session-only work, portable project files, local browser storage, and cloud profiles, including how each would affect future feature changes.

**Working principle:** Peridot should not invent event endpoints or silently upgrade entity co-occurrence to direct event relationships. Researcher-controlled, explicit connections must be recoverable if Peridot offers in-interface authoring. That principle can be honored without cloud accounts.

## 4. Options: benefits, liabilities, and practical workflows

### A. Continue the current session-only application

**Practical workflow:** User opens Peridot, loads a dataset and mapping, explores visualizations, and exports supported results. Closing/reloading the application does not guarantee restoration of working decisions. Original local datasets remain with the researcher.

**Benefits:** Smallest additional attack surface; no authentication, hosted user data, database, or account recovery; minimal ongoing operational cost; simple static hosting and open-source redistribution; suitable for transient investigation.

**Costs:** Mappings, filtered research scopes, intentional configurations, and any future in-app interpretations can be lost unless independently recorded. A screenshot/export is not necessarily a reconstructable research project. This is a poor sole model for time-intensive in-interface scholarly authoring.

**Security qualifications:** Account-free does not mean risk-free. Imported files, dependencies, injected scripts, map tiles, analytics (if any), and network requests still deserve scrutiny. Browser memory and browser-managed temporary artifacts should not be described as a formal destruction guarantee.

### B. Portable, researcher-owned project files — **preferred direction to investigate**

**Practical workflow:** User loads or edits research data and maps it; Peridot offers **Save Project**, producing a file (working extension idea: `.peridot`, not yet approved). The researcher chooses where to retain/back up it. Later, **Open Project** imports and validates the package, reconstructs the canonical dataset, and restores deliberate configurations. No sign-in or central researcher-data storage is necessary.

**Benefits:** Preserves scholarly labor; works across compatible devices through ordinary file transfer; independently archivable and researcher-controlled; aligns with static hosting, privacy goals, and open-source continuity; supports eventual in-app Timeline connection authoring without a perpetual hosted service.

**Costs:** Researcher must deliberately save, manage copies, and make backups. A saved file may contain sensitive unencrypted source data. Building a stable package, versioning, validation, migrations, restoration, and export/import testing is a substantial bounded architecture project. Browser downloads do not guarantee that a file has been placed safely or backed up.

**Important boundary:** Save the research **content and intentional choices** rather than every React component state. This was the researcher's expressly preferred approach and was judged sufficient. A project file is not a screen-state photograph.

### C. Optional browser-local persistence — possible later supplement

**Practical workflow:** Researcher explicitly opts in to local autosave/recovery. Peridot writes a versioned project snapshot to IndexedDB after meaningful validated changes. On returning with the same browser profile, they may choose **Resume Previous Workspace** or **Clear Saved Data**.

**Benefits:** Convenience, crash/refresh recovery, reduced need for manual reimport, possible reuse of the project-file serializer and migrator. No dedicated Peridot cloud storage is necessary.

**Costs:** Browser storage can be cleared, quota-limited, evicted in some circumstances, or unavailable in private browsing; it is device/profile-specific and not a reliable scholarly archive. It may expose research data to others sharing that browser profile or to malicious same-origin code. Migration failures may damage saved local work without a backup. Automatic saving has more privacy implications than a file a researcher deliberately downloads.

**Tentative guardrails:** Off by default; clear opt-in and discoverable deletion; clear “not a backup” messaging; retained previous snapshot and transactional upgrade; visible storage/failure status; encourage/export portable project files. None of these has yet been specified or approved as an implementation contract.

### D. Hosted user profiles and cloud project storage — not selected

**Practical workflow:** Researchers create/sign into accounts, save projects to hosted storage, and potentially sync across devices or collaborate. A profile could exist without cloud project storage, but then it would not solve preservation of research projects by itself.

**Benefits:** Seamless multi-device continuation, potential team and classroom work, project sharing, revision histories, and centralized account preferences.

**Costs and risks:** Authenticator and session management, account takeover, authorization/tenant-isolation failures, service abuse, incident response, retention/deletion policies, backup and disaster recovery, outages, database migrations, support requests, operating bills, and long-term scholarly stewardship. Research datasets could contain sensitive data about living persons or confidential/unpublished archival research. Managed authentication can reduce some development work but does not absolve the application of authorization, security configuration, or data stewardship.

**Architecture impact:** GitHub Pages serves static application assets; hosted accounts and cloud persistence would require external backend/identity/storage services or a change in hosting architecture. Long-term availability would depend on operational stewardship, not only on preserving open-source code.

### Comparative matrix (qualitative, Peridot-specific judgments)

| Model | Durable research continuity | Hosted data/security responsibility | Engineering burden | Long-run maintenance | Primary caution |
| --- | --- | --- | --- | --- | --- |
| Session only | Low | Low (not zero) | Existing baseline | Lowest incremental | Unsaved scholarly work lost |
| Portable project | High if saved and backed up | Low centralized burden | Medium–high upfront | Moderate (formats/migrations) | File privacy, compatibility, manual saving |
| Local browser recovery | Medium; not archival | Low centralized burden, local exposure | Medium additional if serializer exists | Moderate | Shared devices, eviction, failed migration |
| Hosted accounts + projects | High, service-dependent | High | Very high | High and continuous | Data breaches, ongoing service stewardship |

Do not interpret “relatively secure” as “inherently secure”: each approach has different threats, and the security properties depend on implementation and researchers' computing environments.

## 5. Tentative portable-project content contract

**Likely durable content (subject to source audit and schema design):**

- Original uploaded source file(s) or an equivalent lossless source representation, including relevant workbook sheets and names; any associated integrity/size metadata.
- Approved generalized mapping configuration: Relations, Identity, Time, Places, Evidence, cardinality, subject attribution, joins, and any future mapped event-connection rules.
- Explicit researcher-authored event connections and annotations **if those features are later implemented**: exact stable source/target event IDs, label/type, directionality, explanation, authorial/source grounding, and supporting references.
- Intentional category assignments, primary-category overrides, category priorities, and explicit visualization configurations where implemented and selected for preservation.
- Possibly saved research scopes such as applied filters and a deliberately chosen time window; decide which are meaningful project settings instead of saving every navigation movement.
- A manifest with project-format version, creation/export metadata where appropriate, and integrity/check information. **Application version and project format version must be separate.**

**Do not ordinarily save:** tooltip/hover, open menu/popover, active playback frame or playing state, animation progress, temporary pointer/drag data, rendered SVG coordinates, layout caches, derived geometries, transient loading/error overlays, or internal React object graphs.

**Prefer reconstructing:** canonical normalized data, rendering layout, spatial/timeline geometry, and caches from saved source + mapping. This is a proposal, not a proven ability: regression testing must confirm restored semantic equivalence, including relationships and event identities. Preserve source fidelity because Peridot permits reopening original mappings for edits.

**Do not presume yet:** exact `.peridot` extension, ZIP vs other container, compression method, editable text manifest schema, whether to embed all original source bytes, default filename, location of Save/Open controls, encryption, or project-file size limits. These are implementation-design decisions.

## 6. Interactions with Timeline connections and the other visualizations

### Timeline

- Remove the premise that Peridot may choose an endpoint using a representative-event scoring heuristic; **the specific endpoints and the reason for the connection must be intelligible and researcher-controlled**.
- Permit explicit relationships supplied in source tables through mapping (e.g., letter `Replies to` references stable IDs; a separate connections table declares `from`, `to`, `type`, explanation, direction). Crucially, a *record ID* may refer to multiple mapped time assertions; it is not inherently an unambiguous *event ID*.
- Allow for future researcher-authored interpretation, not just directly source-stated relationships, while preserving epistemic/provenance distinctions. In-app authoring was discussed as a possibility, **not approved for immediate implementation**.
- Keep entity relationships and event participation distinct from event-to-event assertions. Genealogical parentage or shared correspondents should not automatically generate a birth-to-birth or letter-to-letter arc. Cardinals' conclave participation could warrant event-participant relationships, not necessarily event-to-event arcs.
- Portable project save could eventually retain in-interface interpretations; an independent tabular connection export is desirable to prevent scholarly lock-in. Neither behavior exists just because a project serializer exists.

### Charts / Map / Network / Explore

- A future project schema must allow supported deliberate chart selections/configurations, mapped categories, filters, and relevant geographic/network settings without serializing implementation-specific rendering caches.
- Preserve the existing independent chronology windows during ordinary in-session navigation. Deciding whether a **saved project** retains each window requires an explicit distinction between a deliberate research range and incidental panning/zooming.
- The active Charts II redesign is concurrent and remains outside this planning document's implementation scope. Do not edit shared workspace files from a stale source copy or overwrite uncommitted Charts work.

## 7. Privacy, security, and operational risks to evaluate

1. **Threat model and privacy claims.** Document what Peridot sends over the network (including raster basemap/tile requests and external resources), what remains client-side, what is retained locally, and what may appear in logs. Avoid absolute claims that data “never leaves the device” without a measured audit.
2. **Untrusted file handling.** Project files and uploaded spreadsheets must be treated as untrusted. Constrain archive expansion and total/decompressed size, reject path traversal and unexpected entries, validate schema and identities, avoid evaluating saved code or untrusted HTML, and fail transparently rather than partially applying corrupt projects.
3. **Sensitive files on disk.** Portable project files may embed original datasets, annotations, and unpublished research. They are not encrypted merely because they have a custom extension. Researchers remain responsible for file permissions, local backups, and cloud-sync choices. Optional encryption would need a separate, thoroughly reviewed design and recovery policy.
4. **XSS and local data.** If browser persistence is added, same-origin injected scripts could threaten saved project data. Shared-device/browser-profile exposure also matters. IndexedDB is not an encryption or access-control boundary.
5. **Integrity and authenticity.** A checksum helps detect accidental corruption but is not equivalent to authenticated provenance or a digital signature. Design the appropriate claims before adopting either.
6. **Save/export failures.** Detect serialization/validation/download failures where possible; never imply that successful creation of a download means the researcher has safely backed up the file. Address oversized files, storage quotas, interruptions, and user cancellation.
7. **Restoration behavior.** Never silently merge an imported saved project into an existing active dataset; choose explicit replace/open behavior. Provide comprehensible diagnostics for incompatible or malformed files.
8. **Data retention and deletion.** Session-only, explicit-download, and opted-in browser-persistence models require different user-facing explanations; clearing browser state does not erase separately downloaded files.
9. **Long-term sustainability.** Static hosting is easier to keep available than an account/project service, but open-source code availability alone is not a preservation guarantee for proprietary saved formats. Provide documented, portable exports where possible.

## 8. Versioning, migrations, and future feature work

**Preferred design principle:** A stable, explicit, versioned research-project schema, **not** a serialized dump of React state. This isolates most changes to buttons, styles, rendering, caching, and UI organization from the saved-format contract.

| Later change | Expected compatibility impact | Requirement |
| --- | --- | --- |
| Cosmetic, layout, performance, or tooltip update | Usually none | Normal regression checks |
| New optional chart or Timeline setting | Usually low | Define deterministic missing-field default |
| Rename a UI control | Usually none | Do not casually rename underlying persisted meaning |
| New category-priority or grouped-lane configuration | Low–medium | Preserve older defaults/semantics explicitly |
| Modified mapping semantics or source joins | High | Test source+mapping reconstruction and migrate if needed |
| New event-ID strategy or connection representation | High | Preserve exact identity and authored assertions; no guessed targets |
| Retire saved feature | Potentially high | Explicit compatibility or clear unsupported-version handling |

**Migration approach under consideration:** On open, read the project-format version, validate original content, apply explicit ordered migrations to a temporary representation, validate the result, reconstruct the current canonical model, and report any inability to preserve meaning. Keep the original file untouched; saving should produce the current format, preferably as a new copy. Never infer missing historical evidence, provenance, or relation direction. If a previous connection's basis is unknown, retain it as unknown, not “source asserted.”

For optional IndexedDB persistence, use equivalent migration logic but retain a previous good snapshot and commit upgrades transactionally. A failed migration must not destroy a researcher’s only retained local copy.

**Compatibility policy not yet fixed:** Current-format-only support seems unsuitable for scholarly projects; perpetual unconditional support for every released format may be infeasible. The discussion favored documented migration paths and regression fixtures for supported released formats, without making an unlimited promise. The support window, unsupported-version behavior, and how to publish converters need later decisions.

**Developer workflow effect:** Before a bounded pass that changes persistable semantics, assess schema impact, version bump/migration needs, and regression fixtures. Maintain non-sensitive sample project fixtures across multiple format versions (Correspondence, Family Tree, Cardinals plus targeted ambiguous-ID/connection cases); test open → migrate → save → reopen, referential integrity, mapping fidelity, and preservation of authored claims. This augments rather than replaces the Project Workflow Charter's full-file source review, bounded-pass discipline, and acceptance tests.

## 9. Tentative implementation sequence — no authorization yet

1. **Complete/de-risk the active Timeline and Charts redesigns.** In particular, settle explicit durable event identity and the event-connection semantics without the scoring heuristic. Do not implement persistence against a model scheduled for replacement.
2. **Read-only architecture audit.** Inventory actual current state ownership, original-source retention, mapping re-edit path, canonical event identity stability, selected configurations, import/export infrastructure, and any privacy-sensitive network boundaries.
3. **Define the minimum durable project contract.** Decide exact saved concepts vs transient state; define schema/version and stable IDs; establish lossless source/mapping restoration; decide saved filters/windows deliberately.
4. **Prototype portable Save/Open against sample fixtures.** First use ordinary user-controlled download/upload; validate round trips, failure behavior, and security boundaries. Keep all changes in separately scoped, tested passes.
5. **Document compatibility/security promises.** Establish migrations, size/validation limits, recovery/error messaging, threat model, and export portability before wider availability.
6. **Only then evaluate optional local recovery.** Reuse the serializer where feasible; require explicit opt-in and tested backup/clear behavior. Do not equate IndexedDB with project-file preservation.
7. **Revisit hosted accounts only if a demonstrated requirement (e.g., cross-device collaboration) justifies ongoing identity, authorization, storage, and stewardship obligations.** Do not implicitly enable backend persistence.

## 10. Decisions, preferences, and open questions

### Clearly expressed researcher preferences / decisions

- Preserve Peridot's privacy-conscious, account-free, statically served character unless a future explicit decision changes it.
- Reject the Timeline's heuristic representative-event scoring as the basis for event connection endpoints; connections must be explicit, understandable, and researcher-controlled.
- Treat saving **research content and intentional configurations** as sufficient; a complete transient interface snapshot is unnecessary.
- Favor further examination of **portable project files** before hosted user profiles; return to this after Timeline and Charts redesign work rather than interrupting those workstreams.
- Recognize that no connection at all can be an appropriate, evidence-faithful outcome; do not add clustering/aggregation or arcs simply for visual density or appeal.

### Still exploratory / not approved

- Implementing Save Project or Open Project; file extension and archive structure.
- Optional browser autosave/recovery, exact opt-in UX, and data retention controls.
- In-Timeline authoring of researcher interpretations and evidence references.
- Whether every applied filter, timeframe, chart configuration, or category display preference belongs in saved research content.
- Per-project metadata and provenance conventions; whether to preserve an internal history of revisions.
- Encryption, signatures, cloud sync, accounts, collaborative projects, and any backend services.
- Specific compatibility guarantees, migration support horizon, and project-file limits.

### Questions for the future design session

1. What is the precise stable identity for each canonical event/temporal assertion, especially when one imported record produces multiple events?
2. How will imported direct event links, researcher-authored interpretive links, entity relationships, and event-participant relationships coexist without conflation?
3. What counts as an intentional saved configuration for Timeline, Map, Network, Charts II, and Explore?
4. Should a project embed source workbook bytes, or is there an equally lossless, verifiable representation compatible with mapping re-edits?
5. What minimum project-file documentation and independent tabular exports avoid research lock-in?
6. What are the acceptable project-size, browser-memory, import-performance, and malformed-package limits?
7. What is the tested privacy boundary for all active third-party resource requests?
8. How should unknown/old-format fields and unsupported project versions be handled without silent semantic reinterpretation?
9. What responsibility, if any, should Peridot take for autosave warnings, optional browser recovery, and accidental-loss expectations?

## 11. Relevant technical literature and guidance to revisit

These references informed the discussion as general engineering/security context; they are **not** evidence that a particular Peridot architecture has been implemented, certified, or legally reviewed. Review current editions and applicability before design or security claims.

- NIST SP 800-63B-4, *Digital Identity Guidelines: Authentication and Authenticator Management* (2025): <https://pages.nist.gov/800-63-4/sp800-63b.html>
- NIST SP 800-218, *Secure Software Development Framework*: <https://csrc.nist.gov/pubs/sp/800/218/final>
- OWASP, *Authentication Cheat Sheet*: <https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html>
- OWASP, *Session Management Cheat Sheet*: <https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html>
- OWASP, *Authorization Cheat Sheet*: <https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html>
- OWASP, *File Upload Cheat Sheet*: <https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html>
- OWASP, *HTML5 Security Cheat Sheet* (client-side storage cautions): <https://cheatsheetseries.owasp.org/cheatsheets/HTML5_Security_Cheat_Sheet.html>
- MDN, *IndexedDB API*: <https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API>
- MDN, *Storage quotas and eviction criteria*: <https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria>
- European Commission, *Principles of the GDPR*: <https://commission.europa.eu/law/law-topic/data-protection/information-business-and-organisations/principles-gdpr_en>
- GitHub Docs, *GitHub Pages*: <https://docs.github.com/en/pages>
- ClioVis, official project/tutorial materials: <https://cliovis.com/tutorials/>

## 12. Resume/handoff instructions

When this topic is reopened after Timeline/Charts work:

1. Reconfirm the live code, Git checkpoint, and current documentation rather than assuming this November 2026 plan remains current.
2. Revisit the adopted goals: privacy-conscious account-free use; researcher control; exact event connection semantics; preserve scholarly labor; portable archival ownership.
3. Audit canonical event identity and the future relationship mapping/authoring model first. Their stability is a prerequisite for preserving connections in project files.
4. Discuss the minimum saved-content contract and threat model **before** approving implementation.
5. Use one bounded pass at a time, avoiding interference with any concurrent uncommitted work. The user's 2026-11-09 synchronized head was reported as `4702f3b` (documentation sync) with `4fca872` as the underlying chronology implementation checkpoint; newer checkpoints may supersede both.

**Bottom line:** Portable project files appear to offer the best currently discussed path to durable researcher-controlled scholarly work while preserving Peridot's account-free and largely client-side architecture. They also entail real format-compatibility and untrusted-import responsibilities. Optional browser persistence may be useful later, but should be opt-in and non-archival. Hosted profiles should remain a distinct, much higher-obligation decision, not an assumed consequence of wanting to save Timeline connections.
