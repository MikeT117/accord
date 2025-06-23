package interfaces

import (
	"context"

	"github.com/MikeT117/accord/backend/internal/application/command"
	"github.com/MikeT117/accord/backend/internal/application/query"
)

type GuildRoleService interface {
	GetByGuildID(ctx context.Context, guildID string, requestorID string) (*query.GuildRoleQueryListResult, error)
	Create(ctx context.Context, cmd *command.CreateGuildRoleCommand, requestorID string) error
	Update(ctx context.Context, cmd *command.UpdateGuildRoleCommand, requestorID string) error
	Delete(ctx context.Context, ID string, requestorID string) error
	CreateUserAssoc(ctx context.Context, roleID string, userID string, guildID string, requestorID string) error
	DeleteUserAssoc(ctx context.Context, roleID string, userID string, guildID string, requestorID string) error
	CreateChannelAssoc(ctx context.Context, roleID string, channelID string, guildID string, requestorID string) error
	DeleteChannelAssoc(ctx context.Context, roleID string, channelID string, guildID string, requestorID string) error
}
