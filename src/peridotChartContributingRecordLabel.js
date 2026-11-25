/** Human-readable contribution identity. The researcher-declared mapping wins;
 * generated Peridot identity is the fallback. Do not infer IDs from unrelated
 * uploaded fields or from the position in a filtered contribution list.
 */
export function getPeridotChartContributingRecordLabel(row) {
  const identity = row?.generalizedObservation?.recordIdentity || row?.recordIdentity;
  if (identity?.complete && identity.strategy !== 'row' && Array.isArray(identity.components)) {
    const parts = identity.components.map((item) => String(item?.value ?? '').trim()).filter(Boolean);
    if (parts.length && parts.length === identity.components.length) return parts.join(' · ');
  }
  // Generalized mapping's legacy compatibility row retains the declared
  // identity in its canonical recordId even when recordIdentity was not copied.
  // The identity runtime percent-encodes each part and joins composites by +.
  const canonicalId = String(row?.generalizedObservation?.recordId || identity?.recordId || row?.recordId || '');
  const mapped = canonicalId.match(/^peridot-record:(field|composite|workbook-key):(.+)$/);
  if (mapped) {
    try {
      const parts = mapped[2].split('+').map((part) => decodeURIComponent(part));
      if (parts.every((part) => part.trim())) return parts.join(' · ');
    } catch { /* Preserve the canonical Peridot ID when decoding is invalid. */ }
  }
  const fallback = [row?.recordId, identity?.recordId, row?.id]
    .map((value) => String(value ?? '').trim()).find(Boolean);
  return fallback || 'Peridot ID unavailable';
}
