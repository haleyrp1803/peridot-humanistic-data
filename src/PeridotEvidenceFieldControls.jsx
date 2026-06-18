/*
 * Evidence-field controls for the role-based column/workbook mapping modal.
 *
 * `PeridotColumnMappingModal.jsx` owns mapping state and import behavior. This
 * component file owns the repeated evidence/analysis field UI: Include/Ignore
 * choices, display-label editing, analytics-readiness labels, and workbook
 * sheet grouping. Keeping the evidence controls here makes the large modal
 * easier to read without changing the data model.
 *
 * Maintenance relationship:
 * - Include/Ignore values come from `peridotColumnMapping.js`.
 * - Workbook selections use `makeWorkbookColumnRef` from
 *   `peridotWorkbookMapping.js` so they remain compatible with workbook row
 *   assembly and joined-sheet evidence fields.
 * - All mutations are reported through callback props. This file stores no
 *   local React state and performs no import/application side effects.
 */

import React from 'react';
import { CUSTOM_INSPECTOR_FIELD_DEFAULTS } from './peridotColumnMapping.js';
import { makeWorkbookColumnRef } from './peridotWorkbookMapping.js';

function normalizeAction(value) {
  return value === CUSTOM_INSPECTOR_FIELD_DEFAULTS.ignore
    ? CUSTOM_INSPECTOR_FIELD_DEFAULTS.ignore
    : CUSTOM_INSPECTOR_FIELD_DEFAULTS.include;
}

/*
 * Two-checkbox control used instead of a dropdown so researchers can see the
 * Include/Ignore decision directly. The pair is intentionally mutually
 * exclusive: checking Include unchecks Ignore and vice versa.
 */
function IncludeIgnoreCheckboxPair({ action, disabled = false, onChange }) {
  const resolvedAction = disabled ? CUSTOM_INSPECTOR_FIELD_DEFAULTS.ignore : normalizeAction(action);
  const isIncluded = resolvedAction === CUSTOM_INSPECTOR_FIELD_DEFAULTS.include;
  const isIgnored = resolvedAction === CUSTOM_INSPECTOR_FIELD_DEFAULTS.ignore;

  return (
    <div className="peridot-mapping-evidence-toggle" aria-label="Evidence field inclusion">
      <label className={['peridot-mapping-evidence-choice', isIncluded ? 'peridot-mapping-evidence-choice-active' : '', disabled ? 'peridot-mapping-evidence-choice-disabled' : ''].filter(Boolean).join(' ')}>
        <input
          type="checkbox"
          checked={isIncluded}
          disabled={disabled}
          onChange={(event) => onChange(
            event.target.checked
              ? CUSTOM_INSPECTOR_FIELD_DEFAULTS.include
              : CUSTOM_INSPECTOR_FIELD_DEFAULTS.ignore,
          )}
        />
        <span>Include</span>
      </label>
      <label className={['peridot-mapping-evidence-choice', isIgnored ? 'peridot-mapping-evidence-choice-active' : '', disabled ? 'peridot-mapping-evidence-choice-disabled' : ''].filter(Boolean).join(' ')}>
        <input
          type="checkbox"
          checked={isIgnored}
          disabled={disabled}
          onChange={(event) => onChange(
            event.target.checked
              ? CUSTOM_INSPECTOR_FIELD_DEFAULTS.ignore
              : CUSTOM_INSPECTOR_FIELD_DEFAULTS.include,
          )}
        />
        <span>Ignore</span>
      </label>
    </div>
  );
}

/*
 * Stable key helper shared by the modal's workbook evidence-refresh logic.
 * It identifies a candidate evidence column by sheet and column, not by display
 * label, so label edits do not break persistence across workbook step changes.
 */
export function makeWorkbookSelectionKey(selection = {}) {
  const ref = selection.sourceRef || makeWorkbookColumnRef(selection.sheetName, selection.sourceColumn);
  return `${ref.sheetName || selection.sheetName || ''}::${ref.columnName || selection.sourceColumn || selection.key || selection.label || ''}`;
}

