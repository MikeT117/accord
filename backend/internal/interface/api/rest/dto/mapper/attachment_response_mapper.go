package mapper

import (
	"github.com/MikeT117/accord/backend/internal/application/common"
	"github.com/MikeT117/accord/backend/internal/interface/api/rest/dto/response"
)

func ToAttachmentResponse(attachment *common.AttachmentResult) *response.AttachmentResponse {
	if attachment == nil {
		return nil
	}
	return &response.AttachmentResponse{
		ID:           attachment.ID,
		Filename:     attachment.Filename,
		ResourceType: attachment.ResourceType,
		OwnerID:      attachment.OwnerID,
		Height:       attachment.Height,
		Width:        attachment.Width,
		Filesize:     attachment.Filesize,
		CreatedAt:    attachment.CreatedAt.Unix(),
		UpdatedAt:    attachment.UpdatedAt.Unix(),
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
