package request

import (
	"strings"

	"github.com/MikeT117/accord/backend/internal/application/command"
)

type UpdateGuildRequest struct {
	ID              string  `param:"guildID"`
	GuildCategoryID *string `json:"guildCategoryId"`
	Name            string  `json:"name"`
	Description     string  `json:"description"`
	Discoverable    bool    `json:"discoverable"`
	IconID          *string `json:"iconID"`
	BannerID        *string `json:"bannerID"`
}

func (r *UpdateGuildRequest) ToUpdateGuildCommand(requestorID string) (*command.UpdateGuildCommand, error) {
	if strings.Trim(r.ID, " ") == "" {
		return nil, NewRequestValidationError("invalid id")
	}

	if strings.Trim(r.Name, " ") == "" || len(strings.Trim(r.Name, " ")) < 1 || len(strings.Trim(r.Name, " ")) > 32 {
		return nil, NewRequestValidationError("invalid name")
	}

	if len(r.Description) > 300 {
		return nil, NewRequestValidationError("description length invalid")
	}

	return &command.UpdateGuildCommand{
		ID:              r.ID,
		GuildCategoryID: r.GuildCategoryID,
		Name:            r.Name,
		Description:     r.Description,
		Discoverable:    r.Discoverable,
		IconID:          r.IconID,
		BannerID:        r.BannerID,
		RequestorID:     requestorID,
	}, nil
}
