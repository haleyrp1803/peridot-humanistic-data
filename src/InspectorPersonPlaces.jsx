import React from 'react';

function extractPlace(value) {
  return value.replace(/\s*\(\d+\)\s*$/, '');
}

function PlaceButtonGroup({ title, names, onOpenPlace }) {
  if (!names?.length) return null;

  return (
    <div className="rounded-2xl border border-[var(--section-border)] bg-[var(--section-bg)] p-4 shadow-sm">
      <div className="font-semibold text-[var(--text-strong)] tracking-[0.14em] uppercase text-[11px]">
        {title}
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {names.map((name) => (
          <button
            key={`${title}:${name}`}
            type="button"
            onClick={() => onOpenPlace(extractPlace(name))}
            className="rounded-full border border-[var(--inspector-clickable-border)] bg-[var(--inspector-clickable-bg)] px-3 py-1.5 text-xs font-medium text-[var(--inspector-clickable-text)] transition-colors hover:border-[var(--inspector-clickable-hover-border)] hover:bg-[var(--inspector-clickable-hover-bg)] hover:text-[var(--inspector-clickable-hover-text)]"
          >
            {name}
          </button>
        ))}
      </div>
    </div>
  );
}

export function InspectorPersonPlaces({ sentPlaces, receivedPlaces, onOpenPlace }) {
  if (!sentPlaces?.length && !receivedPlaces?.length) return null;

  return (
    <div className="space-y-4">
      <PlaceButtonGroup
        title="Places this person sent letters to"
        names={sentPlaces}
        onOpenPlace={onOpenPlace}
      />
      <PlaceButtonGroup
        title="Places where this person received letters"
        names={receivedPlaces}
        onOpenPlace={onOpenPlace}
      />
    </div>
  );
}
