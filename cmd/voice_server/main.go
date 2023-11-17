package main

import (
	"context"
	"log"

	"github.com/MikeT117/go_web_rtc/voice_server"
	"github.com/joho/godotenv"
)

func main() {
	if err := godotenv.Load(); err != nil {
		log.Print("No .env file found")
	}

	voice_server.CreateWebsocketServer(context.Background())
}
