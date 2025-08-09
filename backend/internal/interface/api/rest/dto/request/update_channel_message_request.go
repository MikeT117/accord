package request

import (
	"github.com/MikeT117/accord/backend/internal/application/command"
	"github.com/google/uuid"
)

type UpdateChannelMessageRequest struct {
	ID        uuid.UUID `param:"messageID"`
	ChannelID uuid.UUID `param:"channelID"`
	Content   string    `json:"content"`
}

func (r *UpdateChannelMessageRequest) ToUpdateChannelMessageCommand(requestorID uuid.UUID) (*command.UpdateChannelMessageCommand, error) {
	return &command.UpdateChannelMessageCommand{
		ID:          r.ID,
		Content:     r.Content,
		ChannelID:   r.ChannelID,
		RequestorID: requestorID,
	}, nil
}
