# Peridot Data Capability Model Plan

**Document status:** Draft planning document for review.  
**Prepared after:** `4f280a0` — `Use gold accent for workspace button hover states`.  
**Change type:** Documentation / product-design planning.  
**Purpose:** Define how Peridot can accommodate multiple kinds of humanistic datasets without forcing every dataset into the current correspondence/network model.

---

## 1. Executive summary

Peridot’s current data model is strongest when a row describes a directed correspondence event:

```text
source person/place → target person/place → date → evidence/metadata
```

That model supports the existing route maps, people/place networks, timeline, Inspector, Analytics, and Export workflows. It should remain a first-class supported workflow.

However, the comparison datasets reviewed for this planning pass show that Peridot needs a broader capability model. The immediate problem is not that Peridot lacks many named dataset templates. The immediate problem is that Peridot still assumes too strongly that useful records are relationship records that can become edges, routes, or networks.

Peridot should instead evaluate uploaded data through a capability model:

```text
uploaded table
→ detected fields
→ mapped field roles
→ row / dataset capabilities
→ available workspaces and visualizations
```

Under this model, a dataset can be useful even if it has no network edges. A dataset may be:

- chart-ready but not map-ready;
- point-map-ready but not network-ready;
- Inspector-ready but not timeline-ready;
- route-map-ready and network-ready, as correspondence data usually is;
- export-ready even when it supports no visualization beyond a data table or dossier view.

This document defines the first version of that capability model.

---

## 2. Grounding examples

Three concrete spreadsheet/data examples motivate this plan.

### 2.1 Epistolary correspondence data

The uploaded correspondence CSV is a directed relationship/event dataset. Its rows contain source and target people, source and target places, coordinates, dates or partial dates, archival metadata, relationship/topic/language fields, transcription, translation, and notes.

This dataset naturally supports:

- directed route mapping;
- people networks;
- place networks;
- force-directed person networks;
- correspondence timeline;
- linked-letter Inspector dossiers;
- categorical and temporal Analytics;
- source/target/person/place filters;
- SVG/PNG/CSV export.

This is Peridot’s current mature case.

### 2.2 Environmental damage sites in Alaska

The Alaska spreadsheet is a point/site dataset. Its rows describe named sites with a military department, cleanup reason, start date, end date, coordinate pair, and magnitude value.

This dataset does not need a network. Its natural Peridot capabilities are:

- point mapping;
- point size or symbol encoding by magnitude;
- color/grouping by department or cleanup reason;
- duration analysis using start date and end date;
- bar charts by department or reason;
- timeline or date-range filtering;
- Inspector pages for individual sites;
- export of mapped or filtered records.

This example exposes two current limitations:

1. Peridot needs date-range support, not only single dates.
2. Peridot needs to map single located records/entities that are not connected to another entity.

### 2.3 Daily high stock prices for five companies in 1714

The stock-price spreadsheet is a time-series measurement table. Its rows contain date, day of week, several company price columns, and source metadata.

This dataset does not need mapping or networks. Its natural Peridot capabilities are:

- line charts and multi-line charts;
- date filtering;
- comparison of several numeric series;
- missing-data handling;
- charts by company, date, or day of week;
- source-aware Inspector or record view;
- export.

This example exposes another current limitation: Peridot needs to support chart-first datasets, including wide tables where several numeric measures appear as sibling columns.

---

## 3. Product principle

Peridot should not ask every dataset to become a network.

Instead, Peridot should ask:

```text
What can this dataset do safely?
```

The answer should be expressed as capability flags. A record or dataset may support maps, networks, timelines, charts, Inspector views, and export in different combinations.

The application should preserve useful records even when they cannot support every workflow.

This extends the existing database-first ingestion principle already used by the Peridot CSV workflow: coordinates and parseable dates enable particular capabilities, but their absence should not automatically make a record worthless.

---

## 4. Core record shapes

