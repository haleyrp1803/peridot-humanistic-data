/*
 * Role-based column and workbook mapping workspace.
 * 
 * This large component lets users map arbitrary CSV/TSV/Excel tables into Peridot's internal record model. It supports single-table mapping, workbook primary-sheet selection, user-configured unique-ID joins, field-role mapping, evidence/analysis include/ignore choices, and capability review before import.
 * 
 * Important relationships:
 * - Mapping constants and pure mapping logic live in `peridotColumnMapping.js` and `peridotWorkbookMapping.js`.
 * - Capability summaries come from `peridotDataCapabilityAudit.js`.
 * - `App.jsx` owns the staged upload/workbook state and receives the assembled Peridot rows.
 * 
 * Maintenance cautions:
 * - This file is a major structural pain point because UI flow, validation display, and mapping controls are concentrated here. Prefer extracting step components only in a dedicated structural pass.
 * - Preserve the distinction between correspondence-compatible roles and broader humanistic-data roles.
 */

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
  buildPeridotRowsFromWorkbookMapping,
  buildWorkbookCustomFieldSelectionsForSheet,
  getLetterIdJoinMatchSummary,
  getUsableWorkbookSheets,
  getWorkbookMappingSummary,
  getWorkbookSheet,
  makeLetterIdJoin,
  makeWorkbookColumnRef,
  previewWorkbookCoreMappedRows,
  suggestDefaultLetterIdJoinForSheet,
  suggestSharedLetterIdJoins,
  suggestWorkbookCoreMappings,
  suggestWorkbookPointMappings,
  suggestWorkbookRouteCoordinatePairMappings,
  suggestWorkbookTemporalMappings,
  validatePeridotWorkbookMapping,
} from './peridotWorkbookMapping.js';
import { auditPeridotDataCapabilities } from './peridotDataCapabilityAudit.js';
import {
  CORE_FIELD_GROUPS,
  definitionsForFields,
  formatCapabilityName,
  formatRecordShapeName,
  SINGLE_TABLE_STEP_KEYS,
  WORKBOOK_STEP_KEYS,
} from './peridotColumnMappingUiConfig.js';
import {
  CoreRoleMappingTable,
  RelationshipMappingPanel,
  SpatialMappingPanel,
  TemporalMappingTable,
  WorkbookCoreRoleMappingTable,
  WorkbookRelationshipMappingPanel,
  WorkbookSpatialMappingPanel,
  WorkbookTemporalMappingTable,
} from './PeridotMappingFieldControls.jsx';
import {
  buildWorkbookSelectionLabel,
  getWorkbookSelectionRef,
  InspectorFieldsStep,
  makeWorkbookSelectionKey,
  WorkbookInspectorFieldsStep,
} from './PeridotEvidenceFieldControls.jsx';

function normalizeAction(action) {
  return action === CUSTOM_INSPECTOR_FIELD_DEFAULTS.ignore
    ? CUSTOM_INSPECTOR_FIELD_DEFAULTS.ignore
    : CUSTOM_INSPECTOR_FIELD_DEFAULTS.include;
}

function buttonClassName({ active = false, variant = 'secondary' } = {}) {
  const base = 'rounded-xl px-3 py-2 text-sm font-medium transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/40 focus:ring-offset-2 focus:ring-offset-[var(--shell-bg)]';
  const variants = {
    primary: 'border border-[var(--button-primary-border)] bg-[var(--button-primary-bg)] text-[var(--button-primary-text)] hover:bg-[var(--button-primary-hover)] shadow-[0_8px_18px_var(--peridot-color-rgba-rgba-0-0-0-0-28)] disabled:cursor-not-allowed disabled:opacity-50',
    secondary: 'border border-[var(--button-secondary-border)] bg-[var(--button-secondary-bg)] text-[var(--button-secondary-text)] hover:bg-[var(--button-secondary-hover)] disabled:cursor-not-allowed disabled:opacity-50',
    ghost: 'bg-[transparent] text-[var(--muted-text)] hover:bg-[var(--ghost-hover)] hover:text-[var(--text-main)]',
    danger: 'border border-[var(--peridot-role-status-danger-border)] bg-[var(--peridot-role-status-danger-bg)] text-[var(--peridot-role-status-danger-text)] hover:bg-[var(--peridot-role-status-danger-bg)]',
  };

  if (active) {
    return `${base} border border-[var(--button-primary-active-border)] bg-[var(--button-primary-active-bg)] text-[var(--button-primary-text)] shadow-[0_10px_22px_var(--peridot-color-rgba-rgba-0-0-0-0-3)] hover:bg-[var(--button-primary-active-hover)]`;
  }
  return `${base} ${variants[variant] || variants.secondary}`;
}

function StepButton({ active, label, index, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      className={[
        'peridot-mapping-step-button',
        active ? 'peridot-mapping-step-button-active' : '',
      ].filter(Boolean).join(' ')}
      aria-current={active ? 'step' : undefined}
    >
      <span className="peridot-mapping-step-number">{index + 1}</span>
      <span className="peridot-mapping-step-label">{label}</span>
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
    <div className="peridot-mapping-table-wrap overflow-x-auto rounded-2xl border border-[var(--panel-card-border)]">
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



function CapabilityAuditCard({ audit, note }) {
  const dataset = audit?.dataset;
  if (!dataset) return null;

  const totalRows = dataset.totalRows || 0;
  const counts = dataset.capabilityCounts || {};
  const shapes = Object.entries(dataset.recordShapes || {})
    .filter(([, enabled]) => enabled)
    .map(([shape]) => formatRecordShapeName(shape));
  const capabilityKeys = [
    'inspectorReady',
    'searchReady',
    'pointMapReady',
    'routeMapReady',
    'networkReady',
    'timelineReady',
    'chartReady',
    'exportReady',
  ];
  const numericFields = dataset.analytics?.numericMeasureFields || [];
  const categoricalFields = dataset.analytics?.categoricalFields || [];
  const temporalFields = dataset.analytics?.temporalFields || [];
  const temporalSummary = dataset.temporal || {};
  const temporalRoleFields = temporalSummary.temporalRoleFields || temporalFields;
  const intervalRows = temporalSummary.intervalRows ?? 0;
  const closedRangeRows = temporalSummary.closedRangeRows ?? 0;
  const openStartRows = temporalSummary.openStartRows ?? 0;
  const openEndRows = temporalSummary.openEndRows ?? 0;

  return (
    <div className="peridot-mapping-section-card rounded-2xl border border-[var(--panel-card-border)] bg-[var(--section-bg)] p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted-text)]">Tool availability audit</div>
          <div className="mt-1 text-sm font-semibold text-[var(--panel-card-text)]">
            Which Peridot tools this mapping can support.
          </div>
        </div>
        <div className="rounded-full border border-[var(--panel-card-border)] bg-[var(--stat-card-bg)] px-3 py-1 text-xs font-semibold text-[var(--panel-card-muted-text)]">
          {totalRows} row{totalRows === 1 ? '' : 's'} audited
        </div>
      </div>

      {note ? <p className="mt-3 text-xs leading-relaxed text-[var(--panel-card-muted-text)]">{note}</p> : null}

      <div className="mt-4 grid gap-3 lg:grid-cols-3">
        <div className="rounded-xl border border-[var(--panel-card-border)] bg-[var(--stat-card-bg)] p-3">
          <div className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted-text)]">Detected record shape(s)</div>
          <div className="mt-2 text-sm font-semibold text-[var(--panel-card-text)]">
            {shapes.length ? shapes.join(', ') : 'No dominant shape detected'}
          </div>
        </div>
        <div className="rounded-xl border border-[var(--panel-card-border)] bg-[var(--stat-card-bg)] p-3">
          <div className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted-text)]">Detected fields</div>
          <div className="mt-2 space-y-1 text-xs leading-relaxed text-[var(--panel-card-muted-text)]">
            <div><span className="font-semibold text-[var(--panel-card-text)]">Numeric:</span> {numericFields.length ? numericFields.slice(0, 5).join(', ') : 'none detected'}</div>
            <div><span className="font-semibold text-[var(--panel-card-text)]">Categorical:</span> {categoricalFields.length ? categoricalFields.slice(0, 5).join(', ') : 'none detected'}</div>
            <div><span className="font-semibold text-[var(--panel-card-text)]">Temporal:</span> {temporalFields.length ? temporalFields.slice(0, 5).join(', ') : 'none detected'}</div>
          </div>
        </div>
        <div className="rounded-xl border border-[var(--panel-card-border)] bg-[var(--stat-card-bg)] p-3">
          <div className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted-text)]">Temporal intervals</div>
          <div className="mt-2 space-y-1 text-xs leading-relaxed text-[var(--panel-card-muted-text)]">
            <div><span className="font-semibold text-[var(--panel-card-text)]">Fields:</span> {temporalRoleFields.length ? temporalRoleFields.slice(0, 5).join(', ') : 'none detected'}</div>
            <div><span className="font-semibold text-[var(--panel-card-text)]">Timeline available:</span> {counts.timelineReady ?? 0} of {totalRows}</div>
            <div><span className="font-semibold text-[var(--panel-card-text)]">Intervals:</span> {intervalRows} of {totalRows}</div>
            <div className="text-[11px]">{closedRangeRows} closed range{closedRangeRows === 1 ? '' : 's'} · {openStartRows} start-only · {openEndRows} end-only</div>
          </div>
        </div>
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {capabilityKeys.map((capability) => {
          const count = counts[capability] ?? 0;
          const enabled = count > 0;
          return (
            <div
              key={capability}
              className={[
                'rounded-xl border px-3 py-2 text-sm',
                enabled
                  ? 'border-[var(--button-primary-active-border)] bg-[var(--button-primary-active-bg)] text-[var(--button-primary-text)]'
                  : 'border-[var(--panel-card-border)] bg-[var(--stat-card-bg)] text-[var(--panel-card-muted-text)]',
              ].join(' ')}
            >
              <div className="font-semibold">{formatCapabilityName(capability)}</div>
              <div className="mt-1 text-xs opacity-85">{count} of {totalRows}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}


function MappingIntroCard({ eyebrow, title, children }) {
  return (
    <div className="peridot-mapping-intro-card rounded-2xl border border-[var(--panel-card-border)] bg-[var(--stat-card-bg)] p-3 text-sm leading-relaxed text-[var(--panel-card-muted-text)]">
      <div className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted-text)]">{eyebrow}</div>
      <div className="mt-1 text-sm font-semibold text-[var(--panel-card-text)]">{title}</div>
      {children ? <div className="mt-1 text-xs leading-relaxed">{children}</div> : null}
    </div>
  );
}

function ReviewSummaryStrip({ items = [] }) {
  return (
    <div className="peridot-mapping-review-strip rounded-2xl border border-[var(--panel-card-border)] bg-[var(--stat-card-bg)] px-4 py-3">
      {items.map((item) => (
        <div key={item.label} className="peridot-mapping-review-strip-item">
          <div className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted-text)]">{item.label}</div>
          <div className="mt-1 text-lg font-bold text-[var(--panel-card-text)]">{item.value}</div>
        </div>
      ))}
    </div>
  );
}

