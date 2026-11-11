/*
 * Timeline II — researcher-controlled category configuration (schema v1).
 *
 * This module is a presentation-only projection of the canonical, mapped
 * Evidence memberships on Timeline events. It NEVER mutates source rows,
 * category memberships, Search scope, or canonical research assertions.
 *
 * Pass 1 deliberately defines a pure, side-effect-free contract. Pass 2 will
 * expose the selections through a category editor; later bounded passes will
 * render multiple memberships and preserve the resulting configuration in the
 * Timeline's per-dataset session. No browser/server persistence is used here.
 *
 * Stable category identity is the serialized [fieldKey, exact source value]
 * tuple. Never key categories by editable display names, symbols, list positions,
 * or colors. This matters for multi-valued Evidence and future project files.
 */

export const TIMELINE_CATEGORY_CONFIG_VERSION = 1;
export const TIMELINE_UNCATEGORIZED_COLOR = '#3B3B3B';
export const TIMELINE_CATEGORY_COLORS = Object.freeze([
  '#A63D2B', '#7C211E', '#B17B2C', '#D7A23D',
  '#6C6A2D', '#7C8A6B', '#2E3D8C', '#3C7A7A',
  '#2F6C8F', '#5E3B8C', '#5A3C2E',
]);
// Charcoal is reserved for uncategorized marks by default, but a researcher
// may explicitly select it as a category color in the future editor.
export const TIMELINE_CATEGORY_DISPLAY_MODES = Object.freeze(['colors', 'colors-and-symbols', 'expanded']);

const own = (object, key) => Object.prototype.hasOwnProperty.call(object || {}, key);
const list = (value) => Array.isArray(value) ? value : [];
const text = (value) => String(value ?? '').trim();

export function timelineCategoryIdentity(fieldKey, value) {
  const key = text(fieldKey);
  const sourceValue = String(value ?? '');
  if (!key || !sourceValue.trim()) return '';
  return JSON.stringify([key, sourceValue]);
}

function validColor(value) {
  return typeof value === 'string' && /^#[0-9a-fA-F]{6}$/.test(value);
}

