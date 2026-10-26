/*
 * Reusable mapping-field controls for the role-based column/workbook mapping modal.
 *
 * `PeridotColumnMappingModal.jsx` owns modal state, step routing, validation,
 * import/cancel behavior, and workbook mutation handlers. This file owns only
 * the repeated table UI used to assign Peridot roles to uploaded columns.
 *
 * The split is intentionally conservative:
 * - Single-table controls accept plain uploaded headers and string mappings.
 * - Workbook controls accept the workbook model and sheet/column refs.
 * - No state is stored here; all changes are reported through `onChange`.
 *
 * Maintenance relationship:
 * - Field definitions come from `peridotColumnMapping.js`.
 * - Workbook sheet helpers and column refs come from `peridotWorkbookMapping.js`.
 * - The modal composes these controls inside the relevant mapping steps.
 */

import React from 'react';
import PeridotValueHandlingControl from './PeridotValueHandlingControl.jsx';
import PeridotSubjectSelectionControl from './PeridotSubjectSelectionControl.jsx';
import { MappingStageIntro, MappingGuideCard, MappingQuestionMarker, MappingRefinementMarker, MappingSymbol, MappingInfo } from './PeridotMappingPresentation.jsx';
import {
  PERIDOT_CORE_FIELD_DEFINITIONS_BY_KEY,
  PERIDOT_POINT_FIELD_DEFINITIONS_BY_KEY,
  PERIDOT_TEMPORAL_FIELD_DEFINITIONS,
  PERIDOT_ROUTE_COORDINATE_PAIR_FIELD_DEFINITIONS_BY_KEY,
} from './peridotColumnMapping.js';
import {
  getUsableWorkbookSheets,
  getWorkbookSheet,
  makeWorkbookColumnRef,
} from './peridotWorkbookMapping.js';

/*
 * Shared select styling used by the mapping tables. Keeping this class in one
 * file makes the extracted controls visually identical to their original modal
 * rendering while avoiding a global CSS dependency.
 */
const SOURCE_SELECT_CLASS =
  'peridot-mapping-select w-full min-w-[12rem] rounded-xl border border-[var(--input-border)] bg-[var(--input-bg)] px-3 py-2 text-[var(--input-text)]';

const DISABLED_SOURCE_SELECT_CLASS = `${SOURCE_SELECT_CLASS} disabled:opacity-60`;

const TEMPORAL_COMPONENT_SELECT_CLASS =
  'peridot-mapping-select w-full min-w-0 rounded-xl border border-[var(--input-border)] bg-[var(--input-bg)] px-3 py-2 text-[var(--input-text)]';

const SPATIAL_SELECT_CLASS =
  'peridot-mapping-select w-full min-w-0 rounded-xl border border-[var(--input-border)] bg-[var(--input-bg)] px-3 py-2 text-[var(--input-text)]';

const DISABLED_SPATIAL_SELECT_CLASS = `${SPATIAL_SELECT_CLASS} disabled:opacity-60`;

const VISIBLE_TEMPORAL_FIELD_DEFINITIONS = PERIDOT_TEMPORAL_FIELD_DEFINITIONS.filter(
  (definition) => definition.key !== 'Date_Display'
);

function UsedForBadges({ items = [] }) {
  if (!items.length) return null;
  return (
    <div className="peridot-mapping-used-for-row" aria-label="Used for">
      {items.map((item) => (
        <span key={item} className="peridot-mapping-mini-badge">{item}</span>
      ))}
    </div>
  );
}

function SectionDivider() {
  return <hr className="peridot-mapping-quiet-divider" aria-hidden="true" />;
}

function RoleCell({ definition }) {
  return (
    <div className="peridot-mapping-role-cell">
      <div className="font-semibold text-[var(--panel-card-text)]">{definition.label || definition.key}</div>
      <div className="mt-1 text-[11px] font-normal uppercase tracking-[0.08em] text-[var(--panel-card-muted-text)]">{definition.key}</div>
      {definition.description ? (
        <p className="mt-2 max-w-[38rem] text-xs font-normal leading-relaxed text-[var(--panel-card-muted-text)]">
          {definition.description}
        </p>
      ) : null}
    </div>
  );
}

/*
 * Renders the single-table temporal role assignments.
 *
 * The Time step is intentionally not a dense reference table. It has only a few
 * visible decisions, so it uses a compact task-card layout: temporal roles on
 * the left, user column choices in the center, and one shared explanation panel
 * on the right. Date_Display is composed automatically from the selected single
 * date or interval and is intentionally not shown.
 */
export function getNonBlankExampleValues(rows = [], sourceColumn = '', limit = 3) {
  if (!sourceColumn) return [];
  const seen = new Set();
  const values = [];

  for (const row of rows || []) {
    const rawValue = row?.[sourceColumn];
    const text = String(rawValue ?? '').trim();
    if (!text || seen.has(text)) continue;
    seen.add(text);
    values.push(text);
    if (values.length >= limit) break;
  }

  return values;
}

function TemporalExamples({ values = [] }) {
  if (!values.length) return null;
  return (
    <div className="mt-2 break-words text-sm leading-relaxed text-[var(--panel-card-muted-text)]">
      <span className="font-semibold text-[var(--panel-card-text)]">Examples from your data:</span>{' '}
      {values.map((value, index) => (
        <React.Fragment key={`${value}-${index}`}>
          {index ? ' · ' : ''}<span>{value}</span>
        </React.Fragment>
      ))}
    </div>
  );
}

const TEMPORAL_UI_COPY = Object.freeze({
  Date: Object.freeze({
    label: 'Date',
    description: 'A date associated with this row—for example a letter, transaction, observation, event, photograph, or court record.',
  }),
  Date_Range: Object.freeze({
    label: 'Date range / timespan',
    description: 'Both ends of a period in one column—for example 1600–1640, a lifespan, reign, appointment, journey, or another interval.',
  }),
  Date_Start: Object.freeze({
    label: 'Beginning date',
    description: 'When something begins—for example birth, inception, departure, opening, appointment, construction, or the beginning of a period.',
  }),
  Date_End: Object.freeze({
    label: 'Ending date',
    description: 'When something ends—for example death, dissolution, arrival, closing, termination, demolition, or the end of a period.',
  }),
});

function TemporalIntro() {
  return <MappingStageIntro section="Time" kind="time"
    title="When does the information in each row take place?"
    description="Choose dates or periods associated with your records. You can preserve partial, approximate, and open-ended temporal values."
    help="Choose whether a field is a date or period, then identify where its value is stored. Partial and approximate source values can remain intact." />;
}

function TemporalPartSelect({ headers, value, onChange, label }) {
  return (
    <label className="min-w-0 text-xs font-semibold text-[var(--muted-text)]">
      {label}
      <select value={value || ''} onChange={(event) => onChange(event.target.value)} className={`${TEMPORAL_COMPONENT_SELECT_CLASS} mt-1`}>
        <option value="">Unassigned</option>
        {headers.map((header) => <option key={header} value={header}>{header}</option>)}
      </select>
    </label>
  );
}

function SingleEndpointControls({ headers, mapping, prefix = '', onPatch }) {
  const modeKey = prefix ? `${prefix}Mode` : 'sourceMode';
  const mode = mapping[modeKey] === 'parts' ? 'parts' : 'single';
  const columnKey = prefix ? `${prefix}Column` : 'column';
  return (
    <div className="space-y-3">
      <label className="block text-xs font-semibold text-[var(--muted-text)]">How is this date stored?
        <select value={mode} onChange={(event) => onPatch({ [modeKey]: event.target.value })} className={`${SOURCE_SELECT_CLASS} mt-1`}>
          <option value="single">In one column</option>
          <option value="parts">In separate year / month / day columns</option>
        </select>
      </label>
      {mode === 'single' ? <TemporalPartSelect headers={headers} value={mapping[columnKey]} onChange={(value) => onPatch({ [columnKey]: value })} label="Date column" /> : (
        <div className="grid gap-2 sm:grid-cols-3">
          <TemporalPartSelect headers={headers} value={mapping[prefix ? `${prefix}YearColumn` : 'yearColumn']} onChange={(value) => onPatch({ [prefix ? `${prefix}YearColumn` : 'yearColumn']: value })} label="Year" />
          <TemporalPartSelect headers={headers} value={mapping[prefix ? `${prefix}MonthColumn` : 'monthColumn']} onChange={(value) => onPatch({ [prefix ? `${prefix}MonthColumn` : 'monthColumn']: value })} label="Month" />
          <TemporalPartSelect headers={headers} value={mapping[prefix ? `${prefix}DayColumn` : 'dayColumn']} onChange={(value) => onPatch({ [prefix ? `${prefix}DayColumn` : 'dayColumn']: value })} label="Day" />
        </div>
      )}
    </div>
  );
}

