import React from 'react';

function exportButtonClassName(variant = 'secondary') {
  const base = 'rounded-[22px] px-5 py-4 text-left text-sm font-semibold transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[#d6a36a]/60';
  if (variant === 'primary') {
    return `${base} border border-[#f2ead5]/70 bg-[#f2ead5] text-[#243222] shadow-[0_12px_24px_rgba(10,18,12,0.22)] hover:border-[#f2ead5] hover:bg-[#b58b42] hover:text-[#fff8e8] hover:shadow-[0_14px_30px_rgba(86,52,22,0.32)] hover:-translate-y-0.5`;
  }
  return `${base} border border-[#dfe9c8]/35 bg-[#dfe9c8]/10 text-[#f7f2df] hover:border-[#f2ead5]/80 hover:bg-[#b58b42] hover:text-[#fff8e8] hover:shadow-[0_14px_30px_rgba(86,52,22,0.30)] hover:-translate-y-0.5`;
}

function scopeRow(label, value) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-[#dfe9c8]/15 py-2 last:border-b-0">
      <dt className="text-xs font-semibold uppercase tracking-[0.14em] text-[#dfe9c8]/70">{label}</dt>
      <dd className="text-right text-sm font-semibold text-[#fbf7ea]">{value}</dd>
    </div>
  );
}

export function PeridotExportWorkspace({
  pageTitle,
  mapStageProps,
  MapStageComponent,
  viewMode,
  search,
  currentMinCountLabel,
  currentRangeLabel,
  graph,
  exportStatus,
  handleExportSvg,
  handleExportPng,
  handleExportEdgesCsv,
  handleExportNodesCsv,
  onOpenVisualizations,
}) {
  const viewLabel = viewMode === 'geographic' ? 'Place map / geographic records' : 'People network';
  const nodeCount = graph?.nodes?.length ?? 0;
  const routeCount = graph?.edges?.length ?? 0;

  return (
    <section className="peridot-workspace-field flex h-full min-h-0 flex-col overflow-hidden text-[#fbf7ea]">
      <div className="relative z-[1] flex h-full min-h-0 flex-col">
        <header className="shrink-0 px-6 py-4 pl-[76px] sm:pl-[80px]">
          <div className="rounded-[28px] border border-[#c4e0ef]/60 bg-[linear-gradient(135deg,rgba(8,39,25,0.95),rgba(5,29,19,0.96))] px-5 py-4 shadow-[0_18px_46px_rgba(0,0,0,0.32)]">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="peridot-kicker !mb-0 text-[11px]">Output workspace</p>
                <h1 className="mt-1 [font-family:Georgia,'Palatino_Linotype','Book_Antiqua',Palatino,serif] text-3xl font-bold tracking-[-0.035em] text-[#f5ecd2]">Export</h1>
              </div>
              <button type="button" onClick={onOpenVisualizations} className="peridot-button-secondary">
                Return to visualizations
              </button>
            </div>
          </div>
        </header>

        <div className="grid min-h-0 flex-1 gap-4 overflow-hidden px-4 pb-4 lg:grid-cols-[minmax(320px,420px)_minmax(0,1fr)]">
          <aside className="min-h-0 overflow-y-auto rounded-[30px] border border-[#dfe9c8]/35 bg-[rgba(8,39,25,0.88)] p-5 text-[#fbf7ea] shadow-[0_18px_42px_rgba(0,0,0,0.32)] backdrop-blur-sm">
            <div>
              <p className="peridot-section-label">Current output target</p>
              <h2 className="mt-2 text-2xl font-bold tracking-[-0.02em]">{pageTitle || 'Peridot visualization'}</h2>
              <p className="mt-2 text-sm leading-6 text-[#f7f2df]/78">
                Export the current visualization state as an image, or export the currently derived nodes and routes as CSV tables.
              </p>
            </div>

            <div className="mt-5 grid gap-3">
              <button type="button" onClick={handleExportSvg} className={exportButtonClassName('primary')}>
                <span className="block text-base">Export SVG</span>
                <span className="mt-1 block text-xs font-medium leading-5 text-[#34452a]/75">Best for scalable vector editing and archival diagrams.</span>
              </button>
              <button type="button" onClick={handleExportPng} className={exportButtonClassName('primary')}>
                <span className="block text-base">Export PNG</span>
                <span className="mt-1 block text-xs font-medium leading-5 text-[#34452a]/75">Best for slides, quick sharing, and static image use.</span>
              </button>
              <button type="button" onClick={handleExportEdgesCsv} className={exportButtonClassName()}>
                <span className="block text-base">Routes CSV</span>
                <span className="mt-1 block text-xs font-medium leading-5 text-[#f7f2df]/70">Download the current derived route records.</span>
              </button>
              <button type="button" onClick={handleExportNodesCsv} className={exportButtonClassName()}>
                <span className="block text-base">Nodes CSV</span>
                <span className="mt-1 block text-xs font-medium leading-5 text-[#f7f2df]/70">Download the current derived entity/place nodes.</span>
              </button>
            </div>

            <div className="mt-6 rounded-[24px] border border-[#dfe9c8]/25 bg-[#dfe9c8]/10 p-4">
              <h3 className="peridot-section-label">Current export scope</h3>
              <dl className="mt-3">
                {scopeRow('View', viewLabel)}
                {scopeRow('Search', String(search || '').trim() || 'None')}
                {scopeRow('Minimum weight', currentMinCountLabel || 'Current setting')}
                {scopeRow('Date window', currentRangeLabel || 'Current range')}
                {scopeRow('Nodes in view', nodeCount.toLocaleString())}
                {scopeRow('Routes in view', routeCount.toLocaleString())}
              </dl>
            </div>

            {exportStatus ? (
              <div className="mt-4 rounded-[24px] border border-[#f2ead5]/35 bg-[#f2ead5]/12 p-4 text-sm text-[#fbf7ea]">
                <p className="font-semibold">{exportStatus.message}</p>
                {exportStatus.filename ? <p className="mt-2 text-[#f7f2df]/75">File: {exportStatus.filename}</p> : null}
                {typeof exportStatus.bytes === 'number' ? <p className="text-[#f7f2df]/75">Size: {exportStatus.bytes.toLocaleString()} bytes</p> : null}
                {exportStatus.timestamp ? <p className="text-[#f7f2df]/75">Time: {exportStatus.timestamp}</p> : null}
              </div>
            ) : null}
          </aside>

          <div className="flex min-h-0 flex-col overflow-hidden rounded-[30px] border border-[#c4e0ef]/50 bg-[#edf3dd] shadow-[0_18px_48px_rgba(0,0,0,0.28)]">
            <div className="shrink-0 border-b border-[#bacaa6]/50 bg-[#f6f1df] px-5 py-3 text-[#263a2c]">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#596b48]">Preview used for image export</p>
            </div>
            <div className="min-h-0 flex-1 overflow-hidden">
              {MapStageComponent ? <MapStageComponent {...mapStageProps} /> : null}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
