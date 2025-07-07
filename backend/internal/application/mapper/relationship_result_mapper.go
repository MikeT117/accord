package mapper

import (
	"github.com/MikeT117/accord/backend/internal/application/common"
	"github.com/MikeT117/accord/backend/internal/domain/entities"
	pb "github.com/MikeT117/accord/backend/internal/infra/pb/gen"
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

func NewRelationshipProtoResultFromRelationship(relationship *entities.Relationship, user *entities.User) *pb.Relationship {
	var ver int32 = 0
	status := int32(relationship.Status)
	createdAt := relationship.CreatedAt.Unix()
	updatedAt := relationship.UpdatedAt.Unix()
	return &pb.Relationship{
		Ver:         &ver,
		Id:          &relationship.ID,
		CreatorId:   &relationship.CreatorID,
		RecipientId: &relationship.RecipientID,
		Status:      &status,
		CreatedAt:   &createdAt,
		UpdatedAt:   &updatedAt,
		User:        NewUserProtoResultFromUser(user),
	}
}

func NewRelationshipCreatedProtoEvent(relationship *entities.Relationship, user *entities.User) *pb.EventPayload {
	var ver int32 = 0
	return &pb.EventPayload{
		Ver: &ver,
		Op:  pb.OpCode_RELATIONSHIP_CREATE_EVENT.Enum(),
		Payload: &pb.EventPayload_RelationshipCreated{
			RelationshipCreated: NewRelationshipProtoResultFromRelationship(relationship, user),
		},
	}
}

func NewRelationshipUpdatedProtoEvent(relationship *entities.Relationship) *pb.EventPayload {
	var ver int32 = 0
	status := int32(relationship.Status)

	updatedAt := relationship.UpdatedAt.Unix()
	return &pb.EventPayload{
		Ver: &ver,
		Op:  pb.OpCode_RELATIONSHIP_UPDATE_EVENT.Enum(),
		Payload: &pb.EventPayload_RelationshipUpdated{
			RelationshipUpdated: &pb.RelationshipUpdated{
				Ver:       &ver,
				Id:        &relationship.ID,
				Status:    &status,
				UpdatedAt: &updatedAt,
			},
		},
	}
}

func NewRelationshipDeletedProtoEvent(ID string) *pb.EventPayload {
	var ver int32 = 0
	return &pb.EventPayload{
		Ver: &ver,
		Op:  pb.OpCode_RELATIONSHIP_DELETE_EVENT.Enum(),
		Payload: &pb.EventPayload_RelationshipDeleted{
			RelationshipDeleted: &pb.RelationshipDeleted{
				Ver: &ver,
				Id:  &ID,
			},
		},
	}
}
