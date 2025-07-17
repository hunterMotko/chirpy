package utils

import (
	"encoding/json"
	"net/http"
)

func ResWithErr(w http.ResponseWriter, code int, msg string) {
	ResWithJson(w, code, map[string]string{
		"error": msg,
	})
}

func ResWithJson(w http.ResponseWriter, code int, payload interface{}) error {
	res, err := json.Marshal(payload)
	if err != nil {
		return err
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(code)
	w.Write(res)
	return nil
}
