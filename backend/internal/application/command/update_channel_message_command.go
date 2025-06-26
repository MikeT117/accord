package command

type UpdateChannelMessageCommand struct {
	ID          string
	Content     string
	ChannelID   string
	RequestorID string
}
