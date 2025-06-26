package response

import "time"

type GuildMemberResponse struct {
	GuildID   string    `json:"guildID"`
	Nickname  *string   `json:"nickname"`
	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`
	Avatar    *string   `json:"avatar"`
	Banner    *string   `json:"banner"`
	Roles     []string  `json:"roles"`
}
