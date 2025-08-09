package request

import (
	"github.com/MikeT117/accord/backend/internal/application/command"
	"github.com/google/uuid"
)

type DeleteAttachmentRequest struct {
	ID uuid.UUID `param:"attachmentID"`
}

func (r *DeleteAttachmentRequest) ToDeleteAttachmentCommand(requestorID uuid.UUID) (*command.DeleteAttachmentCommand, error) {
	return &command.DeleteAttachmentCommand{
		ID:          r.ID,
		RequestorID: requestorID,
	}, nil
}
