package request

import (
	"strings"

	"github.com/MikeT117/accord/backend/internal/application/command"
)

type DeleteGuildInviteRequest struct {
	ID      string `param:"inviteID"`
	GuildID string `param:"guildID"`
}

func (r *DeleteGuildInviteRequest) ToDeleteGuildInviteCommand(requestorID string) (*command.DeleteGuildInviteCommand, error) {
	if strings.Trim(r.ID, " ") == "" || strings.Trim(r.GuildID, " ") == "" {
		return nil, NewRequestValidationError("invalid id and/or guild id")
	}
	return &command.DeleteGuildInviteCommand{
		ID:          r.ID,
		GuildID:     r.GuildID,
		RequestorID: requestorID,
	}, nil
}
