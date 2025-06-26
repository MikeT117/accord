package response

import "time"

type GuildRoleResponse struct {
	ID          string    `json:"id"`
	GuildID     string    `json:"guildId"`
	Name        string    `json:"name"`
	Permissions int32     `json:"permissions"`
	CreatedAt   time.Time `json:"createdAt"`
	UpdatedAt   time.Time `json:"updatedAt"`
}
