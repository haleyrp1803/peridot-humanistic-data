/*
 * Persistent user-feedback control.
 *
 * This component owns the complete public feedback path: the fixed navigation
 * trigger, dialog state, form fields, multiple-select checkbox groups, client
 * validation, and direct Formspree submission. It intentionally does not
 * collect uploaded datasets, filenames, browser fingerprints, or app state.
 *
 * Placement is supplied by `PeridotHamburgerMenu.jsx`, which keeps this control
 * directly beneath the persistent hamburger trigger everywhere that navigation
 * is visible. The endpoint is public by design; Formspree keeps the recipient
 * email configuration outside the shipped Peridot bundle.
 */

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

const FORMSPREE_ENDPOINT = 'https://formspree.io/f/xpqgabqo';

const FEEDBACK_TYPES = [
  'Question',
  'Bug report',
  'Issue',
  'Feature suggestion',
  'Other',
];

const PERIDOT_AREAS = [
  'Manage Your Data',
  'Visualize Your Data',
  'Explore Your Data',
  'Inspector',
  'Chart Visualizations',
  'Timeline',
  'Export',
  'Learn More',
  'General',
];

function toggleSelection(currentValues, nextValue) {
  return currentValues.includes(nextValue)
    ? currentValues.filter((value) => value !== nextValue)
    : [...currentValues, nextValue];
}

function FeedbackIcon() {
  return (
    <svg
      aria-hidden="true"
      className="peridot-feedback-trigger-icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4.75 5.75h14.5a1.5 1.5 0 0 1 1.5 1.5v8.5a1.5 1.5 0 0 1-1.5 1.5H10l-4.75 3v-3H4.75a1.5 1.5 0 0 1-1.5-1.5v-8.5a1.5 1.5 0 0 1 1.5-1.5Z" />
      <path d="M8 10.75h8" />
      <path d="M8 14h5.25" />
    </svg>
  );
}

