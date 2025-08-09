package command

import "github.com/google/uuid"

type CreateGuildMemberCommand struct {
	UserID   uuid.UUID
	GuildID  uuid.UUID
	InviteID *uuid.UUID
}
