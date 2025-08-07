package utils

import (
	"encoding/json"
	"log"
	"net/http"
)

func ResWithErr(w http.ResponseWriter, code int, msg string) {
	ResWithJson(w, code, map[string]string{
		"error": msg,
	})
}

func ResWithJson(w http.ResponseWriter, code int, payload any) {
	w.Header().Set("Content-Type", "application/json")
	res, err := json.Marshal(payload)
	if err != nil {
		log.Printf("Error Marshalling JSON: %s\n", err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
	w.WriteHeader(code)
	w.Write(res)
}
