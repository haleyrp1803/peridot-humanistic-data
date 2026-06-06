import React from 'react';
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
}) {
  const hasTimeline = Boolean(timelineMonths?.length);
  const lastTimelineIndex = Math.max((timelineMonths?.length || 1) - 1, 0);
  const normalizedStart = Math.min(rangeStart, rangeEnd);
  const normalizedEnd = Math.max(rangeStart, rangeEnd);
  const startLabel = hasTimeline ? timelineMonths[normalizedStart] : '—';
  const endLabel = hasTimeline ? timelineMonths[normalizedEnd] : '—';
  const playbackLastIndex = Math.max((selectedRowsForPlayback?.length || 1) - 1, 0);
  const visiblePlaybackIndex = Math.max(0, playbackIndex);
  const playbackProgress = selectedRowsForPlayback?.length
    ? Math.round(((visiblePlaybackIndex + 1) / selectedRowsForPlayback.length) * 100)
    : 0;

  const updateStart = (value) => {
    const nextStart = Number(value);
    setRangeStart(nextStart);
    if (nextStart > rangeEnd) setRangeEnd(nextStart);
    setTimelineMode('range');
    setIsPlaying(false);
    setPlaybackIndex(-1);
  };

  const updateEnd = (value) => {
    const nextEnd = Number(value);
    setRangeEnd(nextEnd);
    if (nextEnd < rangeStart) setRangeStart(nextEnd);
    setTimelineMode('range');
    setIsPlaying(false);
    setPlaybackIndex(-1);
  };

  const resetTimeline = () => {
    setTimelineMode('range');
    setRangeStart(0);
    setRangeEnd(lastTimelineIndex);
    setIsPlaying(false);
    setPlaybackIndex(-1);
  };

  const showAllDates = () => {
    setTimelineMode('all');
    setIsPlaying(false);
    setPlaybackIndex(-1);
  };

  const playTimeline = () => {
    if (!selectedRowsForPlayback?.length) return;
    setPlaybackIndex((current) => (current < 0 ? 0 : current));
    setIsPlaying(true);
  };

  return (
    <div className="shrink-0 rounded-[28px] border border-[#c4e0ef]/50 bg-[linear-gradient(135deg,rgba(8,39,25,0.96),rgba(5,29,19,0.98))] px-4 py-3 text-[#fbf7ea] shadow-[0_16px_40px_rgba(0,0,0,0.3)]">
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(280px,360px)] xl:items-center">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="peridot-kicker !mb-0 text-[10px] text-[#dfe9c8]">Timeline</p>
              <div className="mt-1 text-sm font-semibold text-[#f5ecd2]">
                {timelineMode === 'all' ? 'All available dates' : `${startLabel} to ${endLabel}`}
              </div>
            </div>
            <div className="rounded-full border border-[#dfe9c8]/35 bg-[#dfe9c8]/10 px-3 py-1 text-xs text-[#dfe9c8]">
              Applied window: {currentRangeLabel}
            </div>
          </div>

          {hasTimeline ? (
            <div className="mt-3 grid gap-3 lg:grid-cols-2">
              <label className="block text-xs font-semibold uppercase tracking-[0.14em] text-[#dfe9c8]">
                Start year
                <input
                  type="range"
                  min="0"
                  max={lastTimelineIndex}
                  value={normalizedStart}
                  onChange={(event) => updateStart(event.target.value)}
                  className="mt-2 w-full accent-[#d6a36a]"
                />
                <span className="mt-1 block text-sm normal-case tracking-normal text-[#f5ecd2]">{startLabel}</span>
              </label>

              <label className="block text-xs font-semibold uppercase tracking-[0.14em] text-[#dfe9c8]">
                End year
                <input
                  type="range"
                  min="0"
                  max={lastTimelineIndex}
                  value={normalizedEnd}
                  onChange={(event) => updateEnd(event.target.value)}
                  className="mt-2 w-full accent-[#d6a36a]"
                />
                <span className="mt-1 block text-sm normal-case tracking-normal text-[#f5ecd2]">{endLabel}</span>
              </label>
            </div>
          ) : (
            <div className="mt-3 rounded-2xl border border-[#dfe9c8]/25 bg-[#dfe9c8]/10 p-3 text-sm text-[#dfe9c8]">
              No usable dates are available for timeline playback.
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-[#dfe9c8]/25 bg-[#dfe9c8]/10 p-3">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={playTimeline}
              disabled={!selectedRowsForPlayback?.length}
              className="rounded-full border border-[#dfe9c8]/40 bg-[#edf4df] px-3 py-1.5 text-sm font-bold text-[#203429] transition hover:bg-[#d6a36a] disabled:cursor-not-allowed disabled:opacity-55"
            >
              Play
            </button>
            <button
              type="button"
              onClick={() => setIsPlaying(false)}
              className="rounded-full border border-[#dfe9c8]/40 bg-[#102c20] px-3 py-1.5 text-sm font-bold text-[#f5ecd2] transition hover:bg-[#214332]"
            >
              Pause
            </button>
            <button
              type="button"
              onClick={resetTimeline}
              className="rounded-full border border-[#dfe9c8]/40 bg-[#102c20] px-3 py-1.5 text-sm font-bold text-[#f5ecd2] transition hover:bg-[#214332]"
            >
              Reset
            </button>
            <button
              type="button"
              onClick={showAllDates}
              className="rounded-full border border-[#dfe9c8]/40 bg-[#102c20] px-3 py-1.5 text-sm font-bold text-[#f5ecd2] transition hover:bg-[#214332]"
            >
              All dates
            </button>
          </div>

          <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
            <label className="block text-xs font-semibold uppercase tracking-[0.14em] text-[#dfe9c8]">
              Playback speed
              <select
                value={playbackSpeed}
                onChange={(event) => setPlaybackSpeed(Number(event.target.value))}
                className="mt-1 w-full rounded-xl border border-[#dfe9c8]/35 bg-[#fbf8f1] px-3 py-2 text-sm text-[#203429]"
              >
                {playbackSpeedOptions.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </label>
            <div className="text-right text-xs text-[#dfe9c8]">
              <div>{currentPlaybackSpeedLabel}</div>
              <div>{isPlaying ? 'Playing' : playbackIndex >= 0 ? 'Paused' : 'Ready'}</div>
            </div>
          </div>

          <label className="mt-3 block text-xs font-semibold uppercase tracking-[0.14em] text-[#dfe9c8]">
            Playback position
            <input
              type="range"
              min="0"
              max={playbackLastIndex}
              value={visiblePlaybackIndex}
              disabled={!selectedRowsForPlayback?.length}
              onChange={(event) => {
                setIsPlaying(false);
                setPlaybackIndex(Number(event.target.value));
              }}
              className="mt-2 w-full accent-[#d6a36a] disabled:opacity-50"
            />
            <span className="mt-1 block normal-case tracking-normal text-[#f5ecd2]">
              {currentPlaybackLabel} {selectedRowsForPlayback?.length ? `• ${playbackProgress}%` : ''}
            </span>
          </label>
        </div>
      </div>
    </div>
  );
}
