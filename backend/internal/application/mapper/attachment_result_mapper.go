package mapper

import (
	"github.com/MikeT117/accord/backend/internal/application/common"
	"github.com/MikeT117/accord/backend/internal/domain/entities"
	pb "github.com/MikeT117/accord/backend/internal/infra/pb/gen"
	"google.golang.org/protobuf/types/known/timestamppb"
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

func NewAttachmentProtoResultFromAttachment(attachment *entities.Attachment) *pb.Attachment {
	if attachment == nil {
		return nil
	}

	var status int32 = int32(attachment.Status)
	return &pb.Attachment{
		Id:           &attachment.ID,
		ResourceType: &attachment.ResourceType,
		OwnerId:      &attachment.OwnerID,
		Height:       attachment.Height,
		Width:        attachment.Width,
		Filesize:     &attachment.Filesize,
		CreatedAt:    timestamppb.New(attachment.CreatedAt),
		UpdatedAt:    timestamppb.New(attachment.UpdatedAt),
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
