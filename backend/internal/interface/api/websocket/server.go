package websocket_api

import (
	"log"
	"net/http"

	"github.com/gorilla/websocket"
)

func HandleNewWS(hub *Hub, w http.ResponseWriter, r *http.Request) {
	upgrader := websocket.Upgrader{
		ReadBufferSize:  1024,
		WriteBufferSize: 1024,
	}

	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println(err)
		return
	}

	hub.HandleNewClient(conn, hub)
}