export function PeridotFeedbackForm() {
  const [open, setOpen] = useState(false);
  const [feedbackTypes, setFeedbackTypes] = useState([]);
  const [areas, setAreas] = useState([]);
  const [message, setMessage] = useState('');
  const [taskContext, setTaskContext] = useState('');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const dialogTitleId = useMemo(() => 'peridot-feedback-dialog-title', []);
  const closeButtonRef = useRef(null);

  const resetForm = () => {
    setFeedbackTypes([]);
    setAreas([]);
    setMessage('');
    setTaskContext('');
    setEmail('');
    setStatus('idle');
    setErrorMessage('');
  };

  const closeDialog = () => {
    setOpen(false);
    window.setTimeout(resetForm, 180);
  };

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        closeDialog();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.requestAnimationFrame(() => closeButtonRef.current?.focus());

    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!message.trim()) {
      setErrorMessage('Please enter a message before submitting feedback.');
      setStatus('error');
      return;
    }

    setStatus('submitting');
    setErrorMessage('');

    const formData = new FormData();
    formData.append('_subject', 'New Peridot in-app feedback');
    formData.append('feedback_type', feedbackTypes.length ? feedbackTypes.join(', ') : 'Not specified');
    formData.append('peridot_area', areas.length ? areas.join(', ') : 'Not specified');
    formData.append('message', message.trim());
    formData.append('task_context', taskContext.trim() || 'Not provided');

    /*
     * Formspree treats a field literally named `email` as a reply address.
     * Leave it out entirely when the user declines to provide one; placeholder
     * text would make this intentionally optional field fail email validation.
     */
    if (email.trim()) {
      formData.append('email', email.trim());
    }

    formData.append('submission_source', 'Peridot in-app feedback form');

    try {
      const response = await fetch(FORMSPREE_ENDPOINT, {
        method: 'POST',
        body: formData,
        headers: {
          Accept: 'application/json',
        },
      });

      const responseBody = await response.json().catch(() => null);

      if (!response.ok) {
        const returnedErrors = Array.isArray(responseBody?.errors)
          ? responseBody.errors
            .map((entry) => entry?.message || entry?.field)
            .filter(Boolean)
            .join(' ')
          : '';

        throw new Error(
          returnedErrors || 'Formspree rejected the feedback submission. Please review the form and try again.',
        );
      }

      setStatus('success');
    } catch (error) {
      setStatus('error');
      setErrorMessage(
        error instanceof Error && error.message
          ? error.message
          : 'Your feedback could not be sent. Please check your connection and try again.',
      );
    }
  };

  return (
    <>
      <button
        type="button"
        className="peridot-feedback-trigger"
        onClick={() => setOpen(true)}
        aria-label="Send feedback about Peridot"
        title="Send feedback"
      >
        <FeedbackIcon />
      </button>

      {open ? createPortal(
        <div
          className="peridot-feedback-dialog-layer"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && status !== 'submitting') {
              closeDialog();
            }
          }}
        >
          <section
            className="peridot-feedback-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby={dialogTitleId}
          >
            <div className="peridot-feedback-dialog-header">
              <div>
                <p className="peridot-feedback-dialog-kicker">Peridot feedback</p>
                <h2 id={dialogTitleId}>Questions, bugs, and suggestions</h2>
              </div>
              <button
                type="button"
                className="peridot-feedback-close"
                ref={closeButtonRef}
                onClick={closeDialog}
                disabled={status === 'submitting'}
                aria-label="Close feedback form"
              >
                ×
              </button>
            </div>

            {status === 'success' ? (
              <div className="peridot-feedback-success" role="status">
                <h3>Thank you.</h3>
                <p>Your feedback has been sent. It will help guide future Peridot work.</p>
                <button type="button" className="peridot-button-primary" onClick={closeDialog}>
                  Close
                </button>
              </div>
            ) : (
              <form className="peridot-feedback-form" onSubmit={handleSubmit}>
                <fieldset>
                  <legend>Feedback type <span>(select any that apply)</span></legend>
                  <div className="peridot-feedback-choice-grid">
                    {FEEDBACK_TYPES.map((type) => (
                      <label key={type} className="peridot-feedback-choice">
                        <input
                          type="checkbox"
                          checked={feedbackTypes.includes(type)}
                          onChange={() => setFeedbackTypes((current) => toggleSelection(current, type))}
                        />
                        <span>{type}</span>
                      </label>
                    ))}
                  </div>
                </fieldset>

                <fieldset>
                  <legend>Area of Peridot <span>(select any that apply)</span></legend>
                  <div className="peridot-feedback-choice-grid peridot-feedback-area-grid">
                    {PERIDOT_AREAS.map((area) => (
                      <label key={area} className="peridot-feedback-choice">
                        <input
                          type="checkbox"
                          checked={areas.includes(area)}
                          onChange={() => setAreas((current) => toggleSelection(current, area))}
                        />
                        <span>{area}</span>
                      </label>
                    ))}
                  </div>
                </fieldset>

                <label className="peridot-feedback-field">
                  <span>Message <b aria-hidden="true">*</b></span>
                  <textarea
                    value={message}
                    onChange={(event) => {
                      setMessage(event.target.value);
                      if (status === 'error') {
                        setStatus('idle');
                        setErrorMessage('');
                      }
                    }}
                    required
                    rows="5"
                    placeholder="Describe your question, report, or suggestion."
                  />
                </label>

                <label className="peridot-feedback-field">
                  <span>What were you trying to do? <em>(optional)</em></span>
                  <textarea
                    value={taskContext}
                    onChange={(event) => setTaskContext(event.target.value)}
                    rows="3"
                    placeholder="For example: map a point dataset, inspect a record, export a chart."
                  />
                </label>

                <label className="peridot-feedback-field">
                  <span>Email address <em>(optional, for a reply)</em></span>
                  <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="name@example.edu"
                  />
                </label>

                <p className="peridot-feedback-privacy-note">
                  Your submission will be emailed to Peridot's creator, Haley Price. Thank you for helping her make Peridot better for everyone!
                </p>

                {status === 'error' ? (
                  <p className="peridot-feedback-error" role="alert">{errorMessage}</p>
                ) : null}

                <div className="peridot-feedback-actions">
                  <button
                    type="button"
                    className="peridot-button-secondary"
                    onClick={closeDialog}
                    disabled={status === 'submitting'}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="peridot-button-primary"
                    disabled={status === 'submitting'}
                  >
                    {status === 'submitting' ? 'Sending feedback…' : 'Send feedback'}
                  </button>
                </div>
              </form>
            )}
          </section>
        </div>,
        document.body,
      ) : null}
    </>
  );
}
