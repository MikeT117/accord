package rtc

import (
	"errors"
	"fmt"
	"io"

	"github.com/pion/interceptor"
	"github.com/pion/webrtc/v4"
)

type Peer struct {
	ID        string
	Offer     webrtc.SessionDescription
	Answer    webrtc.SessionDescription
	SendConn  *webrtc.PeerConnection
	RecvConn  *webrtc.PeerConnection
	SendTrack *webrtc.TrackLocalStaticRTP
	RecvTrack *webrtc.TrackLocalStaticRTP
}

type Channel struct {
	Hub                 *WebRTCHub
	MediaEngine         *webrtc.MediaEngine
	InterceptorRegistry *interceptor.Registry
	Peers               map[string]*Peer
	Track               *webrtc.TrackLocalStaticRTP
	LocalTrackChan      chan *webrtc.TrackLocalStaticRTP
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
		Hub:            hub,
		Peers:          make(map[string]*Peer),
		LocalTrackChan: make(chan *webrtc.TrackLocalStaticRTP),
	}

	go func() {
		for {
			track := <-channel.LocalTrackChan
			fmt.Printf("Track: %s - SteamID: %s\n", track.ID(), track.StreamID())
		}
	}()

	hub.Channels[ID] = channel
	return channel
}

// Room has go channel that contains track, when track is added the go func will update all peers in that room with the new track.

func (c *Channel) CreatePeer(ID string, offer webrtc.SessionDescription, publisher bool) *webrtc.PeerConnection {
	var err error

	var peer *Peer = &Peer{
		ID:    ID,
		Offer: offer,
	}

	if publisher {

		peer.SendConn, err = c.Hub.WebRTCAPI.NewPeerConnection(PeerConnectionConfig)
		if err != nil {
			panic(err)
		}

		peer.SendConn.OnTrack(func(remoteTrack *webrtc.TrackRemote, receiver *webrtc.RTPReceiver) {
			// Create a local track, all our SFU clients will be fed via this track
			localTrack, newTrackErr := webrtc.NewTrackLocalStaticRTP(remoteTrack.Codec().RTPCodecCapability, "audio", "pion")
			if newTrackErr != nil {
				panic(newTrackErr)
			}
			c.LocalTrackChan <- localTrack
			c.Track = localTrack

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

		// Set the remote SessionDescription
		err = peer.SendConn.SetRemoteDescription(offer)
		if err != nil {
			panic(err)
		}

		peer.Answer, err = peer.SendConn.CreateAnswer(nil)
		if err != nil {
			panic(err)
		}

		gatherComplete := webrtc.GatheringCompletePromise(peer.SendConn)

		err = peer.SendConn.SetLocalDescription(peer.Answer)
		if err != nil {
			panic(err)
		}

		<-gatherComplete

		return peer.SendConn

	} else {

		peer.RecvConn, err = webrtc.NewPeerConnection(PeerConnectionConfig)
		if err != nil {
			panic(err)
		}

		fmt.Print("HALLO 1")

		rtpSender, err := peer.RecvConn.AddTrack(c.Track)
		if err != nil {
			panic(err)
		}

		fmt.Print("HALLO 2")

		go func() {
			rtcpBuf := make([]byte, 1500)
			for {
				if _, _, rtcpErr := rtpSender.Read(rtcpBuf); rtcpErr != nil {
					return
				}
			}
		}()

		// Set the remote SessionDescription
		err = peer.RecvConn.SetRemoteDescription(offer)
		if err != nil {
			panic(err)
		}

		// Create answer
		answer, err := peer.RecvConn.CreateAnswer(nil)
		if err != nil {
			panic(err)
		}

		// Create channel that is blocked until ICE Gathering is complete
		gatherComplete := webrtc.GatheringCompletePromise(peer.RecvConn)

		// Sets the LocalDescription, and starts our UDP listeners
		err = peer.RecvConn.SetLocalDescription(answer)
		if err != nil {
			panic(err)
		}

		// Block until ICE Gathering is complete, disabling trickle ICE
		// we do this because we only can exchange one signaling message
		// in a production application you should exchange ICE Candidates via OnICECandidate
		<-gatherComplete

		c.Peers[ID] = peer

		return peer.RecvConn
	}

}
