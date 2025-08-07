package main

import (
	"github.com/hunterMotko/go-chirpy/utils"
	"html/template"
	"net/http"
)

func (cfg *apiConfig) MiddlewareMetricsInc(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		cfg.fileserverHits.Add(1)
		next.ServeHTTP(w, r)
	})
}

func (cfg *apiConfig) HandlerMetrics(w http.ResponseWriter, r *http.Request) {
	hits := cfg.fileserverHits.Load()
	w.Header().Set("Content-Type", "text/html")

	templ := `<html>
		<body>
			<h1>Welcome, Chirpy Admin</h1>
			<p>Chirpy has been visited {{.}} times!</p>
		</body>
	</html>`

	t, err := template.New("res").Parse(templ)
	if err != nil {
		utils.ResWithErr(w, 500, err.Error())
	}

	w.WriteHeader(200)
	if err := t.Execute(w, hits); err != nil {
		utils.ResWithErr(w, 500, err.Error())
	}
}

func (cfg *apiConfig) HandlerReset(w http.ResponseWriter, r *http.Request) {
	cfg.db.DeleteUsers(r.Context())
	cfg.fileserverHits.Store(0)
	w.WriteHeader(http.StatusOK)
	w.Write([]byte("Hits reset to 0"))
}

func CheckHealthz(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "text/plain; charset=utf-8")
	w.WriteHeader(200)
	w.Write([]byte("OK"))
}
