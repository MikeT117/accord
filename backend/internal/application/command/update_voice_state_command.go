package command

import "github.com/google/uuid"

type UpdateVoiceStateCommand struct {
	ID          uuid.UUID
	GuildID     uuid.UUID
	RequestorID uuid.UUID
	SelfDeaf    bool
	SelfMute    bool
}
