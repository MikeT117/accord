package command

type UpdateRelationshipCommand struct {
	ID          string
	Status      int8
	RequestorID string
}
