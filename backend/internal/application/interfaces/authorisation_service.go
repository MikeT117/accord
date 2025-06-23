package interfaces

import "context"

type AuthorisationService interface {
	VerifyFriendRelationships(ctx context.Context, userID string, userIDs []string) error
	VerifyNotBlockedRelationships(ctx context.Context, userID string, userIDs []string) error
	VerifyChannelMember(ctx context.Context, channelID, userID string) error
	VerifyGuildMember(ctx context.Context, guildID, userID string) error
	VerifyUserGuildPermission(ctx context.Context, guildID string, userID string, permission int) error
	VerifyUserChannelPermission(ctx context.Context, channelID string, userID string, permission int) error
}
