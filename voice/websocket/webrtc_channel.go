package voice_server

import (
	"encoding/json"
	"fmt"
	"log"
	"time"

	"github.com/pion/webrtc/v4"
)

type Channel struct {
	ID          string
	Hub         *WebRTCHub
	Peers       map[string]*Peer
	TrackLocals map[string]*webrtc.TrackLocalStaticRTP
}

func (c *Channel) AddTrack(track *webrtc.TrackRemote) *webrtc.TrackLocalStaticRTP {
	defer func() {
		c.SignalPeers()
	}()

	trackLocal, err := webrtc.NewTrackLocalStaticRTP(track.Codec().RTPCodecCapability, track.ID(), track.StreamID())

	if err != nil {
		panic(err)
	}

	// Possibly use the Peer ID here, as each peer should only have a single track
	c.TrackLocals[track.ID()] = trackLocal
	return trackLocal
}

func (c *Channel) RemoveTrack(track *webrtc.TrackLocalStaticRTP) {
	defer func() {
		c.SignalPeers()
	}()
	delete(c.TrackLocals, track.ID())
}

func (c *Channel) SignalPeers() {

	attemptSync := func() (tryagain bool) {
		for i := range c.Peers {
			if c.Peers[i].Conn.ConnectionState() == webrtc.PeerConnectionStateClosed {
				delete(c.Peers, i)
				return true
			}

			// map of sender we already are seanding, so we don't double send
			existingSenders := map[string]bool{}

			for _, sender := range c.Peers[i].Conn.GetSenders() {
				if sender.Track() == nil {
					continue
				}

				existingSenders[sender.Track().ID()] = true

				// If we have a RTPSender that doesn't map to a existing track remove and signal
				if _, ok := c.TrackLocals[sender.Track().ID()]; !ok {
					if err := c.Peers[i].Conn.RemoveTrack(sender); err != nil {
						return true
					}
				}
			}

			// Don't receive videos we are sending, make sure we don't have loopback
			for _, receiver := range c.Peers[i].Conn.GetReceivers() {
				if receiver.Track() == nil {
					continue
				}

				existingSenders[receiver.Track().ID()] = true
			}

			// Add all track we aren't sending yet to the PeerConnection
			for trackID := range c.TrackLocals {
				if _, ok := existingSenders[trackID]; !ok {
					if _, err := c.Peers[i].Conn.AddTrack(c.TrackLocals[trackID]); err != nil {
						return true
					}
				}
			}

			offer, err := c.Peers[i].Conn.CreateOffer(nil)
			if err != nil {
				return true
			}

			if err = c.Peers[i].Conn.SetLocalDescription(offer); err != nil {
				return true
			}

			offerString, err := json.Marshal(offer)
			if err != nil {
				return true
			}

			if err = c.Peers[i].WS.WriteJSON(&WebsocketMessage{
				Event: "offer",
				Data:  string(offerString),
			}); err != nil {
				return true
			}
		}

		return
	}

	for syncAttempt := 0; ; syncAttempt++ {
		fmt.Println("SYNC ATTEMPT: ", syncAttempt)
		if syncAttempt == 25 {
			go func() {
				time.Sleep(time.Second * 3)
				c.SignalPeers()
			}()
			return
		}
		if !attemptSync() {
			break
		}
	}
}

func (c *Channel) CreatePeer(ID string, wc *WebsocketClient) (*Peer, error) {

	conn, err := c.Hub.WebRTCAPI.NewPeerConnection(webrtc.Configuration{
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
		if _, err := conn.AddTransceiverFromKind(typ, webrtc.RTPTransceiverInit{
			Direction: webrtc.RTPTransceiverDirectionRecvonly,
		}); err != nil {
			return &Peer{}, err
		}
	}

	peer := &Peer{
		ID:   ID,
		WS:   wc.conn,
		Conn: conn,
	}

	conn.OnICECandidate(func(i *webrtc.ICECandidate) {
		if i == nil {
			return
		}

		candidateString, err := json.Marshal(i.ToJSON())
		if err != nil {
			log.Print(err)
			return
		}

		if writeErr := wc.conn.WriteJSON(&WebsocketMessage{
			Event: "candidate",
			Data:  string(candidateString),
		}); err != nil {
			log.Print(writeErr)
		}
	})

	conn.OnConnectionStateChange(func(p webrtc.PeerConnectionState) {
		switch p {
		case webrtc.PeerConnectionStateFailed:
			if err := conn.Close(); err != nil {
				log.Print(err)
			}
		case webrtc.PeerConnectionStateClosed:
			c.SignalPeers()
		}
	})

	conn.OnTrack(func(remoteTrack *webrtc.TrackRemote, _ *webrtc.RTPReceiver) {
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
		wc.CloseMessage(4001, "Failure to create peer")
	}

	wc.Peer = peer
	wc.websocketHub.RegisterClient(wc)
	c.Peers[ID] = peer

	go wc.ReadMessages()
	go wc.WriteMessages()

	c.SignalPeers()

	return peer, nil
}
