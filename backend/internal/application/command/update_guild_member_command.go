package command

import "github.com/google/uuid"

type UpdateGuildMemberCommand struct {
	UserID      uuid.UUID
	GuildID     uuid.UUID
	Nickname    *string
	AvatarID    *uuid.UUID
	BannerID    *uuid.UUID
	RequestorID uuid.UUID
}
