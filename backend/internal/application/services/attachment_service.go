package services

import (
	"context"

	"github.com/MikeT117/accord/backend/internal/application/command"
	"github.com/MikeT117/accord/backend/internal/application/interfaces"
	"github.com/MikeT117/accord/backend/internal/domain/entities"
	"github.com/MikeT117/accord/backend/internal/domain/repositories"
	"github.com/MikeT117/accord/backend/internal/infra/db"
)

type AttachmentService struct {
	transactor           *db.Transactor
	attachmentRepository repositories.AttachmentRepository
}

func CreateAttachmentService(transactor *db.Transactor, attachmentRepository repositories.AttachmentRepository) interfaces.AttachmentService {
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

	if err := s.attachmentRepository.Create(ctx, attachment); err != nil {
		return err
	}

	return nil
}
func (s *AttachmentService) Update(ctx context.Context, cmd *command.UpdateAttachmentCommand) error {
	attachment, err := s.attachmentRepository.GetByID(ctx, cmd.ID)
	if err != nil {
		return err
	}

	if err := attachment.UpdateStatus(cmd.Status); err != nil {
		return err
	}

	if err := s.attachmentRepository.Update(ctx, attachment); err != nil {
		return err
	}

	return nil

}
func (s *AttachmentService) Delete(ctx context.Context, ID string) error {
	if err := s.attachmentRepository.Delete(ctx, ID); err != nil {
		return err
	}

	return nil
}
