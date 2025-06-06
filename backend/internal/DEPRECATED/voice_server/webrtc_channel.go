package voice_server

import (
	"context"
	"log"
	"sync"
	"time"

	"github.com/MikeT117/accord/backend/internal/message_queue"
	"github.com/MikeT117/accord/backend/internal/utils"
	"github.com/google/uuid"
	"github.com/gorilla/websocket"
	"github.com/pion/webrtc/v4"
)

type WebRTCChannel struct {
	id          uuid.UUID
	guildID     uuid.UUID
	peers       utils.SafeRWMutexMap[map[uuid.UUID]*WebsocketClient]
	trackLocals utils.SafeRWMutexMap[map[string]*webrtc.TrackLocalStaticRTP]
	hub         *VoiceServerHub
}

func (hub *VoiceServerHub) CreateChannel(ID uuid.UUID, guildID uuid.UUID) *WebRTCChannel {
	channel, ok := hub.GetChannel(ID)

	if !ok {
		channel = hub.AddChannel(&WebRTCChannel{
			id:      ID,
			guildID: guildID,
			peers: utils.SafeRWMutexMap[map[uuid.UUID]*WebsocketClient]{
				Mutex: sync.RWMutex{},
				Data:  make(map[uuid.UUID]*WebsocketClient),
			},
			trackLocals: utils.SafeRWMutexMap[map[string]*webrtc.TrackLocalStaticRTP]{
				Mutex: sync.RWMutex{},
				Data:  make(map[string]*webrtc.TrackLocalStaticRTP),
			},
			hub: hub,
		})
	}

	return channel
}

func (c *WebRTCChannel) CloseChannel() {
	c.peers.Mutex.Lock()
	defer c.peers.Mutex.Unlock()
	for idx := range c.peers.Data {
		c.peers.Data[idx].pConn.Close()
	}
}

