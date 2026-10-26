import React from 'react';
import { Shield, Plus } from 'lucide-react';

interface HeaderProps {
  onNewReport: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onNewReport }) => {
  return (
    <header className="header-wrapper">
      <div className="header-brand">
        <div className="header-icon-box" aria-hidden="true">
          <Shield size={24} strokeWidth={2.2} />
        </div>
        <div>
          <h1 className="header-title">Incident Reports</h1>
          <p className="header-subtitle">Track, update and resolve safety and maintenance issues.</p>
        </div>
      </div>
      <button
        id="btn-new-report-header"
        type="button"
        className="btn btn-primary-ghost"
        onClick={onNewReport}
      >
        <Plus size={18} strokeWidth={2.5} />
        New report
      </button>
    </header>
  );
};
