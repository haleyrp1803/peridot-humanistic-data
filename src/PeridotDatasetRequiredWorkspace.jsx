/*
 * Empty-session navigation guard for research workspaces that require data.
 */

import React from 'react';

export function PeridotDatasetRequiredWorkspace({
  destination = 'visualize',
  onOpenData,
  onUseSampleData,
}) {
  const isExplore = destination === 'explore';
  const heading = isExplore ? 'Explore Your Data' : 'Visualize Your Data';
  const description = isExplore
    ? 'Peridot needs an active dataset before you can search records or inspect evidence.'
    : 'Peridot needs an active dataset before you can create visualizations.';

  return (
    <section className="h-full overflow-auto bg-[var(--peridot-role-interface-app-background)] px-8 py-12 text-[var(--text-main)]">
      <div className="mx-auto max-w-4xl">
        <p className="peridot-kicker">{isExplore ? 'Explore' : 'Visualize'}</p>
        <h1 className="[font-family:Georgia,'Palatino_Linotype','Book_Antiqua',Palatino,serif] text-[clamp(2.4rem,5vw,4.5rem)] font-bold leading-[0.98] tracking-[-0.045em] text-[var(--heading-text)]">
          {heading}
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-7 text-[var(--text-main)]">
          {description}
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <button type="button" className="peridot-button-primary" onClick={onOpenData}>
            Upload Your Data
          </button>
          <button type="button" className="peridot-button-secondary" onClick={onUseSampleData}>
            Choose Sample Data
          </button>
        </div>
      </div>
    </section>
  );
}
