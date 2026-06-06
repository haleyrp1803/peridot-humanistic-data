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
  'w-full min-w-[12rem] rounded-xl border border-[var(--input-border)] bg-[var(--input-bg)] px-3 py-2 text-[var(--input-text)]';

const DISABLED_SOURCE_SELECT_CLASS = `${SOURCE_SELECT_CLASS} disabled:opacity-60`;

/*
 * Renders the single-table temporal role assignments.
 *
 * Unlike the core relationship/place tables, this control knows the fixed
 * temporal role list internally because every single-table import can optionally
 * use the same Date / Date_Start / Date_End / Date_Display roles.
 */
export function TemporalMappingTable({ headers, temporalMapping = {}, onChange, compact = false }) {
  return (
    <div className="rounded-2xl border border-[var(--panel-card-border)] bg-[var(--section-bg)] p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted-text)]">Temporal roles</div>
          <div className="mt-1 text-sm font-semibold text-[var(--panel-card-text)]">Map one date, a start/end interval, or multiple recorded dates.</div>
        </div>
      </div>
      <p className="mt-2 text-xs leading-relaxed text-[var(--panel-card-muted-text)]">
        The single-date role preserves simple record workflows. Date Start and Date End preserve intervals such as sent/received dates, inception/dissolution dates, activity spans, or active date ranges.
      </p>

      <div className="mt-4 overflow-x-auto rounded-xl border border-[var(--panel-card-border)]">
        <table className="min-w-full border-collapse text-left text-sm">
          <thead className="bg-[var(--stat-card-bg)] text-[var(--panel-card-text)]">
            <tr>
              <th className="px-4 py-3">Temporal role</th>
              {!compact ? <th className="px-4 py-3">Description</th> : null}
              <th className="px-4 py-3">Your column</th>
            </tr>
          </thead>
          <tbody className="text-[var(--panel-card-muted-text)]">
            {PERIDOT_TEMPORAL_FIELD_DEFINITIONS.map((definition) => (
              <tr key={definition.key} className="border-t border-[var(--panel-card-border)] align-top">
                <td className="px-4 py-3 font-semibold text-[var(--panel-card-text)]">
                  {definition.label}
                  <div className="mt-1 text-xs font-normal text-[var(--panel-card-muted-text)]">{definition.key}</div>
                </td>
                {!compact ? <td className="max-w-[26rem] px-4 py-3 leading-relaxed">{definition.description}</td> : null}
                <td className="px-4 py-3">
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
 * Renders a single-table mapping table for a caller-supplied set of Peridot
 * role definitions. The modal uses this generic control for relationship,
 * route-place, point-location, and route coordinate-pair sections.
 */
export function CoreRoleMappingTable({ title, description, definitions, headers, coreMapping, onChange }) {
  return (
    <div className="rounded-2xl border border-[var(--panel-card-border)] bg-[var(--section-bg)] p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted-text)]">{title}</div>
          <div className="mt-1 text-sm font-semibold text-[var(--panel-card-text)]">{description}</div>
        </div>
      </div>

      <div className="mt-4 overflow-x-auto rounded-xl border border-[var(--panel-card-border)]">
        <table className="min-w-full border-collapse text-left text-sm">
          <thead className="bg-[var(--stat-card-bg)] text-[var(--panel-card-text)]">
            <tr>
              <th className="px-4 py-3">Field role</th>
              <th className="px-4 py-3">What it does</th>
              <th className="px-4 py-3">Used for</th>
              <th className="px-4 py-3">Your column</th>
            </tr>
          </thead>
          <tbody className="text-[var(--panel-card-muted-text)]">
            {definitions.map((definition) => (
              <tr key={definition.key} className="border-t border-[var(--panel-card-border)] align-top">
                <td className="px-4 py-3 font-semibold text-[var(--panel-card-text)]">
                  {definition.label || definition.key}
                  <div className="mt-1 text-xs font-normal text-[var(--panel-card-muted-text)]">{definition.key}</div>
                </td>
                <td className="max-w-[24rem] px-4 py-3 leading-relaxed">{definition.description}</td>
                <td className="max-w-[14rem] px-4 py-3">{(definition.usedFor || []).join(', ')}</td>
                <td className="px-4 py-3">
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
 * single flat uploaded column name.
 */
export function WorkbookTemporalMappingTable({ workbookModel, workbookMapping, onChange }) {
  const usableSheets = getUsableWorkbookSheets(workbookModel);
  const temporalMappings = workbookMapping.temporalMappings || {};

  return (
    <div className="rounded-2xl border border-[var(--panel-card-border)] bg-[var(--section-bg)] p-4">
      <div className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted-text)]">Temporal roles</div>
      <div className="mt-1 text-sm font-semibold text-[var(--panel-card-text)]">Map one date, a start/end interval, or multiple recorded dates from workbook sheets.</div>
      <p className="mt-2 text-xs leading-relaxed text-[var(--panel-card-muted-text)]">
        Use Date Start and Date End for ranges such as sent/received dates, inception/dissolution dates, active periods, or site lifespans. These roles are preserved separately from the single Date field.
      </p>

      <div className="mt-4 overflow-x-auto rounded-xl border border-[var(--panel-card-border)]">
        <table className="min-w-full border-collapse text-left text-sm">
          <thead className="bg-[var(--stat-card-bg)] text-[var(--panel-card-text)]">
            <tr>
              <th className="px-4 py-3">Temporal role</th>
              <th className="px-4 py-3">Description</th>
              <th className="px-4 py-3">Sheet</th>
              <th className="px-4 py-3">Column</th>
            </tr>
          </thead>
          <tbody className="text-[var(--panel-card-muted-text)]">
            {PERIDOT_TEMPORAL_FIELD_DEFINITIONS.map((definition) => {
              const currentRef = temporalMappings[definition.key] || {};
              const selectedSheet = getWorkbookSheet(workbookModel, currentRef.sheetName) || getWorkbookSheet(workbookModel, workbookMapping.primarySheetName);
              const headers = selectedSheet?.headers || [];
              return (
                <tr key={definition.key} className="border-t border-[var(--panel-card-border)] align-top">
                  <td className="px-4 py-3 font-semibold text-[var(--panel-card-text)]">
                    {definition.label}
                    <div className="mt-1 text-xs font-normal text-[var(--panel-card-muted-text)]">{definition.key}</div>
                  </td>
                  <td className="max-w-[24rem] px-4 py-3 leading-relaxed">{definition.description}</td>
                  <td className="px-4 py-3">
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
                  <td className="px-4 py-3">
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
                </tr>
              );
            })}
          </tbody>
        </table>
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
export function WorkbookCoreRoleMappingTable({ title, description, definitions, workbookModel, workbookMapping, onChange }) {
  const usableSheets = getUsableWorkbookSheets(workbookModel);
  const coreMappings = workbookMapping.coreMappings || {};

  return (
    <div className="rounded-2xl border border-[var(--panel-card-border)] bg-[var(--section-bg)] p-4">
      <div className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted-text)]">{title}</div>
      <div className="mt-1 text-sm font-semibold text-[var(--panel-card-text)]">{description}</div>

      <div className="mt-4 overflow-x-auto rounded-xl border border-[var(--panel-card-border)]">
        <table className="min-w-full border-collapse text-left text-sm">
          <thead className="bg-[var(--stat-card-bg)] text-[var(--panel-card-text)]">
            <tr>
              <th className="px-4 py-3">Field role</th>
              <th className="px-4 py-3">What it does</th>
              <th className="px-4 py-3">Used for</th>
              <th className="px-4 py-3">Sheet</th>
              <th className="px-4 py-3">Column</th>
            </tr>
          </thead>
          <tbody className="text-[var(--panel-card-muted-text)]">
            {definitions.map((definition) => {
              const currentRef = coreMappings[definition.key] || {};
              const selectedSheet = getWorkbookSheet(workbookModel, currentRef.sheetName) || getWorkbookSheet(workbookModel, workbookMapping.primarySheetName);
              const headers = selectedSheet?.headers || [];
              return (
                <tr key={definition.key} className="border-t border-[var(--panel-card-border)] align-top">
                  <td className="px-4 py-3 font-semibold text-[var(--panel-card-text)]">
                    {definition.label || definition.key}
                    <div className="mt-1 text-xs font-normal text-[var(--panel-card-muted-text)]">{definition.key}</div>
                  </td>
                  <td className="max-w-[24rem] px-4 py-3 leading-relaxed">{definition.description}</td>
                  <td className="max-w-[14rem] px-4 py-3">{(definition.usedFor || []).join(', ')}</td>
                  <td className="px-4 py-3">
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
                  <td className="px-4 py-3">
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
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
