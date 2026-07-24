# Peridot Normalized Data Model Plan

**Document status:** Proposed planning contract for review; no source code changes included.  
**Prepared against:** `619bab0` — `Restore stable tutorial attention behavior`  
**Change type:** Documentation / structural architecture planning  
**Pass boundary:** Define the normalized internal data contract and the correspondence backward-compatibility boundary. Do not alter upload UI, application state, visualizations, Search, Inspector, Timeline, Analytics, or Export in this pass.  
**Primary source context:** Current Peridot core documentation, `PERIDOT_DATA_CAPABILITY_MODEL_PLAN.md`, the current import/mapping/normalization source files, `App.jsx`, bundled correspondence sample data, and `MM-Family-Tree.csv`.

---

## Executive summary

Peridot currently accepts several kinds of humanistic tables, but all confirmed imports are ultimately converted into a correspondence-shaped compatibility model before they enter `App.jsx`. The current normalized output consists principally of geography rows, letter/record rows, exact-name person metadata, and map-ready places. This architecture has successfully broadened Peridot beyond strict correspondence templates, but it cannot represent repeated relationships, multiple events, or entity-centered datasets without flattening their semantics.

The next architectural step should introduce one **canonical normalized research model** between upload mapping and the existing application pipeline. Uploaded tables and workbooks will be interpreted through explicit mapping profiles and normalized into collections of entities, records, events, relationships, places, evidence sources, and assertion provenance. Current correspondence behavior will be preserved through a **Correspondence compatibility adapter** that projects the canonical model back into the exact legacy row structures currently consumed by Peridot.

This plan does not authorize immediate family-network visualization work. It defines the data contract, invariants, compatibility rules, validation requirements, provenance model, and staged implementation sequence that must be accepted before source changes begin.

---

## 1. Problem statement

### 1.1 Current strength

Peridot’s mature internal model assumes that an analytically important row usually resembles:

```text
source entity/place
→ target entity/place
→ date
→ documentary evidence and metadata
```

That structure supports the current:

- route map;
- place and person/entity networks;
- Timeline;
- Advanced Search;
- Inspector;
- Analytics;
- Export.

The correspondence workflow must remain a first-class, stable profile.

### 1.2 Current limitation

The current mapping system has broader role vocabulary for temporal intervals, points/sites, route coordinates, evidence fields, and generic chart records. However, both single-table and workbook imports still assemble one Peridot-shaped row per primary uploaded row. The public template normalizer then produces:

```text
normalizedRows
normalizedLetters
normalizedPersonMetadata
places
acceptedRows
unsupportedRows
```

This means the current pipeline can preserve different *capabilities* but cannot yet preserve different *ontological structures*. A person row containing a birth, a death, two parents, a partner, prior partners, and several places is still forced toward one generic row rather than becoming:

- one person entity;
- two or more life events;
- several relationship assertions;
- several place references;
- several separately evidenced claims.

### 1.3 Architectural objective

Insert a canonical normalization boundary:

```text
parsed source data
→ user-confirmed mapping profile
→ canonical normalized research model
→ validation report
→ consumer-specific adapters
→ existing or future Peridot workspaces
```

No visualization, Search, Inspector, Timeline, Analytics, or Export consumer should eventually depend directly on uploaded column names.

---

## 2. Governing principles

### 2.1 Preserve the source before interpreting it

Every normalized item must retain a traceable reference to:

- source file;
- source sheet;
- source row;
- source column or mapped field;
- original entered value;
- mapping profile and profile version;
- whether the normalized item was directly imported, transformed, or derived.

Peridot may parse and organize values, but it must not silently overwrite the researcher’s source representation.

### 2.2 Mapping is explicit and user-confirmed

Suggestions may be offered, but structural interpretation must be confirmed by the user. This applies especially to:

- primary row type;
- stable identifier;
- entity type;
- relationship direction;
- relationship type;
- event type;
- date roles;
- place roles;
- cross-sheet joins;
- evidence/citation fields;
- derived relationship rules.

### 2.3 One source row may generate many normalized items

