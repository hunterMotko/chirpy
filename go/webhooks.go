package main

import (
	"encoding/json"
	"net/http"

	"github.com/google/uuid"
	"github.com/hunterMotko/go-chirpy/internal/auth"
	"github.com/hunterMotko/go-chirpy/internal/database"
	"github.com/hunterMotko/go-chirpy/utils"
)

func (cfg *apiConfig) handlerChirpyIsRed(w http.ResponseWriter, r *http.Request) {
	key, err := auth.GetAPIKey(r.Header)
	if err != nil {
		utils.ResWithErr(w, 401, "Key is malformed or missing")
		return
	}

	if key != cfg.polkaKey {
		utils.ResWithErr(w, 401, "unauthorized")
		return
	}

	type params struct {
		Event string `json:"event"`
		Data  struct {
			UserId string `json:"user_id"`
		} `json:"data"`
	}

	defer r.Body.Close()
	var par params
	if err := json.NewDecoder(r.Body).Decode(&par); err != nil {
		utils.ResWithErr(w, 500, "Something went wrong")
		return
	}

	if par.Event != "user.upgraded" {
		w.WriteHeader(204)
		return
	}

	userId, err := uuid.Parse(par.Data.UserId)
	if err != nil {
		utils.ResWithErr(w, 500, "uuid error")
		return
	}

	dbParams := database.UpdateChirpyIsRedParams{
		ID:          userId,
		IsChirpyRed: true,
	}

	user, err := cfg.db.UpdateChirpyIsRed(r.Context(), dbParams)
	if err != nil {
		utils.ResWithErr(w, 404, "user not found")
		return
	}

	if user.ID != userId {
		utils.ResWithErr(w, 404, "user not found")
		return
	}

	w.WriteHeader(204)
}
