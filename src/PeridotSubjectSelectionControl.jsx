import React from 'react';
import { MappingInfo } from './PeridotMappingPresentation.jsx';
import { normalizePeridotSubjectSelection } from './peridotSubjectSelection.js';

export default function PeridotSubjectSelectionControl({
  value,
  legacySubjectParticipantIndex = null,
  participants = [],
  onChange,
  noun = 'information',
  showTitle = true,
}) {
  const selection = normalizePeridotSubjectSelection(value, legacySubjectParticipantIndex);
  const selectedCount = (selection.includeRecord ? 1 : 0) + selection.participantIndices.length;
  const instruction = selectedCount === 1
    ? "Choose any that apply. To replace the current selection, first select another option, then uncheck the original. At least one selection must remain; select another option before removing the only selected one."
    : "Choose any that apply. You can select or deselect multiple options; at least one must remain selected.";
  const optionClass = (checked) => `flex cursor-pointer items-start gap-2 rounded-xl border px-3 py-2.5 text-sm text-[var(--panel-card-text)] transition-colors ${checked ? "border-[var(--button-primary-border)] bg-[var(--section-bg)]" : "border-[var(--panel-card-border)] bg-[var(--stat-card-bg)] hover:bg-[var(--section-bg)]"}`;
  const setRecord = (checked) => {
    if (!checked && selectedCount === 1) return;
    onChange?.({ ...selection, includeRecord: checked });
  };
  const setParticipant = (participantIndex, checked) => {
    if (!checked && selectedCount === 1) return;
    const nextIndices = checked
      ? Array.from(new Set([...selection.participantIndices, participantIndex])).sort((a, b) => a - b)
      : selection.participantIndices.filter((valueIndex) => valueIndex !== participantIndex);
    onChange?.({ ...selection, participantIndices: nextIndices });
  };

  return (
    <div className="space-y-2">
      {showTitle ? <div className="text-xs font-semibold text-[var(--muted-text)]">Who or what does this {noun} describe? <MappingInfo text={`Select every subject this mapped ${noun} actually describes. The row itself does not automatically include participants; select them separately. Peridot preserves each selection as a separate, traceable assertion.`} /></div> : null}
      <p className="text-xs leading-relaxed text-[var(--panel-card-muted-text)]">{instruction}</p>
      <div className="space-y-2" role="group" aria-label={`Subjects described by this ${noun}; multiple selections allowed`}>
        <label className={optionClass(selection.includeRecord)}>
          <input
            type="checkbox"
            checked={selection.includeRecord}
            onChange={(event) => setRecord(event.target.checked)}
            className="mt-0.5 accent-[var(--button-primary-bg)]"
          />
          <span>
            <span className="font-semibold">This row / record itself</span> {!showTitle ? <MappingInfo text={`Select every subject this mapped ${noun} actually describes. Selecting the row does not automatically include participants; select them separately. Peridot preserves each selection as a separate assertion.`} /> : null}
          </span>
        </label>
        {participants.map((participant) => (
          <label key={`subject-participant-${participant.index}`} className={optionClass(selection.participantIndices.includes(participant.index))}>
            <input
              type="checkbox"
              checked={selection.participantIndices.includes(participant.index)}
              onChange={(event) => setParticipant(participant.index, event.target.checked)}
              className="mt-0.5 accent-[var(--button-primary-bg)]"
            />
            <span className="font-semibold">{participant.label}</span>
          </label>
        ))}
      </div>
      
    </div>
  );
}