The unit of upload is not the unit of the normalized model.

For example:

```text
one person row
→ one Agent entity
→ one Birth event
→ one Death event
→ up to two Parent relationships
→ zero or more Partnership relationships
→ zero or more Place entities/references
```

### 2.4 No invented movement

Two place-linked events do not automatically establish travel or a route. A birthplace and death place may support two event points, but not a journey edge unless the data explicitly records or defensibly orders movement.

### 2.5 Relationships and events are first-class assertions

Repeated relationships and events must be stored as rows/objects with their own:

- identifier;
- type;
- participants;
- temporal extent;
- certainty;
- provenance;
- evidence;
- notes;
- import/derivation status.

They must not be reduced to untyped columns on an entity.

### 2.6 Capability availability is derived from normalized structures

A visualization or workspace becomes available because the canonical model contains the required structure—not because a particular source column happened to exist.

### 2.7 Correspondence parity is a release gate

The normalized architecture is not accepted until current correspondence datasets produce behavior equivalent to the existing pipeline.

---

## 3. Terminology

| Term | Definition |
|---|---|
| **Source data** | Uploaded CSV, TSV, XLSX, or XLS content as parsed without scholarly reinterpretation. |
| **Source row** | One row in one source sheet/table. |
| **Mapping profile** | A versioned, user-confirmed specification describing how source tables and columns become normalized structures. |
| **Canonical model** | The consumer-neutral normalized representation defined in this plan. |
| **Assertion** | A claim represented by an entity attribute, relationship, event, participation, or place assignment. |
| **Provenance** | Machine-readable information identifying where an assertion came from and how Peridot produced it. |
| **Evidence source** | Citation, archival reference, URL, bibliography item, note, or other source supporting an assertion. |
| **Compatibility adapter** | A pure transformation from the canonical model into a current legacy Peridot consumer shape. |
| **Derived assertion** | An assertion generated by an explicit rule rather than directly represented as one source row. |
| **Consumer** | Search, map, network, Inspector, Timeline, Analytics, Export, or a future visualization. |

---

## 4. Canonical dataset envelope

A normalized Peridot dataset should have one stable top-level shape:

```js
{
  schemaVersion,
  datasetId,
  datasetLabel,
  importedAt,
  sourceManifest,
  mappingProfile,

  entities,
  places,
  records,
  events,
  relationships,
  participations,
  evidenceSources,
  assertions,

  validation,
  capabilities
}
```

### 4.1 Required top-level fields

| Field | Purpose |
|---|---|
| `schemaVersion` | Version of the normalized model contract. |
| `datasetId` | Stable dataset identifier for the imported research dataset. |
| `datasetLabel` | User-facing file/workbook or research-project label. |
| `sourceManifest` | Uploaded files, sheets, row counts, headers, and parser warnings. |
| `mappingProfile` | Profile identity, version, row types, joins, mappings, and transformation rules. |
| `validation` | Structural errors, warnings, unresolved references, and counts. |
| `capabilities` | Dataset-level availability derived from normalized structures. |

### 4.2 Collection rule

Collections should be arrays of plain serializable objects. Cross-references should use IDs, not embedded recursive object graphs. Consumer helpers may build indexes for performance.

---

## 5. Universal normalized structures

## 5.1 Entity

An **Entity** is a persistent thing that can participate in records, relationships, and events.

```js
{
  id,
  entityType,
  subtype,
  label,
  alternateLabels,
  attributes,
  externalIdentifiers,
  image,
  provenance
}
```

### Supported initial entity types

- `agent`
  - person
  - family
  - institution
  - organization
  - office
- `object`
  - artwork
  - manuscript
  - artifact
  - commodity
  - publication
- `custom`

Places remain a dedicated collection because geography has specialized coordinate, hierarchy, and map requirements. Records and events also remain separate because their temporal and evidentiary behavior differs from persistent entities.

### Entity rules

