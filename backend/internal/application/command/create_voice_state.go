package command

import "github.com/google/uuid"

type CreateVoiceStateCommand struct {
	GuildID   *uuid.UUID
	ChannelID uuid.UUID
	UserID    uuid.UUID
}
