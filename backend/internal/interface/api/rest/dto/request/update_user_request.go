package request

import "github.com/MikeT117/accord/backend/internal/application/command"

type UpdateUserRequest struct {
	DisplayName string  `json:"displayName"`
	PublicFlags int8    `json:"publicFlags"`
	AvatarID    *string `json:"AvatarID"`
	BannerID    *string `json:"BannerID"`
}

func (r *UpdateUserRequest) ToUpdateUserCommand(requestorID string) (*command.UpdateUserCommand, error) {
	if r.DisplayName == "" || r.PublicFlags < 0 {
		return nil, NewRequestValidationError("invalid display name and/or public flags")
	}
	return &command.UpdateUserCommand{
		ID:          requestorID,
		DisplayName: r.DisplayName,
		PublicFlags: r.PublicFlags,
		AvatarID:    r.AvatarID,
		BannerID:    r.BannerID,
	}, nil
}
