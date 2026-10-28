/*
 * Tutorials destination — informational placeholder until tutorials are published.
 * Keep the navigation destination available without advertising an unfinished tour.
 */

import React from 'react';

export function PeridotTutorialsWorkspace() {
  return (
    <section className="h-full overflow-auto bg-[var(--peridot-role-interface-app-background)] px-8 py-10 text-[var(--text-main)]">
      <div className="mx-auto max-w-5xl">
        <h1 className="[font-family:Georgia,'Palatino_Linotype','Book_Antiqua',Palatino,serif] text-[clamp(2.5rem,5vw,4.6rem)] font-bold leading-[0.98] tracking-[-0.045em] text-[var(--heading-text)]">
          Tutorials Coming Soon
        </h1>
        <p className="mt-5 max-w-3xl text-base leading-7">
          Tutorials and step-by-step guides for using Peridot are in development.
          This section will be updated as they become available.
        </p>
      </div>
    </section>
  );
}
