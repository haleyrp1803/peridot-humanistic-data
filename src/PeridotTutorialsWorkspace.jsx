/*
 * Public Tutorials destination: until walkthroughs are published, present a
 * manuscript-style coming-soon gateway matching the no-dataset research pages.
 * The primary action routes to Data onboarding without launching a tour or
 * activating a sample. The existing guided tutorial implementation stays intact.
 */

import React from 'react';
import './PeridotEditorialGatewayAnimation.css';

export function PeridotTutorialsWorkspace({ onOpenData }) {
  const assetBase = `${import.meta.env.BASE_URL}assets/`;
  return (
    <section
      className="h-full overflow-auto text-[var(--text-main)]"
      style={{
        backgroundColor: '#f4e9d6',
        backgroundImage: `url("${assetBase}base_parchment_2.png")`,
        backgroundPosition: 'center center',
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <div className="mx-auto max-w-4xl px-8 pt-[clamp(2.25rem,5vh,3.8rem)]">
        <h1 className="peridot-gateway-enter peridot-gateway-enter--heading [font-family:Georgia,'Palatino_Linotype','Book_Antiqua',Palatino,serif] text-[clamp(2.6rem,5vw,4.5rem)] font-bold leading-[1.03] tracking-[-0.045em] text-[var(--heading-text)]">
          Tutorials Coming Soon
        </h1>
        <p className="peridot-gateway-enter peridot-gateway-enter--description mt-5 max-w-2xl text-[1.5rem] leading-[1.35] text-[var(--text-main)]">
          Tutorials and step-by-step guides for using Peridot are in development. For now, begin by uploading your own research data or choosing a prepared sample on the Data page.
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

      {/* Full-width torn manuscript illustration; decorative, not a control. */}
      <div className="peridot-gateway-enter peridot-gateway-enter--tear mt-12 w-full" aria-hidden="true">
        <img
          src={`${assetBase}divider_tear_alchemy_mineral.png`}
          alt=""
          className="block h-auto w-full max-w-none select-none"
          draggable="false"
        />
      </div>
    </section>
  );
}
