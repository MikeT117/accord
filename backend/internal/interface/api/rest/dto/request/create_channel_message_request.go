package request

import "github.com/MikeT117/accord/backend/internal/application/command"

type CreateChannelMessageRequest struct {
	ChannelID     string   `param:"channelID"`
	Content       string   `json:"content"`
	AttachmentIDs []string `json:"attachmentIds"`
}

func (r *CreateChannelMessageRequest) ToCreateChannelMessageCommand(requestorID string) (*command.CreateChannelMessageCommand, error) {
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