function IdentifyRecordsStep({ staging, previewRows, headers }) {
  return (
    <div className="space-y-4">
      <MappingIntroCard eyebrow="Identify records" title="Confirm the table shape before assigning roles.">
        A row may represent a letter, site, event, object, observation, catalogue entry, or other evidence record.
      </MappingIntroCard>

      <div className="grid gap-3 md:grid-cols-3">
        <div className="peridot-mapping-section-card rounded-2xl border border-[var(--panel-card-border)] bg-[var(--section-bg)] p-4">
          <div className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted-text)]">Current file</div>
          <div className="mt-1 text-lg font-bold text-[var(--panel-card-text)]">{staging?.fileLabel || 'Staged data'}</div>
          <div className="mt-1 text-sm text-[var(--panel-card-muted-text)]">{staging?.rowCount || 0} rows · {staging?.columnCount || headers.length || 0} columns</div>
        </div>
        <div className="peridot-mapping-section-card rounded-2xl border border-[var(--panel-card-border)] bg-[var(--section-bg)] p-4">
          <div className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted-text)]">Good candidates</div>
          <div className="mt-2 text-sm leading-relaxed text-[var(--panel-card-muted-text)]">
            Record labels, IDs, source/citation fields, links, titles, notes, and descriptions.
          </div>
        </div>
        <div className="peridot-mapping-section-card rounded-2xl border border-[var(--panel-card-border)] bg-[var(--section-bg)] p-4">
          <div className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted-text)]">Not required</div>
          <div className="mt-2 text-sm leading-relaxed text-[var(--panel-card-muted-text)]">
            Records do not have to contain networks, routes, coordinates, or exact dates to remain useful as evidence.
          </div>
        </div>
      </div>

      <div>
        <div className="mb-2 text-sm font-semibold text-[var(--panel-card-text)]">Record preview</div>
        <PreviewTable rows={previewRows} headers={headers} maxRows={3} />
      </div>
    </div>
  );
}

function TimeMappingStep({ headers, temporalMapping, onTemporalChange }) {
  return (
    <TemporalMappingTable headers={headers} temporalMapping={temporalMapping} onChange={onTemporalChange} />
  );
}

function PlacesMappingStep({ headers, coreMapping, pointMapping, routeCoordinatePairMapping, onRouteChange, onPointChange, onRoutePairChange }) {
  return (
    <SpatialMappingPanel
      headers={headers}
      pointMapping={pointMapping}
      coreMapping={coreMapping}
      routeCoordinatePairMapping={routeCoordinatePairMapping}
      onPointChange={onPointChange}
      onRouteChange={onRouteChange}
      onRoutePairChange={onRoutePairChange}
    />
  );
}

function RelationshipsMappingStep({ headers, coreMapping, relationshipMetadataMapping, onChange, onMetadataChange }) {
  return (
    <RelationshipMappingPanel
      headers={headers}
      coreMapping={coreMapping}
      relationshipMetadataMapping={relationshipMetadataMapping}
      onCoreChange={onChange}
      onMetadataChange={onMetadataChange}
    />
  );
}



function refreshWorkbookCustomSelections({ workbookModel, workbookMapping, previousSelections = [] }) {
  if (!workbookModel || !workbookMapping?.primarySheetName) return [];

  const selectedSheets = [
    workbookMapping.primarySheetName,
    ...(workbookMapping.letterLevelJoins || []).map((join) => join?.to?.sheetName).filter(Boolean),
  ].filter((sheetName, index, all) => sheetName && all.indexOf(sheetName) === index);

  const previousByKey = new Map(
    previousSelections.map((selection) => [makeWorkbookSelectionKey(selection), selection])
  );

  return selectedSheets.flatMap((sheetName) => {
    const suggestedSelections = buildWorkbookCustomFieldSelectionsForSheet(
      workbookModel,
      sheetName,
      workbookMapping.coreMappings || {},
      workbookMapping.temporalMappings || {},
      workbookMapping.pointMappings || {},
      workbookMapping.routeCoordinatePairMappings || {}
    );

    return suggestedSelections.map((selection) => {
      const key = makeWorkbookSelectionKey(selection);
      const previous = previousByKey.get(key);
      const nextSelection = previous
        ? {
            ...selection,
            action: previous.action,
            label: previous.label || selection.label,
            analyticsEligible: selection.analyticsEligible,
          }
        : {
            ...selection,
            label: buildWorkbookSelectionLabel(selection, workbookMapping.primarySheetName),
          };

      return {
        ...nextSelection,
        sheetName,
        sourceRef: selection.sourceRef || makeWorkbookColumnRef(sheetName, selection.sourceColumn),
      };
    });
  });
}


