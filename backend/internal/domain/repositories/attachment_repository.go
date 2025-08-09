package repositories

import (
	"context"

	"github.com/MikeT117/accord/backend/internal/domain/entities"
	"github.com/google/uuid"
)

type AttachmentRepository interface {
	GetMapByIDs(ctx context.Context, IDs []uuid.UUID) (map[uuid.UUID]*entities.Attachment, error)
	GetByIDs(ctx context.Context, IDs []uuid.UUID) ([]*entities.Attachment, error)
	GetByID(ctx context.Context, ID uuid.UUID) (*entities.Attachment, error)
	GetByAssociatedChannelMessageID(ctx context.Context, ID uuid.UUID) ([]*entities.Attachment, error)
	GetMapByAssociatedChannelMessageIDs(ctx context.Context, IDs []uuid.UUID) (map[uuid.UUID][]*entities.Attachment, error)
	Create(ctx context.Context, validatedAttachment *entities.Attachment) error
	Update(ctx context.Context, attachment *entities.Attachment) error
	Delete(ctx context.Context, ID uuid.UUID, userID uuid.UUID) error
}
