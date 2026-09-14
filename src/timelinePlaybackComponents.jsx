/*
 * Timeline UI components.
 *
 * This module renders both the older Timeline panel content and the current bottom Visualizations timeline scrubber. The scrubber provides dual-handle year range control, playback controls, speed selection, and playback-position scrubbing.
 *
 * Important relationships:
 * - `App.jsx` owns timeline state and filtered rows.
 * - `PeridotVisualizationsWorkspace.jsx` places the scrubber below the visualization stage.
 * - `timelinePlaybackHelpers.js` contains pure date/window derivation.
 *
 * Maintenance cautions:
 * - Timeline must respect the active Search & Filter date scope. Test Apply/Clear Filters, range dragging, playback, and reset together.
 *
 * State-flow contract:
 * - This file renders controls only; it does not own the canonical timeline
 *   state. `App.jsx` owns `timelineMode`, `rangeStart`, `rangeEnd`,
 *   `playbackIndex`, `isPlaying`, and `playbackSpeed`.
 * - The bottom scrubber changes the global visualization scope. It is not an
 *   Analytics-only chart range and should not be wired directly to chart-local
 *   state in `AnalyticsPanel.jsx`.
 * - `onResetTimeline` should restore both the selected range and playback
 *   progress because downstream graph/export rows depend on the resulting
 *   visible row scope.
 * - Range-thumb movement uses local preview state while the researcher is
 *   interacting. Canonical range state is committed only when the interaction
 *   finishes so expensive visualization derivations do not fight the pointer.
 */
import React, { useEffect, useRef, useState } from 'react';
import {
  buildTimelineBoundaryOptions,
  resolveTimelineBoundaryIndex,
} from './timelinePlaybackHelpers';

