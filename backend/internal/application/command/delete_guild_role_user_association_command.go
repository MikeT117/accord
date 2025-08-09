package command

import "github.com/google/uuid"

type DeleteGuildRoleUserAssociationCommand struct {
	RoleID      uuid.UUID
	UserID      uuid.UUID
	GuildID     uuid.UUID
	RequestorID uuid.UUID
}