// FNV-1a produces a stable default color without reshuffling the entire
// dataset when new categories appear. The palette is not a uniqueness limit.
function defaultColor(identity) {
  let hash = 2166136261;
  for (let index = 0; index < identity.length; index += 1) {
    hash ^= identity.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return TIMELINE_CATEGORY_COLORS[(hash >>> 0) % TIMELINE_CATEGORY_COLORS.length];
}

export function createTimelineCategoryConfiguration() {
  return {
    version: TIMELINE_CATEGORY_CONFIG_VERSION,
    // The researcher selects a field, then either all its distinct values or
    // an explicit subset. A field absent here is not an active category source.
    fields: [],
    // Explicit per-source association semantics; these never alter canonical data.
    fieldScopes: {},
    // Keyed by stable field/value identity. Overrides are not evidence edits.
    overrides: {},
    // Optional order for deterministic primary-category selection in Grouped.
    priority: [],
    primaryFieldKey: null,
    // null preserves the existing all-category priority until stars are edited.
    // [] explicitly means no categories are eligible for swimlanes.
    starredCategoryIds: null,
    eventPrimaryOverrides: {},
    displayMode: 'colors-and-symbols',
  };
}

function availableInventory(fields) {
  const inventory = new Map();
  list(fields).forEach((field) => {
    const key = text(field?.key);
    if (!key || inventory.has(key)) return;
    const values = new Map();
    list(field?.values).forEach((entry) => {
      const value = String(entry?.value ?? '');
      if (value.trim() && !values.has(value)) values.set(value, entry);
    });
    inventory.set(key, { field, values });
  });
  return inventory;
}

/**
 * Normalize a configuration against the complete (unfiltered) dataset's
 * category inventory. Discard unavailable field/value selections to prevent
 * category controls from leaking into a newly uploaded dataset. Callers must
 * also scope stored state by dataset identity; identical field/value text does
 * not prove two datasets are the same research project.
 *
 * This does not infer a selection: the default is no active categories.
 */
export function reconcileTimelineCategoryConfiguration(configuration, availableFields = []) {
  const source = configuration && typeof configuration === 'object' ? configuration : {};
  const inventory = availableInventory(availableFields);
  const fields = [];
  const fieldKeys = new Set();

  list(source.fields).forEach((entry) => {
    const key = text(entry?.key);
    if (!inventory.has(key) || fieldKeys.has(key)) return;
    fieldKeys.add(key);
    const mode = entry?.mode === 'selected' ? 'selected' : 'all';
    const candidates = inventory.get(key).values;
    const values = [...new Set(list(entry?.values).map((value) => String(value ?? '')))]
      .filter((value) => candidates.has(value));
    fields.push({ key, mode, values: mode === 'selected' ? values : [] });
  });

  const activeIdentities = new Set();
  fields.forEach((entry) => {
    const values = entry.mode === 'all'
      ? [...inventory.get(entry.key).values.keys()]
      : entry.values;
    values.forEach((value) => activeIdentities.add(timelineCategoryIdentity(entry.key, value)));
  });

  const fieldScopes = {};
  for (const entry of fields) {
    const inventoryField = inventory.get(entry.key)?.field;
    const requested = inventoryField?.associationScopes || ['record'];
    const fallback = inventoryField?.defaultAssociationScope || 'record';
    fieldScopes[entry.key] = requested.includes(source.fieldScopes?.[entry.key])
      ? source.fieldScopes[entry.key] : fallback;
  }
  const overrides = {};
  for (const id of activeIdentities) {
    const entry = source.overrides?.[id];
    if (!entry || typeof entry !== 'object') continue;
    const normalized = {};
    if (typeof entry.label === 'string' && entry.label.trim()) normalized.label = entry.label.trim();
    if (validColor(entry.color)) normalized.color = entry.color;
    if (typeof entry.symbol === 'string' && entry.symbol.trim()) normalized.symbol = entry.symbol.trim();
    // An empty override has no meaning; do not retain arbitrary unknown props.
    if (Object.keys(normalized).length) overrides[id] = normalized;
  }

  const ordered = [...new Set(list(source.priority).filter((id) => activeIdentities.has(id)))];
  // Default priority is alphabetical by source field/value, independent of
  // custom label, so display-name edits never move an event's Grouped lane.
  const remaining = [...activeIdentities].filter((id) => !ordered.includes(id))
    .sort((a, b) => a.localeCompare(b));
  const primaryFieldKey = fields.some(entry=>entry.key===source.primaryFieldKey) ? source.primaryFieldKey : null;
  const starredCategoryIds = Array.isArray(source.starredCategoryIds)
    ? [...new Set(source.starredCategoryIds.filter(id=>activeIdentities.has(id)))] : null;
  // Overrides reference only stable event IDs and currently tracked category IDs.
  // Event membership is checked again at resolution time, so an override can
  // never create an unsupported historical association.
  const eventPrimaryOverrides = {};
  if (source.eventPrimaryOverrides && typeof source.eventPrimaryOverrides==='object') {
    for (const [eventId,categoryId] of Object.entries(source.eventPrimaryOverrides)) {
      if (eventId && activeIdentities.has(categoryId)) eventPrimaryOverrides[eventId]=categoryId;
    }
  }
  return {
    version: TIMELINE_CATEGORY_CONFIG_VERSION,
    fields,
    fieldScopes,
    primaryFieldKey,
    starredCategoryIds,
    eventPrimaryOverrides,
    overrides,
    priority: [...ordered, ...remaining],
    displayMode: TIMELINE_CATEGORY_DISPLAY_MODES.includes(source.displayMode)
      ? source.displayMode : 'colors-and-symbols',
  };
}

/**
 * Apply a single researcher action; selectors must never modify the source.
 * Passing [] for values intentionally selects none, not all. Reconcile after
 * applying the change to discard stale values and normalize priority.
 */
export function configureTimelineCategoryField(configuration, availableFields, fieldKey, mode = 'all', values = []) {
  const current = reconcileTimelineCategoryConfiguration(configuration, availableFields);
  const key = text(fieldKey);
  const next = {
    ...current,
    fields: current.fields.filter((field) => field.key !== key),
  };
  if (availableInventory(availableFields).has(key)) {
    next.fields.push({key, mode: mode === 'selected' ? 'selected' : 'all', values: [...list(values)]});
  }
  return reconcileTimelineCategoryConfiguration(next, availableFields);
}

export function removeTimelineCategoryField(configuration, availableFields, fieldKey) {
  const current = reconcileTimelineCategoryConfiguration(configuration, availableFields);
  return reconcileTimelineCategoryConfiguration({
    ...current,
    fields: current.fields.filter((field) => field.key !== text(fieldKey)),
  }, availableFields);
}

export function configureTimelineCategoryAppearance(configuration, availableFields, categoryId, appearance = {}) {
  const current = reconcileTimelineCategoryConfiguration(configuration, availableFields);
  if (!current.priority.includes(categoryId)) return current;
  const previous = current.overrides[categoryId] || {};
  const override = {...previous};
  if (own(appearance, 'label')) {
    if (typeof appearance.label === 'string' && appearance.label.trim()) override.label = appearance.label.trim();
    else delete override.label;
  }
  if (own(appearance, 'color')) {
    if (validColor(appearance.color)) override.color = appearance.color;
    else if (appearance.color === null || appearance.color === '') delete override.color;
  }
  if (own(appearance, 'symbol')) {
    // 'none' explicitly disables category symbols; symbol names are validated
    // against the final curated library in the UI layer in Pass 2.
    if (typeof appearance.symbol === 'string' && appearance.symbol.trim()) override.symbol = appearance.symbol.trim();
    else delete override.symbol;
  }
  return reconcileTimelineCategoryConfiguration({
    ...current,
    overrides: {...current.overrides, [categoryId]: override},
  }, availableFields);
}

export function configureTimelineCategoryPriority(configuration, availableFields, orderedIds) {
  const current = reconcileTimelineCategoryConfiguration(configuration, availableFields);
  return reconcileTimelineCategoryConfiguration({...current, priority: list(orderedIds)}, availableFields);
}


/** Select only a supported, explicit association scope for an active field. */
export function configureTimelineCategoryFieldScope(configuration, availableFields, fieldKey, scope) {
  const current = reconcileTimelineCategoryConfiguration(configuration, availableFields);
  const field = list(availableFields).find((item) => item?.key === fieldKey);
  if (!current.fields.some((item) => item.key === fieldKey) || !field) return current;
  const scopes = list(field.associationScopes);
  if (!scopes.includes(scope)) return current;
  return reconcileTimelineCategoryConfiguration({
    ...current, fieldScopes: {...current.fieldScopes, [fieldKey]:scope},
  }, availableFields);
}

/**
 * Resolve active categories and event memberships for the eventual renderer.
 * All event records are returned, including those with no active category;
 * category selection is NEVER a filtering operation. Grouped mode can use
 * primaryCategoryId, while Chronological mode can use every membership.
 */
export function resolveTimelineCategories(events = [], availableFields = [], configuration = null) {
  const config = reconcileTimelineCategoryConfiguration(configuration, availableFields);
  const inventory = availableInventory(availableFields);
  const membershipById = new Map();
  for (const entry of config.fields) {
    const field = inventory.get(entry.key);
    const values = entry.mode === 'all' ? [...field.values.keys()] : entry.values;
    for (const value of values) {
      const id = timelineCategoryIdentity(entry.key, value);
      const override = config.overrides[id] || {};
      membershipById.set(id, Object.freeze({
        id, fieldKey: entry.key, sourceValue: value,
        sourceLabel: text(field.field.label) || entry.key,
        label: override.label || value,
        color: override.color || defaultColor(id),
        symbol: override.symbol || 'none',
      }));
    }
  }
  const categoryOrder = config.priority.filter((id) => membershipById.has(id));
  const starredIds = new Set(config.starredCategoryIds === null ? categoryOrder : config.starredCategoryIds);
  const priorityIndex = new Map(categoryOrder.map((id, index) => [id, index]));
  const categories = Object.freeze(categoryOrder.map((id) => membershipById.get(id)));
  const eventCategories = Object.freeze(list(events).map((event) => {
    const ids = [...new Set(list(event?.categoryMemberships).map((member) =>
      timelineCategoryIdentity(member?.fieldKey, member?.value)))].filter((id) => membershipById.has(id));
    ids.sort((a, b) => priorityIndex.get(a) - priorityIndex.get(b));
    return Object.freeze({
      eventId: event?.id,
      categoryIds: Object.freeze(ids),
      primaryCategoryId: (ids.includes(config.eventPrimaryOverrides[String(event?.id)])
        && starredIds.has(config.eventPrimaryOverrides[String(event?.id)])
        ? config.eventPrimaryOverrides[String(event?.id)]
        : (ids.find(id=>starredIds.has(id)) || null)),
      uncategorized: ids.length === 0,
    });
  }));
  return Object.freeze({config, categories, eventCategories, starredCategoryIds: Object.freeze(categoryOrder.filter(id=>starredIds.has(id)))});
}

/** Category stars define eligible swimlanes, independent of visual memberships. */
export function configureTimelineStarredCategories(configuration,availableFields,categoryIds) {
  const current=reconcileTimelineCategoryConfiguration(configuration,availableFields);
  const eligible=new Set(current.priority);
  const starredCategoryIds=[...new Set(list(categoryIds).filter(id=>eligible.has(id)))];
  return reconcileTimelineCategoryConfiguration({...current,starredCategoryIds,primaryFieldKey:null},availableFields);
}

/** Backwards-compatible field selection converts the old field-based choice
 * into explicit starred categories; spatial assignment remains membership-based. */
export function configureTimelinePrimaryField(configuration,availableFields,fieldKey) {
  const current=reconcileTimelineCategoryConfiguration(configuration,availableFields);
  const value=current.fields.some(field=>field.key===fieldKey) ? fieldKey : null;
  const starredCategoryIds=value ? current.priority.filter(id=>JSON.parse(id)[0]===value) : null;
  return reconcileTimelineCategoryConfiguration({...current,primaryFieldKey:value,starredCategoryIds},availableFields);
}

/** An event override is permitted only for a category already attached to it. */
export function configureTimelineEventPrimary(configuration,availableFields,events,eventId,categoryId) {
  const current=reconcileTimelineCategoryConfiguration(configuration,availableFields);
  const row=resolveTimelineCategories(events,availableFields,current).eventCategories
    .find(entry=>String(entry.eventId)===String(eventId));
  if(!row) return current;
  const eligible=new Set(current.starredCategoryIds === null ? current.priority : current.starredCategoryIds);
  if(categoryId && (!row.categoryIds.includes(categoryId) || !eligible.has(categoryId))) return current;
  const next={...current.eventPrimaryOverrides};
  if(categoryId) next[String(eventId)]=categoryId;
  else delete next[String(eventId)];
  return reconcileTimelineCategoryConfiguration({...current,eventPrimaryOverrides:next},availableFields);
}
