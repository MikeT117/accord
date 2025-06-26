package response

type GuildInviteResponse struct {
	ID           string  `json:"id"`
	GuildID      string  `json:"guildID"`
	Name         string  `json:"name"`
	Description  string  `json:"description"`
	ChannelCount int64   `json:"channelCount"`
	MemberCount  int64   `json:"memberCount"`
	Icon         *string `json:"icon"`
	Banner       *string `json:"banner"`
}
