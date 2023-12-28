package message_queue

import (
	"encoding/json"

	"github.com/google/uuid"
)

type ForwardedPayload struct {
	Op              string
	Version         int
	RoleIDs         []uuid.UUID
	UserIDs         []uuid.UUID
	ExcludedUserIDs []uuid.UUID
	Data            interface{}
}

type LocalPayload struct {
	Op      string
	Version int
	UserIDs []uuid.UUID
	RoleIDs []uuid.UUID
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

	return mq.Conn.Publish("ACCORD.FORWARD", body)
}
