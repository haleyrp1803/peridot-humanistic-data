/*
 * About workspace.
 *
 * This public scholarly-project section gives researchers a stable place to
 * evaluate Peridot's purpose, audience, authorship, AI use, open-source record,
 * and feedback path. Global navigation owns movement elsewhere in Peridot;
 * this component owns only the local About hierarchy.
 */

import React, { useState } from 'react';

import priceHeadshot from '../assets/2026_Price_Headshot.jpg';
import priceCvUrl from '../assets/Price_CV.pdf?url';
import { PeridotFeedbackForm } from './PeridotFeedbackForm';

const BROWN_PROFILE_URL = 'https://history.brown.edu/people/haley-price';
const JAPANLAB_PROFILE_URL = 'https://www.utjapanlab.com/team';
const PAZZI_CONSPIRACY_URL = 'https://haleyrp1803.itch.io/the-pazzi-conspiracy';

const PERIDOT_REPOSITORY_URL = 'https://github.com/haleyrp1803/peridot-humanistic-data';
const REPOSITORY_README_URL = `${PERIDOT_REPOSITORY_URL}/blob/main/core_documentation/README.md`;
const REPOSITORY_MAINTAINERS_GUIDE_URL = `${PERIDOT_REPOSITORY_URL}/blob/main/core_documentation/MAINTAINERS_GUIDE.md`;
const REPOSITORY_WORKFLOW_CHARTER_URL = `${PERIDOT_REPOSITORY_URL}/blob/main/core_documentation/PROJECT_WORKFLOW_CHARTER.md`;
const REPOSITORY_CHANGELOG_URL = `${PERIDOT_REPOSITORY_URL}/blob/main/core_documentation/CHANGELOG.md`;

const ABOUT_MODES = [
  { id: 'overview', label: 'About Peridot' },
  { id: 'creator', label: 'Creator' },
  { id: 'ai', label: 'AI Disclosure' },
  { id: 'source', label: 'Open Source' },
  { id: 'feedback', label: 'Feedback' },
];

const githubDestinations = [
  {
    title: 'Peridot on GitHub',
    description: 'Public source repository',
    href: PERIDOT_REPOSITORY_URL,
  },
  {
    title: 'Project README',
    description: 'Public orientation, supported research uses, and workflow',
    href: REPOSITORY_README_URL,
  },
  {
    title: 'Maintainer’s Guide',
    description: 'Architecture, module ownership, and regression contracts',
    href: REPOSITORY_MAINTAINERS_GUIDE_URL,
  },
  {
    title: 'Project Workflow Charter',
    description: 'Development principles and source-of-truth protocol',
    href: REPOSITORY_WORKFLOW_CHARTER_URL,
  },
  {
    title: 'Project Changelog',
    description: 'Milestones, decisions, reversals, and project history',
    href: REPOSITORY_CHANGELOG_URL,
  },
];

function ExpandableDisclosure({ title, children }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <article className="peridot-about-disclosure">
      <h3>{title}</h3>
      <div className={`peridot-about-disclosure-copy${isExpanded ? ' is-expanded' : ''}`}>
        {children}
      </div>
      <button
        type="button"
        className="peridot-about-text-button"
        onClick={() => setIsExpanded((currentValue) => !currentValue)}
        aria-expanded={isExpanded}
      >
        {isExpanded ? 'Show less' : 'Read more'}
      </button>
    </article>
  );
}

