package common

type GuildResult struct {
	ID              string
	CreatorID       string
	GuildCategoryID *string
	Name            string
	Description     string
	Discoverable    bool
	ChannelCount    int64
	MemberCount     int64
	CreatedAt       int64
	UpdatedAt       int64
	IconID          *string
	BannerID        *string
	GuildMember     *GuildMemberResult
	Roles           []*GuildRoleResult
	Channels        []*ChannelResult
}
