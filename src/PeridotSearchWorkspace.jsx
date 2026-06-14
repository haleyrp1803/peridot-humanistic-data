/*
 * Search & Filter workspace.
 *
 * This component renders the global active-dataset filtering surface. It separates
 * draft filter input from applied filter state so expensive graph/data
 * recomputation only happens when the user chooses Apply Filters.
 *
 * Important relationships:
 * - `App.jsx` owns draft/applied filter state and recomputation status.
 * - Visualizations, Timeline, Analytics, Inspector, and Export should consume the
 *   active filtered dataset defined here.
 *
 * Maintenance cautions:
 * - Do not make text inputs recompute data on every keystroke.
 * - Predictive suggestions should fill draft fields only; Apply Filters should
 *   commit global state.
 * - This file is allowed to organize Search UI, but it should not introduce new
 *   filtering semantics unless the App-level search pipeline is updated in the
 *   same bounded behavior pass.
 *
 * Scope contract:
 * - Text/entity inputs here update draft state only. They must not recompute
 *   graph data while the user is typing.
 * - Apply commits Search & Filter fields and resets playback so the next
 *   visual/export scope starts at the beginning of the newly filtered row set.
 * - Clear resets Search & Filter fields and timeline boundaries together,
 *   because the global visible dataset is the intersection of timeline window
 *   and committed Search & Filter criteria.
 *
 * Search green compact tabbed layout pass:
 * - Converts the dense three-column Advanced Search layout into a tabbed
 *   workflow: Build Search, Results, and Refine / Inspect.
 * - Harmonizes the palette with the rest of Peridot's layered light-green, sage, moss, and
 *   gold workspace system used in the Data mapping modal and Visualizations
 *   header, while retaining clear hover, active, and keyboard-focus feedback.
 * - This is a visual/UX-architecture pass. The green compact pass keeps the existing capability
 *   filters, facets, result cards, and Inspector handoff semantics intact.
 *
 * Results sizing/layout pass:
 * - Condenses only the Results tab and result-card presentation.
 * - Does not alter Apply/Clear handlers, tab state, App-level filtering, facet behavior,
 *   result derivation, or Inspector handoff semantics.
 *
 * Structured criteria pass:
 * - Adds a small fielded criteria builder inside Build Search.
 * - Keeps criteria draft-only until Apply Filters commits them through App.jsx.
 * - Uses plain Boolean connectors: the first rule starts the structured search, and later rules use AND, OR, or EXCLUDING.
 * - Limits the builder to five rows so OR/Exclude searches have room without
 *   recreating the dense UI this workspace was simplified to avoid.
 *
 * Structured criteria predictive suggestions pass:
 * - Reuses the existing predictive suggestion component for structured value inputs
 *   when a criterion field maps cleanly to person, place, route, date, capability,
 *   or evidence-field values.
 * - Suggestions still update draft criteria only; Apply Filters remains the only
 *   global recomputation trigger.
 *
 * Browse indexes pass:
 * - Adds a dataset-wide Browse tab for people, places, routes, and evidence fields.
 * - Browse entries populate draft criteria and return to Build Search; Apply Filters
 *   remains the only global recomputation trigger.
 *
 * Moss contrast pass:
 * - Uses the sampled moss green from the user's reference swatch as a mid-tone
 *   card background for browse/facet sections.
 * - Keeps light greens for the workspace shell, mid greens for section cards and
 *   feedback chips, and dark greens for action/emphasis controls.
 *
 * Boolean structured criteria terminology pass:
 * - Renames structured-criteria operators so the first rule starts the search and later rules read as AND, OR, and EXCLUDING.
 * - Keeps the logic deliberately non-nested: all AND rows must match, at least one
 *   OR row must match when any are present, and EXCLUDING rows remove
 *   matching records.
 */
import React, { useEffect, useMemo, useState } from 'react';
import {
  CAPABILITY_FILTER_OPTIONS,
  buildPeridotSearchFacets,
  buildPeridotSearchResults,
  getCapabilityFilterLabel,
} from './peridotSearchResultHelpers.js';

const SHELL_CLASS =
  'rounded-[1.6rem] border border-[var(--peridot-color-hex-8fa582)] bg-[var(--peridot-color-hex-cfdfc5)] text-[var(--peridot-color-hex-203729)] shadow-[0_24px_70px_var(--peridot-color-rgba-rgba-0-0-0-0-22)]';
const CARD_CLASS =
  'rounded-[1.25rem] border border-[var(--peridot-color-hex-8fa582)] bg-[var(--peridot-color-hex-d8e6cf)] shadow-[0_12px_30px_var(--peridot-color-rgba-rgba-39-50-36-0-12)]';
const PANEL_INSET_CLASS =
  'rounded-[1rem] border border-[var(--peridot-color-hex-9fb28f)] bg-[var(--peridot-color-hex-c7d9bc)] shadow-inner shadow-white/20';
const FIELD_LABEL_CLASS = 'block text-[0.62rem] font-black uppercase tracking-[0.14em] text-[var(--peridot-color-hex-38553d)]';
const MUTED_TEXT_CLASS = 'text-sm leading-5 text-[var(--peridot-color-hex-465d49)]';
const PRIMARY_BUTTON_CLASS =
  'rounded-full border border-[var(--peridot-color-hex-b88734)] bg-[var(--peridot-color-hex-c89843)] px-4 py-2 text-xs font-black uppercase tracking-[0.14em] text-[var(--peridot-color-hex-fffaf0)] shadow-[0_8px_18px_var(--peridot-color-rgba-rgba-68-49-20-0-16)] transition duration-150 hover:border-[var(--peridot-color-hex-d7b462)] hover:bg-[var(--peridot-color-hex-d2a653)] hover:shadow-[0_10px_22px_var(--peridot-color-rgba-rgba-68-49-20-0-22)] active:translate-y-[1px] active:bg-[var(--peridot-color-hex-a9782c)] active:shadow-[0_4px_10px_var(--peridot-color-rgba-rgba-68-49-20-0-16)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--peridot-color-hex-c89843-a55)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--peridot-color-hex-cfdfc5)]';
const SECONDARY_BUTTON_CLASS =
  'rounded-full border border-[var(--peridot-color-hex-7f9b70)] bg-[var(--peridot-color-hex-eaf3e1)] px-4 py-2 text-xs font-black uppercase tracking-[0.14em] text-[var(--peridot-color-hex-274633)] shadow-[0_7px_16px_var(--peridot-color-rgba-rgba-39-50-36-0-08)] transition duration-150 hover:border-[var(--peridot-color-hex-466d47)] hover:bg-[var(--peridot-color-hex-d2e4c4)] hover:text-[var(--peridot-color-hex-183524)] hover:shadow-[0_9px_20px_var(--peridot-color-rgba-rgba-39-50-36-0-13)] active:translate-y-[1px] active:bg-[var(--peridot-color-hex-bdd4ad)] active:shadow-[0_4px_10px_var(--peridot-color-rgba-rgba-39-50-36-0-10)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--peridot-color-hex-78976a-a55)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--peridot-color-hex-cfdfc5)]';
const DARK_BUTTON_CLASS =
  'rounded-full border border-[var(--peridot-color-hex-244c35-a20)] bg-[var(--peridot-color-hex-244c35)] px-4 py-2 text-xs font-black uppercase tracking-[0.14em] text-[var(--peridot-color-hex-fffaf0)] shadow-[0_8px_18px_var(--peridot-color-rgba-rgba-32-55-40-0-16)] transition duration-150 hover:bg-[var(--peridot-color-hex-315f43)] hover:shadow-[0_10px_22px_var(--peridot-color-rgba-rgba-32-55-40-0-22)] active:translate-y-[1px] active:bg-[var(--peridot-color-hex-183826)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--peridot-color-hex-78976a-a60)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--peridot-color-hex-edf5e5)]';
const CHIP_BUTTON_CLASS =
  'rounded-full border px-2.5 py-1 text-[0.72rem] font-bold transition duration-150 active:translate-y-[1px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--peridot-color-hex-78976a-a55)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--peridot-color-hex-edf5e5)]';
const INPUT_CLASS =
  'mt-1.5 w-full rounded-xl border border-[var(--peridot-color-hex-98ad8c)] bg-[var(--peridot-color-hex-f8fbf4)] px-3 py-2 text-sm text-[var(--peridot-color-hex-203729)] shadow-inner shadow-black/5 transition duration-150 placeholder:text-[var(--peridot-color-hex-718069)] hover:border-[var(--peridot-color-hex-6f8e62)] focus:border-[var(--peridot-color-hex-466d47)] focus:outline-none focus:ring-2 focus:ring-[var(--peridot-color-hex-8ba37a-a30)]';


const STRUCTURED_FIELD_OPTIONS = Object.freeze([
  { id: 'any', label: 'Any record text', placeholder: 'Search across all visible record fields' },
  { id: 'person', label: 'Person / entity', placeholder: 'Person or entity name' },
  { id: 'place', label: 'Place', placeholder: 'Place name' },
  { id: 'routePlace', label: 'Route place', placeholder: 'Rome, Florence, or Rome → Florence' },
  { id: 'routePeople', label: 'Route people', placeholder: 'Sender, recipient, or Sender → Recipient' },
  { id: 'date', label: 'Date', placeholder: 'Year or date label' },
  { id: 'evidence', label: 'Evidence / custom field', placeholder: 'Topic, language, note, citation, custom value' },
  { id: 'evidenceFieldPresent', label: 'Evidence field present', placeholder: 'Evidence/custom field label' },
  { id: 'capability', label: 'Capability', placeholder: 'Choose a capability' },
]);

