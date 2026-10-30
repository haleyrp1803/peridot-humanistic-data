/*
 * Data workspace landing and sample-selection surface.
 *
 * This is a presentation boundary: App.jsx continues to own the active source,
 * sample activation, file upload/staging, canonical mappings, and edits.
 * Tabs organize entry choices; no sample is loaded or mapping changed by
 * switching tabs. The persistent status panel keeps edit mapping discoverable.
 */
import React, { useState } from 'react';
import './styles/workspaces/sample-selection.css';

import letterImage from '../assets/early_modern_letter.png';
import mediciFamilyTreeImage from '../assets/1569_medici_family_tree.jpg';
import cardinalPortrait from "../assets/Cardinal_Carlo_de'_Medici.jpg";

const sampleImages = {
  'correspondence-network': { src: letterImage, alt: 'Early modern letter', position: 'center' },
  'family-tree': { src: mediciFamilyTreeImage, alt: 'Medici family tree from 1569', position: 'center' },
  'cardinals-1600-1640': { src: cardinalPortrait, alt: 'Portrait of Cardinal Carlo de Medici', position: 'center 23%' },
};
const cardCopy = {
  'correspondence-network': { heading: 'Correspondence', eyebrow: 'Early Modern Tuscany', summary: 'Explore letters exchanged between historical figures, their relationships, and their geographical connections.', metadata: '500 correspondence records' },
  'family-tree': { heading: 'Genealogy', eyebrow: 'European Dynasties', summary: 'Explore family relationships, marriage alliances, and connections across generations.', metadata: 'Parentage, partnerships, and lifespans' },
  'cardinals-1600-1640': { heading: 'Cardinals', eyebrow: 'The Sacred College, 1600–1640', summary: 'Explore the creation of cardinals, their political origins, and participation in papal conclaves.', metadata: '176 cardinals · Conclave attendance' },
};

function DataIcon({ kind }) {
  if (kind === 'sample') return <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinejoin="round" aria-hidden="true"><rect x="11" y="11" width="18" height="18" rx="2"/><rect x="35" y="11" width="18" height="18" rx="2"/><rect x="11" y="35" width="18" height="18" rx="2"/><rect x="35" y="35" width="18" height="18" rx="2"/></svg>;
  if (kind === 'upload') return <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M32 44V9m-13 13L32 9l13 13"/><path d="M12 44v10a4 4 0 0 0 4 4h32a4 4 0 0 0 4-4V44"/></svg>;
  return <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round" aria-hidden="true"><path d="M15 5h25l10 10v44H15z"/><path d="M40 5v11h10M22 27h21M22 34h21M22 41h16M22 48h13"/></svg>;
}

const TABS = [
  { id: 'start', label: 'Get Started' },
  { id: 'samples', label: 'Sample Datasets' },
  { id: 'templates', label: 'Templates' },
  { id: 'upload', label: 'Upload Data' },
];

