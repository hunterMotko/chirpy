package apiCfg

import (
	"encoding/json"
	"net/http"

	"github.com/hunterMotko/go-chirpy/internal/database"
	"github.com/hunterMotko/go-chirpy/utils"
)

func (cfg *Cfg) CreateUser(w http.ResponseWriter, r *http.Request) {
	defer r.Body.Close()

	var params database.User
	err := json.NewDecoder(r.Body).Decode(&params)
	if err != nil {
		utils.ResWithErr(w, 500, err.Error())
	}
	user, err := cfg.DB.CreateUser(r.Context(), params.Email)
	if err != nil {
		utils.ResWithErr(w, 500, err.Error())
	}

	utils.ResWithJson(w, 201, user)
}