- `id` is required and unique within the dataset.
- `label` may be blank only when an explicit unresolved/unnamed entity is intentionally preserved.
- Peridot does not merge entities by label.
- Exact duplicate labels may refer to separate entities if their IDs differ.
- External identifiers such as Wikidata are attributes, not replacements for Peridot IDs.
- Entity attributes must not be used to store repeated events or relationships.

---

## 5.2 Place

A **Place** is a persistent geographic or spatial entity.

```js
{
  id,
  label,
  alternateLabels,
  placeType,
  latitude,
  longitude,
  geometry,
  parentPlaceId,
  jurisdictionIds,
  attributes,
  provenance
}
```

### Place rules

- Coordinates are optional.
- A place may remain useful for Search, Inspector, networks, and charts without coordinates.
- Coordinates must not be used as the sole identity key.
- Identical labels with different IDs remain distinct unless the user explicitly reconciles them.
- Identical coordinates do not automatically establish identity.
- `Unknown`, `Illegible`, and comparable researcher-entered categories may remain explicit place-like values where that reflects the source data.
- Historical jurisdiction and court associations should be ordinary typed attributes or relationships, not silently inferred from modern geography.

---

## 5.3 Record

A **Record** represents documentary or observational evidence whose identity matters independently.

```js
{
  id,
  recordType,
  label,
  dateAssertionId,
  participantIds,
  placeReferenceIds,
  attributes,
  evidenceSourceIds,
  provenance
}
```

Examples:

- letter;
- archival document;
- inventory entry;
- catalogue row;
- legal case;
- census entry;
- observation;
- bibliographic item.

A correspondence letter remains a Record. Its sender, recipient, source place, target place, and date are modeled through participations and linked assertions rather than being the universal shape for all imported rows.

---

## 5.4 Event

An **Event** represents something occurring or obtaining in time.

```js
{
  id,
  eventType,
  label,
  temporalAssertion,
  participantIds,
  placeReferenceIds,
  attributes,
  evidenceSourceIds,
  provenance
}
```

Initial event examples:

- birth;
- death;
- marriage ceremony;
- appointment;
- residence;
- journey;
- arrival;
- departure;
- transaction;
- accession;
- imprisonment;
- diplomatic mission.

### Event rules

- Event type is required.
- Events may have zero, one, or multiple participants.
- An event may occur at zero, one, or multiple places.
- A birth or death generated from person-row columns is a transformed assertion, not a literal source row.
- Event ordering must respect date uncertainty and must not fabricate sequence where dates overlap or are unknown.

---

## 5.5 Relationship

A **Relationship** connects two or more entities and persists conceptually beyond a single documentary record.

```js
{
  id,
  relationshipType,
  direction,
  participantAId,
  participantBId,
  temporalAssertion,
  attributes,
  evidenceSourceIds,
  provenance,
  derivation
}
```

Initial examples:

- parent/child;
- spouse/partner;
- former spouse/partner;
- sibling;
- patron/client;
- employment;
- office holding;
- institutional membership;
- ownership;
- correspondence association.

### Relationship rules

- `relationshipType` is required.
- Direction must be explicit: `directed`, `undirected`, or a typed inverse pair.
- Parent/child should preserve role direction rather than become a generic family edge.
- Partnership may be symmetric while still retaining typed participant roles where needed.
- Multiple relationships between the same pair are allowed.
- A relationship may be open-ended, terminated, uncertain, or undated.
- Derived relationships such as siblings or in-laws must be marked as derived and must identify their derivation rule and source relationships.
- Derived relationships should not be generated in the first normalization implementation unless explicitly approved.

---

## 5.6 Participation

A **Participation** links an entity to a Record or Event with a typed role.

```js
{
  id,
  subjectId,
  targetType,
  targetId,
  role,
  temporalAssertion,
  attributes,
  provenance
}
```

Examples:

- person is sender of letter;
- person is recipient of letter;
- person is subject of birth event;
- person is appointee in appointment event;
- institution is issuer of document;
- object is transferred in transaction event.

Participation avoids forcing every multi-party occurrence into a binary relationship.

---

## 5.7 Evidence source

An **Evidence Source** is a reusable citation or source description.

