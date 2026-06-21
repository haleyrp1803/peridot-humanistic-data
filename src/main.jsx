/*
 * React entry point.
 *
 * This file mounts the Peridot app into the DOM. It should remain minimal: import global CSS, import `App`, and render inside React Strict Mode.
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

// Inspector styling follows the shared layer so the same compact/full dossier
// system can serve map overlays, the full workspace, and Explore embeds.
import './InspectorPanel.css';

// Analytics styling is intentionally loaded as a dedicated component layer.
// This import restores the stylesheet extracted at the Analytics milestone.
import './AnalyticsPanel.css';

// Search styling remains after the shared stylesheet. It contains the ordered
// Search scroll, clipping, responsive, and animation cascade formerly in index.css.
import './PeridotSearchWorkspace.css';

// Mapping styling remains after Search so its former late-cascade overrides
// keep their precedence over shared primitives and other workspace rules.
import './PeridotColumnMappingModal.css';

// Learn More styling remains loaded after the shared stylesheet on purpose.
// Its extracted rules formerly occupied the final `index.css` cascade layer.
import './PeridotLearnMoreWorkspace.css';
import { applyPeridotThemeVariables } from './peridotTheme.js';
import { applyPeridotColorVariables } from './peridotColorPalette.js';

applyPeridotThemeVariables();
applyPeridotColorVariables();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
