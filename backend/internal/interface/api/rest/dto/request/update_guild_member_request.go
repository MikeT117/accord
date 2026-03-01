package request

import (
	"strings"

	"github.com/MikeT117/accord/backend/internal/application/command"
	"github.com/google/uuid"
)

type UpdateGuildMemberRequest struct {
	UserID   uuid.UUID  `param:"userID"`
	GuildID  uuid.UUID  `param:"guildID"`
	Nickname *string    `json:"nickname"`
	AvatarID *uuid.UUID `json:"avatar"`
	BannerID *uuid.UUID `json:"banner"`
}

func (r *UpdateGuildMemberRequest) ToUpdateGuildMemberCommand(requestorID uuid.UUID) (*command.UpdateGuildMemberCommand, error) {
	if r.Nickname != nil && strings.Trim(*r.Nickname, " ") == "" {
		return nil, NewRequestValidationError("invalid nickname")
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
