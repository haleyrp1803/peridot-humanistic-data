/*
 * Editorial sample-selection surface. This page presents existing first-class
 * sample definitions; App.jsx remains the sole owner of their loading, mapping,
 * download URLs, and active-dataset state. No sample is activated on page entry.
 */
import React, { useState } from 'react';
import './styles/workspaces/sample-selection.css';

// Artwork lives in the existing root assets directory. Static imports allow
// Vite to include these files in production builds as well as local previews.
import letterImage from '../assets/early_modern_letter.png';
import mediciFamilyTreeImage from '../assets/1569_medici_family_tree.jpg';
import cardinalPortrait from "../assets/Cardinal_Carlo_de'_Medici.jpg";

const sampleImages = {
  'correspondence-network': { src: letterImage, alt: 'Early modern letter', position: 'center' },
  'family-tree': { src: mediciFamilyTreeImage, alt: 'Medici family tree from 1569', position: 'center' },
  'cardinals-1600-1640': { src: cardinalPortrait, alt: 'Portrait of Cardinal Carlo de Medici', position: 'center 23%' },
};

const cardCopy = {
  'correspondence-network': {
    heading: 'Correspondence',
    eyebrow: 'Early Modern Tuscany',
    summary: 'Explore letters exchanged between historical figures, their relationships, and their geographical connections.',
    metadata: '500 correspondence records',
  },
  'family-tree': {
    heading: 'Genealogy',
    eyebrow: 'European Dynasties',
    summary: 'Explore family relationships, marriage alliances, and connections across generations.',
    metadata: 'Parentage, partnerships, and lifespans',
  },
  'cardinals-1600-1640': {
    heading: 'Cardinals',
    eyebrow: 'The Sacred College, 1600–1640',
    summary: 'Explore the creation of cardinals, their political origins, and participation in papal conclaves.',
    metadata: '176 cardinals · Conclave attendance',
  },
};

