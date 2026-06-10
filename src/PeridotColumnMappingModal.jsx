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
  PERIDOT_POINT_FIELD_DEFINITIONS,
  PERIDOT_ROUTE_COORDINATE_PAIR_FIELD_DEFINITIONS,
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
  TemporalMappingTable,
  WorkbookCoreRoleMappingTable,
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
      className={[
        'rounded-2xl border px-4 py-3 text-left transition-all duration-150',
        active
          ? 'border-[var(--button-primary-active-border)] bg-[var(--button-primary-active-bg)] text-[var(--button-primary-text)] shadow-[0_10px_22px_var(--peridot-color-rgba-rgba-0-0-0-0-26)]'
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
    <div className="rounded-2xl border border-[var(--panel-card-border)] bg-[var(--section-bg)] p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted-text)]">Data capability audit</div>
          <div className="mt-1 text-sm font-semibold text-[var(--panel-card-text)]">
            Read-only summary of what this mapped data appears able to support.
          </div>
        </div>
        <div className="rounded-full border border-[var(--panel-card-border)] bg-[var(--stat-card-bg)] px-3 py-1 text-xs font-semibold text-[var(--panel-card-muted-text)]">
          {totalRows} row{totalRows === 1 ? '' : 's'} audited
        </div>
      </div>

      {note ? <p className="mt-3 text-xs leading-relaxed text-[var(--panel-card-muted-text)]">{note}</p> : null}

      <div className="mt-4 grid gap-3 lg:grid-cols-3">
        <div className="rounded-xl border border-[var(--panel-card-border)] bg-[var(--stat-card-bg)] p-3">
          <div className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted-text)]">Detected shape(s)</div>
          <div className="mt-2 text-sm font-semibold text-[var(--panel-card-text)]">
            {shapes.length ? shapes.join(', ') : 'No clear shape detected'}
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
            <div><span className="font-semibold text-[var(--panel-card-text)]">Timeline-ready:</span> {counts.timelineReady ?? 0} of {totalRows}</div>
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
    <div className="rounded-2xl border border-[var(--panel-card-border)] bg-[var(--stat-card-bg)] p-4 text-sm leading-relaxed text-[var(--panel-card-muted-text)]">
      <div className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted-text)]">{eyebrow}</div>
      <div className="mt-1 text-sm font-semibold text-[var(--panel-card-text)]">{title}</div>
      <div className="mt-2">{children}</div>
    </div>
  );
}

function IdentifyRecordsStep({ staging, previewRows, headers }) {
  return (
    <div className="space-y-4">
      <MappingIntroCard eyebrow="Identify records" title="Describe what each row represents.">
        <p>
          This phase reorients mapping around data roles rather than a correspondence-only schema. In this prototype, record labels,
          IDs, citations, and links are preserved through the Evidence and analysis step while durable record-role mappings are added next.
        </p>
        <p className="mt-2">
          Use this step to confirm the table shape before assigning temporal, place, and relationship roles. A row may represent a correspondence item,
          site, event, object, publication, observation, relationship, or generic evidence record.
        </p>
      </MappingIntroCard>

      <div className="grid gap-3 md:grid-cols-3">
        <div className="rounded-2xl border border-[var(--panel-card-border)] bg-[var(--section-bg)] p-4">
          <div className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted-text)]">Current file</div>
          <div className="mt-1 text-lg font-bold text-[var(--panel-card-text)]">{staging?.fileLabel || 'Staged data'}</div>
          <div className="mt-1 text-sm text-[var(--panel-card-muted-text)]">{staging?.rowCount || 0} rows · {staging?.columnCount || headers.length || 0} columns</div>
        </div>
        <div className="rounded-2xl border border-[var(--panel-card-border)] bg-[var(--section-bg)] p-4">
          <div className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted-text)]">Good candidates</div>
          <div className="mt-2 text-sm leading-relaxed text-[var(--panel-card-muted-text)]">
            Record labels, IDs, source/citation fields, links, titles, notes, and descriptions.
          </div>
        </div>
        <div className="rounded-2xl border border-[var(--panel-card-border)] bg-[var(--section-bg)] p-4">
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
    <div className="space-y-4">
      <MappingIntroCard eyebrow="Time" title="Map one date, multiple recorded dates, or an interval.">
        Use a single date when one column best represents the record. Use Date Start and Date End for intervals such as sent/received dates,
        inception/dissolution dates, active periods, or site lifespans.
      </MappingIntroCard>
      <TemporalMappingTable headers={headers} temporalMapping={temporalMapping} onChange={onTemporalChange} />
    </div>
  );
}

