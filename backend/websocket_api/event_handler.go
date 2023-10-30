package websocket_api

import (
	"encoding/json"
	"log"

	message_queue "github.com/MikeT117/accord/backend/internal/message_queue"
)

func (wh *WebsocketHub) HandleFowardedEvent(data []byte) {

	payload := &message_queue.ForwardedPayload{}
	if err := json.Unmarshal(data, payload); err != nil {
		log.Printf("MESSAGE_PAYLOAD_PARSE_FAILURE_DROPPING_MESSAGE\n%v\n", err)
		return
	}

	log.Printf("OP: %s - Recieved a message %s\n", payload.Op, string(data))
	wh.forward <- payload
}

func (wh *WebsocketHub) HandleLocalEvent(data []byte) {

	payload := &message_queue.ForwardedPayload{}
	if err := json.Unmarshal(data, payload); err != nil {
		log.Printf("MESSAGE_PAYLOAD_PARSE_FAILURE_DROPPING_MESSAGE\n%v\n", err)
		return
	}

	log.Printf("OP: %s - Recieved a message %s\n", payload.Op, string(data))
	wh.forward <- payload
}