```js
{
  id,
  sourceType,
  citation,
  archive,
  collection,
  shelfmark,
  pages,
  url,
  notes,
  attributes,
  provenance
}
```

Evidence sources may be shared by multiple assertions. A source description must remain separate from the assertion that it supports.

---

## 5.8 Assertion provenance

Every substantive normalized item must include provenance.

```js
{
  sourceFileId,
  sourceSheet,
  sourceRowNumber,
  sourceColumns,
  sourceValues,
  mappingProfileId,
  mappingProfileVersion,
  transformation,
  status,
  confidence,
  userConfirmed
}
```

### `status` values

- `imported-directly`
- `transformed`
- `derived`
- `manually-corrected`

### Provenance principle

Evidence answers **why the researcher accepts a claim**. Provenance answers **how Peridot obtained the normalized claim**. They are related but not interchangeable.

---

## 6. Temporal assertion contract

Dates in humanistic data require a reusable structure rather than one generic string.

```js
{
  display,
  start,
  end,
  precision,
  qualifier,
  certainty,
  calendar,
  sortBounds,
  originalValues
}
```

### 6.1 Supported concepts

- exact date;
- year-only;
- month-level;
- open start;
- open end;
- closed range;
- approximate;
- before;
- after;
- circa;
- uncertain;
- unknown;
- textual/unparseable but preserved.

### 6.2 Date rules

- Original date values must always be preserved.
- Parseable bounds may support sorting, filtering, and capability determination.
- A display string must not be treated as proof of exactness.
- Unknown month/day components must not be silently converted into January 1.
- Range overlap must be handled explicitly in future Timeline semantics.
- A relationship’s dates are not automatically identical to the date of a documentary source mentioning it.
- “Alive” is derivable from birth/death bounds only under a documented rule and should remain distinct from “politically active.”

---

## 7. Stable identifier contract

## 7.1 Source-provided IDs

Where a user supplies a stable ID:

- preserve it exactly as a source identifier;
- store it in `externalIdentifiers` or `sourceIdentifiers`;
- derive a namespaced canonical ID to avoid collisions across collections.

Example:

```text
agent:mm-family-tree:EFFYS
```

## 7.2 Generated IDs

When no source ID exists, Peridot may generate deterministic IDs from:

- dataset ID;
- source sheet;
- source row;
- normalized item type;
- transformation role.

Generated IDs must not depend only on display labels.

Example:

```text
event:mm-family-tree:Family-Tree:row-2:birth
```

## 7.3 Referential validation

Peridot must test:

- blank required IDs;
- duplicate IDs;
- references to nonexistent IDs;
- references to ambiguous duplicate IDs;
- self-references;
- incompatible referenced entity types;
- accidental spreadsheet numeric coercion;
- delimiter-packed multi-ID fields;
- orphaned joined rows.

No unresolved reference should be silently dropped.

---

## 8. Mapping profile contract

A mapping profile should be a separately serializable, versioned object.

```js
{
  id,
  version,
  label,
  sourceFingerprint,
  primaryTable,
  primaryRowType,
  entitySubtype,
  stableIdMapping,
  joins,
  fieldMappings,
  eventRules,
  relationshipRules,
  evidenceMappings,
  attributeMappings,
  ignoredMappings,
  compatibilityProfile,
  createdAt,
  updatedAt
}
```

### 8.1 Primary row types

Initial user-facing choices:

- document or record;
- person or organization;
- place or site;
- event or movement;
- object or material item;
- custom.

### 8.2 Profile behavior

A profile must support:

- first import;
- saving independently of imported data;
- reapplying to a revised source file;
- reporting added, removed, or renamed columns;
- warning about changed joins or IDs;
- remapping only affected fields;
- previewing normalized counts before commitment;
- restoring the prior accepted model after a failed structural remap.

### 8.3 Structural versus safe mapping changes

**Safe reinterpretations** may update consumer display without rebuilding identity:

- display labels;
- evidence-field visibility;
- chart/filter eligibility;
- attribute labels;
- default display formatting.

**Structural remapping** requires full preview and reversible rebuild:

