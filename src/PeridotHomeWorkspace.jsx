/* Cartographic Editorial Home — Pass 2. Artwork is decorative; controls remain live. */
import React from 'react';
import florenceMap from '../assets/Rosselli_Map_of_Florence.jpg';
import parchmentTearOne from '../assets/ChatGPT_Home_ParchmentTear1.png';
import rightCorner from '../assets/ChatGPT_Home_TopRightCorner.png';
import bannerLowerLeft from '../assets/ChatGPT_Home_BannerLowerLeft_Collage_20261025.png';
import bannerUpperRight from '../assets/ChatGPT_Home_BannerUpperRight_Collage_20261025.png';
import './styles/workspaces/home.css';

const features = [
  { key: 'manage', title: 'Manage data', description: 'Upload and map records to prepare them for exploration.', path: <><path d="M13 5h15l8 8v30H13z"/><path d="M28 5v9h8M24 36V22m-6 6 6-6 6 6"/></> },
  { key: 'visualize', title: 'Visualize', description: 'Explore maps, networks, timelines, and charts.', path: <><path d="M13 15L31 10 37 33 16 36 13 15"/><circle cx="13" cy="15" r="4"/><circle cx="31" cy="10" r="4"/><circle cx="37" cy="33" r="4"/><circle cx="16" cy="36" r="4"/></> },
  { key: 'explore', title: 'Explore evidence', description: 'Browse, search, and refine the information in your data.', path: <><circle cx="21" cy="21" r="13"/><path d="M31 31l12 12"/></> },
];

export function PeridotHomeWorkspace({ onUploadData, onUseSampleData }) {
  return (
    <main className="pd-home-editorial" aria-label="Peridot home">
      <section className="pd-home-scene" aria-labelledby="pd-home-title">
        <div className="pd-home-scene__cartography" aria-hidden="true">
          <img className="pd-home-scene__florence" src={florenceMap} alt="" draggable="false" />
        </div>
        <div className="pd-home-scene__graphics" aria-hidden="true">
          <div className="pd-home-scene__paper"><img src={parchmentTearOne} alt="" draggable="false" /></div>
          <img className="pd-home-art pd-home-art--top-right" src={rightCorner} alt="" draggable="false" />
        </div>
        <div className="pd-home-scene__content">
          <p className="pd-home-editorial__eyebrow">VISUALIZE · EXPLORE · UNCOVER</p>
          <h1 id="pd-home-title">PERIDOT</h1>
          <p className="pd-home-editorial__lead">Humanities Data Visualizations</p>
          <p className="pd-home-editorial__description">Turn your data into interactive maps, networks, and timelines. Move seamlessly from visualization to individual record and back again, without interrupting your research flow.</p>
          <div className="pd-home-editorial__actions">
            <label className="peridot-button-primary pd-home-editorial__primary" style={{ cursor: 'pointer' }}>
              Upload your data
              <input
                type="file"
                accept=".csv,.tsv,.xlsx,.xlsm,.xls,text/csv,text/tab-separated-values"
                onChange={onUploadData}
                className="sr-only"
                aria-label="Choose a file to upload to Peridot"
              />
            </label>
            <button type="button" className="peridot-button-primary pd-home-editorial__primary" onClick={onUseSampleData}>Explore sample data</button>
          </div>
        </div>
      </section>
      <div className="pd-home-editorial__lower-scene">
        <section className="pd-home-editorial__features" aria-label="What you can do in Peridot">
          {features.map((feature) => (
            <article className="pd-home-editorial__feature" key={feature.key}>
              <div className="pd-home-editorial__feature-icon" aria-hidden="true">
                <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">{feature.path}</svg>
              </div>
              <div className="pd-home-editorial__feature-copy">
                <h2>{feature.title}</h2>
                <p>{feature.description}</p>
              </div>
            </article>
          ))}
        </section>
        <div className="pd-home-editorial__newcomer">
          <h2 className="pd-home-editorial__newcomer-title">New to Peridot?</h2>
          <p className="pd-home-editorial__newcomer-copy">
            <span>Start with a sample dataset to explore the maps, networks, and timelines.</span>
            <span>You can upload your own data whenever you're ready.</span>
          </p>
        </div>
        <div className="pd-home-editorial__banner-decor" aria-hidden="true">
          <img className="pd-home-editorial__banner-collage pd-home-editorial__banner-collage--lower-left" src={bannerLowerLeft} alt="" draggable="false" />
          <img className="pd-home-editorial__banner-collage pd-home-editorial__banner-collage--upper-right" src={bannerUpperRight} alt="" draggable="false" />
        </div>
      </div>
    </main>
  );
}
