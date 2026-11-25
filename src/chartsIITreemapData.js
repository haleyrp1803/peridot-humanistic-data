/* Charts II B3.11 — nonnegative, additive category sizes.
 * Each source observation contributes at most once. Source categories are
 * never inferred as hierarchical unless the researcher explicitly selects
 * two category columns. Display limits consolidate omitted groups in an
 * explicitly named Other tile rather than silently dropping their mass.
 */
import { parseAnalyticsNumber, getAnalyticsFieldValue } from './analyticsDerivationHelpers.js';

const isMissing = value => value === null || value === undefined || String(value).trim() === '';
const keyOf = value => String(value).trim();
const limitOf = number => Number.isInteger(+number) && +number > 0 ? +number : 10;

function retainWithOther(entries, limit, labelPrefix) {
  const sorted = [...entries].sort((a,b) => b.value - a.value || a.label.localeCompare(b.label));
  if (sorted.length <= limit) return { entries: sorted, omitted: 0 };
  // Aggregate *all* omitted categories; this preserves the root total.
  const keep = sorted.slice(0, limit);
  const rest = sorted.slice(limit);
  const value = rest.reduce((sum, item) => sum + item.value, 0);
  keep.push({ label: `Other (${rest.length} ${rest.length === 1 ? labelPrefix.replace(/s$/, '') : labelPrefix})`, value, count: rest.reduce((sum, item) => sum + item.count, 0), contributingRows: rest.flatMap(item => item.contributingRows || []), other: true, members: rest });
  return { entries: keep, omitted: rest.length };
}

export function deriveChartsIITreemap(rows = [], { parentField = '', childField = '', measureField = 'recordCount', maxGroups = 10 } = {}) {
  const records = Array.isArray(rows) ? rows : [];
  const hierarchy = Boolean(childField);
  const countMode = measureField === 'recordCount';
  const groups = new Map();
  const reporting = { scope: records.length, mode: hierarchy ? 'hierarchy' : 'single',
    measureField, parentField, childField: hierarchy ? childField : '',
    aggregation: countMode ? 'count' : 'sum', includedRecords: 0,
    excluded: { missingCategory: 0, missingMeasure: 0, invalidMeasure: 0, negativeMeasure: 0, zeroMeasure: 0 },
    omittedParents: 0, omittedChildren: 0, displayedParents: 0, total: 0,
    note: 'Areas encode nonnegative additive counts or sums. Missing measurements are not zero; negative measurements are excluded.' };
  for (const row of records) {
    const parentRaw = getAnalyticsFieldValue(row, parentField);
    const childRaw = hierarchy ? getAnalyticsFieldValue(row, childField) : null;
    if (isMissing(parentRaw) || (hierarchy && isMissing(childRaw))) { reporting.excluded.missingCategory++; continue; }
    let value = 1;
    if (!countMode) {
      const raw = Object.prototype.hasOwnProperty.call(row || {}, measureField)
        ? row[measureField] : getAnalyticsFieldValue(row, measureField);
      if (isMissing(raw)) { reporting.excluded.missingMeasure++; continue; }
      value = parseAnalyticsNumber(raw);
      if (value === null || !Number.isFinite(value)) { reporting.excluded.invalidMeasure++; continue; }
      if (value < 0) { reporting.excluded.negativeMeasure++; continue; }
      if (value === 0) { reporting.excluded.zeroMeasure++; continue; }
    }
    const parent = keyOf(parentRaw);
    const child = hierarchy ? keyOf(childRaw) : null;
    if (!groups.has(parent)) groups.set(parent, { label: parent, value: 0, count: 0, contributingRows: [], children: new Map() });
    const group = groups.get(parent);
    group.value += value; group.count++; group.contributingRows.push(row);
    if (hierarchy) {
      if (!group.children.has(child)) group.children.set(child, { label: child, value: 0, count: 0, contributingRows: [] });
      const subgroup = group.children.get(child);
      subgroup.value += value; subgroup.count++; subgroup.contributingRows.push(row);
    }
    reporting.includedRecords++;
  }
  // Preserve the exact omitted members inside each Other tile. This is
  // presentation metadata only: aggregate values and top-level totals remain
  // unchanged, and the researcher can drill into all retained subcategories.
  // Preserve the exact omitted members inside each Other tile. This is
  // presentation metadata only: aggregate values and top-level totals remain
  // unchanged, and the researcher can drill into all retained subcategories.
  const allParents = [...groups.values()].filter(group => group.value > 0).map(group => ({
    label: group.label, value: group.value, count: group.count, contributingRows: group.contributingRows,
    children: hierarchy ? [...group.children.values()].filter(child => child.value > 0)
      .sort((a,b) => b.value - a.value || a.label.localeCompare(b.label)) : [],
  }));
  const parentsLimited = retainWithOther(allParents, limitOf(maxGroups), 'parents');
  reporting.omittedParents = parentsLimited.omitted;
  const parents = parentsLimited.entries.map(group => {
    if (!hierarchy || group.other) return { ...group, children: group.children || [] };
    const children = retainWithOther(group.children, limitOf(maxGroups), 'categories');
    reporting.omittedChildren += children.omitted;
    return { ...group, children: children.entries };
  });
  reporting.displayedParents = parents.length;
  reporting.total = parents.reduce((sum, group) => sum + group.value, 0);
  return { parents, total: reporting.total, reporting };
}
