import React, { useEffect, useRef, useState } from 'react';
import { TimelineDateRangeControls, TimelinePanelContent } from './timelinePlaybackComponents.jsx';
import { InspectorPanelContent } from './InspectorPanel.jsx'; import { AnalyticsPanelContent } from './AnalyticsPanel.jsx';

function sidebarSurfaceClassName() { return 'relative overflow-visible border-[var(--sidebar-border)] bg-[var(--sidebar-bg)] backdrop-blur-sm transition-all duration-300'; }
function groupCardClassName() { return 'mt-5 rounded-[28px] border border-[var(--group-border)] bg-[linear-gradient(180deg,var(--group-bg-top),var(--group-bg-bottom))] p-4 shadow-[0_14px_34px_rgba(0,0,0,0.42)]'; }
function sectionCardClassName({ allowOverflow = false } = {}) {
  const overflowClass = allowOverflow ? 'overflow-visible' : 'overflow-hidden';
  return `${overflowClass} rounded-2xl border border-[var(--section-border)] bg-[var(--section-bg)] shadow-[0_10px_28px_rgba(0,0,0,0.34)]`;
}
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

function SidebarToggle({ side, open, onToggle, stackIndex = 0 }) {
  const left = side === 'left';
  const panelName = left ? 'Controls' : 'Inspector';

  const closedIcon = left ? (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true" fill="currentColor">
      <path d="M12 2.4c-.7 0-1.4.1-2 .3l-.7 2.2c-.5.2-1 .4-1.5.7l-2.1-.9c-1 .6-1.8 1.4-2.4 2.4l.9 2.1c-.3.5-.5 1-.7 1.5l-2.2.7c-.2.7-.3 1.3-.3 2s.1 1.4.3 2l2.2.7c.2.5.4 1 .7 1.5l-.9 2.1c.6 1 1.4 1.8 2.4 2.4l2.1-.9c.5.3 1 .5 1.5.7l.7 2.2c.7.2 1.3.3 2 .3s1.4-.1 2-.3l.7-2.2c.5-.2 1-.4 1.5-.7l2.1.9c1-.6 1.8-1.4 2.4-2.4l-.9-2.1c.3-.5.5-1 .7-1.5l2.2-.7c.2-.7.3-1.3.3-2s-.1-1.4-.3-2l-2.2-.7c-.2-.5-.4-1-.7-1.5l.9-2.1c-.6-1-1.4-1.8-2.4-2.4l-2.1.9c-.5-.3-1-.5-1.5-.7l-.7-2.2c-.6-.2-1.3-.3-2-.3Zm0 5.4a4.2 4.2 0 1 1 0 8.4a4.2 4.2 0 0 1 0-8.4Z" />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 7h16" />
      <path d="M4 12h16" />
      <path d="M4 17h16" />
    </svg>
  );

  const openIcon = (
    <svg viewBox="0 0 24 24" className="h-4.5 w-4.5" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );

  const topClass = open ? 'top-3' : stackIndex === 1 ? 'top-16' : 'top-3';

  return (
    <button
      type="button"
      onClick={onToggle}
      className={[
        `absolute ${topClass} z-20 flex h-10 w-10 items-center justify-center rounded-full border shadow-[0_8px_20px_rgba(0,0,0,0.16)] transition-all duration-150 hover:shadow-[0_12px_24px_rgba(0,0,0,0.22)]`,
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


function SidePanelIconRail({
  isSidePanelOpen,
  activePanel,
  onClose,
  onShowControls,
  onShowDataInputs,
  onShowSearchFilter,
  onShowExport, onShowAnalytics, onShowTimeline,
  onShowInspector,
}) {
  const buttonClass = (active = false) => {
    const base = 'pointer-events-auto flex h-10 w-10 items-center justify-center rounded-full border transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/40';

    if (isSidePanelOpen) {
      return [
        base,
        active
          ? 'border-[#f5edd8] bg-[#f5edd8] text-[#34452a] shadow-[0_8px_18px_rgba(20,28,16,0.24)] hover:bg-[#fffaf0]'
          : 'border-[#e1edcf]/90 bg-[#cfe0b6] text-[#25331f] shadow-[0_6px_14px_rgba(20,28,16,0.18)] hover:border-[#f6fbe9] hover:bg-[#e7f3d2] hover:text-[#172112]',
      ].join(' ');
    }

    return [
      base,
      'shadow-[0_8px_20px_rgba(0,0,0,0.16)] hover:shadow-[0_12px_24px_rgba(0,0,0,0.22)]',
      active
        ? 'border-[var(--button-primary-border)] bg-[var(--button-primary-bg)] text-[var(--button-primary-text)] hover:bg-[var(--button-primary-hover)]'
        : 'border-[var(--toggle-border)] bg-[var(--toggle-bg-open)] text-[var(--toggle-text)] hover:bg-[var(--utility-panel-bg)] hover:text-[var(--toggle-text-hover)]',
    ].join(' ');
  };

  const railClassName = [
    'absolute top-3 z-50 flex flex-col items-center gap-3 transition-all duration-150',
    isSidePanelOpen
      ? 'right-5 rounded-full border border-[#536741]/70 bg-[#667a50]/95 p-2 shadow-[0_16px_32px_rgba(35,45,28,0.28)]'
      : 'left-3',
  ].join(' ');

  return (
    <div className={railClassName} aria-label="Side panel navigation">
      {isSidePanelOpen ? (
        <button
          type="button"
          onClick={onClose}
          className={buttonClass(false)}
          aria-label="Close side panel"
          title="Close panel"
        >
          <span className="sr-only">Close panel</span>
          <svg viewBox="0 0 24 24" className="h-4.5 w-4.5" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
      ) : null}

      <button
        type="button"
        onClick={onShowControls}
        className={buttonClass(activePanel === 'controls')}
        aria-label="Show controls panel"
        aria-pressed={activePanel === 'controls'}
        title="Controls"
      >
        <span className="sr-only">Show Controls</span>
        <svg
          viewBox="0 0 24 24"
          className="h-5 w-5"
          aria-hidden="true"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M4 7h16" />
          <path d="M4 12h16" />
          <path d="M4 17h16" />
        </svg>
      </button>

      <button
        type="button"
        onClick={onShowDataInputs}
        className={buttonClass(activePanel === 'dataInputs')}
        aria-label="Show data inputs panel"
        aria-pressed={activePanel === 'dataInputs'}
        title="Data Inputs"
      >
        <span className="sr-only">Show Data Inputs</span>
        <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 15V4" />
          <path d="M8 8l4-4 4 4" />
          <path d="M5 14v4a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-4" />
        </svg>
      </button>

      <button
        type="button"
        className={buttonClass(activePanel === 'searchFilter')}
        onClick={onShowSearchFilter}
        aria-label="Show Search & Filter"
        title="Show Search & Filter"
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
          <path
            d="M4 7h10M18 7h2M4 12h4M12 12h8M4 17h12M20 17h0"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <circle cx="16" cy="7" r="2" fill="currentColor" />
          <circle cx="10" cy="12" r="2" fill="currentColor" />
          <circle cx="18" cy="17" r="2" fill="currentColor" />
        </svg>
      </button>


      <button
        type="button"
        onClick={onShowExport}
        className={buttonClass(activePanel === 'export')}
        aria-label="Show export panel"
        aria-pressed={activePanel === 'export'}
        title="Export"
      >
        <span className="sr-only">Show Export</span>
        <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 4h6v6" />
          <path d="M10 14 20 4" />
          <path d="M20 14v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h4" />
        </svg>
      </button>

      <button type="button" onClick={onShowAnalytics} className={buttonClass(activePanel === 'analytics')} aria-label="Analytics" title="Analytics"><svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true"><rect x="5" y="11" width="3" height="8" rx="1" fill="currentColor" /><rect x="10.5" y="7" width="3" height="12" rx="1" fill="currentColor" /><rect x="16" y="4" width="3" height="15" rx="1" fill="currentColor" /></svg></button> <button
        type="button"
        onClick={onShowTimeline}
        className={buttonClass(activePanel === 'timeline')}
        aria-label="Show timeline panel"
        aria-pressed={activePanel === 'timeline'}
        title="Timeline"
      >
        <span className="sr-only">Show Timeline</span>
        <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="7.25" />
          <path d="M12 7.8v4.5l3 1.8" />
        </svg>
      </button>
      <button
        type="button"
        onClick={onShowInspector}
        className={buttonClass(activePanel === 'inspector')}
        aria-label="Show inspector panel"
        aria-pressed={activePanel === 'inspector'}
        title="Inspector"
      >
        <span className="sr-only">Show Inspector</span>
        <svg
          viewBox="0 0 24 24"
          className="h-5 w-5"
          aria-hidden="true"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="10.75" cy="10.75" r="5.75" />
          <path d="M15.2 15.2L20 20" />
        </svg>
      </button>
    </div>
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
          <span className="text-[15px] font-semibold text-[var(--panel-card-muted-text)]">{open ? 'âŒƒ' : 'âŒ„'}</span>
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

function FilePicker({ id, onChange, label = 'Choose File' }) {
  return (
    <div className="mb-2 flex flex-wrap items-center gap-3">
      <input id={id} type="file" accept=".csv,text/csv" onChange={onChange} className="hidden" />
      <label htmlFor={id} className={`${buttonClassName({ variant: 'secondary' })} cursor-pointer`}>
        {label}
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

// Reusable linked-record card used in both node and edge inspector views.
// Terminology note: the underlying data structures still use legacy linked-letter
// names from the correspondence-first Inspector path. Keep internal names stable
// until the Inspector is deliberately generalized to record dossiers.
// This keeps the record summary, expandable long-text sections, and metadata
// display consistent no matter how the user reached the inspector.

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
            <div>Record metadata rows loaded: {rowDiagnostics.letterRows}</div>
            <div>Linked-record matches on visible routes: {rowDiagnostics.linkedLetterMatches}</div>
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
      open={true}
      onToggle={() => {}}
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
  viewMode,
  setViewMode,
  personLayoutMode,
  setPersonLayoutMode,
}) {
  const currentVisualizationKey =
    viewMode === 'geographic'
      ? 'place'
      : personLayoutMode === 'force'
        ? 'force-directed'
        : 'people';

  const setVisualizationMode = (nextMode) => {
    if (nextMode === 'place') {
      setViewMode('geographic');
      return;
    }

    setViewMode('person');
    setPersonLayoutMode(nextMode === 'force-directed' ? 'force' : 'geographic');
  };

  const options = [
    {
      key: 'people',
      label: 'People',
      description: 'People anchored to places',
    },
    {
      key: 'place',
      label: 'Place',
      description: 'Geographic routes and places',
    },
    {
      key: 'force-directed',
      label: 'Force-Directed',
      description: 'Entity network in force layout',
    },
  ];

  return (
    <div className="space-y-3">
      <div className="grid gap-2">
        {options.map((option) => (
          <button
            key={option.key}
            type="button"
            onClick={() => setVisualizationMode(option.key)}
            className={[
              buttonClassName({ active: currentVisualizationKey === option.key }),
              'w-full text-left',
            ].join(' ')}
          >
            <div className="font-semibold">{option.label}</div>
            <div className="mt-0.5 text-xs text-[var(--panel-card-muted-text)]">
              {option.description}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}


function AutocompleteTextInput({
  id,
  label,
  value,
  onChange,
  onKeyDown,
  placeholder,
  suggestions = [],
  helperText,
}) {
  const [isFocused, setIsFocused] = useState(false);
  const query = String(value ?? '').trim().toLowerCase();
  const matchingSuggestions = query.length >= 2
    ? suggestions
        .filter((suggestion) => String(suggestion ?? '').toLowerCase().includes(query))
        .slice(0, 20)
    : [];
  const showSuggestions = isFocused && matchingSuggestions.length > 0;

  const chooseSuggestion = (suggestion) => {
    onChange(suggestion);
    setIsFocused(false);
  };

  return (
    <div className="space-y-2">
      <label htmlFor={id} className="mb-1 block font-medium">{label}</label>
      <div className="relative">
        <input
          id={id}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={onKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => {
            window.setTimeout(() => setIsFocused(false), 120);
          }}
          placeholder={placeholder}
          autoComplete="off"
          className="w-full rounded-xl border border-[var(--input-border)]/80 bg-[var(--input-bg)] px-3 py-2 text-[var(--input-text)] placeholder:text-[var(--input-placeholder)]"
        />
        {showSuggestions ? (
          <div className="absolute left-0 right-0 top-[calc(100%+0.35rem)] z-[120] rounded-2xl border border-[var(--panel-card-border)] bg-[var(--panel-card-bg)] shadow-[0_16px_34px_rgba(0,0,0,0.35)]">
            <div className="border-b border-[var(--panel-card-border)]/70 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-[var(--muted-text)]">
              Suggestions
            </div>
            <div className="max-h-52 overflow-y-auto py-1">
              {matchingSuggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => chooseSuggestion(suggestion)}
                  className="block w-full px-3 py-2 text-left text-sm leading-5 text-[var(--text-main)] transition-colors hover:bg-[var(--panel-card-hover)]"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        ) : null}
      </div>
      {helperText ? <p className="text-xs leading-5 text-[var(--muted-text)]">{helperText}</p> : null}
    </div>
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
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setShowLabels((v) => !v)} className={buttonClassName({ active: showLabels })}>Node Labels</button>
        </div>
      </div>
    </CollapsiblePanelSection>
  );
}

function SearchFilterPanelContent({
  search,
  setSearch,
  personFilter,
  setPersonFilter,
  placeFilter,
  setPlaceFilter,
  routePlaceFilter,
  setRoutePlaceFilter,
  routePeopleFilter,
  setRoutePeopleFilter,
  personSuggestions = [],
  placeSuggestions = [],
  routePlaceSuggestions = [],
  routePeopleSuggestions = [],
  currentMinCountLabel,
  currentRangeLabel,
  graph,
  rowDiagnostics,
  viewMode,
  minCount,
  setMinCount,
  timelineMonths,
  rangeStart,
  setRangeStart,
  rangeEnd,
  setRangeEnd,
  timelineMode,
  setTimelineMode,
  setIsPlaying,
  setPlaybackIndex,
}) {
  const getAppliedStartYear = () => String(timelineMonths[rangeStart] || '').slice(0, 4);
  const getAppliedEndYear = () => String(timelineMonths[rangeEnd] || '').slice(0, 4);
  const getDefaultStartYear = () => String(timelineMonths[0] || '').slice(0, 4);
  const getDefaultEndYear = () => String(timelineMonths[Math.max(timelineMonths.length - 1, 0)] || '').slice(0, 4);

  const [draftSearch, setDraftSearch] = useState(search ?? '');
  const [draftPersonFilter, setDraftPersonFilter] = useState(personFilter ?? '');
  const [draftPlaceFilter, setDraftPlaceFilter] = useState(placeFilter ?? '');
  const [draftRoutePlaceFilter, setDraftRoutePlaceFilter] = useState(routePlaceFilter ?? '');
  const [draftRoutePeopleFilter, setDraftRoutePeopleFilter] = useState(routePeopleFilter ?? '');
  const [draftMinCount, setDraftMinCount] = useState(String(minCount ?? 1));
  const [draftStartYear, setDraftStartYear] = useState(getAppliedStartYear());
  const [draftEndYear, setDraftEndYear] = useState(getAppliedEndYear());
  const [filterStatusMessage, setFilterStatusMessage] = useState('');

  useEffect(() => {
    setDraftSearch(search ?? '');
    setDraftPersonFilter(personFilter ?? '');
    setDraftPlaceFilter(placeFilter ?? '');
    setDraftRoutePlaceFilter(routePlaceFilter ?? '');
    setDraftRoutePeopleFilter(routePeopleFilter ?? '');
    setDraftMinCount(String(minCount ?? 1));
    setDraftStartYear(getAppliedStartYear());
    setDraftEndYear(getAppliedEndYear());
  }, [
    search,
    personFilter,
    placeFilter,
    routePlaceFilter,
    routePeopleFilter,
    minCount,
    rangeStart,
    rangeEnd,
    timelineMonths.length,
    timelineMonths[rangeStart],
    timelineMonths[rangeEnd],
  ]);

  useEffect(() => {
    if (!filterStatusMessage) return undefined;

    const timeoutId = window.setTimeout(() => {
      setFilterStatusMessage('');
    }, 2200);

    return () => window.clearTimeout(timeoutId);
  }, [filterStatusMessage]);

  const resetDraftFilters = () => {
    setDraftSearch(search ?? '');
    setDraftPersonFilter(personFilter ?? '');
    setDraftPlaceFilter(placeFilter ?? '');
    setDraftRoutePlaceFilter(routePlaceFilter ?? '');
    setDraftRoutePeopleFilter(routePeopleFilter ?? '');
    setDraftMinCount(String(minCount ?? 1));
    setDraftStartYear(getAppliedStartYear());
    setDraftEndYear(getAppliedEndYear());
  };

  const clearFilters = () => {
    const defaultEndIndex = Math.max(timelineMonths.length - 1, 0);

    setFilterStatusMessage('Filters cleared. Updating view…');

    window.requestAnimationFrame(() => {
      setDraftSearch('');
      setDraftPersonFilter('');
      setDraftPlaceFilter('');
      setDraftRoutePlaceFilter('');
      setDraftRoutePeopleFilter('');
      setDraftMinCount('1');
      setDraftStartYear(getDefaultStartYear());
      setDraftEndYear(getDefaultEndYear());

      setSearch('');
      setPersonFilter('');
      setPlaceFilter('');
      setRoutePlaceFilter('');
      setRoutePeopleFilter('');
      setMinCount(1);
      setTimelineMode('all');
      setRangeStart(0);
      setRangeEnd(defaultEndIndex);
      setIsPlaying(false);
      setPlaybackIndex(-1);
    });
  };

  const resolveTimelineBoundaryIndexFromYear = (boundary, year) => {
    if (!timelineMonths.length || !year) return -1;

    if (boundary === 'start') {
      return timelineMonths.findIndex((month) => String(month).slice(0, 4) === String(year));
    }

    for (let index = timelineMonths.length - 1; index >= 0; index -= 1) {
      if (String(timelineMonths[index]).slice(0, 4) === String(year)) {
        return index;
      }
    }

    return -1;
  };

  const applyDraftFilters = () => {
    const parsedMinCount = Number.parseInt(String(draftMinCount).trim(), 10);
    const nextMinCount = Number.isFinite(parsedMinCount)
      ? Math.max(1, parsedMinCount)
      : minCount;

    const nextSearch = String(draftSearch ?? '').trim();
    const nextPersonFilter = String(draftPersonFilter ?? '').trim();
    const nextPlaceFilter = String(draftPlaceFilter ?? '').trim();
    const nextRoutePlaceFilter = String(draftRoutePlaceFilter ?? '').trim();
    const nextRoutePeopleFilter = String(draftRoutePeopleFilter ?? '').trim();
    const nextStartIndex = resolveTimelineBoundaryIndexFromYear('start', draftStartYear);
    const nextEndIndex = resolveTimelineBoundaryIndexFromYear('end', draftEndYear);

    setFilterStatusMessage('Updating view…');

    window.requestAnimationFrame(() => {
      setSearch(nextSearch);
      setPersonFilter(nextPersonFilter);
      setPlaceFilter(nextPlaceFilter);
      setRoutePlaceFilter(nextRoutePlaceFilter);
      setRoutePeopleFilter(nextRoutePeopleFilter);
      setMinCount(nextMinCount);
      setDraftMinCount(String(nextMinCount));

      if (nextStartIndex >= 0 && nextEndIndex >= 0) {
        const safeStart = Math.min(nextStartIndex, nextEndIndex);
        const safeEnd = Math.max(nextStartIndex, nextEndIndex);
        setTimelineMode('range');
        setRangeStart(safeStart);
        setRangeEnd(safeEnd);
      } else {
        setTimelineMode('all');
        setRangeStart(0);
        setRangeEnd(Math.max(timelineMonths.length - 1, 0));
      }

      setIsPlaying(false);
      setPlaybackIndex(-1);
    });
  };

  const handleDraftKeyDown = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      applyDraftFilters();
    }
  };

  const timelineYearSuggestions = Array.from(
    new Set(timelineMonths.map((month) => String(month || '').slice(0, 4)).filter(Boolean))
  ).sort((a, b) => Number(a) - Number(b));

  return (
    <div className="space-y-4">
      <div className={sectionCardClassName()}>
        <div className="space-y-3 p-4">
          <h3 className={serifHeadingClassName()}>Current applied filter scope</h3>
          <dl className="space-y-2 text-sm text-[var(--muted-text)]">
            <div className="flex items-start justify-between gap-4">
              <dt className="font-semibold text-[var(--text-main)]">Keyword search</dt>
              <dd className="text-right">{search?.trim() || 'None'}</dd>
            </div>
            <div className="flex items-start justify-between gap-4">
              <dt className="font-semibold text-[var(--text-main)]">Person filter</dt>
              <dd className="text-right">{personFilter?.trim() || 'None'}</dd>
            </div>
            <div className="flex items-start justify-between gap-4">
              <dt className="font-semibold text-[var(--text-main)]">Place filter</dt>
              <dd className="text-right">{placeFilter?.trim() || 'None'}</dd>
            </div>
            <div className="flex items-start justify-between gap-4">
              <dt className="font-semibold text-[var(--text-main)]">Route filter (place)</dt>
              <dd className="text-right">{routePlaceFilter?.trim() || 'None'}</dd>
            </div>
            <div className="flex items-start justify-between gap-4">
              <dt className="font-semibold text-[var(--text-main)]">Route filter (people)</dt>
              <dd className="text-right">{routePeopleFilter?.trim() || 'None'}</dd>
            </div>
            <div className="flex items-start justify-between gap-4">
              <dt className="font-semibold text-[var(--text-main)]">Minimum weight</dt>
              <dd className="text-right">{currentMinCountLabel}</dd>
            </div>
            <div className="flex items-start justify-between gap-4">
              <dt className="font-semibold text-[var(--text-main)]">Date window</dt>
              <dd className="text-right">{currentRangeLabel}</dd>
            </div>
            <div className="grid grid-cols-3 gap-2 border-t border-[var(--panel-card-border)]/70 pt-3 text-center">
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-text)]">Nodes</dt>
                <dd className="mt-1 font-semibold text-[var(--text-main)]">{graph?.nodes?.length ?? 0}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-text)]">Routes</dt>
                <dd className="mt-1 font-semibold text-[var(--text-main)]">{graph?.edges?.length ?? 0}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-text)]">Rows</dt>
                <dd className="mt-1 font-semibold text-[var(--text-main)]">{rowDiagnostics?.filteredRows ?? 'Unknown'}</dd>
              </div>
            </div>
          </dl>
        </div>
      </div>

      <div className={sectionCardClassName({ allowOverflow: true })}>
        <div className="space-y-4 p-4">
          <div className="space-y-2">
            <h2 className={sectionTitleClassName()}>Advanced search criteria</h2>
            <p className="text-sm leading-6 text-[var(--muted-text)]">
              Applied filters will change what is displayed on the map, on charts, and in the timeline animation.
            </p>
          </div>

          <div className="grid gap-4">
            <div className="space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted-text)]">
                Text search
              </h3>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-[var(--text-main)]" htmlFor="keyword-search-input">
                  Keyword search
                </label>
                <input
                  id="keyword-search-input"
                  value={draftSearch}
                  onChange={(event) => setDraftSearch(event.target.value)}
                  onKeyDown={handleDraftKeyDown}
                  placeholder={viewMode === 'geographic' ? 'e.g. Siena, Maria Magdalena, 1613' : 'e.g. Caterina, Cosimo, Siena'}
                  className="w-full rounded-xl border border-[var(--input-border)]/80 bg-[var(--input-bg)] px-3 py-2 text-sm text-[var(--input-text)] placeholder:text-[var(--input-placeholder)]"
                />
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted-text)]">
                People and places
              </h3>
              <div className="grid gap-3">
                <AutocompleteTextInput
                  id="person-filter-input"
                  label="Person"
                  value={draftPersonFilter}
                  onChange={setDraftPersonFilter}
                  onKeyDown={handleDraftKeyDown}
                  placeholder="e.g. Colomba, Medici, Maria"
                  suggestions={personSuggestions}
                />
                <AutocompleteTextInput
                  id="place-filter-input"
                  label="Place"
                  value={draftPlaceFilter}
                  onChange={setDraftPlaceFilter}
                  onKeyDown={handleDraftKeyDown}
                  placeholder="e.g. Siena, Florence, Rome"
                  suggestions={placeSuggestions}
                />
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted-text)]">
                Routes
              </h3>
              <div className="grid gap-3">
                <AutocompleteTextInput
                  id="route-place-filter-input"
                  label="Route Filter (Place)"
                  value={draftRoutePlaceFilter}
                  onChange={setDraftRoutePlaceFilter}
                  onKeyDown={handleDraftKeyDown}
                  placeholder="e.g. Siena → Firenze/Fiorenza"
                  suggestions={routePlaceSuggestions}
                />
                <AutocompleteTextInput
                  id="route-people-filter-input"
                  label="Route Filter (People)"
                  value={draftRoutePeopleFilter}
                  onChange={setDraftRoutePeopleFilter}
                  onKeyDown={handleDraftKeyDown}
                  placeholder="e.g. Colomba → von Habsburg, Maria Magdalena"
                  suggestions={routePeopleSuggestions}
                />
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted-text)]">
                Threshold and date
              </h3>

              <div className="grid gap-3">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-[var(--text-main)]" htmlFor="minimum-weight-input">
                    Minimum {viewMode === 'geographic' ? 'route weight' : 'connection weight'}
                  </label>
                  <input
                    id="minimum-weight-input"
                    type="number"
                    inputMode="numeric"
                    min="1"
                    step="1"
                    value={draftMinCount}
                    onChange={(event) => setDraftMinCount(event.target.value)}
                    onKeyDown={handleDraftKeyDown}
                    className="w-28 rounded-xl border border-[var(--input-border)]/80 bg-[var(--input-bg)] px-3 py-2 text-sm text-[var(--input-text)]"
                    aria-label="Minimum weight"
                  />
                  <div className="text-xs text-[var(--panel-card-muted-text)]">
                    Current applied minimum: {currentMinCountLabel}
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <div className="text-sm font-semibold text-[var(--text-main)]">Date range</div>
                    <div className="mt-1 text-xs leading-5 text-[var(--muted-text)]">
                      Current applied window: {currentRangeLabel}
                    </div>
                    <div className="text-xs leading-5 text-[var(--muted-text)]">
                      Available year range:{' '}
                      {timelineMonths.length
                        ? `${timelineMonths[0]} to ${timelineMonths[timelineMonths.length - 1]}`
                        : 'none detected'}
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <AutocompleteTextInput
                      id="date-start-year-input"
                      label="Start year"
                      value={draftStartYear}
                      onChange={setDraftStartYear}
                      onKeyDown={handleDraftKeyDown}
                      placeholder="e.g. 1608"
                      suggestions={timelineYearSuggestions}
                    />
                    <AutocompleteTextInput
                      id="date-end-year-input"
                      label="End year"
                      value={draftEndYear}
                      onChange={setDraftEndYear}
                      onKeyDown={handleDraftKeyDown}
                      placeholder="e.g. 1636"
                      suggestions={timelineYearSuggestions}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {filterStatusMessage ? (
            <div className="rounded-2xl border border-[var(--panel-card-border)]/70 bg-[var(--panel-card-bg)] px-3 py-2 text-xs font-medium text-[var(--muted-text)]">
              {filterStatusMessage}
            </div>
          ) : null}

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={applyDraftFilters}
              className={buttonClassName({ active: true })}
            >
              Apply Filters
            </button>
            <button
              type="button"
              onClick={clearFilters}
              className={buttonClassName()}
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function PeridotUploadSummaryModal({ summary, onClose }) {
  const popup = summary?.popup || {};
  const capabilityLines = popup.capabilityLines || [];
  const warningLines = popup.warningLines || [];
  const closingLines = popup.closingLines || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-6">
      <div className="max-h-[82vh] w-full max-w-2xl overflow-auto rounded-[28px] border border-[var(--section-border)] bg-[var(--sidebar-bg)] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.5)]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className={`${sectionTitleClassName()} text-lg`}>{popup.title || 'Upload summary'}</h2>
            {popup.intro ? (
              <p className="mt-2 text-sm leading-relaxed text-[var(--panel-card-muted-text)]">{popup.intro}</p>
            ) : null}
          </div>
          <button type="button" onClick={onClose} className={buttonClassName({ variant: 'secondary' })}>
            Close
          </button>
        </div>

        {capabilityLines.length ? (
          <div className="mt-5 rounded-2xl border border-[var(--panel-card-border)] bg-[var(--section-bg)] p-4">
            <div className="font-semibold text-[var(--panel-card-text)]">Visualization compatibility</div>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-relaxed text-[var(--panel-card-muted-text)]">
              {capabilityLines.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </div>
        ) : null}

        {warningLines.length ? (
          <div className="mt-4 rounded-2xl border border-[var(--panel-card-border)] bg-[var(--section-bg)] p-4">
            <div className="font-semibold text-[var(--panel-card-text)]">Warnings</div>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-relaxed text-[var(--panel-card-muted-text)]">
              {warningLines.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </div>
        ) : null}

        {closingLines.length ? (
          <div className="mt-4 space-y-2 text-sm leading-relaxed text-[var(--panel-card-muted-text)]">
            {closingLines.map((line) => (
              <p key={line}>{line}</p>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}


function PeridotUploadSummaryPanel({ summary }) {
  const popup = summary?.popup || {};
  const capabilityLines = popup.capabilityLines || [];
  const warningLines = popup.warningLines || [];
  const closingLines = popup.closingLines || [];

  if (!summary) return null;

  return (
    <div className="rounded-2xl border border-[var(--panel-card-border)] bg-[var(--section-bg)] p-4 shadow-[0_10px_28px_rgba(0,0,0,0.2)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="font-semibold text-[var(--panel-card-text)]">Latest upload summary</div>
          {popup.intro ? (
            <p className="mt-1 text-sm leading-relaxed text-[var(--panel-card-muted-text)]">{popup.intro}</p>
          ) : null}
        </div>
        {summary.hasWarnings ? (
          <span className="rounded-full border border-[var(--panel-card-border)] bg-[var(--stat-card-bg)] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--stat-card-text)]">
            Warnings
          </span>
        ) : (
          <span className="rounded-full border border-[var(--panel-card-border)] bg-[var(--stat-card-bg)] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--stat-card-text)]">
            Accepted
          </span>
        )}
      </div>

      {capabilityLines.length ? (
        <div className="mt-4">
          <div className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted-text)]">Visualization compatibility</div>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-relaxed text-[var(--panel-card-muted-text)]">
            {capabilityLines.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {warningLines.length ? (
        <div className="mt-4">
          <div className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted-text)]">Warnings</div>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-relaxed text-[var(--panel-card-muted-text)]">
            {warningLines.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {closingLines.length ? (
        <div className="mt-4 space-y-2 text-sm leading-relaxed text-[var(--panel-card-muted-text)]">
          {closingLines.map((line) => (
            <p key={line}>{line}</p>
          ))}
        </div>
      ) : null}
    </div>
  );
}


function ColumnMappingStagingPanel({ staging, onClear, onOpenMapping }) {
  if (!staging) return null;

  const mappingState = staging.mappingState || {};
  const coreMapping = mappingState.coreMapping || {};
  const coreDefinitions = mappingState.coreFieldDefinitions || [];
  const customFieldSelections = mappingState.customFieldSelections || [];
  const includedCustomFields = customFieldSelections.filter((field) => field.action === 'include');
  const ignoredCustomFields = customFieldSelections.filter((field) => field.action !== 'include');
  const previewRows = staging.previewRows || [];
  const previewHeaders = (staging.headers || []).slice(0, 6);
  const workbookSummary = staging.workbookSummary || null;
  const workbookWarnings = workbookSummary?.warnings || [];
  const sheetSummaries = staging.sheets || workbookSummary?.sheets || [];
  const canOpenMapping = staging.status === 'ready' && Boolean(staging.mappingState);

  if (staging.status === 'parsing') {
    return (
      <div className="rounded-2xl border border-[var(--panel-card-border)] bg-[var(--section-bg)] p-4 shadow-[0_10px_28px_rgba(0,0,0,0.2)]">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="font-semibold text-[var(--panel-card-text)]">Reading workbook</div>
            <p className="mt-1 text-sm leading-relaxed text-[var(--panel-card-muted-text)]">
              {staging.fileLabel} is being parsed. Large Excel files may take a moment. No active Peridot data has changed.
            </p>
          </div>
          <span className="rounded-full border border-[var(--panel-card-border)] bg-[var(--stat-card-bg)] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--stat-card-text)]">
            Parsing
          </span>
        </div>
      </div>
    );
  }

  if (staging.status === 'error') {
    return (
      <div className="rounded-2xl border border-[var(--panel-card-border)] bg-[var(--section-bg)] p-4 shadow-[0_10px_28px_rgba(0,0,0,0.2)]">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="font-semibold text-[var(--panel-card-text)]">Table staging failed</div>
            <p className="mt-1 text-sm leading-relaxed text-[var(--panel-card-muted-text)]">{staging.errorMessage || 'Peridot could not stage this table.'}</p>
          </div>
          <button type="button" onClick={onClear} className={buttonClassName({ variant: 'secondary' })}>
            Clear
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-[var(--panel-card-border)] bg-[var(--section-bg)] p-4 shadow-[0_10px_28px_rgba(0,0,0,0.2)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="font-semibold text-[var(--panel-card-text)]">Table staged for mapping</div>
          <p className="mt-1 text-sm leading-relaxed text-[var(--panel-card-muted-text)]">
            {staging.fileLabel} staged as {staging.fileType}. {staging.sheetCount || 1} {staging.sheetCount === 1 ? 'sheet' : 'sheets'}, {staging.rowCount} rows, and {staging.columnCount} columns detected.
          </p>
          {staging.workbookMappingMessage ? (
            <p className="mt-2 rounded-xl border border-[var(--section-border)] bg-[var(--stat-card-bg)] px-3 py-2 text-sm leading-relaxed text-[var(--panel-card-muted-text)]">
              {staging.workbookMappingMessage}
            </p>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={onOpenMapping} disabled={!canOpenMapping} className={buttonClassName({ variant: 'primary' })}>
            Open mapping workspace
          </button>
          <button type="button" onClick={onClear} className={buttonClassName({ variant: 'secondary' })}>
            Clear
          </button>
        </div>
      </div>

      {sheetSummaries.length ? (
        <div className="mt-4">
          <div className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted-text)]">Workbook sheets</div>
          <div className="mt-2 space-y-2">
            {sheetSummaries.slice(0, 8).map((sheet) => (
              <div key={sheet.sheetName} className="rounded-xl border border-[var(--panel-card-border)] bg-[var(--stat-card-bg)] px-3 py-2">
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="font-medium text-[var(--panel-card-text)]">{sheet.sheetName}</span>
                  <span className="text-[var(--panel-card-muted-text)]">{sheet.rowCount} rows · {sheet.columnCount} columns</span>
                </div>
                {sheet.headers?.length ? (
                  <div className="mt-1 truncate text-xs text-[var(--panel-card-muted-text)]">
                    Headers: {sheet.headers.slice(0, 8).join(', ')}{sheet.headers.length > 8 ? ', …' : ''}
                  </div>
                ) : null}
              </div>
            ))}
            {sheetSummaries.length > 8 ? (
              <div className="text-sm text-[var(--panel-card-muted-text)]">{sheetSummaries.length - 8} more sheets detected.</div>
            ) : null}
          </div>
        </div>
      ) : null}

      {workbookWarnings.length ? (
        <div className="mt-4 rounded-2xl border border-[var(--section-border)] bg-[var(--stat-card-bg)] p-3">
          <div className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted-text)]">Workbook notes</div>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-relaxed text-[var(--panel-card-muted-text)]">
            {workbookWarnings.slice(0, 5).map((warning, index) => (
              <li key={`${warning.code || 'warning'}-${index}`}>{warning.sheetName ? `${warning.sheetName}: ` : ''}{warning.message}</li>
            ))}
            {workbookWarnings.length > 5 ? <li>{workbookWarnings.length - 5} more notes</li> : null}
          </ul>
        </div>
      ) : null}

      {coreDefinitions.length ? (
        <div className="mt-4">
          <div className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted-text)]">Suggested core mappings</div>
          <div className="mt-2 space-y-1 text-sm text-[var(--panel-card-muted-text)]">
            {coreDefinitions.map((definition) => (
              <div key={definition.key} className="flex items-center justify-between gap-3 rounded-xl border border-[var(--panel-card-border)] bg-[var(--stat-card-bg)] px-3 py-2">
                <span className="font-medium text-[var(--panel-card-text)]">{definition.key}</span>
                <span>{coreMapping[definition.key]?.sheetName && coreMapping[definition.key]?.columnName ? `${coreMapping[definition.key].sheetName} → ${coreMapping[definition.key].columnName}` : coreMapping[definition.key] || 'Unassigned'}</span>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {includedCustomFields.length || ignoredCustomFields.length ? (
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted-text)]">Default Inspector fields</div>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-relaxed text-[var(--panel-card-muted-text)]">
              {includedCustomFields.length ? includedCustomFields.slice(0, 8).map((field) => (
                <li key={field.sourceColumn}>{field.label || field.sourceColumn}</li>
              )) : <li>None suggested yet.</li>}
              {includedCustomFields.length > 8 ? <li>{includedCustomFields.length - 8} more</li> : null}
            </ul>
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted-text)]">Default ignored fields</div>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-relaxed text-[var(--panel-card-muted-text)]">
              {ignoredCustomFields.length ? ignoredCustomFields.slice(0, 8).map((field) => (
                <li key={field.sourceColumn}>{field.label || field.sourceColumn}</li>
              )) : <li>None suggested yet.</li>}
              {ignoredCustomFields.length > 8 ? <li>{ignoredCustomFields.length - 8} more</li> : null}
            </ul>
          </div>
        </div>
      ) : null}

      {previewRows.length && previewHeaders.length ? (
        <div className="mt-4 overflow-x-auto rounded-2xl border border-[var(--panel-card-border)]">
          <table className="min-w-full border-collapse text-left text-xs text-[var(--panel-card-muted-text)]">
            <thead className="bg-[var(--stat-card-bg)] text-[var(--panel-card-text)]">
              <tr>
                {previewHeaders.map((header) => <th key={header} className="px-3 py-2 font-semibold">{header}</th>)}
              </tr>
            </thead>
            <tbody>
              {previewRows.slice(0, 3).map((row, rowIndex) => (
                <tr key={`preview-row-${rowIndex}`} className="border-t border-[var(--panel-card-border)]">
                  {previewHeaders.map((header) => <td key={`${rowIndex}-${header}`} className="max-w-[12rem] truncate px-3 py-2">{row[header]}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      <p className="mt-4 text-sm leading-relaxed text-[var(--panel-card-muted-text)]">
        Single-sheet CSV, TSV, XLSX, and XLS files can use the current mapping workspace. Multi-sheet Excel workbooks now open in a preview-only workbook mapping workspace; final unique-ID-based import will be wired in the next Excel pass.
      </p>
    </div>
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
    peridotFileLabel,
    peridotValidationSummary,
    isPeridotValidationModalOpen,
    handlePeridotCsvUpload,
    handleDownloadPeridotTemplate,
    closePeridotValidationModal,
    columnMappingStaging,
    handleColumnMappingTableUpload,
    openColumnMappingModal,
    clearColumnMappingStaging,
  } = dataInputState;

  return (
    <div className={groupCardClassName()}>
      <div className={groupHeadingClassName()}>DATA</div>
      <CollapsiblePanelSection
        title="Data Inputs"
        open={showDataInputsPanel}
        onToggle={() => setShowDataInputsPanel((v) => !v)}
      >
        <div className="space-y-4">
          <div className="rounded-2xl border border-[var(--panel-card-border)] bg-[var(--section-bg)] p-4 shadow-[0_10px_28px_rgba(0,0,0,0.22)]">
            <div className="mb-3">
              <h2 className={sectionTitleClassName()}>Peridot CSV</h2>
              <p className="mt-2 text-sm leading-relaxed text-[var(--panel-card-muted-text)]">
                Upload one standardized Peridot CSV. Each row should represent one record, document, site, event, observation, relationship, or correspondence item.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleDownloadPeridotTemplate}
                className={buttonClassName({ variant: 'secondary' })}
              >
                Download CSV template
              </button>
              <FilePicker id="peridot-template-file" onChange={handlePeridotCsvUpload} label="Upload completed CSV" />
            </div>

            <div className="mt-3 text-sm text-[var(--panel-card-muted-text)]">Current source: {peridotFileLabel}</div>
          </div>

          <div className="rounded-2xl border border-[var(--panel-card-border)] bg-[var(--section-bg)] p-4 shadow-[0_10px_28px_rgba(0,0,0,0.22)]">
            <div className="mb-3">
              <h2 className={sectionTitleClassName()}>Map your own table</h2>
              <p className="mt-2 text-sm leading-relaxed text-[var(--panel-card-muted-text)]">
                Upload any CSV, TSV, XLSX, or XLS table to preview its columns. Single-sheet files can open the mapping workspace immediately; multi-sheet Excel workbooks will be staged for workbook-aware mapping.
              </p>
            </div>
            <FilePicker id="peridot-column-mapping-file" onChange={handleColumnMappingTableUpload} label="Upload table for mapping preview" />
          </div>

          <ColumnMappingStagingPanel staging={columnMappingStaging} onClear={clearColumnMappingStaging} onOpenMapping={openColumnMappingModal} />

          <PeridotUploadSummaryPanel summary={peridotValidationSummary} />

          <div className="rounded-2xl border border-[var(--section-border)] bg-[var(--stat-card-bg)] p-4 text-sm leading-relaxed text-[var(--stat-card-text)]">
            <div className="font-semibold">Data tips</div>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-[var(--stat-card-muted-text)]">
              <li>Peridot accepts incomplete research data, but some rows may not appear in every visualization.</li>
              <li>Coordinates are optional, but geographic map routes need valid source and target coordinate pairs.</li>
              <li>Names, places, topics, relationships, and languages are used exactly as entered.</li>
              <li>For cleaner networks and charts, standardize your data before upload.</li>
            </ul>
          </div>

          {isPeridotValidationModalOpen && peridotValidationSummary ? (
            <PeridotUploadSummaryModal
              summary={peridotValidationSummary}
              onClose={closePeridotValidationModal}
            />
          ) : null}
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

      <MapAppearancePanelContent
        showThemePanel={showThemePanel}
        setShowThemePanel={setShowThemePanel}
        applyThemePreset={applyThemePreset}
        resetTheme={resetTheme}
      />

      <SummaryPanelContent
        showSummaryPanel={showSummaryPanel}
        setShowSummaryPanel={setShowSummaryPanel}
        rowDiagnostics={rowDiagnostics}
      />
    </div>
  );
}

// SHARED SIDE PANEL SHELL
// This component is the shared side-panel subtree behind the controls and inspector buttons. The app may look
// healthy until this component renders, because the heavy inner trees are gated
// behind the controls and inspector open-state flags.
// This is the key reason repeated refactor failures show up only after opening
// the shared side panel: dormant render-time dependencies live below this shell.

export function LeftControlPanel({
  sidebarState,
  dataInputState,
  displayState,
  timelineState,
  themeState, exportState, analyticsState, inspectorPanelProps,
  inspectorShellComponents,
  inspectorViewComponents,
}) {
  const {
    showLeftSidebar,
    showRightSidebar,
    setShowLeftSidebar,
    setShowRightSidebar,
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
    peridotFileLabel,
    peridotValidationSummary,
    isPeridotValidationModalOpen,
    handlePeridotCsvUpload,
    handleDownloadPeridotTemplate,
    closePeridotValidationModal,
    columnMappingStaging,
    handleColumnMappingTableUpload,
    openColumnMappingModal,
    clearColumnMappingStaging,
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
    personFilter,
    setPersonFilter,
    placeFilter,
    setPlaceFilter,
    routePlaceFilter,
    setRoutePlaceFilter,
    routePeopleFilter,
    setRoutePeopleFilter,
    personSuggestions,
    placeSuggestions,
    routePlaceSuggestions,
    routePeopleSuggestions,
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
  } = exportState; const analyticsPanelState = analyticsState || {};

  const dataInputsSectionState = {
    showDataInputsPanel,
    setShowDataInputsPanel,
  };

  const dataInputsGroupProps = {
    sectionState: dataInputsSectionState,
    dataInputState: {
      peridotFileLabel,
      peridotValidationSummary,
      isPeridotValidationModalOpen,
      handlePeridotCsvUpload,
      handleDownloadPeridotTemplate,
      closePeridotValidationModal,
      columnMappingStaging,
      handleColumnMappingTableUpload,
      openColumnMappingModal,
      clearColumnMappingStaging,
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

  const [activeSidePanelView, setActiveSidePanelView] = useState('controls');

  const isSidePanelOpen = showLeftSidebar || showRightSidebar;
  const closeSidePanel = () => {
    if (showRightSidebar) {
      setShowRightSidebar(false);
      return;
    }

    setShowLeftSidebar(false);
  };
  const showControlsPanel = () => {
    setShowRightSidebar(false);
    setActiveSidePanelView('controls');
    setShowLeftSidebar(true);
  };

  const showDataInputsPanelView = () => {
    setShowRightSidebar(false);
    setActiveSidePanelView('dataInputs');
    setShowLeftSidebar(true);
  };

  const showSearchFilterPanel = () => {
    setShowRightSidebar(false);
    setActiveSidePanelView('searchFilter');
    setShowLeftSidebar(true);
  };


  const showExportSidePanel = () => {
    setShowRightSidebar(false);
    setActiveSidePanelView('export');
    setShowLeftSidebar(true);
  }; const showAnalyticsSidePanel = () => { setShowRightSidebar(false); setActiveSidePanelView('analytics'); setShowLeftSidebar(true); };

  const showTimelineSidePanel = () => {
    setShowRightSidebar(false);
    setActiveSidePanelView('timeline');
    setShowLeftSidebar(true);
  };
  const showInspectorPanel = () => {
    setActiveSidePanelView('inspector');
    setShowLeftSidebar(false);
    setShowRightSidebar(true);
  };

  return (
    <aside className={`${sidebarSurfaceClassName()} relative border-r xl:absolute xl:left-0 xl:top-0 xl:h-full xl:z-30 ${isSidePanelOpen ? 'w-[420px]' : 'w-16'}`}>
      <SidePanelIconRail
        isSidePanelOpen={isSidePanelOpen}
        activePanel={showRightSidebar ? 'inspector' : showLeftSidebar ? activeSidePanelView : null}
        onClose={closeSidePanel}
        onShowControls={showControlsPanel}
        onShowDataInputs={showDataInputsPanelView}
          onShowSearchFilter={showSearchFilterPanel}
          onShowExport={showExportSidePanel}
        onShowAnalytics={showAnalyticsSidePanel} onShowTimeline={showTimelineSidePanel}
        onShowInspector={showInspectorPanel}
      />
      {isSidePanelOpen ? (
        <div className="h-full overflow-auto p-5 pr-20">
          {showLeftSidebar ? (
            <>
              <h1 className={`${panelHeadingClassName()} ${serifHeadingClassName()}`}>
                {activeSidePanelView === 'dataInputs' ? 'Data Inputs' : activeSidePanelView === 'searchFilter' ? 'Search & Filter' : activeSidePanelView === 'export' ? 'Export' : activeSidePanelView === 'analytics' ? 'Analytics' : activeSidePanelView === 'timeline' ? 'Timeline' : 'Control Panel'}
              </h1>
              {activeSidePanelView === 'dataInputs' ? (
                <DataInputsGroup {...dataInputsGroupProps} />
              ) : activeSidePanelView === 'searchFilter' ? (
                <SearchFilterPanelContent
                  search={search}
                  setSearch={setSearch}
                  personFilter={personFilter}
                  setPersonFilter={setPersonFilter}
                  placeFilter={placeFilter}
                  setPlaceFilter={setPlaceFilter}
                  routePlaceFilter={routePlaceFilter}
                  setRoutePlaceFilter={setRoutePlaceFilter}
                  routePeopleFilter={routePeopleFilter}
                  setRoutePeopleFilter={setRoutePeopleFilter}
                  personSuggestions={personSuggestions}
                  placeSuggestions={placeSuggestions}
                  routePlaceSuggestions={routePlaceSuggestions}
                  routePeopleSuggestions={routePeopleSuggestions}
                  currentMinCountLabel={currentMinCountLabel}
                  currentRangeLabel={currentRangeLabel}
                  graph={graph}
                  rowDiagnostics={rowDiagnostics}
                  viewMode={viewMode}
                  minCount={minCount}
                  setMinCount={setMinCount}
                  timelineMonths={timelineMonths}
                  rangeStart={rangeStart}
                  setRangeStart={setRangeStart}
                  rangeEnd={rangeEnd}
                  setRangeEnd={setRangeEnd}
                  timelineMode={timelineMode}
                  setTimelineMode={setTimelineMode}
                  setIsPlaying={setIsPlaying}
                  setPlaybackIndex={setPlaybackIndex}
                />
              ) : activeSidePanelView === 'export' ? (
                <ExportPanelContent {...displayFilteringGroupProps.exportPanelState} />
              ) : activeSidePanelView === 'analytics' ? ( <AnalyticsPanelContent analyticsState={analyticsPanelState} /> ) : activeSidePanelView === 'timeline' ? (
                <TimelinePanelContent
                  {...displayFilteringGroupProps.timelinePanelState}
                  showTimelinePanel={true}
                  setShowTimelinePanel={() => {}}
                  timelineMode={timelineMode}
                  setTimelineMode={setTimelineMode}
                
                CollapsiblePanelSection={CollapsiblePanelSection}
                StepSlider={StepSlider}
                buttonClassName={buttonClassName}
              />
              ) : (
                <DisplayFilteringGroup {...displayFilteringGroupProps} />
              )}
            </>
          ) : null}

          {showRightSidebar ? (
            <InspectorPanelContent
              {...inspectorPanelProps}
              shellComponents={inspectorShellComponents}
              viewComponents={inspectorViewComponents}
            />
          ) : null}
        </div>
      ) : null}
    </aside>
  );
}



