package voice_server

import (
	"log"
	"net/http"
	"os"
	"time"

	"github.com/MikeT117/accord/backend/internal/message_queue"
	"github.com/MikeT117/accord/backend/internal/sqlc"
	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
}

func CreateWebsocketServer(queries *sqlc.Queries, messageQueue *message_queue.MessageQueue) {

	var hub *VoiceServerHub = CreateHub(
		queries,
		messageQueue,
		time.Duration(15*time.Second),
		time.Duration(30*time.Second),
		time.Duration(60*time.Second),
		time.Duration(10*time.Second),
	)

	http.HandleFunc("/rtc", func(w http.ResponseWriter, r *http.Request) {

		conn, err := upgrader.Upgrade(w, r, nil)

		if err != nil {
			log.Println("Upgrade Error: ", err)
			w.Header().Add("X-App-Error", "UNABLE_TO_ESTABLISH_WEBSOCKET_CONNECTION")
			w.WriteHeader(http.StatusInternalServerError)
			return
		}

		hub.CreateClient(conn)
	})

	log.Println(http.ListenAndServe(os.Getenv("WEBRTC_WS_PORT"), nil))
}
