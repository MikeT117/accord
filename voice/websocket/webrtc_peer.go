package voice_server

import (
	"github.com/gorilla/websocket"
	"github.com/pion/webrtc/v4"
)

type Peer struct {
	ID    string
	Conn  *webrtc.PeerConnection
	WS    *websocket.Conn
	Track *webrtc.TrackLocalStaticRTP
}
