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
	ChannelDeleted(ctx context.Context, ID string, guildID *string, roleIDs []string, userIDs []string) error

	RelationshipCreated(ctx context.Context, ID string) error
	RelationshipUpdated(ctx context.Context, ID string) error
	RelationshipDeleted(ctx context.Context, ID string, userIDs []string) error

	ChannelMessageCreated(ctx context.Context, ID string) error
	ChannelMessageUpdated(ctx context.Context, ID string) error
	ChannelMessageDeleted(ctx context.Context, ID string, channelID string) error
}
