package request

import "github.com/MikeT117/accord/backend/internal/application/command"

type CreateAttachmentRequest struct {
	ResourceType string `json:"resourceType"`
	Height       *int64 `json:"height"`
	Width        *int64 `json:"width"`
	Filesize     int64  `json:"filesize"`
}

func (r *CreateAttachmentRequest) ToCreateAttachmentCommand(requestorID string) (*command.CreateAttachmentCommand, error) {
	if r.ResourceType != "image/jpeg" {
		return nil, NewRequestValidationError("invalid resource type")
	}

	return &command.CreateAttachmentCommand{
		ResourceType: r.ResourceType,
		OwnerID:      requestorID,
		Height:       r.Height,
		Width:        r.Width,
		Filesize:     r.Filesize,
	}, nil
}
