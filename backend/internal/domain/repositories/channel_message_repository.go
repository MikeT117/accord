package repositories

import (
	"context"
	"time"

	"github.com/MikeT117/accord/backend/internal/domain/entities"
	"github.com/google/uuid"
)

type ChannelMessageRepository interface {
	GetByID(ctx context.Context, ID uuid.UUID) (*entities.ChannelMessage, error)
	GetByAuthorID(ctx context.Context, authorID uuid.UUID, before time.Time, limit int) ([]*entities.ChannelMessage, error)
	GetByChannelID(ctx context.Context, channelID uuid.UUID, pinned bool, before time.Time, after time.Time, limit int) ([]*entities.ChannelMessage, []uuid.UUID, []uuid.UUID, error)
	Create(ctx context.Context, validatedChannelMessage *entities.ChannelMessage) error
	Update(ctx context.Context, validatedChannelMessage *entities.ChannelMessage) error
	Delete(ctx context.Context, ID uuid.UUID) error
	AssociateAttachment(ctx context.Context, channelMessageID uuid.UUID, attachmentID uuid.UUID) error
	DisassociateAttachment(ctx context.Context, channelMessageID uuid.UUID, attachmentID uuid.UUID) error
}
