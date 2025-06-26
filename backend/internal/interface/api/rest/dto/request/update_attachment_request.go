package request

import (
	"strings"

	"github.com/MikeT117/accord/backend/internal/application/command"
)

type UpdateAttachmentRequest struct {
	ID     string `param:"attachmentID"`
	Status int8   `json:"status"`
}

func (r *UpdateAttachmentRequest) ToUpdateAttachmentCommand(requestorID string) (*command.UpdateAttachmentCommand, error) {
	if strings.Trim(r.ID, " ") == "" || r.Status > 1 || r.Status < 0 {
		return nil, NewRequestValidationError("invalid id and/or status")
	}

	return &command.UpdateAttachmentCommand{
		ID:     r.ID,
		Status: r.Status,
	}, nil
}
