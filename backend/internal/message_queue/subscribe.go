package message_queue

import (
	"fmt"
	"log"
	"os"
	"os/signal"
	"syscall"

	"github.com/nats-io/nats.go"
)

func (mq *MessageQueue) CreateSubscription(subject string, handler func(data []byte)) {
	if _, err := mq.Conn.Subscribe(subject, func(msg *nats.Msg) {
		handler(msg.Data)
	}); err != nil {
		if err != nil {
			log.Panicf("Unable to subscribe to subject: %v\n", err)
		}
	}

	c := make(chan os.Signal, 1)
	signal.Notify(c, os.Interrupt, syscall.SIGTERM)
	<-c

	fmt.Println("Exiting...")
	os.Exit(0)
}
