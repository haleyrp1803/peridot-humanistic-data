/* Presentation-only primitives shared by generalized mapping stages. No mapping state or handlers. */
import React from 'react';

const ICON_PATHS = {
  relations: <><circle cx="5" cy="6" r="2"/><circle cx="19" cy="7" r="2"/><circle cx="12" cy="19" r="2"/><path d="M7 7l10 0M6 8l5 9m7-8-5 8"/></>,
  time: <><circle cx="12" cy="12" r="9"/><path d="M12 6v6l4 3"/></>,
  places: <><path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2"/></>,
  examples: <><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18M9 9v11"/></>,
  used: <><circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/></>,
  interpretation: <><rect x="5" y="3" width="14" height="18" rx="1"/><path d="M8 8h8M8 12h8M8 16h6"/></>,
  help: <><circle cx="12" cy="12" r="9"/><path d="M9 9a3 3 0 1 1 5 2.4c-1.2.9-2 1.3-2 3M12 17h.01"/></>
};
export function MappingSymbol({kind='help'}) {
  return <span className={`peridot-guide-symbol peridot-guide-symbol-${kind}`} aria-hidden="true"><svg viewBox="0 0 24 24" width="23" height="23" stroke="currentColor" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{ICON_PATHS[kind]||ICON_PATHS.help}</svg></span>;
}
/** Compact information trigger: works on hover, focus, and click. The button retains
 * native keyboard semantics; popover content is never used to convey a required value. */
export function MappingInfo({text,label='More information'}) {
 const [open,setOpen] = React.useState(false);
 const tipId = React.useId();
 return <span className="peridot-compact-info-wrap" data-open={open ? 'true' : 'false'}
   onMouseLeave={() => setOpen(false)} onBlur={(event) => {
     if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
   }}>
   <button type="button" className="peridot-compact-info" aria-label={label}
     aria-describedby={tipId} aria-expanded={open}
     onMouseEnter={() => setOpen(true)} onFocus={() => setOpen(true)}
     onClick={() => setOpen((current) => !current)}
     onKeyDown={(event) => {if (event.key === 'Escape') {setOpen(false); event.stopPropagation();}}}>
     <span aria-hidden="true">i</span>
   </button>
   <span id={tipId} className="peridot-compact-tooltip" role="tooltip">{text}</span>
 </span>;
}
export function MappingStageIntro({section,title,description,help,kind}) {
  return <header className="peridot-guide-intro">
    <div className="peridot-guide-intro-main">
      <h2>{section}</h2>
      <p className="peridot-guide-intro-subtitle">{title} <MappingInfo label={`About ${section}`} text={<>{description} {help}</>}/></p>
    </div>
  </header>;
}
export function MappingGuideCard({title,kind='help',children}) {
 return <section className={`peridot-guide-card peridot-guide-card-${kind}`}><div className="peridot-guide-card-heading"><MappingSymbol kind={kind}/><h3>{title}</h3></div><div className="peridot-guide-card-body">{children}</div></section>;
}
export function MappingQuestionMarker({children,sub=false}) {
 return <span className={sub?'peridot-guide-question-marker peridot-guide-question-marker-sub':'peridot-guide-question-marker'} aria-hidden="true">{children}</span>;
}

/** One shared visual marker for subordinate mapping questions. */
export function MappingRefinementMarker({value, className=''}) {
 return <span className={`peridot-mapping-refinement-marker ${className}`.trim()} aria-hidden="true">{value}</span>;
}
