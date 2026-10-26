# Peridot — Legacy Genealogy Workflow Retirement Audit (v1)
Date: 2026-10-26  
Classification: Dependency inventory only; no code deletion

## Source scope and limitations

Reviewed the uploaded `src(20261026-015947).zip` snapshot and the subsequent `Peridot_Places_Editorial_Redesign_20261026_v1.zip` replacement files. Current committed baseline reported by user is `89aaa50`, with uncommitted Places changes after it. This audit is source-backed but does not certify parity with the user's actual local working tree. Recheck the exact local files and references before retirement.

## Candidate files exclusive or principally dedicated to legacy genealogy

- `src/PeridotGenealogyMappingControls.jsx`: renders dedicated genealogy Identity, Parents, Partners, Life Events, Places, Attributes, and review pages. High-priority retirement candidate **once routing is removed**.
- `src/peridotGenealogyMapping.js`: builds and validates specialized single-table and workbook genealogy mappings and supplemental-row actions. **Cannot delete yet**: imported by the mapping modal and generalized mapping initializers.
- `src/peridotGenealogyRuntimeModel.js`: specialized genealogy import normalization. **Cannot delete yet**: imported by `App.jsx` during genealogy import confirmation.
- `src/peridotGenealogyProfile.js`: legacy genealogy profile configuration. **Cannot delete yet**: imported into `peridotDatasetProfiles.js`.
- `src/peridotGenealogyMappingFixtures.js`, `src/peridotGenealogyMappingUiFixtures.js`, `src/peridotGenealogyProfileFixtures.js`, `src/peridotGenealogyRuntimeFixtures.js`: review test dependencies and convert useful behavioral coverage into generalized regressions before removal.

## Live dependencies identified

- `PeridotColumnMappingModal.jsx` imports legacy genealogy mapping controls and helpers, recognizes `isGenealogyProfile`, maintains specialized state, validates supplemental rows, and renders `genealogy-*` steps. Dedicated branches appear around the profile selection and step rendering regions.
- `peridotColumnMapping.js` uses `buildInitialPeridotGenealogyMappingState` when `datasetProfileId === 'peridot.genealogy-person-centered'`.
- `peridotWorkbookMapping.js` similarly selects `buildInitialPeridotGenealogyWorkbookMappingState` for that profile.
- `peridotDatasetProfiles.js` imports genealogy profile metadata and exports `isPeridotGenealogyProfile`.
- `App.jsx` imports the specialized genealogy runtime builder and includes a `handleConfirmColumnMappingImport` genealogy-profile path, including validation and runtime activation.

These links show the legacy interface is not orphan code. Hiding it from normal navigation does **not** establish it is unreachable for stored staging state, sample mapping, or legacy data.

## Protected generalized capability

Keep generalized relationship mapping, identity/record mapping, temporal assertions, places and coordinates, subject-aware evidence, workbook joins, generalized runtime normalization, and the ability to model parent-child and partner networks. Do not remove compatibility adapters or genealogy-related generalized fixtures solely because their names contain genealogy.

## Safe retirement sequence

1. Confirm profile selection and staging entry points in exact current `App.jsx`; enumerate whether any user-visible or stored states can still select the specialized profile.
2. Verify a generalized family-tree CSV and workbook against the current import flow, including parent/child and multiple partner relationships.
3. Remove the specialized profile entry and entry routes in a dedicated behavior/structural pass, protecting existing datasets.
4. Remove dedicated genealogy step JSX and specialized import handling, then unused imports/initializers/runtime builders.
5. Delete now-unreferenced genealogy-exclusive modules and obsolete fixtures only after repository-wide import and dynamic reference checks.
6. Run build, generalized mapping fixtures, runtime identity/relationship regressions, and browser smoke tests; commit retirement separately from design changes.

## Shared mapping-interface ownership

- `PeridotColumnMappingModal.jsx`: shared page shell, `StepButton`, stage navigation, introductions and stage orchestration.
- `PeridotColumnMappingModal.css`: shared shell controls and many overlapping historical overrides; central location for a standardized visual foundation, but cascade specificity must be audited.
- `PeridotMappingFieldControls.jsx`: field-level layout for Relations, Time, Places, including workbook and single-table variants.
- `PeridotIdentityMappingControls.jsx`: identity panels reused by relationship/place configuration.
- `PeridotEvidenceFieldControls.jsx`: evidence-field editors and repeated controls.
- The upload footer actions and staged mapping state should remain unchanged while visual foundation styling is introduced.

## Design rollout strategy

A. Shared shell and navigation (compact pills/icons; clear optional-section explanation).  
B. Reusable visual primitives: question hierarchy, option-card styles, icon+context guidance cards; verify the same styles across Places and Relations first.  
C. Adapt lower Places controls and shared identity panels.  
D. Complete stage-specific composition and the major Evidence master-detail refactor later.

**Important wording nuance:** data-mapping categories may be unnecessary for a particular dataset, but Preview and Review/Upload have distinct functional roles. Do not promise the user that every stage can be skipped or that all staged mapping changes are autosaved beyond what the code actually guarantees.
