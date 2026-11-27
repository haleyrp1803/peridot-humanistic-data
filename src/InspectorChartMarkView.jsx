/* Charts II analytical-mark evidence. Receives derivation-retained source row references. */
import React, { useMemo, useState } from 'react';
import { getPeridotChartContributingRecordLabel } from './peridotChartContributingRecordLabel.js';
import { INITIAL_CHART_CONTRIBUTIONS, CHART_CONTRIBUTION_BATCH_SIZE, filterPeridotChartContributions, nextPeridotChartContributionLimit } from './peridotChartContributionList.js';
import { formatPeridotChartInspectorNumber, formatPeridotChartInspectorValue } from './peridotChartInspectorFormatting.js';
import { buildPeridotRecordStructure } from './peridotRecordStructure.js';
import { PeridotContributingRecordsLedger } from './PeridotContributingRecordsLedger.jsx';
import { PeridotInvestigateFurther } from './PeridotInvestigateFurther.jsx';

const number = formatPeridotChartInspectorNumber;
function mappedSubjectsFromContributions(rows) {
  const subjects = new Map();
  (rows || []).forEach((row) => {
    if (!row || typeof row !== 'object') return;
    const structure = buildPeridotRecordStructure(row);
    const countedInRow = new Set();
    const add = (kind, label, entityId = '', role = '') => {
      const name = String(label ?? '').trim();
      if (!name || /^(unknown|not specified)$/i.test(name)) return;
      const id = String(entityId ?? '').trim();
      const key = `${kind}:${id || name.toLocaleLowerCase()}`;
      if (countedInRow.has(key)) return;
      countedInRow.add(key);
      const existing = subjects.get(key);
      if (existing) { existing.count += 1; return; }
      subjects.set(key, { kind, name, entityId: id, role: String(role ?? '').trim(), count: 1 });
    };
    (structure.participants || []).forEach(item => add('person', item.value, item.entityId, item.label));
    (structure.places || []).forEach(item => add('place', item.value, '', item.label));
  });
  return Array.from(subjects.values()).sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}

