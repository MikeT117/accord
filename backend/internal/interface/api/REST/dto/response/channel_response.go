package response

import "time"

type ChannelResponse struct {
	ID          string          `json:"id"`
	CreatorID   string          `json:"creatorId"`
	GuildID     *string         `json:"guildId"`
	ParentID    *string         `json:"parentId"`
	Name        *string         `json:"name"`
	Topic       *string         `json:"topic"`
	ChannelType int8            `json:"channelType"`
	CreatedAt   time.Time       `json:"createdAt"`
	UpdatedAt   time.Time       `json:"updatedAt"`
	Roles       []string        `json:"roles,omitempty"`
	Users       []*UserResponse `json:"users,omitempty"`
}
