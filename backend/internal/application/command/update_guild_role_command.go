package command

type UpdateGuildRoleCommand struct {
	ID          string
	Name        string
	GuildID     string
	Permissions int32
	RequestorID string
}
