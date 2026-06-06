/*
 * Learn More placeholder workspace.
 * 
 * This intentionally lightweight page reserves a stable route for future project information, credits, tutorials, data-preparation guidance, and interpretive documentation.
 * 
 * Maintenance cautions:
 * - Keep this route present even while sparse; it is part of the simplified product navigation model.
 */

import React from 'react';

export function PeridotLearnMoreWorkspace({ onOpenVisualizations }) {
  return (
    <section className="peridot-workspace-field text-[#fbf7ea]">
      <div className="peridot-workspace-frame">
        <div className="peridot-hero-card">
          <div className="peridot-workspace-header-row">
            <div>
              <p className="peridot-kicker">Learn more about Peridot</p>
              <h1 className="peridot-title-medium">Project information hub</h1>
              <p className="peridot-lede">
                This workspace is intentionally blank for now. It will later hold project information, credits, tutorials, data-preparation guidance, and other help materials.
              </p>
            </div>
            <button type="button" onClick={onOpenVisualizations} className="peridot-button-secondary shrink-0">
              Return to visualizations
            </button>
          </div>
        </div>

        <div className="mt-6 rounded-[28px] border border-[#dfe9c8]/32 bg-[#dfe9c8]/10 p-8 text-[#f8f4e6] shadow-[0_18px_46px_rgba(0,0,0,0.24)]">
          <p className="peridot-kicker text-[11px] text-[#dfe9c8]">Coming soon</p>
          <h2 className="[font-family:Georgia,'Palatino_Linotype','Book_Antiqua',Palatino,serif] text-3xl font-bold tracking-[-0.035em] text-[#f5ecd2]">
            Documentation, tutorials, and credits will live here.
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-[#dfe9c8]">
            The page is already wired into the hamburger menu so future informational content can be added without another routing redesign.
          </p>
        </div>
      </div>
    </section>
  );
}