func (c *WebRTCChannel) CreatePeer(wc *WebsocketClient) error {

	conn, err := c.hub.webrtcAPI.NewPeerConnection(webrtc.Configuration{
		ICEServers: []webrtc.ICEServer{
			{
				URLs: []string{"stun:stun.l.google.com:19302"},
			},
		},
	})

	if err != nil {
		return err
	}

	if _, err := conn.AddTransceiverFromKind(webrtc.RTPCodecTypeAudio, webrtc.RTPTransceiverInit{
		Direction: webrtc.RTPTransceiverDirectionRecvonly,
	}); err != nil {
		return err
	}

	conn.OnICECandidate(func(i *webrtc.ICECandidate) {
		if i == nil {
			return
		}

		wc.wConn.SetWriteDeadline(time.Now().Add(time.Second * 5))
		if writeErr := wc.wConn.WriteJSON(
			&OutgoingWebsocketMessage[webrtc.ICECandidateInit]{
				Op: "CANDIDATE",
				D:  i.ToJSON(),
			}); err != nil {
			log.Println("WriteJSON Error: ", writeErr)
		}
	})

	conn.OnConnectionStateChange(func(p webrtc.PeerConnectionState) {
		switch p.String() {
		case "failed":
			fallthrough
		case "disconnected":
			fallthrough
		case "closed":
			roleIDs, err := c.hub.queries.GetRoleIDsByChannelID(context.Background(), c.id)

			if err != nil {
				log.Println("GetRoleIDsByChannelID Error: ", err)
				conn.Close()
				return
			}

			if err := c.hub.queries.DeleteVoiceChannelState(context.Background(), wc.id); err != nil {
				log.Println("DeleteVoiceChannelState Error: ", err)
				return
			}

			if err := c.hub.messageQueue.PublishForwardPayload(&message_queue.ForwardedPayload{
				Version: 0,
				Op:      "VOICE_CHANNEL_STATE_DELETE",
				RoleIDs: roleIDs,
				Data: &VoiceChannelDeletePayload{
					ChannelID: c.id,
					GuildID:   c.guildID,
					UserID:    wc.id,
				},
			}); err != nil {
				log.Println("PublishForwardPayload Error: ", err)
				return
			}

			c.DelPeer(wc.id)
			c.Signalpeers()

			wc.wConn.SetWriteDeadline(time.Now().Add(time.Second * 5))
			wc.wConn.WriteMessage(
				websocket.CloseMessage,
				websocket.FormatCloseMessage(websocket.ClosePolicyViolation, ""),
			)
		}
	})

	conn.OnTrack(func(remoteTrack *webrtc.TrackRemote, _ *webrtc.RTPReceiver) {
		trackLocal := c.AddTrack(wc.id, remoteTrack)
		defer c.DelTrack(remoteTrack.ID())

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

	wc.pConn = conn
	wc.channel = c
	c.AddPeer(wc)

	return nil
}

func (c *WebRTCChannel) GetPeer(ID uuid.UUID) (*WebsocketClient, bool) {
	c.peers.Mutex.RLock()
	defer c.peers.Mutex.RUnlock()
	p, ok := c.peers.Data[ID]
	return p, ok
}

func (c *WebRTCChannel) AddPeer(peer *WebsocketClient) *WebsocketClient {
	c.peers.Mutex.Lock()
	defer c.peers.Mutex.Unlock()
	c.peers.Data[peer.id] = peer
	return peer
}

func (c *WebRTCChannel) DelPeer(ID uuid.UUID) {
	c.peers.Mutex.Lock()
	defer c.peers.Mutex.Unlock()
	delete(c.peers.Data, ID)
	if len(c.peers.Data) == 0 {
		c.hub.DelChannel(c.id)
	}
}

func (c *WebRTCChannel) GetTrack(ID string) (*webrtc.TrackLocalStaticRTP, bool) {
	c.trackLocals.Mutex.RLock()
	defer c.trackLocals.Mutex.RUnlock()
	t, ok := c.trackLocals.Data[ID]
	return t, ok
}

func (c *WebRTCChannel) AddTrack(userID uuid.UUID, track *webrtc.TrackRemote) *webrtc.TrackLocalStaticRTP {
	defer func() {
		c.trackLocals.Mutex.Unlock()
		c.Signalpeers()
	}()

	trackLocalStaticRTP, err := webrtc.NewTrackLocalStaticRTP(track.Codec().RTPCodecCapability, track.ID(), userID.String())

	if err != nil {
		log.Println("NewTrackLocalStaticRTP Error: ")
		panic(err)
	}

	c.trackLocals.Mutex.Lock()
	c.trackLocals.Data[track.ID()] = trackLocalStaticRTP

	return trackLocalStaticRTP
}

func (c *WebRTCChannel) DelTrack(ID string) {
	defer func() {
		c.trackLocals.Mutex.Unlock()
		c.Signalpeers()
	}()

	c.trackLocals.Mutex.Lock()
	delete(c.trackLocals.Data, ID)
}

func (c *WebRTCChannel) Signalpeers() {

	attemptSync := func() (tryagain bool) {
		defer func() {
			c.peers.Mutex.RUnlock()
			c.trackLocals.Mutex.RUnlock()
		}()

		c.peers.Mutex.RLock()
		c.trackLocals.Mutex.RLock()

		for id := range c.peers.Data {
			if c.peers.Data[id].pConn.ConnectionState().String() == "closed" {
				continue
			}

			existingSenders := map[string]bool{}

			for _, sender := range c.peers.Data[id].pConn.GetSenders() {
				if sender.Track() == nil {
					continue
				}

				existingSenders[sender.Track().ID()] = true

				if _, ok := c.GetTrack(sender.Track().ID()); !ok {
					if err := c.peers.Data[id].pConn.RemoveTrack(sender); err != nil {
						log.Println("RemoveTrack Error: ", err)
						return true
					}
				}
			}

			for _, receiver := range c.peers.Data[id].pConn.GetReceivers() {
				if receiver.Track() != nil {
					existingSenders[receiver.Track().ID()] = true
				}
			}

			for trackID := range c.trackLocals.Data {
				if _, ok := existingSenders[trackID]; !ok {
					if _, err := c.peers.Data[id].pConn.AddTrack(c.trackLocals.Data[trackID]); err != nil {
						log.Println("AddTrack Error: ", err)
						return true
					}
				}
			}

			offer, err := c.peers.Data[id].pConn.CreateOffer(nil)
			if err != nil {
				log.Println("CreateOffer Error: ", err)
				return true
			}

			if err = c.peers.Data[id].pConn.SetLocalDescription(offer); err != nil {
				log.Println("SetLocalDescription Error: ", err)
				return true
			}

			c.peers.Data[id].wConn.SetWriteDeadline(time.Now().Add(time.Second * 5))
			if err = c.peers.Data[id].wConn.WriteJSON(
				&OutgoingWebsocketMessage[webrtc.SessionDescription]{
					Op: "OFFER",
					D:  offer,
				}); err != nil {
				log.Println("WriteJSON Error: ", err)
				return true
			}
		}

		return
	}

	for syncAttempt := 0; syncAttempt <= 25; syncAttempt++ {
		if !attemptSync() {
			break
		}

		if syncAttempt == 25 {
			go func() {
				time.Sleep(time.Second * 3)
				c.Signalpeers()
			}()
			return
		}
	}
}
