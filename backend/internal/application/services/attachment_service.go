package services

import (
	"context"

	"github.com/MikeT117/accord/backend/internal/application/command"
	"github.com/MikeT117/accord/backend/internal/application/interfaces"
	"github.com/MikeT117/accord/backend/internal/domain/entities"
	"github.com/MikeT117/accord/backend/internal/infra/db"
)

type AttachmentService struct {
	transactor           *db.Transactor
	attachmentRepository *db.AttachmentRepository
}

func CreateAttachmentService(transactor *db.Transactor, attachmentRepository *db.AttachmentRepository) interfaces.AttachmentService {
	return &AttachmentService{
		transactor:           transactor,
		attachmentRepository: attachmentRepository,
	}
}

func (s *AttachmentService) Create(ctx context.Context, cmd *command.CreateAttachmentCommand) error {
	attachment, err := entities.NewAttachment(cmd.ResourceType, cmd.OwnerID, cmd.Height, cmd.Width, cmd.Filesize)
	if err != nil {
		return err
	}

	return s.attachmentRepository.Create(ctx, attachment)
}
func (s *AttachmentService) Update(ctx context.Context, cmd *command.UpdateAttachmentCommand) error {
	attachment, err := s.attachmentRepository.GetByID(ctx, cmd.ID)
	if err != nil {
		return err
	}

	attachment.UpdateStatus(cmd.Status)
	return s.attachmentRepository.Update(ctx, attachment)

}
func (s *AttachmentService) Delete(ctx context.Context, ID string) error {
	return s.attachmentRepository.Delete(ctx, ID)
}
