package request

import (
	"github.com/MikeT117/accord/backend/internal/application/command"
	"github.com/google/uuid"
)

type DeleteGuildInviteRequest struct {
	ID      uuid.UUID `param:"inviteID"`
	GuildID uuid.UUID `param:"guildID"`
}

func (r *DeleteGuildInviteRequest) ToDeleteGuildInviteCommand(requestorID uuid.UUID) (*command.DeleteGuildInviteCommand, error) {
	return &command.DeleteGuildInviteCommand{
		ID:          r.ID,
		GuildID:     r.GuildID,
		RequestorID: requestorID,
	}, nil
}
