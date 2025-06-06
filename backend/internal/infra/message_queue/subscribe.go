package message_queue

import (
	"log"
	"os"
	"os/signal"
	"syscall"

	"github.com/nats-io/nats.go"
)

func (mq *MessageQueue) CreateSubscription(subject string, handler func(data []byte)) {
	sub, err := mq.Conn.Subscribe(subject, func(msg *nats.Msg) {
		handler(msg.Data)
	})

	if err != nil {
		log.Panicf("Unable to subscribe to subject: %v\n", err)
	}

	defer sub.Unsubscribe()

	log.Printf("NATS_SUBSCRIPTION_CREATED %s\n", subject)

	c := make(chan os.Signal, 1)
	signal.Notify(c, os.Interrupt, syscall.SIGTERM)
	<-c

	os.Exit(0)
}
