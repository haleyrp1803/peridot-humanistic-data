import React from 'react';
import { MappingInfo } from './PeridotMappingPresentation.jsx';
import { normalizePeridotSubjectSelection } from './peridotSubjectSelection.js';

function checkboxDisabled(selection, target) {
  const totalSelected = (selection.includeRecord ? 1 : 0) + selection.participantIndices.length;
  if (totalSelected > 1) return false;
  if (target === 'record') return selection.includeRecord;
  return selection.participantIndices.includes(target);
}

export default function PeridotSubjectSelectionControl({
  value,
  legacySubjectParticipantIndex = null,
  participants = [],
  onChange,
  noun = 'information',
  showTitle = true,
}) {
  const selection = normalizePeridotSubjectSelection(value, legacySubjectParticipantIndex);
  const setRecord = (checked) => onChange?.({ ...selection, includeRecord: checked });
  const setParticipant = (participantIndex, checked) => {
    const nextIndices = checked
      ? Array.from(new Set([...selection.participantIndices, participantIndex])).sort((a, b) => a - b)
      : selection.participantIndices.filter((valueIndex) => valueIndex !== participantIndex);
    onChange?.({ ...selection, participantIndices: nextIndices });
  };

  return (
    <div className="space-y-2">
      {showTitle ? <div className="text-xs font-semibold text-[var(--muted-text)]">Who or what does this {noun} describe? <MappingInfo text={`Select every subject this mapped ${noun} actually describes. The row itself does not automatically include participants; select them separately. Peridot preserves each selection as a separate, traceable assertion.`} /></div> : null}
      <div className="space-y-2">
        <label className="flex items-start gap-2 rounded-xl border border-[var(--panel-card-border)] bg-[var(--stat-card-bg)] px-3 py-2.5 text-sm text-[var(--panel-card-text)]">
          <input
            type="checkbox"
            checked={selection.includeRecord}
            disabled={checkboxDisabled(selection, 'record')}
            onChange={(event) => setRecord(event.target.checked)}
            className="mt-0.5"
          />
          <span>
            <span className="font-semibold">This row / record itself</span> {!showTitle ? <MappingInfo text={`Select every subject this mapped ${noun} actually describes. Selecting the row does not automatically include participants; select them separately. Peridot preserves each selection as a separate assertion.`} /> : null}
          </span>
        </label>
        {participants.map((participant) => (
          <label key={`subject-participant-${participant.index}`} className="flex items-start gap-2 rounded-xl border border-[var(--panel-card-border)] bg-[var(--stat-card-bg)] px-3 py-2.5 text-sm text-[var(--panel-card-text)]">
            <input
              type="checkbox"
              checked={selection.participantIndices.includes(participant.index)}
              disabled={checkboxDisabled(selection, participant.index)}
              onChange={(event) => setParticipant(participant.index, event.target.checked)}
              className="mt-0.5"
            />
            <span className="font-semibold">{participant.label}</span>
          </label>
        ))}
      </div>
      
    </div>
  );
}
