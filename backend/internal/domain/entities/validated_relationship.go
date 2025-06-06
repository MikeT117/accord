package entities

type ValidatedRelationship struct {
	Relationship
	isValid bool
}

func (ve *ValidatedRelationship) IsValid() bool {
	return ve.isValid
}

func NewValidatedRelationship(relationship *Relationship) (*ValidatedRelationship, error) {
	if err := relationship.validate(); err != nil {
		return nil, err
	}

	return &ValidatedRelationship{
		Relationship: *relationship,
		isValid:      true,
	}, nil
}
