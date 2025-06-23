package mapper

import (
	"github.com/MikeT117/accord/backend/internal/application/common"
	"github.com/MikeT117/accord/backend/internal/interface/api/REST/dto/response"
)

func ToChannelMessageAuthorResponse(user *common.UserResult, guildmember *common.GuildMemberResult) *response.ChannelMessageAuthor {
	if user == nil {
		return nil
	}

	author := &response.ChannelMessageAuthor{
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

func ToChannelMessageResponse(channelMessage *common.ChannelMessageResult) *response.ChannelMessageResponse {
	if channelMessage == nil {
		return nil
	}
	return &response.ChannelMessageResponse{
		ID:          channelMessage.ID,
		Content:     channelMessage.Content,
		Pinned:      channelMessage.Pinned,
		Flag:        channelMessage.Flag,
		ChannelID:   channelMessage.ChannelID,
		CreatedAt:   channelMessage.CreatedAt,
		UpdatedAt:   channelMessage.UpdatedAt,
		Attachments: ToAttachmentsResponse(channelMessage.Attachments),
		Author:      ToChannelMessageAuthorResponse(channelMessage.User, channelMessage.GuildMember),
	}
}

func ToChannelMessagesResponse(channelMessages []*common.ChannelMessageResult) []*response.ChannelMessageResponse {
	channelMessageResponses := make([]*response.ChannelMessageResponse, len(channelMessages))

	for i := 0; i < len(channelMessages); i++ {
		channelMessageResponses[i] = ToChannelMessageResponse(channelMessages[i])
	}

	return channelMessageResponses
}
