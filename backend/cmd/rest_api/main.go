package main

import (
	"context"
	"log"

	"github.com/MikeT117/accord/backend/internal/database"
	message_queue "github.com/MikeT117/accord/backend/internal/message_queue"
	"github.com/MikeT117/accord/backend/internal/sqlc"
	rest_api "github.com/MikeT117/accord/backend/rest_api"
	"github.com/joho/godotenv"
)

func main() {
	if err := godotenv.Load(".env"); err != nil {
		log.Fatal("Error loading .env file")
	}

	ctx := context.Background()
	pool := database.Create(ctx)
	queries := sqlc.New(pool)
	nats := message_queue.CreateNATSConnection()
	defer nats.Conn.Drain()

	rest_api.CreateRestAPI(queries, pool, nats)
}