Peridot should initially support four broad record shapes.

### 4.1 Directed relationship record

A record that connects one source entity to one target entity.

Examples:

- letter from sender to recipient;
- journey from origin to destination;
- citation from one text to another;
- institutional action from office/person to recipient/person;
- transfer from owner A to owner B.

Typical field roles:

```text
source entity
source place
source coordinates
target entity
target place
target coordinates
date or date range
relationship type
record evidence fields
```

Possible capabilities:

- route-map-ready, if source and target places/coordinates exist;
- network-ready, if source and target entities exist;
- timeline-ready, if date or date range exists;
- chart-ready, if categorical or numeric fields exist;
- Inspector-ready, if a label or evidence fields exist.

### 4.2 Point / site record

A record attached to one place or one coordinate pair, without requiring a source-target relationship.

Examples:

- environmental damage site;
- archaeological site;
- monastery, school, shop, parish, print shop, theatre, or archive;
- event at one location;
- person associated with one known residence or institutional location;
- object currently located at one repository.

Typical field roles:

```text
record label
point place
point latitude
point longitude
category
magnitude / measure
date start
date end
evidence fields
```

Possible capabilities:

- point-map-ready, if one place/coordinate role exists;
- timeline-ready, if date start or date end exists;
- chart-ready, if categorical or numeric fields exist;
- Inspector-ready, if a label or evidence fields exist;
- network-ready only if additional relationship fields are mapped.

### 4.3 Time-series measurement record

A record or table that tracks one or more measured values over time.

Examples:

- stock prices by day;
- book production counts by year;
- publication counts by city and decade;
- rainfall, harvest, population, or price series;
- institutional membership counts over time.

Typical field roles:

```text
date or period
measure field(s)
category / series name
source/citation field
notes
```

Possible capabilities:

- chart-ready, if date and numeric measures exist;
- timeline-ready, if dates or periods exist;
- Inspector-ready, if row-level evidence exists;
- map-ready only if location fields also exist;
- network-ready only if relationship fields also exist.

This shape requires Peridot to support wide measurement tables or provide a wide-to-long interpretation path.

### 4.4 Generic evidence record

A record that may not have coordinates, relationships, or numeric measurements, but still contains meaningful searchable evidence.

Examples:

- archival catalogue rows;
- bibliographic records;
- person-register entries;
- object catalogue records;
- textual excerpts;
- legal or institutional documents;
- prosopographical notes.

Typical field roles:

```text
record label
record type
people/entities
places, if any
date or period, if any
categories
evidence text
source/citation/link fields
notes
```

Possible capabilities:

- Inspector-ready;
- Search-ready;
- chart-ready if categorical/numeric/date fields exist;
- point-map-ready if point location fields exist;
- network-ready only if relationship fields are mapped.

---

## 5. Field roles

Peridot should distinguish uploaded column names from mapped field roles. Users may upload arbitrary column names, but the app should understand selected columns according to their assigned roles.

### 5.1 Identity and label roles

| Role | Meaning | Example columns |
|---|---|---|
| `record_label` | Human-readable title for a record | Name of Site, Title, Item Label |
| `record_type` | Type/category of record | Letter, Cleanup Site, Stock Price, Publication |
| `record_id` | Stable row or object identifier | ID, Accession No., Record Number |
| `source_citation` | Evidence source | Source, Archive, Collection |
| `link` | External URL or reference link | Link, URL, Digital Image |

### 5.2 Temporal roles

| Role | Meaning | Example columns |
|---|---|---|
| `date` | Single date or display date | Date, Letter Date |
| `date_start` | Start of interval | Date Start, Start Year |
| `date_end` | End of interval | End Date, End Year |
| `date_display` | Human-readable uncertain date | circa 1714, 0000/00/00, s.d. |
| `date_sort` | Machine-sortable date/year where available | 1714-01-05, 1714 |
| `date_precision` | Exactness of temporal value | exact, year, range, circa, unknown |

