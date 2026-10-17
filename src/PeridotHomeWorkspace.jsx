/* Cartographic Editorial Home — Pass 2. Artwork is decorative; controls remain live. */
import React from 'react';
import florenceMap from '../assets/Rosselli_Map_of_Florence.jpg';
import benincasaMap from '../assets/1466 Benincasa Map.jpg';
import benincasaDetail from '../assets/1466 Benincasa Map detail.jpg';
import parchmentBase from '../assets/ChatGPT_Home_ParchmentBase.png';
import parchmentTearOne from '../assets/ChatGPT_Home_ParchmentTear1.png';
import parchmentTearTwo from '../assets/ChatGPT_Home_ParchmentTear2.png';
import parchmentBanner from '../assets/ChatGPT_Home_ParchmentBanner.png';
import leftCorner from '../assets/ChatGPT_Home_TopLeftCorner.png';
import rightCorner from '../assets/ChatGPT_Home_TopRightCorner.png';
import dottedRoute from '../assets/ChatGPT_Home_DottedLine.png';
import compassRose from '../assets/ChatGPT_Home_CompassRose.png';
import oliveDetail from '../assets/ChatGPT_Home_OliveDetail.png';
import './styles/workspaces/home.css';

const features = [
  { number: '01 / MANAGE', title: 'Manage data', description: 'Upload and map records to prepare them for exploration.', path: <><path d="M13 5h15l8 8v30H13z"/><path d="M28 5v9h8M24 36V22m-6 6 6-6 6 6"/></> },
  { number: '02 / VISUALIZE', title: 'Visualize', description: 'Explore maps, networks, timelines, and charts.', path: <><path d="M13 15L31 10 37 33 16 36 13 15"/><circle cx="13" cy="15" r="4"/><circle cx="31" cy="10" r="4"/><circle cx="37" cy="33" r="4"/><circle cx="16" cy="36" r="4"/></> },
  { number: '03 / EXPLORE', title: 'Explore evidence', description: 'Browse, search, and refine the information in your data.', path: <><circle cx="21" cy="21" r="13"/><path d="M31 31l12 12"/></> },
];

export function PeridotHomeWorkspace({ onUploadData, onUseSampleData }) {
  return (
    <main className="pd-home-editorial" aria-label="Peridot home">
      <section className="pd-home-scene" aria-labelledby="pd-home-title">
        <div className="pd-home-scene__cartography" aria-hidden="true">
          <img className="pd-home-scene__florence" src={florenceMap} alt="" draggable="false" />
        </div>
        <div className="pd-home-scene__graphics" aria-hidden="true">
          <div className="pd-home-scene__paper"><img src={parchmentBase} alt="" draggable="false" /></div>
          <img className="pd-home-art pd-home-art--tear-one" src={parchmentTearOne} alt="" draggable="false" />
          <img className="pd-home-art pd-home-art--top-left" src={leftCorner} alt="" draggable="false" />
          <img className="pd-home-art pd-home-art--top-right" src={rightCorner} alt="" draggable="false" />
          <img className="pd-home-art pd-home-art--route" src={dottedRoute} alt="" draggable="false" />
          <img className="pd-home-art pd-home-art--compass" src={compassRose} alt="" draggable="false" />
        </div>
        <div className="pd-home-scene__content">
          <p className="pd-home-editorial__eyebrow">VISUALIZE · EXPLORE · UNCOVER</p>
          <h1 id="pd-home-title">PERIDOT</h1>
          <p className="pd-home-editorial__lead">Humanities data visualizations for your research.</p>
          <p className="pd-home-editorial__description">Map places. Trace relationships. Explore timelines. Work with your own data or try a sample.</p>
          <div className="pd-home-editorial__actions">
            <button type="button" className="pd-home-editorial__primary" onClick={onUploadData}>Get started <span aria-hidden="true">→</span></button>
            <button type="button" className="pd-home-editorial__secondary" onClick={onUseSampleData}>Try sample data <span aria-hidden="true">→</span></button>
          </div>
        </div>
      </section>
      <div className="pd-home-editorial__lower-scene">
        <div className="pd-home-editorial__lower-art" aria-hidden="true">
          <img className="pd-home-editorial__benincasa" src={benincasaMap} alt="" draggable="false" />
          <img className="pd-home-editorial__benincasa-detail" src={benincasaDetail} alt="" draggable="false" />
          <img className="pd-home-editorial__lower-tear" src={parchmentTearTwo} alt="" draggable="false" />
          <img className="pd-home-editorial__olive" src={oliveDetail} alt="" draggable="false" />
        </div>
        <section className="pd-home-editorial__features" aria-label="What you can do in Peridot">
          <img className="pd-home-editorial__banner-art" src={parchmentBanner} alt="" aria-hidden="true" draggable="false" />
          {features.map((feature) => (
            <article className="pd-home-editorial__feature" key={feature.number}>
              <div className="pd-home-editorial__feature-icon" aria-hidden="true">
                <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">{feature.path}</svg>
              </div>
              <div className="pd-home-editorial__feature-copy">
                <span className="pd-home-editorial__feature-no">{feature.number}</span>
                <h2>{feature.title}</h2>
                <p>{feature.description}</p>
              </div>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}
