package models

import (
	"time"

	"github.com/google/uuid"
)

type ChannelMessage struct {
	ID          uuid.UUID   `json:"id"`
	ChannelID   uuid.UUID   `json:"channelId"`
	Content     string      `json:"content"`
	IsPinned    bool        `json:"isPinned"`
	Flags       int32       `json:"flags"`
	CreatedAt   time.Time   `json:"createdAt"`
	UpdatedAt   *time.Time  `json:"updatedAt"`
	Author      UserLimited `json:"author"`
	Attachments []string    `json:"attachments"`
}

type UpdatedChannelMessage struct {
	ID        uuid.UUID `json:"id"`
	ChannelID uuid.UUID `json:"channelId"`
	Content   string    `json:"content"`
	IsPinned  bool      `json:"isPinned"`
	UpdatedAt time.Time `json:"updatedAt"`
}

type DeletedChannelMessage struct {
	ID        uuid.UUID `json:"id"`
	ChannelID uuid.UUID `json:"channelId"`
}
