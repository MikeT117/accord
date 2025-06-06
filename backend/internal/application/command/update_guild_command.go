package command

import "github.com/MikeT117/accord/backend/internal/application/common"

type UpdateGuildCommand struct {
	ID              string
	GuildCategoryID *string
	Name            string
	Description     string
	Discoverable    bool
	IconID          string
	BannerID        string
}

type UpdateGuildCommandResult struct {
	Result *common.GuildResult
}
