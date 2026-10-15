/*
 * React entry point.
 *
 * This file mounts the Peridot app into the DOM. It should remain minimal:
 * import the shared stylesheet plus extracted component/workspace layers in their
 * deliberate cascade order, import `App`, and render inside React Strict Mode.
 *
 * Stylesheet order is a functional contract:
 * shared rules -> non-color foundations -> shared components (buttons, forms, cards) -> Inspector -> Analytics -> Search ->
 * Mapping -> Learn More -> Tutorial -> global feedback modal. Do not remove an extracted stylesheet import when
 * adding a later layer; omitted imports can make an entire workspace fall back
 * to bare structural markup.
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';

import './index.css';
// Central non-color foundations; existing workspace styles retain cascade precedence.
import './styles/foundations/tokens.css';
// Shared buttons follow foundations and precede workspace-specific overrides.
import './styles/components/buttons.css';
// Shared form controls; workspace-specific forms continue to override these.
import './styles/components/forms.css';
// Shared cards and responsive card grids; specialized panels retain workspace ownership.
import './styles/components/cards.css';
import './InspectorPanel.css';
import './AnalyticsPanel.css';
import './PeridotSearchWorkspace.css';
import './PeridotColumnMappingModal.css';
import './PeridotLearnMoreWorkspace.css';
import './PeridotTutorial.css';
import './PeridotFeedbackForm.css';

import { applyPeridotThemeVariables } from './peridotTheme.js';
import { applyPeridotColorVariables } from './peridotColorPalette.js';

applyPeridotThemeVariables();
applyPeridotColorVariables();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
