package command

type CreateChannelMessageCommand struct {
	Content       string
	AuthorID      *string
	ChannelID     *string
	GuildID       *string
	AttachmentIDs []string
}

// TODO: VALIDATE THE ATTACHMENT ID BELONGS TO THE USER
