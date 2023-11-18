package voice_server

import (
	"log"
	"net/http"
	"os"

	"github.com/MikeT117/accord/backend/internal/message_queue"
	"github.com/MikeT117/accord/backend/internal/sqlc"
	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
}

func CreateWebsocketServer(queries *sqlc.Queries, messageQueue *message_queue.MessageQueue) {

	var webRTCHub *WebRTCHub = CreateWebRTCHub()
	var websocketHub *WebsocketHub = CreateWebsocketHub(queries, webRTCHub, messageQueue)

	http.HandleFunc("/api/websocket", func(w http.ResponseWriter, r *http.Request) {

		conn, err := upgrader.Upgrade(w, r, nil)

		if err != nil {
			log.Print(err)
			w.WriteHeader(http.StatusInternalServerError)
			w.Write([]byte(err.Error()))
			return
		}

		websocketHub.CreateClient(websocketHub, conn)
	})

	if err := http.ListenAndServe(os.Getenv("LISTEN"), nil); err != nil {
		if err != nil {
			log.Print(err)
		}
	}
}
