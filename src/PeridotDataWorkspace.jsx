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
    <section className="h-full overflow-auto bg-[linear-gradient(135deg,var(--shell-bg),var(--panel-bg))] px-6 py-8 text-[var(--text-main)]">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <div className="rounded-[32px] border border-[var(--panel-card-border)]/80 bg-[var(--panel-card-bg)]/94 p-7 shadow-[0_22px_54px_rgba(0,0,0,0.28)]">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
            Data workspace
          </p>
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="[font-family:Georgia,'Palatino_Linotype','Book_Antiqua',Palatino,serif] text-4xl font-bold tracking-[-0.03em] text-[var(--heading-text)] md:text-5xl">
                Start with correspondence records
              </h1>
              <p className="mt-4 max-w-3xl text-base leading-7 text-[var(--panel-card-muted-text)]">
                Upload a CSV, TSV, XLSX, or XLS table or workbook, then map it to Peridot's core fields. Peridot accepts incomplete historical data and reports which records can support Inspector, map, timeline, Analytics, and export workflows.
              </p>
            </div>
            <button
              type="button"
              onClick={onOpenVisualizations}
              className="rounded-xl border border-[var(--button-secondary-border)] bg-[var(--button-secondary-bg)] px-4 py-3 text-sm font-semibold text-[var(--button-secondary-text)] transition hover:bg-[var(--button-secondary-hover)]"
            >
              Open visualizations
            </button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-[28px] border border-[var(--section-border)] bg-[var(--section-bg)] p-6 shadow-[0_16px_36px_rgba(0,0,0,0.22)]">
            <h2 className="text-xl font-bold text-[var(--heading-text)]">Peridot template</h2>
            <p className="mt-3 text-sm leading-6 text-[var(--panel-card-muted-text)]">
              Download the standard Peridot CSV template when each row represents one letter, document, or correspondence record. Upload the completed CSV through the table/workbook uploader, where it can be reviewed and mapped before entering the main workspace.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleDownloadPeridotTemplate}
                className="rounded-xl border border-[var(--button-secondary-border)] bg-[var(--button-secondary-bg)] px-4 py-2 text-sm font-semibold text-[var(--button-secondary-text)] transition hover:bg-[var(--button-secondary-hover)]"
              >
                Download CSV template
              </button>
            </div>
            <p className="mt-4 text-sm text-[var(--panel-card-muted-text)]">
              Current source: <strong className="text-[var(--heading-text)]">{peridotFileLabel}</strong>
            </p>
          </div>

          <div className="rounded-[28px] border border-[var(--section-border)] bg-[var(--section-bg)] p-6 shadow-[0_16px_36px_rgba(0,0,0,0.22)]">
            <h2 className="text-xl font-bold text-[var(--heading-text)]">Map your own table</h2>
            <p className="mt-3 text-sm leading-6 text-[var(--panel-card-muted-text)]">
              Stage an arbitrary CSV, TSV, XLSX, or XLS file, then map its columns to Peridot's core fields and optional Inspector/Analytics metadata.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <label className="cursor-pointer rounded-xl border border-[var(--button-primary-border)] bg-[var(--button-primary-bg)] px-4 py-2 text-sm font-semibold text-[var(--button-primary-text)] transition hover:bg-[var(--button-primary-hover)]">
                Upload table or workbook
                <input type="file" accept=".csv,.tsv,.xlsx,.xls,text/csv,text/tab-separated-values" onChange={handleColumnMappingTableUpload} className="sr-only" />
              </label>
              {columnMappingStaging ? (
                <button
                  type="button"
                  onClick={clearColumnMappingStaging}
                  className="rounded-xl border border-[var(--button-secondary-border)] bg-[var(--button-secondary-bg)] px-4 py-2 text-sm font-semibold text-[var(--button-secondary-text)] transition hover:bg-[var(--button-secondary-hover)]"
                >
                  Clear staged table
                </button>
              ) : null}
            </div>
          </div>
        </div>

        {columnMappingStaging ? (
          <div className="rounded-[28px] border border-[var(--panel-card-border)]/80 bg-[var(--panel-card-bg)] p-6 shadow-[0_16px_36px_rgba(0,0,0,0.2)]">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-xl font-bold text-[var(--heading-text)]">Table staged for mapping</h2>
                <p className="mt-2 text-sm leading-6 text-[var(--panel-card-muted-text)]">
                  {columnMappingStaging.fileLabel} is staged as {columnMappingStaging.fileType || 'a table'} with {columnMappingStaging.rowCount || 0} rows and {columnMappingStaging.columnCount || 0} columns.
                </p>
              </div>
              <button
                type="button"
                onClick={openColumnMappingModal}
                disabled={columnMappingStaging.status !== 'ready'}
                className="rounded-xl border border-[var(--button-primary-border)] bg-[var(--button-primary-bg)] px-4 py-2 text-sm font-semibold text-[var(--button-primary-text)] transition hover:bg-[var(--button-primary-hover)] disabled:cursor-not-allowed disabled:opacity-60"
              >
                Open mapping workspace
              </button>
            </div>
          </div>
        ) : null}

        {popup ? (
          <div className="rounded-[28px] border border-[var(--panel-card-border)]/80 bg-[var(--panel-card-bg)] p-6 shadow-[0_16px_36px_rgba(0,0,0,0.2)]">
            <h2 className="text-xl font-bold text-[var(--heading-text)]">{popup.title || 'Latest upload summary'}</h2>
            {popup.intro ? (
              <p className="mt-3 text-sm leading-6 text-[var(--panel-card-muted-text)]">{popup.intro}</p>
            ) : null}
            {capabilityLines.length ? (
              <div className="mt-4">
                <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-[var(--accent)]">Visualization compatibility</h3>
                <ul className="mt-2 space-y-1 text-sm leading-6 text-[var(--panel-card-muted-text)]">
                  {capabilityLines.map((line) => (
                    <li key={line}>• {line}</li>
                  ))}
                </ul>
              </div>
            ) : null}
            {warningLines.length ? (
              <div className="mt-4 rounded-2xl border border-[var(--panel-card-border)]/70 bg-[var(--panel-card-bg)] p-4">
                <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-[var(--accent)]">Warnings</h3>
                <ul className="mt-2 space-y-1 text-sm leading-6 text-[var(--panel-card-muted-text)]">
                  {warningLines.map((line) => (
                    <li key={line}>• {line}</li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </section>
  );
}
