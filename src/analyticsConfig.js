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
    variableSummary: 'Uses 1 variable: year. Metric is fixed to letter count.',
    variableCountLabel: '1 variable',
    defaultUseCase: 'Best default: Year, to show overall correspondence volume over time.',
    exampleQuestions: [
      'How does correspondence volume change by year?',
      'When does a relationship become active?',
    ],
  },
  stackedBar: {
    key: 'stackedBar',
    label: 'Stacked bar chart',
    descriptor: 'Compare categories across time or groups',
    variableSummary: 'Uses 2 variables: year plus a selectable segment field. Metric is fixed to letter count.',
    variableCountLabel: '2 variables',
    defaultUseCase: 'Best default: Year split by source person, to compare major correspondents across time.',
    exampleQuestions: [
      'How do yearly letter totals break down by sender?',
      'Which languages or relationships dominate different periods?',
    ],
  },
  multiLine: {
    key: 'multiLine',
    label: 'Multi-line chart',
    descriptor: 'Compare several trends over time',
    variableSummary: 'Uses 2 variables: year plus a selectable line grouping. Metric is fixed to letter count.',
    variableCountLabel: '2 variables',
    defaultUseCase: 'Best default: Year with one line per source person, to compare correspondence trends.',
    exampleQuestions: [
      'How do different correspondents change over time?',
      'Which places become more or less active across years?',
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
