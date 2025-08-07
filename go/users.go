package main

import (
	"encoding/json"
	"net/http"
	"time"

	"github.com/google/uuid"
	"github.com/hunterMotko/go-chirpy/internal/auth"
	"github.com/hunterMotko/go-chirpy/internal/database"
	"github.com/hunterMotko/go-chirpy/utils"
)

type User struct {
	ID          uuid.UUID `json:"id"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
	Email       string    `json:"email"`
	IsChirpyRed bool      `json:"is_chirpy_red"`
	Password    string    `json:"-"`
}

type userParams struct {
	Password string `json:"password"`
	Email    string `json:"email"`
}

type userRes struct {
	User
}

func (cfg *apiConfig) CreateUser(w http.ResponseWriter, r *http.Request) {
	decoder := json.NewDecoder(r.Body)
	params := userParams{}
	err := decoder.Decode(&params)
	if err != nil {
		utils.ResWithErr(w, http.StatusInternalServerError, "Couldn't decode userParams")
		return
	}

	hashedPassword, err := auth.HashPassword(params.Password)
	if err != nil {
		utils.ResWithErr(w, http.StatusInternalServerError, "Couldn't hash password")
		return
	}

	user, err := cfg.db.CreateUser(r.Context(), database.CreateUserParams{
		Email:          params.Email,
		HashedPassword: hashedPassword,
	})
	if err != nil {
		utils.ResWithErr(w, http.StatusInternalServerError, "Couldn't create user")
		return
	}

	utils.ResWithJson(w, http.StatusCreated, userRes{
		User: User{
			ID:        user.ID,
			CreatedAt: user.CreatedAt,
			UpdatedAt: user.UpdatedAt,
			Email:     user.Email,
		},
	})
}

func (cfg *apiConfig) UpdateUserPassword(w http.ResponseWriter, r *http.Request) {
	token, err := auth.GetBearerToken(r.Header)
	if err != nil {
		utils.ResWithErr(w, http.StatusUnauthorized, "Unauthorized")
		return
	}

	id, err := auth.ValidateJWT(token, cfg.jwtSecret)
	if err != nil {
		utils.ResWithErr(w, http.StatusUnauthorized, "Unauthorized")
		return
	}

	u, err := cfg.db.GetUserById(r.Context(), id)
	if err != nil {
		utils.ResWithErr(w, http.StatusUnauthorized, "Unauthorized")
		return
	}

	decoder := json.NewDecoder(r.Body)
	params := userParams{}
	if err := decoder.Decode(&params); err != nil {
		utils.ResWithErr(w, http.StatusInternalServerError, "Couldn't decode userParams")
		return
	}

	hashedPassword, err := auth.HashPassword(params.Password)
	if err != nil {
		utils.ResWithErr(w, http.StatusInternalServerError, "Couldn't hash password")
		return
	}

	data := database.UpdateUserPasswordParams{
		ID:             u.ID,
		HashedPassword: hashedPassword,
		Email:          params.Email,
	}

	user, err := cfg.db.UpdateUserPassword(r.Context(), data)
	if err != nil {
		utils.ResWithErr(w, http.StatusInternalServerError, "Could not update user")
		return
	}

	utils.ResWithJson(w, http.StatusOK, userRes{
		User: User{
			ID:          user.ID,
			CreatedAt:   user.CreatedAt,
			UpdatedAt:   user.UpdatedAt,
			Email:       user.Email,
			IsChirpyRed: user.IsChirpyRed,
		},
	})
}
