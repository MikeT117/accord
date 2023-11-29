package models

import "github.com/google/uuid"

type VoiceChannelState struct {
	Mute      bool        `json:"mute"`
	SelfMute  bool        `json:"selfMute"`
	SelfDeaf  bool        `json:"selfDeaf"`
	ChannelID uuid.UUID   `json:"channelId"`
	GuildID   uuid.UUID   `json:"guildId"`
	User      UserLimited `json:"user"`
}
