package command

import "github.com/google/uuid"

type DeleteGuildRoleChannelAssociationCommand struct {
	RoleID      uuid.UUID
	ChannelID   uuid.UUID
	GuildID     uuid.UUID
	RequestorID uuid.UUID
}
