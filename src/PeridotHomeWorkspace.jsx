/*
 * Home / welcome workspace.
 * 
 * This component provides the first-run entry point for Peridot. It introduces the app and routes users toward either uploading their own data or opening the embedded sample dataset.
 * 
 * Important relationships:
 * - Data upload routes to `PeridotDataWorkspace`.
 * - Sample-data entry routes to `PeridotVisualizationsWorkspace` while relying on embedded fallback data managed by `App.jsx`.
 * 
 * Maintenance cautions:
 * - Keep this page lightweight; it should orient users without duplicating detailed documentation that belongs in Learn More.
 */

import React from 'react';

import peridotLogoTransparent from '../assets/Peridot Logo Transparent.png';

function HomeTextureBackdrop() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <div className="absolute inset-0 bg-[var(--peridot-color-hex-03120c)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_22%_20%,var(--peridot-color-rgba-rgba-99-136-99-0-18),transparent_24%),radial-gradient(circle_at_72%_24%,var(--peridot-color-rgba-rgba-67-102-79-0-16),transparent_28%),radial-gradient(circle_at_50%_54%,var(--peridot-color-rgba-rgba-124-153-95-0-10),transparent_26%),linear-gradient(135deg,var(--peridot-role-interface-app-background)_0%,var(--peridot-role-interface-app-background-alt)_44%,var(--peridot-role-interface-app-background)_100%)]" />
      <div className="absolute inset-[-10%] opacity-50 blur-3xl bg-[linear-gradient(90deg,transparent_0%,var(--peridot-color-rgba-rgba-171-208-170-0-08)_16%,transparent_30%,var(--peridot-color-rgba-rgba-110-148-116-0-10)_52%,transparent_70%,var(--peridot-color-rgba-rgba-171-208-170-0-06)_100%)]" />
      <div className="absolute inset-0 opacity-[0.08] bg-[repeating-linear-gradient(135deg,var(--peridot-color-rgba-rgba-228-239-218-0-18)_0px,var(--peridot-color-rgba-rgba-228-239-218-0-18)_1px,transparent_1px,transparent_12px)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,var(--peridot-color-rgba-rgba-1-10-7-0-10)_55%,var(--peridot-color-rgba-rgba-1-10-7-0-38)_100%)]" />
    </div>
  );
}

const primaryActionCardClass = [
  'group rounded-[28px] border border-[var(--peridot-color-hex-4f7440)] bg-[var(--peridot-color-hex-5f814c)] p-6 text-left text-[var(--peridot-color-hex-fbf9ec)]',
  'shadow-[0_18px_38px_var(--peridot-color-rgba-rgba-0-0-0-0-30)] transition-all duration-150',
  'hover:-translate-y-0.5 hover:border-[var(--peridot-color-hex-b69665)] hover:bg-[var(--peridot-color-hex-9a7b4b)] hover:text-[var(--peridot-color-hex-fff7df)]',
  'focus:outline-none focus:ring-2 focus:ring-[var(--peridot-color-hex-d7bd7a-a70)]',
].join(' ');

export function PeridotHomeWorkspace({ onUploadData, onUseSampleData }) {
  return (
    <section className="relative flex h-full min-h-0 items-center justify-center overflow-hidden bg-[var(--peridot-color-hex-03120c)] px-6 py-10 text-[var(--text-main)]">
      <HomeTextureBackdrop />

      <div className="relative z-10 w-full max-w-5xl rounded-[36px] border border-[var(--peridot-color-hex-d8e4d7-a68)] bg-[var(--peridot-color-hex-082016-a74)] p-8 text-[var(--peridot-color-hex-f4f6df)] shadow-[0_34px_90px_var(--peridot-color-rgba-rgba-0-0-0-0-58)] ring-1 ring-[var(--peridot-color-hex-d8e8b2-a18)] backdrop-blur-[7px] md:p-12">
        <div className="max-w-3xl">
          <p className="mb-5 text-sm font-semibold uppercase tracking-[0.24em] text-[var(--peridot-color-hex-c8dc8d)]">
            Humanistic data exploration
          </p>
          <div className="peridot-home-logo-lockup" aria-label="Peridot">
            <img
              src={peridotLogoTransparent}
              alt="Peridot"
              className="peridot-home-logo"
            />
          </div>
          <h1 className="sr-only">Peridot</h1>
          <p className="mt-7 max-w-2xl text-lg leading-8 text-[var(--peridot-color-hex-e8edcf)] drop-shadow-[0_1px_8px_var(--peridot-color-rgba-rgba-0-0-0-0-35)] md:text-xl">
            Explore historical and humanistic records as maps, networks, timelines, charts, searchable data, and evidence dossiers. Start with your own dataset or open the built-in sample correspondence dataset.
          </p>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-2">
          <button
            type="button"
            onClick={onUploadData}
            className={primaryActionCardClass}
          >
            <span className="block text-sm font-semibold uppercase tracking-[0.18em] text-[var(--peridot-color-hex-dfeec2)] transition-colors group-hover:text-[var(--peridot-color-hex-fff1bd)]">
              Start with your dataset
            </span>
            <span className="mt-3 block text-xl font-bold">Upload my data</span>
            <span className="mt-3 block text-sm leading-6 text-[var(--peridot-color-hex-f4f4df)] transition-colors group-hover:text-[var(--peridot-color-hex-fff8df)]">
              Open the Data workspace to download the template, upload a completed Peridot CSV, or map columns from CSV, TSV, XLSX, and XLS files.
            </span>
          </button>

          <button
            type="button"
            onClick={onUseSampleData}
            className={primaryActionCardClass}
          >
            <span className="block text-sm font-semibold uppercase tracking-[0.18em] text-[var(--peridot-color-hex-dfeec2)] transition-colors group-hover:text-[var(--peridot-color-hex-fff1bd)]">
              Preview the workspace
            </span>
            <span className="mt-3 block text-xl font-bold">Use sample data</span>
            <span className="mt-3 block text-sm leading-6 text-[var(--peridot-color-hex-f4f4df)] transition-colors group-hover:text-[var(--peridot-color-hex-fff8df)]">
              Enter the visualization workspace with Peridot&apos;s embedded sample dataset already loaded.
            </span>
          </button>
        </div>

        <div className="mt-10 grid gap-y-5 md:grid-cols-3 md:gap-x-8">
          <div className="p-1 md:pr-4">
            <strong className="block text-base font-semibold text-[var(--peridot-color-hex-fbf6d9)]">Map and network views</strong>
            <p className="mt-2 text-sm leading-7 text-[var(--peridot-color-hex-d7e3c0)]">
              Explore point maps, route maps, entity networks, and force-directed relationship views when your data supports them.
            </p>
          </div>
          <div className="p-1 md:border-l md:border-[var(--peridot-color-hex-d7e3c0-a20)] md:pl-6">
            <strong className="block text-base font-semibold text-[var(--peridot-color-hex-fbf6d9)]">Search and chart records</strong>
            <p className="mt-2 text-sm leading-7 text-[var(--peridot-color-hex-d7e3c0)]">
              Filter, summarize, and visualize the active dataset through research-oriented controls.
            </p>
          </div>
          <div className="p-1 md:border-l md:border-[var(--peridot-color-hex-d7e3c0-a20)] md:pl-6">
            <strong className="block text-base font-semibold text-[var(--peridot-color-hex-fbf6d9)]">Inspect evidence</strong>
            <p className="mt-2 text-sm leading-7 text-[var(--peridot-color-hex-d7e3c0)]">
              Move from visual patterns to linked entities, places, routes, records, and metadata.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
