/* Compact Inspector evidence excerpts, from the existing generalized record reader.
 * These entries describe contributing RECORDS; they are not inherited attributes
 * of every connected person or place. Full dossiers retain the complete reader.
 */
import React, { createContext, useContext, useState } from 'react';
import { buildPeridotRecordStructure } from './peridotRecordStructure.js';
import { groupCompactMappedEntries } from './peridotInspectorCompactGrouping.js';

const text = (value) => String(value ?? '').trim();
const CompactEvidenceQueryContext = createContext('');
export function CompactEvidenceSearchScope({ query = '', children }) {
  return <CompactEvidenceQueryContext.Provider value={text(query).toLocaleLowerCase()}>{children}</CompactEvidenceQueryContext.Provider>;
}
function matchesQuery(value, query) { return !query || text(value).toLocaleLowerCase().includes(query); }
function recordMatchesQuery(row, query) {
  if (!query) return true;
  const structure = buildPeridotRecordStructure(row);
  return [text(row.id || row.recordId || row.sourceRowId), ...[
    ...structure.temporal, ...structure.participants, ...structure.places,
    ...structure.relationships, ...structure.evidence,
  ].flatMap((entry) => [entry.label, entry.value, entry.subject, entry.detail])]
    .some((value) => matchesQuery(value, query));
}

/** Numeric measures display the value BEFORE the wrapped label, without
 * changing the unit or inventing measures from unrelated records. */
export function CompactMetricStrip({ entries = [] }) {
  const available = entries.filter((entry) => entry && entry.value !== null && entry.value !== undefined && entry.value !== '');
  if (!available.length) return null;
  return <div className="peridot-inspector-compact-metric-strip">
    {available.map((entry, index) => <div className="peridot-inspector-compact-metric" key={`${entry.label}:${index}`}>
      <strong>{entry.value}</strong><span title={entry.label}>{entry.shortLabel || entry.label}</span>
    </div>)}
  </div>;
}

const EVIDENCE_PREVIEW_LENGTH = 240;
const preview = (value, limit = EVIDENCE_PREVIEW_LENGTH) => {
  const content = text(value);
  return content.length > limit ? `${content.slice(0, limit).trimEnd()}…` : content;
};

/* An individual mapped value can be read in full without expanding the whole
 * Inspector or navigating to the dossier. Only genuinely truncated values get
 * a control; no source text is altered, and separate fields expand independently.
 */
function CompactFactValue({ value }) {
  const [expanded, setExpanded] = useState(false);
  const content = text(value);
  const hasMore = content.length > EVIDENCE_PREVIEW_LENGTH;
  return (
    <div className="peridot-inspector-compact-fact-reading">
      <span className={`peridot-inspector-compact-fact-value${expanded ? ' peridot-inspector-compact-fact-value--expanded' : ''}`}>
        {expanded ? content : preview(content)}
      </span>
      {hasMore ? (
        <button
          className="peridot-inspector-compact-fact-expand"
          type="button"
          aria-expanded={expanded}
          onClick={() => setExpanded((wasExpanded) => !wasExpanded)}
        >
          {expanded ? 'Show less' : 'Read full text'}
        </button>
      ) : null}
    </div>
  );
}

/* Short factual values share a row at sufficient panel widths. Longer source
 * values and relationship descriptions span the line rather than being cut
 * off to fit an arbitrary column count. This is presentation only: the
 * source's labels, subjects and values remain authoritative. */
const isLongField = (entry) => {
  const label = text(entry?.label);
  const value = text(entry?.value);
  return value.length > 44 || label.length > 30 || /relationship|transcription|translation|notes?|description|archival collection|source text|original text|citation/i.test(label);
};

export function CompactFactGrid({ entries = [], limit = Infinity, variant = '' }) {
  const query = useContext(CompactEvidenceQueryContext);
  const available = entries.filter((entry) => text(entry?.value) && (
    !query || [entry?.label, entry?.value, entry?.subject].some((value) => matchesQuery(value, query))
  )).slice(0, limit);
  if (!available.length) return null;
  return (
    <div className={`peridot-inspector-fact-grid ${variant ? `peridot-inspector-fact-grid--${variant}` : ''}`}>
      {available.map((entry, index) => (
        <div
          className={`peridot-inspector-compact-fact ${isLongField(entry) ? 'peridot-inspector-compact-fact--wide' : ''}`}
          key={`${entry.label}:${entry.value}:${index}`}
        >
          <span className="peridot-inspector-compact-fact-label">{entry.label || 'Mapped field'}{entry.subject ? ` · ${entry.subject}` : ''}</span>
          <CompactFactValue value={entry.value}/>
        </div>
      ))}
    </div>
  );
}

/** Repeated role labels are shown once above their values. A distinct mapped
 * subject retains its own group; this is not record or historical deduplication.
 * Optional limit caps initial visible VALUES, with local disclosure for the rest.
 */
export function CompactGroupedValues({ entries = [], initialLimit = 20, moreLabel = 'Show more values' }) {
  const query = useContext(CompactEvidenceQueryContext);
  const available = entries.filter((entry) => text(entry?.value) && (
    !query || [entry?.label, entry?.value, entry?.subject].some((value) => matchesQuery(value, query))
  ));
  const groups = groupCompactMappedEntries(available);
  if (!groups.length) return null;
  let remaining = initialLimit;
  return <div className="peridot-inspector-grouped-values">
    {groups.map((group, index) => {
      const visibleCount = Math.max(0, Math.min(group.values.length, remaining));
      remaining -= visibleCount;
      const visible = group.values.slice(0, visibleCount);
      const hidden = group.values.slice(visibleCount);
      // Groups entirely beyond the initial budget still show their heading
      // inside a disclosure instead of appearing empty without explanation.
      const valuesMarkup = (values) => <div className="peridot-inspector-grouped-values-list">
        {values.map((item, itemIndex) => <div key={`${item.value}:${itemIndex}`} className="peridot-inspector-grouped-value"><CompactFactValue value={item.value}/></div>)}
      </div>;
      return <section className="peridot-inspector-grouped-value-section" key={`${group.label}:${group.subjectId || group.subject}:${index}`}>
        <div className="peridot-inspector-grouped-value-heading">{group.label}{group.subject ? <span> · {group.subject}</span> : null}</div>
        {valuesMarkup(visible)}
        {hidden.length ? <details className="peridot-inspector-grouped-value-more">
          <summary>{moreLabel} ({hidden.length})</summary>
          {valuesMarkup(hidden)}
        </details> : null}
      </section>;
    })}
  </div>;
}

