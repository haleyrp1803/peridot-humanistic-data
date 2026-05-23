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

export function getAnalyticsChartDefinition(chartType) {
  return ANALYTICS_CHART_DEFINITIONS[chartType] || ANALYTICS_CHART_DEFINITIONS.bar;
}
