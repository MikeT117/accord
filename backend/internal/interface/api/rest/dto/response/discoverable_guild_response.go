package response

import "github.com/google/uuid"

type DiscoverableGuildResponse struct {
	ID              uuid.UUID  `json:"id"`
	CreatorID       uuid.UUID  `json:"creatorId"`
	GuildCategoryID *uuid.UUID `json:"guildCategoryId"`
	Name            string     `json:"name"`
	Description     string     `json:"description"`
	Discoverable    bool       `json:"discoverable"`
	ChannelCount    int64      `json:"channelCount"`
	MemberCount     int64      `json:"memberCount"`
	CreatedAt       int64      `json:"createdAt"`
	UpdatedAt       int64      `json:"updatedAt"`
	Icon            *uuid.UUID `json:"icon"`
	Banner          *uuid.UUID `json:"banner"`
}
