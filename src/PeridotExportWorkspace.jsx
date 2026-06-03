import React from 'react';

function exportButtonClassName(variant = 'secondary') {
  const base = 'rounded-2xl px-5 py-4 text-left text-sm font-semibold transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[#dfe9c8]/60 focus:ring-offset-2 focus:ring-offset-[#223326]';
  if (variant === 'primary') {
    return `${base} border border-[#f2ead5]/70 bg-[#f2ead5] text-[#243222] shadow-[0_12px_24px_rgba(10,18,12,0.22)] hover:bg-[#fff8e8]`;
  }
  return `${base} border border-[#dfe9c8]/45 bg-[#dfe9c8]/10 text-[#f7f2df] hover:border-[#f2ead5]/70 hover:bg-[#dfe9c8]/18`;
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
  const viewLabel = viewMode === 'geographic' ? 'Place map / geographic routes' : 'People network';
  const nodeCount = graph?.nodes?.length ?? 0;
  const routeCount = graph?.edges?.length ?? 0;

  return (
    <div className="flex h-full min-h-0 flex-col bg-[var(--shell-bg)]">
      <header className="shrink-0 bg-[#263a2c] px-6 py-4 pl-[76px] text-[#fbf7ea] shadow-[0_10px_28px_rgba(19,31,24,0.22)] sm:pl-[80px]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#dfe9c8]/75">Output workspace</p>
            <h1 className="mt-1 text-2xl font-bold tracking-[-0.02em]">Export</h1>
          </div>
          <button
            type="button"
            onClick={onOpenVisualizations}
            className="rounded-full border border-[#dfe9c8]/45 px-4 py-2 text-sm font-semibold text-[#fbf7ea] transition-colors hover:border-[#f2ead5]/70 hover:bg-[#dfe9c8]/12"
          >
            Return to visualizations
          </button>
        </div>
      </header>

      <section className="grid min-h-0 flex-1 gap-4 overflow-hidden p-4 lg:grid-cols-[minmax(320px,420px)_minmax(0,1fr)]">
        <aside className="min-h-0 overflow-y-auto rounded-[30px] border border-[#dfe9c8]/35 bg-[#263a2c] p-5 text-[#fbf7ea] shadow-[0_18px_36px_rgba(18,28,20,0.28)]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#dfe9c8]/70">Current output target</p>
            <h2 className="mt-2 text-xl font-bold tracking-[-0.02em]">{pageTitle || 'Peridot visualization'}</h2>
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
              <span className="mt-1 block text-xs font-medium leading-5 text-[#f7f2df]/70">Download the current derived correspondence routes.</span>
            </button>
            <button type="button" onClick={handleExportNodesCsv} className={exportButtonClassName()}>
              <span className="block text-base">Nodes CSV</span>
              <span className="mt-1 block text-xs font-medium leading-5 text-[#f7f2df]/70">Download the current derived people/place nodes.</span>
            </button>
          </div>

          <div className="mt-6 rounded-2xl border border-[#dfe9c8]/25 bg-[#152118]/30 p-4">
            <h3 className="text-sm font-bold uppercase tracking-[0.14em] text-[#dfe9c8]/75">Current export scope</h3>
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
            <div className="mt-4 rounded-2xl border border-[#f2ead5]/35 bg-[#f2ead5]/12 p-4 text-sm text-[#fbf7ea]">
              <p className="font-semibold">{exportStatus.message}</p>
              {exportStatus.filename ? <p className="mt-2 text-[#f7f2df]/75">File: {exportStatus.filename}</p> : null}
              {typeof exportStatus.bytes === 'number' ? (
                <p className="text-[#f7f2df]/75">Size: {exportStatus.bytes.toLocaleString()} bytes</p>
              ) : null}
              {exportStatus.timestamp ? <p className="text-[#f7f2df]/75">Time: {exportStatus.timestamp}</p> : null}
            </div>
          ) : null}
        </aside>

        <div className="flex min-h-0 flex-col overflow-hidden rounded-[30px] border border-[#bacaa6]/55 bg-[var(--map-panel-bg)] shadow-[0_18px_40px_rgba(0,0,0,0.18)]">
          <div className="shrink-0 border-b border-[#bacaa6]/50 bg-[#eef5df] px-5 py-3 text-[#263a2c]">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#596b48]">Preview used for image export</p>
          </div>
          <div className="min-h-0 flex-1 overflow-hidden">
            {MapStageComponent ? <MapStageComponent {...mapStageProps} /> : null}
          </div>
        </div>
      </section>
    </div>
  );
}
