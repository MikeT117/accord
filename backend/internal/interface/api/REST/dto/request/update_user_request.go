package request

import "github.com/MikeT117/accord/backend/internal/application/command"

type UpdateUserRequest struct {
	ID          string  `json:"id"`
	DisplayName string  `json:"displayName"`
	PublicFlags int8    `json:"publicFlags"`
	AvatarID    *string `json:"AvatarID"`
	BannerID    *string `json:"BannerID"`
}

func (r *UpdateUserRequest) ToUpdateUserCommand() *command.UpdateUserCommand {
	return &command.UpdateUserCommand{
		ID:          r.ID,
		DisplayName: r.DisplayName,
		PublicFlags: r.PublicFlags,
		AvatarID:    r.AvatarID,
		BannerID:    r.BannerID,
	}
}
