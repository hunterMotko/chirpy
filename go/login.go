package main

import (
	"encoding/json"
	"net/http"
	"time"

	"github.com/hunterMotko/go-chirpy/internal/auth"
	"github.com/hunterMotko/go-chirpy/internal/database"
	"github.com/hunterMotko/go-chirpy/utils"
)

type loginParams struct {
	Password string `json:"password"`
	Email    string `json:"email"`
}
type loginRes struct {
	User
	Token        string `json:"token"`
	RefreshToken string `json:"refresh_token"`
}

func (cfg *apiConfig) handlerLogin(w http.ResponseWriter, r *http.Request) {

	decoder := json.NewDecoder(r.Body)
	params := loginParams{}
	err := decoder.Decode(&params)
	if err != nil {
		utils.ResWithErr(w, http.StatusInternalServerError, "Couldn't decode loginParams")
		return
	}

	user, err := cfg.db.GetUserByEmail(r.Context(), params.Email)
	if err != nil {
		utils.ResWithErr(w, http.StatusUnauthorized, "Incorrect email or password")
		return
	}

	err = auth.CheckPasswordHash(params.Password, user.HashedPassword)
	if err != nil {
		utils.ResWithErr(w, http.StatusUnauthorized, "Incorrect email or password")
		return
	}

	accessToken, err := auth.MakeJWT(
		user.ID,
		cfg.jwtSecret,
		time.Hour,
	)
	if err != nil {
		utils.ResWithErr(w, http.StatusInternalServerError, "Couldn't create access JWT")
		return
	}

	refresh, err := auth.MakeRefreshToken()
	if err != nil {
		utils.ResWithErr(w, http.StatusInternalServerError, "Couldn't create refresh token")
		return
	}

	ref, err := cfg.db.CreateRefreshToken(r.Context(), database.CreateRefreshTokenParams{
		Token:     refresh,
		ExpiresAt: time.Now().AddDate(0, 0, 60),
		UserID:    user.ID,
	})

	utils.ResWithJson(w, http.StatusOK, loginRes{
		User: User{
			ID:          user.ID,
			CreatedAt:   user.CreatedAt,
			UpdatedAt:   user.UpdatedAt,
			Email:       user.Email,
			IsChirpyRed: user.IsChirpyRed,
		},
		Token:        accessToken,
		RefreshToken: ref.Token,
	})
}
