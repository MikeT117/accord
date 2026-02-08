package websocket_api

import (
	"context"
	"log"
	"sync"

	"github.com/MikeT117/accord/backend/internal/application/interfaces"
	"github.com/MikeT117/accord/backend/internal/config"
	pb "github.com/MikeT117/accord/backend/internal/infra/pb/gen"
	"github.com/MikeT117/accord/backend/internal/infra/pubsub"
	"github.com/google/uuid"
	"google.golang.org/protobuf/proto"
)

type SafeRWMutex[T any] struct {
	Mutex sync.RWMutex
	Data  T
}

type Hub struct {
	ctx              context.Context
	config           *config.Config
	eventSubscriber  *pubsub.EventSubscriber
	websocketService interfaces.WebsocketService
	clients          SafeRWMutex[map[uuid.UUID]*Client]
}

func NewHub(ctx context.Context, config *config.Config, eventSubscriber *pubsub.EventSubscriber, websocketService interfaces.WebsocketService) *Hub {
	hub := &Hub{
		ctx:              ctx,
		config:           config,
		eventSubscriber:  eventSubscriber,
		websocketService: websocketService,
		clients: SafeRWMutex[map[uuid.UUID]*Client]{
			Mutex: sync.RWMutex{},
			Data:  make(map[uuid.UUID]*Client),
		},
	}

	roleEventSubscription := hub.eventSubscriber.MustSubscribe("ACCORD.EVENTS.ROLE", hub.handleRoleEvent)

	userEventSubscription := hub.eventSubscriber.MustSubscribe("ACCORD.EVENTS.USER", hub.handleUserEvent)

	providerEventSubscription := hub.eventSubscriber.MustSubscribe("ACCORD.EVENTS.PROVIDER", hub.handleProviderEvent)

	go func() {
		<-hub.ctx.Done()
		roleEventSubscription.Unsubscribe()
		userEventSubscription.Unsubscribe()
		providerEventSubscription.Unsubscribe()
	}()

	return hub
}

func (h *Hub) handleRoleEvent(event []byte) {
	var roleEvent pb.RoleEvent
	err := proto.Unmarshal(event, &roleEvent)
	if err != nil {
		log.Println("parsing role event proto message failed: ", err)
		return
	}

	h.clients.Mutex.RLock()
	defer h.clients.Mutex.RUnlock()
	for _, client := range h.clients.Data {
		if client.hasRoles(roleEvent.RoleIds) {
			client.send <- roleEvent.Data
		}
	}
}

func (h *Hub) handleUserEvent(event []byte) {
	var err error

	var userEvent pb.UserEvent
	err = proto.Unmarshal(event, &userEvent)
	if err != nil {
		log.Println("parsing user proto message failed: ", err)
		return
	}

	h.clients.Mutex.RLock()
	defer h.clients.Mutex.RUnlock()

	for _, client := range h.clients.Data {
		if client.matchesUserIDs(userEvent.UserIds) {
			client.send <- userEvent.Data
		}
	}
}

func (h *Hub) handleProviderEvent(event []byte) {
	var err error

	var providerEvent pb.ProviderEvent
	err = proto.Unmarshal(event, &providerEvent)
	if err != nil {
		log.Println("parsing provider proto message err: ", err)
		return
	}

	h.clients.Mutex.RLock()
	defer h.clients.Mutex.RUnlock()

	switch providerEvent.Op {
	case pb.ProviderOpCode_ASSOCIATE_USER_ROLE.Enum():
		for _, client := range h.clients.Data {
			client.addRole(*providerEvent.GetUserRoleAssociate().RoleId)
		}
	case pb.ProviderOpCode_DISASSOCIATE_USER_ROLE.Enum():
		for _, client := range h.clients.Data {
			client.deleteRole(*providerEvent.GetUserRoleDisassociate().RoleId)
		}
	case pb.ProviderOpCode_INVALIDATE_TOKEN.Enum():
		for _, client := range h.clients.Data {
			client.shutdown(CLOSE_SESSION_EXPIRED)
		}
	}
}

func (h *Hub) deleteClient(id uuid.UUID) {
	log.Printf("deleting client %s\n", id)
	h.clients.Mutex.Lock()
	delete(h.clients.Data, id)
	h.clients.Mutex.Unlock()
}

func (h *Hub) addClient(client *Client) {
	log.Printf("creating client %s\n", client.userID)
	h.clients.Mutex.Lock()
	h.clients.Data[client.id] = client
	h.clients.Mutex.Unlock()
}