const STRUCTURED_OPERATOR_OPTIONS = Object.freeze([
  { id: 'must', label: 'AND', shortLabel: 'AND', description: 'Keep records that match the previous criteria and this rule.' },
  { id: 'should', label: 'OR', shortLabel: 'OR', description: 'Keep records that match the previous criteria or this rule.' },
  { id: 'exclude', label: 'EXCLUDING', shortLabel: 'EXCLUDING', description: 'Remove records that match this rule.' },
]);

const STRUCTURED_MATCH_MODE_OPTIONS = Object.freeze([
  { id: 'contains', label: 'contains', needsValue: true },
  { id: 'exact', label: 'exactly matches', needsValue: true },
  { id: 'startsWith', label: 'starts with', needsValue: true },
  { id: 'isEmpty', label: 'is empty', needsValue: false },
  { id: 'isNotEmpty', label: 'is not empty', needsValue: false },
]);

const MAX_STRUCTURED_CRITERIA = 5;

const BROWSE_INDEX_LIMIT = 120;
const BROWSE_SOURCE_PERSON_FIELDS = ['sourcePerson', 'Source', 'Source_Person', 'Source_Entity', 'sender', 'Sender'];
const BROWSE_TARGET_PERSON_FIELDS = ['targetPerson', 'Target', 'Target_Person', 'Target_Entity', 'recipient', 'Recipient'];
const BROWSE_SOURCE_PLACE_FIELDS = ['sourcePlaceLabel', 'sourcePlace', 'sourceLoc', 'Source_Loc', 'Source_Place', 'sourceLocation'];
const BROWSE_TARGET_PLACE_FIELDS = ['targetPlaceLabel', 'targetPlace', 'targetLoc', 'Target_Inferred_Loc', 'Target_Loc', 'Target_Place', 'targetLocation'];
const BROWSE_CORE_FIELDS = new Set([
  'id', 'recordId', 'parsedDate', 'date', 'Date', 'Date*', 'displayDate', 'dateDisplay', 'dateLabel',
  'sourcePerson', 'Source', 'Source_Person', 'Source_Entity', 'sender', 'Sender',
  'targetPerson', 'Target', 'Target_Person', 'Target_Entity', 'recipient', 'Recipient',
  'sourcePlaceLabel', 'sourcePlace', 'sourceLoc', 'Source_Loc', 'Source_Place', 'sourceLocation',
  'targetPlaceLabel', 'targetPlace', 'targetLoc', 'Target_Inferred_Loc', 'Target_Loc', 'Target_Place', 'targetLocation',
  'sourceLat', 'sourceLon', 'targetLat', 'targetLon', 'lat', 'lon', 'latitude', 'longitude',
  'sourcePlaceId', 'targetPlaceId', 'mappable', 'personKey', 'recordTitle', 'title', 'label',
]);
const BROWSE_FIELD_LABELS = {
  archivalCollection: 'Archival collection',
  archivalPage: 'Archival page',
  pdfPage: 'PDF page',
  relationship: 'Relationship',
  relationshipType: 'Relationship',
  cipher: 'Cipher',
  topic: 'Topic',
  language: 'Language',
  transcription: 'Transcription',
  translation: 'Translation',
  notes: 'Notes',
  citation: 'Citation',
  sourceTitle: 'Source title',
  targetTitle: 'Target title',
};

function browseText(value) {
  return String(value ?? '').trim();
}

function firstBrowseText(row, fields) {
  for (const field of fields) {
    const value = browseText(row?.[field]);
    if (value) return value;
  }
  return '';
}

function browseFieldLabel(key) {
  return BROWSE_FIELD_LABELS[key] || String(key || '').replace(/_/g, ' ');
}

function addBrowseCount(map, value, detail = {}) {
  const label = browseText(value);
  if (!label) return;
  const existing = map.get(label) || {
    value: label,
    label,
    count: 0,
    sourceCount: 0,
    targetCount: 0,
    examples: [],
  };
  existing.count += 1;
  if (detail.source) existing.sourceCount += 1;
  if (detail.target) existing.targetCount += 1;
  if (detail.example) {
    const example = browseText(detail.example);
    if (example && !existing.examples.includes(example) && existing.examples.length < 3) {
      existing.examples.push(example);
    }
  }
  map.set(label, existing);
}

function sortBrowseItems(map, limit = BROWSE_INDEX_LIMIT) {
  return Array.from(map.values())
    .sort((a, b) => a.label.localeCompare(b.label))
    .slice(0, limit);
}

function buildBrowseIndexGroups(rows = []) {
  const people = new Map();
  const places = new Map();
  const routes = new Map();
  const evidenceFields = new Map();

  (Array.isArray(rows) ? rows : []).forEach((row) => {
    const sourcePerson = firstBrowseText(row, BROWSE_SOURCE_PERSON_FIELDS);
    const targetPerson = firstBrowseText(row, BROWSE_TARGET_PERSON_FIELDS);
    const sourcePlace = firstBrowseText(row, BROWSE_SOURCE_PLACE_FIELDS);
    const targetPlace = firstBrowseText(row, BROWSE_TARGET_PLACE_FIELDS);

    addBrowseCount(people, sourcePerson, { source: true });
    addBrowseCount(people, targetPerson, { target: true });
    addBrowseCount(places, sourcePlace, { source: true });
    addBrowseCount(places, targetPlace, { target: true });

    if (sourcePlace || targetPlace) {
      const routeLabel = `${sourcePlace || 'Unknown source'} → ${targetPlace || 'Unknown target'}`;
      addBrowseCount(routes, routeLabel, { example: routeLabel });
    }

    Object.entries(row || {}).forEach(([key, value]) => {
      if (BROWSE_CORE_FIELDS.has(key)) return;
      const text = browseText(value);
      if (!text) return;
      addBrowseCount(evidenceFields, browseFieldLabel(key), { example: text });
    });
  });

  return [
    {
      id: 'browse-people',
      type: 'person',
      label: 'People / Entities',
      description: 'Dataset-wide index of source and target entities.',
      items: sortBrowseItems(people),
    },
    {
      id: 'browse-places',
      type: 'place',
      label: 'Places',
      description: 'Dataset-wide index of source, target, and point-location places.',
      items: sortBrowseItems(places),
    },
    {
      id: 'browse-routes',
      type: 'routePlace',
      label: 'Routes',
      description: 'Dataset-wide source → target place routes.',
      items: sortBrowseItems(routes),
    },
    {
      id: 'browse-evidence',
      type: 'evidenceField',
      label: 'Evidence Fields',
      description: 'Custom and evidence/analysis fields with populated values.',
      items: sortBrowseItems(evidenceFields),
    },
  ].filter((group) => group.items.length > 0);
}

function filterBrowseGroups(groups, query) {
  const cleanQuery = browseText(query).toLowerCase();
  if (!cleanQuery) return groups;
  return groups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => (
        item.label.toLowerCase().includes(cleanQuery)
        || item.examples.some((example) => example.toLowerCase().includes(cleanQuery))
      )),
    }))
    .filter((group) => group.items.length > 0);
}

