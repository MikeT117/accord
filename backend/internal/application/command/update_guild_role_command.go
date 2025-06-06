package command

import "github.com/MikeT117/accord/backend/internal/application/common"

type UpdateGuildRoleCommand struct {
	ID          string
	Name        string
	GuildID     string
	Permissions int32
}

type UpdateGuildRoleCommandResult struct {
	Result *common.GuildRoleResult
}
