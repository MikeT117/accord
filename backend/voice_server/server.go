package voice_server

import (
	"context"
	"log"
	"net/http"
	"os"
	"strconv"
	"time"

	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
}

var webRTCHub *WebRTCHub = CreateWebRTCHub()
var websocketHub *WebsocketHub = CreateWebsocketHub()

func CreateWebsocketServer(ctx context.Context) {
	http.HandleFunc("/api/websocket", func(w http.ResponseWriter, r *http.Request) {

		// Get ChannelID along with tokens from identify payload

		conn, err := upgrader.Upgrade(w, r, nil)

		if err != nil {
			log.Print(err)
			w.WriteHeader(http.StatusInternalServerError)
			w.Write([]byte(err.Error()))
			return
		}
		websocketClient := websocketHub.CreateClient(websocketHub, conn)

		go websocketClient.ReadMessages()
		go websocketClient.WriteMessages()

		peerID := strconv.FormatInt(time.Now().UnixNano(), 10)
		channel := webRTCHub.CreateChannel("channel1")
		peer, err := channel.CreatePeer(peerID, conn)

		if err != nil {
			websocketClient.CloseMessage(4001, "ceer could not be created")
		}

		websocketClient.peer = peer
		channel.SignalPeers()
	})

	if err := http.ListenAndServe(os.Getenv("LISTEN"), nil); err != nil {
		if err != nil {
			log.Print(err)
		}
	}
}
