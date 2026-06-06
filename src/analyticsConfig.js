export const ANALYTICS_CHART_DEFINITIONS = {
  bar: {
    key: 'bar',
    label: 'Bar Chart',
    descriptor: 'Categorical comparison',
    variableSummary: 'Choose an x/category column, then chart record count or an aggregated numeric column.',
    variableCountLabel: 'x + metric',
    defaultUseCase: 'Good for ranking categories, record types, people, places, departments, or any grouped field.',
    exampleQuestions: [
      'Which categories appear most often?',
      'Which departments have the largest average value?',
      'Which people, places, or record types dominate the data?',
    ],
  },
  groupedBar: {
    key: 'groupedBar',
    label: 'Grouped Bar Chart',
    descriptor: 'Compare grouped categories side by side',
    variableSummary: 'Choose an x/category column, a grouping column, and either record count or an aggregated numeric metric.',
    variableCountLabel: 'x + group + metric',
    defaultUseCase: 'Good for comparing categories within repeated groups, such as department by status or year by company.',
    exampleQuestions: [
      'How do groups compare within each category?',
      'Which categories vary most by type, place, department, or person?',
    ],
  },
  stackedBar: {
    key: 'stackedBar',
    label: 'Stacked Bar Chart',
    descriptor: 'Part-to-whole comparison across categories',
    variableSummary: 'Choose an x/category column, a segment column, and either record count or an aggregated numeric metric.',
    variableCountLabel: 'x + segment + metric',
    defaultUseCase: 'Good for showing how each category breaks down into subcategories.',
    exampleQuestions: [
      'What makes up each category total?',
      'How does a broad group break down by language, status, type, or department?',
    ],
  },
  line: {
    key: 'line',
    label: 'Line Chart',
    descriptor: 'One trend over an ordered x-axis',
    variableSummary: 'Choose a date, year, period, or numeric x-axis and a y-axis metric.',
    variableCountLabel: 'x + y',
    defaultUseCase: 'Good for one numeric measure or record count over time.',
    exampleQuestions: [
      'How does this measure change over time?',
      'When does activity rise or fall?',
    ],
  },
  multiLine: {
    key: 'multiLine',
    label: 'Multi-Line Chart',
    descriptor: 'Several trends on the same x-axis',
    variableSummary: 'Choose an x-axis and either several numeric y columns or one y column split by a series field.',
    variableCountLabel: 'x + series',
    defaultUseCase: 'Good for comparing several numeric series over time, such as stock-price columns.',
    exampleQuestions: [
      'How do several measures change over the same dates?',
      'Which series rises or falls most sharply?',
    ],
  },
  histogram: {
    key: 'histogram',
    label: 'Histogram',
    descriptor: 'Distribution of numeric values',
    variableSummary: 'Choose one numeric value column to bin.',
    variableCountLabel: 'value',
    defaultUseCase: 'Good for seeing the distribution of prices, magnitudes, counts, durations, or other numeric fields.',
    exampleQuestions: [
      'Are values clustered high or low?',
      'Does this field have a long tail or a narrow range?',
    ],
  },
  pie: {
    key: 'pie',
    label: 'Pie Chart',
    descriptor: 'Limited part-to-whole summary',
    variableSummary: 'Choose a slice/category column, then chart record count or an aggregated numeric metric.',
    variableCountLabel: 'category + metric',
    defaultUseCase: 'Good for compact shares when there are only a few categories.',
    exampleQuestions: [
      'What share belongs to each category?',
      'Which few groups make up the whole?',
    ],
  },
  sunburst: {
    key: 'sunburst',
    label: 'Sunburst Chart',
    descriptor: 'Hierarchical part-to-whole summary',
    variableSummary: 'Choose parent and child category columns.',
    variableCountLabel: 'parent + child',
    defaultUseCase: 'Good for nested categories, such as place → person or department → reason.',
    exampleQuestions: [
      'How does a broad category break into smaller categories?',
      'Which nested groups account for the most records?',
    ],
  },
  heatmap: {
    key: 'heatmap',
    label: 'Heatmap',
    descriptor: 'Matrix comparison between two fields',
    variableSummary: 'Choose row and column fields, then chart record count or an aggregated numeric metric.',
    variableCountLabel: 'row + column + metric',
    defaultUseCase: 'Good for seeing which field combinations are most common or most intense.',
    exampleQuestions: [
      'Which pairings dominate the data?',
      'Where are combinations sparse or dense?',
    ],
  },
};