function createStructuredCriterion() {
  return {
    id: `criterion-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    operator: 'must',
    field: 'any',
    mode: 'contains',
    value: '',
  };
}

function normalizeDraftStructuredCriteria(criteria = []) {
  return (Array.isArray(criteria) ? criteria : [])
    .map((criterion) => ({
      id: criterion.id || `criterion-${Math.random().toString(16).slice(2)}`,
      operator: STRUCTURED_OPERATOR_OPTIONS.some((option) => option.id === criterion.operator) ? criterion.operator : 'must',
      field: criterion.field || 'any',
      mode: criterion.mode || 'contains',
      value: String(criterion.value ?? '').trim(),
    }))
    .filter((criterion) => {
      const mode = STRUCTURED_MATCH_MODE_OPTIONS.find((option) => option.id === criterion.mode);
      return mode?.needsValue === false || criterion.value;
    })
    .slice(0, MAX_STRUCTURED_CRITERIA);
}

function StructuredCriterionRow({
  criterion,
  index,
  onChange,
  onRemove,
  onKeyDown,
  suggestions = [],
}) {
  const selectedOperator = STRUCTURED_OPERATOR_OPTIONS.find((option) => option.id === criterion.operator) || STRUCTURED_OPERATOR_OPTIONS[0];
  const selectedField = STRUCTURED_FIELD_OPTIONS.find((option) => option.id === criterion.field) || STRUCTURED_FIELD_OPTIONS[0];
  const selectedMode = STRUCTURED_MATCH_MODE_OPTIONS.find((option) => option.id === criterion.mode) || STRUCTURED_MATCH_MODE_OPTIONS[0];
  const needsValue = selectedMode.needsValue !== false;
  const capabilityValue = CAPABILITY_FILTER_OPTIONS.some((option) => option.id === criterion.value) ? criterion.value : '';
  const isFirstCriterion = index === 0;

  return (
    <div className="grid gap-2 rounded-xl border border-[var(--peridot-color-hex-aec19d)] bg-[var(--peridot-color-hex-edf5e5)] p-2.5 shadow-sm shadow-black/5 lg:grid-cols-[0.9fr_1.15fr_0.95fr_1.35fr_auto] lg:items-end">
      <div>
        <label className={FIELD_LABEL_CLASS} htmlFor={`structured-operator-${criterion.id}`}>Logic {index + 1}</label>
        {isFirstCriterion ? (
          <div className="mt-1.5 rounded-xl border border-[var(--peridot-color-hex-98ad8c)] bg-[var(--peridot-color-hex-d8e6cf)] px-3 py-2 text-sm font-black uppercase tracking-[0.12em] text-[var(--peridot-color-hex-274633)] shadow-inner shadow-white/25" title="The first rule starts the structured search. Add more rules below to search AND, OR, or EXCLUDING another value.">
            Start with
          </div>
        ) : (
          <select
            id={`structured-operator-${criterion.id}`}
            value={selectedOperator.id}
            onChange={(event) => onChange({ ...criterion, operator: event.target.value })}
            title={selectedOperator.description}
            className={INPUT_CLASS}
          >
            {STRUCTURED_OPERATOR_OPTIONS.map((option) => (
              <option key={option.id} value={option.id}>{option.label}</option>
            ))}
          </select>
        )}
      </div>
      <div>
        <label className={FIELD_LABEL_CLASS} htmlFor={`structured-field-${criterion.id}`}>Field</label>
        <select
          id={`structured-field-${criterion.id}`}
          value={criterion.field}
          onChange={(event) => {
            const nextField = event.target.value;
            onChange({
              ...criterion,
              operator: isFirstCriterion ? 'must' : criterion.operator,
              field: nextField,
              value: nextField === 'capability' ? '' : criterion.value,
            });
          }}
          className={INPUT_CLASS}
        >
          {STRUCTURED_FIELD_OPTIONS.map((option) => (
            <option key={option.id} value={option.id}>{option.label}</option>
          ))}
        </select>
      </div>
      <div>
        <label className={FIELD_LABEL_CLASS} htmlFor={`structured-mode-${criterion.id}`}>Match</label>
        <select
          id={`structured-mode-${criterion.id}`}
          value={criterion.mode}
          onChange={(event) => onChange({ ...criterion, operator: isFirstCriterion ? 'must' : criterion.operator, mode: event.target.value })}
          className={INPUT_CLASS}
        >
          {STRUCTURED_MATCH_MODE_OPTIONS.map((option) => (
            <option key={option.id} value={option.id}>{option.label}</option>
          ))}
        </select>
      </div>
      <div>
        <label className={FIELD_LABEL_CLASS} htmlFor={`structured-value-${criterion.id}`}>Value</label>
        {criterion.field === 'capability' ? (
          <select
            id={`structured-value-${criterion.id}`}
            value={capabilityValue}
            disabled={!needsValue}
            onChange={(event) => onChange({ ...criterion, operator: isFirstCriterion ? 'must' : criterion.operator, value: event.target.value })}
            onKeyDown={onKeyDown}
            className={INPUT_CLASS + (!needsValue ? ' opacity-60' : '')}
          >
            <option value="">Choose capability</option>
            {CAPABILITY_FILTER_OPTIONS.map((option) => (
              <option key={option.id} value={option.id}>{option.label}</option>
            ))}
          </select>
        ) : (
          <AutocompleteTextInput
            id={`structured-value-${criterion.id}`}
            label="Value"
            value={criterion.value}
            disabled={!needsValue}
            onChange={(nextValue) => onChange({ ...criterion, operator: isFirstCriterion ? 'must' : criterion.operator, value: nextValue })}
            onKeyDown={onKeyDown}
            placeholder={needsValue ? selectedField.placeholder : 'No value needed'}
            suggestions={needsValue ? suggestions : []}
            inputClassName={INPUT_CLASS + (!needsValue ? ' opacity-60' : '')}
            hideLabel
          />
        )}
      </div>
      <button type="button" onClick={() => onRemove(criterion.id)} className={SECONDARY_BUTTON_CLASS + ' justify-self-start px-3 py-2 lg:justify-self-end'}>
        Remove
      </button>
    </div>
  );
}

function AutocompleteTextInput({
  id,
  label,
  value,
  onChange,
  onKeyDown,
  placeholder,
  suggestions = [],
  helperText,
  disabled = false,
  inputClassName = INPUT_CLASS,
  hideLabel = false,
}) {
  const [isFocused, setIsFocused] = useState(false);
  const query = String(value ?? '').trim().toLowerCase();
  const matchingSuggestions = query.length >= 2
    ? suggestions
        .filter((suggestion) => String(suggestion ?? '').toLowerCase().includes(query))
        .slice(0, 20)
    : [];
  const showSuggestions = !disabled && isFocused && matchingSuggestions.length > 0;

  const chooseSuggestion = (suggestion) => {
    onChange(suggestion);
    setIsFocused(false);
  };

  return (
    <div className="relative">
      {hideLabel ? null : <label htmlFor={id} className={FIELD_LABEL_CLASS}>{label}</label>}
      <input
        id={id}
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={onKeyDown}
        onFocus={() => setIsFocused(true)}
        onBlur={() => {
          window.setTimeout(() => setIsFocused(false), 120);
        }}
        placeholder={placeholder}
        autoComplete="off"
        className={inputClassName}
      />
      {showSuggestions ? (
        <div className="absolute left-0 right-0 z-30 mt-2 max-h-56 overflow-y-auto rounded-2xl border border-[var(--peridot-color-hex-c9c1aa)] bg-[var(--peridot-color-hex-fffdf6)] p-1 shadow-2xl shadow-black/20">
          <div className="px-3 py-1.5 text-[0.62rem] font-black uppercase tracking-[0.18em] text-[var(--peridot-color-hex-667960)]">
            Suggestions
          </div>
          {matchingSuggestions.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => chooseSuggestion(suggestion)}
              className="block w-full rounded-xl px-3 py-2 text-left text-sm leading-5 text-[var(--peridot-color-hex-24372b)] transition duration-150 hover:bg-[var(--peridot-color-hex-dfead2)] hover:text-[var(--peridot-color-hex-163623)] active:translate-y-[1px] active:bg-[var(--peridot-color-hex-c9d9bb)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--peridot-color-hex-78976a-a50)]"
            >
              {suggestion}
            </button>
          ))}
        </div>
      ) : null}
      {helperText ? (
        <p className="mt-2 text-xs leading-5 text-[var(--peridot-color-hex-637064)]">{helperText}</p>
      ) : null}
    </div>
  );
}

function AppliedScopeCard({ label, value }) {
  return (
    <div className="rounded-xl border border-[var(--peridot-color-hex-9fb28f)] bg-[var(--peridot-color-hex-dce9d2)] px-3 py-2 shadow-sm shadow-black/5">
      <div className="text-[0.58rem] font-black uppercase tracking-[0.16em] text-[var(--peridot-color-hex-4b6a4b)]">
        {label}
      </div>
      <div className="mt-0.5 truncate text-sm font-black text-[var(--peridot-color-hex-203729)]">{value}</div>
    </div>
  );
}

function SectionHeader({ eyebrow, title, children }) {
  return (
    <div>
      {eyebrow ? (
        <div className="text-[0.6rem] font-black uppercase tracking-[0.18em] text-[var(--peridot-color-hex-8b6c2f)]">
          {eyebrow}
        </div>
      ) : null}
      <h2 className="mt-0.5 text-2xl font-black tracking-tight text-[var(--peridot-color-hex-203729)]">{title}</h2>
      {children ? <p className={'mt-1 ' + MUTED_TEXT_CLASS}>{children}</p> : null}
    </div>
  );
}

function SearchTabButton({ id, label, summary, active, onClick }) {
  return (
    <button
      type="button"
      onClick={() => onClick(id)}
      className={`rounded-[1rem] border px-4 py-2.5 text-left shadow-sm transition duration-150 active:translate-y-[1px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--peridot-color-hex-78976a-a55)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--peridot-color-hex-cfdfc5)] ${
        active
          ? 'border-[var(--peridot-color-hex-6f8e62)] bg-[var(--peridot-color-hex-86a96f)] text-[var(--peridot-color-hex-fffaf0)] shadow-[0_10px_20px_var(--peridot-color-rgba-rgba-55-79-52-0-20)]'
          : 'border-[var(--peridot-color-hex-9fb28f)] bg-[var(--peridot-color-hex-c6d9bb)] text-[var(--peridot-color-hex-274633)] hover:border-[var(--peridot-color-hex-74897a)] hover:bg-[var(--peridot-color-hex-b7cda9)] hover:shadow-[0_7px_16px_var(--peridot-color-rgba-rgba-39-50-36-0-10)] active:bg-[var(--peridot-color-hex-a8c097)]'
      }`}
    >
      <span className={`block text-[0.58rem] font-black uppercase tracking-[0.17em] ${active ? 'text-[var(--peridot-color-hex-fff5d9-a82)]' : 'text-[var(--peridot-color-hex-4b6a4b)]'}`}>
        {id === 'build' ? 'Step 1' : id === 'browse' ? 'Step 2' : id === 'results' ? 'Step 3' : 'Step 4'}
      </span>
      <span className="mt-0.5 block text-base font-black">{label}</span>
      <span className={`mt-0.5 block text-xs leading-4 ${active ? 'text-[var(--peridot-color-hex-fffaf0-a82)]' : 'text-[var(--peridot-color-hex-4f654d)]'}`}>
        {summary}
      </span>
    </button>
  );
}

function CapabilityFilterToggle({ option, checked, count, onToggle }) {
  return (
    <button
      type="button"
      onClick={() => onToggle(option.id)}
      title={option.description}
      className={`rounded-xl border px-3 py-2 text-left transition duration-150 active:translate-y-[1px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--peridot-color-hex-78976a-a55)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--peridot-color-hex-edf5e5)] ${
        checked
          ? 'border-[var(--peridot-color-hex-4f6d50)] bg-[var(--peridot-color-hex-a9c498)] text-[var(--peridot-color-hex-1f3326)] shadow-[0_7px_14px_var(--peridot-color-rgba-rgba-55-79-52-0-14)]'
          : 'border-[var(--peridot-color-hex-9fb28f)] bg-[var(--peridot-color-hex-dce9d2)] text-[var(--peridot-color-hex-35513a)] hover:border-[var(--peridot-color-hex-74897a)] hover:bg-[var(--peridot-color-hex-c6d9bb)] hover:text-[var(--peridot-color-hex-203729)]'
      }`}
    >
      <span className="flex items-center justify-between gap-2">
        <span className="text-[0.72rem] font-black uppercase leading-4 tracking-[0.12em]">{option.label}</span>
        {Number.isFinite(count) ? (
          <span className="rounded-full border border-[var(--peridot-color-hex-9db48e)] bg-[var(--peridot-color-hex-f8fbf4-a90)] px-2 py-0.5 text-[0.62rem] font-black text-[var(--peridot-color-hex-38553d)]">
            {count}
          </span>
        ) : null}
      </span>
    </button>
  );
}

function FacetGroup({ group, activeCapabilityFilters, onChooseFacet }) {
  return (
    <section className="rounded-[1rem] border border-[var(--peridot-color-hex-617665)] bg-[var(--peridot-color-hex-74897a)] p-3 shadow-[0_10px_24px_var(--peridot-color-rgba-rgba-34-51-38-0-16)]">
      <h3 className="text-[0.62rem] font-black uppercase tracking-[0.15em] text-[var(--peridot-color-hex-f4f8ef)]">
        {group.label}
      </h3>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {group.items.map((item) => {
          const isCapability = group.type === 'capability';
          const isActive = isCapability && activeCapabilityFilters.includes(item.value);
          return (
            <button
              key={`${group.id}-${item.value}`}
              type="button"
              onClick={() => onChooseFacet(group, item)}
              className={`${CHIP_BUTTON_CLASS} ${
                isActive
                  ? 'border-[var(--peridot-color-hex-4f6d50)] bg-[var(--peridot-color-hex-a9c498)] text-[var(--peridot-color-hex-1f3326)] hover:bg-[var(--peridot-color-hex-a9c997)] active:bg-[var(--peridot-color-hex-99bd86)]'
                  : 'border-[var(--peridot-color-hex-9db48e)] bg-[var(--peridot-color-hex-d7e6cc)] text-[var(--peridot-color-hex-274633)] hover:border-[var(--peridot-color-hex-466d47)] hover:bg-[var(--peridot-color-hex-c9ddba)] active:bg-[var(--peridot-color-hex-a8c097)]'
              }`}
              title={isCapability ? `Toggle ${item.label}` : `Set draft filter to ${item.value}`}
            >
              <span>{item.label || item.value}</span>
              <span className="ml-1.5 rounded-full bg-[var(--peridot-color-hex-f8fbf4-a80)] px-1.5 py-0.5 text-[0.6rem] text-[var(--peridot-color-hex-38553d)]">
                {item.count}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}


function BrowseIndexGroup({ group, onChooseBrowseItem }) {
  return (
    <section className="rounded-[1rem] border border-[var(--peridot-color-hex-617665)] bg-[var(--peridot-color-hex-74897a)] p-3 shadow-[0_12px_28px_var(--peridot-color-rgba-rgba-34-51-38-0-18)]">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 className="text-[0.7rem] font-black uppercase tracking-[0.15em] text-[var(--peridot-color-hex-f4f8ef)]">
            {group.label}
          </h3>
          <p className="mt-1 text-xs leading-5 text-[var(--peridot-color-hex-e8f1e2)]">{group.description}</p>
        </div>
        <span className="rounded-full border border-[var(--peridot-color-hex-d9e6ce-a70)] bg-[var(--peridot-color-hex-dfead2)] px-2 py-0.5 text-[0.62rem] font-black text-[var(--peridot-color-hex-244c35)]">
          {group.items.length} shown
        </span>
      </div>
      <div className="mt-3 grid max-h-[24rem] gap-2 overflow-y-auto pr-1 sm:grid-cols-2 xl:grid-cols-3">
        {group.items.map((item) => (
          <article key={`${group.id}-${item.value}`} className="rounded-xl border border-[var(--peridot-color-hex-d6e4cb)] bg-[var(--peridot-color-hex-eef6e8)] p-2.5 shadow-sm shadow-[var(--peridot-color-hex-203729-a10)] transition duration-150 hover:border-[var(--peridot-color-hex-f4f8ef)] hover:bg-[var(--peridot-color-hex-f6fbf1)]">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-black text-[var(--peridot-color-hex-203729)]" title={item.label}>{item.label}</div>
                <div className="mt-1 flex flex-wrap gap-1.5 text-[0.62rem] font-black uppercase tracking-[0.08em] text-[var(--peridot-color-hex-38553d)]">
                  <span className="rounded-full bg-[var(--peridot-color-hex-d7e6cc)] px-2 py-0.5">{item.count} records</span>
                  {item.sourceCount ? <span className="rounded-full bg-[var(--peridot-color-hex-e2eed8)] px-2 py-0.5">source {item.sourceCount}</span> : null}
                  {item.targetCount ? <span className="rounded-full bg-[var(--peridot-color-hex-e2eed8)] px-2 py-0.5">target {item.targetCount}</span> : null}
                </div>
              </div>
              <button
                type="button"
                onClick={() => onChooseBrowseItem(group, item)}
                className={DARK_BUTTON_CLASS + ' px-3 py-1.5'}
              >
                Search
              </button>
            </div>
            {item.examples?.length ? (
              <div className="mt-2 text-[0.68rem] leading-4 text-[var(--peridot-color-hex-5a6659)]">
                <span className="font-black uppercase tracking-[0.08em] text-[var(--peridot-color-hex-38553d)]">Examples: </span>
                {item.examples.join(' · ')}
              </div>
            ) : null}
          </article>
        ))}
      </div>
    </section>
  );
}

function SearchResultCard({ result, onInspectSearchResult }) {
  const visibleMatches = result.matchedFields.slice(0, 3);
  const hiddenMatchCount = Math.max(0, result.matchedFields.length - visibleMatches.length);
  const visibleBadges = result.capabilityBadges.slice(0, 4);
  const hiddenBadgeCount = Math.max(0, result.capabilityBadges.length - visibleBadges.length);

  return (
    <article className="rounded-[1rem] border border-[var(--peridot-color-hex-9fb28f)] bg-[var(--peridot-color-hex-d3e3c8)] p-3 text-[var(--peridot-color-hex-203729)] shadow-[0_8px_18px_var(--peridot-color-rgba-rgba-39-50-36-0-08)] transition duration-150 hover:-translate-y-0.5 hover:border-[var(--peridot-color-hex-74897a)] hover:bg-[var(--peridot-color-hex-deebd5)] hover:shadow-[0_12px_26px_var(--peridot-color-rgba-rgba-39-50-36-0-13)]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-[var(--peridot-color-hex-9db48e)] bg-[var(--peridot-color-hex-d7e6cc)] px-2 py-0.5 text-[0.56rem] font-black uppercase tracking-[0.14em] text-[var(--peridot-color-hex-38553d)]">
              Result
            </span>
            <span className="text-xs font-black text-[var(--peridot-color-hex-7a622f)]">{result.displayDate}</span>
          </div>
          <h3 className="mt-1 truncate text-sm font-black text-[var(--peridot-color-hex-203729)]">{result.title}</h3>
        </div>
        <button
          type="button"
          onClick={() => onInspectSearchResult?.(result)}
          className={DARK_BUTTON_CLASS + ' shrink-0 px-3 py-1.5'}
        >
          Inspect
        </button>
      </div>

      <dl className="mt-2 grid gap-1.5 text-xs sm:grid-cols-2">
        <div className="min-w-0 rounded-lg bg-[var(--peridot-color-hex-edf5e5)] px-2.5 py-1.5">
          <dt className="inline font-black uppercase tracking-[0.1em] text-[var(--peridot-color-hex-38553d)]">Entities: </dt>
          <dd className="inline font-semibold text-[var(--peridot-color-hex-203729)]">{result.peopleRoute}</dd>
        </div>
        <div className="min-w-0 rounded-lg bg-[var(--peridot-color-hex-edf5e5)] px-2.5 py-1.5">
          <dt className="inline font-black uppercase tracking-[0.1em] text-[var(--peridot-color-hex-38553d)]">Places: </dt>
          <dd className="inline font-semibold text-[var(--peridot-color-hex-203729)]">{result.placeRoute}</dd>
        </div>
      </dl>

      <div className="mt-2 flex flex-wrap gap-1.5">
        {visibleMatches.length ? (
          visibleMatches.map((match) => (
            <span
              key={`${match.label}-${match.value}`}
              title={`${match.label}: ${match.value}`}
              className="max-w-full truncate rounded-full border border-[var(--peridot-color-hex-b8c8aa)] bg-[var(--peridot-color-hex-e2eed8)] px-2 py-0.5 text-[0.68rem] font-semibold text-[var(--peridot-color-hex-344a38)]"
            >
              <span className="font-black">{match.label}:</span> {match.value}
            </span>
          ))
        ) : (
          <span className="rounded-full border border-[var(--peridot-color-hex-b8c8aa)] bg-[var(--peridot-color-hex-e2eed8)] px-2 py-0.5 text-[0.68rem] font-semibold text-[var(--peridot-color-hex-465d49)]">
            In current applied scope
          </span>
        )}
        {hiddenMatchCount > 0 ? (
          <span className="rounded-full border border-[var(--peridot-color-hex-b8c8aa)] bg-[var(--peridot-color-hex-d7e6cc)] px-2 py-0.5 text-[0.68rem] font-black text-[var(--peridot-color-hex-38553d)]">
            +{hiddenMatchCount} matches
          </span>
        ) : null}
      </div>

      {visibleBadges.length ? (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {visibleBadges.map((badge) => (
            <span
              key={badge}
              className="rounded-full border border-[var(--peridot-color-hex-9db48e)] bg-[var(--peridot-color-hex-d7e6cc)] px-2 py-0.5 text-[0.58rem] font-black uppercase tracking-[0.08em] text-[var(--peridot-color-hex-274633)]"
            >
              {badge}
            </span>
          ))}
          {hiddenBadgeCount > 0 ? (
            <span className="rounded-full border border-[var(--peridot-color-hex-9db48e)] bg-[var(--peridot-color-hex-eaf3e1)] px-2 py-0.5 text-[0.58rem] font-black uppercase tracking-[0.08em] text-[var(--peridot-color-hex-274633)]">
              +{hiddenBadgeCount}
            </span>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}

export function PeridotSearchWorkspace({
  search,
  setSearch,
  personFilter,
  setPersonFilter,
  placeFilter,
  setPlaceFilter,
  routePlaceFilter,
  setRoutePlaceFilter,
  routePeopleFilter,
  setRoutePeopleFilter,
  personSuggestions = [],
  placeSuggestions = [],
  routePlaceSuggestions = [],
  routePeopleSuggestions = [],
  capabilityFilters = [],
  setCapabilityFilters,
  structuredCriteria = [],
  setStructuredCriteria,
  currentMinCountLabel,
  currentRangeLabel,
  graph,
  rowDiagnostics,
  searchRows = [],
  browseRows = searchRows,
  onInspectSearchResult,
  viewMode,
  minCount,
  setMinCount,
  timelineMonths,
  rangeStart,
  setRangeStart,
  rangeEnd,
  setRangeEnd,
  setTimelineMode,
  setIsPlaying,
  setPlaybackIndex,
  onOpenVisualizations,
}) {
  const getAppliedStartYear = () => String(timelineMonths[rangeStart] || '').slice(0, 4);
  const getAppliedEndYear = () => String(timelineMonths[rangeEnd] || '').slice(0, 4);
  const getDefaultStartYear = () => String(timelineMonths[0] || '').slice(0, 4);
  const getDefaultEndYear = () => String(timelineMonths[Math.max(timelineMonths.length - 1, 0)] || '').slice(0, 4);

  const [activeTab, setActiveTab] = useState('build');
  const [draftSearch, setDraftSearch] = useState(search ?? '');
  const [draftPersonFilter, setDraftPersonFilter] = useState(personFilter ?? '');
  const [draftPlaceFilter, setDraftPlaceFilter] = useState(placeFilter ?? '');
  const [draftRoutePlaceFilter, setDraftRoutePlaceFilter] = useState(routePlaceFilter ?? '');
  const [draftRoutePeopleFilter, setDraftRoutePeopleFilter] = useState(routePeopleFilter ?? '');
  const [draftCapabilityFilters, setDraftCapabilityFilters] = useState(Array.isArray(capabilityFilters) ? capabilityFilters : []);
  const [draftStructuredCriteria, setDraftStructuredCriteria] = useState(
    Array.isArray(structuredCriteria) ? structuredCriteria : [],
  );
  const [draftMinCount, setDraftMinCount] = useState(String(minCount ?? 1));
  const [draftStartYear, setDraftStartYear] = useState(getAppliedStartYear());
  const [draftEndYear, setDraftEndYear] = useState(getAppliedEndYear());
  const [filterStatusMessage, setFilterStatusMessage] = useState('');
  const [browseQuery, setBrowseQuery] = useState('');

  useEffect(() => {
    setDraftSearch(search ?? '');
    setDraftPersonFilter(personFilter ?? '');
    setDraftPlaceFilter(placeFilter ?? '');
    setDraftRoutePlaceFilter(routePlaceFilter ?? '');
    setDraftRoutePeopleFilter(routePeopleFilter ?? '');
    setDraftCapabilityFilters(Array.isArray(capabilityFilters) ? capabilityFilters : []);
    setDraftStructuredCriteria(Array.isArray(structuredCriteria) ? structuredCriteria : []);
    setDraftMinCount(String(minCount ?? 1));
    setDraftStartYear(getAppliedStartYear());
    setDraftEndYear(getAppliedEndYear());
  }, [
    search,
    personFilter,
    placeFilter,
    routePlaceFilter,
    routePeopleFilter,
    capabilityFilters,
    structuredCriteria,
    minCount,
    rangeStart,
    rangeEnd,
    timelineMonths.length,
    timelineMonths[rangeStart],
    timelineMonths[rangeEnd],
  ]);

  useEffect(() => {
    if (!filterStatusMessage) return undefined;
    const timeoutId = window.setTimeout(() => {
      setFilterStatusMessage('');
    }, 2200);
    return () => window.clearTimeout(timeoutId);
  }, [filterStatusMessage]);

  const timelineYearSuggestions = useMemo(() => (
    Array.from(new Set(timelineMonths.map((month) => String(month || '').slice(0, 4)).filter(Boolean)))
      .sort((a, b) => Number(a) - Number(b))
  ), [timelineMonths]);

  const appliedCapabilityFilters = Array.isArray(capabilityFilters) ? capabilityFilters : [];
  const searchResultCards = useMemo(() => buildPeridotSearchResults(
    searchRows,
    {
      search,
      personFilter,
      placeFilter,
      routePlaceFilter,
      routePeopleFilter,
      capabilityFilters: appliedCapabilityFilters,
      structuredCriteria,
    },
    { limit: 50 },
  ), [searchRows, search, personFilter, placeFilter, routePlaceFilter, routePeopleFilter, appliedCapabilityFilters, structuredCriteria]);

  const searchFacetGroups = useMemo(() => buildPeridotSearchFacets(searchRows, { limit: 8 }), [searchRows]);
  const browseIndexGroups = useMemo(() => buildBrowseIndexGroups(browseRows), [browseRows]);
  const filteredBrowseIndexGroups = useMemo(() => filterBrowseGroups(browseIndexGroups, browseQuery), [browseIndexGroups, browseQuery]);

  const capabilityFacetCounts = useMemo(() => {
    const capabilityGroup = searchFacetGroups.find((group) => group.id === 'capabilities');
    return new Map((capabilityGroup?.items || []).map((item) => [item.value, item.count]));
  }, [searchFacetGroups]);

  const evidenceFieldSuggestions = useMemo(() => {
    const evidenceGroup = browseIndexGroups.find((group) => group.id === 'browse-evidence');
    return (evidenceGroup?.items || []).map((item) => item.value || item.label).filter(Boolean);
  }, [browseIndexGroups]);

  const getStructuredCriterionSuggestions = (fieldId) => {
    if (fieldId === 'person') return personSuggestions;
    if (fieldId === 'place') return placeSuggestions;
    if (fieldId === 'routePlace') return routePlaceSuggestions;
    if (fieldId === 'routePeople') return routePeopleSuggestions;
    if (fieldId === 'date') return timelineYearSuggestions;
    if (fieldId === 'capability') return CAPABILITY_FILTER_OPTIONS.map((option) => option.label);
    if (fieldId === 'evidence' || fieldId === 'evidenceFieldPresent') return evidenceFieldSuggestions;
    return [];
  };

  const activeCapabilityLabel = appliedCapabilityFilters.length
    ? appliedCapabilityFilters.map(getCapabilityFilterLabel).join(', ')
    : 'None';
  const draftCapabilityLabel = draftCapabilityFilters.length
    ? draftCapabilityFilters.map(getCapabilityFilterLabel).join(', ')
    : 'None selected';
  const appliedStructuredCriteria = normalizeDraftStructuredCriteria(structuredCriteria);
  const normalizedDraftStructuredCriteria = normalizeDraftStructuredCriteria(draftStructuredCriteria);
  const summarizeStructuredOperators = (criteria) => {
    const counts = { must: 0, should: 0, exclude: 0 };
    criteria.forEach((criterion) => {
      const operator = STRUCTURED_OPERATOR_OPTIONS.some((option) => option.id === criterion.operator) ? criterion.operator : 'must';
      counts[operator] += 1;
    });
    const parts = [];
    if (counts.must) parts.push(`${counts.must} must`);
    if (counts.should) parts.push(`${counts.should} OR`);
    if (counts.exclude) parts.push(`${counts.exclude} exclude`);
    return parts.join(' · ');
  };
  const activeStructuredLabel = appliedStructuredCriteria.length ? summarizeStructuredOperators(appliedStructuredCriteria) : 'None';
  const draftStructuredLabel = normalizedDraftStructuredCriteria.length ? summarizeStructuredOperators(normalizedDraftStructuredCriteria) : 'None';
  const hiddenSearchResultCount = Math.max(0, (searchRows?.length || 0) - searchResultCards.length);
  const capabilityRows = useMemo(() => {
    const loadedRecordCount = Array.isArray(browseRows) ? browseRows.length : 0;
    const activeRecordCount = Array.isArray(searchRows) ? searchRows.length : 0;
    const visibleNodeCount = graph?.nodes?.length ?? 0;
    const hasTextValue = (value) => String(value ?? '').trim() !== '';
    const normalizePairValue = (value) => String(value ?? '').trim().toLowerCase();
    const firstTextValue = (row, fields) => fields
      .map((field) => row?.[field])
      .find(hasTextValue) || '';

    const hasCapabilityFlag = (row, flags) => {
      const capabilityBlock = row?.peridotCapabilities || row?.capabilities || row?.capabilityFlags || null;
      if (!capabilityBlock || typeof capabilityBlock !== 'object') return null;

      const presentFlags = flags.filter((flag) => Object.prototype.hasOwnProperty.call(capabilityBlock, flag));
      if (!presentFlags.length) return null;
      return presentFlags.some((flag) => Boolean(capabilityBlock[flag]));
    };

    const hasMeaningfulSourceTargetPair = (row, sourceFields, targetFields) => {
      const sourceValue = firstTextValue(row, sourceFields);
      const targetValue = firstTextValue(row, targetFields);
      if (!sourceValue || !targetValue) return false;

      // Point/site imports may use compatibility rows that put the same mapped
      // point into both source-like and target-like display fields so the legacy
      // map stage can render them. Those compatibility values should not make
      // the Capabilities tab report route or relationship availability.
      return normalizePairValue(sourceValue) !== normalizePairValue(targetValue);
    };

    const hasRouteOrRelationshipRecord = (row) => {
      const auditedCapability = hasCapabilityFlag(row, [
        'networkReady',
        'peopleNetworkReady',
        'placeNetworkReady',
        'routeMapReady',
      ]);
      if (auditedCapability !== null) return auditedCapability;

      const hasEntityPair = hasMeaningfulSourceTargetPair(
        row,
        ['sourcePerson', 'Source', 'Source_Name', 'Source_Person', 'Source_Entity', 'sender', 'Sender'],
        ['targetPerson', 'Target', 'Target_Name', 'Target_Person', 'Target_Entity', 'recipient', 'Recipient'],
      );
      const hasPlacePair = hasMeaningfulSourceTargetPair(
        row,
        ['Source_Location', 'Source_Loc', 'Source_Place', 'Source_Coordinates'],
        ['Target_Location', 'Target_Inferred_Loc', 'Target_Loc', 'Target_Place', 'Target_Coordinates'],
      );

      return hasEntityPair || hasPlacePair;
    };
    const routeRelationshipCount = (Array.isArray(searchRows) ? searchRows : []).filter(hasRouteOrRelationshipRecord).length;
    return [
      {
        label: 'Searchable records',
        value: `${loadedRecordCount || activeRecordCount || 0} loaded`,
        ready: (loadedRecordCount || activeRecordCount) > 0,
        note: 'Loaded records will be available to Advanced Search, Browse indexes, Inspector handoff, charts, and export where their mapped fields support those tools.',
      },
      {
        label: 'Current result scope',
        value: `${activeRecordCount} records`,
        ready: activeRecordCount > 0,
        note: 'The currently applied search scope used by Results, facets, Inspector handoff, Visualizations, charts, and Export.',
      },
      {
        label: 'Map visualizations',
        value: visibleNodeCount > 0 ? `${visibleNodeCount} visible map ${visibleNodeCount === 1 ? 'item' : 'items'}` : 'Not available',
        ready: visibleNodeCount > 0,
        statusLabel: visibleNodeCount > 0 ? 'Available' : 'Not available',
        note: visibleNodeCount > 0
          ? 'The current scope has mapped places, point records, or route endpoints available for map visualizations.'
          : 'No mapped places, point records, or route endpoints are available in the current scope.',
      },
      {
        label: 'Routes / relationships',
        value: routeRelationshipCount > 0 ? `${routeRelationshipCount} source-target ${routeRelationshipCount === 1 ? 'record' : 'records'}` : 'Not available',
        ready: routeRelationshipCount > 0,
        statusLabel: routeRelationshipCount > 0 ? 'Available' : 'Not available',
        note: routeRelationshipCount > 0
          ? 'The current scope has source-target routes or entity relationships available for route and network views.'
          : 'No source-target routes or entity relationships were mapped for this dataset.',
      },
      {
        label: 'Chart / export scope',
        value: activeRecordCount > 0 ? 'Available' : 'Not available',
        ready: activeRecordCount > 0,
        statusLabel: activeRecordCount > 0 ? 'Available' : 'Not available',
        note: activeRecordCount > 0
          ? 'The current applied result scope will be available for charting, visualization, and export through Peridot controls where the mapped fields support those tools.'
          : 'Apply or clear filters to restore an active result scope before charting, visualizing, or exporting.',
      },
    ];
  }, [browseRows, graph, searchRows]);
  const hasDraftChanges = (
    String(draftSearch ?? '') !== String(search ?? '')
    || String(draftPersonFilter ?? '') !== String(personFilter ?? '')
    || String(draftPlaceFilter ?? '') !== String(placeFilter ?? '')
    || String(draftRoutePlaceFilter ?? '') !== String(routePlaceFilter ?? '')
    || String(draftRoutePeopleFilter ?? '') !== String(routePeopleFilter ?? '')
    || String(draftMinCount ?? '') !== String(minCount ?? 1)
    || String(draftStartYear ?? '') !== getAppliedStartYear()
    || String(draftEndYear ?? '') !== getAppliedEndYear()
    || JSON.stringify(draftCapabilityFilters) !== JSON.stringify(appliedCapabilityFilters)
    || JSON.stringify(normalizedDraftStructuredCriteria) !== JSON.stringify(appliedStructuredCriteria)
  );

  const toggleDraftCapabilityFilter = (filterId) => {
    setDraftCapabilityFilters((current) => (
      current.includes(filterId)
        ? current.filter((id) => id !== filterId)
        : current.concat(filterId)
    ));
  };


  const updateDraftStructuredCriterion = (nextCriterion) => {
    setDraftStructuredCriteria((current) => (
      current.map((criterion) => (criterion.id === nextCriterion.id ? nextCriterion : criterion))
    ));
  };

  const addDraftStructuredCriterion = () => {
    setDraftStructuredCriteria((current) => (
      current.length >= MAX_STRUCTURED_CRITERIA ? current : current.concat(createStructuredCriterion())
    ));
  };

  const removeDraftStructuredCriterion = (criterionId) => {
    setDraftStructuredCriteria((current) => current.filter((criterion) => criterion.id !== criterionId));
  };

  const chooseFacet = (group, item) => {
    if (!group || !item) return;
    if (group.type === 'person') setDraftPersonFilter(item.value);
    if (group.type === 'place') setDraftPlaceFilter(item.value);
    if (group.type === 'routePlace') setDraftRoutePlaceFilter(item.value);
    if (group.type === 'year') {
      setDraftStartYear(item.value);
      setDraftEndYear(item.value);
    }
    if (group.type === 'capability') toggleDraftCapabilityFilter(item.value);
    if (group.type === 'evidenceField') setDraftSearch(item.value);
    setActiveTab('build');
  };



  const chooseBrowseIndexItem = (group, item) => {
    if (!group || !item) return;
    if (group.type === 'person') setDraftPersonFilter(item.value);
    if (group.type === 'place') setDraftPlaceFilter(item.value);
    if (group.type === 'routePlace') setDraftRoutePlaceFilter(item.value);
    if (group.type === 'evidenceField') {
      const nextCriterion = {
        ...createStructuredCriterion(),
        operator: 'must',
        field: 'evidenceFieldPresent',
        mode: 'contains',
        value: item.value,
      };
      setDraftStructuredCriteria((current) => {
        const safeCurrent = Array.isArray(current) ? current : [];
        if (safeCurrent.length < MAX_STRUCTURED_CRITERIA) return safeCurrent.concat(nextCriterion);
        return safeCurrent.slice(0, MAX_STRUCTURED_CRITERIA - 1).concat(nextCriterion);
      });
    }
    setFilterStatusMessage('Browse item added to draft criteria. Apply Filters to update results.');
    setActiveTab('build');
  };

  const resolveTimelineBoundaryIndexFromYear = (boundary, year) => {
    if (!timelineMonths.length || !year) return -1;
    if (boundary === 'start') return timelineMonths.findIndex((month) => String(month).slice(0, 4) === String(year));
    for (let index = timelineMonths.length - 1; index >= 0; index -= 1) {
      if (String(timelineMonths[index]).slice(0, 4) === String(year)) return index;
    }
    return -1;
  };

  const clearFilters = () => {
    const defaultEndIndex = Math.max(timelineMonths.length - 1, 0);
    setFilterStatusMessage('Filters cleared. Updating view…');
    window.requestAnimationFrame(() => {
      setDraftSearch('');
      setDraftPersonFilter('');
      setDraftPlaceFilter('');
      setDraftRoutePlaceFilter('');
      setDraftRoutePeopleFilter('');
      setDraftCapabilityFilters([]);
      setDraftStructuredCriteria([]);
      setDraftMinCount('1');
      setDraftStartYear(getDefaultStartYear());
      setDraftEndYear(getDefaultEndYear());
      setSearch('');
      setPersonFilter('');
      setPlaceFilter('');
      setRoutePlaceFilter('');
      setRoutePeopleFilter('');
      setCapabilityFilters?.([]);
      setStructuredCriteria?.([]);
      setMinCount(1);
      setTimelineMode('all');
      setRangeStart(0);
      setRangeEnd(defaultEndIndex);
      setIsPlaying(false);
      setPlaybackIndex(-1);
    });
  };

  const applyDraftFilters = () => {
    const parsedMinCount = Number.parseInt(String(draftMinCount).trim(), 10);
    const nextMinCount = Number.isFinite(parsedMinCount) ? Math.max(1, parsedMinCount) : minCount;
    const nextSearch = String(draftSearch ?? '').trim();
    const nextPersonFilter = String(draftPersonFilter ?? '').trim();
    const nextPlaceFilter = String(draftPlaceFilter ?? '').trim();
    const nextRoutePlaceFilter = String(draftRoutePlaceFilter ?? '').trim();
    const nextRoutePeopleFilter = String(draftRoutePeopleFilter ?? '').trim();
    const nextCapabilityFilters = Array.isArray(draftCapabilityFilters) ? draftCapabilityFilters : [];
    const nextStructuredCriteria = normalizeDraftStructuredCriteria(draftStructuredCriteria);
    const nextStartIndex = resolveTimelineBoundaryIndexFromYear('start', draftStartYear);
    const nextEndIndex = resolveTimelineBoundaryIndexFromYear('end', draftEndYear);

    setFilterStatusMessage('Updating view…');
    window.requestAnimationFrame(() => {
      setSearch(nextSearch);
      setPersonFilter(nextPersonFilter);
      setPlaceFilter(nextPlaceFilter);
      setRoutePlaceFilter(nextRoutePlaceFilter);
      setRoutePeopleFilter(nextRoutePeopleFilter);
      setCapabilityFilters?.(nextCapabilityFilters);
      setStructuredCriteria?.(nextStructuredCriteria);
      setDraftStructuredCriteria(nextStructuredCriteria);
      setMinCount(nextMinCount);
      setDraftMinCount(String(nextMinCount));
      if (nextStartIndex >= 0 && nextEndIndex >= 0) {
        const safeStart = Math.min(nextStartIndex, nextEndIndex);
        const safeEnd = Math.max(nextStartIndex, nextEndIndex);
        setTimelineMode('range');
        setRangeStart(safeStart);
        setRangeEnd(safeEnd);
      } else {
        setTimelineMode('all');
        setRangeStart(0);
        setRangeEnd(Math.max(timelineMonths.length - 1, 0));
      }
      setIsPlaying(false);
      setPlaybackIndex(-1);
      setActiveTab('results');
    });
  };

  const handleDraftKeyDown = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      applyDraftFilters();
    }
  };

  const renderBuildSearch = () => (
    <div className="space-y-4">
      <SectionHeader eyebrow="Step 1" title="Build Search">
        Draft changes do not affect maps, charts, export, or Inspector until Apply Filters is pressed.
      </SectionHeader>

      <div className={PANEL_INSET_CLASS + ' p-4'}>
        <div className="grid gap-3 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <label htmlFor="advanced-search-keyword" className={FIELD_LABEL_CLASS}>Keyword search</label>
            <input
              id="advanced-search-keyword"
              value={draftSearch}
              onChange={(event) => setDraftSearch(event.target.value)}
              onKeyDown={handleDraftKeyDown}
              placeholder={viewMode === 'geographic' ? 'e.g. Siena, Maria Magdalena, 1613' : 'e.g. Caterina, Cosimo, Siena'}
              className={INPUT_CLASS}
            />
          </div>
          <div className="lg:col-span-2">
            <AutocompleteTextInput
              id="advanced-search-start-year"
              label="Start year"
              value={draftStartYear}
              onChange={setDraftStartYear}
              onKeyDown={handleDraftKeyDown}
              placeholder="Start"
              suggestions={timelineYearSuggestions}
            />
          </div>
          <div className="lg:col-span-2">
            <AutocompleteTextInput
              id="advanced-search-end-year"
              label="End year"
              value={draftEndYear}
              onChange={setDraftEndYear}
              onKeyDown={handleDraftKeyDown}
              placeholder="End"
              suggestions={timelineYearSuggestions}
            />
          </div>
          <div className="lg:col-span-4">
            <label htmlFor="advanced-search-minimum" className={FIELD_LABEL_CLASS}>
              Minimum {viewMode === 'geographic' ? 'route weight' : 'connection weight'}
            </label>
            <input
              id="advanced-search-minimum"
              type="number"
              min="1"
              value={draftMinCount}
              onChange={(event) => setDraftMinCount(event.target.value)}
              onKeyDown={handleDraftKeyDown}
              className={INPUT_CLASS}
            />
          </div>
        </div>
        <p className="mt-2 text-xs leading-5 text-[var(--peridot-color-hex-4f654d)]">
          Press Enter in any field to apply. Available years: {timelineMonths.length ? `${timelineMonths[0]}–${timelineMonths[timelineMonths.length - 1]}` : 'none detected'}.
        </p>
      </div>

      <div className={PANEL_INSET_CLASS + ' p-4'}>
        <div className="flex flex-col gap-3 lg:flex-row">
          <div className="lg:w-[34%]">
            <AutocompleteTextInput
              id="advanced-search-person"
              label="Person / entity"
              value={draftPersonFilter}
              onChange={setDraftPersonFilter}
              onKeyDown={handleDraftKeyDown}
              placeholder="Person or entity"
              suggestions={personSuggestions}
            />
          </div>
          <div className="lg:w-[28%]">
            <AutocompleteTextInput
              id="advanced-search-place"
              label="Place"
              value={draftPlaceFilter}
              onChange={setDraftPlaceFilter}
              onKeyDown={handleDraftKeyDown}
              placeholder="Place"
              suggestions={placeSuggestions}
            />
          </div>
          <div className="lg:flex-1">
            <AutocompleteTextInput
              id="advanced-search-route-place"
              label="Route place"
              value={draftRoutePlaceFilter}
              onChange={setDraftRoutePlaceFilter}
              onKeyDown={handleDraftKeyDown}
              placeholder="Rome → Florence, or Florence"
              suggestions={routePlaceSuggestions}
            />
          </div>
          <div className="lg:flex-1">
            <AutocompleteTextInput
              id="advanced-search-route-people"
              label="Route people"
              value={draftRoutePeopleFilter}
              onChange={setDraftRoutePeopleFilter}
              onKeyDown={handleDraftKeyDown}
              placeholder="Sender → Recipient, or one name"
              suggestions={routePeopleSuggestions}
            />
          </div>
        </div>
      </div>

      <div className={PANEL_INSET_CLASS + ' p-4'}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <div className={FIELD_LABEL_CLASS}>Structured criteria</div>
            <p className="mt-1 text-xs leading-5 text-[var(--peridot-color-hex-4f654d)]">
              Optional fielded rules. The first row starts the structured search; later rows use AND, OR, or EXCLUDING to combine with what came before.
            </p>
          </div>
          <div className="rounded-full border border-[var(--peridot-color-hex-9db48e)] bg-[var(--peridot-color-hex-edf5e5)] px-3 py-1 text-xs font-bold text-[var(--peridot-color-hex-38553d)]">
            Draft: {draftStructuredLabel}
          </div>
        </div>
        {draftStructuredCriteria.length ? (
          <div className="mt-3 space-y-2">
            {draftStructuredCriteria.map((criterion, index) => (
              <StructuredCriterionRow
                key={criterion.id}
                criterion={criterion}
                index={index}
                onChange={updateDraftStructuredCriterion}
                onRemove={removeDraftStructuredCriterion}
                onKeyDown={handleDraftKeyDown}
                suggestions={getStructuredCriterionSuggestions(criterion.field)}
              />
            ))}
          </div>
        ) : (
          <div className="mt-3 rounded-xl border border-dashed border-[var(--peridot-color-hex-9db48e)] bg-[var(--peridot-color-hex-edf5e5-a70)] px-3 py-2 text-sm text-[var(--peridot-color-hex-465d49)]">
            No structured criteria are active. Simple keyword, person, place, route, date, and capability filters still work normally.
          </div>
        )}
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs leading-5 text-[var(--peridot-color-hex-4f654d)]">
            Applied: {activeStructuredLabel}. Base filters still apply first; structured rows are evaluated in plain language as Start with, AND, OR, and EXCLUDING when Apply Filters is pressed.
          </p>
          <button
            type="button"
            onClick={addDraftStructuredCriterion}
            disabled={draftStructuredCriteria.length >= MAX_STRUCTURED_CRITERIA}
            className={SECONDARY_BUTTON_CLASS + (draftStructuredCriteria.length >= MAX_STRUCTURED_CRITERIA ? ' opacity-55' : '')}
          >
            + Add criterion
          </button>
        </div>
      </div>


      <div className={PANEL_INSET_CLASS + ' p-4'}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <div className={FIELD_LABEL_CLASS}>Capability filters</div>
            <p className="mt-1 text-xs leading-5 text-[var(--peridot-color-hex-4f654d)]">
              Toggle workflow readiness or missing-evidence filters.
            </p>
          </div>
          <div className="rounded-full border border-[var(--peridot-color-hex-9db48e)] bg-[var(--peridot-color-hex-edf5e5)] px-3 py-1 text-xs font-bold text-[var(--peridot-color-hex-38553d)]">
            Draft: {draftCapabilityLabel}
          </div>
        </div>
        <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {CAPABILITY_FILTER_OPTIONS.map((option) => (
            <CapabilityFilterToggle
              key={option.id}
              option={option}
              checked={draftCapabilityFilters.includes(option.id)}
              count={capabilityFacetCounts.get(option.id)}
              onToggle={toggleDraftCapabilityFilter}
            />
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 rounded-[1rem] border border-[var(--peridot-color-hex-b8c8aa)] bg-[var(--peridot-color-hex-d7e6cc)] p-3 shadow-sm shadow-black/5">
        <p className="text-xs font-semibold leading-5 text-[var(--peridot-color-hex-38553d)]">
          {hasDraftChanges ? 'Draft changes are pending.' : 'Applied state is current.'}
        </p>
        <div className="flex flex-wrap justify-end gap-2">
          <button type="button" onClick={clearFilters} className={SECONDARY_BUTTON_CLASS}>
            Clear Filters
          </button>
          <button type="button" onClick={applyDraftFilters} className={PRIMARY_BUTTON_CLASS}>
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );


  const renderBrowse = () => (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <SectionHeader eyebrow="Step 2" title="Browse Indexes">
          Browse uses the full loaded dataset, not just the current result set. Choose an item to seed draft search criteria, then apply filters.
        </SectionHeader>
        <div className="rounded-full border border-[var(--peridot-color-hex-b8c8aa)] bg-[var(--peridot-color-hex-c7d9bc)] px-3 py-1.5 text-xs font-black text-[var(--peridot-color-hex-244c35)] shadow-sm shadow-black/5">
          {(browseRows?.length || 0)} loaded records indexed
        </div>
      </div>

      <div className={PANEL_INSET_CLASS + ' p-3'}>
        <AutocompleteTextInput
          id="browse-index-search"
          label="Search within browse indexes"
          value={browseQuery}
          onChange={setBrowseQuery}
          onKeyDown={handleDraftKeyDown}
          placeholder="Filter people, places, routes, evidence fields, or example values"
          suggestions={personSuggestions.concat(placeSuggestions, routePlaceSuggestions, evidenceFieldSuggestions).slice(0, 200)}
        />
      </div>

      {filteredBrowseIndexGroups.length ? (
        <div className="grid gap-3">
          {filteredBrowseIndexGroups.map((group) => (
            <BrowseIndexGroup
              key={group.id}
              group={group}
              onChooseBrowseItem={chooseBrowseIndexItem}
            />
          ))}
        </div>
      ) : (
        <div className={PANEL_INSET_CLASS + ' p-4 text-sm leading-6 text-[var(--peridot-color-hex-465d49)]'}>
          No browse-index entries match the current browse search.
        </div>
      )}
    </div>
  );

  const renderResults = () => (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <SectionHeader eyebrow="Step 3" title="Search Results">
          Compact cards reflect the current applied dataset. Use Inspect to open a record in the full Inspector workspace.
        </SectionHeader>
        <div className="flex flex-wrap items-center gap-2 rounded-full border border-[var(--peridot-color-hex-b8c8aa)] bg-[var(--peridot-color-hex-c7d9bc)] px-3 py-1.5 text-xs font-black text-[var(--peridot-color-hex-244c35)] shadow-sm shadow-black/5">
          <span>{searchRows?.length || 0} records</span>
          <span className="text-[var(--peridot-color-hex-7f9b70)]">/</span>
          <span>{searchResultCards.length} cards shown</span>
          {hiddenSearchResultCount > 0 ? <span className="text-[var(--peridot-color-hex-667960)]">+{hiddenSearchResultCount} more</span> : null}
        </div>
      </div>

      <div className="grid gap-3 xl:grid-cols-2">
        {searchResultCards.length ? (
          searchResultCards.map((result) => (
            <SearchResultCard
              key={result.id}
              result={result}
              onInspectSearchResult={onInspectSearchResult}
            />
          ))
        ) : (
          <div className="rounded-[1.25rem] border border-[var(--peridot-color-hex-b8c8aa)] bg-[var(--peridot-color-hex-dce9d2)] p-6 text-center shadow-sm shadow-black/5 xl:col-span-2">
            <div className="text-lg font-black text-[var(--peridot-color-hex-263d2e)]">No records are currently in scope.</div>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[var(--peridot-color-hex-5a6659)]">
              Clear filters or broaden the date window to restore results.
            </p>
            <button type="button" onClick={clearFilters} className={SECONDARY_BUTTON_CLASS + ' mt-4'}>
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );

  const renderCapabilities = () => (
    <div className="space-y-4">
      <SectionHeader eyebrow="Step 5" title="What this data can support">
        Review the loaded records and current applied search scope before moving into visualizations, charts, export, or Inspector evidence review.
      </SectionHeader>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {capabilityRows.map((row) => (
          <article
            key={row.label}
            className="rounded-[1.1rem] border border-[var(--peridot-color-hex-6f836d)] bg-[var(--peridot-color-hex-74897a)] p-4 text-[var(--peridot-color-hex-f7fbf0)] shadow-[0_10px_24px_var(--peridot-color-rgba-rgba-32-55-40-0-14)]"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-[0.62rem] font-black uppercase tracking-[0.14em] text-[var(--peridot-color-hex-e8f1de)]">Tool check</div>
                <h3 className="mt-1 text-base font-black text-[var(--peridot-role-interface-text-inverse)]">{row.label}</h3>
              </div>
              <span className={[
                'rounded-full border px-2.5 py-1 text-[0.68rem] font-black uppercase tracking-[0.12em]',
                row.ready
                  ? 'border-[var(--peridot-color-hex-dce9d2-a70)] bg-[var(--peridot-color-hex-dce9d2)] text-[var(--peridot-color-hex-244c35)]'
                  : 'border-[var(--peridot-color-hex-f0d7a8-a70)] bg-[var(--peridot-color-hex-f5e0b6)] text-[var(--peridot-color-hex-5d3d16)]',
              ].join(' ')}>
                {row.statusLabel || (row.ready ? 'Available' : 'Limited')}
              </span>
            </div>
            <div className="mt-3 rounded-xl border border-[var(--peridot-color-hex-dce9d2-a35)] bg-[var(--peridot-color-hex-506a57-a55)] px-3 py-2 text-sm font-black text-[var(--peridot-role-interface-text-inverse)]">
              {row.value}
            </div>
            <p className="mt-3 text-sm leading-6 text-[var(--peridot-color-hex-f0f6ea)]">{row.note}</p>
          </article>
        ))}
      </div>
    </div>
  );

  const renderRefineInspect = () => (
    <div className="space-y-4">
      <SectionHeader eyebrow="Step 4" title="Refine / Inspect">
        Facets summarize the applied result set. Clicking a facet fills draft criteria; Apply commits the refinement.
      </SectionHeader>

      <div className={PANEL_INSET_CLASS + ' p-3'}>
        <div className={FIELD_LABEL_CLASS}>Inspector handoff</div>
        <p className="mt-1 text-sm leading-5 text-[var(--peridot-color-hex-465d49)]">
          Use <span className="font-black text-[var(--peridot-color-hex-203729)]">Inspect</span> on a result card to open the record in the full evidence workspace. Dataset capability information now lives in the <span className="font-black text-[var(--peridot-color-hex-203729)]">Capabilities</span> tab.
        </p>
      </div>

      {searchFacetGroups.length ? (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {searchFacetGroups.map((group) => (
            <FacetGroup
              key={group.id}
              group={group}
              activeCapabilityFilters={draftCapabilityFilters}
              onChooseFacet={chooseFacet}
            />
          ))}
        </div>
      ) : (
        <div className={PANEL_INSET_CLASS + ' p-4 text-sm leading-6 text-[var(--peridot-color-hex-465d49)]'}>
          No facets are available for the current result set.
        </div>
      )}
    </div>
  );

  return (
    <section className="min-h-full bg-[radial-gradient(circle_at_top_left,var(--peridot-color-rgba-rgba-196-215-184-0-28),transparent_28%),linear-gradient(135deg,var(--peridot-role-interface-app-background-alt)_0%,var(--peridot-role-interface-panel-background)_50%,var(--peridot-role-interface-workspace-background)_100%)] px-6 py-5 text-[var(--peridot-color-hex-203729)]">
      <div className="mx-auto max-w-[1380px]">
        <div className={SHELL_CLASS + ' overflow-hidden'}>
          <header className="border-b border-[var(--peridot-color-hex-9fb28f)] bg-[var(--peridot-color-hex-cfdfc5)] p-4">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="max-w-3xl">
                <div className="text-[0.66rem] font-black uppercase tracking-[0.22em] text-[var(--peridot-color-hex-667960)]">Search workspace</div>
                <h1 className="mt-2 text-3xl font-black tracking-tight text-[var(--peridot-color-hex-263d2e)]">Advanced Search</h1>
                <p className="mt-2 text-sm leading-6 text-[var(--peridot-color-hex-5a6659)]">
                  Build a draft query, browse dataset-wide indexes, review applied results, refine with facets, check what the data can support, and open records in Inspector.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={onOpenVisualizations} className={SECONDARY_BUTTON_CLASS}>
                  Open visualizations
                </button>
                <button type="button" onClick={clearFilters} className={SECONDARY_BUTTON_CLASS}>
                  Clear Filters
                </button>
                <button type="button" onClick={applyDraftFilters} className={PRIMARY_BUTTON_CLASS}>
                  Apply Filters
                </button>
              </div>
            </div>

            <div className="mt-4 grid gap-2 md:grid-cols-2 xl:grid-cols-6">
              <AppliedScopeCard label="Records in scope" value={`${searchRows?.length || 0} records`} />
              <AppliedScopeCard label="Timeline" value={currentRangeLabel} />
              <AppliedScopeCard label="Minimum" value={currentMinCountLabel} />
              <AppliedScopeCard label="Capabilities" value={activeCapabilityLabel} />
              <AppliedScopeCard label="Criteria" value={activeStructuredLabel} />
              <AppliedScopeCard label="Draft state" value={hasDraftChanges ? 'Draft changes pending' : 'Applied state current'} />
            </div>
          </header>

          {filterStatusMessage ? (
            <div className="border-b border-[var(--peridot-color-hex-9fb28f)] bg-[var(--peridot-color-hex-b7cda9)] px-4 py-2 text-sm font-bold text-[var(--peridot-color-hex-203729)]">
              {filterStatusMessage}
            </div>
          ) : null}

          <nav className="grid gap-2 border-b border-[var(--peridot-color-hex-9fb28f)] bg-[var(--peridot-color-hex-b7cda9)] p-4 md:grid-cols-2 xl:grid-cols-5" aria-label="Advanced Search workflow tabs">
            <SearchTabButton
              id="build"
              label="Build Search"
              summary="Draft criteria and capability filters"
              active={activeTab === 'build'}
              onClick={setActiveTab}
            />
            <SearchTabButton
              id="browse"
              label="Browse"
              summary="Dataset-wide people, places, routes, and evidence"
              active={activeTab === 'browse'}
              onClick={setActiveTab}
            />
            <SearchTabButton
              id="results"
              label="Results"
              summary={`${searchRows?.length || 0} records currently applied`}
              active={activeTab === 'results'}
              onClick={setActiveTab}
            />
            <SearchTabButton
              id="refine"
              label="Refine / Inspect"
              summary="Facet counts and Inspector guidance"
              active={activeTab === 'refine'}
              onClick={setActiveTab}
            />
            <SearchTabButton
              id="capabilities"
              label="Capabilities"
              summary="What this data can do"
              active={activeTab === 'capabilities'}
              onClick={setActiveTab}
            />
          </nav>

          <main className="bg-[var(--peridot-color-hex-cfdfc5)] p-4">
            <div className={CARD_CLASS + ' p-4'}>
              {activeTab === 'build' ? renderBuildSearch() : null}
              {activeTab === 'browse' ? renderBrowse() : null}
              {activeTab === 'results' ? renderResults() : null}
              {activeTab === 'refine' ? renderRefineInspect() : null}
              {activeTab === 'capabilities' ? renderCapabilities() : null}
            </div>
          </main>
        </div>
      </div>
    </section>
  );
}
