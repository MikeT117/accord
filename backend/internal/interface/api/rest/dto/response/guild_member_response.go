package response

type GuildMemberResponse struct {
	GuildID   string   `json:"guildId"`
	Nickname  *string  `json:"nickname"`
	CreatedAt int64    `json:"createdAt"`
	UpdatedAt int64    `json:"updatedAt"`
	Avatar    *string  `json:"avatar"`
	Banner    *string  `json:"banner"`
	Roles     []string `json:"roles"`
}
