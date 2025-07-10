package mapper

import (
	"github.com/MikeT117/accord/backend/internal/application/common"
	"github.com/MikeT117/accord/backend/internal/interface/api/rest/dto/response"
)

func ToRelationshipResponse(relationship *common.RelationshipResult) *response.RelationshipResponse {
	if relationship == nil {
		return nil
	}

	return &response.RelationshipResponse{
		ID:          relationship.ID,
		CreatorID:   relationship.CreatorID,
		RecipientID: relationship.RecipientID,
		CreatedAt:   relationship.CreatedAt.Unix(),
		UpdatedAt:   relationship.UpdatedAt.Unix(),
		Status:      relationship.Status,
		User:        ToUserResponse(relationship.User),
	}
}

func ToRelationshipsResponse(relationships []*common.RelationshipResult) []*response.RelationshipResponse {
	relationshipResponses := make([]*response.RelationshipResponse, len(relationships))

	for i := 0; i < len(relationships); i++ {
		relationshipResponses[i] = ToRelationshipResponse(relationships[i])
	}

	return relationshipResponses
}
