package interfaces

import (
	"context"

	"github.com/google/uuid"
)

type EventService interface {
	GuildCreated(ctx context.Context, ID uuid.UUID) error
	GuildUpdated(ctx context.Context, ID uuid.UUID) error
	GuildDeleted(ctx context.Context, ID uuid.UUID, roleID uuid.UUID) error

	GuildRoleCreated(ctx context.Context, ID uuid.UUID) error
	GuildRoleUpdated(ctx context.Context, ID uuid.UUID) error
	GuildRoleDeleted(ctx context.Context, ID uuid.UUID, guildID uuid.UUID) error

	ChannelCreated(ctx context.Context, ID uuid.UUID) error
	ChannelUpdated(ctx context.Context, ID uuid.UUID) error
	ChannelDeleted(ctx context.Context, ID uuid.UUID, guildID *uuid.UUID, userIDs []uuid.UUID) error

	RelationshipCreated(ctx context.Context, ID uuid.UUID) error
	RelationshipUpdated(ctx context.Context, ID uuid.UUID) error
	RelationshipDeleted(ctx context.Context, ID uuid.UUID, userIDs []uuid.UUID) error

	ChannelMessageCreated(ctx context.Context, ID uuid.UUID) error
	ChannelMessageUpdated(ctx context.Context, ID uuid.UUID) error
	ChannelMessageDeleted(ctx context.Context, ID uuid.UUID, channelID uuid.UUID) error

	InvalidateToken(ctx context.Context, userID uuid.UUID, token string) error

	UserRoleAssociated(ctx context.Context, userID uuid.UUID, roleID uuid.UUID) error
	UserRoleDisassociated(ctx context.Context, userID uuid.UUID, roleID uuid.UUID) error

	ChannelRoleAssociated(ctx context.Context, ID uuid.UUID, guildID uuid.UUID, roleID uuid.UUID) error
	ChannelRoleDisassociated(ctx context.Context, ID uuid.UUID, guildID uuid.UUID, roleID uuid.UUID) error

	ChannelRolesSet(ctx context.Context, ID uuid.UUID, guildID uuid.UUID, roleIDs []uuid.UUID) error

	UserUpdated(ctx context.Context, ID uuid.UUID) error
}
