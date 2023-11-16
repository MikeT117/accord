package voice_server

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

	return &WebRTCHub{
		WebRTCAPI: api,
		Channels:  make(map[string]*Channel),
	}
}

func (hub *WebRTCHub) GetOrCreateChannel(ID string) *Channel {
	channel, ok := hub.Channels[ID]

	if !ok {
		channel = &Channel{
			ID:          ID,
			Hub:         hub,
			Peers:       make(map[string]*Peer),
			TrackLocals: make(map[string]*webrtc.TrackLocalStaticRTP),
		}
		hub.Channels[ID] = channel
	}
	return channel
}
