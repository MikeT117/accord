package models

import (
	"time"

	"github.com/google/uuid"
)

type GuildInvite struct {
	ID        uuid.UUID `json:"id"`
	Status    int16     `json:"status"`
	UsedCount int32     `json:"usedCount"`
	UserID    uuid.UUID `json:"userId"`
	GuildID   uuid.UUID `json:"guildId"`
	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`
}
