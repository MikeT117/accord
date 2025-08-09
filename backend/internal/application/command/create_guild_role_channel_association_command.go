package command

import "github.com/google/uuid"

type CreateGuildRoleChannelAssociationCommand struct {
	RoleID      uuid.UUID
	ChannelID   uuid.UUID
	GuildID     uuid.UUID
	RequestorID uuid.UUID
}
