package request

import "github.com/MikeT117/accord/backend/internal/application/command"

type UpdateGuildRequest struct {
	ID              string  `param:"guildID"`
	GuildCategoryID *string `json:"email"`
	Name            string  `json:"name"`
	Description     string  `json:"description"`
	Discoverable    bool    `json:"discoverable"`
	IconID          string  `json:"iconID"`
	BannerID        string  `json:"bannerID"`
}

func (r *UpdateGuildRequest) ToUpdateGuildCommand(requestorID string) (*command.UpdateGuildCommand, error) {
	if r.ID == "" || r.Name == "" {
		return nil, NewRequestValidationError("invalid id and/or name")
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
