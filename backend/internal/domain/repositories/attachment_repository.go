package repositories

import (
	"context"

	"github.com/MikeT117/accord/backend/internal/domain/entities"
)

type AttachmentRepository interface {
	GetByIDs(context context.Context, IDs []string) (map[string]*entities.Attachment, error)
	GetByID(context context.Context, ID string) (*entities.Attachment, error)
	Create(context context.Context, validatedAttachment *entities.ValidatedAttachment) (*entities.Attachment, error)
}
