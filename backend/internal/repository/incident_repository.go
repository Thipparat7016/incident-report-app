package repository

import (
	"database/sql"
	"errors"
	"fmt"
	"strings"
	"time"

	"incident-report-app/backend/internal/model"
)

type IncidentRepository interface {
	GetAll(search, category, status string) ([]model.Incident, error)
	GetByID(id int64) (*model.Incident, error)
	Create(req model.CreateIncidentRequest) (*model.Incident, error)
	Update(id int64, req model.UpdateIncidentRequest) (*model.Incident, error)
	Delete(id int64) error
	GetStats() (*model.StatsResponse, error)
}

type sqliteIncidentRepo struct {
	db *sql.DB
}

func NewIncidentRepository(db *sql.DB) IncidentRepository {
	return &sqliteIncidentRepo{db: db}
}

// parseDateTime safely parses date strings from SQLite into time.Time
func parseDateTime(raw interface{}) time.Time {
	switch v := raw.(type) {
	case time.Time:
		return v
	case string:
		formats := []string{
			"2006-01-02 15:04:05",
			time.RFC3339,
			"2006-01-02T15:04:05",
			"2006-01-02 15:04:05 -0700 MST",
		}
		for _, f := range formats {
			if t, err := time.Parse(f, v); err == nil {
				return t
			}
		}
	}
	return time.Now()
}

func (r *sqliteIncidentRepo) GetAll(search, category, status string) ([]model.Incident, error) {
	query := "SELECT id, title, description, category, status, created_at FROM incidents WHERE 1=1"
	var args []interface{}

	if strings.TrimSpace(search) != "" {
		query += " AND (title LIKE ? OR description LIKE ?)"
		searchTerm := "%" + strings.TrimSpace(search) + "%"
		args = append(args, searchTerm, searchTerm)
	}

	if category != "" && category != "All" && category != "All categories" {
		query += " AND category = ?"
		args = append(args, category)
	}

	if status != "" && status != "All" && status != "All statuses" {
		query += " AND status = ?"
		args = append(args, status)
	}

	query += " ORDER BY created_at DESC, id DESC"

	rows, err := r.db.Query(query, args...)
	if err != nil {
		return nil, fmt.Errorf("error querying incidents: %w", err)
	}
	defer rows.Close()

	incidents := make([]model.Incident, 0)
	for rows.Next() {
		var inc model.Incident
		var rawCreatedAt interface{}

		err := rows.Scan(&inc.ID, &inc.Title, &inc.Description, &inc.Category, &inc.Status, &rawCreatedAt)
		if err != nil {
			return nil, fmt.Errorf("error scanning incident: %w", err)
		}
		inc.CreatedAt = parseDateTime(rawCreatedAt)
		incidents = append(incidents, inc)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating incidents: %w", err)
	}

	return incidents, nil
}

func (r *sqliteIncidentRepo) GetByID(id int64) (*model.Incident, error) {
	query := "SELECT id, title, description, category, status, created_at FROM incidents WHERE id = ?"
	row := r.db.QueryRow(query, id)

	var inc model.Incident
	var rawCreatedAt interface{}
	err := row.Scan(&inc.ID, &inc.Title, &inc.Description, &inc.Category, &inc.Status, &rawCreatedAt)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, nil // Not found
		}
		return nil, fmt.Errorf("error fetching incident by id: %w", err)
	}
	inc.CreatedAt = parseDateTime(rawCreatedAt)
	return &inc, nil
}

func (r *sqliteIncidentRepo) Create(req model.CreateIncidentRequest) (*model.Incident, error) {
	now := time.Now().UTC()
	query := `INSERT INTO incidents (title, description, category, status, created_at)
			  VALUES (?, ?, ?, ?, ?) RETURNING id, created_at`

	var id int64
	var rawCreatedAt interface{}
	err := r.db.QueryRow(query, req.Title, req.Description, req.Category, req.Status, now.Format("2006-01-02 15:04:05")).
		Scan(&id, &rawCreatedAt)
	if err != nil {
		// Fallback for older SQLite versions that might not support RETURNING
		res, execErr := r.db.Exec(`INSERT INTO incidents (title, description, category, status, created_at) VALUES (?, ?, ?, ?, ?)`,
			req.Title, req.Description, req.Category, req.Status, now.Format("2006-01-02 15:04:05"))
		if execErr != nil {
			return nil, fmt.Errorf("error creating incident: %w", execErr)
		}
		id, err = res.LastInsertId()
		if err != nil {
			return nil, fmt.Errorf("error retrieving last insert id: %w", err)
		}
		rawCreatedAt = now
	}

	return &model.Incident{
		ID:          id,
		Title:       req.Title,
		Description: req.Description,
		Category:    req.Category,
		Status:      req.Status,
		CreatedAt:   parseDateTime(rawCreatedAt),
	}, nil
}

func (r *sqliteIncidentRepo) Update(id int64, req model.UpdateIncidentRequest) (*model.Incident, error) {
	existing, err := r.GetByID(id)
	if err != nil {
		return nil, err
	}
	if existing == nil {
		return nil, nil // not found
	}

	query := `UPDATE incidents SET title = ?, description = ?, category = ?, status = ? WHERE id = ?`
	_, err = r.db.Exec(query, req.Title, req.Description, req.Category, req.Status, id)
	if err != nil {
		return nil, fmt.Errorf("error updating incident: %w", err)
	}

	return &model.Incident{
		ID:          id,
		Title:       req.Title,
		Description: req.Description,
		Category:    req.Category,
		Status:      req.Status,
		CreatedAt:   existing.CreatedAt,
	}, nil
}

func (r *sqliteIncidentRepo) Delete(id int64) error {
	res, err := r.db.Exec("DELETE FROM incidents WHERE id = ?", id)
	if err != nil {
		return fmt.Errorf("error deleting incident: %w", err)
	}
	rowsAffected, err := res.RowsAffected()
	if err != nil {
		return fmt.Errorf("error checking affected rows: %w", err)
	}
	if rowsAffected == 0 {
		return sql.ErrNoRows
	}
	return nil
}

func (r *sqliteIncidentRepo) GetStats() (*model.StatsResponse, error) {
	var stats model.StatsResponse
	query := `
	SELECT 
		COUNT(*) as total,
		COALESCE(SUM(CASE WHEN status = 'Open' THEN 1 ELSE 0 END), 0) as open_count,
		COALESCE(SUM(CASE WHEN status = 'In Progress' THEN 1 ELSE 0 END), 0) as in_progress_count,
		COALESCE(SUM(CASE WHEN status = 'Success' THEN 1 ELSE 0 END), 0) as success_count
	FROM incidents
	`
	err := r.db.QueryRow(query).Scan(&stats.Total, &stats.Open, &stats.InProgress, &stats.Success)
	if err != nil {
		return nil, fmt.Errorf("error calculating stats: %w", err)
	}
	return &stats, nil
}
