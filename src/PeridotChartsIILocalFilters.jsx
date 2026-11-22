/* B4.4 — UI for local, non-destructive Charts II record filters. */
import React, { useMemo, useState } from 'react';
import { getChartsIICategoryFilterOptions, countChartsIIActiveFilters } from './chartsIILocalFilters.js';

const inputClass = 'mt-1 w-full min-w-0 rounded-md border border-[#cdb48b] bg-[#fffdf7] px-2 py-2 text-[12px] text-[#24382d]';

function CategoryRule({ rule, rows, onChange, singleCategory = false }) {
  const [search, setSearch] = useState('');
  const options = useMemo(() => getChartsIICategoryFilterOptions(rows, rule.field), [rows, rule.field]);
  const filtered = options.filter(option => option.value.toLocaleLowerCase().includes(search.trim().toLocaleLowerCase()));
  const visible = filtered.slice(0, 75);
  const selection = new Set(singleCategory ? (rule.values || []).slice(0, 1) : (rule.values || []));
  return <div className="mt-2 space-y-2">
    {options.length === 0 ? <p className="text-[11px] text-[#52675a]">No populated categories in this Explore scope.</p> : <>
      <input type="search" className={inputClass} value={search} onChange={event => setSearch(event.target.value)} placeholder="Find a category" aria-label="Search values for this categorical filter" />
      <div className="flex items-center justify-between gap-2 text-[11px]">
        <span className="text-[#52675a]">{selection.size} selected · {options.length} available</span>
        <button type="button" className="underline text-[#8b3026]" onClick={() => onChange({ ...rule, values: [] })}>Clear values</button>
      </div>
      <div className="max-h-44 space-y-1 overflow-y-auto rounded-md border border-[#dfceb6] bg-[#fffdf7] p-2">
        {visible.map(option => <label key={option.value} className="flex cursor-pointer items-start gap-2 text-[11px] text-[#344b39]">
          <input type={singleCategory ? 'radio' : 'checkbox'} name={singleCategory ? `charts-ii-filter-${rule.id}` : undefined} checked={selection.has(option.value)} className="mt-[2px]" onChange={event => onChange({ ...rule, values: singleCategory ? [option.value] : event.target.checked ? [...(rule.values || []), option.value] : (rule.values || []).filter(value => value !== option.value) })} />
          <span className="min-w-0 flex-1 break-words">{option.value}</span><span className="text-[#677568]">{option.count}</span>
        </label>)}
        {!visible.length && <p className="text-[11px] text-[#52675a]">No matching categories.</p>}
      </div>
      {filtered.length > visible.length && <p className="text-[10px] text-[#52675a]">Showing the first {visible.length} matches. Search to locate other values.</p>}
    </>}
    <p className="text-[10px] leading-relaxed text-[#52675a]">{singleCategory ? 'Select one category at a time; clear the selection to include all values.' : 'Select one or more values; an empty selection does not restrict the chart.'}</p>
  </div>;
}

function NumericalRule({ rule, onChange }) {
  const min = rule.min ?? '';
  const max = rule.max ?? '';
  const invalid = min !== '' && max !== '' && Number(min) > Number(max);
  return <div className="mt-2 space-y-2">
    <div className="grid grid-cols-2 gap-2">
      <label className="text-[11px] font-medium text-[#344b39]">Minimum (inclusive)
        <input type="number" step="any" value={min} onChange={event => onChange({ ...rule, min: event.target.value })} placeholder="No minimum" className={inputClass} />
      </label>
      <label className="text-[11px] font-medium text-[#344b39]">Maximum (inclusive)
        <input type="number" step="any" value={max} onChange={event => onChange({ ...rule, max: event.target.value })} placeholder="No maximum" className={inputClass} />
      </label>
    </div>
    {invalid && <p className="text-[11px] text-[#8b3026]">The minimum is greater than the maximum; no values can match.</p>}
    <p className="text-[10px] leading-relaxed text-[#52675a]">Leave either bound blank to keep that side unrestricted. Records with missing or invalid measurements do not match an active range.</p>
  </div>;
}