function PlacesMappingStep({ definitions, headers, coreMapping, pointMapping, routeCoordinatePairMapping, onRouteChange, onPointChange, onRoutePairChange }) {
  const placeDefinitions = definitionsForFields(definitions, CORE_FIELD_GROUPS.routePlaces);

  return (
    <div className="space-y-4">
      <MappingIntroCard eyebrow="Places" title="Map locations according to how this dataset uses space.">
        <p>
          Map one-location records as point places. Map relationship, correspondence, travel, exchange, or movement data as source/target route geography.
        </p>
        <p className="mt-2">
          Coordinate-pair fields are latitude first, longitude second. Examples: 64.2008, -149.4937 or POINT(64.2008 -149.4937).
        </p>
      </MappingIntroCard>
      <CoreRoleMappingTable
        title="One location per record"
        description="Use these fields for sites, events, buildings, institutions, objects, or observations with one primary location."
        definitions={PERIDOT_POINT_FIELD_DEFINITIONS}
        headers={headers}
        coreMapping={pointMapping}
        onChange={onPointChange}
      />
      <CoreRoleMappingTable
        title="Route coordinate-pair roles"
        description="Use these optional latitude-first coordinate pairs when source or target coordinates are stored in one column."
        definitions={PERIDOT_ROUTE_COORDINATE_PAIR_FIELD_DEFINITIONS}
        headers={headers}
        coreMapping={routeCoordinatePairMapping}
        onChange={onRoutePairChange}
      />
      <CoreRoleMappingTable
        title="Route / directed-place roles"
        description="Use these fields when a record has a source place and a target place."
        definitions={placeDefinitions}
        headers={headers}
        coreMapping={coreMapping}
        onChange={onRouteChange}
      />
    </div>
  );
}

