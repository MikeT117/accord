package response

import "github.com/google/uuid"

type GuildRoleResponse struct {
	ID          uuid.UUID `json:"id"`
	GuildID     uuid.UUID `json:"guildId"`
	Name        string    `json:"name"`
	Permissions int32     `json:"permissions"`
	CreatedAt   int64     `json:"createdAt"`
	UpdatedAt   int64     `json:"updatedAt"`
}
