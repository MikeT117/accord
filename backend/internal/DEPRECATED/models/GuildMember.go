package models

import (
	"time"

	"github.com/google/uuid"
)

type GuildMember struct {
	Nickname  *string     `json:"nickname"`
	GuildID   uuid.UUID   `json:"guildId"`
	JoinedAt  time.Time   `json:"joinedAt"`
	UpdatedAt time.Time   `json:"updatedAt"`
	User      UserLimited `json:"user"`
	Roles     []uuid.UUID `json:"roles"`
}

type GuildMemberLimited struct {
	JoinedAt time.Time   `json:"joinedAt"`
	User     UserLimited `json:"user"`
	Roles    []uuid.UUID `json:"roles"`
}

type GuildMemberMinimal struct {
	JoinedAt time.Time   `json:"joinedAt"`
	Roles    []uuid.UUID `json:"roles"`
}
