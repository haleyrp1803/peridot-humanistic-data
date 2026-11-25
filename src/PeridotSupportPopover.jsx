import React, { useEffect, useId, useRef, useState } from 'react';
import './PeridotSupportPopover.css';

// This disclosure owns no research state. Its links are external and preview
// rows are deliberately noninteractive until real funding destinations exist.
function GemIcon() {
  return (
    <svg className="peridot-support-gem" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinejoin="round" aria-hidden="true" focusable="false">
      <path d="M2 9 7 3h10l5 6-10 13Z M2 9h20 M7 3l5 6 5-6 M7 9l5 13 5-13" />
    </svg>
  );
}

// Small decorative line icons keep the provider rows in Peridot's own
// visual language. Preview and live rows share exactly the same content.
function ProviderIcon({ id }) {
  return (
    <svg className="peridot-support-provider-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      {id === 'github' ? (
        <>
          <path d="M9 19c-4.3 1.4-4.3-2.5-6-3m12 6v-3.6a3.1 3.1 0 0 0-.9-2.4c3-.3 6.1-1.5 6.1-6.7a5.2 5.2 0 0 0-1.4-3.7 4.9 4.9 0 0 0-.1-3.6S17.6 1.7 15 3.4a13 13 0 0 0-6 0C6.4 1.7 5.3 2 5.3 2a4.9 4.9 0 0 0-.1 3.6 5.2 5.2 0 0 0-1.4 3.7c0 5.2 3.1 6.4 6.1 6.7a3.1 3.1 0 0 0-.9 2.4V22" />
        </>
      ) : id === 'kofi' ? (
        <>
          <path d="M3 7h14v9a5 5 0 0 1-5 5H8a5 5 0 0 1-5-5Z M17 8h2a3 3 0 0 1 0 6h-2 M7 2v2 M11 2v2 M15 2v2" />
          <path d="M6 10v4" />
        </>
      ) : null}
    </svg>
  );
}

function ProviderExternalIcon() {
  return (
    <svg className="peridot-support-provider-external" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      <path d="M7 17 17 7M8 7h9v9" />
    </svg>
  );
}

export function PeridotSupportPopover({ support }) {
  const [open, setOpen] = useState(false);
  const root = useRef(null);
  const trigger = useRef(null);
  const panelId = useId();
  const headingId = useId();

  function closeAndRestoreFocus() {
    setOpen(false);
    trigger.current?.focus();
  }

  useEffect(() => {
    if (!open) return undefined;
    const outside = (event) => {
      if (!root.current?.contains(event.target)) setOpen(false);
    };
    const escape = (event) => {
      if (event.key !== 'Escape' || event.defaultPrevented) return;
      // Do not claim Escape from an actual modal. Document capture otherwise
      // precedes App's window-bubble Inspector Escape handler.
      if (document.querySelector('dialog[open][aria-modal="true"], [role="dialog"][aria-modal="true"]')) {
        setOpen(false);
        return;
      }
      event.preventDefault();
      event.stopPropagation();
      const ownedFocus = root.current?.contains(document.activeElement);
      setOpen(false);
      if (ownedFocus) trigger.current?.focus();
    };
    document.addEventListener('pointerdown', outside, true);
    // Click also covers keyboard-activated navigation (including same route).
    document.addEventListener('click', outside, true);
    document.addEventListener('keydown', escape, true);
    return () => {
      document.removeEventListener('pointerdown', outside, true);
      document.removeEventListener('click', outside, true);
      document.removeEventListener('keydown', escape, true);
    };
  }, [open]);

  return (
    <div className="peridot-support-root" ref={root}>
      <button ref={trigger} type="button" className="peridot-support-trigger" aria-label="Support Peridot" aria-expanded={open} aria-controls={panelId} onClick={() => setOpen(value => !value)}>
        <GemIcon />
        <span className="peridot-support-label">Support</span>
      </button>
      <section id={panelId} aria-labelledby={headingId} className="peridot-support-panel" hidden={!open}>
        <div className="peridot-support-heading">
          <GemIcon />
          <h2 id={headingId}>Support Peridot</h2>
          <button type="button" className="peridot-support-close" aria-label="Close support panel" onClick={closeAndRestoreFocus}>×</button>
        </div>
        <p>Peridot is free and open source. If you find it useful in your research, teaching, or exploration, you may choose to support its continued development.</p>
        {support.preview && <p className="peridot-support-preview">Development preview — funding links are not active.</p>}
        <div className="peridot-support-providers">
          {support.providers.map(provider => {
            const content = (
              <>
                <ProviderIcon id={provider.id} />
                <span className="peridot-support-provider-copy">
                  <strong>{provider.label}</strong>
                  <span>{provider.description}</span>
                </span>
                <ProviderExternalIcon />
              </>
            );
            return provider.url ? (
              <a key={provider.id} className="peridot-support-provider" href={provider.url} target="_blank" rel="noopener noreferrer" onClick={closeAndRestoreFocus}>{content}</a>
            ) : (
              <button key={provider.id} type="button" disabled className="peridot-support-provider">{content}</button>
            );
          })}
        </div>
        <p className="peridot-support-note">Financial support is entirely optional and does not affect access to Peridot.</p>
      </section>
    </div>
  );
}
