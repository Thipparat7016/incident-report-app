package model

import (
	"errors"
	"strings"
	"time"
)

// Allowed Category values
const (
	CategorySafety      = "Safety"
	CategoryMaintenance = "Maintenance"
)

// Allowed Status values
const (
	StatusOpen       = "Open"
	StatusInProgress = "In Progress"
	StatusSuccess    = "Success"
)

// Incident represents an incident report record in SQLite database
type Incident struct {
	ID          int64     `json:"id"`
	Title       string    `json:"title"`
	Description string    `json:"description"`
	Category    string    `json:"category"`
	Status      string    `json:"status"`
	CreatedAt   time.Time `json:"created_at"`
}

// CreateIncidentRequest payload for creating a new report
type CreateIncidentRequest struct {
	Title       string `json:"title"`
	Description string `json:"description"`
	Category    string `json:"category"`
	Status      string `json:"status"`
}

// UpdateIncidentRequest payload for updating an existing report
type UpdateIncidentRequest struct {
	Title       string `json:"title"`
	Description string `json:"description"`
	Category    string `json:"category"`
	Status      string `json:"status"`
}

// StatsResponse represents count metrics for the dashboard
type StatsResponse struct {
	Total      int `json:"total"`
	Open       int `json:"open"`
	InProgress int `json:"in_progress"`
	Success    int `json:"success"`
}

// Validate validates input fields for creating an incident
func (r *CreateIncidentRequest) Validate() error {
	r.Title = strings.TrimSpace(r.Title)
	r.Description = strings.TrimSpace(r.Description)

	if r.Title == "" {
		return errors.New("title is required")
	}
	if len(r.Title) > 100 {
		return errors.New("title must not exceed 100 characters")
	}
	if r.Description == "" {
		return errors.New("description is required")
	}

	if r.Category != CategorySafety && r.Category != CategoryMaintenance {
		return errors.New("category must be 'Safety' or 'Maintenance'")
	}

	if r.Status == "" {
		r.Status = StatusOpen
	} else if r.Status != StatusOpen && r.Status != StatusInProgress && r.Status != StatusSuccess {
		return errors.New("status must be 'Open', 'In Progress', or 'Success'")
	}

	return nil
}

// Validate validates input fields for updating an incident
func (r *UpdateIncidentRequest) Validate() error {
	r.Title = strings.TrimSpace(r.Title)
	r.Description = strings.TrimSpace(r.Description)

	if r.Title == "" {
		return errors.New("title is required")
	}
	if len(r.Title) > 100 {
		return errors.New("title must not exceed 100 characters")
	}
	if r.Description == "" {
		return errors.New("description is required")
	}

	if r.Category != CategorySafety && r.Category != CategoryMaintenance {
		return errors.New("category must be 'Safety' or 'Maintenance'")
	}

	if r.Status != StatusOpen && r.Status != StatusInProgress && r.Status != StatusSuccess {
		return errors.New("status must be 'Open', 'In Progress', or 'Success'")
	}

	return nil
}
