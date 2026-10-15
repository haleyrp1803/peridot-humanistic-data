/*
 * Home / welcome workspace.
 *
 * This component provides Peridot's first orientation surface. The home page is
 * intentionally sparse: it establishes the tool's identity, gives a one-sentence
 * description, and routes users toward either the embedded sample dataset or
 * their own uploaded data.
 */

import React from 'react';
import florencePanorama from './assets/editorial/rosselli-florence.webp';
import './styles/workspaces/home.css';

import peridotLogoTransparent from '../assets/Peridot Logo Gilded Transparent.png';
import homepageFiligree from '../assets/Adobe Stock Filigree 1.png';

function HomeTextureBackdrop() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <div className="absolute inset-0 bg-[var(--peridot-color-hex-03120c)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_22%_20%,var(--peridot-color-rgba-rgba-99-136-99-0-18),transparent_24%),radial-gradient(circle_at_72%_24%,var(--peridot-color-rgba-rgba-67-102-79-0-16),transparent_28%),radial-gradient(circle_at_50%_54%,var(--peridot-color-rgba-rgba-124-153-95-0-10),transparent_26%),linear-gradient(135deg,var(--peridot-role-interface-app-background)_0%,var(--peridot-role-interface-app-background-alt)_44%,var(--peridot-role-interface-app-background)_100%)]" />
      <div className="absolute inset-[-10%] opacity-50 blur-3xl bg-[linear-gradient(90deg,transparent_0%,var(--peridot-color-rgba-rgba-171-208-170-0-08)_16%,transparent_30%,var(--peridot-color-rgba-rgba-110-148-116-0-10)_52%,transparent_70%,var(--peridot-color-rgba-rgba-171-208-170-0-06)_100%)]" />
      <div className="absolute inset-0 opacity-[0.08] bg-[repeating-linear-gradient(135deg,var(--peridot-color-rgba-rgba-228-239-218-0-18)_0px,var(--peridot-color-rgba-rgba-228-239-218-0-18)_1px,transparent_1px,transparent_12px)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,var(--peridot-color-rgba-rgba-1-10-7-0-10)_55%,var(--peridot-color-rgba-rgba-1-10-7-0-38)_100%)]" />
    </div>
  );
}

function StageOrnament({ side = 'left' }) {
  const isRight = side === 'right';
  const xPosition = isRight ? 'left-[92.2%]' : 'left-[7.8%]';
  const rotationClass = isRight ? '-rotate-90' : 'rotate-90';
  const entranceClass = isRight ? 'peridot-appear-frame-right' : 'peridot-appear-frame-left';

  return (
    <div
      className={`${entranceClass} peridot-appear-delay-home-frame pointer-events-none absolute top-1/2 z-[1] ${xPosition}`}
      aria-hidden="true"
    >
      <img
        src={homepageFiligree}
        alt=""
        className={`block w-[73cqh] max-w-none -translate-x-1/2 -translate-y-1/2 ${rotationClass} opacity-100 drop-shadow-[0_0_18px_var(--peridot-color-rgba-rgba-0-0-0-0-34)]`}
        draggable="false"
      />
    </div>
  );
}

const homeActionClass = [
  'peridot-home-action group inline-flex h-[4.05cqw] w-[17.2cqw] shrink-0 items-center justify-center whitespace-nowrap rounded-full border text-center',
  'px-[1.6cqw] text-[0.82cqw] font-black uppercase tracking-[0.18em] shadow-[0_18px_46px_var(--peridot-color-rgba-rgba-0-0-0-0-28)]',
  'border-[var(--peridot-color-rgba-rgba-223-233-200-0-48)] bg-[var(--peridot-color-rgba-rgba-223-233-200-0-10)] text-[var(--peridot-color-hex-fbf7ea)]',
  'transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[var(--peridot-color-rgba-rgba-245-236-210-0-68)] focus:ring-offset-2 focus:ring-offset-[var(--peridot-color-hex-03120c)]',
  'hover:-translate-y-0.5 hover:border-[var(--peridot-color-rgba-rgba-245-236-210-0-88)] hover:bg-[var(--peridot-role-button-primary-hover-bg)] hover:text-[var(--peridot-color-hex-fff8e8)] hover:shadow-[0_22px_58px_var(--peridot-color-rgba-rgba-0-0-0-0-34)]',
].join(' ');

