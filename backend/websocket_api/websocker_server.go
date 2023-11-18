package websocket_api

import (
	"fmt"
	"log"
	"net/http"
	"os"

	message_queue "github.com/MikeT117/accord/backend/internal/message_queue"
	"github.com/MikeT117/accord/backend/internal/sqlc"
	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
}

func CreateWebsocketServer(queries *sqlc.Queries, messageQueue *message_queue.MessageQueue) {

	websocketHub := CreateWebsocketHub(queries)

	go messageQueue.CreateSubscription("ACCORD.FORWARD", websocketHub.HandleFowardedEvent)
	go messageQueue.CreateSubscription("ACCORD.LOCAL", websocketHub.HandleLocalEvent)

	http.HandleFunc("/ws", func(w http.ResponseWriter, r *http.Request) {

		conn, err := upgrader.Upgrade(w, r, nil)

		if err != nil {
			log.Printf("upgrader.Upgrade: %v\n", err)
			w.Header().Add("X-App-Error", "UNABLE_TO_ESTABLISH_WEBSOCKET_CONNECTION")
			w.WriteHeader(http.StatusInternalServerError)
			return
		}

		CreateWebsocketClient(websocketHub, conn)
	})

	if err := http.ListenAndServe(
		fmt.Sprintf(":%s", os.Getenv("WEBSOCKET_PORT")), nil); err != nil {
		if err != nil {
			log.Panicln("ListenAndServe", err)
		}
	}
}
