import React from 'react';
import { MappingInfo } from './PeridotMappingPresentation.jsx';
import { normalizePeridotValueHandling, PERIDOT_VALUE_CARDINALITIES } from './peridotMappedValueHandling.js';

export default function PeridotValueHandlingControl({ valueHandling, onChange, disabled = false }) {
  const handling = normalizePeridotValueHandling(valueHandling);
  const multiple = handling.cardinality === PERIDOT_VALUE_CARDINALITIES.multiple;

  const update = (patch) => onChange?.({ ...handling, ...patch });

  return (
    <div className="space-y-3">
      <div>
        <div className="text-[15px] font-bold leading-tight text-[var(--panel-card-text)]">Can one cell contain more than one value? <MappingInfo text="Choose Yes only when this particular mapped field uses one cell to store several separate values." /></div>
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-[var(--panel-card-border)] bg-[var(--stat-card-bg)] px-3 py-2.5 text-sm text-[var(--panel-card-text)]">
          <input
            type="radio"
            checked={!multiple}
            disabled={disabled}
            onChange={() => update({ cardinality: PERIDOT_VALUE_CARDINALITIES.single })}
            className="peridot-mapping-choice-input"
          />
          <span><span className="font-semibold">No</span>, each cell contains at most one value</span>
        </label>
        <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-[var(--panel-card-border)] bg-[var(--stat-card-bg)] px-3 py-2.5 text-sm text-[var(--panel-card-text)]">
          <input
            type="radio"
            checked={multiple}
            disabled={disabled}
            onChange={() => update({ cardinality: PERIDOT_VALUE_CARDINALITIES.multiple })}
            className="peridot-mapping-choice-input"
          />
          <span><span className="font-semibold">Yes</span>, some cells contain several values</span>
        </label>
      </div>
      {multiple ? (
        <label className="block">
          <div className="mb-1 text-xs font-semibold text-[var(--panel-card-text)]">What separates the values? <MappingInfo text="Peridot splits only this mapped field using the delimiter you supply. The original source cell remains preserved." /></div>
          <input
            type="text"
            value={handling.delimiter}
            disabled={disabled}
            onChange={(event) => update({ delimiter: event.target.value })}
            aria-label="Value delimiter"
            className="peridot-mapping-input w-full max-w-[12rem] rounded-xl border border-[var(--input-border)] bg-[var(--input-bg)] px-3 py-2 text-[var(--input-text)]"
          />

        </label>
      ) : null}
    </div>
  );
}
