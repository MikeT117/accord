package response

import (
	"github.com/google/uuid"
)

type GuildBanResponse struct {
	Avatar      *uuid.UUID `json:"avatar"`
	Banner      *uuid.UUID `json:"banner"`
	Username    string     `json:"username"`
	DisplayName string     `json:"displayName"`
	UserID      uuid.UUID  `json:"userId"`
	GuildID     uuid.UUID  `json:"guildId"`
	Reason      string     `json:"reason"`
	CreatedAt   int64      `json:"createdAt"`
	UpdatedAt   int64      `json:"updatedAt"`
}
