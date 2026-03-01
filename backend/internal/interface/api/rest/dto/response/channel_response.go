package response

import "github.com/google/uuid"

type ChannelResponse struct {
	ID          uuid.UUID       `json:"id"`
	CreatorID   uuid.UUID       `json:"creatorId"`
	GuildID     *uuid.UUID      `json:"guildId"`
	ParentID    *uuid.UUID      `json:"parentId"`
	Name        *string         `json:"name"`
	Topic       *string         `json:"topic"`
	ChannelType int8            `json:"channelType"`
	CreatedAt   int64           `json:"createdAt"`
	UpdatedAt   int64           `json:"updatedAt"`
	Roles       []uuid.UUID     `json:"roleIds,omitempty"`
	Users       []*UserResponse `json:"users,omitempty"`
}
