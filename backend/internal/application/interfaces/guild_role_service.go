package interfaces

import (
	"context"

	"github.com/MikeT117/accord/backend/internal/application/command"
	"github.com/MikeT117/accord/backend/internal/application/query"
)

type GuildRoleService interface {
	GetByGuildID(ctx context.Context, guildID string, requestorID string) (*query.GuildRoleQueryListResult, error)
	Create(ctx context.Context, cmd *command.CreateGuildRoleCommand) error
	Update(ctx context.Context, cmd *command.UpdateGuildRoleCommand) error
	Delete(ctx context.Context, cmd *command.DeleteGuildRoleCommand) error
	CreateUserAssoc(ctx context.Context, cmd *command.CreateGuildRoleUserAssociationCommand) error
	DeleteUserAssoc(ctx context.Context, cmd *command.DeleteGuildRoleUserAssociationCommand) error
	CreateChannelAssoc(ctx context.Context, cmd *command.CreateGuildRoleChannelAssociationCommand) error
	DeleteChannelAssoc(ctx context.Context, cmd *command.DeleteGuildRoleChannelAssociationCommand) error
	SyncGuildChannelRoleAssociations(ctx context.Context, cmd *command.SyncGuildRoleChannelAssociationsCommand) error
}
