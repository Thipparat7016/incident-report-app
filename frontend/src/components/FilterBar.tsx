import React from 'react';
import { Search, Plus } from 'lucide-react';

interface FilterBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  selectedStatus: string;
  onStatusChange: (status: string) => void;
  onNewReport: () => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  selectedStatus,
  onStatusChange,
  onNewReport,
}) => {
  return (
    <div className="filter-wrapper">
      <div className="filter-bar">
        <div className="search-input-wrapper">
          <Search className="search-icon" size={18} />
          <input
            id="input-search"
            type="text"
            className="input-text search-input"
            placeholder="Search by title or description"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>

        <div className="filter-selects-group">
          <select
            id="select-category"
            className="select-input"
            value={selectedCategory}
            onChange={(e) => onCategoryChange(e.target.value)}
            aria-label="Filter by category"
          >
            <option value="All">All categories</option>
            <option value="Safety">Safety</option>
            <option value="Maintenance">Maintenance</option>
          </select>

          <select
            id="select-status"
            className="select-input"
            value={selectedStatus}
            onChange={(e) => onStatusChange(e.target.value)}
            aria-label="Filter by status"
          >
            <option value="All">All statuses</option>
            <option value="Open">Open</option>
            <option value="In Progress">In Progress</option>
            <option value="Success">Success</option>
          </select>
        </div>
      </div>

      {/* Mobile action button matching image 1 */}
      <div className="mobile-new-report-container" style={{ display: 'none', marginBottom: '16px' }}>
        <button
          type="button"
          className="btn btn-primary-ghost btn-full-width"
          onClick={onNewReport}
        >
          <Plus size={18} strokeWidth={2.5} />
          New report
        </button>
      </div>
    </div>
  );
};
