package websocket_api

import (
	"time"

	message_queue "github.com/MikeT117/accord/backend/internal/message_queue"
	"github.com/MikeT117/accord/backend/internal/sqlc"
	"github.com/google/uuid"
)

type WebsocketHub struct {
	queries      *sqlc.Queries
	clients      map[uuid.UUID]*WebsocketClient
	forward      chan *message_queue.ForwardedPayload
	local        chan *message_queue.LocalPayload
	register     chan *WebsocketClient
	unregister   chan uuid.UUID
	authTimeout  time.Duration
	pingInterval time.Duration
	pongWait     time.Duration
	writeWait    time.Duration
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

func CreateWebsocketHub(queries *sqlc.Queries) *WebsocketHub {
	hub := &WebsocketHub{
		queries:      queries,
		clients:      make(map[uuid.UUID]*WebsocketClient),
		forward:      make(chan *message_queue.ForwardedPayload),
		local:        make(chan *message_queue.LocalPayload),
		register:     make(chan *WebsocketClient),
		unregister:   make(chan uuid.UUID),
		authTimeout:  time.Duration(10 * time.Second),
		pingInterval: time.Duration(15 * time.Second),
		pongWait:     time.Duration(20 * time.Second),
		writeWait:    time.Duration(5 * time.Second),
	}

	go hub.Run()
	return hub
}
