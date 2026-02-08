package web_rtc_voice

import (
	"context"
	"log"
	"sync"
	"sync/atomic"
	"time"

	"github.com/MikeT117/accord/backend/internal/application/command"
	"github.com/MikeT117/accord/backend/internal/constants"
	pb "github.com/MikeT117/accord/backend/internal/infra/pb/gen"
	"github.com/MikeT117/accord/backend/internal/interface/api/authentication"
	"github.com/google/uuid"
	"github.com/pion/webrtc/v4"
)

type ClientState int

const (
	ClientPendingAuthentication ClientState = iota
	ClientAuthenticated
	ClientClosed
)

type Client struct {
	hub     *Hub
	channel *Channel

	ctx    context.Context
	cancel context.CancelFunc

	id uuid.UUID

	websocket *Websocket
	peer      *Peer

	once sync.Once

	state atomic.Value

	authTimeoutCtx    context.Context
	cancelAuthTimeout context.CancelFunc

	iceCandidateQueue SafeRWMutex[[]*webrtc.ICECandidateInit]
}

func (c *Client) addIceCandidiateToQueue(iceCandidate *webrtc.ICECandidateInit) {
	c.iceCandidateQueue.Mutex.Lock()
	defer c.iceCandidateQueue.Mutex.Unlock()

	c.iceCandidateQueue.Data = append(c.iceCandidateQueue.Data, iceCandidate)
}

func (c *Client) clearQueuedIceCandidates() {
	c.iceCandidateQueue.Mutex.Lock()
	defer c.iceCandidateQueue.Mutex.Unlock()

	c.iceCandidateQueue.Data = []*webrtc.ICECandidateInit{}
}

func (c *Client) getQueuedIceCandidates() []*webrtc.ICECandidateInit {
	c.iceCandidateQueue.Mutex.RLock()
	defer c.iceCandidateQueue.Mutex.RUnlock()

	queue := []*webrtc.ICECandidateInit{}

	for _, iceCandidate := range c.iceCandidateQueue.Data {
		queue = append(queue, iceCandidate)
	}

	return queue
}

func (c *Client) getState() ClientState {
	if v := c.state.Load(); v != nil {
		return v.(ClientState)
	}

	return ClientPendingAuthentication
}

func CreateClient(hub *Hub) *Client {
	ctx, cancel := context.WithCancel(context.Background())
	authTimeoutCtx, cancelAuthTimeout := context.WithTimeout(ctx, time.Second*15)

	client := &Client{
		hub:     hub,
		channel: nil,

		ctx:    ctx,
		cancel: cancel,

		id: uuid.UUID{},

		once: sync.Once{},

		state: atomic.Value{},

		authTimeoutCtx:    authTimeoutCtx,
		cancelAuthTimeout: cancelAuthTimeout,

		iceCandidateQueue: SafeRWMutex[[]*webrtc.ICECandidateInit]{
			Data:  []*webrtc.ICECandidateInit{},
			Mutex: sync.RWMutex{},
		},
	}

	client.state.Store(ClientPendingAuthentication)

	go func() {
		<-client.authTimeoutCtx.Done()

		if client.getState() != ClientAuthenticated {
			client.shutdown()
		}
	}()

	go func() {
		<-client.ctx.Done()

		if client.getState() == ClientAuthenticated {
			log.Printf("AUTHENTICATED CLIENT %s SHUTTING DOWN\n", client.id.String())
		} else {
			log.Println("UNAUTHENTICATED CLIENT SHUTTING DOWN")
		}

		client.state.Store(ClientClosed)

		if client.peer != nil {
			client.peer.shutdown()
		}

		if client.websocket != nil {
			client.websocket.shutdown()
		}

		if client.channel != nil {
			ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
			if err := client.hub.voiceStateService.Delete(ctx, &command.DeleteVoiceStateCommand{
				ID:          client.id,
				RequestorID: client.id,
			}); err != nil {
				log.Println("DeleteVoiceStateErr", err)
			}
			cancel()

			client.channel.deleteClient(client.id)
		}

	}()

	return client
}

func (c *Client) shutdown() {
	c.once.Do(c.cancel)
}

