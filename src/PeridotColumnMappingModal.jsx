import React, { useEffect, useMemo, useState } from 'react';
import { PERIDOT_TEMPLATE_COLUMNS } from './peridotCsvSchema.js';
import { buildPeridotCsvValidationSummary } from './peridotCsvValidation.js';
import {
  applyPeridotColumnMapping,
  CUSTOM_INSPECTOR_FIELD_DEFAULTS,
  PERIDOT_CORE_FIELD_DEFINITIONS,
  validatePeridotColumnMapping,
} from './peridotColumnMapping.js';
import {
  buildWorkbookCustomFieldSelectionsForSheet,
  getUsableWorkbookSheets,
  getWorkbookMappingSummary,
  getWorkbookSheet,
  makeWorkbookColumnRef,
  previewWorkbookCoreMappedRows,
  suggestWorkbookCoreMappings,
  validatePeridotWorkbookMapping,
} from './peridotWorkbookMapping.js';

const SINGLE_TABLE_STEP_KEYS = ['preview', 'core', 'inspector', 'review'];
const WORKBOOK_STEP_KEYS = ['workbook-preview', 'workbook-setup', 'workbook-core', 'workbook-review'];

function buttonClassName({ active = false, variant = 'secondary' } = {}) {
  const base = 'rounded-xl px-3 py-2 text-sm font-medium transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/40 focus:ring-offset-2 focus:ring-offset-[var(--shell-bg)]';
  const variants = {
    primary: 'border border-[var(--button-primary-border)] bg-[var(--button-primary-bg)] text-[var(--button-primary-text)] hover:bg-[var(--button-primary-hover)] shadow-[0_8px_18px_rgba(0,0,0,0.28)] disabled:cursor-not-allowed disabled:opacity-50',
    secondary: 'border border-[var(--button-secondary-border)] bg-[var(--button-secondary-bg)] text-[var(--button-secondary-text)] hover:bg-[var(--button-secondary-hover)] disabled:cursor-not-allowed disabled:opacity-50',
    ghost: 'bg-transparent text-[var(--muted-text)] hover:bg-[var(--ghost-hover)] hover:text-[var(--text-main)]',
    danger: 'border border-red-400/60 bg-red-950/50 text-red-100 hover:bg-red-900/60',
  };

  if (active) {
    return `${base} border border-[var(--button-primary-active-border)] bg-[var(--button-primary-active-bg)] text-[var(--button-primary-text)] shadow-[0_10px_22px_rgba(0,0,0,0.3)] hover:bg-[var(--button-primary-active-hover)]`;
  }
  return `${base} ${variants[variant] || variants.secondary}`;
}

function normalizeAction(value) {
  return value === CUSTOM_INSPECTOR_FIELD_DEFAULTS.include
    ? CUSTOM_INSPECTOR_FIELD_DEFAULTS.include
    : CUSTOM_INSPECTOR_FIELD_DEFAULTS.ignore;
}

function StepButton({ active, label, index, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'rounded-2xl border px-4 py-3 text-left transition-all duration-150',
        active
          ? 'border-[var(--button-primary-active-border)] bg-[var(--button-primary-active-bg)] text-[var(--button-primary-text)] shadow-[0_10px_22px_rgba(0,0,0,0.26)]'
          : 'border-[var(--panel-card-border)] bg-[var(--stat-card-bg)] text-[var(--panel-card-muted-text)] hover:bg-[var(--button-secondary-hover)] hover:text-[var(--panel-card-text)]',
      ].join(' ')}
    >
      <div className="text-[11px] font-semibold uppercase tracking-[0.14em] opacity-80">Step {index + 1}</div>
      <div className="mt-1 text-sm font-semibold">{label}</div>
    </button>
  );
}