export function getWorkbookSelectionRef(selection = {}) {
  return selection.sourceRef || makeWorkbookColumnRef(selection.sheetName, selection.sourceColumn || selection.key || selection.label);
}

export function buildWorkbookSelectionLabel(selection = {}, primarySheetName = '') {
  const sheetName = selection.sheetName || selection.sourceRef?.sheetName || '';
  const baseLabel = selection.label || selection.sourceColumn || selection.key || selection.sourceRef?.columnName || '';
  if (!sheetName || sheetName === primarySheetName) return baseLabel;
  return `${sheetName} — ${baseLabel}`;
}

/*
 * Single-table evidence selector. Core/visualization role columns are shown as
 * automatically ignored so users do not accidentally duplicate a field as both
 * a structural role and a custom Inspector/evidence field.
 */
export function InspectorFieldsStep({ selections, coreMapping, onActionChange, onLabelChange }) {
  const mappedCoreColumns = new Set(Object.values(coreMapping || {}).filter(Boolean));

  return (
    <div className="space-y-4">
      <div className="peridot-mapping-intro-card rounded-2xl border border-[var(--panel-card-border)] bg-[var(--stat-card-bg)] p-4 text-sm leading-relaxed text-[var(--panel-card-muted-text)]">
        Choose extra fields to preserve in dossiers, search, charts, filters, and export. Structural role columns are ignored here to avoid duplicates.
      </div>

      <div className="peridot-mapping-table-wrap overflow-x-auto rounded-2xl border border-[var(--panel-card-border)]">
        <table className="min-w-full border-collapse text-left text-sm">
          <thead className="bg-[var(--stat-card-bg)] text-[var(--panel-card-text)]">
            <tr>
              <th className="px-4 py-3">Uploaded column</th>
              <th className="px-4 py-3">Use as evidence?</th>
              <th className="px-4 py-3">Display label</th>
              <th className="px-4 py-3">Chart/filter readiness</th>
            </tr>
          </thead>
          <tbody className="text-[var(--panel-card-muted-text)]">
            {selections.map((selection, index) => {
              const isMappedCore = mappedCoreColumns.has(selection.sourceColumn);
              const action = isMappedCore ? CUSTOM_INSPECTOR_FIELD_DEFAULTS.ignore : normalizeAction(selection.action);
              return (
                <tr key={`${selection.sourceColumn}-${index}`} className="border-t border-[var(--panel-card-border)] align-top">
                  <td className="px-4 py-3 font-semibold text-[var(--panel-card-text)]">
                    {selection.sourceColumn}
                    {isMappedCore ? <div className="mt-1 text-xs font-normal text-[var(--panel-card-muted-text)]">Already mapped to a visualization role.</div> : null}
                  </td>
                  <td className="px-4 py-3">
                    <IncludeIgnoreCheckboxPair
                      action={action}
                      disabled={isMappedCore}
                      onChange={(nextAction) => onActionChange(index, nextAction)}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="text"
                      value={selection.label || selection.sourceColumn}
                      onChange={(event) => onLabelChange(index, event.target.value)}
                      className="peridot-mapping-input w-full min-w-[12rem] rounded-xl border border-[var(--input-border)] bg-[var(--input-bg)] px-3 py-2 text-[var(--input-text)]"
                    />
                  </td>
                  <td className="px-4 py-3"><span className={'peridot-mapping-readiness-badge'}>{selection.analyticsEligible ? 'Likely chart/filter field' : 'Evidence only'}</span></td>
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
 * Workbook evidence selector. Candidates are grouped by sheet because workbook
 * imports may preserve fields from the primary sheet and any joined sheets. This
 * component intentionally does not manage joins; it only renders whatever
 * selections the modal has already computed from the workbook mapping state.
 */
export function WorkbookInspectorFieldsStep({ workbookMapping, selections, onActionChange, onLabelChange }) {
  const mappedCoreRefs = new Set(
    [...Object.values(workbookMapping.coreMappings || {}), ...Object.values(workbookMapping.temporalMappings || {})]
      .filter((ref) => ref?.sheetName && ref?.columnName)
      .map((ref) => `${ref.sheetName}::${ref.columnName}`)
  );

  const groupedSelections = selections.reduce((groups, selection, index) => {
    const ref = getWorkbookSelectionRef(selection);
    const sheetName = ref.sheetName || selection.sheetName || workbookMapping.primarySheetName || 'Workbook';
    if (!groups.has(sheetName)) groups.set(sheetName, []);
    groups.get(sheetName).push({ selection, index, ref });
    return groups;
  }, new Map());

  return (
    <div className="space-y-4">
      <div className="peridot-mapping-intro-card rounded-2xl border border-[var(--panel-card-border)] bg-[var(--stat-card-bg)] p-4 text-sm leading-relaxed text-[var(--panel-card-muted-text)]">
        Choose extra workbook fields to preserve in dossiers, search, charts, filters, and export. Structural role columns are ignored here to avoid duplicates.
      </div>

      {Array.from(groupedSelections.entries()).map(([sheetName, sheetSelections]) => (
        <div key={sheetName} className="peridot-mapping-table-wrap overflow-x-auto rounded-2xl border border-[var(--panel-card-border)]">
          <div className="border-b border-[var(--panel-card-border)] bg-[var(--stat-card-bg)] px-4 py-3">
            <div className="font-semibold text-[var(--panel-card-text)]">{sheetName}</div>
            <div className="mt-1 text-xs text-[var(--panel-card-muted-text)]">
              {sheetName === workbookMapping.primarySheetName ? 'Primary record sheet' : 'Joined sheet'}
            </div>
          </div>
          <table className="min-w-full border-collapse text-left text-sm">
            <thead className="bg-[var(--section-bg)] text-[var(--panel-card-text)]">
              <tr>
                <th className="px-4 py-3">Workbook column</th>
                <th className="px-4 py-3">Use as evidence?</th>
                <th className="px-4 py-3">Display label</th>
                <th className="px-4 py-3">Chart/filter readiness</th>
              </tr>
            </thead>
            <tbody className="text-[var(--panel-card-muted-text)]">
              {sheetSelections.map(({ selection, index, ref }) => {
                const refKey = `${ref.sheetName}::${ref.columnName}`;
                const isMappedCore = mappedCoreRefs.has(refKey);
                const action = isMappedCore ? CUSTOM_INSPECTOR_FIELD_DEFAULTS.ignore : normalizeAction(selection.action);
                return (
                  <tr key={`${refKey}-${index}`} className="border-t border-[var(--panel-card-border)] align-top">
                    <td className="px-4 py-3 font-semibold text-[var(--panel-card-text)]">
                      {ref.columnName || selection.sourceColumn}
                      {isMappedCore ? <div className="mt-1 text-xs font-normal text-[var(--panel-card-muted-text)]">Already mapped to a visualization role.</div> : null}
                    </td>
                    <td className="px-4 py-3">
                      <IncludeIgnoreCheckboxPair
                        action={action}
                        disabled={isMappedCore}
                        onChange={(nextAction) => onActionChange(index, nextAction)}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="text"
                        value={selection.label || buildWorkbookSelectionLabel(selection, workbookMapping.primarySheetName)}
                        onChange={(event) => onLabelChange(index, event.target.value)}
                        className="peridot-mapping-input w-full min-w-[12rem] rounded-xl border border-[var(--input-border)] bg-[var(--input-bg)] px-3 py-2 text-[var(--input-text)]"
                      />
                    </td>
                    <td className="px-4 py-3"><span className={'peridot-mapping-readiness-badge'}>{selection.analyticsEligible ? 'Likely chart/filter field' : 'Evidence only'}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ))}

      {!selections.length ? (
        <div className="rounded-2xl border border-[var(--panel-card-border)] bg-[var(--stat-card-bg)] p-4 text-sm text-[var(--panel-card-muted-text)]">
          No evidence or analysis field candidates are available from the configured workbook sheets.
        </div>
      ) : null}
    </div>
  );
}
