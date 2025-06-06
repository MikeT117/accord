package command

import "github.com/MikeT117/accord/backend/internal/application/common"

type CreateGuildRoleCommand struct {
	GuildID string
	Name    string
}

type CreateGuildRoleCommandResult struct {
	Result *common.GuildRoleResult
}
