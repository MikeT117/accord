package mapper

import (
	"github.com/MikeT117/accord/backend/internal/application/common"
	"github.com/MikeT117/accord/backend/internal/interface/api/rest/dto/response"
)

func ToChannelMessageAuthorResponse(author *common.ChannelMessageAuthorResult) *response.ChannelMessageAuthorResponse {
	if author == nil {
		return nil
	}

	return &response.ChannelMessageAuthorResponse{
		ID:          author.ID,
		Username:    author.Username,
		PublicFlags: author.PublicFlags,
		DisplayName: author.DisplayName,
		Avatar:      author.Avatar,
		Banner:      author.Banner,
	}
}
