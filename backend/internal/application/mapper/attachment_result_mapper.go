package mapper

import (
	"github.com/MikeT117/accord/backend/internal/application/common"
	"github.com/MikeT117/accord/backend/internal/domain/entities"
	pb "github.com/MikeT117/accord/backend/internal/infra/pb/gen"
)

func NewAttachmentResultFromAttachment(attachment *entities.Attachment) *common.AttachmentResult {

	if attachment == nil {
		return nil
	}

	return &common.AttachmentResult{
		ID:           attachment.ID,
		Filename:     attachment.Filename,
		ResourceType: attachment.ResourceType,
		Height:       attachment.Height,
		Width:        attachment.Width,
		OwnerID:      attachment.OwnerID,
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

func NewAttachmentProtoResultFromAttachment(attachment *entities.Attachment) *pb.Attachment {
	if attachment == nil {
		return nil
	}

	var status int32 = int32(attachment.Status)
	createdAt := attachment.CreatedAt.Unix()
	updatedAt := attachment.UpdatedAt.Unix()
	return &pb.Attachment{
		Id:           &attachment.ID,
		Filename:     &attachment.Filename,
		ResourceType: &attachment.ResourceType,
		Height:       attachment.Height,
		Width:        attachment.Width,
		OwnerId:      &attachment.OwnerID,
		Filesize:     &attachment.Filesize,
		CreatedAt:    &createdAt,
		UpdatedAt:    &updatedAt,
		Status:       &status,
	}
}

func NewAttachmentListProtoResultFromAttachments(attachments []*entities.Attachment) []*pb.Attachment {
	attachmentsResults := make([]*pb.Attachment, len(attachments))

	for i := 0; i < len(attachmentsResults); i++ {
		attachmentsResults[i] = NewAttachmentProtoResultFromAttachment(attachments[i])
	}

	return attachmentsResults
}
