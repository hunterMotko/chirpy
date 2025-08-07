package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strings"

	"github.com/google/uuid"
	"github.com/hunterMotko/go-chirpy/internal/auth"
	"github.com/hunterMotko/go-chirpy/internal/database"
	"github.com/hunterMotko/go-chirpy/utils"
)

type params struct {
	Body string `json:"body"`
}

func (cfg *apiConfig) CreateChirp(w http.ResponseWriter, r *http.Request) {
	token, err := auth.GetBearerToken(r.Header)
	if err != nil {
		utils.ResWithErr(w, http.StatusInternalServerError, err.Error())
	}

	id, err := auth.ValidateJWT(token, cfg.jwtSecret)
	if err != nil {
		utils.ResWithErr(w, http.StatusUnauthorized, err.Error())
	}

	defer r.Body.Close()

	var rb params
	if err := json.NewDecoder(r.Body).Decode(&rb); err != nil {
		utils.ResWithErr(w, 500, err.Error())
	}

	dbParams := database.CreateChirpParams{
		Body:   rb.Body,
		UserID: id,
	}
	chirp, err := cfg.db.CreateChirp(r.Context(), dbParams)
	if err != nil {
		utils.ResWithErr(w, 500, err.Error())
	}

	utils.ResWithJson(w, 201, chirp)
}

func (cfg *apiConfig) GetChirps(w http.ResponseWriter, r *http.Request) {
	queryParams := r.URL.Query()
	authorId := queryParams.Get("author_id")
	params := database.GetChirpsByAuthorOrAllParams{}

	if authorId != "" {
		id, err := uuid.Parse(authorId)
		if err != nil {
			utils.ResWithErr(w, 500, err.Error())
			return
		}
		author := uuid.NullUUID{
			UUID: id,
		}
		params.UserID = author
	}

	sortOrder := queryParams.Get("sort")
	if sortOrder != "" {
		params.SortOrder = strings.ToUpper(sortOrder)
	}

	chirps, err := cfg.db.GetChirpsByAuthorOrAll(r.Context(), params)
	if err != nil {
		utils.ResWithErr(w, 500, err.Error())
	}
	utils.ResWithJson(w, 200, chirps)
}

func (cfg *apiConfig) GetChirpByID(w http.ResponseWriter, r *http.Request) {
	id, err := uuid.Parse(r.PathValue("chirpID"))
	if err != nil {
		utils.ResWithErr(w, 500, err.Error())
	}

	chirp, err := cfg.db.GetChirpById(r.Context(), id)
	if err != nil {
		utils.ResWithErr(w, 404, err.Error())
	}

	fmt.Println(chirp)

	utils.ResWithJson(w, 200, chirp)
}

func (cfg *apiConfig) DeleteChirpByID(w http.ResponseWriter, r *http.Request) {
	token, err := auth.GetBearerToken(r.Header)
	if err != nil {
		utils.ResWithErr(w, http.StatusUnauthorized, err.Error())
		return
	}

	userID, err := auth.ValidateJWT(token, cfg.jwtSecret)
	if err != nil {
		utils.ResWithErr(w, http.StatusUnauthorized, err.Error())
		return
	}

	chirpID, err := uuid.Parse(r.PathValue("chirpID"))
	if err != nil {
		utils.ResWithErr(w, http.StatusBadRequest, err.Error())
		return
	}

	chirp, err := cfg.db.GetChirpById(r.Context(), chirpID)
	if err != nil {
		utils.ResWithErr(w, http.StatusNotFound, err.Error())
		return
	}

	if chirp.UserID != userID {
		utils.ResWithErr(w, http.StatusForbidden, "Incorrect user chirp")
		return
	}

	if err := cfg.db.DeleteChirpById(r.Context(), chirp.ID); err != nil {
		utils.ResWithErr(w, http.StatusNotFound, err.Error())
		return
	}

	w.WriteHeader(204)
}

var banned = map[string]bool{"kerfuffle": true, "sharbert": true, "fornax": true}

func ValidateChirp(w http.ResponseWriter, r *http.Request) {
	defer r.Body.Close()

	type params struct {
		Body string `json:"body"`
	}
	var par params
	err := json.NewDecoder(r.Body).Decode(&par)
	if err != nil {
		utils.ResWithErr(w, 500, "Something went wrong")
		return
	}

	if len(par.Body) > 140 {
		utils.ResWithErr(w, 400, "Chirp is too long")
		return
	}

	temp := strings.Split(par.Body, " ")
	for i, word := range temp {
		tempWord := strings.ToLower(word)
		if banned[tempWord] {
			temp[i] = "****"
		}
	}

	utils.ResWithJson(w, 200, map[string]string{
		"cleaned_body": strings.Join(temp, " "),
	})
}
