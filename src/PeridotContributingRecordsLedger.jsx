/*
 * Evidence Workspace · Contributing Records sheet.
 * Read-only presentation of records already associated with the selected subject.
 * Search/sort/pagination are local; opening a record uses App-owned history.
 * Keep the distinction between contextual association and mark-specific proof.
 */
import React, { useMemo, useState } from 'react';
import { buildPeridotRecordStructure } from './peridotRecordStructure.js';
import { getRowPrimaryTemporalDisplay, getRowTemporalSortKey } from './timelinePlaybackHelpers.js';

const text = (value) => String(value ?? '').trim();
const comparable = (value) => text(value).toLocaleLowerCase();

function recordIdentifier(row, index) {
  const original = row?.originalTemplateRow || {};
  const uploaded = row?.originalUploadedRow || {};
  const firstSheetRow = Object.values(uploaded.sheetRows || {})[0] || {};
  return [row?.Letter_ID, row?.letterId, row?.letterID, row?.recordId, row?.id,
    original?.Letter_ID, original?.['Letter ID'], original?.ID, original?.id,
    uploaded?.primaryId, firstSheetRow?.Letter_ID, firstSheetRow?.ID, firstSheetRow?.id]
    .map(text).find(Boolean) || `Record ${index + 1}`;
}

function recordSummary(structure) {
  const participants = structure.participants || [];
  const relationships = structure.relationships || [];
  const places = structure.places || [];
  if (relationships.length) return relationships.slice(0, 2).map((item) => text(item.value)).filter(Boolean).join(' · ');
  if (participants.length) return participants.slice(0, 3).map((item) => text(item.value)).filter(Boolean).join(' · ');
  if (places.length) return places.slice(0, 2).map((item) => text(item.value)).filter(Boolean).join(' · ');
  return 'No mapped participant, relationship, or place summary available';
}

function recordRelevance(structure, selectedLabel, entityId, entityType) {
  const label = comparable(selectedLabel);
  const id = text(entityId);
  if (entityType === 'place') {
    const places = (structure.places || []).filter((item) => comparable(item.value) === label);
    if (places.length) return `Place mapped as ${[...new Set(places.map((item) => text(item.label)).filter(Boolean))].join(', ')}`;
    return 'Associated through this subject’s related records';
  }
  const participant = (structure.participants || []).find((item) => id && text(item.entityId) === id || !id && label && comparable(item.value) === label);
  if (participant) return `Mapped participant${participant.label ? ` · ${participant.label}` : ''}`;
  const relationship = (structure.relationships || []).find((item) => id && (text(item.sourceId) === id || text(item.targetId) === id)
    || !id && label && (comparable(item.source) === label || comparable(item.target) === label));
  if (relationship) return 'Named in a mapped relationship';
  return 'Associated through this subject’s related records';
}

const EVIDENCE_GROUPS = [
  ['temporal', 'Dates and periods'], ['participants', 'People and entities'], ['places', 'Places'],
  ['relationships', 'Mapped relationships'], ['evidence', 'Source evidence and other fields'],
];

function ExpandedRecord({ record }) {
  return <div className="peridot-record-ledger-expanded">
    <p>These are the mapped and source fields of this record. Their presence does not independently establish every connection involving the dossier subject.</p>
    <div className="peridot-record-ledger-evidence-grid">
      {EVIDENCE_GROUPS.map(([key, title]) => {
        const entries = record.structure[key] || [];
        if (!entries.length) return null;
        return <section key={key}>
          <h4>{title}</h4>
          <dl>{entries.map((item, index) => <div key={`${key}:${index}`}>
            <dt>{text(item.label) || title}</dt>
            <dd>{text(item.value) || 'Not recorded'}{text(item.subject) ? <span className="peridot-record-ledger-attribution">About: {text(item.subject)}</span> : null}</dd>
          </div>)}</dl>
        </section>;
      })}
    </div>
  </div>;
}

