package command

import "github.com/MikeT117/accord/backend/internal/application/common"

type UpdateGuildMemberCommand struct {
	UserID   string
	GuildID  string
	Nickname *string
	AvatarID *string
	BannerID *string
}

type UpdateGuildMemberCommandResult struct {
	Result *common.GuildRoleResult
}
