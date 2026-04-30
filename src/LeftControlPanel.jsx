import React, { useEffect, useRef, useState } from 'react';
import { TimelinePanelContent } from './timelinePlaybackComponents.jsx';

function sidebarSurfaceClassName() { return 'relative overflow-visible border-[var(--sidebar-border)] bg-[var(--sidebar-bg)] backdrop-blur-sm transition-all duration-300'; }
function groupCardClassName() { return 'mt-5 rounded-[28px] border border-[var(--group-border)] bg-[linear-gradient(180deg,var(--group-bg-top),var(--group-bg-bottom))] p-4 shadow-[0_14px_34px_rgba(0,0,0,0.42)]'; }
function sectionCardClassName() { return 'overflow-hidden rounded-2xl border border-[var(--section-border)] bg-[var(--section-bg)] shadow-[0_10px_28px_rgba(0,0,0,0.34)]'; }
function panelHeadingClassName() { return 'text-[32px] font-bold leading-tight tracking-[-0.02em] text-[var(--heading-text)]'; }
function groupHeadingClassName() { return '[font-family:Georgia,"Palatino_Linotype","Book_Antiqua",Palatino,serif] mb-3 px-2 text-[14px] font-bold uppercase tracking-[0.14em] text-[var(--group-heading-text)]'; }
function sectionTitleClassName() { return '[font-family:Georgia,"Palatino_Linotype","Book_Antiqua",Palatino,serif] text-[17px] font-bold leading-tight tracking-[0.005em] text-[var(--heading-text)]'; }
function serifHeadingClassName() { return '[font-family:Georgia,"Palatino_Linotype","Book_Antiqua",Palatino,serif] text-[18px] font-bold leading-tight tracking-[0.01em] text-[var(--heading-text)]'; }

function buttonClassName({ active = false, variant = 'secondary' } = {}) {
  const base = 'rounded-xl px-3 py-2 text-sm font-medium transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/40 focus:ring-offset-2 focus:ring-offset-[var(--shell-bg)]';
  const variants = {
    primary: 'border border-[var(--button-primary-border)] bg-[var(--button-primary-bg)] text-[var(--button-primary-text)] hover:bg-[var(--button-primary-hover)] shadow-[0_8px_18px_rgba(0,0,0,0.28)]',
    secondary: 'border border-[var(--button-secondary-border)] bg-[var(--button-secondary-bg)] text-[var(--button-secondary-text)] hover:bg-[var(--button-secondary-hover)]',
    ghost: 'bg-transparent text-[var(--muted-text)] hover:bg-[var(--ghost-hover)] hover:text-[var(--text-main)]',
  };

  if (active) {
    return `${base} border border-[var(--button-primary-active-border)] bg-[var(--button-primary-active-bg)] text-[var(--button-primary-text)] shadow-[0_10px_22px_rgba(0,0,0,0.3)] hover:bg-[var(--button-primary-active-hover)]`;
  }
  return `${base} ${variants[variant] || variants.secondary}`;
}

