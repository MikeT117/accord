package repositories

import (
	"context"

	"github.com/MikeT117/accord/backend/internal/domain/entities"
	"github.com/google/uuid"
)

type GuildRoleRepository interface {
	GetByID(ctx context.Context, ID uuid.UUID) (*entities.GuildRole, error)
	GetByIDs(ctx context.Context, roleIDs []uuid.UUID, guildID uuid.UUID) ([]*entities.GuildRole, error)
	GetByGuildID(ctx context.Context, guildID uuid.UUID) ([]*entities.GuildRole, []uuid.UUID, error)
	GetMapByGuildIDs(ctx context.Context, guildIDs []uuid.UUID) (map[uuid.UUID][]*entities.GuildRole, []uuid.UUID, error)
	GetByNameAndGuildID(ctx context.Context, name string, guildID uuid.UUID) (*entities.GuildRole, error)

	GetDefaultGuildRoleIDByGuildID(ctx context.Context, guildID uuid.UUID) (uuid.UUID, error)

	Create(ctx context.Context, validatedGuild *entities.GuildRole) error
	Update(ctx context.Context, validatedGuild *entities.GuildRole) error
	Delete(ctx context.Context, ID uuid.UUID) error

	AssociateUser(ctx context.Context, roleID uuid.UUID, userID uuid.UUID) error
	BulkAssociateUser(ctx context.Context, roleID uuid.UUID, userIDs []uuid.UUID) error
	DisassociateUser(ctx context.Context, roleID uuid.UUID, userID uuid.UUID) error
	GetMapRoleIDsByUserIDs(ctx context.Context, userIDs []uuid.UUID) (map[uuid.UUID][]uuid.UUID, error)
	GetRoleIDsByUserID(ctx context.Context, userID uuid.UUID) ([]uuid.UUID, error)
	GetRoleIDsByUserIDAndGuildID(ctx context.Context, userID uuid.UUID, guildID uuid.UUID) ([]uuid.UUID, error)

	AssociateChannel(ctx context.Context, roleID uuid.UUID, userID uuid.UUID) error
	DisassociateChannel(ctx context.Context, roleID uuid.UUID, userID uuid.UUID) error
	GetMapRoleIDsByChannelIDs(ctx context.Context, channelIDs []uuid.UUID) (map[uuid.UUID][]uuid.UUID, error)
	GetRoleIDsByChannelID(ctx context.Context, channelID uuid.UUID) ([]uuid.UUID, error)

	GetChannelPermissions(ctx context.Context, channelID uuid.UUID, userID uuid.UUID) (int32, error)
	GetGuildPermissions(ctx context.Context, guildID uuid.UUID, userID uuid.UUID) (int32, error)

	BulkRoleAssociateChannel(ctx context.Context, channelID uuid.UUID, roleIDs []uuid.UUID) error
	BulkChannelAssociateRole(ctx context.Context, roleID uuid.UUID, channelIDs []uuid.UUID) error
	WipeChannelAssociations(ctx context.Context, channelID uuid.UUID) error
	BulkChannelDisassociateRole(ctx context.Context, roleID uuid.UUID, channelIDs []uuid.UUID) error
}
