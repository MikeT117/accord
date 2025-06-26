package command

type CreateGuildRoleChannelAssociationCommand struct {
	RoleID      string
	ChannelID   string
	GuildID     string
	RequestorID string
}
