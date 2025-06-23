package mapper

import (
	"github.com/MikeT117/accord/backend/internal/application/common"
	"github.com/MikeT117/accord/backend/internal/interface/api/REST/dto/response"
)

func ToUserResponse(user *common.UserResult) *response.UserResponse {
	if user == nil {
		return nil
	}

	return &response.UserResponse{
		ID:          user.ID,
		Username:    user.Username,
		DisplayName: user.DisplayName,
		PublicFlags: user.PublicFlags,
		Avatar:      user.AvatarID,
		Banner:      user.BannerID,
	}
}

func ToUsersResponse(users []*common.UserResult) []*response.UserResponse {
	userResponses := make([]*response.UserResponse, len(users))

	for i := 0; i < len(users); i++ {
		userResponses[i] = ToUserResponse(users[i])
	}

	return userResponses
}
