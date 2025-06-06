package message_queue

import (
	"encoding/json"
)

func (mq *MessageQueue) PublishProviderPayload(msg *ProviderPayload) error {
	body, err := json.Marshal(msg)

	if err != nil {
		return err
	}

	return mq.Conn.Publish("ACCORD.PROVIDER", body)
}

func (mq *MessageQueue) PublishSubscriberPayload(msg *SubscriberPayload) error {
	body, err := json.Marshal(msg)

	if err != nil {
		return err
	}

	return mq.Conn.Publish("ACCORD.SUBSCRIBER", body)
}
