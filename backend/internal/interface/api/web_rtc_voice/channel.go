package web_rtc_voice

import (
	"context"
	"log"
	"sync"
	"sync/atomic"

	"github.com/google/uuid"
)

type ChannelState int

const (
	ChannelNotInitialised ChannelState = iota
	ChannelAcceptingClients
	ChannelNotAcceptingClients
)

type Channel struct {
	hub *Hub

	ctx    context.Context
	cancel context.CancelFunc

	id      uuid.UUID
	guildID uuid.UUID

	maxClients int
	clients    SafeRWMutex[map[uuid.UUID]*Client]

	state atomic.Value

	once sync.Once
}

func (c *Channel) getState() ChannelState {
	if v := c.state.Load(); v != nil {
		return v.(ChannelState)
	}

	return ChannelNotInitialised
}

func (hub *Hub) createChannel(channelID uuid.UUID, guildID uuid.UUID) *Channel {
	log.Printf("CREATING CHANNEL: %s\n", channelID)

	ctx, cancel := context.WithCancel(context.Background())
	channel := &Channel{
		hub: hub,

		ctx:    ctx,
		cancel: cancel,

		id:      channelID,
		guildID: guildID,

		maxClients: 8,
		clients: SafeRWMutex[map[uuid.UUID]*Client]{
			Mutex: sync.RWMutex{},
			Data:  make(map[uuid.UUID]*Client),
		},

		state: atomic.Value{},

		once: sync.Once{},
	}

	channel.state.Store(ChannelAcceptingClients)

	go func() {
		<-channel.ctx.Done()
		log.Printf("CHANNEL %s SHUTTING DOWN\n", channel.id.String())

		channel.state.Store(ChannelNotAcceptingClients)

		channel.clients.Mutex.Lock()
		clientsSnapshot := []*Client{}
		for _, client := range channel.clients.Data {
			clientsSnapshot = append(clientsSnapshot, client)
		}
		channel.clients.Mutex.Unlock()

		for _, client := range clientsSnapshot {
			client.shutdown()
		}

		hub.deleteChannel(channel.id)
	}()

	return channel
}

func (c *Channel) shutdown() {
	c.once.Do(c.cancel)
}

func (c *Channel) addClient(client *Client) bool {
	log.Printf("ADDDING CLIENT %s TO CHANNEL: %s\n", client.id.String(), c.id.String())

	if c.getState() != ChannelAcceptingClients {
		return false
	}

	c.clients.Mutex.Lock()
	defer c.clients.Mutex.Unlock()

	if len(c.clients.Data) >= c.maxClients || c.ctx.Err() != nil {
		return false
	}

	c.clients.Data[client.id] = client
	return true
}

func (c *Channel) deleteClient(ID uuid.UUID) {
	log.Printf("DELETING CLIENT %s FROM CHANNEL: %s\n", ID.String(), c.id.String())

	c.clients.Mutex.Lock()
	delete(c.clients.Data, ID)

	shouldShutdown := len(c.clients.Data) == 0
	c.clients.Mutex.Unlock()

	if shouldShutdown {
		c.shutdown()
	}
}
