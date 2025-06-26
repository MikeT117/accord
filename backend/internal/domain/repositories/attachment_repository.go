package repositories

import (
	"context"

	"github.com/MikeT117/accord/backend/internal/domain/entities"
)

type AttachmentRepository interface {
	GetMapByIDs(ctx context.Context, IDs []string) (map[string]*entities.Attachment, error)
	GetByIDs(ctx context.Context, IDs []string) ([]*entities.Attachment, error)
	GetByID(ctx context.Context, ID string) (*entities.Attachment, error)
	GetByAssociatedChannelMessageID(ctx context.Context, ID string) ([]*entities.Attachment, error)
	GetMapByAssociatedChannelMessageIDs(ctx context.Context, IDs []string) (map[string][]*entities.Attachment, error)
	Create(ctx context.Context, validatedAttachment *entities.Attachment) error
	Update(ctx context.Context, attachment *entities.Attachment) error
	Delete(ctx context.Context, ID string, userID string) error
}
