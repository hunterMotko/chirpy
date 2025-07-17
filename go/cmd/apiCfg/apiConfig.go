package apiCfg

import (
	"encoding/json"
	"html/template"
	"net/http"
	"sync/atomic"
	"time"

	"github.com/google/uuid"
	"github.com/hunterMotko/go-chirpy/internal/database"
	"github.com/hunterMotko/go-chirpy/utils"
)

// atomic to read an int value across multiple go routines
type Cfg struct {
	FileserverHits atomic.Int32
	DbQueries      *database.Queries
}

func (cfg *Cfg) MiddlewareMetricsInc(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		cfg.FileserverHits.Add(1)
		next.ServeHTTP(w, r)
	})
}

type ReqParams struct {
	Email string `json:"email"`
}

type User struct {
	ID        uuid.UUID `json:"id"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
	Email     string    `json:"email"`
}

func (cfg *Cfg) CreateUser(w http.ResponseWriter, r *http.Request) {
	defer r.Body.Close()
	var params ReqParams
	err := json.NewDecoder(r.Body).Decode(&params)
	if err != nil {
		utils.ResWithErr(w, 500, err.Error())
	}
	user, err := cfg.DbQueries.CreateUser(r.Context(), params.Email)
	if err != nil {
		utils.ResWithErr(w, 500, err.Error())
	}

	u := User{
		ID:        user.ID,
		CreatedAt: user.CreatedAt,
		UpdatedAt: user.UpdatedAt,
		Email:     user.Email,
	}

	utils.ResWithJson(w, 201, u)
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
	cfg.DbQueries.DeleteUsers(r.Context())
	cfg.FileserverHits.Store(0)
	w.WriteHeader(http.StatusOK)
	w.Write([]byte("Hits reset to 0"))
}
