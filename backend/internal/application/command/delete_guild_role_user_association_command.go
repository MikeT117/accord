package command

type DeleteGuildRoleUserAssociationCommand struct {
	RoleID      string
	UserID      string
	GuildID     string
	RequestorID string
}
