package request

import (
	"strings"

	"github.com/MikeT117/accord/backend/internal/application/command"
)

type DeleteAttachmentRequest struct {
	ID string `param:"attachmentID"`
}

func (r *DeleteAttachmentRequest) ToDeleteAttachmentCommand(requestorID string) (*command.DeleteAttachmentCommand, error) {
	if strings.Trim(r.ID, " ") == "" {
		return nil, NewRequestValidationError("invalid id and/or status")
	}

	return &command.DeleteAttachmentCommand{
		ID:          r.ID,
		RequestorID: requestorID,
	}, nil
}
