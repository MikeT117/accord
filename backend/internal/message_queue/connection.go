package message_queue

import (
	"log"
	"os"
	"time"

	"github.com/nats-io/nats.go"
)

type MessageQueue struct {
	Conn *nats.Conn
}

func CreateNATSConnection() *MessageQueue {
	conn, err := nats.Connect(
		os.Getenv("NATS_URL"),
		nats.UserInfo(os.Getenv("NATS_USER"), os.Getenv("NATS_PASSWORD")),
		nats.PingInterval(10*time.Second),
		nats.MaxPingsOutstanding(2),
		nats.ReconnectWait(5*time.Second),
		nats.MaxReconnects(5),
		nats.DisconnectErrHandler(func(nc *nats.Conn, err error) {
			log.Println("NATS Disconnect event: ", err.Error())
		}),
		nats.ReconnectHandler(func(nc *nats.Conn) {
			log.Println("NATS Reconnect event")
		}),
		nats.ClosedHandler(func(c *nats.Conn) {
			log.Panicf("NATS connection dropped, no longer retrying.")
		}),
	)

	if err != nil {
		log.Panicf("Unable to connect to NATs server: %v\n", err)
	}

	return &MessageQueue{
		Conn: conn,
	}
}
