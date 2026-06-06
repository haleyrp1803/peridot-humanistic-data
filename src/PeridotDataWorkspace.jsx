/*
 * Data-management workspace.
 * 
 * This component renders the public data-ingestion surface: template download, table/workbook upload, mapping launch, workbook/table staging summaries, upload validation summaries, and navigation into Visualizations.
 * 
 * Important relationships:
 * - Parsing and normalization live in `peridotCsv*`, `peridotColumnMapping`, and `peridotWorkbook*` helpers, not here.
 * - `App.jsx` owns file input handlers and upload state; this component presents that state and actions.
 * 
 * Maintenance cautions:
 * - Keep wording clear that Peridot is permissive and capability-based: incomplete rows may be accepted even when they cannot support every visualization.
 */

import React from 'react';

export function PeridotDataWorkspace({
  peridotFileLabel,
  peridotValidationSummary,
  columnMappingStaging,
  handleDownloadPeridotTemplate,
  handleColumnMappingTableUpload,
  openColumnMappingModal,
  clearColumnMappingStaging,
  onOpenVisualizations,
}) {
  const popup = peridotValidationSummary?.popup || null;
  const capabilityLines = popup?.capabilityLines || [];
  const warningLines = popup?.warningLines || [];

  return (
    <section className="peridot-workspace-field text-[#fbf7ea]">
      <div className="peridot-workspace-frame">
        <div className="peridot-hero-card">
          <div className="peridot-workspace-header-row">
            <div>
              <p className="peridot-kicker">Data workspace</p>
              <h1 className="peridot-title-medium">Start with your records</h1>
              <p className="peridot-lede">
                Upload a CSV, TSV, XLSX, or XLS table or workbook, then map your columns by data role. Peridot accepts incomplete historical data and reports which records can support Inspector, mapping, timeline, Analytics, and export workflows.
              </p>
            </div>
            <button type="button" onClick={onOpenVisualizations} className="peridot-button-secondary shrink-0">
              Open visualizations
            </button>
          </div>
        </div>

        <div className="mt-6 peridot-card-grid peridot-card-grid-2">
          <div className="peridot-action-card peridot-card-inner">
            <p className="peridot-section-label">Template workflow</p>
            <h2 className="mt-3 text-2xl font-bold text-[#fbf7ea]">Peridot template</h2>
            <p className="mt-3 text-sm leading-7 text-[#f7f2df]/82">
              Download the standard Peridot CSV template when each row represents a correspondence-style record. For other humanistic datasets, upload your existing table or workbook and map its columns by role before entering the main workspace.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <button type="button" onClick={handleDownloadPeridotTemplate} className="peridot-button-cream">
                Download CSV template
              </button>
            </div>
            <p className="mt-5 text-sm text-[#f7f2df]/82">
              Current source: <strong className="text-[#fbf7ea]">{peridotFileLabel}</strong>
            </p>
          </div>

          <div className="peridot-action-card peridot-card-inner">
            <p className="peridot-section-label">Flexible import</p>
            <h2 className="mt-3 text-2xl font-bold text-[#fbf7ea]">Map your own table</h2>
            <p className="mt-3 text-sm leading-7 text-[#f7f2df]/82">
              Stage an arbitrary CSV, TSV, XLSX, or XLS file, then map its columns to record, time, place, relationship, evidence, and analysis roles.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <label className="peridot-button-primary cursor-pointer">
                Upload table or workbook
                <input type="file" accept=".csv,.tsv,.xlsx,.xls,text/csv,text/tab-separated-values" onChange={handleColumnMappingTableUpload} className="sr-only" />
              </label>
              {columnMappingStaging ? (
                <button type="button" onClick={clearColumnMappingStaging} className="peridot-button-secondary">
                  Clear staged table
                </button>
              ) : null}
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="peridot-surface-card peridot-card-inner">
            <p className="peridot-section-label">Step 1</p>
            <h3 className="mt-2 text-lg font-bold text-[#fbf7ea]">Upload or stage</h3>
            <p className="mt-2 text-sm leading-6 text-[#f7f2df]/78">Start with the standard template or bring an existing research table.</p>
          </div>
          <div className="peridot-surface-card peridot-card-inner">
            <p className="peridot-section-label">Step 2</p>
            <h3 className="mt-2 text-lg font-bold text-[#fbf7ea]">Map columns</h3>
            <p className="mt-2 text-sm leading-6 text-[#f7f2df]/78">Match your columns to the roles Peridot uses for records, time, places, relationships, evidence, and analysis.</p>
          </div>
          <div className="peridot-surface-card peridot-card-inner">
            <p className="peridot-section-label">Step 3</p>
            <h3 className="mt-2 text-lg font-bold text-[#fbf7ea]">Validate and explore</h3>
            <p className="mt-2 text-sm leading-6 text-[#f7f2df]/78">Review capability reporting before moving into maps, networks, charts, and dossiers.</p>
          </div>
        </div>

        {columnMappingStaging ? (
          <div className="mt-6 peridot-cream-card peridot-card-inner">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="peridot-section-label">Staged table</p>
                <h2 className="mt-2 text-2xl font-bold text-[#26352b]">Table staged for mapping</h2>
                <p className="mt-2 text-sm leading-6 text-[#42533f]">
                  {columnMappingStaging.fileLabel} is staged as {columnMappingStaging.fileType || 'a table'} with {columnMappingStaging.rowCount || 0} rows and {columnMappingStaging.columnCount || 0} columns.
                </p>
              </div>
              <button
                type="button"
                onClick={openColumnMappingModal}
                disabled={columnMappingStaging.status !== 'ready'}
                className="peridot-button-primary disabled:cursor-not-allowed disabled:opacity-60"
              >
                Open mapping workspace
              </button>
            </div>
          </div>
        ) : null}

        {popup ? (
          <div className="mt-6 peridot-cream-card peridot-card-inner">
            <p className="peridot-section-label">Latest upload</p>
            <h2 className="mt-2 text-2xl font-bold text-[#26352b]">{popup.title || 'Latest upload summary'}</h2>
            {popup.intro ? <p className="mt-3 text-sm leading-6 text-[#42533f]">{popup.intro}</p> : null}
            {capabilityLines.length ? (
              <div className="mt-4 rounded-2xl border border-[#5f714a]/25 bg-[#eef3dd] p-4">
                <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-[#5c724d]">Visualization compatibility</h3>
                <ul className="mt-2 space-y-1 text-sm leading-6 text-[#42533f]">
                  {capabilityLines.map((line) => <li key={line}>• {line}</li>)}
                </ul>
              </div>
            ) : null}
            {warningLines.length ? (
              <div className="mt-4 rounded-2xl border border-[#b58b42]/40 bg-[#fff4d8] p-4">
                <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-[#735726]">Warnings</h3>
                <ul className="mt-2 space-y-1 text-sm leading-6 text-[#51422a]">
                  {warningLines.map((line) => <li key={line}>• {line}</li>)}
                </ul>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </section>
  );
}
