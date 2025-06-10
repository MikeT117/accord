package mapper

import (
	"github.com/MikeT117/accord/backend/internal/application/common"
	"github.com/MikeT117/accord/backend/internal/domain/entities"
)

func NewGuildChannelMessageResultFromChannelMessage(channelMessage *entities.ChannelMessage, user *entities.User, guildMember *entities.GuildMember, attachments []*entities.Attachment) *common.ChannelMessageResult {

	return &common.ChannelMessageResult{
		ID:          channelMessage.ID,
		Content:     channelMessage.Content,
		Pinned:      channelMessage.Pinned,
		Flag:        channelMessage.Flag,
		AuthorID:    channelMessage.AuthorID,
		ChannelID:   channelMessage.ChannelID,
		GuildID:     channelMessage.GuildID,
		CreatedAt:   channelMessage.CreatedAt,
		UpdatedAt:   channelMessage.UpdatedAt,
		User:        NewUserResultFromUser(user),
		GuildMember: NewGuildMemberWithoutRolesResultFromGuildMember(guildMember),
		Attachments: NewAttachmentListResultFromAttachments(attachments),
	}
}

func NewUserChannelMessageResultFromChannelMessage(channelMessage *entities.ChannelMessage, user *entities.User, attachments []*entities.Attachment) *common.ChannelMessageResult {

	return &common.ChannelMessageResult{
		ID:          channelMessage.ID,
		Content:     channelMessage.Content,
		Pinned:      channelMessage.Pinned,
		Flag:        channelMessage.Flag,
		AuthorID:    channelMessage.AuthorID,
		ChannelID:   channelMessage.ChannelID,
		GuildID:     channelMessage.GuildID,
		CreatedAt:   channelMessage.CreatedAt,
		UpdatedAt:   channelMessage.UpdatedAt,
		User:        NewUserResultFromUser(user),
		GuildMember: nil,
		Attachments: NewAttachmentListResultFromAttachments(attachments),
	}
}

func NewUserChannelMessageListResultFromChannelMessage(channelMessages []*entities.ChannelMessage, user map[string]*entities.User, attachments map[string][]*entities.Attachment) []*common.ChannelMessageResult {

	channelMessageResult := make([]*common.ChannelMessageResult, len(channelMessages))

	for i := 0; i < len(channelMessages); i++ {
		channelMessageResult[i] = NewUserChannelMessageResultFromChannelMessage(
			channelMessages[i],
			user[channelMessages[i].AuthorID],
			attachments[channelMessages[i].ID],
		)
	}

	return channelMessageResult
}

func NewGuildChannelMessageListResultFromChannelMessage(channelMessages []*entities.ChannelMessage, user map[string]*entities.User, guildmembers map[string]*entities.GuildMember, attachments map[string][]*entities.Attachment) []*common.ChannelMessageResult {

	channelMessageResult := make([]*common.ChannelMessageResult, len(channelMessages))

	for i := 0; i < len(channelMessages); i++ {
		channelMessageResult[i] = NewGuildChannelMessageResultFromChannelMessage(
			channelMessages[i],
			user[channelMessages[i].AuthorID],
			guildmembers[channelMessages[i].AuthorID],
			attachments[channelMessages[i].ID],
		)
	}

	return channelMessageResult
}