- primary row type;
- stable ID;
- join keys;
- entity subtype;
- event generation;
- relationship generation;
- source/target participant interpretation;
- place identity/reference mapping.

---

## 9. Correspondence profile and backward-compatibility boundary

## 9.1 Correspondence remains a preconfigured profile

The existing public Peridot CSV template and current arbitrary-table mapping workflow should remain available as a **Correspondence / Directed Record** profile.

The profile maps one uploaded row into:

- one Record;
- zero to two Agent entities;
- zero to two Place entities/references;
- typed Record participations;
- one temporal assertion;
- optional evidence source(s);
- metadata attributes.

### 9.2 Correspondence normalization example

```text
Source_Name
→ Agent entity
→ Participation(role: sender/source)

Target_Name
→ Agent entity
→ Participation(role: recipient/target)

Source_Location + coordinates
→ Place
→ Record place reference(role: source/origin)

Target_Location + coordinates
→ Place
→ Record place reference(role: target/destination)

Date / Date_Start / Date_End
→ Record temporal assertion

Archive / Collection / Page(s) / Link(s)
→ Evidence source

Relationship / Topic / Language / Transcription / Notes / custom fields
→ Record attributes or evidence text according to mapping
```

### 9.3 What must not change during the first implementation

The following current outputs must remain available through an adapter:

```js
{
  normalizedRows,
  normalizedLetters,
  normalizedPersonMetadata,
  places,
  acceptedRows,
  unsupportedRows,
  allRows
}
```

The adapter must reproduce current field names, ID conventions where consumer behavior depends on them, date parsing behavior, point-record flags, custom Inspector fields, original uploaded rows, capability flags, and place entries closely enough that downstream behavior is unchanged.

### 9.4 Compatibility adapter

Proposed boundary:

```text
canonical normalized dataset
→ buildLegacyCorrespondenceCompatibilityModel()
→ current App.jsx peridotNormalizedData shape
```

The initial implementation should not simultaneously rewrite every consumer. It should create the canonical model and prove that the adapter can supply the legacy contract.

### 9.5 Parity tests

Using the current public template and bundled correspondence sample data, compare old and new pipelines for:

- accepted and unsupported row counts;
- geography-row count;
- letter-record count;
- exact-name person metadata count;
- place count and labels;
- source/target names;
- source/target places and coordinates;
- date labels and sortable dates;
- point/route flags;
- Search record coverage and counts;
- Browse and Refine indexes;
- network node and edge counts;
- map point/route counts;
- Inspector connected-record content;
- Timeline year range and filtering;
- Analytics available fields and row counts;
- export row counts and labels.

Any intentional discrepancy must be separately reviewed rather than treated as an incidental normalization improvement.

---

## 10. Person/Genealogy profile for `MM-Family-Tree.csv`

The attached table has 150 rows and 42 columns. Its primary unit is a person. It includes stable IDs for most rows, names and descriptive attributes, parent references, current and former partner references, birth/death dates and ranges, partnership dates, places and coordinates, Wikidata references, and notes.

## 10.1 Person entity transformation

Each accepted row should generate one Agent entity:

```text
ID
→ source identifier and canonical agent ID

Full name
→ primary label

Given names now / Surname now / Surname at birth
→ typed name attributes

Gender / Profession / Company / Interests / Activities
→ attributes

WikiData
→ external identifier

image
→ image reference

Bio notes
→ note/evidence attribute
```

### Validation

- blank IDs must be reported;
- duplicate IDs must block structural commitment;
- person labels may be blank only with an explicit unresolved-person policy;
- Wikidata identifiers must be preserved without live reconciliation during normalization.

## 10.2 Birth event transformation

For each row with birth information:

```text
Birth date type
Birth year
Birth month
Birth day
Birth range end
→ temporal assertion

place of birth
coordinate location birth
→ Place and event-place reference

person ID
→ Participation(role: subject)
```

Generated event type: `birth`.

A place name without coordinates remains valid. Coordinates without a place label require a generated display label that is visibly marked as generated, not silently treated as the source name.

