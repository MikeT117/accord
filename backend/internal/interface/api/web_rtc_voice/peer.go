package web_rtc_voice

import (
	"log"
	"sync"
	"sync/atomic"
	"time"

	pb "github.com/MikeT117/accord/backend/internal/infra/pb/gen"
	"github.com/google/uuid"
	"github.com/pion/webrtc/v4"
	"google.golang.org/protobuf/proto"
)

type PeerState int

const (
	PeerNotInitialised PeerState = iota
	PeerActive
	PeerInactive
)

type Peer struct {
	client *Client

	conn        *webrtc.PeerConnection
	codecParams atomic.Value
	subscribers SafeRWMutex[map[uuid.UUID]*Subscriber]

	once sync.Once

	state atomic.Value

	negotiating     sync.Mutex
	negotiationBusy atomic.Bool

	transceiver *webrtc.RTPTransceiver
}

func (c *Peer) getState() PeerState {
	if v := c.state.Load(); v != nil {
		return v.(PeerState)
	}
	return PeerNotInitialised
}

func (p *Peer) getCodecParams() *webrtc.RTPCodecParameters {
	if v := p.codecParams.Load(); v != nil {
		return v.(*webrtc.RTPCodecParameters)
	}
	return nil
}

func (c *Client) createPeer() {
	conn, err := c.channel.hub.api.NewPeerConnection(webrtc.Configuration{
		ICEServers: []webrtc.ICEServer{
			{
				URLs: []string{"stun:stun.l.google.com:19302"},
			},
		},
	})

	if err != nil {
		log.Println(err)
		c.shutdown()
		return
	}

	peer := &Peer{
		client: c,

		conn:        conn,
		codecParams: atomic.Value{},
		subscribers: SafeRWMutex[map[uuid.UUID]*Subscriber]{
			Mutex: sync.RWMutex{},
			Data:  make(map[uuid.UUID]*Subscriber),
		},

		once: sync.Once{},

		state: atomic.Value{},

		negotiating:     sync.Mutex{},
		negotiationBusy: atomic.Bool{},

		transceiver: nil,
	}

	peer.state.Store(PeerActive)
	peer.negotiationBusy.Store(false)

	transceiver, err := conn.AddTransceiverFromKind(
		webrtc.RTPCodecTypeAudio,
		webrtc.RTPTransceiverInit{Direction: webrtc.RTPTransceiverDirectionSendrecv},
	)

	if err != nil {
		log.Println(err)
		c.shutdown()
		return
	}

	peer.transceiver = transceiver
	c.peer = peer

	conn.OnICECandidate(peer.handleIceCandidate)
	conn.OnTrack(peer.handleTrack)

	c.channel.clients.Mutex.RLock()
	defer c.channel.clients.Mutex.RUnlock()
	for _, client := range c.channel.clients.Data {

		if client.id == c.id {
			continue
		}

		if client.peer.getState() != PeerActive {
			continue
		}

		if client.peer.getCodecParams() == nil {
			continue
		}

		err, _ := client.peer.createSubscriber(peer)
		if err != nil {
			continue
		}
	}

	peer.requestNegotiation()
}

func (p *Peer) shutdown() {
	p.once.Do(func() {
		if p.client.getState() == ClientAuthenticated {
			log.Printf("PEER FOR AUTHENTICATED CLIENT %s SHUTTING DOWN\n", p.client.id.String())
		} else {
			log.Println("PEER FOR UNAUTHENTICATED CLIENT SHUTTING DOWN")
		}

		p.state.Store(PeerInactive)

		if p.conn != nil {
			p.conn.Close()
		}

		subscribersSnapshot := []*Subscriber{}
		p.subscribers.Mutex.Lock()
		for _, subscriber := range p.subscribers.Data {
			subscribersSnapshot = append(subscribersSnapshot, subscriber)
		}
		p.subscribers.Mutex.Unlock()

		for _, subscriber := range subscribersSnapshot {
			subscriber.shutdown()
		}
	})
}

func (peer *Peer) handleTrack(remoteTrack *webrtc.TrackRemote, _ *webrtc.RTPReceiver) {
	log.Printf("HANDLING TRACK FOR PEER: %s\n", peer.client.id.String())

	if remoteTrack.Kind() != webrtc.RTPCodecTypeAudio {
		return
	}

	codec := remoteTrack.Codec()
	peer.codecParams.Store(&codec)

	peer.createSubscriptions()
	peer.forwardTrack(remoteTrack)
}

