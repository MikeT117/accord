package response

type GuildMemberUserResponse struct {
	GuildMember *GuildMemberResponse `json:"guildMember"`
	User        *UserResponse        `json:"user"`
}
