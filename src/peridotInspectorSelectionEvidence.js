/*
 * Peridot Inspector: selection-evidence presentation contract (Pass A).
 *
 * Pure, read-only interpretation of evidence already supplied by a selection.
 * Three independently scoped outputs: representation, support, context.
 * No historical inference, normalization of source values, or new record joins.
 *
 * Crucial: presence of entity-related records does not prove that they produced
 * the selected visualization mark. Missing mark provenance stays unavailable.
 * Chart marks are verified only when the chart derivation supplies its contribution contract.
 */

import { describePeridotTimelineMark } from './peridotInspectorTimelinePresentation.js';

const text = (value) => String(value ?? '').trim();
const array = (value) => Array.isArray(value) ? value : [];
const finiteCount = (value) => Number.isFinite(value) && value >= 0 ? value : null;

const evidenceScope = {
  MARK: 'selected-mark',
  ENTITY: 'related-object',
  UNKNOWN: 'unverified',
};

function markReasonsForAnchor(selection) {
  return array(selection?.anchorReasons).flatMap((reason) => {
    if (reason?.type === 'place-role' && text(reason.role)) {
      return [{ kind: 'mapped-role', label: text(reason.role), origin: 'researcher-mapping' }];
    }
    if (reason?.type === 'most-frequent-place') {
      return [{ kind: 'derived-anchor', label: 'Most frequent place', origin: 'peridot-calculation', tied: Boolean(reason.tied) }];
    }
    return [];
  });
}

function baseContract(selection, kind, viewMode) {
  return {
    version: 1,
    kind,
    viewMode: text(viewMode),
    representation: { label: text(selection?.detailLabel || selection?.label), rule: null, markType: 'unknown', details: [] },
    support: { scope: evidenceScope.UNKNOWN, status: 'not-provided', records: [], recordCount: null, assertions: [], explanation: 'The selection does not yet provide verified mark-level record provenance.' },
    context: { scope: evidenceScope.ENTITY, status: 'not-supplied', records: [], recordCount: null, explanation: 'Additional evidence is associated with the underlying object; it is not necessarily evidence producing the mark.' },
  };
}

/**
 * Read-only provenance for a selected node in the displayed force Network.
 * Exact node IDs take precedence: a matching name alone is not proof that an
 * edge belongs to the selected node. The graph's current edges already reflect
 * the active Network/chronology scope. Unlike related entity records, these
 * incident edges are the visual connections which construct this mark.
 */
export function collectPeridotNetworkNodeMarkEvidence(graph, selectedNodeId) {
  const nodeId = text(selectedNodeId);
  const node = array(graph?.nodes).find((item) => text(item?.id) === nodeId && !item?.isCluster);
  if (!node || !nodeId) return null;
  const incident = array(graph?.edges).filter((edge) =>
    text(edge?.sourceNodeId) === nodeId || text(edge?.targetNodeId) === nodeId
  );
  const edgeSummaries = incident.map((edge) => ({
    id: text(edge?.id),
    sourceLabel: text(edge?.sourceLabel),
    targetLabel: text(edge?.targetLabel),
    direction: text(edge?.direction),
    relationshipLabel: text(edge?.relationshipLabel || edge?.relationshipType),
    count: finiteCount(edge?.count),
    rows: Array.isArray(edge?.rows) ? edge.rows : Array.isArray(edge?.letterMetadata) ? edge.letterMetadata : null,
  }));
  const recordKeys = new Set();
  const recordRefs = new Set();
  const records = [];
  edgeSummaries.forEach((edge) => array(edge.rows).forEach((row) => {
    if (!row) return;
    const key = text(row.id || row.recordId || row.sourceRowId);
    if (key ? recordKeys.has(key) : recordRefs.has(row)) return;
    if (key) recordKeys.add(key); else recordRefs.add(row);
    records.push(row);
  }));
  return {
    edges: edgeSummaries,
    records,
    complete: edgeSummaries.every((edge) => edge.rows !== null),
    edgeCount: edgeSummaries.length,
    representedWeight: edgeSummaries.every((edge) => edge.count !== null)
      ? edgeSummaries.reduce((sum, edge) => sum + edge.count, 0) : null,
  };
}

