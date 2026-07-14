/*
 * Learn More workspace.
 *
 * This public reference page keeps creator, AI-method, tutorial, and open-source
 * materials in one research-facing destination. The biography and disclosures
 * intentionally support compact reading first and expandable long-form prose.
 */

import React, { useState } from 'react';

import priceHeadshot from '../assets/2026_Price_Headshot.jpg';
import priceCvUrl from '../assets/Price_CV.pdf?url';

const BROWN_PROFILE_URL = 'https://history.brown.edu/people/haley-price';
const JAPANLAB_PROFILE_URL = 'https://www.utjapanlab.com/team';
const PAZZI_CONSPIRACY_URL = 'https://haleyrp1803.itch.io/the-pazzi-conspiracy';

const PERIDOT_REPOSITORY_URL = 'https://github.com/haleyrp1803/peridot-humanistic-data';
const REPOSITORY_README_URL = `${PERIDOT_REPOSITORY_URL}/blob/main/core_documentation/README.md`;
const REPOSITORY_MAINTAINERS_GUIDE_URL = `${PERIDOT_REPOSITORY_URL}/blob/main/core_documentation/MAINTAINERS_GUIDE.md`;
const REPOSITORY_WORKFLOW_CHARTER_URL = `${PERIDOT_REPOSITORY_URL}/blob/main/core_documentation/PROJECT_WORKFLOW_CHARTER.md`;
const REPOSITORY_CHANGELOG_URL = `${PERIDOT_REPOSITORY_URL}/blob/main/core_documentation/CHANGELOG.md`;

const githubDestinations = [
  {
    title: 'Peridot on GitHub',
    description: 'Repository',
    href: PERIDOT_REPOSITORY_URL,
    primary: true,
  },
  {
    title: 'Project README',
    description: 'Overview and usage',
    href: REPOSITORY_README_URL,
  },
  {
    title: 'Maintainer’s Guide',
    description: 'Architecture and maintenance',
    href: REPOSITORY_MAINTAINERS_GUIDE_URL,
  },
  {
    title: 'Project Workflow Charter',
    description: 'Development principles',
    href: REPOSITORY_WORKFLOW_CHARTER_URL,
  },
  {
    title: 'Project Changelog',
    description: 'Milestones and history',
    href: REPOSITORY_CHANGELOG_URL,
  },
];

function LearnMoreSectionDivider({ delayClass }) {
  return (
    <div
      className={`peridot-learn-more-section-divider peridot-appear-fade ${delayClass}`}
      aria-hidden="true"
    >
      <span />
    </div>
  );
}

function ExpandableDisclosure({ title, children }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <article className="peridot-learn-more-disclosure-paper">
      <h3>{title}</h3>
      <div className={`peridot-learn-more-disclosure-copy${isExpanded ? ' is-expanded' : ''}`}>
        {children}
      </div>
      <button
        type="button"
        className="peridot-learn-more-text-button"
        onClick={() => setIsExpanded((currentValue) => !currentValue)}
        aria-expanded={isExpanded}
      >
        {isExpanded ? 'Show less' : 'Read more'}
      </button>
    </article>
  );
}