function ReviewStep({ validation, summary, mappedPreviewRows, headers, capabilityAudit }) {
  const warnings = summary?.warnings || [];

  return (
    <div className="space-y-4">
      <ReviewSummaryStrip
        items={[
          { label: 'Accepted records', value: summary?.acceptedRecordCount ?? 0 },
          { label: 'Map available', value: summary?.capabilityCounts?.mapReady ?? 0 },
          { label: 'Timeline available', value: summary?.capabilityCounts?.timelineReady ?? 0 },
          { label: 'Warnings', value: warnings.length },
        ]}
      />

      <CapabilityAuditCard
        audit={capabilityAudit}
        note="This audit is based on the mapped rows Peridot will import if you confirm this table. It explains tool availability but does not block otherwise accepted records."
      />

      {!validation?.isValid ? (
        <div className="rounded-2xl border border-[var(--peridot-role-status-warning-border)] bg-[var(--peridot-role-status-warning-bg)] p-4 text-sm text-[var(--peridot-role-status-warning-text)]">
          <div className="font-semibold">Mapping issues</div>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            {(validation?.issues || []).map((issue) => (
              <li key={`${issue.code}-${issue.field || issue.sourceColumn}`}>{issue.message}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {warnings.length ? (
        <div className="peridot-mapping-section-card rounded-2xl border border-[var(--panel-card-border)] bg-[var(--section-bg)] p-4">
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
        <div className="peridot-mapping-stat-card rounded-2xl border border-[var(--panel-card-border)] bg-[var(--stat-card-bg)] p-4">
          <div className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted-text)]">Workbook</div>
          <div className="mt-1 truncate text-lg font-bold text-[var(--panel-card-text)]">{staging.fileLabel}</div>
        </div>
        <div className="peridot-mapping-stat-card rounded-2xl border border-[var(--panel-card-border)] bg-[var(--stat-card-bg)] p-4">
          <div className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted-text)]">Sheets</div>
          <div className="mt-1 text-2xl font-bold text-[var(--panel-card-text)]">{workbookModel?.sheets?.length || staging.sheetCount || 0}</div>
        </div>
        <div className="peridot-mapping-stat-card rounded-2xl border border-[var(--panel-card-border)] bg-[var(--stat-card-bg)] p-4">
          <div className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted-text)]">Rows</div>
          <div className="mt-1 text-2xl font-bold text-[var(--panel-card-text)]">{workbookSummary?.totalRows ?? staging.rowCount ?? 0}</div>
        </div>
        <div className="peridot-mapping-stat-card rounded-2xl border border-[var(--panel-card-border)] bg-[var(--stat-card-bg)] p-4">
          <div className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted-text)]">Columns</div>
          <div className="mt-1 text-2xl font-bold text-[var(--panel-card-text)]">{workbookSummary?.totalColumns ?? staging.columnCount ?? 0}</div>
        </div>
      </div>

      <div className="rounded-2xl border border-[var(--section-border)] bg-[var(--stat-card-bg)] p-4 text-sm leading-relaxed text-[var(--stat-card-muted-text)]">
        This workspace configures a multi-sheet workbook import. Peridot will use the primary sheet as the record basis and pull mapped core values from joined sheets through the unique-ID joins you configure.
      </div>

      <div className="grid gap-3">
        {sheetSummaries.map((sheet) => (
          <div key={sheet.sheetName} className="peridot-mapping-section-card rounded-2xl border border-[var(--panel-card-border)] bg-[var(--section-bg)] p-4">
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
        <div className="rounded-2xl border border-[var(--peridot-role-status-warning-border)] bg-[var(--peridot-role-status-warning-bg)] p-4 text-sm text-[var(--peridot-role-status-warning-text)]">
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

function WorkbookSetupStep({
  workbookModel,
  workbookMapping,
  onPrimarySheetChange,
  onLetterIdChange,
  onAddJoin,
  onRemoveJoin,
  onJoinSheetChange,
  onJoinPrimaryColumnChange,
  onJoinTargetColumnChange,
}) {
  const usableSheets = getUsableWorkbookSheets(workbookModel);
  const selectedSheet = getWorkbookSheet(workbookModel, workbookMapping.primarySheetName);
  const headers = selectedSheet?.headers || [];
  const suggestions = workbookMapping.primaryRecordSheetSuggestions || [];
  const joins = workbookMapping.letterLevelJoins || [];
  const joinedSheetNames = new Set(joins.map((join) => join?.to?.sheetName).filter(Boolean));
  const availableJoinSheets = usableSheets.filter(
    (sheet) => sheet.sheetName !== workbookMapping.primarySheetName && !joinedSheetNames.has(sheet.sheetName)
  );

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-[var(--panel-card-border)] bg-[var(--stat-card-bg)] p-4 text-sm leading-relaxed text-[var(--panel-card-muted-text)]">
        Choose the sheet whose rows represent the Peridot records. If record-level data is spread across multiple sheets, add each joined sheet and tell Peridot which columns contain the shared unique ID. The ID-column names do not need to match; the values need to match.
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="peridot-mapping-section-card rounded-2xl border border-[var(--panel-card-border)] bg-[var(--section-bg)] p-4">
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

        <label className="peridot-mapping-section-card rounded-2xl border border-[var(--panel-card-border)] bg-[var(--section-bg)] p-4">
          <div className="text-sm font-semibold text-[var(--panel-card-text)]">Primary unique ID column</div>
          <select
            value={workbookMapping.primaryLetterIdColumn || ''}
            onChange={(event) => onLetterIdChange(event.target.value)}
            className="mt-2 w-full rounded-xl border border-[var(--input-border)] bg-[var(--input-bg)] px-3 py-2 text-[var(--input-text)]"
          >
            <option value="">Select a unique ID column</option>
            {headers.map((header) => (
              <option key={header} value={header}>{header}</option>
            ))}
          </select>
          <p className="mt-2 text-xs leading-relaxed text-[var(--panel-card-muted-text)]">
            This can be called Letter_ID, Record Key, Accession Number, or anything else. Peridot uses your selection, not the header name.
          </p>
        </label>
      </div>

      <div className="peridot-mapping-section-card rounded-2xl border border-[var(--panel-card-border)] bg-[var(--section-bg)] p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="font-semibold text-[var(--panel-card-text)]">Join additional sheets by unique ID</div>
            <p className="mt-1 max-w-3xl text-sm leading-relaxed text-[var(--panel-card-muted-text)]">
              Use this when record-level information is spread across more than one sheet. Click Add sheet for each sheet that should be joined to the primary record sheet, then choose the matching ID columns.
            </p>
          </div>
          <button
            type="button"
            onClick={onAddJoin}
            disabled={!workbookMapping.primarySheetName || !availableJoinSheets.length}
            className={buttonClassName({ variant: 'primary' })}
          >
            + Add sheet
          </button>
        </div>

        {joins.length ? (
          <div className="mt-4 space-y-3">
            {joins.map((join, index) => {
              const joinedSheet = getWorkbookSheet(workbookModel, join?.to?.sheetName);
              const joinedHeaders = joinedSheet?.headers || [];
              const matchSummary = getLetterIdJoinMatchSummary(workbookModel, join);
              return (
                <div key={`${join?.to?.sheetName || 'join'}-${index}`} className="peridot-mapping-stat-card rounded-2xl border border-[var(--panel-card-border)] bg-[var(--stat-card-bg)] p-4">
                  <div className="grid gap-3 lg:grid-cols-[1.1fr_1fr_1fr_auto]">
                    <label>
                      <div className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted-text)]">Joined sheet</div>
                      <select
                        value={join?.to?.sheetName || ''}
                        onChange={(event) => onJoinSheetChange(index, event.target.value)}
                        className="mt-1 w-full rounded-xl border border-[var(--input-border)] bg-[var(--input-bg)] px-3 py-2 text-[var(--input-text)]"
                      >
                        <option value="">Select sheet</option>
                        {usableSheets
                          .filter((sheet) => sheet.sheetName !== workbookMapping.primarySheetName)
                          .map((sheet) => (
                            <option key={sheet.sheetName} value={sheet.sheetName}>{sheet.sheetName}</option>
                          ))}
                      </select>
                    </label>

                    <label>
                      <div className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted-text)]">Primary ID column</div>
                      <select
                        value={join?.from?.columnName || ''}
                        onChange={(event) => onJoinPrimaryColumnChange(index, event.target.value)}
                        className="mt-1 w-full rounded-xl border border-[var(--input-border)] bg-[var(--input-bg)] px-3 py-2 text-[var(--input-text)]"
                      >
                        <option value="">Select column</option>
                        {headers.map((header) => (
                          <option key={header} value={header}>{header}</option>
                        ))}
                      </select>
                    </label>

                    <label>
                      <div className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted-text)]">Joined sheet ID column</div>
                      <select
                        value={join?.to?.columnName || ''}
                        onChange={(event) => onJoinTargetColumnChange(index, event.target.value)}
                        disabled={!join?.to?.sheetName}
                        className="mt-1 w-full rounded-xl border border-[var(--input-border)] bg-[var(--input-bg)] px-3 py-2 text-[var(--input-text)] disabled:opacity-60"
                      >
                        <option value="">Select column</option>
                        {joinedHeaders.map((header) => (
                          <option key={header} value={header}>{header}</option>
                        ))}
                      </select>
                    </label>

                    <div className="flex items-end">
                      <button type="button" onClick={() => onRemoveJoin(index)} className={buttonClassName({ variant: 'secondary' })}>
                        Remove
                      </button>
                    </div>
                  </div>
                  <div className="mt-3 rounded-xl border border-[var(--panel-card-border)] bg-[var(--section-bg)] px-3 py-2 text-xs leading-relaxed text-[var(--panel-card-muted-text)]">
                    <span className="font-semibold text-[var(--panel-card-text)]">Match check:</span> {matchSummary.message}
                    {matchSummary.isConfigured ? (
                      <span> Primary blanks: {matchSummary.primaryBlankIdCount}; joined-sheet blanks: {matchSummary.joinedBlankIdCount}; primary duplicate IDs: {matchSummary.primaryDuplicateIdCount}; joined-sheet duplicate IDs: {matchSummary.joinedDuplicateIdCount}.</span>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="mt-4 rounded-xl border border-[var(--panel-card-border)] bg-[var(--stat-card-bg)] px-3 py-2 text-sm text-[var(--panel-card-muted-text)]">
            No joined sheets configured yet. Add sheets here if the workbook stores record-level data across multiple sheets.
          </div>
        )}
      </div>

      {suggestions.length ? (
        <div className="peridot-mapping-section-card rounded-2xl border border-[var(--panel-card-border)] bg-[var(--section-bg)] p-4">
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


function WorkbookIdentifyRecordsStep({ workbookModel, workbookMapping }) {
  const selectedSheet = getWorkbookSheet(workbookModel, workbookMapping.primarySheetName);

  return (
    <div className="space-y-4">
      <MappingIntroCard eyebrow="Identify records" title="Confirm the sheet whose rows become records.">
        Joined sheets may supply additional fields through configured unique-ID matches.
      </MappingIntroCard>

      <div className="grid gap-3 md:grid-cols-3">
        <div className="peridot-mapping-section-card rounded-2xl border border-[var(--panel-card-border)] bg-[var(--section-bg)] p-4">
          <div className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted-text)]">Primary record sheet</div>
          <div className="mt-1 text-lg font-bold text-[var(--panel-card-text)]">{workbookMapping.primarySheetName || '—'}</div>
          <div className="mt-1 text-sm text-[var(--panel-card-muted-text)]">{selectedSheet?.rowCount || 0} rows · {selectedSheet?.columnCount || 0} columns</div>
        </div>
        <div className="peridot-mapping-section-card rounded-2xl border border-[var(--panel-card-border)] bg-[var(--section-bg)] p-4">
          <div className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted-text)]">Joins</div>
          <div className="mt-1 text-lg font-bold text-[var(--panel-card-text)]">{(workbookMapping.letterLevelJoins || []).length}</div>
          <div className="mt-1 text-sm text-[var(--panel-card-muted-text)]">Configured joined sheet(s)</div>
        </div>
        <div className="peridot-mapping-section-card rounded-2xl border border-[var(--panel-card-border)] bg-[var(--section-bg)] p-4">
          <div className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted-text)]">Evidence fields</div>
          <div className="mt-1 text-lg font-bold text-[var(--panel-card-text)]">{(workbookMapping.customFieldSelections || []).length}</div>
          <div className="mt-1 text-sm text-[var(--panel-card-muted-text)]">Candidates preserved in the Evidence step</div>
        </div>
      </div>

      {selectedSheet ? (
        <div>
          <div className="mb-2 text-sm font-semibold text-[var(--panel-card-text)]">Primary-sheet preview</div>
          <PreviewTable rows={selectedSheet.rows || []} headers={selectedSheet.headers || []} maxRows={3} />
        </div>
      ) : null}
    </div>
  );
}

function WorkbookTimeMappingStep({ workbookModel, workbookMapping, onTemporalChange }) {
  return (
    <WorkbookTemporalMappingTable
      workbookModel={workbookModel}
      workbookMapping={workbookMapping}
      onChange={onTemporalChange}
    />
  );
}

function WorkbookPlacesMappingStep({ workbookModel, workbookMapping, onRouteChange, onPointChange, onRoutePairChange }) {
  return (
    <WorkbookSpatialMappingPanel
      workbookModel={workbookModel}
      workbookMapping={workbookMapping}
      onPointChange={onPointChange}
      onRouteChange={onRouteChange}
      onRoutePairChange={onRoutePairChange}
    />
  );
}

function WorkbookRelationshipsMappingStep({ workbookModel, workbookMapping, onChange, onMetadataChange }) {
  return (
    <WorkbookRelationshipMappingPanel
      workbookModel={workbookModel}
      workbookMapping={workbookMapping}
      onCoreChange={onChange}
      onMetadataChange={onMetadataChange}
    />
  );
}
function WorkbookReviewStep({ workbookModel, workbookMapping, validation, summary, previewRows, capabilityAudit }) {
  const issues = validation?.issues || [];
  const errors = issues.filter((issue) => issue.severity === 'error');
  const warnings = issues.filter((issue) => issue.severity !== 'error');
  const selectedCustomFields = (workbookMapping.customFieldSelections || []).filter(
    (selection) => selection?.action === CUSTOM_INSPECTOR_FIELD_DEFAULTS.include
  );

  return (
    <div className="space-y-4">
      <ReviewSummaryStrip
        items={[
          { label: 'Primary sheet', value: summary.primarySheetName || '—' },
          { label: 'Primary ID', value: summary.primaryLetterIdColumn || '—' },
          { label: 'Joined sheets', value: summary.letterLevelJoinCount || 0 },
          { label: 'Issues', value: `${summary.errorCount} / ${summary.warningCount}` },
        ]}
      />

      <div className="rounded-2xl border border-[var(--section-border)] bg-[var(--stat-card-bg)] p-4 text-sm leading-relaxed text-[var(--stat-card-muted-text)]">
        Review the workbook import before confirming. Peridot will assemble records from the primary sheet and configured unique-ID joins, then include selected evidence and analysis fields from the primary sheet and joined sheets.
      </div>

      <CapabilityAuditCard
        audit={capabilityAudit}
        note="This audit is based on the assembled workbook records Peridot will import if you confirm this mapping. It explains tool availability but does not block otherwise accepted records."
      />

      {errors.length ? (
        <div className="rounded-2xl border border-[var(--peridot-role-status-danger-border)] bg-[var(--peridot-role-status-danger-bg)] p-4 text-sm text-[var(--peridot-role-status-danger-text)]">
          <div className="font-semibold">Blocking issues before import</div>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            {errors.map((issue, index) => <li key={`${issue.code}-${index}`}>{issue.message}</li>)}
          </ul>
        </div>
      ) : null}

      {warnings.length ? (
        <div className="rounded-2xl border border-[var(--peridot-role-status-warning-border)] bg-[var(--peridot-role-status-warning-bg)] p-4 text-sm text-[var(--peridot-role-status-warning-text)]">
          <div className="font-semibold">Limits and rules to review</div>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            {warnings.map((issue, index) => <li key={`${issue.code}-${index}`}>{issue.message}</li>)}
          </ul>
        </div>
      ) : null}


      <div className="peridot-mapping-section-card rounded-2xl border border-[var(--panel-card-border)] bg-[var(--section-bg)] p-4">
        <div className="font-semibold text-[var(--panel-card-text)]">Configured unique-ID sheet joins</div>
        {workbookMapping.letterLevelJoins?.length ? (
          <div className="mt-3 space-y-2">
            {workbookMapping.letterLevelJoins.map((join, index) => {
              const matchSummary = getLetterIdJoinMatchSummary(workbookModel, join);
              return (
                <div key={`${join?.to?.sheetName || 'join'}-${index}`} className="rounded-xl border border-[var(--panel-card-border)] bg-[var(--stat-card-bg)] px-3 py-2 text-sm text-[var(--panel-card-muted-text)]">
                  <div className="font-medium text-[var(--panel-card-text)]">
                    {join?.from?.sheetName || 'Primary sheet'}.{join?.from?.columnName || '—'} ↔ {join?.to?.sheetName || 'Joined sheet'}.{join?.to?.columnName || '—'}
                  </div>
                  <div className="mt-1 text-xs">{matchSummary.message}</div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="mt-2 text-sm text-[var(--panel-card-muted-text)]">No joined sheets configured.</p>
        )}
      </div>

      <div>
        <div className="mb-2 text-sm font-semibold text-[var(--panel-card-text)]">Primary-sheet mapping preview</div>
        <PreviewTable rows={previewRows} headers={PERIDOT_TEMPLATE_COLUMNS} maxRows={3} />
      </div>

      <div className="peridot-mapping-section-card rounded-2xl border border-[var(--panel-card-border)] bg-[var(--section-bg)] p-4">
        <div className="font-semibold text-[var(--panel-card-text)]">Sheets used by core mappings</div>
        <div className="mt-2 text-sm text-[var(--panel-card-muted-text)]">
          {summary.mappedSheets?.length ? summary.mappedSheets.join(', ') : 'No mapped sheets yet.'}
        </div>
      </div>

      <div className="peridot-mapping-section-card rounded-2xl border border-[var(--panel-card-border)] bg-[var(--section-bg)] p-4">
        <div className="font-semibold text-[var(--panel-card-text)]">Selected evidence and analysis fields</div>
        {selectedCustomFields.length ? (
          <div className="mt-2 grid gap-2 md:grid-cols-2">
            {selectedCustomFields.slice(0, 12).map((selection, index) => {
              const ref = getWorkbookSelectionRef(selection);
              return (
                <div key={`${ref.sheetName}-${ref.columnName}-${index}`} className="rounded-xl border border-[var(--panel-card-border)] bg-[var(--stat-card-bg)] px-3 py-2 text-sm text-[var(--panel-card-muted-text)]">
                  <div className="font-medium text-[var(--panel-card-text)]">{selection.label || ref.columnName}</div>
                  <div className="mt-1 text-xs">{ref.sheetName}.{ref.columnName}</div>
                </div>
              );
            })}
            {selectedCustomFields.length > 12 ? (
              <div className="rounded-xl border border-[var(--panel-card-border)] bg-[var(--stat-card-bg)] px-3 py-2 text-sm text-[var(--panel-card-muted-text)]">
                {selectedCustomFields.length - 12} more selected field(s).
              </div>
            ) : null}
          </div>
        ) : (
          <p className="mt-2 text-sm text-[var(--panel-card-muted-text)]">No evidence or analysis fields selected.</p>
        )}
      </div>
    </div>
  );
}


const RELATIONSHIP_METADATA_LABELS = Object.freeze({
  Relationship_Type: 'Relationship type',
  Relationship_Label: 'Label/Note',
});

function normalizeRelationshipMetadataMapping(mapping = {}) {
  return Object.freeze({
    Relationship_Type: mapping.Relationship_Type || '',
    Relationship_Label: mapping.Relationship_Label || '',
  });
}

function applyRelationshipMetadataSelections(selections = [], relationshipMetadataMapping = {}) {
  const selectedMetadata = Object.entries(RELATIONSHIP_METADATA_LABELS)
    .map(([field, label]) => ({
      field,
      label,
      sourceColumn: relationshipMetadataMapping?.[field] || '',
    }))
    .filter((item) => item.sourceColumn);

  if (!selectedMetadata.length) return selections;

  const nextSelections = selections.map((selection) => ({ ...selection }));
  selectedMetadata.forEach((metadata) => {
    const existingIndex = nextSelections.findIndex((selection) => selection.sourceColumn === metadata.sourceColumn);
    const nextSelection = {
      sourceColumn: metadata.sourceColumn,
      label: metadata.label,
      action: CUSTOM_INSPECTOR_FIELD_DEFAULTS.include,
      suggested: true,
      analyticsEligible: true,
      reason: 'Selected as relationship metadata.',
    };

    if (existingIndex >= 0) {
      nextSelections[existingIndex] = {
        ...nextSelections[existingIndex],
        ...nextSelection,
      };
    } else {
      nextSelections.push(nextSelection);
    }
  });

  return nextSelections;
}

function normalizeWorkbookRelationshipMetadataMappings(mapping = {}) {
  return Object.freeze({
    Relationship_Type: mapping.Relationship_Type || makeWorkbookColumnRef('', ''),
    Relationship_Label: mapping.Relationship_Label || makeWorkbookColumnRef('', ''),
  });
}

function getWorkbookRelationshipMetadataKey(ref = {}) {
  return `${ref.sheetName || ''}::${ref.columnName || ''}`;
}

function applyWorkbookRelationshipMetadataSelections(selections = [], relationshipMetadataMappings = {}) {
  const selectedMetadata = Object.entries(RELATIONSHIP_METADATA_LABELS)
    .map(([field, label]) => ({
      field,
      label,
      sourceRef: relationshipMetadataMappings?.[field] || makeWorkbookColumnRef('', ''),
    }))
    .filter((item) => item.sourceRef?.sheetName && item.sourceRef?.columnName);

  if (!selectedMetadata.length) return selections;

  const nextSelections = selections.map((selection) => ({ ...selection }));
  selectedMetadata.forEach((metadata) => {
    const metadataKey = getWorkbookRelationshipMetadataKey(metadata.sourceRef);
    const existingIndex = nextSelections.findIndex((selection) => {
      const ref = selection.sourceRef || makeWorkbookColumnRef(selection.sheetName, selection.sourceColumn);
      return getWorkbookRelationshipMetadataKey(ref) === metadataKey;
    });
    const nextSelection = {
      key: metadata.sourceRef.columnName,
      sheetName: metadata.sourceRef.sheetName,
      sourceColumn: metadata.sourceRef.columnName,
      sourceRef: metadata.sourceRef,
      label: metadata.label,
      action: CUSTOM_INSPECTOR_FIELD_DEFAULTS.include,
      suggested: true,
      analyticsEligible: true,
      reason: 'Selected as relationship metadata.',
    };

    if (existingIndex >= 0) {
      nextSelections[existingIndex] = {
        ...nextSelections[existingIndex],
        ...nextSelection,
      };
    } else {
      nextSelections.push(nextSelection);
    }
  });

  return nextSelections;
}

function stripDisplayDateMapping(mapping = {}) {
  return {
    ...(mapping || {}),
    Date_Display: '',
  };
}

function stripWorkbookDisplayDateMapping(workbookMapping = {}) {
  return {
    ...(workbookMapping || {}),
    temporalMappings: {
      ...((workbookMapping || {}).temporalMappings || {}),
      Date_Display: makeWorkbookColumnRef('', ''),
    },
    relationshipMetadataMappings: normalizeWorkbookRelationshipMetadataMappings((workbookMapping || {}).relationshipMetadataMappings || {}),
  };
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
  const [temporalMapping, setTemporalMapping] = useState(stripDisplayDateMapping(mappingState.temporalMapping || {}));
  const [pointMapping, setPointMapping] = useState(mappingState.pointMapping || {});
  const [routeCoordinatePairMapping, setRouteCoordinatePairMapping] = useState(mappingState.routeCoordinatePairMapping || {});
  const [relationshipMetadataMapping, setRelationshipMetadataMapping] = useState(normalizeRelationshipMetadataMapping(mappingState.relationshipMetadataMapping || {}));
  const [customFieldSelections, setCustomFieldSelections] = useState(mappingState.customFieldSelections || []);
  const [workbookMapping, setWorkbookMapping] = useState(stripWorkbookDisplayDateMapping(mappingState));
  const [showCancelConfirmation, setShowCancelConfirmation] = useState(false);

  useEffect(() => {
    if (!open || !staging) return;
    const nextIsWorkbookMode = staging?.mappingMode === 'workbook' || Boolean(staging?.workbookMappingRequired);
    setActiveStep(nextIsWorkbookMode ? WORKBOOK_STEP_KEYS[0] : SINGLE_TABLE_STEP_KEYS[0]);
    setCoreMapping(mappingState.coreMapping || {});
    setTemporalMapping(stripDisplayDateMapping(mappingState.temporalMapping || {}));
    setRelationshipMetadataMapping(normalizeRelationshipMetadataMapping(mappingState.relationshipMetadataMapping || {}));
    setCustomFieldSelections(mappingState.customFieldSelections || []);
    setWorkbookMapping(
      nextIsWorkbookMode && staging?.workbookModel
        ? {
            ...stripWorkbookDisplayDateMapping(mappingState || {}),
            relationshipMetadataMappings: normalizeWorkbookRelationshipMetadataMappings(mappingState.relationshipMetadataMappings || {}),
            customFieldSelections: applyWorkbookRelationshipMetadataSelections(
              refreshWorkbookCustomSelections({
                workbookModel: staging.workbookModel,
                workbookMapping: mappingState || {},
                previousSelections: mappingState.customFieldSelections || [],
              }),
              normalizeWorkbookRelationshipMetadataMappings(mappingState.relationshipMetadataMappings || {})
            ),
          }
        : stripWorkbookDisplayDateMapping(mappingState || {})
    );
    setShowCancelConfirmation(false);
  }, [open, staging?.stagedAt]);

  const effectiveCustomSelections = useMemo(() => {
    const mappedCoreColumns = new Set([
      ...Object.values(coreMapping || {}),
      ...Object.values(stripDisplayDateMapping(temporalMapping || {})),
      ...Object.values(pointMapping || {}),
      ...Object.values(routeCoordinatePairMapping || {}),
    ].filter(Boolean));
    const structuralSelections = customFieldSelections.map((selection) => (
      mappedCoreColumns.has(selection.sourceColumn)
        ? { ...selection, action: CUSTOM_INSPECTOR_FIELD_DEFAULTS.ignore }
        : selection
    ));
    return applyRelationshipMetadataSelections(structuralSelections, relationshipMetadataMapping);
  }, [coreMapping, temporalMapping, pointMapping, routeCoordinatePairMapping, relationshipMetadataMapping, customFieldSelections]);

  const validation = useMemo(
    () => validatePeridotColumnMapping(headers, {
      coreMapping,
      temporalMapping: stripDisplayDateMapping(temporalMapping),
      pointMapping,
      routeCoordinatePairMapping,
      relationshipMetadataMapping,
      customFieldSelections: effectiveCustomSelections,
    }),
    [headers, coreMapping, temporalMapping, pointMapping, routeCoordinatePairMapping, effectiveCustomSelections]
  );

  const mappedRows = useMemo(
    () => applyPeridotColumnMapping(rows, {
      coreMapping,
      temporalMapping: stripDisplayDateMapping(temporalMapping),
      pointMapping,
      routeCoordinatePairMapping,
      relationshipMetadataMapping,
      customFieldSelections: effectiveCustomSelections,
    }),
    [rows, coreMapping, temporalMapping, pointMapping, routeCoordinatePairMapping, effectiveCustomSelections]
  );

  const validationSummary = useMemo(
    () => buildPeridotCsvValidationSummary(mappedRows, Object.keys(mappedRows[0] || Object.fromEntries(PERIDOT_TEMPLATE_COLUMNS.map((column) => [column, ''])))),
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

  const workbookMappedRowsForAudit = useMemo(() => {
    if (!isWorkbookMode || !workbookModel || activeStep !== 'workbook-review') return [];
    try {
      return buildPeridotRowsFromWorkbookMapping(workbookModel, workbookMapping);
    } catch (error) {
      return [];
    }
  }, [activeStep, isWorkbookMode, workbookModel, workbookMapping]);

  const mappedRowsCapabilityAudit = useMemo(() => {
    if (isWorkbookMode || activeStep !== 'review') return null;
    try {
      return auditPeridotDataCapabilities(mappedRows, { headers: Object.keys(mappedRows[0] || {}) });
    } catch (error) {
      return null;
    }
  }, [activeStep, isWorkbookMode, mappedRows]);

  const workbookCapabilityAudit = useMemo(() => {
    if (!isWorkbookMode || activeStep !== 'workbook-review') return null;
    try {
      return auditPeridotDataCapabilities(workbookMappedRowsForAudit, { headers: Object.keys(workbookMappedRowsForAudit[0] || {}) });
    } catch (error) {
      return null;
    }
  }, [activeStep, isWorkbookMode, workbookMappedRowsForAudit]);

  if (!open || !staging || staging.status !== 'ready') return null;

  const singleStepLabels = {
    preview: 'Upload',
    time: 'Time',
    places: 'Places',
    relationships: 'Relations',
    evidence: 'Evidence',
    review: 'Review',
  };

  const workbookStepLabels = {
    'workbook-preview': 'Workbook',
    'workbook-setup': 'Sheet',
    'workbook-time': 'Time',
    'workbook-places': 'Places',
    'workbook-relationships': 'Relations',
    'workbook-evidence': 'Evidence',
    'workbook-review': 'Review',
  };

  const stepLabels = isWorkbookMode ? workbookStepLabels : singleStepLabels;
  const activeStepIndex = stepKeys.indexOf(activeStep);

  const handleCoreMappingChange = (field, sourceColumn) => {
    setCoreMapping((current) => ({
      ...current,
      [field]: sourceColumn,
    }));
    if (field === 'Date') {
      setTemporalMapping((current) => ({
        ...current,
        Date: current.Date || sourceColumn,
      }));
    }
  };

  const handleTemporalMappingChange = (field, sourceColumn) => {
    if (field === 'Date_Display') return;
    setTemporalMapping((current) => stripDisplayDateMapping({
      ...current,
      [field]: sourceColumn,
    }));
  };

  const handlePointMappingChange = (field, sourceColumn) => {
    setPointMapping((current) => ({
      ...current,
      [field]: sourceColumn,
    }));
  };

  const handleRouteCoordinatePairMappingChange = (field, sourceColumn) => {
    setRouteCoordinatePairMapping((current) => ({
      ...current,
      [field]: sourceColumn,
    }));
  };

  const handleRelationshipMetadataMappingChange = (field, sourceColumn) => {
    setRelationshipMetadataMapping((current) => normalizeRelationshipMetadataMapping({
      ...current,
      [field]: sourceColumn,
    }));
  };

  const handleWorkbookPrimarySheetChange = (primarySheetName) => {
    const nextCoreMappings = suggestWorkbookCoreMappings(workbookModel, primarySheetName);
    const nextTemporalMappings = suggestWorkbookTemporalMappings(workbookModel, primarySheetName, nextCoreMappings);
    const nextPointMappings = suggestWorkbookPointMappings(workbookModel, primarySheetName, nextCoreMappings, nextTemporalMappings);
    const nextRouteCoordinatePairMappings = suggestWorkbookRouteCoordinatePairMappings(workbookModel, primarySheetName, nextCoreMappings, nextTemporalMappings, nextPointMappings);
    const suggestedJoins = suggestSharedLetterIdJoins(workbookModel, primarySheetName, '');
    const suggestedPrimaryId = suggestedJoins[0]?.from?.columnName || '';
    setWorkbookMapping((current) => {
      const nextMapping = {
        ...current,
        primarySheetName,
        primaryLetterIdColumn: suggestedPrimaryId,
        coreMappings: nextCoreMappings,
        temporalMappings: nextTemporalMappings,
        pointMappings: nextPointMappings,
        routeCoordinatePairMappings: nextRouteCoordinatePairMappings,
        relationshipMetadataMappings: normalizeWorkbookRelationshipMetadataMappings({}),
        letterLevelJoins: suggestedJoins,
        letterLevelJoinSuggestions: suggestedJoins,
      };
      return {
        ...nextMapping,
        customFieldSelections: refreshWorkbookCustomSelections({
          workbookModel,
          workbookMapping: nextMapping,
          previousSelections: [],
        }),
      };
    });
  };

  const handleWorkbookLetterIdChange = (primaryLetterIdColumn) => {
    setWorkbookMapping((current) => ({
      ...current,
      primaryLetterIdColumn,
      letterLevelJoins: (current.letterLevelJoins || []).map((join) => makeLetterIdJoin({
        fromSheetName: current.primarySheetName,
        fromColumnName: primaryLetterIdColumn,
        toSheetName: join?.to?.sheetName || '',
        toColumnName: join?.to?.columnName || '',
      })),
    }));
  };

  const handleAddWorkbookJoin = () => {
    setWorkbookMapping((current) => {
      const usableSheets = getUsableWorkbookSheets(workbookModel);
      const alreadyJoined = new Set((current.letterLevelJoins || []).map((join) => join?.to?.sheetName).filter(Boolean));
      const nextSheet = usableSheets.find((sheet) => sheet.sheetName !== current.primarySheetName && !alreadyJoined.has(sheet.sheetName));
      if (!nextSheet) return current;
      const nextJoin = suggestDefaultLetterIdJoinForSheet(
        workbookModel,
        current.primarySheetName,
        nextSheet.sheetName,
        current.primaryLetterIdColumn
      );
      if (!nextJoin) return current;
      const nextMapping = {
        ...current,
        primaryLetterIdColumn: current.primaryLetterIdColumn || nextJoin.from.columnName,
        letterLevelJoins: [...(current.letterLevelJoins || []), nextJoin],
      };
      return {
        ...nextMapping,
        customFieldSelections: applyWorkbookRelationshipMetadataSelections(
          refreshWorkbookCustomSelections({
            workbookModel,
            workbookMapping: nextMapping,
            previousSelections: current.customFieldSelections || [],
          }),
          nextMapping.relationshipMetadataMappings || {}
        ),
      };
    });
  };

  const handleRemoveWorkbookJoin = (index) => {
    setWorkbookMapping((current) => {
      const nextMapping = {
        ...current,
        letterLevelJoins: (current.letterLevelJoins || []).filter((_, currentIndex) => currentIndex !== index),
      };
      return {
        ...nextMapping,
        customFieldSelections: applyWorkbookRelationshipMetadataSelections(
          refreshWorkbookCustomSelections({
            workbookModel,
            workbookMapping: nextMapping,
            previousSelections: current.customFieldSelections || [],
          }),
          nextMapping.relationshipMetadataMappings || {}
        ),
      };
    });
  };

  const handleWorkbookJoinSheetChange = (index, joinedSheetName) => {
    setWorkbookMapping((current) => {
      const nextJoin = suggestDefaultLetterIdJoinForSheet(
        workbookModel,
        current.primarySheetName,
        joinedSheetName,
        current.primaryLetterIdColumn
      );
      const nextMapping = {
        ...current,
        primaryLetterIdColumn: current.primaryLetterIdColumn || nextJoin?.from?.columnName || '',
        letterLevelJoins: (current.letterLevelJoins || []).map((join, currentIndex) => (
          currentIndex === index && nextJoin ? nextJoin : join
        )),
      };
      return {
        ...nextMapping,
        customFieldSelections: applyWorkbookRelationshipMetadataSelections(
          refreshWorkbookCustomSelections({
            workbookModel,
            workbookMapping: nextMapping,
            previousSelections: current.customFieldSelections || [],
          }),
          nextMapping.relationshipMetadataMappings || {}
        ),
      };
    });
  };

  const handleWorkbookJoinPrimaryColumnChange = (index, columnName) => {
    setWorkbookMapping((current) => ({
      ...current,
      primaryLetterIdColumn: current.primaryLetterIdColumn || columnName,
      letterLevelJoins: (current.letterLevelJoins || []).map((join, currentIndex) => (
        currentIndex === index
          ? makeLetterIdJoin({
              fromSheetName: current.primarySheetName,
              fromColumnName: columnName,
              toSheetName: join?.to?.sheetName || '',
              toColumnName: join?.to?.columnName || '',
            })
          : join
      )),
    }));
  };

  const handleWorkbookJoinTargetColumnChange = (index, columnName) => {
    setWorkbookMapping((current) => ({
      ...current,
      letterLevelJoins: (current.letterLevelJoins || []).map((join, currentIndex) => (
        currentIndex === index
          ? makeLetterIdJoin({
              fromSheetName: join?.from?.sheetName || current.primarySheetName,
              fromColumnName: join?.from?.columnName || current.primaryLetterIdColumn || '',
              toSheetName: join?.to?.sheetName || '',
              toColumnName: columnName,
            })
          : join
      )),
    }));
  };

  const handleWorkbookCoreMappingChange = (field, ref) => {
    setWorkbookMapping((current) => {
      const nextMapping = {
        ...current,
        coreMappings: {
          ...(current.coreMappings || {}),
          [field]: ref,
        },
      };
      return {
        ...nextMapping,
        customFieldSelections: applyWorkbookRelationshipMetadataSelections(
          refreshWorkbookCustomSelections({
            workbookModel,
            workbookMapping: nextMapping,
            previousSelections: current.customFieldSelections || [],
          }),
          nextMapping.relationshipMetadataMappings || {}
        ),
      };
    });
  };

  const handleWorkbookTemporalMappingChange = (field, ref) => {
    if (field === 'Date_Display') return;
    setWorkbookMapping((current) => {
      const nextMapping = {
        ...current,
        temporalMappings: {
          ...(current.temporalMappings || {}),
          [field]: ref,
          Date_Display: makeWorkbookColumnRef('', ''),
        },
      };
      return {
        ...nextMapping,
        customFieldSelections: applyWorkbookRelationshipMetadataSelections(
          refreshWorkbookCustomSelections({
            workbookModel,
            workbookMapping: nextMapping,
            previousSelections: current.customFieldSelections || [],
          }),
          nextMapping.relationshipMetadataMappings || {}
        ),
      };
    });
  };

  const handleWorkbookPointMappingChange = (field, ref) => {
    setWorkbookMapping((current) => {
      const nextMapping = {
        ...current,
        pointMappings: {
          ...(current.pointMappings || {}),
          [field]: ref,
        },
      };
      return {
        ...nextMapping,
        customFieldSelections: applyWorkbookRelationshipMetadataSelections(
          refreshWorkbookCustomSelections({
            workbookModel,
            workbookMapping: nextMapping,
            previousSelections: current.customFieldSelections || [],
          }),
          nextMapping.relationshipMetadataMappings || {}
        ),
      };
    });
  };

  const handleWorkbookRouteCoordinatePairMappingChange = (field, ref) => {
    setWorkbookMapping((current) => {
      const nextMapping = {
        ...current,
        routeCoordinatePairMappings: {
          ...(current.routeCoordinatePairMappings || {}),
          [field]: ref,
        },
      };
      return {
        ...nextMapping,
        customFieldSelections: applyWorkbookRelationshipMetadataSelections(
          refreshWorkbookCustomSelections({
            workbookModel,
            workbookMapping: nextMapping,
            previousSelections: current.customFieldSelections || [],
          }),
          nextMapping.relationshipMetadataMappings || {}
        ),
      };
    });
  };

  const handleWorkbookRelationshipMetadataMappingChange = (field, ref) => {
    setWorkbookMapping((current) => {
      const nextRelationshipMetadataMappings = normalizeWorkbookRelationshipMetadataMappings({
        ...(current.relationshipMetadataMappings || {}),
        [field]: ref,
      });
      const nextMapping = {
        ...current,
        relationshipMetadataMappings: nextRelationshipMetadataMappings,
      };
      return {
        ...nextMapping,
        customFieldSelections: applyWorkbookRelationshipMetadataSelections(
          refreshWorkbookCustomSelections({
            workbookModel,
            workbookMapping: nextMapping,
            previousSelections: current.customFieldSelections || [],
          }),
          nextRelationshipMetadataMappings
        ),
      };
    });
  };

  const handleWorkbookCustomActionChange = (index, action) => {
    setWorkbookMapping((current) => ({
      ...current,
      customFieldSelections: (current.customFieldSelections || []).map((selection, currentIndex) => (
        currentIndex === index
          ? { ...selection, action: normalizeAction(action) }
          : selection
      )),
    }));
  };

  const handleWorkbookCustomLabelChange = (index, label) => {
    setWorkbookMapping((current) => ({
      ...current,
      customFieldSelections: (current.customFieldSelections || []).map((selection, currentIndex) => (
        currentIndex === index
          ? { ...selection, label }
          : selection
      )),
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
        workbookMappingState: stripWorkbookDisplayDateMapping(workbookMapping),
        workbookValidation,
        workbookSummary: workbookMappingSummary,
      };
    }

    return {
      coreMapping,
      temporalMapping: stripDisplayDateMapping(temporalMapping),
      pointMapping,
      routeCoordinatePairMapping,
      relationshipMetadataMapping,
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
    if (isWorkbookMode && !workbookValidation?.isValid) return;
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
    ? 'Confirm import replaces the active dataset with assembled workbook rows.'
    : 'Confirm import replaces the active dataset with this mapped table.';

  return (
    <div className="peridot-mapping-modal fixed inset-0 z-[80] flex items-center justify-center bg-[var(--peridot-role-interface-scrim-strong)] p-4 backdrop-blur-sm">
      <div className="peridot-mapping-modal-shell flex flex-col overflow-hidden rounded-[30px] border border-[var(--panel-card-border)] bg-[var(--sidebar-bg)] text-[var(--text-main)] shadow-[0_28px_80px_var(--peridot-color-rgba-rgba-0-0-0-0-55)]">
        <div className="peridot-mapping-modal-header flex flex-wrap items-center justify-between gap-4 border-b border-[var(--panel-card-border)] bg-[var(--stat-card-bg)] px-6 py-4">
          <div className="min-w-0">
            <div className="mb-1 text-sm font-semibold text-[var(--muted-text)]">
              {staging.fileLabel || 'Uploaded data'}
            </div>
            <h2 className="[font-family:Georgia,'Palatino_Linotype','Book_Antiqua',Palatino,serif] text-2xl font-bold leading-tight text-[var(--heading-text)]">
              {isWorkbookMode ? 'Assign workbook data roles for Peridot' : 'Assign data roles for Peridot'}
            </h2>
          </div>
          <button type="button" onClick={handleRequestCancel} className={buttonClassName({ variant: 'secondary' })}>
            Close
          </button>
        </div>

        <div className="peridot-mapping-progress border-b border-[var(--panel-card-border)] bg-[var(--section-bg)] px-6 py-3">
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

        <div className="peridot-mapping-modal-body min-h-0 flex-1 overflow-y-auto px-6 py-5">
          {!isWorkbookMode && activeStep === 'preview' ? (
            <div className="space-y-4">
              <div className="grid gap-3 md:grid-cols-4">
                <div className="peridot-mapping-stat-card rounded-2xl border border-[var(--panel-card-border)] bg-[var(--stat-card-bg)] p-4">
                  <div className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted-text)]">Format</div>
                  <div className="mt-1 text-xl font-bold text-[var(--panel-card-text)]">{staging.fileType}</div>
                </div>
                <div className="peridot-mapping-stat-card rounded-2xl border border-[var(--panel-card-border)] bg-[var(--stat-card-bg)] p-4">
                  <div className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted-text)]">Rows</div>
                  <div className="mt-1 text-xl font-bold text-[var(--panel-card-text)]">{staging.rowCount}</div>
                </div>
                <div className="peridot-mapping-stat-card rounded-2xl border border-[var(--panel-card-border)] bg-[var(--stat-card-bg)] p-4">
                  <div className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted-text)]">Columns</div>
                  <div className="mt-1 text-xl font-bold text-[var(--panel-card-text)]">{staging.columnCount}</div>
                </div>
                <div className="peridot-mapping-stat-card rounded-2xl border border-[var(--panel-card-border)] bg-[var(--stat-card-bg)] p-4">
                  <div className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted-text)]">Mapping</div>
                  <div className="mt-1 text-xl font-bold text-[var(--panel-card-text)]">Ready</div>
                </div>
              </div>

              <div className="peridot-mapping-hint-row rounded-2xl border border-[var(--panel-card-border)] bg-[var(--stat-card-bg)] p-3 text-xs leading-relaxed text-[var(--stat-card-muted-text)]">
                <div><span>Date formats</span>{mappingState.formatGuidance?.dates}</div>
                <div><span>Coordinates</span>{mappingState.formatGuidance?.coordinates}</div>
              </div>

              <PreviewTable rows={previewRows} headers={headers} />
            </div>
          ) : null}

          {!isWorkbookMode && activeStep === 'identify' ? (
            <IdentifyRecordsStep
              staging={staging}
              previewRows={previewRows}
              headers={headers}
            />
          ) : null}

          {!isWorkbookMode && activeStep === 'time' ? (
            <TimeMappingStep
              headers={headers}
              temporalMapping={stripDisplayDateMapping(temporalMapping)}
              onTemporalChange={handleTemporalMappingChange}
            />
          ) : null}

          {!isWorkbookMode && activeStep === 'places' ? (
            <PlacesMappingStep
              headers={headers}
              coreMapping={coreMapping}
              pointMapping={pointMapping}
              routeCoordinatePairMapping={routeCoordinatePairMapping}
              onRouteChange={handleCoreMappingChange}
              onPointChange={handlePointMappingChange}
              onRoutePairChange={handleRouteCoordinatePairMappingChange}
            />
          ) : null}

          {!isWorkbookMode && activeStep === 'relationships' ? (
            <RelationshipsMappingStep
              headers={headers}
              coreMapping={coreMapping}
              relationshipMetadataMapping={relationshipMetadataMapping}
              onChange={handleCoreMappingChange}
              onMetadataChange={handleRelationshipMetadataMappingChange}
            />
          ) : null}

          {!isWorkbookMode && activeStep === 'evidence' ? (
            <InspectorFieldsStep
              selections={effectiveCustomSelections}
              coreMapping={{ ...coreMapping, ...stripDisplayDateMapping(temporalMapping), ...pointMapping, ...routeCoordinatePairMapping }}
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
              capabilityAudit={mappedRowsCapabilityAudit}
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
              onAddJoin={handleAddWorkbookJoin}
              onRemoveJoin={handleRemoveWorkbookJoin}
              onJoinSheetChange={handleWorkbookJoinSheetChange}
              onJoinPrimaryColumnChange={handleWorkbookJoinPrimaryColumnChange}
              onJoinTargetColumnChange={handleWorkbookJoinTargetColumnChange}
            />
          ) : null}

          {isWorkbookMode && activeStep === 'workbook-identify' ? (
            <WorkbookIdentifyRecordsStep
              workbookModel={workbookModel}
              workbookMapping={workbookMapping}
            />
          ) : null}

          {isWorkbookMode && activeStep === 'workbook-time' ? (
            <WorkbookTimeMappingStep
              workbookModel={workbookModel}
              workbookMapping={workbookMapping}
              onTemporalChange={handleWorkbookTemporalMappingChange}
            />
          ) : null}

          {isWorkbookMode && activeStep === 'workbook-places' ? (
            <WorkbookPlacesMappingStep
              workbookModel={workbookModel}
              workbookMapping={workbookMapping}
              onRouteChange={handleWorkbookCoreMappingChange}
              onPointChange={handleWorkbookPointMappingChange}
              onRoutePairChange={handleWorkbookRouteCoordinatePairMappingChange}
            />
          ) : null}

          {isWorkbookMode && activeStep === 'workbook-relationships' ? (
            <WorkbookRelationshipsMappingStep
              workbookModel={workbookModel}
              workbookMapping={workbookMapping}
              onChange={handleWorkbookCoreMappingChange}
              onMetadataChange={handleWorkbookRelationshipMetadataMappingChange}
            />
          ) : null}

          {isWorkbookMode && activeStep === 'workbook-evidence' ? (
            <WorkbookInspectorFieldsStep
              workbookMapping={workbookMapping}
              selections={workbookMapping.customFieldSelections || []}
              onActionChange={handleWorkbookCustomActionChange}
              onLabelChange={handleWorkbookCustomLabelChange}
            />
          ) : null}

          {isWorkbookMode && activeStep === 'workbook-review' ? (
            <WorkbookReviewStep
              workbookModel={workbookModel}
              workbookMapping={workbookMapping}
              validation={workbookValidation}
              summary={workbookMappingSummary}
              previewRows={workbookMappedPreviewRows}
              capabilityAudit={workbookCapabilityAudit}
            />
          ) : null}
        </div>

        <div className="peridot-mapping-modal-footer flex flex-wrap items-center justify-between gap-3 border-t border-[var(--panel-card-border)] bg-[var(--stat-card-bg)] px-6 py-3">
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
              <button
                type="button"
                onClick={handleConfirmImport}
                disabled={!workbookValidation?.isValid}
                className={buttonClassName({ variant: 'primary' })}
              >
                Confirm import
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
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-[var(--peridot-role-interface-scrim)] p-4">
          <div className="w-full max-w-md rounded-3xl border border-[var(--panel-card-border)] bg-[var(--sidebar-bg)] p-5 shadow-[0_24px_60px_var(--peridot-color-rgba-rgba-0-0-0-0-55)]">
            <h3 className="text-lg font-bold text-[var(--heading-text)]">Discard this upload?</h3>
            <p className="mt-2 text-sm leading-relaxed text-[var(--panel-card-muted-text)]">
              This will discard the uploaded file from the mapping workspace. The active dataset will not change.
            </p>
            <div className="mt-5 flex flex-wrap justify-end gap-2">
              <button type="button" onClick={handleReturnToWorkspace} className={buttonClassName({ variant: 'secondary' })}>
                Keep mapping
              </button>
              <button type="button" onClick={handleConfirmCancel} className={buttonClassName({ variant: 'danger' })}>
                Discard upload
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
