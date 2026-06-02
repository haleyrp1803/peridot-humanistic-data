import React, { useEffect, useMemo, useState } from 'react';
import { PERIDOT_TEMPLATE_COLUMNS } from './peridotCsvSchema.js';
import { buildPeridotCsvValidationSummary } from './peridotCsvValidation.js';
import {
  applyPeridotColumnMapping,
  CUSTOM_INSPECTOR_FIELD_DEFAULTS,
  validatePeridotColumnMapping,
} from './peridotColumnMapping.js';

const STEP_KEYS = ['preview', 'core', 'inspector', 'review'];

function buttonClassName({ active = false, variant = 'secondary' } = {}) {
  const base = 'rounded-xl px-3 py-2 text-sm font-medium transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/40 focus:ring-offset-2 focus:ring-offset-[var(--shell-bg)]';
  const variants = {
    primary: 'border border-[var(--button-primary-border)] bg-[var(--button-primary-bg)] text-[var(--button-primary-text)] hover:bg-[var(--button-primary-hover)] shadow-[0_8px_18px_rgba(0,0,0,0.28)]',
    secondary: 'border border-[var(--button-secondary-border)] bg-[var(--button-secondary-bg)] text-[var(--button-secondary-text)] hover:bg-[var(--button-secondary-hover)]',
    ghost: 'bg-transparent text-[var(--muted-text)] hover:bg-[var(--ghost-hover)] hover:text-[var(--text-main)]',
    danger: 'border border-red-300/50 bg-red-950/40 text-red-100 hover:bg-red-900/50',
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
          ? 'border-[var(--button-primary-active-border)] bg-[var(--button-primary-active-bg)] text-[var(--button-primary-text)] shadow-[0_10px_22px_rgba(0,0,0,0.24)]'
          : 'border-[var(--panel-card-border)] bg-[var(--section-bg)] text-[var(--panel-card-muted-text)] hover:bg-[var(--stat-card-bg)] hover:text-[var(--panel-card-text)]',
      ].join(' ')}
    >
      <div className="text-xs font-semibold uppercase tracking-[0.12em]">Step {index + 1}</div>
      <div className="mt-1 text-sm font-semibold">{label}</div>
    </button>
  );
}

