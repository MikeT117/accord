package interfaces

import (
	"context"

	"github.com/MikeT117/accord/backend/internal/application/command"
	"github.com/MikeT117/accord/backend/internal/application/query"
)

type GuildRoleService interface {
	GetByID(ctx context.Context, ID string) (*query.GuildRoleQueryResult, error)
	GetByGuildID(ctx context.Context, guildID string) (*query.GuildRoleQueryListResult, error)
	Create(ctx context.Context, createCommand *command.CreateGuildRoleCommand) error
	Update(ctx context.Context, updateCommand *command.UpdateGuildRoleCommand) error
	Delete(ctx context.Context, ID string) error
	CreateUserAssoc(ctx context.Context, roleID string, userID string) error
	DeleteUserAssoc(ctx context.Context, roleID string, userID string) error
	CreateChannelAssoc(ctx context.Context, roleID string, channelID string) error
	DeleteChannelAssoc(ctx context.Context, roleID string, channelID string) error
}
