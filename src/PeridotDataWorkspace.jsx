/*
 * Data-management workspace.
 *
 * This component renders the public data-ingestion surface: template download,
 * sample-data entry, generalized table/workbook upload, mapping launch/editing,
 * staging summaries, and navigation into Visualizations.
 *
 * Important relationships:
 * - Parsing and normalization live in `peridotCsv*`, `peridotColumnMapping`, and
 *   `peridotWorkbook*` helpers, not here.
 * - `App.jsx` owns file input handlers, active mapped-source state, and transient
 *   mapping staging; this component only presents those actions and states.
 *
 * Maintenance cautions:
 * - The public landing surface intentionally has only three primary choices:
 *   template, sample data, and user data. Do not reintroduce profile selectors or
 *   experimental mapper entry points now that generalized mapping is authoritative.
 */

import React, { useEffect, useRef, useState } from 'react';
import dataDividerFiligree from '../assets/Adobe Stock Filigree 3.png';

export function PeridotDataWorkspace({
  peridotFileLabel,
  columnMappingStaging,
  activeMappedDataSource,
  handleDownloadPeridotTemplate,
  handleColumnMappingTableUpload,
  openColumnMappingModal,
  openActiveMappedDataEditor,
  clearColumnMappingStaging,
  onUseSampleData,
  sampleChooserOpen = false,
  sampleDatasets = [],
  onCloseSampleChooser,
  onExploreSample,
  onEditSampleMapping,
  sampleLoadingId = '',
  activeSampleDataSource = null,
}) {
  const sampleMenuRef = useRef(null);
  const [expandedSampleId, setExpandedSampleId] = useState('');
  const [sampleCascadeActive, setSampleCascadeActive] = useState(false);
  const [sampleMenuRequestedHere, setSampleMenuRequestedHere] = useState(false);
  const sampleMenuVisible = sampleChooserOpen && sampleMenuRequestedHere;

  useEffect(() => {
    if (!sampleMenuVisible) {
      setExpandedSampleId('');
      setSampleCascadeActive(false);
      return undefined;
    }

    const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    let cascadeFrame = null;

    if (prefersReducedMotion) {
      setSampleCascadeActive(true);
    } else {
      setSampleCascadeActive(false);
      cascadeFrame = window.requestAnimationFrame(() => {
        setSampleCascadeActive(true);
      });
    }

    const handlePointerDown = (event) => {
      if (sampleMenuRef.current && !sampleMenuRef.current.contains(event.target)) {
        onCloseSampleChooser?.();
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onCloseSampleChooser?.();
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      if (cascadeFrame) window.cancelAnimationFrame(cascadeFrame);
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [sampleMenuVisible, onCloseSampleChooser]);

  return (
    <section className="peridot-workspace-field flex min-h-full items-center text-[var(--peridot-color-hex-fbf7ea)]">
      <div className={`peridot-workspace-frame w-full transform-gpu transition-transform duration-[1150ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
        sampleMenuVisible
          ? "-translate-y-[4.75rem] md:-translate-y-[5.5rem]"
          : "translate-y-0"
      }`}>
        <div className="peridot-appear-rise peridot-appear-delay-0 peridot-hero-card !py-8 md:!py-9">
          <div>
            <p className="peridot-kicker">Data workspace</p>
            <h1 className="peridot-title-medium">Choose what data to use.</h1>
            <div className="mt-4 w-full space-y-3 text-base leading-7 text-[var(--peridot-role-interface-text-on-dark)]/90">
              <p>
                To use your own data in Peridot, please upload it as a CSV, TSV, XLS, or XLSX file. We'll help you assign variable roles that work best for your project, whether you are working with qualitative or quantitative information.
              </p>
              <p>
                Not sure where to start? Feel free to download a sample spreadsheet and adapt it to your data, or explore what Peridot can do with our sample data.
              </p>
            </div>
          </div>
        </div>

        <div className="relative left-1/2 mt-6 mb-6 w-[calc(100%+4rem)] max-w-[calc(100vw-3rem)] -translate-x-1/2" aria-hidden="true">
          <img
            src={dataDividerFiligree}
            alt=""
            className="peridot-appear-soft peridot-appear-delay-1 block h-auto w-full select-none object-contain opacity-95 drop-shadow-[0_12px_22px_var(--peridot-role-card-shadow)]"
            draggable="false"
          />
        </div>

        <div className="flex flex-wrap items-center justify-center gap-8">
          <div className="peridot-appear-rise peridot-appear-delay-2">
            <button
              type="button"
              onClick={handleDownloadPeridotTemplate}
              className="peridot-button-cream min-w-[18rem] whitespace-nowrap px-8 py-7 !border-[var(--peridot-data-button-border)] !bg-[var(--peridot-data-button-bg)] !text-[18px] !text-[var(--peridot-data-button-text)] hover:!border-[var(--peridot-role-ornament-corner)] hover:!bg-[linear-gradient(135deg,var(--peridot-role-button-primary-hover-bg),var(--peridot-role-ornament-line))] hover:!text-[var(--peridot-role-button-primary-text)] leading-tight"
              style={{
                '--peridot-data-button-bg': '#0f2912',
                '--peridot-data-button-border': 'var(--peridot-role-ornament-corner-muted)',
                '--peridot-data-button-text': 'color-mix(in srgb, var(--peridot-role-ornament-sparkle) 82%, #fff8e8 18%)',
              }}
            >
              Start with a Template
            </button>
          </div>

          <div ref={sampleMenuRef} className="peridot-appear-rise peridot-appear-delay-3 relative z-30">
            <button
              type="button"
              onClick={() => {
                if (sampleMenuVisible) {
                  setSampleMenuRequestedHere(false);
                  onCloseSampleChooser?.();
                } else {
                  setSampleMenuRequestedHere(true);
                  if (!sampleChooserOpen) onUseSampleData?.();
                }
              }}
              aria-expanded={sampleMenuVisible}
              aria-haspopup="menu"
              className="peridot-button-cream min-w-[18rem] whitespace-nowrap px-8 py-7 !border-[var(--peridot-data-button-border)] !bg-[var(--peridot-data-button-bg)] !text-[18px] !text-[var(--peridot-data-button-text)] hover:!border-[var(--peridot-role-ornament-corner)] hover:!bg-[linear-gradient(135deg,var(--peridot-role-button-primary-hover-bg),var(--peridot-role-ornament-line))] hover:!text-[var(--peridot-role-button-primary-text)] leading-tight"
              style={{
                '--peridot-data-button-bg': '#0f2912',
                '--peridot-data-button-border': 'var(--peridot-role-ornament-corner-muted)',
                '--peridot-data-button-text': 'color-mix(in srgb, var(--peridot-role-ornament-sparkle) 82%, #fff8e8 18%)',
              }}
            >
              Start with Sample Data <span aria-hidden="true" className="ml-1 text-sm">{sampleMenuVisible ? '▴' : '▾'}</span>
            </button>

            {sampleMenuVisible ? (
              <div
                role="menu"
                aria-label="Choose sample data"
                className="absolute left-1/2 top-[calc(100%+0.5rem)] z-40 w-[min(38rem,calc(100vw-2rem))] -translate-x-1/2 overflow-hidden rounded-2xl border border-[var(--peridot-role-ornament-corner-muted)] bg-[#0b2f12] text-left text-[var(--peridot-role-interface-text-on-dark)] shadow-[0_20px_45px_var(--peridot-role-card-shadow)]"
              >
                <div
                  className="border-b border-[var(--peridot-role-ornament-line)]/45 px-5 py-4 motion-reduce:!translate-y-0 motion-reduce:!opacity-100 motion-reduce:!transition-none"
                  style={{
                    opacity: sampleCascadeActive ? 1 : 0,
                    transform: `translateY(${sampleCascadeActive ? '0' : '-12px'})`,
                    transition: 'opacity 420ms ease-out 70ms, transform 620ms cubic-bezier(0.22, 0.72, 0.22, 1) 70ms',
                  }}
                >
                  <p className="peridot-kicker !mb-0">Choose sample data</p>
                </div>

                <div className="divide-y divide-[var(--peridot-role-ornament-line)]/30">
                  {sampleDatasets.map((sample, sampleIndex) => {
                    const isLoading = sampleLoadingId === sample.id;
                    const isExpanded = expandedSampleId === sample.id;
                    return (
                      <div
                        key={sample.id}
                        role="none"
                        className="px-5 py-4 transition hover:bg-white/[0.035] motion-reduce:!translate-y-0 motion-reduce:!opacity-100 motion-reduce:!transition-none"
                        style={{
                          opacity: sampleCascadeActive ? 1 : 0,
                          transform: `translateY(${sampleCascadeActive ? '0' : '-18px'})`,
                          transition: `opacity 520ms ease-out ${260 + sampleIndex * 245}ms, transform 760ms cubic-bezier(0.22, 0.72, 0.22, 1) ${220 + sampleIndex * 245}ms, background-color 180ms ease`,
                        }}
                      >
                        <div className="flex items-start gap-4">
                          <button
                            type="button"
                            role="menuitem"
                            onClick={() => onExploreSample?.(sample.id)}
                            disabled={isLoading}
                            className="min-w-0 flex-1 text-left disabled:cursor-wait disabled:opacity-60"
                          >
                            <span className="block text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--peridot-role-ornament-sparkle)]/75">{sample.format}</span>
                            <span className="mt-1 block text-base font-bold text-[var(--peridot-color-hex-fbf7ea)] transition hover:text-[var(--peridot-role-ornament-sparkle)]">
                              {isLoading ? 'Loading…' : sample.title}
                              <span aria-hidden="true" className="ml-2 text-[var(--peridot-role-ornament-sparkle)]">›</span>
                            </span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setExpandedSampleId(isExpanded ? '' : sample.id)}
                            aria-expanded={isExpanded}
                            className="shrink-0 rounded-full border border-[var(--peridot-role-ornament-line)]/70 px-3 py-1.5 text-xs font-semibold text-[var(--peridot-color-hex-fbf7ea)] transition hover:border-[var(--peridot-role-ornament-sparkle)] hover:bg-white/[0.05]"
                          >
                            {isExpanded ? 'Less' : 'Details'}
                          </button>
                        </div>

                        {isExpanded ? (
                          <div className="mt-3 border-l border-[var(--peridot-role-ornament-line)]/60 pl-4">
                            <p className="text-sm leading-6 text-[var(--peridot-role-interface-text-on-dark)]/88">{sample.description}</p>
                            <p className="mt-2 text-xs leading-5 text-[var(--peridot-role-interface-text-on-dark)]/65">{sample.teachingNote}</p>
                            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-xs font-semibold">
                              <button
                                type="button"
                                onClick={() => onEditSampleMapping?.(sample.id)}
                                disabled={isLoading}
                                className="text-[var(--peridot-role-ornament-sparkle)] underline-offset-4 hover:underline disabled:cursor-wait disabled:opacity-60"
                              >
                                Edit mapping
                              </button>
                              <a
                                href={sample.downloadUrl}
                                download={sample.fileName}
                                className="text-[var(--peridot-role-ornament-sparkle)] underline-offset-4 hover:underline"
                              >
                                Download source
                              </a>
                            </div>
                          </div>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : null}
          </div>

          <div className="peridot-appear-rise peridot-appear-delay-4">
            <label
              className="peridot-button-cream min-w-[18rem] cursor-pointer whitespace-nowrap px-8 py-7 !border-[var(--peridot-data-button-border)] !bg-[var(--peridot-data-button-bg)] !text-[18px] !text-[var(--peridot-data-button-text)] hover:!border-[var(--peridot-role-ornament-corner)] hover:!bg-[linear-gradient(135deg,var(--peridot-role-button-primary-hover-bg),var(--peridot-role-ornament-line))] hover:!text-[var(--peridot-role-button-primary-text)] leading-tight"
              style={{
                '--peridot-data-button-bg': '#0f2912',
                '--peridot-data-button-border': 'var(--peridot-role-ornament-corner-muted)',
                '--peridot-data-button-text': 'color-mix(in srgb, var(--peridot-role-ornament-sparkle) 82%, #fff8e8 18%)',
              }}
            >
              Upload Your Data
              <input type="file" accept=".csv,.tsv,.xlsx,.xls,text/csv,text/tab-separated-values" onChange={handleColumnMappingTableUpload} className="sr-only" />
            </label>
          </div>
        </div>



        {columnMappingStaging ? (
          <div className="mx-auto mt-8 max-w-3xl peridot-cream-card peridot-card-inner">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="peridot-section-label">Staged data</p>
                <h2 className="mt-2 text-2xl font-bold text-[var(--peridot-color-hex-26352b)]">
                  {columnMappingStaging.editingActiveData ? 'Mapped data ready to edit' : 'Data staged for mapping'}
                </h2>
                <p className="mt-2 text-sm leading-6 text-[var(--peridot-color-hex-42533f)]">
                  {columnMappingStaging.fileLabel} contains {columnMappingStaging.rowCount || 0} rows and {columnMappingStaging.columnCount || 0} columns{columnMappingStaging.sheetCount > 1 ? ` across ${columnMappingStaging.sheetCount} sheets` : ''}.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={openColumnMappingModal}
                  disabled={columnMappingStaging.status !== 'ready'}
                  className="peridot-button-primary disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {columnMappingStaging.editingActiveData ? 'Continue editing' : 'Open mapping workspace'}
                </button>
                <button type="button" onClick={clearColumnMappingStaging} className="peridot-button-cream">
                  {columnMappingStaging.editingActiveData ? 'Cancel edit' : 'Clear staged data'}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-sm text-[var(--peridot-color-hex-f7f2df-a70)]">
            <span>
              Current source: <strong className="text-[var(--peridot-color-hex-fbf7ea)]">{peridotFileLabel}</strong>
            </span>
            {activeSampleDataSource ? (
              <button
                type="button"
                onClick={() => onEditSampleMapping?.(activeSampleDataSource.sampleDatasetId)}
                className="rounded-full border border-[var(--peridot-role-ornament-line)] px-4 py-2 font-semibold text-[var(--peridot-color-hex-fbf7ea)] transition hover:bg-[var(--peridot-role-button-primary-hover-bg)]"
              >
                Edit sample mapping
              </button>
            ) : activeMappedDataSource ? (
              <button
                type="button"
                onClick={openActiveMappedDataEditor}
                className="rounded-full border border-[var(--peridot-role-ornament-line)] px-4 py-2 font-semibold text-[var(--peridot-color-hex-fbf7ea)] transition hover:bg-[var(--peridot-role-button-primary-hover-bg)]"
              >
                Edit mapped data
              </button>
            ) : null}
          </div>
        )}
      </div>
    </section>
  );
}
