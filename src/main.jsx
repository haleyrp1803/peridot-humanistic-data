/*
 * React entry point.
 *
 * This file mounts the Peridot app into the DOM. It should remain minimal:
 * import the shared stylesheet plus extracted component/workspace layers in their
 * deliberate cascade order, import `App`, and render inside React Strict Mode.
 *
 * Stylesheet order is a functional contract:
 * shared rules -> Inspector -> Analytics -> Search -> Mapping -> Learn More ->
 * global feedback modal. Do not remove an extracted stylesheet import when
 * adding a later layer; omitted imports can make an entire workspace fall back
 * to bare structural markup.
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';

import './index.css';
import './InspectorPanel.css';
import './AnalyticsPanel.css';
import './PeridotSearchWorkspace.css';
import './PeridotColumnMappingModal.css';
import './PeridotLearnMoreWorkspace.css';
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
