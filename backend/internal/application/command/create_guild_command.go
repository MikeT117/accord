package command

import "github.com/MikeT117/accord/backend/internal/application/common"

type CreateGuildCommand struct {
	CreatorID    string
	Name         string
	Description  string
	Discoverable bool
	IconID       *string
	BannerID     *string
}

type CreateGuildCommandResult struct {
	Result *common.GuildResult
}
