package repositories

import (
	"context"

	"github.com/MikeT117/accord/backend/internal/domain/entities"
)

type ChannelMessageRepository interface {
	GetByID(ctx context.Context, ID string) (*entities.ChannelMessage, error)
	GetByAuthorID(ctx context.Context, authorID string, before int64, limit int) ([]*entities.ChannelMessage, error)
	GetByChannelID(ctx context.Context, channelID string, before int64, limit int) ([]*entities.ChannelMessage, []string, []string, error)
	Create(ctx context.Context, validatedChannelMessage *entities.ChannelMessage) error
	Update(ctx context.Context, validatedChannelMessage *entities.ChannelMessage) error
	Delete(ctx context.Context, ID string) error

	AssociateAttachment(ctx context.Context, channelMessageID string, attachmentID string) error
	DisassociateAttachment(ctx context.Context, channelMessageID string, attachmentID string) error
}
