package mapper

import (
	"github.com/MikeT117/accord/backend/internal/application/common"
	"github.com/MikeT117/accord/backend/internal/domain/entities"
)

func NewAttachmentResultFromAttachment(attachment *entities.Attachment) *common.AttachmentResult {

	if attachment == nil {
		return nil
	}

	return &common.AttachmentResult{
		ID:           attachment.ID,
		ResourceType: attachment.ResourceType,
		OwnerID:      attachment.OwnerID,
		Height:       attachment.Height,
		Width:        attachment.Width,
		Filesize:     attachment.Filesize,
		CreatedAt:    attachment.CreatedAt,
		UpdatedAt:    attachment.UpdatedAt,
	}
}

func NewAttachmentListResultFromAttachments(attachments []*entities.Attachment) []*common.AttachmentResult {
	attachmentsResults := make([]*common.AttachmentResult, len(attachments))

	for i := 0; i < len(attachmentsResults); i++ {
		attachmentsResults[i] = NewAttachmentResultFromAttachment(attachments[i])
	}

	return attachmentsResults
}
