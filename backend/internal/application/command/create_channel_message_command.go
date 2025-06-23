package command

type CreateChannelMessageCommand struct {
	Content       string
	AuthorID      string
	ChannelID     string
	AttachmentIDs []string
}
