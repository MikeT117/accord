package request

import "github.com/MikeT117/accord/backend/internal/application/command"

type UpdateGuildRequest struct {
	GuildCategoryID *string `json:"email"`
	Name            string  `json:"name"`
	Description     string  `json:"description"`
	Discoverable    bool    `json:"discoverable"`
	IconID          string  `json:"iconID"`
	BannerID        string  `json:"bannerID"`
}

func (r *UpdateGuildRequest) ToUpdateGuildCommand(ID string) *command.UpdateGuildCommand {
	return &command.UpdateGuildCommand{
		ID:              ID,
		GuildCategoryID: r.GuildCategoryID,
		Name:            r.Name,
		Description:     r.Description,
		Discoverable:    r.Discoverable,
		IconID:          r.IconID,
		BannerID:        r.BannerID,
	}
}
