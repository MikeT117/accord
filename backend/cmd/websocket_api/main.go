package main

import (
	"context"
	"log"

	"github.com/MikeT117/accord/backend/internal/database"
	"github.com/MikeT117/accord/backend/internal/message_queue"
	"github.com/MikeT117/accord/backend/internal/sqlc"
	websocket_api "github.com/MikeT117/accord/backend/websocket_api"
	"github.com/joho/godotenv"
)

func main() {
	if err := godotenv.Load(".env"); err != nil {
		log.Fatal("Error loading .env file")
	}

	ctx := context.Background()
	pool := database.Create(ctx)
	queries := sqlc.New(pool)
	messageQueue := message_queue.CreateMessageQueue()
	defer messageQueue.Conn.Close()

	websocket_api.CreateWebsocketServer(ctx, pool, queries, messageQueue)
}
