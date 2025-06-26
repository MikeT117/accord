package command

type DeleteChannelMessageCommand struct {
	ID          string
	ChannelID   string
	RequestorID string
}
