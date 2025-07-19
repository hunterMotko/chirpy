package apiCfg

import (
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/google/uuid"
	"github.com/hunterMotko/go-chirpy/internal/database"
	"github.com/hunterMotko/go-chirpy/utils"
)

func (cfg *Cfg) CreateChirp(w http.ResponseWriter, r *http.Request) {
	defer r.Body.Close()
	var params database.CreateChirpParams

	err := json.NewDecoder(r.Body).Decode(&params)
	if err != nil {
		utils.ResWithErr(w, 500, err.Error())
	}

	chirp, err := cfg.DB.CreateChirp(r.Context(), params)
	if err != nil {
		utils.ResWithErr(w, 500, err.Error())
	}

	utils.ResWithJson(w, 201, chirp)
}

func (cfg *Cfg) GetChirps(w http.ResponseWriter, r *http.Request) {
	chirps, err := cfg.DB.GetChirps(r.Context())
	if err != nil {
		utils.ResWithErr(w, 500, err.Error())
	}
	utils.ResWithJson(w, 200, chirps)
}

func (cfg *Cfg) GetChirpByID(w http.ResponseWriter, r *http.Request) {
	id, err := uuid.Parse(r.PathValue("chirpID"))
	if err != nil {
		utils.ResWithErr(w, 500, err.Error())
	}

	chirp, err := cfg.DB.GetChirpById(r.Context(), id)
	if err != nil {
		utils.ResWithErr(w, 404, err.Error())
	}

	fmt.Println(chirp)

	utils.ResWithJson(w, 200, chirp)
}
