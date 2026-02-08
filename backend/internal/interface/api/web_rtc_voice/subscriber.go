package web_rtc_voice

import (
	"context"
	"log"
	"sync"

	"github.com/pion/webrtc/v4"
)

type SubscriberPayload struct {
	len  int
	data []byte
}

type Subscriber struct {
	publisher *Peer
	peer      *Peer

	ctx    context.Context
	cancel context.CancelFunc

	queue      chan *SubscriberPayload
	trackLocal *webrtc.TrackLocalStaticRTP
	bufferPool sync.Pool

	once sync.Once
}

func (s *Subscriber) getPayloadBuffer() *SubscriberPayload {
	return s.bufferPool.Get().(*SubscriberPayload)
}

func (s *Subscriber) putPayloadBuffer(buf *SubscriberPayload) {
	s.bufferPool.Put(buf)
}

func (p *Peer) createSubscriber(peer *Peer) (error, *Subscriber) {
	log.Printf("CREATING SUBSCRIBER - PublisherID: %s - SubscriberID: %s\n", p.client.id.String(), peer.client.id.String())

	trackLocal, err := webrtc.NewTrackLocalStaticRTP(
		p.getCodecParams().RTPCodecCapability,
		p.client.id.String(),
		p.client.channel.id.String(),
	)

	if err != nil {
		log.Println("NewTrackLocalStaticRTP ERR: ", err)
		// transceiver.Stop()
		return err, nil
	}

	if _, err := peer.conn.AddTrack(trackLocal); err != nil {
		log.Println("ReplaceTrack ERR: ", err)
		return err, nil
	}

	ctx, cancel := context.WithCancel(p.client.ctx)
	subscriber := &Subscriber{
		publisher: p,
		peer:      peer,

		ctx:    ctx,
		cancel: cancel,

		queue:      make(chan *SubscriberPayload, 100),
		trackLocal: trackLocal,
		bufferPool: sync.Pool{
			New: func() interface{} {
				buffer := &SubscriberPayload{
					len:  0,
					data: make([]byte, 1500),
				}
				return buffer
			},
		},

		once: sync.Once{},
	}

	go subscriber.handleForwardedPackets()
	p.addSubscriber(subscriber.peer.client.id, subscriber)

	go func() {
		<-ctx.Done()
		log.Printf("SUBSCRIBER %s FOR CLIENT %s SHUTTING DOWN\n",
			p.client.id.String(),
			subscriber.peer.client.id.String(),
		)

		close(subscriber.queue)
		p.deleteSubscriber(peer.client.id)
	}()

	return nil, subscriber
}

func (s *Subscriber) shutdown() {
	s.once.Do(s.cancel)
}

func (s *Subscriber) handleForwardedPackets() {
	for {
		select {
		case <-s.ctx.Done():
			return
		case payload, ok := <-s.queue:
			if !ok {
				return
			}

			if payload == nil {
				return
			}

			if _, err := s.trackLocal.Write(payload.data[:payload.len]); err != nil {
				s.shutdown()
			}
		}
	}
}

func (s *Subscriber) send(payload *SubscriberPayload) bool {
	select {
	case s.queue <- payload:
		return true
	default:
		s.putPayloadBuffer(payload)
		return false
	}
}
