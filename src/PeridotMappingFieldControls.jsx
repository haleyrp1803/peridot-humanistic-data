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
import { PERIDOT_TEMPORAL_FIELD_DEFINITIONS } from './peridotColumnMapping.js';
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
 * The Time step is intentionally not a dense reference table. It has only three
 * visible decisions, so it uses a compact task-card layout: temporal roles on
 * the left, user column choices in the center, and one shared explanation panel
 * on the right. Date_Display is composed automatically from the selected single
 * date or interval and is intentionally not shown.
 */
export function TemporalMappingTable({ headers, temporalMapping = {}, onChange }) {
  return (
    <div className="peridot-mapping-section-card rounded-2xl border border-[var(--panel-card-border)] bg-[var(--section-bg)] p-5">
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.45fr)_minmax(18rem,0.85fr)]">
        <div className="min-w-0">
          <div className="grid grid-cols-[minmax(9rem,0.8fr)_minmax(14rem,1fr)] gap-4 border-b border-[var(--panel-card-border)] bg-[var(--stat-card-bg)] px-4 py-3 text-sm font-semibold text-[var(--panel-card-text)]">
            <div>Temporal role</div>
            <div>Your column</div>
          </div>

          <div className="divide-y divide-[var(--panel-card-border)] rounded-b-xl border-x border-b border-[var(--panel-card-border)] bg-[var(--input-bg)]/35">
            {VISIBLE_TEMPORAL_FIELD_DEFINITIONS.map((definition) => (
              <div
                key={definition.key}
                className="grid grid-cols-[minmax(9rem,0.8fr)_minmax(14rem,1fr)] gap-4 px-4 py-4 text-sm"
              >
                <div className="min-w-0">
                  <div className="font-semibold text-[var(--panel-card-text)]">{definition.label || definition.key}</div>
                  <div className="mt-1 text-[11px] font-normal uppercase tracking-[0.08em] text-[var(--panel-card-muted-text)]">{definition.key}</div>
                </div>
                <div className="peridot-mapping-choice-cell min-w-0">
                  <select
                    value={temporalMapping[definition.key] || ''}
                    onChange={(event) => onChange(definition.key, event.target.value)}
                    className={SOURCE_SELECT_CLASS}
                  >
                    <option value="">Unassigned</option>
                    {headers.map((header) => (
                      <option key={header} value={header}>{header}</option>
                    ))}
                  </select>
                </div>
              </div>
            ))}
          </div>
        </div>

        <TemporalUsagePanel />
      </div>
    </div>
  );
}

function TemporalUsagePanel() {
  return (
    <aside className="rounded-2xl border border-[var(--panel-card-border)] bg-[var(--stat-card-bg)] p-4 text-sm leading-relaxed text-[var(--panel-card-muted-text)]">
      <div className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted-text)]">Used for</div>
      <p className="mt-3">
        Temporal information is used in Peridot’s timeline, search and filter, charts, Inspector, and export.
      </p>
      <p className="mt-3">
        Peridot will display the selected single date, or compose a date span from Date start and Date end.
      </p>
    </aside>
  );
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

/*
 * Renders workbook temporal mappings. Workbook mappings differ from ordinary
 * table mappings because each role points to a sheet/column pair rather than a
 * single flat uploaded column name. The visual pattern mirrors the single-table
 * Time step: three visible date decisions plus one shared usage note.
 */
