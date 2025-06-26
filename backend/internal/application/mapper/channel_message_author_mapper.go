package mapper

import (
	"github.com/MikeT117/accord/backend/internal/application/common"
	"github.com/MikeT117/accord/backend/internal/domain/entities"
)

func NewChannelMessageAuthorResultFromUserGuildMember(user *entities.User, guildmember *entities.GuildMember) *common.ChannelMessageAuthorResult {
	if user == nil {
		return nil
	}

	author := &common.ChannelMessageAuthorResult{
		ID:          user.ID,
		Username:    user.Username,
		PublicFlags: user.PublicFlags,
		DisplayName: user.DisplayName,
		Avatar:      user.AvatarID,
		Banner:      user.BannerID,
	}

	if guildmember != nil {
		if guildmember.AvatarID != nil {
			author.Avatar = guildmember.AvatarID
		}
		if guildmember.BannerID != nil {
			author.Banner = guildmember.BannerID
		}
		if guildmember.Nickname != nil {
			author.DisplayName = *guildmember.Nickname
		}
	}

	return author
}
