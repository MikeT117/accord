package main

import (
	"context"
	"fmt"
	"os"

	"github.com/MikeT117/accord/backend/internal/database"
	message_queue "github.com/MikeT117/accord/backend/internal/message_queue"
	"github.com/MikeT117/accord/backend/internal/sqlc"
	"github.com/MikeT117/accord/backend/internal/utils"
	rest_api "github.com/MikeT117/accord/backend/rest_api"
)

func main() {
	utils.LoadEnvironment()

	fmt.Println("NATS_URL: ", os.Getenv("NATS_URL"))

	ctx := context.Background()
	pool := database.Create(ctx)
	queries := sqlc.New(pool)
	nats := message_queue.CreateNATSConnection()
	defer nats.Conn.Drain()

	rest_api.CreateRestAPI(queries, pool, nats)
}
