package command

import "github.com/google/uuid"

type CreateGuildRoleUserAssociationCommand struct {
	RoleID      uuid.UUID
	UserIDs     []uuid.UUID
	GuildID     uuid.UUID
	RequestorID uuid.UUID
}
