package voice_server

import (
	"log"
	"os"
	"os/signal"
	"sync"
	"syscall"
	"time"

	"github.com/MikeT117/accord/backend/internal/message_queue"
	"github.com/MikeT117/accord/backend/internal/sqlc"
	"github.com/MikeT117/accord/backend/internal/utils"
	"github.com/google/uuid"
	"github.com/pion/interceptor"
	"github.com/pion/webrtc/v4"
)

type VoiceServerHub struct {
	clients      utils.SafeRWMutexMap[map[uuid.UUID]*WebsocketClient]
	channels     utils.SafeRWMutexMap[map[uuid.UUID]*WebRTCChannel]
	authTimeout  time.Duration
	pingInterval time.Duration
	pongWait     time.Duration
	writeWait    time.Duration
	queries      *sqlc.Queries
	messageQueue *message_queue.MessageQueue
	webrtcAPI    *webrtc.API
}

func (wh *VoiceServerHub) GetClient(ID uuid.UUID) (*WebsocketClient, bool) {
	wh.clients.Mutex.RLock()
	defer wh.clients.Mutex.RUnlock()
	c, ok := wh.clients.Data[ID]
	return c, ok
}

func (wh *VoiceServerHub) AddClient(client *WebsocketClient) {
	wh.clients.Mutex.Lock()
	defer wh.clients.Mutex.Unlock()
	wh.clients.Data[client.id] = client
}

func (wh *VoiceServerHub) DelClient(id uuid.UUID) {
	wh.clients.Mutex.Lock()
	defer wh.clients.Mutex.Unlock()
	delete(wh.clients.Data, id)
}

func (h *VoiceServerHub) GetChannel(ID uuid.UUID) (*WebRTCChannel, bool) {
	h.channels.Mutex.RLock()
	defer h.channels.Mutex.RUnlock()
	c, ok := h.channels.Data[ID]
	return c, ok
}

func (h *VoiceServerHub) AddChannel(vsc *WebRTCChannel) *WebRTCChannel {
	h.channels.Mutex.Lock()
	defer h.channels.Mutex.Unlock()
	h.channels.Data[vsc.id] = vsc
	return vsc
}

func (h *VoiceServerHub) DelChannel(ID uuid.UUID) {
	h.channels.Mutex.Lock()
	defer h.channels.Mutex.Unlock()
	delete(h.channels.Data, ID)
}

func (h *VoiceServerHub) CloseHub() {
	log.Println("CLOSING HUB")

	h.clients.Mutex.Lock()
	h.channels.Mutex.Lock()

	defer func() {
		h.channels.Mutex.Unlock()
		h.clients.Mutex.Unlock()
	}()

	for idx := range h.channels.Data {
		h.channels.Data[idx].CloseChannel()
	}

	for idx := range h.clients.Data {
		h.clients.Data[idx].CloseClient()
	}

	c := make(chan os.Signal, 1)
	signal.Notify(c, os.Interrupt, syscall.SIGTERM)
	<-c

	os.Exit(0)
}

func CreateHub(
	queries *sqlc.Queries,
	messageQueue *message_queue.MessageQueue,
	authTimeout time.Duration,
	pingInterval time.Duration,
	pongWait time.Duration,
	writeWait time.Duration,
) *VoiceServerHub {
	settingsEngine := webrtc.SettingEngine{}

	settingsEngine.SetEphemeralUDPPortRange(10001, 10049)
	settingsEngine.SetNetworkTypes([]webrtc.NetworkType{
		webrtc.NetworkTypeTCP4,
		webrtc.NetworkTypeUDP4,
	})

	m := &webrtc.MediaEngine{}
	if err := m.RegisterDefaultCodecs(); err != nil {
		panic(err)
	}

	i := &interceptor.Registry{}
	if err := webrtc.RegisterDefaultInterceptors(m, i); err != nil {
		panic(err)
	}

	api := webrtc.NewAPI(webrtc.WithSettingEngine(settingsEngine), webrtc.WithMediaEngine(m), webrtc.WithInterceptorRegistry(i))

	hub := &VoiceServerHub{
		clients: utils.SafeRWMutexMap[map[uuid.UUID]*WebsocketClient]{
			Mutex: sync.RWMutex{},
			Data:  make(map[uuid.UUID]*WebsocketClient),
		},
		channels: utils.SafeRWMutexMap[map[uuid.UUID]*WebRTCChannel]{
			Mutex: sync.RWMutex{},
			Data:  make(map[uuid.UUID]*WebRTCChannel),
		},
		authTimeout:  authTimeout,
		pingInterval: pingInterval,
		pongWait:     pongWait,
		writeWait:    writeWait,
		queries:      queries,
		messageQueue: messageQueue,
		webrtcAPI:    api,
	}

	go func() {

		c := make(chan os.Signal, 1)
		signal.Notify(c, os.Interrupt, syscall.SIGINT, syscall.SIGTERM)

		<-c
		log.Println("HUB SUTTING DOWN")
		hub.CloseHub()
		os.Exit(0)

	}()

	return hub
}
