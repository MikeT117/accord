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

	log.Printf("OP: %s - Recieved Forward Payload For RoleIDs: %v\n", payload.Op, payload.RoleIDs)

	wh.clients.Mutex.RLock()
	defer wh.clients.Mutex.RUnlock()

	for i := range wh.clients.Data {
		wh.clients.Data[i].forward <- payload
	}
}

func (wh *WebsocketHub) HandleLocalEvent(data []byte) {

	payload := &message_queue.LocalPayload{}
	if err := json.Unmarshal(data, payload); err != nil {
		log.Printf("MESSAGE_PAYLOAD_PARSE_FAILURE_DROPPING_MESSAGE\n%v\n", err)
		return
	}

	log.Printf("OP: %s - Recieved Local Payload\n", payload.Op)

	wh.clients.Mutex.RLock()
	defer wh.clients.Mutex.RUnlock()

	for i := range wh.clients.Data {
		wh.clients.Data[i].local <- payload
	}
}
