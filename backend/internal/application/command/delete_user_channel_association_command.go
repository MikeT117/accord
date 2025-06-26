package command

type DeleteUserChannelAssociationCommand struct {
	ChannelID   string
	UserID      string
	RequestorID string
}