func (c *Client) handleIdentify(payload *pb.WebRTCIdentify) {

	if c.getState() == ClientAuthenticated {
		return
	}

	if c.getState() == ClientClosed {
		return
	}

	token := payload.GetToken()
	guildID, err := uuid.Parse(payload.GetGuildId())
	if err != nil {
		log.Println("InvalidGuildIDErr: ", err)
		c.shutdown()
		return
	}

	// TODO: Ensure the channel is a voice channel.
	channelID, err := uuid.Parse(payload.GetChannelId())
	if err != nil {
		log.Println("InvalidChannelIDErr: ", err)
		c.shutdown()
		return
	}

	_, userID, err := authentication.ValidateToken(token, c.hub.config.JWTRefreshtokenKey)
	if err != nil {
		log.Println("ValidateTokenErr: ", err)
		c.shutdown()
		return
	}

	c.id = userID

	svcCtx, svcCancel := context.WithTimeout(context.Background(), 5*time.Second)
	if err := c.hub.authorisationService.VerifyGuildChannelPermission(
		svcCtx,
		channelID,
		userID,
		constants.VIEW_GUILD_CHANNEL_PERMISSION,
	); err != nil {
		log.Println("VerifyGuildChannelPermissionErr: ", err)
		svcCancel()
		c.shutdown()
		return
	}
	svcCancel()

	c.state.Store(ClientAuthenticated)
	c.cancelAuthTimeout()

	c.channel = c.hub.GetOrCreateChannel(channelID, guildID)
	if ok := c.channel.addClient(c); !ok {
		log.Println("addClientErr: ", err)
		c.shutdown()
		return
	}

	c.createPeer()

	svcCtx, svcCancel = context.WithTimeout(context.Background(), 5*time.Second)
	if err := c.hub.voiceStateService.Create(svcCtx, &command.CreateVoiceStateCommand{
		GuildID:   &guildID,
		ChannelID: channelID,
		UserID:    userID,
	}); err != nil {
		log.Println("CreateVoiceStateErr: ", err)
		svcCancel()
		c.shutdown()
		return
	}
	svcCancel()
}

func (c *Client) handleIceCandidate(payload *pb.WebRTCICECandidate) {
	candidate := payload.GetCandidate()
	sdpMid := payload.GetSdpMid()
	sdpLineIndex := uint16(payload.GetSdpMLineIndex())
	usernameFragment := payload.GetUsernameFragment()

	iceCandidateInit := webrtc.ICECandidateInit{
		Candidate:        candidate,
		SDPMid:           &sdpMid,
		SDPMLineIndex:    &sdpLineIndex,
		UsernameFragment: &usernameFragment,
	}

	if c.peer == nil || c.peer.getState() != PeerActive || c.peer.conn.CurrentRemoteDescription() == nil {
		c.addIceCandidiateToQueue(&iceCandidateInit)
		return
	}

	if err := c.peer.conn.AddICECandidate(iceCandidateInit); err != nil {
		log.Println("AddICECandidateErr: ", err)
		c.shutdown()
	}
}

func (c *Client) addQueuedICECandidates() {
	iceCandidateQueue := c.getQueuedIceCandidates()
	for _, iceCandidateInit := range iceCandidateQueue {
		if iceCandidateInit == nil {
			continue
		}

		if err := c.peer.conn.AddICECandidate(*iceCandidateInit); err != nil {
			log.Println("AddICECandidateErr: ", err)
			c.shutdown()
			return
		}
	}
	c.clearQueuedIceCandidates()
}

func (c *Client) handleSessionDescription(payload *pb.WebRTCSessionDescription) {
	sdpStr := payload.GetSdp()
	sdpType := payload.GetType()

	if sdpType != webrtc.SDPTypeAnswer.String() {
		log.Println("InvalidSDPTypeErr")
		c.shutdown()
		return
	}

	sdp := webrtc.SessionDescription{
		SDP:  sdpStr,
		Type: webrtc.NewSDPType(sdpType),
	}

	if err := c.peer.conn.SetRemoteDescription(sdp); err != nil {
		log.Println("SetRemoteDescriptionErr: ", err)
		c.shutdown()
		return
	}

	c.addQueuedICECandidates()
}

func (c *Client) handleSelfMute(payload *pb.WebRTCSelfUpdate) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := c.hub.voiceStateService.Update(ctx, &command.UpdateVoiceStateCommand{
		ID:          c.id,
		GuildID:     c.channel.guildID,
		RequestorID: c.id,
		SelfDeaf:    payload.GetSelfDeaf(),
		SelfMute:    payload.GetSelfMute(),
	}); err != nil {
		log.Println("UpdateVoiceStateErr: ", err)
	}
}

func (c *Client) handleEvents(event *pb.WebRTCEvent) {
	switch *event.GetOp().Enum() {
	case pb.WebRTCOpCode_WEBRTC_IDENTIFY:
		c.handleIdentify(event.GetWebrtcIdentify())
	case pb.WebRTCOpCode_WEBRTC_ICE_CANDIDATE:
		c.handleIceCandidate(event.GetWebrtcIceCandidate())
	case pb.WebRTCOpCode_WEBRTC_SESSION_DESCRIPTION:
		c.handleSessionDescription(event.GetWebrtcSessionDescription())
	case pb.WebRTCOpCode_WEBRTC_SELF_MUTE:
		c.handleSelfMute(event.GetWebrtcSelfUpdate())
	default:
		c.shutdown()
	}
}
