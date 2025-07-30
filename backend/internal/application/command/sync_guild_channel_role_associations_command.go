package command

type SyncGuildRoleChannelAssociationsCommand struct {
	SourceChannelID string
	TargetChannelID string
	GuildID         string
	RequestorID     string
}
