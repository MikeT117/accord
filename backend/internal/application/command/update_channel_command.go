package command

type UpdateChannelCommand struct {
	ID          string
	ParentID    *string
	Name        string
	Topic       *string
	RequestorID string
}
