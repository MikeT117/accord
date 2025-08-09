package common

import "github.com/google/uuid"

type VoiceStateResult struct {
	ID        uuid.UUID
	SelfMute  bool
	SelfDeaf  bool
	ChannelID uuid.UUID
	UserID    uuid.UUID
	GuildID   *uuid.UUID
	User      *UserResult
}
