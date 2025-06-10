package command

type UpdateGuildMemberCommand struct {
	UserID   string
	GuildID  string
	Nickname *string
	AvatarID *string
	BannerID *string
}
