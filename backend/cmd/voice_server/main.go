package main

import (
	"context"
	"log"
	"net/http"
	_ "net/http/pprof"

	"github.com/MikeT117/accord/backend/internal/database"
	"github.com/MikeT117/accord/backend/internal/message_queue"
	"github.com/MikeT117/accord/backend/internal/sqlc"
	"github.com/MikeT117/accord/backend/voice_server"
	"github.com/joho/godotenv"
)

func main() {

	go func() {
		log.Println(http.ListenAndServe("localhost:6060", nil))
	}()

	if err := godotenv.Load(".env"); err != nil {
		log.Fatal("Error loading .env file")
	}

	ctx := context.Background()
	pool := database.Create(ctx)
	queries := sqlc.New(pool)
	nats := message_queue.CreateNATSConnection()
	defer nats.Conn.Drain()

	voice_server.CreateWebsocketServer(queries, nats)
}
