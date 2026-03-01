package response

import "github.com/google/uuid"

type GuildMemberResponse struct {
	ID          uuid.UUID   `json:"id"`
	DisplayName string      `json:"displayName"`
	Username    string      `json:"username"`
	Avatar      *uuid.UUID  `json:"avatar"`
	Banner      *uuid.UUID  `json:"banner"`
	GuildID     uuid.UUID   `json:"guildId"`
	CreatedAt   int64       `json:"createdAt"`
	UpdatedAt   int64       `json:"updatedAt"`
	RoleIDs     []uuid.UUID `json:"roles"`
}
