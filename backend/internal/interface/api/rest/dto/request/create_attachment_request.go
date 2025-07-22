package request

import "github.com/MikeT117/accord/backend/internal/application/command"

type CreateAttachmentRequest struct {
	Filename     string `json:"filename"`
	ResourceType string `json:"resourceType"`
	Filesize     int64  `json:"filesize"`
}

func (r *CreateAttachmentRequest) ToCreateAttachmentCommand(requestorID string) (*command.CreateAttachmentCommand, error) {
	if r.ResourceType != "image/jpeg" && r.ResourceType != "image/png" {
		return nil, NewRequestValidationError("invalid resource type")
	}

	return &command.CreateAttachmentCommand{
		Filename:     r.Filename,
		ResourceType: r.ResourceType,
		OwnerID:      requestorID,
		Filesize:     r.Filesize,
	}, nil
}
