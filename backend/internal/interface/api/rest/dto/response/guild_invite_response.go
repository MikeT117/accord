package response

import (
	"github.com/google/uuid"
)

type GuildInviteResponse struct {
	ID          uuid.UUID  `json:"id"`
	CreatedAt   int64      `json:"createdAt"`
	ExpiresAt   int64      `json:"expiresAt"`
	UsedCount   int64      `json:"usedCount"`
	CreatorId   uuid.UUID  `json:"creatorId"`
	DisplayName string     `json:"displayName"`
	Username    string     `json:"username"`
	Avatar      *uuid.UUID `json:"avatar"`
}
