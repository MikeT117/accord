package pubsub

import (
	"context"
	"log"
	"time"

	"github.com/MikeT117/accord/backend/internal/config"
	pb "github.com/MikeT117/accord/backend/internal/infra/pb/gen"
	"github.com/nats-io/nats.go"
	"google.golang.org/protobuf/proto"
)

type EventPublisher struct {
	conn *nats.Conn
}

func MustCreateEventPublisher(ctx context.Context, config *config.Config) *EventPublisher {
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

	return &EventPublisher{
		conn: conn,
	}
}

func (ep *EventPublisher) Close() {
	ep.conn.Close()
}

func (ep *EventPublisher) PublishProviderEvent(op int32, userIDs []string, roleIDs []string) error {
	var ver int32 = 0
	event, err := proto.Marshal(&pb.ProviderEvent{
		Ver:     &ver,
		Op:      &op,
		UserIds: userIDs,
		RoleIds: roleIDs,
	})

	if err != nil {
		return err
	}

	return ep.conn.Publish("ACCORD.EVENTS.PROVIDER", event)
}

func (ep *EventPublisher) PublishUserEvent(op int32, userIDs []string, data []byte) error {
	var ver int32 = 0
	event, err := proto.Marshal(&pb.UserEvent{
		Ver:     &ver,
		Op:      &op,
		UserIds: userIDs,
		Data:    data,
	})

	if err != nil {
		return err
	}

	return ep.conn.Publish("ACCORD.EVENTS.USER", event)
}

func (ep *EventPublisher) PublishRoleEvent(op int32, roleIDs []string, data []byte) error {
	var ver int32 = 0
	event, err := proto.Marshal(&pb.RoleEvent{
		Ver:     &ver,
		Op:      &op,
		RoleIds: roleIDs,
		Data:    data,
	})

	if err != nil {
		return err
	}

	return ep.conn.Publish("ACCORD.EVENTS.ROLE", event)
}