export function PeridotSampleSelectionPage({
  sampleDatasets = [],
  sampleLoadingId = '',
  onExploreSample,
  onEditSampleMapping,
  onDownloadTemplate,
  onUploadData,
  activeSourceLabel,
  onEditActiveMapping,
  staging,
  onContinueStaging,
  onClearStaging,
}) {
  const [detailsId, setDetailsId] = useState('');

  return (
    <main className="pd-samples" aria-labelledby="pd-samples-title">
      <div className="pd-samples__inner">
        <header className="pd-samples__heading">
          <h1 id="pd-samples-title">Choose a Sample Dataset</h1>
          <div className="pd-samples__rule" aria-hidden="true"><span>◆</span></div>
          <p>Explore Peridot with a prepared dataset, or start with a template.</p>
        </header>

        <div className="pd-samples__grid">
          {sampleDatasets.map((sample) => {
            const copy = cardCopy[sample.id] || {
              heading: sample.title,
              eyebrow: sample.format,
              summary: sample.description,
              metadata: sample.format,
            };
            const illustration = sampleImages[sample.id];
            const busy = Boolean(sampleLoadingId);
            const expanded = detailsId === sample.id;
            return (
              <article className="pd-samples__card" key={sample.id}>
                <div className="pd-samples__image">
                  {illustration ? (
                    <img
                      src={illustration.src}
                      alt={illustration.alt}
                      className={sample.id === 'cardinals-1600-1640' ? 'pd-samples__cardinal-portrait' : undefined}
                      style={{ objectPosition: illustration.position }}
                      decoding="async"
                    />
                  ) : (
                    <span aria-label={`Illustration placeholder for ${copy.heading}`}>?</span>
                  )}
                </div>
                <div className="pd-samples__card-content">
                  <h2>{copy.heading}</h2>
                  <p className="pd-samples__eyebrow">{copy.eyebrow}</p>
                  <p className="pd-samples__summary">{copy.summary}</p>
                  <p className="pd-samples__metadata">{copy.metadata}</p>
                  <button
                    type="button"
                    className="peridot-button-primary pd-samples__use"
                    onClick={() => onExploreSample?.(sample.id)}
                    disabled={busy}
                  >
                    {sampleLoadingId === sample.id ? 'Loading sample…' : 'Use Sample'}
                    {sampleLoadingId !== sample.id && <span aria-hidden="true">→</span>}
                  </button>
                  <div className="pd-samples__utilities">
                    <button type="button" disabled={busy} onClick={() => onEditSampleMapping?.(sample.id)}>Edit mapping</button>
                    <a href={sample.downloadUrl} download={sample.fileName}>Download source</a>
                    <button type="button" aria-expanded={expanded} onClick={() => setDetailsId(expanded ? '' : sample.id)}>
                      {expanded ? 'Hide details' : 'Details'}
                    </button>
                  </div>
                  {expanded && (
                    <div className="pd-samples__details">
                      <p>{sample.description}</p>
                      <p>{sample.teachingNote}</p>
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>

        <section className="pd-samples__template" aria-labelledby="pd-samples-template-title">
          <span className="pd-samples__file-icon" aria-hidden="true">
            <svg viewBox="0 0 40 44" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"><path d="M8 2h16l9 9v31H8z"/><path d="M24 2v10h9M14 21h13M14 27h13M14 33h9"/></svg>
          </span>
          <div className="pd-samples__template-copy">
            <h2 id="pd-samples-template-title">Start with Your Own Data</h2>
            <p>Download a template to begin preparing your data for Peridot.</p>
          </div>
          <div className="pd-samples__entry-actions">
            <button type="button" className="peridot-button-secondary pd-samples__template-button" onClick={onDownloadTemplate}>↓&nbsp; Download Template</button>
            <label className="peridot-button-secondary pd-samples__template-button pd-samples__upload">
              Upload Your Data
              <input type="file" accept=".csv,.tsv,.xlsx,.xlsm,.xls,text/csv,text/tab-separated-values" onChange={onUploadData} className="sr-only" aria-label="Choose a file to upload to Peridot" />
            </label>
          </div>
        </section>
        {staging ? (
          <section className="pd-samples__staged" aria-live="polite">
            <div>
              <h2>{staging.status === 'error' ? 'File could not be opened' : staging.status === 'parsing' ? 'Reading your file…' : staging.editingActiveData ? 'Mapped data ready to edit' : 'Data staged for mapping'}</h2>
              {staging.status === 'error' ? (
                <>
                  <p>{staging.fileLabel}</p>
                  <p role="alert" style={{ color: '#813a31', fontWeight: 600, maxWidth: '68ch' }}>{staging.errorMessage || 'Peridot could not read this file.'}</p>
                  <p>Supported formats: CSV, TSV, XLSX, XLSM, and XLS. Your existing dataset has not been changed.</p>
                </>
              ) : staging.status === 'parsing' ? (
                <p>{staging.fileLabel} · {staging.statusMessage || 'Reading file structure…'}</p>
              ) : (
                <p>{staging.fileLabel} · {staging.rowCount || 0} rows · {staging.columnCount || 0} columns</p>
              )}
            </div>
            <div className="pd-samples__entry-actions">
              {staging.status === 'ready' && <button type="button" className="peridot-button-primary" onClick={onContinueStaging}>{staging.editingActiveData ? 'Continue editing' : 'Open mapping workspace'}</button>}
              <button type="button" className="peridot-button-secondary" onClick={onClearStaging}>{staging.status === 'error' ? 'Dismiss' : staging.editingActiveData ? 'Cancel edit' : 'Clear staged data'}</button>
            </div>
          </section>
        ) : onEditActiveMapping ? (
          <div className="pd-samples__active-source">
            <span>Current source: <strong>{activeSourceLabel}</strong></span>
            <button type="button" onClick={onEditActiveMapping}>Edit active mapping</button>
          </div>
        ) : null}
      </div>
    </main>
  );
}
