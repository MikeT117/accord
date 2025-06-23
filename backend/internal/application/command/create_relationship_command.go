package command

type CreateRelationshipCommand struct {
	CreatorID   string
	RecipientID string
	Status      int8
}
