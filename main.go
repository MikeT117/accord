package main

import (
	"context"

	voice_server "github.com/MikeT117/go_web_rtc/voice/websocket"
)

func main() {
	voice_server.CreateWebsocketServer(context.Background())
	""
}
