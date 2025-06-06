package repositories

import (
	"context"

	"github.com/MikeT117/accord/backend/internal/domain/entities"
)

type ChannelUserRepository interface {
	GetByChannelID(context context.Context, channelID string) ([]*entities.User, error)
	GetByChannelIDs(context context.Context, channelIDs []string) (map[string][]*entities.User, error)
	Create(context context.Context, channelID string, userID string) error
	Delete(context context.Context, channelID string, userID string) error
}
