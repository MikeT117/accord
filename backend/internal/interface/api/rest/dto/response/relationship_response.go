package response

import "github.com/google/uuid"

type RelationshipResponse struct {
	ID          uuid.UUID     `json:"id"`
	CreatorID   uuid.UUID     `json:"creatorId"`
	RecipientID uuid.UUID     `json:"recipientId"`
	Status      int8          `json:"status"`
	CreatedAt   int64         `json:"createdAt"`
	UpdatedAt   int64         `json:"updatedAt"`
	User        *UserResponse `json:"user"`
}
