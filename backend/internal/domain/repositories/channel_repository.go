package repositories

import (
	"context"

	"github.com/MikeT117/accord/backend/internal/domain/entities"
)

type ChannelRepository interface {
	GetByID(context context.Context, ID string) (*entities.Channel, error)
	GetByGuildID(context context.Context, guildID string) ([]*entities.Channel, []string, error)
	GetByGuildIDs(context context.Context, guildIDs []string) (map[string][]*entities.Channel, []string, error)
	GetByUserID(context context.Context, userID string) ([]*entities.Channel, []string, error)
	Create(context context.Context, validatedChannel *entities.ValidatedChannel) (*entities.Channel, error)
	Update(context context.Context, validatedChannel *entities.ValidatedChannel) (*entities.Channel, error)
	Delete(context context.Context, ID string) error
}
