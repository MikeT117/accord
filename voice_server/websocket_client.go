package voice_server

import (
	"encoding/json"
	"fmt"
	"log"
	"time"

	"github.com/google/uuid"
	"github.com/gorilla/websocket"
	"github.com/pion/webrtc/v4"
)

type WebsocketClient struct {
	id   uuid.UUID
	hub  *WebsocketHub
	peer *Peer
	conn *websocket.Conn
}

type WebsocketMessage struct {
	Event string `json:"event"`
	Data  string `json:"data"`
}

func (wc *WebsocketClient) CloseMessage(status int, message string) {
	wc.conn.WriteMessage(websocket.CloseMessage, websocket.FormatCloseMessage(status, message))
}

func (wc *WebsocketClient) ReadMessages() {

	wc.conn.SetReadDeadline(time.Now().Add(wc.hub.pongWait))

	message := &WebsocketMessage{}
	for {
		_, p, err := wc.conn.ReadMessage()
		fmt.Println("READ_MESSAGE_EXECUTING")

		if err != nil {
			log.Println(err)
			return
		} else if err := json.Unmarshal(p, &message); err != nil {
			log.Println(err)
			return
		}

		switch message.Event {
		case "candidate":
			fmt.Println("READ MESSAGE - CANDIDATE")
			candidate := webrtc.ICECandidateInit{}
			if err := json.Unmarshal([]byte(message.Data), &candidate); err != nil {
				fmt.Println(err)
				return
			}

			if err := wc.peer.pConn.AddICECandidate(candidate); err != nil {
				log.Println(err)
				return
			}
		case "answer":
			fmt.Println("READ MESSAGE - ANSWER")
			answer := webrtc.SessionDescription{}
			if err := json.Unmarshal([]byte(message.Data), &answer); err != nil {
				log.Println(err)
				return
			}

			if err := wc.peer.pConn.SetRemoteDescription(answer); err != nil {
				log.Println(err)
				return
			}
		}

	}
}

func (wc *WebsocketClient) WriteMessages() {

	ticker := time.NewTicker(wc.hub.pingInterval)

	defer func() {
		ticker.Stop()
	}()

	for {
		<-ticker.C
		fmt.Println("SENDING_PING")
		wc.conn.SetWriteDeadline(time.Now().Add(wc.hub.writeWait))
		if err := wc.conn.WriteMessage(websocket.PingMessage, nil); err != nil {
			wc.CloseMessage(1002, "PING_FAILURE")
			return
		}

	}
}
