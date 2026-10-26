import { useState, useEffect, useCallback, useMemo } from 'react';
import type { Incident, IncidentCategory, IncidentStats, IncidentStatus } from './types/incident';
import { api } from './services/api';
import { Header } from './components/Header';
import { StatsSummary } from './components/StatsSummary';
import { FilterBar } from './components/FilterBar';
import { IncidentCard } from './components/IncidentCard';
import { IncidentModal } from './components/IncidentModal';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';
import { Pagination } from './components/Pagination';

export function App() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [stats, setStats] = useState<IncidentStats>({
    total: 0,
    open: 0,
    in_progress: 0,
    success: 0,
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;

  // Modal states
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingIncident, setEditingIncident] = useState<Incident | null>(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingIncident, setDeletingIncident] = useState<Incident | null>(null);

  // Fetch stats and incident reports
  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [incidentsData, statsData] = await Promise.all([
        api.getIncidents(searchQuery, selectedCategory, selectedStatus),
        api.getStats(),
      ]);

      setIncidents(incidentsData);
      setStats(statsData);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to connect to the backend API.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, selectedCategory, selectedStatus]);

  useEffect(() => {
    fetchData();
    setCurrentPage(1); // Reset to page 1 on filter/search change
  }, [fetchData]);

  // Paginated incidents
  const paginatedIncidents = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return incidents.slice(startIndex, startIndex + itemsPerPage);
  }, [incidents, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(incidents.length / itemsPerPage) || 1;

  // Modal actions
  const handleOpenCreateModal = () => {
    setEditingIncident(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (incident: Incident) => {
    setEditingIncident(incident);
    setIsFormModalOpen(true);
  };

  const handleOpenDeleteModal = (incident: Incident) => {
    setDeletingIncident(incident);
    setIsDeleteModalOpen(true);
  };

  const handleFormSubmit = async (data: {
    title: string;
    description: string;
    category: IncidentCategory;
    status: IncidentStatus;
  }) => {
    if (editingIncident) {
      // Edit existing incident
      await api.updateIncident(editingIncident.id, data);
    } else {
      // Create new incident
      await api.createIncident({
        title: data.title,
        description: data.description,
        category: data.category,
        status: data.status,
      });
    }
    await fetchData();
  };

  const handleDeleteConfirm = async (id: number) => {
    await api.deleteIncident(id);
    await fetchData();
  };

  return (
    <div className="app-container">
      {/* Header with App Logo and New Report button */}
      <Header onNewReport={handleOpenCreateModal} />

      {/* Stats Summary Cards */}
      <StatsSummary
        stats={stats}
        selectedStatus={selectedStatus}
        onSelectStatus={(status) => setSelectedStatus(status)}
      />

      {/* Filter and Search Bar */}
      <FilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        selectedStatus={selectedStatus}
        onStatusChange={setSelectedStatus}
        onNewReport={handleOpenCreateModal}
      />

      {/* Global Error Banner */}
      {error && (
        <div className="error-banner" role="alert">
          <div>
            <strong>Error:</strong> {error}
          </div>
          <button
            type="button"
            className="btn btn-secondary"
            style={{ padding: '4px 10px', fontSize: '12px' }}
            onClick={fetchData}
          >
            Retry
          </button>
        </div>
      )}

      {/* Content Area */}
      {isLoading ? (
        <div className="loading-spinner-container">
          <div className="spinner" />
          <p>Loading incident reports...</p>
        </div>
      ) : paginatedIncidents.length === 0 ? (
        <div className="empty-state">
          <h3>No reports found</h3>
          <p>
            {searchQuery || selectedCategory !== 'All' || selectedStatus !== 'All'
              ? 'No incidents match your current search or filter criteria.'
              : 'There are currently no reported incidents in the system.'}
          </p>
          <button
            type="button"
            className="btn btn-primary-solid"
            onClick={handleOpenCreateModal}
          >
            + Create your first report
          </button>
        </div>
      ) : (
        <>
          <section className="incident-list" aria-label="Incident Reports List">
            {paginatedIncidents.map((incident) => (
              <IncidentCard
                key={incident.id}
                incident={incident}
                onEdit={handleOpenEditModal}
                onDelete={handleOpenDeleteModal}
              />
            ))}
          </section>

          {/* Pagination Footer */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={incidents.length}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
          />
        </>
      )}

      {/* Form Modal (Create / Edit) */}
      <IncidentModal
        isOpen={isFormModalOpen}
        incident={editingIncident}
        onClose={() => setIsFormModalOpen(false)}
        onSubmit={handleFormSubmit}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        incident={deletingIncident}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}

export default App;