function SidebarToggle({ side, open, onToggle }) {
  const left = side === 'left';
  const panelName = left ? 'Controls' : 'Inspector';

  const closedIcon = left ? (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true" fill="currentColor">
      <path d="M12 2.4c-.7 0-1.4.1-2 .3l-.7 2.2c-.5.2-1 .4-1.5.7l-2.1-.9c-1 .6-1.8 1.4-2.4 2.4l.9 2.1c-.3.5-.5 1-.7 1.5l-2.2.7c-.2.7-.3 1.3-.3 2s.1 1.4.3 2l2.2.7c.2.5.4 1 .7 1.5l-.9 2.1c.6 1 1.4 1.8 2.4 2.4l2.1-.9c.5.3 1 .5 1.5.7l.7 2.2c.7.2 1.3.3 2 .3s1.4-.1 2-.3l.7-2.2c.5-.2 1-.4 1.5-.7l2.1.9c1-.6 1.8-1.4 2.4-2.4l-.9-2.1c.3-.5.5-1 .7-1.5l2.2-.7c.2-.7.3-1.3.3-2s-.1-1.4-.3-2l-2.2-.7c-.2-.5-.4-1-.7-1.5l.9-2.1c-.6-1-1.4-1.8-2.4-2.4l-2.1.9c-.5-.3-1-.5-1.5-.7l-.7-2.2c-.6-.2-1.3-.3-2-.3Zm0 5.4a4.2 4.2 0 1 1 0 8.4a4.2 4.2 0 0 1 0-8.4Z" />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="10.5" cy="10.5" r="5.75" />
      <path d="M15 15l5 5" />
    </svg>
  );

  const openIcon = (
    <svg viewBox="0 0 24 24" className="h-4.5 w-4.5" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );

  return (
    <button
      type="button"
      onClick={onToggle}
      className={[
        'absolute top-3 z-20 flex h-10 w-10 items-center justify-center rounded-full border shadow-[0_8px_20px_rgba(0,0,0,0.16)] transition-all duration-150 hover:shadow-[0_12px_24px_rgba(0,0,0,0.22)]',
        left ? 'right-3' : 'left-3',
        open
          ? 'border-[var(--button-primary-border)] bg-[var(--button-primary-bg)] text-[var(--button-primary-text)] hover:bg-[var(--button-primary-hover)]'
          : 'border-[var(--toggle-border)] bg-[var(--toggle-bg-open)] text-[var(--toggle-text)] hover:bg-[var(--utility-panel-bg)] hover:text-[var(--toggle-text-hover)]',
      ].join(' ')}
      aria-label={open ? `Collapse ${side} panel` : `Expand ${side} panel`}
      title={open ? `Hide ${panelName}` : `Show ${panelName}`}
    >
      <span className="sr-only">{open ? `Hide ${panelName}` : `Show ${panelName}`}</span>
      {open ? openIcon : closedIcon}
    </button>
  );
}

// Selection helpers.
// These centralize the logic that converts a lightweight remembered
// selection ({ kind, id }) into the full inspector-ready object.
// Keeping this outside the main app component reduces the risk of
// selection bugs when filtering, relayout, or clustering changes.
// Timeline and export helpers.
// These move date-window math and export shaping out of the main app
// component so the top-level React state reads more clearly.

function CollapsiblePanelSection({
  title,
  open,
  onToggle,
  headerContent = null,
  children = null,
  className = '',
  bodyClassName = 'border-t border-[var(--panel-card-border)]/70 p-4 pt-3',
}) {
  return (
    <section className={`${sectionCardClassName()} ${className}`.trim()}>
      <button type="button" onClick={onToggle} className="w-full p-4 text-left transition-colors hover:bg-[var(--panel-card-hover)]">
        <div>
          <h2 className={sectionTitleClassName()}>{title}</h2>
          {headerContent ? <div className="mt-2">{headerContent}</div> : null}
        </div>
        <div className="mt-1 flex justify-center">
          <span className="text-[15px] font-semibold text-[var(--panel-card-muted-text)]">{open ? '⌃' : '⌄'}</span>
        </div>
      </button>
      {open ? <div className={bodyClassName}>{children}</div> : null}
    </section>
  );
}

// Reusable stepped slider.
// Internal guide:
// 1. drag and click logic
// 2. keyboard accessibility
// 3. label rendering