export function TimelineDateRangeControls({
  currentRangeLabel,
  timelineMonths,
  draftStartYear,
  setDraftStartYear,
  draftEndYear,
  setDraftEndYear,
}) {
  const {
    timelineYears,
  } = buildTimelineBoundaryOptions(
    timelineMonths,
    0,
    Math.max(timelineMonths.length - 1, 0)
  );
  const constrainedEndYears = timelineYears.filter((year) => {
    if (!draftStartYear) return true;
    return Number(year) >= Number(draftStartYear);
  });

  const handleStartYearChange = (nextStartYear) => {
    setDraftStartYear(nextStartYear);

    if (draftEndYear && Number(nextStartYear) > Number(draftEndYear)) {
      setDraftEndYear(nextStartYear);
    }
  };
  return (
    <div className="space-y-3">
      <div className="text-sm text-[var(--muted-text)]">
        Current applied window: {currentRangeLabel}
      </div>

      <div className="text-sm text-[var(--muted-text)]">
        Available year range:{' '}
        {timelineMonths.length
          ? `${timelineMonths[0]} to ${timelineMonths[timelineMonths.length - 1]}`
          : 'none detected'}
      </div>
      {timelineMonths.length ? (
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <div className="text-xs font-medium uppercase tracking-wide text-[var(--muted-text)]">
              Start year
            </div>
            <select
              value={draftStartYear || ''}
              onChange={(event) => handleStartYearChange(event.target.value)}
              className="w-full rounded-xl border border-[var(--input-border)]/80 bg-[var(--input-bg)] px-3 py-2 text-[var(--input-text)]"
            >
              {timelineYears.map((year) => (
                <option key={`start-year-${year}`} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <div className="text-xs font-medium uppercase tracking-wide text-[var(--muted-text)]">
              End year
            </div>
            <select
              value={draftEndYear || ''}
              onChange={(event) => setDraftEndYear(event.target.value)}
              className="w-full rounded-xl border border-[var(--input-border)]/80 bg-[var(--input-bg)] px-3 py-2 text-[var(--input-text)]"
            >
              {constrainedEndYears.map((year) => (
                <option key={`end-year-${year}`} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        </div>
      ) : null}
    </div>
  );
}
export function TimelinePanelContent({
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
  timelineMode,
  setTimelineMode,
  CollapsiblePanelSection,
  StepSlider,
  buttonClassName,
}) {
  return (
    <CollapsiblePanelSection
      title="Timeline"
      open={showTimelinePanel}
      onToggle={() => setShowTimelinePanel((v) => !v)}
      className="mt-3"
    >
      <div className="space-y-3">
        <div className="text-sm text-[var(--muted-text)]">
          Current window: {currentRangeLabel}
        </div>
        <div className="text-xs text-[var(--muted-text)]">
          Date range controls now live in Search & Filter. Timeline controls remain here for playback.
        </div>

        <div className="rounded-2xl border border-[var(--panel-border)]/70 bg-[var(--panel-bg)]/60 p-3">
          <div className="text-sm text-[var(--muted-text)]">
            Current animated letter date: {currentPlaybackLabel}
          </div>
          <div className="mt-2 text-sm text-[var(--muted-text)]">
            Playback speed: {currentPlaybackSpeedLabel}
          </div>

          <div className="mt-3">
            <StepSlider
              options={playbackSpeedOptions}
              value={playbackSpeed}
              onChange={setPlaybackSpeed}
            />
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => {
                if (!selectedRowsForPlayback.length) return;
                setPlaybackIndex((current) => (current < 0 ? 0 : current));
                setIsPlaying(true);
              }}
              aria-label="Play animation"
              title="Play animation"
              className={buttonClassName({ active: isPlaying })}
            >
              Play
            </button>
            <button
              type="button"
              onClick={() => setIsPlaying(false)}
              aria-label="Pause animation"
              title="Pause animation"
              className={buttonClassName({
                active: !isPlaying && playbackIndex >= 0,
              })}
            >
              Pause
            </button>
            <button
              type="button"
              onClick={() => {
                setIsPlaying(false);
                setPlaybackIndex(-1);
              }}
              className={buttonClassName()}
            >
              Reset animation
            </button>
          </div>
        </div>
      </div>
    </CollapsiblePanelSection>
  );
}
export function VisualizationTimelineScrubber({
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
  timelineMode,
  setTimelineMode,
  availableTemporalRoles = [],
  enabledTemporalRoles = [],
  setEnabledTemporalRoles,
  timelinePlaybackMode = 'cumulative',
  setTimelinePlaybackMode,
}) {
  const hasTimeline = Boolean(timelineMonths?.length);
  const lastTimelineIndex = Math.max((timelineMonths?.length || 1) - 1, 0);
  const committedStart = Math.min(rangeStart, rangeEnd);
  const committedEnd = Math.max(rangeStart, rangeEnd);
  const [previewRange, setPreviewRange] = useState(() => ({
    start: committedStart,
    end: committedEnd,
  }));
  const [isAdjustingRange, setIsAdjustingRange] = useState(false);
  const [timeTypeMenuOpen, setTimeTypeMenuOpen] = useState(false);
  const previewRangeRef = useRef(previewRange);
  const rangeInteractionRef = useRef(false);

  useEffect(() => {
    previewRangeRef.current = previewRange;
  }, [previewRange]);

  useEffect(() => {
    if (isAdjustingRange) return;
    const nextPreview = {
      start: Math.min(committedStart, lastTimelineIndex),
      end: Math.min(committedEnd, lastTimelineIndex),
    };
    previewRangeRef.current = nextPreview;
    setPreviewRange(nextPreview);
  }, [committedStart, committedEnd, lastTimelineIndex, isAdjustingRange]);

  const previewStart = Math.min(previewRange.start, previewRange.end);
  const previewEnd = Math.max(previewRange.start, previewRange.end);
  const startLabel = hasTimeline ? timelineMonths[previewStart] : '—';
  const endLabel = hasTimeline ? timelineMonths[previewEnd] : '—';
  const startPercent = lastTimelineIndex ? (previewStart / lastTimelineIndex) * 100 : 0;
  const endPercent = lastTimelineIndex ? (previewEnd / lastTimelineIndex) * 100 : 100;
  const enabledRoleSet = new Set(enabledTemporalRoles || []);
  const hasTemporalRoles = availableTemporalRoles.length > 0;

  const stopPlayback = () => {
    setIsPlaying(false);
    setPlaybackIndex(-1);
  };

  const beginRangeInteraction = () => {
    rangeInteractionRef.current = true;
    setIsAdjustingRange(true);
    setIsPlaying(false);
  };

  const beginKeyboardRangeInteraction = (event) => {
    if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End', 'PageUp', 'PageDown'].includes(event.key)) return;
    beginRangeInteraction();
  };

  const commitKeyboardRangeInteraction = (event) => {
    if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End', 'PageUp', 'PageDown'].includes(event.key)) return;
    commitPreviewRange();
  };

  const previewStartChange = (value) => {
    const nextStart = Math.min(Number(value), previewRangeRef.current.end);
    const nextPreview = { ...previewRangeRef.current, start: nextStart };
    previewRangeRef.current = nextPreview;
    setPreviewRange(nextPreview);
    setIsAdjustingRange(true);
  };

  const previewEndChange = (value) => {
    const nextEnd = Math.max(Number(value), previewRangeRef.current.start);
    const nextPreview = { ...previewRangeRef.current, end: nextEnd };
    previewRangeRef.current = nextPreview;
    setPreviewRange(nextPreview);
    setIsAdjustingRange(true);
  };

  function commitPreviewRange() {
    if (!rangeInteractionRef.current) return;
    const nextStart = Math.min(previewRangeRef.current.start, previewRangeRef.current.end);
    const nextEnd = Math.max(previewRangeRef.current.start, previewRangeRef.current.end);
    rangeInteractionRef.current = false;
    setIsAdjustingRange(false);
    setTimelineMode('range');
    setRangeStart(nextStart);
    setRangeEnd(nextEnd);
    stopPlayback();
  }

  const resetTimeline = () => {
    const nextPreview = { start: 0, end: lastTimelineIndex };
    previewRangeRef.current = nextPreview;
    setPreviewRange(nextPreview);
    rangeInteractionRef.current = false;
    setIsAdjustingRange(false);
    setTimelineMode('range');
    setRangeStart(0);
    setRangeEnd(lastTimelineIndex);
    stopPlayback();
  };

  const togglePlay = () => {
    if (isPlaying) {
      setIsPlaying(false);
      return;
    }
    if (!selectedRowsForPlayback?.length) return;
    setPlaybackIndex((current) => (current < 0 ? 0 : current));
    setIsPlaying(true);
  };

  const toggleTemporalRole = (role) => {
    if (!setEnabledTemporalRoles) return;
    setEnabledTemporalRoles((currentRoles) => {
      const nextRoles = new Set(currentRoles || []);
      if (nextRoles.has(role)) nextRoles.delete(role);
      else nextRoles.add(role);
      return availableTemporalRoles.filter((candidate) => nextRoles.has(candidate));
    });
    stopPlayback();
  };

  const enableAllTemporalRoles = () => {
    if (!setEnabledTemporalRoles) return;
    setEnabledTemporalRoles([...availableTemporalRoles]);
    stopPlayback();
  };

  const activeTimeTypeLabel = !enabledTemporalRoles.length
    ? 'None selected'
    : enabledTemporalRoles.length === 1
      ? enabledTemporalRoles[0]
      : `${enabledTemporalRoles.length} selected`;

  return (
    <div className="rounded-[18px] border border-[var(--peridot-role-ornament-line-muted)] bg-[var(--peridot-color-hex-102c20)] px-3 py-2 text-[var(--peridot-color-hex-fbf7ea)] shadow-[0_12px_28px_var(--peridot-color-rgba-rgba-0-0-0-0-28)]">
      <style>{`
        .peridot-dual-range input[type='range'] {
          -webkit-appearance: none;
          appearance: none;
          background: transparent;
          height: 30px;
          pointer-events: none;
          position: absolute;
          inset: 0;
          touch-action: pan-y;
          width: 100%;
        }
        .peridot-dual-range input[type='range']::-webkit-slider-runnable-track { background: transparent; height: 3px; }
        .peridot-dual-range input[type='range']::-moz-range-track { background: transparent; height: 3px; }
        .peridot-dual-range input[type='range']::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          background: var(--peridot-color-hex-d6a36a);
          border: 2px solid var(--peridot-color-hex-fff8e8);
          border-radius: 9999px;
          box-shadow: 0 3px 9px var(--peridot-color-rgba-rgba-0-0-0-0-32);
          cursor: grab;
          height: 18px;
          margin-top: -7px;
          pointer-events: auto;
          width: 18px;
        }
        .peridot-dual-range input[type='range']::-moz-range-thumb {
          background: var(--peridot-color-hex-d6a36a);
          border: 2px solid var(--peridot-color-hex-fff8e8);
          border-radius: 9999px;
          box-shadow: 0 3px 9px var(--peridot-color-rgba-rgba-0-0-0-0-32);
          cursor: grab;
          height: 18px;
          pointer-events: auto;
          width: 18px;
        }
      `}</style>

      <div className="grid min-h-[50px] gap-3 xl:grid-cols-[250px_150px_180px_minmax(280px,1fr)_auto] xl:items-center">
        <div className="flex min-w-0 items-center gap-3 border-[var(--peridot-color-hex-dfe9c8-a20)] xl:border-r xl:pr-4">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[var(--peridot-color-hex-dfe9c8-a45)] text-[15px] text-[var(--peridot-color-hex-f5ecd2)]">
            ◷
          </div>
          <div className="min-w-0">
            <div className="truncate [font-family:Georgia,'Palatino_Linotype','Book_Antiqua',Palatino,serif] text-[16px] font-bold text-[var(--peridot-color-hex-f5ecd2)]">
              Timeline &amp; playback
            </div>
            <div className="truncate text-[10px] text-[var(--peridot-color-hex-c8d7bd)]">
              {isAdjustingRange ? 'Release to apply range' : 'Explore how locations change over time'}
            </div>
          </div>
        </div>

        <div className="relative">
          <div className="text-[9px] font-semibold uppercase tracking-[0.12em] text-[var(--peridot-color-hex-dfe9c8)]">Time types</div>
          <button
            type="button"
            onClick={() => setTimeTypeMenuOpen((value) => !value)}
            className="mt-0.5 inline-flex w-full items-center justify-between gap-2 rounded-full border border-[var(--peridot-color-hex-dfe9c8-a35)] bg-[var(--peridot-color-hex-fbf8f1)] px-3 py-1.5 text-[10px] font-semibold text-[var(--peridot-color-hex-203429)]"
            aria-expanded={timeTypeMenuOpen}
          >
            <span className="truncate">{activeTimeTypeLabel}</span>
            <span aria-hidden="true" className="text-[9px]">⌄</span>
          </button>

          {timeTypeMenuOpen ? (
            <div className="absolute bottom-[calc(100%+8px)] left-0 z-[180] w-[230px] rounded-xl border border-[var(--peridot-color-hex-d8c79a)] bg-[var(--peridot-color-hex-fffaf0)] p-2.5 text-[var(--peridot-color-hex-203429)] shadow-[0_14px_30px_rgba(0,0,0,0.3)]">
              <div className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--peridot-color-hex-6f6554)]">Time types</div>
              {hasTemporalRoles ? (
                <div className="grid gap-0.5">
                  {availableTemporalRoles.map((role) => (
                    <label key={role} className="flex items-center gap-2 rounded-lg px-1 py-1 text-[12px] font-semibold hover:bg-[var(--peridot-color-hex-edf4df)]">
                      <input
                        type="checkbox"
                        checked={enabledRoleSet.has(role)}
                        onChange={() => toggleTemporalRole(role)}
                        className="h-4 w-4 rounded border-[var(--peridot-color-hex-cbdab2)]"
                      />
                      <span>{role}</span>
                    </label>
                  ))}
                  {enabledTemporalRoles.length !== availableTemporalRoles.length ? (
                    <button
                      type="button"
                      onClick={enableAllTemporalRoles}
                      className="mt-1 justify-self-start text-[10px] font-semibold text-[var(--peridot-color-hex-9b6f2f)] underline underline-offset-4"
                    >
                      Select all
                    </button>
                  ) : null}
                </div>
              ) : (
                <div className="text-[11px] text-[var(--peridot-color-hex-6f6554)]">No mapped time types are available.</div>
              )}
            </div>
          ) : null}
        </div>

        <label className="block">
          <div className="text-[9px] font-semibold uppercase tracking-[0.12em] text-[var(--peridot-color-hex-dfe9c8)]">Event mode</div>
          <select
            value={timelinePlaybackMode}
            onChange={(event) => {
              if (!setTimelinePlaybackMode) return;
              setTimelinePlaybackMode(event.target.value);
              stopPlayback();
            }}
            className="mt-0.5 w-full rounded-full border border-[var(--peridot-color-hex-dfe9c8-a35)] bg-[var(--peridot-color-hex-fbf8f1)] px-3 py-1.5 text-[10px] font-semibold text-[var(--peridot-color-hex-203429)]"
          >
            <option value="cumulative">Cumulative Events</option>
            <option value="co-current">Co-current Events</option>
          </select>
        </label>

        {hasTimeline ? (
          <div className="min-w-0 border-[var(--peridot-color-hex-dfe9c8-a20)] xl:border-x xl:px-4">
            <div className="mb-0.5 flex items-center justify-between text-[10px] font-semibold text-[var(--peridot-color-hex-dfe9c8)]">
              <span>{startLabel}</span>
              <span>{endLabel}</span>
            </div>
            <div className="peridot-dual-range relative h-8">
              <div className="absolute left-0 right-0 top-1/2 h-[3px] -translate-y-1/2 rounded-full bg-[var(--peridot-color-hex-dfe9c8-a25)]" />
              <div
                className="absolute top-1/2 h-[3px] -translate-y-1/2 rounded-full bg-[var(--peridot-color-hex-d6a36a)]"
                style={{ left: `${startPercent}%`, right: `${100 - endPercent}%` }}
              />
              <input
                type="range"
                min="0"
                max={lastTimelineIndex}
                value={previewStart}
                onPointerDown={beginRangeInteraction}
                onChange={(event) => previewStartChange(event.target.value)}
                onPointerUp={commitPreviewRange}
                onPointerCancel={commitPreviewRange}
                onKeyDown={beginKeyboardRangeInteraction}
                onKeyUp={commitKeyboardRangeInteraction}
                onBlur={commitPreviewRange}
                aria-label="Timeline start year"
                aria-valuetext={startLabel}
              />
              <input
                type="range"
                min="0"
                max={lastTimelineIndex}
                value={previewEnd}
                onPointerDown={beginRangeInteraction}
                onChange={(event) => previewEndChange(event.target.value)}
                onPointerUp={commitPreviewRange}
                onPointerCancel={commitPreviewRange}
                onKeyDown={beginKeyboardRangeInteraction}
                onKeyUp={commitKeyboardRangeInteraction}
                onBlur={commitPreviewRange}
                aria-label="Timeline end year"
                aria-valuetext={endLabel}
              />
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-[var(--peridot-color-hex-dfe9c8-a25)] bg-[var(--peridot-color-hex-dfe9c8-a10)] px-3 py-2 text-xs text-[var(--peridot-color-hex-dfe9c8)]">
            No usable dates are available.
          </div>
        )}

        <div className="flex shrink-0 items-end justify-end gap-2">
          <button
            type="button"
            onClick={togglePlay}
            disabled={!selectedRowsForPlayback?.length}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--peridot-color-hex-d6a36a)] bg-[var(--peridot-color-hex-f5ecd2)] text-sm font-bold text-[var(--peridot-color-hex-203429)] transition hover:bg-[var(--peridot-color-hex-d6a36a)] disabled:cursor-not-allowed disabled:opacity-50"
            aria-label={isPlaying ? 'Pause timeline playback' : 'Play timeline'}
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? 'Ⅱ' : '▶'}
          </button>
          <button
            type="button"
            onClick={resetTimeline}
            className="mb-0.5 rounded-full border border-[var(--peridot-color-hex-dfe9c8-a35)] bg-[var(--peridot-color-hex-102c20)] px-3 py-1.5 text-[9px] font-bold text-[var(--peridot-color-hex-f5ecd2)] transition hover:bg-[var(--peridot-color-hex-214332)]"
          >
            Reset
          </button>
          <label className="min-w-[118px] text-[9px] font-semibold uppercase tracking-[0.12em] text-[var(--peridot-color-hex-dfe9c8)]">
            Speed
            <select
              value={playbackSpeed}
              onChange={(event) => setPlaybackSpeed(Number(event.target.value))}
              className="mt-0.5 w-full rounded-full border border-[var(--peridot-color-hex-dfe9c8-a35)] bg-[var(--peridot-color-hex-fbf8f1)] px-2.5 py-1.5 text-[10px] normal-case tracking-normal text-[var(--peridot-color-hex-203429)]"
            >
              {playbackSpeedOptions.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </label>
        </div>
      </div>
    </div>
  );
}
