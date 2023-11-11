package main

import (
	"context"

	voice_websocket "github.com/MikeT117/go_web_rtc/voice/websocket"
)

func main() {
	voice_websocket.CreateWebsocketServer(context.Background())
}
