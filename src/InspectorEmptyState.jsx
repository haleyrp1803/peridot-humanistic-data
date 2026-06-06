/*
 * Empty Inspector state.
 * 
 * This small component renders the default message shown when no Inspector evidence target is selected. It should remain simple and reusable across compact and full Inspector surfaces.
 */

import React from 'react';

export function InspectorEmptyState() {
  return (
    <div className="rounded-2xl border border-dashed border-[var(--empty-state-border)]/80 bg-[var(--empty-state-bg)] p-4 text-sm text-[var(--empty-state-text)]">
      Click a place or a route to inspect it. Hovering an edge also exposes its weight.
    </div>
  );
}