export function PeridotContributingRecordsLedger({ rows = [], subjectLabel, entityId, entityType, onOpenRecord }) {
  const [search, setSearch] = useState('');
  const [fieldFilters, setFieldFilters] = useState({ participants: '', places: '', relationships: '', evidence: '' });
  const [sort, setSort] = useState('date-asc');
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [expandedKeys, setExpandedKeys] = useState({});
  const records = useMemo(() => (Array.isArray(rows) ? rows : []).map((row, index) => {
    const structure = buildPeridotRecordStructure(row || {});
    const date = getRowPrimaryTemporalDisplay(row) || 'Date not specified';
    const timestamp = getRowTemporalSortKey(row);
    const id = recordIdentifier(row, index);
    const summary = recordSummary(structure);
    const relevance = recordRelevance(structure, subjectLabel, entityId, entityType);
    const evidence = structure.evidence.map((entry) => `${entry.label} ${entry.value}`).join(' ');
    const searchFields = Object.fromEntries(['participants', 'places', 'relationships', 'evidence'].map((key) => [key, structure[key].map((entry) => `${entry.label} ${entry.value}`).join(' ').toLocaleLowerCase()]));
    const searchable = [id, date, summary, relevance, evidence,
      ...EVIDENCE_GROUPS.flatMap(([key]) => structure[key].map((entry) => `${entry.label} ${entry.value}`))].join(' ').toLocaleLowerCase();
    return { row, index, key: `${index}:${id}`, id, date, timestamp, summary, relevance, searchable, searchFields, structure };
  }), [rows, subjectLabel, entityId, entityType]);
  const filtered = useMemo(() => {
    const needle = search.trim().toLocaleLowerCase();
    const activeFields = Object.entries(fieldFilters).filter(([, value]) => value.trim());
    const subset = records.filter((record) => (!needle || record.searchable.includes(needle))
      && activeFields.every(([key, value]) => record.searchFields[key].includes(value.trim().toLocaleLowerCase())));
    subset.sort((a, b) => {
      if (sort === 'record-asc') return a.id.localeCompare(b.id) || a.index - b.index;
      if (sort === 'record-desc') return b.id.localeCompare(a.id) || a.index - b.index;
      const av = Number.isFinite(a.timestamp) ? a.timestamp : Number.POSITIVE_INFINITY;
      const bv = Number.isFinite(b.timestamp) ? b.timestamp : Number.POSITIVE_INFINITY;
      return (sort === 'date-desc' ? bv - av : av - bv) || a.index - b.index;
    });
    return subset;
  }, [records, search, sort, fieldFilters]);
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const start = (currentPage - 1) * pageSize;
  const shown = filtered.slice(start, start + pageSize);
  const resetSearch = (value) => { setSearch(value); setPage(1); };
  const setFieldFilter = (key, value) => { setFieldFilters((current) => ({ ...current, [key]: value })); setPage(1); };
  const hasFilters = Object.values(fieldFilters).some((value) => value.trim());

  return <section className="peridot-record-ledger" aria-label="Contributing source records">
    <div className="peridot-record-ledger-intro">
      <span><strong>{records.length}</strong> associated source record{records.length === 1 ? '' : 's'}</span>
      <p>Records associated with <strong>{subjectLabel || 'this subject'}</strong> in the current Inspector scope. Association does not necessarily establish support for a particular displayed mark or relationship.</p>
    </div>
    <div className="peridot-record-ledger-controls">
      <label>Search within these records
        <input type="search" value={search} onChange={(event) => resetSearch(event.target.value)} placeholder="Record ID, person, place, mapped field, or text" />
      </label>
      <label>Sort by
        <select value={sort} onChange={(event) => { setSort(event.target.value); setPage(1); }}>
          <option value="date-asc">Date · earliest first</option>
          <option value="date-desc">Date · latest first</option>
          <option value="record-asc">Record ID · A–Z</option>
          <option value="record-desc">Record ID · Z–A</option>
        </select>
      </label>
      <label>Records per page
        <select value={pageSize} onChange={(event) => { setPageSize(Number(event.target.value)); setPage(1); }}>
          <option value={10}>10</option><option value={25}>25</option><option value={50}>50</option>
        </select>
      </label>
    </div>
    <details className="peridot-record-ledger-advanced">
      <summary>Filter mapped fields{hasFilters ? ' · active' : ''}</summary>
      <div className="peridot-record-ledger-advanced-grid">
        {[
          ['participants', 'People and entities'], ['places', 'Places'],
          ['relationships', 'Relationships'], ['evidence', 'Evidence / other fields'],
        ].map(([key, label]) => <label key={key}>{label}
          <input type="search" value={fieldFilters[key]} placeholder={`Find within ${label.toLowerCase()}`} onChange={(event) => setFieldFilter(key, event.target.value)} />
        </label>)}
      </div>
      {hasFilters ? <button type="button" onClick={() => { setFieldFilters({ participants:'', places:'', relationships:'', evidence:'' }); setPage(1); }}>Clear field filters</button> : null}
    </details>
    <div className="peridot-record-ledger-list">
      {shown.map((record) => {
        const expanded = Boolean(expandedKeys[record.key]);
        return <article key={record.key} className="peridot-record-ledger-entry">
          <div className="peridot-record-ledger-entry-main">
            <div className="peridot-record-ledger-date">{record.date}</div>
            <div className="peridot-record-ledger-description">
              <div className="peridot-record-ledger-id">{record.id}</div>
              <p>{record.summary}</p>
              <div className="peridot-record-ledger-relevance"><strong>In this dossier:</strong> {record.relevance}</div>
            </div>
            <div className="peridot-record-ledger-actions">
              <button type="button" aria-expanded={expanded} onClick={() => setExpandedKeys((previous) => ({ ...previous, [record.key]: !expanded }))}>{expanded ? 'Hide fields' : 'View fields'}</button>
              {typeof onOpenRecord === 'function' ? <button type="button" className="peridot-record-ledger-open" onClick={() => onOpenRecord(record.row, record.index)}>Open record <span aria-hidden="true">›</span></button> : null}
            </div>
          </div>
          {expanded ? <ExpandedRecord record={record} /> : null}
        </article>;
      })}
      {!shown.length ? <p className="peridot-record-ledger-empty">{records.length ? 'No records match your search.' : 'No associated records are available for this selection.'}</p> : null}
    </div>
    <footer className="peridot-record-ledger-footer">
      <span>Showing {shown.length ? start + 1 : 0}–{start + shown.length} of {filtered.length} records{filtered.length !== records.length ? ` (from ${records.length} associated records)` : ''}</span>
      <div className="peridot-record-ledger-pager">
        <button type="button" disabled={currentPage === 1} onClick={() => setPage(1)}>First</button>
        <button type="button" disabled={currentPage === 1} onClick={() => setPage(currentPage - 1)}>Previous</button>
        <span>Page {currentPage} of {pageCount}</span>
        <button type="button" disabled={currentPage === pageCount} onClick={() => setPage(currentPage + 1)}>Next</button>
        <button type="button" disabled={currentPage === pageCount} onClick={() => setPage(pageCount)}>Last</button>
      </div>
    </footer>
  </section>;
}
