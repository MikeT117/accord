package voice_webrtc

import (
	"github.com/pion/interceptor"
	"github.com/pion/webrtc/v4"
)

type WebRTCHub struct {
	WebRTCAPI *webrtc.API
	Channels  map[string]*Channel
}

func CreateWebRTCHub() *WebRTCHub {
	settingsEngine := webrtc.SettingEngine{}
	settingsEngine.SetEphemeralUDPPortRange(10001, 10005)

	m := &webrtc.MediaEngine{}
	if err := m.RegisterDefaultCodecs(); err != nil {
		panic(err)
	}

	i := &interceptor.Registry{}
	if err := webrtc.RegisterDefaultInterceptors(m, i); err != nil {
		panic(err)
	}

	api := webrtc.NewAPI(webrtc.WithSettingEngine(settingsEngine), webrtc.WithMediaEngine(m), webrtc.WithInterceptorRegistry(i))

	return &WebRTCHub{
		WebRTCAPI: api,
		Channels:  make(map[string]*Channel),
	}
}

func (hub *WebRTCHub) CreateChannel(ID string) *Channel {

	channel := &Channel{
		Hub:   hub,
		ID:    ID,
		Peers: make(map[string]*Peer),
	}

	hub.Channels[ID] = channel

	return channel
}
