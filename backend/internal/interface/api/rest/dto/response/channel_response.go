package response

type ChannelResponse struct {
	ID          string          `json:"id"`
	CreatorID   string          `json:"creatorId"`
	GuildID     *string         `json:"guildId"`
	ParentID    *string         `json:"parentId"`
	Name        *string         `json:"name"`
	Topic       *string         `json:"topic"`
	ChannelType int8            `json:"channelType"`
	CreatedAt   int64           `json:"createdAt"`
	UpdatedAt   int64           `json:"updatedAt"`
	Roles       []string        `json:"roles,omitempty"`
	Users       []*UserResponse `json:"users,omitempty"`
}