export function PeridotLearnMoreWorkspace({ onOpenVisualizations, onStartTutorial }) {
  const [isBioExpanded, setIsBioExpanded] = useState(false);

  return (
    <section className="peridot-workspace-field peridot-learn-more-workspace text-[var(--peridot-color-hex-fbf7ea)]">
      <div className="peridot-workspace-frame-wide peridot-learn-more-frame">
        <header className="peridot-appear-rise peridot-appear-delay-0 peridot-hero-card peridot-learn-more-hero">
          <div className="peridot-workspace-header-row">
            <div>
              <p className="peridot-kicker">Learn more about Peridot</p>
              <h1 className="peridot-title-medium">Project information hub</h1>
              <p className="peridot-lede">
                Peridot is an open-source, open-access digital scholarship tool for exploring, visualizing, searching, and presenting humanistic data.
              </p>
            </div>
            <button type="button" onClick={onOpenVisualizations} className="peridot-button-secondary shrink-0">
              Return to visualizations
            </button>
          </div>
        </header>

        <div className="peridot-learn-more-section-with-divider">
          <LearnMoreSectionDivider delayClass="peridot-appear-delay-1" />
          <div className={`peridot-learn-more-top-grid${isBioExpanded ? ' is-bio-expanded' : ''}`}>
          <section
            className={`peridot-appear-rise peridot-appear-delay-2 peridot-learn-more-author-card${isBioExpanded ? ' is-expanded' : ''}`}
            aria-labelledby="peridot-author-heading"
          >
            <div className="peridot-learn-more-author-copy">
              <p className="peridot-section-label">Creator</p>
              <h2 id="peridot-author-heading">Haley Price</h2>

              <div className={`peridot-learn-more-bio${isBioExpanded ? ' is-expanded' : ''}`}>
                {isBioExpanded && (
                  <figure className="peridot-learn-more-author-portrait">
                    <img src={priceHeadshot} alt="Haley Price" className="peridot-learn-more-headshot" />
                  </figure>
                )}

                <p>
                  Haley Price created Peridot as an open-source, open-access digital scholarship tool with the help of ChatGPT. Aware of the fraught ethics of the current AI landscape, Price advocates for humanists to be well-informed about AI. Rather than avoid it altogether, Price sees the need for scholars to engage in it (as responsibly and ethically as is possible given the current state of the AI/Tech industry) so that humanists have a voice in shaping AI&apos;s impact on the production and maintenance of humanistic knowledge and in humanities pedagogy.
                </p>
                {isBioExpanded && (
                  <>
                    <p>
                      Price is a <a href={BROWN_PROFILE_URL} target="_blank" rel="noreferrer">History PhD Candidate at Brown University</a> and the <a href={JAPANLAB_PROFILE_URL} target="_blank" rel="noreferrer">Digital Humanities Specialist for UT Austin’s JapanLab</a>. Price is interested in the relationship between power, piety, patronage, networks, and gender in early modern Italy. She studied History and Humanities as an undergraduate at the University of Texas at Austin, where she engineered her own interdisciplinary degree plan to create educational history-based video games. This study culminated in <a href={PAZZI_CONSPIRACY_URL} target="_blank" rel="noreferrer"><em>The Pazzi Conspiracy</em></a>, which aims to teach students about patronage and power in 15th century Florence. Her doctoral dissertation visualizes and analyzes Maria Maddalena von Habsburg de’ Medici’s (1589 – 1631) network, using her epistolary record and family tree to map her kith, kin, and correspondents across early modern Europe both through digital visualizations and traditional prose.
                    </p>
                    <p>
                      Price&apos;s research interests include Early Modern European History, Medici Studies, the themes of power, piety, patronage, gender, and networks, Digital History/Visualization, Educational Video Games and Interactive Media, History Pedagogy, and AI Ethics in the Humanities.
                    </p>
                  </>
                )}
              </div>

              <div className="peridot-learn-more-author-actions">
                <button
                  type="button"
                  className="peridot-learn-more-text-button"
                  onClick={() => setIsBioExpanded((currentValue) => !currentValue)}
                  aria-expanded={isBioExpanded}
                >
                  {isBioExpanded ? 'Show shorter bio' : 'Read full bio'}
                </button>
                {isBioExpanded && (
                  <a href={priceCvUrl} download className="peridot-button-primary peridot-learn-more-cv-button">
                    Download Haley Price’s CV
                  </a>
                )}
              </div>
            </div>
          </section>

          <section
            className="peridot-appear-rise peridot-appear-delay-2 peridot-learn-more-github-card peridot-learn-more-github-card-compact"
            aria-labelledby="peridot-github-heading"
          >
            <p className="peridot-section-label">Open source</p>
            <h2 id="peridot-github-heading">Find Peridot on GitHub</h2>
            <p className="peridot-learn-more-github-intro">
              Browse the public repository or open the project’s core reference documents.
            </p>
            <nav className="peridot-learn-more-github-destinations" aria-label="Project repository and documentation links">
              {githubDestinations.map((destination) => (
                <a
                  key={destination.title}
                  href={destination.href}
                  target="_blank"
                  rel="noreferrer"
                  className={`peridot-learn-more-github-destination${destination.primary ? ' is-primary' : ''}`}
                >
                  <strong>{destination.title}</strong>
                  <span>{destination.description}</span>
                </a>
              ))}
            </nav>
          </section>
          </div>
        </div>

        <div className="peridot-learn-more-section-with-divider">
          <LearnMoreSectionDivider delayClass="peridot-appear-delay-3" />
          <section className="peridot-appear-rise peridot-appear-delay-4 peridot-learn-more-ai-card" aria-labelledby="peridot-ai-heading">
          <p className="peridot-section-label">AI disclosure</p>
          <h2 id="peridot-ai-heading">How AI Was Used in Peridot</h2>
          <p className="peridot-learn-more-ai-intro">
            Peridot’s development involved an ongoing human–AI collaboration. These companion statements distinguish Price’s account of the project from ChatGPT’s account of its role.
          </p>
          <div className="peridot-learn-more-disclosure-grid">
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
          </section>
        </div>

        <div className="peridot-learn-more-section-with-divider">
          <LearnMoreSectionDivider delayClass="peridot-appear-delay-5" />
          <section className="peridot-appear-rise peridot-appear-delay-6 peridot-learn-more-tutorial-card" aria-labelledby="peridot-tutorials-heading">
          <p className="peridot-section-label">Tutorials</p>
          <h2 id="peridot-tutorials-heading">Learn Peridot with a guided tour</h2>
          <p>
            Start with sample data and follow concise, plain-language guidance through Peridot’s main exploration workflow. The tutorial can be closed at any time.
          </p>
          <div className="peridot-learn-more-tutorial-actions">
            <button type="button" onClick={onStartTutorial} className="peridot-button-primary">
              Start guided tutorial
            </button>
            <span className="peridot-learn-more-coming-soon">Video tutorials are also in preparation</span>
          </div>
          </section>
        </div>
      </div>
    </section>
  );
}
