package request

import (
	"github.com/MikeT117/accord/backend/internal/application/command"
	"github.com/google/uuid"
)

type CreateChannelMessageRequest struct {
	ChannelID     uuid.UUID   `param:"channelID"`
	Content       string      `json:"content"`
	AttachmentIDs []uuid.UUID `json:"attachmentIds"`
}

func (r *CreateChannelMessageRequest) ToCreateChannelMessageCommand(requestorID uuid.UUID) (*command.CreateChannelMessageCommand, error) {
	if r.Content == "" && len(r.AttachmentIDs) == 0 {
		return nil, NewRequestValidationError("message has no content")
	}

	return &command.CreateChannelMessageCommand{
		Content:       r.Content,
		AuthorID:      requestorID,
		ChannelID:     r.ChannelID,
		AttachmentIDs: r.AttachmentIDs,
		RequestorID:   requestorID,
	}, nil
}