function StepSlider({ options, value, onChange, ariaLabelPrefix }) {
  const currentIndex = Math.max(0, options.findIndex((option) => option.value === value));
  const trackRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  const clampIndex = (index) => Math.max(0, Math.min(options.length - 1, index));

  const updateFromClientX = (clientX) => {
    const track = trackRef.current;
    if (!track) return;
    const rect = track.getBoundingClientRect();
    const ratio = rect.width > 0 ? (clientX - rect.left) / rect.width : 0;
    const nextIndex = clampIndex(Math.round(ratio * (options.length - 1)));
    const nextOption = options[nextIndex];
    if (nextOption) onChange(nextOption.value);
  };

  useEffect(() => {
    if (!isDragging) return undefined;

    const handleMove = (event) => {
      updateFromClientX(event.clientX);
    };

    const handleUp = () => {
      setIsDragging(false);
    };

    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);

    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
    };
  }, [isDragging, options]);

  const thumbPercent = options.length > 1 ? (currentIndex / (options.length - 1)) * 100 : 0;
  const columnStyle = { gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` };

  return (
    <div className="pt-1">
      <div
        ref={trackRef}
        className="relative mx-4 h-7 select-none"
        onMouseDown={(event) => {
          updateFromClientX(event.clientX);
          setIsDragging(true);
        }}
        role="slider"
        aria-label={ariaLabelPrefix}
        aria-valuemin={0}
        aria-valuemax={Math.max(options.length - 1, 0)}
        aria-valuenow={currentIndex}
        aria-valuetext={options[currentIndex]?.label}
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') {
            event.preventDefault();
            const nextIndex = clampIndex(currentIndex - 1);
            onChange(options[nextIndex].value);
          }
          if (event.key === 'ArrowRight' || event.key === 'ArrowUp') {
            event.preventDefault();
            const nextIndex = clampIndex(currentIndex + 1);
            onChange(options[nextIndex].value);
          }
          if (event.key === 'Home') {
            event.preventDefault();
            onChange(options[0].value);
          }
          if (event.key === 'End') {
            event.preventDefault();
            onChange(options[options.length - 1].value);
          }
        }}
      >
        <div className="absolute left-0 right-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-[var(--slider-track-bg)]" />
        <div className="absolute left-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-[var(--accent)]" style={{ width: `${thumbPercent}%` }} />
        <div className="absolute left-0 right-0 top-1/2 grid -translate-y-1/2" style={columnStyle}>
          {options.map((option, index) => {
            const active = index <= currentIndex;
            const selected = index === currentIndex;
            return (
              <div key={`${option.label}-${option.value}`} className="relative flex justify-center">
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    onChange(option.value);
                  }}
                  className={`h-4 w-4 rounded-full border-2 transition-all ${active ? 'border-[var(--accent)] bg-[var(--slider-dot-bg)]' : 'border-[var(--slider-dot-border)] bg-[var(--slider-dot-bg)]'} ${selected ? 'scale-110 shadow-[0_0_0_4px_rgba(143,122,86,0.16)]' : ''}`}
                  aria-label={`${ariaLabelPrefix} ${option.label}`}
                />
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-3 grid gap-x-1" style={columnStyle}>
        {options.map((option, index) => (
          <div
            key={`${option.label}-${option.value}-label`}
            className={`flex min-h-[2.5rem] items-start justify-center px-1 text-center text-[10px] leading-tight sm:text-[11px] ${index === currentIndex ? 'font-semibold text-[var(--slider-label-active)]' : 'text-[var(--slider-label-inactive)]'}`}
          >
            <span className="max-w-[4.75rem] whitespace-normal break-words">{option.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Styled file picker wrapper around the hidden native file input.

function FilePicker({ id, onChange }) {
  return (
    <div className="mb-2 flex flex-wrap items-center gap-3">
      <input id={id} type="file" accept=".csv,text/csv" onChange={onChange} className="hidden" />
      <label htmlFor={id} className={`${buttonClassName({ variant: 'secondary' })} cursor-pointer`}>
        Choose File
      </label>
    </div>
  );
}

// Small card wrapper for the three upload sources.
// This is intentionally presentation-only: it does not own any state,
// parsing, or upload logic. Keeping it this small reduces regression risk.

function StatCard({ label, value }) {
  return (
    <div className="rounded-xl bg-[var(--stat-card-bg)] p-3">
      <div className="text-[var(--panel-card-muted-text)]">{label}</div>
      <div className="text-2xl font-semibold">{value}</div>
    </div>
  );
}

// Reusable linked-letter card used in both node and edge inspector views.
// This keeps the letter summary, expandable long-text sections, and metadata
// display consistent no matter how the user reached the inspector.

function DataSourceCard({ title, fileInputId, onFileChange, currentSource }) {
  return (
    <div className="rounded-2xl border border-[var(--panel-card-border)] bg-[var(--section-bg)] p-4 shadow-[0_10px_28px_rgba(0,0,0,0.22)]">
      <div className="mb-2">
        <h2 className={sectionTitleClassName()}>{title}</h2>
      </div>
      <FilePicker id={fileInputId} onChange={onFileChange} />
      <div className="text-sm text-[var(--panel-card-muted-text)]">Current source: {currentSource}</div>
    </div>
  );
}

// Shared button styling helper used across the interface.
// Shared button helper.
// Important note: `active` means selected or toggled on, not merely hovered.

function SummaryPanelContent({
  showSummaryPanel,
  setShowSummaryPanel,
  rowDiagnostics,
}) {
  return (
    <CollapsiblePanelSection
      title="Summary and Diagnostics"
      open={showSummaryPanel}
      onToggle={() => setShowSummaryPanel((v) => !v)}
      className="mt-3"
    >
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <StatCard label="Geography rows" value={rowDiagnostics.geographyRows} />
          <StatCard label="Mappable rows" value={rowDiagnostics.mappableRows} />
          <StatCard label="Routes in view" value={rowDiagnostics.routeCount} />
          <StatCard label="Nodes in view" value={rowDiagnostics.nodeCount} />
        </div>
        <div className="rounded-xl bg-[var(--stat-card-bg)] p-3 text-[13px] text-[var(--stat-card-text)]">
          <div className="font-medium">Current dataset status</div>
          <div className="mt-2 space-y-1 text-[var(--stat-card-muted-text)]">
            <div>Normalized geographic rows: {rowDiagnostics.normalizedRows}</div>
            <div>Rows excluded as unmappable: {rowDiagnostics.unmappableRows}</div>
            <div>Rows with unknown dates: {rowDiagnostics.unknownDateRows}</div>
            <div>Rows usable for timeline playback: {rowDiagnostics.timelineUsableRows}</div>
            <div>Timeline month buckets detected: {rowDiagnostics.timelineMonths}</div>
            <div>Rows currently inside the active time filter: {rowDiagnostics.filteredRows}</div>
            <div>Letter metadata rows loaded: {rowDiagnostics.letterRows}</div>
            <div>Linked-letter matches on visible routes: {rowDiagnostics.linkedLetterMatches}</div>
            <div>Person metadata rows loaded: {rowDiagnostics.personMetadataRows}</div>
            <div>Exact person-metadata matches in current filtered set: {rowDiagnostics.exactPersonMetadataMatches}</div>
          </div>
        </div>
      </div>
    </CollapsiblePanelSection>
  );
}

function MapAppearancePanelContent({
  showThemePanel,
  setShowThemePanel,
  applyThemePreset,
  resetTheme,
}) {
  return (
    <CollapsiblePanelSection
      title="Theme"
      open={showThemePanel}
      onToggle={() => setShowThemePanel((v) => !v)}
      className="mt-3"
    >
      <div className="space-y-4 text-sm text-[var(--panel-card-muted-text)]">
        <div className="flex flex-wrap gap-2">
          <button onClick={() => applyThemePreset('preModern')} className={buttonClassName()}>Early modern map</button>
          <button onClick={() => applyThemePreset('modern')} className={buttonClassName()}>Modern map</button>
          <button onClick={resetTheme} className={buttonClassName({ variant: 'secondary' })}>Reset default</button>
        </div>
      </div>
    </CollapsiblePanelSection>
  );
}

// EXPORT PANEL SECTION
// This section is render-time only until the control panel is open. That makes
// it easy to underestimate its dependencies during refactors.
// Safe edits here are mostly local presentation tweaks. Moving this section
// across files is riskier because it depends on shared helpers and export
// handlers supplied by the parent panel tree.

function ExportPanelContent({
  showExportPanel,
  setShowExportPanel,
  handleExportSvg,
  handleExportPng,
  handleExportEdgesCsv,
  handleExportNodesCsv,
  viewMode,
  search,
  currentMinCountLabel,
  currentRangeLabel,
  graph,
  exportStatus,
}) {
  return (
    <CollapsiblePanelSection
      title="Export"
      open={showExportPanel}
      onToggle={() => setShowExportPanel((v) => !v)}
      className="mt-3"
    >
      <div className="space-y-4 text-sm text-[var(--panel-card-muted-text)]">
        <div className="grid grid-cols-2 gap-2">
          <button onClick={handleExportSvg} className={buttonClassName()}>Export SVG</button>
          <button onClick={handleExportPng} className={buttonClassName()}>Export PNG</button>
          <button onClick={handleExportEdgesCsv} className={buttonClassName()}>Routes CSV</button>
          <button onClick={handleExportNodesCsv} className={buttonClassName()}>Nodes CSV</button>
        </div>
        <div className="rounded-xl bg-[var(--stat-card-bg)] p-3 text-[13px]">
          <div>Current export scope</div>
          <div className="mt-1">View: {viewMode === 'geographic' ? 'Geographic routes' : 'Person network'}</div>
          <div>Search: {search.trim() || 'None'}</div>
          <div>Minimum weight: {currentMinCountLabel}</div>
          <div>Date window: {currentRangeLabel}</div>
          <div>Nodes in view: {graph.nodes.length}</div>
          <div>Routes in view: {graph.edges.length}</div>
        </div>
        {exportStatus ? (
          <div className={`rounded-xl border p-3 text-[13px] ${exportStatus.kind === 'error' ? 'border-[var(--map-warning-bg)]/60 bg-[var(--panel-card-bg)] text-[var(--panel-card-text)]' : 'border-[var(--panel-card-border)]/70 bg-[var(--panel-card-bg)] text-[var(--panel-card-text)]'}`}>
            <div className="font-medium">{exportStatus.message}</div>
            {exportStatus.filename ? <div className="mt-1">File: {exportStatus.filename}</div> : null}
            {typeof exportStatus.bytes === 'number' ? <div>Size: {exportStatus.bytes.toLocaleString()} bytes</div> : null}
            {exportStatus.timestamp ? <div>Time: {exportStatus.timestamp}</div> : null}
          </div>
        ) : null}
      </div>
    </CollapsiblePanelSection>
  );
}

function VisualizationTypePanelContent({
  showVisualizationTypePanel,
  setShowVisualizationTypePanel,
  viewMode,
  setViewMode,
  personLayoutMode,
  setPersonLayoutMode,
}) {
  return (
    <CollapsiblePanelSection
      title="Visualization Type"
      open={showVisualizationTypePanel}
      onToggle={() => setShowVisualizationTypePanel((v) => !v)}
    >
      <div className="space-y-4 text-sm text-[var(--panel-card-muted-text)]">
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setViewMode('geographic')} className={buttonClassName({ active: viewMode === 'geographic' })}>Geographic routes</button>
          <button onClick={() => setViewMode('person')} className={buttonClassName({ active: viewMode === 'person' })}>Person network</button>
        </div>
        {viewMode === 'person' ? (
          <div className="flex flex-wrap gap-2">
            <button onClick={() => setPersonLayoutMode('force')} className={buttonClassName({ active: personLayoutMode === 'force' })}>Force-directed</button>
            <button onClick={() => setPersonLayoutMode('geographic')} className={buttonClassName({ active: personLayoutMode === 'geographic' })}>Geographic anchor</button>
          </div>
        ) : null}
      </div>
    </CollapsiblePanelSection>
  );
}

function DisplayControlsPanelContent({
  showDisplayControlsPanel,
  setShowDisplayControlsPanel,
  showLabels,
  setShowLabels,
  viewMode,
  setViewMode,
  personLayoutMode,
  setPersonLayoutMode,
  search,
  setSearch,
  currentMinCountLabel,
  minCountOptions,
  minCount,
  setMinCount,
  timelineMode,
  setTimelineMode,
}) {
  return (
    <CollapsiblePanelSection
      title="Display Controls"
      open={showDisplayControlsPanel}
      onToggle={() => setShowDisplayControlsPanel((v) => !v)}
      className="mt-3"
    >
      <div className="space-y-4 text-sm text-[var(--panel-card-muted-text)]">
        <div>
          <label className="mb-1 block font-medium">Search</label>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={viewMode === 'geographic' ? 'e.g. Siena, Maria Magdalena, 1613' : 'e.g. Caterina, Cosimo, Siena'}
            className="w-full rounded-xl border border-[var(--input-border)]/80 bg-[var(--input-bg)] px-3 py-2 text-[var(--input-text)] placeholder:text-[var(--input-placeholder)]"
          />
        </div>
        <div>
          <label className="mb-1 block font-medium">Minimum {viewMode === 'geographic' ? 'route weight' : 'connection weight'}: {currentMinCountLabel}</label>
          <StepSlider options={minCountOptions} value={minCount} onChange={setMinCount} ariaLabelPrefix="Set minimum weight to" />
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setShowLabels((v) => !v)} className={buttonClassName({ active: showLabels })}>Node Labels</button>
          <button onClick={() => setTimelineMode((v) => v === 'all' ? 'range' : 'all')} className={buttonClassName({ active: timelineMode === 'all' })}>Show all dates</button>
        </div>
      </div>
    </CollapsiblePanelSection>
  );
}

// DATA INPUTS GROUP
// This group is mostly presentation plus upload wiring. It is one of the safer
// panel sections because the heavy parsing logic lives elsewhere.

function DataInputsGroup({
  sectionState,
  dataInputState,
}) {
  const {
    showDataInputsPanel,
    setShowDataInputsPanel,
  } = sectionState;

  const {
    setGeographyCsv,
    setLettersCsv,
    setPersonMetadataCsv,
    geographyFileLabel,
    lettersFileLabel,
    personMetadataFileLabel,
    setGeographyFileLabel,
    setLettersFileLabel,
    setPersonMetadataFileLabel,
    uploadSetter,
  } = dataInputState;

  return (
    <div className={groupCardClassName()}>
      <div className={groupHeadingClassName()}>DATA</div>
      <CollapsiblePanelSection
        title="Data Inputs"
        open={showDataInputsPanel}
        onToggle={() => setShowDataInputsPanel((v) => !v)}
      >
        <div className="space-y-3">
          <DataSourceCard
            title="Geography table"
            fileInputId="geography-file"
            onFileChange={uploadSetter(setGeographyCsv, setGeographyFileLabel)}
            currentSource={geographyFileLabel}
          />

          <DataSourceCard
            title="Raw data table"
            fileInputId="letters-file"
            onFileChange={uploadSetter(setLettersCsv, setLettersFileLabel)}
            currentSource={lettersFileLabel}
          />

          <DataSourceCard
            title="Person metadata table"
            fileInputId="person-metadata-file"
            onFileChange={uploadSetter(setPersonMetadataCsv, setPersonMetadataFileLabel)}
            currentSource={personMetadataFileLabel}
          />
        </div>
      </CollapsiblePanelSection>
    </div>
  );
}

// DISPLAY/FILTERING GROUP
// This is the densest part of the left control panel. It nests summary,
// display, timeline, theme, and export sections, and it forwards a large prop
// surface into those children.
// Why this is fragile:
// - It is the highest fan-out point in the control panel.
// - If a child is extracted and even one dependency is omitted or renamed, the
//   app can still boot normally but fail the moment the control panel renders.
// - This group is a better candidate for careful dependency mapping than for
//   casual component extraction.

function DisplayFilteringGroup({
  summaryState,
  visualizationTypeState,
  displayControlsState,
  timelinePanelState,
  themePanelState,
  exportPanelState,
}) {
  const {
    showSummaryPanel,
    setShowSummaryPanel,
    rowDiagnostics,
  } = summaryState;

  const {
    showVisualizationTypePanel,
    setShowVisualizationTypePanel,
    viewMode,
    setViewMode,
    personLayoutMode,
    setPersonLayoutMode,
  } = visualizationTypeState;

  const {
    showDisplayControlsPanel,
    setShowDisplayControlsPanel,
    showLabels,
    setShowLabels,
    search,
    setSearch,
    currentMinCountLabel,
    minCountOptions,
    minCount,
    setMinCount,
    timelineMode,
    setTimelineMode,
  } = displayControlsState;

  const {
    showTimelinePanel,
    setShowTimelinePanel,
    currentRangeLabel,
    timelineMonths,
    rangeStart,
    setRangeStart,
    rangeEnd,
    setRangeEnd,
    currentPlaybackLabel,
    currentPlaybackSpeedLabel,
    playbackSpeedOptions,
    playbackSpeed,
    setPlaybackSpeed,
    isPlaying,
    setIsPlaying,
    playbackIndex,
    setPlaybackIndex,
    selectedRowsForPlayback,
  } = timelinePanelState;

  const {
    showThemePanel,
    setShowThemePanel,
    applyThemePreset,
    resetTheme,
  } = themePanelState;

  const {
    showExportPanel,
    setShowExportPanel,
    handleExportSvg,
    handleExportPng,
    handleExportEdgesCsv,
    handleExportNodesCsv,
    graph,
    exportStatus,
  } = exportPanelState;

  return (
    <div className={groupCardClassName()}>
      <div className={groupHeadingClassName()}>OPTIONS</div>

      <VisualizationTypePanelContent
        showVisualizationTypePanel={showVisualizationTypePanel}
        setShowVisualizationTypePanel={setShowVisualizationTypePanel}
        viewMode={viewMode}
        setViewMode={setViewMode}
        personLayoutMode={personLayoutMode}
        setPersonLayoutMode={setPersonLayoutMode}
      />

      <DisplayControlsPanelContent
        showDisplayControlsPanel={showDisplayControlsPanel}
        setShowDisplayControlsPanel={setShowDisplayControlsPanel}
        showLabels={showLabels}
        setShowLabels={setShowLabels}
        viewMode={viewMode}
        setViewMode={setViewMode}
        personLayoutMode={personLayoutMode}
        setPersonLayoutMode={setPersonLayoutMode}
        search={search}
        setSearch={setSearch}
        currentMinCountLabel={currentMinCountLabel}
        minCountOptions={minCountOptions}
        minCount={minCount}
        setMinCount={setMinCount}
        timelineMode={timelineMode}
        setTimelineMode={setTimelineMode}
      />

      {/*
        TIMELINE PANEL HANDOFF
        This is one of the known fragile boundaries. Earlier cleanup attempts
        proved that the timeline panel is sensitive to render-time dependency
        changes, even when the surrounding app still boots normally.
      */}
      <TimelinePanelContent
        showTimelinePanel={showTimelinePanel}
        setShowTimelinePanel={setShowTimelinePanel}
        currentRangeLabel={currentRangeLabel}
        timelineMonths={timelineMonths}
        rangeStart={rangeStart}
        setRangeStart={setRangeStart}
        rangeEnd={rangeEnd}
        setRangeEnd={setRangeEnd}
        currentPlaybackLabel={currentPlaybackLabel}
        currentPlaybackSpeedLabel={currentPlaybackSpeedLabel}
        playbackSpeedOptions={playbackSpeedOptions}
        playbackSpeed={playbackSpeed}
        setPlaybackSpeed={setPlaybackSpeed}
        isPlaying={isPlaying}
        setIsPlaying={setIsPlaying}
        playbackIndex={playbackIndex}
        setPlaybackIndex={setPlaybackIndex}
        selectedRowsForPlayback={selectedRowsForPlayback}
        timelineMode={timelineMode}
        setTimelineMode={setTimelineMode}
        CollapsiblePanelSection={CollapsiblePanelSection}
        StepSlider={StepSlider}
        buttonClassName={buttonClassName}
      />

      <MapAppearancePanelContent
        showThemePanel={showThemePanel}
        setShowThemePanel={setShowThemePanel}
        applyThemePreset={applyThemePreset}
        resetTheme={resetTheme}
      />

      {/*
        EXPORT PANEL HANDOFF
        This is another known fragile boundary. The export panel can look like a
        simple button section, but it depends on shared helpers, status state,
        and export handlers supplied by the parent panel tree.
      */}
      <ExportPanelContent
        showExportPanel={showExportPanel}
        setShowExportPanel={setShowExportPanel}
        handleExportSvg={handleExportSvg}
        handleExportPng={handleExportPng}
        handleExportEdgesCsv={handleExportEdgesCsv}
        handleExportNodesCsv={handleExportNodesCsv}
        viewMode={viewMode}
        search={search}
        currentMinCountLabel={currentMinCountLabel}
        currentRangeLabel={currentRangeLabel}
        graph={graph}
        exportStatus={exportStatus}
      />

      <SummaryPanelContent
        showSummaryPanel={showSummaryPanel}
        setShowSummaryPanel={setShowSummaryPanel}
        rowDiagnostics={rowDiagnostics}
      />
    </div>
  );
}

// LEFT CONTROL PANEL SHELL
// This component is the actual subtree behind the cog button. The app may look
// healthy until this component renders, because the heavy inner tree is gated
// behind `showLeftSidebar`.
// This is the key reason repeated refactor failures show up only after opening
// the control panel: dormant render-time dependencies live below this shell.

export function LeftControlPanel({
  sidebarState,
  dataInputState,
  displayState,
  timelineState,
  themeState,
  exportState,
}) {
  const {
    showLeftSidebar,
    setShowLeftSidebar,
    showDataInputsPanel,
    setShowDataInputsPanel,
    showVisualizationTypePanel,
    setShowVisualizationTypePanel,
    showDisplayControlsPanel,
    setShowDisplayControlsPanel,
    showTimelinePanel,
    setShowTimelinePanel,
    showExportPanel,
    setShowExportPanel,
    showSummaryPanel,
    setShowSummaryPanel,
    showThemePanel,
    setShowThemePanel,
  } = sidebarState;

  const {
    setGeographyCsv,
    setLettersCsv,
    setPersonMetadataCsv,
    geographyFileLabel,
    lettersFileLabel,
    personMetadataFileLabel,
    setGeographyFileLabel,
    setLettersFileLabel,
    setPersonMetadataFileLabel,
    uploadSetter,
    rowDiagnostics,
  } = dataInputState;

  const {
    showLabels,
    setShowLabels,
    viewMode,
    setViewMode,
    personLayoutMode,
    setPersonLayoutMode,
    search,
    setSearch,
    currentMinCountLabel,
    minCountOptions,
    minCount,
    setMinCount,
  } = displayState;

  const {
    timelineMode,
    setTimelineMode,
    currentRangeLabel,
    timelineMonths,
    rangeStart,
    setRangeStart,
    rangeEnd,
    setRangeEnd,
    currentPlaybackLabel,
    currentPlaybackSpeedLabel,
    playbackSpeedOptions,
    playbackSpeed,
    setPlaybackSpeed,
    isPlaying,
    setIsPlaying,
    playbackIndex,
    setPlaybackIndex,
    selectedRowsForPlayback,
  } = timelineState;

  const { applyThemePreset, resetTheme } = themeState;
  const {
    handleExportSvg,
    handleExportPng,
    handleExportEdgesCsv,
    handleExportNodesCsv,
    graph,
    exportStatus,
  } = exportState;

  const dataInputsSectionState = {
    showDataInputsPanel,
    setShowDataInputsPanel,
  };

  const dataInputsGroupProps = {
    sectionState: dataInputsSectionState,
    dataInputState: {
      setGeographyCsv,
      setLettersCsv,
      setPersonMetadataCsv,
      geographyFileLabel,
      lettersFileLabel,
      personMetadataFileLabel,
      setGeographyFileLabel,
      setLettersFileLabel,
      setPersonMetadataFileLabel,
      uploadSetter,
    },
  };

  const displayFilteringGroupProps = {
    summaryState: {
      showSummaryPanel,
      setShowSummaryPanel,
      rowDiagnostics,
    },
    visualizationTypeState: {
      showVisualizationTypePanel,
      setShowVisualizationTypePanel,
      viewMode,
      setViewMode,
      personLayoutMode,
      setPersonLayoutMode,
    },
    displayControlsState: {
      showDisplayControlsPanel,
      setShowDisplayControlsPanel,
      showLabels,
      setShowLabels,
      viewMode,
      setViewMode,
      personLayoutMode,
      setPersonLayoutMode,
      search,
      setSearch,
      currentMinCountLabel,
      minCountOptions,
      minCount,
      setMinCount,
      timelineMode,
      setTimelineMode,
    },
    timelinePanelState: {
      showTimelinePanel,
      setShowTimelinePanel,
      currentRangeLabel,
      timelineMonths,
      rangeStart,
      setRangeStart,
      rangeEnd,
      setRangeEnd,
      currentPlaybackLabel,
      currentPlaybackSpeedLabel,
      playbackSpeedOptions,
      playbackSpeed,
      setPlaybackSpeed,
      isPlaying,
      setIsPlaying,
      playbackIndex,
      setPlaybackIndex,
      selectedRowsForPlayback,
    },
    themePanelState: {
      showThemePanel,
      setShowThemePanel,
      applyThemePreset,
      resetTheme,
    },
    exportPanelState: {
      showExportPanel,
      setShowExportPanel,
      handleExportSvg,
      handleExportPng,
      handleExportEdgesCsv,
      handleExportNodesCsv,
      viewMode,
      search,
      currentMinCountLabel,
      currentRangeLabel,
      graph,
      exportStatus,
    },
  };

  return (
    <aside className={`${sidebarSurfaceClassName()} border-r xl:absolute xl:left-0 xl:top-0 xl:h-full xl:z-30 ${showLeftSidebar ? 'w-[420px]' : 'w-16'}`}>
      {/*
        PANEL GATING BEHAVIOR
        The `showLeftSidebar ? (...) : null` block below is crucial. The app can
        appear normal while closed because the inner control-panel content is
        not mounted yet. Opening the cog causes that dormant subtree to render.
        That is why missing props/helper mismatches often surface only at the
        moment the panel opens.
      */}
      <SidebarToggle side="left" open={showLeftSidebar} onToggle={() => setShowLeftSidebar((v) => !v)} />
      {showLeftSidebar ? (
        <div className="h-full overflow-auto p-5 pr-20">
          <h1 className={`${panelHeadingClassName()} ${serifHeadingClassName()}`}>Control Panel</h1>

          <DataInputsGroup {...dataInputsGroupProps} />

          <DisplayFilteringGroup {...displayFilteringGroupProps} />
        </div>
      ) : null}
    </aside>
  );
}