export function PeridotChartsIILocalFilters({ rules = [], rows = [], inventory, onChange, beforeCount = 0, afterCount = 0, exploreCount = 0, singleCategory = false }) {
  const categories = inventory?.barGroupOptions || [];
  const numbers = inventory?.numericMeasureOptions || [];
  const active = countChartsIIActiveFilters(rules);
  const [nextId, setNextId] = useState(1);
  const append = type => {
    const fields = type === 'category' ? categories : numbers;
    if (!fields.length) return;
    onChange([...rules, { id: `filter-${nextId}`, type, field: fields[0].key, values: [], min: '', max: '' }]);
    setNextId(previous => previous + 1);
  };
  const update = nextRule => onChange(rules.map(rule => rule.id === nextRule.id ? nextRule : rule));
  const remove = id => onChange(rules.filter(rule => rule.id !== id));
  return <div className="mt-3 space-y-3 text-[#344b39]">
    <p className="text-[11px] leading-relaxed text-[#52675a]">Filters affect only this chart. Explore results, the source dataset, and other visualizations are unchanged. The chronology dock continues to control time.</p>
    <div className="rounded-md border border-[#d9c8a9] bg-[#fffdf7] p-2.5 text-[11px]">
      <strong>{afterCount.toLocaleString()} / {beforeCount.toLocaleString()}</strong> current chart-scope records retained
      <p className="mt-1 text-[#52675a]">Explore scope: {exploreCount.toLocaleString()} · {active} active local {active === 1 ? 'rule' : 'rules'}</p>
    </div>
    {rules.map((rule, index) => {
      const fields = rule.type === 'category' ? categories : numbers;
      return <div className="rounded-lg border border-[#dfceb6] bg-[#fffaf0] p-2.5" key={rule.id}>
        <div className="flex items-center justify-between gap-2">
          <span className="text-[11px] font-semibold">{index > 0 ? 'AND · ' : ''}{rule.type === 'category' ? 'Category values' : 'Numerical range'}</span>
          <button type="button" className="text-[11px] underline text-[#8b3026]" onClick={() => remove(rule.id)} aria-label={`Remove filter ${index + 1}`}>Remove</button>
        </div>
        <label className="mt-2 block text-[11px] font-semibold">Field
          <select className={inputClass} value={rule.field} onChange={event => update({ ...rule, field: event.target.value, values: [], min: '', max: '' })}>
            {!fields.some(field => field.key === rule.field) && <option value={rule.field}>Unavailable: {rule.field}</option>}
            {fields.map(field => <option key={field.key} value={field.key}>{field.label}</option>)}
          </select>
        </label>
        {rule.type === 'category' ? <CategoryRule rule={rule} rows={rows} onChange={update} singleCategory={singleCategory} /> : <NumericalRule rule={rule} onChange={update} />}
      </div>;
    })}
    <div className="flex flex-wrap gap-2">
      <button type="button" disabled={!categories.length} onClick={() => append('category')} className="rounded-md border border-[#cdb48b] bg-[#fffdf7] px-2.5 py-2 text-[11px] font-semibold hover:bg-[#f3e7cd] disabled:opacity-50">+ Category filter</button>
      <button type="button" disabled={!numbers.length} onClick={() => append('number')} className="rounded-md border border-[#cdb48b] bg-[#fffdf7] px-2.5 py-2 text-[11px] font-semibold hover:bg-[#f3e7cd] disabled:opacity-50">+ Numerical range</button>
    </div>
    {rules.length > 0 && <button type="button" onClick={() => onChange([])} className="text-[11px] font-medium underline text-[#8b3026]">Reset all chart filters</button>}
    <p className="text-[10px] leading-relaxed text-[#52675a]">{singleCategory ? 'Each category filter selects one value.' : <>Within a category filter, selected values mean <strong>OR</strong>.</>} Across different filters, the relationship is <strong>AND</strong>.</p>
  </div>;
}
