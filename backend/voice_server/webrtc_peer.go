package voice_server

import (
	"github.com/gorilla/websocket"
	"github.com/pion/webrtc/v4"
)

type Peer struct {
	id      string
	channel *WebRTCChannel
	pConn   *webrtc.PeerConnection
	wConn   *websocket.Conn
}
