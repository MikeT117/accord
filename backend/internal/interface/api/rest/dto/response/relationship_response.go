package response

type RelationshipResponse struct {
	ID          string        `json:"id"`
	CreatorID   string        `json:"creatorId"`
	RecipientID string        `json:"recipientId"`
	Status      int8          `json:"status"`
	CreatedAt   int64         `json:"createdAt"`
	UpdatedAt   int64         `json:"updatedAt"`
	User        *UserResponse `json:"user"`
}
