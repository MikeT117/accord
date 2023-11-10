package main

import (
	"errors"
	"fmt"
	"io"

	signal "github.com/MikeT117/go_web_rtc/internal"
	"github.com/pion/interceptor"
	"github.com/pion/webrtc/v4"
)

type Peer struct {
	ID        string
	Offer     *webrtc.SessionDescription
	Answer    *webrtc.SessionDescription
	Conn      *webrtc.PeerConnection
	SendTrack *webrtc.TrackLocalStaticRTP
	RecvTrack *webrtc.TrackLocalStaticRTP
}

type Room struct {
	ID                  string
	MediaEngine         *webrtc.MediaEngine
	InterceptorRegistry *interceptor.Registry
	Peers               []Peer
	LocalTrackChan      chan *webrtc.TrackLocalStaticRTP
	// Stream
}

var PeerConnectionConfig webrtc.Configuration = webrtc.Configuration{
	ICEServers: []webrtc.ICEServer{
		{
			URLs: []string{"stun:stun.l.google.com:19302"},
		},
	},
}

func CreateRoom(ID string) *Room {
	room := &Room{
		ID:                  ID,
		MediaEngine:         &webrtc.MediaEngine{},
		InterceptorRegistry: &interceptor.Registry{},
		Peers:               []Peer{},
		LocalTrackChan:      make(chan *webrtc.TrackLocalStaticRTP),
	}

	if err := room.MediaEngine.RegisterDefaultCodecs(); err != nil {
		panic(err)
	}

	if err := webrtc.RegisterDefaultInterceptors(room.MediaEngine, room.InterceptorRegistry); err != nil {
		panic(err)
	}

	return room
}

func (r *Room) CreatePeer(ID string, offer webrtc.SessionDescription) *Peer {

	peerConnection, err := webrtc.NewAPI(webrtc.WithMediaEngine(r.MediaEngine), webrtc.WithInterceptorRegistry(r.InterceptorRegistry)).NewPeerConnection(PeerConnectionConfig)
	if err != nil {
		panic(err)
	}

	if _, err = peerConnection.AddTransceiverFromKind(webrtc.RTPCodecTypeAudio); err != nil {
		panic(err)
	}

	peerConnection.OnTrack(func(remoteTrack *webrtc.TrackRemote, receiver *webrtc.RTPReceiver) {
		// Create a local track, all our SFU clients will be fed via this track
		localTrack, newTrackErr := webrtc.NewTrackLocalStaticRTP(remoteTrack.Codec().RTPCodecCapability, "audio", "pion")
		if newTrackErr != nil {
			panic(newTrackErr)
		}
		r.LocalTrackChan <- localTrack

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
	err = peerConnection.SetRemoteDescription(offer)
	if err != nil {
		panic(err)
	}

	// Create answer
	answer, err := peerConnection.CreateAnswer(nil)
	if err != nil {
		panic(err)
	}

	peer := &Peer{
		ID:   ID,
		Conn: peerConnection,
	}

	gatherComplete := webrtc.GatheringCompletePromise(peerConnection)

	err = peerConnection.SetLocalDescription(answer)
	if err != nil {
		panic(err)
	}

	<-gatherComplete

	fmt.Println(signal.Encode(*peerConnection.LocalDescription()))

	return peer
}
