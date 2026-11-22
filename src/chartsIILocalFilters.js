/*
 * Charts II B4.4 — chart-local row filtering.
 * Does not mutate source rows, Explore state, or shared playback state.
 * Categorical choices within a rule are OR; enabled rules combine with AND.
 * Empty category selections and empty numerical bounds do not restrict data.
 */
import { getAnalyticsFieldValue, parseAnalyticsNumber } from './analyticsDerivationHelpers.js';

const present = value => value !== null && value !== undefined && String(value).trim() !== '';
const readFilterField = (row, field) => present(row?.[field]) ? row[field] : getAnalyticsFieldValue(row, field);
const normalizedNumber = value => {
  if (!present(value)) return null;
  const parsed = parseAnalyticsNumber(value);
  return Number.isFinite(parsed) ? parsed : null;
};

export function isChartsIILocalRuleActive(rule) {
  if (!rule?.field) return false;
  if (rule.type === 'category') return Array.isArray(rule.values) && rule.values.length > 0;
  if (rule.type === 'number') return normalizedNumber(rule.min) !== null || normalizedNumber(rule.max) !== null;
  return false;
}

export function applyChartsIILocalFilters(rows = [], rules = []) {
  const input = Array.isArray(rows) ? rows : [];
  const active = (Array.isArray(rules) ? rules : []).filter(isChartsIILocalRuleActive);
  if (!active.length) return input;
  return input.filter(row => active.every(rule => {
    const value = readFilterField(row, rule.field);
    if (rule.type === 'category') {
      if (!present(value)) return false;
      return rule.values.includes(String(value).trim());
    }
    const numeric = normalizedNumber(value);
    if (numeric === null) return false;
    const min = normalizedNumber(rule.min);
    const max = normalizedNumber(rule.max);
    return (min === null || numeric >= min) && (max === null || numeric <= max);
  }));
}

export function getChartsIICategoryFilterOptions(rows = [], field = '') {
  if (!field) return [];
  const frequencies = new Map();
  for (const row of Array.isArray(rows) ? rows : []) {
    const value = readFilterField(row, field);
    if (!present(value)) continue;
    const label = String(value).trim();
    frequencies.set(label, (frequencies.get(label) || 0) + 1);
  }
  return [...frequencies].map(([value, count]) => ({ value, count }))
    .sort((a, b) => b.count - a.count || a.value.localeCompare(b.value));
}

export function countChartsIIActiveFilters(rules = []) {
  return (Array.isArray(rules) ? rules : []).filter(isChartsIILocalRuleActive).length;
}

/** Limit each categorical filter to one selected value for single-series chart modes.
 * Other filter rules are preserved; source rows and incoming rules are not mutated.
 */
export function restrictChartsIILocalFiltersToSingleCategory(rules = []) {
  return rules.map(rule => rule.type === 'category' && (rule.values || []).length > 1
    ? { ...rule, values: rule.values.slice(0, 1) }
    : rule);
}