### 5.3 Point-location roles

| Role | Meaning | Example columns |
|---|---|---|
| `point_place` | One mapped place name | Site Location, City, Repository |
| `point_latitude` | Latitude for one point | Latitude, Lat |
| `point_longitude` | Longitude for one point | Longitude, Long |
| `point_coordinates` | Combined coordinate pair | Coordinates |

### 5.4 Directed relationship roles

| Role | Meaning | Example columns |
|---|---|---|
| `source_entity` | Source actor/entity | Source, Sender, Author |
| `source_place` | Source place | Source_Location, Origin |
| `source_latitude` | Source latitude | Source_Latitude |
| `source_longitude` | Source longitude | Source_Longitude |
| `target_entity` | Target actor/entity | Target, Recipient, Addressee |
| `target_place` | Target place | Target_Location, Destination |
| `target_latitude` | Target latitude | Target_Latitude |
| `target_longitude` | Target longitude | Target_Longitude |
| `relationship_type` | Semantic relationship | Sent to, Cites, Owns, Traveled to |

### 5.5 Entity roles

| Role | Meaning | Example columns |
|---|---|---|
| `person` | Person named in the record | Person, Author, Traveler |
| `institution` | Institution named in the record | Military Department, Publisher, Archive |
| `work` | Text/work named in the record | Book Title, Cited Work |
| `object` | Object named in the record | Artifact, Manuscript, Object ID |
| `group` | Collective entity | Order, Company, Department |

A later implementation may allow repeated entity roles or multi-value entity parsing. The first implementation should avoid complex entity extraction unless the user explicitly maps columns.

### 5.6 Analytical roles

| Role | Meaning | Example columns |
|---|---|---|
| `category` | Categorical grouping field | Department, Reason, Language, Topic |
| `measure` | Numeric quantity | Magnitude, Price, Count |
| `series` | Series/category for time charts | Company, Commodity, Department |
| `long_text` | Long evidence or note field | Transcription, Notes, Description |
| `boolean_flag` | Yes/no or true/false field | Cipher?, Published?, Extant? |

---

## 6. Capability flags

Peridot should report capabilities at both row level and dataset level.

### 6.1 Row-level capabilities

| Capability | Row has... | Enables... |
|---|---|---|
| `inspectorReady` | label, evidence, entity, or metadata | Record/detail view |
| `searchReady` | any textual, categorical, temporal, or numeric fields | Search and filtering |
| `pointMapReady` | point coordinates or mappable point place | Point map |
| `routeMapReady` | source and target locations, preferably coordinates | Route map |
| `networkReady` | source and target entities, or other relationship pair | Network graph |
| `timelineReady` | date, date_start, date_end, or sortable temporal value | Timeline / temporal filter |
| `chartReady` | categorical, numeric, temporal, or series fields | Analytics charts |
| `exportReady` | row is accepted into Peridot | CSV/export workflows |

### 6.2 Dataset-level capabilities

Dataset-level capabilities should be computed from row-level and field-level summaries.

Examples:

```text
Point map ready: 3 of 3 rows have coordinates.
Route map ready: 0 of 3 rows have source and target locations.
Chart ready: magnitude, department, reason, start date, and end date are available.
Timeline ready: 3 of 3 rows have a start date and end date.
```

or:

```text
Chart ready: 5 numeric company series detected across 365 dated rows.
Map ready: no location fields detected.
Network ready: no relationship fields mapped.
Inspector ready: source/citation field available for dated rows.
```

---

## 7. Temporal model requirements

Peridot currently needs a richer temporal model.

### 7.1 Required temporal cases

Peridot should distinguish:

- exact single date;
- year-only date;
- month/year date;
- unknown or missing date;
- display date that cannot be sorted safely;
- start date;
- end date;
- duration / interval;
- approximate or uncertain date;
- invalid date values that should be preserved as evidence.

