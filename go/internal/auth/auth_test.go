package auth

import (
	"fmt"
	"testing"
)

func TestAuthOne(t *testing.T) {
	pwd := "password123412541512345"
	hashed, err := HashPassword(pwd)
	if err != nil {
		t.Fatal(err)
	}

	fmt.Println("TestAuthOne - Original:", pwd, "Hashed:", hashed)
	if err := CheckPasswordHash(pwd, hashed); err != nil {
		t.Errorf("TestAuthOne failed: %v", err)
	}
}

func TestAuthTwo(t *testing.T) {
	pwd := "as;lkdfja;lksdfjlk;asjdkmxcnvmnjkwjreiofgiowj412341"
	hashed, err := HashPassword(pwd)
	if err != nil {
		t.Fatal(err)
	}
	fmt.Println("TestAuthTwo - Original:", pwd, "Hashed:", hashed)
	if err := CheckPasswordHash(pwd, hashed); err != nil {
		t.Errorf("TestAuthTwo failed: %v", err)
	}
}
