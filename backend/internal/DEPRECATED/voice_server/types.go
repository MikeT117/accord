package voice_server

import (
	"github.com/google/uuid"
	"github.com/pion/webrtc/v4"
)

type IncomingWebsocketMessage struct {
	Op string `json:"op"`
	D  struct {
		Accesstoken  string                    `json:"accesstoken"`
		Refreshtoken string                    `json:"refreshtoken"`
		Answer       webrtc.SessionDescription `json:"answer"`
		Candidate    webrtc.ICECandidateInit   `json:"candidate"`
		ChannelID    uuid.UUID                 `json:"channelId"`
		GuildID      uuid.UUID                 `json:"guildID"`
		SelfMute     bool                      `json:"selfMute"`
	}
}

type OutgoingWebsocketMessage[T any] struct {
	Op string `json:"op"`
	D  T      `json:"d"`
}

type VoiceChannelDeletePayload struct {
	ChannelID uuid.UUID `json:"channelId"`
	UserID    uuid.UUID `json:"userId"`
	GuildID   uuid.UUID `json:"guildId"`
}

type VoiceChannelUpdatePayload struct {
	ChannelID uuid.UUID `json:"id"`
	UserID    uuid.UUID `json:"userId"`
	GuildID   uuid.UUID `json:"guildId"`
	TrackID   string    `json:"trackId"`
	SelfMute  bool      `json:"selfMute,omitempty"`
}