/**
 * @param {object} input
 * @param {string} input.selectedKind Inspector routing kind.
 * @param {object} input.selectedProps Resolved selection from App.
 * @param {string} [input.viewMode] Current Map/Network view mode.
 * @param {object[]} [input.relatedRows] Existing entity-related rows, never mark provenance.
 * @returns {{version:number,kind:string,viewMode:string,representation:object,support:object,context:object}}
 */
export function buildPeridotInspectorSelectionEvidence({ selectedKind, selectedProps, viewMode = '', relatedRows = [] } = {}) {
  const selection = selectedProps || {};
  const kind = text(selectedKind || selection.__kind);
  const contract = baseContract(selection, kind, viewMode);
  const contextRows = array(relatedRows);
  if (contextRows.length) {
    contract.context = {
      ...contract.context,
      status: 'provided',
      records: contextRows,
      recordCount: contextRows.length,
    };
  }

  if (kind === 'node' || kind === 'person-detail' || kind === 'place-detail') {
    const isPlace = kind === 'place-detail' || selection.entityType === 'place';
    const isGeographicMark = kind === 'node'
      && text(viewMode) === 'geographic'
      && Boolean(text(selection.anchorLabel))
      && Array.isArray(selection.anchorSourceRowsForMark);
    contract.representation.markType = isPlace ? 'place' : 'entity-node';
    if (isGeographicMark) {
      const reasons = markReasonsForAnchor(selection);
      const records = array(selection.anchorSourceRowsForMark);
      contract.representation = {
        ...contract.representation,
        markType: 'geographic-entity-anchor',
        rule: 'geographic-anchor',
        details: [
          { kind: 'mapped-place', label: 'Mapped place', value: text(selection.anchorLabel), origin: 'source-value' },
          ...reasons.map((reason) => ({ ...reason, value: reason.label })),
        ],
      };
      contract.support = {
        scope: evidenceScope.MARK,
        status: 'verified',
        records,
        recordCount: records.length,
        assertions: reasons,
        explanation: 'These source rows were retained by the Map anchor constructor for this selected geographic mark in the current displayed scope.',
      };
    } else if (kind === 'node' && text(viewMode) === 'person') {
      contract.representation.rule = 'network-node';
      contract.representation.markType = 'network-entity-node';
      const network = selection.networkMarkEvidence;
      if (network && Array.isArray(network.edges)) {
        contract.representation.details = [
          { kind: 'incident-edges', value: network.edgeCount, unit: 'visible connections', origin: 'peridot-calculation' },
          ...(network.representedWeight !== null ? [{ kind: 'weight', value: network.representedWeight, unit: 'relationship occurrences', origin: 'peridot-calculation' }] : []),
        ];
        contract.support = {
          scope: evidenceScope.MARK,
          status: network.complete ? 'verified' : 'partial',
          records: array(network.records),
          recordCount: network.complete ? array(network.records).length : null,
          assertions: network.edges,
          explanation: network.complete
            ? 'The selected Network node is connected by these displayed edges and their contributing rows.'
            : 'The displayed edges are known, but some do not provide row-level provenance; record totals are incomplete.',
        };
      }
    } else {
      contract.representation.rule = 'entity-selection';
    }
    return contract;
  }

  if (kind === 'edge') {
    const records = Array.isArray(selection.letterMetadata) && (selection.letterMetadata.length || selection.count === 0) ? selection.letterMetadata : null;
    contract.representation = {
      ...contract.representation,
      markType: 'relationship-edge',
      rule: 'relationship-aggregation',
      details: [
        { kind: 'source-endpoint', value: text(selection.sourceLabel), origin: 'researcher-mapping' },
        { kind: 'target-endpoint', value: text(selection.targetLabel), origin: 'researcher-mapping' },
        { kind: 'direction', value: text(selection.direction), origin: 'researcher-mapping' },
        ...(finiteCount(selection.count) !== null ? [{ kind: 'weight', value: selection.count, unit: 'relationship occurrences', origin: 'peridot-calculation' }] : []),
      ],
    };
    if (records) {
      contract.support = {
        scope: evidenceScope.MARK,
        status: 'verified', records, recordCount: records.length,
        assertions: [], explanation: 'These rows are supplied as contributing records of the selected edge.',
      };
    }
    return contract;
  }

  if (kind === 'cluster') {
    const members = Array.isArray(selection.memberDetails) ? selection.memberDetails : null;
    contract.representation = {
      ...contract.representation,
      markType: 'visual-cluster', rule: 'display-grouping',
      details: [{ kind: 'member-count', value: finiteCount(selection.memberCount) ?? finiteCount(selection.clusterSize) ?? members?.length ?? null, unit: 'visual nodes', origin: 'peridot-calculation' }],
    };
    contract.support = {
      scope: evidenceScope.MARK,
      status: members ? 'members-only' : 'not-provided', records: [], recordCount: null,
      assertions: members || [],
      explanation: members ? 'These are constituent visual nodes, not verified distinct source records.' : 'Constituent node provenance was not supplied.',
    };
    return contract;
  }

  if (kind === 'timeline-event') {
    const event = selection.event || {};
    const marked = describePeridotTimelineMark(event);
    const row = selection.row || event.row;
    contract.representation = {
      ...contract.representation,
      label: marked.display,
      markType: marked.markKind === 'period' ? 'temporal-period' : 'temporal-point',
      rule: 'mapped-temporal-assertion',
      details: [
        { kind: 'temporal-role', value: marked.role, origin: 'researcher-mapping' },
        { kind: 'source-date', value: marked.source, origin: 'source-value' },
        { kind: 'date-status', value: marked.status, origin: 'peridot-calculation' },
        { kind: 'subject', value: marked.subjectLabel, origin: 'researcher-mapping' },
      ],
    };
    if (row) contract.support = {
      scope: evidenceScope.MARK, status: 'verified', records: [row], recordCount: 1,
      assertions: [event.assertion || {}, ...marked.categories],
      explanation: 'The selected Timeline mark supplies one mapped temporal assertion and its supporting source row. Other fields in that row do not necessarily determine its temporal position.',
    };
    return contract;
  }

  if (kind === 'chart-mark') {
    const calculation = selection.calculation || {};
    contract.representation = {
      ...contract.representation,
      markType: 'analytical-chart-mark',
      rule: 'chart-aggregation',
      details: [
        { kind: 'category', value: text(selection.category || selection.label), origin: 'researcher-mapping' },
        { kind: 'measure-field', value: text(calculation.measureField), origin: 'researcher-mapping' },
        { kind: 'aggregation', value: text(calculation.aggregation), origin: 'peridot-calculation' },
        ...(Number.isFinite(Number(selection.value)) ? [{ kind: 'aggregate-value', value: Number(selection.value), origin: 'peridot-calculation' }] : []),
      ],
    };
    if (Array.isArray(selection.contributingRows) && text(calculation.aggregation)) {
      contract.support = {
        scope: evidenceScope.MARK,
        status: 'verified',
        records: selection.contributingRows,
        recordCount: selection.contributingRows.length,
        assertions: [calculation],
        explanation: 'These source row references were retained during the same aggregation that produced the selected chart mark. The represented value may differ from the number of contributing records.',
      };
    }
    return contract;
  }

  if (kind === 'letter-detail') {
    contract.representation.markType = 'source-record';
    if (selection.letter) contract.support = {
      scope: evidenceScope.MARK, status: 'verified', records: [selection.letter], recordCount: 1,
      assertions: [], explanation: 'The selected object is this source record.',
    };
    return contract;
  }

  // A mark without its own provenance cannot borrow related object records
  // as source contributions or use them to infer a numerator/denominator.
  return contract;
}
