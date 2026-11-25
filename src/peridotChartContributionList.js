/** Bounded rendering for chart contributing records. All contributions remain
 * accessible by search and incrementally extending the visible slice.
 */
export const INITIAL_CHART_CONTRIBUTIONS = 25;
export const CHART_CONTRIBUTION_BATCH_SIZE = 50;

export function filterPeridotChartContributions(records = [], query = '', labelForRecord = () => '') {
  const needle = String(query ?? '').trim().toLocaleLowerCase();
  if (!needle) return records;
  return records.filter((row) => String(labelForRecord(row) ?? '').toLocaleLowerCase().includes(needle));
}

export function nextPeridotChartContributionLimit(current, total, increment = CHART_CONTRIBUTION_BATCH_SIZE) {
  const available = Math.max(0, Number(total) || 0);
  const visible = Math.max(0, Number(current) || 0);
  const amount = Math.max(1, Number(increment) || CHART_CONTRIBUTION_BATCH_SIZE);
  return Math.min(available, visible + amount);
}