export function PeridotSampleSelectionPage({
  sampleDatasets = [], sampleLoadingId = '', onExploreSample, onEditSampleMapping,
  onDownloadTemplate, onUploadData, activeSourceLabel, onEditActiveMapping,
  staging, onContinueStaging, onClearStaging,
}) {
  const [tab, setTab] = useState('start');
  const [hasSwitchedTabs, setHasSwitchedTabs] = useState(false);
  const selectTab = (nextTab) => {
    if (nextTab !== tab) {
      setHasSwitchedTabs(true);
      setTab(nextTab);
    }
  };
  const [detailsId, setDetailsId] = useState('');
  const busy = Boolean(sampleLoadingId);

  const uploadInput = (
    <label className="peridot-button-primary pd-data-entry__upload-button">
      Choose a File
      <input
        type="file" accept=".csv,.tsv,.xlsx,.xlsm,.xls,text/csv,text/tab-separated-values"
        onChange={(event) => { selectTab('upload'); onUploadData?.(event); }}
        className="sr-only" aria-label="Choose a CSV, TSV, XLSX, XLSM, or XLS file to upload to Peridot"
      />
    </label>
  );

  const sampleCards = (
    <div className="pd-samples__grid">
      {sampleDatasets.map((sample) => {
        const copy = cardCopy[sample.id] || { heading: sample.title, eyebrow: sample.format, summary: sample.description, metadata: sample.format };
        const illustration = sampleImages[sample.id];
        const expanded = detailsId === sample.id;
        return <article className="pd-samples__card" key={sample.id}>
          <div className="pd-samples__image">
            {illustration ? <img src={illustration.src} alt={illustration.alt} className={sample.id === 'cardinals-1600-1640' ? 'pd-samples__cardinal-portrait' : undefined} style={{ objectPosition: illustration.position }} decoding="async" /> : <span aria-label={`Illustration placeholder for ${copy.heading}`}>?</span>}
          </div>
          <div className="pd-samples__card-content">
            <h3>{copy.heading}</h3>
            <p className="pd-samples__eyebrow">{copy.eyebrow}</p>
            <p className="pd-samples__summary">{copy.summary}</p>
            <p className="pd-samples__metadata">{copy.metadata}</p>
            <button type="button" className="peridot-button-primary pd-samples__use" onClick={() => onExploreSample?.(sample.id)} disabled={busy}>
              {sampleLoadingId === sample.id ? 'Loading sample…' : 'Use Sample'} {sampleLoadingId !== sample.id && <span aria-hidden="true">→</span>}
            </button>
            <div className="pd-samples__utilities">
              <button type="button" disabled={busy} onClick={() => onEditSampleMapping?.(sample.id)}>Edit mapping</button>
              <a href={sample.downloadUrl} download={sample.fileName}>Download source</a>
              <button type="button" aria-expanded={expanded} onClick={() => setDetailsId(expanded ? '' : sample.id)}>{expanded ? 'Hide details' : 'Details'}</button>
            </div>
            {expanded && <div className="pd-samples__details"><p>{sample.description}</p><p>{sample.teachingNote}</p></div>}
          </div>
        </article>;
      })}
    </div>
  );

  return <main className="pd-samples pd-data-entry" aria-labelledby="pd-samples-title">
    <div className="pd-samples__inner">
      <header className="pd-samples__heading">
        <h1 id="pd-samples-title">Data</h1>
        <p>Choose how to begin working with Peridot or manage the dataset you have already loaded.</p>
      </header>
      <nav className="pd-data-entry__tabs" aria-label="Data workspace sections">
        {TABS.map(({ id, label }) => <button key={id} type="button" className={`pd-data-entry__tab${tab === id ? ' is-active' : ''}`} aria-current={tab === id ? 'page' : undefined} onClick={() => selectTab(id)}>{label}</button>)}
      </nav>

      <div className={`pd-data-entry__content pd-data-entry__content--${tab}${hasSwitchedTabs ? ' pd-data-entry__content--tab-switch' : ''}`} key={tab}>
        {tab === 'start' && <section aria-labelledby="pd-data-entry-start-title">
          <h2 id="pd-data-entry-start-title" className="pd-data-entry__section-title">How would you like to begin?</h2>
          <p className="pd-data-entry__section-intro">Explore a prepared dataset, use a template to organize your own research, or upload an existing file.</p>
          <div className="pd-data-entry__choices">
            <article className="pd-data-entry__choice pd-data-entry__choice--samples"><span className="pd-data-entry__icon-medallion"><DataIcon kind="sample"/></span><h3>Explore Sample Datasets</h3><p>Try Peridot with prepared research data and see what you can discover.</p><button type="button" className="peridot-button-primary" onClick={() => selectTab('samples')}>Explore Samples <span aria-hidden="true">→</span></button></article>
            <article className="pd-data-entry__choice pd-data-entry__choice--templates"><span className="pd-data-entry__icon-medallion"><DataIcon kind="template"/></span><h3>Download a Template</h3><p>Use a model to help organize your own research data.</p><button type="button" className="peridot-button-primary" onClick={() => selectTab('templates')}>Browse Templates <span aria-hidden="true">→</span></button></article>
            <article className="pd-data-entry__choice pd-data-entry__choice--upload"><span className="pd-data-entry__icon-medallion"><DataIcon kind="upload"/></span><h3>Upload Your Own Data</h3><p>Import an existing CSV, TSV, XLSX, XLSM, or XLS file.</p><button type="button" className="peridot-button-primary" onClick={() => selectTab('upload')}>Upload Data <span aria-hidden="true">→</span></button></article>
          </div>
        </section>}
        {tab === 'samples' && <section aria-labelledby="pd-data-entry-samples-title">
          <h2 id="pd-data-entry-samples-title" className="pd-data-entry__section-title">Explore Sample Datasets</h2>
          <p className="pd-data-entry__section-intro">Use prepared research data to explore Peridot. You can also download each source file or inspect its mapping.</p>
          {sampleCards}
        </section>}
        {tab === 'templates' && <section aria-labelledby="pd-data-entry-templates-title">
          <h2 id="pd-data-entry-templates-title" className="pd-data-entry__section-title">Download a Template</h2>
          <p className="pd-data-entry__section-intro">Use a starter spreadsheet to organize your research, or download a complete sample dataset to learn from its structure.</p>
          <div className="pd-data-entry__resource"><DataIcon kind="template"/><div><h3>Simple Data Template</h3><p>Download Peridot's existing correspondence-oriented CSV template and adapt its columns to your research.</p></div><button type="button" className="peridot-button-primary" onClick={onDownloadTemplate}>Download Template <span aria-hidden="true">↓</span></button></div>
          <div className="pd-data-entry__note">Working with different kinds of historical data? The <button type="button" onClick={() => selectTab('samples')}>Sample Datasets</button> tab includes downloadable correspondence, genealogy, and cardinals examples. You do not need to use the template's columns to upload your own data.</div>
        </section>}
        {tab === 'upload' && <section aria-labelledby="pd-data-entry-upload-title">
          <h2 id="pd-data-entry-upload-title" className="pd-data-entry__section-title">Upload Your Own Data</h2>
          <p className="pd-data-entry__section-intro">Select an existing research file. Peridot will guide you through how its columns should be interpreted before you use the data.</p>
          <div className="pd-data-entry__upload-area"><DataIcon kind="upload"/><h3>Choose a file to begin</h3><p>Supported formats: CSV, TSV, XLSX, XLSM, XLS.</p>{uploadInput}</div>
          <div className="pd-data-entry__note">You can return to Data later to change mapping choices, including delimiters, identity fields, dates, places, and evidence.</div>
        </section>}
      </div>

      <section className={`pd-data-entry__status${staging ? ' pd-data-entry__status--staging' : onEditActiveMapping ? ' pd-data-entry__status--active' : ' pd-data-entry__status--empty'}`} aria-live="polite" aria-labelledby="pd-data-entry-status-title">
        {staging ? <>
          <DataIcon kind="template"/>
          <div className="pd-data-entry__status-copy"><h2 id="pd-data-entry-status-title">{staging.status === 'error' ? 'File could not be opened' : staging.status === 'parsing' ? 'Reading your file…' : staging.editingActiveData ? 'Mapped data ready to edit' : 'Data staged for mapping'}</h2><p>{staging.fileLabel}{staging.status === 'ready' ? ` · ${staging.rowCount || 0} rows · ${staging.columnCount || 0} columns` : ''}</p>{staging.status === 'error' && <p role="alert">{staging.errorMessage || 'Peridot could not read this file.'} Your existing dataset has not been changed.</p>}</div>
          <div className="pd-data-entry__status-actions">{staging.status === 'ready' && <button type="button" className="peridot-button-primary" onClick={onContinueStaging}>{staging.editingActiveData ? 'Continue Editing' : 'Open Mapping'}</button>}<button type="button" className="peridot-button-secondary" onClick={onClearStaging}>{staging.status === 'error' ? 'Dismiss' : staging.editingActiveData ? 'Cancel Edit' : 'Clear Staged Data'}</button></div>
        </> : onEditActiveMapping ? <>
          <DataIcon kind="template"/><div className="pd-data-entry__status-copy"><h2 id="pd-data-entry-status-title">Your Active Dataset</h2><p className="pd-data-entry__filename">{activeSourceLabel || 'Current dataset'}</p><p>You can always return here to review or edit how Peridot interprets your dataset.</p></div><div className="pd-data-entry__status-actions"><button type="button" className="peridot-button-primary" onClick={onEditActiveMapping}>Edit Mapping</button></div>
        </> : <>
          <DataIcon kind="template"/><div className="pd-data-entry__status-copy"><h2 id="pd-data-entry-status-title">No Dataset Loaded</h2><p>You haven't loaded a dataset yet. Choose a sample dataset to explore or upload your own research data. Once a dataset is loaded, you can always return here to review or edit how Peridot interprets it.</p></div>
        </>}
      </section>
    </div>
  </main>;
}
