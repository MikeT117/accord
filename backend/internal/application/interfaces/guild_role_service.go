package interfaces

import (
	"context"

	"github.com/MikeT117/accord/backend/internal/application/command"
	"github.com/MikeT117/accord/backend/internal/application/query"
	"github.com/google/uuid"
)

type GuildRoleService interface {
	GetByGuildID(ctx context.Context, guildID uuid.UUID, requestorID uuid.UUID) (*query.GuildRoleQueryListResult, error)
	GetAssignedGuildMembersByRoleID(ctx context.Context, qry *query.GuildRoleMembersQuery) (*query.GuildMemberQueryListResult, error)
	GetUnassignedGuildMembersByRoleID(ctx context.Context, qry *query.GuildRoleMembersQuery) (*query.GuildMemberQueryListResult, error)
	Create(ctx context.Context, cmd *command.CreateGuildRoleCommand) error
	Update(ctx context.Context, cmd *command.UpdateGuildRoleCommand) error
	Delete(ctx context.Context, cmd *command.DeleteGuildRoleCommand) error
	CreateUserAssoc(ctx context.Context, cmd *command.CreateGuildRoleUserAssociationCommand) error
	DeleteUserAssoc(ctx context.Context, cmd *command.DeleteGuildRoleUserAssociationCommand) error
	CreateChannelAssoc(ctx context.Context, cmd *command.CreateGuildRoleChannelAssociationCommand) error
	DeleteChannelAssoc(ctx context.Context, cmd *command.DeleteGuildRoleChannelAssociationCommand) error
	SyncGuildChannelRoleAssociations(ctx context.Context, cmd *command.SyncGuildRoleChannelAssociationsCommand) error
}
