package websocket_api

import (
	"log"
	"net/http"
	"slices"

	"github.com/MikeT117/accord/backend/internal/config"
	"github.com/gorilla/websocket"
)

func HandleNewWS(hub *Hub, config *config.Config, w http.ResponseWriter, r *http.Request) {
	upgrader := websocket.Upgrader{
		ReadBufferSize:  1024,
		WriteBufferSize: 1024,

		CheckOrigin: func(r *http.Request) bool {
			allowedOrigins := []string{config.Host, config.FrontendHost}
			return slices.Contains(allowedOrigins, r.Header.Get("Origin"))
		},
	}

	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println(err)
		return
	}

	hub.HandleNewClient(conn, hub)
}
