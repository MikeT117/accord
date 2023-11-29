package models

import (
	"time"

	"github.com/google/uuid"
)

type GuildRole struct {
	ID          uuid.UUID `json:"id"`
	Name        string    `json:"name"`
	Permissions int32     `json:"permissions"`
	GuildID     uuid.UUID `json:"guildId"`
	CreatorID   uuid.UUID `json:"creatorId"`
	CreatedAt   time.Time `json:"createdAt"`
	UpdatedAt   time.Time `json:"updatedAt"`
}

type DeleteGuildRole struct {
	ID      uuid.UUID `json:"id"`
	GuildID uuid.UUID `json:"guildId"`
}

type GuildRoleMemberCreate struct {
	GuildID uuid.UUID `json:"guildId"`
	RoleID  uuid.UUID `json:"roleId"`
}

type GuildRoleMemberDelete struct {
	GuildID uuid.UUID `json:"guildId"`
	RoleID  uuid.UUID `json:"roleId"`
}

/*
Permissions are calcualated by shifting bits, there are 32 bits (not all are used).
0: ViewGuildChannel
1: ManageGuildChannels
2: CreateChannelMessage
3: ManageChannelMessages
4: ManageGuild
5: GuildAdmin
*/