### 7.2 Recommended internal representation

A normalized temporal object could look conceptually like:

```text
temporal = {
  display: original uploaded value,
  startSort: sortable start value if available,
  endSort: sortable end value if available,
  precision: exact | month | year | range | circa | unknown | invalid,
  hasRange: true/false,
  warnings: []
}
```

### 7.3 Date-range behavior

Rows with `date_start` and `date_end` should support:

- filtering by overlap with selected date range;
- duration calculation where both dates are sortable;
- timeline display as intervals rather than points;
- charts by start date, end date, duration, or active-in-period counts.

The first implementation should choose simple overlap semantics:

```text
A row is included in a date filter if its temporal range overlaps the selected filter range.
```

Single-date rows can be treated as ranges where start and end are the same sortable value.

---

## 8. Mapping implications

### 8.1 Current correspondence mapping should remain

The current Peridot correspondence template should remain supported. It is the mature workflow and should not be diluted or broken.

### 8.2 New mapping should be capability-oriented

The mapping interface should eventually let users choose field roles beyond the current correspondence core fields.

A future mapping flow could ask:

```text
What kind of structure does your table contain?

- Directed records: source → target
- Point/site records: one location per row
- Time-series measurements: dates plus values
- Generic records: searchable evidence and metadata
```

Then it should expose relevant field-role mapping controls.

### 8.3 Do not require early users to choose a perfect dataset type

Dataset profile selection should not be overly rigid. A dataset may support several capabilities at once.

Example:

A publication dataset might be:

- point-map-ready through publication place;
- chart-ready through year and genre;
- network-ready if author and printer are mapped as related entities;
- Inspector-ready through title, archive, notes, and link.

Therefore, Peridot should prefer field capabilities over hard-coded dataset categories.

---

## 9. Analytics implications

Analytics should become the earliest generalized beneficiary of the data capability model.

### 9.1 Required field detection

Peridot should detect or allow mapping of:

- categorical fields;
- numeric measure fields;
- date/time fields;
- date-range fields;
- series fields;
- boolean fields;
- long text fields that should usually be excluded from charts;
- ID/source/link fields that should usually be excluded from charts unless explicitly selected.

### 9.2 Chart implications

| Chart type | Needs |
|---|---|
| Bar chart | category and count or measure |
| Grouped bar chart | category + grouping field |
| Stacked bar chart | category + grouping field |
| Line chart | date/period + numeric measure/count |
| Multi-line chart | date/period + series + measure, or wide numeric columns |
| Histogram | numeric measure |
| Pie chart | category |
| Heatmap | two categorical/time axes + count/measure |
| Sunburst | hierarchical categorical fields |

### 9.3 Wide table support

The stock-price spreadsheet shows the need for wide numeric series support.

Peridot should eventually support either:

1. direct charting of multiple numeric columns as series; or
2. user-confirmed wide-to-long transformation:

```text
Date | East India Company | Bank of England | ...
```

becomes:

```text
Date | Company | Price
```

The first implementation can support wide numeric columns in Analytics without transforming the underlying source data globally.

---

## 10. Mapping implications

Peridot currently emphasizes route maps. It also needs point maps.

### 10.1 Point map mode

A point map should render records/entities that have one location.

Potential encodings:

- point color by category;
- point size by numeric measure;
- opacity by temporal filter;
- hover/compact Inspector by record label;
- click to open record/site dossier.

### 10.2 Route map mode

Route maps should remain for correspondence and other directed datasets.

### 10.3 Mixed point + route datasets

Some datasets may contain both point locations and directed relationships. Peridot should eventually support a mixed map, but this is not the first implementation target.

First target:

```text
If a dataset is point-map-ready but not route-map-ready, show a point map instead of treating the dataset as unmappable.
```

---

## 11. Inspector implications

The Inspector should support generic record dossiers in addition to person/place/route/cluster/letter dossiers.

