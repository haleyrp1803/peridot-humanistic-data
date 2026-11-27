/* Shared, draft-only Investigate Further sheet for Evidence Workspace dossiers.
 * The Explore tab is the only place where Apply Filters can commit criteria.
 */
import React, { createContext, useContext, useState } from 'react';
import { AutocompleteTextInput } from './PeridotSearchWorkspace.jsx';

export const PeridotInvestigateContext = createContext(null);

const initial = { keyword: '', person: '', place: '', routePeople: '', routePlace: '', startYear: '', endYear: '' };

export function PeridotInvestigateFurther({ subjectLabel = '', subjectType = '', className = '' }) {
  const integration = useContext(PeridotInvestigateContext);
  const [criteria, setCriteria] = useState(initial);
  const update = (name, value) => setCriteria((previous) => ({ ...previous, [name]: value }));
  const isPerson = subjectType === 'person';
  const isPlace = subjectType === 'place';
  const canSeed = Boolean(subjectLabel && (isPerson || isPlace));
  const populated = Object.values(criteria).some((v) => String(v || '').trim());
  // Use the very same dataset-derived suggestions and popup component as Explore.
  // Choosing a suggestion edits this sheet's local draft only.
  const suggestions = integration?.suggestions || {};
  const suggestionFields = {
    person: suggestions.people || [],
    place: suggestions.places || [],
    routePeople: suggestions.peopleRoutes || [],
    routePlace: suggestions.placeRoutes || [],
    startYear: suggestions.years || [],
    endYear: suggestions.years || [],
  };
  const fields = [
    ['keyword', 'Search across records', 'Record ID, keyword, or source value'],
    ['person', 'People and entities', 'Mapped person or entity'],
    ['place', 'Places', 'Mapped place'],
    ['routePeople', 'Relationship participants', 'Person A — Person B'],
    ['routePlace', 'Geographic connections', 'Origin → destination'],
    ['startYear', 'Start year', 'YYYY'],
    ['endYear', 'End year', 'YYYY'],
  ];
  const submit = (event) => {
    event.preventDefault();
    if (typeof integration?.onContinue === 'function') integration.onContinue(criteria);
  };
  return <section className={`peridot-investigate-sheet ${className}`} aria-label="Investigate further search">
    <p className="peridot-investigate-intro">Develop a search from the evidence you are examining. These are draft criteria: the active visualization and its filters will not change until you choose <strong>Apply Filters</strong> in Explore.</p>
    {canSeed && <div className="peridot-investigate-subject">
      <span>Currently inspecting: <strong>{subjectLabel}</strong></span>
      <button type="button" className="peridot-investigate-seed" onClick={() => update(isPerson ? 'person' : 'place', subjectLabel)}>
        Use this {isPerson ? 'person' : 'place'} in search
      </button>
    </div>}
    <form onSubmit={submit}>
      <div className="peridot-investigate-grid">
        {fields.map(([name, label, placeholder]) => <div key={name} className={`peridot-investigate-field ${name === 'keyword' ? 'is-wide' : ''}`}>
          {name === 'keyword' ? <>
            <label htmlFor="peridot-investigate-keyword">{label}</label>
            <input id="peridot-investigate-keyword" type="search" value={criteria[name]}
              onChange={(event) => update(name, event.target.value)} placeholder={placeholder} autoComplete="off" />
          </> : <AutocompleteTextInput
            id={`peridot-investigate-${name}`}
            label={label}
            value={criteria[name]}
            onChange={(value) => update(name, value)}
            placeholder={placeholder}
            suggestions={suggestionFields[name]}
            inputClassName="peridot-investigate-autocomplete-input"
          />}
        </div>)}
      </div>
      <p className="peridot-investigate-hint">Only populated fields are transferred. Any other draft criteria already in Explore remain unchanged. Dates use Explore's existing year-range filtering.</p>
      <div className="peridot-investigate-actions">
        <button type="button" onClick={() => setCriteria({ ...initial })} disabled={!populated}>Clear draft here</button>
        <button type="submit" className="is-primary" disabled={!integration?.onContinue}>Continue in Explore</button>
      </div>
    </form>
  </section>;
}
