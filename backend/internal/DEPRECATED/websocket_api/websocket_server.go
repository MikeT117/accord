package websocket_api

import (
	"fmt"
	"log"
	"net/http"
	"os"
	"time"

	message_queue "github.com/MikeT117/accord/backend/internal/message_queue"
	"github.com/MikeT117/accord/backend/internal/sqlc"
	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
}

func CreateWebsocketServer(queries *sqlc.Queries, messageQueue *message_queue.MessageQueue) {

	hub := CreateHub(
		queries,
		time.Duration(30*time.Second),
		time.Duration(30*time.Second),
		time.Duration(60*time.Second),
		time.Duration(10*time.Second),
	)

	go messageQueue.CreateSubscription("ACCORD.FORWARD", hub.HandleFowardedEvent)
	go messageQueue.CreateSubscription("ACCORD.LOCAL", hub.HandleLocalEvent)

	http.HandleFunc("/ws", func(w http.ResponseWriter, r *http.Request) {

		conn, err := upgrader.Upgrade(w, r, nil)

		if err != nil {
			log.Printf("Upgrade Error: %v\n", err)
			w.Header().Add("X-App-Error", "UNABLE_TO_ESTABLISH_WEBSOCKET_CONNECTION")
			w.WriteHeader(http.StatusInternalServerError)
			return
		}

		hub.CreateClient(conn)
	})

	log.Println(http.ListenAndServe(fmt.Sprintf(":%s", os.Getenv("WEBSOCKET_PORT")), nil))
}
