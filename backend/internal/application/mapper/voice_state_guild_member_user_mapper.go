package mapper

import (
	"github.com/MikeT117/accord/backend/internal/application/common"
	"github.com/MikeT117/accord/backend/internal/domain/entities"
	pb "github.com/MikeT117/accord/backend/internal/infra/pb/gen"
	pointer "github.com/MikeT117/accord/backend/internal/ptr"
)

func NewVoiceStateGuildMemberUserResultFromUserGuildMember(user *entities.User, guildmember *entities.GuildMember) *common.VoiceStateUserResult {
	if user == nil {
		return nil
	}

	voiceStateUser := &common.VoiceStateUserResult{
		ID:          user.ID,
		Username:    user.Username,
		PublicFlags: user.PublicFlags,
		DisplayName: user.DisplayName,
		Avatar:      user.AvatarID,
		Banner:      user.BannerID,
	}

	if guildmember == nil {
		return voiceStateUser
	}

	if guildmember.AvatarID != nil {
		voiceStateUser.Avatar = guildmember.AvatarID
	}
	if guildmember.BannerID != nil {
		voiceStateUser.Banner = guildmember.BannerID
	}
	if guildmember.Nickname != nil {
		voiceStateUser.DisplayName = *guildmember.Nickname
	}

	return voiceStateUser
}

func NewVoiceStateGuildMemberUserProtoResultFromUserGuildMember(user *entities.User, guildmember *entities.GuildMember) *pb.User {
	if user == nil {
		return nil
	}

	var publicFlags int32 = int32(user.PublicFlags)
	voiceStateUser := &pb.User{
		Id:          pointer.UUIDToStringPtr(user.ID),
		Username:    &user.Username,
		PublicFlags: &publicFlags,
		DisplayName: &user.DisplayName,
		Avatar:      pointer.UUIDPtrToStringPtr(user.AvatarID),
		Banner:      pointer.UUIDPtrToStringPtr(user.BannerID),
	}

	if guildmember == nil {
		return voiceStateUser
	}

	if guildmember.AvatarID != nil {
		voiceStateUser.Avatar = pointer.UUIDPtrToStringPtr(guildmember.AvatarID)
	}

	if guildmember.BannerID != nil {
		voiceStateUser.Banner = pointer.UUIDPtrToStringPtr(guildmember.BannerID)
	}

	if guildmember.Nickname != nil {
		voiceStateUser.DisplayName = guildmember.Nickname
	}

	return voiceStateUser
}
