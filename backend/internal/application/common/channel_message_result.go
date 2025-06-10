package common

type ChannelMessageResult struct {
	ID          string
	Content     string
	Pinned      bool
	Flag        int8
	AuthorID    string
	ChannelID   string
	GuildID     *string
	CreatedAt   int64
	UpdatedAt   int64
	User        *UserResult
	GuildMember *GuildMemberResult
	Attachments []*AttachmentResult
}