export function CompactEvidenceRows({ entries = [], limit = 3 }) {
  return <CompactFactGrid entries={entries} limit={limit}/>;
}

export function CompactEvidenceReveal({ title = 'Show more mapped information', children }) {
  const [expanded, setExpanded] = useState(false);
  if (!children) return null;
  // Expanded evidence is controlled by click/keyboard toggles, never mouse exit.
  // Keeping it in React state also protects against unrelated parent re-renders.
  return (
    <details className="peridot-inspector-compact-reveal" open={expanded}
      onToggle={(event) => setExpanded(event.currentTarget.open)}>
      <summary>{title}</summary>
      <div className="peridot-inspector-compact-reveal-content">{children}</div>
    </details>
  );
}

/** In a compact contributing-record preview, the participant ledger already
 * identifies Source/Target (or other researcher-defined participant roles).
 * Avoid repeating those names in place labels when that same participant will
 * actually be visible in the preview. Keep subject qualifiers if multiple
 * different subjects share a place role, or if the participant is not shown.
 * The underlying canonical place assertion remains untouched.
 */
function simplifyVisiblePlaceLabels(entries, mapped, limit) {
  const visible = entries.slice(0, limit);
  const participants = mapped.participants || [];
  const places = mapped.places || [];
  const normalized = (value) => text(value).toLocaleLowerCase();
  const sameParticipant = (place, participant) => {
    const placeId = text(place.subjectId);
    const participantId = text(participant.entityId);
    if (placeId && participantId) return placeId === participantId;
    return Boolean(normalized(place.subject)) && normalized(place.subject) === normalized(participant.value);
  };

  return entries.map((entry, index) => {
    if (index >= limit || !places.includes(entry) || !text(entry.subject)) return entry;
    const subjectsForRole = new Set(places
      .filter((place) => normalized(place.label) === normalized(entry.label) && text(place.subject))
      .map((place) => text(place.subjectId) || normalized(place.subject)));
    if (subjectsForRole.size > 1) return entry;
    const subjectVisible = visible.some((item) => participants.includes(item) && sameParticipant(entry, item));
    return subjectVisible ? { ...entry, subject: '' } : entry;
  });
}

export function CompactRecordPreview({ rows = [], maxRecords = 2 }) {
  const query = useContext(CompactEvidenceQueryContext);
  const available = rows.filter(Boolean).filter((row) => recordMatchesQuery(row, query));
  if (!available.length) return query ? <p className="peridot-inspector-compact-muted">No contributing records match this selection search.</p> : null;
  return (
    <div className="peridot-inspector-compact-record-preview">
      <div className="peridot-inspector-compact-subheading">Contributing record{available.length === 1 ? '' : 's'}</div>
      <div className="peridot-inspector-compact-record-ledger">
        {available.slice(0, maxRecords).map((row, index) => {
          const mapped = buildPeridotRecordStructure(row);
          const name = text(row.id || row.recordId || row.sourceRowId) || `Record ${index + 1}`;
          const fieldLimit = query ? 8 : 5;
          const recordFields = [
            ...mapped.temporal,
            ...mapped.places,
            ...mapped.participants,
            ...mapped.relationships.filter((relationship) => !(
              mapped.participants.some((person) => person.value === relationship.source)
              && mapped.participants.some((person) => person.value === relationship.target)
            )),
            ...(query ? mapped.evidence : []),
          ];
          return (
            <div className="peridot-inspector-compact-record-item" key={`${name}:${index}`}>
              <div className="peridot-inspector-compact-record-id">{name}</div>
              <CompactEvidenceRows entries={simplifyVisiblePlaceLabels(recordFields, mapped, fieldLimit)} limit={fieldLimit}/>
            </div>
          );
        })}
      </div>
      {available.length > maxRecords ? <p className="peridot-inspector-compact-muted">Showing {maxRecords} of {available.length} available records. Open the full dossier for the complete record ledger.</p> : null}
    </div>
  );
}

export function CompactRecordMore({ rows = [], maxRecords = 2 }) {
  const query = useContext(CompactEvidenceQueryContext);
  const available = rows.filter(Boolean).filter((row) => recordMatchesQuery(row, query));
  if (!available.length) return null;
  return (
    <>
      {available.slice(0, maxRecords).map((row, index) => {
        const mapped = buildPeridotRecordStructure(row);
        return (
          <div key={`more:${text(row.id || row.recordId) || index}`} className="peridot-inspector-compact-record-item">
            <div className="peridot-inspector-compact-subheading">Additional mapped fields · record {index + 1}</div>
            <CompactEvidenceRows entries={[...mapped.evidence, ...mapped.temporal.flatMap((entry) => entry.notes || [])]} limit={8}/>
          </div>
        );
      })}
      {available.length > maxRecords ? <p className="peridot-inspector-compact-muted">Additional records and complete source text are available in the full dossier.</p> : null}
    </>
  );
}
