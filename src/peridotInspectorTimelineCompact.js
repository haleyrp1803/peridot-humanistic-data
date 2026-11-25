/* Compact Timeline selection: one source-backed home per mapped assertion.
 * Active visual categories come from the Timeline renderer's resolved config,
 * never from the unfiltered categoryMemberships inventory.
 */
const text = value => String(value ?? '').trim();
const normalize = value => text(value).toLocaleLowerCase();
const list = value => Array.isArray(value) ? value : [];

export function timelineCompactRecordGroups(mapped = {}, activeCategories = [], row = {}) {
  // A repeated displayed string is not proof of an identical mapped field.
  // Suppress an encoded Evidence entry only if its canonical field identity
  // (column key + value) matches the configured category and that display
  // label/value unambiguously identifies one canonical source field.
  const canonical = list(row?.peridotCanonicalEvidenceFields).length
    ? list(row.peridotCanonicalEvidenceFields)
    : list(row?.generalizedObservation?.evidenceFields);
  const canonicalMatches = new Map();
  canonical.forEach(field => {
    const signature = `${normalize(field.label || field.sourceColumn || field.key)}\u0000${normalize(field.value)}`;
    if (!canonicalMatches.has(signature)) canonicalMatches.set(signature, new Set());
    canonicalMatches.get(signature).add(normalize(field.key || field.sourceColumn || field.label));
  });
  const encoded = new Set();
  list(activeCategories).forEach(category => {
    const signature = `${normalize(category.sourceLabel)}\u0000${normalize(category.sourceValue)}`;
    const identities = canonicalMatches.get(signature);
    if (identities?.size === 1 && identities.has(normalize(category.fieldKey))) encoded.add(signature);
  });
  const evidence = list(mapped.evidence).filter(entry => text(entry.label) && text(entry.value)
    && !encoded.has(`${normalize(entry.label)}\u0000${normalize(entry.value)}`));
  const provenance = [], otherEvidence = [];
  evidence.forEach(entry => {
    if (/archiv|collection|repository|shelfmark|folio|fol\.?\s|manuscript|citation|pdf page|source reference|document id|catalogue|call number/i.test(entry.label)) provenance.push(entry);
    else otherEvidence.push(entry);
  });
  // Keep explicit participant positions; a parallel Source → Target text line
  // adds nothing when both endpoint roles are already present.
  const participants = list(mapped.participants);
  const relationships = list(mapped.relationships).filter(entry => {
    const bothVisible = participants.some(p => p.value === entry.source)
      && participants.some(p => p.value === entry.target);
    return !bothVisible || (text(entry.label) && !/^unknown$|^relationship\s+\d+$/i.test(text(entry.label)));
  }).map(entry => {
    const bothVisible = participants.some(p => p.value === entry.source)
      && participants.some(p => p.value === entry.target);
    return bothVisible ? {...entry, value: text(entry.label)} : entry;
  });
  return { provenance, otherEvidence,
    participants, places: list(mapped.places), relationships };
}

export function timelineVisualCategoryLegend(event = {}) {
  const colors = list(event.inspectorVisualCategories).filter(category =>
    text(category?.id) && text(category?.color) && text(category?.label));
  return {
    available: Array.isArray(event.inspectorVisualCategories),
    categories: colors,
    visible: colors.slice(0, 4),
    hiddenCount: Math.max(0, colors.length - 4),
    displayMode: text(event.inspectorCategoryDisplayMode) || 'colors-and-symbols',
  };
}
