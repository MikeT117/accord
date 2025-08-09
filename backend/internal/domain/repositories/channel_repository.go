package repositories

import (
	"context"

	"github.com/MikeT117/accord/backend/internal/domain/entities"
)

type ChannelRepository interface {
	GetByID(ctx context.Context, ID string) (*entities.Channel, error)
	GetByIDAndGuildID(ctx context.Context, ID string, guildID string) (*entities.Channel, error)
	GetByIDAndGuildIDAndParentID(ctx context.Context, ID string, guildID string, parentID string) (*entities.Channel, error)
	GetByGuildID(ctx context.Context, guildID string) ([]*entities.Channel, []string, error)
	GetMapByGuildIDs(ctx context.Context, guildIDs []string) (map[string][]*entities.Channel, []string, error)
	GetByUserID(ctx context.Context, userID string) ([]*entities.Channel, []string, error)

	Create(ctx context.Context, validatedChannel *entities.Channel) error
	Update(ctx context.Context, validatedChannel *entities.Channel) error
	Delete(ctx context.Context, ID string) error

	GetUsersByChannelID(ctx context.Context, channelID string) ([]*entities.User, error)
	GetUserIDsByChannelID(ctx context.Context, channelID string) ([]string, error)
	GetMapUsersByChannelIDs(ctx context.Context, channelIDs []string) (map[string][]*entities.User, error)
	VerifyUserChannelMembership(ctx context.Context, userID string, channelID string) error
	AssociateUser(ctx context.Context, channelID string, userID string) error
	DisassociateUser(ctx context.Context, channelID string, userID string) error

	GetIDsSyncedWithParentByParentID(ctx context.Context, parentID string) ([]string, error)
}