function RelationshipsMappingStep({ definitions, headers, coreMapping, onChange }) {
  const relationshipDefinitions = definitionsForFields(definitions, CORE_FIELD_GROUPS.relationship);

  return (
    <div className="space-y-4">
      <MappingIntroCard eyebrow="Relationships" title="Map source/target entities only when the dataset contains relationships.">
        These fields are optional. Relationship datasets may map source and target entities here; correspondence datasets often use sender and recipient columns. Point/site datasets, stock data,
        catalogues, and many evidence tables may leave these roles unassigned.
      </MappingIntroCard>
      <CoreRoleMappingTable
        title="Directed relationship roles"
        description="Use these fields for people, institutions, objects, works, or other entities connected by a record."
        definitions={relationshipDefinitions}
        headers={headers}
        coreMapping={coreMapping}
        onChange={onChange}
      />
    </div>
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

      <CapabilityAuditCard
        audit={capabilityAudit}
        note="This audit is based on the mapped rows Peridot will import if you confirm this table. It does not change import rules."
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
        This workspace configures a multi-sheet workbook import. Peridot will use the primary sheet as the record basis and pull mapped core values from joined sheets through the unique-ID joins you configure.
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

      <div className="rounded-2xl border border-[var(--panel-card-border)] bg-[var(--section-bg)] p-4">
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
                <div key={`${join?.to?.sheetName || 'join'}-${index}`} className="rounded-2xl border border-[var(--panel-card-border)] bg-[var(--stat-card-bg)] p-4">
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


function WorkbookIdentifyRecordsStep({ workbookModel, workbookMapping }) {
  const selectedSheet = getWorkbookSheet(workbookModel, workbookMapping.primarySheetName);

  return (
    <div className="space-y-4">
      <MappingIntroCard eyebrow="Identify records" title="Confirm the sheet whose rows become records.">
        <p>
          Each row on the primary sheet is treated as one record. Joined sheets may supply additional role fields through configured unique-ID matches.
        </p>
        <p className="mt-2">
          Durable record-label, record-ID, citation, and link roles are planned for the next role-model expansion. For this prototype, keep those columns through Evidence and analysis.
        </p>
      </MappingIntroCard>

      <div className="grid gap-3 md:grid-cols-3">
        <div className="rounded-2xl border border-[var(--panel-card-border)] bg-[var(--section-bg)] p-4">
          <div className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted-text)]">Primary record sheet</div>
          <div className="mt-1 text-lg font-bold text-[var(--panel-card-text)]">{workbookMapping.primarySheetName || '—'}</div>
          <div className="mt-1 text-sm text-[var(--panel-card-muted-text)]">{selectedSheet?.rowCount || 0} rows · {selectedSheet?.columnCount || 0} columns</div>
        </div>
        <div className="rounded-2xl border border-[var(--panel-card-border)] bg-[var(--section-bg)] p-4">
          <div className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted-text)]">Joins</div>
          <div className="mt-1 text-lg font-bold text-[var(--panel-card-text)]">{(workbookMapping.letterLevelJoins || []).length}</div>
          <div className="mt-1 text-sm text-[var(--panel-card-muted-text)]">Configured joined sheet(s)</div>
        </div>
        <div className="rounded-2xl border border-[var(--panel-card-border)] bg-[var(--section-bg)] p-4">
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
    <div className="space-y-4">
      <MappingIntroCard eyebrow="Time" title="Map one date, multiple recorded dates, or an interval from workbook sheets.">
        Use a single date when one date best represents the record. Use Date Start and Date End for intervals such as sent/received dates,
        inception/dissolution dates, active periods, or site lifespans.
      </MappingIntroCard>
      <WorkbookTemporalMappingTable
        workbookModel={workbookModel}
        workbookMapping={workbookMapping}
        onChange={onTemporalChange}
      />
    </div>
  );
}

function WorkbookPlacesMappingStep({ workbookModel, workbookMapping, onRouteChange, onPointChange, onRoutePairChange }) {
  const placeDefinitions = definitionsForFields(PERIDOT_CORE_FIELD_DEFINITIONS, CORE_FIELD_GROUPS.routePlaces);

  return (
    <div className="space-y-4">
      <MappingIntroCard eyebrow="Places" title="Map locations according to how this workbook uses space.">
        <p>
          Map one-location records as point places. Map relationship, correspondence, travel, exchange, or movement data as source/target route geography.
        </p>
        <p className="mt-2">
          Coordinate-pair fields are latitude first, longitude second. Examples: 64.2008, -149.4937 or POINT(64.2008 -149.4937).
        </p>
      </MappingIntroCard>
      <WorkbookCoreRoleMappingTable
        title="One location per record"
        description="Use these fields for sites, events, buildings, institutions, objects, or observations with one primary location."
        definitions={PERIDOT_POINT_FIELD_DEFINITIONS}
        workbookModel={workbookModel}
        workbookMapping={{ ...workbookMapping, coreMappings: workbookMapping.pointMappings || {} }}
        onChange={onPointChange}
      />
      <WorkbookCoreRoleMappingTable
        title="Route coordinate-pair roles"
        description="Use these optional latitude-first coordinate pairs when source or target coordinates are stored in one column."
        definitions={PERIDOT_ROUTE_COORDINATE_PAIR_FIELD_DEFINITIONS}
        workbookModel={workbookModel}
        workbookMapping={{ ...workbookMapping, coreMappings: workbookMapping.routeCoordinatePairMappings || {} }}
        onChange={onRoutePairChange}
      />
      <WorkbookCoreRoleMappingTable
        title="Route / directed-place roles"
        description="Use these fields when a record has a source place and a target place."
        definitions={placeDefinitions}
        workbookModel={workbookModel}
        workbookMapping={workbookMapping}
        onChange={onRouteChange}
      />
    </div>
  );
}

