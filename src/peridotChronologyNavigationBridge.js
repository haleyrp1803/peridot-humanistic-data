/*
 * Transitional bridge between a Gregorian-day navigation window and legacy
 * year-entry playback filtering. The window belongs to the researcher; the
 * index pair is only a compatibility projection, not canonical navigation.
 * Replace this projection when canonical assertion-day filtering is wired.
 */
import { civilDay, civilFromDay, createChronologyDomain } from './peridotChronologyWindow.js';

export function indexedCalendarDomain(yearEntries) {
  const years = (yearEntries || []).map(Number).filter(Number.isInteger);
  if (!years.length) return null;
  const earliest = Math.min(...years);
  const latest = Math.max(...years);
  return createChronologyDomain(civilDay(earliest), civilDay(latest));
}

export function projectCalendarWindowToIndexedYears(yearEntries, startDay, endDay) {
  const years = (yearEntries || []).map(Number);
  if (!years.length) return { rangeStart: 0, rangeEnd: 0 };
  if (!Number.isFinite(startDay) || !Number.isFinite(endDay)) {
    return { rangeStart: 0, rangeEnd: years.length - 1 };
  }
  const startYear = civilFromDay(Math.min(startDay, endDay)).year;
  const endYear = civilFromDay(Math.max(startDay, endDay)).year;
  // Pick observed-year entries inside the continuous window where possible.
  // Empty intervening intervals cannot yet be represented by the legacy index
  // filter, so temporarily resolve to the nearest recorded year. Pass C
  // replaces this projection with assertion-level calendar bounds.
  const inWindow = years.map((year, index) => ({year, index}))
    .filter(({year}) => year >= startYear && year <= endYear);
  if (inWindow.length) return {
    rangeStart: inWindow[0].index,
    rangeEnd: inWindow[inWindow.length - 1].index,
  };
  const midpoint = (startYear + endYear) / 2;
  const nearest = years.reduce((best, year, index) =>
    Math.abs(year - midpoint) < best.distance
      ? {index, distance: Math.abs(year - midpoint)} : best,
    {index: 0, distance: Infinity});
  return {rangeStart: nearest.index, rangeEnd: nearest.index};
}
