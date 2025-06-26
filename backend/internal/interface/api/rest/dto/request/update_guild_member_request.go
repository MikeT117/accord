package request

import (
	"strings"

	"github.com/MikeT117/accord/backend/internal/application/command"
)

type UpdateGuildMemberRequest struct {
	UserID   string  `param:"roleID"`
	GuildID  string  `param:"guildID"`
	Nickname *string `json:"nickname"`
	AvatarID *string `json:"avatar"`
	BannerID *string `json:"banner"`
}

func (r *UpdateGuildMemberRequest) ToUpdateGuildMemberCommand(requestorID string) (*command.UpdateGuildMemberCommand, error) {
	if strings.Trim(r.UserID, " ") == "" || strings.Trim(r.GuildID, " ") == "" || (r.Nickname != nil && strings.Trim(*r.Nickname, " ") == "") {
		return nil, NewRequestValidationError("invalid user id, guild id and/or nickname")
	}

	return &command.UpdateGuildMemberCommand{
		UserID:      r.UserID,
		GuildID:     r.GuildID,
		Nickname:    r.Nickname,
		AvatarID:    r.AvatarID,
		BannerID:    r.BannerID,
		RequestorID: requestorID,
	}, nil
}
