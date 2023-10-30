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

func handleDisconnect(nc *nats.Conn, err error) {
	log.Println("NATS Disconnect event: ", err.Error())
}

func handleReconnect(nc *nats.Conn) {
	log.Println("NATS Reconnect event")
}

func createConnection(disconnectHandler nats.ConnErrHandler, reconnectHandler nats.ConnHandler) *nats.Conn {
	conn, err := nats.Connect(
		os.Getenv("NATS_URL"),
		nats.UserInfo(os.Getenv("NATS_USER"), os.Getenv("NATS_PASSWORD")),
		nats.PingInterval(10*time.Second),
		nats.MaxPingsOutstanding(2),
		nats.ReconnectWait(5*time.Second),
		nats.MaxReconnects(5),
		nats.DisconnectErrHandler(disconnectHandler),
		nats.ReconnectHandler(reconnectHandler),
	)

	if err != nil {
		log.Panicf("Unable to connect to NATs server: %v\n", err)
	}

	return conn
}

func CreateMessageQueue() *MessageQueue {
	conn := createConnection(handleDisconnect, handleReconnect)
	return &MessageQueue{
		Conn: conn,
	}
}
