package voice_websocket

import (
	"context"
	"fmt"
	"log"
	"net/http"

	voice_webrtc "github.com/MikeT117/go_web_rtc/voice/webrtc"
	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
}

func CreateWebsocketServer(ctx context.Context) {

	webRTCHub := voice_webrtc.CreateWebRTCHub()
	websocketHub := CreateWebsocketHub()

	http.HandleFunc("/websocket", func(w http.ResponseWriter, r *http.Request) {

		conn, err := upgrader.Upgrade(w, r, nil)

		if err != nil {
			log.Printf("upgrader.Upgrade: %v\n", err)
			w.Header().Add("X-App-Error", "UNABLE_TO_ESTABLISH_WEBSOCKET_CONNECTION")
			w.WriteHeader(http.StatusInternalServerError)
			return
		}

		CreateWebsocketClient(websocketHub, webRTCHub, conn)
	})

	if err := http.ListenAndServe(
		fmt.Sprintf(":%s", fmt.Sprint(4001)), nil); err != nil {
		if err != nil {
			log.Panicln("ListenAndServe", err)
		}
	}
}