### 11.1 Generic record dossier

A generic record dossier should include:

```text
record label
dataset/record type
date or date range
mapped entities
mapped places
categories
numeric measures
source/citation/link fields
long text / notes / transcription
all selected metadata fields
```

### 11.2 Site dossier

For point/site records, the dossier should show:

```text
site name
place/coordinates
category fields
magnitude/measure fields
start/end date or duration
source/citation
notes/evidence
related records, if any
```

### 11.3 Time-series row dossier

For time-series rows, the dossier should show:

```text
date
series values
source/citation
notes
missing values / unavailable values, if relevant
```

The first generic Inspector implementation should be simple and table-driven rather than visually elaborate.

---

## 12. Search & Filter implications

Search & Filter should eventually operate on generalized fields rather than only correspondence-specific people, places, routes, weight, and date.

### 12.1 General filters

Future safe filters:

- keyword search across selected text/evidence fields;
- date or date-range overlap;
- category filters;
- numeric range filters;
- mappability filters;
- chartability filters;
- record-type filters;
- mapped entity filters.

### 12.2 Keep correspondence filters

Existing correspondence filters should remain for correspondence datasets:

- person;
- place;
- route-place;
- route-people;
- minimum correspondence weight;
- date range.

The generalized model should add capabilities, not remove the existing mature correspondence interface.

---

## 13. Export implications

Export should label data scope and capability clearly.

Possible export scope labels:

```text
Loaded records
Filtered records
Point-map records
Route-map records
Network edges
Network nodes
Charted data
Selected record/entity
```

For datasets without networks, Export should not imply that nodes/edges are the only meaningful tabular outputs.

A later export pass may add:

- records CSV;
- mapped point records CSV;
- chart data CSV;
- selected record export.

---

## 14. Proposed implementation roadmap

### Phase 0 — Planning document

**Status:** This document.

**Goal:** Define the capability model before code changes.

**Acceptance test:** The team can explain how correspondence, point/site, time-series, and generic evidence datasets map to Peridot capabilities.

### Phase 1 — Data capability audit helper

**Type:** Structural / behavior, no UI redesign.

**Goal:** Add a helper that can inspect uploaded rows/columns and classify fields and capabilities without changing the current visible workflow.

Likely output:

```text
field summaries
row capability summaries
dataset capability summary
warnings
```

**Acceptance test:** The helper can classify the three grounding examples without changing current correspondence upload behavior.

### Phase 2 — Add date-range parsing and capability reporting

**Type:** Behavior.

**Goal:** Add date_start/date_end capability support at the helper/model layer.

**Acceptance test:** A row with Date Start and End Date is timeline-ready as an interval; a row with one Date remains timeline-ready as a single-point interval; invalid display dates are preserved.

### Phase 3 — Add point-map-ready capability

**Type:** Behavior.

**Goal:** Recognize rows with one coordinate pair or one point place as point-map-ready.

**Acceptance test:** The Alaska dataset reports point-map readiness without requiring source/target fields.

### Phase 4 — Generic record Inspector prototype

**Type:** Behavior / visual, bounded.

**Goal:** Add a simple generic record dossier that can display mapped fields for non-correspondence rows.

**Acceptance test:** A point/site row and a time-series row can be inspected even without source/target people.

### Phase 5 — Analytics generalization

**Type:** Behavior.

**Goal:** Allow charting from generalized numeric/categorical/date fields, including wide numeric series where feasible.

**Acceptance test:** The stock-price file can produce a multi-line chart from date plus company price columns.

### Phase 6 — Point map mode

**Type:** Behavior / visual.

**Goal:** Render point/site records on a map without requiring routes.

**Acceptance test:** The Alaska sites can render as points, with hover/click Inspector and optional category/measure encodings.

### Phase 7 — UI profile selection

**Type:** Behavior / visual.

