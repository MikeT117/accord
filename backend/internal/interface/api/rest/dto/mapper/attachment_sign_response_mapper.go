package mapper

import (
	"github.com/MikeT117/accord/backend/internal/application/common"
	"github.com/MikeT117/accord/backend/internal/interface/api/rest/dto/response"
)

func ToAttachmentSignResponse(attachmentSign *common.AttachmentSignResult) *response.AttachmentSignResponse {
	if attachmentSign == nil {
		return nil
	}
	return &response.AttachmentSignResponse{
		ID:        attachmentSign.ID,
		Signature: attachmentSign.Signature,
		Timestamp: attachmentSign.CreatedAt.Unix(),
	}
}
