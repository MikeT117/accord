package request

import (
	"github.com/MikeT117/accord/backend/internal/application/command"
	"github.com/google/uuid"
)

type UpdateUserRequest struct {
	DisplayName string     `json:"displayName"`
	PublicFlags int8       `json:"publicFlags"`
	AvatarID    *uuid.UUID `json:"AvatarID"`
	BannerID    *uuid.UUID `json:"BannerID"`
}

func (r *UpdateUserRequest) ToUpdateUserCommand(requestorID uuid.UUID) (*command.UpdateUserCommand, error) {
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
