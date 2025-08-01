package interfaces

import "context"

type EventService interface {
	GuildCreated(ctx context.Context, ID string) error
	GuildUpdated(ctx context.Context, ID string) error
	GuildDeleted(ctx context.Context, ID string, roleID string) error

	GuildRoleCreated(ctx context.Context, ID string) error
	GuildRoleUpdated(ctx context.Context, ID string) error
	GuildRoleDeleted(ctx context.Context, ID string, guildID string) error

	ChannelCreated(ctx context.Context, ID string) error
	ChannelUpdated(ctx context.Context, ID string) error
	ChannelDeleted(ctx context.Context, ID string, guildID *string, userIDs []string) error

	RelationshipCreated(ctx context.Context, ID string) error
	RelationshipUpdated(ctx context.Context, ID string) error
	RelationshipDeleted(ctx context.Context, ID string, userIDs []string) error

	ChannelMessageCreated(ctx context.Context, ID string) error
	ChannelMessageUpdated(ctx context.Context, ID string) error
	ChannelMessageDeleted(ctx context.Context, ID string, channelID string) error

	InvalidateToken(ctx context.Context, userID string, token string) error

	UserRoleAssociated(ctx context.Context, userID string, roleID string) error
	UserRoleDisassociated(ctx context.Context, userID string, roleID string) error

	ChannelRoleAssociated(ctx context.Context, ID string, guildID string, roleID string) error
	ChannelRoleDisassociated(ctx context.Context, ID string, guildID string, roleID string) error

	ChannelRolesSet(ctx context.Context, ID string, guildID string, roleIDs []string) error

	UserUpdated(ctx context.Context, ID string) error
}
