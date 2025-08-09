package repositories

import (
	"context"

	"github.com/MikeT117/accord/backend/internal/domain/entities"
)

type GuildRoleRepository interface {
	GetByID(ctx context.Context, ID string) (*entities.GuildRole, error)
	GetByIDs(ctx context.Context, roleIDs []string, guildID string) ([]*entities.GuildRole, error)
	GetByGuildID(ctx context.Context, guildID string) ([]*entities.GuildRole, []string, error)
	GetMapByGuildIDs(ctx context.Context, guildIDs []string) (map[string][]*entities.GuildRole, []string, error)
	GetByNameAndGuildID(ctx context.Context, name string, guildID string) (*entities.GuildRole, error)

	GetDefaultGuildRoleIDByGuildID(ctx context.Context, guildID string) (string, error)

	Create(ctx context.Context, validatedGuild *entities.GuildRole) error
	Update(ctx context.Context, validatedGuild *entities.GuildRole) error
	Delete(ctx context.Context, ID string) error

	AssociateUser(ctx context.Context, roleID string, userID string) error
	BulkAssociateUser(ctx context.Context, roleID string, userIDs []string) error
	DisassociateUser(ctx context.Context, roleID string, userID string) error
	GetMapRoleIDsByUserIDs(ctx context.Context, userIDs []string) (map[string][]string, error)
	GetRoleIDsByUserID(ctx context.Context, userID string) ([]string, error)
	GetRoleIDsByUserIDAndGuildID(ctx context.Context, userID string, guildID string) ([]string, error)

	AssociateChannel(ctx context.Context, roleID string, userID string) error
	DisassociateChannel(ctx context.Context, roleID string, userID string) error
	GetMapRoleIDsByChannelIDs(ctx context.Context, channelIDs []string) (map[string][]string, error)
	GetRoleIDsByChannelID(ctx context.Context, channelID string) ([]string, error)

	GetChannelPermissions(ctx context.Context, channelID string, userID string) (int32, error)
	GetGuildPermissions(ctx context.Context, guildID string, userID string) (int32, error)

	BulkRoleAssociateChannel(ctx context.Context, channelID string, roleIDs []string) error
	BulkChannelAssociateRole(ctx context.Context, roleID string, channelIDs []string) error
	WipeChannelAssociations(ctx context.Context, channelID string) error
	BulkChannelDisassociateRole(ctx context.Context, roleID string, channelIDs []string) error
}
