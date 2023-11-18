package voice_server

import (
	"encoding/json"
	"fmt"
	"log"
	"time"

	"github.com/gorilla/websocket"
	"github.com/pion/webrtc/v4"
)

type WebRTCChannel struct {
	ID          string
	Hub         *WebRTCHub
	Peers       map[string]*Peer
	TrackLocals map[string]*webrtc.TrackLocalStaticRTP
}

func (c *WebRTCChannel) AddTrack(track *webrtc.TrackRemote) *webrtc.TrackLocalStaticRTP {
	defer func() {
		c.SignalPeers()
	}()

	trackLocal, err := webrtc.NewTrackLocalStaticRTP(track.Codec().RTPCodecCapability, track.ID(), c.ID)

	if err != nil {
		panic(err)
	}

	c.TrackLocals[track.ID()] = trackLocal
	return trackLocal
}

func (c *WebRTCChannel) RemoveTrack(track *webrtc.TrackLocalStaticRTP) {
	defer func() {
		c.SignalPeers()
	}()
	delete(c.TrackLocals, track.ID())
}

func (c *WebRTCChannel) SignalPeers() {

	attemptSync := func() (tryagain bool) {
		for _, peer := range c.Peers {
			if peer.pConn.ConnectionState() == webrtc.PeerConnectionStateClosed {
				delete(c.Peers, peer.id)
				return true
			}

			// map of sender we already are sending, so we don't double send
			existingSenders := map[string]bool{}

			for _, sender := range peer.pConn.GetSenders() {
				if sender.Track() == nil {
					continue
				}

				existingSenders[sender.Track().ID()] = true

				// If we have a RTPSender that doesn't map to a existing track remove and signal
				if _, ok := c.TrackLocals[sender.Track().ID()]; !ok {
					if err := peer.pConn.RemoveTrack(sender); err != nil {
						return true
					}
				}
			}

			// Don't receive videos we are sending, make sure we don't have loopback
			for _, receiver := range peer.pConn.GetReceivers() {
				if receiver.Track() == nil {
					continue
				}

				existingSenders[receiver.Track().ID()] = true
			}

			// Add all track we aren't sending yet to the PeerConnection
			for trackID := range c.TrackLocals {
				if _, ok := existingSenders[trackID]; !ok {
					if _, err := peer.pConn.AddTrack(c.TrackLocals[trackID]); err != nil {
						return true
					}
				}
			}

			offer, err := peer.pConn.CreateOffer(nil)
			if err != nil {
				return true
			}

			if err = peer.pConn.SetLocalDescription(offer); err != nil {
				return true
			}

			offerString, err := json.Marshal(offer)
			if err != nil {
				return true
			}

			if err = peer.wConn.WriteJSON(&WebsocketMessage{
				Event: "offer",
				Data:  string(offerString),
			}); err != nil {
				return true
			}
		}

		return
	}

	for syncAttempt := 0; syncAttempt <= 25; syncAttempt++ {
		fmt.Println("SYNC ATTEMPT: ", syncAttempt)

		if !attemptSync() {
			break
		}

		if syncAttempt == 25 {
			go func() {
				time.Sleep(time.Second * 3)
				c.SignalPeers()
			}()
			return
		}
	}
}

func (c *WebRTCChannel) CreatePeer(ID string, wConn *websocket.Conn) (*Peer, error) {

	pConn, err := c.Hub.WebRTCAPI.NewPeerConnection(webrtc.Configuration{
		ICEServers: []webrtc.ICEServer{
			{
				URLs: []string{"stun:stun.l.google.com:19302"},
			},
		},
	})
	if err != nil {
		return &Peer{}, err
	}

	for _, typ := range []webrtc.RTPCodecType{webrtc.RTPCodecTypeAudio} {
		if _, err := pConn.AddTransceiverFromKind(typ, webrtc.RTPTransceiverInit{
			Direction: webrtc.RTPTransceiverDirectionRecvonly,
		}); err != nil {
			return &Peer{}, err
		}
	}

	peer := &Peer{
		id:      ID,
		channel: c,
		wConn:   wConn,
		pConn:   pConn,
	}

	pConn.OnICECandidate(func(i *webrtc.ICECandidate) {
		if i == nil {
			return
		}

		candidateString, err := json.Marshal(i.ToJSON())
		if err != nil {
			log.Print(err)
			return
		}

		if writeErr := wConn.WriteJSON(&WebsocketMessage{
			Event: "candidate",
			Data:  string(candidateString),
		}); err != nil {
			log.Print(writeErr)
		}
	})

	pConn.OnConnectionStateChange(func(p webrtc.PeerConnectionState) {
		switch p {
		case webrtc.PeerConnectionStateFailed:
			if err := pConn.Close(); err != nil {
				log.Print(err)
			}
		case webrtc.PeerConnectionStateClosed:
			c.SignalPeers()
		}
	})

	pConn.OnTrack(func(remoteTrack *webrtc.TrackRemote, _ *webrtc.RTPReceiver) {
		fmt.Println("ON_TRACK")

		trackLocal := c.AddTrack(remoteTrack)
		defer c.RemoveTrack(trackLocal)

		rtpBuf := make([]byte, 1500)
		for {
			i, _, err := remoteTrack.Read(rtpBuf)
			if err != nil {
				return
			}

			if _, err = trackLocal.Write(rtpBuf[:i]); err != nil {
				return
			}
		}
	})

	if err != nil {
		return &Peer{}, err
	}

	c.Peers[ID] = peer
	return peer, nil
}
