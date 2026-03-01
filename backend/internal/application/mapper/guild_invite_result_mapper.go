package mapper

import (
	"github.com/MikeT117/accord/backend/internal/application/common"
	"github.com/MikeT117/accord/backend/internal/domain/entities"
	"github.com/google/uuid"
)

func NewGuildInviteResultFromGuildInvite(guildInvite *entities.GuildInvite, user *entities.User, guildMember *entities.GuildMember) *common.GuildInviteResult {
	guildInviteResult := &common.GuildInviteResult{
		ID:          guildInvite.ID,
		CreatorID:   guildInvite.CreatorID,
		UsedCount:   guildInvite.UsedCount,
		CreatedAt:   guildInvite.CreatedAt,
		UpdatedAt:   guildInvite.UpdatedAt,
		ExpiresAt:   guildInvite.ExpiresAt,
		Username:    user.Username,
		DisplayName: user.DisplayName,
		Avatar:      user.AvatarID,
	}

	if guildMember.AvatarID != nil {
		guildInviteResult.Avatar = guildMember.AvatarID
	}

	if guildMember.Nickname != nil {
		guildInviteResult.DisplayName = *guildMember.Nickname
	}

	return guildInviteResult
}

func NewGuildInviteListResultFromGuildInvite(guildInvites []*entities.GuildInvite, users map[uuid.UUID]*entities.User, guildmembers map[uuid.UUID]*entities.GuildMember) []*common.GuildInviteResult {

	guildInvitesResult := make([]*common.GuildInviteResult, len(guildInvites))

	for i := 0; i < len(guildInvites); i++ {
		guildInvitesResult[i] = NewGuildInviteResultFromGuildInvite(guildInvites[i], users[guildInvites[i].CreatorID], guildmembers[guildInvites[i].CreatorID])
	}

	return guildInvitesResult
}
