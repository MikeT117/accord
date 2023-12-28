package websocket_api

import (
	"log"
	"os"
	"os/signal"
	"sync"
	"syscall"
	"time"

	"github.com/MikeT117/accord/backend/internal/sqlc"
	"github.com/MikeT117/accord/backend/internal/utils"
	"github.com/google/uuid"
	"github.com/gorilla/websocket"
)

type WebsocketHub struct {
	queries      *sqlc.Queries
	clients      utils.SafeRWMutexMap[map[uuid.UUID]*WebsocketClient]
	authTimeout  time.Duration
	pingInterval time.Duration
	pongWait     time.Duration
	writeWait    time.Duration
}

func (wh *WebsocketHub) AddClient(client *WebsocketClient) {
	wh.clients.Mutex.Lock()
	defer wh.clients.Mutex.Unlock()
	wh.clients.Data[client.id] = client
}

func (wh *WebsocketHub) DelClient(id uuid.UUID) {
	wh.clients.Mutex.Lock()
	defer wh.clients.Mutex.Unlock()
	delete(wh.clients.Data, id)
}

func (wh *WebsocketHub) CloseHub() {
	wh.clients.Mutex.Lock()
	defer wh.clients.Mutex.Unlock()
	for idx := range wh.clients.Data {
		wh.clients.Data[idx].conn.WriteMessage(websocket.CloseMessage, websocket.FormatCloseMessage(websocket.CloseGoingAway, ""))
	}
}

func CreateHub(queries *sqlc.Queries, authTimeout time.Duration, pingInterval time.Duration, pongWait time.Duration, writeWait time.Duration) *WebsocketHub {
	hub := &WebsocketHub{
		queries: queries,
		clients: utils.SafeRWMutexMap[map[uuid.UUID]*WebsocketClient]{
			Mutex: sync.RWMutex{},
			Data:  make(map[uuid.UUID]*WebsocketClient),
		},
		authTimeout:  authTimeout,
		pingInterval: pingInterval,
		pongWait:     pongWait,
		writeWait:    writeWait,
	}

	go func() {

		c := make(chan os.Signal, 1)
		signal.Notify(c, os.Interrupt, syscall.SIGINT, syscall.SIGTERM)

		<-c
		log.Println("HUB SUTTING DOWN")
		hub.CloseHub()
		os.Exit(0)

	}()

	return hub
}
