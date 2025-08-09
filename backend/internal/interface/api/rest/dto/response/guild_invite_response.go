package response

import "github.com/google/uuid"

type GuildInviteResponse struct {
	ID           uuid.UUID  `json:"id"`
	GuildID      uuid.UUID  `json:"guildId"`
	Name         string     `json:"name"`
	Description  string     `json:"description"`
	ChannelCount int64      `json:"channelCount"`
	MemberCount  int64      `json:"memberCount"`
	Icon         *uuid.UUID `json:"icon"`
	Banner       *uuid.UUID `json:"banner"`
}
