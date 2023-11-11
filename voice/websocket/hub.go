package voice_websocket

import (
	"github.com/google/uuid"
)

type WebsocketHub struct {
	clients    map[uuid.UUID]*WebsocketClient
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

func CreateWebsocketHub() *WebsocketHub {
	hub := &WebsocketHub{
		clients:    make(map[uuid.UUID]*WebsocketClient),
		register:   make(chan *WebsocketClient),
		unregister: make(chan uuid.UUID),
	}

	go hub.Run()
	return hub
}
