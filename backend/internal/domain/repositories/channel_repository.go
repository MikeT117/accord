package repositories

import (
	"context"

	"github.com/MikeT117/accord/backend/internal/domain/entities"
	"github.com/google/uuid"
)

type ChannelRepository interface {
	GetByID(ctx context.Context, ID uuid.UUID) (*entities.Channel, error)
	GetByIDAndGuildID(ctx context.Context, ID uuid.UUID, guildID uuid.UUID) (*entities.Channel, error)
	GetByIDAndGuildIDAndParentID(ctx context.Context, ID uuid.UUID, guildID uuid.UUID, parentID uuid.UUID) (*entities.Channel, error)
	GetByGuildID(ctx context.Context, guildID uuid.UUID) ([]*entities.Channel, []uuid.UUID, error)
	GetMapByGuildIDs(ctx context.Context, guildIDs []uuid.UUID) (map[uuid.UUID][]*entities.Channel, []uuid.UUID, error)
	GetByUserID(ctx context.Context, userID uuid.UUID) ([]*entities.Channel, []uuid.UUID, error)

	Create(ctx context.Context, channel *entities.Channel) error
	Update(ctx context.Context, channel *entities.Channel) error
	Delete(ctx context.Context, ID uuid.UUID) error

	GetUsersByChannelID(ctx context.Context, channelID uuid.UUID) ([]*entities.User, error)
	GetUserIDsByChannelID(ctx context.Context, channelID uuid.UUID) ([]uuid.UUID, error)
	GetMapUsersByChannelIDs(ctx context.Context, channelIDs []uuid.UUID) (map[uuid.UUID][]*entities.User, error)
	VerifyUserChannelMembership(ctx context.Context, userID uuid.UUID, channelID uuid.UUID) error
	AssociateUser(ctx context.Context, channelID uuid.UUID, userID uuid.UUID) error
	DisassociateUser(ctx context.Context, channelID uuid.UUID, userID uuid.UUID) error

	GetIDsSyncedWithParentByParentID(ctx context.Context, parentID uuid.UUID) ([]uuid.UUID, error)
}
