package request

import (
	"github.com/MikeT117/accord/backend/internal/application/command"
	"github.com/google/uuid"
)

type CreateGuildMemberRequest struct {
	GuildID  uuid.UUID  `param:"guildID"`
	InviteID *uuid.UUID `json:"inviteId"`
}

func (r *CreateGuildMemberRequest) ToCreateGuildMemberCommand(requestorID uuid.UUID) (*command.CreateGuildMemberCommand, error) {
	return &command.CreateGuildMemberCommand{
		UserID:   requestorID,
		GuildID:  r.GuildID,
		InviteID: r.InviteID,
	}, nil
}