export function TemporalMappingTable({ headers, rows = [], temporalAssertions = [], relationshipParts = [], onAssertionsChange }) {
  const update = (index, patch) => onAssertionsChange?.((currentMappings) => (currentMappings || []).map((mapping, currentIndex) => currentIndex === index ? { ...mapping, ...patch } : mapping));
  const remove = (index) => onAssertionsChange?.((currentMappings) => (currentMappings || []).filter((_, currentIndex) => currentIndex !== index));
  const add = () => onAssertionsChange?.((currentMappings) => [...(currentMappings || []), { id: `time-${Date.now()}`, role: '', kind: 'date', sourceMode: 'single', column: '', noteColumns: [], subjectSelection: { includeRecord: true, participantIndices: [] } }]);
  return (
    <div className="space-y-3">
      <TemporalIntro />
      <div className="peridot-mapping-section-card rounded-2xl border border-[var(--panel-card-border)] bg-[var(--section-bg)] p-5">
        <div className="grid gap-7 lg:grid-cols-[minmax(0,1.62fr)_minmax(17rem,0.72fr)]">
          <div className="space-y-4 min-w-0">
            {temporalAssertions.map((mapping, index) => {
              const kind = mapping.kind === 'period' ? 'period' : 'date';
              return <div key={mapping.id || index} className="peridot-guide-entity-card rounded-2xl border border-[var(--panel-card-border)] bg-[var(--input-bg)]/35 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="text-[15px] font-bold text-[var(--panel-card-text)]">Time {index + 1}</div>
                  <button type="button" onClick={() => remove(index)} className="rounded-lg border border-[var(--input-border)] px-2 py-1 text-xs text-[var(--panel-card-muted-text)]">Remove</button>
                </div>
                <div className="peridot-guide-time-primary peridot-guide-time-primary-question mt-3 grid gap-3 sm:grid-cols-2">
                  <div className="peridot-guide-time-question-heading"><MappingQuestionMarker>1</MappingQuestionMarker><span>What date or period does this field represent?</span></div>
                  <label className="text-xs font-semibold text-[var(--muted-text)]">Name this date or period <MappingInfo text="Peridot will use this name to identify the time later in Timeline, Search, Inspector, and Export." />
                    <input value={mapping.role || ''} onChange={(event) => update(index, { role: event.target.value })} placeholder="e.g. Birth, Creation date, Lifespan, Reign" className={`${SOURCE_SELECT_CLASS} mt-1`} />
                    
                  </label>
                  <label className="text-xs font-semibold text-[var(--muted-text)]">What kind of time is it?
                    <select value={kind} onChange={(event) => update(index, { kind: event.target.value, sourceMode: 'single' })} className={`${SOURCE_SELECT_CLASS} mt-1`}>
                      <option value="date">Date</option><option value="period">Period / range</option>
                    </select>
                  </label>
                </div>
                <div className="peridot-guide-refinement-caption peridot-guide-time-refinement"><MappingQuestionMarker sub>↳</MappingQuestionMarker><div><strong>Then describe this temporal field <MappingInfo text="Identify its subject, source values, and any additional notes." /></strong></div></div>
                {(relationshipParts || []).length ? (
                  <div className="peridot-time-detail-question peridot-time-detail-a mt-4" data-marker="a">
                    <PeridotSubjectSelectionControl
                      value={mapping.subjectSelection}
                      legacySubjectParticipantIndex={mapping.subjectParticipantIndex}
                      participants={(relationshipParts || []).map((part, participantIndex) => ({
                        index: participantIndex,
                        label: `Part ${String.fromCharCode(65 + participantIndex)} — ${part?.participantColumn || `Relationship part ${participantIndex + 1}`}`,
                      }))}
                      noun="date or period"
                      onChange={(subjectSelection) => update(index, { subjectSelection, subjectParticipantIndex: null })}
                    />
                  </div>
                ) : null}
                <div className="peridot-time-detail-question peridot-time-detail-b mt-4" data-marker="b">
                  {kind === 'date' ? <SingleEndpointControls headers={headers} mapping={mapping} onPatch={(patch) => update(index, patch)} /> : (
                    <div className="space-y-3">
                      <label className="block text-xs font-semibold text-[var(--muted-text)]">How is this period stored?
                        <select value={mapping.sourceMode === 'endpoints' ? 'endpoints' : 'single'} onChange={(event) => update(index, { sourceMode: event.target.value })} className={`${SOURCE_SELECT_CLASS} mt-1`}>
                          <option value="single">In one column</option><option value="endpoints">In separate beginning and ending fields</option>
                        </select>
                      </label>
                      {mapping.sourceMode === 'endpoints' ? <div className="grid gap-4 xl:grid-cols-2"><div className="rounded-xl border border-[var(--panel-card-border)] p-3"><div className="mb-2 text-sm font-bold text-[var(--panel-card-text)]">Beginning</div><SingleEndpointControls headers={headers} mapping={mapping} prefix="start" onPatch={(patch) => update(index, patch)} /></div><div className="rounded-xl border border-[var(--panel-card-border)] p-3"><div className="mb-2 text-sm font-bold text-[var(--panel-card-text)]">Ending</div><SingleEndpointControls headers={headers} mapping={mapping} prefix="end" onPatch={(patch) => update(index, patch)} /></div></div> : <TemporalPartSelect headers={headers} value={mapping.column} onChange={(value) => update(index, { column: value })} label="Period column" />}
                    </div>
                  )}
                </div>
                {(kind === 'date' ? mapping.sourceMode !== 'parts' : mapping.sourceMode !== 'endpoints') ? (
                  <div className="peridot-time-detail-question peridot-time-detail-c mt-4 border-t border-[var(--panel-card-border)] pt-4" data-marker="c">
                    <PeridotValueHandlingControl
                      valueHandling={mapping.valueHandling}
                      onChange={(valueHandling) => update(index, { valueHandling })}
                      disabled={!mapping.column}
                    />
                  </div>
                ) : null}
                <div className="peridot-time-detail-question peridot-time-detail-d mt-4 border-t border-[var(--panel-card-border)] pt-3" data-marker="d">
                  <div className="text-xs font-semibold text-[var(--muted-text)]">Related temporal notes (optional) <MappingInfo text="Select any additional source columns that provide notes about this temporal assertion. These are preserved as evidence, not treated as commands about visualization." /></div>
                  {(mapping.noteColumns || []).map((column, noteIndex) => <div key={noteIndex} className="mt-2 flex max-w-xl gap-2"><select value={column || ''} onChange={(event) => { const notes=[...(mapping.noteColumns||[])]; notes[noteIndex]=event.target.value; update(index,{noteColumns:notes}); }} className={`${SOURCE_SELECT_CLASS} max-w-md`}><option value="">Unassigned</option>{headers.map((header)=><option key={header} value={header}>{header}</option>)}</select><button type="button" onClick={()=>update(index,{noteColumns:(mapping.noteColumns||[]).filter((_,i)=>i!==noteIndex)})} className="rounded-lg border border-[var(--input-border)] px-2 text-xs text-[var(--panel-card-muted-text)]">Remove</button></div>)}
                  <button type="button" onClick={()=>update(index,{noteColumns:[...(mapping.noteColumns||[]),'']})} className="mt-3 rounded-xl border border-[var(--button-primary-border)] bg-[var(--button-primary-bg)] px-3 py-2 text-sm font-semibold text-[var(--button-primary-text)] hover:bg-[var(--button-primary-hover)]">+ Add related note column</button>
                </div>
              </div>;
            })}
            <button type="button" onClick={add} className="rounded-xl border border-[var(--button-primary-border)] bg-[var(--button-primary-bg)] px-4 py-3 text-sm font-semibold text-[var(--button-primary-text)] hover:bg-[var(--button-primary-hover)]">+ Add date or period</button>
          </div>
          <TemporalUsagePanel assertions={temporalAssertions} rows={rows} />
        </div>
      </div>
    </div>
  );
}
function TemporalUsagePanel({assertions=[],rows=[],workbookModel}) {
  const first=assertions.find(m=>m?.column || m?.startColumn) || assertions[0] || {};
  const ref=first.column;
  const column=typeof ref==='string'?ref:(ref?.columnName || '');
  const sheet=typeof ref==='object' && ref?.sheetName ? getWorkbookSheet(workbookModel,ref.sheetName) : null;
  const values=getNonBlankExampleValues(sheet?.rows || rows,column,5);
  return <aside className="peridot-guide-context" aria-label="Time mapping examples and guidance">
    <MappingGuideCard kind="examples" title="Examples from your data">{values.length?<ul className="peridot-guide-example-list">{values.map((value,i)=><li key={`${i}-${value}`}>{value}</li>)}</ul>:<p>Select a date or period column to see examples.</p>}</MappingGuideCard>
    <MappingGuideCard kind="interpretation" title="Current interpretation"><p>{column?<>Peridot will read <strong>{column}</strong> as {first.kind==='period'?'a period or range':'a date'}{first.role?` called “${first.role}”`:''}. Source text remains preserved.</>:'No temporal source column has been selected yet.'}</p></MappingGuideCard>
    <MappingGuideCard kind="help" title="Additional context"><h4 className="peridot-compact-context-subhead">Used for</h4><ul className="peridot-guide-check-list"><li>Timeline and temporal navigation</li><li>Inspector, search, and filters</li><li>Charts and exports</li><li>Multiple separate temporal assertions per record</li></ul><div className="peridot-compact-context-divider"/><h4 className="peridot-compact-context-subhead">Good to know</h4><ul className="peridot-compact-context-notes"><li>Time values can be partial, approximate, or open-ended.</li><li>You can map multiple temporal assertions without combining them into one date.</li></ul></MappingGuideCard>
    
  </aside>;
}

/*
 * Renders a single-table mapping table for a caller-supplied set of Peridot
 * role definitions. The modal uses this generic control for relationship,
 * route-place, point-location, and route coordinate-pair sections.
 */
