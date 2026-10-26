import React from 'react';
import type { IncidentStats } from '../types/incident';

interface StatsSummaryProps {
  stats: IncidentStats;
  selectedStatus: string;
  onSelectStatus: (status: string) => void;
}

export const StatsSummary: React.FC<StatsSummaryProps> = ({
  stats,
  selectedStatus,
  onSelectStatus,
}) => {
  return (
    <section className="stats-grid" aria-label="Incident summary statistics">
      <div
        className={`stat-card ${selectedStatus === 'All' ? 'active' : ''}`}
        onClick={() => onSelectStatus('All')}
        role="button"
        tabIndex={0}
      >
        <div className="stat-card-header">
          <span>Total reports</span>
        </div>
        <div className="stat-value">{stats.total}</div>
      </div>

      <div
        className={`stat-card ${selectedStatus === 'Open' ? 'active' : ''}`}
        onClick={() => onSelectStatus(selectedStatus === 'Open' ? 'All' : 'Open')}
        role="button"
        tabIndex={0}
      >
        <div className="stat-card-header">
          <span className="status-dot dot-open" aria-hidden="true" />
          <span>Open</span>
        </div>
        <div className="stat-value">{stats.open}</div>
      </div>

      <div
        className={`stat-card ${selectedStatus === 'In Progress' ? 'active' : ''}`}
        onClick={() => onSelectStatus(selectedStatus === 'In Progress' ? 'All' : 'In Progress')}
        role="button"
        tabIndex={0}
      >
        <div className="stat-card-header">
          <span className="status-dot dot-inprogress" aria-hidden="true" />
          <span>In Progress</span>
        </div>
        <div className="stat-value">{stats.in_progress}</div>
      </div>

      <div
        className={`stat-card ${selectedStatus === 'Success' ? 'active' : ''}`}
        onClick={() => onSelectStatus(selectedStatus === 'Success' ? 'All' : 'Success')}
        role="button"
        tabIndex={0}
      >
        <div className="stat-card-header">
          <span className="status-dot dot-success" aria-hidden="true" />
          <span>Success</span>
        </div>
        <div className="stat-value">{stats.success}</div>
      </div>
    </section>
  );
};