## 10.3 Death event transformation

Equivalent transformation for:

- Death date type;
- Death year/month/day;
- Death range end;
- place of death;
- death coordinates.

Generated event type: `death`.

Birth and death events do not create a movement route.

## 10.4 Parent-child relationships

```text
Mother ID
→ directed parent relationship
participant A = mother
participant B = child
typed role = mother/parent

Father ID
→ directed parent relationship
participant A = father
participant B = child
typed role = father/parent
```

`Mother name` and `Father name` should be retained as source display evidence and used to diagnose ID/name mismatch, but IDs govern linkage.

`Parents type` may qualify the relationship, for example biological, adoptive, uncertain, or another researcher-defined category. Peridot must preserve the entered vocabulary unless the user explicitly maps it to a controlled relationship subtype.

## 10.5 Partnership relationships

```text
Partner ID
Partner name
Partner title
Partnership type
Partnership date type
Partnership year/month/day
Partnership range end
→ one typed partnership relationship
```

The profile must define whether the primary partner field represents:

- one current/preferred relationship;
- one relationship per person row;
- a symmetric duplicate recorded on both partner rows.

Normalization must deduplicate only through an explicit rule. It must not assume reciprocal entries are redundant without checking IDs, type, and temporal information.

## 10.6 Former partner references

`Ex-partner IDs` must be treated as a repeatable reference field. Before implementation, its delimiter conventions must be audited across the full dataset.

Each parsed reference may generate a separate relationship with:

- relationship type based on mapped partnership vocabulary;
- status such as former/terminated;
- temporal assertion where available;
- provenance pointing to the source person row and `Ex-partner IDs` column.

Missing relationship-specific dates cannot be borrowed automatically from the current partnership fields.

## 10.7 Names alongside IDs

Name columns adjacent to relationship IDs are evidence/checking fields, not primary join keys.

Validation should report:

- ID points to no person;
- ID resolves but entered name differs from referenced entity label;
- name is present but ID is blank;
- multiple IDs appear in a field that the profile expects to be singular;
- self-parent or self-partner references.

## 10.8 Expected first genealogy normalization output

The review screen should report counts such as:

```text
150 source rows
136 rows with supplied person IDs
150 person entities attempted
[number] valid birth events
[number] valid death events
[number] parent-child relationships
[number] partnership relationships
[number] former-partner relationships
[number] unique place entities/references
[number] unresolved references
[number] duplicate or blank IDs
[number] source name/ID mismatches
[number] assertions with no evidence citation beyond source-row provenance
```

Exact counts should be generated by the implementation, not asserted in this planning document.

---

## 11. Validation model

Validation should distinguish four severities.

| Severity | Meaning | Import behavior |
|---|---|---|
| `blocking` | Canonical identity or structural integrity would be unreliable. | Do not commit rebuilt model. |
| `error` | Specific normalized items cannot be safely generated. | Skip affected item only with explicit report; retain source row. |
| `warning` | Data remains usable but capability or certainty is limited. | Import with visible warning. |
| `information` | Describes transformations, generated IDs, or unavailable capabilities. | Import normally. |

### 11.1 Required validation categories

- parser and header warnings;
- blank/duplicate IDs;
- unresolved foreign keys;
- ambiguous multi-value parsing;
- invalid/self references;
- ID/name mismatches;
- coordinate validity;
- coordinate/name inconsistency;
- temporal parse status;
- temporal range contradictions;
- duplicate generated assertions;
- orphan evidence;
- unsupported mapping rule;
- missing required event/relationship participant;
- consumer compatibility discrepancy.

### 11.2 No silent repair

Peridot must not silently:

- merge people or places;
- replace names with Wikidata labels;
- geocode places;
- infer dates;
- split multi-value fields without a declared delimiter rule;
- infer reciprocal relationships;
- infer siblings or in-laws;
- convert life-event points into journeys;
- discard unresolved references.

---

## 12. Capability derivation from the canonical model

Capabilities should be derived from collections and assertions.