export function CoreRoleMappingTable({ title, description, guidanceLabel, guidanceText, definitions, headers, coreMapping, onChange }) {
  return (
    <div className="peridot-mapping-section-card rounded-2xl border border-[var(--panel-card-border)] bg-[var(--section-bg)] p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted-text)]">{title}</div>
          <div className="mt-1 text-sm font-semibold text-[var(--panel-card-text)]">{description}</div>
        </div>
        {guidanceLabel ? <span className="peridot-mapping-priority-badge">{guidanceLabel}</span> : null}
      </div>
      {guidanceText ? <p className="mt-2 text-xs leading-relaxed text-[var(--panel-card-muted-text)]">{guidanceText}</p> : null}

      <div className="peridot-mapping-table-wrap mt-4 overflow-x-auto rounded-xl border border-[var(--panel-card-border)]">
        <table className="min-w-full border-collapse text-left text-sm">
          <thead className="bg-[var(--stat-card-bg)] text-[var(--panel-card-text)]">
            <tr>
              <th className="px-4 py-3">Field role</th>
              <th className="px-4 py-3">Your column</th>
              <th className="px-4 py-3">Used for</th>
            </tr>
          </thead>
          <tbody className="text-[var(--panel-card-muted-text)]">
            {definitions.map((definition) => (
              <tr key={definition.key} className="border-t border-[var(--panel-card-border)] align-top">
                <td className="px-4 py-3">
                  <RoleCell definition={definition} />
                </td>
                <td className="peridot-mapping-choice-cell px-4 py-3">
                  <select
                    value={coreMapping[definition.key] || ''}
                    onChange={(event) => onChange(definition.key, event.target.value)}
                    className={SOURCE_SELECT_CLASS}
                  >
                    <option value="">Unassigned</option>
                    {headers.map((header) => (
                      <option key={header} value={header}>{header}</option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-3">
                  <UsedForBadges items={definition.usedFor || []} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}


const SPATIAL_SINGLE_TABLE_ROWS = Object.freeze([
  Object.freeze({
    title: 'Single Location Points',
    subtitle: 'Use when each row has one primary place.',
    fields: Object.freeze([
      Object.freeze({ label: 'Location/name', key: 'Point_Place', mappingType: 'point' }),
      Object.freeze({ label: 'Coordinate pair', key: 'Point_Coordinates', mappingType: 'point' }),
      Object.freeze({ label: 'Latitude', key: 'Point_Latitude', mappingType: 'point' }),
      Object.freeze({ label: 'Longitude', key: 'Point_Longitude', mappingType: 'point' }),
    ]),
  }),
  Object.freeze({
    title: 'Connected Locations',
    subtitle: 'Use when each row connects two places.',
    fields: Object.freeze([]),
  }),
  Object.freeze({
    title: 'Source/Start Location',
    compact: true,
    fields: Object.freeze([
      Object.freeze({ label: 'Location/name', key: 'Source_Location', mappingType: 'route' }),
      Object.freeze({ label: 'Coordinate pair', key: 'Source_Coordinates', mappingType: 'routePair' }),
      Object.freeze({ label: 'Latitude', key: 'Source_Latitude', mappingType: 'route' }),
      Object.freeze({ label: 'Longitude', key: 'Source_Longitude', mappingType: 'route' }),
    ]),
  }),
  Object.freeze({
    title: 'Target/End Location',
    compact: true,
    fields: Object.freeze([
      Object.freeze({ label: 'Location/name', key: 'Target_Location', mappingType: 'route' }),
      Object.freeze({ label: 'Coordinate pair', key: 'Target_Coordinates', mappingType: 'routePair' }),
      Object.freeze({ label: 'Latitude', key: 'Target_Latitude', mappingType: 'route' }),
      Object.freeze({ label: 'Longitude', key: 'Target_Longitude', mappingType: 'route' }),
    ]),
  }),
]);

function getSpatialDefinition(field) {
  return (
    PERIDOT_POINT_FIELD_DEFINITIONS_BY_KEY[field.key]
    || PERIDOT_ROUTE_COORDINATE_PAIR_FIELD_DEFINITIONS_BY_KEY[field.key]
    || PERIDOT_CORE_FIELD_DEFINITIONS_BY_KEY[field.key]
    || { key: field.key, label: field.label }
  );
}

function SpatialUsagePanel() {
  return (
    <aside className="rounded-2xl border border-[var(--panel-card-border)] bg-[var(--stat-card-bg)] p-3 text-sm leading-relaxed text-[var(--panel-card-muted-text)]">
      <div className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted-text)]">Used for</div>
      <p className="mt-2">
        Location information supports point maps, route maps, Inspector records, search and filter, charts, and export.
      </p>
      <p className="mt-2">
        Use Single Location Points when each row has one place. Use Connected Locations when each row links a source/start place to a target/end place.
      </p>
      <p className="mt-2">
        Choose either a coordinate pair or separate latitude and longitude fields.
      </p>
    </aside>
  );
}

function SpatialSelect({ value, onChange, headers }) {
  return (
    <select
      value={value || ''}
      onChange={(event) => onChange(event.target.value)}
      className={SPATIAL_SELECT_CLASS}
    >
      <option value="">Unassigned</option>
      {headers.map((header) => (
        <option key={header} value={header}>{header}</option>
      ))}
    </select>
  );
}

function makeWorkbookFieldValue(ref = {}) {
  return ref?.sheetName && ref?.columnName ? `${ref.sheetName}::${ref.columnName}` : '';
}

function parseWorkbookFieldValue(value = '') {
  const separatorIndex = String(value).indexOf('::');
  if (separatorIndex < 0) return makeWorkbookColumnRef('', '');
  return makeWorkbookColumnRef(
    String(value).slice(0, separatorIndex),
    String(value).slice(separatorIndex + 2)
  );
}

function WorkbookFieldSelect({ workbookModel, currentRef = {}, onChange, disabled = false }) {
  const usableSheets = getUsableWorkbookSheets(workbookModel);

  return (
    <select
      value={makeWorkbookFieldValue(currentRef)}
      onChange={(event) => onChange(parseWorkbookFieldValue(event.target.value))}
      disabled={disabled}
      className={disabled ? DISABLED_SPATIAL_SELECT_CLASS : SPATIAL_SELECT_CLASS}
    >
      <option value="">Unassigned</option>
      {usableSheets.map((sheet) => (
        <optgroup key={sheet.sheetName} label={sheet.sheetName}>
          {(sheet.headers || []).map((header) => (
            <option key={`${sheet.sheetName}::${header}`} value={`${sheet.sheetName}::${header}`}>
              {sheet.sheetName} — {header}
            </option>
          ))}
        </optgroup>
      ))}
    </select>
  );
}

function SpatialWorkbookSelect({ workbookModel, currentRef = {}, onChange }) {
  return (
    <WorkbookFieldSelect
      workbookModel={workbookModel}
      currentRef={currentRef}
      onChange={onChange}
    />
  );
}

function SpatialFieldGrid({ children }) {
  return (
    <div className="grid gap-2 md:grid-cols-4">
      {children}
    </div>
  );
}

function SpatialFieldShell({ field, children }) {
  const definition = getSpatialDefinition(field);
  return (
    <label className="min-w-0">
      <div className="mb-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--muted-text)]">{field.label}</div>
      {children}
      <div className="mt-1 truncate text-[11px] text-[var(--panel-card-muted-text)]" title={definition.label || definition.key}>
        {definition.key}
      </div>
    </label>
  );
}

function getSpatialMappingValue(field, { pointMapping, coreMapping, routeCoordinatePairMapping }) {
  if (field.mappingType === 'point') return pointMapping?.[field.key] || '';
  if (field.mappingType === 'routePair') return routeCoordinatePairMapping?.[field.key] || '';
  return coreMapping?.[field.key] || '';
}

function getSpatialWorkbookMappingValue(field, workbookMapping) {
  if (field.mappingType === 'point') return workbookMapping?.pointMappings?.[field.key] || {};
  if (field.mappingType === 'routePair') return workbookMapping?.routeCoordinatePairMappings?.[field.key] || {};
  return workbookMapping?.coreMappings?.[field.key] || {};
}

function handleSpatialMappingChange(field, value, { onPointChange, onRouteChange, onRoutePairChange }) {
  if (field.mappingType === 'point') {
    onPointChange(field.key, value);
    return;
  }
  if (field.mappingType === 'routePair') {
    onRoutePairChange(field.key, value);
    return;
  }
  onRouteChange(field.key, value);
}

const EMPTY_PLACE_PART = Object.freeze({
  placeColumn: '',
  roleLabel: '',
  roleMode: 'heading',
  roleColumn: '',
  subjectSelection: { includeRecord: true, participantIndices: [] },
  coordinatePairColumn: '',
  latitudeColumn: '',
  longitudeColumn: '',
});

function placePartLabel(index) {
  return index < 26 ? `Place ${String.fromCharCode(65 + index)}` : `Place ${index + 1}`;
}

function PlaceExamples({ rows = [], sourceColumn = '' }) {
  const values = getNonBlankExampleValues(rows, sourceColumn, 3);
  if (!values.length) return null;
  return (
    <div className="mt-1.5 break-words text-sm leading-relaxed text-[var(--panel-card-muted-text)]">
      <span className="font-semibold text-[var(--panel-card-text)]">Examples from your data:</span>{' '}
      {values.map((value, index) => (
        <React.Fragment key={`${sourceColumn}-${value}-${index}`}>
          {index ? ' · ' : ''}<span>{value}</span>
        </React.Fragment>
      ))}
    </div>
  );
}

const EMPTY_WORKBOOK_PLACE_PART = Object.freeze({
  placeRef: makeWorkbookColumnRef('', ''),
  roleLabel: '',
  roleMode: 'heading',
  roleRef: makeWorkbookColumnRef('', ''),
  subjectSelection: { includeRecord: true, participantIndices: [] },
  coordinatePairRef: makeWorkbookColumnRef('', ''),
  latitudeRef: makeWorkbookColumnRef('', ''),
  longitudeRef: makeWorkbookColumnRef('', ''),
});

function WorkbookPlaceExamples({ workbookModel, sourceRef = {} }) {
  if (!sourceRef?.sheetName || !sourceRef?.columnName) return null;
  const sheet = getWorkbookSheet(workbookModel, sourceRef.sheetName);
  return (
    <PlaceExamples
      rows={sheet?.rows || []}
      sourceColumn={sourceRef.columnName}
    />
  );
}

function WorkbookPlacePartCard({ part, index, workbookModel, relationshipParts = [], onChange, onRemove }) {
  const label = placePartLabel(index);
  const placeRef = part?.placeRef || makeWorkbookColumnRef('', '');
  const roleMode = part?.roleMode === 'column' ? 'column' : 'heading';
  const roleRef = part?.roleRef || makeWorkbookColumnRef('', '');
  const coordinatePairRef = part?.coordinatePairRef || makeWorkbookColumnRef('', '');
  const latitudeRef = part?.latitudeRef || makeWorkbookColumnRef('', '');
  const longitudeRef = part?.longitudeRef || makeWorkbookColumnRef('', '');
  const usesMultiplePlaceValues = part?.valueHandling?.cardinality === 'multiple';
  const headingLabel = placeRef?.columnName
    ? `${placeRef.sheetName} — ${placeRef.columnName}`
    : '';

  return (
    <section className="peridot-place-part-card rounded-2xl border border-[var(--panel-card-border)] bg-[var(--input-bg)]/30 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="peridot-place-part-title">{label}<span> · Mapping details</span></div>
        {index > 0 ? (
          <button
            type="button"
            onClick={onRemove}
            className="rounded-xl border border-[var(--panel-card-border)] bg-[var(--stat-card-bg)] px-3 py-1.5 text-xs font-semibold text-[var(--panel-card-muted-text)] hover:text-[var(--panel-card-text)]"
          >
            Remove place
          </button>
        ) : null}
      </div>

      <div className="peridot-place-primary-row mt-4 grid gap-5 lg:grid-cols-[minmax(14rem,0.9fr)_minmax(16rem,1.1fr)]">
        <PlaceQuestionHeading primary title={<>Which column contains the place? <MappingInfo text="Choose the column whose values name or identify this place." /></>} />
        <div className="min-w-0">
          <WorkbookFieldSelect
            workbookModel={workbookModel}
            currentRef={placeRef}
            onChange={(ref) => onChange({ placeRef: ref })}
          />
          <WorkbookPlaceExamples workbookModel={workbookModel} sourceRef={placeRef} />
        </div>
      </div>

      <div className="peridot-place-refinement-heading"><MappingRefinementMarker value="↳" className="peridot-place-refinement-marker" /><div><h3>Then refine this place field <MappingInfo text="These details help Peridot interpret the selected place values." /></h3></div></div>
      <div className="peridot-place-subquestion peridot-place-subquestion-a">
        <MappingRefinementMarker value="a" className="peridot-place-subquestion-letter" />
        <PeridotValueHandlingControl
        valueHandling={part?.valueHandling}
        onChange={(valueHandling) => onChange(
          valueHandling?.cardinality === 'multiple'
            ? {
                valueHandling,
                coordinatePairRef: makeWorkbookColumnRef('', ''),
                latitudeRef: makeWorkbookColumnRef('', ''),
                longitudeRef: makeWorkbookColumnRef('', ''),
              }
            : { valueHandling }
        )}
        disabled={!placeRef?.columnName}
      />

      </div>
      <div className="peridot-place-subquestion peridot-place-subquestion-b">
        <MappingRefinementMarker value="b" className="peridot-place-subquestion-letter" />
        <div className="peridot-guide-question-row grid gap-5 lg:grid-cols-[minmax(14rem,0.9fr)_minmax(16rem,1.1fr)]">
        <div>
          <div className="text-[15px] font-bold leading-tight text-[var(--panel-card-text)]">Name this place role <span className="font-normal text-[var(--panel-card-muted-text)]">(optional)</span> <MappingInfo text="Use a fixed researcher-defined name when the source heading does not describe how this place relates to the selected participant, such as “Place of childbirth.” If supplied, this name takes precedence over the source-derived role; the original source field is preserved." /></div>
        </div>
        <div>
          <input
            aria-label="Custom place role"
            value={part?.roleLabel || ''}
            onChange={(event) => onChange({ roleLabel: event.target.value })}
            placeholder="e.g. Place of childbirth, Residence, Court"
            className={SOURCE_SELECT_CLASS}
          />
          
        </div>
      </div>

      </div>
      <div className="peridot-place-subquestion peridot-place-subquestion-c">
        <MappingRefinementMarker value="c" className="peridot-place-subquestion-letter" />
        <div className="peridot-guide-question-row grid gap-5 lg:grid-cols-[minmax(14rem,0.9fr)_minmax(16rem,1.1fr)]">
        <div>
          <div className="text-[15px] font-bold leading-tight text-[var(--panel-card-text)]">Where is the role of this place recorded? <MappingInfo text="The role explains how this place is connected to the row, such as birthplace, residence, origin, destination, court, or repository." /></div>
        </div>
        <div className="space-y-3">
          <label className="flex cursor-pointer items-start gap-2 rounded-xl border border-[var(--panel-card-border)] bg-[var(--stat-card-bg)] px-3 py-2.5 text-sm text-[var(--panel-card-text)]">
            <input
              type="radio"
              name={`workbook-place-role-${index}`}
              checked={roleMode === 'heading'}
              onChange={() => onChange({ roleMode: 'heading', roleRef: makeWorkbookColumnRef('', '') })}
              className="mt-0.5"
            />
            <span>
              <span className="font-semibold">In the column heading</span>
            </span>
          </label>
          <label className="flex cursor-pointer items-start gap-2 rounded-xl border border-[var(--panel-card-border)] bg-[var(--stat-card-bg)] px-3 py-2.5 text-sm text-[var(--panel-card-text)]">
            <input
              type="radio"
              name={`workbook-place-role-${index}`}
              checked={roleMode === 'column'}
              onChange={() => onChange({ roleMode: 'column' })}
              className="mt-0.5"
            />
            <span className="font-semibold">In another column</span>
          </label>
          {roleMode === 'column' ? (
            <div>
              <WorkbookFieldSelect
                workbookModel={workbookModel}
                currentRef={roleRef}
                onChange={(ref) => onChange({ roleRef: ref })}
              />
              <WorkbookPlaceExamples workbookModel={workbookModel} sourceRef={roleRef} />
            </div>
          ) : null}
        </div>
      </div>

      </div>
      <div className="peridot-place-advanced-details">
        <h3>Additional place details <MappingInfo text="Use these settings if your data connects places to specific participants or records coordinates." /></h3>
      {(relationshipParts || []).length ? (
        <>
          <div className="peridot-guide-question-row peridot-place-detail-question grid gap-5 lg:grid-cols-[minmax(14rem,0.9fr)_minmax(16rem,1.1fr)]">
            <div>
              <div className="peridot-guide-detail-label"><MappingQuestionMarker sub>d</MappingQuestionMarker><span>Who or what does this place describe? <MappingInfo text="Choose every mapped participant or the row itself that this place genuinely describes. The same mapped place can support several separate subject-specific assertions." /></span></div>
              
            </div>
            <PeridotSubjectSelectionControl
              value={part?.subjectSelection}
              legacySubjectParticipantIndex={part?.subjectParticipantIndex}
              participants={(relationshipParts || []).map((relationshipPart, participantIndex) => {
                const participantRef = relationshipPart?.participantRef || makeWorkbookColumnRef('', '');
                return {
                  index: participantIndex,
                  label: `Part ${String.fromCharCode(65 + participantIndex)} — ${participantRef?.columnName ? `${participantRef.sheetName} — ${participantRef.columnName}` : `Relationship part ${participantIndex + 1}`}`,
                };
              })}
              noun="place"
              showTitle={false}
              onChange={(subjectSelection) => onChange({ subjectSelection, subjectParticipantIndex: null })}
            />
          </div>

          <div className="my-4"><SectionDivider /></div>
        </>
      ) : null}

      <div className="peridot-place-detail-question peridot-place-coordinate-question">
        <div className="peridot-guide-detail-label"><MappingQuestionMarker sub>e</MappingQuestionMarker><span>Coordinates for this place <span className="font-normal text-[var(--panel-card-muted-text)]">(optional)</span> <MappingInfo text="Choose a combined coordinate column, or separate latitude and longitude columns, if your source records them." /></span></div>
        
        {usesMultiplePlaceValues ? (
          <p className="mt-2 rounded-xl border border-[var(--panel-card-border)] bg-[var(--stat-card-bg)] px-3 py-2 text-xs leading-relaxed text-[var(--panel-card-muted-text)]">
            Coordinates are unavailable for multi-value place cells. If each place has different coordinates, store the places in separate rows, columns, or a related sheet so Peridot can see which coordinates belong to which place.
          </p>
        ) : null}
        <div className="mt-3 grid gap-3 md:grid-cols-3">
          <label className="min-w-0">
            <div className="mb-1 text-xs font-semibold text-[var(--panel-card-text)]">Coordinate pair</div>
            <WorkbookFieldSelect
              workbookModel={workbookModel}
              currentRef={coordinatePairRef}
              onChange={(ref) => onChange({ coordinatePairRef: ref })}
              disabled={usesMultiplePlaceValues}
            />
            <WorkbookPlaceExamples workbookModel={workbookModel} sourceRef={coordinatePairRef} />
          </label>
          <label className="min-w-0">
            <div className="mb-1 text-xs font-semibold text-[var(--panel-card-text)]">Latitude</div>
            <WorkbookFieldSelect
              workbookModel={workbookModel}
              currentRef={latitudeRef}
              onChange={(ref) => onChange({ latitudeRef: ref })}
              disabled={usesMultiplePlaceValues}
            />
            <WorkbookPlaceExamples workbookModel={workbookModel} sourceRef={latitudeRef} />
          </label>
          <label className="min-w-0">
            <div className="mb-1 text-xs font-semibold text-[var(--panel-card-text)]">Longitude</div>
            <WorkbookFieldSelect
              workbookModel={workbookModel}
              currentRef={longitudeRef}
              onChange={(ref) => onChange({ longitudeRef: ref })}
              disabled={usesMultiplePlaceValues}
            />
            <WorkbookPlaceExamples workbookModel={workbookModel} sourceRef={longitudeRef} />
          </label>
        </div>
      </div>
      </div>
    </section>
  );
}

function PlacesIntro() {
  return (
    <header className="peridot-places-intro">
      <div className="peridot-places-intro-main">
        <h2>Places</h2>
        <p className="peridot-places-intro-subtitle">Where is the information in each row located? <MappingInfo label="About place mapping" text="Choose columns that identify places connected to your records. A dataset may contain one place, several places, or none. A place's role explains how it relates to a record or participant, such as birthplace, residence, or court. Only map fields whose values actually identify places." /></p>
      </div>
    </header>
  );
}

function PlacesHelpCard({ title, children, modifier = '' }) {
  return <section className={`peridot-places-help-card ${modifier}`}><h3>{title}</h3>{children}</section>;
}

function PlacesContext({ parts, workbookModel, rows = [], relationshipParts = [] }) {
  const assignedPart = parts.find((part) => part?.placeColumn || part?.placeRef?.columnName) || parts[0] || {};
  const ref = assignedPart?.placeRef;
  const sourceColumn = ref?.columnName || assignedPart?.placeColumn || '';
  const sourceSheet = ref?.sheetName ? getWorkbookSheet(workbookModel, ref.sheetName) : null;
  const sourceRows = sourceSheet?.rows || rows;
  const values = sourceColumn ? getNonBlankExampleValues(sourceRows, sourceColumn, 5) : [];
  const multi = assignedPart?.valueHandling?.cardinality === 'multiple';
  const placeRole = assignedPart?.roleLabel?.trim() || (assignedPart?.roleMode === 'column' ? 'a separate source column' : 'the source column heading');
  const contextLabel = ref?.sheetName ? `${ref.sheetName} — ${sourceColumn}` : sourceColumn;
  return (
    <aside className="peridot-places-context" aria-label="Places examples and guidance">
      <PlacesHelpCard title="Examples from your data">
        {values.length ? (
          <>
            <p className="peridot-places-card-caption">Selected field: {contextLabel}</p>
            <ul className="peridot-places-example-list">{values.map((value, i) => <li key={`${i}-${value}`} title={String(value)}>{value}</li>)}</ul>
          </>
        ) : <p className="peridot-places-card-caption">Choose a place column to see its original values here.</p>}
      </PlacesHelpCard>
      <PlacesHelpCard title="Current interpretation">
        {sourceColumn ? (
          <p>Peridot will read <strong>{contextLabel}</strong> as place information. {multi ? 'Some cells can contain multiple place values.' : 'Each cell contains at most one place value.'} The place role comes from <strong>{placeRole}</strong>.{relationshipParts.length ? ' Subject attribution is configured below.' : ''}</p>
        ) : <p>No place column is assigned yet. You can leave this section unused if the dataset has no mapped places.</p>}
      </PlacesHelpCard>
      <PlacesHelpCard title="Additional context" modifier="peridot-compact-additional-context"><h4 className="peridot-compact-context-subhead">Used for</h4>
        <ul className="peridot-places-bullet-list">
          <li>Locations in maps when usable coordinates and relationships are available</li>
          <li>Inspector records, search, and filtering</li>
          <li>Charts and exports where supported</li>
          <li>Separate place roles and subject-specific evidence</li>
        </ul><div className="peridot-compact-context-divider"/><h4 className="peridot-compact-context-subhead">Good to know</h4><ul className="peridot-compact-context-notes"><li>A place value identifies a location; its role explains its relationship to the record.</li><li>A dataset can have multiple place roles or no mapped places at all.</li></ul>
      </PlacesHelpCard>

    </aside>
  );
}

function PlaceQuestionHeading({ primary = false, letter, title, children }) {
  return (
    <div className={`peridot-place-question-heading ${primary ? 'peridot-place-question-primary' : 'peridot-place-question-secondary'}`}>
      <span className="peridot-place-question-marker" aria-hidden="true">{primary ? '1' : letter}</span>
      <div><h4>{title}</h4>{children}</div>
    </div>
  );
}

function PlacePartCard({ part, index, headers, rows, relationshipParts = [], onChange, onRemove }) {
  const label = placePartLabel(index);
  const selectedPlaceColumn = part?.placeColumn || '';
  const roleMode = part?.roleMode === 'column' ? 'column' : 'heading';
  const roleColumn = part?.roleColumn || '';
  const coordinatePairColumn = part?.coordinatePairColumn || '';
  const latitudeColumn = part?.latitudeColumn || '';
  const longitudeColumn = part?.longitudeColumn || '';
  const usesMultiplePlaceValues = part?.valueHandling?.cardinality === 'multiple';

  return (
    <section className="peridot-place-part-card rounded-2xl border border-[var(--panel-card-border)] bg-[var(--input-bg)]/30 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="peridot-place-part-title">{label}<span> · Mapping details</span></div>
        {index > 0 ? (
          <button
            type="button"
            onClick={onRemove}
            className="rounded-xl border border-[var(--panel-card-border)] bg-[var(--stat-card-bg)] px-3 py-1.5 text-xs font-semibold text-[var(--panel-card-muted-text)] hover:text-[var(--panel-card-text)]"
          >
            Remove place
          </button>
        ) : null}
      </div>

      <div className="peridot-place-primary-row mt-4 grid gap-5 lg:grid-cols-[minmax(14rem,0.9fr)_minmax(16rem,1.1fr)]">
        <PlaceQuestionHeading primary title={<>Which column contains the place? <MappingInfo text="Choose the column whose values name or identify this place." /></>} />
        <div className="min-w-0">
          <select
            aria-label="Place source column"
            value={selectedPlaceColumn}
            onChange={(event) => onChange({ placeColumn: event.target.value })}
            className={SOURCE_SELECT_CLASS}
          >
            <option value="">Unassigned</option>
            {headers.map((header) => <option key={header} value={header}>{header}</option>)}
          </select>
          <PlaceExamples rows={rows} sourceColumn={selectedPlaceColumn} />
        </div>
      </div>

      <div className="peridot-place-refinement-heading"><MappingRefinementMarker value="↳" className="peridot-place-refinement-marker" /><div><h3>Then refine this place field <MappingInfo text="These details help Peridot interpret the selected place values." /></h3></div></div>
      <div className="peridot-place-subquestion peridot-place-subquestion-a">
        <MappingRefinementMarker value="a" className="peridot-place-subquestion-letter" />
        <PeridotValueHandlingControl
        valueHandling={part?.valueHandling}
        onChange={(valueHandling) => onChange(
          valueHandling?.cardinality === 'multiple'
            ? {
                valueHandling,
                coordinatePairColumn: '',
                latitudeColumn: '',
                longitudeColumn: '',
              }
            : { valueHandling }
        )}
        disabled={!selectedPlaceColumn}
      />

      </div>
      <div className="peridot-place-subquestion peridot-place-subquestion-b">
        <MappingRefinementMarker value="b" className="peridot-place-subquestion-letter" />
        <div className="peridot-guide-question-row grid gap-5 lg:grid-cols-[minmax(14rem,0.9fr)_minmax(16rem,1.1fr)]">
        <div>
          <div className="text-[15px] font-bold leading-tight text-[var(--panel-card-text)]">Name this place role <span className="font-normal text-[var(--panel-card-muted-text)]">(optional)</span> <MappingInfo text="Use a fixed researcher-defined name when the source heading does not describe how this place relates to the selected participant, such as “Place of childbirth.” If supplied, this name takes precedence over the source-derived role; the original source field is preserved." /></div>
        </div>
        <div>
          <input
            aria-label="Custom place role"
            value={part?.roleLabel || ''}
            onChange={(event) => onChange({ roleLabel: event.target.value })}
            placeholder="e.g. Place of childbirth, Residence, Court"
            className={SOURCE_SELECT_CLASS}
          />
          
        </div>
      </div>

      </div>
      <div className="peridot-place-subquestion peridot-place-subquestion-c">
        <MappingRefinementMarker value="c" className="peridot-place-subquestion-letter" />
        <div className="peridot-guide-question-row grid gap-5 lg:grid-cols-[minmax(14rem,0.9fr)_minmax(16rem,1.1fr)]">
        <div>
          <div className="text-[15px] font-bold leading-tight text-[var(--panel-card-text)]">Where is the role of this place recorded? <MappingInfo text="The role identifies how this place relates to the record or participant, such as birthplace, residence, court, or origin." /></div>
        </div>
        <div className="space-y-3">
          <label className="flex cursor-pointer items-start gap-2 rounded-xl border border-[var(--panel-card-border)] bg-[var(--stat-card-bg)] px-3 py-2.5 text-sm text-[var(--panel-card-text)]">
            <input
              type="radio"
              name={`place-role-${index}`}
              checked={roleMode === 'heading'}
              onChange={() => onChange({ roleMode: 'heading', roleColumn: '' })}
              className="mt-0.5"
            />
            <span>
              <span className="font-semibold">In the column heading</span>
            </span>
          </label>
          <label className="flex cursor-pointer items-start gap-2 rounded-xl border border-[var(--panel-card-border)] bg-[var(--stat-card-bg)] px-3 py-2.5 text-sm text-[var(--panel-card-text)]">
            <input
              type="radio"
              name={`place-role-${index}`}
              checked={roleMode === 'column'}
              onChange={() => onChange({ roleMode: 'column' })}
              className="mt-0.5"
            />
            <span className="font-semibold">In another column</span>
          </label>
          {roleMode === 'column' ? (
            <div>
              <select
                value={roleColumn}
                onChange={(event) => onChange({ roleColumn: event.target.value })}
                className={SOURCE_SELECT_CLASS}
              >
                <option value="">Choose a role column</option>
                {headers.map((header) => <option key={header} value={header}>{header}</option>)}
              </select>
              <PlaceExamples rows={rows} sourceColumn={roleColumn} />
            </div>
          ) : null}
        </div>
      </div>

      </div>
      <div className="peridot-place-advanced-details">
        <h3>Additional place details <MappingInfo text="Use these settings if your data connects places to specific participants or records coordinates." /></h3>
      {(relationshipParts || []).length ? (
        <>
          <div className="peridot-guide-question-row peridot-place-detail-question grid gap-5 lg:grid-cols-[minmax(14rem,0.9fr)_minmax(16rem,1.1fr)]">
            <div>
              <div className="peridot-guide-detail-label"><MappingQuestionMarker sub>d</MappingQuestionMarker><span>Who or what does this place describe? <MappingInfo text="Choose every mapped participant or the row itself that this place genuinely describes. The same mapped place can support several separate subject-specific assertions." /></span></div>
              
            </div>
            <PeridotSubjectSelectionControl
              value={part?.subjectSelection}
              legacySubjectParticipantIndex={part?.subjectParticipantIndex}
              participants={(relationshipParts || []).map((relationshipPart, participantIndex) => ({
                index: participantIndex,
                label: `Part ${String.fromCharCode(65 + participantIndex)} — ${relationshipPart?.participantColumn || `Relationship part ${participantIndex + 1}`}`,
              }))}
              noun="place"
              showTitle={false}
              onChange={(subjectSelection) => onChange({ subjectSelection, subjectParticipantIndex: null })}
            />
          </div>

          <div className="my-4"><SectionDivider /></div>
        </>
      ) : null}

      <div className="peridot-place-detail-question peridot-place-coordinate-question">
        <div className="peridot-guide-detail-label"><MappingQuestionMarker sub>e</MappingQuestionMarker><span>Coordinates for this place <span className="font-normal text-[var(--panel-card-muted-text)]">(optional)</span> <MappingInfo text="Choose a combined coordinate column, or separate latitude and longitude columns, if your source records them." /></span></div>
        
        {usesMultiplePlaceValues ? (
          <p className="mt-2 rounded-xl border border-[var(--panel-card-border)] bg-[var(--stat-card-bg)] px-3 py-2 text-xs leading-relaxed text-[var(--panel-card-muted-text)]">
            Coordinates are unavailable for multi-value place cells. If each place has different coordinates, store the places in separate rows, columns, or a related sheet so Peridot can see which coordinates belong to which place.
          </p>
        ) : null}
        <div className="mt-3 grid gap-3 md:grid-cols-3">
          <label className="min-w-0">
            <div className="mb-1 text-xs font-semibold text-[var(--panel-card-text)]">Coordinate pair</div>
            <select
              value={coordinatePairColumn}
              onChange={(event) => onChange({ coordinatePairColumn: event.target.value })}
              disabled={usesMultiplePlaceValues}
              className={usesMultiplePlaceValues ? DISABLED_SPATIAL_SELECT_CLASS : SPATIAL_SELECT_CLASS}
            >
              <option value="">Unassigned</option>
              {headers.map((header) => <option key={header} value={header}>{header}</option>)}
            </select>
            <PlaceExamples rows={rows} sourceColumn={coordinatePairColumn} />
          </label>
          <label className="min-w-0">
            <div className="mb-1 text-xs font-semibold text-[var(--panel-card-text)]">Latitude</div>
            <select
              value={latitudeColumn}
              onChange={(event) => onChange({ latitudeColumn: event.target.value })}
              disabled={usesMultiplePlaceValues}
              className={usesMultiplePlaceValues ? DISABLED_SPATIAL_SELECT_CLASS : SPATIAL_SELECT_CLASS}
            >
              <option value="">Unassigned</option>
              {headers.map((header) => <option key={header} value={header}>{header}</option>)}
            </select>
            <PlaceExamples rows={rows} sourceColumn={latitudeColumn} />
          </label>
          <label className="min-w-0">
            <div className="mb-1 text-xs font-semibold text-[var(--panel-card-text)]">Longitude</div>
            <select
              value={longitudeColumn}
              onChange={(event) => onChange({ longitudeColumn: event.target.value })}
              disabled={usesMultiplePlaceValues}
              className={usesMultiplePlaceValues ? DISABLED_SPATIAL_SELECT_CLASS : SPATIAL_SELECT_CLASS}
            >
              <option value="">Unassigned</option>
              {headers.map((header) => <option key={header} value={header}>{header}</option>)}
            </select>
            <PlaceExamples rows={rows} sourceColumn={longitudeColumn} />
          </label>
        </div>
      </div>
      </div>
    </section>
  );
}

export function SpatialMappingPanel({ headers, rows = [], placeParts = [], relationshipParts = [], onPlacePartsChange }) {
  const effectiveParts = placeParts.length ? placeParts : [{ ...EMPTY_PLACE_PART }];

  const updatePart = (index, patch) => {
    onPlacePartsChange?.(
      effectiveParts.map((part, currentIndex) => currentIndex === index ? { ...part, ...patch } : part)
    );
  };

  const addPart = () => {
    onPlacePartsChange?.([...effectiveParts, { ...EMPTY_PLACE_PART }]);
  };

  const removePart = (index) => {
    const next = effectiveParts.filter((_, currentIndex) => currentIndex !== index);
    onPlacePartsChange?.(next.length ? next : [{ ...EMPTY_PLACE_PART }]);
  };

  return (
    <div className="peridot-places-workspace">
      <PlacesIntro />
      <div className="peridot-places-content-grid">
        <div className="peridot-places-editing-column">
          <div className="min-w-0 space-y-4">
            {effectiveParts.map((part, index) => (
              <PlacePartCard
                key={`place-part-${index}`}
                part={part}
                index={index}
                headers={headers}
                rows={rows}
                relationshipParts={relationshipParts}
                onChange={(patch) => updatePart(index, patch)}
                onRemove={() => removePart(index)}
              />
            ))}
            <button
              type="button"
              onClick={addPart}
              className="rounded-xl border border-[var(--button-primary-border)] bg-[var(--button-primary-bg)] px-3 py-2 text-sm font-semibold text-[var(--button-primary-text)] hover:bg-[var(--button-primary-hover)]"
            >
              + Add another place
            </button>
          </div>
        </div>
        <PlacesContext parts={effectiveParts} rows={rows} relationshipParts={relationshipParts} />
      </div>
    </div>
  );
}

export function WorkbookSpatialMappingPanel({ workbookModel, placeParts = [], relationshipParts = [], onPlacePartsChange }) {
  const effectiveParts = placeParts.length ? placeParts : [{ ...EMPTY_WORKBOOK_PLACE_PART }];

  const updatePart = (index, patch) => {
    onPlacePartsChange?.(
      effectiveParts.map((part, currentIndex) => currentIndex === index ? { ...part, ...patch } : part)
    );
  };

  const addPart = () => {
    onPlacePartsChange?.([...effectiveParts, { ...EMPTY_WORKBOOK_PLACE_PART }]);
  };

  const removePart = (index) => {
    const next = effectiveParts.filter((_, currentIndex) => currentIndex !== index);
    onPlacePartsChange?.(next.length ? next : [{ ...EMPTY_WORKBOOK_PLACE_PART }]);
  };

  return (
    <div className="peridot-places-workspace">
      <PlacesIntro />
      <div className="peridot-places-content-grid">
        <div className="peridot-places-editing-column">
          <div className="min-w-0 space-y-4">
            {effectiveParts.map((part, index) => (
              <WorkbookPlacePartCard
                key={`workbook-place-part-${index}`}
                part={part}
                index={index}
                workbookModel={workbookModel}
                relationshipParts={relationshipParts}
                onChange={(patch) => updatePart(index, patch)}
                onRemove={() => removePart(index)}
              />
            ))}
            <button
              type="button"
              onClick={addPart}
              className="rounded-xl border border-[var(--button-primary-border)] bg-[var(--button-primary-bg)] px-3 py-2 text-sm font-semibold text-[var(--button-primary-text)] hover:bg-[var(--button-primary-hover)]"
            >
              + Add another place
            </button>
          </div>
        </div>
        <PlacesContext parts={effectiveParts} workbookModel={workbookModel} relationshipParts={relationshipParts} />
      </div>
    </div>
  );
}



const EMPTY_RELATIONSHIP_PART = Object.freeze({
  participantColumn: '',
  participantValueMode: 'label',
  roleMode: 'heading',
  roleColumn: '',
});

function RelationshipIntro() {
  return <MappingStageIntro section="Relations" kind="relations"
    title="What connections are recorded in each row?"
    description="Choose columns identifying the people, places, organizations, objects, or other participants connected by a row. A relationship may have two or many parts."
    help="A participant is someone or something connected in the record. Its role explains how it is connected, such as sender, recipient, parent, child, or owner." />;
}

function RelationshipExamples({ rows = [], sourceColumn = '' }) {
  if (!sourceColumn) return null;
  const examples = [];
  const seen = new Set();

  for (const row of rows) {
    const value = String(row?.[sourceColumn] ?? '').trim();
    if (!value || seen.has(value)) continue;
    seen.add(value);
    examples.push(value);
    if (examples.length >= 3) break;
  }

  if (!examples.length) return null;

  return (
    <div className="mt-2 text-sm leading-relaxed text-[var(--panel-card-muted-text)]">
      <span className="font-semibold text-[var(--panel-card-text)]">Examples from your data:</span>{' '}
      {examples.join(' · ')}
    </div>
  );
}

function RelationshipUsagePanel({parts=[],rows=[],workbookModel}) {
  const first=parts.find(part=>part?.participantColumn || part?.participantRef?.columnName) || parts[0] || {};
  const sourceRef=first.participantRef || {};
  const column=sourceRef.columnName || first.participantColumn || '';
  const sheet=sourceRef.sheetName ? getWorkbookSheet(workbookModel,sourceRef.sheetName) : null;
  const values=getNonBlankExampleValues(sheet?.rows || rows,column,5);
  const field=sourceRef.sheetName ? `${sourceRef.sheetName} — ${column}` : column;
  return <aside className="peridot-guide-context" aria-label="Relationship mapping examples and guidance">
    <MappingGuideCard title="Examples from your data" kind="examples">
      {values.length?<ul className="peridot-guide-example-list">{values.map((value,i)=><li key={`${i}-${value}`}>{value}</li>)}</ul>:<p>Select a participant column to view example values.</p>}
    </MappingGuideCard>
    <MappingGuideCard title="Current interpretation" kind="interpretation"><p>{field?<>Peridot reads <strong>{field}</strong> as a relationship participant. {first.participantValueMode==='identity-reference'?'Values reference mapped identities.':'Values are participant names or labels.'} The role {first.roleMode==='column'?'comes from another column.':'comes from the source heading.'}</>:'No participant column has been selected yet.'}</p></MappingGuideCard><MappingGuideCard title="Additional context" kind="help"><h4 className="peridot-compact-context-subhead">Used for</h4><ul className="peridot-guide-check-list"><li>Network visualizations and connected records</li><li>Inspector, search, and filtering</li><li>Charts and exports</li><li>Separate participant roles for multi-part relationships</li></ul><div className="peridot-compact-context-divider"/><h4 className="peridot-compact-context-subhead">Good to know</h4><ul className="peridot-compact-context-notes"><li>A relationship can connect two or more participants.</li><li>Each participant can have a distinct role.</li></ul></MappingGuideCard>
    
  </aside>;
}

function RelationshipPartCard({ part, index, headers, rows, onChange, onRemove, canRemove }) {
  const participantColumn = part?.participantColumn || '';
  const roleMode = part?.roleMode === 'column' ? 'column' : 'heading';
  const roleColumn = part?.roleColumn || '';
  const letter = String.fromCharCode(65 + index);

  return (
    <section className="peridot-guide-entity-card rounded-2xl border border-[var(--panel-card-border)] bg-[var(--input-bg)]/35 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="text-lg font-bold text-[var(--panel-card-text)]">Part {letter} <MappingInfo label={`About Part ${letter}`} text={index === 0
            ? 'This might be the sender of a letter, the place of origin, a person on a family tree, an organization, an object, or another participant.'
            : index === 1
              ? 'This might be the recipient of a letter, the destination or a stop along a journey, a relative of Part A on a family tree, or another participant.'
              : 'Add another person, place, organization, object, or other participant in this relationship.'} /></div>
        </div>
        {canRemove ? (
          <button
            type="button"
            onClick={onRemove}
            className="rounded-xl border border-[var(--panel-card-border)] bg-[var(--stat-card-bg)] px-3 py-1.5 text-xs font-semibold text-[var(--panel-card-muted-text)] hover:text-[var(--panel-card-text)]"
          >
            Remove
          </button>
        ) : null}
      </div>

      <div className="my-4"><SectionDivider /></div>

      <div className="peridot-guide-question-row peridot-guide-relation-primary grid gap-5 lg:grid-cols-[minmax(14rem,0.9fr)_minmax(16rem,1.1fr)]">
        <div>
          <div className="peridot-guide-primary-label"><MappingQuestionMarker>1</MappingQuestionMarker><span>Which column contains this part of the relationship? <MappingInfo text="Choose the column whose values identify the person, place, organization, object, or other participant." /></span></div>
        </div>
        <div>
          <select
            value={participantColumn}
            onChange={(event) => onChange({ participantColumn: event.target.value })}
            className={SOURCE_SELECT_CLASS}
          >
            <option value="">Unassigned</option>
            {headers.map((header) => <option key={header} value={header}>{header}</option>)}
          </select>
          
        </div>
      </div>

      <div className="my-4"><SectionDivider /></div>
      <div className="peridot-guide-refinement-caption"><MappingQuestionMarker sub>↳</MappingQuestionMarker><div><strong>Then refine this relationship field <MappingInfo text="Describe how this participant should be interpreted." /></strong></div></div>
      <div className="peridot-guide-relation-refinement-group">
        <div className="peridot-guide-relation-refinement-item">
          <MappingRefinementMarker value="a" className="peridot-guide-relation-refinement-marker" />
          <div className="peridot-guide-relation-refinement-content">
      <PeridotValueHandlingControl
        valueHandling={part?.valueHandling}
        onChange={(valueHandling) => onChange({ valueHandling })}
        disabled={!participantColumn}
      />
          </div>
        </div>

        <div className="peridot-guide-relation-refinement-item">
          <MappingRefinementMarker value="b" className="peridot-guide-relation-refinement-marker" />
          <div className="peridot-guide-relation-refinement-content">
            <div className="peridot-guide-question-row peridot-guide-relation-detail grid gap-5 lg:grid-cols-[minmax(14rem,0.9fr)_minmax(16rem,1.1fr)]">
        <div>
          <div className="text-[15px] font-bold leading-tight text-[var(--panel-card-text)]">What does this column contain? <MappingInfo text="Most relationship fields contain the participant's name or label. Choose ID references when the values instead point to IDs for people or entities recorded elsewhere in your mapped data." /></div>
        </div>
        <div className="space-y-3">
          <label className="flex cursor-pointer items-start gap-2 rounded-xl border border-[var(--panel-card-border)] bg-[var(--stat-card-bg)] px-3 py-2.5 text-sm text-[var(--panel-card-text)]">
            <input type="radio" name={`relationship-value-mode-${index}`} checked={part?.participantValueMode !== 'identity-reference'} onChange={() => onChange({ participantValueMode: 'label' })} className="mt-0.5" />
            <span className="font-semibold">Names or labels</span>
          </label>
          <label className="flex cursor-pointer items-start gap-2 rounded-xl border border-[var(--panel-card-border)] bg-[var(--stat-card-bg)] px-3 py-2.5 text-sm text-[var(--panel-card-text)]">
            <input type="radio" name={`relationship-value-mode-${index}`} checked={part?.participantValueMode === 'identity-reference'} onChange={() => onChange({ participantValueMode: 'identity-reference' })} className="mt-0.5" />
            <span className="font-semibold">IDs that identify records elsewhere in the data</span>
          </label>
        </div>
      </div>

          </div>
        </div>
        <div className="peridot-guide-relation-refinement-item">
          <MappingRefinementMarker value="c" className="peridot-guide-relation-refinement-marker" />
          <div className="peridot-guide-relation-refinement-content">
            <div className="peridot-guide-question-row peridot-guide-relation-detail grid gap-5 lg:grid-cols-[minmax(14rem,0.9fr)_minmax(16rem,1.1fr)]">
        <div>
          <div className="text-[15px] font-bold leading-tight text-[var(--panel-card-text)]">Where is this part&apos;s role recorded? <MappingInfo text="The role explains how this participant takes part in the relationship, such as sender, recipient, mother, child, witness, owner, or member." /></div>
        </div>
        <div className="space-y-3">
          <label className="flex cursor-pointer items-start gap-2 rounded-xl border border-[var(--panel-card-border)] bg-[var(--stat-card-bg)] px-3 py-2.5 text-sm text-[var(--panel-card-text)]">
            <input
              type="radio"
              name={`relationship-role-${index}`}
              checked={roleMode === 'heading'}
              onChange={() => onChange({ roleMode: 'heading', roleColumn: '' })}
              className="mt-0.5"
            />
            <span>
              <span className="font-semibold">In the column heading</span>
            </span>
          </label>
          <label className="flex cursor-pointer items-start gap-2 rounded-xl border border-[var(--panel-card-border)] bg-[var(--stat-card-bg)] px-3 py-2.5 text-sm text-[var(--panel-card-text)]">
            <input
              type="radio"
              name={`relationship-role-${index}`}
              checked={roleMode === 'column'}
              onChange={() => onChange({ roleMode: 'column' })}
              className="mt-0.5"
            />
            <span className="font-semibold">In another column</span>
          </label>
          {roleMode === 'column' ? (
            <div>
              <select
                value={roleColumn}
                onChange={(event) => onChange({ roleColumn: event.target.value })}
                className={SOURCE_SELECT_CLASS}
              >
                <option value="">Choose a role column</option>
                {headers.map((header) => <option key={header} value={header}>{header}</option>)}
              </select>
              <RelationshipExamples rows={rows} sourceColumn={roleColumn} />
            </div>
          ) : null}
        </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function RelationshipMetadataSection({
  headers,
  rows,
  relationshipMetadataMapping = {},
  onMetadataChange,
}) {
  const relationshipTypeColumn = relationshipMetadataMapping?.Relationship_Type || '';
  const relationshipLabelColumn = relationshipMetadataMapping?.Relationship_Label || '';

  return (
    <section className="peridot-guide-entity-card rounded-2xl border border-[var(--panel-card-border)] bg-[var(--input-bg)]/35 p-4">
      <div className="text-lg font-bold text-[var(--panel-card-text)]">Relationship information <span className="font-normal text-[var(--panel-card-muted-text)]">(optional)</span> <MappingInfo text="Map columns that describe the relationship as a whole rather than one participant&apos;s role." /></div>
      
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <label className="min-w-0">
          <div className="mb-1 text-sm font-semibold text-[var(--panel-card-text)]">Relationship type</div>
          <select
            value={relationshipTypeColumn}
            onChange={(event) => onMetadataChange('Relationship_Type', event.target.value)}
            className={SOURCE_SELECT_CLASS}
          >
            <option value="">Unassigned</option>
            {headers.map((header) => <option key={header} value={header}>{header}</option>)}
          </select>
          <RelationshipExamples rows={rows} sourceColumn={relationshipTypeColumn} />
        </label>
        <label className="min-w-0">
          <div className="mb-1 text-sm font-semibold text-[var(--panel-card-text)]">Relationship label or description</div>
          <select
            value={relationshipLabelColumn}
            onChange={(event) => onMetadataChange('Relationship_Label', event.target.value)}
            className={SOURCE_SELECT_CLASS}
          >
            <option value="">Unassigned</option>
            {headers.map((header) => <option key={header} value={header}>{header}</option>)}
          </select>
          <RelationshipExamples rows={rows} sourceColumn={relationshipLabelColumn} />
        </label>
      </div>
    </section>
  );
}

export function RelationshipMappingPanel({
  headers,
  rows = [],
  relationshipParts = [],
  relationshipMetadataMapping = {},
  onRelationshipPartsChange,
  onMetadataChange,
}) {
  const effectiveParts = relationshipParts.length >= 2
    ? relationshipParts
    : [
        ...(relationshipParts || []),
        ...Array.from({ length: Math.max(0, 2 - (relationshipParts || []).length) }, () => ({ ...EMPTY_RELATIONSHIP_PART })),
      ];

  const updatePart = (index, patch) => {
    onRelationshipPartsChange?.(
      effectiveParts.map((part, currentIndex) => currentIndex === index ? { ...part, ...patch } : part)
    );
  };

  const addPart = () => {
    onRelationshipPartsChange?.([...effectiveParts, { ...EMPTY_RELATIONSHIP_PART }]);
  };

  const removePart = (index) => {
    const next = effectiveParts.filter((_, currentIndex) => currentIndex !== index);
    onRelationshipPartsChange?.(next.length >= 2 ? next : effectiveParts);
  };

  return (
    <div className="space-y-3">
      <RelationshipIntro />
      <div className="peridot-mapping-section-card rounded-2xl border border-[var(--panel-card-border)] bg-[var(--section-bg)] p-5">
        <div className="grid gap-7 lg:grid-cols-[minmax(0,1.62fr)_minmax(17rem,0.72fr)]">
          <div className="min-w-0 space-y-4">
            {effectiveParts.map((part, index) => (
              <RelationshipPartCard
                key={`relationship-part-${index}`}
                part={part}
                index={index}
                headers={headers}
                rows={rows}
                onChange={(patch) => updatePart(index, patch)}
                onRemove={() => removePart(index)}
                canRemove={effectiveParts.length > 2}
              />
            ))}
            <button
              type="button"
              onClick={addPart}
              className="rounded-xl border border-[var(--button-primary-border)] bg-[var(--button-primary-bg)] px-3 py-2 text-sm font-semibold text-[var(--button-primary-text)] hover:bg-[var(--button-primary-hover)]"
            >
              + Add another part
            </button>
            <RelationshipMetadataSection
              headers={headers}
              rows={rows}
              relationshipMetadataMapping={relationshipMetadataMapping}
              onMetadataChange={onMetadataChange}
            />
          </div>
          <RelationshipUsagePanel parts={effectiveParts} rows={rows} />
        </div>
      </div>
    </div>
  );
}

function WorkbookRelationshipExamples({ workbookModel, sourceRef = {} }) {
  if (!sourceRef?.sheetName || !sourceRef?.columnName) return null;
  const sheet = getWorkbookSheet(workbookModel, sourceRef.sheetName);
  return <RelationshipExamples rows={sheet?.rows || []} sourceColumn={sourceRef.columnName} />;
}

const EMPTY_WORKBOOK_RELATIONSHIP_PART = Object.freeze({
  participantRef: makeWorkbookColumnRef('', ''),
  participantValueMode: 'label',
  roleMode: 'heading',
  roleRef: makeWorkbookColumnRef('', ''),
});

function WorkbookRelationshipPartCard({ part, index, workbookModel, onChange, onRemove, canRemove }) {
  const participantRef = part?.participantRef || makeWorkbookColumnRef('', '');
  const roleMode = part?.roleMode === 'column' ? 'column' : 'heading';
  const roleRef = part?.roleRef || makeWorkbookColumnRef('', '');
  const letter = String.fromCharCode(65 + index);
  const headingLabel = participantRef?.columnName ? `${participantRef.sheetName} — ${participantRef.columnName}` : '';

  return (
    <section className="peridot-guide-entity-card rounded-2xl border border-[var(--panel-card-border)] bg-[var(--input-bg)]/35 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="text-lg font-bold text-[var(--panel-card-text)]">Part {letter} <MappingInfo label={`About Part ${letter}`} text={index === 0
            ? 'This might be the sender of a letter, the place of origin, a person on a family tree, an organization, an object, or another participant.'
            : index === 1
              ? 'This might be the recipient of a letter, the destination or a stop along a journey, a relative of Part A on a family tree, or another participant.'
              : 'Add another person, place, organization, object, or other participant in this relationship.'} /></div>
        </div>
        {canRemove ? (
          <button
            type="button"
            onClick={onRemove}
            className="rounded-xl border border-[var(--panel-card-border)] bg-[var(--stat-card-bg)] px-3 py-1.5 text-xs font-semibold text-[var(--panel-card-muted-text)] hover:text-[var(--panel-card-text)]"
          >
            Remove
          </button>
        ) : null}
      </div>

      <div className="my-4"><SectionDivider /></div>

      <div className="peridot-guide-question-row peridot-guide-relation-primary grid gap-5 lg:grid-cols-[minmax(14rem,0.9fr)_minmax(16rem,1.1fr)]">
        <div>
          <div className="peridot-guide-primary-label"><MappingQuestionMarker>1</MappingQuestionMarker><span>Which column contains this part of the relationship? <MappingInfo text="Choose the sheet and column whose values identify the person, place, organization, object, or other participant." /></span></div>
        </div>
        <div>
          <WorkbookFieldSelect
            workbookModel={workbookModel}
            currentRef={participantRef}
            onChange={(ref) => onChange({ participantRef: ref })}
          />
          
        </div>
      </div>

      <div className="my-4"><SectionDivider /></div>
      <div className="peridot-guide-refinement-caption"><MappingQuestionMarker sub>↳</MappingQuestionMarker><div><strong>Then refine this relationship field <MappingInfo text="Describe how this participant should be interpreted." /></strong></div></div>
      <div className="peridot-guide-relation-refinement-group">
        <div className="peridot-guide-relation-refinement-item">
          <MappingRefinementMarker value="a" className="peridot-guide-relation-refinement-marker" />
          <div className="peridot-guide-relation-refinement-content">
      <PeridotValueHandlingControl
        valueHandling={part?.valueHandling}
        onChange={(valueHandling) => onChange({ valueHandling })}
        disabled={!participantRef?.columnName}
      />
          </div>
        </div>

        <div className="peridot-guide-relation-refinement-item">
          <MappingRefinementMarker value="b" className="peridot-guide-relation-refinement-marker" />
          <div className="peridot-guide-relation-refinement-content">
            <div className="peridot-guide-question-row peridot-guide-relation-detail grid gap-5 lg:grid-cols-[minmax(14rem,0.9fr)_minmax(16rem,1.1fr)]">
        <div>
          <div className="text-[15px] font-bold leading-tight text-[var(--panel-card-text)]">What does this column contain? <MappingInfo text="Most relationship fields contain the participant's name or label. Choose ID references when the values instead point to IDs for people or entities recorded elsewhere in your mapped data." /></div>
        </div>
        <div className="space-y-3">
          <label className="flex cursor-pointer items-start gap-2 rounded-xl border border-[var(--panel-card-border)] bg-[var(--stat-card-bg)] px-3 py-2.5 text-sm text-[var(--panel-card-text)]">
            <input type="radio" name={`workbook-relationship-value-mode-${index}`} checked={part?.participantValueMode !== 'identity-reference'} onChange={() => onChange({ participantValueMode: 'label' })} className="mt-0.5" />
            <span className="font-semibold">Names or labels</span>
          </label>
          <label className="flex cursor-pointer items-start gap-2 rounded-xl border border-[var(--panel-card-border)] bg-[var(--stat-card-bg)] px-3 py-2.5 text-sm text-[var(--panel-card-text)]">
            <input type="radio" name={`workbook-relationship-value-mode-${index}`} checked={part?.participantValueMode === 'identity-reference'} onChange={() => onChange({ participantValueMode: 'identity-reference' })} className="mt-0.5" />
            <span className="font-semibold">IDs that identify records elsewhere in the data</span>
          </label>
        </div>
      </div>

          </div>
        </div>
        <div className="peridot-guide-relation-refinement-item">
          <MappingRefinementMarker value="c" className="peridot-guide-relation-refinement-marker" />
          <div className="peridot-guide-relation-refinement-content">
            <div className="peridot-guide-question-row peridot-guide-relation-detail grid gap-5 lg:grid-cols-[minmax(14rem,0.9fr)_minmax(16rem,1.1fr)]">
        <div>
          <div className="text-[15px] font-bold leading-tight text-[var(--panel-card-text)]">Where is this part&apos;s role recorded? <MappingInfo text="The role explains how this participant takes part in the relationship, such as sender, recipient, mother, child, witness, owner, or member." /></div>
        </div>
        <div className="space-y-3">
          <label className="flex cursor-pointer items-start gap-2 rounded-xl border border-[var(--panel-card-border)] bg-[var(--stat-card-bg)] px-3 py-2.5 text-sm text-[var(--panel-card-text)]">
            <input
              type="radio"
              name={`workbook-relationship-role-${index}`}
              checked={roleMode === 'heading'}
              onChange={() => onChange({ roleMode: 'heading', roleRef: makeWorkbookColumnRef('', '') })}
              className="mt-0.5"
            />
            <span>
              <span className="font-semibold">In the column heading</span>
            </span>
          </label>

          <label className="flex cursor-pointer items-start gap-2 rounded-xl border border-[var(--panel-card-border)] bg-[var(--stat-card-bg)] px-3 py-2.5 text-sm text-[var(--panel-card-text)]">
            <input
              type="radio"
              name={`workbook-relationship-role-${index}`}
              checked={roleMode === 'column'}
              onChange={() => onChange({ roleMode: 'column' })}
              className="mt-0.5"
            />
            <span className="font-semibold">In another column</span>
          </label>

          {roleMode === 'column' ? (
            <div>
              <WorkbookFieldSelect
                workbookModel={workbookModel}
                currentRef={roleRef}
                onChange={(ref) => onChange({ roleRef: ref })}
              />
              <WorkbookRelationshipExamples workbookModel={workbookModel} sourceRef={roleRef} />
            </div>
          ) : null}
        </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function WorkbookRelationshipMetadataSection({ workbookModel, relationshipMetadataMappings = {}, onMetadataChange }) {
  const relationshipTypeRef = relationshipMetadataMappings?.Relationship_Type || makeWorkbookColumnRef('', '');
  const relationshipLabelRef = relationshipMetadataMappings?.Relationship_Label || makeWorkbookColumnRef('', '');

  return (
    <section className="peridot-guide-entity-card rounded-2xl border border-[var(--panel-card-border)] bg-[var(--input-bg)]/35 p-4">
      <div className="text-lg font-bold text-[var(--panel-card-text)]">
        Relationship information <span className="font-normal text-[var(--panel-card-muted-text)]">(optional)</span>
      </div>
      

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <label className="min-w-0">
          <div className="mb-1 text-sm font-semibold text-[var(--panel-card-text)]">Relationship type</div>
          <WorkbookFieldSelect
            workbookModel={workbookModel}
            currentRef={relationshipTypeRef}
            onChange={(ref) => onMetadataChange('Relationship_Type', ref)}
          />
          <WorkbookRelationshipExamples workbookModel={workbookModel} sourceRef={relationshipTypeRef} />
        </label>

        <label className="min-w-0">
          <div className="mb-1 text-sm font-semibold text-[var(--panel-card-text)]">Relationship label or description</div>
          <WorkbookFieldSelect
            workbookModel={workbookModel}
            currentRef={relationshipLabelRef}
            onChange={(ref) => onMetadataChange('Relationship_Label', ref)}
          />
          <WorkbookRelationshipExamples workbookModel={workbookModel} sourceRef={relationshipLabelRef} />
        </label>
      </div>
    </section>
  );
}

export function WorkbookRelationshipMappingPanel({ workbookModel, workbookMapping = {}, onRelationshipPartsChange, onMetadataChange }) {
  const relationshipParts = Array.isArray(workbookMapping.relationshipParts) ? workbookMapping.relationshipParts : [];
  const effectiveParts = relationshipParts.length >= 2
    ? relationshipParts
    : [
        ...relationshipParts,
        ...Array.from({ length: Math.max(0, 2 - relationshipParts.length) }, () => ({ ...EMPTY_WORKBOOK_RELATIONSHIP_PART })),
      ];

  const updatePart = (index, patch) => {
    onRelationshipPartsChange?.(
      effectiveParts.map((part, currentIndex) => currentIndex === index ? { ...part, ...patch } : part)
    );
  };

  const addPart = () => {
    onRelationshipPartsChange?.([
      ...effectiveParts,
      { participantRef: makeWorkbookColumnRef('', ''), participantValueMode: 'label', roleMode: 'heading', roleRef: makeWorkbookColumnRef('', '') },
    ]);
  };

  const removePart = (index) => {
    const next = effectiveParts.filter((_, currentIndex) => currentIndex !== index);
    onRelationshipPartsChange?.(next.length >= 2 ? next : effectiveParts);
  };

  return (
    <div className="space-y-3">
      <RelationshipIntro />
      <div className="peridot-mapping-section-card rounded-2xl border border-[var(--panel-card-border)] bg-[var(--section-bg)] p-5">
        <div className="grid gap-7 lg:grid-cols-[minmax(0,1.62fr)_minmax(17rem,0.72fr)]">
          <div className="min-w-0 space-y-4">
            {effectiveParts.map((part, index) => (
              <WorkbookRelationshipPartCard
                key={`workbook-relationship-part-${index}`}
                part={part}
                index={index}
                workbookModel={workbookModel}
                onChange={(patch) => updatePart(index, patch)}
                onRemove={() => removePart(index)}
                canRemove={effectiveParts.length > 2}
              />
            ))}

            <button
              type="button"
              onClick={addPart}
              className="rounded-xl border border-[var(--button-primary-border)] bg-[var(--button-primary-bg)] px-3 py-2 text-sm font-semibold text-[var(--button-primary-text)] hover:bg-[var(--button-primary-hover)]"
            >
              + Add another part
            </button>

            <WorkbookRelationshipMetadataSection
              workbookModel={workbookModel}
              relationshipMetadataMappings={workbookMapping.relationshipMetadataMappings || {}}
              onMetadataChange={onMetadataChange}
            />
          </div>
          <RelationshipUsagePanel parts={effectiveParts} workbookModel={workbookModel} />
        </div>
      </div>
    </div>
  );
}

/*
 * Renders workbook temporal mappings. Workbook mappings differ from ordinary
 * table mappings because each role points to a sheet/column pair rather than a
 * single flat uploaded column name. The visual pattern mirrors the single-table
 * Time step with one shared usage note.
 */
function WorkbookTemporalRefControl({ workbookModel, label, currentRef, onChange }) {
  return <label className="block text-xs font-semibold text-[var(--muted-text)]">{label}<div className="mt-1"><WorkbookFieldSelect workbookModel={workbookModel} currentRef={currentRef || {}} onChange={onChange} /></div></label>;
}
function WorkbookEndpointControls({ workbookModel, mapping, prefix = '', onPatch }) {
  const modeKey = prefix ? `${prefix}Mode` : 'sourceMode'; const mode = mapping[modeKey] === 'parts' ? 'parts' : 'single'; const columnKey = prefix ? `${prefix}Column` : 'column';
  return <div className="space-y-3"><label className="block text-xs font-semibold text-[var(--muted-text)]">How is this date stored?<select value={mode} onChange={(e)=>onPatch({[modeKey]:e.target.value})} className={`${SOURCE_SELECT_CLASS} mt-1`}><option value="single">In one column</option><option value="parts">In separate year / month / day columns</option></select></label>{mode==='single'?<WorkbookTemporalRefControl workbookModel={workbookModel} label="Date column" currentRef={mapping[columnKey]} onChange={(ref)=>onPatch({[columnKey]:ref})}/>:<div className="grid gap-2 sm:grid-cols-3"><WorkbookTemporalRefControl workbookModel={workbookModel} label="Year" currentRef={mapping[prefix ? `${prefix}YearColumn` : 'yearColumn']} onChange={(ref)=>onPatch({[prefix ? `${prefix}YearColumn` : 'yearColumn']:ref})}/><WorkbookTemporalRefControl workbookModel={workbookModel} label="Month" currentRef={mapping[prefix ? `${prefix}MonthColumn` : 'monthColumn']} onChange={(ref)=>onPatch({[prefix ? `${prefix}MonthColumn` : 'monthColumn']:ref})}/><WorkbookTemporalRefControl workbookModel={workbookModel} label="Day" currentRef={mapping[prefix ? `${prefix}DayColumn` : 'dayColumn']} onChange={(ref)=>onPatch({[prefix ? `${prefix}DayColumn` : 'dayColumn']:ref})}/></div>}</div>;
}
export function WorkbookTemporalMappingTable({ workbookModel, workbookMapping, onAssertionsChange }) {
  const temporalAssertions = workbookMapping.temporalAssertionMappings || [];
  const update=(index,patch)=>onAssertionsChange?.((currentMappings)=>(currentMappings||[]).map((m,i)=>i===index?{...m,...patch}:m)); const remove=(index)=>onAssertionsChange?.((currentMappings)=>(currentMappings||[]).filter((_,i)=>i!==index)); const add=()=>onAssertionsChange?.((currentMappings)=>[...(currentMappings||[]),{id:`time-${Date.now()}`,role:'',kind:'date',sourceMode:'single',column:makeWorkbookColumnRef('',''),noteColumns:[],subjectSelection:{includeRecord:true,participantIndices:[]}}]);
  return <div className="space-y-3"><TemporalIntro/><div className="peridot-mapping-section-card rounded-2xl border border-[var(--panel-card-border)] bg-[var(--section-bg)] p-5"><div className="grid gap-7 lg:grid-cols-[minmax(0,1.62fr)_minmax(17rem,0.72fr)]"><div className="space-y-4 min-w-0">{temporalAssertions.map((mapping,index)=>{const kind=mapping.kind==='period'?'period':'date'; return <div key={mapping.id||index} className="peridot-guide-entity-card rounded-2xl border border-[var(--panel-card-border)] bg-[var(--input-bg)]/35 p-4"><div className="flex items-start justify-between gap-3"><div className="text-[15px] font-bold text-[var(--panel-card-text)]">Time {index+1}</div><button type="button" onClick={()=>remove(index)} className="rounded-lg border border-[var(--input-border)] px-2 py-1 text-xs text-[var(--panel-card-muted-text)]">Remove</button></div><div className="peridot-guide-time-primary peridot-guide-time-primary-question mt-3 grid gap-3 sm:grid-cols-2"><div className="peridot-guide-time-question-heading"><MappingQuestionMarker>1</MappingQuestionMarker><span>What date or period does this field represent?</span></div><label className="text-xs font-semibold text-[var(--muted-text)]">Name this date or period <MappingInfo text="Peridot will use this name to identify the time later in Timeline, Search, Inspector, and Export." /><input value={mapping.role||''} onChange={(e)=>update(index,{role:e.target.value})} placeholder="e.g. Birth, Creation date, Lifespan, Reign" className={`${SOURCE_SELECT_CLASS} mt-1`}/></label><label className="text-xs font-semibold text-[var(--muted-text)]">What kind of time is it?<select value={kind} onChange={(e)=>update(index,{kind:e.target.value,sourceMode:'single'})} className={`${SOURCE_SELECT_CLASS} mt-1`}><option value="date">Date</option><option value="period">Period / range</option></select></label></div><div className="peridot-guide-refinement-caption peridot-guide-time-refinement"><MappingQuestionMarker sub>↳</MappingQuestionMarker><div><strong>Then describe this temporal field <MappingInfo text="Identify its subject, source values, and any additional notes." /></strong></div></div>{(workbookMapping.relationshipParts || []).length ? <div className="peridot-time-detail-question peridot-time-detail-a mt-4" data-marker="a"><PeridotSubjectSelectionControl value={mapping.subjectSelection} legacySubjectParticipantIndex={mapping.subjectParticipantIndex} participants={(workbookMapping.relationshipParts || []).map((part, participantIndex) => { const ref = part?.participantRef || makeWorkbookColumnRef('', ''); return { index: participantIndex, label: `Part ${String.fromCharCode(65 + participantIndex)} — ${ref?.columnName ? `${ref.sheetName} — ${ref.columnName}` : `Relationship part ${participantIndex + 1}`}` }; })} noun="date or period" onChange={(subjectSelection)=>update(index,{subjectSelection,subjectParticipantIndex:null})}/></div> : null}<div className="peridot-time-detail-question peridot-time-detail-b mt-4" data-marker="b">{kind==='date'?<WorkbookEndpointControls workbookModel={workbookModel} mapping={mapping} onPatch={(patch)=>update(index,patch)}/>:<div className="space-y-3"><label className="block text-xs font-semibold text-[var(--muted-text)]">How is this period stored?<select value={mapping.sourceMode==='endpoints'?'endpoints':'single'} onChange={(e)=>update(index,{sourceMode:e.target.value})} className={`${SOURCE_SELECT_CLASS} mt-1`}><option value="single">In one column</option><option value="endpoints">In separate beginning and ending fields</option></select></label>{mapping.sourceMode==='endpoints'?<div className="grid gap-4 xl:grid-cols-2"><div className="rounded-xl border border-[var(--panel-card-border)] p-3"><div className="mb-2 text-sm font-bold text-[var(--panel-card-text)]">Beginning</div><WorkbookEndpointControls workbookModel={workbookModel} mapping={mapping} prefix="start" onPatch={(patch)=>update(index,patch)}/></div><div className="rounded-xl border border-[var(--panel-card-border)] p-3"><div className="mb-2 text-sm font-bold text-[var(--panel-card-text)]">Ending</div><WorkbookEndpointControls workbookModel={workbookModel} mapping={mapping} prefix="end" onPatch={(patch)=>update(index,patch)}/></div></div>:<WorkbookTemporalRefControl workbookModel={workbookModel} label="Period column" currentRef={mapping.column} onChange={(ref)=>update(index,{column:ref})}/>}</div>}</div>{(kind==='date'?mapping.sourceMode!=='parts':mapping.sourceMode!=='endpoints')?<div className="peridot-time-detail-question peridot-time-detail-c mt-4 border-t border-[var(--panel-card-border)] pt-4" data-marker="c"><PeridotValueHandlingControl valueHandling={mapping.valueHandling} onChange={(valueHandling)=>update(index,{valueHandling})} disabled={!mapping.column?.columnName}/></div>:null}<div className="peridot-time-detail-question peridot-time-detail-d mt-4 border-t border-[var(--panel-card-border)] pt-3" data-marker="d"><div className="text-xs font-semibold text-[var(--muted-text)]">Related temporal notes (optional) <MappingInfo text="Select any additional source columns that provide notes about this temporal assertion. These are preserved as evidence, not treated as commands about visualization." /></div>{(mapping.noteColumns||[]).map((ref,noteIndex)=><div key={noteIndex} className="mt-2 flex max-w-xl gap-2"><div className="min-w-0 max-w-md flex-1"><WorkbookFieldSelect workbookModel={workbookModel} currentRef={ref||{}} onChange={(nextRef)=>{const notes=[...(mapping.noteColumns||[])];notes[noteIndex]=nextRef;update(index,{noteColumns:notes});}}/></div><button type="button" onClick={()=>update(index,{noteColumns:(mapping.noteColumns||[]).filter((_,i)=>i!==noteIndex)})} className="rounded-lg border border-[var(--input-border)] px-2 text-xs text-[var(--panel-card-muted-text)]">Remove</button></div>)}<button type="button" onClick={()=>update(index,{noteColumns:[...(mapping.noteColumns||[]),makeWorkbookColumnRef('','')]})} className="mt-3 rounded-xl border border-[var(--button-primary-border)] bg-[var(--button-primary-bg)] px-3 py-2 text-sm font-semibold text-[var(--button-primary-text)] hover:bg-[var(--button-primary-hover)]">+ Add related note column</button></div></div>})}<button type="button" onClick={add} className="rounded-xl border border-[var(--button-primary-border)] bg-[var(--button-primary-bg)] px-4 py-3 text-sm font-semibold text-[var(--button-primary-text)] hover:bg-[var(--button-primary-hover)]">+ Add date or period</button></div><TemporalUsagePanel assertions={temporalAssertions} workbookModel={workbookModel}/></div></div></div>;
}
/*
 * Renders workbook role mappings for caller-supplied role definitions. This is
 * the workbook counterpart to `CoreRoleMappingTable`: every mapping value is a
 * workbook column ref, and the modal remains responsible for updating the
 * workbook mapping state when a selection changes.
 */
export function WorkbookCoreRoleMappingTable({ title, description, guidanceLabel, guidanceText, definitions, workbookModel, workbookMapping, onChange }) {
  const coreMappings = workbookMapping.coreMappings || {};

  return (
    <div className="peridot-mapping-section-card rounded-2xl border border-[var(--panel-card-border)] bg-[var(--section-bg)] p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted-text)]">{title}</div>
          <div className="mt-1 text-sm font-semibold text-[var(--panel-card-text)]">{description}</div>
        </div>
        {guidanceLabel ? <span className="peridot-mapping-priority-badge">{guidanceLabel}</span> : null}
      </div>
      {guidanceText ? <p className="mt-2 text-xs leading-relaxed text-[var(--panel-card-muted-text)]">{guidanceText}</p> : null}

      <div className="peridot-mapping-table-wrap mt-4 overflow-x-auto rounded-xl border border-[var(--panel-card-border)]">
        <table className="min-w-full border-collapse text-left text-sm">
          <thead className="bg-[var(--stat-card-bg)] text-[var(--panel-card-text)]">
            <tr>
              <th className="px-4 py-3">Field role</th>
              <th className="px-4 py-3">Your column</th>
              <th className="px-4 py-3">Used for</th>
            </tr>
          </thead>
          <tbody className="text-[var(--panel-card-muted-text)]">
            {definitions.map((definition) => {
              const currentRef = coreMappings[definition.key] || {};
              return (
                <tr key={definition.key} className="border-t border-[var(--panel-card-border)] align-top">
                  <td className="px-4 py-3">
                    <RoleCell definition={definition} />
                  </td>
                  <td className="peridot-mapping-choice-cell px-4 py-3">
                    <WorkbookFieldSelect
                      workbookModel={workbookModel}
                      currentRef={currentRef}
                      onChange={(ref) => onChange(definition.key, ref)}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <UsedForBadges items={definition.usedFor || []} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
