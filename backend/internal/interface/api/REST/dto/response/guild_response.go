package response

import "time"

type GuildResponse struct {
	ID              string               `json:"id"`
	CreatorID       string               `json:"creatorId"`
	GuildCategoryID *string              `json:"guildCategoryId"`
	Name            string               `json:"name"`
	Description     string               `json:"description"`
	Discoverable    bool                 `json:"discoverable"`
	ChannelCount    int64                `json:"channelCount"`
	MemberCount     int64                `json:"memberCount"`
	CreatedAt       time.Time            `json:"createdAt"`
	UpdatedAt       time.Time            `json:"updatedAt"`
	Icon            *string              `json:"icon"`
	Banner          *string              `json:"banner"`
	Channels        []*ChannelResponse   `json:"channels,omitempty"`
	Roles           []*GuildRoleResponse `json:"roles,omitempty"`
}
