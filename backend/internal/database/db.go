package database

import (
	"database/sql"
	"fmt"
	"log"
	"time"

	_ "modernc.org/sqlite"
)

// InitDB initializes SQLite database file and runs table migrations
func InitDB(dbPath string) (*sql.DB, error) {
	db, err := sql.Open("sqlite", dbPath)
	if err != nil {
		return nil, fmt.Errorf("failed to open database: %w", err)
	}

	// SQLite connection settings
	db.SetMaxOpenConns(1) // SQLite operates best with 1 writer
	db.SetMaxIdleConns(1)
	db.SetConnMaxLifetime(time.Hour)

	if err := db.Ping(); err != nil {
		return nil, fmt.Errorf("failed to ping database: %w", err)
	}

	if err := createTables(db); err != nil {
		return nil, fmt.Errorf("failed to create tables: %w", err)
	}

	if err := seedDemoData(db); err != nil {
		log.Printf("Warning: failed to seed demo data: %v", err)
	}

	return db, nil
}

func createTables(db *sql.DB) error {
	schema := `
	CREATE TABLE IF NOT EXISTS incidents (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		title TEXT NOT NULL,
		description TEXT NOT NULL,
		category TEXT NOT NULL CHECK(category IN ('Safety', 'Maintenance')),
		status TEXT NOT NULL CHECK(status IN ('Open', 'In Progress', 'Success')),
		created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
	);
	CREATE INDEX IF NOT EXISTS idx_incidents_status ON incidents(status);
	CREATE INDEX IF NOT EXISTS idx_incidents_category ON incidents(category);
	CREATE INDEX IF NOT EXISTS idx_incidents_created_at ON incidents(created_at DESC);
	`
	_, err := db.Exec(schema)
	return err
}

// seedDemoData seeds default items matching the mockup images if empty
func seedDemoData(db *sql.DB) error {
	var count int
	err := db.QueryRow("SELECT COUNT(*) FROM incidents").Scan(&count)
	if err != nil {
		return err
	}

	if count > 0 {
		return nil // already seeded or has data
	}

	// Default demo incidents matching mockups
	sampleIncidents := []struct {
		title       string
		description string
		category    string
		status      string
		createdAt   string
	}{
		{
			title:       "Wet floor near loading dock",
			description: "Water is leaking from the dock door seal, creating a slip hazard for forklift and foot traffic.",
			category:    "Safety",
			status:      "Open",
			createdAt:   "2026-10-26 09:15:00",
		},
		{
			title:       "Air conditioner in Server Room B not cooling",
			description: "Room temperature has stayed above 29 °C since last night.",
			category:    "Maintenance",
			status:      "In Progress",
			createdAt:   "2026-10-26 08:40:00",
		},
		{
			title:       "Fire exit blocked by pallets on Floor 2",
			description: "Stacked pallets are covering the east stairwell exit door.",
			category:    "Safety",
			status:      "Open",
			createdAt:   "2026-10-25 16:05:00",
		},
		{
			title:       "Broken handrail on east staircase",
			description: "The left handrail between Floor 1 and Floor 2 is loose at the bracket.",
			category:    "Safety",
			status:      "In Progress",
			createdAt:   "2026-10-25 11:30:00",
		},
		{
			title:       "Flickering lights in parking level B1",
			description: "Three fixtures near the lift lobby flicker intermittently.",
			category:    "Maintenance",
			status:      "Open",
			createdAt:   "2026-10-24 18:20:00",
		},
		{
			title:       "Elevator 3 door sensor replaced",
			description: "Sensor swapped and tested; no faults after 20 door cycles.",
			category:    "Maintenance",
			status:      "Success",
			createdAt:   "2026-10-23 14:10:00",
		},
		{
			title:       "Chemical spill cleaned in Lab 4",
			description: "Spill contained and neutralised; area re-opened after inspection.",
			category:    "Safety",
			status:      "Success",
			createdAt:   "2026-10-22 10:00:00",
		},
	}

	stmt, err := db.Prepare("INSERT INTO incidents (title, description, category, status, created_at) VALUES (?, ?, ?, ?, ?)")
	if err != nil {
		return err
	}
	defer stmt.Close()

	for _, item := range sampleIncidents {
		_, err := stmt.Exec(item.title, item.description, item.category, item.status, item.createdAt)
		if err != nil {
			return err
		}
	}

	log.Printf("Seeded %d demo incident reports into SQLite.", len(sampleIncidents))
	return nil
}