function AboutOverview() {
  return (
    <div className="peridot-about-reading-column">
      <header className="peridot-about-page-heading">
        <p className="peridot-section-label">About Peridot</p>
        <h1>Humanistic data without forcing the evidence to behave like a spreadsheet.</h1>
        <p className="peridot-about-lede">
          Peridot is an open, research-oriented web application for exploring humanistic data through maps, networks, timelines, charts, advanced query tools, exports, and evidence dossiers.
        </p>
      </header>

      <section className="peridot-about-prose-section" aria-labelledby="peridot-about-purpose-heading">
        <h2 id="peridot-about-purpose-heading">Purpose</h2>
        <p>
          Peridot derives only the structures that a researcher&apos;s mapped data can safely support, then provides linked ways to visualize, search, inspect, and export that evidence. Its mature first use case grew from correspondence research, but its public import system now uses one generalized mapping model for ordinary CSV, TSV, XLSX, and XLS data.
        </p>
        <p>
          The project is intended to support exploratory analysis without silently standardizing historical evidence or treating visualization readiness as the sole measure of research value.
        </p>
      </section>

      <section className="peridot-about-prose-section" aria-labelledby="peridot-about-audience-heading">
        <h2 id="peridot-about-audience-heading">Audience</h2>
        <p>
          Peridot is designed for researchers working with humanistic records that may be incomplete, heterogeneous, uncertain, repeated, or only partly mappable. Users describe the meaning of their own fields and retain control over relationship, identity, temporal, place, and evidence semantics during import.
        </p>
      </section>

      <section className="peridot-about-principles" aria-labelledby="peridot-about-principles-heading">
        <h2 id="peridot-about-principles-heading">Research principles</h2>
        <div className="peridot-about-principle-grid">
          <article>
            <h3>Researcher-controlled mapping</h3>
            <p>Peridot asks users to describe their data rather than silently inferring an ontology or rewriting source evidence.</p>
          </article>
          <article>
            <h3>Database-first preservation</h3>
            <p>Records can remain useful for search, evidence preservation, inspection, or charts even when they lack coordinates, relationships, or machine-usable dates.</p>
          </article>
          <article>
            <h3>Capability-aware visualization</h3>
            <p>Views should appear when the mapped evidence supports them and explain limitations when it does not, rather than presenting empty or misleading visualizations.</p>
          </article>
        </div>
      </section>

      <section className="peridot-about-prose-section" aria-labelledby="peridot-about-status-heading">
        <h2 id="peridot-about-status-heading">Project status</h2>
        <p>
          Peridot is an active research prototype and an open-source digital scholarship project. Its interfaces, generalized data model, and documentation continue to evolve through direct testing with historical datasets. The public repository and project documentation preserve the development record, including architectural decisions, limitations, reversals, and deferred work.
        </p>
      </section>
    </div>
  );
}

function AboutCreator() {
  const [isBioExpanded, setIsBioExpanded] = useState(false);

  return (
    <div className="peridot-about-reading-column">
      <header className="peridot-about-page-heading">
        <p className="peridot-section-label">Creator</p>
        <h1>Haley Price</h1>
        <p className="peridot-about-lede">Historian, digital humanist, and creator of Peridot.</p>
      </header>

      <section className="peridot-about-creator" aria-labelledby="peridot-about-creator-bio-heading">
        <div className={`peridot-about-creator-copy${isBioExpanded ? ' is-expanded' : ''}`}>
          {isBioExpanded ? (
            <figure className="peridot-about-creator-portrait">
              <img src={priceHeadshot} alt="Haley Price" />
            </figure>
          ) : null}

          <h2 id="peridot-about-creator-bio-heading">Creator and maintainer</h2>
          <p>
            Haley Price created Peridot as an open-source, open-access digital scholarship tool with the help of ChatGPT. Aware of the fraught ethics of the current AI landscape, Price advocates for humanists to be well-informed about AI. Rather than avoid it altogether, Price sees the need for scholars to engage with it as responsibly and ethically as possible so that humanists have a voice in shaping AI&apos;s impact on the production and maintenance of humanistic knowledge and in humanities pedagogy.
          </p>

          {isBioExpanded ? (
            <>
              <p>
                Price is a <a href={BROWN_PROFILE_URL} target="_blank" rel="noreferrer">History PhD Candidate at Brown University</a> and the <a href={JAPANLAB_PROFILE_URL} target="_blank" rel="noreferrer">Digital Humanities Specialist for UT Austin’s JapanLab</a>. Price is interested in the relationship between power, piety, patronage, networks, and gender in early modern Italy. She studied History and Humanities as an undergraduate at the University of Texas at Austin, where she engineered her own interdisciplinary degree plan to create educational history-based video games. This study culminated in <a href={PAZZI_CONSPIRACY_URL} target="_blank" rel="noreferrer"><em>The Pazzi Conspiracy</em></a>, which aims to teach students about patronage and power in fifteenth-century Florence. Her doctoral dissertation visualizes and analyzes Maria Maddalena von Habsburg de’ Medici’s (1589–1631) network, using her epistolary record and family tree to map her kith, kin, and correspondents across early modern Europe through digital visualizations and traditional prose.
              </p>
              <p>
                Price&apos;s research interests include Early Modern European History, Medici Studies, power, piety, patronage, gender, and networks, Digital History and Visualization, Educational Video Games and Interactive Media, History Pedagogy, and AI Ethics in the Humanities.
              </p>
            </>
          ) : null}

          <div className="peridot-about-inline-actions">
            <button
              type="button"
              className="peridot-about-text-button"
              onClick={() => setIsBioExpanded((currentValue) => !currentValue)}
              aria-expanded={isBioExpanded}
            >
              {isBioExpanded ? 'Show shorter bio' : 'Read full bio'}
            </button>
            {isBioExpanded ? (
              <a href={priceCvUrl} download className="peridot-button-primary">
                Download Haley Price’s CV
              </a>
            ) : null}
          </div>
        </div>
      </section>
    </div>
  );
}

