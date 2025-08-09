package response

import "github.com/google/uuid"

type GuildMemberResponse struct {
	GuildID   uuid.UUID   `json:"guildId"`
	Nickname  *string     `json:"nickname"`
	CreatedAt int64       `json:"createdAt"`
	UpdatedAt int64       `json:"updatedAt"`
	Avatar    *uuid.UUID  `json:"avatar"`
	Banner    *uuid.UUID  `json:"banner"`
	RoleIDs   []uuid.UUID `json:"roles"`
}
