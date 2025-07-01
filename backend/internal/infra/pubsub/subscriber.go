package pubsub

import (
	"log"
	"time"

	"github.com/MikeT117/accord/backend/internal/config"
	"github.com/nats-io/nats.go"
)

type EventSubscriber struct {
	conn *nats.Conn
}

func MustCreateEventSubscriber(config *config.Config) *EventSubscriber {
	conn, err := nats.Connect(
		config.NATSURL,
		nats.UserInfo(config.NATSUser, config.NATSPassword),
		nats.PingInterval(10*time.Second),
		nats.MaxPingsOutstanding(2),
		nats.ReconnectWait(5*time.Second),
		nats.MaxReconnects(5),
		nats.DisconnectErrHandler(func(nc *nats.Conn, err error) {
			log.Printf("nats disconnect event")
		}),
		nats.ReconnectHandler(func(nc *nats.Conn) {
			log.Println("nats reconnect event")
		}),
		nats.ClosedHandler(func(c *nats.Conn) {
			log.Println("nats connection dropped, no longer retrying.")
		}),
	)

	if err != nil {
		log.Fatalf("unable to connect to nats server: %s", err)
	}

	return &EventSubscriber{
		conn: conn,
	}
}

func (es *EventSubscriber) MustSubscribe(subject string, handler func(data []byte)) *nats.Subscription {
	subscription, err := es.conn.Subscribe(subject, func(msg *nats.Msg) {
		handler(msg.Data)
	})

	if err != nil {
		log.Fatalf("nats subscription create failed: %s - %s\n", subject, err.Error())
	}

	log.Printf("nats subscription to '%s' created\n", subject)
	return subscription
}
