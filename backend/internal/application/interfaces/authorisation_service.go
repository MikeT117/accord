package interfaces

import "context"

type AuthorisationService interface {
	VerifyRelationships(ctx context.Context, requestorID string, userIDs []string, isBlocked bool, isFriend bool, isPending bool) error
	VerifyRelationship(ctx context.Context, requestorID string, userID string, isBlocked bool, isFriend bool, isPending bool) error
	VerifyGuildMember(ctx context.Context, guildID, requestorID string) error
	VerifyUserGuildPermission(ctx context.Context, guildID string, requestorID string, permission int) error
	VerifyPrivateChannelMember(ctx context.Context, channelID, requestorID string) error
	VerifyGuildChannelPermission(ctx context.Context, channelID string, requestorID string, permissionOffset int) error
}
