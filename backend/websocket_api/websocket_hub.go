package websocket_api

import (
	"time"

	message_queue "github.com/MikeT117/accord/backend/internal/message_queue"
	"github.com/MikeT117/accord/backend/internal/sqlc"
	"github.com/google/uuid"
)

type WebsocketHub struct {
	queries    *sqlc.Queries
	clients    map[uuid.UUID]*WebsocketClient
	forward    chan *message_queue.ForwardedPayload
	local      chan *message_queue.LocalPayload
	register   chan *WebsocketClient
	unregister chan uuid.UUID
}

func (wh *WebsocketHub) GetClientByID(id uuid.UUID) *WebsocketClient {
	return wh.clients[id]
}

func (wh *WebsocketHub) RegisterClient(client *WebsocketClient) {
	wh.register <- client
}

func (wh *WebsocketHub) Run() {
	for {
		select {
		case client := <-wh.register:
			wh.clients[client.id] = client
		case id := <-wh.unregister:
			delete(wh.clients, id)
		}
	}
}

func CreateWebsocketHub(queries *sqlc.Queries, pingInterval time.Duration) *WebsocketHub {
	return &WebsocketHub{
		queries:    queries,
		clients:    make(map[uuid.UUID]*WebsocketClient),
		forward:    make(chan *message_queue.ForwardedPayload),
		local:      make(chan *message_queue.LocalPayload),
		register:   make(chan *WebsocketClient),
		unregister: make(chan uuid.UUID),
	}
}
