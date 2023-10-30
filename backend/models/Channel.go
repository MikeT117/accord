package models

import (
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgtype"
)

type GuildChannel struct {
	ID             uuid.UUID   `json:"id"`
	Name           string      `json:"name"`
	Topic          string      `json:"topic"`
	ChannelType    int16       `json:"channelType"`
	ParentRoleSync bool        `json:"parentRoleSync"`
	ParentID       pgtype.UUID `json:"parentId"`
	CreatorID      uuid.UUID   `json:"creatorId"`
	CreatedAt      time.Time   `json:"createdAt"`
	UpdatedAt      time.Time   `json:"updatedAt"`
	Roles          []uuid.UUID `json:"roles"`
}

type DirectChannel struct {
	ID          uuid.UUID     `json:"id"`
	Name        *string       `json:"name"`
	Topic       *string       `json:"topic"`
	ChannelType int16         `json:"channelType"`
	CreatorID   uuid.UUID     `json:"creatorId"`
	CreatedAt   time.Time     `json:"createdAt"`
	UpdatedAt   time.Time     `json:"updatedAt"`
	Recipients  []UserLimited `json:"recipients"`
}
