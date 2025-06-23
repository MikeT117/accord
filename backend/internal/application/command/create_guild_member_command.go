package command

type CreateGuildMemberCommand struct {
	UserID   string
	GuildID  string
	InviteID *string
}
