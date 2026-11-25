/* Compact Inspector presentation only: group repeated mapped labels without
 * merging source assertions that belong to different subjects. The complete
 * entity structure and full dossier remain unchanged.
 */
const asText = (value) => String(value ?? '').trim();
const comparable = (value) => asText(value).toLocaleLowerCase();

export function omitRedundantCompactRelationshipEntries(entries = []) {
  // Technical compatibility prose is not a historical relationship type.
  // Contributing-record previews already expose participants with explicit
  // Source/Target (or researcher-defined) role labels. The full dossier keeps
  // the complete attributed relationship inventory.
  return entries.filter((entry) => !/^(source|target) relationship with$/i.test(asText(entry?.label)));
}

export function groupCompactMappedEntries(entries = [], { fallbackLabel = 'Mapped field' } = {}) {
  const groups = [];
  const byKey = new Map();
  for (const entry of entries) {
    const value = asText(entry?.value);
    if (!value) continue;
    const label = asText(entry?.label) || fallbackLabel;
    const subject = asText(entry?.subject);
    const subjectId = asText(entry?.subjectId);
    // Do not merge assertions merely because distinct subjects have a matching
    // display label, and do not collapse distinct researcher-defined roles.
    const key = JSON.stringify([comparable(label), subjectId || comparable(subject)]);
    let group = byKey.get(key);
    if (!group) {
      group = { label, subject, subjectId, values: [] };
      byKey.set(key, group);
      groups.push(group);
    }
    // Exact repeated values offer no additional information in this compact
    // unique-value list. Occurrence counts live in the relevant mark metrics.
    if (!group.values.some((item) => comparable(item.value) === comparable(value))) {
      group.values.push({ value, detail: asText(entry?.detail) });
    }
  }
  return groups;
}