export function PeridotHomeWorkspace({ onUploadData, onUseSampleData }) {
  return (
    <>
      {/* Editorial Home: all artistic layers are replaceable; controls remain live HTML. */}
      <main className="pd-home-editorial" aria-label="Peridot home">
        <section className="pd-home-scene" aria-labelledby="pd-home-title">
          <div className="pd-home-scene__map" aria-hidden="true">
            <img src={florencePanorama} alt="" draggable="false" />
          </div>
          <div className="pd-home-scene__paper" aria-hidden="true" />
          <div className="pd-home-scene__content">
            <p className="pd-home-editorial__eyebrow">VISUALIZE · EXPLORE · UNCOVER</p>
            <h1 id="pd-home-title">PERIDOT</h1>
            <p className="pd-home-editorial__lead">Humanities data visualizations<br className="pd-home-desktop-break" /> for your research.</p>
            <p className="pd-home-editorial__description">Map places. Trace relationships. Explore timelines.<br className="pd-home-desktop-break"/> Work with your own data or try a sample.</p>
            <div className="pd-home-editorial__actions">
              <button type="button" className="pd-home-editorial__primary" onClick={onUploadData}>Get started <span aria-hidden="true">→</span></button>
              <button type="button" className="pd-home-editorial__secondary" onClick={onUseSampleData}>Try sample data <span aria-hidden="true">→</span></button>
            </div>
          </div>
        </section>
        <section className="pd-home-editorial__features" aria-label="What you can do in Peridot">
          <article className="pd-home-editorial__feature">
            <div className="pd-home-editorial__feature-icon" aria-hidden="true"><svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M13 5h15l8 8v30H13z"/><path d="M28 5v9h8M24 36V22m-6 6 6-6 6 6"/></svg></div>
            <div className="pd-home-editorial__feature-copy"><span className="pd-home-editorial__feature-no">01 / MANAGE</span><h2>Manage data</h2><p>Upload and map records to prepare them for exploration.</p></div>
          </article>
          <article className="pd-home-editorial__feature">
            <div className="pd-home-editorial__feature-icon" aria-hidden="true"><svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.9"><path d="M13 15L31 10 37 33 16 36 13 15"/><circle cx="13" cy="15" r="4" fill="var(--pd-feature-circle)"/><circle cx="31" cy="10" r="4" fill="var(--pd-feature-circle)"/><circle cx="37" cy="33" r="4" fill="var(--pd-feature-circle)"/><circle cx="16" cy="36" r="4" fill="var(--pd-feature-circle)"/></svg></div>
            <div className="pd-home-editorial__feature-copy"><span className="pd-home-editorial__feature-no">02 / VISUALIZE</span><h2>Visualize</h2><p>Explore maps, networks, timelines, and charts.</p></div>
          </article>
          <article className="pd-home-editorial__feature">
            <div className="pd-home-editorial__feature-icon" aria-hidden="true"><svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round"><circle cx="21" cy="21" r="13"/><path d="M31 31l12 12"/></svg></div>
            <div className="pd-home-editorial__feature-copy"><span className="pd-home-editorial__feature-no">03 / EXPLORE</span><h2>Explore evidence</h2><p>Browse, search, and refine the information in your data.</p></div>
          </article>
        </section>
      </main>
      <section className="peridot-home-legacy peridot-home-workspace relative h-full min-h-0 overflow-hidden bg-[var(--peridot-color-hex-03120c)] text-[var(--peridot-color-hex-f4f6df)]">
      <HomeTextureBackdrop />

      <div className="relative z-10 flex h-full w-full items-center justify-center px-[clamp(1rem,3vw,3rem)] py-[clamp(1rem,3vh,2.5rem)]">
        <div
          className="peridot-home-stage relative w-full max-w-[94rem] [container-type:size]"
        >
          <StageOrnament side="left" />
          <StageOrnament side="right" />

          <div className="peridot-appear-soft peridot-appear-delay-1 pointer-events-none absolute left-[30%] top-1/2 z-[2] w-[30%]">
            <img
              src={peridotLogoTransparent}
              alt="Peridot"
              className="block h-auto w-full max-w-none -translate-x-1/2 -translate-y-1/2 drop-shadow-[0_14px_26px_var(--peridot-color-rgba-rgba-0-0-0-0-38)]"
              draggable="false"
            />
          </div>

          <div className="absolute left-[66.4%] top-1/2 flex w-[38%] -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center gap-[6.2cqw]">
            <p className="peridot-home-tagline peridot-appear-rise peridot-appear-delay-2 m-0 w-[88%] text-center font-[Georgia,'Palatino_Linotype','Book_Antiqua',Palatino,serif] text-[1.82cqw] font-normal leading-[1.28] tracking-[-0.012em] text-[var(--peridot-color-hex-f4f6df)] drop-shadow-[0_2px_14px_var(--peridot-color-rgba-rgba-0-0-0-0-34)]">
              Your go-to tool for exploring, visualizing, and presenting humanistic data.
            </p>

            <div className="peridot-appear-rise peridot-appear-delay-3 flex w-full flex-col items-center justify-center gap-[1.35cqw]">
              <div className="flex w-full flex-row items-center justify-center gap-[2.1cqw]">
                <button
                  type="button"
                  onClick={onUseSampleData}
                  className={homeActionClass}
                  aria-label="Start visualizing with Peridot sample data"
                >
                  Use sample data
                </button>

                <button
                  type="button"
                  onClick={onUploadData}
                  className={homeActionClass}
                  aria-label="Upload your own data"
                >
                  Upload your data
                </button>
              </div>

              <div className="group/tutorial relative flex items-center justify-center" tabIndex={0}>
                <button
                  type="button"
                  aria-disabled="true"
                  aria-describedby="peridot-home-tutorial-coming-soon"
                  className={`${homeActionClass} peridot-home-tutorial-action pointer-events-none opacity-40 grayscale`}
                >
                  Tutorial
                </button>
                <span
                  id="peridot-home-tutorial-coming-soon"
                  role="tooltip"
                  className="pointer-events-none absolute bottom-[calc(100%+0.7cqw)] left-1/2 z-20 -translate-x-1/2 whitespace-nowrap rounded-full border border-[var(--peridot-color-rgba-rgba-223-233-200-0-38)] bg-[var(--peridot-color-hex-03120c)] px-[0.9cqw] py-[0.42cqw] text-[0.68cqw] font-bold tracking-[0.08em] text-[var(--peridot-color-hex-f4f6df)] opacity-0 shadow-[0_12px_30px_var(--peridot-color-rgba-rgba-0-0-0-0-34)] transition-opacity duration-150 group-hover/tutorial:opacity-100 group-focus/tutorial:opacity-100"
                >
                  Tutorial coming soon.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
    </>
  );
}