export function InspectorChartMarkView({ selectedProps: mark, onOpenLetterDetail, onOpenPersonDetail, onOpenPlaceDetail, dossierSheet = 'overview', isCompact = true }) {
  const [showRecords, setShowRecords] = useState(false);
  const [showAllSubjects, setShowAllSubjects] = useState(false);
  const [search, setSearch] = useState('');
  const [visibleLimit, setVisibleLimit] = useState(INITIAL_CHART_CONTRIBUTIONS);
  const mappedSubjects = useMemo(() => mappedSubjectsFromContributions(mark?.contributingRows), [mark?.contributingRows]);
  if (!mark) return null;
  const records = Array.isArray(mark.contributingRows) ? mark.contributingRows : [];
  const filteredRecords = useMemo(
    () => filterPeridotChartContributions(records, search, getPeridotChartContributingRecordLabel),
    [records, search]
  );
  const visibleRecords = filteredRecords.slice(0, visibleLimit);
  const calculation = mark.calculation || {};
  const total = Number(mark.shownTotal);
  const share = Number.isFinite(total) && total > 0 && mark.chartType === 'pie'
    ? `${(Number(mark.value) / total * 100).toFixed(1)}%` : '';
  const analyticalSummary = <div className="space-y-3 text-sm text-[#24382d]">
    <section className={isCompact ? "rounded-md border border-[#cbb68b] bg-[#f5ecd2] p-3" : "peridot-chart-dossier-calculation"}>
      <h4 className="font-semibold text-[#8b3026]">Evidence supporting this mark</h4>
      <div className="mt-2 grid grid-cols-2 gap-3">
        <div><span className="block text-xs text-[#52675a]">Calculated value</span><strong>{formatPeridotChartInspectorValue(mark.value, mark.unit)}</strong></div>
        <div><span className="block text-xs text-[#52675a]">Calculation</span><strong>{calculation.aggregation || 'Not specified'}</strong></div>
        <div><span className="block text-xs text-[#52675a]">Grouping field</span><strong>{calculation.groupField || 'Not specified'}</strong></div>
        {calculation.seriesField ? <div><span className="block text-xs text-[#52675a]">Series field</span><strong>{calculation.seriesField}</strong></div> : null}
        <div><span className="block text-xs text-[#52675a]">Measure</span><strong>{calculation.measureField || 'Not specified'}</strong></div>
        <div><span className="block text-xs text-[#52675a]">Contributing records</span><strong>{number(records.length)}</strong></div>
        {mark.observationCount != null ? <div><span className="block text-xs text-[#52675a]">Binned observations</span><strong>{number(mark.observationCount)}</strong></div> : null}
        {mark.contributingCategoryLabels?.length ? <div className="col-span-2"><span className="block text-xs text-[#52675a]">Categories included in this bin</span><strong>{mark.contributingCategoryLabels.join(', ')}</strong></div> : null}
        {mark.xValue !== undefined ? <div className="col-span-2"><span className="block text-xs text-[#52675a]">Original plotted coordinates</span><strong>X: {number(mark.xValue)} · Y: {number(mark.yValue)}{mark.sizeValue != null ? ` · Size: ${number(mark.sizeValue)}` : ''}</strong></div> : null}
        {mark.statistics ? <div className="col-span-2"><span className="block text-xs text-[#52675a]">Distribution statistics</span>
          {mark.statistics.outlier ? <strong>Outlier outside 1.5 × IQR fences ({number(mark.statistics.lowerFence)}–{number(mark.statistics.upperFence)})</strong>
            : <strong>n={number(mark.statistics.count)} · Q1 {number(mark.statistics.q1)} · Median {number(mark.statistics.median)} · Q3 {number(mark.statistics.q3)} · Whiskers {number(mark.statistics.lowerWhisker)}–{number(mark.statistics.upperWhisker)} · {mark.statistics.outlierCount} outliers</strong>}</div> : null}
        {mark.comparison ? <div className="col-span-2"><span className="block text-xs text-[#52675a]">Comparison periods</span>
          <strong>{mark.comparison.period ? `${mark.comparison.period}: ` : ''}{mark.comparison.before == null ? 'Not observed' : number(mark.comparison.before)} → {mark.comparison.after == null ? 'Not observed' : number(mark.comparison.after)}{mark.comparison.delta == null ? '' : ` · Change ${number(mark.comparison.delta)}`}</strong></div> : null}
        {mark.hierarchy ? <div className="col-span-2"><span className="block text-xs text-[#52675a]">Hierarchy and share</span>
          <strong>{[mark.hierarchy.parent, mark.hierarchy.child].filter(Boolean).join(' → ')}{Number.isFinite(mark.hierarchy.shareOfTotal) ? ` · ${(mark.hierarchy.shareOfTotal*100).toFixed(1)}% of total` : ''}</strong>
          {mark.hierarchy.consolidatedOther && <p className="text-xs">Consolidated Other group; original category members are retained.</p>}</div> : null}
        {share ? <div><span className="block text-xs text-[#52675a]">Share of displayed total</span><strong>{share}</strong></div> : null}
      </div>
      <p className="mt-2 text-xs text-[#52675a]">{mark.chartType === 'histogram' && mark.unit === 'categories' ? 'This histogram bins category totals, not individual source records; a category may contain multiple records.' : mark.chartType === 'scatter' ? 'This point represents one eligible source observation; plotted offsets do not change its original coordinates.' : 'The retained records are the observations used by this chart calculation. The resulting value need not equal the record count for numerical aggregates.'}</p>
    </section>
    {isCompact && <section className="rounded-md border border-[#cbb68b] bg-[#f5ecd2] p-3">
      <h4 className="font-semibold text-[#8b3026]">Source record contributions</h4>
      <p className="mt-1 text-xs text-[#52675a]">{records.length} source row references retained during grouping. Chart-local filtering and the current chronology scope are reflected in these contributions.</p>
      <button type="button" className="mt-2 rounded border border-[#9f8147] px-2 py-1 font-semibold text-[#24533a]" onClick={() => setShowRecords(value => !value)} aria-expanded={showRecords}>{showRecords ? 'Hide contributing records' : 'Show contributing records'}</button>
      {showRecords && <div className="mt-3 space-y-2">
        <label htmlFor="peridot-chart-contribution-search" className="block text-xs font-semibold text-[#52675a]">Find a contributing record by ID</label>
        <div className="relative">
          <span aria-hidden="true" className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-[#536b5e]">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" width="17" height="17"><circle cx="10.8" cy="10.8" r="6.5"/><path d="m16 16 5 5"/></svg>
          </span>
          <input
            id="peridot-chart-contribution-search"
            type="search"
            value={search}
            onChange={(event) => { setSearch(event.target.value); setVisibleLimit(INITIAL_CHART_CONTRIBUTIONS); }}
            placeholder="Search record IDs…"
            className="peridot-chart-record-search w-full rounded-md border-2 border-[#88744d] bg-[#fffdf6] py-2.5 pl-10 pr-3 text-sm font-medium text-[#203b2c] shadow-sm placeholder:font-normal placeholder:text-[#5f6d60] focus:border-[#2b5b44] focus:outline-none focus:ring-2 focus:ring-[#8aab91]"
          />
        </div>
        <p className="text-xs text-[#52675a]" aria-live="polite">Showing {Math.min(visibleLimit, filteredRecords.length).toLocaleString()} of {filteredRecords.length.toLocaleString()} {search.trim() ? 'matching ' : ''}contributions{search.trim() ? ` (${records.length.toLocaleString()} total)` : ''}.</p>
        <ul className="max-h-64 space-y-2 overflow-auto pr-1">
          {visibleRecords.map((row, index) => <li key={`${getPeridotChartContributingRecordLabel(row)}:${index}`}>
            {typeof onOpenLetterDetail === 'function' ? <button type="button" className="break-all text-left text-[#276044] underline" onClick={() => onOpenLetterDetail(row, records.indexOf(row))}>{getPeridotChartContributingRecordLabel(row)}</button> : <span className="break-all">{getPeridotChartContributingRecordLabel(row)}</span>}
          </li>)}
        </ul>
        {!filteredRecords.length && <p className="text-xs text-[#52675a]">No contributing record IDs match this search.</p>}
        {visibleLimit < filteredRecords.length && <button type="button" className="rounded border border-[#9f8147] px-2 py-1 font-semibold text-[#24533a]" onClick={() => setVisibleLimit(current => nextPeridotChartContributionLimit(current, filteredRecords.length))}>
          Show {Math.min(CHART_CONTRIBUTION_BATCH_SIZE, filteredRecords.length - visibleLimit)} more
        </button>}
      </div>}
    </section>}
  </div>;
  if (isCompact) return analyticalSummary;
  // A chart category is a mapped subject only when it matches the actual
  // person/place values retained in this selected mark's contributing rows.
  const categoryNames = [mark.category, mark.label, mark.series]
    .map(value => String(value ?? '').trim().toLocaleLowerCase()).filter(Boolean);
  const isCategorySubject = (subject) => categoryNames.includes(subject.name.toLocaleLowerCase());
  const orderedSubjects = [...mappedSubjects].sort((a, b) =>
    Number(isCategorySubject(b)) - Number(isCategorySubject(a))
    || b.count - a.count || a.name.localeCompare(b.name));
  const visibleSubjects = showAllSubjects ? orderedSubjects : orderedSubjects.slice(0, 24);
  return <div className="peridot-chart-dossier">
    <header className="peridot-evidence-subject-heading"><h2>{mark.label || mark.title || 'Selected chart mark'}</h2></header>
    {dossierSheet === 'overview' ? <div className="peridot-chart-dossier-overview">
      <p className="peridot-chart-dossier-intro">The calculation and retained source rows below describe this particular chart mark, including chart-local filtering. The mapped subjects listed afterward can be opened in their standard research dossiers; those dossiers may include records outside this chart mark.</p>
      {analyticalSummary}
      <section className="peridot-chart-dossier-subjects" aria-label="Mapped subjects from chart contributions">
        <h3>Mapped people and places in contributing records</h3>
        <p>These names come from the records retained for this mark. Their presence does not imply that every listed subject is the chart's grouping category or that every association is a directed relationship.</p>
        {orderedSubjects.length ? <>
          <div className="peridot-chart-dossier-subject-grid">
            {visibleSubjects.map((subject) => <button type="button" key={`${subject.kind}:${subject.entityId || subject.name}`}
              className="peridot-chart-dossier-subject-row"
              onClick={() => subject.kind === 'person' ? onOpenPersonDetail?.(subject.name, subject.entityId) : onOpenPlaceDetail?.(subject.name)}
              disabled={subject.kind === 'person' ? typeof onOpenPersonDetail !== 'function' : typeof onOpenPlaceDetail !== 'function'}>
              <span className="peridot-chart-dossier-subject-body">
                <small>{subject.kind === 'person' ? 'Person / entity' : 'Place'}{subject.role ? ` · ${subject.role}` : ''}</small>
                <strong>{subject.name}</strong>
                {isCategorySubject(subject) && <em className="peridot-chart-dossier-category-note">Matches chart category</em>}
              </span>
              <span className="peridot-chart-dossier-subject-count">{subject.count} {subject.count === 1 ? 'row' : 'rows'} <span aria-hidden="true">›</span></span>
            </button>)}
          </div>
          {!showAllSubjects && orderedSubjects.length > 24 && <button className="peridot-chart-dossier-more" type="button" onClick={() => setShowAllSubjects(true)}>Show all {orderedSubjects.length} mapped subjects</button>}
        </> : <p>No mapped people or places were retained for this mark. You can still inspect its contributing source records.</p>}
      </section>
    </div> : dossierSheet === 'records' ? <section className="peridot-chart-dossier-records">
      <h3>Contributing records</h3>
      <p>Only the source rows retained by this chart calculation are listed here. Other records in a linked person's or place's dossier may not have contributed to this mark.</p>
      <PeridotContributingRecordsLedger rows={records} subjectLabel={mark.label || ''} entityType="chart-mark" onOpenRecord={onOpenLetterDetail}/>
    </section> : <section className="peridot-chart-dossier-investigate">
      <h3>Investigate further</h3>
      <PeridotInvestigateFurther />
    </section>}
  </div>;
}
