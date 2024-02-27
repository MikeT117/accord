package utils

import (
	"log"
	"os"

	"github.com/joho/godotenv"
)

func LoadEnvironment() {

	godotenv.Load(".env")

	if appMode := os.Getenv("APP_MODE"); appMode != "DEVELOPMENT" && appMode != "PRODUCTION" {
		log.Fatal("INVALID APP_MODE!")
	}

}
