package mapper

import (
	"github.com/MikeT117/accord/backend/internal/application/common"
	"github.com/MikeT117/accord/backend/internal/domain/entities"
	pb "github.com/MikeT117/accord/backend/internal/infra/pb/gen"
	pointer "github.com/MikeT117/accord/backend/internal/ptr"
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

	if guildmember == nil {
		return author
	}

	if guildmember.AvatarID != nil {
		author.Avatar = guildmember.AvatarID
	}
	if guildmember.BannerID != nil {
		author.Banner = guildmember.BannerID
	}
	if guildmember.Nickname != nil {
		author.DisplayName = *guildmember.Nickname
	}

	return author
}

func NewChannelMessageAuthorProtoResultFromUserGuildMember(user *entities.User, guildmember *entities.GuildMember) *pb.User {
	if user == nil {
		return nil
	}

	var publicFlags int32 = int32(user.PublicFlags)
	author := &pb.User{
		Id:          pointer.UUIDToStringPtr(user.ID),
		Username:    &user.Username,
		PublicFlags: &publicFlags,
		DisplayName: &user.DisplayName,
		Avatar:      pointer.UUIDPtrToStringPtr(user.AvatarID),
		Banner:      pointer.UUIDPtrToStringPtr(user.BannerID),
	}

	if guildmember == nil {
		return author
	}

	if guildmember.AvatarID != nil {
		author.Avatar = pointer.UUIDPtrToStringPtr(guildmember.AvatarID)
	}

	if guildmember.BannerID != nil {
		author.Banner = pointer.UUIDPtrToStringPtr(guildmember.BannerID)
	}

	if guildmember.Nickname != nil {
		author.DisplayName = guildmember.Nickname
	}

	return author
}
