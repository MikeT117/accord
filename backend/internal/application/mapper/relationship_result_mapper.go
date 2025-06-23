package mapper

import (
	"github.com/MikeT117/accord/backend/internal/application/common"
	"github.com/MikeT117/accord/backend/internal/domain/entities"
)

func NewRelationshipResultFromRelationship(relationship *entities.Relationship, user *entities.User) *common.RelationshipResult {
	return &common.RelationshipResult{
		ID:          relationship.ID,
		CreatorID:   relationship.CreatorID,
		RecipientID: relationship.RecipientID,
		Status:      relationship.Status,
		CreatedAt:   relationship.CreatedAt,
		UpdatedAt:   relationship.UpdatedAt,
		User:        NewUserResultFromUser(user),
	}
}

func NewRelationshipListResultFromRelationship(relationships []*entities.Relationship, users map[string]*entities.User, userID string) []*common.RelationshipResult {
	relationshipsResult := make([]*common.RelationshipResult, len(relationships))

	for i := 0; i < len(relationships); i++ {
		if relationships[i].CreatorID != userID && users[relationships[i].CreatorID] != nil {
			relationshipsResult[i] = NewRelationshipResultFromRelationship(relationships[i], users[relationships[i].CreatorID])
		} else if relationships[i].RecipientID != userID && users[relationships[i].RecipientID] != nil {
			relationshipsResult[i] = NewRelationshipResultFromRelationship(relationships[i], users[relationships[i].CreatorID])
		}
	}

	return relationshipsResult
}
