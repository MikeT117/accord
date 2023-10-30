package models

import (
	"time"

	"github.com/google/uuid"
)

type UserProfile struct {
	ID           uuid.UUID   `json:"id"`
	DisplayName  string      `json:"displayName"`
	Username     string      `json:"username"`
	PublicFlags  int32       `json:"publicFlags"`
	CreatedAt    time.Time   `json:"createdAt"`
	Avatar       *uuid.UUID  `json:"avatar"`
	MutualGuilds []uuid.UUID `json:"mutualGuilds"`
}

type UserProfileWithGuildMember struct {
	ID           uuid.UUID          `json:"id"`
	DisplayName  string             `json:"displayName"`
	Username     string             `json:"username"`
	PublicFlags  int32              `json:"publicFlags"`
	CreatedAt    time.Time          `json:"createdAt"`
	Avatar       *uuid.UUID         `json:"avatar"`
	MutualGuilds []uuid.UUID        `json:"mutualGuilds"`
	GuildMember  GuildMemberMinimal `json:"guildMember"`
}