function WorkbookRelationshipsMappingStep({ workbookModel, workbookMapping, onChange }) {
  const relationshipDefinitions = definitionsForFields(PERIDOT_CORE_FIELD_DEFINITIONS, CORE_FIELD_GROUPS.relationship);

  return (
    <div className="space-y-4">
      <MappingIntroCard eyebrow="Relationships" title="Map source/target entities only when the workbook contains relationships.">
        These fields are optional. Relationship datasets may map source and target entities here; correspondence datasets often use sender and recipient columns. Point/site datasets, stock data,
        catalogues, and many evidence tables may leave these roles unassigned.
      </MappingIntroCard>
      <WorkbookCoreRoleMappingTable
        title="Directed relationship roles"
        description="Use these fields for people, institutions, objects, works, or other entities connected by a record."
        definitions={relationshipDefinitions}
        workbookModel={workbookModel}
        workbookMapping={workbookMapping}
        onChange={onChange}
      />
    </div>
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
      <div className="grid gap-3 md:grid-cols-4">
        <div className="rounded-2xl border border-[var(--panel-card-border)] bg-[var(--stat-card-bg)] p-4">
          <div className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted-text)]">Primary sheet</div>
          <div className="mt-1 truncate text-lg font-bold text-[var(--panel-card-text)]">{summary.primarySheetName || '—'}</div>
        </div>
        <div className="rounded-2xl border border-[var(--panel-card-border)] bg-[var(--stat-card-bg)] p-4">
          <div className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted-text)]">Primary ID</div>
          <div className="mt-1 truncate text-lg font-bold text-[var(--panel-card-text)]">{summary.primaryLetterIdColumn || '—'}</div>
        </div>
        <div className="rounded-2xl border border-[var(--panel-card-border)] bg-[var(--stat-card-bg)] p-4">
          <div className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted-text)]">Joined sheets</div>
          <div className="mt-1 text-2xl font-bold text-[var(--panel-card-text)]">{summary.letterLevelJoinCount || 0}</div>
        </div>
        <div className="rounded-2xl border border-[var(--panel-card-border)] bg-[var(--stat-card-bg)] p-4">
          <div className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted-text)]">Issues</div>
          <div className="mt-1 text-2xl font-bold text-[var(--panel-card-text)]">{summary.errorCount} / {summary.warningCount}</div>
        </div>
      </div>

      <div className="rounded-2xl border border-[var(--section-border)] bg-[var(--stat-card-bg)] p-4 text-sm leading-relaxed text-[var(--stat-card-muted-text)]">
        Review the workbook import before confirming. Peridot will assemble rows from the primary sheet and configured unique-ID joins, then include selected evidence and analysis fields from the primary sheet and joined sheets.
      </div>

      <CapabilityAuditCard
        audit={capabilityAudit}
        note="This audit is based on the assembled workbook rows Peridot will import if you confirm this mapping. It is descriptive only and does not block import."
      />

      {errors.length ? (
        <div className="rounded-2xl border border-[var(--peridot-role-status-danger-border)] bg-[var(--peridot-role-status-danger-bg)] p-4 text-sm text-[var(--peridot-role-status-danger-text)]">
          <div className="font-semibold">Blocking issues before import wiring</div>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            {errors.map((issue, index) => <li key={`${issue.code}-${index}`}>{issue.message}</li>)}
          </ul>
        </div>
      ) : null}

      {warnings.length ? (
        <div className="rounded-2xl border border-[var(--peridot-role-status-warning-border)] bg-[var(--peridot-role-status-warning-bg)] p-4 text-sm text-[var(--peridot-role-status-warning-text)]">
          <div className="font-semibold">Warnings and rules</div>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            {warnings.map((issue, index) => <li key={`${issue.code}-${index}`}>{issue.message}</li>)}
          </ul>
        </div>
      ) : null}


      <div className="rounded-2xl border border-[var(--panel-card-border)] bg-[var(--section-bg)] p-4">
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

      <div className="rounded-2xl border border-[var(--panel-card-border)] bg-[var(--section-bg)] p-4">
        <div className="font-semibold text-[var(--panel-card-text)]">Sheets used by core mappings</div>
        <div className="mt-2 text-sm text-[var(--panel-card-muted-text)]">
          {summary.mappedSheets?.length ? summary.mappedSheets.join(', ') : 'No mapped sheets yet.'}
        </div>
      </div>

      <div className="rounded-2xl border border-[var(--panel-card-border)] bg-[var(--section-bg)] p-4">
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
  const [temporalMapping, setTemporalMapping] = useState(mappingState.temporalMapping || {});
  const [pointMapping, setPointMapping] = useState(mappingState.pointMapping || {});
  const [routeCoordinatePairMapping, setRouteCoordinatePairMapping] = useState(mappingState.routeCoordinatePairMapping || {});
  const [customFieldSelections, setCustomFieldSelections] = useState(mappingState.customFieldSelections || []);
  const [workbookMapping, setWorkbookMapping] = useState(mappingState);
  const [showCancelConfirmation, setShowCancelConfirmation] = useState(false);

  useEffect(() => {
    if (!open || !staging) return;
    const nextIsWorkbookMode = staging?.mappingMode === 'workbook' || Boolean(staging?.workbookMappingRequired);
    setActiveStep(nextIsWorkbookMode ? WORKBOOK_STEP_KEYS[0] : SINGLE_TABLE_STEP_KEYS[0]);
    setCoreMapping(mappingState.coreMapping || {});
    setTemporalMapping(mappingState.temporalMapping || {});
    setCustomFieldSelections(mappingState.customFieldSelections || []);
    setWorkbookMapping(
      nextIsWorkbookMode && staging?.workbookModel
        ? {
            ...(mappingState || {}),
            customFieldSelections: refreshWorkbookCustomSelections({
              workbookModel: staging.workbookModel,
              workbookMapping: mappingState || {},
              previousSelections: mappingState.customFieldSelections || [],
            }),
          }
        : (mappingState || {})
    );
    setShowCancelConfirmation(false);
  }, [open, staging?.stagedAt]);

  const effectiveCustomSelections = useMemo(() => {
    const mappedCoreColumns = new Set([
      ...Object.values(coreMapping || {}),
      ...Object.values(temporalMapping || {}),
      ...Object.values(pointMapping || {}),
      ...Object.values(routeCoordinatePairMapping || {}),
    ].filter(Boolean));
    return customFieldSelections.map((selection) => (
      mappedCoreColumns.has(selection.sourceColumn)
        ? { ...selection, action: CUSTOM_INSPECTOR_FIELD_DEFAULTS.ignore }
        : selection
    ));
  }, [coreMapping, temporalMapping, pointMapping, routeCoordinatePairMapping, customFieldSelections]);

  const validation = useMemo(
    () => validatePeridotColumnMapping(headers, {
      coreMapping,
      temporalMapping,
      pointMapping,
      routeCoordinatePairMapping,
      customFieldSelections: effectiveCustomSelections,
    }),
    [headers, coreMapping, temporalMapping, pointMapping, routeCoordinatePairMapping, effectiveCustomSelections]
  );

  const mappedRows = useMemo(
    () => applyPeridotColumnMapping(rows, {
      coreMapping,
      temporalMapping,
      pointMapping,
      routeCoordinatePairMapping,
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
    preview: 'Upload preview',
    identify: 'Identify records',
    time: 'Time',
    places: 'Places',
    relationships: 'Relationships',
    evidence: 'Evidence and analysis',
    review: 'Review capabilities',
  };

  const workbookStepLabels = {
    'workbook-preview': 'Workbook overview',
    'workbook-setup': 'Record sheet',
    'workbook-identify': 'Identify records',
    'workbook-time': 'Time',
    'workbook-places': 'Places',
    'workbook-relationships': 'Relationships',
    'workbook-evidence': 'Evidence and analysis',
    'workbook-review': 'Review capabilities',
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
    setTemporalMapping((current) => ({
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
        customFieldSelections: refreshWorkbookCustomSelections({
          workbookModel,
          workbookMapping: nextMapping,
          previousSelections: current.customFieldSelections || [],
        }),
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
        customFieldSelections: refreshWorkbookCustomSelections({
          workbookModel,
          workbookMapping: nextMapping,
          previousSelections: current.customFieldSelections || [],
        }),
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
        customFieldSelections: refreshWorkbookCustomSelections({
          workbookModel,
          workbookMapping: nextMapping,
          previousSelections: current.customFieldSelections || [],
        }),
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
        customFieldSelections: refreshWorkbookCustomSelections({
          workbookModel,
          workbookMapping: nextMapping,
          previousSelections: current.customFieldSelections || [],
        }),
      };
    });
  };

  const handleWorkbookTemporalMappingChange = (field, ref) => {
    setWorkbookMapping((current) => {
      const nextMapping = {
        ...current,
        temporalMappings: {
          ...(current.temporalMappings || {}),
          [field]: ref,
        },
      };
      return {
        ...nextMapping,
        customFieldSelections: refreshWorkbookCustomSelections({
          workbookModel,
          workbookMapping: nextMapping,
          previousSelections: current.customFieldSelections || [],
        }),
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
        customFieldSelections: refreshWorkbookCustomSelections({
          workbookModel,
          workbookMapping: nextMapping,
          previousSelections: current.customFieldSelections || [],
        }),
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
        customFieldSelections: refreshWorkbookCustomSelections({
          workbookModel,
          workbookMapping: nextMapping,
          previousSelections: current.customFieldSelections || [],
        }),
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
        workbookMappingState: workbookMapping,
        workbookValidation,
        workbookSummary: workbookMappingSummary,
      };
    }

    return {
      coreMapping,
      temporalMapping,
      pointMapping,
      routeCoordinatePairMapping,
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
    ? 'Closing keeps the staged workbook available in Data Inputs but does not change the active dataset. Confirm import assembles rows from the primary sheet and configured unique-ID joins, then replaces the active Peridot dataset.'
    : 'Closing keeps the staged file available in Data Inputs but does not change the active dataset. Confirm import replaces the active Peridot dataset with this mapped table.';

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-[var(--peridot-role-interface-scrim-strong)] p-4 backdrop-blur-sm">
      <div className="flex max-h-[92vh] w-full max-w-[1180px] flex-col overflow-hidden rounded-[30px] border border-[var(--panel-card-border)] bg-[var(--sidebar-bg)] text-[var(--text-main)] shadow-[0_28px_80px_var(--peridot-color-rgba-rgba-0-0-0-0-55)]">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[var(--panel-card-border)] bg-[var(--stat-card-bg)] px-6 py-5">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted-text)]">
              {isWorkbookMode ? 'Workbook mapping workspace' : 'Column mapping workspace'}
            </div>
            <h2 className="[font-family:Georgia,'Palatino_Linotype','Book_Antiqua',Palatino,serif] mt-1 text-2xl font-bold text-[var(--heading-text)]">
              {isWorkbookMode ? 'Assign workbook data roles for Peridot' : 'Assign data roles for Peridot'}
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-[var(--panel-card-muted-text)]">
              {staging.fileLabel} staged as {staging.fileType}. This workspace lets you describe what your fields do: records, time, places, relationships, evidence, and analysis.
            </p>
          </div>
          <button type="button" onClick={handleRequestCancel} className={buttonClassName({ variant: 'secondary' })}>
            Close
          </button>
        </div>

        <div className="grid gap-3 border-b border-[var(--panel-card-border)] bg-[var(--section-bg)] px-6 py-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8">
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
              temporalMapping={temporalMapping}
              onTemporalChange={handleTemporalMappingChange}
            />
          ) : null}

          {!isWorkbookMode && activeStep === 'places' ? (
            <PlacesMappingStep
              definitions={definitions}
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
              definitions={definitions}
              headers={headers}
              coreMapping={coreMapping}
              onChange={handleCoreMappingChange}
            />
          ) : null}

          {!isWorkbookMode && activeStep === 'evidence' ? (
            <InspectorFieldsStep
              selections={effectiveCustomSelections}
              coreMapping={{ ...coreMapping, ...temporalMapping, ...pointMapping, ...routeCoordinatePairMapping }}
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
