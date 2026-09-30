/*
 * Top-level Tutorials destination introduced by the persistent navigation pass.
 * Detailed tutorial-library design is intentionally deferred; this page keeps the
 * existing guided tutorial available without conflating instruction with About.
 */

import React from 'react';

export function PeridotTutorialsWorkspace({ onStartTutorial }) {
  return (
    <section className="h-full overflow-auto bg-[var(--peridot-role-interface-app-background)] px-8 py-10 text-[var(--text-main)]">
      <div className="mx-auto max-w-5xl">
        <p className="peridot-kicker">Tutorials</p>
        <h1 className="[font-family:Georgia,'Palatino_Linotype','Book_Antiqua',Palatino,serif] text-[clamp(2.5rem,5vw,4.6rem)] font-bold leading-[0.98] tracking-[-0.045em] text-[var(--heading-text)]">
          Learn Peridot
        </h1>
        <p className="mt-5 max-w-3xl text-base leading-7">
          Use the guided tour to learn the current research workflow. Additional task-specific tutorials will be organized here as the documentation section is expanded.
        </p>
        <div className="mt-8">
          <button type="button" className="peridot-button-primary" onClick={onStartTutorial}>
            Start Guided Tutorial
          </button>
        </div>
      </div>
    </section>
  );
}
