package main

import (
	"database/sql"
	"log"
	"net/http"
	"os"
	"sync/atomic"

	"github.com/hunterMotko/go-chirpy/internal/database"
	"github.com/joho/godotenv"
	_ "github.com/lib/pq"
)

const PORT = ":8080"

type apiConfig struct {
	fileserverHits atomic.Int32
	db             *database.Queries
	jwtSecret      string
	polkaKey       string
}

func main() {
	godotenv.Load()
	dbURL := os.Getenv("DB_URL")
	db, err := sql.Open("postgres", dbURL)
	if err != nil {
		log.Fatalf("DB ERR %v\n", err)
	}

	dbQueries := database.New(db)
	cfg := apiConfig{
		fileserverHits: atomic.Int32{},
		db:             dbQueries,
		jwtSecret:      os.Getenv("JWT_S"),
		polkaKey:       os.Getenv("POLKA_KEY"),
	}

	mux := http.NewServeMux()
	fs := http.StripPrefix("/app/", http.FileServer(http.Dir(".")))
	ass := http.StripPrefix("/app/assets/", http.FileServer(http.Dir("./assets")))

	mux.Handle("/app/", cfg.MiddlewareMetricsInc(fs))
	mux.Handle("/app/assets/", cfg.MiddlewareMetricsInc(ass))

	mux.HandleFunc("GET /admin/metrics", cfg.HandlerMetrics)
	mux.HandleFunc("POST /admin/reset", cfg.HandlerReset)

	mux.HandleFunc("POST /api/users", cfg.CreateUser)
	mux.HandleFunc("PUT /api/users", cfg.UpdateUserPassword)
	mux.HandleFunc("POST /api/login", cfg.handlerLogin)
	mux.HandleFunc("POST /api/refresh", cfg.handlerRefresh)
	mux.HandleFunc("POST /api/revoke", cfg.handlerRevoke)

	mux.HandleFunc("POST /api/polka/webhooks", cfg.handlerChirpyIsRed)

	mux.HandleFunc("POST /api/chirps", cfg.CreateChirp)
	mux.HandleFunc("GET /api/chirps", cfg.GetChirps)
	mux.HandleFunc("GET /api/chirps/{chirpID}", cfg.GetChirpByID)
	mux.HandleFunc("DELETE /api/chirps/{chirpID}", cfg.DeleteChirpByID)

	mux.HandleFunc("POST /api/validate_chirp", ValidateChirp)
	mux.HandleFunc("GET /api/healthz", CheckHealthz)

	srv := &http.Server{
		Addr:    PORT,
		Handler: mux,
	}

	log.Printf("Serving on port: %s\n", PORT)
	log.Fatal(srv.ListenAndServe())
}