function PreviewTable({ rows = [], headers = [], maxRows = 5 }) {
  const displayHeaders = headers.slice(0, 8);
  const displayRows = rows.slice(0, maxRows);

  if (!displayRows.length || !displayHeaders.length) {
    return (
      <div className="rounded-2xl border border-[var(--panel-card-border)] bg-[var(--stat-card-bg)] p-4 text-sm text-[var(--panel-card-muted-text)]">
        No preview rows available.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-[var(--panel-card-border)]">
      <table className="min-w-full border-collapse text-left text-xs text-[var(--panel-card-muted-text)]">
        <thead className="bg-[var(--stat-card-bg)] text-[var(--panel-card-text)]">
          <tr>
            {displayHeaders.map((header) => (
              <th key={header} className="max-w-[14rem] truncate px-3 py-2 font-semibold">{header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {displayRows.map((row, rowIndex) => (
            <tr key={`preview-${rowIndex}`} className="border-t border-[var(--panel-card-border)]">
              {displayHeaders.map((header) => (
                <td key={`${rowIndex}-${header}`} className="max-w-[14rem] truncate px-3 py-2">{row?.[header]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {headers.length > displayHeaders.length ? (
        <div className="border-t border-[var(--panel-card-border)] bg-[var(--stat-card-bg)] px-3 py-2 text-xs text-[var(--panel-card-muted-text)]">
          Showing {displayHeaders.length} of {headers.length} columns.
        </div>
      ) : null}
    </div>
  );
}

function CoreMappingStep({ definitions, headers, coreMapping, onChange }) {
  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-[var(--panel-card-border)] bg-[var(--stat-card-bg)] p-4 text-sm leading-relaxed text-[var(--panel-card-muted-text)]">
        Map each core Peridot variable to one uploaded column. Fields may be left unassigned if the data is not available.
      </div>

      <div className="overflow-x-auto rounded-2xl border border-[var(--panel-card-border)]">
        <table className="min-w-full border-collapse text-left text-sm">
          <thead className="bg-[var(--stat-card-bg)] text-[var(--panel-card-text)]">
            <tr>
              <th className="px-4 py-3">Peridot variable</th>
              <th className="px-4 py-3">Description</th>
              <th className="px-4 py-3">Used for</th>
              <th className="px-4 py-3">Common names</th>
              <th className="px-4 py-3">Your column</th>
            </tr>
          </thead>
          <tbody className="text-[var(--panel-card-muted-text)]">
            {definitions.map((definition) => (
              <tr key={definition.key} className="border-t border-[var(--panel-card-border)] align-top">
                <td className="px-4 py-3 font-semibold text-[var(--panel-card-text)]">{definition.key}</td>
                <td className="max-w-[18rem] px-4 py-3 leading-relaxed">{definition.description}</td>
                <td className="max-w-[14rem] px-4 py-3">{(definition.usedFor || []).join(', ')}</td>
                <td className="max-w-[16rem] px-4 py-3">{(definition.commonNames || []).slice(0, 6).join(', ')}</td>
                <td className="px-4 py-3">
                  <select
                    value={coreMapping[definition.key] || ''}
                    onChange={(event) => onChange(definition.key, event.target.value)}
                    className="w-full min-w-[12rem] rounded-xl border border-[var(--input-border)] bg-[var(--input-bg)] px-3 py-2 text-[var(--input-text)]"
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

function InspectorFieldsStep({ selections, coreMapping, onActionChange, onLabelChange }) {
  const mappedCoreColumns = new Set(Object.values(coreMapping || {}).filter(Boolean));

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-[var(--panel-card-border)] bg-[var(--stat-card-bg)] p-4 text-sm leading-relaxed text-[var(--panel-card-muted-text)]">
        Choose which remaining uploaded columns should appear as custom Inspector metadata. Selected categorical fields may also become Analytics variables when usable.
      </div>

      <div className="overflow-x-auto rounded-2xl border border-[var(--panel-card-border)]">
        <table className="min-w-full border-collapse text-left text-sm">
          <thead className="bg-[var(--stat-card-bg)] text-[var(--panel-card-text)]">
            <tr>
              <th className="px-4 py-3">Uploaded column</th>
              <th className="px-4 py-3">Display in Inspector?</th>
              <th className="px-4 py-3">Display label</th>
              <th className="px-4 py-3">Analytics</th>
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
                    {isMappedCore ? <div className="mt-1 text-xs font-normal text-[var(--panel-card-muted-text)]">Mapped as a core Peridot field.</div> : null}
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={action}
                      disabled={isMappedCore}
                      onChange={(event) => onActionChange(index, event.target.value)}
                      className="rounded-xl border border-[var(--input-border)] bg-[var(--input-bg)] px-3 py-2 text-[var(--input-text)] disabled:opacity-60"
                    >
                      <option value={CUSTOM_INSPECTOR_FIELD_DEFAULTS.include}>Include</option>
                      <option value={CUSTOM_INSPECTOR_FIELD_DEFAULTS.ignore}>Ignore</option>
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="text"
                      value={selection.label || selection.sourceColumn}
                      onChange={(event) => onLabelChange(index, event.target.value)}
                      className="w-full min-w-[12rem] rounded-xl border border-[var(--input-border)] bg-[var(--input-bg)] px-3 py-2 text-[var(--input-text)]"
                    />
                  </td>
                  <td className="px-4 py-3">{selection.analyticsEligible ? 'Likely usable' : 'Probably not categorical'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ReviewStep({ validation, summary, mappedPreviewRows, headers }) {
  const warnings = summary?.warnings || [];

  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-4">
        <div className="rounded-2xl border border-[var(--panel-card-border)] bg-[var(--stat-card-bg)] p-4">
          <div className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted-text)]">Accepted</div>
          <div className="mt-1 text-2xl font-bold text-[var(--panel-card-text)]">{summary?.acceptedRecordCount ?? 0}</div>
        </div>
        <div className="rounded-2xl border border-[var(--panel-card-border)] bg-[var(--stat-card-bg)] p-4">
          <div className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted-text)]">Map-ready</div>
          <div className="mt-1 text-2xl font-bold text-[var(--panel-card-text)]">{summary?.capabilityCounts?.mapReady ?? 0}</div>
        </div>
        <div className="rounded-2xl border border-[var(--panel-card-border)] bg-[var(--stat-card-bg)] p-4">
          <div className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted-text)]">Timeline-ready</div>
          <div className="mt-1 text-2xl font-bold text-[var(--panel-card-text)]">{summary?.capabilityCounts?.timelineReady ?? 0}</div>
        </div>
        <div className="rounded-2xl border border-[var(--panel-card-border)] bg-[var(--stat-card-bg)] p-4">
          <div className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted-text)]">Warnings</div>
          <div className="mt-1 text-2xl font-bold text-[var(--panel-card-text)]">{warnings.length}</div>
        </div>
      </div>

      {!validation?.isValid ? (
        <div className="rounded-2xl border border-amber-500/50 bg-amber-950/30 p-4 text-sm text-amber-100">
          <div className="font-semibold">Mapping issues</div>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            {(validation?.issues || []).map((issue) => (
              <li key={`${issue.code}-${issue.field || issue.sourceColumn}`}>{issue.message}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {warnings.length ? (
        <div className="rounded-2xl border border-[var(--panel-card-border)] bg-[var(--section-bg)] p-4">
          <div className="font-semibold text-[var(--panel-card-text)]">Import warning preview</div>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-relaxed text-[var(--panel-card-muted-text)]">
            {warnings.slice(0, 8).map((warning, index) => (
              <li key={`${warning.code || 'warning'}-${index}`}>{warning.message}</li>
            ))}
            {warnings.length > 8 ? <li>{warnings.length - 8} more warnings will be shown after import.</li> : null}
          </ul>
        </div>
      ) : (
        <div className="rounded-2xl border border-[var(--panel-card-border)] bg-[var(--stat-card-bg)] p-4 text-sm text-[var(--panel-card-muted-text)]">
          No mapping warnings detected in the staged data.
        </div>
      )}

      <div>
        <div className="mb-2 text-sm font-semibold text-[var(--panel-card-text)]">Mapped row preview</div>
        <PreviewTable rows={mappedPreviewRows} headers={headers} maxRows={3} />
      </div>
    </div>
  );
}

function WorkbookOverviewStep({ staging, workbookModel, workbookSummary }) {
  const sheetSummaries = workbookSummary?.sheets || staging?.sheets || [];

  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-4">
        <div className="rounded-2xl border border-[var(--panel-card-border)] bg-[var(--stat-card-bg)] p-4">
          <div className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted-text)]">Workbook</div>
          <div className="mt-1 truncate text-lg font-bold text-[var(--panel-card-text)]">{staging.fileLabel}</div>
        </div>
        <div className="rounded-2xl border border-[var(--panel-card-border)] bg-[var(--stat-card-bg)] p-4">
          <div className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted-text)]">Sheets</div>
          <div className="mt-1 text-2xl font-bold text-[var(--panel-card-text)]">{workbookModel?.sheets?.length || staging.sheetCount || 0}</div>
        </div>
        <div className="rounded-2xl border border-[var(--panel-card-border)] bg-[var(--stat-card-bg)] p-4">
          <div className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted-text)]">Rows</div>
          <div className="mt-1 text-2xl font-bold text-[var(--panel-card-text)]">{workbookSummary?.totalRows ?? staging.rowCount ?? 0}</div>
        </div>
        <div className="rounded-2xl border border-[var(--panel-card-border)] bg-[var(--stat-card-bg)] p-4">
          <div className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted-text)]">Columns</div>
          <div className="mt-1 text-2xl font-bold text-[var(--panel-card-text)]">{workbookSummary?.totalColumns ?? staging.columnCount ?? 0}</div>
        </div>
      </div>

      <div className="rounded-2xl border border-[var(--section-border)] bg-[var(--stat-card-bg)] p-4 text-sm leading-relaxed text-[var(--stat-card-muted-text)]">
        This pass configures a multi-sheet workbook mapping preview only. It does not import workbook data yet. Multi-sheet import will be wired after the primary record sheet, Letter_ID, and Sheet + Column mappings are stable.
      </div>

      <div className="grid gap-3">
        {sheetSummaries.map((sheet) => (
          <div key={sheet.sheetName} className="rounded-2xl border border-[var(--panel-card-border)] bg-[var(--section-bg)] p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="font-semibold text-[var(--panel-card-text)]">{sheet.sheetName}</div>
              <div className="text-sm text-[var(--panel-card-muted-text)]">{sheet.rowCount} rows · {sheet.columnCount} columns</div>
            </div>
            {sheet.headers?.length ? (
              <div className="mt-2 text-sm leading-relaxed text-[var(--panel-card-muted-text)]">
                Headers: {sheet.headers.slice(0, 12).join(', ')}{sheet.headers.length > 12 ? ', …' : ''}
              </div>
            ) : null}
          </div>
        ))}
      </div>

      {workbookSummary?.warnings?.length ? (
        <div className="rounded-2xl border border-amber-500/40 bg-amber-950/25 p-4 text-sm text-amber-100">
          <div className="font-semibold">Workbook notes</div>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            {workbookSummary.warnings.slice(0, 8).map((warning, index) => (
              <li key={`${warning.code || 'warning'}-${index}`}>{warning.sheetName ? `${warning.sheetName}: ` : ''}{warning.message}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

function WorkbookSetupStep({ workbookModel, workbookMapping, onPrimarySheetChange, onLetterIdChange }) {
  const usableSheets = getUsableWorkbookSheets(workbookModel);
  const selectedSheet = getWorkbookSheet(workbookModel, workbookMapping.primarySheetName);
  const headers = selectedSheet?.headers || [];
  const suggestions = workbookMapping.primaryRecordSheetSuggestions || [];

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-[var(--panel-card-border)] bg-[var(--stat-card-bg)] p-4 text-sm leading-relaxed text-[var(--panel-card-muted-text)]">
        Choose the sheet whose rows represent the Peridot records. For multi-sheet letter-level assembly, Peridot requires a true Letter_ID column on the primary sheet.
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="rounded-2xl border border-[var(--panel-card-border)] bg-[var(--section-bg)] p-4">
          <div className="text-sm font-semibold text-[var(--panel-card-text)]">Primary record sheet</div>
          <select
            value={workbookMapping.primarySheetName || ''}
            onChange={(event) => onPrimarySheetChange(event.target.value)}
            className="mt-2 w-full rounded-xl border border-[var(--input-border)] bg-[var(--input-bg)] px-3 py-2 text-[var(--input-text)]"
          >
            {usableSheets.map((sheet) => (
              <option key={sheet.sheetName} value={sheet.sheetName}>
                {sheet.sheetName} — {sheet.rowCount} rows
              </option>
            ))}
          </select>
        </label>

        <label className="rounded-2xl border border-[var(--panel-card-border)] bg-[var(--section-bg)] p-4">
          <div className="text-sm font-semibold text-[var(--panel-card-text)]">Primary Letter_ID column</div>
          <select
            value={workbookMapping.primaryLetterIdColumn || ''}
            onChange={(event) => onLetterIdChange(event.target.value)}
            className="mt-2 w-full rounded-xl border border-[var(--input-border)] bg-[var(--input-bg)] px-3 py-2 text-[var(--input-text)]"
          >
            <option value="">Select a Letter_ID column</option>
            {headers.map((header) => (
              <option key={header} value={header}>{header}</option>
            ))}
          </select>
          <p className="mt-2 text-xs leading-relaxed text-[var(--panel-card-muted-text)]">
            Required for combining letter-level data from more than one sheet. Person/place lookup sheets can later use exact names or place labels as keys.
          </p>
        </label>
      </div>

      {suggestions.length ? (
        <div className="rounded-2xl border border-[var(--panel-card-border)] bg-[var(--section-bg)] p-4">
          <div className="font-semibold text-[var(--panel-card-text)]">Primary sheet suggestions</div>
          <div className="mt-3 grid gap-2">
            {suggestions.slice(0, 5).map((suggestion) => (
              <button
                key={suggestion.sheetName}
                type="button"
                onClick={() => onPrimarySheetChange(suggestion.sheetName)}
                className="flex items-center justify-between rounded-xl border border-[var(--panel-card-border)] bg-[var(--stat-card-bg)] px-3 py-2 text-left text-sm hover:bg-[var(--button-secondary-hover)]"
              >
                <span className="font-medium text-[var(--panel-card-text)]">{suggestion.sheetName}</span>
                <span className="text-[var(--panel-card-muted-text)]">score {suggestion.score} · {suggestion.rowCount} rows</span>
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function WorkbookCoreMappingStep({ workbookModel, workbookMapping, onChange }) {
  const usableSheets = getUsableWorkbookSheets(workbookModel);
  const coreMappings = workbookMapping.coreMappings || {};

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-[var(--panel-card-border)] bg-[var(--stat-card-bg)] p-4 text-sm leading-relaxed text-[var(--panel-card-muted-text)]">
        Map each core Peridot variable from a workbook Sheet + Column pair. Fields can be left unassigned. If a core field comes from a non-primary sheet, a Letter_ID join will be required in a later pass before import.
      </div>

      <div className="overflow-x-auto rounded-2xl border border-[var(--panel-card-border)]">
        <table className="min-w-full border-collapse text-left text-sm">
          <thead className="bg-[var(--stat-card-bg)] text-[var(--panel-card-text)]">
            <tr>
              <th className="px-4 py-3">Peridot variable</th>
              <th className="px-4 py-3">Description</th>
              <th className="px-4 py-3">Used for</th>
              <th className="px-4 py-3">Sheet</th>
              <th className="px-4 py-3">Column</th>
            </tr>
          </thead>
          <tbody className="text-[var(--panel-card-muted-text)]">
            {PERIDOT_CORE_FIELD_DEFINITIONS.map((definition) => {
              const currentRef = coreMappings[definition.key] || {};
              const selectedSheet = getWorkbookSheet(workbookModel, currentRef.sheetName) || getWorkbookSheet(workbookModel, workbookMapping.primarySheetName);
              const headers = selectedSheet?.headers || [];
              return (
                <tr key={definition.key} className="border-t border-[var(--panel-card-border)] align-top">
                  <td className="px-4 py-3 font-semibold text-[var(--panel-card-text)]">{definition.key}</td>
                  <td className="max-w-[18rem] px-4 py-3 leading-relaxed">{definition.description}</td>
                  <td className="max-w-[14rem] px-4 py-3">{(definition.usedFor || []).join(', ')}</td>
                  <td className="px-4 py-3">
                    <select
                      value={currentRef.sheetName || ''}
                      onChange={(event) => onChange(definition.key, makeWorkbookColumnRef(event.target.value, ''))}
                      className="w-full min-w-[12rem] rounded-xl border border-[var(--input-border)] bg-[var(--input-bg)] px-3 py-2 text-[var(--input-text)]"
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
                      className="w-full min-w-[12rem] rounded-xl border border-[var(--input-border)] bg-[var(--input-bg)] px-3 py-2 text-[var(--input-text)] disabled:opacity-60"
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

function WorkbookReviewStep({ workbookModel, workbookMapping, validation, summary, previewRows }) {
  const issues = validation?.issues || [];
  const errors = issues.filter((issue) => issue.severity === 'error');
  const warnings = issues.filter((issue) => issue.severity !== 'error');

  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-4">
        <div className="rounded-2xl border border-[var(--panel-card-border)] bg-[var(--stat-card-bg)] p-4">
          <div className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted-text)]">Primary sheet</div>
          <div className="mt-1 truncate text-lg font-bold text-[var(--panel-card-text)]">{summary.primarySheetName || '—'}</div>
        </div>
        <div className="rounded-2xl border border-[var(--panel-card-border)] bg-[var(--stat-card-bg)] p-4">
          <div className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted-text)]">Letter_ID</div>
          <div className="mt-1 truncate text-lg font-bold text-[var(--panel-card-text)]">{summary.primaryLetterIdColumn || '—'}</div>
        </div>
        <div className="rounded-2xl border border-[var(--panel-card-border)] bg-[var(--stat-card-bg)] p-4">
          <div className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted-text)]">Mapped fields</div>
          <div className="mt-1 text-2xl font-bold text-[var(--panel-card-text)]">{summary.mappedCoreFieldCount}</div>
        </div>
        <div className="rounded-2xl border border-[var(--panel-card-border)] bg-[var(--stat-card-bg)] p-4">
          <div className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted-text)]">Issues</div>
          <div className="mt-1 text-2xl font-bold text-[var(--panel-card-text)]">{summary.errorCount} / {summary.warningCount}</div>
        </div>
      </div>

      <div className="rounded-2xl border border-[var(--section-border)] bg-[var(--stat-card-bg)] p-4 text-sm leading-relaxed text-[var(--stat-card-muted-text)]">
        This is a configuration preview. Confirm import is intentionally disabled for multi-sheet workbooks until Letter_ID assembly is wired in the next pass.
      </div>

      {errors.length ? (
        <div className="rounded-2xl border border-red-500/50 bg-red-950/25 p-4 text-sm text-red-100">
          <div className="font-semibold">Blocking issues before import wiring</div>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            {errors.map((issue, index) => <li key={`${issue.code}-${index}`}>{issue.message}</li>)}
          </ul>
        </div>
      ) : null}

      {warnings.length ? (
        <div className="rounded-2xl border border-amber-500/50 bg-amber-950/25 p-4 text-sm text-amber-100">
          <div className="font-semibold">Warnings and rules</div>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            {warnings.map((issue, index) => <li key={`${issue.code}-${index}`}>{issue.message}</li>)}
          </ul>
        </div>
      ) : null}

      <div>
        <div className="mb-2 text-sm font-semibold text-[var(--panel-card-text)]">Primary-sheet mapping preview</div>
        <PreviewTable rows={previewRows} headers={PERIDOT_TEMPLATE_COLUMNS} maxRows={3} />
      </div>

      <div className="rounded-2xl border border-[var(--panel-card-border)] bg-[var(--section-bg)] p-4">
        <div className="font-semibold text-[var(--panel-card-text)]">Sheets used by core mappings</div>
        <div className="mt-2 text-sm text-[var(--panel-card-muted-text)]">
          {summary.mappedSheets?.length ? summary.mappedSheets.join(', ') : 'No mapped sheets yet.'}
        </div>
      </div>
    </div>
  );
}

export function PeridotColumnMappingModal({
  open,
  staging,
  onClose,
  onSaveMapping,
  onConfirmImport,
}) {
  const mappingState = staging?.mappingState || {};
  const isWorkbookMode = staging?.mappingMode === 'workbook' || Boolean(staging?.workbookMappingRequired);
  const workbookModel = staging?.workbookModel || null;
  const workbookSummary = staging?.workbookSummary || null;

  const definitions = mappingState.coreFieldDefinitions || [];
  const headers = staging?.headers || [];
  const rows = staging?.rows || staging?.rawRows || staging?.previewRows || [];
  const previewRows = staging?.previewRows || rows.slice(0, 5);
  const stepKeys = isWorkbookMode ? WORKBOOK_STEP_KEYS : SINGLE_TABLE_STEP_KEYS;

  const [activeStep, setActiveStep] = useState(stepKeys[0]);
  const [coreMapping, setCoreMapping] = useState(mappingState.coreMapping || {});
  const [customFieldSelections, setCustomFieldSelections] = useState(mappingState.customFieldSelections || []);
  const [workbookMapping, setWorkbookMapping] = useState(mappingState);
  const [showCancelConfirmation, setShowCancelConfirmation] = useState(false);

  useEffect(() => {
    if (!open || !staging) return;
    const nextIsWorkbookMode = staging?.mappingMode === 'workbook' || Boolean(staging?.workbookMappingRequired);
    setActiveStep(nextIsWorkbookMode ? WORKBOOK_STEP_KEYS[0] : SINGLE_TABLE_STEP_KEYS[0]);
    setCoreMapping(mappingState.coreMapping || {});
    setCustomFieldSelections(mappingState.customFieldSelections || []);
    setWorkbookMapping(mappingState || {});
    setShowCancelConfirmation(false);
  }, [open, staging?.stagedAt]);

  const effectiveCustomSelections = useMemo(() => {
    const mappedCoreColumns = new Set(Object.values(coreMapping || {}).filter(Boolean));
    return customFieldSelections.map((selection) => (
      mappedCoreColumns.has(selection.sourceColumn)
        ? { ...selection, action: CUSTOM_INSPECTOR_FIELD_DEFAULTS.ignore }
        : selection
    ));
  }, [coreMapping, customFieldSelections]);

  const validation = useMemo(
    () => validatePeridotColumnMapping(headers, {
      coreMapping,
      customFieldSelections: effectiveCustomSelections,
    }),
    [headers, coreMapping, effectiveCustomSelections]
  );

  const mappedRows = useMemo(
    () => applyPeridotColumnMapping(rows, {
      coreMapping,
      customFieldSelections: effectiveCustomSelections,
    }),
    [rows, coreMapping, effectiveCustomSelections]
  );

  const validationSummary = useMemo(
    () => buildPeridotCsvValidationSummary(mappedRows, PERIDOT_TEMPLATE_COLUMNS),
    [mappedRows]
  );

  const workbookValidation = useMemo(
    () => (isWorkbookMode && workbookModel ? validatePeridotWorkbookMapping(workbookModel, workbookMapping) : null),
    [isWorkbookMode, workbookModel, workbookMapping]
  );

  const workbookMappingSummary = useMemo(
    () => (isWorkbookMode && workbookModel ? getWorkbookMappingSummary(workbookModel, workbookMapping) : null),
    [isWorkbookMode, workbookModel, workbookMapping]
  );

  const workbookMappedPreviewRows = useMemo(
    () => (isWorkbookMode && workbookModel ? previewWorkbookCoreMappedRows(workbookModel, workbookMapping, 5) : []),
    [isWorkbookMode, workbookModel, workbookMapping]
  );

  if (!open || !staging || staging.status !== 'ready') return null;

  const singleStepLabels = {
    preview: 'Upload preview',
    core: 'Map Peridot variables',
    inspector: 'Choose Inspector fields',
    review: 'Review import',
  };

  const workbookStepLabels = {
    'workbook-preview': 'Workbook overview',
    'workbook-setup': 'Record sheet',
    'workbook-core': 'Map Peridot variables',
    'workbook-review': 'Review configuration',
  };

  const stepLabels = isWorkbookMode ? workbookStepLabels : singleStepLabels;
  const activeStepIndex = stepKeys.indexOf(activeStep);

  const handleCoreMappingChange = (field, sourceColumn) => {
    setCoreMapping((current) => ({
      ...current,
      [field]: sourceColumn,
    }));
  };

  const handleWorkbookPrimarySheetChange = (primarySheetName) => {
    const nextCoreMappings = suggestWorkbookCoreMappings(workbookModel, primarySheetName);
    const nextCustomFieldSelections = buildWorkbookCustomFieldSelectionsForSheet(workbookModel, primarySheetName, nextCoreMappings);
    setWorkbookMapping((current) => ({
      ...current,
      primarySheetName,
      primaryLetterIdColumn: '',
      coreMappings: nextCoreMappings,
      customFieldSelections: nextCustomFieldSelections,
    }));
  };

  const handleWorkbookLetterIdChange = (primaryLetterIdColumn) => {
    setWorkbookMapping((current) => ({
      ...current,
      primaryLetterIdColumn,
    }));
  };

  const handleWorkbookCoreMappingChange = (field, ref) => {
    setWorkbookMapping((current) => ({
      ...current,
      coreMappings: {
        ...(current.coreMappings || {}),
        [field]: ref,
      },
    }));
  };

  const handleCustomActionChange = (index, action) => {
    setCustomFieldSelections((current) => current.map((selection, currentIndex) => (
      currentIndex === index
        ? { ...selection, action: normalizeAction(action) }
        : selection
    )));
  };

  const handleCustomLabelChange = (index, label) => {
    setCustomFieldSelections((current) => current.map((selection, currentIndex) => (
      currentIndex === index
        ? { ...selection, label }
        : selection
    )));
  };

  const buildCurrentMappingPayload = () => {
    if (isWorkbookMode) {
      return {
        workbookMappingState: workbookMapping,
        workbookValidation,
        workbookSummary: workbookMappingSummary,
      };
    }

    return {
      coreMapping,
      customFieldSelections: effectiveCustomSelections,
      validationSummary,
    };
  };

  const handleRequestCancel = () => {
    setShowCancelConfirmation(true);
  };

  const handleReturnToWorkspace = () => {
    setShowCancelConfirmation(false);
  };

  const handleConfirmCancel = () => {
    setShowCancelConfirmation(false);
    onClose?.();
  };

  const handleConfirmImport = () => {
    if (isWorkbookMode) return;
    const payload = buildCurrentMappingPayload();
    onSaveMapping?.(payload);
    onConfirmImport?.(payload);
  };

  const goNext = () => {
    const nextIndex = Math.min(stepKeys.length - 1, activeStepIndex + 1);
    setActiveStep(stepKeys[nextIndex]);
  };

  const goBack = () => {
    const nextIndex = Math.max(0, activeStepIndex - 1);
    setActiveStep(stepKeys[nextIndex]);
  };

  const footerHelper = isWorkbookMode
    ? 'This workspace previews multi-sheet workbook configuration only. It does not change the active dataset. Final Letter_ID-based import will be wired in the next pass.'
    : 'Closing keeps the staged file available in Data Inputs but does not change the active dataset. Confirm import replaces the active Peridot dataset with this mapped table.';

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/55 p-4 backdrop-blur-sm">
      <div className="flex max-h-[92vh] w-full max-w-[1180px] flex-col overflow-hidden rounded-[30px] border border-[var(--panel-card-border)] bg-[var(--sidebar-bg)] text-[var(--text-main)] shadow-[0_28px_80px_rgba(0,0,0,0.55)]">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[var(--panel-card-border)] bg-[var(--stat-card-bg)] px-6 py-5">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted-text)]">
              {isWorkbookMode ? 'Workbook mapping workspace' : 'Column mapping workspace'}
            </div>
            <h2 className="[font-family:Georgia,'Palatino_Linotype','Book_Antiqua',Palatino,serif] mt-1 text-2xl font-bold text-[var(--heading-text)]">
              {isWorkbookMode ? 'Configure workbook sheets for Peridot' : 'Map uploaded columns to Peridot'}
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-[var(--panel-card-muted-text)]">
              {staging.fileLabel} staged as {staging.fileType}. This workspace is intentionally outside the left panel so the mapping table has room to be reviewed.
            </p>
          </div>
          <button type="button" onClick={handleRequestCancel} className={buttonClassName({ variant: 'secondary' })}>
            Close
          </button>
        </div>

        <div className="grid gap-4 border-b border-[var(--panel-card-border)] bg-[var(--section-bg)] px-6 py-4 md:grid-cols-4">
          {stepKeys.map((step, index) => (
            <StepButton
              key={step}
              active={activeStep === step}
              label={stepLabels[step]}
              index={index}
              onClick={() => setActiveStep(step)}
            />
          ))}
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
          {!isWorkbookMode && activeStep === 'preview' ? (
            <div className="space-y-4">
              <div className="grid gap-3 md:grid-cols-4">
                <div className="rounded-2xl border border-[var(--panel-card-border)] bg-[var(--stat-card-bg)] p-4">
                  <div className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted-text)]">Format</div>
                  <div className="mt-1 text-xl font-bold text-[var(--panel-card-text)]">{staging.fileType}</div>
                </div>
                <div className="rounded-2xl border border-[var(--panel-card-border)] bg-[var(--stat-card-bg)] p-4">
                  <div className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted-text)]">Rows</div>
                  <div className="mt-1 text-xl font-bold text-[var(--panel-card-text)]">{staging.rowCount}</div>
                </div>
                <div className="rounded-2xl border border-[var(--panel-card-border)] bg-[var(--stat-card-bg)] p-4">
                  <div className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted-text)]">Columns</div>
                  <div className="mt-1 text-xl font-bold text-[var(--panel-card-text)]">{staging.columnCount}</div>
                </div>
                <div className="rounded-2xl border border-[var(--panel-card-border)] bg-[var(--stat-card-bg)] p-4">
                  <div className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted-text)]">Staged</div>
                  <div className="mt-1 text-xl font-bold text-[var(--panel-card-text)]">{staging.stagedAt || '—'}</div>
                </div>
              </div>

              <div className="rounded-2xl border border-[var(--panel-card-border)] bg-[var(--stat-card-bg)] p-4 text-sm leading-relaxed text-[var(--stat-card-muted-text)]">
                <p>{mappingState.formatGuidance?.dates}</p>
                <p className="mt-2">{mappingState.formatGuidance?.coordinates}</p>
              </div>

              <PreviewTable rows={previewRows} headers={headers} />
            </div>
          ) : null}

          {!isWorkbookMode && activeStep === 'core' ? (
            <CoreMappingStep
              definitions={definitions}
              headers={headers}
              coreMapping={coreMapping}
              onChange={handleCoreMappingChange}
            />
          ) : null}

          {!isWorkbookMode && activeStep === 'inspector' ? (
            <InspectorFieldsStep
              selections={customFieldSelections}
              coreMapping={coreMapping}
              onActionChange={handleCustomActionChange}
              onLabelChange={handleCustomLabelChange}
            />
          ) : null}

          {!isWorkbookMode && activeStep === 'review' ? (
            <ReviewStep
              validation={validation}
              summary={validationSummary}
              mappedPreviewRows={mappedRows.slice(0, 5)}
              headers={PERIDOT_TEMPLATE_COLUMNS}
            />
          ) : null}

          {isWorkbookMode && activeStep === 'workbook-preview' ? (
            <WorkbookOverviewStep staging={staging} workbookModel={workbookModel} workbookSummary={workbookSummary} />
          ) : null}

          {isWorkbookMode && activeStep === 'workbook-setup' ? (
            <WorkbookSetupStep
              workbookModel={workbookModel}
              workbookMapping={workbookMapping}
              onPrimarySheetChange={handleWorkbookPrimarySheetChange}
              onLetterIdChange={handleWorkbookLetterIdChange}
            />
          ) : null}

          {isWorkbookMode && activeStep === 'workbook-core' ? (
            <WorkbookCoreMappingStep
              workbookModel={workbookModel}
              workbookMapping={workbookMapping}
              onChange={handleWorkbookCoreMappingChange}
            />
          ) : null}

          {isWorkbookMode && activeStep === 'workbook-review' ? (
            <WorkbookReviewStep
              workbookModel={workbookModel}
              workbookMapping={workbookMapping}
              validation={workbookValidation}
              summary={workbookMappingSummary}
              previewRows={workbookMappedPreviewRows}
            />
          ) : null}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--panel-card-border)] bg-[var(--stat-card-bg)] px-6 py-4">
          <p className="max-w-2xl text-sm text-[var(--panel-card-muted-text)]">{footerHelper}</p>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={goBack} disabled={activeStepIndex <= 0} className={buttonClassName({ variant: 'secondary' })}>
              Back
            </button>
            {activeStepIndex < stepKeys.length - 1 ? (
              <button type="button" onClick={goNext} className={buttonClassName({ variant: 'primary' })}>
                Next
              </button>
            ) : isWorkbookMode ? (
              <button type="button" disabled className={buttonClassName({ variant: 'primary' })}>
                Confirm import coming next
              </button>
            ) : (
              <button type="button" onClick={handleConfirmImport} className={buttonClassName({ variant: 'primary' })}>
                Confirm import
              </button>
            )}
            <button type="button" onClick={handleRequestCancel} className={buttonClassName({ variant: 'secondary' })}>
              Cancel
            </button>
          </div>
        </div>
      </div>

      {showCancelConfirmation ? (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-3xl border border-[var(--panel-card-border)] bg-[var(--sidebar-bg)] p-5 shadow-[0_24px_60px_rgba(0,0,0,0.55)]">
            <h3 className="text-lg font-bold text-[var(--heading-text)]">Are you sure you want to cancel?</h3>
            <p className="mt-2 text-sm leading-relaxed text-[var(--panel-card-muted-text)]">
              The staged file will remain available in Data Inputs, but closing this workspace will not change the active dataset.
            </p>
            <div className="mt-5 flex flex-wrap justify-end gap-2">
              <button type="button" onClick={handleReturnToWorkspace} className={buttonClassName({ variant: 'secondary' })}>
                No, take me back.
              </button>
              <button type="button" onClick={handleConfirmCancel} className={buttonClassName({ variant: 'danger' })}>
                Yes, cancel.
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
