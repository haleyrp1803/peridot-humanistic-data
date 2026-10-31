/*
 * Empty-session navigation guard for research workspaces that require data.
 */

import React from 'react';
import './PeridotEditorialGatewayAnimation.css';

export function PeridotDatasetRequiredWorkspace({
  destination = 'visualize',
  onOpenData,
  onUseSampleData,
}) {
  const isExplore = destination === 'explore';
  // Both no-data workspaces use the same editorial gateway. Only the
  // destination-specific explanation and illustrated rupture differ.
  const description = isExplore
    ? 'To search records and inspect evidence, first upload your research data or choose a prepared sample on the Data page.'
    : 'To explore maps, networks, timelines, and charts, first upload your research data or choose a prepared sample on the Data page.';
  const tear = isExplore
    ? '/assets/divider_tear_celestial.png'
    : '/assets/divider_tear_illuminated.png';

  // Key the rendered root by destination so the shared Visualize/Explore gateway
  // gets fresh animation-bearing DOM when navigating between those two pages.
  // Tutorials uses a separate transient workspace and remounts on navigation.
  // onOpenData navigates to Data onboarding; it does not launch the file chooser.
  return (
    <section
      key={`peridot-no-dataset-${destination}`}
      className="h-full overflow-auto text-[var(--text-main)]"
      style={{
        backgroundColor: '#f4e9d6',
        backgroundImage: "url('/assets/base_parchment_2.png')",
        backgroundPosition: 'center center',
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <div className="mx-auto max-w-4xl px-8 pt-[clamp(2.25rem,5vh,3.8rem)]">
        <h1 className="peridot-gateway-enter peridot-gateway-enter--heading [font-family:Georgia,'Palatino_Linotype','Book_Antiqua',Palatino,serif] text-[clamp(2.6rem,5vw,4.5rem)] font-bold leading-[1.03] tracking-[-0.045em] text-[var(--heading-text)]">
          No Dataset Active
        </h1>
        <p className="peridot-gateway-enter peridot-gateway-enter--description mt-5 max-w-2xl text-[1.5rem] leading-[1.35] text-[var(--text-main)]">
          {description}
        </p>
        <div className="peridot-gateway-enter peridot-gateway-enter--action mt-8">
          <button
            type="button"
            className="peridot-button-primary"
            onClick={onOpenData}
            style={{
              minHeight: '3.75rem',
              padding: '0.95rem 2.25rem',
              fontSize: '1.125rem',
              fontWeight: 700,
              boxShadow: '0 5px 15px rgba(28, 42, 34, 0.20)',
            }}
          >
            Go to Data <span aria-hidden="true" className="ml-3">→</span>
          </button>
        </div>
      </div>

      {/* Full-width decorative rupture marks the unavailable research workspace. */}
      <div className="peridot-gateway-enter peridot-gateway-enter--tear mt-12 w-full" aria-hidden="true">
        <img
          src={tear}
          alt=""
          className="block h-auto w-full max-w-none select-none"
          draggable="false"
        />
      </div>
    </section>
  );
}
