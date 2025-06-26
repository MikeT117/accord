package command

type CreateUserChannelAssociationCommand struct {
	ChannelID   string
	UserID      string
	RequestorID string
}
