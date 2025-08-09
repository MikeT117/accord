package request

import (
	"github.com/MikeT117/accord/backend/internal/application/command"
	"github.com/google/uuid"
)

type DeleteGuildRequest struct {
	ID uuid.UUID `param:"guildID"`
}

func (r *DeleteGuildRequest) ToDeleteGuildCommand(requestorID uuid.UUID) (*command.DeleteGuildCommand, error) {
	return &command.DeleteGuildCommand{
		ID:          r.ID,
		RequestorID: requestorID,
	}, nil
}
