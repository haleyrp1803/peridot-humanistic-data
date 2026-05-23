export const ANALYTICS_CHART_DEFINITIONS = {
  bar: {
    key: 'bar',
    label: 'Bar chart',
    descriptor: 'Ranked categorical comparison',
    variableSummary: 'Uses 1 selectable variable: the category to rank. Metric is fixed to letter count.',
    variableCountLabel: '1 variable',
    defaultUseCase: 'Best default: Source person, to rank correspondents by letters sent.',
    exampleQuestions: [
      'Who sent the most letters?',
      'Which routes are most active?',
      'Which places appear most often?',
    ],
  },
  line: {
    key: 'line',
    label: 'Line chart',
    descriptor: 'Change over time',
    variableSummary: 'Uses 1 variable: time period. Metric is fixed to letter count.',
    variableCountLabel: '1 variable',
    defaultUseCase: 'Best default: Time period, to show overall correspondence volume over time.',
    exampleQuestions: [
      'How does correspondence volume change by year?',
      'When does a relationship become active?',
    ],
  },
  groupedBar: {
    key: 'groupedBar',
    label: 'Grouped bar chart',
    descriptor: 'Compare category groups side by side across time',
    variableSummary: 'Uses 2 variables: time period plus a selectable group field. Metric is fixed to letter count.',
    variableCountLabel: '2 variables',
    defaultUseCase: 'Best default: Time period grouped by source person, to compare major correspondents side by side.',
    exampleQuestions: [
      'Which correspondents are most active in each period?',
      'How do places or people compare within the same time interval?',
    ],
  },
  stackedBar: {
    key: 'stackedBar',
    label: 'Stacked bar chart',
    descriptor: 'Compare categories across time or groups',
    variableSummary: 'Uses 2 variables: time period plus a selectable segment field. Metric is fixed to letter count.',
    variableCountLabel: '2 variables',
    defaultUseCase: 'Best default: Time period split by source person, to compare major correspondents across time.',
    exampleQuestions: [
      'How do period totals break down by sender?',
      'Which languages or relationships dominate different periods?',
    ],
  },
  multiLine: {
    key: 'multiLine',
    label: 'Multi-line chart',
    descriptor: 'Compare several trends over time',
    variableSummary: 'Uses 2 variables: time period plus a selectable line grouping. Metric is fixed to letter count.',
    variableCountLabel: '2 variables',
    defaultUseCase: 'Best default: Time period with one line per source person, to compare correspondence trends.',
    exampleQuestions: [
      'How do different correspondents change over time?',
      'Which places become more or less active across periods?',
    ],
  },
  pie: {
    key: 'pie',
    label: 'Pie chart',
    descriptor: 'Limited part-to-whole summaries',
    variableSummary: 'Uses 1 selectable variable: the category used for slices. Metric is fixed to letter count.',
    variableCountLabel: '1 variable',
    defaultUseCase: 'Best default: Language or relationship, to show a compact share of the whole.',
    exampleQuestions: [
      'What share of letters are in each language?',
      'What share of letters belongs to each relationship type?',
    ],
  },
  histogram: {
    key: 'histogram',
    label: 'Histogram',
    descriptor: 'Distribution of values',
    variableSummary: 'Uses 1 selectable variable: the entity whose correspondence-volume distribution is counted.',
    variableCountLabel: '1 variable',
    defaultUseCase: 'Best default: Source person, to show how many senders have low, medium, or high letter volume.',
    exampleQuestions: [
      'How many correspondents have only a few letters?',
      'Is the dataset dominated by a small number of high-volume people?',
    ],
  },
  heatmap: {
    key: 'heatmap',
    label: 'Heat map',
    descriptor: 'Matrix comparison between two categorical fields',
    variableSummary: 'Uses 2 selectable variables: rows and columns. Cell intensity is fixed to letter count.',
    variableCountLabel: '2 variables',
    defaultUseCase: 'Best default: Source person × target person, to identify dominant correspondence pairs.',
    exampleQuestions: [
      'Which sender-recipient pairs dominate the network?',
      'Which source and target places are most connected?',
    ],
  },
  sunburst: {
    key: 'sunburst',
    label: 'Sunburst chart',
    descriptor: 'Hierarchical part-to-whole summaries',
    variableSummary: 'Uses 2 selectable variables: an inner-ring parent category and an outer-ring child category.',
    variableCountLabel: '2 variables',
    defaultUseCase: 'Best default: Source place → source person, to show where correspondence volume concentrates and who contributes to it.',
    exampleQuestions: [
      'Which places dominate the dataset, and which people account for that volume?',
      'How does a broad category break down into smaller contributing categories?',
    ],
  },
};

export const ANALYTICS_TOP_N_OPTIONS = [5, 10, 20];

export const DEFAULT_ANALYTICS_STATE = {
  chartType: 'bar',
  barGroupBy: 'sourcePerson',
  topN: 10,
};

export const ANALYTICS_BAR_FIELD_DEFINITIONS = [
  {
    key: 'sourcePerson',
    label: 'Source person',
    description: 'Letters grouped by sender.',
    requiredFields: ['sourcePerson'],
  },
  {
    key: 'targetPerson',
    label: 'Target person',
    description: 'Letters grouped by recipient.',
    requiredFields: ['targetPerson'],
  },
  {
    key: 'sourceLoc',
    label: 'Source place',
    description: 'Letters grouped by place of origin.',
    requiredFields: ['sourceLoc'],
  },
  {
    key: 'targetLoc',
    label: 'Target place',
    description: 'Letters grouped by destination or inferred target place.',
    requiredFields: ['targetLoc'],
  },
  {
    key: 'route',
    label: 'Route',
    description: 'Letters grouped by source-to-target route.',
    requiredFields: ['sourceLoc', 'targetLoc'],
  },
  {
    key: 'language',
    label: 'Language',
    description: 'Letters grouped by language metadata.',
    requiredFields: ['language'],
  },
  {
    key: 'relationship',
    label: 'Relationship',
    description: 'Letters grouped by relationship metadata.',
    requiredFields: ['relationship'],
  },
  {
    key: 'archivalCollection',
    label: 'Archival collection',
    description: 'Letters grouped by archival collection.',
    requiredFields: ['archivalCollection'],
  },
];

export const ANALYTICS_SEGMENT_FIELD_DEFINITIONS = ANALYTICS_BAR_FIELD_DEFINITIONS.filter(
  (field) => field.key !== 'route'
);

export const ANALYTICS_HEATMAP_FIELD_DEFINITIONS = [
  {
    key: 'sourcePerson',
    label: 'Source person',
    description: 'Rows or columns keyed to sender.',
    requiredFields: ['sourcePerson'],
  },
  {
    key: 'targetPerson',
    label: 'Target person',
    description: 'Rows or columns keyed to recipient.',
    requiredFields: ['targetPerson'],
  },
  {
    key: 'sourceLoc',
    label: 'Source place',
    description: 'Rows or columns keyed to source place.',
    requiredFields: ['sourceLoc'],
  },
  {
    key: 'targetLoc',
    label: 'Target place',
    description: 'Rows or columns keyed to target place.',
    requiredFields: ['targetLoc'],
  },
];

export function getAnalyticsChartDefinition(chartType) {
  return ANALYTICS_CHART_DEFINITIONS[chartType] || ANALYTICS_CHART_DEFINITIONS.bar;
}
