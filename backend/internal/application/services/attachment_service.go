package services

import (
	"context"

	"github.com/MikeT117/accord/backend/internal/application/command"
	"github.com/MikeT117/accord/backend/internal/application/interfaces"
	"github.com/MikeT117/accord/backend/internal/application/mapper"
	"github.com/MikeT117/accord/backend/internal/domain/entities"
	"github.com/MikeT117/accord/backend/internal/domain/repositories"
	"github.com/MikeT117/accord/backend/internal/infra/cloudinary"
	"github.com/MikeT117/accord/backend/internal/infra/db"
)

type AttachmentService struct {
	transactor           *db.Transactor
	cloudinaryUpload     *cloudinary.CloudinaryUpload
	attachmentRepository repositories.AttachmentRepository
}

func CreateAttachmentService(transactor *db.Transactor, cloudinaryUpload *cloudinary.CloudinaryUpload, attachmentRepository repositories.AttachmentRepository) interfaces.AttachmentService {
	return &AttachmentService{
		transactor:           transactor,
		cloudinaryUpload:     cloudinaryUpload,
		attachmentRepository: attachmentRepository,
	}
}

func (s *AttachmentService) Create(ctx context.Context, cmd *command.CreateAttachmentCommand) (*command.CreateAttachmentCommandResult, error) {
	attachment, err := entities.NewAttachment(cmd.Filename, cmd.ResourceType, cmd.OwnerID, cmd.Filesize)
	if err != nil {
		return nil, err
	}

	if err := s.attachmentRepository.Create(ctx, attachment); err != nil {
		return nil, err
	}

	return &command.CreateAttachmentCommandResult{
		Result: mapper.NewAttachmentSignResultFromAttachment(
			attachment,
			s.cloudinaryUpload.SignAttachment(attachment.ID, attachment.CreatedAt.Unix()),
		),
	}, nil
}

func (s *AttachmentService) Update(ctx context.Context, cmd *command.UpdateAttachmentCommand) error {
	attachment, err := s.attachmentRepository.GetByID(ctx, cmd.ID)
	if err != nil {
		return err
	}

	if err := attachment.UpdateStatus(cmd.Status); err != nil {
		return err
	}

	if err := attachment.UpdateDimensions(cmd.Height, cmd.Width); err != nil {
		return err
	}

	if err := s.attachmentRepository.Update(ctx, attachment); err != nil {
		return err
	}

	return nil
}

func (s *AttachmentService) Delete(ctx context.Context, cmd *command.DeleteAttachmentCommand) error {
	if err := s.attachmentRepository.Delete(ctx, cmd.ID, cmd.RequestorID); err != nil {
		return err
	}

	return nil
}
