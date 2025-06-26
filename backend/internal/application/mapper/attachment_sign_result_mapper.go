package mapper

import (
	"github.com/MikeT117/accord/backend/internal/application/common"
	"github.com/MikeT117/accord/backend/internal/domain/entities"
)

func NewAttachmentSignResultFromAttachment(attachment *entities.Attachment, signature string) *common.AttachmentSignResult {
	if attachment == nil {
		return nil
	}

	return &common.AttachmentSignResult{
		ID:        attachment.ID,
		Signature: signature,
	}
}
