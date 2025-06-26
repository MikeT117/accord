package request

import "github.com/MikeT117/accord/backend/internal/application/command"

type CreateGuildRequest struct {
	Name         string  `json:"name"`
	Description  string  `json:"description"`
	Discoverable bool    `json:"discoverable"`
	IconID       *string `json:"iconID"`
	BannerID     *string `json:"bannerID"`
}

func (r *CreateGuildRequest) ToCreateGuildCommand(creatorID string) *command.CreateGuildCommand {
	return &command.CreateGuildCommand{
		CreatorID:    creatorID,
		Name:         r.Name,
		Description:  r.Description,
		Discoverable: r.Discoverable,
		IconID:       r.IconID,
		BannerID:     r.BannerID,
	}
}
