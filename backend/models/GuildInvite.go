package models

import (
	"time"

	"github.com/google/uuid"
)

type GuildInvite struct {
	ID        uuid.UUID   `json:"id"`
	Flags     int16       `json:"flags"`
	UsedCount int32       `json:"usedCount"`
	CreatedAt time.Time   `json:"createdAt"`
	UpdatedAt time.Time   `json:"updatedAt"`
	Creator   UserLimited `json:"creator"`
}

type GuildInviteLimited struct {
	ID          uuid.UUID  `json:"id"`
	Name        string     `json:"name"`
	Description string     `json:"description"`
	MemberCount int32      `json:"memberCount"`
	GuildID     uuid.UUID  `json:"guildId"`
	Icon        *uuid.UUID `json:"icon"`
	Banner      *uuid.UUID `json:"banner"`
}
