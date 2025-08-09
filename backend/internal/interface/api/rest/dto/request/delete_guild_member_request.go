package request

import (
	"github.com/MikeT117/accord/backend/internal/application/command"
	"github.com/google/uuid"
)

type DeleteGuildMemberRequest struct {
	UserID  uuid.UUID `param:"roleID"`
	GuildID uuid.UUID `param:"guildID"`
}

func (r *DeleteGuildMemberRequest) ToDeleteGuildMemberCommand(requestorID uuid.UUID) (*command.DeleteGuildMemberCommand, error) {
	return &command.DeleteGuildMemberCommand{
		UserID:      r.UserID,
		GuildID:     r.GuildID,
		RequestorID: requestorID,
	}, nil
}