function AboutAI() {
  return (
    <div className="peridot-about-reading-column peridot-about-reading-column-wide">
      <header className="peridot-about-page-heading">
        <p className="peridot-section-label">AI disclosure</p>
        <h1>How AI was used in Peridot</h1>
        <p className="peridot-about-lede">
          Peridot&apos;s development involved an ongoing human–AI collaboration. These companion statements distinguish Price&apos;s account of the project from ChatGPT&apos;s account of its role.
        </p>
      </header>

      <div className="peridot-about-disclosure-grid">
        <ExpandableDisclosure title="Price’s Perspective">
          <p>[text here]</p>
        </ExpandableDisclosure>
        <ExpandableDisclosure title="ChatGPT’s Perspective">
          <p>
            I assisted Haley Price with implementation-oriented work across Peridot’s development: interpreting her specifications, proposing and revising code, helping trace defects, drafting technical documentation, and translating detailed design direction into interface changes. I did not independently establish Peridot’s scholarly purpose, determine its research claims, choose its datasets, validate its historical interpretations, or decide which work should be accepted into the project.
          </p>
          <p>
            Price directed the collaboration at a granular level. She supplied the project’s audience, purpose, ethical framing, aesthetic priorities, interface goals, accessibility constraints, and public-facing materials. She set concrete requirements for palette, contrast, typography, information hierarchy, animation pacing, export policy, and the behavior of individual research workflows. She regularly identified problems through direct testing in the running application and determined whether a proposed change met the project’s goals.
          </p>
          <p>
            Price also established the working method used for this collaboration. She required that current source files be read before changes were proposed, that ambiguous requirements be clarified rather than guessed, that potentially fragile behavior be kept within bounded passes, and that implementation handoffs use reviewable individual files and explicit Git practices. She retained authority over every decision to apply, reject, revise, or roll back changes. My outputs were therefore responsive to constraints she supplied rather than autonomous decisions about the project.
          </p>
          <p>
            This disclosure should not be read as a claim that AI-generated suggestions are inherently accurate, neutral, or scholarly. They require testing, critical evaluation, and responsible human judgment. The accountability for Peridot’s research values, public claims, and final form remains with its human creator and maintainer, Haley Price.
          </p>
        </ExpandableDisclosure>
      </div>
    </div>
  );
}

function AboutOpenSource() {
  return (
    <div className="peridot-about-reading-column peridot-about-reading-column-wide">
      <header className="peridot-about-page-heading">
        <p className="peridot-section-label">Open source</p>
        <h1>Source, documentation, and development record</h1>
        <p className="peridot-about-lede">
          Peridot&apos;s public repository preserves the application source alongside the documentation used to record architecture, maintenance rules, development principles, and project history.
        </p>
      </header>

      <nav className="peridot-about-source-list" aria-label="Project repository and documentation links">
        {githubDestinations.map((destination) => (
          <a
            key={destination.title}
            href={destination.href}
            target="_blank"
            rel="noreferrer"
            className="peridot-about-source-link"
          >
            <span>
              <strong>{destination.title}</strong>
              <small>{destination.description}</small>
            </span>
            <span aria-hidden="true">↗</span>
          </a>
        ))}
      </nav>
    </div>
  );
}

function AboutFeedback() {
  return (
    <div className="peridot-about-reading-column">
      <header className="peridot-about-page-heading">
        <p className="peridot-section-label">Feedback</p>
        <h1>Questions, bugs, and suggestions</h1>
        <p className="peridot-about-lede">
          Use this form to report a problem, ask a question, or suggest a change. Feedback is sent directly to Peridot&apos;s creator and maintainer.
        </p>
      </header>
      <PeridotFeedbackForm mode="inline" />
    </div>
  );
}

export function PeridotLearnMoreWorkspace() {
  const [activeMode, setActiveMode] = useState('overview');

  return (
    <section className="peridot-about-workspace">
      <nav className="peridot-about-local-nav" aria-label="About Peridot sections">
        {ABOUT_MODES.map((mode) => (
          <button
            key={mode.id}
            type="button"
            className={`peridot-about-local-nav-item${activeMode === mode.id ? ' is-active' : ''}`}
            onClick={() => setActiveMode(mode.id)}
            aria-current={activeMode === mode.id ? 'page' : undefined}
          >
            {mode.label}
          </button>
        ))}
      </nav>

      <main className="peridot-about-content">
        {activeMode === 'overview' ? <AboutOverview /> : null}
        {activeMode === 'creator' ? <AboutCreator /> : null}
        {activeMode === 'ai' ? <AboutAI /> : null}
        {activeMode === 'source' ? <AboutOpenSource /> : null}
        {activeMode === 'feedback' ? <AboutFeedback /> : null}
      </main>
    </section>
  );
}
