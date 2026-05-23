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
