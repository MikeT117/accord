package command

type DeleteGuildRoleChannelAssociationCommand struct {
	RoleID      string
	ChannelID   string
	GuildID     string
	RequestorID string
}
