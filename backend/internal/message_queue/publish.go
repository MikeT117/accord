package message_queue

import (
	"encoding/json"
)

type ForwardedPayload struct {
	Op      string
	Version int
	RoleIDs []string
	UserIDs []string
	Data    interface{}
}

type LocalPayload struct {
	Op      string
	Version int
	UserIDs []string
	Data    interface{}
}

func (mq *MessageQueue) PublishLocalPayload(msg *LocalPayload) error {
	body, err := json.Marshal(msg)

	if err != nil {
		return err
	}

	return mq.Conn.Publish("ACCORD.LOCAL", body)
}

func (mq *MessageQueue) PublishForwardPayload(msg *ForwardedPayload) error {
	body, err := json.Marshal(msg)

	if err != nil {
		return err
	}

	return mq.Conn.Publish("ACCORD.LOCAL", body)
}
