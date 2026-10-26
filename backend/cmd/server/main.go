package main

import (
	"log"
	"net/http"
	"os"
	"path/filepath"
	"time"

	"incident-report-app/backend/internal/database"
	"incident-report-app/backend/internal/handler"
	"incident-report-app/backend/internal/repository"
)

// corsMiddleware handles Cross-Origin Resource Sharing (CORS) headers and preflight requests
func corsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization, Accept, X-Requested-With")

		// Handle preflight OPTIONS request
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusOK)
			return
		}

		// Log request
		start := time.Now()
		next.ServeHTTP(w, r)
		log.Printf("[%s] %s - %v", r.Method, r.URL.Path, time.Since(start))
	})
}

func main() {
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	// SQLite database file path (stored in backend directory or root)
	dbDir := filepath.Join(".", "data")
	if err := os.MkdirAll(dbDir, 0755); err != nil {
		log.Fatalf("Failed to create data directory: %v", err)
	}
	dbPath := filepath.Join(dbDir, "incidents.db")

	log.Printf("Connecting to SQLite database at: %s", dbPath)
	db, err := database.InitDB(dbPath)
	if err != nil {
		log.Fatalf("Failed to initialize database: %v", err)
	}
	defer db.Close()

	// Initialize Repository & Handler layers
	incidentRepo := repository.NewIncidentRepository(db)
	incidentHandler := handler.NewIncidentHandler(incidentRepo)

	mux := http.NewServeMux()
	incidentHandler.RegisterRoutes(mux)

	// Health check route
	mux.HandleFunc("/api/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		w.Write([]byte(`{"status":"ok","timestamp":"` + time.Now().UTC().Format(time.RFC3339) + `"}`))
	})

	// Root route with helpful developer info
	mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path != "/" {
			http.NotFound(w, r)
			return
		}
		w.Header().Set("Content-Type", "application/json; charset=utf-8")
		w.WriteHeader(http.StatusOK)
		w.Write([]byte(`{"message":"Incident Report RESTful API is running successfully!","endpoints":{"health":"/api/health","stats":"/api/stats","incidents":"/api/incidents"},"frontend_ui_url":"http://localhost:5173"}`))
	})

	server := &http.Server{
		Addr:         ":" + port,
		Handler:      corsMiddleware(mux),
		ReadTimeout:  15 * time.Second,
		WriteTimeout: 15 * time.Second,
		IdleTimeout:  60 * time.Second,
	}

	log.Printf("Incident Report API Server is running on http://localhost:%s", port)
	if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
		log.Fatalf("Server stopped unexpectedly: %v", err)
	}
}
