package interfaces

import (
	"context"

	"github.com/google/uuid"
)

type AuthorisationService interface {
	VerifyRelationships(ctx context.Context, requestorID uuid.UUID, userIDs []uuid.UUID, isBlocked bool, isFriend bool, isPending bool) error
	VerifyRelationship(ctx context.Context, requestorID uuid.UUID, userID uuid.UUID, isBlocked bool, isFriend bool, isPending bool) error
	VerifyGuildMember(ctx context.Context, guildID uuid.UUID, requestorID uuid.UUID) error
	VerifyUserGuildPermission(ctx context.Context, guildID uuid.UUID, requestorID uuid.UUID, permission int) error
	VerifyPrivateChannelMember(ctx context.Context, channelID uuid.UUID, requestorID uuid.UUID) error
	VerifyGuildChannelPermission(ctx context.Context, channelID uuid.UUID, requestorID uuid.UUID, permissionOffset int) error
}
