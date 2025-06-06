package common

type GuildMemberResult struct {
	UserID    string
	GuildID   string
	Nickname  *string
	CreatedAt int64
	UpdatedAt int64
	AvatarID  *string
	BannerID  *string
	Roles     []string
}
