package main

import (
	"context"
	"log"
	"net/http"
	_ "net/http/pprof"

	"github.com/MikeT117/accord/backend/internal/database"
	"github.com/MikeT117/accord/backend/internal/message_queue"
	"github.com/MikeT117/accord/backend/internal/sqlc"
	"github.com/MikeT117/accord/backend/internal/utils"
	"github.com/MikeT117/accord/backend/voice_server"
)

func main() {

	go func() {
		log.Println(http.ListenAndServe("localhost:6060", nil))
	}()

	utils.LoadEnvironment()

	ctx := context.Background()
	pool := database.Create(ctx)
	queries := sqlc.New(pool)
	nats := message_queue.CreateNATSConnection()
	defer nats.Conn.Drain()

	voice_server.CreateWebsocketServer(queries, nats)
}
