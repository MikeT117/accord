package mapper

import (
	"github.com/MikeT117/accord/backend/internal/application/common"
	"github.com/MikeT117/accord/backend/internal/domain/entities"
)

func NewUserResultFromUser(user *entities.User) *common.UserResult {
	return &common.UserResult{
		ID:          user.ID,
		Username:    user.Username,
		DisplayName: user.DisplayName,
		Email:       user.Email,
		PublicFlags: user.PublicFlags,
		AvatarID:    user.AvatarID,
		BannerID:    user.BannerID,
	}

}
