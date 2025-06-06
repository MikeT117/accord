package models

import (
	"github.com/google/uuid"
)

type UserProfile struct {
	ID           uuid.UUID   `json:"id"`
	DisplayName  string      `json:"displayName"`
	Username     string      `json:"username"`
	PublicFlags  int32       `json:"publicFlags"`
	Avatar       *uuid.UUID  `json:"avatar"`
	MutualGuilds []uuid.UUID `json:"mutualGuilds"`
}

type UserProfileWithGuildMember struct {
	ID           uuid.UUID          `json:"id"`
	DisplayName  string             `json:"displayName"`
	Username     string             `json:"username"`
	PublicFlags  int32              `json:"publicFlags"`
	Avatar       *uuid.UUID         `json:"avatar"`
	MutualGuilds []uuid.UUID        `json:"mutualGuilds"`
	GuildMember  GuildMemberMinimal `json:"guildMember"`
}

type UpdatedUser struct {
	ID          uuid.UUID  `json:"id"`
	Avatar      *uuid.UUID `json:"avatar"`
	DisplayName string     `json:"displayName"`
	PublicFlags int32      `json:"publicFlags"`
}
