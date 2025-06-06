package models

import (
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgtype"
)

type GuildChannel struct {
	ID          uuid.UUID   `json:"id"`
	Name        string      `json:"name"`
	GuildID     uuid.UUID   `json:"guildId"`
	Topic       string      `json:"topic"`
	ChannelType int16       `json:"channelType"`
	ParentID    pgtype.UUID `json:"parentId"`
	CreatorID   uuid.UUID   `json:"creatorId"`
	UpdatedAt   time.Time   `json:"updatedAt"`
	Roles       []uuid.UUID `json:"roles"`
}

type PrivateChannel struct {
	ID          uuid.UUID     `json:"id"`
	Name        *string       `json:"name"`
	Topic       *string       `json:"topic"`
	ChannelType int16         `json:"channelType"`
	CreatorID   uuid.UUID     `json:"creatorId"`
	UpdatedAt   time.Time     `json:"updatedAt"`
	Users       []UserLimited `json:"users"`
}

type UpdatedChannel struct {
	ID          uuid.UUID   `json:"id"`
	Name        string      `json:"name"`
	Topic       string      `json:"topic"`
	ChannelType int16       `json:"channelType"`
	GuildID     pgtype.UUID `json:"guildId"`
	ParentID    pgtype.UUID `json:"parentId"`
}

type UpdatedGuildChannelParent struct {
	ID       uuid.UUID   `json:"id"`
	GuildID  uuid.UUID   `json:"guildId"`
	ParentID pgtype.UUID `json:"parentId,omitempty"`
	Roles    []uuid.UUID `json:"roles,omitempty"`
}

type UpdatedGuildChannelRoles struct {
	ID      uuid.UUID   `json:"id"`
	GuildID uuid.UUID   `json:"guildId"`
	Roles   []uuid.UUID `json:"roles,omitempty"`
}

type DeletedChannel struct {
	ID      uuid.UUID `json:"id"`
	GuildID uuid.UUID `json:"guildId"`
}