export function WorkbookTemporalMappingTable({ workbookModel, workbookMapping, onChange }) {
  const usableSheets = getUsableWorkbookSheets(workbookModel);
  const temporalMappings = workbookMapping.temporalMappings || {};

  return (
    <div className="peridot-mapping-section-card rounded-2xl border border-[var(--panel-card-border)] bg-[var(--section-bg)] p-5">
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.55fr)_minmax(18rem,0.85fr)]">
        <div className="min-w-0">
          <div className="grid grid-cols-[minmax(8rem,0.75fr)_minmax(11rem,1fr)_minmax(11rem,1fr)] gap-3 border-b border-[var(--panel-card-border)] bg-[var(--stat-card-bg)] px-4 py-3 text-sm font-semibold text-[var(--panel-card-text)]">
            <div>Temporal role</div>
            <div>Sheet</div>
            <div>Column</div>
          </div>

          <div className="divide-y divide-[var(--panel-card-border)] rounded-b-xl border-x border-b border-[var(--panel-card-border)] bg-[var(--input-bg)]/35">
            {VISIBLE_TEMPORAL_FIELD_DEFINITIONS.map((definition) => {
              const currentRef = temporalMappings[definition.key] || {};
              const selectedSheet = getWorkbookSheet(workbookModel, currentRef.sheetName) || getWorkbookSheet(workbookModel, workbookMapping.primarySheetName);
              const headers = selectedSheet?.headers || [];
              return (
                <div
                  key={definition.key}
                  className="grid grid-cols-[minmax(8rem,0.75fr)_minmax(11rem,1fr)_minmax(11rem,1fr)] gap-3 px-4 py-4 text-sm"
                >
                  <div className="min-w-0">
                    <div className="font-semibold text-[var(--panel-card-text)]">{definition.label || definition.key}</div>
                    <div className="mt-1 text-[11px] font-normal uppercase tracking-[0.08em] text-[var(--panel-card-muted-text)]">{definition.key}</div>
                  </div>
                  <div className="peridot-mapping-choice-cell min-w-0">
                    <select
                      value={currentRef.sheetName || ''}
                      onChange={(event) => onChange(definition.key, makeWorkbookColumnRef(event.target.value, ''))}
                      className={SOURCE_SELECT_CLASS}
                    >
                      <option value="">Unassigned</option>
                      {usableSheets.map((sheet) => (
                        <option key={sheet.sheetName} value={sheet.sheetName}>{sheet.sheetName}</option>
                      ))}
                    </select>
                  </div>
                  <div className="peridot-mapping-choice-cell min-w-0">
                    <select
                      value={currentRef.columnName || ''}
                      disabled={!currentRef.sheetName}
                      onChange={(event) => onChange(definition.key, makeWorkbookColumnRef(currentRef.sheetName, event.target.value))}
                      className={DISABLED_SOURCE_SELECT_CLASS}
                    >
                      <option value="">Unassigned</option>
                      {headers.map((header) => (
                        <option key={header} value={header}>{header}</option>
                      ))}
                    </select>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <TemporalUsagePanel />
      </div>
    </div>
  );
}

/*
 * Renders workbook role mappings for caller-supplied role definitions. This is
 * the workbook counterpart to `CoreRoleMappingTable`: every mapping value is a
 * workbook column ref, and the modal remains responsible for updating the
 * workbook mapping state when a selection changes.
 */
export function WorkbookCoreRoleMappingTable({ title, description, guidanceLabel, guidanceText, definitions, workbookModel, workbookMapping, onChange }) {
  const usableSheets = getUsableWorkbookSheets(workbookModel);
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
              <th className="px-4 py-3">Sheet</th>
              <th className="px-4 py-3">Column</th>
              <th className="px-4 py-3">Used for</th>
            </tr>
          </thead>
          <tbody className="text-[var(--panel-card-muted-text)]">
            {definitions.map((definition) => {
              const currentRef = coreMappings[definition.key] || {};
              const selectedSheet = getWorkbookSheet(workbookModel, currentRef.sheetName) || getWorkbookSheet(workbookModel, workbookMapping.primarySheetName);
              const headers = selectedSheet?.headers || [];
              return (
                <tr key={definition.key} className="border-t border-[var(--panel-card-border)] align-top">
                  <td className="px-4 py-3">
                    <RoleCell definition={definition} />
                  </td>
                  <td className="peridot-mapping-choice-cell px-4 py-3">
                    <select
                      value={currentRef.sheetName || ''}
                      onChange={(event) => onChange(definition.key, makeWorkbookColumnRef(event.target.value, ''))}
                      className={SOURCE_SELECT_CLASS}
                    >
                      <option value="">Unassigned</option>
                      {usableSheets.map((sheet) => (
                        <option key={sheet.sheetName} value={sheet.sheetName}>{sheet.sheetName}</option>
                      ))}
                    </select>
                  </td>
                  <td className="peridot-mapping-choice-cell px-4 py-3">
                    <select
                      value={currentRef.columnName || ''}
                      disabled={!currentRef.sheetName}
                      onChange={(event) => onChange(definition.key, makeWorkbookColumnRef(currentRef.sheetName, event.target.value))}
                      className={DISABLED_SOURCE_SELECT_CLASS}
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
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
