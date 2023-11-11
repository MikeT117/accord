package rtc

import (
	"errors"
	"fmt"
	"io"

	"github.com/pion/interceptor"
	"github.com/pion/webrtc/v4"
)

type Peer struct {
	ID     string
	Offer  webrtc.SessionDescription
	Answer webrtc.SessionDescription
	Conn   *webrtc.PeerConnection
	Track  *webrtc.TrackLocalStaticRTP
}

type Channel struct {
	Hub                 *WebRTCHub
	MediaEngine         *webrtc.MediaEngine
	InterceptorRegistry *interceptor.Registry
	Peers               map[string]*Peer
}

type WebRTCHub struct {
	WebRTCAPI *webrtc.API
	Channels  map[string]*Channel
}

var PeerConnectionConfig webrtc.Configuration = webrtc.Configuration{
	ICEServers: []webrtc.ICEServer{
		{
			URLs: []string{"stun:stun.l.google.com:19302"},
		},
	},
}

func CreateAPI() *WebRTCHub {
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
		Peers: make(map[string]*Peer),
	}

	hub.Channels[ID] = channel
	return channel
}

// Room has go channel that contains track, when track is added the go func will update all peers in that room with the new track.

func (c *Channel) CreatePeer(ID string, offer webrtc.SessionDescription) *webrtc.PeerConnection {
	var err error

	var peer *Peer = &Peer{
		ID:    ID,
		Offer: offer,
	}

	peer.Conn, err = c.Hub.WebRTCAPI.NewPeerConnection(PeerConnectionConfig)
	if err != nil {
		panic(err)
	}

	peer.Conn.OnTrack(func(remoteTrack *webrtc.TrackRemote, receiver *webrtc.RTPReceiver) {
		// Create a local track, all our SFU clients will be fed via this track
		localTrack, newTrackErr := webrtc.NewTrackLocalStaticRTP(remoteTrack.Codec().RTPCodecCapability, "audio", "pion")
		if newTrackErr != nil {
			panic(newTrackErr)
		}
		peer.Track = localTrack

		rtpBuf := make([]byte, 1400)
		for {
			i, _, readErr := remoteTrack.Read(rtpBuf)
			if readErr != nil {
				panic(readErr)
			}

			// ErrClosedPipe means we don't have any subscribers, this is ok if no peers have connected yet
			if _, err = localTrack.Write(rtpBuf[:i]); err != nil && !errors.Is(err, io.ErrClosedPipe) {
				panic(err)
			}
		}
	})

	for peerID, test := range c.Peers {
		fmt.Printf("Looping through peers: %s\n", peerID)
		rtpSender, err := peer.Conn.AddTrack(test.Track)
		if err != nil {
			panic(err)
		}
		go func() {
			rtcpBuf := make([]byte, 1500)
			for {
				if _, _, rtcpErr := rtpSender.Read(rtcpBuf); rtcpErr != nil {
					return
				}
			}
		}()

	}

	// Set the remote SessionDescription
	err = peer.Conn.SetRemoteDescription(offer)
	if err != nil {
		panic(err)
	}

	peer.Answer, err = peer.Conn.CreateAnswer(nil)
	if err != nil {
		panic(err)
	}

	gatherComplete := webrtc.GatheringCompletePromise(peer.Conn)

	err = peer.Conn.SetLocalDescription(peer.Answer)
	if err != nil {
		panic(err)
	}

	<-gatherComplete

	c.Peers[ID] = peer

	return peer.Conn

}