func (peer *Peer) handleIceCandidate(iceCandidate *webrtc.ICECandidate) {
	if iceCandidate == nil {
		return
	}

	candidateInit := iceCandidate.ToJSON()

	payload := &pb.WebRTCEvent_WebrtcIceCandidate{
		WebrtcIceCandidate: &pb.WebRTCICECandidate{
			Candidate: &candidateInit.Candidate,
		},
	}

	if candidateInit.SDPMLineIndex != nil {
		SdpMLineIndex := int32(*candidateInit.SDPMLineIndex)
		payload.WebrtcIceCandidate.SdpMLineIndex = &SdpMLineIndex
	}

	if candidateInit.SDPMid != nil {
		payload.WebrtcIceCandidate.SdpMid = candidateInit.SDPMid
	}

	if candidateInit.UsernameFragment != nil {
		payload.WebrtcIceCandidate.UsernameFragment = candidateInit.UsernameFragment
	}

	var ver int32 = 0
	data, err := proto.Marshal(&pb.WebRTCEvent{
		Op:      pb.WebRTCOpCode_WEBRTC_ICE_CANDIDATE.Enum(),
		Ver:     &ver,
		Payload: payload,
	})

	if err != nil {
		return
	}

	if ok := peer.client.websocket.send(data); !ok {
		peer.client.shutdown()
	}
}

func (peer *Peer) forwardTrack(remoteTrack *webrtc.TrackRemote) {
	remoteTrackBuf := make([]byte, 1500)
	for {
		select {
		case <-peer.client.ctx.Done():
			return
		default:
			n, _, readErr := remoteTrack.Read(remoteTrackBuf)
			if readErr != nil {
				log.Println("TrackReadErr: ", readErr)
				peer.client.shutdown()
				return
			}

			var inactiveSubscribers []*Subscriber

			peer.subscribers.Mutex.RLock()
			for _, subscriber := range peer.subscribers.Data {

				subscriberPayload := subscriber.getPayloadBuffer()
				copy(subscriberPayload.data[:n], remoteTrackBuf[:n])
				subscriberPayload.len = n

				if !subscriber.send(subscriberPayload) {
					inactiveSubscribers = append(inactiveSubscribers, subscriber)
					subscriber.putPayloadBuffer(subscriberPayload)
				}
			}
			peer.subscribers.Mutex.RUnlock()

			for _, subscriber := range inactiveSubscribers {
				subscriber.shutdown()
			}
		}
	}
}

func (peer *Peer) addSubscriber(ID uuid.UUID, subscriber *Subscriber) {
	peer.subscribers.Mutex.Lock()
	defer peer.subscribers.Mutex.Unlock()

	peer.subscribers.Data[ID] = subscriber
}

func (peer *Peer) deleteSubscriber(ID uuid.UUID) {
	peer.subscribers.Mutex.Lock()
	defer peer.subscribers.Mutex.Unlock()

	delete(peer.subscribers.Data, ID)
}

func (peer *Peer) createSubscriptions() {
	peer.client.channel.clients.Mutex.RLock()
	defer peer.client.channel.clients.Mutex.RUnlock()

	for _, client := range peer.client.channel.clients.Data {
		if client.id == peer.client.id {
			continue
		}

		if peer.getState() != PeerActive {
			continue
		}

		if peer.getCodecParams() == nil {
			continue
		}

		err, _ := peer.createSubscriber(client.peer)
		if err != nil {
			log.Println("CreateSubscriber ERR: ", err)
			continue
		}

		client.peer.requestNegotiation()
	}
}

func (p *Peer) requestNegotiation() {
	if !p.negotiationBusy.CompareAndSwap(false, true) {
		return
	}

	go func() {
		time.Sleep(100 * time.Millisecond)
		p.negotiating.Lock()
		defer p.negotiating.Unlock()
		defer p.negotiationBusy.Store(false)

		p.negotiate()
	}()
}

func (p *Peer) negotiate() {
	log.Printf("Negotiating for peer %s", p.client.id.String())

	offer, err := p.conn.CreateOffer(nil)
	if err != nil {
		log.Println(err)
		p.shutdown()
		return
	}

	if err := p.conn.SetLocalDescription(offer); err != nil {
		log.Println(err)
		p.shutdown()
		return
	}

	var ver int32 = 0
	sdpType := offer.Type.String()
	data, err := proto.Marshal(&pb.WebRTCEvent{
		Op:  pb.WebRTCOpCode_WEBRTC_SESSION_DESCRIPTION.Enum(),
		Ver: &ver,
		Payload: &pb.WebRTCEvent_WebrtcSessionDescription{
			WebrtcSessionDescription: &pb.WebRTCSessionDescription{
				Ver:  &ver,
				Type: &sdpType,
				Sdp:  &offer.SDP,
			},
		},
	})

	if err != nil {
		log.Println(err)
		p.shutdown()
		return
	}

	if ok := p.client.websocket.send(data); !ok {
		log.Println(err)
		p.shutdown()
		return
	}
}
