/*
 * Timeline category editor — dedicated full-stage workspace.
 * Evidence remains canonical: all selections and visual appearance overrides are
 * session-only, source-preserving configuration. The three areas deliberately
 * separate finding source fields, choosing values, and editing one category.
 * This component never changes Search visibility, data mapping, or event IDs.
 */
import React, {useMemo, useState} from 'react';
import {
  configureTimelineCategoryAppearance, configureTimelineCategoryField,
  removeTimelineCategoryField, reconcileTimelineCategoryConfiguration,
  configureTimelineCategoryFieldScope,
  resolveTimelineCategories,
} from './peridotTimelineCategoryConfiguration.js';

import {TIMELINE_SYMBOL_GROUPS,TIMELINE_SYMBOL_LABELS,PeridotCategorySymbolIcon} from './PeridotTimelineCategorySymbols.jsx';
import {TimelineCategoryPoint} from './PeridotTimelineCategoryMarks.jsx';

// Curated options remain identical to the preceding palette; only presentation
// order changes. Arrange warm reds through violet, then earthy neutrals.
// Do not change the configuration module's deterministic default assignments.
const RAINBOW_CATEGORY_COLORS = [
  '#7C211E','#A63D2B','#C35161','#D17885','#E2A79E','#8F2443','#A34764','#D58BA2',
  '#C45F32','#D47C40','#E5A65E','#B17B2C','#D7A23D','#E1BF66','#8F662D','#B99248',
  '#6C6A2D','#7C8A6B','#345B46','#54885B','#74A36A','#97B877','#2C6654','#77A993',
  '#3C7A7A','#55A1A7','#7BBCC2','#245C69','#2F6C8F','#254C77','#447AB1','#6F9DCE','#2E3D8C',
  '#49346F','#5E3B8C','#7B5A9A','#A084BD',
  '#725A67','#5A3C2E','#897A69','#B59E83','#3B3B3B',
];
// The grid includes all original colors (including charcoal) and all 30 added
// shades. A separate custom picker supports colors outside the curated set.
const ALL_CATEGORY_SYMBOLS = TIMELINE_SYMBOL_GROUPS.flatMap(group=>group.symbols.filter(([id])=>id!=='none'));
const inputClass = 'w-full min-w-0 rounded-md border border-[#b9a78e] bg-[#fffdf8] px-3 py-1.5 text-sm text-[#302b24] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#7C211E]';
const actionClass = 'rounded-md border border-[#b4a087] bg-[#fbf7ed] px-2.5 py-1.5 text-xs font-semibold hover:bg-[#eee0c7] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#7C211E]';
const sectionTitle = 'font-serif text-lg font-semibold text-[#7C211E]';
export function PeridotTimelineCategoryEditor({availableFields=[], events=[], configuration, onChange}) {
  const fields = Array.isArray(availableFields) ? availableFields : [];
  const config = useMemo(()=>reconcileTimelineCategoryConfiguration(configuration,fields),[configuration,fields]);
  const resolved = useMemo(()=>resolveTimelineCategories(events,fields,config),[events,fields,config]);
  const [fieldQuery,setFieldQuery] = useState('');
  const [valueQuery,setValueQuery] = useState('');
  const [categoryQuery,setCategoryQuery] = useState('');
  const [selectedFieldKey,setSelectedFieldKey] = useState('');
  const [selectedCategoryId,setSelectedCategoryId] = useState('');
  const selectedField = fields.find(f=>f.key===selectedFieldKey) || fields.find(f=>config.fields.some(s=>s.key===f.key)) || fields[0] || null;
  const selection = selectedField ? config.fields.find(s=>s.key===selectedField.key) : null;
  const matchingCategories = resolved.categories.filter(c=>c.fieldKey===selectedField?.key);
  const selectedCategory = resolved.categories.find(c=>c.id===selectedCategoryId) || matchingCategories[0] || resolved.categories[0] || null;
  const visibleFields = fields.filter(f=>`${f.label||f.key} ${f.key}`.toLowerCase().includes(fieldQuery.toLowerCase()));
  const visibleValues = (selectedField?.values||[]).filter(v=>v.value.toLowerCase().includes(valueQuery.toLowerCase()));
  const visibleCategories = resolved.categories.filter(c=>`${c.label} ${c.sourceLabel} ${c.sourceValue}`.toLowerCase().includes(categoryQuery.toLowerCase()));
  const change = next => onChange?.(next);
  const trackSelectedValue=(value,enabled)=>{
    if(!selectedField) return;
    // Switching from 'all' to 'selected' keeps all currently tracked values
    // except the one being unchecked. This never silently drops other values.
    const values=selection?.mode==='selected' ? selection.values : selection?.mode==='all' ? selectedField.values.map(v=>v.value) : [];
    const next=enabled ? [...new Set([...values,value])] : values.filter(v=>v!==value);
    change(configureTimelineCategoryField(config,fields,selectedField.key,'selected',next));
  };
  const tracked=value=>selection?.mode==='all' || (selection?.mode==='selected' && selection.values.includes(value));
  return <section className="flex min-h-0 flex-1 flex-col overflow-hidden bg-[#fbf7ed] text-[#302b24]" aria-label="Timeline category editor">
    <div className="grid min-h-0 flex-1 grid-cols-1 gap-0 overflow-y-auto lg:grid-cols-[minmax(180px,23fr)_minmax(235px,30fr)_minmax(340px,47fr)] lg:overflow-hidden">
      <section className="flex min-h-[220px] flex-col border-b border-[#d5c1a5] px-3 py-3 lg:min-h-0 lg:border-b-0 lg:border-r" aria-label="Source columns">
        <h3 className={sectionTitle}>1. Source columns</h3>
        <p className="mt-1 text-xs text-[#695e50]">Inspect available dataset fields, then select those you want to use as categories.</p>
        <label className="mt-2 block text-xs font-semibold" htmlFor="tl-category-field-search">Find a column</label>
        <input id="tl-category-field-search" className={inputClass} value={fieldQuery} onChange={e=>setFieldQuery(e.target.value)} placeholder="Search mapped and original fields"/>
        <div className="mt-2 min-h-0 flex-1 space-y-1 overflow-y-auto pr-1">
          {visibleFields.map(field=>{
            const enabled=config.fields.some(s=>s.key===field.key);
            const active=field.key===selectedField?.key;
            return <div key={field.key} className={`flex items-center gap-2 rounded-md border px-2 py-1.5 ${active?'border-[#7C211E] bg-[#eee0c7]':'border-[#dfd0b9] bg-[#fffdf8]'}`}>
              <input type="checkbox" checked={enabled} aria-label={`Track all values in ${field.label||field.key}`} onChange={e=>{setSelectedFieldKey(field.key);setSelectedCategoryId('');change(e.target.checked?configureTimelineCategoryField(config,fields,field.key,'all'):removeTimelineCategoryField(config,fields,field.key));}}/>
              <button type="button" onClick={()=>{setSelectedFieldKey(field.key);setSelectedCategoryId('');setValueQuery('');}} className="min-w-0 flex-1 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#7C211E]" aria-current={active?'true':undefined}>
                <span className="block break-words text-[13px] font-semibold leading-tight">{field.label||field.key}</span>
                <span className="block text-[11px] leading-tight text-[#695e50]">{field.values?.length||0} values{field.domain ? ` · ${field.domain}` : ' · Evidence'}{field.sourceSheet ? ` · ${field.sourceSheet}` : ''}{field.sourceRole ? ` · ${field.sourceRole}` : ''}</span>
              </button>
            </div>;
          })}
          {!visibleFields.length && <p className="text-sm text-[#695e50]">No matching category sources.</p>}
        </div>
      </section>
      <section className="flex min-h-[250px] flex-col border-b border-[#d5c1a5] px-3 py-3 lg:min-h-0 lg:border-b-0 lg:border-r" aria-label="Category values">
        <h3 className={sectionTitle}>2. Values to track</h3>
        {!selectedField ? <p className="mt-3 text-sm text-[#695e50]">No category sources are available for these Timeline events.</p> : <>
          <p className="mt-1 break-words text-xs text-[#695e50]">{selectedField.label||selectedField.key} · {selectedField.values?.length||0} distinct values{selectedField.sourceSheet ? ` · Sheet: ${selectedField.sourceSheet}` : ''}{selectedField.sourceRole ? ` · Role: ${selectedField.sourceRole}` : ''}</p>
          {selectedField.source && <div className="mt-2 rounded-md border border-[#d5c1a5] bg-[#fff9ec] p-2 text-xs text-[#5c5142]">
            <label htmlFor="tl-category-association-scope" className="block font-semibold">Apply categories to</label>
            <select id="tl-category-association-scope" className={`${inputClass} mt-1`} value={config.fieldScopes?.[selectedField.key] || selectedField.defaultAssociationScope}
              onChange={e=>change(configureTimelineCategoryFieldScope(config,fields,selectedField.key,e.target.value))}
              disabled={!selection}>
              {selectedField.associationScopes.map(scope=><option key={scope} value={scope}>{scope==='subject'?'Events belonging to this mapped subject':scope==='assertion'?'Only this mapped temporal assertion':'All events from this source record'}</option>)}
            </select>
            <p className="mt-1">{selectedField.requiresExplicitRawAuthorization?'Original uploaded column: tracking explicitly authorizes record-level use. No linked-sheet joins are inferred.':'Uses existing mapped provenance; no relationships are inferred between unrelated records.'} Record scope includes events from this source record; subject scope requires a matching mapped event subject.</p>
          </div>}
          <div className="mt-2 flex flex-wrap gap-1.5">
            <button className={actionClass} type="button" onClick={()=>change(configureTimelineCategoryField(config,fields,selectedField.key,'all'))}>Track all values</button>
            <button className={actionClass} type="button" onClick={()=>change(configureTimelineCategoryField(config,fields,selectedField.key,'selected',[]))}>Select individually</button>
            {selection && <button className={actionClass} type="button" onClick={()=>change(removeTimelineCategoryField(config,fields,selectedField.key))}>Clear field</button>}
          </div>
          <p className="mt-1.5 text-xs text-[#695e50]">{!selection?'Not tracking this column':selection.mode==='all'?'Tracking every value in this column':`Tracking ${selection.values.length} selected values`}. Check or uncheck values below.</p>
          <label className="mt-2 block text-xs font-semibold" htmlFor="tl-category-value-search">Find a value</label>
          <input id="tl-category-value-search" className={inputClass} placeholder="Search values" value={valueQuery} onChange={e=>setValueQuery(e.target.value)}/>
          <div className="mt-2 min-h-0 flex-1 space-y-1 overflow-y-auto pr-1">
            {visibleValues.map(value=>{
              const selected=tracked(value.value);
              const item=matchingCategories.find(c=>c.sourceValue===value.value);
              const active=item?.id===selectedCategory?.id;
              return <div key={value.value} className={`flex items-center gap-2 rounded-md border px-2 py-1.5 ${active?'border-[#7C211E] bg-[#eee0c7]':'border-[#dfd0b9] bg-[#fffdf8]'}`}>
                <input aria-label={`Track ${value.value}`} type="checkbox" checked={Boolean(selected)} onChange={e=>trackSelectedValue(value.value,e.target.checked)}/>
                <button type="button" disabled={!item} onClick={()=>setSelectedCategoryId(item.id)} className="min-w-0 flex-1 break-words text-left text-xs disabled:cursor-default" title={item?'Edit appearance for this value':'Track this value to edit its appearance'}>
                  {item && <span className="mr-2 inline-block h-2.5 w-2.5 rounded-full" style={{background:item.color}}/>}{value.value}
                </button>
                <span className="shrink-0 text-[11px] text-[#695e50]">{value.eventCount??''}</span>
              </div>;
            })}
            {!visibleValues.length && <p className="text-xs text-[#695e50]">No matching values.</p>}
          </div>
        </>}
      </section>
      <section className="flex min-h-[350px] flex-col px-4 py-3 lg:min-h-0" aria-label="Category appearance">
        <h3 className={sectionTitle}>3. Appearance</h3>
        <p className="mt-1 text-xs text-[#695e50]">Choose a tracked category to edit. The source value remains unchanged.</p>
        <label htmlFor="tl-category-appearance-search" className="mt-2 block text-xs font-semibold">Find an active category ({resolved.categories.length})</label>
        <input id="tl-category-appearance-search" className={inputClass} placeholder="Search selected categories" value={categoryQuery} onChange={e=>setCategoryQuery(e.target.value)}/>
        <div className="mt-2 flex max-h-20 shrink-0 flex-wrap gap-1.5 overflow-y-auto rounded-md border border-[#dfd0b9] bg-[#fffdf8] p-2">
          {visibleCategories.map(item=><button type="button" key={item.id} onClick={()=>setSelectedCategoryId(item.id)} aria-pressed={item.id===selectedCategory?.id} className={`flex max-w-full items-center gap-1.5 rounded-md border px-2 py-1 text-xs ${item.id===selectedCategory?.id?'border-[#7C211E] bg-[#eee0c7]':'border-[#dfd0b9] bg-white'}`}>
            <span aria-hidden="true" className="relative block h-[20px] w-[20px] shrink-0 rounded-full border border-[#55463b]" style={{background:item.color}}><TimelineCategoryPoint categories={[item]} displayMode="colors-and-symbols"/></span><span className="max-w-52 truncate">{item.label}</span>
          </button>)}
          {!visibleCategories.length && <p className="text-xs text-[#695e50]">No active categories match.</p>}
        </div>
        {!selectedCategory ? <p className="mt-4 text-sm text-[#695e50]">Choose a source value to start customizing categories.</p> : <div className="mt-3 min-h-0 flex-1 overflow-y-auto pr-1">
          {/* Keep category identity, editable name, and live preview together so
              the researcher can see the result without scrolling to the bottom. */}
          <p className="mb-2 text-xs text-[#695e50]">Editing <strong>{selectedCategory.sourceLabel} → {selectedCategory.sourceValue}</strong></p>
          <div className="flex items-center gap-3">
            <div className="min-w-0 flex-1">
              <label htmlFor="tl-category-display-name" className="mb-1 block text-xs font-semibold">Display name</label>
              <input id="tl-category-display-name" className={inputClass} value={selectedCategory.label} onChange={e=>change(configureTimelineCategoryAppearance(config,fields,selectedCategory.id,{label:e.target.value}))}/>
            </div>
            <div className="flex h-[62px] w-[62px] shrink-0 items-center justify-center rounded-md border border-[#d5c1a5] bg-[#eee0c7]" role="img" aria-label={`Preview: ${selectedCategory.label}, ${selectedCategory.symbol==='none'?'no symbol':selectedCategory.symbol}, ${selectedCategory.color}`}>
              <span className="relative block h-11 w-11 rounded-full border-2 shadow-sm" style={{background:selectedCategory.color,borderColor:`#${[1,3,5].map(i=>Math.round(parseInt(selectedCategory.color.slice(i,i+2),16)*0.63).toString(16).padStart(2,'0')).join('')}`}}>
                <TimelineCategoryPoint categories={[selectedCategory]} displayMode="colors-and-symbols"/>
              </span>
            </div>
          </div>
          <fieldset className="mt-3"><legend className="mb-1.5 text-xs font-semibold">Category color</legend>
            {/* Single compact rainbow grid: do not hide the extended palette
                inside a separate scrolling disclosure. Each swatch retains an
                accessible color name and pressed state. */}
            <div className="grid grid-cols-9 gap-1 sm:grid-cols-10" role="group" aria-label="Rainbow-ordered category color palette">
              {RAINBOW_CATEGORY_COLORS.map(color=>{
                const active=selectedCategory.color.toLowerCase()===color.toLowerCase();
                return <button type="button" key={color} title={color} aria-label={`Select color ${color}`} aria-pressed={active} onClick={()=>change(configureTimelineCategoryAppearance(config,fields,selectedCategory.id,{color}))} className={`flex aspect-square min-w-0 items-center justify-center rounded border-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#7C211E] ${active?'border-[#302b24] ring-2 ring-[#b17b2c] ring-offset-1':'border-[#fffdf8]'}`} style={{background:color}}>{active&&<span aria-hidden="true" className="font-bold text-white drop-shadow-[0_1px_2px_#000]">✓</span>}</button>;
              })}
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <label htmlFor="tl-category-custom-color" className="text-xs font-semibold">Custom color</label>
              <input id="tl-category-custom-color" type="color" value={selectedCategory.color} aria-label="Choose a custom category color" onChange={e=>change(configureTimelineCategoryAppearance(config,fields,selectedCategory.id,{color:e.target.value}))} className="h-8 w-10 cursor-pointer rounded border border-[#b4a087]"/>
              <span className="text-xs text-[#695e50]">{selectedCategory.color.toUpperCase()}</span>
            </div>
          </fieldset>
          <fieldset className="mt-3"><legend className="mb-1.5 text-xs font-semibold">Optional symbol</legend>
            {/* Exactly 100 researcher-approved Tabler icons, with No symbol first.
                Some legacy symbols remain renderable for backwards compatibility
                but do not appear as new selections. */}
            <div className="grid grid-cols-9 gap-1 sm:grid-cols-10" role="group" aria-label="Category symbol library">
              <button type="button" title="No symbol (default)" aria-label="No symbol" aria-pressed={selectedCategory.symbol==='none'} onClick={()=>change(configureTimelineCategoryAppearance(config,fields,selectedCategory.id,{symbol:'none'}))} className={`flex aspect-square min-w-0 items-center justify-center rounded-md border-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#7C211E] ${selectedCategory.symbol==='none'?'border-[#7C211E] bg-[#eee0c7]':'border-[#d5c1a5] bg-white'}`}><PeridotCategorySymbolIcon name="none"/></button>
              {ALL_CATEGORY_SYMBOLS.map(([id,label])=><button type="button" key={id} title={label} aria-label={label} aria-pressed={selectedCategory.symbol===id} onClick={()=>change(configureTimelineCategoryAppearance(config,fields,selectedCategory.id,{symbol:id}))} className={`flex aspect-square min-w-0 items-center justify-center rounded-md border-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#7C211E] ${selectedCategory.symbol===id?'border-[#7C211E] bg-[#eee0c7]':'border-[#d5c1a5] bg-white'}`}><PeridotCategorySymbolIcon name={id}/></button>)}
            </div>
          </fieldset>
          <p className="mt-2 text-xs text-[#695e50]">{selectedCategory.symbol==='none'?'No symbol':TIMELINE_SYMBOL_LABELS[selectedCategory.symbol]||selectedCategory.symbol} · {selectedCategory.color}</p>
        </div>}
      </section>
    </div>
    <footer className="shrink-0 border-t border-[#d5c1a5] bg-[#fbf7ed] px-4 py-2 text-xs text-[#695e50]">Changes apply immediately to Timeline marks and persist during this dataset session. No data is saved between browser sessions.</footer>
  </section>;
}
export default PeridotTimelineCategoryEditor;
