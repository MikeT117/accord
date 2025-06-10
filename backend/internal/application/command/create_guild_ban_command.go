package command

type CreateGuildBanCommand struct {
	UserID  string
	GuildID string
	Reason  string
}
