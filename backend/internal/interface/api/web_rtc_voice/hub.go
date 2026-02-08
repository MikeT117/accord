package web_rtc_voice

import (
	"sync"
	"sync/atomic"

	"github.com/MikeT117/accord/backend/internal/application/interfaces"
	"github.com/MikeT117/accord/backend/internal/config"
	"github.com/google/uuid"
	"github.com/pion/interceptor"
	"github.com/pion/webrtc/v4"
)

type HubState int

const (
	Starting HubState = iota
	Started
	Shutdown
)

type Hub struct {
	api    *webrtc.API
	config *config.Config

	channels SafeRWMutex[map[uuid.UUID]*Channel]

	state atomic.Value

	websocketService     interfaces.WebsocketService
	authorisationService interfaces.AuthorisationService
	guildRoleService     interfaces.GuildRoleService
	voiceStateService    interfaces.VoiceStateService
	channelService       interfaces.ChannelService
}

func (h *Hub) getState() HubState {
	if v := h.state.Load(); v != nil {
		return v.(HubState)
	}
	return Starting
}

func CreateHub(
	config *config.Config,
	websocketService interfaces.WebsocketService,
	authorisationService interfaces.AuthorisationService,
	guildRoleService interfaces.GuildRoleService,
	voiceStateService interfaces.VoiceStateService,
	channelService interfaces.ChannelService,
) (*Hub, error) {
	settingsEngine := webrtc.SettingEngine{}
	settingsEngine.SetEphemeralUDPPortRange(10001, 10049)
	settingsEngine.SetNetworkTypes([]webrtc.NetworkType{
		webrtc.NetworkTypeTCP4,
		webrtc.NetworkTypeUDP4,
	})

	m := &webrtc.MediaEngine{}
	if err := m.RegisterDefaultCodecs(); err != nil {
		return nil, err
	}

	i := &interceptor.Registry{}
	if err := webrtc.RegisterDefaultInterceptors(m, i); err != nil {
		return nil, err
	}

	api := webrtc.NewAPI(webrtc.WithSettingEngine(settingsEngine), webrtc.WithMediaEngine(m), webrtc.WithInterceptorRegistry(i))

	hub := &Hub{
		api:    api,
		config: config,

		channels: SafeRWMutex[map[uuid.UUID]*Channel]{
			Mutex: sync.RWMutex{},
			Data:  make(map[uuid.UUID]*Channel),
		},

		state: atomic.Value{},

		websocketService:     websocketService,
		authorisationService: authorisationService,
		guildRoleService:     guildRoleService,
		voiceStateService:    voiceStateService,
		channelService:       channelService,
	}

	hub.state.Store(Started)
	return hub, nil
}

func (h *Hub) Shutdown() {
	h.state.Store(Shutdown)

	h.channels.Mutex.Lock()
	defer h.channels.Mutex.Unlock()

	for _, channel := range h.channels.Data {
		channel.shutdown()
	}
}

func (hub *Hub) AllowConnections() bool {
	return hub.getState() == Started
}

func (hub *Hub) deleteChannel(id uuid.UUID) {
	hub.channels.Mutex.Lock()
	defer hub.channels.Mutex.Unlock()

	delete(hub.channels.Data, id)
}

func (h *Hub) GetOrCreateChannel(channelID uuid.UUID, guildID uuid.UUID) *Channel {
	h.channels.Mutex.Lock()
	defer h.channels.Mutex.Unlock()

	if channel := h.channels.Data[channelID]; channel != nil {
		if channel.getState() == ChannelAcceptingClients {
			return channel
		}
	}

	h.channels.Data[channelID] = h.createChannel(channelID, guildID)
	return h.channels.Data[channelID]
}
