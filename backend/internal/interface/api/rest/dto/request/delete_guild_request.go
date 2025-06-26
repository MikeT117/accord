package request

import "github.com/MikeT117/accord/backend/internal/application/command"

type DeleteGuildRequest struct {
	ID string `param:"guildID"`
}

func (r *DeleteGuildRequest) ToDeleteGuildCommand(requestorID string) (*command.DeleteGuildCommand, error) {
	if r.ID == "" {
		return nil, NewRequestValidationError("invalid id")
	}
	return &command.DeleteGuildCommand{
		ID:          r.ID,
		RequestorID: requestorID,
	}, nil
}
