package common

type GuildMemberUserResult struct {
	ID          string
	Username    string
	DisplayName string
	PublicFlags int8
	AvatarID    *string
	BannerID    *string
	GuildID     string
	Nickname    *string
}