| Capability | Minimum normalized requirement |
|---|---|
| Record ledger | At least one Record |
| Entity/person ledger | At least one Entity |
| Relationship ledger | At least one Relationship |
| Inspector | At least one inspectable normalized item with label, attributes, evidence, or provenance |
| Search | Indexed labels, attributes, source values, evidence, or notes |
| Point map | At least one geolocated Place linked to an Entity, Record, or Event |
| Route map | Explicit route/movement Record/Event or ordered source-target place assertion |
| Network | At least one Relationship or approved Record-participation projection |
| Timeline | At least one parseable temporal assertion |
| Family network | Agent entities plus kinship/partnership relationships |
| Lifeline | One Agent linked to at least two chronologically orderable place-events |
| Charts | Repeated categorical/numeric attributes or temporal counts |
| Export | At least one normalized item or retained source row |

Unavailable visualizations should report which normalized requirement is absent.

---

## 13. Consumer adapter strategy

## 13.1 Principle

The canonical model becomes the authoritative internal research representation. Adapters become the only approved place for consumer-specific flattening.

## 13.2 Initial adapters

1. `Correspondence legacy adapter`
   - reproduces current `peridotNormalizedData`.

2. `Search adapter`
   - builds index records from entities, records, events, relationships, places, evidence, and provenance.

3. `Inspector adapter`
   - produces dossier-ready views without requiring every item to impersonate a letter.

4. `Timeline adapter`
   - exposes temporal assertions and their owning item types.

5. `Analytics adapter`
   - exposes safe categorical, numeric, and temporal dimensions.

6. `Export adapter`
   - exports normalized collections and consumer-specific projections with clear scope labels.

Only the first adapter belongs in the initial implementation slice. The other contracts should be documented, then introduced incrementally.

---

## 14. Proposed source architecture

Names are provisional and should be confirmed during implementation planning.

```text
src/peridotNormalizedModel.js
  canonical constants, constructors, and schema guards

src/peridotNormalizationProvenance.js
  source references and assertion provenance helpers

src/peridotTemporalAssertions.js
  reusable date/range parsing and temporal semantics

src/peridotMappingProfiles.js
  profile schema and versioning helpers

src/peridotCorrespondenceProfile.js
  public-template and arbitrary directed-record normalization rules

src/peridotGenealogyProfile.js
  person-row event and relationship normalization rules

src/peridotNormalizedValidation.js
  cross-collection structural validation

src/peridotLegacyCompatibilityAdapter.js
  canonical model → current peridotNormalizedData
```

Existing parser files should remain responsible for parsing only. Existing mapping UI files should not absorb canonical-model construction logic.

---

## 15. Implementation sequence

### Pass 2A — Canonical model primitives

**Change type:** Structural  
**Goal:** Add pure constructors, schema constants, provenance helpers, temporal assertions, and validation types.  
**No App wiring.**

Acceptance test:

- fixture objects can be built and validated;
- no current import behavior changes;
- no dependencies change.

### Pass 2B — Correspondence normalization profile

**Goal:** Convert existing mapped Peridot rows into the canonical model.

Acceptance test:

- every accepted current row produces one Record;
- entities, places, participations, temporal assertions, evidence, and provenance are generated deterministically;
- source values remain recoverable.

### Pass 2C — Legacy compatibility adapter

**Goal:** Reproduce current `normalizePeridotTemplateRows()` output from the canonical model.

Acceptance test:

- fixture-level parity for counts and fields;
- no source code consumers changed yet.

### Pass 2D — Shadow-mode comparison

**Goal:** Run old and new normalization paths side by side during development without changing the active app state.

Acceptance test:

- discrepancies are reported in development diagnostics;
- user-visible behavior remains on the old path;
- correspondence parity report is reviewed.

### Pass 2E — Switch canonical source with adapter

**Goal:** Make the canonical model authoritative while feeding existing consumers through the compatibility adapter.

Acceptance test:

- complete correspondence regression matrix passes;
- rollback to the previous path remains straightforward.

### Pass 3A — Genealogy profile normalization

