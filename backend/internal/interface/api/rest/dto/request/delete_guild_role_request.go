package request

import (
	"strings"

	"github.com/MikeT117/accord/backend/internal/application/command"
)

type DeleteGuildRoleRequest struct {
	ID          string `param:"roleID"`
	GuildID     string `param:"guildID"`
	Name        string `json:"name"`
	Permissions int32  `json:"permissions"`
}

func (r *DeleteGuildRoleRequest) ToDeleteGuildRoleCommand(requestorID string) (*command.DeleteGuildRoleCommand, error) {
	if strings.Trim(r.ID, " ") == "" || strings.Trim(r.GuildID, " ") == "" {
		return nil, NewRequestValidationError("invalid guild role id and/or guild id")
	}

	return &command.DeleteGuildRoleCommand{
		ID:          r.ID,
		GuildID:     r.GuildID,
		RequestorID: requestorID,
	}, nil
}
