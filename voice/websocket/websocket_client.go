package voice_server

import (
	"encoding/json"
	"fmt"
	"log"
	"strconv"
	"time"

	"github.com/google/uuid"
	"github.com/gorilla/websocket"
	"github.com/pion/webrtc/v4"
)

type WebsocketClient struct {
	websocketHub *WebsocketHub
	channel      *Channel
	Peer         *Peer
	conn         *websocket.Conn
	id           uuid.UUID
	pingInterval time.Duration
	pongWait     time.Duration
	writeWait    time.Duration
}

type WebsocketMessage struct {
	Event string `json:"event"`
	Data  string `json:"data"`
}

func (wc *WebsocketClient) CloseMessage(status int, message string) {
	wc.conn.WriteMessage(websocket.CloseMessage, websocket.FormatCloseMessage(status, message))
}

func (wc *WebsocketClient) ReadMessages() {

	wc.conn.SetReadDeadline(time.Now().Add(wc.pongWait))

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

			if err := wc.Peer.Conn.AddICECandidate(candidate); err != nil {
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

			if err := wc.Peer.Conn.SetRemoteDescription(answer); err != nil {
				log.Println(err)
				return
			}
		}

	}
}

func (wc *WebsocketClient) WriteMessages() {

	ticker := time.NewTicker(wc.pingInterval)

	defer func() {
		ticker.Stop()
	}()

	for {
		<-ticker.C
		fmt.Println("SENDING_PING")
		wc.conn.SetWriteDeadline(time.Now().Add(wc.writeWait))
		if err := wc.conn.WriteMessage(websocket.PingMessage, nil); err != nil {
			wc.CloseMessage(1002, "PING_FAILURE")
			return
		}

	}
}

func CreateWebsocketClient(websocketHub *WebsocketHub, channel *Channel, conn *websocket.Conn) {

	wc := &WebsocketClient{
		websocketHub: websocketHub,
		conn:         conn,
		channel:      channel,
		pingInterval: time.Duration(15 * time.Second),
		pongWait:     time.Duration(20 * time.Second),
		writeWait:    time.Duration(5 * time.Second),
	}

	wc.conn.SetPongHandler(func(string) error {
		fmt.Println("RECIEVING_PONG")
		if err := wc.conn.SetReadDeadline(time.Now().Add(wc.pongWait)); err != nil {
			log.Printf("PONG_ERROR: %v\n", err.Error())
			wc.CloseMessage(1002, "PONG_TIMEOUT")
		}
		return nil
	})

	wc.conn.SetCloseHandler(func(code int, text string) error {
		fmt.Printf("CLOSE_HANDLER - Reason: %s\n", text)
		wc.conn.Close()
		wc.websocketHub.unregister <- wc.id
		return nil
	})

	wc.channel.CreatePeer(strconv.FormatInt(time.Now().UnixNano(), 10), wc)

}