export const ANALYTICS_TOP_N_OPTIONS = [1, 2, 3, 4, 5, 10, 15, 20];

export const ANALYTICS_AGGREGATION_OPTIONS = [
  { key: 'count', label: 'Record count' },
  { key: 'sum', label: 'Sum' },
  { key: 'average', label: 'Average' },
  { key: 'min', label: 'Minimum' },
  { key: 'max', label: 'Maximum' },
];

export const DEFAULT_ANALYTICS_STATE = {
  chartType: 'bar',
  barGroupBy: 'sourcePerson',
  topN: 10,
};

export const ANALYTICS_BAR_FIELD_DEFINITIONS = [
  { key: 'sourcePerson', label: 'Source person', description: 'Records grouped by source/sender.', requiredFields: ['sourcePerson'], aliases: ['source person', 'source_person', 'sender', 'source', 'from'] },
  { key: 'targetPerson', label: 'Target person', description: 'Records grouped by target/recipient.', requiredFields: ['targetPerson'], aliases: ['target person', 'target_person', 'recipient', 'target', 'to'] },
  { key: 'sourceLoc', label: 'Source place', description: 'Records grouped by source/origin place.', requiredFields: ['sourceLoc'], aliases: ['source loc', 'source_loc', 'source place', 'source_place', 'origin place', 'origin'] },
  { key: 'targetLoc', label: 'Target place', description: 'Records grouped by target/destination place.', requiredFields: ['targetLoc'], aliases: ['target loc', 'target_loc', 'target place', 'target_place', 'destination place', 'destination'] },
  { key: 'routePlace', label: 'Route (Place)', description: 'Records grouped by source-place to target-place route.', requiredFields: ['sourceLoc', 'targetLoc'] },
  { key: 'routePerson', label: 'Route (Person)', description: 'Records grouped by source-entity to target-entity route.', requiredFields: ['sourcePerson', 'targetPerson'] },
  { key: 'language', label: 'Language', description: 'Records grouped by language metadata.', requiredFields: ['language'], aliases: ['language', 'lang'] },
  { key: 'relationship', label: 'Relationship', description: 'Records grouped by relationship metadata.', requiredFields: ['relationship'], aliases: ['relationship', 'relation', 'relationship type'] },
  { key: 'archivalCollection', label: 'Archival collection', description: 'Records grouped by archival collection.', requiredFields: ['archivalCollection'], aliases: ['archival collection', 'archive', 'collection', 'repository'] },
];

export const ANALYTICS_SEGMENT_FIELD_DEFINITIONS = ANALYTICS_BAR_FIELD_DEFINITIONS.filter(
  (field) => field.key !== 'routePlace' && field.key !== 'routePerson'
);

export const ANALYTICS_HEATMAP_FIELD_DEFINITIONS = [
  { key: 'sourcePerson', label: 'Source person', description: 'Rows or columns keyed to source/sender.', requiredFields: ['sourcePerson'], aliases: ['source person', 'source_person', 'sender', 'source', 'from'] },
  { key: 'targetPerson', label: 'Target person', description: 'Rows or columns keyed to target/recipient.', requiredFields: ['targetPerson'], aliases: ['target person', 'target_person', 'recipient', 'target', 'to'] },
  { key: 'sourceLoc', label: 'Source place', description: 'Rows or columns keyed to source place.', requiredFields: ['sourceLoc'], aliases: ['source loc', 'source_loc', 'source place', 'source_place', 'origin place', 'origin'] },
  { key: 'targetLoc', label: 'Target place', description: 'Rows or columns keyed to target place.', requiredFields: ['targetLoc'], aliases: ['target loc', 'target_loc', 'target place', 'target_place', 'destination place', 'destination'] },
];

export function getAnalyticsChartDefinition(chartType) {
  return ANALYTICS_CHART_DEFINITIONS[chartType] || ANALYTICS_CHART_DEFINITIONS.bar;
}
