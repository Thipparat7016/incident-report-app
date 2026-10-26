import React, { useState, useEffect } from 'react';
import { X, Shield, Wrench, Clock } from 'lucide-react';
import type { Incident, IncidentCategory, IncidentStatus } from '../types/incident';
import { formatIncidentDate } from '../utils/formatters';

interface IncidentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    title: string;
    description: string;
    category: IncidentCategory;
    status: IncidentStatus;
  }) => Promise<void>;
  incident?: Incident | null; // If null, mode is Create; if present, mode is Edit
}

export const IncidentModal: React.FC<IncidentModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  incident,
}) => {
  const isEditMode = Boolean(incident);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<IncidentCategory>('Safety');
  const [status, setStatus] = useState<IncidentStatus>('Open');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (incident) {
      setTitle(incident.title);
      setDescription(incident.description);
      setCategory(incident.category);
      setStatus(incident.status);
    } else {
      setTitle('');
      setDescription('');
      setCategory('Safety');
      setStatus('Open');
    }
    setError(null);
  }, [incident, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanTitle = title.trim();
    const cleanDesc = description.trim();

    if (!cleanTitle) {
      setError('Title is required.');
      return;
    }
    if (cleanTitle.length > 100) {
      setError('Title must be up to 100 characters.');
      return;
    }
    if (!cleanDesc) {
      setError('Description is required.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      await onSubmit({
        title: cleanTitle,
        description: cleanDesc,
        category,
        status,
      });
      onClose();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{isEditMode ? 'Edit incident report' : 'New incident report'}</h2>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Close dialog"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && (
              <div className="error-banner" role="alert">
                <span>{error}</span>
              </div>
            )}

            <div className="form-group">
              <label htmlFor="incident-title" className="form-label">
                Title <span className="required-star">*</span>
              </label>
              <input
                id="incident-title"
                type="text"
                className="input-text"
                placeholder="e.g. Wet floor near loading dock"
                value={title}
                maxLength={100}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
              <span className="form-hint">Short and specific. Up to 100 characters.</span>
            </div>

            <div className="form-group">
              <label htmlFor="incident-description" className="form-label">
                Description <span className="required-star">*</span>
              </label>
              <textarea
                id="incident-description"
                className="form-textarea"
                placeholder="What happened, where, and any immediate risk?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Category</label>
              <div className="category-radio-group">
                <div
                  className={`category-radio-card ${category === 'Safety' ? 'selected' : ''}`}
                  onClick={() => setCategory('Safety')}
                  role="radio"
                  aria-checked={category === 'Safety'}
                  tabIndex={0}
                >
                  <span className="category-radio-indicator" />
                  <span className="category-radio-text">
                    <Shield size={16} strokeWidth={2.2} />
                    Safety
                  </span>
                </div>

                <div
                  className={`category-radio-card ${category === 'Maintenance' ? 'selected' : ''}`}
                  onClick={() => setCategory('Maintenance')}
                  role="radio"
                  aria-checked={category === 'Maintenance'}
                  tabIndex={0}
                >
                  <span className="category-radio-indicator" />
                  <span className="category-radio-text">
                    <Wrench size={16} strokeWidth={2.2} />
                    Maintenance
                  </span>
                </div>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="incident-status" className="form-label">Status</label>
              <select
                id="incident-status"
                className="select-input"
                value={status}
                onChange={(e) => setStatus(e.target.value as IncidentStatus)}
              >
                <option value="Open">Open</option>
                <option value="In Progress">In Progress</option>
                <option value="Success">Success</option>
              </select>
            </div>

            <div className="info-note">
              <Clock size={16} />
              <span>
                {isEditMode && incident
                  ? `Created ${formatIncidentDate(incident.created_at)} (cannot be changed)`
                  : 'Created at is recorded automatically when you save.'}
              </span>
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary-solid"
              disabled={submitting}
            >
              {submitting
                ? 'Saving...'
                : isEditMode
                ? 'Save changes'
                : 'Create report'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
