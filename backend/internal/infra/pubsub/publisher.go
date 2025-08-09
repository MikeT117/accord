package pubsub

import (
	"context"
	"log"
	"time"

	"github.com/MikeT117/accord/backend/internal/config"
	pb "github.com/MikeT117/accord/backend/internal/infra/pb/gen"
	pointer "github.com/MikeT117/accord/backend/internal/ptr"
	"github.com/google/uuid"
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

func (ep *EventPublisher) PublishProviderEvent(op pb.ProviderOpCode, userID uuid.UUID, payload interface{}) error {
	var ver int32 = 0
	providerEvent := &pb.ProviderEvent{
		Ver:    &ver,
		Op:     &op,
		UserId: pointer.UUIDToStringPtr(userID),
	}

	switch p := payload.(type) {
	case *pb.ProviderEvent_InvalidateToken:
		providerEvent.Payload = p
	case *pb.ProviderEvent_UserRoleAssociate:
		providerEvent.Payload = p
	case *pb.ProviderEvent_UserRoleDisassociate:
		providerEvent.Payload = p
	default:
		return ErrInvalidPayload
	}

	event, err := proto.Marshal(providerEvent)
	if err != nil {
		return ErrInvalidPayload
	}

	return ep.conn.Publish("ACCORD.EVENTS.PROVIDER", event)
}

func (ep *EventPublisher) PublishUserEvent(userIDs []uuid.UUID, data *pb.EventPayload) error {
	var ver int32 = 0
	eventData, err := proto.Marshal(data)
	if err != nil {
		return err
	}

	var userIDStrs []string
	for _, userID := range userIDs {
		userIDStrs = append(userIDStrs, userID.String())
	}

	event, err := proto.Marshal(&pb.UserEvent{
		Ver:     &ver,
		UserIds: userIDStrs,
		Data:    eventData,
	})
	if err != nil {
		return ErrInvalidPayload
	}

	return ep.conn.Publish("ACCORD.EVENTS.USER", event)
}

func (ep *EventPublisher) PublishRoleEvent(roleIDs []uuid.UUID, data *pb.EventPayload) error {
	var ver int32 = 0
	eventData, err := proto.Marshal(data)
	if err != nil {
		return err
	}

	var roleIDstrs []string
	for _, roleID := range roleIDs {
		roleIDstrs = append(roleIDstrs, roleID.String())
	}

	event, err := proto.Marshal(&pb.RoleEvent{
		Ver:     &ver,
		RoleIds: roleIDstrs,
		Data:    eventData,
	})

	if err != nil {
		return ErrInvalidPayload
	}

	return ep.conn.Publish("ACCORD.EVENTS.ROLE", event)
}
