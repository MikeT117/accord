package voice_webrtc

import (
	"errors"
	"fmt"
	"io"

	"github.com/pion/interceptor"
	"github.com/pion/webrtc/v4"
)

type Channel struct {
	ID                  string
	Hub                 *WebRTCHub
	MediaEngine         *webrtc.MediaEngine
	InterceptorRegistry *interceptor.Registry
	Peers               map[string]*Peer
}

type Peer struct {
	ID     string
	Offer  webrtc.SessionDescription
	Answer webrtc.SessionDescription
	Conn   *webrtc.PeerConnection
	Track  *webrtc.TrackLocalStaticRTP
}

func (c *Channel) ClosePeer(peerID string) {
	peer, ok := c.Peers[peerID]
	if !ok {
		return
	}
	peer.Conn.Close()
}

func (c *Channel) CreatePeer(ID string, offer webrtc.SessionDescription) (*webrtc.PeerConnection, error) {
	var peerConnectionConfig webrtc.Configuration = webrtc.Configuration{
		ICEServers: []webrtc.ICEServer{
			{
				URLs: []string{"stun:stun.l.google.com:19302"},
			},
		},
	}

	var err error

	var peer *Peer = &Peer{
		ID:    ID,
		Offer: offer,
	}

	peer.Conn, err = c.Hub.WebRTCAPI.NewPeerConnection(peerConnectionConfig)
	if err != nil {
		return &webrtc.PeerConnection{}, err
	}

	peer.Conn.OnTrack(func(remoteTrack *webrtc.TrackRemote, receiver *webrtc.RTPReceiver) {
		localTrack, newTrackErr := webrtc.NewTrackLocalStaticRTP(remoteTrack.Codec().RTPCodecCapability, "audio", "pion")
		if newTrackErr != nil {
			fmt.Println("TRACK ERROR - CLOSING PEER")
			peer.Conn.Close()
		}

		peer.Track = localTrack

		rtpBuf := make([]byte, 1400)
		for {
			i, _, readErr := remoteTrack.Read(rtpBuf)
			if readErr != nil {
				fmt.Println("READ ERROR - CLOSING PEER")
				peer.Conn.Close()
				return
			}

			if _, err = localTrack.Write(rtpBuf[:i]); err != nil && !errors.Is(err, io.ErrClosedPipe) {
				if len(c.Peers) > 1 {
					peer.Conn.Close()
				}
			}
		}
	})

	for peerID, test := range c.Peers {
		fmt.Printf("Looping through peers: %s\n", peerID)
		rtpSender, err := peer.Conn.AddTrack(test.Track)
		if err != nil {
			return &webrtc.PeerConnection{}, err
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

	err = peer.Conn.SetRemoteDescription(offer)
	if err != nil {
		return &webrtc.PeerConnection{}, err
	}

	peer.Answer, err = peer.Conn.CreateAnswer(nil)
	if err != nil {
		return &webrtc.PeerConnection{}, err
	}

	gatherComplete := webrtc.GatheringCompletePromise(peer.Conn)

	err = peer.Conn.SetLocalDescription(peer.Answer)
	if err != nil {
		return &webrtc.PeerConnection{}, err
	}

	<-gatherComplete

	c.Peers[ID] = peer

	return peer.Conn, nil

}
