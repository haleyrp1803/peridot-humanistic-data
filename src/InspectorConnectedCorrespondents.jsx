/*
 * Person-to-person Inspector navigation list.
 * 
 * This component renders related people/correspondents ordered by relationship weight and delegates navigation to the shared Inspector callback supplied by the parent.
 * 
 * Maintenance cautions:
 * - Keep it presentational; relationship derivation belongs upstream.
 */

import React from 'react';

export function InspectorConnectedCorrespondents({ names, onOpenPerson }) {
  if (!names?.length) return null;

  const extractName = (value) => value.replace(/\s*\(\d+\)\s*$/, '');

  return (
    <div className="rounded-2xl border border-[var(--section-border)] bg-[var(--section-bg)] p-4 shadow-sm">
      <div className="font-semibold text-[var(--text-strong)] tracking-[0.14em] uppercase text-[11px]">
        Correspondents by letter count
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {names.map((name) => (
          <button
            key={name}
            type="button"
            onClick={() => onOpenPerson(extractName(name))}
            className="rounded-full border border-[var(--inspector-clickable-border)] bg-[var(--inspector-clickable-bg)] px-3 py-1.5 text-xs font-medium text-[var(--inspector-clickable-text)] transition-colors hover:border-[var(--inspector-clickable-hover-border)] hover:bg-[var(--inspector-clickable-hover-bg)] hover:text-[var(--inspector-clickable-hover-text)]"
          >
            {name}
          </button>
        ))}
      </div>
    </div>
  );
}
