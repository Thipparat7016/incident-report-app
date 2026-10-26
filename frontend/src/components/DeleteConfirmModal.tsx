import React, { useState } from 'react';
import { Trash2 } from 'lucide-react';
import type { Incident } from '../types/incident';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  incident: Incident | null;
  onClose: () => void;
  onConfirm: (id: number) => Promise<void>;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  incident,
  onClose,
  onConfirm,
}) => {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !incident) return null;

  const handleDelete = async () => {
    try {
      setDeleting(true);
      setError(null);
      await onConfirm(incident.id);
      onClose();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to delete report.');
      }
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-content" style={{ maxWidth: '480px' }} onClick={(e) => e.stopPropagation()}>
        <div className="delete-modal-body">
          <div className="delete-icon-circle" aria-hidden="true">
            <Trash2 size={24} strokeWidth={2.2} />
          </div>
          <div className="delete-content-text">
            <h3>Delete this report?</h3>
            <p>
              “{incident.title}” will be permanently removed. This action can’t be undone.
            </p>
          </div>
        </div>

        {error && (
          <div style={{ padding: '0 28px' }}>
            <div className="error-banner" role="alert">
              <span>{error}</span>
            </div>
          </div>
        )}

        <div className="modal-footer">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onClose}
            disabled={deleting}
          >
            Cancel
          </button>
          <button
            id="btn-confirm-delete"
            type="button"
            className="btn btn-danger"
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting ? 'Deleting...' : 'Delete report'}
          </button>
        </div>
      </div>
    </div>
  );
};
