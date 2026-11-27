/* Evidence Workspace — source record dossier.
 * One complete mapped-record sheet plus an Investigate Further gateway.
 * Original field names, evidence values and mapped roles remain visible.
 * Switching sheets does not add research history; following a linked object does.
 */
import React, { useMemo, useState } from 'react';
import { buildPeridotRecordStructure } from './peridotRecordStructure.js';
import { getRowPrimaryTemporalDisplay } from './timelinePlaybackHelpers.js';
import { PeridotInvestigateFurther } from './PeridotInvestigateFurther.jsx';

const asText = (value) => String(value ?? '').trim();
const SHEETS = [
  { id: 'information', label: 'Record information' },
  { id: 'investigate', label: 'Investigate further' },
];

function EntityLink({ value, onClick, title }) {
  if (!onClick) return <span>{asText(value)}</span>;
  return <button type="button" className="peridot-record-dossier-entity-link"
    onClick={onClick} title={title || `Inspect ${asText(value)}`}>
    {asText(value)}<span aria-hidden="true">›</span>
  </button>;
}

function RecordFields({ title, entries, renderValue }) {
  if (!entries?.length) return null;
  return <section className="peridot-record-dossier-section">
    <h3>{title}</h3>
    <dl className="peridot-record-dossier-fields">
      {entries.map((entry, index) => <div key={`${title}:${index}:${asText(entry.label)}:${asText(entry.value)}`}>
        <dt>{asText(entry.label) || 'Mapped field'}</dt>
        <dd>
          {renderValue ? renderValue(entry) : <span>{asText(entry.value)}</span>}
          {entry.subject ? <small>About: {entry.subject}</small> : null}
          {entry.detail ? <small>{entry.detail}</small> : null}
          {entry.notes?.map((note, noteIndex) => <small key={noteIndex}>{note.label}: {note.value}</small>)}
        </dd>
      </div>)}
    </dl>
  </section>;
}

export function PeridotRecordDossier({
  row, recordId, onBack, onOpenPersonDetail, onOpenPlaceDetail,
}) {
  const [sheet, setSheet] = useState('information');
  const structure = useMemo(() => buildPeridotRecordStructure(row || {}), [row]);
  const identifier = asText(recordId) || 'Source record';
  const date = getRowPrimaryTemporalDisplay(row) || structure.temporal?.[0]?.value || '';

  const linkPerson = (value, entityId) => onOpenPersonDetail
    ? () => onOpenPersonDetail(value, entityId || '') : undefined;
  const linkPlace = (value) => onOpenPlaceDetail ? () => onOpenPlaceDetail(value) : undefined;
  const hasMappedData = Boolean(
    structure.temporal?.length || structure.participants?.length ||
    structure.places?.length || structure.relationships?.length || structure.evidence?.length
  );

  return <div className="peridot-evidence-inspector-layout has-sheet-index peridot-record-dossier">
    <nav className="peridot-evidence-sheet-index" aria-label="Record dossier sheets">
      <div className="peridot-evidence-sheet-index-heading">Record dossier</div>
      {SHEETS.map((item) => <button key={item.id} type="button"
        className={`peridot-evidence-sheet-link ${sheet === item.id ? 'is-active' : ''}`}
        aria-current={sheet === item.id ? 'page' : undefined}
        onClick={() => setSheet(item.id)}>{item.label}</button>)}
    </nav>
    <main className="peridot-evidence-dossier-reading peridot-record-dossier-reading">
      <header className="peridot-record-dossier-title">
        <div><h2>{identifier}</h2>{date && <p className="peridot-record-dossier-eyebrow">{date}</p>}</div>
      </header>
      {sheet === 'information' ? <div className="peridot-record-dossier-sheet">
        {!hasMappedData && <p className="peridot-record-dossier-muted">No mapped information is available for this record in the current Inspector scope.</p>}
        <RecordFields title="Dates and periods" entries={structure.temporal}/>
        <RecordFields title="People and entities" entries={structure.participants}
          renderValue={(entry) => <EntityLink value={entry.value} onClick={linkPerson(entry.value, entry.entityId)}/>}/>
        <RecordFields title="Places" entries={structure.places}
          renderValue={(entry) => <EntityLink value={entry.value} onClick={linkPlace(entry.value)}/>}/>
        <RecordFields title="Relationships" entries={structure.relationships}
          renderValue={(entry) => <div className="peridot-record-dossier-relationship">
            <span>{asText(entry.value)}</span>
            {(entry.relationshipLabel || entry.relationshipType || entry.direction) && <small>
              {entry.relationshipLabel || entry.relationshipType ? `Type: ${entry.relationshipLabel || entry.relationshipType}` : ''}
              {entry.direction ? `${entry.relationshipLabel || entry.relationshipType ? ' · ' : ''}Direction: ${entry.direction}` : ''}
            </small>}
            {(entry.source || entry.target) && <div className="peridot-record-dossier-participants">
              {entry.source && <span><small>First mapped participant</small><EntityLink value={entry.source} onClick={linkPerson(entry.source, entry.sourceId)}/></span>}
              {entry.target && <span><small>Second mapped participant</small><EntityLink value={entry.target} onClick={linkPerson(entry.target, entry.targetId)}/></span>}
            </div>}
          </div>}/>
        <RecordFields title="Other evidence and fields" entries={structure.evidence}/>
      </div> : <div className="peridot-record-dossier-sheet">
        <PeridotInvestigateFurther subjectLabel={identifier} subjectType="record" />
      </div>}
    </main>
  </div>;
}
