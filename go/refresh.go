package main

import (
	"net/http"
	"time"

	"github.com/hunterMotko/go-chirpy/internal/auth"
	"github.com/hunterMotko/go-chirpy/utils"
)

func (cfg *apiConfig) handlerRefresh(w http.ResponseWriter, r *http.Request) {
	type response struct {
		Token string `json:"token"`
	}

	refreshToken, err := auth.GetBearerToken(r.Header)
	if err != nil {
		utils.ResWithErr(w, http.StatusBadRequest, "Couldn't find token")
		return
	}

	user, err := cfg.db.GetUserFromRefreshToken(r.Context(), refreshToken)
	if err != nil {
		utils.ResWithErr(w, http.StatusUnauthorized, "Couldn't get user for refresh token")
		return
	}

	accessToken, err := auth.MakeJWT(
		user.ID,
		cfg.jwtSecret,
		time.Hour,
	)
	if err != nil {
		utils.ResWithErr(w, http.StatusUnauthorized, "Couldn't validate token")
		return
	}

	utils.ResWithJson(w, http.StatusOK, response{
		Token: accessToken,
	})
}

func (cfg *apiConfig) handlerRevoke(w http.ResponseWriter, r *http.Request) {
	refreshToken, err := auth.GetBearerToken(r.Header)
	if err != nil {
		utils.ResWithErr(w, http.StatusBadRequest, "Couldn't find token")
		return
	}

	_, err = cfg.db.RevokeRefreshToken(r.Context(), refreshToken)
	if err != nil {
		utils.ResWithErr(w, http.StatusInternalServerError, "Couldn't revoke session")
		return
	}

	w.WriteHeader(http.StatusNoContent)
}
