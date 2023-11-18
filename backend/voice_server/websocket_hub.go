package voice_server

import (
	"fmt"
	"log"
	"time"

	"github.com/MikeT117/accord/backend/internal/message_queue"
	"github.com/MikeT117/accord/backend/internal/sqlc"
	"github.com/google/uuid"
	"github.com/gorilla/websocket"
)

type WebsocketHub struct {
	queries      *sqlc.Queries
	webRTCHub    *WebRTCHub
	messageQueue *message_queue.MessageQueue
	clients      map[uuid.UUID]*WebsocketClient
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

func (wh *WebsocketHub) CreateClient(hub *WebsocketHub, conn *websocket.Conn) *WebsocketClient {

	wc := &WebsocketClient{
		hub:  hub,
		conn: conn,
	}

	wc.conn.SetPongHandler(func(string) error {
		fmt.Println("RECIEVING_PONG")
		if err := wc.conn.SetReadDeadline(time.Now().Add(wh.pongWait)); err != nil {
			log.Printf("PONG_ERROR: %v\n", err.Error())
			wc.CloseMessage(1002, "PONG_TIMEOUT")
		}
		return nil
	})

	wc.conn.SetCloseHandler(func(code int, text string) error {
		fmt.Printf("CLOSE_HANDLER - Reason: %s\n", text)
		wc.conn.Close()
		wc.hub.unregister <- wc.id
		return nil
	})

	go wc.ReadMessages()
	go wc.WriteMessages()

	return wc
}

func (wh *WebsocketHub) Run() {
	for {
		select {
		case client := <-wh.register:
			wh.clients[client.id] = client
		case id := <-wh.unregister:
			if client, ok := wh.clients[id]; ok {
				client.peer.pConn.Close()
				client.conn.Close()
				delete(wh.clients, id)
			}

		}
	}
}

func CreateWebsocketHub(queries *sqlc.Queries, webRTCHub *WebRTCHub, messageQueue *message_queue.MessageQueue) *WebsocketHub {
	hub := &WebsocketHub{
		queries:      queries,
		messageQueue: messageQueue,
		webRTCHub:    webRTCHub,
		clients:      make(map[uuid.UUID]*WebsocketClient),
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
