package apiCfg

import (
	"html/template"
	"net/http"
	"sync/atomic"

	"github.com/hunterMotko/go-chirpy/internal/database"
	"github.com/hunterMotko/go-chirpy/utils"
)

// atomic to read an int value across multiple go routines
type Cfg struct {
	FileserverHits atomic.Int32
	DB             *database.Queries
}

func (cfg *Cfg) MiddlewareMetricsInc(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		cfg.FileserverHits.Add(1)
		next.ServeHTTP(w, r)
	})
}

func (cfg *Cfg) HandlerMetrics(w http.ResponseWriter, r *http.Request) {
	hits := cfg.FileserverHits.Load()
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

func (cfg *Cfg) HandlerReset(w http.ResponseWriter, r *http.Request) {
	cfg.DB.DeleteUsers(r.Context())
	cfg.FileserverHits.Store(0)
	w.WriteHeader(http.StatusOK)
	w.Write([]byte("Hits reset to 0"))
}
