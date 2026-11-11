/* Timeline II grouped swimlanes: a presentation-only, linear-time layout.
 * Category identity and precedence are fixed by the category resolver.
 * Viewport-dependent demand is measured in bounded temporal pixel buckets;
 * the caller commits that demand only after navigation settles.
 */
export const GROUPED_LANE_EMPTY_MIN = 5;
export const GROUPED_LANE_SETTLE_MS = 210;

export function groupedLaneInventory(categories = []) {
  return [...categories.map(category => ({...category, key: category.id})),
    {key: '__peridot_uncategorized__', id: '__peridot_uncategorized__', label: 'No priority category', color: '#3B3B3B'}];
}

export function groupedLaneDemand(inventory, items, memberships, project, axisStart, axisLength) {
  const count = Math.min(240, Math.max(1, Math.ceil(axisLength / 44)));
  const buckets = inventory.map(() => new Int32Array(count + 1));
  const laneIndex = new Map(inventory.map((lane,index) => [lane.key,index]));
  const eventCount = new Array(inventory.length).fill(0);
  for (const item of items) {
    const key = memberships.get(item.event.id)?.primaryCategoryId || '__peridot_uncategorized__';
    const index = laneIndex.get(key) ?? inventory.length - 1;
    eventCount[index]++;
    const start = project(item.day) - (item.period ? 0 : 19);
    const finish = project(item.endDay) + (item.period ? 35 : 19);
    const a = Math.max(0, Math.min(count-1, Math.floor((Math.min(start, finish) - axisStart) / axisLength * count)));
    const b = Math.max(a, Math.min(count-1, Math.floor((Math.max(start, finish) - axisStart) / axisLength * count)));
    buckets[index][a]++;
    buckets[index][b+1]--;
  }
  return inventory.map((lane,index) => {
    let concurrent=0, peak=0;
    for(let bucket=0;bucket<count;bucket++) {
      concurrent += buckets[index][bucket];
      peak = Math.max(peak,concurrent);
    }
    // A quiet active lane remains legible; congestion earns extra room but
    // does not expand in proportion to the total number of historical records.
    return {key:lane.key, count:eventCount[index], peak,
      weight:eventCount[index] ? 46 + Math.min(100, 15 * Math.sqrt(Math.max(0,peak-1))) : GROUPED_LANE_EMPTY_MIN};
  });
}

export function groupedLaneGeometry(inventory, demand, crossStart, crossSpan) {
  const weights = new Map(demand.map(row => [row.key,row.weight]));
  const inactive = inventory.filter(lane => (weights.get(lane.key) ?? GROUPED_LANE_EMPTY_MIN) <= GROUPED_LANE_EMPTY_MIN).length;
  const activeWeight = inventory.reduce((sum,lane) => {
    const weight = weights.get(lane.key) ?? GROUPED_LANE_EMPTY_MIN;
    return sum + (weight > GROUPED_LANE_EMPTY_MIN ? weight : 0);
  },0);
  // Empty lanes keep a genuinely slender strip, even if every category is
  // temporarily empty. Unused cross-axis room remains parchment rather than
  // misleadingly inflating inactive categories.
  const emptyWidth = Math.min(GROUPED_LANE_EMPTY_MIN, crossSpan / Math.max(1,inventory.length));
  const activeSpace = Math.max(0,crossSpan - inactive * emptyWidth);
  let cursor = crossStart;
  return inventory.map(lane => {
    const weight = weights.get(lane.key) ?? GROUPED_LANE_EMPTY_MIN;
    const width = weight <= GROUPED_LANE_EMPTY_MIN ? emptyWidth
      : activeSpace * weight / Math.max(1,activeWeight);
    const row = { ...lane, start:cursor, end:cursor+width, center:cursor+width/2, width };
    cursor += width;
    return row;
  });
}

export function groupedLaneMutedColor(hex, opacity = 0.23) {
  const match = /^#([0-9a-f]{6})$/i.exec(hex || '');
  if (!match) return 'rgba(59,59,59,0.17)';
  const r = parseInt(match[1].slice(0,2),16);
  const g = parseInt(match[1].slice(2,4),16);
  const b = parseInt(match[1].slice(4,6),16);
  return `rgba(${r},${g},${b},${opacity})`;
}
