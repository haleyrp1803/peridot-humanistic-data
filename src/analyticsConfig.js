export const ANALYTICS_CHART_DEFINITIONS = {
  bar: {
    key: 'bar',
    label: 'Bar chart',
    descriptor: 'Ranked categorical comparison',
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
    exampleQuestions: [
      'How does correspondence volume change by year?',
      'When does a relationship become active?',
    ],
  },
  stackedBar: {
    key: 'stackedBar',
    label: 'Stacked bar chart',
    descriptor: 'Compare categories across time or groups',
    exampleQuestions: [
      'How do yearly letter totals break down by sender?',
      'Which languages or relationships dominate different periods?',
    ],
  },
  multiLine: {
    key: 'multiLine',
    label: 'Multi-line chart',
    descriptor: 'Compare several trends over time',
    exampleQuestions: [
      'How do different correspondents change over time?',
      'Which places become more or less active across years?',
    ],
  },
  pie: {
    key: 'pie',
    label: 'Pie chart',
    descriptor: 'Limited part-to-whole summaries',
    exampleQuestions: [
      'What share of letters are in each language?',
      'What share of letters belongs to each relationship type?',
    ],
  },
  heatmap: {
    key: 'heatmap',
    label: 'Heat map',
    descriptor: 'Matrix comparison between two categorical fields',
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
