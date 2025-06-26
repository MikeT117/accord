package request

import (
	"strings"

	"github.com/MikeT117/accord/backend/internal/application/command"
)

type DeleteGuildMemberRequest struct {
	UserID  string `param:"roleID"`
	GuildID string `param:"guildID"`
}

func (r *DeleteGuildMemberRequest) ToDeleteGuildMemberCommand(requestorID string) (*command.DeleteGuildMemberCommand, error) {
	if strings.Trim(r.UserID, " ") == "" || strings.Trim(r.GuildID, " ") == "" {
		return nil, NewRequestValidationError("invalid user id and/or guild id")
	}

	return &command.DeleteGuildMemberCommand{
		UserID:      r.UserID,
		GuildID:     r.GuildID,
		RequestorID: requestorID,
	}, nil
}
