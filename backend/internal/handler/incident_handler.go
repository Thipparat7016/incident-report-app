package handler

import (
	"encoding/json"
	"errors"
	"net/http"
	"strconv"
	"strings"

	"incident-report-app/backend/internal/model"
	"incident-report-app/backend/internal/repository"
)

type IncidentHandler struct {
	repo repository.IncidentRepository
}

func NewIncidentHandler(repo repository.IncidentRepository) *IncidentHandler {
	return &IncidentHandler{repo: repo}
}

// ErrorResponse represents standard error payload
type ErrorResponse struct {
	Error   string `json:"error"`
	Details string `json:"details,omitempty"`
}

func writeJSON(w http.ResponseWriter, status int, data interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	if data != nil {
		if err := json.NewEncoder(w).Encode(data); err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
		}
	}
}

func writeError(w http.ResponseWriter, status int, message string, details ...string) {
	resp := ErrorResponse{Error: message}
	if len(details) > 0 {
		resp.Details = details[0]
	}
	writeJSON(w, status, resp)
}

// RegisterRoutes registers all incident routes onto a ServeMux with CORS middleware
func (h *IncidentHandler) RegisterRoutes(mux *http.ServeMux) {
	mux.HandleFunc("/api/incidents", h.handleIncidents)
	mux.HandleFunc("/api/incidents/", h.handleIncidentByID)
	mux.HandleFunc("/api/stats", h.handleStats)
}

// handleIncidents routes GET /api/incidents and POST /api/incidents
func (h *IncidentHandler) handleIncidents(w http.ResponseWriter, r *http.Request) {
	if r.URL.Path != "/api/incidents" {
		writeError(w, http.StatusNotFound, "Endpoint not found")
		return
	}

	switch r.Method {
	case http.MethodGet:
		h.listIncidents(w, r)
	case http.MethodPost:
		h.createIncident(w, r)
	default:
		writeError(w, http.StatusMethodNotAllowed, "Method not allowed")
	}
}

// handleIncidentByID routes GET, PUT, DELETE for /api/incidents/{id}
func (h *IncidentHandler) handleIncidentByID(w http.ResponseWriter, r *http.Request) {
	idStr := strings.TrimPrefix(r.URL.Path, "/api/incidents/")
	if idStr == "" || strings.Contains(idStr, "/") {
		writeError(w, http.StatusBadRequest, "Invalid incident ID")
		return
	}

	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil || id <= 0 {
		writeError(w, http.StatusBadRequest, "Invalid incident ID format")
		return
	}

	switch r.Method {
	case http.MethodGet:
		h.getIncidentByID(w, r, id)
	case http.MethodPut:
		h.updateIncident(w, r, id)
	case http.MethodDelete:
		h.deleteIncident(w, r, id)
	default:
		writeError(w, http.StatusMethodNotAllowed, "Method not allowed")
	}
}

func (h *IncidentHandler) listIncidents(w http.ResponseWriter, r *http.Request) {
	query := r.URL.Query().Get("q")
	if query == "" {
		query = r.URL.Query().Get("search")
	}
	category := r.URL.Query().Get("category")
	status := r.URL.Query().Get("status")

	incidents, err := h.repo.GetAll(query, category, status)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "Failed to fetch incidents", err.Error())
		return
	}

	writeJSON(w, http.StatusOK, incidents)
}

func (h *IncidentHandler) getIncidentByID(w http.ResponseWriter, r *http.Request, id int64) {
	incident, err := h.repo.GetByID(id)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "Failed to retrieve incident", err.Error())
		return
	}
	if incident == nil {
		writeError(w, http.StatusNotFound, "Incident report not found")
		return
	}

	writeJSON(w, http.StatusOK, incident)
}

func (h *IncidentHandler) createIncident(w http.ResponseWriter, r *http.Request) {
	var req model.CreateIncidentRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "Invalid JSON request body", err.Error())
		return
	}

	if err := req.Validate(); err != nil {
		writeError(w, http.StatusBadRequest, "Validation error", err.Error())
		return
	}

	incident, err := h.repo.Create(req)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "Failed to create incident", err.Error())
		return
	}

	writeJSON(w, http.StatusCreated, incident)
}

func (h *IncidentHandler) updateIncident(w http.ResponseWriter, r *http.Request, id int64) {
	var req model.UpdateIncidentRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "Invalid JSON request body", err.Error())
		return
	}

	if err := req.Validate(); err != nil {
		writeError(w, http.StatusBadRequest, "Validation error", err.Error())
		return
	}

	updated, err := h.repo.Update(id, req)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "Failed to update incident", err.Error())
		return
	}
	if updated == nil {
		writeError(w, http.StatusNotFound, "Incident report not found")
		return
	}

	writeJSON(w, http.StatusOK, updated)
}

func (h *IncidentHandler) deleteIncident(w http.ResponseWriter, r *http.Request, id int64) {
	err := h.repo.Delete(id)
	if err != nil {
		if errors.Is(err, errors.New("sql: no rows in result set")) || err.Error() == "sql: no rows in result set" {
			writeError(w, http.StatusNotFound, "Incident report not found")
			return
		}
		writeError(w, http.StatusInternalServerError, "Failed to delete incident", err.Error())
		return
	}

	writeJSON(w, http.StatusOK, map[string]interface{}{
		"message": "Incident report deleted successfully",
		"id":      id,
	})
}

func (h *IncidentHandler) handleStats(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		writeError(w, http.StatusMethodNotAllowed, "Method not allowed")
		return
	}

	stats, err := h.repo.GetStats()
	if err != nil {
		writeError(w, http.StatusInternalServerError, "Failed to retrieve statistics", err.Error())
		return
	}

	writeJSON(w, http.StatusOK, stats)
}