**Goal:** Add user-facing mapping profile selection only after capability helpers and basic non-correspondence support exist.

Possible first profiles:

```text
Correspondence / directed records
Point or site records
Time-series measurements
Generic evidence records
```

**Acceptance test:** Users can choose a profile and see relevant field-role mapping controls.

---

## 15. Non-goals

This plan does not propose immediately rebuilding Peridot’s entire data architecture.

Out of scope for the first implementation sequence:

- replacing the current correspondence template;
- removing source/target correspondence support;
- forcing every dataset into a universal graph model;
- automatic named-entity extraction from long text;
- automatic geocoding;
- automatic cleaning or standardization of names, places, dates, or categories;
- complex ontology management;
- multi-table relational database authoring inside Peridot;
- full GIS functionality;
- statistical modeling;
- a polished new UI for all dataset types in the first pass.

Peridot should remain a practical research tool, not become an all-purpose data-cleaning or database-design environment.

---

## 16. Decision records

### Decision 1 — Capability model over dataset taxonomy

**Chosen:** Define capabilities from mapped fields and row structures.  
**Rejected:** Start with a large list of named humanities dataset types.  
**Reason:** The same dataset can support several workflows; field capabilities are more flexible than rigid categories.

### Decision 2 — Preserve correspondence as the mature first case

**Chosen:** Keep correspondence/directed-record support intact.  
**Rejected:** Replace the current model with a generic one immediately.  
**Reason:** The existing correspondence workflow is functional and valuable.

### Decision 3 — Add point mapping as a first-class capability

**Chosen:** Support one-location records independent of networks.  
**Rejected:** Require all mapped data to be source-target routes.  
**Reason:** Many humanistic datasets involve sites, events, institutions, objects, or records located at one place.

### Decision 4 — Add date ranges

**Chosen:** Support start/end temporal intervals alongside single dates.  
**Rejected:** Continue relying only on single-date parsing and year filters.  
**Reason:** Humanistic data often records durations, active periods, uncertain spans, and start/end events.

### Decision 5 — Add coordinate pairs

**Chosen:** Support pairs of lat/long coordinates in one column or two separate columns defining latitude or longitude individually.
**Rejected:** Continue relying only on separated coordinates.
**Reason:** Researchers commonly input coordinates in either of these two formats during data collection.

### Decision 6 — Make charts dataset-agnostic earlier than maps/networks

**Chosen:** Generalize Analytics around numeric, categorical, and temporal fields early.  
**Rejected:** Wait until every visualization mode is generalized.  
**Reason:** Charting is the most broadly useful capability across correspondence, point/site, time-series, and generic records.

---

## 17. Open questions for review

1. Should the first UI profile options be structural (`Directed`, `Point/Site`, `Time-Series`, `Generic`) or domain-facing (`Correspondence`, `Sites`, `Prices/Measurements`, `Catalogue`)?
2. Should date ranges be filtered by overlap, containment, or start-date-only behavior in the first implementation?
3. Should wide time-series tables be supported directly in Analytics, or should Peridot ask users to transform them into long format?
4. Should point maps represent rows, entities, or both?
5. Should generic record Inspector pages appear before point maps are implemented?
6. How much automatic field detection is desirable before user confirmation?
7. Should source/citation fields be treated as a first-class field role across all dataset profiles?
8. Should Peridot eventually include a simple data table workspace for records that are Search/Inspector/Chart-ready but not map/network-ready?

---

## 18. Recommended immediate next step after review

After this plan is reviewed and revised, the safest first implementation pass is not UI work. It is a small helper-layer pass:

```text
Add a data capability audit helper that can classify rows and fields from uploaded tables without changing current user-facing behavior.
```

That pass should use the three grounding datasets as test cases:

1. correspondence CSV;
2. Alaska environmental damage sites spreadsheet;
3. 1714 stock-price spreadsheet.

The acceptance test should be a generated capability summary for each dataset, not a redesigned interface.