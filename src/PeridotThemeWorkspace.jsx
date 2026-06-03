import React from 'react';

export function PeridotThemeWorkspace({ themePresetKey, applyThemePreset, resetTheme, onOpenVisualizations }) {
  const themeOptions = [
    {
      key: 'peridot',
      title: 'Peridot default',
      description: 'Return to the current mossy green Peridot interface and map palette.',
      action: resetTheme,
    },
    {
      key: 'preModern',
      title: 'Early modern map',
      description: 'Use the warmer historical-map palette for geographic exploration.',
      action: () => applyThemePreset('preModern'),
    },
    {
      key: 'modern',
      title: 'Modern map',
      description: 'Use the higher-contrast modern map palette.',
      action: () => applyThemePreset('modern'),
    },
  ];

  return (
    <section className="h-full overflow-auto bg-[linear-gradient(135deg,var(--shell-bg),var(--title-bar-bg))] px-6 py-8 text-[var(--text-main)]">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <div className="rounded-[32px] border border-[var(--panel-card-border)]/80 bg-[var(--panel-card-bg)]/94 p-7 shadow-[0_22px_54px_rgba(0,0,0,0.28)]">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
            Theme workspace
          </p>
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="[font-family:Georgia,'Palatino_Linotype','Book_Antiqua',Palatino,serif] text-4xl font-bold tracking-[-0.03em] text-[var(--heading-text)] md:text-5xl">
                Choose Peridot's appearance
              </h1>
              <p className="mt-4 max-w-3xl text-base leading-7 text-[var(--panel-card-muted-text)]">
                Theme now lives as its own workspace rather than inside the legacy Controls panel. These presets adjust the map and interface palette without changing the loaded data, filters, timeline, Inspector, or export scope.
              </p>
            </div>
            <button
              type="button"
              onClick={onOpenVisualizations}
              className="rounded-xl border border-[var(--button-secondary-border)] bg-[var(--button-secondary-bg)] px-4 py-3 text-sm font-semibold text-[var(--button-secondary-text)] transition hover:bg-[var(--button-secondary-hover)]"
            >
              Return to visualizations
            </button>
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {themeOptions.map((option) => {
            const active = themePresetKey === option.key;
            return (
              <button
                key={option.key}
                type="button"
                onClick={option.action}
                className={[
                  'rounded-[28px] border p-6 text-left shadow-[0_16px_36px_rgba(0,0,0,0.22)] transition-all duration-150 hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/45',
                  active
                    ? 'border-[var(--button-primary-active-border)] bg-[var(--button-primary-active-bg)] text-[var(--button-primary-text)]'
                    : 'border-[var(--section-border)] bg-[var(--section-bg)] text-[var(--text-main)] hover:bg-[var(--panel-card-hover)]',
                ].join(' ')}
              >
                <span className="block text-sm font-semibold uppercase tracking-[0.16em] opacity-80">
                  {active ? 'Active theme' : 'Theme preset'}
                </span>
                <span className="mt-3 block text-xl font-bold">{option.title}</span>
                <span className="mt-3 block text-sm leading-6 opacity-85">{option.description}</span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
