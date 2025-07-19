package main

import (
	"database/sql"
	"log"
	"net/http"
	"os"
	"sync/atomic"

	"github.com/hunterMotko/go-chirpy/cmd/apiCfg"
	"github.com/hunterMotko/go-chirpy/cmd/handler"
	"github.com/hunterMotko/go-chirpy/internal/database"
	"github.com/joho/godotenv"
	_ "github.com/lib/pq"
)

const PORT = ":8080"

func main() {
	godotenv.Load()
	dbURL := os.Getenv("DB_URL")
	db, err := sql.Open("postgres", dbURL)
	if err != nil {
		log.Fatalf("DB ERR %v\n", err)
	}

	dbQueries := database.New(db)
	cfg := apiCfg.Cfg{
		FileserverHits: atomic.Int32{},
		DB:             dbQueries,
	}

	mux := http.NewServeMux()
	fs := http.StripPrefix("/app/", http.FileServer(http.Dir(".")))
	ass := http.StripPrefix("/app/assets/", http.FileServer(http.Dir("./assets")))

	mux.Handle("/app/", cfg.MiddlewareMetricsInc(fs))
	mux.Handle("/app/assets/", cfg.MiddlewareMetricsInc(ass))

	mux.HandleFunc("GET /admin/metrics", cfg.HandlerMetrics)
	mux.HandleFunc("POST /admin/reset", cfg.HandlerReset)

	mux.HandleFunc("POST /api/users", cfg.CreateUser)

	mux.HandleFunc("POST /api/chirps", cfg.CreateChirp)
	mux.HandleFunc("GET /api/chirps", cfg.GetChirps)
	mux.HandleFunc("GET /api/chirps/{chirpID}", cfg.GetChirpByID)

	mux.HandleFunc("POST /api/validate_chirp", handler.ValidateChirp)
	mux.HandleFunc("GET /api/healthz", handler.CheckHealthz)

	srv := &http.Server{
		Addr:    PORT,
		Handler: mux,
	}

	log.Printf("Serving on port: %s\n", PORT)
	log.Fatal(srv.ListenAndServe())
}
