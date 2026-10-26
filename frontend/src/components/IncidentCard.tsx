import React from 'react';
import { Shield, Wrench, Pencil, Trash2 } from 'lucide-react';
import type { Incident } from '../types/incident';
import { formatIncidentDate } from '../utils/formatters';

interface IncidentCardProps {
  incident: Incident;
  onEdit: (incident: Incident) => void;
  onDelete: (incident: Incident) => void;
}

export const IncidentCard: React.FC<IncidentCardProps> = ({
  incident,
  onEdit,
  onDelete,
}) => {
  const getStatusClass = (status: string) => {
    switch (status) {
      case 'Open':
        return 'status-open';
      case 'In Progress':
        return 'status-inprogress';
      case 'Success':
        return 'status-success';
      default:
        return '';
    }
  };

  const getStatusDotClass = (status: string) => {
    switch (status) {
      case 'Open':
        return 'dot-open';
      case 'In Progress':
        return 'dot-inprogress';
      case 'Success':
        return 'dot-success';
      default:
        return '';
    }
  };

  return (
    <article className="incident-card desktop-view" id={`incident-card-${incident.id}`}>
      <div className="card-top">
        <h3 className="card-title">{incident.title}</h3>
        <p className="card-desc">{incident.description}</p>
      </div>

      <div className="card-right">
        <div className="card-badges">
          <span className="badge-category">
            {incident.category === 'Safety' ? (
              <Shield size={14} strokeWidth={2.2} />
            ) : (
              <Wrench size={14} strokeWidth={2.2} />
            )}
            {incident.category}
          </span>

          <span className={`badge-status ${getStatusClass(incident.status)}`}>
            <span className={`status-dot ${getStatusDotClass(incident.status)}`} aria-hidden="true" />
            {incident.status}
          </span>
        </div>

        <div className="card-bottom-row">
          <div className="card-date">
            {formatIncidentDate(incident.created_at)}
          </div>

          <div className="card-action-btns">
            <button
              type="button"
              className="icon-btn btn-edit"
              title="Edit report"
              aria-label={`Edit ${incident.title}`}
              onClick={() => onEdit(incident)}
            >
              <Pencil size={18} />
            </button>
            <button
              type="button"
              className="icon-btn btn-delete"
              title="Delete report"
              aria-label={`Delete ${incident.title}`}
              onClick={() => onDelete(incident)}
            >
              <Trash2 size={18} />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
};
