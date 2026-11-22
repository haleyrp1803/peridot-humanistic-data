/*
 * Charts II's stable Explore-scope field inventory.
 *
 * React's dataset/filter pipeline produces a new rows array when the scoped
 * records change. A WeakMap keyed by that array allows Catalogue and Builder
 * to share one discovery result without retaining old datasets permanently.
 * No chart derivation uses this cache: playback calculations always receive
 * the current rows. Do not mutate the entries of an active scope in place.
 */
import { getAvailableAnalyticsFields } from './analyticsDerivationHelpers.js';

const emptyRows = Object.freeze([]);
const inventoryCache = new WeakMap();

export function getChartsIIFieldInventory(rows = []) {
  const records = Array.isArray(rows) ? rows : emptyRows;
  const previous = inventoryCache.get(records);
  if (previous) return previous;

  const discovered = getAvailableAnalyticsFields(records);
  const result = {
    ...discovered,
    histogramMeasureOptions: discovered.yMetricOptions,
    // Canonical date projections, not raw uploaded date text.
    temporalXAxisOptions: discovered.dateFieldOptions.filter(
      field => field.key === 'year' || field.key === 'fullDate',
    ),
  };
  inventoryCache.set(records, result);
  return result;
}
