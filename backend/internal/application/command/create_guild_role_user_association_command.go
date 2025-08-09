package command

type CreateGuildRoleUserAssociationCommand struct {
	RoleID      string
	UserIDs     []string
	GuildID     string
	RequestorID string
}
