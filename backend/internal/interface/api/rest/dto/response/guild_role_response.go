package response

type GuildRoleResponse struct {
	ID          string `json:"id"`
	GuildID     string `json:"guildId"`
	Name        string `json:"name"`
	Permissions int32  `json:"permissions"`
	CreatedAt   int64  `json:"createdAt"`
	UpdatedAt   int64  `json:"updatedAt"`
}
