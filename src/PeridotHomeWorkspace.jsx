import React from 'react';

function HomeTextureBackdrop() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <div className="absolute inset-0 bg-[#03120c]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_22%_20%,rgba(99,136,99,0.18),transparent_24%),radial-gradient(circle_at_72%_24%,rgba(67,102,79,0.16),transparent_28%),radial-gradient(circle_at_50%_54%,rgba(124,153,95,0.10),transparent_26%),linear-gradient(135deg,#02110b_0%,#041a12_44%,#02110b_100%)]" />
      <div className="absolute inset-[-10%] opacity-50 blur-3xl bg-[linear-gradient(90deg,transparent_0%,rgba(171,208,170,0.08)_16%,transparent_30%,rgba(110,148,116,0.10)_52%,transparent_70%,rgba(171,208,170,0.06)_100%)]" />
      <div className="absolute inset-0 opacity-[0.08] bg-[repeating-linear-gradient(135deg,rgba(228,239,218,0.18)_0px,rgba(228,239,218,0.18)_1px,transparent_1px,transparent_12px)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(1,10,7,0.10)_55%,rgba(1,10,7,0.38)_100%)]" />
    </div>
  );
}

const primaryActionCardClass = [
  'group rounded-[28px] border border-[#4f7440] bg-[#5f814c] p-6 text-left text-[#fbf9ec]',
  'shadow-[0_18px_38px_rgba(0,0,0,0.30)] transition-all duration-150',
  'hover:-translate-y-0.5 hover:border-[#b69665] hover:bg-[#9a7b4b] hover:text-[#fff7df]',
  'focus:outline-none focus:ring-2 focus:ring-[#d7bd7a]/70',
].join(' ');

export function PeridotHomeWorkspace({ onUploadData, onUseSampleData }) {
  return (
    <section className="relative flex h-full min-h-0 items-center justify-center overflow-hidden bg-[#03120c] px-6 py-10 text-[var(--text-main)]">
      <HomeTextureBackdrop />

      <div className="relative z-10 w-full max-w-5xl rounded-[36px] border border-[#d8e4d7]/68 bg-[#082016]/74 p-8 text-[#f4f6df] shadow-[0_34px_90px_rgba(0,0,0,0.58)] ring-1 ring-[#d8e8b2]/18 backdrop-blur-[7px] md:p-12">
        <div className="max-w-3xl">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.24em] text-[#c8dc8d]">
            Correspondence data exploration
          </p>
          <h1 className="[font-family:Georgia,'Palatino_Linotype','Book_Antiqua',Palatino,serif] text-5xl font-bold leading-tight tracking-[-0.04em] text-[#f7f2d8] drop-shadow-[0_2px_12px_rgba(0,0,0,0.45)] md:text-7xl">
            Peridot
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-[#e8edcf] drop-shadow-[0_1px_8px_rgba(0,0,0,0.35)] md:text-xl">
            Explore historical correspondence as maps, networks, timelines, charts, searchable records, and evidence dossiers. Start with your own data or open the built-in sample dataset.
          </p>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-2">
          <button
            type="button"
            onClick={onUploadData}
            className={primaryActionCardClass}
          >
            <span className="block text-sm font-semibold uppercase tracking-[0.18em] text-[#dfeec2] transition-colors group-hover:text-[#fff1bd]">
              Start with your corpus
            </span>
            <span className="mt-3 block text-xl font-bold">Upload my data</span>
            <span className="mt-3 block text-sm leading-6 text-[#f4f4df] transition-colors group-hover:text-[#fff8df]">
              Open the Data workspace to download the template, upload a completed Peridot CSV, or map columns from CSV, TSV, XLSX, and XLS files.
            </span>
          </button>

          <button
            type="button"
            onClick={onUseSampleData}
            className={primaryActionCardClass}
          >
            <span className="block text-sm font-semibold uppercase tracking-[0.18em] text-[#dfeec2] transition-colors group-hover:text-[#fff1bd]">
              Preview the workspace
            </span>
            <span className="mt-3 block text-xl font-bold">Use sample data</span>
            <span className="mt-3 block text-sm leading-6 text-[#f4f4df] transition-colors group-hover:text-[#fff8df]">
              Enter the current visualization workspace with Peridot&apos;s embedded sample correspondence dataset already loaded.
            </span>
          </button>
        </div>

        <div className="mt-10 grid gap-y-5 md:grid-cols-3 md:gap-x-8">
          <div className="p-1 md:pr-4">
            <strong className="block text-base font-semibold text-[#fbf6d9]">Map and network views</strong>
            <p className="mt-2 text-sm leading-7 text-[#d7e3c0]">
              Explore correspondence through places, people, and force-directed networks.
            </p>
          </div>
          <div className="p-1 md:border-l md:border-[#d7e3c0]/20 md:pl-6">
            <strong className="block text-base font-semibold text-[#fbf6d9]">Search and chart records</strong>
            <p className="mt-2 text-sm leading-7 text-[#d7e3c0]">
              Filter, summarize, and visualize the active dataset through research-oriented controls.
            </p>
          </div>
          <div className="p-1 md:border-l md:border-[#d7e3c0]/20 md:pl-6">
            <strong className="block text-base font-semibold text-[#fbf6d9]">Inspect evidence</strong>
            <p className="mt-2 text-sm leading-7 text-[#d7e3c0]">
              Move from visual patterns to linked people, places, routes, letters, and metadata.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
