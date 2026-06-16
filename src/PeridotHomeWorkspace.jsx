/*
 * Home / welcome workspace.
 *
 * This component provides Peridot's first orientation surface. The home page is
 * intentionally sparse: it establishes the tool's identity, gives a one-sentence
 * description, and routes users toward either the embedded sample dataset or
 * their own uploaded data.
 *
 * Important relationships:
 * - `onUseSampleData` opens Visualizations with the embedded sample data managed
 *   by `App.jsx`.
 * - `onUploadData` opens the Data workspace for CSV/TSV/XLSX/XLS upload and
 *   mapping.
 *
 * Maintenance cautions:
 * - Keep detailed onboarding out of this component. Longer explanations belong
 *   in Learn More about Peridot so returning users can move past the homepage
 *   quickly.
 * - The desktop homepage is implemented as a fixed-ratio title-card stage. The
 *   logo and text/action group are the primary content. The filigree ornaments
 *   are decorative frame objects anchored outside the neighboring content
 *   groups, not layout columns that can drift into the content.
 */

import React from 'react';

import peridotLogoTransparent from '../assets/Peridot Logo Gilded Transparent.png';
import homepageFiligree from '../assets/Adobe Stock Filagree 1.png';

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

  return (
    <img
      src={homepageFiligree}
      alt=""
      aria-hidden="true"
      className={`pointer-events-none absolute top-1/2 z-[1] block w-[73cqh] max-w-none -translate-x-1/2 -translate-y-1/2 ${xPosition} ${rotationClass} opacity-100 drop-shadow-[0_0_18px_var(--peridot-color-rgba-rgba-0-0-0-0-34)]`}
      draggable="false"
    />
  );
}

const homeActionClass = [
  'group inline-flex h-[4.05cqw] w-[17.2cqw] shrink-0 items-center justify-center whitespace-nowrap rounded-full border text-center',
  'px-[1.6cqw] text-[0.82cqw] font-black uppercase tracking-[0.18em] shadow-[0_18px_46px_var(--peridot-color-rgba-rgba-0-0-0-0-28)]',
  'border-[var(--peridot-color-rgba-rgba-223-233-200-0-48)] bg-[var(--peridot-color-rgba-rgba-223-233-200-0-10)] text-[var(--peridot-color-hex-fbf7ea)]',
  'transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[var(--peridot-color-rgba-rgba-245-236-210-0-68)] focus:ring-offset-2 focus:ring-offset-[var(--peridot-color-hex-03120c)]',
  'hover:-translate-y-0.5 hover:border-[var(--peridot-color-rgba-rgba-245-236-210-0-88)] hover:bg-[var(--peridot-role-button-primary-hover-bg)] hover:text-[var(--peridot-color-hex-fff8e8)] hover:shadow-[0_22px_58px_var(--peridot-color-rgba-rgba-0-0-0-0-34)]',
].join(' ');

export function PeridotHomeWorkspace({ onUploadData, onUseSampleData }) {
  return (
    <section className="relative h-full min-h-0 overflow-hidden bg-[var(--peridot-color-hex-03120c)] text-[var(--peridot-color-hex-f4f6df)]">
      <HomeTextureBackdrop />

      <div className="relative z-10 flex h-full w-full items-center justify-center px-[clamp(1rem,3vw,3rem)] py-[clamp(1rem,3vh,2.5rem)]">
        <div
          className="relative w-full max-w-[94rem] [container-type:size]"
          style={{
            aspectRatio: '2.22 / 1',
            width: 'min(92vw, calc((100vh - 4rem) * 2.22), 94rem)',
          }}
        >
          <StageOrnament side="left" />
          <StageOrnament side="right" />

          <img
            src={peridotLogoTransparent}
            alt="Peridot"
            className="absolute left-[30%] top-1/2 block h-auto w-[30%] max-w-none -translate-x-1/2 -translate-y-1/2 drop-shadow-[0_14px_26px_var(--peridot-color-rgba-rgba-0-0-0-0-38)]"
            draggable="false"
          />

          <div className="absolute left-[66.4%] top-1/2 flex w-[38%] -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center gap-[6.2cqw]">
            <p className="m-0 w-[88%] text-center font-[Georgia,'Palatino_Linotype','Book_Antiqua',Palatino,serif] text-[1.82cqw] font-normal leading-[1.28] tracking-[-0.012em] text-[var(--peridot-color-hex-f4f6df)] drop-shadow-[0_2px_14px_var(--peridot-color-rgba-rgba-0-0-0-0-34)]">
              Your go-to tool for exploring, visualizing, and presenting humanistic data.
            </p>

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
          </div>
        </div>
      </div>
    </section>
  );
}
