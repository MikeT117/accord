package mapper

import (
	"github.com/MikeT117/accord/backend/internal/application/common"
	"github.com/MikeT117/accord/backend/internal/interface/api/REST/dto/response"
)

func ToAttachmentResponse(attachment *common.AttachmentResult) *response.AttachmentResponse {
	if attachment == nil {
		return nil
	}
	return &response.AttachmentResponse{
		ID:           attachment.ID,
		ResourceType: attachment.ResourceType,
		Height:       attachment.Height,
		Width:        attachment.Width,
		Filesize:     attachment.Filesize,
		CreatedAt:    attachment.CreatedAt,
		UpdatedAt:    attachment.UpdatedAt,
		Status:       attachment.Status,
	}
}

func ToAttachmentsResponse(attachments []*common.AttachmentResult) []*response.AttachmentResponse {
	attachmentResponses := make([]*response.AttachmentResponse, len(attachments))

	for i := 0; i < len(attachments); i++ {
		attachmentResponses[i] = ToAttachmentResponse(attachments[i])
	}

	return attachmentResponses
}