**Goal:** Normalize `MM-Family-Tree.csv` into people, events, relationships, places, evidence, and validation reports.

Acceptance test:

- generated counts and unresolved references are visible;
- no family visualization is added;
- no false movement routes are created.

### Pass 3B — Mapping UI generalization

Only after profile behavior is proven through fixtures:

- ask primary row type;
- assign stable ID;
- expose event and relationship generation;
- preview generated model;
- save/reapply profile.

### Later passes

- generic Search/Inspector adapters;
- person/entity ledger;
- relationship ledger;
- family network;
- life-event map and timeline;
- true movement views;
- complete visualization-requirement audit.

---

## 16. Correspondence regression matrix

Before switching the active path, test at minimum:

### Import

- public template CSV;
- arbitrary CSV;
- TSV;
- XLSX;
- XLS;
- single-sheet workbook;
- multi-sheet workbook with unique-ID joins;
- incomplete accepted records;
- ignored and included evidence fields.

### Data parity

- accepted/unsupported counts;
- record IDs and linkage;
- person/entity names;
- places and coordinates;
- date labels and sorting;
- capability counts;
- original uploaded rows;
- custom Inspector fields.

### Application consumers

- Home sample-data path;
- Data latest-upload summary;
- Advanced Search Apply/Clear;
- Browse, Results, Refine, Capabilities;
- Place Map;
- People Network;
- Force-Directed Network;
- Timeline range and playback;
- compact and full Inspector;
- linked records and Back history;
- all chart types using representative fields;
- map/network/chart exports.

### Explicit non-regression rule

Normalization work must not be combined with outstanding Search coverage, Timeline × Analytics, tutorial, Inspector-action, CSS, or visualization redesign work.

---

## 17. Open decisions requiring review before coding

1. **Record versus event for correspondence:**  
   Recommended: a letter is a Record with temporal and participant assertions. Sending/receipt may later be modeled as events only when analytically necessary.

2. **Place identity:**  
   Recommended: source-provided IDs when available; otherwise deterministic source-context IDs. Do not deduplicate by label or coordinate automatically.

3. **Relationship evidence granularity:**  
   Recommended: evidence/provenance attaches to each generated relationship, not merely to the person entity.

4. **Reciprocal partnership rows:**  
   Recommended: preserve separately during normalization, then report potential duplicates. Do not merge until an explicit reconciliation rule is approved.

5. **Multi-value delimiter rules:**  
   Recommended: mapping profile declares delimiter and escaping convention per field.

6. **Derived kinship:**  
   Recommended: defer sibling, in-law, grandparent, and degree-of-relation derivation until direct imported relationships are stable.

7. **Attribute assertions:**  
   Recommended first implementation: retain attributes with field-level provenance in the owning item. A later schema may promote disputed/repeated attributes into standalone assertion objects.

8. **Schema persistence:**  
   Recommended: canonical normalized data and mapping profiles must be serializable, but persistent browser storage is a later pass.

---

## 18. Non-goals of the first implementation

The normalized-model implementation should not initially:

- add a family-tree visualization;
- redesign the upload modal;
- refactor `App.jsx` broadly;
- modify Search semantics;
- generalize Timeline interval filtering;
- change Analytics;
- change exports;
- infer kinship beyond directly mapped relationships;
- geocode or reconcile places;
- query Wikidata;
- introduce a controlled vocabulary;
- add dependencies;
- migrate or remove the existing public correspondence template.

---

## 19. Pass-completion criteria for this planning document

This plan is ready to govern implementation when the following are accepted:

- the canonical collection types;
- the distinction between evidence and provenance;
- the temporal assertion structure;
- stable-ID and unresolved-reference rules;
- correspondence profile mapping;
- legacy compatibility adapter boundary;
- genealogy profile transformations;
- validation severity model;
- implementation sequence;
- correspondence parity gate;
- explicit non-goals.

After acceptance, the next pass should be a narrowly bounded **structural source-planning pass** that identifies exact files and fixture tests for `Pass 2A — Canonical model primitives`. It should not yet modify `App.jsx`.
