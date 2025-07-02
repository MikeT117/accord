package mapper

import (
	"github.com/MikeT117/accord/backend/internal/application/common"
	"github.com/MikeT117/accord/backend/internal/domain/entities"
	pb "github.com/MikeT117/accord/backend/internal/infra/pb/gen"
)

func NewUserResultFromUser(user *entities.User) *common.UserResult {
	if user == nil {
		return nil
	}

	return &common.UserResult{
		ID:          user.ID,
		AccountID:   user.AccountID,
		Username:    user.Username,
		DisplayName: user.DisplayName,
		Email:       user.Email,
		PublicFlags: user.PublicFlags,
		AvatarID:    user.AvatarID,
		BannerID:    user.BannerID,
	}

}

func NewUserProtoResultFromUser(user *entities.User) *pb.User {
	if user == nil {
		return nil
	}

	var ver int32 = 0
	publicFlags := int32(user.PublicFlags)
	return &pb.User{
		Ver:         &ver,
		Id:          &user.ID,
		Username:    &user.Username,
		DisplayName: &user.DisplayName,
		PublicFlags: &publicFlags,
		Avatar:      user.AvatarID,
		Banner:      user.BannerID,
	}

}
