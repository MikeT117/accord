package command

type CreateGuildRoleUserAssociationCommand struct {
	RoleID      string
	UserID      string
	GuildID     string
	RequestorID string
}
