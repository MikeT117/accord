package command

type UpdateAttachmentCommand struct {
	ID     string
	Status int8
	Height *int64
	Width  *int64
}
