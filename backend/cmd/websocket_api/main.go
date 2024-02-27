package main

import (
	"context"

	"github.com/MikeT117/accord/backend/internal/database"
	"github.com/MikeT117/accord/backend/internal/message_queue"
	"github.com/MikeT117/accord/backend/internal/sqlc"
	"github.com/MikeT117/accord/backend/internal/utils"
	websocket_api "github.com/MikeT117/accord/backend/websocket_api"
)

func main() {
	utils.LoadEnvironment()

	ctx := context.Background()
	pool := database.Create(ctx)
	queries := sqlc.New(pool)
	nats := message_queue.CreateNATSConnection()
	defer nats.Conn.Drain()

	websocket_api.CreateWebsocketServer(queries, nats)
}
