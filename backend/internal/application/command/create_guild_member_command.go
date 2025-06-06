package command

import "github.com/MikeT117/accord/backend/internal/application/common"

type CreateGuildMemberCommand struct {
	UserID  string
	GuildID string
}

type CreateGuildMemberCommandResult struct {
	Result *common.GuildMemberResult
}
