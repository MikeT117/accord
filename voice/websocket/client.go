package voice_websocket

import (
	"encoding/json"
	"fmt"
	"log"
	"strconv"
	"time"

	voice_signal "github.com/MikeT117/go_web_rtc/voice/signal"
	voice_webrtc "github.com/MikeT117/go_web_rtc/voice/webrtc"
	"github.com/google/uuid"
	"github.com/gorilla/websocket"
	"github.com/pion/webrtc/v4"
)

type WebsocketClient struct {
	websocketHub *WebsocketHub
	webRTCHub    *voice_webrtc.WebRTCHub
	conn         *websocket.Conn
	id           uuid.UUID
	authTimeout  time.Duration
	pingInterval time.Duration
	pongWait     time.Duration
	writeWait    time.Duration
}

type WebRTCInitPayload struct {
	SDP       webrtc.SessionDescription `json:"sdp"`
	ChannelID string                    `json:"channelId"`
}

func (wc *WebsocketClient) CloseMessage(status int, message string) {
	wc.conn.WriteMessage(websocket.CloseMessage, websocket.FormatCloseMessage(status, message))
}

func (wc *WebsocketClient) ReadMessages() {

	wc.conn.SetReadDeadline(time.Now().Add(wc.pongWait))

	for {
		_, p, err := wc.conn.ReadMessage()
		fmt.Println("READ_MESSAGE_EXECUTING")

		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				log.Printf("Error unexpected close: %v\n", err)
			} else {
				log.Printf("Unknown error: %v\n", err)
			}
			return
		}

		webRTCInitPayload := &WebRTCInitPayload{}

		if err := json.Unmarshal(p, webRTCInitPayload); err != nil {
			wc.CloseMessage(4001, "Invalid offer")
			return
		}

		fmt.Printf("SDP: %s\n", webRTCInitPayload.SDP.SDP)
		fmt.Printf("Type: %s\n", webRTCInitPayload.SDP.Type)
		fmt.Printf("ChannelID: %s\n", webRTCInitPayload.ChannelID)

		if len(webRTCInitPayload.ChannelID) == 0 {
			wc.CloseMessage(4001, "Invalid offer")
			return
		}

		channel, ok := wc.webRTCHub.Channels[webRTCInitPayload.ChannelID]

		if !ok {
			channel = wc.webRTCHub.CreateChannel(webRTCInitPayload.ChannelID)
		}

		peerID := strconv.FormatInt(time.Now().UnixNano(), 10)
		peer, err := channel.CreatePeer(peerID, webRTCInitPayload.SDP)

		if err != nil {
			channel.ClosePeer(peerID)
			wc.CloseMessage(4001, "Unable to create peer")
			return
		}

		answer := voice_signal.Encode(peer.LocalDescription())
		wc.conn.WriteMessage(websocket.TextMessage, []byte(answer))
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

func CreateWebsocketClient(websocketHub *WebsocketHub, webRTCHub *voice_webrtc.WebRTCHub, conn *websocket.Conn) {

	wc := &WebsocketClient{

		websocketHub: websocketHub,
		webRTCHub:    webRTCHub,
		conn:         conn,
		authTimeout:  time.Duration(10 * time.Second),
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

	wc.websocketHub.RegisterClient(wc)

	go wc.ReadMessages()
	go wc.WriteMessages()

	time.Sleep(wc.authTimeout)
}
