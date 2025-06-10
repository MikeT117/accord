package common

type GuildBanResult struct {
	UserID    string
	GuildID   string
	Reason    string
	CreatedAt int64
	UpdatedAt int64
}
