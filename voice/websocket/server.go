package voice_server

import (
	"context"
	"fmt"
	"log"
	"net/http"

	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
}

var webRTCHub *WebRTCHub = CreateWebRTCHub()
var websocketHub *WebsocketHub = CreateWebsocketHub()

func CreateWebsocketServer(ctx context.Context) {

	http.HandleFunc("/websocket", func(w http.ResponseWriter, r *http.Request) {

		// Get ChannelID from query params

		conn, err := upgrader.Upgrade(w, r, nil)

		if err != nil {
			log.Print(err)
			w.WriteHeader(http.StatusInternalServerError)
			w.Write([]byte(err.Error()))
			return
		}

		channel := webRTCHub.GetOrCreateChannel("channel1")
		CreateWebsocketClient(websocketHub, channel, conn)
	})

	if err := http.ListenAndServe(
		fmt.Sprintf(":%s", fmt.Sprint(4001)), nil); err != nil {
		if err != nil {
			log.Print(err)
		}
	}
}
