package mapper

import (
	"github.com/MikeT117/accord/backend/internal/application/common"
	"github.com/MikeT117/accord/backend/internal/interface/api/rest/dto/response"
)

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
		Author:      ToChannelMessageAuthorResponse(channelMessage.Author),
	}
}

func ToChannelMessagesResponse(channelMessages []*common.ChannelMessageResult) []*response.ChannelMessageResponse {
	channelMessageResponses := make([]*response.ChannelMessageResponse, len(channelMessages))

	for i := 0; i < len(channelMessages); i++ {
		channelMessageResponses[i] = ToChannelMessageResponse(channelMessages[i])
	}

	return channelMessageResponses
}