function PreviewTable({ rows = [], headers = [], maxRows = 5 }) {
  const visibleHeaders = headers.slice(0, 8);
  const visibleRows = rows.slice(0, maxRows);

  if (!visibleHeaders.length || !visibleRows.length) {
    return (
      <div className="rounded-2xl border border-[var(--panel-card-border)] bg-[var(--stat-card-bg)] p-4 text-sm text-[var(--panel-card-muted-text)]">
        No preview rows are available.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-[var(--panel-card-border)]">
      <table className="min-w-full border-collapse text-left text-xs text-[var(--panel-card-muted-text)]">
        <thead className="bg-[var(--stat-card-bg)] text-[var(--panel-card-text)]">
          <tr>
            {visibleHeaders.map((header) => (
              <th key={header} className="whitespace-nowrap px-3 py-2 font-semibold">{header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {visibleRows.map((row, rowIndex) => (
            <tr key={`mapping-preview-${rowIndex}`} className="border-t border-[var(--panel-card-border)]">
              {visibleHeaders.map((header) => (
                <td key={`${rowIndex}-${header}`} className="max-w-[16rem] truncate px-3 py-2">
                  {row?.[header] ?? ''}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {headers.length > visibleHeaders.length ? (
        <div className="border-t border-[var(--panel-card-border)] bg-[var(--stat-card-bg)] px-3 py-2 text-xs text-[var(--panel-card-muted-text)]">
          Showing first {visibleHeaders.length} of {headers.length} columns.
        </div>
      ) : null}
    </div>
  );
}

function CoreMappingStep({ definitions, headers, coreMapping, onChange }) {
  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-[var(--panel-card-border)] bg-[var(--stat-card-bg)] p-4 text-sm leading-relaxed text-[var(--stat-card-muted-text)]">
        Map your uploaded columns to Peridot’s nine core variables. You may leave variables unassigned. Peridot will report which visualizations your data can support after import.
      </div>

      <div className="overflow-x-auto rounded-2xl border border-[var(--panel-card-border)]">
        <table className="min-w-[980px] border-collapse text-left text-sm">
          <thead className="bg-[var(--stat-card-bg)] text-[var(--panel-card-text)]">
            <tr>
              <th className="w-[12rem] px-3 py-3 font-semibold">Peridot variable</th>
              <th className="w-[20rem] px-3 py-3 font-semibold">Description</th>
              <th className="w-[14rem] px-3 py-3 font-semibold">Used for</th>
              <th className="w-[18rem] px-3 py-3 font-semibold">Common names</th>
              <th className="w-[15rem] px-3 py-3 font-semibold">Your column</th>
            </tr>
          </thead>
          <tbody>
            {definitions.map((definition) => (
              <tr key={definition.key} className="border-t border-[var(--panel-card-border)] align-top text-[var(--panel-card-muted-text)]">
                <td className="px-3 py-3 font-mono text-xs font-semibold text-[var(--panel-card-text)]">{definition.key}</td>
                <td className="px-3 py-3 leading-relaxed">
                  <div>{definition.description}</div>
                  {definition.acceptedFormat ? (
                    <div className="mt-2 rounded-xl bg-[var(--section-bg)] px-3 py-2 text-xs text-[var(--panel-card-muted-text)]">
                      {definition.acceptedFormat}
                    </div>
                  ) : null}
                </td>
                <td className="px-3 py-3">
                  <div className="flex flex-wrap gap-1.5">
                    {(definition.usedFor || []).map((item) => (
                      <span key={item} className="rounded-full border border-[var(--panel-card-border)] bg-[var(--section-bg)] px-2 py-1 text-[11px]">
                        {item}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-3 py-3 text-xs leading-relaxed">
                  {(definition.commonNames || []).slice(0, 8).join(', ')}
                  {(definition.commonNames || []).length > 8 ? '…' : ''}
                </td>
                <td className="px-3 py-3">
                  <select
                    value={coreMapping[definition.key] || ''}
                    onChange={(event) => onChange(definition.key, event.target.value)}
                    className="w-full rounded-xl border border-[var(--panel-card-border)] bg-[var(--section-bg)] px-3 py-2 text-sm text-[var(--panel-card-text)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/40"
                  >
                    <option value="">Leave unassigned</option>
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

  if (!selections.length) {
    return (
      <div className="rounded-2xl border border-[var(--panel-card-border)] bg-[var(--stat-card-bg)] p-4 text-sm text-[var(--panel-card-muted-text)]">
        No unmapped columns remain after the core Peridot variable mapping.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-[var(--panel-card-border)] bg-[var(--stat-card-bg)] p-4 text-sm leading-relaxed text-[var(--stat-card-muted-text)]">
        Choose which remaining uploaded columns should appear in Inspector. Peridot preserves the full uploaded row internally, but only selected fields are displayed. Usable categorical fields can also become Analytics variables later.
      </div>

      <div className="overflow-x-auto rounded-2xl border border-[var(--panel-card-border)]">
        <table className="min-w-[820px] border-collapse text-left text-sm">
          <thead className="bg-[var(--stat-card-bg)] text-[var(--panel-card-text)]">
            <tr>
              <th className="px-3 py-3 font-semibold">Uploaded column</th>
              <th className="px-3 py-3 font-semibold">Show in Inspector?</th>
              <th className="px-3 py-3 font-semibold">Display label</th>
              <th className="px-3 py-3 font-semibold">Analytics</th>
              <th className="px-3 py-3 font-semibold">Default reason</th>
            </tr>
          </thead>
          <tbody>
            {selections.map((selection, index) => {
              const sourceColumn = selection.sourceColumn || '';
              const usedAsCore = mappedCoreColumns.has(sourceColumn);
              const action = usedAsCore ? CUSTOM_INSPECTOR_FIELD_DEFAULTS.ignore : normalizeAction(selection.action);

              return (
                <tr key={sourceColumn || index} className="border-t border-[var(--panel-card-border)] align-top text-[var(--panel-card-muted-text)]">
                  <td className="px-3 py-3 font-medium text-[var(--panel-card-text)]">{sourceColumn || 'Untitled column'}</td>
                  <td className="px-3 py-3">
                    <select
                      value={action}
                      disabled={usedAsCore}
                      onChange={(event) => onActionChange(index, event.target.value)}
                      className="w-full rounded-xl border border-[var(--panel-card-border)] bg-[var(--section-bg)] px-3 py-2 text-sm text-[var(--panel-card-text)] disabled:opacity-50"
                    >
                      <option value={CUSTOM_INSPECTOR_FIELD_DEFAULTS.include}>Include</option>
                      <option value={CUSTOM_INSPECTOR_FIELD_DEFAULTS.ignore}>Ignore</option>
                    </select>
                    {usedAsCore ? (
                      <div className="mt-1 text-xs text-[var(--panel-card-muted-text)]">Mapped as a core Peridot variable.</div>
                    ) : null}
                  </td>
                  <td className="px-3 py-3">
                    <input
                      type="text"
                      value={selection.label || sourceColumn}
                      disabled={usedAsCore}
                      onChange={(event) => onLabelChange(index, event.target.value)}
                      className="w-full rounded-xl border border-[var(--panel-card-border)] bg-[var(--section-bg)] px-3 py-2 text-sm text-[var(--panel-card-text)] disabled:opacity-50"
                    />
                  </td>
                  <td className="px-3 py-3">
                    <span className={[
                      'rounded-full border px-2 py-1 text-xs',
                      selection.analyticsEligible
                        ? 'border-[var(--button-primary-border)] bg-[var(--button-primary-bg)] text-[var(--button-primary-text)]'
                        : 'border-[var(--panel-card-border)] bg-[var(--section-bg)] text-[var(--panel-card-muted-text)]',
                    ].join(' ')}>
                      {selection.analyticsEligible ? 'Likely categorical' : 'Unlikely'}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-xs leading-relaxed">{selection.reason || 'User-controlled field.'}</td>
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
  const capabilityCounts = summary?.capabilityCounts || {};
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
          <div className="mt-1 text-2xl font-bold text-[var(--panel-card-text)]">{capabilityCounts.mapReady ?? 0}</div>
        </div>
        <div className="rounded-2xl border border-[var(--panel-card-border)] bg-[var(--stat-card-bg)] p-4">
          <div className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted-text)]">Timeline-ready</div>
          <div className="mt-1 text-2xl font-bold text-[var(--panel-card-text)]">{capabilityCounts.timelineReady ?? 0}</div>
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
            {warnings.slice(0, 8).map((warning) => (
              <li key={warning.code}>{warning.message}</li>
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

export function PeridotColumnMappingModal({
  open,
  staging,
  onClose,
  onSaveMapping,
  onConfirmImport,
}) {
  const mappingState = staging?.mappingState || {};
  const definitions = mappingState.coreFieldDefinitions || [];
  const headers = staging?.headers || [];
  const rows = staging?.rows || staging?.rawRows || staging?.previewRows || [];
  const previewRows = staging?.previewRows || rows.slice(0, 5);
  const [activeStep, setActiveStep] = useState('preview');
  const [coreMapping, setCoreMapping] = useState(mappingState.coreMapping || {});
  const [customFieldSelections, setCustomFieldSelections] = useState(mappingState.customFieldSelections || []);
  const [showCancelConfirmation, setShowCancelConfirmation] = useState(false);

  useEffect(() => {
    if (!open || !staging) return;
    setActiveStep('preview');
    setCoreMapping(mappingState.coreMapping || {});
    setCustomFieldSelections(mappingState.customFieldSelections || []);
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

  if (!open || !staging || staging.status !== 'ready') return null;

  const stepLabels = {
    preview: 'Upload preview',
    core: 'Map Peridot variables',
    inspector: 'Choose Inspector fields',
    review: 'Review import',
  };

  const activeStepIndex = STEP_KEYS.indexOf(activeStep);

  const handleCoreMappingChange = (field, sourceColumn) => {
    setCoreMapping((current) => ({
      ...current,
      [field]: sourceColumn,
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

  const buildCurrentMappingPayload = () => ({
    coreMapping,
    customFieldSelections: effectiveCustomSelections,
    validationSummary,
  });

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
    const payload = buildCurrentMappingPayload();
    onSaveMapping?.(payload);
    onConfirmImport?.(payload);
  };

  const goNext = () => {
    const nextIndex = Math.min(STEP_KEYS.length - 1, activeStepIndex + 1);
    setActiveStep(STEP_KEYS[nextIndex]);
  };

  const goBack = () => {
    const nextIndex = Math.max(0, activeStepIndex - 1);
    setActiveStep(STEP_KEYS[nextIndex]);
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/55 p-4 backdrop-blur-sm">
      <div className="flex max-h-[92vh] w-full max-w-[1180px] flex-col overflow-hidden rounded-[30px] border border-[var(--panel-card-border)] bg-[var(--sidebar-bg)] text-[var(--text-main)] shadow-[0_28px_80px_rgba(0,0,0,0.55)]">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[var(--panel-card-border)] bg-[var(--stat-card-bg)] px-6 py-5">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted-text)]">Column mapping workspace</div>
            <h2 className="[font-family:Georgia,'Palatino_Linotype','Book_Antiqua',Palatino,serif] mt-1 text-2xl font-bold text-[var(--heading-text)]">
              Map uploaded columns to Peridot
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-[var(--panel-card-muted-text)]">
              {staging.fileLabel} staged as {staging.fileType}. This workspace is intentionally outside the left panel so the mapping table has room to be reviewed.
            </p>
          </div>
          <button type="button" onClick={handleRequestCancel} className={buttonClassName({ variant: 'secondary' })}>
            Cancel
          </button>
        </div>

        <div className="grid gap-4 border-b border-[var(--panel-card-border)] bg-[var(--section-bg)] px-6 py-4 md:grid-cols-4">
          {STEP_KEYS.map((step, index) => (
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
          {activeStep === 'preview' ? (
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

          {activeStep === 'core' ? (
            <CoreMappingStep
              definitions={definitions}
              headers={headers}
              coreMapping={coreMapping}
              onChange={handleCoreMappingChange}
            />
          ) : null}

          {activeStep === 'inspector' ? (
            <InspectorFieldsStep
              selections={customFieldSelections}
              coreMapping={coreMapping}
              onActionChange={handleCustomActionChange}
              onLabelChange={handleCustomLabelChange}
            />
          ) : null}

          {activeStep === 'review' ? (
            <ReviewStep
              validation={validation}
              summary={validationSummary}
              mappedPreviewRows={mappedRows.slice(0, 5)}
              headers={PERIDOT_TEMPLATE_COLUMNS}
            />
          ) : null}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--panel-card-border)] bg-[var(--stat-card-bg)] px-6 py-4">
          <p className="max-w-2xl text-sm text-[var(--panel-card-muted-text)]">
            Closing keeps the staged file available in Data Inputs but does not change the active dataset. Confirm import replaces the active Peridot dataset with this mapped table.
          </p>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={handleRequestCancel} className={buttonClassName({ variant: 'secondary' })}>
              Cancel
            </button>
            <button type="button" onClick={goBack} disabled={activeStepIndex <= 0} className={buttonClassName({ variant: 'secondary' })}>
              Back
            </button>
            {activeStepIndex < STEP_KEYS.length - 1 ? (
              <button type="button" onClick={goNext} className={buttonClassName({ variant: 'primary' })}>
                Next
              </button>
            ) : (
              <button type="button" onClick={handleConfirmImport} className={buttonClassName({ variant: 'primary' })}>
                Confirm import
              </button>
            )}
          </div>
        </div>
      </div>

      {showCancelConfirmation ? (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-[24px] border border-[var(--panel-card-border)] bg-[var(--sidebar-bg)] p-6 text-[var(--text-main)] shadow-[0_24px_70px_rgba(0,0,0,0.55)]">
            <div className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted-text)]">Cancel import setup</div>
            <h3 className="[font-family:Georgia,'Palatino_Linotype','Book_Antiqua',Palatino,serif] mt-2 text-xl font-bold text-[var(--heading-text)]">
              Are you sure you want to cancel?
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-[var(--panel-card-muted-text)]">
              Your staged file will remain available in Data Inputs, but this workspace will close and the active Peridot dataset will not change.
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
