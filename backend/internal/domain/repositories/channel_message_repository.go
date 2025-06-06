package repositories

import (
	"context"

	"github.com/MikeT117/accord/backend/internal/domain/entities"
)

type ChannelMessageRepository interface {
	GetByID(context context.Context, ID string) (*entities.ChannelMessage, error)
	GetByAuthorID(context context.Context, authorID string, before int64, limit int) ([]*entities.ChannelMessage, error)
	GetByChannelID(context context.Context, channelID string, before int64, limit int) ([]*entities.ChannelMessage, error)
	Create(context context.Context, validatedChannelMessage *entities.ValidatedChannelMessage) (*entities.ChannelMessage, error)
	Update(context context.Context, validatedChannelMessage *entities.ValidatedChannelMessage) (*entities.ChannelMessage, error)
	Delete(context context.Context, ID string) error
}
