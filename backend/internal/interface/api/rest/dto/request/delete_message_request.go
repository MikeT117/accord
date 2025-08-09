package request

import (
	"github.com/MikeT117/accord/backend/internal/application/command"
	"github.com/google/uuid"
)

type DeleteChannelMessageRequest struct {
	ID        uuid.UUID `param:"messageID"`
	ChannelID uuid.UUID `param:"channelID"`
}

func (r *DeleteChannelMessageRequest) ToDeleteChannelMessageCommand(requestorID uuid.UUID) (*command.DeleteChannelMessageCommand, error) {
	return &command.DeleteChannelMessageCommand{
		ID:          r.ID,
		ChannelID:   r.ChannelID,
		RequestorID: requestorID,
	}, nil
}
