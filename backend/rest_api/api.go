package rest_api

import (
	"github.com/MikeT117/accord/backend/internal/mapper"
	message_queue "github.com/MikeT117/accord/backend/internal/message_queue"
	"github.com/MikeT117/accord/backend/internal/sqlc"
	"github.com/jackc/pgx/v5/pgxpool"
)

type api struct {
	Pool         *pgxpool.Pool
	Queries      *sqlc.Queries
	Mapper       *mapper.ConverterImpl
	MessageQueue *message_queue.MessageQueue
}

func CreateRestAPI(queries *sqlc.Queries, pool *pgxpool.Pool, messageQueue *message_queue.MessageQueue) {
	api := &api{
		Pool:         pool,
		MessageQueue: messageQueue,
		Queries:      queries,
		Mapper:       &mapper.ConverterImpl{},
	}
	api.CreateRouterAndMountRoutes()
}
