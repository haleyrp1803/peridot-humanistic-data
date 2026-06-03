import React from 'react';

export function PeridotHomeWorkspace({ onUploadData, onUseSampleData }) {
  return (
    <section className="flex h-full min-h-0 items-center justify-center overflow-auto bg-[radial-gradient(circle_at_top_left,rgba(245,237,216,0.22),transparent_34%),linear-gradient(135deg,var(--shell-bg),var(--panel-bg))] px-6 py-10 text-[var(--text-main)]">
      <div className="w-full max-w-5xl rounded-[36px] border border-[var(--panel-card-border)]/80 bg-[var(--panel-card-bg)]/92 p-8 shadow-[0_28px_70px_rgba(0,0,0,0.34)] backdrop-blur-sm md:p-12">
        <div className="max-w-3xl">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.24em] text-[var(--accent)]">
            Correspondence data exploration
          </p>
          <h1 className="[font-family:Georgia,'Palatino_Linotype','Book_Antiqua',Palatino,serif] text-5xl font-bold leading-tight tracking-[-0.04em] text-[var(--heading-text)] md:text-7xl">
            Peridot
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-[var(--panel-card-muted-text)] md:text-xl">
            Explore historical correspondence as maps, networks, timelines, charts, searchable records, and evidence dossiers. Start with your own data or open the built-in sample dataset.
          </p>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-2">
          <button
            type="button"
            onClick={onUploadData}
            className="group rounded-[28px] border border-[var(--button-primary-border)] bg-[var(--button-primary-bg)] p-6 text-left text-[var(--button-primary-text)] shadow-[0_18px_38px_rgba(0,0,0,0.28)] transition-all duration-150 hover:-translate-y-0.5 hover:bg-[var(--button-primary-hover)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50"
          >
            <span className="block text-sm font-semibold uppercase tracking-[0.18em] opacity-80">
              Start with your corpus
            </span>
            <span className="mt-3 block text-xl font-bold">Upload my data</span>
            <span className="mt-3 block text-sm leading-6 opacity-85">
              Open the Data workspace to download the template, upload a completed Peridot CSV, or map columns from CSV, TSV, XLSX, and XLS files.
            </span>
          </button>

          <button
            type="button"
            onClick={onUseSampleData}
            className="group rounded-[28px] border border-[var(--section-border)] bg-[var(--section-bg)] p-6 text-left text-[var(--text-main)] shadow-[0_18px_38px_rgba(0,0,0,0.22)] transition-all duration-150 hover:-translate-y-0.5 hover:bg-[var(--panel-card-hover)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50"
          >
            <span className="block text-sm font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">
              Preview the workspace
            </span>
            <span className="mt-3 block text-xl font-bold text-[var(--heading-text)]">Use sample data</span>
            <span className="mt-3 block text-sm leading-6 text-[var(--panel-card-muted-text)]">
              Enter the current visualization workspace with Peridot's embedded sample correspondence dataset already loaded.
            </span>
          </button>
        </div>

        <div className="mt-10 grid gap-4 text-sm leading-6 text-[var(--panel-card-muted-text)] md:grid-cols-3">
          <div className="rounded-2xl border border-[var(--panel-card-border)]/70 bg-[var(--panel-card-bg)] p-4">
            <strong className="block text-[var(--heading-text)]">Map and network views</strong>
            Explore correspondence through places, people, and force-directed networks.
          </div>
          <div className="rounded-2xl border border-[var(--panel-card-border)]/70 bg-[var(--panel-card-bg)] p-4">
            <strong className="block text-[var(--heading-text)]">Search and chart records</strong>
            Filter, summarize, and visualize the active dataset through research-oriented controls.
          </div>
          <div className="rounded-2xl border border-[var(--panel-card-border)]/70 bg-[var(--panel-card-bg)] p-4">
            <strong className="block text-[var(--heading-text)]">Inspect evidence</strong>
            Move from visual patterns to linked people, places, routes, letters, and metadata.
          </div>
        </div>
      </div>
    </section>
  );
}
