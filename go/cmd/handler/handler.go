package handler

import (
	"encoding/json"
	"net/http"
	"strings"

	"github.com/hunterMotko/go-chirpy/utils"
)

type Chirp struct {
	Body string `json:"body"`
}

var banned = map[string]bool{"kerfuffle": true, "sharbert": true, "fornax": true}

func ValidateChirp(w http.ResponseWriter, r *http.Request) {
	defer r.Body.Close()

	var chirp Chirp
	err := json.NewDecoder(r.Body).Decode(&chirp)
	if err != nil {
		utils.ResWithErr(w, 500, "Something went wrong")
		return
	}

	if len(chirp.Body) > 140 {
		utils.ResWithErr(w, 400, "Chirp is too long")
		return
	}

	temp := strings.Split(chirp.Body, " ")
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

func CheckHealthz(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "text/plain; charset=utf-8")
	w.WriteHeader(200)
	w.Write([]byte("OK"))
}
