package models

import (
	"time"

	"github.com/google/uuid"
)

type Guild struct {
	ID              uuid.UUID      `json:"id"`
	Name            string         `json:"name"`
	Description     string         `json:"description"`
	IsDiscoverable  bool           `json:"isDiscoverable"`
	CreatorID       uuid.UUID      `json:"creatorId"`
	GuildCategoryID *uuid.UUID     `json:"guildCategoryId"`
	ChannelCount    int32          `json:"channelCount"`
	MemberCount     int32          `json:"memberCount"`
	UpdatedAt       time.Time      `json:"updatedAt"`
	Icon            *uuid.UUID     `json:"icon"`
	Banner          *uuid.UUID     `json:"banner"`
	Member          GuildMember    `json:"member"`
	Roles           []GuildRole    `json:"roles"`
	Channels        []GuildChannel `json:"channels"`
}

type DiscoverableGuild struct {
	ID              uuid.UUID  `json:"id"`
	Name            string     `json:"name"`
	Description     string     `json:"description"`
	MemberCount     int32      `json:"memberCount"`
	GuildCategoryID *uuid.UUID `json:"guildCategoryId"`
	Icon            *uuid.UUID `json:"icon"`
	Banner          *uuid.UUID `json:"banner"`
}

type UpdatedGuild struct {
	ID              uuid.UUID  `json:"id"`
	Name            string     `json:"name"`
	Description     string     `json:"description"`
	IsDiscoverable  bool       `json:"isDiscoverable"`
	Icon            *uuid.UUID `json:"icon"`
	Banner          *uuid.UUID `json:"banner"`
	GuildCategoryID *uuid.UUID `json:"guildCategoryId"`
}

type DeletedGuild struct {
	ID uuid.UUID `json:"id"`
}
